// CLAUDE 아성다이소 검토·보고 PPT 틀 생성기
// 기준: 「사내 발표자료 공통 문법」 02~08장 (보고서 전체 구성, 장표 1장의 구조, 색·강조, 표·차트·숫자, 글꼴·서식)
// 실행: NODE_PATH=<pptxgenjs가 설치된 node_modules> APPLY_THEME=<pptx 스킬>/scripts/apply_theme.js \
//       node tools/build_report_template.js [출력 경로]
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

// ── 기준값 ────────────────────────────────────────────────────────────────
// 글꼴: 맑은 고딕을 "테마 글꼴"로만 지정 (개별 글자에 글꼴 직접 지정 금지)
// 색: 파랑(남색)·검정·회색 3색 기본, 노랑은 핵심 셀 음영, 빨강은 장표당 1곳
const THEME = {
	name: "아성다이소 보고",
	headFontFace: "맑은 고딕",
	bodyFontFace: "맑은 고딕",
	colors: {
		dk1: "000000", lt1: "FFFFFF",
		dk2: "1F3864", // 남색: 카드 헤더 바, 표 머리행 글씨, 강조 막대
		lt2: "F2F2F2", // 연회색: 표 머리행, 분해 패널 배경
		accent1: "1F4E9A", // 파랑: 헤드메시지 핵심 구절, 목표·계획 수치, 합계 열
		accent2: "7F7F7F", // 회색: 각주, 단위, 비교 막대
		accent3: "FFF2CC", // 노랑 음영: 당해·핵심 기간, 개선 범위
		accent4: "C00000", // 빨강: 장표당 1곳
		accent5: "DDE6F3", // 연파랑 음영: 핵심 셀
		accent6: "BFBFBF", // 선
		hlink: "1F4E9A", folHlink: "7F7F7F",
	},
};
// 글자 크기(pt) — 정수만 사용
const PT = { cover: 28, coverSub: 14, title: 18, head: 14, section: 12, body: 10, note: 9, close: 13, page: 9, toc: 14 };

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 16:9, 13.33 x 7.5 in
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "CLAUDE 아성다이소 보고서 틀";
pres.company = "아성다이소";
const C = pres.SchemeColor;
const HEX = THEME.colors;

const W = 13.33, MX = 0.5, CW = W - MX * 2;
const Y = { title: 0.3, head: 0.82, unit: 1.36, top: 1.62, bottom: 6.12, note: 6.2, close: 6.55, page: 7.08 };

pres.defineSlideMaster({ title: "COVER", background: { color: "FFFFFF" } });
pres.defineSlideMaster({
	title: "CONTENT",
	background: { color: "FFFFFF" },
	objects: [
		{ placeholder: { options: { name: "title", type: "title", x: MX, y: Y.title, w: CW, h: 0.48, fontSize: PT.title, bold: true, align: "center", valign: "middle", color: C.text1, margin: 0 }, text: "제목" } },
		{ placeholder: { options: { name: "body", type: "body", x: MX, y: Y.head, w: CW, h: 0.46, fontSize: PT.head, align: "center", valign: "middle", color: C.text1, margin: 0 }, text: "헤드메시지" } },
	],
});

const TOTAL = 9; // 표지부터 센 전체 쪽수 (숨김 참고 장표 제외)
let pageNo = 2; // 표지 1, 목차 2 — 쪽수 표기는 본문부터
let secName = "";
function section(title) { secName = title; pres.addSection({ title }); }

