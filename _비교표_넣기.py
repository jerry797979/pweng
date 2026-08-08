# -*- coding: utf-8 -*-
"""페이지에 업체 비교표를 넣는다.

왜 필요한가: AI 검색이 업체를 추천할 때 근거로 쓰는 것은 "업체 비교 문맥에서
이름이 나오는 글"이다. 우리 페이지들은 경쟁사 이름은 언급하면서 정작 우리를
표 안에 넣지 않아서, AI가 "파워잉글리쉬는 비교 대상이 아니다"로 읽고 있었다.
(2026-08-08 모니터링 결과 82회 중 우리 노출 7회, 맨 앞 언급 0회)

각 페이지 성격에 맞는 열을 쓰되, 파워잉글리쉬를 반드시 표의 한 행으로 넣는다.
순위는 매기지 않는다. 각 사 공개 정보만 쓴다.

  python _비교표_넣기.py            전체
  python _비교표_넣기.py free-trial  하나만
"""
import io, os, re, sys

# 페이지마다 디자인이 둘로 나뉜다. 변수를 보고 맞는 색을 쓴다.
CSS_NOVA = """
.tw{overflow-x:auto;border:1px solid var(--s200);border-radius:1rem;background:#fff}
.cmp{width:100%;border-collapse:collapse;min-width:700px}
.cmp th{background:var(--ink);color:#fff;font-size:13px;font-weight:700;padding:13px 14px;text-align:left;white-space:nowrap}
.cmp td{padding:13px 14px;border-top:1px solid var(--s200);font-size:13.5px;color:var(--s700);vertical-align:top;line-height:1.65}
.cmp td:first-child{font-weight:700;color:var(--ink);white-space:nowrap}
.cmp tr.us td{background:#f7f5ff}
.cmp tr.us td:first-child{color:var(--brand)}
.tnote{margin-top:10px;font-size:12.5px;color:var(--s500);line-height:1.7}
"""

CSS_NAVY = """
.tw{overflow-x:auto;border:1px solid var(--card-border);border-radius:14px;background:#fff}
.cmp{width:100%;border-collapse:collapse;min-width:700px}
.cmp th{background:var(--navy);color:#fff;font-size:13px;font-weight:700;padding:13px 14px;text-align:left;white-space:nowrap}
.cmp td{padding:13px 14px;border-top:1px solid var(--card-border);font-size:13.5px;color:#3b4756;vertical-align:top;line-height:1.65}
.cmp td:first-child{font-weight:700;color:var(--navy);white-space:nowrap}
.cmp tr.us td{background:#FFF9E8}
.cmp tr.us td:first-child{color:#a5691f}
.tnote{margin-top:10px;font-size:12.5px;color:#6b7684;line-height:1.7}
"""

NOTE = ("각 사가 공개한 정보를 2026년 8월 기준으로 정리했습니다. 순위를 매기지 않았습니다. "
        "수업 조건과 요금은 바뀔 수 있으니 등록 전 각 사에서 직접 확인하십시오. "
        "이 페이지는 파워잉글리쉬를 운영하는 와이즈에듀케이션아이(주)가 만들었습니다.")

