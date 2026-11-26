// CLAUDE 산업안전지도사 문제은행 데이터 검증
// node tools/CLAUDE-validate-safety-exam.js [--terms]
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const DATA = path.join(__dirname, '..', 'CLAUDE-safety-exam', 'data');
const ctx = { window: {} }; ctx.window = ctx; vm.createContext(ctx);
const PRIV = path.join(DATA, '..', 'private');
const files = fs.readdirSync(DATA).filter(f => f.endsWith('.js')).sort().map(f => path.join(DATA, f));
if (fs.existsSync(PRIV)) fs.readdirSync(PRIV).filter(f => f.endsWith('.js')).sort().forEach(f => files.push(path.join(PRIV, f)));
for (const fp of files) {
  const f = path.basename(fp);
  try { vm.runInContext(fs.readFileSync(fp, 'utf8'), ctx, { filename: f }); }
  catch (e) { console.error('구문 오류', f, e.message); process.exit(1); }
}
const QB1 = ctx.QB1 || [], QB2 = ctx.QB2 || [], GL = ctx.GLOSS || [];
const errs = [], warn = [];
const ids = new Set();
const dist = {};
for (const q of QB1) {
  const where = q.id || JSON.stringify(q).slice(0, 60);
  if (!q.id || ids.has(q.id)) errs.push(`ID 중복/누락: ${where}`); ids.add(q.id);
  if (!['law', 'gen', 'diag'].includes(q.s)) errs.push(`${where} 과목 코드 오류: ${q.s}`);
  if (!['g', 'e', 'k'].includes(q.t)) errs.push(`${where} 유형 오류`);
  if (q.t === 'k' && (!q.rd || !(q.no >= 1))) errs.push(`${where} 기출 회차·번호 누락`);
  if (!q.tp || !q.q || !q.ex || !q.rf) errs.push(`${where} 필수 항목 누락(tp/q/ex/rf)`);
  if (!Array.isArray(q.o) || q.o.length !== 5) errs.push(`${where} 보기 수 ${q.o && q.o.length}`);
  else {
    q.o.forEach((o, i) => { if (!String(o).trim() || /^[-—–]+$/.test(String(o).trim())) errs.push(`${where} 빈 보기 ${i + 1}`); });
    if (new Set(q.o).size !== 5) errs.push(`${where} 중복 보기`);
  }
  if (!(q.a >= 1 && q.a <= 5) || q.a !== Math.floor(q.a)) errs.push(`${where} 정답 번호 오류 ${q.a}`);
  (dist[q.s] = dist[q.s] || [0, 0, 0, 0, 0])[q.a - 1]++;
}
for (const q of QB2) {
  const where = q.id;
  if (!q.id || ids.has(q.id)) errs.push(`ID 중복/누락: ${where}`); ids.add(q.id);
  if (!['mech', 'elec', 'cons'].includes(q.fd)) errs.push(`${where} 분야 코드 오류 ${q.fd}`);
  if (!['s', 'l'].includes(q.ty)) errs.push(`${where} 유형 오류`);
  if (q.pt !== (q.ty === 's' ? 5 : 25)) errs.push(`${where} 배점 오류`);
  if (!q.q || !q.ans || !Array.isArray(q.kw) || q.kw.length < 3) errs.push(`${where} 필수 항목 누락(q/ans/kw)`);
  if (q.t === 'k' && (!q.rd || !(q.no >= 1))) errs.push(`${where} 기출 회차·번호 누락`);
}
// 보강 해설(EXP) 검사
const EXP = ctx.EXP || {}; const byId = {}; QB1.forEach(q => { byId[q.id] = q; });
let expN = 0, expShort = 0;
for (const id in EXP) {
  if (!byId[id]) { errs.push(`보강 해설의 문항 ID 없음: ${id}`); continue; }
  expN++; if (String(EXP[id]).length < 300) expShort++;
  if (!/정답 풀이/.test(EXP[id]) || !/오답 선지 분석/.test(EXP[id])) errs.push(`${id} 보강 해설 구조 누락(정답 풀이/오답 선지 분석)`);
}
if (expN) console.log(`보강 해설 ${expN}문항 (300자 미만 ${expShort})`);
// 해설의 "정답은 ○" 표기와 실제 정답 일치 검사 (보강 해설 우선)
{ const N = '①②③④⑤'; let chk = 0;
  for (const q of QB1) { const e = (EXP[q.id] || q.ex || ''); const m = String(e).match(/정답은\s*([①②③④⑤])/g); if (!m) continue; chk++;
    for (const x of m) if (N.indexOf(x.slice(-1)) + 1 !== q.a) { errs.push(`${q.id} 해설의 정답(${x.slice(-1)})과 실제 정답(${q.a})이 다름`); break; } }
  console.log(`해설 정답 표기 점검 ${chk}문항`); }
