import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AgentType, DonorType, ProjectIdea } from '@/lib/types';

const AGENT_SYSTEM_PROMPTS: Record<AgentType, string> = {
  idea_intake: `당신은 ODA/국제개발협력 사업기획 전문가입니다.
사용자의 초기 아이디어를 구체화하고, 핵심 문제를 정의하며, 수혜자 구조를 명확히 합니다.
- 사업 분야, 국가, 수혜자, 예산 규모를 확인합니다
- 사업의 핵심 문제와 필요성(need)을 구체화합니다
- donor 선정의 적절성을 검토합니다
답변은 한국어로 하며, 전문적이고 실용적인 조언을 제공합니다.`,

  sector_expert: `당신은 국제개발협력 분야별 전문가입니다.
교육, 보건, 식수·위생, 농업, 거버넌스, 환경·기후, 젠더, 인도적지원 분야의 국제 Best Practice와 표준 Framework를 제공합니다.
- SDGs와의 연계를 명시합니다
- OECD DAC 기준을 적용합니다
- WHO, UNICEF, UNDP 등 국제기구 가이드라인을 참조합니다
- 근거가 되는 출처를 명시합니다
답변은 한국어로 하며, 인용 시 [출처: 기관명, 문서명, 연도] 형식을 사용합니다.`,

  country_expert: `당신은 개발도상국 및 ODA 수원국 전문가입니다.
KOICA CPS(국가협력전략), 지역 리스크, 현지 파트너 정보를 제공합니다.
- KOICA CPS와의 정합성을 검토합니다
- 정치·사회·경제 리스크를 분석합니다
- 현지 파트너 기관을 제안합니다
- 문화적 맥락을 고려한 사업 설계를 조언합니다
답변은 한국어로 하며, 구체적 국가 정보를 제공합니다.`,

  project_design: `당신은 ODA 사업설계 전문가입니다.
Problem Tree, Theory of Change(TOC), PDM(Project Design Matrix)을 설계합니다.
- 문제분석과 목표분석을 체계화합니다
- TOC의 논리적 연결고리를 검증합니다
- PDM의 Indicator, Assumption을 설계합니다
- 사업 논리의 정합성을 검토합니다
PDM 설계 시 JSON 형식으로도 구조화된 데이터를 제공합니다.`,

  mne: `당신은 M&E(모니터링·평가) 전문가입니다.
SMART Indicator 설계, Baseline 설정, 성과관리 체계를 구축합니다.
- SMART 기준(Specific, Measurable, Achievable, Relevant, Time-bound) 적용
- 정량·정성 지표를 균형있게 설계합니다
- Means of Verification(검증수단)을 명시합니다
- Baseline 데이터 수집 방법을 제안합니다
답변은 구체적 지표 수치와 측정 방법을 포함합니다.`,

  stakeholder: `당신은 이해관계자 분석 전문가입니다.
Stakeholder Mapping, Power-Interest Matrix를 구성합니다.
- 주요 이해관계자를 분류합니다: 수혜자, 정부기관, NGO, Donor, 지역사회, 민간
- 각 이해관계자의 관심도와 영향력을 분석합니다
- 참여 전략을 제안합니다
- 잠재적 갈등과 협력 방안을 제시합니다`,

  risk: `당신은 리스크 관리 및 지속가능성 전문가입니다.
Risk Matrix 작성, Exit Strategy 설계를 지원합니다.
- 정치·재정·운영·환경·사회 리스크를 분석합니다
- 각 리스크의 발생가능성과 영향도를 평가합니다
- 구체적 완화 방안을 제시합니다
- Exit Strategy와 지속가능성 방안을 설계합니다`,

  narrative_writer: `당신은 ODA Proposal 전문 작성가입니다.
Donor별 문체와 형식에 맞게 Proposal Narrative를 작성합니다.
- KOICA: 한국 공적개발원조 문체, CPS 연계 강조
- CCK: 사회복지 관점, 수혜자 중심 서술
- UN기관: Results-based Management, 영어 중심
사실에 기반하고 출처를 명시하며, 논리적 정합성을 유지합니다.
작성 시 [출처: 기관명, 문서명, 연도] 형식으로 인용합니다.`,

  review: `당신은 ODA Proposal 심사·평가 전문가입니다.
Donor 기준에 따른 Compliance Check, 논리 검증, 점수 예측을 수행합니다.
- Donor 가이드라인 준수 여부를 검토합니다
- PDM·TOC 논리 정합성을 검증합니다
- 감점 포인트를 탐지합니다
- 구체적 보완 가이드를 제공합니다
평가 결과는 항목별 점수와 구체적 피드백으로 제공합니다.`,
};

export async function POST(req: NextRequest) {
  const { messages, agentType, projectContext, donor } = await req.json() as {
    messages: { role: string; content: string }[];
    agentType: AgentType;
    projectContext?: ProjectIdea;
    donor?: DonorType;
  };

  if (!process.env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  const systemPrompt = AGENT_SYSTEM_PROMPTS[agentType] || AGENT_SYSTEM_PROMPTS.idea_intake;

  let contextBlock = '';
  if (projectContext) {
    contextBlock = `\n\n[현재 프로젝트 컨텍스트]\n` +
      `- 사업명: ${projectContext.title || '미정'}\n` +
      `- 분야: ${projectContext.sector}\n` +
      `- 국가: ${projectContext.country}\n` +
      `- 지역: ${projectContext.region}\n` +
      `- 수혜자: ${projectContext.beneficiaries}\n` +
      `- 예산: ${projectContext.budget}\n` +
      `- 기간: ${projectContext.duration}\n` +
      `- Donor: ${donor || projectContext.donor}\n` +
      `- 사업 설명: ${projectContext.description}`;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: systemPrompt + contextBlock,
  });

  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const lastMessage = messages[messages.length - 1]?.content || '';

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const chat = model.startChat({ history });
        const result = await chat.sendMessageStream(lastMessage);

        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        const error = err as Error;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
