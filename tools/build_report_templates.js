// CLAUDE 아성다이소 보고서 틀 02~06 생성기 (안전관리자 업무별)
// 02 비상대응훈련 결과 / 03 위험성평가 결과 / 04 사고 조사 / 05 안전점검 결과 / 06 월간 안전보건 활동 실적
// 실행: NODE_PATH=<pptxgenjs가 설치된 node_modules> APPLY_THEME=<pptx 스킬>/scripts/apply_theme.js \
//       node tools/build_report_templates.js [출력 폴더]
const path = require("path");
const { createDeck } = require("./report_lib");

const OUT = process.argv[2] || path.join(__dirname, "..", "report");
const range = (n) => Array.from({ length: n }, (_, i) => i + 1);
const EX = "차트 값은 예시이므로 교체";

// ── 02 비상대응훈련 결과 보고 ─────────────────────────────────────────────
function drill() {
	const d = createDeck("CLAUDE 비상대응훈련 결과 보고 틀");
	const { C, HEX, MX, CW, Y } = d;
	d.section("표지·목차");
	d.cover("’26년 [상/하]반기 비상대응훈련 결과 보고", "[훈련 주제] 훈련 실시 결과와 미흡사항 개선 조치");
	d.toc(["0. 보고 요약", "1. 훈련 개요", "2. 실시 결과", "3. 개선 조치 · 향후 계획"], ["#첨부 1. 매장별 실시 현황"]);

	d.section("0. 보고 요약");
	{
		// 전체 구조 한 장: 대상 → 실시 결과 → 미흡·개선 → 향후 일정
		const s = d.content("0. 보고 요약", ["대상 [n]개점 중 [n]개점 실시(실시율 [n]%), ", { b: "[미흡 항목] 보완" }, " 후 ’27.0Q 재훈련하겠음"]);
		const h = 4.1, gap = 0.45, ws = [2.6, 3.1, 3.1];
		const w4 = CW - ws.reduce((a, b) => a + b, 0) - gap * 3;
		let x = MX;
		const cols = [
			["대상", ["[영업부 n개]", "[대상 매장 n개점]", "1~2인 매장 제외"]],
			["실시 결과", ["실시 [n]개점 / 실시율 [n]%", "참여 인원 [n]명", "평가 적합 [n]개점"]],
			["미흡 · 개선", ["[미흡 항목 1] — [개선 방안]", "[미흡 항목 2] — [개선 방안]", "[미흡 항목 3] — [개선 방안]"]],
		];
		cols.forEach(([head, items], i) => {
			const b = d.card(s, x, Y.top, ws[i], h, head);
			d.bullets(s, items, b.x, b.y, b.w, b.h - 0.2);
			x += ws[i];
			d.arrow(s, x - 0.08, Y.top + h / 2 - 0.2);
			x += gap;
		});
		// 향후 일정: 점 찍힌 세로 타임라인
		const b = d.card(s, x, Y.top, w4, h, "향후 일정");
		const steps = [["’26.00", "결과 보고"], ["’26.00", "미흡 매장 재교육"], ["’27.00", "개선 확인"], ["’27.00", "재훈련"]];
		s.addShape(d.pres.ShapeType.line, { x: b.x + 0.12, y: b.y + 0.25, w: 0, h: (steps.length - 1) * 0.8, line: { color: C.accent6, width: 1 } });
		steps.forEach(([t, what], i) => {
			s.addShape(d.pres.ShapeType.ellipse, { x: b.x + 0.04, y: b.y + 0.17 + i * 0.8, w: 0.16, h: 0.16, fill: { color: C.text2 }, line: { color: C.text2, width: 0.75 } });
			d.txt(s, [{ text: t, options: { bold: true, breakLine: true } }, { text: what, options: { color: C.accent2 } }], b.x + 0.35, b.y + i * 0.8, b.w - 0.35, 0.55);
		});
		d.note(s, "* 실시율 = 실시 매장 ÷ 대상 매장 / 출처: 비상대응훈련 앱 제출·승인 현황, [기준일]");
	}

	d.section("1. 훈련 개요");
	{
		const s = d.content("1. 훈련 개요", ["[근거]에 따라 [훈련 주제] 훈련을 ", { b: "전 매장 [n]개점" }, " 대상으로 실시함"]);
		const lw = 5.6, rx = MX + lw + 0.5, rw = CW - lw - 0.5;
		d.sub(s, "훈련 개요", "", MX, Y.top, lw);
		const c = d.cell;
		d.table(s, [
			[d.th("구분"), d.th("내용")],
			[c("근거", { bold: true }), c("[법령 · 사내 비상대응 절차서 조항]")],
			[c("주제", { bold: true }), c("[훈련 주제 — 예: CPR · 응급환자 대응]")],
			[c("기간", { bold: true }), c("’26.00.00 ~ ’26.00.00", { fill: { color: C.accent3 } })],
			[c("대상", { bold: true }), c("[대상 매장 · 인원]")],
			[c("방법", { bold: true }), c("[훈련계획 → 사전교육 → 실행기록 → 서명 → 제출]")],
			[c("평가", { bold: true }), c("[평가 기준 · 평가자]")],
		], MX, Y.top + 0.38, lw, [1.2, 4.4], 0.52);
		d.sub(s, "훈련 시나리오", "(노랑: 이번 훈련 중점 평가 구간)", rx, Y.top, rw);
		d.process(s, rx, Y.top + 0.38, rw, [["① 상황 발생", "[상황 한 줄]"], ["② 신고 · 전파", "[119 신고 · 사내 전파]"], ["③ 응급처치", "[CPR · AED 사용]"], ["④ 인계 · 보고", "[구급대 인계 · 보고]"]], 2);
		d.tag(s, rx + rw - 1.25, Y.top - 0.12);
		d.badge(s, 1, rx, Y.top + 2.1, rw, 0.62, "[키워드] 중점 평가 1", "[무엇을 확인하는지 한 줄]");
		d.badge(s, 2, rx, Y.top + 2.85, rw, 0.62, "[키워드] 중점 평가 2", "[무엇을 확인하는지 한 줄]");
		d.note(s, "* 대상에서 제외한 매장과 그 기준을 각주로 밝힘 (예: 1~2인 매장 제외)");
		d.close(s, "[이번 보고에서 다루는 범위 — 헤드메시지를 반복하지 않음]");
	}

	d.section("2. 실시 결과");
	{
		// 차트 위 · 실적표 아래
		const s = d.content("2.1 실시 결과 (1/2)", ["영업부별 실시율 [n]~[n]%, ", { b: "[영업부] 실시율 최저" }, " 로 확인됨"]);
		d.unit(s, "[단위: %]");
		const labels = range(6).map((i) => `[영업부${i}]`);
		d.bar(s, MX, Y.top, CW, 2.4, labels, [92, 85, 97, 78, 88, 95], [HEX.dk2]);
		const cw = [1.63, ...labels.map(() => 1.5), 1.7];
		const row = (name, o = {}) => [d.cell(name, { bold: true }), ...labels.map(() => d.cell("0", Object.assign({ align: "right" }, o))), d.cell("0", { align: "right", bold: true, color: C.accent1 })];
		d.table(s, [[d.th("구분"), ...labels.map(d.th), d.th("합계")], row("대상 매장"), row("실시 매장"), row("실시율(%)"), row("전년비(%p)")], MX, Y.top + 2.52, CW, cw, 0.37);
		d.note(s, `* 증감은 괄호 안 부호 (+0) / 출처: 비상대응훈련 앱 제출 현황, [기준일] / ${EX}`);
		d.close(s, "[실시율이 낮은 영업부에 무엇을 하는가]");
	}
	{
		// 표 → 원인 3박스
		const s = d.content("2.2 실시 결과 (2/2)", ["평가 항목 중 ", { b: "[항목] 미흡률 [n]%" }, " 로 가장 높음"]);
		d.unit(s, "[단위: 개점]");
		const lw = 6.4, rx = MX + lw + 0.9, rw = CW - lw - 0.9, c = d.cell;
		d.sub(s, "평가 항목별 결과", "([n]개점, ’26.00 기준)", MX, Y.top, lw);
		const items = ["신고 · 전파", "대피 유도", "CPR(가슴압박)", "AED 사용", "구급대 인계", "사후 보고"];
		const hot = { fill: { color: C.accent5 }, bold: true };
		d.table(s, [[d.th("평가 항목"), d.th("적합"), d.th("미흡"), d.th("미흡률(%)")],
			...items.map((t, i) => [c(t, { bold: true }), c("0", { align: "right" }), c("0", Object.assign({ align: "right" }, i === 3 ? hot : {})), c("0", Object.assign({ align: "right" }, i === 3 ? hot : {}))]),
		], MX, Y.top + 0.38, lw, [2.2, 1.4, 1.4, 1.4], 0.55);
		d.arrow(s, MX + lw + 0.15, Y.top + 1.9);
		d.sub(s, "미흡 원인", "", rx, Y.top, rw);
		[1, 2, 3].forEach((n, i) => d.badge(s, n, rx, Y.top + 0.38 + i * 1.25, rw, 1.12, `[키워드] 원인 ${n}`, "[개선 방향 한 줄]"));
		d.note(s, "* 평가 기준: [평가표 이름] / 출처: 실행기록 평가 결과, [기준일]");
		d.close(s, "[미흡 항목을 어떻게 보완하는가]");
	}

	d.section("3. 개선 조치 · 향후 계획");
	{
		const s = d.content("3. 개선 조치 · 향후 계획", ["’27.0Q까지 ", { b: "미흡 매장 재교육 · 재훈련" }, " 을 마치겠음"]);
		d.grid(s, MX, Y.top, CW, [["’26년", 0, 2], ["’27년", 2, 3]], ["3Q", "4Q", "1Q", "2Q", "3Q"], [
			["안전보건팀", "[결과 분석 · 보고] · 최초 1회", 0, 2, C.accent5],
			["영업부", "[미흡 매장 재교육] · 분기 1회", 1, 2, C.accent5],
			["매장 · 점장", "[개선 조치 · 확인] · 매월", 1, 3, C.accent3],
			["전 매장", "[재훈련 실시] · 반기 1회", 3, 2, C.accent3],
		], { divider: 2 });
		d.note(s, "* 역할은 무엇을 · 언제 · 얼마나 자주(최초 1회 / 분기 / 매월)로 기재");
		d.close(s, "’27.0Q 재훈련 결과를 ’27.00 보고하겠음");
	}

	d.section("#첨부");
	{
		const s = d.content("#첨부 1. 매장별 실시 현황", ["[본문 2.1절 실시율]의 근거 — ", { b: "미실시 매장 [n]개점" }]);
		d.unit(s, "[단위: 명]");
		const c = d.cell;
		d.table(s, [[d.th("No."), d.th("영업부"), d.th("매장명"), d.th("실시일"), d.th("참여 인원"), d.th("평가 결과"), d.th("비고")],
			...range(7).map((n) => [c(String(n), { align: "center" }), c("[영업부]"), c("[매장명]"), c("’26.00.00"), c("0", { align: "right" }), c(n === 3 ? "미흡" : "적합", n === 3 ? { fill: { color: C.accent3 } } : {}), c("")]),
			[c("합계", { bold: true, align: "center" }), c(""), c(""), c(""), c("0", { bold: true, align: "right", color: C.accent1 }), c(""), c("")],
		], MX, Y.top, CW, [0.8, 1.8, 2.8, 1.8, 1.6, 1.6, 1.93], 0.5);
		d.note(s, "※ 출처: 비상대응훈련 앱 제출 · 승인 현황, [기준일] / 집계 범위: [전사 · 일부 영업부]");
		d.close(s, "[이 목록에서 확인되는 결론 한 줄]");
	}
	d.qa(["미실시 매장은 언제 실시하는가?", "미흡 항목의 원인은 무엇인가?", "재훈련 대상 기준은?", "전년 대비 무엇이 달라졌는가?", "[예상 질문]"]);
	return d.save(path.join(OUT, "CLAUDE_아성다이소_보고서_틀_02_비상대응훈련_결과.pptx"));
}

