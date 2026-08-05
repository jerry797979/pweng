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

    // 나머지는 기존 정적 자산 그대로
    return env.ASSETS.fetch(request);
  },
};

function notFound() {
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>페이지를 찾을 수 없습니다 · 파워잉글리쉬</title><style>body{font-family:system-ui,"Pretendard",sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:#f8fafc;color:#16121f;text-align:center}a{color:#6d4aff;font-weight:700}</style></head><body><div><h1 style="font-size:22px">페이지를 찾을 수 없어요</h1><p style="color:#64748b">요청하신 지역·주제 페이지가 없습니다.</p><p style="margin-top:18px"><a href="/local/">전국 지역 안내 보기</a> · <a href="/">홈으로</a></p></div></body></html>`;
}
