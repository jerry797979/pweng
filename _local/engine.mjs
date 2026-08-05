// 파워잉글리쉬 지역 페이지 — 동적 라우팅 엔진 (데이터 + 렌더 + sitemap)
// _worker.js(프로덕션)와 Node 테스트가 함께 import 한다.
// Phase 1: 도 허브 + 시군구 허브 + 시군구×키워드(24). Phase 2에서 읍면동 추가.

import { DONGS } from "./dongs.mjs";

export const SITE = "https://guide.pweng.net";

// ── 키워드 24종 ({지역} {ko} 로 결합) ──
export const KEYWORDS = [
  { slug: "english-conversation", ko: "영어회화" },
  { slug: "phone-english", ko: "전화영어" },
  { slug: "video-english", ko: "화상영어" },
  { slug: "native-english", ko: "원어민영어" },
  { slug: "one-on-one-english", ko: "1:1 영어" },
  { slug: "online-english", ko: "온라인 영어회화" },
  { slug: "english-academy", ko: "영어회화학원" },
  { slug: "english-tutoring", ko: "영어과외" },
  { slug: "adult-english", ko: "성인영어" },
  { slug: "worker-english", ko: "직장인영어" },
  { slug: "housewife-english", ko: "주부영어" },
  { slug: "senior-english", ko: "시니어영어" },
  { slug: "beginner-english", ko: "왕초보영어" },
  { slug: "elementary-english", ko: "초등영어회화" },
  { slug: "middleschool-english", ko: "중학생영어" },
  { slug: "university-english", ko: "대학생영어" },
  { slug: "business-english", ko: "비즈니스영어" },
  { slug: "travel-english", ko: "여행영어" },
  { slug: "job-english", ko: "취업영어" },
  { slug: "interview-english", ko: "면접영어" },
  { slug: "exam-english", ko: "시험영어" },
  { slug: "opic", ko: "OPIc" },
  { slug: "toeic-speaking", ko: "토익스피킹" },
  { slug: "basic-english", ko: "기초영어회화" },
];

// ── 키워드별 맞춤 문단 (페이지마다 실질 내용이 달라지도록) ──
export const KW_ANGLE = {
  "phone-english": "전화영어는 영상 없이 목소리에만 집중하는 방식이라, 이동 중이나 자투리 시간에도 부담 없이 말하기 연습을 이어갈 수 있습니다. 전화영어는 10분·20분·30분 중 원하는 길이를 고를 수 있어요.",
  "video-english": "화상영어는 강사의 입 모양과 표정을 보며 발음을 교정받고, 화면으로 교재를 함께 보며 진행합니다. 화상은 25분 기본이며, 전화영어와 추가 비용 없이 함께 이용할 수 있어요.",
  "native-english": "발음과 억양을 꾸준히 교정받고 싶다면, 매번 강사가 바뀌지 않는 100% 고정 전담제가 특히 도움이 됩니다. 내 발음 습관을 아는 강사가 같은 부분을 반복해 잡아주기 때문이에요.",
  "one-on-one-english": "그룹 수업과 달리 1:1은 말할 기회가 온전히 내 것이라, 짧은 시간에도 실제로 입을 떼는 양이 많습니다. 오늘 배운 표현을 바로 내 상황에 맞춰 연습할 수 있어요.",
  "online-english": "온라인 회화는 오가는 시간이 없어 매일 같은 시간에 습관을 만들기 좋습니다. 집·회사 어디서든 전화나 화상으로 바로 연결돼요.",
  "english-academy": "학원을 알아보고 있다면, 오가는 시간과 고정된 시간표가 부담이 되지 않는지 함께 따져보세요. 같은 비용대라면 이동 없이 매일 이어갈 수 있는 1:1 전화·화상이 대안이 됩니다.",
  "english-tutoring": "방문 과외는 일정 잡기와 비용이 부담일 수 있습니다. 전화·화상 1:1은 방문 없이도 고정 전담 강사에게 같은 밀착 지도를 받을 수 있어요.",
  "adult-english": "성인은 각자 목적(회화·비즈니스·시험)이 뚜렷합니다. 마이페이지에서 원하는 수업 방식을 직접 등록하면 담당 강사가 그대로 반영해 줍니다.",
  "worker-english": "바쁜 직장인·교대근무자는 셀프 스케줄로 하루만 시간·강사를 바꾸거나, 마지막 수업을 당겨 몰아듣는 것도 가능합니다. 출퇴근 시간에 전화영어로 이어가기도 좋아요.",
  "housewife-english": "집안일 사이 자투리 시간에 25분씩, 오가는 부담 없이 이어갈 수 있습니다. 원하는 시간대에 고정 스케줄을 잡아두면 습관이 됩니다.",
  "senior-english": "시니어 회원도 파닉스·기초부터 인내심 있게 지도하는 강사와 천천히 시작할 수 있습니다. 급하지 않게, 매일 조금씩 눈높이에 맞춰 진행해요.",
  "beginner-english": "왕초보라도 걱정 없이 시작할 수 있습니다. 파닉스와 기초부터 차근차근, 15만원 상당 무료 레벨테스트로 지금 실력을 정확히 진단받고 딱 맞는 단계에서 출발하세요.",
  "elementary-english": "초등 아동은 레인보우 시리즈·영문법·그림묘사 등 연령에 맞는 커리큘럼으로 진행합니다. 고정 전담 강사가 아이 성향을 파악해 꾸준히 이끌어줘요.",
  "middleschool-english": "중학생은 학교 수업과 병행하며 말하기·자신감을 키우기 좋습니다. 고정 강사가 진도와 약점을 계속 기억하고 지도해요.",
  "university-english": "대학생은 회화부터 취업·시험까지 목적에 맞춰 과정을 고를 수 있습니다. 방학·학기 중 일정 변화에도 셀프 스케줄로 유연하게 이어갈 수 있어요.",
  "business-english": "비즈니스는 통화·미팅·이메일·출장·프레젠테이션 등 실제 상황 표현이 핵심입니다. 비즈니스 패턴·이메일 작성·고급 개념까지 단계별 트랙으로 준비할 수 있어요.",
  "travel-english": "여행 영어는 공항·호텔·식당 등 상황별 표현을 미리 익혀 두는 게 효과적입니다. 출국 전 상황별 프리토킹으로 실전 감각을 올릴 수 있어요.",
  "job-english": "취업을 준비한다면 실제 면접 질문 유형을 강사와 1:1로 교정하며 반복 연습할 수 있습니다. 원하는 만큼 집중해서 대비하세요.",
  "interview-english": "면접 영어는 예상 질문과 답변을 강사와 실전처럼 주고받으며 다듬는 게 중요합니다. 표현·발음·자신감을 함께 잡아드려요.",
  "exam-english": "OPIc·IELTS·토익스피킹 등 시험은 유형과 출제 의도 파악이 점수를 좌우합니다. 시험대비 과정으로 고득점 전략을 준비할 수 있어요.",
  "opic": "OPIc은 자주 나오는 주제를 내 이야기로 자연스럽게 말하는 연습이 핵심입니다. 고정 강사와 반복 연습해 목표 등급을 준비하세요.",
  "toeic-speaking": "토익스피킹은 문제 유형별 답변 틀을 익히고 발음·유창성을 다듬는 게 중요합니다. 1:1로 약점을 집중 교정할 수 있어요.",
  "basic-english": "기초 회화는 완벽한 문장보다 매일 조금씩 입을 떼는 습관이 먼저입니다. 쉬운 표현부터 반복하며 자신감을 쌓아가요.",
};
export function angleFor(slug) { return (slug && KW_ANGLE[slug]) || "매일 같은 시간, 나를 잘 아는 고정 전담 강사와 1:1로 이어가는 것이 회화 실력을 올리는 가장 확실한 방법입니다."; }