// ── 03 위험성평가 결과 보고 ───────────────────────────────────────────────
function risk() {
	const d = createDeck("CLAUDE 위험성평가 결과 보고 틀");
	const { C, HEX, MX, CW, Y, pres } = d;
	d.section("표지·목차");
	d.cover("’26년 [상/하]반기 위험성평가 결과 보고", "[근거: 산업안전보건법 제36조 · 사업장 위험성평가에 관한 지침] 평가 결과와 감소대책");
	d.toc(["0. 보고 요약", "1. 평가 개요", "2. 평가 결과", "3. 감소대책 이행 계획"], ["#첨부 1. 위험요인 전체 목록"]);

	d.section("0. 보고 요약");
	{
		// ■현황 / ■개선방안 / ■기대효과 3단 + 통합 결론
		const s = d.content("0. 보고 요약", ["위험요인 [n]건 중 허용불가 [n]건, ", { b: "감소대책 [n]건" }, " 을 ’27.0Q까지 이행하겠음"]);
		const gap = 0.3, w = (CW - gap * 2) / 3, h = 2.9;
		[
			["■ 현황", ["평가 매장 [n]개점, 위험요인 [n]건", "허용불가(상 · 중) [n]건 ([n]%)", "상위 위험: [작업] — [위험요인]"]],
			["■ 개선 방안", ["[대책 1] — [대상 작업]", "[대책 2] — [대상 작업]", "[대책 3] — [대상 작업]"]],
			["■ 기대 효과", ["허용불가 [n]건 → [n]건", "[지표] [n] → [n]", "[기대 효과 한 줄]"]],
		].forEach(([head, items], i) => {
			const x = MX + i * (w + gap);
			const b = d.card(s, x, Y.top, w, h, head);
			d.bullets(s, items, b.x, b.y, b.w, b.h);
		});
		const yd = Y.top + h + 0.25;
		d.fill(s, MX, yd, CW, 0.62, C.background2);
		d.txt(s, [{ text: "종합  ", options: { bold: true, color: C.text2 } }, { text: "[현황 → 방안 → 효과를 잇는 통합 결론 문단 1~2줄]" }], MX + 0.2, yd, CW - 0.4, 0.62);
		d.txt(s, [{ text: "의사결정 요청  ", options: { bold: true, color: C.accent1 } }, { text: "① [감소대책 예산 · 일정]을 승인하시겠습니까?" }], MX + 0.2, yd + 0.72, CW - 0.4, 0.4);
		d.note(s, "* 허용불가 = 위험성 [n]점 이상 (빈도 × 강도) / 출처: 위험성평가 앱 승인 현황, [기준일]");
	}

	d.section("1. 평가 개요");
	{
		const s = d.content("1. 평가 개요", ["[대상] [n]개점을 대상으로 ", { b: "[평가 방법]" }, " 으로 평가함"]);
		const lw = 5.4, rx = MX + lw + 0.5, rw = CW - lw - 0.5, c = d.cell;
		d.sub(s, "평가 개요", "", MX, Y.top, lw);
		d.table(s, [[d.th("구분"), d.th("내용")],
			[c("대상", { bold: true }), c("[영업부 · 매장 · 물류센터]")],
			[c("기간", { bold: true }), c("’26.00.00 ~ ’26.00.00", { fill: { color: C.accent3 } })],
			[c("방법", { bold: true }), c("[빈도 × 강도 / 체크리스트 등]")],
			[c("참여", { bold: true }), c("[점장 · 근로자 · 관리감독자]")],
			[c("척도", { bold: true }), c("[빈도 n단계 × 강도 n단계]")],
			[c("허용 기준", { bold: true }), c("[n]점 이상 허용불가")],
		], MX, Y.top + 0.38, lw, [1.3, 4.1], 0.52);
		d.sub(s, "평가 절차", "(노랑: 금일 보고 범위)", rx, Y.top, rw);
		d.process(s, rx, Y.top + 0.38, rw, [["① 사전 준비", "[대상 · 자료 수집]"], ["② 위험요인 파악", "[작업별 위험요인]"], ["③ 위험성 결정", "[빈도 × 강도]"], ["④ 감소대책", "[수립 · 실행 · 확인]"]], 2);
		d.tag(s, rx + rw - 1.25, Y.top - 0.12);
		d.badge(s, 1, rx, Y.top + 2.1, rw, 0.62, "[키워드] 이번 회차 변경점 1", "[무엇이 달라졌는지 한 줄]");
		d.badge(s, 2, rx, Y.top + 2.85, rw, 0.62, "[키워드] 이번 회차 변경점 2", "[무엇이 달라졌는지 한 줄]");
		d.note(s, "* 근거 조항 · 사내 위험성평가 절차서 [조항]");
		d.close(s, "금일은 ③ 위험성 결정과 ④ 감소대책만 다룸");
	}

	d.section("2. 평가 결과");
	{
		// 건수 분해 워터폴: 전체 → 허용불가 → 감소대책 대상
		const s = d.content("2.1 위험요인 분포", ["위험요인 [n]건 중 ", { b: "감소대책 대상 [n]건" }, " 으로 압축됨"]);
		d.unit(s, "[단위: 건]");
		const bx = MX + 0.3, bw = 1.2, base = Y.top + 4.0, full = 3.4;
		const col = (i, parts, label) => {
			let top = base;
			parts.forEach(([ratio, color, t]) => {
				const hh = full * ratio;
				top -= hh;
				d.box(s, bx + i * 1.9, top, bw, hh, color ? { fill: { color }, line: { color: C.accent2, width: 0.75 } } : { line: { color: C.accent2, width: 0.75 } });
				d.txt(s, t, bx + i * 1.9, top, bw, hh, { fontSize: PT_NOTE, align: "center", bold: !!color, color: color === C.text2 ? C.background1 : C.text1 });
			});
			d.txt(s, label, bx + i * 1.9 - 0.2, base + 0.08, bw + 0.4, 0.3, { bold: true, align: "center" });
		};
		const PT_NOTE = d.PT.note;
		col(0, [[1, null, "[n]건"]], "전체 위험요인");
		col(1, [[0.7, null, "허용가능\n[n]건"], [0.3, C.accent5, "허용불가\n[n]건"]], "위험성 결정");
		col(2, [[0.75, null, ""], [0.12, C.accent5, "중 [n]건"], [0.13, C.text2, "상 [n]건"]], "등급");
		const rx = MX + 6.4, rw = CW - 6.4;
		const conn = (y1, y2) => s.addShape(pres.ShapeType.line, { x: bx + 2 * 1.9 + bw + 0.05, y: y1, w: rx - (bx + 2 * 1.9 + bw + 0.05), h: y2 - y1, line: { color: C.accent2, width: 1, dashType: "dash" } });
		const r1 = Y.top + 0.6, r2 = Y.top + 1.6, r3 = Y.top + 2.8;
		conn(base - full + full * 0.13 / 2, r1 + 0.3); // 상 블록 중앙 → 상 박스
		conn(base - full + full * 0.13 + full * 0.12 / 2, r2 + 0.3); // 중 블록 중앙 → 중 박스
		d.box(s, rx, r1, rw, 0.6);
		d.txt(s, [{ text: "상 [n]건 ([n]%)  ", options: { bold: true } }, { text: "→ [즉시 개선 대상 한 줄]" }], rx + 0.15, r1, rw - 0.3, 0.6);
		d.box(s, rx, r2, rw, 0.6);
		d.txt(s, [{ text: "중 [n]건 ([n]%)  ", options: { bold: true } }, { text: "→ [관리 방안 한 줄]" }], rx + 0.15, r2, rw - 0.3, 0.6);
		d.fill(s, rx, r3, rw, 0.8, C.text2);
		d.txt(s, "감소대책 대상 [n]건 — 상 [n] + 중 [n]", rx, r3, rw, 0.8, { fontSize: d.PT.section, bold: true, color: C.background1, align: "center" });
		d.note(s, "* 막대 높이는 예시 비율이므로 실제 건수 비율로 조정 / 출처: 위험성평가 앱, [기준일]");
		d.close(s, "[감소대책 대상을 어떻게 이행하는가]");
	}
	{
		const s = d.content("2.2 상위 위험요인", ["상위 위험요인은 ", { b: "[작업] — [위험요인]" }, " 에 집중됨"]);
		const c = d.cell, hi = { fill: { color: C.accent5 }, bold: true, color: C.accent1, align: "center" }, mid = { fill: { color: C.accent3 }, align: "center" };
		d.table(s, [[d.th("No."), d.th("작업 · 공정"), d.th("위험요인"), d.th("빈도"), d.th("강도"), d.th("위험성"), d.th("등급"), d.th("현재 안전조치")],
			...range(7).map((n) => [c(String(n), { align: "center" }), c("[작업]"), c("[위험요인 — 예: 적재물 낙하]"), c("0", { align: "center" }), c("0", { align: "center" }), c("0", { align: "center" }), c(n <= 3 ? "상" : "중", n <= 3 ? hi : mid), c("[현재 조치]")]),
		], MX, Y.top, CW, [0.7, 1.9, 3.3, 0.8, 0.8, 1.0, 0.9, 2.93], 0.55);
		d.note(s, "* 위험성 = 빈도 × 강도 / 등급 음영: 상=파랑, 중=노랑 / 출처: [파일명], [기준일]");
		d.close(s, "상위 [n]건은 ’26.00까지 즉시 개선하겠음");
	}

	d.section("3. 감소대책 이행 계획");
	{
		const s = d.content("3. 감소대책 이행 계획", ["감소대책 [n]건 중 ", { b: "[n]건 ’26년 내 완료" }, ", 나머지는 ’27.0Q 완료하겠음"]);
		const c = d.cell;
		const st = (t) => c(t, t === "완료" ? { align: "center", color: C.accent1, bold: true } : t === "진행" ? { align: "center", fill: { color: C.accent3 } } : { align: "center" });
		d.table(s, [[d.th("No."), d.th("위험요인"), d.th("감소대책"), d.th("구분"), d.th("담당"), d.th("기한"), d.th("상태")],
			...range(6).map((n) => [c(String(n), { align: "center" }), c("[위험요인]"), c("[감소대책 — 무엇을 어떻게]"), c(n <= 2 ? "공학적" : "관리적", { align: "center" }), c("[부서]", { align: "center" }), c("’26.00", { align: "center" }), st(["완료", "진행", "진행", "예정", "예정", "예정"][n - 1])]),
		], MX, Y.top, CW, [0.7, 2.6, 4.1, 1.2, 1.3, 1.2, 1.23], 0.55);
		d.note(s, "* 감소대책 우선순위: 제거 → 대체 → 공학적 → 관리적 → 보호구 / 승인 전 금액은 기재하지 않음");
		d.close(s, "[의사결정 요청 ①] 승인 시 ’26.00부터 착수하겠음");
	}

	d.section("#첨부");
	{
		const s = d.content("#첨부 1. 위험요인 전체 목록", ["[본문 2.1절 분포]의 근거 — ", { b: "전체 [n]건" }]);
		const c = d.cell;
		d.table(s, [[d.th("No."), d.th("영업부"), d.th("매장"), d.th("작업"), d.th("위험요인"), d.th("위험성"), d.th("등급")],
			...range(8).map((n) => [c(String(n), { align: "center" }), c("[영업부]"), c("[매장]"), c("[작업]"), c("[위험요인]"), c("0", { align: "center" }), c("[등급]", { align: "center" })]),
		], MX, Y.top, CW, [0.7, 1.6, 2.2, 2.0, 3.8, 1.0, 1.03], 0.48);
		d.note(s, "※ 출처: 위험성평가 앱 내보내기, [기준일] / 전체 목록은 엑셀 파일로 별도 첨부");
		d.close(s, "[이 목록에서 확인되는 결론 한 줄]");
	}
	d.qa(["허용 기준 점수는 왜 [n]점인가?", "상 등급이 많은 영업부는 어디인가?", "감소대책 예산은 얼마인가?", "전 회차 대비 무엇이 달라졌는가?", "[예상 질문]"]);
	return d.save(path.join(OUT, "CLAUDE_아성다이소_보고서_틀_03_위험성평가_결과.pptx"));
}

