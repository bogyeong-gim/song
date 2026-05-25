import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DonorType, ProjectIdea, ProposalState } from '@/lib/types';

const SECTION_PROMPTS: Record<string, (donor: DonorType) => string> = {
  background: (donor) => `다음 프로젝트에 대한 "사업 배경 및 필요성" 섹션을 작성하세요.
${donor === 'KOICA' ? 'KOICA CPS와의 연계성, 한국 ODA 정책과의 정합성을 포함하세요.' : ''}
${donor === 'UNICEF' || donor === 'UNDP' ? 'SDGs와의 연계를 구체적으로 명시하고, 국제 기준에 따른 분석을 포함하세요.' : ''}
공신력 있는 통계와 데이터를 인용하고, [출처: 기관명, 문서명, 연도] 형식으로 출처를 표시하세요.
약 500-700자 분량으로 작성하세요.`,

  problem: (donor) => `다음 프로젝트의 "문제 분석" 섹션을 작성하세요.
Problem Tree 기반으로 핵심 문제, 원인, 결과를 체계적으로 서술하세요.
${donor === 'KOICA' ? '수원국 개발 현황과 연계하여 서술하세요.' : ''}
공신력 있는 출처를 인용하고, [출처: 기관명, 문서명, 연도] 형식을 사용하세요.
약 400-600자 분량으로 작성하세요.`,

  objective: (_donor) => `다음 프로젝트의 "사업 목표" 섹션을 작성하세요.
PDM 기반으로 Goal, Outcome, Output을 명확히 서술하세요.
SMART 기준에 따른 성과지표를 포함하세요.
Theory of Change의 논리적 흐름을 반영하세요.
약 400-500자 분량으로 작성하세요.`,

  implementation: (_donor) => `다음 프로젝트의 "사업 내용 및 추진 방법" 섹션을 작성하세요.
주요 Activity별로 구체적인 추진 방법을 서술하세요.
수혜자 참여 방안, 현지 파트너 협력 방안을 포함하세요.
약 600-800자 분량으로 작성하세요.`,

  sustainability: (_donor) => `다음 프로젝트의 "지속가능성" 섹션을 작성하세요.
사업 종료 후 성과 지속을 위한 전략을 서술하세요.
Exit Strategy, 현지 역량 강화 방안, 제도화 방안을 포함하세요.
약 300-400자 분량으로 작성하세요.`,
};

export async function POST(req: NextRequest) {
  const { section, projectState, donor } = await req.json() as {
    section: string;
    projectState: ProposalState;
    donor: DonorType;
  };

  if (!process.env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  const promptFn = SECTION_PROMPTS[section];
  if (!promptFn) {
    return new Response(JSON.stringify({ error: 'Unknown section' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const systemPrompt = `당신은 ODA Proposal 전문 작성가입니다.
Donor: ${donor}
${donor === 'KOICA' ? 'KOICA 시민사회협력사업 가이드라인을 준수하세요.' : ''}
사실에 기반하고, 공신력 있는 출처를 인용하며, 전문적인 문체로 작성합니다.
[출처: 기관명, 문서명, 연도] 형식으로 인용을 표시합니다.`;

  const contextBlock = `[프로젝트 정보]
사업명: ${projectState.idea.title}
분야: ${projectState.idea.sector}
국가: ${projectState.idea.country} / ${projectState.idea.region}
수혜자: ${projectState.idea.beneficiaries}
예산: ${projectState.idea.budget}
기간: ${projectState.idea.duration}
사업 설명: ${projectState.idea.description}

[PDM 요약]
${projectState.pdm.slice(0, 6).map((r: { level: string; description: string }) => `- [${r.level}] ${r.description}`).join('\n')}

[TOC 요약]
- Outputs: ${projectState.toc.outputs.slice(0, 3).join(', ')}
- Outcomes: ${projectState.toc.outcomes.slice(0, 2).join(', ')}
- Impact: ${projectState.toc.impact}`;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: systemPrompt,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await model.generateContentStream(
          contextBlock + '\n\n' + promptFn(donor)
        );

        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
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
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
}
