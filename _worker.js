// Cloudflare Pages advanced-mode 라우터 (guide.pweng.net)
// /local/* → 지역 페이지 동적 렌더(엔진), 없으면 404
// /sitemap-local.xml → 지역 페이지 sitemap
// 그 외 모든 요청 → 기존 정적 자산(env.ASSETS) 그대로 통과 (기존 페이지 무영향)
import { renderPath, provinceUrls, PROVINCE_SLUGS, SITE } from "./_local/engine.mjs";

const HTML_HEADERS = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "public, max-age=600, s-maxage=86400",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 지역 sitemap 인덱스 (도별 분할 — 전체 5만+)
    if (path === "/sitemap-local.xml") {
      const body =
        '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        PROVINCE_SLUGS.map((s) => `  <sitemap><loc>${SITE}/sitemap-local-${s}.xml</loc></sitemap>`).join("\n") +
        "\n</sitemapindex>\n";
      return new Response(body, {
        headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
      });
    }
    // 도별 지역 sitemap
    const sm = path.match(/^\/sitemap-local-([a-z-]+)\.xml$/);
    if (sm) {
      const urls = provinceUrls(sm[1]);
      if (!urls.length) return new Response("Not Found", { status: 404 });
      const today = new Date().toISOString().slice(0, 10);
      const body =
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n") +
        "\n</urlset>\n";
      return new Response(body, {
        headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
      });
    }

    // 지역 동적 페이지
    if (path === "/local" || path.startsWith("/local/")) {
      const parts = path.replace(/^\/+|\/+$/g, "").split("/"); // ["local", 도, 시, 키워드]
      const html = renderPath(parts);
      if (html) return new Response(html, { headers: HTML_HEADERS });
      // 정의되지 않은 조합 → 404 (경쟁사와 동일 동작)
      return new Response(notFound(), { status: 404, headers: HTML_HEADERS });
    }

    // 영어첨삭교정 아카이브 (D1)
    if (path === "/corrections" || path.startsWith("/corrections/")) {
      return corrections(path, env);
    }
    if (path === "/sitemap-corrections.xml") {
      return correctionsSitemapIndex(env);
    }
    const cs = path.match(/^\/sitemap-corrections-(\d+)\.xml$/);
    if (cs) {
      return correctionsSitemapPart(env, parseInt(cs[1], 10));
    }

    // 나머지는 기존 정적 자산 그대로
    return env.ASSETS.fetch(request);
  },
};

// ── 영어첨삭교정 ─────────────────────────────────────
// 실제 접수된 영작문과 강사 첨삭. 학생 이름·연락처 등은 적재 전에 지웠다.
// (익명화 도구: Desktop\pweng-corrections)
const PER_PAGE = 50;

async function corrections(path, env) {
  if (!env.CORRECTIONS) return new Response(notFound(), { status: 404, headers: HTML_HEADERS });
  const seg = path.replace(/^\/+|\/+$/g, "").split("/"); // ["corrections", ...]

  // 목록: /corrections/  ·  /corrections/page/2/
  if (seg.length === 1 || (seg[1] === "page" && seg[2])) {
    const page = seg[1] === "page" ? Math.max(1, parseInt(seg[2], 10) || 1) : 1;
    const { total } = await env.CORRECTIONS.prepare(
      "SELECT COUNT(*) AS total FROM corrections").first();
    const { results } = await env.CORRECTIONS.prepare(
      "SELECT slug,title,ymd FROM corrections ORDER BY ymd DESC, id DESC LIMIT ? OFFSET ?")
      .bind(PER_PAGE, (page - 1) * PER_PAGE).all();
    if (!results.length) return new Response(notFound(), { status: 404, headers: HTML_HEADERS });
    return new Response(renderList(results, page, total), { headers: HTML_HEADERS });
  }

  // 상세: /corrections/{slug}/
  const row = await env.CORRECTIONS.prepare(
    "SELECT slug,title,student,correction,tutor,ymd FROM corrections WHERE slug = ?")
    .bind(seg[1]).first();
  if (!row) return new Response(notFound(), { status: 404, headers: HTML_HEADERS });
  return new Response(renderOne(row), { headers: HTML_HEADERS });
}

// 사이트맵 한 장에 URL 5만 개가 한도다(구글 기준). 6.9만 건이라 나눠 싣는다.
const SM_CHUNK = 25000;
const XML_HEADERS = {
  "content-type": "application/xml; charset=utf-8",
  "cache-control": "public, max-age=3600",
};

