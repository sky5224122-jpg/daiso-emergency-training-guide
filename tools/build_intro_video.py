"""비상대응훈련 앱 실행 가이드 — 음성 안내 영상 만들기.

사용법:
  python tools/build_intro_video.py --voice <문장별 wav 폴더> --fonts <Pretendard 폴더>

- 문장별 음성은 tools/narration.json 의 id_번호.wav (예: plan_0.wav) 이름으로 준비합니다.
- 결과: assets/intro-video.mp4 (1280x720, 음성 포함), assets/intro-poster.jpg
"""
import argparse
import json
import math
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
SCREENS = ASSETS / 'screens'

W, H, FPS = 1280, 720, 25
SR = 44100
XFADE = 0.35

NAVY = (15, 34, 68)
NAVY2 = (30, 58, 110)
BLUE = (43, 94, 167)
RED = (208, 39, 45)
WHITE = (255, 255, 255)
TEXT = (17, 24, 39)
MUTED = (82, 98, 122)
BG = (238, 242, 248)
LINE = (216, 224, 235)

STEPS = ['접속', '훈련계획', '사전교육', '실행기록', '전자서명', '제출·승인']

# 장면 구성: 문장(line)마다 보여줄 화면, 카메라(시작→끝), 강조 영역 (원본 이미지 좌표)
SCENES = [
    {'id': 'intro', 'kind': 'title'},
    {'id': 'login', 'step': 0, 'label': 'STEP 1', 'title': '접속 · 로그인',
     'bullets': ['PC·모바일 같은 주소로 접속', '아이디: store-매장번호', '화면 위 매장 이름 확인'],
     'qr': 'qr-app.png',
     'shots': [
         {'img': 'login.png', 'fit': True},
         {'img': 'login.png', 'fit': True, 'hl': (30, 390, 462, 160)},
     ]},
    {'id': 'flow', 'step': 1, 'label': 'STEP 2', 'title': '훈련계획 · 흐름도',
     'bullets': ['대응 순서·역할을 한눈에', '흐름도 인쇄(A4) 후 현장 비치'],
     'shots': [
         {'img': 'plan-flow.png', 'cam': [(236, 0, 1132), (280, 110, 900)], 'hl': (288, 250, 1246, 175)},
         {'img': 'plan-flow.png', 'cam': [(640, 40, 900), (760, 70, 760)], 'hl': (1380, 132, 152, 42)},
     ]},
    {'id': 'plan', 'step': 1, 'label': 'STEP 2', 'title': '훈련계획 · 필수 입력',
     'bullets': ['안전 통제·구급차 인계 장소', '역할 7가지·응급의료기관·AED', '참여 직원·교육/훈련 일정'],
     'shots': [
         {'img': 'plan-basic.png', 'cam': [(0, 0, 1010), (0, 120, 760)], 'hl': (16, 264, 310, 106)},
         {'img': 'plan-roles.png', 'cam': [(0, 0, 954), (0, 150, 760)], 'hl': (20, 168, 1252, 318)},
         {'img': 'plan-contacts.png', 'cam': [(0, 120, 1100), (0, 300, 820)], 'hl': (12, 464, 1278, 156)},
     ]},
    {'id': 'edu', 'step': 2, 'label': 'STEP 3', 'title': '사전교육',
     'bullets': ['훈련과정 교육자료로 전 직원 교육', '심폐소생술·체크리스트 바로 열기'],
     'shots': [
         {'img': 'plan-course.png', 'cam': [(0, 0, 1315), (0, 20, 1000)], 'hl': (10, 52, 1296, 186)},
         {'img': 'plan-course.png', 'cam': [(0, 160, 1000), (0, 240, 780)], 'hl': (18, 352, 690, 82)},
     ]},
    {'id': 'stages', 'step': 3, 'label': 'STEP 4', 'title': '실행기록 · 1·2·3차',
     'bullets': ['1차 반응·호흡 확인·119 신고', '2차 가슴압박·AED 적용', '3차 교대·구급대 인계', '공통 증빙사진 1회 첨부'],
     'shots': [
         {'img': 'record-stages.png', 'cam': [(0, 160, 1100), (0, 250, 900)], 'hl': (36, 340, 1306, 248)},
         {'img': 'record-stages.png', 'cam': [(0, 330, 1100), (0, 400, 900)], 'hl': (36, 594, 1306, 248)},
         {'img': 'record-timeline.png', 'cam': [(0, 0, 1100), (0, 0, 860)], 'hl': (12, 36, 1310, 252)},
         {'img': 'record-stages.png', 'cam': [(0, 40, 1100), (0, 60, 820)], 'hl': (36, 154, 1306, 178)},
     ]},
    {'id': 'record', 'step': 3, 'label': 'STEP 4', 'title': '실행기록 · 결과',
     'bullets': ['조치 타임라인 — 시각·책임자', '대응기록·구호·추가피해 방지·결과 평가'],
     'shots': [
         {'img': 'record-timeline.png', 'cam': [(0, 240, 1100), (0, 320, 900)], 'hl': (12, 318, 1310, 530)},
         {'img': 'record-response.png', 'cam': [(0, 0, 1333), (0, 20, 1050)], 'hl': (4, 20, 1328, 404)},
     ]},
    {'id': 'safety', 'step': 3, 'label': '안전 수칙', 'title': '모의 훈련 주의', 'warn': True,
     'bullets': ['사람에게 실제 압박·AED 충격 금지', '마네킹 등 교육용 장비 사용', '실제 상황은 즉시 119 신고'],
     'shots': [
         {'img': 'record-response.png', 'cam': [(0, 0, 1100), (0, 40, 760)], 'hl': (16, 82, 1316, 44)},
     ]},
    {'id': 'sign', 'step': 4, 'label': 'STEP 5', 'title': '전자서명',
     'bullets': ['QR·서명 주소 공유 → 직원 서명', '점장 관리감독자 서명'],
     'shots': [
         {'img': 'sign.png', 'cam': [(400, 0, 930), (570, 40, 760)], 'hl': (706, 84, 620, 300)},
         {'img': 'sign.png', 'cam': [(0, 0, 930), (0, 30, 760)], 'hl': (26, 64, 624, 234)},
     ]},
    {'id': 'submit', 'step': 5, 'label': 'STEP 6', 'title': '제출 · 승인',
     'bullets': ['관리감독자 제출 → 안전보건팀 최종 승인', '반려·수정 지시 → 보완 후 재제출'],
     'shots': [
         {'img': 'approval.png', 'cam': [(0, 0, 1240), (0, 0, 980)], 'hl': (16, 40, 640, 304)},
         {'img': 'approval.png', 'cam': [(0, 160, 1240), (0, 200, 1100)], 'hl': (18, 378, 1322, 294)},
     ]},
    {'id': 'outro', 'kind': 'outro'},
]


