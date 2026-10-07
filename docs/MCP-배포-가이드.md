# carusworks — MCP 배포·선물 가이드

> 자작 MCP를 외부(고객/파트너)에게 넘겨 "그대로 설치·구동"시키는 방법 정리.
> 2026-10-07. 근거: 실제 자작 MCP 구조(.claude.json 등록형태) 전수 확인.

---

## 1. MCP는 "확장자 하나"가 아니다 — 코드 프로그램이다
MCP 서버 = `.exe`/`.apk` 같은 단일 바이너리가 아니라, **MCP 프로토콜을 말하는 작은 프로그램**(보통 Python 또는 Node). stdio로 에이전트와 통신.

실제 자작 MCP 실행 형태(.claude.json):
- `node /home/dtsli/bin/devlog-mcp.mjs` — **Node 단일 파일**
- `.venv/bin/python3 eae_mcp_writer.py` — **Python + 전용 venv**
- OrbitPrompt `server.py`들 — **Python 단일 파일, 의존성 거의 없음**

→ "주는 것" = **코드 파일(.py/.mjs) + 실행 한 줄(command/args)**. 받는 사람이 자기 에이전트(Claude Desktop/Code/Cursor) MCP 설정에 그 한 줄을 넣으면 작동.

---

## 2. 넘기는 방법 3가지 (쉬운 순)

| 방법 | 받는 사람이 하는 것 | 그대로 구동 | 비고 |
|---|---|---|---|
| **① 코드 + config 한 줄** | 파일 받고 MCP 설정에 `command/args` 추가 | 의존성 맞으면 ✅ | 가장 흔함. 현재 운영방식 |
| **② PyPI/npm 배포** | `uvx <이름>` / `npx <이름>` 한 줄 | ✅ 제일 깔끔 | 공개 배포 필요 |
| **③ `.dxt` (Claude Desktop Extension)** | **더블클릭 원클릭 설치** | ✅ | ★"설치형 확장자" = 이것. MCP+manifest+의존성 zip |

→ "설치 가능한 확장자"의 정답 = **`.dxt`** (Claude Desktop용 원클릭 확장 패키지).

---

## 3. "그대로 구동되냐" = 의존성에 달림 (샘플 고를 때 핵심)

| 분류 | 예 | 선물 적합성 |
|---|---|---|
| **✅ 경량 (그대로 됨)** | OrbitPrompt의 mbti-mcp·dollar-system·philosophy-counter 등 — 의존성 파일 없음, `mcp` 패키지만 | **샘플 최적** |
| **🟡 중간 (키·venv 필요)** | eae-writer — venv + anthropic/openai API 키 | 키 세팅 안내 필요 |
| **❌ 중량 (환경 통째로 필요)** | po-deepfake·cell 계열 — docker(cell)+torch+모델파일 | **선물 부적합** |

---

## 4. 샘플 MCP 선물 패키징 (권장 절차)
1. **경량 MCP 하나 선정** (OrbitPrompt mbti/dollar-system 류).
2. 깔끔한 폴더로: `server.py` + `README.md`(설치법) + `requirements.txt`(없으면 `mcp` 하나).
3. 받는 사람 config 스니펫 동봉:
   - **Claude Desktop** (`claude_desktop_config.json`):
     ```json
     { "mcpServers": { "샘플이름": { "command": "python3", "args": ["/경로/server.py"] } } }
     ```
   - **Claude Code**: `claude mcp add 샘플이름 -- python3 /경로/server.py`
4. (고급) **.dxt로 패키징** → 더블클릭 원클릭 설치. `manifest.json` + 서버코드 + 번들 의존성을 zip.
5. 넘기기 전 **받는 환경(파이썬/노드 버전, 키 유무)에서 실제 구동 검증.**

## 5. 원칙
- 고객/파트너 선물용 = **반드시 경량·무키 MCP부터.** 중량(딥페이크/셀)은 "환경 이양(docker 통째)"이 별도 작업.
- carusworks 제품 관점: "직군 유닛 = 경량 MCP 패키지로 3일 드롭" 구조와 동일 — 선물 가능한 포맷(.dxt/uvx)이 곧 납품 포맷.