// ── 키워드별 추천 과정 (커리큘럼 — 확정 사실) ──
export const KW_COURSE = {
  business: "비즈니스는 실제 상황 중심의 단계별 트랙이 준비돼 있습니다. 비즈니스 패턴잉글리쉬(120일 100유닛)로 핵심 표현을, 효과적인 비즈니스 이메일 작성법(50유닛)으로 문서 작성을, Elevated Business Concepts(75유닛)로 고급 개념까지 다집니다.",
  exam: "시험은 유형과 출제 의도 파악이 점수를 좌우합니다. OPIc·IELTS·토익스피킹 시험대비 과정으로 자주 나오는 주제를 내 이야기로 자연스럽게 말하는 연습을 반복해 목표 점수를 준비합니다.",
  kids: "아동은 연령·레벨에 맞는 6가지 커리큘럼이 있습니다. 레인보우 시리즈(3단계), 토킹타임(프리토킹), 즐거운 영문법, 주니어 토론, 영어 그림묘사, 전치사 완전정복으로 단계별로 이끌어줍니다.",
  travel: "출국·여행을 앞두고 있다면 상황별 회화 표현을 미리 익히는 어학연수 과정과 프리토킹으로 실전 감각을 올릴 수 있습니다.",
  general: "일반회화는 초급(Beginner)에서 시작해 본격 대화 중급(Intermediate), 유창한 고급(Advance)까지 단계별로 올라갑니다. 최신 기사로 토론하는 영자신문, 네이티브처럼 말하는 프리토킹, 논리적 사고를 키우는 토론 과정도 선택할 수 있어요.",
};
const KW_COURSE_MAP = { "business-english": "business", "job-english": "business", "interview-english": "business", "worker-english": "business", "exam-english": "exam", "opic": "exam", "toeic-speaking": "exam", "elementary-english": "kids", "middleschool-english": "kids", "travel-english": "travel", "beginner-english": "general", "basic-english": "general" };
export function courseFor(slug) { return KW_COURSE[KW_COURSE_MAP[slug] || "general"] || KW_COURSE.general; }

const SECTION_TRUST = `<section style="padding:26px 0"><div class="wrap"><div class="trust">
<div class="tcard"><div class="tnum">4단계</div><div class="tlbl">강사 검증</div></div>
<div class="tcard"><div class="tnum">9.9<span>/10</span></div><div class="tlbl">평균 평점</div></div>
<div class="tcard"><div class="tnum">100+</div><div class="tlbl">전문 강사</div></div>
<div class="tcard"><div class="tnum">1,200+</div><div class="tlbl">수강 후기</div></div>
</div></div></section>`;

const SECTION_PAIN = `<section class="soft"><div class="wrap"><div class="sec-head"><span class="eyebrow">Why</span><h2 class="sec-h2">이런 고민, 있으셨죠?</h2></div>
<div class="grid"><article class="card"><h3 style="font-size:16px">“그룹수업은 말할 기회가 적어요”</h3><p>1:1이라 25분이 온전히 내 말하기 시간입니다. 오늘 배운 표현을 바로 내 상황에 맞춰 연습해요.</p></article>
<article class="card"><h3 style="font-size:16px">“강사가 매번 바뀌어요”</h3><p>100% 고정 전담제로 내 실력·성향을 아는 강사가 계속 같은 부분을 잡아줍니다.</p></article>
<article class="card"><h3 style="font-size:16px">“학원까지 갈 시간이 없어요”</h3><p>집·회사에서 전화·화상으로 이동 0분, 매일 같은 시간에 이어갑니다. 작심삼일은 전담 강사의 카카오톡 관리로 잡아드려요.</p></article></div></div></section>`;

const SECTION_PHONE_VIDEO = `<section class="soft"><div class="wrap"><div class="sec-head"><span class="eyebrow">Phone or Video</span><h2 class="sec-h2">전화영어와 화상영어, 뭘 고를까?</h2></div>
<div class="grid" style="grid-template-columns:1fr 1fr;max-width:820px;margin:0 auto"><article class="card"><span class="ptag">전화영어</span><h3 style="margin-top:12px">이동 중에도, 목소리 집중</h3><p>영상 없이 통화로 진행해 이동·자투리 시간에 편합니다. 10·20·30분 중 원하는 길이를 고를 수 있어요.</p></article>
<article class="card"><span class="ptag">화상영어</span><h3 style="margin-top:12px">입 모양·교재를 함께</h3><p>강사의 표정과 입 모양을 보며 발음을 교정받고, 화면으로 교재를 함께 봅니다. 25분이 기본이에요.</p></article></div>
<p style="text-align:center;margin-top:16px;color:var(--s600);font-size:14.5px">전화영어와 화상영어는 <b>추가 비용 없이 함께</b> 이용할 수 있습니다.</p></div></section>`;

// 공통(에버그린) 섹션 — 확정 사실 기반
const SECTION_PRICE = `<section class="soft"><div class="narrow"><div class="sec-head"><span class="eyebrow">Price</span><h2 class="sec-h2">수강료 안내</h2></div>
<div class="tbl-wrap"><table class="nv"><thead><tr><th>수업 횟수</th><th>월 수강료</th><th>회당(25분 기준)</th></tr></thead><tbody>
<tr><td>주 5회 (월 20회)</td><td>125,400원</td><td class="pick"><b>약 6,270원</b></td></tr>
<tr><td>주 3회 (월 12회)</td><td>111,150원</td><td>약 9,260원</td></tr>
<tr><td>주 2회 (월 8회)</td><td>100,700원</td><td>약 12,590원</td></tr>
</tbody></table></div><p style="margin-top:12px;font-size:14px;color:var(--s600)">전화영어와 화상영어는 추가 비용 없이 동일하게 이용할 수 있습니다. 전화는 10·20·30분 중 선택, 화상은 25분 기본입니다.</p></div></section>`;

const SECTION_TUTOR = `<section><div class="wrap"><div class="sec-head"><span class="eyebrow">Tutor</span><h2 class="sec-h2">4단계 검증을 거친 전담 강사</h2></div>
<p style="text-align:center;max-width:720px;margin:0 auto 24px;color:var(--s600)">자격증(TESOL 등)과 티칭 경력을 갖춘 지원자만, 하루 100건 넘는 이력서 중에서 4단계를 통과한 강사만 배정됩니다. 통과 강사 평균 평점 9.9/10, 100명 이상의 전문 강사와 1,200건 이상의 수강 후기가 있습니다.</p>
<div class="grid"><article class="card"><span class="ptag">STEP 1·2</span><h3 style="margin-top:12px">면접 (발음·전달력)</h3><p>헤드매니저 온라인 면접과 한국인 면접으로 한국인의 귀에 편안한 발음·억양·전달력을 확인합니다.</p></article>
<article class="card"><span class="ptag">STEP 3</span><h3 style="margin-top:12px">필기시험</h3><p>문법·어휘·티칭 이론 필기시험을 통과해야 합니다.</p></article>
<article class="card"><span class="ptag">STEP 4</span><h3 style="margin-top:12px">3주 실전 트레이닝</h3><p>3주간 실전 수업 트레이닝까지 마친 강사만 정식 배정됩니다.</p></article></div></div></section>`;