/** 목차 — /sitemap-corrections-1.xml, -2.xml ... 을 가리킨다 */
async function correctionsSitemapIndex(env) {
  if (!env.CORRECTIONS) return new Response("Not Found", { status: 404 });
  const { total } = await env.CORRECTIONS.prepare(
    "SELECT COUNT(*) AS total FROM corrections").first();
  const parts = Math.max(1, Math.ceil(total / SM_CHUNK));
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    Array.from({ length: parts }, (_, i) =>
      `  <sitemap><loc>${SITE}/sitemap-corrections-${i + 1}.xml</loc></sitemap>`).join("\n") +
    "\n</sitemapindex>\n";
  return new Response(body, { headers: XML_HEADERS });
}

/** 조각 하나 — 25,000건씩 */
async function correctionsSitemapPart(env, n) {
  if (!env.CORRECTIONS || !n || n < 1) return new Response("Not Found", { status: 404 });
  const { results } = await env.CORRECTIONS.prepare(
    "SELECT slug FROM corrections ORDER BY id LIMIT ? OFFSET ?")
    .bind(SM_CHUNK, (n - 1) * SM_CHUNK).all();
  if (!results.length) return new Response("Not Found", { status: 404 });
  const head = n === 1 ? `  <url><loc>${SITE}/corrections/</loc></url>\n` : "";
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    head + results.map((r) => `  <url><loc>${SITE}/corrections/${r.slug}/</loc></url>`).join("\n") +
    "\n</urlset>\n";
  return new Response(body, { headers: XML_HEADERS });
}

const esc = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** 강사 첨삭은 적재 전에 정리했지만, 내보낼 때 허용 태그만 한 번 더 통과시킨다 */
const keepTags = (s) => String(s ?? "").replace(/<[^>]*>/g, (tag) =>
  /^<\/?(?:b|i|u|s|br|p|strong|em|mark|div|span)(?:\s[^>]*)?\/?>$/i.test(tag) ? tag : "");

const CORR_CSS = `:root{--ink:#16121f;--sub:#5b5670;--line:#e6e3ef;--paper:#faf9fd;--brand:#6d4aff;--fix:#e11d48}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Pretendard','Apple SD Gothic Neo',system-ui,sans-serif;color:var(--ink);background:var(--paper);line-height:1.75}
.wrap{max-width:840px;margin:0 auto;padding:0 20px}
.top{background:#fff;border-bottom:1px solid var(--line);padding:18px 0}
.top a.logo{color:var(--ink);font-weight:800;font-size:18px;text-decoration:none}
.top a.logo span{color:var(--brand)}
.main{padding:36px 0 60px}
h1{font-size:clamp(21px,3.2vw,28px);font-weight:800;letter-spacing:-.5px;line-height:1.35;margin-bottom:10px}
.meta{color:var(--sub);font-size:13.5px;margin-bottom:26px}
.card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:22px 24px;margin-bottom:18px}
.card h2{font-size:15px;font-weight:800;color:var(--sub);margin-bottom:12px}
.body{white-space:pre-wrap;word-break:break-word;font-size:15.5px}
.body mark{background:#ffe8ec;color:var(--fix);font-weight:700;padding:0 2px;border-radius:3px}
.note{color:var(--sub);font-size:13px;margin-top:26px;padding-top:18px;border-top:1px solid var(--line)}
.list{display:grid;gap:10px}
.list a{display:block;background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px 16px;text-decoration:none;color:var(--ink)}
.list a:hover{border-color:var(--brand)}
.list .t{font-weight:700;font-size:15px}.list .d{color:var(--sub);font-size:13px;margin-top:3px}
.pager{display:flex;gap:10px;justify-content:center;margin-top:26px}
.pager a{color:var(--brand);text-decoration:none;font-weight:700;font-size:14px;border:1px solid var(--line);background:#fff;border-radius:8px;padding:8px 16px}
.foot{border-top:1px solid var(--line);padding:24px 0;color:var(--sub);font-size:13px;text-align:center}
.foot a{color:var(--sub)}`;

