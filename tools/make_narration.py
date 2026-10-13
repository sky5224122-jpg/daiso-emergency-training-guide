"""내레이션 음성 만들기 — 문장마다 여러 번 합성해 가장 또렷한 테이크를 고른다.

사용법:
  python tools/make_narration.py tools/narration.json <출력 폴더> <테이크 수> [noise_scale]

필요: pip install sherpa-onnx soundfile numpy
모델(작업 폴더에 압축 해제):
  - vits-mimic3-ko_KO-kss_low  (k2-fsa/sherpa-onnx 릴리스 tts-models)
  - sherpa-onnx-zipformer-korean-2024-06-24  (k2-fsa/sherpa-onnx 릴리스 asr-models)
선택 기준: 한국어 음성인식 결과와 원문 사이의 글자 오류율(CER)이 가장 낮은 테이크
"""
import json, os, re, sys
import numpy as np, sherpa_onnx, soundfile as sf

NARR, OUTDIR, N = sys.argv[1], sys.argv[2], int(sys.argv[3])
NOISE = float(sys.argv[4]) if len(sys.argv) > 4 else 0.667
d = 'vits-mimic3-ko_KO-kss_low'
tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
    vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=f'{d}/ko_KO-kss_low.onnx', tokens=f'{d}/tokens.txt',
                                               data_dir=f'{d}/espeak-ng-data', noise_scale=NOISE),
    num_threads=4)))
a = 'sherpa-onnx-zipformer-korean-2024-06-24'
rec = sherpa_onnx.OfflineRecognizer.from_transducer(
    encoder=f'{a}/encoder-epoch-99-avg-1.int8.onnx', decoder=f'{a}/decoder-epoch-99-avg-1.onnx',
    joiner=f'{a}/joiner-epoch-99-avg-1.int8.onnx', tokens=f'{a}/tokens.txt', num_threads=4)

DIG = {'0': '영', '1': '일', '2': '이', '3': '삼', '4': '사', '5': '오', '6': '육', '7': '칠', '8': '팔', '9': '구'}
def norm(t):
    t = ''.join(DIG.get(c, c) for c in t)
    return re.sub(r'[^가-힣]', '', t)

def cer(ref, hyp):
    r, h = norm(ref), norm(hyp)
    dp = list(range(len(h) + 1))
    for i in range(1, len(r) + 1):
        prev, dp[0] = dp[0], i
        for j in range(1, len(h) + 1):
            cur = dp[j]
            dp[j] = min(dp[j] + 1, dp[j - 1] + 1, prev + (r[i - 1] != h[j - 1]))
            prev = cur
    return dp[len(h)] / max(1, len(r))

os.makedirs(OUTDIR, exist_ok=True)
scenes = json.load(open(NARR, encoding='utf-8'))
report = []
for sc in scenes:
    for i, ln in enumerate(sc['lines']):
        best = None
        for k in range(N):
            au = tts.generate(ln['tts'], sid=0, speed=1.0)
            x = np.array(au.samples, dtype=np.float32)
            s = rec.create_stream(); s.accept_waveform(au.sample_rate, x); rec.decode_stream(s)
            c = cer(ln['tts'], s.result.text)
            if best is None or c < best[0]:
                best = (c, x, au.sample_rate, s.result.text)
        fn = f"{OUTDIR}/{sc['id']}_{i}.wav"
        sf.write(fn, best[1], best[2])
        report.append((fn, round(best[0], 2), round(len(best[1]) / best[2], 2), best[3]))
        print(f"{fn}  CER {best[0]:.2f}  {len(best[1]) / best[2]:.2f}s  {best[3]}", flush=True)
print('mean CER', round(sum(r[1] for r in report) / len(report), 3), ' total', round(sum(r[2] for r in report), 1), 's')