# ───────────────────────── 공통 그리기 도구 ─────────────────────────
class Fonts:
    def __init__(self, folder):
        self.folder = Path(folder)
        self.cache = {}

    def __call__(self, size, weight='Regular'):
        key = (size, weight)
        if key not in self.cache:
            self.cache[key] = ImageFont.truetype(str(self.folder / f'Pretendard-{weight}.otf'), size)
        return self.cache[key]


def ease(t):
    t = min(max(t, 0.0), 1.0)
    return t * t * (3 - 2 * t)


def wrap(draw, text, font, max_w):
    lines, cur = [], ''
    for word in text.split(' '):
        trial = (cur + ' ' + word).strip()
        if draw.textlength(trial, font=font) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def shadow_card(size, radius, fill, blur=18, offset=(0, 10), alpha=60):
    w, h = size
    pad = blur * 3
    sh = Image.new('RGBA', (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle((pad, pad, pad + w, pad + h), radius, fill=(15, 23, 42, alpha))
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    card = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(card).rounded_rectangle((0, 0, w - 1, h - 1), radius, fill=fill)
    return sh, pad, card


def paste_shadowed(base, xy, size, radius, fill, **kw):
    sh, pad, card = shadow_card(size, radius, fill, **kw)
    off = kw.get('offset', (0, 10))
    base.alpha_composite(sh, (xy[0] - pad + off[0], xy[1] - pad + off[1]))
    base.alpha_composite(card, xy)


# ───────────────────────── 화면 구성 요소 ─────────────────────────
PANEL = (40, 100, 800, 474)          # 브라우저 창 (x, y, w, h)
BAR_H = 34                            # 주소창 높이
VIEW = (PANEL[0], PANEL[1] + BAR_H, PANEL[2], PANEL[3] - BAR_H)
CARD = (868, 100, 372, 474)


def header(img, F, step):
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W, 76), fill=NAVY)
    d.rounded_rectangle((34, 18, 74, 58), 10, fill=RED)
    d.text((54, 38), 'D', font=F(24, 'Black'), fill=WHITE, anchor='mm')
    d.text((88, 20), '아성다이소 비상대응훈련', font=F(20, 'Bold'), fill=WHITE)
    d.text((88, 46), 'CPR·응급환자 대응 앱 실행 가이드', font=F(14, 'Medium'), fill=(184, 201, 228))
    x = W - 34
    for i in range(len(STEPS) - 1, -1, -1):
        label = STEPS[i]
        f = F(14, 'Bold' if i == step else 'Medium')
        tw = d.textlength(label, font=f)
        bw = tw + 28
        x0 = x - bw
        if i == step:
            d.rounded_rectangle((x0, 24, x, 52), 14, fill=RED)
            d.text((x0 + bw / 2, 38), label, font=f, fill=WHITE, anchor='mm')
        else:
            done = step is not None and i < step
            d.rounded_rectangle((x0, 24, x, 52), 14, outline=(78, 104, 150), width=1,
                                fill=(30, 52, 92) if done else None)
            d.text((x0 + bw / 2, 38), label, font=f, fill=(206, 218, 238) if done else (140, 160, 196),
                   anchor='mm')
        x = x0 - 8