const SECTION_HOW = `<section class="soft"><div class="wrap"><div class="sec-head"><span class="eyebrow">How it works</span><h2 class="sec-h2">이렇게 수업합니다</h2></div>
<div class="grid"><article class="card"><span class="ptag">1</span><h3 style="margin-top:12px">예습</h3><p>온라인 교재로 오늘 배울 내용을 미리 살펴봅니다.</p></article>
<article class="card"><span class="ptag">2</span><h3 style="margin-top:12px">1:1 스피킹</h3><p>고정 전담 강사와 25분간 실제로 말하며 연습합니다.</p></article>
<article class="card"><span class="ptag">3</span><h3 style="margin-top:12px">피드백 확인</h3><p>수업 녹음 파일과 발음·문법 교정을 확인합니다.</p></article>
<article class="card"><span class="ptag">4</span><h3 style="margin-top:12px">숙제·첨삭</h3><p>영작 숙제와 카카오톡 첨삭으로 복습을 마무리합니다.</p></article></div></div></section>`;

const SECTION_SCHEDULE = `<section><div class="wrap"><div class="sec-head"><span class="eyebrow">Schedule</span><h2 class="sec-h2">바쁜 일정도 괜찮아요</h2></div>
<div class="grid"><article class="card"><span class="ptag">셀프 스케줄변경</span><h3 style="margin-top:12px">오늘만 · 몰아듣기 · 전체변경</h3><p>마이페이지에서 오늘 하루만 시간·강사를 바꾸거나, 마지막 수업을 당겨 하루에 몰아듣거나, 다음 수업부터 전체 스케줄을 바꿀 수 있습니다.</p></article>
<article class="card"><span class="ptag">하루 연기</span><h3 style="margin-top:12px">수업 1시간 전까지</h3><p>급한 일이 생기면 수업 시작 1시간 전까지 마이페이지에서 연기할 수 있습니다. 월 2회까지 무료입니다.</p></article>
<article class="card"><span class="ptag">수업 직접 등록</span><h3 style="margin-top:12px">강사·교재 직접 선택</h3><p>원하는 강사와 교재를 직접 골라 당일·익일 수업을 등록할 수 있고, 교재는 홈페이지에서 언제든 바꿀 수 있습니다.</p></article></div></div></section>`;

const SECTION_CUSTOM = `<section class="soft"><div class="narrow"><div class="sec-head"><span class="eyebrow">Only Power English</span><h2 class="sec-h2">내 수업 방식을 직접 고릅니다</h2></div>
<div class="card pe"><p style="font-size:15.5px;line-height:1.9">막연한 1:1 맞춤이 아닙니다. "오늘 어때요?" 같은 반복 질문 건너뛰기, 자기소개 없이 바로 수업 시작, 단답 대신 긴 문장으로 말하게 유도, 지난 교정 문장 복습 후 진행 등 <b>원하는 수업 방식을 마이페이지에서 직접 등록</b>하면 담당 강사가 그대로 반영합니다. 셀프 스케줄로 다른 강사와 수업하거나 대체 강사가 진행해도 <b>등록한 방식 그대로</b> 이어집니다. 수업 피드백은 켜고 끌 수 있습니다.</p></div></div></section>`;

const SECTION_LT = `<section><div class="narrow"><div class="sec-head"><span class="eyebrow">Level Test</span><h2 class="sec-h2">무료 레벨테스트로 시작하세요</h2></div>
<div class="card"><p style="font-size:15px;line-height:1.9">전화영어는 서로 다른 강사 2명이 10분씩 2회(1차 프리토킹, 2차 평가), 화상영어는 강사 1명이 15분간 진행합니다. <b>강제 결제가 없고</b>, 신청한 시간대의 정규 강사가 그대로 진행해 이른바 ‘낚시강사’가 없는 구조입니다. 15만 원 상당의 1:1 레벨 진단을 지금 무료로 받아보세요.</p></div></div></section>`;

// ── 행정구역: 도 slug, 도 한글, [[시군구 slug, 시군구 한글], ...] ──
export const PROVINCES = [
  ["seoul", "서울", [["gangnam","강남구"],["gangdong","강동구"],["gangbuk","강북구"],["gangseo","강서구"],["gwanak","관악구"],["gwangjin","광진구"],["guro","구로구"],["geumcheon","금천구"],["nowon","노원구"],["dobong","도봉구"],["dongdaemun","동대문구"],["dongjak","동작구"],["mapo","마포구"],["seodaemun","서대문구"],["seocho","서초구"],["seongdong","성동구"],["seongbuk","성북구"],["songpa","송파구"],["yangcheon","양천구"],["yeongdeungpo","영등포구"],["yongsan","용산구"],["eunpyeong","은평구"],["jongno","종로구"],["jung-seoul","중구"],["jungnang","중랑구"]]],
  ["busan", "부산", [["haeundae","해운대구"],["busanjin","부산진구"],["dongnae","동래구"],["nam-busan","남구"],["buk-busan","북구"],["sasang","사상구"],["saha","사하구"],["geumjeong","금정구"],["yeonje","연제구"],["suyeong","수영구"],["gijang","기장군"],["gangseo-busan","강서구"],["dong-busan","동구"],["seo-busan","서구"],["yeongdo","영도구"],["jung-busan","중구"]]],
  ["daegu", "대구", [["suseong","수성구"],["dalseo","달서구"],["dalseong","달성군"],["buk-daegu","북구"],["dong-daegu","동구"],["seo-daegu","서구"],["nam-daegu","남구"],["jung-daegu","중구"]]],
  ["incheon", "인천", [["namdong","남동구"],["bupyeong","부평구"],["yeonsu","연수구"],["seo-incheon","서구"],["gyeyang","계양구"],["michuhol","미추홀구"],["ganghwa","강화군"],["dong-incheon","동구"],["jung-incheon","중구"],["ongjin","옹진군"]]],
  ["gwangju", "광주", [["gwangsan","광산구"],["buk-gwangju","북구"],["seo-gwangju","서구"],["nam-gwangju","남구"],["dong-gwangju","동구"]]],
  ["daejeon", "대전", [["seo-daejeon","서구"],["yuseong","유성구"],["jung-daejeon","중구"],["dong-daejeon","동구"],["daedeok","대덕구"]]],
  ["ulsan", "울산", [["nam-ulsan","남구"],["buk-ulsan","북구"],["dong-ulsan","동구"],["jung-ulsan","중구"],["ulju","울주군"]]],
  ["sejong", "세종", [["sejong-city","세종시"]]],
  ["gyeonggi", "경기", [["suwon","수원시"],["seongnam","성남시"],["yongin","용인시"],["goyang","고양시"],["bucheon","부천시"],["ansan","안산시"],["anyang","안양시"],["namyangju","남양주시"],["hwaseong","화성시"],["pyeongtaek","평택시"],["uijeongbu","의정부시"],["siheung","시흥시"],["gimpo","김포시"],["gwangju-gyeonggi","광주시"],["gwangmyeong","광명시"],["gunpo","군포시"],["hanam","하남시"],["osan","오산시"],["icheon","이천시"],["yangju","양주시"],["guri","구리시"],["anseong","안성시"],["pocheon","포천시"],["uiwang","의왕시"],["yeoju","여주시"],["dongducheon","동두천시"],["gwacheon","과천시"],["paju","파주시"],["gapyeong","가평군"],["yangpyeong","양평군"],["yeoncheon","연천군"]]],
  ["gangwon", "강원", [["chuncheon","춘천시"],["wonju","원주시"],["gangneung","강릉시"],["donghae","동해시"],["sokcho","속초시"],["samcheok","삼척시"],["taebaek","태백시"],["hongcheon","홍천군"],["cheorwon","철원군"],["hoengseong","횡성군"],["yeongwol","영월군"],["pyeongchang","평창군"],["jeongseon","정선군"],["inje","인제군"],["goseong-gangwon","고성군"],["yanggu","양구군"],["yangyang","양양군"],["hwacheon","화천군"]]],
  ["chungbuk", "충북", [["cheongju","청주시"],["chungju","충주시"],["jecheon","제천시"],["eumseong","음성군"],["jincheon","진천군"],["okcheon","옥천군"],["yeongdong","영동군"],["goesan","괴산군"],["boeun","보은군"],["danyang","단양군"],["jeungpyeong","증평군"]]],
  ["chungnam", "충남", [["cheonan","천안시"],["asan","아산시"],["seosan","서산시"],["dangjin","당진시"],["nonsan","논산시"],["gongju","공주시"],["boryeong","보령시"],["gyeryong","계룡시"],["geumsan","금산군"],["buyeo","부여군"],["hongseong","홍성군"],["yesan","예산군"],["seocheon","서천군"],["cheongyang","청양군"],["taean","태안군"]]],
  ["jeonbuk", "전북", [["jeonju","전주시"],["iksan","익산시"],["gunsan","군산시"],["jeongeup","정읍시"],["namwon","남원시"],["gimje","김제시"],["wanju","완주군"],["gochang","고창군"],["buan","부안군"],["imsil","임실군"],["sunchang","순창군"],["jinan","진안군"],["muju","무주군"],["jangsu","장수군"]]],
  ["jeonnam", "전남", [["mokpo","목포시"],["yeosu","여수시"],["suncheon","순천시"],["naju","나주시"],["gwangyang","광양시"],["damyang","담양군"],["gokseong","곡성군"],["gurye","구례군"],["goheung","고흥군"],["boseong","보성군"],["hwasun","화순군"],["jangheung","장흥군"],["gangjin","강진군"],["haenam","해남군"],["yeongam","영암군"],["muan","무안군"],["hampyeong","함평군"],["yeonggwang","영광군"],["jangseong","장성군"],["wando","완도군"],["jindo","진도군"],["shinan","신안군"]]],
  ["gyeongbuk", "경북", [["pohang","포항시"],["gumi","구미시"],["gyeongsan","경산시"],["gyeongju","경주시"],["andong","안동시"],["gimcheon","김천시"],["yeongju","영주시"],["sangju","상주시"],["mungyeong","문경시"],["yeongcheon","영천시"],["chilgok","칠곡군"],["seongju","성주군"],["uiseong","의성군"],["cheongdo","청도군"],["goryeong","고령군"],["yecheon","예천군"],["bonghwa","봉화군"],["uljin","울진군"],["yeongyang","영양군"],["yeongdeok","영덕군"],["cheongsong","청송군"],["gunwi","군위군"],["ulleung","울릉군"]]],
  ["gyeongnam", "경남", [["changwon","창원시"],["gimhae","김해시"],["jinju","진주시"],["yangsan","양산시"],["geoje","거제시"],["tongyeong","통영시"],["sacheon","사천시"],["miryang","밀양시"],["haman","함안군"],["geochang","거창군"],["changnyeong","창녕군"],["goseong-gyeongnam","고성군"],["hadong","하동군"],["hapcheon","합천군"],["namhae","남해군"],["hamyang","함양군"],["sancheong","산청군"],["uiryeong","의령군"]]],
  ["jeju", "제주", [["jeju-city","제주시"],["seogwipo","서귀포시"]]],
];