function corrShell(title, desc, canonical, body, head) {
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index, follow">
<style>${CORR_CSS}</style>${head || ""}</head><body>
<div class="top"><div class="wrap"><a class="logo" href="/">파워<span>잉글리쉬</span></a></div></div>
<div class="main"><div class="wrap">${body}</div></div>
<div class="foot"><div class="wrap"><p><a href="/corrections/">영어첨삭교정</a> · <a href="/">홈</a></p></div></div>
</body></html>`;
}

function renderOne(row) {
  const title = `${row.title || "영어첨삭교정"} — 영어첨삭교정 사례`;
  const desc = String(row.student || "").replace(/\s+/g, " ").slice(0, 150);
  const canonical = `${SITE}/corrections/${row.slug}/`;
  const schema = {
    "@context": "https://schema.org", "@type": "Article", headline: title,
    datePublished: row.ymd || undefined, inLanguage: "ko", isAccessibleForFree: true,
    publisher: { "@type": "Organization", name: "파워잉글리쉬", url: SITE },
    about: { "@type": "Thing", name: "영어첨삭교정" },
  };
  const body = `<h1>${esc(row.title || "영어첨삭교정")}</h1>
<p class="meta">${row.ymd ? esc(row.ymd) + " · " : ""}${row.tutor ? "첨삭 강사 " + esc(row.tutor) : ""}</p>
<div class="card"><h2>학생이 쓴 원문</h2><div class="body">${esc(row.student)}</div></div>
<div class="card"><h2>강사 첨삭</h2><div class="body">${keepTags(row.correction)}</div></div>
<p class="note">파워잉글리쉬 영어첨삭교정 서비스에 실제로 접수된 글입니다. 작성자와 글에 등장하는 사람·회사 이름, 연락처 등 개인을 알아볼 수 있는 정보는 모두 지웠습니다. 문법 오류는 학습 자료로서의 가치를 위해 원문 그대로 두었습니다.</p>
<p class="note"><a href="/corrections/">다른 영어첨삭교정 보기</a></p>`;
  const ld = '<scr' + 'ipt type="application/ld+json">' + JSON.stringify(schema) + '</scr' + 'ipt>';
  return corrShell(title, desc, canonical, body, "\n" + ld);
}

function renderList(rows, page, total) {
  const last = Math.ceil(total / PER_PAGE);
  const canonical = page > 1 ? `${SITE}/corrections/page/${page}/` : `${SITE}/corrections/`;
  const items = rows.map((r) =>
    `<a href="/corrections/${r.slug}/"><div class="t">${esc(r.title || "영어첨삭교정")}</div><div class="d">${esc(r.ymd || "")}</div></a>`).join("");
  const prev = page > 1 ? `<a href="${page === 2 ? "/corrections/" : `/corrections/page/${page - 1}/`}">이전</a>` : "";
  const next = page < last ? `<a href="/corrections/page/${page + 1}/">다음</a>` : "";
  const n = total.toLocaleString("ko-KR");
  const body = `<h1>영어첨삭교정</h1>
<p class="meta">실제 첨삭 ${n}건 · ${page}/${last} 쪽</p>
<div class="list">${items}</div>
<div class="pager">${prev}${next}</div>
<p class="note">파워잉글리쉬 수강생이 제출한 영작문과 강사가 돌려준 교정입니다. 공개에 동의한 글만 실었고, 개인을 알아볼 수 있는 정보는 지웠습니다.</p>`;
  return corrShell(
    page > 1 ? `영어첨삭교정 ${page}쪽 · 파워잉글리쉬`
             : `영어첨삭교정 사례 ${n}건 — 실제 교정 기록 | 파워잉글리쉬`,
    `파워잉글리쉬 수강생의 실제 영작문과 강사 첨삭 ${n}건을 공개합니다. 한국인이 자주 틀리는 표현과 교정 결과를 원문 그대로 볼 수 있습니다.`,
    canonical, body);
}

function notFound() {
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>페이지를 찾을 수 없습니다 · 파워잉글리쉬</title><style>body{font-family:system-ui,"Pretendard",sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:#f8fafc;color:#16121f;text-align:center}a{color:#6d4aff;font-weight:700}</style></head><body><div><h1 style="font-size:22px">페이지를 찾을 수 없어요</h1><p style="color:#64748b">요청하신 지역·주제 페이지가 없습니다.</p><p style="margin-top:18px"><a href="/local/">전국 지역 안내 보기</a> · <a href="/">홈으로</a></p></div></body></html>`;
}