def browser_frame(img, F):
    x, y, w, h = PANEL
    paste_shadowed(img, (x, y), (w, h), 14, WHITE, blur=16, alpha=55)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((x, y, x + w - 1, y + BAR_H + 8), 14, fill=(232, 236, 243))
    d.rectangle((x, y + BAR_H, x + w - 1, y + BAR_H + 8), fill=WHITE)
    d.line((x, y + BAR_H, x + w, y + BAR_H), fill=LINE, width=1)
    for i, c in enumerate([(255, 95, 87), (255, 189, 46), (40, 200, 64)]):
        d.ellipse((x + 16 + i * 18, y + 12, x + 26 + i * 18, y + 22), fill=c)
    d.rounded_rectangle((x + 84, y + 7, x + w - 18, y + 27), 10, fill=WHITE)
    d.text((x + 100, y + 17), 'asung-daiso-emergency-training.web.app', font=F(12, 'Medium'),
           fill=MUTED, anchor='lm')


def info_card(F, sc, active):
    x, y, w, h = CARD
    warn = sc.get('warn')
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    paste_shadowed(layer, (x, y), (w, h), 16, WHITE, blur=16, alpha=50)
    d = ImageDraw.Draw(layer)
    accent = RED if warn else BLUE
    d.rounded_rectangle((x + 24, y + 26, x + 24 + 10 + d.textlength(sc['label'], font=F(13, 'Bold')) + 10, y + 52),
                        13, fill=(253, 235, 236) if warn else (226, 236, 250))
    d.text((x + 34, y + 39), sc['label'], font=F(13, 'Bold'), fill=accent, anchor='lm')
    ty = y + 66
    for line in wrap(d, sc['title'], F(30, 'ExtraBold'), w - 48):
        d.text((x + 24, ty), line, font=F(30, 'ExtraBold'), fill=TEXT)
        ty += 40
    ty += 12
    for i, b in enumerate(sc['bullets']):
        on = i == active
        f = F(17, 'Bold' if on else 'Medium')
        lines = wrap(d, b, f, w - 48 - 40)
        bh = 22 * len(lines) + 22
        if on:
            d.rounded_rectangle((x + 16, ty - 8, x + w - 16, ty - 8 + bh), 12,
                                fill=(253, 235, 236) if warn else (232, 240, 252))
        cx, cy = x + 38, ty + 11
        d.ellipse((cx - 11, cy - 11, cx + 11, cy + 11), fill=accent if on else (203, 213, 228))
        d.text((cx, cy), str(i + 1), font=F(12, 'Bold'), fill=WHITE, anchor='mm')
        for k, ln in enumerate(lines):
            d.text((x + 60, ty + k * 22), ln, font=f, fill=TEXT if on else MUTED)
        ty += bh + 6
    if sc.get('qr'):
        q = Image.open(ASSETS / sc['qr']).convert('RGB').resize((112, 112), Image.LANCZOS)
        qy = y + h - 136
        d.rounded_rectangle((x + 16, qy - 8, x + w - 16, qy + 120), 12, fill=(244, 247, 251))
        layer.paste(q, (x + 24, qy))
        d.text((x + 150, qy + 30), '휴대폰 카메라로', font=F(15, 'Medium'), fill=MUTED)
        d.text((x + 150, qy + 54), '스캔하면 앱 바로 열기', font=F(17, 'Bold'), fill=TEXT)
    return layer


