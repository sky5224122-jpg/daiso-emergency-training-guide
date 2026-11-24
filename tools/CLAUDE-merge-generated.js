#!/usr/bin/env node
// CLAUDE 신규 문항 병합: <작업폴더>/out/{law,gen,diag}-NN.json (문항 배열) → CLAUDE-safety-exam/data/CLAUDE-q1-set2N-<과목>-NN.js
// 사용법: node tools/CLAUDE-merge-generated.js <작업폴더>
'use strict';
const fs = require('fs'), path = require('path');
const work = process.argv[2]; if (!work) { console.error('작업폴더를 지정하세요.'); process.exit(1); }
const out = path.join(__dirname, '..', 'CLAUDE-safety-exam', 'data');
const N = '①②③④⑤';
let total = 0, rejected = [];
// 검토 결과 제외할 문항 ID 목록(선택): <작업폴더>/drop.json = ["L2041", ...]
const dropFile = path.join(work, 'drop.json');
const DROP = new Set(fs.existsSync(dropFile) ? JSON.parse(fs.readFileSync(dropFile, 'utf8')) : []);
// 검토 결과 정정할 문항(선택): <작업폴더>/fix.json = {"L2286": {"a": 5, "ex": "새 해설"}, ...}  — 지정한 필드만 덮어씀
const fixFile = path.join(work, 'fix.json');
const FIX = fs.existsSync(fixFile) ? JSON.parse(fs.readFileSync(fixFile, 'utf8')) : {};
for (const f of fs.readdirSync(path.join(work, 'out')).filter(f => /^(law|gen|diag)-\d+\.json$/.test(f)).sort()) {
  const arr = JSON.parse(fs.readFileSync(path.join(work, 'out', f), 'utf8'));
  const keep = [];
  for (const q of arr) {
    if (DROP.has(q.id)) { rejected.push(q.id + ':drop'); continue; }
    if (FIX[q.id]) Object.assign(q, FIX[q.id]);
    const why = [];
    if (!/^[LGD]\d+$/.test(q.id || '')) why.push('id');
    if (!['law', 'gen', 'diag'].includes(q.s)) why.push('s');
    if (!q.tp || !q.q || !q.ex || !q.rf) why.push('필수항목');
    if (!Array.isArray(q.o) || q.o.length !== 5 || new Set(q.o.map(String)).size !== 5 || q.o.some(o => !String(o).trim() || /^[-—–]+$/.test(String(o).trim()))) why.push('보기');
    if (!(q.a >= 1 && q.a <= 5)) why.push('정답번호');
    if (!/정답 풀이/.test(q.ex || '') || !/오답 선지 분석/.test(q.ex || '')) why.push('해설구조');
    const m = String(q.ex || '').match(/정답은\s*([①②③④⑤])/g);
    if (m && m.some(x => N.indexOf(x.slice(-1)) + 1 !== q.a)) why.push('해설정답불일치');
    if (why.length) { rejected.push(q.id + ':' + why.join('/')); continue; }
    const o = { id: q.id, s: q.s, t: 'e', tp: q.tp, q: q.q };
    if (q.bx && q.bx.length) o.bx = q.bx;
    o.o = q.o; o.a = q.a; o.ex = String(q.ex).trim(); o.rf = q.rf;
    keep.push(o);
  }
  const name = f.replace('.json', '');
  const [s, n] = name.split('-');
  const set = { law: '20', gen: '21', diag: '22' }[s];
  fs.writeFileSync(path.join(out, `CLAUDE-q1-set${set}-${s}-${n}.js`),
    `/* CLAUDE 산업안전지도사 — 1차 예상문제 (${s} ${n}) : 정답 풀이·오답 선지 분석·암기 포인트 해설 포함 */\nwindow.QB1 = window.QB1 || [];\nQB1.push(\n${keep.map(q => JSON.stringify(q)).join(',\n')}\n);\n`);
  total += keep.length;
}
console.log('병합한 문항:', total, ' 제외:', rejected.length);
if (rejected.length) console.log(rejected.join(' | '));