// ── 조회 인덱스 ──
const provBySlug = new Map(PROVINCES.map(([ps, pk, cities]) => [ps, { slug: ps, ko: pk, cities }]));
const kwBySlug = new Map(KEYWORDS.map((k) => [k.slug, k]));

export function getProvince(pslug) { return provBySlug.get(pslug) || null; }
export function getCity(prov, cslug) {
  if (!prov) return null;
  const c = prov.cities.find(([cs]) => cs === cslug);
  return c ? { slug: c[0], ko: c[1] } : null;
}
export function getKeyword(kslug) { return kwBySlug.get(kslug) || null; }

// 읍면동(Phase 2) — sitemap엔 12개 키워드만 노출, 렌더는 24개 모두 허용
export const DONG_KEYWORDS = KEYWORDS.slice(0, 12);
const dongIndex = new Map();
for (const [key, arr] of Object.entries(DONGS)) dongIndex.set(key, new Map(arr));
export function dongsOf(pslug, cslug) { return DONGS[`${pslug}/${cslug}`] || []; }
export function getDong(pslug, cslug, dslug) {
  const m = dongIndex.get(`${pslug}/${cslug}`); const ko = m && m.get(dslug);
  return ko ? { slug: dslug, ko } : null;
}

const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ── 렌더: 시군구×키워드 상세 (keyword 없으면 시군구 허브) ──
export function renderCity(prov, city, keyword) {
  const kw = keyword ? keyword.ko : "영어회화";
  const isHub = !keyword;
  const path = keyword ? `/local/${prov.slug}/${city.slug}/${keyword.slug}/` : `/local/${prov.slug}/${city.slug}/`;
  const url = SITE + path;
  const title = isHub
    ? `${city.ko} 영어회화 — 전화·화상영어로 학원 없이 시작하기`
    : `${city.ko} ${kw} — 학원 대신 전화·화상영어로 시작하는 법`;
  const desc = `${prov.ko} ${city.ko}에서 ${kw}를 찾고 있다면, 학원까지 오가는 이동·시간 부담 없이 집·회사에서 100% 고정 전담 강사와 1:1 전화·화상영어로 매일 이어갈 수 있습니다. 파워잉글리쉬는 회당 약 6,270원(주5회 기준)입니다.`;
  const ogTitle = `${city.ko} ${kw}, 학원 말고 방법 없을까?`;

  // 인접(같은 도 다른 시군구) 링크 — 같은 키워드 유지
  const kseg = keyword ? keyword.slug : "english-conversation";
  const siblings = prov.cities.filter(([cs]) => cs !== city.slug).slice(0, 12);
  const nb = siblings.map(([cs, ck]) => `<a class="nb" href="/local/${prov.slug}/${cs}/${kseg}/">${esc(ck)} ${esc(kw)}</a>`).join("");
  // 같은 시군구 다른 키워드 링크
  const others = KEYWORDS.filter((k) => !keyword || k.slug !== keyword.slug).slice(0, 10);
  const kwLinks = others.map((k) => `<a class="nb" href="/local/${prov.slug}/${city.slug}/${k.slug}/">${esc(city.ko)} ${esc(k.ko)}</a>`).join("");

  const oneLine = `${esc(city.ko)}에서 ${esc(kw)}를 찾고 있다면, 먼저 이동 시간과 고정된 수업 시간표를 고려해야 합니다. 거점까지 오가는 부담 없이 <span class="hl">집·회사에서 매일 같은 시간</span>에 이어가고 싶다면, 지역 제약이 없는 전화·화상영어가 현실적인 대안입니다. <span class="hl">100% 고정 전담 강사</span>와 1:1로, 주5회 기준 <span class="hl">회당 약 6,270원</span>에 ${esc(city.ko)} 어디서든 시작할 수 있는 파워잉글리쉬를 추천합니다.`;
  const faq1q = `${city.ko}에 사는데 영어회화 학원이 멀어요. 어떻게 하죠?`;
  const faq1a = `학원까지 오가는 시간이 부담이라면 지역 제약이 없는 전화·화상영어가 대안입니다. ${city.ko} 어디서든 집·회사에서 100% 고정 전담 강사와 매일 같은 시간에 1:1 수업을 이어갈 수 있고, 주5회 기준 회당 약 6,270원으로 부담 없이 반복할 수 있습니다.`;

  return page({ title, desc, ogTitle, ogDesc: `${city.ko} 어디서든 이동 0분으로 매일 이어가는 1:1 전화·화상영어.`, url,
    angle: angleFor(keyword && keyword.slug),
    course: courseFor(keyword && keyword.slug),
    heroTag: `${esc(city.ko)} ${esc(kw)} 가이드`,
    h1: `${esc(city.ko)}에서 ${esc(kw)}<br><span class="u">어떻게 시작할까?${UNDERLINE}</span>`,
    sub: `${esc(city.ko)}에서 학원까지 오가는 부담 없이, 집·회사에서 매일 이어가는 1:1 전화·화상영어를 비교해 보세요.`,
    oneLine,
    compareH2: `${esc(city.ko)}에서 ${esc(kw)}, 어떤 방식이 맞을까?`,
    cityKo: esc(city.ko),
    provKo: esc(prov.ko),
    nbTitle: keyword ? `${esc(prov.ko)} 다른 지역 ${esc(kw)}` : `${esc(prov.ko)} 다른 지역 영어회화`,
    nb, kwLinks, faq1q, faq1a });
}