// 본문 장표: 제목 + 헤드메시지(핵심 구절만 파란 굵게) + 쪽수 "n | 전체"
function content(title, headRuns, opts = {}) {
	const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: secName });
	s.addText(title, { placeholder: "title" });
	s.addText(headRuns.map((r) => (typeof r === "string" ? { text: r } : { text: r.b, options: { bold: true, color: C.accent1 } })), { placeholder: "body" });
	if (!opts.hidden) {
		pageNo += 1;
		txt(s, `${pageNo} | ${TOTAL}`, W - MX - 1.5, Y.page, 1.5, 0.25, { fontSize: PT.page, color: C.accent2, align: "right" });
	}
	return s;
}
function txt(s, text, x, y, w, h, o = {}) {
	s.addText(text, Object.assign({ x, y, w, h, isTextBox: true, margin: 0, fontSize: PT.body, color: C.text1, valign: "middle" }, o));
}
function box(s, x, y, w, h, o = {}) {
	s.addShape(pres.ShapeType.rect, Object.assign({ x, y, w, h, fill: { color: C.background1 }, line: { color: C.accent6, width: 0.75 } }, o));
}
const unit = (s, t) => txt(s, t, W - MX - 3, Y.unit, 3, 0.22, { fontSize: PT.note, color: C.accent2, align: "right" });
const note = (s, t) => txt(s, t, MX, Y.note, CW, 0.26, { fontSize: PT.note, color: C.accent2 });
const close = (s, t) => txt(s, "▶ " + t, MX, Y.close, CW, 0.4, { fontSize: PT.close, bold: true, align: "center" });
// 영역 소제목: 굵은 글씨 + 괄호 작은 글씨(기준·단위)
function sub(s, label, small, x, y, w) {
	txt(s, [{ text: label, options: { bold: true, fontSize: PT.section } }, { text: small ? "  " + small : "", options: { fontSize: PT.note, color: C.accent2 } }], x, y, w, 0.3);
}
// 번호 배지 박스: 검정 배지 + [키워드] 제목 + 파란 화살표 한 줄
function badge(s, n, x, y, w, h, head, line) {
	box(s, x, y, w, h);
	s.addShape(pres.ShapeType.rect, { x, y, w: 0.4, h, fill: { color: C.text1 }, line: { color: C.text1, width: 0.75 } });
	txt(s, String(n), x, y, 0.4, h, { fontSize: PT.section, bold: true, color: C.background1, align: "center" });
	txt(s, [
		{ text: head, options: { bold: true, fontSize: PT.section, breakLine: true } },
		{ text: "→ ", options: { color: C.accent1, bold: true } },
		{ text: line },
	], x + 0.55, y, w - 0.7, h);
}
// 표: 머리행 연회색 + 굵은 남색, 줄 간격 150%, 핵심 셀만 음영
const border = { type: "solid", pt: 0.75, color: HEX.accent6 };
function cell(text, o = {}) {
	return { text, options: Object.assign({ fontSize: PT.body, color: C.text1, valign: "middle", lineSpacingMultiple: 1.5, margin: [0.03, 0.08, 0.03, 0.08] }, o) };
}
const th = (t) => cell(t, { bold: true, color: C.text2, fill: { color: C.background2 }, align: "center" });
function table(s, rows, x, y, w, colW, rowH) {
	s.addTable(rows, { x, y, w, colW, rowH, border });
}

// ── 1. 표지 ──────────────────────────────────────────────────────────────
section("표지·목차");
{
	const s = pres.addSlide({ masterName: "COVER", sectionTitle: secName });
	txt(s, "[보고서 제목] 검토(안)", 1.2, 2.5, W - 2.4, 0.9, { fontSize: PT.cover, bold: true, align: "center" });
	txt(s, "[부제: 근거·목적 한 줄]", 1.2, 3.5, W - 2.4, 0.45, { fontSize: PT.coverSub, color: C.accent2, align: "center" });
	txt(s, [{ text: "’26.00.00", options: { breakLine: true } }, { text: "안전보건팀", options: { bold: true } }], 1.2, 5.6, W - 2.4, 0.8, { fontSize: PT.coverSub, align: "center" });
}
// ── 2. 목차 ──────────────────────────────────────────────────────────────
{
	const s = pres.addSlide({ masterName: "COVER", sectionTitle: secName });
	txt(s, "목차", MX, Y.title, CW, 0.48, { fontSize: PT.title, bold: true, align: "center" });
	const main = ["0. 보고 요약", "1. 검토 배경", "2. 현황 분석", "3. 개선 방안"];
	const att = ["#첨부 1. [근거 자료 제목]", "#첨부 2. [근거 자료 제목]"];
	const x = 4.2, w = W - 8.4;
	main.forEach((t, i) => txt(s, t, x, 1.7 + i * 0.6, w, 0.5, { fontSize: PT.toc, bold: true }));
	s.addShape(pres.ShapeType.line, { x, y: 4.3, w, h: 0, line: { color: C.accent6, width: 0.75 } });
	att.forEach((t, i) => txt(s, t, x, 4.5 + i * 0.55, w, 0.45, { fontSize: PT.toc, color: C.accent2 }));
}

