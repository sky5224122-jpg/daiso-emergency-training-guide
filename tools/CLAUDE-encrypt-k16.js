#!/usr/bin/env node
// CLAUDE 기출(private/*.js)을 암호로 잠가 data/CLAUDE-k16.enc.json 으로 저장 (공개 저장소에는 이 잠금 파일만 올림)
// 사용법: CLAUDE_K_PASS="암호" node tools/CLAUDE-encrypt-k16.js
// 방식: PBKDF2-SHA256(600,000회) → AES-256-GCM. 앱의 잠금 해제 코드(index.html)와 짝입니다.
'use strict';
const fs = require('fs'), path = require('path'), { webcrypto: c } = require('crypto');
const SITE = path.join(__dirname, '..', 'CLAUDE-safety-exam');
const pass = process.env.CLAUDE_K_PASS;
if (!pass) { console.error('CLAUDE_K_PASS 환경변수에 암호를 넣어 주세요.'); process.exit(1); }
const dir = path.join(SITE, 'private');
const src = fs.readdirSync(dir).filter(f => /^CLAUDE-.*\.js$/.test(f)).sort().map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n;\n');
const b64 = u => Buffer.from(u).toString('base64');
(async () => {
  const salt = c.getRandomValues(new Uint8Array(16)), iv = c.getRandomValues(new Uint8Array(12));
  const base = await c.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
  const key = await c.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 600000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const ct = await c.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(src));
  const out = path.join(SITE, 'data', 'CLAUDE-k16.enc.json');
  fs.writeFileSync(out, JSON.stringify({ v: 1, it: 600000, salt: b64(salt), iv: b64(iv), ct: b64(new Uint8Array(ct)) }));
  console.log('잠금 파일 생성:', out, Math.round(fs.statSync(out).size / 1024) + 'KB');
})();
