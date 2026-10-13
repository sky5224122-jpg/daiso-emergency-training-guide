"""내레이션 음성 만들기 — Supertonic 3 한국어 음성, 문장마다 여러 번 합성해 가장 또렷한 테이크를 고른다.

사용법:
  python tools/make_narration.py --model <Supertonic 3 폴더> --asr <한국어 ASR 폴더> --out voice --sid 2 --takes 3

필요: pip install "sherpa-onnx>=1.13" soundfile numpy
모델:
  - Supertonic 3 (Supertone, OpenRAIL-M) — duration_predictor.onnx, text_encoder.onnx, vector_estimator.onnx,
    vocoder.onnx, tts.json, unicode_indexer.bin, voice.bin (sherpa-onnx 변환본)
    목소리 번호(sid): 0~4 여성, 5~9 남성
  - sherpa-onnx-zipformer-korean-2024-06-24 (k2-fsa/sherpa-onnx 릴리스 asr-models) — 또렷함 검사용
선택 기준: 한국어 음성인식 결과와 원문 사이의 글자 오류율(CER)이 가장 낮은 테이크
"""
import argparse
import json
import os
import re

import numpy as np
import sherpa_onnx as so
import soundfile as sf

ap = argparse.ArgumentParser()
ap.add_argument('--narration', default=os.path.join(os.path.dirname(__file__), 'narration.json'))
ap.add_argument('--model', required=True)
ap.add_argument('--asr', required=True)
ap.add_argument('--out', required=True)
ap.add_argument('--sid', type=int, default=2)
ap.add_argument('--takes', type=int, default=3)
ap.add_argument('--speed', type=float, default=1.0)
ap.add_argument('--steps', type=int, default=8)
args = ap.parse_args()

m = args.model
tts = so.OfflineTts(so.OfflineTtsConfig(model=so.OfflineTtsModelConfig(
    supertonic=so.OfflineTtsSupertonicModelConfig(
        duration_predictor=f'{m}/duration_predictor.onnx', text_encoder=f'{m}/text_encoder.onnx',
        vector_estimator=f'{m}/vector_estimator.onnx', vocoder=f'{m}/vocoder.onnx',
        tts_json=f'{m}/tts.json', unicode_indexer=f'{m}/unicode_indexer.bin', voice_style=f'{m}/voice.bin'),
    num_threads=4)))
a = args.asr
rec = so.OfflineRecognizer.from_transducer(
    encoder=f'{a}/encoder-epoch-99-avg-1.int8.onnx', decoder=f'{a}/decoder-epoch-99-avg-1.onnx',
    joiner=f'{a}/joiner-epoch-99-avg-1.int8.onnx', tokens=f'{a}/tokens.txt', num_threads=4)

DIG = {'0': '영', '1': '일', '2': '이', '3': '삼', '4': '사', '5': '오', '6': '육', '7': '칠', '8': '팔', '9': '구'}


def norm(t):
    return re.sub(r'[^가-힣]', '', ''.join(DIG.get(c, c) for c in t))


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


os.makedirs(args.out, exist_ok=True)
scenes = json.load(open(args.narration, encoding='utf-8'))
report = []
for sc in scenes:
    for i, ln in enumerate(sc['lines']):
        best = None
        for _ in range(args.takes):
            g = so.GenerationConfig()
            g.sid, g.speed, g.num_steps, g.extra = args.sid, args.speed, args.steps, {'lang': 'ko'}
            au = tts.generate(ln['tts'], g)
            x = np.array(au.samples, dtype=np.float32)
            st = rec.create_stream(); st.accept_waveform(au.sample_rate, x); rec.decode_stream(st)
            c = cer(ln['tts'], st.result.text)
            if best is None or c < best[0]:
                best = (c, x, au.sample_rate, st.result.text)
        fn = f"{args.out}/{sc['id']}_{i}.wav"
        sf.write(fn, best[1], best[2])
        report.append((round(best[0], 2), len(best[1]) / best[2]))
        print(f"{fn}  CER {best[0]:.2f}  {len(best[1]) / best[2]:.2f}s  {best[3]}", flush=True)
print('mean CER', round(sum(r[0] for r in report) / len(report), 3), ' total', round(sum(r[1] for r in report), 1), 's')
