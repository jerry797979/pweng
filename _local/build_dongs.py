# -*- coding: utf-8 -*-
"""Phase 2 — 읍면동 데이터 빌드
raqoon886/Local_HangJeongDong 행정동 geojson → 읍면동 추출 → 로마자 slug → 우리 시군구에 매핑
→ _local/dongs.mjs 출력. engine.mjs가 import.
사용: python _local/build_dongs.py
"""
import os, re, json, sys, urllib.request, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
ENGINE = os.path.join(HERE, "engine.mjs")
OUT = os.path.join(HERE, "dongs.mjs")
API = "https://api.github.com/repos/raqoon886/Local_HangJeongDong/contents/"
RAW = "https://raw.githubusercontent.com/raqoon886/Local_HangJeongDong/master/"
UA = {"User-Agent": "pweng-geo-build"}

# 시도 풀네임(구/신 명칭) → 우리 도 slug
SIDO = {
    "서울특별시":"seoul","부산광역시":"busan","대구광역시":"daegu","인천광역시":"incheon",
    "광주광역시":"gwangju","대전광역시":"daejeon","울산광역시":"ulsan","세종특별자치시":"sejong","세종시":"sejong",
    "경기도":"gyeonggi","강원도":"gangwon","강원특별자치도":"gangwon",
    "충청북도":"chungbuk","충청남도":"chungnam","전라북도":"jeonbuk","전북특별자치도":"jeonbuk",
    "전라남도":"jeonnam","경상북도":"gyeongbuk","경상남도":"gyeongnam","제주특별자치도":"jeju","제주도":"jeju",
}

# ── Revised Romanization (slug용 간이 구현) ──
CHO = ["g","kk","n","d","tt","r","m","b","pp","s","ss","","j","jj","ch","k","t","p","h"]
JUNG = ["a","ae","ya","yae","eo","e","yeo","ye","o","wa","wae","oe","yo","u","wo","we","wi","yu","eu","ui","i"]
JONG = ["","k","k","ks","n","n","n","t","l","k","m","l","l","l","p","l","m","p","p","t","t","ng","t","t","k","t","p","h"]
def romanize(kr):
    out = []
    for ch in kr:
        o = ord(ch)
        if 0xAC00 <= o <= 0xD7A3:
            s = o - 0xAC00
            out.append(CHO[s//588] + JUNG[(s%588)//28] + JONG[s%28])
        elif ch.isalnum():
            out.append(ch.lower())
    slug = "".join(out)
    slug = re.sub(r"[^a-z0-9]+", "", slug)
    return slug or "x"

def get(url, raw=False):
    req = urllib.request.Request(url, headers=UA)
    data = urllib.request.urlopen(req, timeout=60).read()
    return data if raw else json.loads(data)

# ── engine.mjs에서 (provSlug, cityKo)→citySlug 매핑 추출 ──
def load_city_map():
    txt = open(ENGINE, encoding="utf-8").read()
    m = re.search(r"export const PROVINCES = (\[.*?\]);\s*\n", txt, re.S)
    js = re.sub(r",(\s*[\]}])", r"\1", m.group(1))  # JS trailing comma 제거 → JSON화
    arr = json.loads(js)
    prov_city = {}   # provSlug -> { cityKo -> citySlug }
    for pslug, pko, cities in arr:
        prov_city[pslug] = {cko: cslug for cslug, cko in cities}
    return prov_city

def main():
    prov_city = load_city_map()
    print("엔진 시군구 매핑 로드:", sum(len(v) for v in prov_city.values()), "개")

    files = [f["name"] for f in get(API) if f["name"].startswith("hangjeongdong_") and f["name"].endswith(".geojson")]
    print("geojson 파일:", len(files))

    data = {}       # "provSlug/citySlug" -> [(slug, ko)]
    seen = {}       # per-city slug 중복 방지
    unmapped = set()
    total = 0
    for fn in files:
        try:
            gj = get(RAW + urllib.parse.quote(fn), raw=True)
            gj = json.loads(gj)
        except Exception as e:
            print("  [실패]", fn, e); continue
        for ft in gj.get("features", []):
            p = ft.get("properties", {})
            sido, sgg, adm = p.get("sidonm",""), p.get("sggnm",""), p.get("adm_nm","")
            pslug = SIDO.get(sido)
            if not pslug or pslug not in prov_city:
                unmapped.add(sido); continue
            cmap = prov_city[pslug]
            # 시군구 매칭: sggnm 그대로 / 첫 토큰(일반구 있는 시) / 앞부분 일치
            cslug = cmap.get(sgg) or cmap.get(sgg.split()[0] if sgg.split() else sgg)
            if not cslug:
                for cko, cs in cmap.items():
                    if sgg.startswith(cko):
                        cslug = cs; break
            if not cslug:
                unmapped.add(f"{pslug}:{sgg}"); continue
            # 동 이름 = adm_nm에서 시도·시군구 제거한 마지막
            dong = adm.replace(sido, "").replace(sgg, "").strip().split()
            dong = dong[-1] if dong else ""
            if not dong:
                continue
            key = f"{pslug}/{cslug}"
            slug = romanize(dong)
            s = seen.setdefault(key, {})
            base = slug; i = 2
            while slug in s and s[slug] != dong:
                slug = f"{base}-{i}"; i += 1
            if slug in s:   # 동일 동 중복(행정동 경계 여러 조각) → skip
                continue
            s[slug] = dong
            data.setdefault(key, []).append([slug, dong])
            total += 1

    # 출력
    lines = ["// Phase 2 읍면동 데이터 (build_dongs.py 자동생성). key: 'provSlug/citySlug' -> [[dongSlug, dongKo]]",
             "export const DONGS = {"]
    for key in sorted(data):
        arr = ",".join(f'["{s}","{k}"]' for s, k in data[key])
        lines.append(f'  "{key}": [{arr}],')
    lines.append("};")
    open(OUT, "w", encoding="utf-8").write("\n".join(lines) + "\n")

    cities_with = len(data)
    print(f"\n읍면동 총 {total}개 · 시군구 {cities_with}곳 매핑")
    if unmapped:
        print("매핑 실패(참고):", ", ".join(sorted(unmapped)[:20]))
    # 키워드 12개 × 동 + 동허브 = 예상 페이지
    print(f"예상 추가 페이지: 동허브 {total} + 동×12 {total*12} = {total*13:,}")

if __name__ == "__main__":
    main()