// ── 3. 0. 보고 요약 ───────────────────────────────────────────────────────
section("0. 보고 요약");
{
	const s = content("0. 보고 요약", ["[결론+수치 한 문장] 현행 A → 개선 B로 ", { b: "[핵심 구절]" }, " 하겠음"]);
	// 보고 범위
	box(s, MX, Y.top, CW, 0.5, { fill: { color: C.background2 }, line: { color: C.background2, width: 0.75 } });
	txt(s, [{ text: "보고 범위  ", options: { bold: true, color: C.text2 } }, { text: "금일은 [○○]만 다룸 — [다루지 않는 범위]는 별도 보고" }], MX + 0.15, Y.top, CW - 0.3, 0.5);
	// 과제별 현행 한계 → 개선 방안 → 추진 일정
	const colW = [1.9, 3.5, 3.9, 3.03];
	const y0 = Y.top + 0.68;
	table(s, [
		[th("과제"), th("현행 한계"), th("개선 방안"), th("추진 일정")],
		[cell("[과제 1]", { bold: true }), cell("[한계: 사실·수치]"), cell("[방안: 무엇을 어떻게]", { fill: { color: C.accent5 } }), cell("’26.00 ~ ’26.00")],
		[cell("[과제 2]", { bold: true }), cell("[한계: 사실·수치]"), cell("[방안: 무엇을 어떻게]"), cell("’26.00 ~ ’27.00")],
		[cell("[과제 3]", { bold: true }), cell("[한계: 사실·수치]"), cell("[방안: 무엇을 어떻게]"), cell("’27.00")],
	], MX, y0, CW, colW, 0.5);
	// 의사결정 요청 ①② — 예/아니오로 답할 수 있게
	const yd = y0 + 2.2;
	sub(s, "의사결정 요청", "(예/아니오로 답할 수 있게 작성)", MX, yd, CW);
	const bw = (CW - 0.3) / 2;
	box(s, MX, yd + 0.36, bw, 0.7);
	txt(s, [{ text: "① ", options: { bold: true, color: C.accent1 } }, { text: "[결정 요청 1]을 승인하시겠습니까?" }], MX + 0.15, yd + 0.36, bw - 0.3, 0.7);
	box(s, MX + bw + 0.3, yd + 0.36, bw, 0.7);
	txt(s, [{ text: "② ", options: { bold: true, color: C.accent1 } }, { text: "[결정 요청 2]를 승인하시겠습니까?" }], MX + bw + 0.45, yd + 0.36, bw - 0.3, 0.7);
	note(s, "* 산출 기준 · 출처 파일명·기준일 · 전제조건");
}

// ── 4. 1. 검토 배경 ───────────────────────────────────────────────────────
section("1. 검토 배경");
{
	const s = content("1. 검토 배경", ["[근거]에 따라 [기한]까지 ", { b: "[이행해야 할 사항]" }, " 이 필요함"]);
	const lw = 5.9, rx = MX + lw + 0.5, rw = CW - lw - 0.5;
	sub(s, "근거 · 기한 · 제재", "", MX, Y.top, lw);
	table(s, [
		[th("구분"), th("내용")],
		[cell("근거", { bold: true }), cell("[법령·사내 규정 조항]")],
		[cell("기한", { bold: true }), cell("’26.00.00", { fill: { color: C.accent3 } })],
		[cell("제재", { bold: true }), cell("[미이행 시 제재·영향]")],
	], MX, Y.top + 0.38, lw, [1.3, 4.6], 0.55);
	// 현행 프로세스: 기존 범위는 회색, 바꾸려는 범위는 노랑
	sub(s, "현행 프로세스와 한계", "(회색: 현행 유지 / 노랑: 개선 대상)", rx, Y.top, rw);
	const py = Y.top + 0.38, sw = (rw - 0.6) / 4;
	box(s, rx, py, sw * 2 + 0.3, 1.5, { fill: { color: C.background2 }, line: { color: C.background2, width: 0.75 } });
	box(s, rx + sw * 2 + 0.3, py, sw * 2 + 0.3, 1.5, { fill: { color: C.accent3 }, line: { color: C.accent3, width: 0.75 } });
	["① [단계]", "② [단계]", "③ [단계]", "④ [단계]"].forEach((t, i) => {
		const x = rx + 0.1 + i * (sw + 0.133);
		box(s, x, py + 0.2, sw - 0.1, 0.6);
		txt(s, t, x, py + 0.2, sw - 0.1, 0.6, { bold: true, align: "center" });
		txt(s, "[무엇을 하는지 한 줄]", x, py + 0.9, sw - 0.1, 0.4, { fontSize: PT.note, color: C.accent2, align: "center" });
	});
	badge(s, 1, rx, py + 1.75, rw, 0.62, "[키워드] 한계 1", "[원인 한 줄]");
	badge(s, 2, rx, py + 2.5, rw, 0.62, "[키워드] 한계 2", "[원인 한 줄]");
	note(s, "* 근거 조항 · 기준일 · 전제조건");
	close(s, "[그래서 무엇을 검토하는가 — 헤드메시지를 반복하지 않음]");
}