// ── 04 사고 조사 보고 ─────────────────────────────────────────────────────
function accident() {
	const d = createDeck("CLAUDE 사고 조사 보고 틀");
	const { C, MX, CW, Y, pres } = d;
	d.section("표지·목차");
	d.cover("[사업장명] [사고 유형] 사고 조사 보고", "’26.00.00 발생 사고의 원인 분석과 재발 방지 대책");
	d.toc(["0. 보고 요약", "1. 사고 개요", "2. 원인 분석", "3. 재발 방지 대책"], ["#첨부 1. 현장 사진"]);

	d.section("0. 보고 요약");
	{
		// 3칸 카드 + 칸마다 결론
		const s = d.content("0. 보고 요약", ["[작업] 중 [사고 유형] 발생, ", { b: "[핵심 원인]" }, " 이 직접 원인으로 확인됨"]);
		const gap = 0.3, w = (CW - gap * 2) / 3, h = 3.3;
		[
			["사고 개요", ["’26.00.00 00:00, [장소]", "[재해자 소속 · 직무]", "[상해 부위 · 정도 / 휴업 n일]"], "[사고 한 줄 요약]"],
			["발생 원인", ["직접: [불안전한 상태 · 행동]", "간접: [관리 · 교육 요인]", "근본: [제도 · 절차 요인]"], "[핵심 원인 한 줄]"],
			["재발 방지 대책", ["즉시: [조치]", "단기: [조치] (’26.00)", "중장기: [조치] (’27.00)"], "[전 매장 수평 전개]"],
		].forEach(([head, items, concl], i) => {
			const x = MX + i * (w + gap);
			const b = d.card(s, x, Y.top, w, h, head);
			d.bullets(s, items, b.x, b.y, b.w, 1.9);
			d.cardClose(s, b.x, Y.top + h - 0.8, b.w, concl);
		});
		d.box(s, MX, Y.top + h + 0.25, CW, 0.6);
		d.txt(s, [{ text: "의사결정 요청  ", options: { bold: true, color: C.accent1 } }, { text: "① [재발 방지 대책]의 전 매장 수평 전개를 승인하시겠습니까?" }], MX + 0.2, Y.top + h + 0.25, CW - 0.4, 0.6);
		d.note(s, "* 출처: 사고 조사서, 재해자 · 목격자 면담, 현장 확인 ([조사일])");
	}

	d.section("1. 사고 개요");
	{
		const s = d.content("1. 사고 개요", ["’26.00.00 [장소]에서 [작업] 중 ", { b: "[사고 유형]" }, " 발생"]);
		const lw = 6.2, rx = MX + lw + 0.5, rw = CW - lw - 0.5, c = d.cell;
		d.sub(s, "사고 개요", "", MX, Y.top, lw);
		d.table(s, [[d.th("구분"), d.th("내용")],
			[c("일시", { bold: true }), c("’26.00.00(요일) 00:00")],
			[c("장소", { bold: true }), c("[영업부] [매장명] [위치 — 예: 후방 창고]")],
			[c("재해자", { bold: true }), c("[소속 · 직무 · 근속 n개월] (개인정보 최소 기재)")],
			[c("상해", { bold: true }), c("[부위 · 정도 / 휴업 n일]", { fill: { color: C.accent3 } })],
			[c("작업 내용", { bold: true }), c("[사고 당시 하던 작업]")],
			[c("보고 · 신고", { bold: true }), c("[사내 보고 시각 / 관계기관 신고 여부]")],
		], MX, Y.top + 0.38, lw, [1.4, 4.8], 0.55);
		d.sub(s, "사고 경위", "(시각순)", rx, Y.top, rw);
		const steps = [["00:00", "[작업 시작]"], ["00:00", "[이상 상황]"], ["00:00", "[사고 발생]"], ["00:00", "[응급조치 · 이송]"], ["00:00", "[보고 · 현장 보존]"]];
		const ty = Y.top + 0.6;
		s.addShape(pres.ShapeType.line, { x: rx + 0.12, y: ty + 0.08, w: 0, h: (steps.length - 1) * 0.72, line: { color: C.accent6, width: 1 } });
		steps.forEach(([t, what], i) => {
			const col = i === 2 ? C.accent4 : C.text2; // 빨강은 사고 발생 시점 1곳
			s.addShape(pres.ShapeType.ellipse, { x: rx + 0.04, y: ty + i * 0.72, w: 0.16, h: 0.16, fill: { color: col }, line: { color: col, width: 0.75 } });
			d.txt(s, [{ text: t + "  ", options: { bold: true } }, { text: what }], rx + 0.4, ty - 0.1 + i * 0.72, rw - 0.4, 0.36);
		});
		d.note(s, "* 재해자 개인정보(성명 · 연락처)는 보고서에 쓰지 않음 / 출처: 사고 조사서, [조사일]");
		d.close(s, "[경위에서 확인되는 핵심 사실 한 줄]");
	}

	d.section("2. 원인 분석");
	{
		// 4M 2x2
		const s = d.content("2. 원인 분석 (4M)", ["직접 원인은 ", { b: "[불안전한 상태 · 행동]" }, ", 근본 원인은 [관리 요인] 임"]);
		const gap = 0.3, w = (CW - gap) / 2, h = 2.1;
		[
			["Man (사람)", ["[불안전한 행동 — 예: 보호구 미착용]", "[교육 · 숙련도]"]],
			["Machine (설비)", ["[설비 · 기구 결함]", "[방호장치 상태]"]],
			["Media (작업 방법 · 환경)", ["[작업 방법 · 순서]", "[통로 · 조명 · 적재 상태]"]],
			["Management (관리)", ["[절차서 · 점검 미흡]", "[관리감독 · 인원 배치]"]],
		].forEach(([head, items], i) => {
			const x = MX + (i % 2) * (w + gap), y = Y.top + Math.floor(i / 2) * (h + 0.2);
			const b = d.card(s, x, y, w, h, head);
			d.bullets(s, items, b.x, b.y, b.w, b.h);
		});
		d.note(s, "* 원인은 확인된 사실만 단정, 추정은 \"~로 추정\"으로 기재 / 출처: 면담 · 현장 확인, [조사일]");
		d.close(s, "[근본 원인]을 없애는 대책을 3장에 제시함");
	}

	d.section("3. 재발 방지 대책");
	{
		const s = d.content("3.1 재발 방지 대책", ["즉시 조치 [n]건 완료, ", { b: "단기 · 중장기 [n]건" }, " 을 ’27.0Q까지 이행하겠음"]);
		const c = d.cell;
		const rows = [["즉시", "[조치 — 예: 위험 구역 통제]", "[매장]", "완료"], ["즉시", "[조치]", "[매장]", "완료"], ["단기", "[조치 — 예: 적재 기준 개정]", "[안전보건팀]", "’26.00"], ["단기", "[조치]", "[영업부]", "’26.00"], ["중장기", "[조치 — 예: 설비 교체]", "[유관부서]", "’27.00"], ["중장기", "[조치]", "[유관부서]", "’27.00"]];
		d.table(s, [[d.th("구분"), d.th("대책"), d.th("대상 원인"), d.th("담당"), d.th("기한"), d.th("확인 방법")],
			...rows.map(([g, t, who, due]) => [c(g, Object.assign({ bold: true, align: "center" }, g === "즉시" ? { fill: { color: C.accent3 } } : {})), c(t), c("[4M 항목]", { align: "center" }), c(who, { align: "center" }), c(due, due === "완료" ? { align: "center", bold: true, color: C.accent1 } : { align: "center" }), c("[사진 · 점검표]")]),
		], MX, Y.top, CW, [1.2, 4.2, 1.6, 1.6, 1.3, 2.43], 0.55);
		d.note(s, "* 대책 우선순위: 제거 → 대체 → 공학적 → 관리적 → 보호구");
		d.close(s, "[대책 이행 후 무엇으로 효과를 확인하는가]");
	}
	{
		const s = d.content("3.2 수평 전개 일정", ["’27.0Q까지 ", { b: "전 매장 수평 전개" }, " 를 마치겠음"]);
		d.grid(s, MX, Y.top, CW, [["’26년", 0, 2], ["’27년", 2, 3]], ["3Q", "4Q", "1Q", "2Q", "3Q"], [
			["안전보건팀", "[사고 사례 전파 · 기준 개정] · 최초 1회", 0, 2, C.accent5],
			["해당 영업부", "[유사 매장 점검] · 월 1회", 1, 2, C.accent5],
			["전 매장", "[사례 교육 · 자체 점검] · 분기 1회", 1, 3, C.accent3],
			["관리감독자", "[이행 확인] · 반기 1회", 3, 2, C.accent3],
		], { divider: 2 });
		d.note(s, "* 역할은 무엇을 · 언제 · 얼마나 자주로 기재 / 승인 전 금액은 기재하지 않음");
		d.close(s, "[의사결정 요청 ①] 승인 시 ’26.00부터 착수하겠음");
	}

	d.section("#첨부");
	{
		const s = d.content("#첨부 1. 현장 사진", ["[본문 1장 경위 · 2장 원인]의 근거 — ", { b: "사고 지점과 개선 전후" }]);
		const gap = 0.3, w = (CW - gap * 2) / 3, h = 3.6;
		["[사진 1] 사고 지점", "[사진 2] 원인 설비 · 상태", "[사진 3] 개선 후"].forEach((t, i) => {
			const x = MX + i * (w + gap);
			d.fill(s, x, Y.top, w, h, C.background2);
			d.txt(s, "사진 넣는 자리", x, Y.top, w, h, { color: C.accent2, align: "center" });
			d.txt(s, t, x, Y.top + h + 0.08, w, 0.3, { bold: true, align: "center" });
		});
		d.note(s, "※ 얼굴 · 개인정보가 보이는 사진은 가림 처리 / 촬영일: ’26.00.00");
		d.close(s, "[사진에서 확인되는 결론 한 줄]");
	}
	d.qa(["같은 유형의 사고가 전에도 있었는가?", "재해자 치료 · 복귀 일정은?", "관계기관 신고 대상인가?", "다른 매장에도 같은 위험이 있는가?", "[예상 질문]"]);
	return d.save(path.join(OUT, "CLAUDE_아성다이소_보고서_틀_04_사고조사.pptx"));
}