def subtitle_layer(F, text):
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    f = F(25, 'SemiBold')
    lines = wrap(d, text, f, W - 220)
    lh = 36
    bh = lh * len(lines) + 26
    y0 = H - 22 - bh
    bw = max(d.textlength(l, font=f) for l in lines) + 64
    x0 = (W - bw) / 2
    d.rounded_rectangle((x0, y0, x0 + bw, y0 + bh), 14, fill=(10, 20, 40, 214))
    for i, l in enumerate(lines):
        d.text((W / 2, y0 + 13 + lh * i + lh / 2), l, font=f, fill=WHITE, anchor='mm')
    return layer


# ───────────────────────── 화면(스크린샷) 카메라 ─────────────────────────
_img_cache = {}


def load_shot(name):
    if name not in _img_cache:
        _img_cache[name] = Image.open(SCREENS / name).convert('RGB')
    return _img_cache[name]


def clamp_cam(cam, iw, ih, aspect):
    x, y, w = cam
    w = min(w, iw, ih * aspect)
    h = w / aspect
    x = min(max(0, x), iw - w)
    y = min(max(0, y), ih - h)
    return x, y, w, h


def render_view(shot, t):
    """t: 0~1 진행률. 화면 영역 이미지와 강조 영역(화면 좌표)을 돌려준다."""
    vx, vy, vw, vh = VIEW
    aspect = vw / vh
    src = load_shot(shot['img'])
    iw, ih = src.size
    if shot.get('fit'):
        canvas = Image.new('RGB', (vw, vh), (244, 247, 251))
        z = 1.0 + 0.05 * ease(t)
        s = min((vw - 40) / iw, (vh - 24) / ih) * z
        im = src.resize((int(iw * s), int(ih * s)), Image.BILINEAR)
        ox, oy = (vw - im.width) // 2, (vh - im.height) // 2
        canvas.paste(im, (ox, oy))
        hl = shot.get('hl')
        rect = (ox + hl[0] * s, oy + hl[1] * s, hl[2] * s, hl[3] * s) if hl else None
        return canvas, rect
    a = clamp_cam(shot['cam'][0], iw, ih, aspect)
    b = clamp_cam(shot['cam'][1], iw, ih, aspect)
    e = ease(t)
    x, y, w, h = [a[i] + (b[i] - a[i]) * e for i in range(4)]
    crop = src.crop((int(x), int(y), int(x + w), int(y + h))).resize((vw, vh), Image.BILINEAR)
    hl = shot.get('hl')
    rect = None
    if hl:
        s = vw / w
        rect = ((hl[0] - x) * s, (hl[1] - y) * s, hl[2] * s, hl[3] * s)
    return crop, rect