// ── 렌더: 읍면동 (동×키워드, keyword 없으면 동 허브) ──
export function renderDong(prov, city, dong, keyword) {
  const kw = keyword ? keyword.ko : "영어회화";
  const region = `${city.ko} ${dong.ko}`;
  const kseg = keyword ? keyword.slug : "english-conversation";
  const path = keyword
    ? `/local/${prov.slug}/${city.slug}/${dong.slug}/${keyword.slug}/`
    : `/local/${prov.slug}/${city.slug}/${dong.slug}/`;
  const url = SITE + path;
  const title = keyword
    ? `${region} ${kw} — 학원 대신 전화·화상영어로 시작하는 법`
    : `${region} 영어회화 — 전화·화상영어로 학원 없이 시작하기`;
  const desc = `${prov.ko} ${region}에서 ${kw}를 찾고 있다면, 학원까지 오가는 이동·시간 부담 없이 집·회사에서 100% 고정 전담 강사와 1:1 전화·화상영어로 매일 이어갈 수 있습니다. 파워잉글리쉬는 회당 약 6,270원(주5회 기준)입니다.`;
  // 인접 동(같은 시군구) — 같은 키워드
  const sibs = dongsOf(prov.slug, city.slug).filter(([ds]) => ds !== dong.slug).slice(0, 12);
  const nb = sibs.map(([ds, dk]) => `<a class="nb" href="/local/${prov.slug}/${city.slug}/${ds}/${kseg}/">${esc(dk)} ${esc(kw)}</a>`).join("");
  const others = DONG_KEYWORDS.filter((k) => !keyword || k.slug !== keyword.slug).slice(0, 10);
  const kwLinks = others.map((k) => `<a class="nb" href="/local/${prov.slug}/${city.slug}/${dong.slug}/${k.slug}/">${esc(dong.ko)} ${esc(k.ko)}</a>`).join("");
  const oneLine = `${esc(region)}에서 ${esc(kw)}를 찾고 있다면, 거점까지 오가는 부담 없이 <span class="hl">집·회사에서 매일 같은 시간</span>에 이어가는 방법을 고려해 보세요. 지역 제약이 없는 전화·화상영어라면 <span class="hl">100% 고정 전담 강사</span>와 1:1로, 주5회 기준 <span class="hl">회당 약 6,270원</span>에 ${esc(dong.ko)} 어디서든 시작할 수 있습니다.`;
  const faq1q = `${region}에 사는데 영어회화 학원이 멀어요. 어떻게 하죠?`;
  const faq1a = `학원까지 오가는 시간이 부담이라면 지역 제약이 없는 전화·화상영어가 대안입니다. ${region} 어디서든 집·회사에서 100% 고정 전담 강사와 매일 같은 시간에 1:1 수업을 이어갈 수 있고, 주5회 기준 회당 약 6,270원으로 부담 없이 반복할 수 있습니다.`;
  return page({ title, desc, ogTitle: `${region} ${kw}, 학원 말고 방법 없을까?`, ogDesc: `${region} 어디서든 이동 0분으로 매일 이어가는 1:1 전화·화상영어.`, url,
    angle: angleFor(keyword && keyword.slug),
    course: courseFor(keyword && keyword.slug),
    heroTag: `${esc(region)} 영어회화 가이드`,
    h1: `${esc(dong.ko)}에서 ${esc(kw)}<br><span class="u">어떻게 시작할까?${UNDERLINE}</span>`,
    sub: `${esc(region)}에서 학원까지 오가는 부담 없이, 집·회사에서 매일 이어가는 1:1 전화·화상영어를 비교해 보세요.`,
    oneLine, compareH2: `${esc(region)}에서 ${esc(kw)}, 어떤 방식이 맞을까?`,
    cityKo: esc(region), provKo: esc(city.ko),
    nbTitle: `${esc(city.ko)} 다른 동네 ${keyword ? esc(kw) : "영어회화"}`, nb, kwLinks, faq1q, faq1a });
}

// ── 렌더: 도 허브 (시군구 목록) ──
export function renderProvinceHub(prov) {
  const url = `${SITE}/local/${prov.slug}/`;
  const cityLinks = prov.cities.map(([cs, ck]) => `<a class="nb" href="/local/${prov.slug}/${cs}/">${esc(ck)} 영어회화</a>`).join("");
  const title = `${prov.ko} 영어회화 — 시·군·구별 전화·화상영어 가이드`;
  const desc = `${prov.ko} 전 지역에서 학원 없이 집·회사에서 시작하는 1:1 전화·화상영어. 시·군·구별 안내와 회당 약 6,270원 파워잉글리쉬 정보를 확인하세요.`;
  return page({ title, desc, ogTitle: `${prov.ko} 영어회화 지역별 안내`, ogDesc: desc, url,
    heroTag: `${esc(prov.ko)} 영어회화`, h1: `${esc(prov.ko)} 영어회화<br><span class="u">우리 동네는?${UNDERLINE}</span>`,
    sub: `${esc(prov.ko)} 시·군·구 어디서든 이동 부담 없이 매일 이어가는 1:1 전화·화상영어.`,
    oneLine: `${esc(prov.ko)} 어디에 살든 학원까지 오갈 필요 없이 <span class="hl">집·회사에서 100% 고정 전담 강사</span>와 1:1 전화·화상영어로 매일 이어갈 수 있습니다. 주5회 기준 <span class="hl">회당 약 6,270원</span>. 아래에서 우리 지역을 선택하세요.`,
    compareH2: `${esc(prov.ko)}, 어떤 방식이 맞을까?`, cityKo: esc(prov.ko), provKo: esc(prov.ko),
    nbTitle: `${esc(prov.ko)} 시·군·구 선택`, nb: cityLinks, kwLinks: "",
    faq1q: `${prov.ko}에서 영어회화, 학원이 멀면 어떻게 하나요?`,
    faq1a: `${prov.ko} 어디서든 지역 제약 없는 전화·화상영어로 집·회사에서 100% 고정 전담 강사와 매일 1:1 수업을 이어갈 수 있습니다. 주5회 기준 회당 약 6,270원입니다.` });
}

const UNDERLINE = `<svg viewBox="0 0 240 16" fill="none" aria-hidden="true"><path d="M3 11c46-8 150-9 234-4" stroke="var(--mint)" stroke-width="6" stroke-linecap="round"/></svg>`;