// ── 5~6. 2. 현황 분석 ─────────────────────────────────────────────────────
section("2. 현황 분석");
{
	// 좌: 숫자 / 우: 해석
	const s = content("2.1 현황 분석 (1/2)", ["[지표]가 A → B로 변화, ", { b: "[판단: 원인 또는 문제]" }, " 로 확인됨"]);
	unit(s, "[단위: 건]");
	const lw = 6.3, rx = MX + lw + 0.9, rw = CW - lw - 0.9;
	sub(s, "[좌: 숫자]", "(0000개점, ’26.01~06월 기준)", MX, Y.top, lw);
	s.addChart(pres.charts.BAR, [{ name: "실적", labels: ["전년", "비교", "당해"], values: [3, 4, 5] }], {
		x: MX, y: Y.top + 0.38, w: lw, h: 3.9, barDir: "col",
		chartColors: [HEX.lt1, HEX.accent6, HEX.dk2], dataBorder: { pt: 0.75, color: HEX.accent2 }, showLegend: false, showValue: true, dataLabelPosition: "outEnd",
		dataLabelFontSize: PT.body, dataLabelFontFace: "+mn-lt", dataLabelColor: HEX.dk1,
		catAxisLabelFontSize: PT.body, catAxisLabelFontFace: "+mn-lt", catAxisLabelColor: HEX.dk1,
		valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
		plotArea: { border: { pt: 0.75, color: HEX.dk1 } },
	});
	txt(s, "‥▶", MX + lw + 0.1, Y.top + 2.1, 0.7, 0.4, { fontSize: PT.head, color: C.accent2, align: "center" });
	sub(s, "[우: 해석]", "", rx, Y.top, rw);
	[1, 2, 3].forEach((n, i) => badge(s, n, rx, Y.top + 0.38 + i * 1.33, rw, 1.23, `[키워드] 원인 ${n}`, "[개선 방향 한 줄]"));
	note(s, "* 차트 막대: 전년=흰색, 비교=회색, 당해·강조=남색 / 출처: [파일명], [기준일] / 차트 값은 예시이므로 교체");
	close(s, "[그래서 무엇을 하는가]");
}
{
	// 차트 위 · 실적표 아래
	const s = content("2.2 현황 분석 (2/2)", ["[기간] 누적 실적 [값], ", { b: "목표 대비 [달성률]" }, " 수준임"]);
	unit(s, "[단위: %]");
	const labels = ["1월", "2월", "3월", "4월", "5월", "6월"];
	s.addChart(pres.charts.LINE, [
		{ name: "목표", labels, values: [4, 4, 5, 5, 6, 6] },
		{ name: "실적", labels, values: [3, 4, 4, 5, 5, 6] },
	], {
		x: MX, y: Y.top, w: CW, h: 2.5, chartColors: [HEX.accent2, HEX.dk2], lineSize: 2, lineDataSymbolSize: 6, dataLabelFontSize: PT.body, dataLabelFontFace: "+mn-lt",
		showLegend: true, legendPos: "t", legendFontSize: PT.body, legendFontFace: "+mn-lt",
		catAxisLabelFontSize: PT.body, catAxisLabelFontFace: "+mn-lt", catAxisLabelColor: HEX.dk1,
		valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
	});
	const cw = [1.63].concat(labels.map(() => 1.5)).concat([1.7]);
	const row = (name, o = {}) => [cell(name, { bold: true })].concat(labels.map(() => cell("0", Object.assign({ align: "right" }, o)))).concat([cell("0", { align: "right", bold: true, color: C.accent1 })]);
	table(s, [
		[th("구분")].concat(labels.map(th)).concat([th("합계")]),
		row("목표", { color: C.accent1 }),
		row("실적"),
		row("달성률"),
		row("전년비"),
	], MX, Y.top + 2.62, CW, cw, 0.37);
	note(s, "* 목표는 점선, 실적은 실선으로 표기 / 증감은 괄호 안 부호 (+0), %p / 출처: [파일명], [기준일] / 차트 값은 예시이므로 교체");
	close(s, "[그래서 무엇을 하는가]");
}