// ── 05 안전점검 결과 보고 ─────────────────────────────────────────────────
function inspection() {
	const d = createDeck("CLAUDE 안전점검 결과 보고 틀");
	const { C, HEX, MX, CW, Y } = d;
	d.section("표지·목차");
	d.cover("’26년 [n]월 매장 안전점검 결과 보고", "[근거: 사내 안전점검 지침] 점검 결과와 지적사항 조치 현황");
	d.toc(["0. 보고 요약", "1. 점검 개요", "2. 점검 결과", "3. 지적사항 조치"], ["#첨부 1. 지적사항 목록"]);

	d.section("0. 보고 요약");
	{
		const s = d.content("0. 보고 요약", ["[n]개점 점검 결과 지적 [n]건, ", { b: "조치 완료율 [n]%" }, " 임"]);
		const gap = 0.3, w = (CW - gap * 3) / 4, h = 1.7;
		[["[n]개점", "점검 매장", "대상 [n]개점 중"], ["[n]건", "지적 건수", "매장당 [n]건"], ["[n]%", "조치 완료율", "완료 [n] / 전체 [n]건"], ["[n]개점", "반복 지적 매장", "직전 점검 대비"]]
			.forEach(([v, l, desc], i) => d.kpi(s, MX + i * (w + gap), Y.top, w, h, v, l, desc));
		const y2 = Y.top + h + 0.3, c = d.cell;
		d.sub(s, "분야별 요약", "", MX, y2, CW);
		d.table(s, [[d.th("분야"), d.th("주요 지적"), d.th("조치 방향")],
			[c("[분야 1]", { bold: true }), c("[주요 지적 내용]"), c("[조치 방향]", { fill: { color: C.accent5 } })],
			[c("[분야 2]", { bold: true }), c("[주요 지적 내용]"), c("[조치 방향]")],
			[c("[분야 3]", { bold: true }), c("[주요 지적 내용]"), c("[조치 방향]")],
		], MX, y2 + 0.38, CW, [2.0, 5.6, 4.73], 0.45);
		d.note(s, "* 조치 완료율 = 조치 완료 ÷ 전체 지적 / 출처: [점검 결과 파일], [기준일]");
	}

	d.section("1. 점검 개요");
	{
		const s = d.content("1. 점검 개요", ["[영업부] [n]개점을 대상으로 ", { b: "[n]개 분야 [n]개 항목" }, " 을 점검함"]);
		const lw = 5.6, rx = MX + lw + 0.5, rw = CW - lw - 0.5, c = d.cell;
		d.sub(s, "점검 개요", "", MX, Y.top, lw);
		d.table(s, [[d.th("구분"), d.th("내용")],
			[c("근거", { bold: true }), c("[사내 안전점검 지침 조항]")],
			[c("기간", { bold: true }), c("’26.00.00 ~ ’26.00.00", { fill: { color: C.accent3 } })],
			[c("대상", { bold: true }), c("[영업부 · 매장 n개점]")],
			[c("점검자", { bold: true }), c("[안전보건팀 · 영업부 관리감독자]")],
			[c("방법", { bold: true }), c("[현장 확인 · 체크리스트 · 사진]")],
		], MX, Y.top + 0.38, lw, [1.3, 4.3], 0.55);
		d.sub(s, "점검 항목 구성", "([n]개 항목)", rx, Y.top, rw);
		d.table(s, [[d.th("분야"), d.th("항목 수"), d.th("주요 확인 내용")],
			...[["소방", "화재 감지 · 소화기 · 비상구"], ["전기", "분전반 · 문어발 · 누전"], ["적재 · 통로", "적재 높이 · 통로 확보"], ["작업 장비", "사다리 · 대차 · 카트"], ["보건", "구급함 · 휴게 · 온열"]]
				.map(([a, b]) => [c(a, { bold: true }), c("0", { align: "center" }), c(b)]),
			[c("합계", { bold: true }), c("0", { align: "center", bold: true, color: C.accent1 }), c("")],
		], rx, Y.top + 0.38, rw, [1.6, 1.1, rw - 2.7], 0.48);
		d.note(s, "* 점검표: [점검표 이름 · 버전]");
		d.close(s, "[이번 점검에서 특히 본 분야 한 줄]");
	}

	d.section("2. 점검 결과");
	{
		const s = d.content("2.1 분야별 지적 현황", ["지적 [n]건 중 ", { b: "[분야] [n]건([n]%)" }, " 으로 가장 많음"]);
		d.unit(s, "[단위: 건]");
		const lw = 6.3, rx = MX + lw + 0.9, rw = CW - lw - 0.9;
		d.sub(s, "분야별 지적 건수", "([n]개점, ’26.00 기준)", MX, Y.top, lw);
		d.bar(s, MX, Y.top + 0.38, lw, 3.9, ["소방", "전기", "적재 · 통로", "작업 장비", "보건"], [12, 8, 21, 6, 4], [HEX.accent6, HEX.accent6, HEX.dk2, HEX.accent6, HEX.accent6]);
		d.arrow(s, MX + lw + 0.15, Y.top + 2.1);
		d.sub(s, "원인과 개선 방향", "", rx, Y.top, rw);
		[1, 2, 3].forEach((n, i) => d.badge(s, n, rx, Y.top + 0.38 + i * 1.33, rw, 1.23, `[키워드] 원인 ${n}`, "[개선 방향 한 줄]"));
		d.note(s, `* 강조 막대(남색) = 최다 지적 분야 / 출처: [점검 결과 파일], [기준일] / ${EX}`);
		d.close(s, "[최다 지적 분야에 무엇을 하는가]");
	}
	{
		const s = d.content("2.2 영업부별 지적 현황", ["매장당 지적은 ", { b: "[영업부] [n]건" }, " 으로 가장 많고, 조치율은 [영업부]가 가장 낮음"]);
		d.unit(s, "[단위: 개점, 건, %]");
		const c = d.cell, dark = { fill: { color: C.accent5 }, bold: true, align: "right" }, low = { fill: { color: C.accent3 }, align: "right" };
		const r = (n) => [c(`[영업부${n}]`, { bold: true }), c("0", { align: "right" }), c("0", { align: "right" }), c("0", n === 2 ? dark : { align: "right" }), c("0", { align: "right" }), c("0", n === 5 ? low : { align: "right" }), c("0", { align: "right" })];
		d.table(s, [[d.th("영업부"), d.th("점검 매장"), d.th("지적 건수"), d.th("매장당 건수"), d.th("조치 완료"), d.th("조치율(%)"), d.th("반복 지적 매장")],
			...range(6).map(r),
			[c("합계", { bold: true }), ...range(6).map(() => c("0", { align: "right", bold: true, color: C.accent1 }))],
		], MX, Y.top, CW, [2.0, 1.7, 1.7, 1.8, 1.7, 1.7, 1.73], 0.5);
		d.note(s, "* 음영: 파랑 = 매장당 건수 최다, 노랑 = 조치율 최저 / 출처: [점검 결과 파일], [기준일]");
		d.close(s, "[영업부별로 무엇을 요청하는가]");
	}

	d.section("3. 지적사항 조치");
	{
		const s = d.content("3. 지적사항 조치", ["조치 [n]건 완료, ", { b: "미조치 [n]건은 ’26.00까지" }, " 완료하겠음"]);
		d.sub(s, "조치 절차", "(노랑: 이번에 바꾸는 단계)", MX, Y.top, CW);
		d.process(s, MX, Y.top + 0.38, CW, [["① 지적", "[현장 지적 · 사진]"], ["② 통보", "[매장 · 영업부 통보]"], ["③ 조치", "[기한 내 조치 · 사진 등록]"], ["④ 확인", "[관리감독자 확인 · 종결]"]], 2);
		const c = d.cell, y2 = Y.top + 2.2;
		d.sub(s, "조치 현황", "([단위: 건])", MX, y2, CW);
		d.table(s, [[d.th("구분"), d.th("완료"), d.th("진행"), d.th("미착수"), d.th("합계"), d.th("완료율(%)")],
			...["소방", "전기", "적재 · 통로"].map((t, i) => [c(t, { bold: true }), c("0", { align: "right" }), c("0", { align: "right" }), c("0", Object.assign({ align: "right" }, i === 2 ? { fill: { color: C.accent3 } } : {})), c("0", { align: "right", bold: true, color: C.accent1 }), c("0", { align: "right" })]),
		], MX, y2 + 0.38, CW, [2.4, 2.0, 2.0, 2.0, 2.0, 1.93], 0.42);
		d.note(s, "* 조치 기한: 즉시 · 7일 · 30일 / 출처: [조치 현황 파일], [기준일]");
		d.close(s, "[미조치 건을 어떻게 마무리하는가]");
	}

	d.section("#첨부");
	{
		const s = d.content("#첨부 1. 지적사항 목록", ["[본문 2장 결과]의 근거 — ", { b: "지적 [n]건 전체" }]);
		const c = d.cell;
		d.table(s, [[d.th("No."), d.th("영업부"), d.th("매장"), d.th("분야"), d.th("지적 내용"), d.th("조치 기한"), d.th("상태")],
			...range(8).map((n) => [c(String(n), { align: "center" }), c("[영업부]"), c("[매장]"), c("[분야]", { align: "center" }), c("[지적 내용]"), c("’26.00.00", { align: "center" }), c(n === 4 ? "미착수" : "완료", n === 4 ? { align: "center", fill: { color: C.accent3 } } : { align: "center" })]),
		], MX, Y.top, CW, [0.7, 1.6, 2.0, 1.4, 4.2, 1.3, 1.13], 0.48);
		d.note(s, "※ 출처: [점검 결과 파일], [기준일] / 전체 목록은 엑셀 파일로 별도 첨부");
		d.close(s, "[이 목록에서 확인되는 결론 한 줄]");
	}
	d.qa(["반복 지적 매장은 어떻게 관리하는가?", "미조치 건의 사유는?", "직전 점검 대비 개선되었는가?", "점검표 항목은 적정한가?", "[예상 질문]"]);
	return d.save(path.join(OUT, "CLAUDE_아성다이소_보고서_틀_05_안전점검_결과.pptx"));
}