def draw_highlight(img, rect, t_line, warn=False):
    if not rect or t_line < 0.18:
        return
    vx, vy, vw, vh = VIEW
    a = ease((t_line - 0.18) / 0.12)
    x, y, w, h = rect
    x0, y0 = max(vx + 4, vx + x - 6), max(vy + 4, vy + y - 6)
    x1, y1 = min(vx + vw - 4, vx + x + w + 6), min(vy + vh - 4, vy + y + h + 6)
    if x1 <= x0 or y1 <= y0:
        return
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    # 강조 영역 밖은 살짝 어둡게
    dim = int(70 * a)
    d.rectangle((vx, vy, vx + vw, vy + vh), fill=(15, 23, 42, dim))
    d.rounded_rectangle((x0, y0, x1, y1), 10, fill=(0, 0, 0, 0))
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).rounded_rectangle((x0, y0, x1, y1), 10, fill=255)
    layer.putalpha(Image.composite(Image.new('L', (W, H), 0), layer.getchannel('A'), mask))
    d = ImageDraw.Draw(layer)
    pulse = 0.5 + 0.5 * math.sin(t_line * math.pi * 6)
    col = RED + (int(255 * a),)
    d.rounded_rectangle((x0, y0, x1, y1), 10, outline=col, width=4)
    if pulse > 0 and a >= 1:
        d.rounded_rectangle((x0 - 4, y0 - 4, x1 + 4, y1 + 4), 13,
                            outline=RED + (int(90 * pulse),), width=3)
    img.alpha_composite(layer)


# ───────────────────────── 제목 · 마무리 화면 ─────────────────────────
def gradient_bg():
    y = np.linspace(0, 1, H)[:, None]
    x = np.linspace(0, 1, W)[None, :]
    t = np.clip(0.55 * y + 0.45 * x, 0, 1)[..., None]
    c0, c1 = np.array((10, 24, 52)), np.array((36, 74, 140))
    arr = (c0 * (1 - t) + c1 * t).astype(np.uint8)
    return Image.fromarray(arr, 'RGB').convert('RGBA')


ECG = [(0, 0), (0.30, 0), (0.34, -0.25), (0.37, 0.15), (0.40, -1.0), (0.44, 0.9), (0.47, 0), (0.55, 0),
       (0.58, -0.2), (0.62, 0), (1.0, 0)]


def title_frame(F, tsec, base):
    img = base.copy()
    d = ImageDraw.Draw(img)
    # 심전도 선 (그려지는 애니메이션)
    prog = ease(tsec / 1.6)
    pts = [(80 + p[0] * 1120, 572 + p[1] * 46) for p in ECG]
    total = sum(math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1))
    left = total * prog
    for i in range(len(pts) - 1):
        seg = math.dist(pts[i], pts[i + 1])
        if left <= 0:
            break
        f = min(1, left / seg)
        p1 = (pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f)
        d.line((pts[i], p1), fill=(255, 107, 112), width=4)
        left -= seg

    def fade_text(xy, text, font, fill, delay, anchor='la'):
        a = ease((tsec - delay) / 0.6)
        if a <= 0:
            return
        layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(layer).text((xy[0], xy[1] + 18 * (1 - a)), text, font=font, fill=fill + (int(255 * a),),
                                   anchor=anchor)
        img.alpha_composite(layer)

    a = ease(tsec / 0.6)
    if a > 0:
        layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer)
        ld.rounded_rectangle((80, 150, 380, 192), 21, fill=(208, 39, 45, int(255 * a)))
        ld.text((230, 171), '2026 하반기 · 아성다이소 안전보건팀', font=F(16, 'Bold'), fill=(255, 255, 255, int(255 * a)),
                anchor='mm')
        img.alpha_composite(layer)
    fade_text((80, 222), '비상대응훈련', F(64, 'Black'), WHITE, 0.2)
    fade_text((80, 304), '앱 실행 가이드', F(64, 'Black'), WHITE, 0.35)
    fade_text((82, 400), 'CPR·응급환자 대응 — 계획부터 제출까지 한 번에', F(24, 'Medium'), (196, 212, 238), 0.6)
    chips = ['1차  반응·호흡·119', '2차  가슴압박·AED', '3차  교대·구급대 인계']
    x = 82
    for i, c in enumerate(chips):
        a = ease((tsec - 0.9 - i * 0.15) / 0.5)
        if a <= 0:
            continue
        f = F(18, 'Bold')
        tw = ImageDraw.Draw(img).textlength(c, font=f)
        layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer)
        ld.rounded_rectangle((x, 456, x + tw + 36, 498), 21, fill=(255, 255, 255, int(28 * a)),
                             outline=(255, 255, 255, int(90 * a)), width=1)
        ld.text((x + 18, 477), c, font=f, fill=(255, 255, 255, int(255 * a)), anchor='lm')
        img.alpha_composite(layer)
        x += tw + 50
    return img


