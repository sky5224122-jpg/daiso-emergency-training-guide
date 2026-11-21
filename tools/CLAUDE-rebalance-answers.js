#!/usr/bin/env node
/* CLAUDE 1차 정답 위치 균형 맞추기
 * 정답 번호가 한쪽(예: 1번)에 몰리면 "모르면 1번" 같은 요령이 통하므로,
 * 선지 순서를 바꿔도 의미가 변하지 않는 문항만 골라 정답 선지를 덜 쓰인 위치와 맞바꿉니다.
 * 건너뛰는 문항: 숫자·단위 선지(오름차순 관례), ㄱ·ㄴ 조합 선지, 해설·문제에 ①~⑤나 "N번"이 나오는 문항,
 *               "모두/전부/없다/위의" 같은 다른 선지를 가리키는 선지가 있는 문항.
 * 사용법: node tools/CLAUDE-rebalance-answers.js [--dry]
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DATA = path.join(__dirname, '..', 'CLAUDE-safety-exam', 'data');
const DRY = process.argv.includes('--dry');
const files = fs.readdirSync(DATA).filter(f => /^CLAUDE-q1-.*\.js$/.test(f)).sort();

function load(file) {
  const ctx = { window: {} };
  ctx.window.QB1 = [];
  ctx.QB1 = ctx.window.QB1;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(DATA, file), 'utf8'), ctx);
  return ctx.window.QB1;
}

const NUMERIC = /^\s*(약\s*)?[-−+]?\d/;
const COMBO = /^[ㄱ-ㅎ](\s*[,·]\s*[ㄱ-ㅎ])*$|^[ㄱ-ㅎ]\s*[,·]/;
const REFER = /모두|전부|없다|없음|위의|위 내용|①|②|③|④|⑤/;
const POSREF = /[①②③④⑤]|\d\s*번\s*(선지|보기)?|선지\s*\d/;

function eligible(q) {
  if (!Array.isArray(q.o) || q.o.length !== 5) return false;
  if (q.o.some(o => NUMERIC.test(o) || COMBO.test(o.trim()) || REFER.test(o))) return false;
  if (POSREF.test(q.ex || '') || POSREF.test(q.q || '')) return false;
  return true;
}

/* 소스의 o:[...] 배열과 a:N 을 찾아 바꿈 */
function readStr(src, i) {
  const qch = src[i];
  let j = i + 1, out = '';
  while (j < src.length) {
    const c = src[j];
    if (c === '\\') { out += src[j + 1]; j += 2; continue; }
    if (c === qch) return { val: out, end: j + 1 };
    out += c; j++;
  }
  throw new Error('unterminated string at ' + i);
}
function lit(s) { return "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"; }

function patch(src, q, newO, newA) {
  const idPos = src.search(new RegExp("id:\\s*'" + q.id.replace(/[-]/g, '\\-') + "'"));
  if (idPos < 0) throw new Error('id not found ' + q.id);
  const oPos = src.indexOf('o:[', idPos);
  let j = oPos + 3;
  const vals = [];
  while (true) {
    while (/[\s,]/.test(src[j])) j++;
    if (src[j] === ']') { j++; break; }
    if (src[j] !== "'" && src[j] !== '"') throw new Error('unexpected token in ' + q.id);
    const r = readStr(src, j); vals.push(r.val); j = r.end;
  }
  if (JSON.stringify(vals) !== JSON.stringify(q.o)) throw new Error('option mismatch ' + q.id);
  const aMatch = /^\s*,\s*a:\s*(\d)/.exec(src.slice(j));
  if (!aMatch || +aMatch[1] !== q.a) throw new Error('a mismatch ' + q.id);
  const aEnd = j + aMatch[0].length;
  return src.slice(0, oPos) + 'o:[' + newO.map(lit).join(',') + '],a:' + newA + src.slice(aEnd);
}

/* 과목별로 현재 분포를 세고, 대상 문항의 정답을 가장 적게 쓰인 위치로 옮김 */
const all = [];
files.forEach(f => load(f).forEach(q => all.push({ f, q })));
const bySubj = {};
all.forEach(x => { (bySubj[x.q.s] = bySubj[x.q.s] || []).push(x); });

const changes = {}; // file -> [{q,newO,newA}]
let moved = 0;
Object.keys(bySubj).forEach(s => {
  const list = bySubj[s];
  const cnt = [0, 0, 0, 0, 0, 0];
  list.forEach(x => cnt[x.q.a]++);
  const target = list.length / 5;
  // 많이 쓰인 위치의 문항부터 처리
  const cand = list.filter(x => eligible(x.q)).sort((a, b) => cnt[b.q.a] - cnt[a.q.a] || a.q.id.localeCompare(b.q.id));
  cand.forEach(x => {
    const cur = x.q.a;
    if (cnt[cur] <= target + 1) return;
    let best = 0;
    for (let p = 1; p <= 5; p++) if (p !== cur && (best === 0 || cnt[p] < cnt[best])) best = p;
    if (cnt[best] >= target) return;
    const o = x.q.o.slice();
    const t = o[cur - 1]; o[cur - 1] = o[best - 1]; o[best - 1] = t;
    cnt[cur]--; cnt[best]++;
    (changes[x.f] = changes[x.f] || []).push({ q: x.q, newO: o, newA: best });
    moved++;
  });
  console.log(s + ': ' + [1, 2, 3, 4, 5].map(p => p + '번 ' + cnt[p]).join(' · ') + '  (대상 ' + cand.length + '문항)');
});

if (!DRY) {
  Object.keys(changes).forEach(f => {
    const p = path.join(DATA, f);
    let src = fs.readFileSync(p, 'utf8');
    changes[f].forEach(c => { src = patch(src, c.q, c.newO, c.newA); });
    fs.writeFileSync(p, src);
  });
}
console.log((DRY ? '[미리보기] ' : '') + '정답 위치를 옮긴 문항: ' + moved);
