# 비상대응훈련 실행 가이드

아성다이소 매장 **비상대응훈련 웹앱** 사용법을 점장·관리감독자에게 안내하는 모바일/PC 겸용 가이드입니다.
2026년 하반기 훈련 주제(CPR·응급환자 대응)와 실제 앱 화면을 기준으로 작성했습니다.

- 가이드 주소: https://sky5224122-jpg.github.io/daiso-emergency-training-guide/
- 훈련 앱 주소: https://asung-daiso-emergency-training.web.app/

## 구성

| 화면 | 내용 |
|---|---|
| 첫 화면 영상 | 2분 음성·자막 안내 영상. 처음 방문 시 끝까지 시청 후 입장(한 번 본 기기는 바로 입장) |
| 메인 | 안내 영상, 제출 전 필수 항목, 하반기 훈련 일정(영업부별), 훈련 주제·용어 풀이·실행 근거 |
| 접속 방법 | 휴대폰 접속 QR, PC 주소 복사·바로 열기, 로그인 순서(실제 화면) |
| 훈련 실행 가이드 | ① 훈련계획 ② 사전교육 ③ 실행기록 ④ 전자서명 ⑤ 제출 — 단계별 실제 앱 화면(누르면 크게 보기) |
| 제출·승인 | 관리감독자 제출 → 안전보건팀 최종 승인, 승인 확인 5가지, 상태별 대응 |
| FAQ · 검색 | 현장 질문 14개, 키워드 검색 |

## 파일

```
index.html                  가이드 본문 (단일 파일)
assets/intro-video.mp4      안내 영상 (1280x720, 약 2분, 음성·자막)
assets/intro-poster.jpg     영상 첫 화면
assets/screens/*.png        실제 앱 화면 캡처 (2026 하반기)
assets/qr-app.png           훈련 앱 접속 QR
assets/qr-code.png          이 가이드 접속 QR
tools/narration.json        영상 내레이션 대본(음성용 문장 / 자막 문장)
tools/make_narration.py     내레이션 음성 생성 (오프라인 한국어 음성)
tools/build_intro_video.py  안내 영상 제작
.nojekyll                   GitHub Pages가 파일을 그대로 배포하도록 지정
```

## 영상 다시 만들기

1. `tools/narration.json`의 대본을 고칩니다. `tts`는 읽을 문장(숫자는 한글로), `sub`는 화면 자막입니다.
2. 음성 생성: `python tools/make_narration.py tools/narration.json voice 10 0.5`
3. 영상 제작: `python tools/build_intro_video.py --voice voice --fonts <Pretendard 폴더>`
   - 장면 배치만 확인: `--preview 12,30,60` (해당 초의 장면을 PNG로 저장)

화면 캡처를 바꿀 때는 `assets/screens/`의 같은 이름 파일을 교체한 뒤 영상을 다시 만듭니다.

## 수정할 때

- 문구는 `index.html`에서 바로 고칩니다. FAQ는 `FAQ`, 검색은 `DATA`, 훈련 일정은 `SCHEDULE` 배열에 있습니다.
- 글자 크기는 정수(px)로만 지정합니다.
- 계정 비밀번호나 개인정보가 보이는 화면은 이 저장소에 올리지 않습니다 (공개 저장소).