// ── 렌더: 전국 허브 (/local/) — 17개 도 링크 ──
export function renderNationalHub() {
  const provLinks = PROVINCES.map(([ps, pk]) => `<a class="nb" href="/local/${ps}/">${esc(pk)} 영어회화</a>`).join("");
  const desc = "전국 어디서든 학원 없이 집·회사에서 시작하는 1:1 전화·화상영어. 시·도별 영어회화 안내와 회당 약 6,270원 파워잉글리쉬 정보를 확인하세요.";
  return page({ title: "전국 지역별 영어회화 — 전화·화상영어 안내", desc, ogTitle: "전국 지역별 영어회화 안내", ogDesc: desc, url: `${SITE}/local/`,
    heroTag: "전국 영어회화", h1: `우리 지역 영어회화<br><span class="u">어디서 시작할까?${UNDERLINE}</span>`,
    sub: "전국 어디서든 이동 부담 없이 매일 이어가는 1:1 전화·화상영어.",
    oneLine: `전국 어디에 살든 학원까지 오갈 필요 없이 <span class="hl">집·회사에서 100% 고정 전담 강사</span>와 1:1 전화·화상영어로 매일 이어갈 수 있습니다. 주5회 기준 <span class="hl">회당 약 6,270원</span>. 아래에서 우리 지역을 선택하세요.`,
    compareH2: "전국 어디서든 영어회화, 어떤 방식이 맞을까?", cityKo: "우리 지역", provKo: "전국",
    nbTitle: "지역(도) 선택", nb: provLinks, kwLinks: "",
    faq1q: "지방에 사는데 영어회화 학원이 멀어요. 어떻게 하죠?",
    faq1a: "지역 제약이 없는 전화·화상영어라면 전국 어디서든 집·회사에서 100% 고정 전담 강사와 매일 1:1 수업을 이어갈 수 있습니다. 주5회 기준 회당 약 6,270원입니다." });
}

