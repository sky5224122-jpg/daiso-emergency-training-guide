#!/usr/bin/env python3
"""CLAUDE 산업안전지도사 문제은행 빌드 도구

사용법:
  python3 tools/CLAUDE-build-safety-exam.py            # index.html의 데이터 목록 갱신 + 검증
  python3 tools/CLAUDE-build-safety-exam.py --artifact OUT.html   # 단일 파일(Artifact용)도 생성
  python3 tools/CLAUDE-build-safety-exam.py --artifact OUT.html --private   # 기출 원문(private/) 포함 비공개판

- data/ 폴더의 CLAUDE-glossary.js → CLAUDE-q1-*.js → CLAUDE-q2-*.js 순서로 <script>를 넣습니다.
- 검증은 tools/CLAUDE-validate-safety-exam.js(Node)가 담당합니다.
"""
import argparse, pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / 'CLAUDE-safety-exam'
DATA = SITE / 'data'


def data_files():
    files = []
    g = DATA / 'CLAUDE-glossary.js'
    if g.exists():
        files.append(g)
    files += sorted(DATA.glob('CLAUDE-q1-*.js'), key=order_key)
    files += sorted(DATA.glob('CLAUDE-q2-*.js'))
    return files


def order_key(p):
    # 기본 3개 과목 파일을 먼저, 그다음 set01, set02 ...
    base = {'CLAUDE-q1-law.js': 0, 'CLAUDE-q1-general.js': 1, 'CLAUDE-q1-diag.js': 2}
    return (base.get(p.name, 10), p.name)


def update_index():
    idx = SITE / 'index.html'
    s = idx.read_text(encoding='utf-8')
    tags = '\n'.join(f'<script src="data/{f.name}"></script>' for f in data_files())
    new, n = re.subn(r'<!-- DATA:START -->[\s\S]*?<!-- DATA:END -->',
                     f'<!-- DATA:START -->\n{tags}\n<!-- DATA:END -->', s)
    if n != 1:
        sys.exit('index.html에서 DATA 표시를 찾지 못했습니다.')
    idx.write_text(new, encoding='utf-8')
    return s != new


def private_files():
    d = SITE / 'private'
    return sorted(d.glob('CLAUDE-*.js')) if d.exists() else []


def build_artifact(out, with_private=False):
    """Artifact 게시용: 문서 골격 없이 title/meta/style + 본문 + 데이터 인라인."""
    s = (SITE / 'index.html').read_text(encoding='utf-8')
    head = re.search(r'<head>([\s\S]*?)</head>', s).group(1)
    body = re.search(r'<body>([\s\S]*?)</body>', s).group(1)
    keep = []
    for pat in [r'<title>[\s\S]*?</title>', r'<meta name="claude:viewport-fit-sides"[^>]*>',
                r'<meta name="description"[^>]*>', r'<link rel="icon"[^>]*>',
                r'<link rel="preconnect"[^>]*>', r'<link rel="stylesheet"[^>]*>', r'<style>[\s\S]*?</style>']:
        keep += re.findall(pat, head)
    inline = []
    for f in data_files() + (private_files() if with_private else []):
        js = f.read_text(encoding='utf-8').replace('</script', '<\\/script')
        inline.append(f'<script>/* {f.name} */\n{js}\n</script>')
    # repl을 함수로 넘겨야 데이터 속 \n 같은 역슬래시가 줄바꿈으로 바뀌지 않음
    joined = '\n'.join(inline)
    body = re.sub(r'<!-- DATA:START -->[\s\S]*?<!-- DATA:END -->', lambda m: joined, body)
    # 홈 화면 추가(서비스워커)는 GitHub Pages 전용 — Artifact에서는 제거
    body = re.sub(r'/\* 홈 화면 추가[\s\S]*?catch\(e\)\{\}\n', '', body)
    pathlib.Path(out).write_text('\n'.join(keep) + '\n' + body, encoding='utf-8')
    print(f'artifact: {out} ({pathlib.Path(out).stat().st_size // 1024} KB)')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--artifact')
    ap.add_argument('--no-validate', action='store_true')
    ap.add_argument('--private', action='store_true', help='private/ 폴더(기출 원문)를 단일 파일에 포함 — 공개 금지')
    a = ap.parse_args()
    changed = update_index()
    print('index.html 데이터 목록', '갱신' if changed else '변경 없음', f'({len(data_files())}개 파일)')
    if not a.no_validate:
        r = subprocess.run(['node', str(ROOT / 'tools' / 'CLAUDE-validate-safety-exam.js')])
        if r.returncode:
            sys.exit(r.returncode)
    if a.artifact:
        build_artifact(a.artifact, a.private)


if __name__ == '__main__':
    main()
