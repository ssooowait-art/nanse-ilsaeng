# 난세일생 亂世一生

후한 말(150~280년), 이름 없는 백성으로 무작위로 태어나 실시간 선택으로 난세를 살아내는 삼국지 인생 시뮬레이션 웹 게임.

## 구조
- `src/nanse.html` 게임 원본 (HTML·CSS·JS 한 파일)
- `src/portraits.webp` 초상화 131장을 한 장에 담은 이미지, `src/*.png` 공유 이미지와 아이콘
- `tools/build.py` 원본을 배포본으로 만든다: `python3 tools/build.py [배포 주소]`
- `site/` 배포본. Cloudflare Pages가 이 폴더를 그대로 올린다 (빌드 명령 없음)
- `docs/portrait_prompts.md` 초상화 생성 프롬프트
- `functions/api/` 서버 함수 (천하 소식·묘비 벽), `lib/db.js` 서버 공용 코드

## 배포 (Cloudflare Pages)
- Framework preset: None / Build command: 비움 / Build output directory: `site`
- 주소가 `https://nanse-ilsaeng.pages.dev`와 다르면 `python3 tools/build.py https://실제주소`로 다시 빌드해 공유 미리보기 주소를 맞춘다.

## 고증
정사 「삼국지」(진수, 배송지 주), 「후한서」, 「진서」, 「자치통감」, 「화양국지」를 기준으로 했고, 「삼국지연의」의 장면은 소문이나 이야기꾼의 말로만 넣었다. 지도는 후한 군국 치소 좌표를 기준으로 나눈 근사치다.

## 사용한 것
- 글꼴: Song Myung, Gowun Batang, Gowun Dodum (Google Fonts, SIL OFL)
- 초상화: 이미지 생성 AI로 만든 그림

## 천하 소식·묘비 벽 (Cloudflare D1)
게임이 끝나면 `/api/life`로 생애 요약을 보내고, 시작 화면은 `/api/stats`로 오늘의 기록을 받아 온다. 데이터베이스가 연결되지 않으면 이 부분만 조용히 숨겨지고 게임은 그대로 돌아간다.

1. Cloudflare 대시보드 → Storage & Databases → D1 → Create → 이름 `nanse`
2. Workers & Pages → nanse-ilsaeng → Settings → Bindings → Add → D1 database → Variable name `DB`, Database `nanse`
3. Deployments에서 최신 배포를 Retry (바인딩은 새 배포부터 적용)

표는 첫 요청 때 자동으로 만들어진다. 한 사람 기록에 쓰기 약 7회가 들어서, D1 무료 한도(하루 쓰기 10만 회)로는 하루 약 1만 4천 판까지 기록된다. 그 이상은 Workers 유료 요금제(월 5달러)가 필요하다.