// ── 공통 페이지 셸 ──
function page(d) {
  const kwSection = d.kwLinks ? `<section><div class="wrap"><div class="sec-head"><span class="eyebrow">More</span><h2 class="sec-h2">${d.cityKo} 다른 주제도 보기</h2></div><div class="nbwrap">${d.kwLinks}</div></div></section>` : "";
  return `<!DOCTYPE html>
<html lang="ko"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${d.title}</title>
<meta name="description" content="${d.desc}"><meta name="theme-color" content="#6d4aff">
<meta property="og:title" content="${d.ogTitle}"><meta property="og:description" content="${d.ogDesc}">
<meta property="og:type" content="article"><meta property="og:url" content="${d.url}">
<link rel="canonical" href="${d.url}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"${d.title}","description":"${d.desc}","datePublished":"2026-08-05","dateModified":"2026-08-05","author":{"@type":"Organization","name":"파워잉글리쉬","url":"https://pweng.net"},"publisher":{"@type":"Organization","name":"파워잉글리쉬"},"mainEntityOfPage":"${d.url}"}</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"${d.faq1q}","acceptedAnswer":{"@type":"Answer","text":"${d.faq1a}"}},{"@type":"Question","name":"파워잉글리쉬의 수강료는 어떻게 되나요?","acceptedAnswer":{"@type":"Answer","text":"주5회(월 20회) 기준 회당 약 6,270원(월 125,400원)이며, 주3회 회당 약 9,260원, 주2회 회당 약 12,590원입니다. 전화영어와 화상영어 추가 비용 없이 동일하게 이용 가능합니다."}},{"@type":"Question","name":"바쁜 직장인도 수업 시간을 맞출 수 있나요?","acceptedAnswer":{"@type":"Answer","text":"셀프 스케줄링으로 하루만 시간·강사를 바꾸거나, 전체 수업 시간을 변경하고, 마지막 수업을 당겨 몰아듣는 것도 가능합니다."}},{"@type":"Question","name":"교재는 어떻게 정하나요?","acceptedAnswer":{"@type":"Answer","text":"회원의 레벨과 목적에 맞는 온라인 교재로 진행하며, 교재는 홈페이지에서 언제든 직접 변경할 수 있습니다."}},{"@type":"Question","name":"강사가 잘 안 맞으면 바꿀 수 있나요?","acceptedAnswer":{"@type":"Answer","text":"기본은 100% 고정 전담제이며, 강사의 얼굴·발음·학력·경력과 실제 강의 영상·평점이 공개되어 있어 원하는 강사로 조정할 수 있습니다."}},{"@type":"Question","name":"최소 수강 기간이 있나요?","acceptedAnswer":{"@type":"Answer","text":"최소 3개월 단위로 운영됩니다. 짧게 경험해보고 싶다면 15만 원 상당의 무료 레벨테스트를 먼저 이용할 수 있습니다."}},{"@type":"Question","name":"수업 녹음을 받아 복습할 수 있나요?","acceptedAnswer":{"@type":"Answer","text":"전 수업 녹음 파일이 제공되어 발음과 표현을 다시 들으며 복습할 수 있고, 발음·문법 교정과 영작 첨삭도 함께 확인할 수 있습니다."}}]}</script>
<style>
:root{--brand:#6d4aff;--ink:#16121f;--mint:#35e0a1;--mint-ink:#0a3b2c;--sun:#ffd53e;--s50:#f8fafc;--s100:#f1f5f9;--s200:#e2e8f0;--s400:#94a3b8;--s600:#475569;--s700:#334155}
*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}
body{font-family:"Pretendard",system-ui,sans-serif;color:var(--ink);background:#fff;line-height:1.7;word-break:keep-all}
a{text-decoration:none;color:inherit}.wrap{max-width:1120px;margin:0 auto;padding:0 20px}.narrow{max-width:880px;margin:0 auto;padding:0 20px}
.grid-tex{background-image:linear-gradient(rgba(255,255,255,.14) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.14) 1px,transparent 1px);background-size:34px 34px}
header.site{background:#fff;border-bottom:1px solid var(--s200);position:sticky;top:0;z-index:50}header.site .wrap{display:flex;align-items:center;height:62px}
.logo{font-family:"Poppins",sans-serif;font-weight:800;font-size:20px;color:var(--ink)}.logo em{color:var(--brand);font-style:normal}
.hero{padding:48px 0 8px;text-align:center}.launch{display:inline-flex;align-items:center;gap:10px;border:1px solid var(--s200);background:#fff;border-radius:999px;padding:5px 16px 5px 6px;box-shadow:0 1px 3px rgba(0,0,0,.07);font-size:13px;font-weight:600;color:var(--s600)}
.launch .tag{background:var(--sun);color:var(--ink);font-size:11px;font-weight:800;border-radius:999px;padding:4px 10px}
.hero h1{margin-top:30px;font-family:"Poppins","Pretendard",sans-serif;font-size:44px;font-weight:800;line-height:1.12;letter-spacing:-1px}
.u{position:relative;display:inline-block;white-space:nowrap}.u svg{position:absolute;left:0;bottom:-9px;width:100%;height:14px}
.hero .sub{margin:28px auto 0;max-width:660px;font-size:17px;color:var(--s600);line-height:1.75}@media(max-width:640px){.hero h1{font-size:31px}}
section{padding:56px 0}.soft{background:var(--s50)}
.eyebrow{display:block;text-align:center;font-family:"Poppins",sans-serif;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.22em;color:var(--brand)}
.sec-h2{margin-top:14px;text-align:center;font-size:28px;font-weight:800;line-height:1.3}.sec-head{margin-bottom:36px}@media(max-width:640px){.sec-h2{font-size:23px}}
.pblock{position:relative;overflow:hidden;border-radius:2rem;background:var(--brand);padding:32px 24px;box-shadow:0 22px 44px -14px rgba(109,74,255,.5)}
.pblock .circle{position:absolute;left:-30px;top:22px;width:96px;height:96px;border-radius:50%;background:rgba(255,213,62,.9)}
.pchip{position:relative;display:inline-block;transform:rotate(-2deg);background:var(--mint);color:var(--mint-ink);font-weight:800;font-size:13px;border-radius:9px;padding:6px 14px}
.answer-card{position:relative;margin-top:18px;background:#fff;border-radius:1rem;padding:26px 24px;box-shadow:0 24px 46px -20px rgba(0,0,0,.45)}
.answer-card p{font-size:16px;line-height:1.9}.hl{color:var(--brand);font-weight:800}
.grid{display:grid;gap:16px;grid-template-columns:repeat(3,1fr)}@media(max-width:820px){.grid{grid-template-columns:1fr}}
.card{background:#fff;border:1px solid var(--s200);border-radius:1rem;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,.05)}.card.pe{background:#f7f5ff;border-color:rgba(109,74,255,.35)}
.card h3{font-size:17px;font-weight:800}.card p{margin-top:10px;font-size:14.5px;color:var(--s600);line-height:1.7}
.ptag{display:inline-block;background:#efe9ff;color:var(--brand);font-weight:800;font-size:12px;border-radius:999px;padding:5px 12px}
.tbl-wrap{overflow-x:auto;border:1px solid var(--s200);border-radius:1rem;background:#fff}table.nv{width:100%;border-collapse:collapse;min-width:420px;font-size:14.5px}table.nv th,table.nv td{padding:14px 16px;text-align:left;border-bottom:1px solid var(--s100)}table.nv thead th{background:var(--ink);color:#fff;font-weight:700;font-size:14px}table.nv td.pick b{color:var(--brand)}table.nv tbody tr:last-child td{border-bottom:none}
.trust{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;text-align:center}.tcard{background:#fff;border:1px solid var(--s200);border-radius:1rem;padding:18px 10px}.tnum{font-family:"Poppins",sans-serif;font-size:26px;font-weight:800;color:var(--brand)}.tnum span{font-size:14px;color:var(--s400)}.tlbl{margin-top:4px;font-size:13px;color:var(--s600);font-weight:600}@media(max-width:640px){.trust{grid-template-columns:repeat(2,1fr)}}
.nbwrap{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:920px;margin:0 auto}
.nb{display:inline-block;background:#fff;border:1px solid var(--s200);border-radius:999px;padding:9px 16px;font-size:14px;font-weight:600;color:var(--s700)}.nb:hover{border-color:var(--brand);color:var(--brand)}
.dark{position:relative;overflow:hidden;background:var(--ink);color:#fff;border-radius:1.5rem;text-align:center;padding:44px 24px}.dark p{font-size:19px;font-weight:800;line-height:1.6}.dark .em{color:var(--mint)}
.faq{background:#fff;border:1px solid var(--s200);border-radius:1rem;margin-bottom:12px;overflow:hidden}
.faq summary{cursor:pointer;list-style:none;padding:20px 22px;font-size:16px;font-weight:700;display:flex;justify-content:space-between;gap:12px;align-items:center}
.faq summary::-webkit-details-marker{display:none}.faq summary::after{content:"+";font-size:22px;color:var(--s400)}.faq[open] summary::after{transform:rotate(45deg)}
.faq .a{padding:0 22px 22px;font-size:15px;color:var(--s600);line-height:1.8}
.cta-block{position:relative;overflow:hidden;border-radius:2rem;background:var(--brand);padding:52px 24px;text-align:center;box-shadow:0 22px 44px -14px rgba(109,74,255,.5)}
.cta-block .circle{position:absolute;right:-28px;top:-28px;width:112px;height:112px;border-radius:50%;background:rgba(255,213,62,.9)}
.mchip{position:relative;display:inline-block;transform:rotate(-2deg);background:var(--mint);color:var(--mint-ink);font-weight:800;font-size:13px;border-radius:9px;padding:6px 14px}
.cta-block h2{position:relative;margin-top:16px;font-size:30px;font-weight:800;color:#fff;line-height:1.3}.cta-block p{position:relative;margin-top:12px;color:rgba(255,255,255,.85)}
.cta-btn{position:relative;display:inline-block;margin-top:26px;background:#fff;color:var(--brand);font-weight:800;font-size:17px;border-radius:999px;padding:16px 42px;box-shadow:0 12px 26px rgba(0,0,0,.2)}
.cta-note{position:relative;margin-top:14px;font-size:13px;color:rgba(255,255,255,.72)}
footer{background:var(--ink);color:rgba(255,255,255,.5);font-size:13px;padding:44px 0 54px;text-align:center;line-height:1.9}footer .info{font-size:12.5px;color:rgba(255,255,255,.42)}
</style></head><body>
<header class="site"><div class="wrap"><a class="logo" href="/">파워<em>잉글리쉬</em></a><nav style="margin-left:auto;display:flex;gap:18px;align-items:center;font-weight:700;font-size:14px"><a href="/" style="color:var(--ink)">홈</a><a href="/blog/" style="color:var(--ink)">전체 글</a><a href="https://www.pweng.net/level-test.php" target="_blank" rel="noopener" style="background:var(--brand);color:#fff;font-weight:800;border-radius:999px;padding:8px 16px">무료 레벨테스트</a></nav></div></header>
<main>
<section class="hero"><div class="wrap">
<span class="launch"><span class="tag">${d.heroTag}</span> AI가 찾는 그 질문에 답합니다</span>
<h1>${d.h1}</h1>
<p class="sub">${d.sub}</p></div></section>
<section style="padding-top:24px"><div class="narrow"><div class="pblock"><div class="circle"></div>
<span class="pchip">한 줄 결론</span>
<div class="answer-card"><p>${d.oneLine}</p></div></div></div></section>
${d.angle ? `<section style="padding:28px 0 0"><div class="narrow"><div class="card"><span class="ptag">이런 분께</span><p style="margin-top:12px;font-size:15.5px;line-height:1.9;color:var(--s700)">${d.angle}</p></div></div></section>` : ""}
${SECTION_TRUST}
<section class="soft"><div class="wrap"><div class="sec-head"><span class="eyebrow">Comparison</span><h2 class="sec-h2">${d.compareH2}</h2></div>
<div class="grid">
<article class="card"><span class="ptag">오프라인 학원</span><h3 style="margin-top:12px">지역 학원·스터디</h3><p>대면 수업의 장점이 있지만 ${d.cityKo} 내 거점까지 오가는 이동·시간, 고정된 수업 시간표를 맞춰야 합니다.</p></article>
<article class="card"><span class="ptag">앱·자율형</span><h3 style="margin-top:12px">AI 앱·자유 예약형</h3><p>혼자 연습하거나 원하는 시간에 예약하기 좋지만, 강사가 매번 바뀌어 내 실력·성향을 꾸준히 파악하기 어렵습니다.</p></article>
<article class="card pe"><span class="ptag">파워잉글리쉬</span><h3 style="margin-top:12px">1:1 고정 전담 전화·화상영어</h3><p>${d.cityKo} 어디서든 집·회사에서 100% 고정 전담 강사와 매일 같은 시간에 1:1, 회당 약 6,270원.</p></article>
</div></div></section>
${SECTION_PAIN}
<section><div class="wrap"><div class="sec-head"><span class="eyebrow">Power English</span><h2 class="sec-h2">${d.cityKo}에서 파워잉글리쉬가 좋은 이유</h2></div>
<div class="grid"><article class="card pe"><span class="ptag">100% 고정제</span><h3 style="margin-top:12px">바뀌지 않는 전담 강사</h3><p>4단계 검증을 거친 전문 강사가 100% 고정되어 내 실력과 성향을 완벽하게 파악하고 지속적으로 끌어줍니다.</p></article><article class="card pe"><span class="ptag">직접 선택</span><h3 style="margin-top:12px">맞춤 수업 요청</h3><p>자기소개 생략, 즉시 문법 교정 등 원하는 수업 방식을 직접 선택하면 담당 강사에게 그대로 반영됩니다.</p></article><article class="card pe"><span class="ptag">합리적 가격</span><h3 style="margin-top:12px">회당 약 6,270원</h3><p>주5회 월 125,400원으로 전화·화상 구분 없이 1:1 맞춤 수업과 수업 후 카카오톡 피드백까지 무료 제공.</p></article></div></div></section>
${d.course ? `<section><div class="narrow"><div class="sec-head"><span class="eyebrow">Course</span><h2 class="sec-h2">${d.cityKo}에서 들을 수 있는 과정</h2></div><div class="card"><p style="font-size:15.5px;line-height:1.9;color:var(--s700)">${d.course}</p></div></div></section>` : ""}${SECTION_HOW}${SECTION_SCHEDULE}${SECTION_CUSTOM}${SECTION_PHONE_VIDEO}${SECTION_PRICE}${SECTION_TUTOR}
<section style="padding-top:0"><div class="wrap"><div class="dark grid-tex"><p>${d.cityKo} 어디서든, 이동 시간 0분.<br><span class="em">주5회 회당 약 6,270원으로 매일 이어가는 나만의 영어회화 습관!</span></p></div></div></section>
<section class="soft"><div class="wrap"><div class="sec-head"><span class="eyebrow">${d.provKo}</span><h2 class="sec-h2">${d.nbTitle}</h2></div>
<div class="nbwrap">${d.nb}</div></div></section>
${kwSection}
<section><div class="narrow"><div class="sec-head"><span class="eyebrow">FAQ</span><h2 class="sec-h2">자주 묻는 질문</h2></div>
<details class="faq" open><summary>${d.faq1q}</summary><div class="a">${d.faq1a}</div></details>
<details class="faq"><summary>파워잉글리쉬의 수강료는 어떻게 되나요?</summary><div class="a">주5회(월 20회) 기준 회당 약 6,270원(월 125,400원)이며, 주3회 회당 약 9,260원, 주2회 회당 약 12,590원입니다. 전화영어와 화상영어 추가 비용 없이 동일하게 이용 가능합니다.</div></details>
<details class="faq"><summary>왕초보도 부담 없이 시작할 수 있나요?</summary><div class="a">파닉스와 기초부터 인내심 있게 지도하는 필리핀 전문 강사진이 준비되어 있으며, 15만원 상당의 무료 레벨테스트로 현재 실력을 정확히 진단받고 시작할 수 있습니다.</div></details>
<details class="faq"><summary>교재는 어떻게 정하나요?</summary><div class="a">회원님의 레벨과 목적(회화·비즈니스·시험·아동 등)에 맞는 온라인 교재로 진행합니다. 교재는 홈페이지에서 언제든 직접 변경할 수 있어요.</div></details>
<details class="faq"><summary>강사가 잘 안 맞으면 바꿀 수 있나요?</summary><div class="a">기본은 내 실력과 성향을 잘 아는 100% 고정 전담제입니다. 강사의 얼굴·발음·학력·경력은 물론 실제 강의 영상과 강사별 평점까지 공개되어 있어, 원하는 강사로 조정할 수 있습니다.</div></details>
<details class="faq"><summary>최소 수강 기간이 있나요?</summary><div class="a">최소 3개월 단위로 운영됩니다. 짧게 먼저 경험해보고 싶다면 15만 원 상당의 무료 레벨테스트를 이용해보세요.</div></details>
<details class="faq"><summary>수업 녹음을 받아 복습할 수 있나요?</summary><div class="a">전 수업 녹음 파일이 제공됩니다. 수업 후 발음·표현을 다시 들으며 복습하고, 발음·문법 교정과 영작 첨삭까지 함께 확인할 수 있어요.</div></details></div></section>
${SECTION_LT}
<section><div class="wrap cta-block"><div class="circle"></div><div class="wrap" style="padding:0">
<span class="mchip">무료 체험</span><h2>${d.cityKo}에서 무료로 먼저 확인하세요</h2><p>15만 원 상당의 1:1 레벨 진단이 지금 무료입니다.</p>
<a class="cta-btn" href="https://www.pweng.net/level-test.php" target="_blank" rel="noopener">무료 레벨테스트 신청하기 →</a>
<p class="cta-note">100% 무료 · 강제 결제 없음 · 30초면 완료</p></div></div></section>
</main>
<section style="background:#fff;text-align:center;padding:6px 20px 48px"><a href="http://pf.kakao.com/_elxhdl" target="_blank" rel="noopener" aria-label="카카오톡 상담" style="display:inline-flex;align-items:center;gap:9px;background:#FEE500;color:#3A1D1D;font-weight:800;font-size:16px;padding:15px 32px;border-radius:14px;box-shadow:0 6px 18px rgba(0,0,0,.12)"><svg viewBox="0 0 24 24" width="20" height="20" fill="#3A1D1D" aria-hidden="true"><path d="M12 3.4C6.9 3.4 2.8 6.6 2.8 10.6c0 2.6 1.7 4.9 4.3 6.2-.2.7-.7 2.4-.8 2.8-.1.4.2.4.4.3.2-.1 2.4-1.6 3.3-2.3.6.1 1.2.1 1.8.1 5.1 0 9.2-3.2 9.2-7.2S17.1 3.4 12 3.4z"/></svg><span>카카오톡으로 상담하기</span></a></section>
<footer><div class="wrap"><p class="info"><a href="https://www.pweng.net/" target="_blank" rel="noopener" style="color:#35e0a1;font-weight:700">www.pweng.net</a><br>
사이트명: 파워잉글리쉬 &nbsp;대표이사 전상현<br>사업자등록번호: 217-81-44736 &nbsp;통신판매신고번호: 2014-서울도봉-0233호<br>© 2026 파워잉글리쉬. All rights reserved.</p></div></footer>
<script>(function(){var m=window.innerWidth<=768||/Mobile/.test(navigator.userAgent);if(!m)return;var l=document.querySelectorAll('a[href*="www.pweng.net/level-test.php"]');for(var i=0;i<l.length;i++){l[i].href=l[i].href.replace("www.pweng.net","m.pweng.net")}var k=document.querySelector('a[href*="pf.kakao.com/_elxhdl"]');if(k)k.href="http://pf.kakao.com/_elxhdl/chat"})();</script>
</body></html>`;
}