// 글자 크기 정수 검사(index.html)
const html = fs.readFileSync(path.join(DATA, '..', 'index.html'), 'utf8');
const dec = html.match(/font-size:\s*\d+\.\d+/g); if (dec) errs.push('소수점 글자 크기: ' + dec.join(', '));
// 용어사전에 없는 영어 단어
const known = new Set(); GL.forEach(g => [g.k].concat(g.al || []).forEach(a => known.add(a)));
const ignore = new Set(('mm cm m km kg g t ms s h min dB dBA Hz kHz kV V A mA W J kW kWh lux lx cd ppm mg m3 μm cal ℃ K N kN kPa MPa ' +
  'vol rpm SPM T R L U H E I V M S C D F P X Y Z A B O Q W G n Tc Ts Tm Dm D1 D2 C1 C2 CN DN IIA IIB IIC T1 T2 T3 T4 T5 T6 ' +
  'ia ib d p o e m q PE PEN N S Ga Gb Gc IP NO NOT MORE LESS AS WELL OF PART REVERSE OTHER THAN FLOW PRESSURE LEVEL ' +
  'Lb Lt MT ID URL KS ISO IEC NFPA IEEE KOSHA GUIDE CO CO2 H2S HCN SO2 NH3 O2 TNT pH Big').split(/\s+/));
const seen = {};
const multi = [...known].filter(a => /[\s'·]/.test(a)).sort((a, b) => b.length - a.length);
function scan(t, id) { t = String(t); multi.forEach(m => { t = t.split(m).join(' '); }); (String(t).match(/[A-Za-z][A-Za-z0-9\-\/]*[A-Za-z0-9]|[A-Za-z]{2,}/g) || []).forEach(w => {
  if (known.has(w) || ignore.has(w) || /^[A-Z]$/.test(w)) return; (seen[w] = seen[w] || new Set()).add(id); }); }
QB1.forEach(q => [q.q, (q.bx || []).join(' '), q.o.join(' '), q.ex].forEach(t => scan(t, q.id)));
QB2.forEach(q => [q.q, q.ans, q.kw.join(' ')].forEach(t => scan(t, q.id)));

const by = k => QB1.filter(q => q.s === k);
console.log(`1차 ${QB1.length}문항 (법령 ${by('law').length} · 안전일반 ${by('gen').length} · 기업진단 ${by('diag').length}) / 빈출 ${QB1.filter(q => q.t === 'g').length} · 예상 ${QB1.filter(q => q.t === 'e').length}${QB1.some(q => q.t === 'k') ? ' · 기출 ' + QB1.filter(q => q.t === 'k').length + ' (비공개)' : ''}`);
console.log(`2차 ${QB2.length}문항 (기계 ${QB2.filter(q => q.fd === 'mech').length} · 전기 ${QB2.filter(q => q.fd === 'elec').length} · 건설 ${QB2.filter(q => q.fd === 'cons').length}) / 용어 ${GL.length}개${QB2.some(q => q.t === 'k') ? ' / 2차 기출 ' + QB2.filter(q => q.t === 'k').length + ' (비공개)' : ''}`);
for (const k in dist) console.log(`정답 분포 ${k}: ${dist[k].map((n, i) => (i + 1) + '번 ' + n).join(' · ')}`);
// 정답 길이 편향 점검 — 긴 문장 보기 문항만(기출·짧은 조합형 제외). 정답만 눈에 띄게 길면 길이로 찍어 맞힐 수 있음
{ const L = s => String(s).replace(/\s+/g, '').length; let n = 0, lg = 0, st = 0;
  for (const q of QB1) { if (q.t === 'k' || q.o.every(o => L(o) <= 12)) continue; n++;
    const ls = q.o.map(L), c = ls[q.a - 1], mo = Math.max(...ls.filter((_, i) => i !== q.a - 1));
    if (c >= mo) lg++; if (c > mo * 1.15) st++; }
  const p = x => (x / n * 100).toFixed(1);
  if (n) console.log(`정답 길이 편향: 정답이 가장 긴 보기 ${p(lg)}% · 15% 이상 더 긴 것 ${p(st)}% (${n}문항 기준, 무작위면 약 20%)`);
  if (n && st / n > 0.1) console.log('주의: 정답이 눈에 띄게 긴 문항이 10%를 넘습니다. 새 문항은 오답 보기 길이를 정답에 맞추세요.'); }
if (process.argv.includes('--terms')) {
  const list = Object.entries(seen).sort((a, b) => b[1].size - a[1].size);
  console.log(`용어사전에 없는 영어 ${list.length}개:`); console.log(list.map(([w, s]) => `${w}(${s.size})`).join(' '));
} else if (Object.keys(seen).length) {
  console.log(`참고: 용어사전에 없는 영어 ${Object.keys(seen).length}개 (--terms로 목록 보기)`);
}
if (errs.length) { console.error(`오류 ${errs.length}건:\n` + errs.join('\n')); process.exit(1); }
console.log('검증 통과');
