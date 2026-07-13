# -*- coding: utf-8 -*-
"""
파워잉글리쉬 GEO 사이트 자동 발행 스크립트
사용법: pweng 폴더에 이 파일을 넣고 더블클릭 (또는: python 발행하기.py)

하는 일 (순서대로 전자동):
 1. 페이지 폴더 전체 스캔
 2. 각 페이지 검증 (JSON-LD 문법, 금지 표현, title/meta 존재)
 3. sitemap.xml 자동 재생성 (실제 폴더 기준 → 누락 원천 차단)
 4. llms.txt 자동 갱신 (없는 페이지는 <title>로 자동 등록)
 5. git 커밋 + 푸시
 6. 90초 대기 후 모든 주소 접속 확인 (404 잡아냄)
 7. 결과 보고서 출력
"""

import os, re, json, sys, subprocess, time, urllib.request, datetime

# ── 설정 ──────────────────────────────────────────────
SITE = "https://pweng.marketwave99.workers.dev"

# GEO 페이지가 아닌 폴더 (sitemap/llms.txt에서 제외)
EXCLUDE_FOLDERS = {"youtube-ranker", ".git", ".claude", "node_modules"}

# 금지 표현 (하나라도 발견되면 발행 중단)
FORBIDDEN = ["진도 잠금", "레슨 잠금", "열리지 않", "녹음 제출", "녹음 인증", "업계 최저가"]

# 반드시 있어야 하는 것들
REQUIRED_PATTERNS = {
    "title 태그": r"<title>.+?</title>",
    "meta description": r'<meta name="description"',
}

DEPLOY_WAIT_SECONDS = 90  # 푸시 후 Cloudflare 배포 대기 시간
# ─────────────────────────────────────────────────────

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.abspath(__file__))
problems = []   # 발행을 막는 문제
warnings = []   # 참고사항


def log(msg):
    print(msg, flush=True)


def get_page_folders():
    """index.html이 있는 폴더 목록"""
    folders = []
    for name in sorted(os.listdir(ROOT)):
        path = os.path.join(ROOT, name)
        if (os.path.isdir(path)
                and name not in EXCLUDE_FOLDERS
                and not name.startswith(".")
                and os.path.isfile(os.path.join(path, "index.html"))):
            folders.append(name)
    return folders


def read(relpath):
    with open(os.path.join(ROOT, relpath), encoding="utf-8") as f:
        return f.read()


def write(relpath, content):
    with open(os.path.join(ROOT, relpath), "w", encoding="utf-8", newline="\n") as f:
        f.write(content)


def get_title(html):
    m = re.search(r"<title>(.+?)</title>", html, re.S)
    if not m:
        return None
    # 제목 뒤 부가문구(— 이후, | 이후)는 잘라서 깔끔하게
    t = re.sub(r"\s+", " ", m.group(1)).strip()
    return re.split(r"\s+[—|]\s+", t)[0]


