# carusworks.com

AI 에이전틱 SI 기업 carusworks의 홈페이지 저장소입니다. `main` 브랜치가 GitHub Pages로 https://carusworks.com 에 배포됩니다(`CNAME`, `.nojekyll`, 빌드 단계 없음).

## 구조

```
index.html                 홈 — 한 줄 메시지, 말로 지시 예시, 세 기둥, Carusmap, 적용 분야, 문의 띠
solutions/index.html       솔루션 — 서비스 7개(아코디언), 구축 5단계, 말로 하는 업무 예시
platform/index.html        플랫폼 — Carusmap 구성도, 계층별 설명(아코디언)
trust/index.html           안전한 실행 — 절차·가상 검증·승인·실행, 보안 5가지, 비교표
contact/index.html         도입 상담 — 4단계 문의 폼, FAQ(아코디언, JSON-LD)
assets/
  cw.css · cw.js           모든 페이지가 함께 쓰는 스타일과 스크립트(메뉴, 예시 화면, 문의 폼)
  brand/                   로고(logo-b, logo-b-light), mark.svg, og.jpg, 아이콘
  library/                 사진·영상 에셋 + 에셋 목록 페이지 index.html
  architecture/            Carusmap — AI 플랫폼 아키텍처 구성도 SVG
  _archive/                지금 쓰지 않는 옛 에셋 (지우지 않고 보관)
docs/                      개발법 공개판, 제품기획, 정부과제, MCP 배포 가이드
```

## 연결된 제품 저장소
같은 엔진으로 만든 두 제품은 각자 저장소에서 따로 배포하고, 랜딩에서는 한 줄로만 연결합니다.

| 제품 | 저장소 | 주소 |
|---|---|---|
| AS · 에이전틱 스태프 | `ncaman/carusworks-AS` | https://ncaman.github.io/carusworks-AS/ |
| SMOS · 턴키 디바이스 | `ncaman/carusworks-SMOS` | https://ncaman.github.io/carusworks-SMOS/ |

## 고칠 때 규칙
- `index.html`(코드)과 `assets/library/`(사진·영상)는 한 쪽씩 맡습니다. 같은 파일을 두 사람이 동시에 고치지 않습니다.
- 작업 브랜치에서 고치고 PR로 `main`에 넣습니다. `main`에 바로 올리지 않습니다.
- 에셋을 바꾸면 쿼리 버전을 올립니다(사진·영상 `?v=b3`, 공통 스타일·스크립트 `?v=4`).
- 페이지 다섯 개는 같은 머리·꼬리를 씁니다. 메뉴를 바꾸면 다섯 곳을 같이 고칩니다.
- 페이지에 쓰지 않는 말: 지주, 본사, 대기, 브랜치, 레인, 공장, 진열, 쿠폰 한 장, Holding, Standby.
- 확인되지 않은 수치·고객 로고·성과는 넣지 않습니다. 예시는 "예시"라고 적습니다.

## 올리기 전 확인
1. 1440과 360 폭에서 가로 스크롤 없음
2. 위 금지어 0건
3. JSON-LD(Organization, FAQPage)가 파싱되고, FAQPage가 화면의 FAQ와 같음
4. 콘솔 오류 0
