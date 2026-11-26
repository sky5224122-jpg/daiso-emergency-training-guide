// CLAUDE 아성다이소 보고서 틀 공통 부품
// 기준: 「사내 발표자료 공통 문법」 02~08장 (보고서 전체 구성, 장표 1장의 구조, 색·강조, 표·차트·숫자, 글꼴·서식)
// 쓰는 곳: tools/build_report_templates.js
const fs = require("fs");
const pptxgen = require("pptxgenjs");

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
const PT = { cover: 28, coverSub: 14, title: 18, head: 14, section: 12, body: 10, note: 9, close: 13, page: 9, toc: 14, kpi: 28 };

function createDeck(deckTitle) {
	const pres = new pptxgen();
	pres.layout = "LAYOUT_WIDE"; // 16:9, 13.33 x 7.5 in
	pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
	pres.title = deckTitle;
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

	let pageNo = 0; // 표지부터 셈. 전체 쪽수는 저장할 때 채움 (숨김 장표 제외)
	let sec = "";
	const d = { pres, C, HEX, PT, W, MX, CW, Y };

	const txt = (d.txt = (s, text, x, y, w, h, o = {}) =>
		s.addText(text, Object.assign({ x, y, w, h, isTextBox: true, margin: 0, fontSize: PT.body, color: C.text1, valign: "middle" }, o)));
	const box = (d.box = (s, x, y, w, h, o = {}) =>
		s.addShape(pres.ShapeType.rect, Object.assign({ x, y, w, h, fill: { color: C.background1 }, line: { color: C.accent6, width: 0.75 } }, o)));
	const fill = (d.fill = (s, x, y, w, h, color) => box(s, x, y, w, h, { fill: { color }, line: { color, width: 0.75 } }));

	d.section = (t) => { sec = t; pres.addSection({ title: t }); };

	// 표지: 제목, 부제(근거·목적 한 줄), 작성일, 부서명
	d.cover = (title, subtitle, date = "’26.00.00", dept = "안전보건팀") => {
		const s = pres.addSlide({ masterName: "COVER", sectionTitle: sec });
		pageNo += 1;
		txt(s, title, 1.2, 2.5, W - 2.4, 0.9, { fontSize: PT.cover, bold: true, align: "center" });
		txt(s, subtitle, 1.2, 3.5, W - 2.4, 0.45, { fontSize: PT.coverSub, color: C.accent2, align: "center" });
		txt(s, [{ text: date, options: { breakLine: true } }, { text: dept, options: { bold: true } }], 1.2, 5.6, W - 2.4, 0.8, { fontSize: PT.coverSub, align: "center" });
		return s;
	};
	// 목차: 본문과 #첨부를 구분선으로 나눔
	d.toc = (main, att) => {
		const s = pres.addSlide({ masterName: "COVER", sectionTitle: sec });
		pageNo += 1;
		txt(s, "목차", MX, Y.title, CW, 0.48, { fontSize: PT.title, bold: true, align: "center" });
		const x = 4.2, w = W - 8.4, gap = main.length > 4 ? 0.52 : 0.6;
		main.forEach((t, i) => txt(s, t, x, 1.6 + i * gap, w, 0.45, { fontSize: PT.toc, bold: true }));
		const ly = 1.6 + main.length * gap + 0.15;
		s.addShape(pres.ShapeType.line, { x, y: ly, w, h: 0, line: { color: C.accent6, width: 0.75 } });
		att.forEach((t, i) => txt(s, t, x, ly + 0.2 + i * 0.55, w, 0.45, { fontSize: PT.toc, color: C.accent2 }));
		return s;
	};
	// 본문 장표: 제목 + 헤드메시지(핵심 구절만 파란 굵게) + 쪽수 "n | 전체"
	d.content = (title, headRuns, opts = {}) => {
		const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
		s.addText(title, { placeholder: "title" });
		s.addText(headRuns.map((r) => (typeof r === "string" ? { text: r } : { text: r.b, options: { bold: true, color: C.accent1 } })), { placeholder: "body" });
		if (opts.hidden) s.hidden = true;
		else {
			pageNo += 1;
			txt(s, `${pageNo} | {{TOTAL}}`, W - MX - 1.5, Y.page, 1.5, 0.25, { fontSize: PT.page, color: C.accent2, align: "right" });
		}
		return s;
	};

	d.unit = (s, t) => txt(s, t, W - MX - 3, Y.unit, 3, 0.22, { fontSize: PT.note, color: C.accent2, align: "right" });
	d.note = (s, t) => txt(s, t, MX, Y.note, CW, 0.26, { fontSize: PT.note, color: C.accent2 });
	d.close = (s, t) => txt(s, "▶ " + t, MX, Y.close, CW, 0.4, { fontSize: PT.close, bold: true, align: "center" });
	// 영역 소제목: 굵은 글씨 + 괄호 작은 글씨(기준·단위)
	d.sub = (s, label, small, x, y, w) =>
		txt(s, [{ text: label, options: { bold: true, fontSize: PT.section } }, { text: small ? "  " + small : "", options: { fontSize: PT.note, color: C.accent2 } }], x, y, w, 0.3);
	// 좌 숫자 → 우 해석 연결 표시
	d.arrow = (s, x, y) => txt(s, "‥▶", x, y, 0.6, 0.4, { fontSize: PT.head, color: C.accent2, align: "center" });
	// 번호 배지 박스: 검정 배지 + [키워드] 제목 + 파란 화살표 한 줄
	d.badge = (s, n, x, y, w, h, head, line) => {
		box(s, x, y, w, h);
		fill(s, x, y, 0.4, h, C.text1);
		txt(s, String(n), x, y, 0.4, h, { fontSize: PT.section, bold: true, color: C.background1, align: "center" });
		txt(s, [
			{ text: head, options: { bold: true, fontSize: PT.section, breakLine: true } },
			{ text: "→ ", options: { color: C.accent1, bold: true } },
			{ text: line },
		], x + 0.55, y, w - 0.7, h);
	};
	// 카드: 남색 헤더 바 + 본문 영역. 본문 영역 좌표를 돌려줌
	d.card = (s, x, y, w, h, header) => {
		box(s, x, y, w, h);
		fill(s, x, y, w, 0.4, C.text2);
		txt(s, header, x, y, w, 0.4, { fontSize: PT.section, bold: true, color: C.background1, align: "center" });
		return { x: x + 0.15, y: y + 0.5, w: w - 0.3, h: h - 0.6 };
	};
	// 글머리 목록 (글자 "•" 대신 글머리 기호 사용)
	d.bullets = (s, items, x, y, w, h, o = {}) =>
		txt(s, items.map((t, i) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: i < items.length - 1, paraSpaceAfter: 4 } })), x, y, w, h, Object.assign({ valign: "top" }, o));
	// 칸 결론: 회색 ▼ + 굵은 파란 문장 (빨강은 장표당 1곳이라 칸마다 쓰지 않음)
	d.cardClose = (s, x, y, w, t) => {
		txt(s, "▼", x, y, w, 0.25, { fontSize: PT.note, color: C.accent2, align: "center" });
		txt(s, t, x, y + 0.27, w, 0.36, { bold: true, color: C.accent1, align: "center" });
	};
	// 핵심 지표 타일: 큰 숫자 + 이름 + 기준
	d.kpi = (s, x, y, w, h, value, label, desc) => {
		box(s, x, y, w, h);
		txt(s, label, x, y + 0.15, w, 0.3, { fontSize: PT.section, bold: true, align: "center" });
		txt(s, value, x, y + 0.5, w, 0.6, { fontSize: PT.kpi, bold: true, color: C.accent1, align: "center" });
		txt(s, desc, x + 0.1, y + h - 0.42, w - 0.2, 0.3, { fontSize: PT.note, color: C.accent2, align: "center" });
	};
	// "금일보고" 범위 태그 (기울어진 파란 테두리)
	d.tag = (s, x, y, t = "금일보고") =>
		s.addText(t, { shape: pres.ShapeType.rect, x, y, w: 1.1, h: 0.34, rotate: 350, margin: 0, fontSize: PT.body, bold: true, color: C.accent1, align: "center", valign: "middle", fill: { color: C.background1 }, line: { color: C.accent1, width: 1.5 } });

	// 표: 머리행 연회색 + 굵은 남색, 줄 간격 150%, 핵심 셀만 음영
	d.cell = (text, o = {}) => ({ text, options: Object.assign({ fontSize: PT.body, color: C.text1, valign: "middle", lineSpacingMultiple: 1.5, margin: [0.03, 0.08, 0.03, 0.08] }, o) });
	d.th = (t) => d.cell(t, { bold: true, color: C.text2, fill: { color: C.background2 }, align: "center" });
	d.table = (s, rows, x, y, w, colW, rowH) => s.addTable(rows, { x, y, w, colW, rowH, border: { type: "solid", pt: 0.75, color: HEX.accent6 } });

	const chartText = { catAxisLabelFontSize: PT.body, catAxisLabelFontFace: "+mn-lt", catAxisLabelColor: HEX.dk1, dataLabelFontSize: PT.body, dataLabelFontFace: "+mn-lt", dataLabelColor: HEX.dk1 };
	// 단순 막대: 데이터 라벨 직접 표기, 축·격자선 최소 (막대 색: 전년=흰색, 비교=회색, 당해·강조=남색)
	d.bar = (s, x, y, w, h, labels, values, colors = [HEX.dk2]) =>
		s.addChart(pres.charts.BAR, [{ name: "실적", labels, values }], Object.assign({
			x, y, w, h, barDir: "col", chartColors: colors, showLegend: false, showValue: true, dataLabelPosition: "outEnd",
			valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, plotArea: { border: { pt: 0.75, color: HEX.dk1 } },
		}, chartText));
	// 추세선: 목표는 점선(저장할 때 바꿈), 실적은 실선
	d.line = (s, x, y, w, h, labels, target, actual) =>
		s.addChart(pres.charts.LINE, [{ name: "목표", labels, values: target }, { name: "실적", labels, values: actual }], Object.assign({
			x, y, w, h, chartColors: [HEX.accent2, HEX.dk2], lineSize: 2, lineDataSymbolSize: 6,
			showLegend: true, legendPos: "t", legendFontSize: PT.body, legendFontFace: "+mn-lt",
			valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
		}, chartText));

	// 현재(회색) vs 개선(노랑) 프로세스: hiFrom 번째 단계부터 노랑
	d.process = (s, x, y, w, steps, hiFrom) => {
		const n = steps.length, sw = (w - 0.2) / n, h = 1.5;
		if (hiFrom > 0) fill(s, x, y, sw * hiFrom + 0.1, h, C.background2);
		if (hiFrom < n) fill(s, x + sw * hiFrom + 0.1, y, w - sw * hiFrom - 0.1, h, C.accent3);
		steps.forEach(([t, desc], i) => {
			const bx = x + 0.1 + i * sw + 0.05;
			box(s, bx, y + 0.2, sw - 0.1, 0.6);
			txt(s, t, bx, y + 0.2, sw - 0.1, 0.6, { bold: true, align: "center" });
			txt(s, desc, bx, y + 0.88, sw - 0.1, 0.5, { fontSize: PT.note, color: C.accent2, align: "center", valign: "top" });
		});
	};

	// 일정 그리드: 위 묶음(연도·월) / 칸(분기·주) / 좌측 조직 라벨 + 색 막대. 일정은 표 대신 그리드로
	d.grid = (s, x, y, w, groups, cols, rows, opts = {}) => {
		const lw = opts.labelW || 2.3, gx = x + lw + 0.2, gw = w - lw - 0.2, cw = gw / cols.length, rh = opts.rowH || 0.82;
		groups.forEach(([t, i, n]) => {
			box(s, gx + i * cw, y, n * cw, 0.36, { fill: { color: C.text2 }, line: { color: C.background1, width: 1.5 } });
			txt(s, t, gx + i * cw, y, n * cw, 0.36, { bold: true, color: C.background1, align: "center" });
		});
		cols.forEach((q, i) => {
			box(s, gx + i * cw, y + 0.36, cw, 0.32, { fill: { color: C.background2 } });
			txt(s, q, gx + i * cw, y + 0.36, cw, 0.32, { bold: true, color: C.text2, align: "center" });
		});
		rows.forEach(([org], r) => {
			const ry = y + 0.78 + r * rh;
			box(s, x, ry + 0.1, lw, rh - 0.2, { line: { color: C.text1, width: 1 } });
			txt(s, org, x, ry + 0.1, lw, rh - 0.2, { bold: true, align: "center" });
			cols.forEach((_, i) => box(s, gx + i * cw, ry, cw, rh));
		});
		// 연도 구분 굵은 세로선은 칸 위, 일정 막대 아래에 둠 (막대 글자를 가리지 않게)
		if (opts.divider) s.addShape(pres.ShapeType.line, { x: gx + opts.divider * cw, y, w: 0, h: 0.78 + rows.length * rh, line: { color: C.text1, width: 2 } });
		rows.forEach(([, what, st, len, col], r) => {
			const ry = y + 0.78 + r * rh;
			fill(s, gx + st * cw + 0.08, ry + 0.2, len * cw - 0.16, rh - 0.4, col || C.accent5);
			txt(s, what, gx + st * cw + 0.18, ry + 0.2, len * cw - 0.36, rh - 0.4, {});
		});
	};

	// (숨김) 참고: 예상 질문과 답변 요지
	d.qa = (questions) => {
		d.section("(숨김) 참고");
		const s = d.content("(참고) 예상 질문과 답변 요지", ["내부 준비용 — ", { b: "슬라이드 숨기기" }, " 상태로 둠"], { hidden: true });
		d.table(s, [
			[d.th("No."), d.th("예상 질문"), d.th("답변 요지"), d.th("근거 장표")],
			...questions.map((q, i) => [d.cell(String(i + 1), { align: "center" }), d.cell(q), d.cell("[답변: 확인된 사실만 단정, 미확인은 \"확인 필요\"]"), d.cell("[0.0 / #첨부 0]")]),
		], MX, Y.top, CW, [0.9, 3.9, 5.5, 2.03], 0.6);
		d.note(s, "* 첨부를 빼면 목차 · 본문의 첨부 참조 · 쪽수 · 이 참고 장표를 함께 고침");
	};

	// 저장: 테마 색 기록(APPLY_THEME), 한글 테마 글꼴, 전체 쪽수, 차트 서식 보정
	d.save = async (out) => {
		const f = await pres.writeFile({ fileName: out });
		if (process.env.APPLY_THEME) await require(process.env.APPLY_THEME).applyTheme(f, THEME);
		else console.warn("APPLY_THEME 미지정: 테마 색이 Office 기본색으로 남음");
		const JSZip = require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));
		const zip = await JSZip.loadAsync(fs.readFileSync(f));
		const clean = new JSZip(); // 폴더 항목 없이 파일만 다시 담음
		for (const [name, entry] of Object.entries(zip.files)) {
			if (entry.dir) continue;
			let data = await entry.async("nodebuffer");
			if (name === "ppt/theme/theme1.xml") {
				// 한글(동아시아) 테마 글꼴도 맑은 고딕 — pptxgenjs는 영문(latin)만 기록함
				data = data.toString("utf8").replace(/<a:ea typeface=""\/>/g, `<a:ea typeface="${THEME.bodyFontFace}"/>`);
			} else if (/^ppt\/slides\/slide\d+\.xml$/.test(name)) {
				data = data.toString("utf8").replace(/\{\{TOTAL\}\}/g, String(pageNo));
			} else if (/^ppt\/charts\/chart\d+\.xml$/.test(name)) {
				data = data.toString("utf8")
					.replace(/(<c:v>목표<\/c:v>[\s\S]*?<a:prstDash val=")solid"/, '$1dash"') // 목표 계열만 점선
					.replace(/typeface="Arial"/g, 'typeface="+mn-lt"') // 차트 글자도 테마 글꼴
					.replace(/(<c:dPt>[\s\S]*?<\/a:solidFill>)(<a:effectLst\/>)/g, `$1<a:ln w="9525"><a:solidFill><a:srgbClr val="${HEX.accent2}"/></a:solidFill></a:ln>$2`); // 흰 막대가 보이게 테두리
			}
			clean.file(name, data, { createFolders: false });
		}
		fs.writeFileSync(f, await clean.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
		return f;
	};
	return d;
}

module.exports = { createDeck, THEME, PT };
