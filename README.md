# ODAFlow — AI Proposal Workspace

ODA/국제개발협력 NGO 실무자를 위한 AI 기반 제안서 작성 시스템.

## 빠른 시작

### 1. 환경변수 설정

`.env.local` 파일에 OpenAI API Key를 입력하세요:

```
OPENAI_API_KEY=sk-...your-key-here...
NEXT_PUBLIC_HAS_API_KEY=true
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

---

## 주요 기능

### 5단계 워크플로우

| 단계 | 기능 |
|------|------|
| 1. Idea Intake | Donor 선택, 사업 기본 정보 입력 |
| 2. 전문가 상담 | 9개 AI Agent와 상담 |
| 3. 사업 구조화 | Problem Tree, TOC, PDM, Risk Matrix |
| 4. 제안서 작성 | AI 섹션 생성 + 출처 자동 추출 |
| 5. 검토·내보내기 | AI 품질 검토, DOCX 다운로드 |

### 지원 Donor

- **KOICA** (시민사회협력사업, HDP Nexus)
- **사회복지공동모금회 (CCK)**
- **UNICEF, UNDP, WFP, WHO**

### 9개 AI Agent

- Idea Intake, Sector Expert, Country Expert
- Project Design, M&E Expert, Stakeholder
- Risk & Sustainability, Narrative Writer, Review & Scoring

---

## 기술 스택

- **Frontend**: Next.js 16, React, TailwindCSS
- **AI**: OpenAI GPT-4o (Streaming)
- **Export**: docx (DOCX 생성)

## 프로젝트 구조

```
odaflow/
├── app/
│   ├── api/
│   │   ├── agent/      # Multi-Agent AI 스트리밍
│   │   ├── generate/   # 섹션별 Proposal 생성
│   │   └── review/     # 품질 검토 엔진
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AIPanel.tsx         # 오른쪽 AI 패널
│   ├── WorkspaceLayout.tsx # 메인 레이아웃
│   └── steps/
│       ├── Step1IdeaIntake.tsx
│       ├── Step2Consulting.tsx
│       ├── Step3Structure.tsx
│       ├── Step4Writing.tsx
│       └── Step5Review.tsx
├── contexts/
│   └── ProposalContext.tsx # 전역 상태 관리
└── lib/
    ├── types.ts    # 타입 정의
    └── utils.ts    # 유틸 함수
```