// ── 06 월간 안전보건 활동 실적 보고 ───────────────────────────────────────
function monthly() {
	const d = createDeck("CLAUDE 월간 안전보건 활동 실적 보고 틀");
	const { C, MX, CW, Y, pres } = d;
	d.section("표지·목차");
	d.cover("’26년 [n]월 안전보건 활동 실적 보고", "안전보건팀 월간 주요 지표, 활동 실적과 다음 달 계획");
	d.toc(["0. 보고 요약", "1. 주요 지표", "2. 활동 실적", "3. 이슈 및 조치", "4. 다음 달 계획"], ["#첨부 1. 세부 실적"]);

	d.section("0. 보고 요약");
	{
		// KPI 대비표 + "금일보고" 범위 태그
		const s = d.content("0. 보고 요약", ["[n]월 주요 지표 [n]개 중 [n]개 목표 달성, ", { b: "[미달 지표]" }, " 보완하겠음"]);
		const lw = 6.4, rx = MX + lw + 0.9, rw = CW - lw - 0.9, c = d.cell;
		d.sub(s, "주요 지표", "(’26년 [n]월 기준)", MX, Y.top, lw);
		const kpis = ["산업재해 건수", "위험성평가 완료율", "안전교육 이수율", "안전점검 조치율", "비상대응훈련 실시율"];
		d.table(s, [[d.th("지표"), d.th("목표"), d.th("실적"), d.th("달성률(%)")],
			...kpis.map((t, i) => [c(t, { bold: true }), c("0", { align: "right", color: C.accent1 }), c("0", { align: "right" }), c("0", Object.assign({ align: "right" }, i === 2 || i === 3 ? { fill: { color: C.accent5 }, bold: true } : {}))]),
		], MX, Y.top + 0.38, lw, [2.8, 1.2, 1.2, 1.2], 0.55);
		d.arrow(s, MX + lw + 0.15, Y.top + 1.7);
		d.tag(s, rx, Y.top + 0.1);
		d.box(s, rx, Y.top + 0.7, rw, 1.3);
		d.txt(s, [{ text: "[지표 1] 미달 ([n]%)", options: { bold: true, breakLine: true } }, { text: "→ ", options: { color: C.accent1, bold: true } }, { text: "[원인과 보완 한 줄]" }], rx + 0.2, Y.top + 0.7, rw - 0.4, 1.3);
		d.box(s, rx, Y.top + 2.2, rw, 1.3);
		d.txt(s, [{ text: "[지표 2] 미달 ([n]%)", options: { bold: true, breakLine: true } }, { text: "→ ", options: { color: C.accent1, bold: true } }, { text: "[원인과 보완 한 줄]" }], rx + 0.2, Y.top + 2.2, rw - 0.4, 1.3);
		d.note(s, "* 금일은 미달 지표 2개만 다룸 / 출처: [지표 집계 파일], [기준일]");
	}

	d.section("1. 주요 지표");
	{
		const s = d.content("1. 주요 지표 추이", ["[지표] 누적 [값], ", { b: "목표 대비 [달성률]" }, " 수준임"]);
		d.unit(s, "[단위: %]");
		const labels = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
		d.line(s, MX, Y.top, CW, 2.4, labels, [50, 55, 60, 65, 70, 75, 80, 83, 86, 90, 95, 100], [45, 52, 58, 66, 68, 74, 79, 81, 85, 88, 92, 97]);
		const c = d.cell;
		const row = (name, o = {}) => [c(name, { bold: true }), ...labels.map((_, i) => c("0", Object.assign({ align: "right" }, o, i === 9 ? { fill: { color: C.accent3 } } : {})))];
		d.table(s, [[d.th("구분"), ...labels.map(d.th)], row("목표", { color: C.accent1 }), row("실적"), row("달성률"), row("전년비")], MX, Y.top + 2.52, CW, [1.53, ...labels.map(() => 0.9)], 0.37);
		d.note(s, `* 목표는 점선, 실적은 실선 / 노랑 = 보고 월 / 출처: [파일명], [기준일] / ${EX}`);
		d.close(s, "[연말 목표 달성을 위해 무엇을 하는가]");
	}

	d.section("2. 활동 실적");
	{
		// 3칸 카드 + 칸마다 결론
		const s = d.content("2. 활동 실적", ["교육 · 점검 · 훈련 실시율 ", { b: "[n]% · [n]% · [n]%" }, " 로 [판단]"]);
		const gap = 0.3, w = (CW - gap * 2) / 3, h = 4.2, c = d.cell;
		[["안전보건 교육", "[교육 부족 대상 한 줄]"], ["안전점검", "[미조치 건 한 줄]"], ["비상대응훈련", "[미실시 매장 한 줄]"]].forEach(([head, concl], i) => {
			const x = MX + i * (w + gap);
			const b = d.card(s, x, Y.top, w, h, head);
			d.table(s, [[d.th("구분"), d.th("계획"), d.th("실시"), d.th("실시율")],
				...["[항목 1]", "[항목 2]", "[항목 3]"].map((t) => [c(t, { bold: true }), c("0", { align: "right", color: C.accent1 }), c("0", { align: "right" }), c("0%", { align: "right" })]),
				[c("합계", { bold: true }), c("0", { align: "right", bold: true, color: C.accent1 }), c("0", { align: "right", bold: true }), c("0%", { align: "right", bold: true })],
			], b.x, b.y, b.w, [b.w - 2.4, 0.8, 0.8, 0.8], 0.45);
			d.cardClose(s, b.x, Y.top + h - 0.8, b.w, concl);
		});
		d.note(s, "* 실시율 = 실시 ÷ 계획 / 출처: [활동 집계 파일], [기준일]");
		d.close(s, "[다음 달에 무엇을 보완하는가]");
	}

	d.section("3. 이슈 및 조치");
	{
		const s = d.content("3. 이슈 및 조치", ["[n]월 주요 이슈 [n]건 중 ", { b: "[n]건 조치 완료" }, ", [n]건 진행 중"]);
		const lw = 6.4, rx = MX + lw + 0.9, rw = CW - lw - 0.9, c = d.cell;
		d.sub(s, "주요 이슈", "", MX, Y.top, lw);
		d.table(s, [[d.th("No."), d.th("이슈"), d.th("발생일"), d.th("상태")],
			...range(5).map((n) => [c(String(n), { align: "center" }), c("[이슈 내용]"), c("’26.00.00", { align: "center" }), c(n <= 2 ? "완료" : "진행", n <= 2 ? { align: "center", color: C.accent1, bold: true } : { align: "center", fill: { color: C.accent3 } })]),
		], MX, Y.top + 0.38, lw, [0.7, 3.3, 1.4, 1.0], 0.6);
		d.arrow(s, MX + lw + 0.15, Y.top + 1.9);
		d.sub(s, "진행 중 이슈 조치", "", rx, Y.top, rw);
		[3, 4, 5].forEach((n, i) => d.badge(s, n, rx, Y.top + 0.38 + i * 1.2, rw, 1.08, `[키워드] 이슈 ${n}`, "[조치 계획 · 기한 한 줄]"));
		d.note(s, "* 번호는 왼쪽 표의 No.와 같음 / 출처: [이슈 관리 대장], [기준일]");
		d.close(s, "[진행 중 이슈를 언제까지 마무리하는가]");
	}

	d.section("4. 다음 달 계획");
	{
		const s = d.content("4. 다음 달 계획", ["[n+1]월은 ", { b: "[핵심 활동]" }, " 에 집중하겠음"]);
		d.grid(s, MX, Y.top, CW, [["’26년 [n+1]월", 0, 4]], ["1주", "2주", "3주", "4주"], [
			["안전보건팀", "[계획 1 — 예: 하반기 위험성평가 결과 보고]", 0, 2, C.accent5],
			["영업부", "[계획 2 — 예: 동절기 안전점검]", 1, 3, C.accent3],
			["관리감독자", "[계획 3 — 예: 관리감독자 교육]", 2, 2, C.accent5],
			["매장", "[계획 4 — 예: 자체 점검 · 보고]", 0, 4, C.accent3],
		]);
		d.note(s, "* 노랑 = 이번 달 신규 활동 / 승인 전 금액은 기재하지 않음");
		d.close(s, "[다음 달 보고에서 확인할 것 한 줄]");
	}

	d.section("#첨부");
	{
		const s = d.content("#첨부 1. 세부 실적", ["[본문 2장 활동 실적]의 근거 — ", { b: "영업부별 세부 실적" }]);
		const c = d.cell;
		d.table(s, [[d.th("영업부"), d.th("교육 계획"), d.th("교육 실시"), d.th("점검 매장"), d.th("지적 건수"), d.th("조치 완료"), d.th("훈련 실시")],
			...range(6).map((n) => [c(`[영업부${n}]`, { bold: true }), ...range(6).map(() => c("0", { align: "right" }))]),
			[c("합계", { bold: true }), ...range(6).map(() => c("0", { align: "right", bold: true, color: C.accent1 }))],
		], MX, Y.top, CW, [2.13, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7], 0.5);
		d.note(s, "※ 출처: [활동 집계 파일], [기준일] / 집계 범위: [전사 · 일부 영업부]");
		d.close(s, "[이 자료에서 확인되는 결론 한 줄]");
	}
	d.qa(["미달 지표의 원인은?", "전년 같은 달과 비교하면?", "다음 달 계획의 우선순위는?", "이슈 중 경영진 지원이 필요한 것은?", "[예상 질문]"]);
	return d.save(path.join(OUT, "CLAUDE_아성다이소_보고서_틀_06_월간_안전보건_실적.pptx"));
}

(async () => {
	for (const build of [drill, risk, accident, inspection, monthly]) console.log("saved", await build());
})();