# ══ 1~2단계: 스캔 + 검증 ══════════════════════════════
def validate_pages(folders):
    log("\n[1/6] 페이지 검증 시작 (" + str(len(folders) + 1) + "개)")
    targets = [("", read("index.html"))]  # 메인 포함
    for f in folders:
        targets.append((f, read(f + "/index.html")))

    for name, html in targets:
        label = name if name else "(메인)"

        # 금지 표현
        for term in FORBIDDEN:
            cnt = html.count(term)
            if cnt:
                problems.append(f"{label}: 금지 표현 '{term}' {cnt}회 발견")

        # JSON-LD 문법
        blocks = re.findall(
            r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
        if name and not blocks:
            warnings.append(f"{label}: JSON-LD 스키마가 없음")
        for i, b in enumerate(blocks):
            try:
                json.loads(b)
            except json.JSONDecodeError as e:
                problems.append(f"{label}: JSON-LD {i+1}번 문법 오류 ({e.msg})")

        # 필수 요소
        for what, pat in REQUIRED_PATTERNS.items():
            if not re.search(pat, html, re.S):
                warnings.append(f"{label}: {what} 없음")

    log("   검증 완료 — 문제 " + str(len(problems)) + "건 / 참고 " + str(len(warnings)) + "건")


# ══ 3단계: sitemap.xml 재생성 ═════════════════════════
def rebuild_sitemap(folders):
    log("\n[2/6] sitemap.xml 재생성")
    today = datetime.date.today().isoformat()
    urls = [SITE + "/"] + [f"{SITE}/{f}/" for f in folders]
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u in urls:
        lines += ["  <url>", f"    <loc>{u}</loc>",
                  f"    <lastmod>{today}</lastmod>", "  </url>"]
    lines.append("</urlset>")
    write("sitemap.xml", "\n".join(lines) + "\n")
    log(f"   {len(urls)}개 주소 등록 완료")
    return urls


# ══ 4단계: llms.txt 갱신 ═════════════════════════════
def update_llms(folders):
    log("\n[3/6] llms.txt 갱신")
    try:
        content = read("llms.txt")
    except FileNotFoundError:
        content = "# 파워잉글리쉬\n\n"
    added = 0
    for f in folders:
        url = f"{SITE}/{f}/"
        if url in content:
            continue
        title = get_title(read(f + "/index.html")) or f
        content = content.rstrip("\n") + f"\n- [{title}]({url})\n"
        added += 1
        log(f"   + 등록: {f} ({title})")
    write("llms.txt", content)
    log(f"   신규 등록 {added}건 (기존 항목은 유지)")


# ══ 5단계: git 커밋 + 푸시 ════════════════════════════
def git_publish():
    log("\n[4/6] git 커밋·푸시")

    def run(*args):
        return subprocess.run(["git"] + list(args), cwd=ROOT,
                              capture_output=True, text=True, encoding="utf-8")

    status = run("status", "--porcelain")
    if status.returncode != 0:
        problems.append("git 실행 실패 — Git이 설치되어 있는지 확인 필요")
        return False
    if not status.stdout.strip():
        log("   변경사항 없음 — 커밋 건너뜀")
        return True

    log("   변경 파일:")
    for line in status.stdout.strip().splitlines():
        log("     " + line)

    run("add", "-A")
    msg = "자동 발행: " + datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    commit = run("commit", "-m", msg)
    if commit.returncode != 0:
        problems.append("git 커밋 실패: " + commit.stderr.strip()[:200])
        return False
    push = run("push")
    if push.returncode != 0:
        problems.append("git 푸시 실패: " + push.stderr.strip()[:200]
                        + "\n   → GitHub Desktop을 열어 로그인 상태를 확인해 주세요")
        return False
    log("   푸시 완료")
    return True


# ══ 6단계: 배포 후 접속 확인 ══════════════════════════
def check_urls(urls):
    log(f"\n[5/6] Cloudflare 배포 대기 {DEPLOY_WAIT_SECONDS}초...")
    time.sleep(DEPLOY_WAIT_SECONDS)
    log("\n[6/6] 전체 주소 접속 확인")
    dead = []
    for u in urls + [SITE + "/llms.txt", SITE + "/sitemap.xml", SITE + "/robots.txt"]:
        try:
            req = urllib.request.Request(u, headers={"User-Agent": "pweng-check"})
            code = urllib.request.urlopen(req, timeout=15).status
        except Exception as e:
            code = getattr(e, "code", str(e))
        mark = "OK " if code == 200 else "!! "
        log(f"   {mark}{code}  {u}")
        if code != 200:
            dead.append(u)
    return dead


# ══ 실행 ══════════════════════════════════════════════
def main():
    log("=" * 52)
    log(" 파워잉글리쉬 GEO 사이트 자동 발행")
    log("=" * 52)

    folders = get_page_folders()
    log("\n발견된 페이지 폴더 " + str(len(folders)) + "개:")
    log("   " + ", ".join(folders))

    validate_pages(folders)

    if problems:
        log("\n" + "!" * 52)
        log(" 발행 중단 — 아래 문제를 먼저 해결해 주세요:")
        for p in problems:
            log("  - " + p)
        log("!" * 52)
        return

    urls = rebuild_sitemap(folders)
    update_llms(folders)

    if not git_publish() or problems:
        for p in problems:
            log("  - " + p)
        return

    dead = check_urls(urls)

    log("\n" + "=" * 52)
    if dead:
        log(" 완료했으나 접속 안 되는 주소 " + str(len(dead)) + "개:")
        for d in dead:
            log("   " + d)
        log(" → 2~3분 뒤 다시 열어보시고, 계속 404면 폴더명을 확인하세요")
    else:
        log(" ✅ 전체 발행 성공 — 모든 주소 정상 (200)")
    if warnings:
        log("\n 참고사항:")
        for w in warnings:
            log("  - " + w)
    log("=" * 52)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        log("\n예상 못한 오류: " + repr(e))
    input("\n엔터를 누르면 창이 닫힙니다...")
