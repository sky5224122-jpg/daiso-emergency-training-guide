# 비상대응훈련 실행 가이드

아성다이소 매장 **비상대응훈련 웹앱** 사용법을 점장·관리감독자에게 안내하는 모바일/PC 겸용 가이드 페이지입니다.
2026년 하반기 훈련 주제(CPR·응급환자 대응)에 맞춰 작성했습니다.

- 가이드 주소: https://sky5224122-jpg.github.io/daiso-emergency-training-guide/
- 훈련 앱 주소: https://asung-daiso-emergency-training.web.app/

## 구성

| 화면 | 내용 |
|---|---|
| 메인 | 제출 전 필수 항목, 이번 반기 훈련 주제, 용어 풀이, 실행 근거, 모바일 접속 QR |
| 접속 방법 | 앱 접속(PC·QR), 로그인 계정 형식, 화면 구성 |
| 훈련 실행 가이드 | ① 훈련계획 → ② 사전교육 → ③ 실행기록 → ④ 전자서명 → ⑤ 제출 |
| 제출·승인 | 승인 흐름, 승인 시 확인 5가지, 반려·수정 지시·철회 대응 |
| FAQ | 현장 질문 14개 |
| 검색 | 키워드로 안내 찾기 |

## 파일

```
index.html          가이드 본문 (외부 라이브러리 없는 단일 파일)
assets/qr-code.png  가이드 주소로 연결되는 QR 코드
.nojekyll           GitHub Pages가 파일을 그대로 배포하도록 지정
```

## GitHub Pages 배포

1. 저장소 **Settings → Pages** 이동
2. **Source**: `Deploy from a branch`
3. **Branch**: `main` / `/ (root)` 선택 후 **Save**
4. 1~2분 뒤 위 가이드 주소로 접속 확인

## 수정할 때

- 문구는 `index.html`에서 바로 고칩니다. FAQ는 `faqData`, 검색 내용은 `searchData` 배열에 있습니다.
- 글자 크기는 정수(px)로만 지정합니다.
- 계정 비밀번호나 개인정보는 이 저장소에 올리지 않습니다 (공개 저장소).
