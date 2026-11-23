#!/usr/bin/env node
// CLAUDE 보강 해설 병합: <작업폴더>/out/batchNN.json ({문항id: 해설}) → CLAUDE-safety-exam/data/CLAUDE-ex-NN.js
// 사용법: node tools/CLAUDE-merge-explanations.js <작업폴더>
'use strict';
const fs = require('fs'), path = require('path');
const work = process.argv[2]; if (!work) { console.error('작업폴더를 지정하세요.'); process.exit(1); }
const out = path.join(__dirname, '..', 'CLAUDE-safety-exam', 'data');
let total = 0;
for (const f of fs.readdirSync(path.join(work, 'out')).filter(f => /^batch\d+\.json$/.test(f)).sort()) {
  const obj = JSON.parse(fs.readFileSync(path.join(work, 'out', f), 'utf8'));
  const n = f.match(/\d+/)[0];
  const body = Object.keys(obj).sort().map(id => `${JSON.stringify(id)}:${JSON.stringify(String(obj[id]).trim())}`).join(',\n');
  fs.writeFileSync(path.join(out, `CLAUDE-ex-${n}.js`), `/* CLAUDE 산업안전지도사 — 보강 해설 ${n} (정답 풀이 · 오답 선지 분석 · 암기 포인트) */\nwindow.EXP = window.EXP || {};\nObject.assign(window.EXP, {\n${body}\n});\n`);
  total += Object.keys(obj).length;
}
console.log('병합한 해설:', total);