// ── 7~8. 3. 개선 방안 ─────────────────────────────────────────────────────
section("3. 개선 방안");
{
	const s = content("3.1 개선 방안 — 대안 비교", ["요건 [n]가지를 기준으로 비교한 결과 ", { b: "[권고안]" }, " 을 권고함"]);
	const y0 = Y.top;
	sub(s, "요건 → 대안 비교 → 권고", "(기준 → 사실 → 확인 필요 순)", MX, y0, CW);
	const rec = { fill: { color: C.accent5 } };
	table(s, [
		[th("비교 기준(요건)"), th("대안 A"), th("대안 B (권고)"), th("확인 필요")],
		[cell("[요건 1]", { bold: true }), cell("[확인된 사실]"), cell("[확인된 사실]", rec), cell("[미확인 사항]")],
		[cell("[요건 2]", { bold: true }), cell("[확인된 사실]"), cell("[확인된 사실]", rec), cell("-")],
		[cell("[요건 3]", { bold: true }), cell("[확인된 사실]"), cell("[확인된 사실]", rec), cell("-")],
		[cell("[요건 4]", { bold: true }), cell("[확인된 사실]"), cell("[확인된 사실]", rec), cell("[미확인 사항]")],
		[cell("종합", { bold: true }), cell("[판단]", { bold: true }), cell("[판단] — 권고", { bold: true, color: C.accent1, fill: { color: C.accent5 } }), cell("")],
	], MX, y0 + 0.38, CW, [2.6, 3.4, 3.4, 2.93], 0.55);
	note(s, "* 두 대안 모두 미확인인 행은 우열 근거로 쓰지 않음 / 사내 규정과 다르게 제안하면 \"조정안\"임을 표기");
	close(s, "[권고안]으로 추진하고자 함");
}
{
	// 분기 그리드 로드맵 + 좌측 조직 라벨 (일정은 표 대신 그리드)
	const s = content("3.2 개선 방안 — 역할 분담 · 추진 일정", ["’27.0Q까지 ", { b: "[완료 목표]" }, " 를 마치겠음"]);
	const lx = MX, lw = 2.3, gx = MX + lw + 0.2, gw = CW - lw - 0.2, qw = gw / 6, y0 = Y.top;
	const qs = ["2Q", "3Q", "4Q", "1Q", "2Q", "3Q"];
	[["’26년", 0, 3], ["’27년", 3, 3]].forEach(([t, i, n]) => {
		s.addShape(pres.ShapeType.rect, { x: gx + i * qw, y: y0, w: n * qw, h: 0.36, fill: { color: C.text2 }, line: { color: C.background1, width: 1.5 } });
		txt(s, t, gx + i * qw, y0, n * qw, 0.36, { bold: true, color: C.background1, align: "center" });
	});
	qs.forEach((q, i) => {
		box(s, gx + i * qw, y0 + 0.36, qw, 0.32, { fill: { color: C.background2 } });
		txt(s, q, gx + i * qw, y0 + 0.36, qw, 0.32, { bold: true, color: C.text2, align: "center" });
	});
	const rows = [
		["안전보건팀", "[무엇을] · 최초 1회", 0, 2, C.accent5],
		["[유관부서 1]", "[무엇을] · 매년 12월", 1, 3, C.accent5],
		["[유관부서 2]", "[무엇을] · 매월", 2, 3, C.accent3],
		["매장·사업장", "[무엇을] · 반기 1회", 3, 3, C.accent3],
	];
	const rh = 0.82;
	rows.forEach(([org, what, st, len, col], r) => {
		const y = y0 + 0.78 + r * rh;
		box(s, lx, y + 0.1, lw, rh - 0.2, { line: { color: C.text1, width: 1 } });
		txt(s, org, lx, y + 0.1, lw, rh - 0.2, { bold: true, align: "center" });
		qs.forEach((_, i) => box(s, gx + i * qw, y, qw, rh));
		s.addShape(pres.ShapeType.rect, { x: gx + st * qw + 0.08, y: y + 0.2, w: len * qw - 0.16, h: rh - 0.4, fill: { color: col }, line: { color: col, width: 0.75 } });
		txt(s, what, gx + st * qw + 0.18, y + 0.2, len * qw - 0.36, rh - 0.4, {});
	});
	// ’26 | ’27 굵은 세로선
	s.addShape(pres.ShapeType.line, { x: gx + 3 * qw, y: y0, w: 0, h: 0.78 + rows.length * rh, line: { color: C.text1, width: 2 } });
	note(s, "* 역할은 무엇을 · 언제 · 얼마나 자주(최초 1회 / 매년 12월 / 매월)로 기재 / 승인 전 금액은 기재하지 않음");
	close(s, "[의사결정 요청 ①②] 승인 시 ’26.00부터 착수하겠음");
}