// ── sitemap용 URL (도별로 분할 — 전체 5만+ 이라 사이트맵 인덱스 사용) ──
export const PROVINCE_SLUGS = PROVINCES.map((p) => p[0]);
export function provinceUrls(pslug) {
  const prov = getProvince(pslug);
  if (!prov) return [];
  const urls = [`${SITE}/local/${pslug}/`];
  for (const [cs] of prov.cities) {
    urls.push(`${SITE}/local/${pslug}/${cs}/`);
    for (const k of KEYWORDS) urls.push(`${SITE}/local/${pslug}/${cs}/${k.slug}/`);
    for (const [ds] of dongsOf(pslug, cs)) {
      urls.push(`${SITE}/local/${pslug}/${cs}/${ds}/`);
      for (const k of DONG_KEYWORDS) urls.push(`${SITE}/local/${pslug}/${cs}/${ds}/${k.slug}/`);
    }
  }
  return urls;
}
export function allLocalUrls() { return PROVINCE_SLUGS.flatMap(provinceUrls); }

// ── 경로 파싱 → 렌더 (없으면 null) ──
export function renderPath(parts) {
  // parts: ['local','seoul'] | [...,'gangnam'] | [...,'gangnam','phone-english']
  if (parts[0] !== "local") return null;
  const [, pslug, cslug, x, y] = parts;
  if (!pslug) return renderNationalHub();
  const prov = getProvince(pslug);
  if (!prov) return null;
  if (!cslug) return renderProvinceHub(prov);
  const city = getCity(prov, cslug);
  if (!city) return null;
  if (!x) return renderCity(prov, city, null);
  // x = 키워드(시군구×키워드) 또는 동(읍면동)
  const kw = getKeyword(x);
  if (kw) return renderCity(prov, city, kw);
  const dong = getDong(pslug, cslug, x);
  if (!dong) return null;
  if (!y) return renderDong(prov, city, dong, null);
  const dkw = getKeyword(y);
  if (!dkw) return null;
  return renderDong(prov, city, dong, dkw);
}