def outro_frame(F, tsec, base):
    img = base.copy()
    d = ImageDraw.Draw(img)
    a = ease(tsec / 0.6)
    d.text((W / 2, 118), '지금 바로 훈련을 시작하세요', font=F(44, 'Black'), fill=WHITE, anchor='mm')
    d.text((W / 2, 170), '함께 지키는 안전 · 작은 실천이 큰 변화를 만듭니다', font=F(20, 'Medium'),
           fill=(196, 212, 238), anchor='mm')
    for i, (q, label, url) in enumerate([('qr-app.png', '훈련 앱', 'asung-daiso-emergency-training.web.app'),
                                         ('qr-code.png', '실행 가이드', 'sky5224122-jpg.github.io/daiso-emergency-training-guide')]):
        cx = W / 2 + (-230 if i == 0 else 230)
        aa = ease((tsec - 0.2 - i * 0.2) / 0.5)
        if aa <= 0:
            continue
        layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        paste_shadowed(layer, (int(cx - 190), 214), (380, 330), 18, (255, 255, 255, 255), blur=18, alpha=90)
        q_img = Image.open(ASSETS / q).convert('RGB').resize((200, 200), Image.LANCZOS)
        layer.paste(q_img, (int(cx - 100), 236))
        ld = ImageDraw.Draw(layer)
        ld.text((cx, 470), label, font=F(26, 'ExtraBold'), fill=NAVY, anchor='mm')
        ld.text((cx, 508), url, font=F(13, 'Medium'), fill=MUTED, anchor='mm')
        layer.putalpha(Image.eval(layer.getchannel('A'), lambda v: int(v * aa)))
        img.alpha_composite(layer)
    return img


# ───────────────────────── 타임라인 · 오디오 ─────────────────────────
def build_timeline(narr, voice_dir):
    lines = {s['id']: s['lines'] for s in narr}
    timeline, audio, t = [], [], 0.0
    for sc in SCENES:
        lead = 1.3 if sc.get('kind') == 'title' else 0.4
        tail = 1.9 if sc.get('kind') == 'outro' else 0.45
        start = t
        t += lead
        segs = []
        for i, ln in enumerate(lines[sc['id']]):
            wav, sr = sf.read(voice_dir / f"{sc['id']}_{i}.wav", dtype='float32')
            if wav.ndim > 1:
                wav = wav.mean(axis=1)
            dur = len(wav) / sr
            segs.append({'start': t, 'end': t + dur, 'sub': ln['sub']})
            audio.append((t, wav, sr))
            t += dur + 0.3
        t += tail - 0.3
        timeline.append({'scene': sc, 'start': start, 'end': t, 'segs': segs})
    return timeline, audio, t


def mix_audio(audio, total, out_wav):
    buf = np.zeros(int(total * SR) + SR, dtype=np.float32)
    for start, wav, sr in audio:
        if sr != SR:
            idx = np.arange(0, len(wav), sr / SR)
            wav = np.interp(idx, np.arange(len(wav)), wav).astype(np.float32)
        i = int(start * SR)
        buf[i:i + len(wav)] += wav
    sf.write(out_wav, buf[:int(total * SR)], SR)


