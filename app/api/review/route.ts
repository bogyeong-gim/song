import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DonorType, ProposalState, ReviewResult } from '@/lib/types';

export async function POST(req: NextRequest) {
  const { proposalState, donor } = await req.json() as {
    proposalState: ProposalState;
    donor: DonorType;
  };

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  const prompt = `다음 ODA Proposal을 ${donor} 기준으로 심사·평가하세요.

[프로젝트 정보]
사업명: ${proposalState.idea.title}
분야: ${proposalState.idea.sector}
국가: ${proposalState.idea.country}
수혜자: ${proposalState.idea.beneficiaries}
예산: ${proposalState.idea.budget}
기간: ${proposalState.idea.duration}
설명: ${proposalState.idea.description}

[PDM]
${proposalState.pdm.map((r: { level: string; description: string; indicator: string; assumption: string }) => `[${r.level}] ${r.description} | 지표: ${r.indicator} | 가정: ${r.assumption}`).join('\n')}

[TOC]
입력: ${proposalState.toc.inputs.join(', ')}
활동: ${proposalState.toc.activities.join(', ')}
산출: ${proposalState.toc.outputs.join(', ')}
성과: ${proposalState.toc.outcomes.join(', ')}
영향: ${proposalState.toc.impact}

[리스크 수]
${proposalState.risks.length}개 리스크 식별됨

[섹션 작성 현황]
${proposalState.sections.map((s: { title: string; content: string }) => `- ${s.title}: ${s.content ? '작성됨' : '미작성'}`).join('\n')}

다음 JSON 형식으로 정확히 응답하세요 (JSON 외 다른 텍스트 없이):
{
  "totalScore": 숫자,
  "maxScore": 100,
  "categories": [
    {
      "name": "카테고리명",
      "score": 숫자,
      "max": 숫자,
      "feedback": "상세 피드백",
      "issues": ["문제점1", "문제점2"]
    }
  ],
  "overallFeedback": "전체 피드백",
  "weaknesses": ["약점1", "약점2"],
  "suggestions": ["개선제안1", "개선제안2"]
}

평가 카테고리 (${donor} 기준):
- 문제 분석 및 필요성 (20점)
- 사업 목표 및 논리 구조 (25점)
- PDM 완성도 (20점)
- M&E 및 성과지표 (15점)
- 지속가능성 및 리스크 관리 (10점)
- Donor 가이드라인 준수 (10점)`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: 'ODA Proposal 심사 전문가입니다. 요청된 JSON 형식으로만 응답합니다.',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    const result = JSON.parse(text) as ReviewResult;
    return NextResponse.json(result);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
