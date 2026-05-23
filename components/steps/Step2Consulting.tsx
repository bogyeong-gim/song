'use client';
import React, { useState } from 'react';
import { useProposal } from '@/contexts/ProposalContext';
import { AgentType, AGENT_INFO } from '@/lib/types';

const CONSULTING_AGENTS: AgentType[] = [
  'idea_intake', 'sector_expert', 'country_expert', 'project_design',
  'mne', 'stakeholder', 'risk',
];

export default function Step2Consulting() {
  const { state, dispatch, setStep, addDefaultPDMRows, addDefaultRisks } = useProposal();
  const [completedAgents, setCompletedAgents] = useState<Set<AgentType>>(new Set());
  const [activeAgent, setActiveAgent] = useState<AgentType>('idea_intake');

  const markDone = (agent: AgentType) => {
    setCompletedAgents(prev => new Set([...prev, agent]));
  };

  const handleProceed = () => {
    if (state.pdm.length === 0) addDefaultPDMRows();
    if (state.risks.length === 0) addDefaultRisks();

    if (state.toc.outputs.length === 0) {
      dispatch({ type: 'SET_TOC', payload: {
        inputs: ['인적 자원', '재정 자원', '장비 및 자재'],
        activities: ['역량 강화 교육', '인프라 구축', '커뮤니티 참여'],
        outputs: ['훈련된 교사/직원 수', '구축된 시설 수', '배포된 자료 수'],
        outcomes: ['수혜자 지식·기술 향상', '서비스 접근성 개선'],
        impact: `${state.idea.country} 대상 지역 ${state.idea.sector} 분야 지속가능한 발전`,
      }});
    }
    setStep(3);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#1a2e0a] mb-1">전문가 상담</h2>
        <p className="text-sm text-[#5a6b47]">
          오른쪽 AI 패널에서 각 전문가와 상담하세요. 오른쪽 에이전트 아이콘을 클릭해 전환할 수 있습니다.
        </p>
      </div>

      {/* Project Summary */}
      <div className="mb-5 p-4 bg-[#F6F8F2] rounded-xl border border-[#d4dcc8]">
        <div className="text-sm font-semibold text-[#1a2e0a] mb-2">📋 프로젝트 요약</div>
        <div className="grid grid-cols-2 gap-2 text-xs text-[#5a6b47]">
          <div><span className="font-medium">Donor:</span> {state.idea.donor}</div>
          <div><span className="font-medium">분야:</span> {state.idea.sector}</div>
          <div><span className="font-medium">국가:</span> {state.idea.country}</div>
          <div><span className="font-medium">수혜자:</span> {state.idea.beneficiaries}</div>
          <div className="col-span-2"><span className="font-medium">사업명:</span> {state.idea.title}</div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {CONSULTING_AGENTS.map(agentType => {
          const info = AGENT_INFO[agentType];
          const done = completedAgents.has(agentType);
          return (
            <div
              key={agentType}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                done
                  ? 'border-[#6B8E23] bg-[#F6F8F2]'
                  : 'border-[#d4dcc8] bg-white hover:border-[#A3B18A]'
              }`}
              onClick={() => setActiveAgent(agentType)}
            >
              <span className="text-2xl">{info.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-[#1a2e0a]">{info.name}</div>
                <div className="text-xs text-[#5a6b47]">{info.description}</div>
              </div>
              <div className="flex items-center gap-2">
                {done && (
                  <span className="text-xs text-[#6B8E23] font-medium bg-[#e8f5e9] px-2 py-0.5 rounded-full">
                    ✓ 완료
                  </span>
                )}
                <button
                  onClick={e => { e.stopPropagation(); markDone(agentType); }}
                  className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                    done
                      ? 'border-[#6B8E23] text-[#6B8E23] bg-white'
                      : 'border-[#d4dcc8] text-[#5a6b47] hover:border-[#6B8E23] hover:text-[#6B8E23]'
                  }`}
                >
                  {done ? '재상담' : '상담 완료'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="text-sm font-semibold text-amber-800 mb-2">💡 상담 활용 팁</div>
        <ul className="text-xs text-amber-700 space-y-1 list-disc pl-4">
          <li>오른쪽 AI 패널 상단의 에이전트 아이콘을 클릭해 전문가를 선택하세요</li>
          <li>각 전문가의 빠른 질문 버튼을 활용하면 효율적으로 상담할 수 있습니다</li>
          <li>상담 내용은 다음 단계 구조화에 자동 반영됩니다</li>
          <li>모든 상담이 필수는 아닙니다. 필요한 전문가만 선택하여 진행하세요</li>
        </ul>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep(1)}
          className="px-4 py-2 border border-[#d4dcc8] text-[#5a6b47] rounded-xl hover:border-[#6B8E23] transition-colors text-sm"
        >
          ← 이전
        </button>
        <button
          onClick={handleProceed}
          className="px-6 py-3 bg-[#6B8E23] text-white rounded-xl font-semibold hover:bg-[#4a6317] transition-colors shadow-sm"
        >
          사업 구조화 →
        </button>
      </div>
    </div>
  );
}