# ───────────────────────── 렌더링 ─────────────────────────
def scene_frame(F, item, tsec, statics):
    sc = item['scene']
    local = tsec - item['start']
    if sc.get('kind') == 'title':
        img = title_frame(F, local, statics['title'])
    elif sc.get('kind') == 'outro':
        img = outro_frame(F, local, statics['outro'])
    else:
        segs = item['segs']
        idx = 0
        for i, s in enumerate(segs):
            if tsec >= s['start'] - 0.25:
                idx = i
        seg = segs[idx]
        seg_start = seg['start'] - (0.45 if idx == 0 else 0.25)
        seg_end = segs[idx + 1]['start'] - 0.25 if idx + 1 < len(segs) else item['end']
        t_line = (tsec - seg_start) / max(0.1, seg_end - seg_start)
        shot = sc['shots'][min(idx, len(sc['shots']) - 1)]
        img = statics[sc['id']].copy()
        view, rect = render_view(shot, t_line)
        img.paste(view, VIEW[:2])
        draw_highlight(img, rect, t_line, sc.get('warn'))
        key = (sc['id'], idx)
        if key not in statics:
            statics[key] = info_card(F, sc, idx)
        img.alpha_composite(statics[key])
    # 자막
    for s in item['segs']:
        if s['start'] - 0.15 <= tsec <= s['end'] + 0.25:
            key = ('sub', s['sub'])
            if key not in statics:
                statics[key] = subtitle_layer(F, s['sub'])
            img.alpha_composite(statics[key])
            break
    return img


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--voice', required=True, type=Path)
    ap.add_argument('--fonts', required=True, type=Path)
    ap.add_argument('--out', default=str(ASSETS / 'intro-video.mp4'))
    ap.add_argument('--poster', default=str(ASSETS / 'intro-poster.jpg'))
    ap.add_argument('--work', default='/tmp/intro_video_work', type=Path)
    ap.add_argument('--preview', default='', help='쉼표로 구분한 초 단위 시각: 해당 장면만 PNG로 저장')
    args = ap.parse_args()
    F = Fonts(args.fonts)
    narr = json.loads((ROOT / 'tools' / 'narration.json').read_text(encoding='utf-8'))
    timeline, audio, total = build_timeline(narr, args.voice)
    args.work.mkdir(parents=True, exist_ok=True)
    wav_path = args.work / 'narration.wav'
    mix_audio(audio, total, wav_path)
    print(f'total {total:.1f}s, scenes {len(timeline)}')

    statics = {'title': gradient_bg(), 'outro': gradient_bg()}
    for item in timeline:
        sc = item['scene']
        if sc.get('kind'):
            continue
        base = Image.new('RGBA', (W, H), BG + (255,))
        header(base, F, sc['step'])
        browser_frame(base, F)
        statics[sc['id']] = base

    if args.preview:
        for ts in [float(v) for v in args.preview.split(',')]:
            cur = next(it for it in timeline if it['start'] <= ts < it['end'] or it is timeline[-1])
            scene_frame(F, cur, ts, statics).convert('RGB').save(args.work / f'preview_{ts:06.1f}.png')
        for it in timeline:
            print(f"{it['scene']['id']:8} {it['start']:6.1f} → {it['end']:6.1f}")
        return

    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
           '-r', str(FPS), '-i', '-', '-i', str(wav_path),
           '-af', 'highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,loudnorm=I=-16:TP=-1.5:LRA=11',
           '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p', '-tune', 'stillimage',
           '-c:a', 'aac', '-b:a', '128k', '-ar', str(SR), '-movflags', '+faststart', '-shortest', args.out]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    n = int(total * FPS)
    prev_last = None
    poster_saved = False
    for fi in range(n):
        tsec = fi / FPS
        cur = next(it for it in timeline if it['start'] <= tsec < it['end'] or it is timeline[-1])
        img = scene_frame(F, cur, tsec, statics)
        ci = timeline.index(cur)
        if ci > 0 and tsec - cur['start'] < XFADE:
            prev = timeline[ci - 1]
            pimg = scene_frame(F, prev, min(tsec, prev['end'] - 1 / FPS), statics)
            img = Image.blend(pimg, img, ease((tsec - cur['start']) / XFADE))
        frame = img.convert('RGB')
        if not poster_saved and cur['scene'].get('kind') == 'title' and tsec >= 2.6:
            frame.save(args.poster, quality=88)
            poster_saved = True
        proc.stdin.write(frame.tobytes())
        if fi % 250 == 0:
            print(f'frame {fi}/{n}', flush=True)
    proc.stdin.close()
    proc.wait()
    print('saved', args.out)


if __name__ == '__main__':
    main()