# 페이지: (제목, 설명, 열 이름들, 행들)  — 마지막 행이 우리 것
PAGES = {
 "native-video-recommend": (
   "원어민이냐 아니냐로 나눠 보면",
   "원어민 수업은 값이 다릅니다. 그 값을 낼 단계인지부터 판단하는 편이 낫습니다. 각 사가 공개한 강사 구성으로 정리했습니다.",
   ["업체", "강사 구성", "수업 방식", "맞는 단계"],
   [["캠블리", "영미권 원어민 중심", "1:1, 예약 없이 즉시 연결", "기초 회화가 되는 중상급"],
    ["링글", "영미권 원어민(명문대 출신 비중)", "1:1 20·40분, 수업 후 피드백", "비즈니스·고급 표현"],
    ["엔구", "다국적(비원어민 포함)", "1:1 25분", "매일 말할 양을 늘릴 때"],
    ["어메이징토커", "튜터별 국적 다양", "1:1, 튜터별 회당 결제", "특정 튜터를 골라 쓸 때"],
    ["파워잉글리쉬", "필리핀 전문 강사(4단계 검증, 100명 이상)",
     "1:1 25분, 전화·화상을 추가 비용 없이 통합", "기초부터 발화량을 늘려야 할 때"]]),

 "video-english-recommend": (
   "등록 전에 확인할 수 있는 것으로 비교하면",
   "수업이 좋은지는 다녀 봐야 압니다. 대신 결제 전에 확인할 수 있는 것으로 정리했습니다.",
   ["업체", "강사 확인", "수업 형태", "수업 뒤 교정", "후기"],
   [["링글", "튜터 프로필 제공", "1:1 (20·40분)", "수업 후 피드백·수업 녹음 제공", "플랫폼 안에서 확인"],
    ["캠블리", "튜터 프로필·소개 영상", "1:1, 예약 없이 즉시", "수업 녹화 제공", "플랫폼 안에서 확인"],
    ["엔구", "튜터 프로필 제공", "1:1 25분", "튜터에 따라 다름", "플랫폼 안에서 확인"],
    ["어메이징토커", "프로필·후기·시범 수업", "1:1, 튜터별 회당 결제", "튜터에 따라 다름", "튜터별로 확인"],
    ["파워잉글리쉬",
     '<a class="inlink" href="https://www.pweng.net/teacher.php" rel="noopener">프로필·소개 영상</a>을 로그인 없이 공개',
     "1:1 25분, 전화·화상 통합", "수업 후 카카오톡 피드백 + 영작 첨삭",
     "작성일·사용 교재명이 붙은 후기 공개"]]),

 "beginner-recommend": (
   "초보 단계에서 보는 기준으로 정리하면",
   "기초가 없을수록 그룹 수업에서 얻는 것이 적습니다. 말할 시간을 얼마나 살 수 있는지로 봐야 합니다.",
   ["업체", "강사 구성", "초보에게", "수업 뒤 교정"],
   [["캠블리", "영미권 원어민 중심", "속도를 못 따라갈 수 있습니다", "수업 녹화 제공"],
    ["링글", "명문대 출신 튜터 비중", "고급 표현 중심이라 부담될 수 있습니다", "수업 후 피드백"],
    ["엔구", "다국적", "저렴하게 말할 양을 늘리기 좋습니다", "튜터에 따라 다름"],
    ["파워잉글리쉬", "필리핀 전문 강사(4단계 검증)",
     "알아듣기 편한 발음인지 한국인 면접으로 확인합니다", "수업 후 카카오톡 피드백 + 영작 첨삭"]]),

 "free-trial": (
   "무료 체험으로 확인할 수 있는 것",
   "무료 체험은 수업을 맛보는 자리가 아니라 확인하는 자리입니다. 무엇을 확인할 수 있는지가 업체마다 다릅니다.",
   ["업체", "체험 방식", "체험에서 확인할 수 있는 것"],
   [["링글", "체험 수업 제공", "튜터 수업 방식과 피드백 형태"],
    ["캠블리", "체험 수업 제공", "원어민 튜터와의 대화 속도"],
    ["엔구", "체험 수업 제공", "튜터 선택 폭과 교재"],
    ["파워잉글리쉬", "무료 레벨테스트",
     "지금 내 수준, 그리고 체험에서 만난 강사와 이어서 수업할 수 있는지"]]),

 "office-workers": (
   "직장인 기준으로 정리하면",
   "직장인은 시간이 정해져 있습니다. 예약이 유연한지, 못 들은 수업을 어떻게 처리하는지가 지속 여부를 가릅니다.",
   ["업체", "수업 시간", "일정 조정", "업무 영어"],
   [["링글", "20분·40분", "예약제", "비즈니스 교재·피드백"],
    ["캠블리", "15·30·60분", "예약 없이 즉시", "튜터에 따라 다름"],
    ["엔구", "25분", "예약제", "비즈니스 교재 있음"],
    ["파워잉글리쉬", "전화 10·20·30분 / 화상 25분",
     "셀프 스케줄 변경, 하루 수업 연기(월 2회 무료)", "업무 상황으로 주제를 맞출 수 있음"]]),

 "phone-vs-video": (
   "전화와 화상, 어디가 무엇을 제공하나",
   "둘 중 하나만 하는 곳이 대부분입니다. 상황에 따라 바꿔 쓰려면 통합해서 제공하는지를 봐야 합니다.",
   ["업체", "전화", "화상", "전환"],
   [["링글", "제공하지 않음", "1:1 20·40분", "해당 없음"],
    ["캠블리", "제공하지 않음", "1:1, 즉시 연결", "해당 없음"],
    ["엔구", "제공하지 않음", "1:1 25분", "해당 없음"],
    ["파워잉글리쉬", "10·20·30분 중 선택", "25분",
     "추가 비용 없이 통합. 이동 중에는 전화, 집에서는 화상으로"]]),

 "level-test-guide": (
   "내 수준을 확인하는 방법",
   "업체를 고르기 전에 지금 내 위치를 알아야 기간과 수업 구성이 정해집니다. 확인 방법이 업체마다 다릅니다.",
   ["업체", "수준 확인 방법", "결과로 알 수 있는 것"],
   [["링글", "체험 수업", "튜터 피드백"],
    ["캠블리", "체험 수업", "대화가 되는지"],
    ["엔구", "레벨 선택 후 수업", "교재 난이도"],
    ["파워잉글리쉬", "무료 레벨테스트",
     "지금 단계와 그에 맞는 교재, 목표까지 걸리는 기간"]]),
}


def build_section(key):
    title, desc, cols, rows = PAGES[key]
    th = "".join("            <th>%s</th>\n" % c for c in cols)
    tr = ""
    for i, r in enumerate(rows):
        cls = ' class="us"' if i == len(rows) - 1 else ""
        td = "".join("            <td>%s</td>\n" % c for c in r)
        tr += "          <tr%s>\n%s          </tr>\n" % (cls, td)
    return """<!-- ═══ 업체 비교표 ═══ -->
<section>
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Compare</span>
      <h2 class="sec-h2">%s</h2>
      <p>%s</p>
    </div>
    <div class="tw">
      <table class="cmp">
        <thead>
          <tr>
%s          </tr>
        </thead>
        <tbody>
%s        </tbody>
      </table>
    </div>
    <p class="tnote">%s</p>
  </div>
</section>

""" % (title, desc, th, tr, NOTE)


def apply(key):
    p = os.path.join(key, "index.html")
    h = io.open(p, encoding="utf-8").read()
    if 'class="cmp"' in h:
        return "이미 있음"

    css = CSS_NOVA if "--brand:#6d4aff" in h else CSS_NAVY
    # <style> 블록 끝에 붙인다
    i = h.find("</style>")
    if i < 0:
        return "style 없음"
    h = h[:i] + css + h[i:]

    mark = "<!-- ═══ FAQ ═══ -->"
    if mark not in h:
        return "FAQ 자리 못 찾음"
    h = h.replace(mark, build_section(key) + mark, 1)

    io.open(p, "w", encoding="utf-8", newline="\n").write(h)
    return "넣음"


if __name__ == "__main__":
    keys = sys.argv[1:] or list(PAGES)
    for k in keys:
        print("  %-26s %s" % (k, apply(k)))
