# carusworks.com

AI 에이전틱 SI 기업 carusworks의 홈페이지 저장소입니다. `main` 브랜치가 GitHub Pages로 https://carusworks.com 에 배포됩니다(`CNAME`, `.nojekyll`, 빌드 단계 없음).

## 구조

```
index.html                 랜딩 페이지 한 장 (CSS·JS 인라인)
assets/
  brand/                   로고(logo-b, logo-b-light), mark.svg, og.jpg, 아이콘
  library/                 사진·영상 에셋 (히어로 04, 적용 분야 05~07 등) + 에셋 목록 페이지 index.html
  architecture/            Carusmap — AI 플랫폼 아키텍처 구성도 SVG (랜딩 #platform 섹션과 같은 그림)
  _archive/                지금 쓰지 않는 옛 에셋 (지우지 않고 보관)
docs/
  개발법/                  개발 원칙 공개판
  제품기획/                제품 기획 문서
  정부과제/                공고 원문·정리
  MCP-배포-가이드.md
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
- 에셋을 바꾸면 쿼리 버전을 올립니다(현재 `?v=b3`).
- 페이지에 쓰지 않는 말: 지주, 본사, 대기, 브랜치, 레인, 공장, 진열, 쿠폰 한 장, Holding, Standby.
- 확인되지 않은 수치·고객 로고·성과는 넣지 않습니다. 예시는 "예시"라고 적습니다.

## 올리기 전 확인
1. 1440과 360 폭에서 가로 스크롤 없음
2. 위 금지어 0건
3. JSON-LD(Organization, FAQPage)가 파싱되고, FAQPage가 화면의 FAQ와 같음
4. 콘솔 오류 0