// ── 9. #첨부 ─────────────────────────────────────────────────────────────
section("#첨부");
{
	const s = content("#첨부 1. [근거 자료 제목]", ["[본문 0.0절 주장]의 근거 — ", { b: "[이 자료가 말하는 결론]" }]);
	unit(s, "[단위: 개]");
	const c = (t, o) => cell(t, o);
	table(s, [
		[th("No."), th("항목"), th("기준"), th("현황"), th("비고")],
		...[1, 2, 3, 4, 5, 6].map((n) => [c(String(n), { align: "center" }), c("[항목]"), c("[기준]"), c("[현황]", n === 2 ? { fill: { color: C.accent3 } } : {}), c("")]),
		[c("합계", { bold: true, align: "center" }), c("", { bold: true }), c("", { bold: true }), c("0", { bold: true, color: C.accent1 }), c("")],
	], MX, Y.top, CW, [0.9, 3.6, 3.2, 2.6, 2.03], 0.5);
	note(s, "※ 첨부는 본문 주장의 근거일 때만 넣음 / 출처: [파일명], [기준일] / 집계 범위: [전사·일부 사업장]");
	close(s, "[이 자료에서 확인되는 결론 한 줄]");
}

// ── (숨김) 참고 ───────────────────────────────────────────────────────────
section("(숨김) 참고");
{
	const s = content("(참고) 예상 질문과 답변 요지", ["내부 준비용 — ", { b: "슬라이드 숨기기" }, " 상태로 둠"], { hidden: true });
	s.hidden = true;
	table(s, [
		[th("No."), th("예상 질문"), th("답변 요지"), th("근거 장표")],
		...[1, 2, 3, 4, 5].map((n) => [cell(String(n), { align: "center" }), cell("[질문]"), cell("[답변: 확인된 사실만 단정, 미확인은 \"확인 필요\"]"), cell("[0.0 / #첨부 0]")]),
	], MX, Y.top, CW, [0.9, 3.9, 5.5, 2.03], 0.6);
	note(s, "* 첨부를 빼면 목차 · 본문의 첨부 참조 · 쪽수 · 이 참고 장표를 함께 고침");
}

const out = process.argv[2] || path.join(__dirname, "..", "report", "CLAUDE_아성다이소_보고서_틀.pptx");
pres.writeFile({ fileName: out }).then(async (f) => {
	// 테마 색 기록 (pptx 스킬의 apply_theme.js 경로를 APPLY_THEME 환경변수로 전달)
	if (process.env.APPLY_THEME) await require(process.env.APPLY_THEME).applyTheme(f, THEME);
	// 한글(동아시아) 테마 글꼴도 맑은 고딕으로 지정 — pptxgenjs는 영문(latin)만 기록함
	const JSZip = require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));
	const zip = await JSZip.loadAsync(fs.readFileSync(f));
	const part = "ppt/theme/theme1.xml";
	const xml = (await zip.file(part).async("string")).replace(/<a:ea typeface=""\/>/g, `<a:ea typeface="${THEME.bodyFontFace}"/>`);
	const clean = new JSZip(); // 폴더 항목 없이 파일만 다시 담음
	for (const [name, entry] of Object.entries(zip.files)) {
		if (entry.dir) continue;
		let data = name === part ? xml : await entry.async("nodebuffer");
		if (/^ppt\/charts\/chart\d+\.xml$/.test(name)) {
			// 목표 계열만 점선으로 (pptxgenjs는 계열별 선 종류를 지원하지 않음)
			data = data.toString("utf8").replace(/(<c:v>목표<\/c:v>[\s\S]*?<a:prstDash val=")solid"/, '$1dash"');
			// 차트 글자도 테마 글꼴로, 막대(점)에는 회색 테두리 — 흰색 "전년" 막대가 보이도록
			data = data.replace(/typeface="Arial"/g, 'typeface="+mn-lt"')
				.replace(/(<c:dPt>[\s\S]*?<\/a:solidFill>)(<a:effectLst\/>)/g, `$1<a:ln w="9525"><a:solidFill><a:srgbClr val="${THEME.colors.accent2}"/></a:solidFill></a:ln>$2`);
		}
		clean.file(name, data, { createFolders: false });
	}
	fs.writeFileSync(f, await clean.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
	console.log("saved", f);
});
