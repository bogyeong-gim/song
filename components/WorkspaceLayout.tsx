'use client';
import React, { useState } from 'react';
import { useProposal } from '@/contexts/ProposalContext';
import AIPanel from '@/components/AIPanel';
import Step1IdeaIntake from '@/components/steps/Step1IdeaIntake';
import Step2Consulting from '@/components/steps/Step2Consulting';
import Step3Structure from '@/components/steps/Step3Structure';
import Step4Writing from '@/components/steps/Step4Writing';
import Step5Review from '@/components/steps/Step5Review';
import { WorkflowStep, DONOR_INFO } from '@/lib/types';

const STEPS: { id: WorkflowStep; label: string; icon: string; shortLabel: string }[] = [
  { id: 1, label: 'Idea Intake', icon: '💡', shortLabel: 'Idea' },
  { id: 2, label: '전문가 상담', icon: '🤝', shortLabel: '상담' },
  { id: 3, label: '사업 구조화', icon: '📐', shortLabel: '구조화' },
  { id: 4, label: '제안서 작성', icon: '✍️', shortLabel: '작성' },
  { id: 5, label: '검토 · 내보내기', icon: '🔍', shortLabel: '검토' },
];

export default function WorkspaceLayout() {
  const { step, setStep, state } = useProposal();
  const [aiPanelOpen, setAiPanelOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-[#4a6317] text-white shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="font-bold text-lg tracking-tight">ODAFlow</div>
          <div className="hidden sm:block text-xs text-[#c8daa0] border-l border-[#6B8E23] pl-3">
            AI Proposal Workspace
          </div>
          {state.idea.donor && (
            <div className="flex items-center gap-1.5 bg-[#6B8E23] px-2.5 py-1 rounded-full text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-green-300" />
              {DONOR_INFO[state.idea.donor]?.name}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {state.idea.title && (
            <div className="hidden md:block text-xs text-[#c8daa0] max-w-[200px] truncate">
              📋 {state.idea.title}
            </div>
          )}
          <button
            onClick={() => setAiPanelOpen(!aiPanelOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6B8E23] hover:bg-[#8fad4a] rounded-lg text-xs font-medium transition-colors"
          >
            🤖 AI {aiPanelOpen ? '닫기' : '열기'}
          </button>
        </div>
      </header>

      {/* Step Progress Bar */}
      <div className="px-4 py-3 bg-white border-b border-[#d4dcc8] shrink-0">
        <div className="flex items-center gap-1 max-w-3xl mx-auto">
          {STEPS.map((s, i) => {
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => setStep(s.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#6B8E23] text-white shadow-sm'
                      : isDone
                      ? 'bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7]'
                      : 'text-[#5a6b47] hover:text-[#1a2e0a]'
                  }`}
                >
                  <span>{isDone ? '✓' : s.icon}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.shortLabel}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 rounded ${step > s.id ? 'bg-[#6B8E23]' : 'bg-[#d4dcc8]'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Workspace */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
          {step === 1 && <Step1IdeaIntake />}
          {step === 2 && <Step2Consulting />}
          {step === 3 && <Step3Structure />}
          {step === 4 && <Step4Writing />}
          {step === 5 && <Step5Review />}
        </div>

        {/* AI Panel */}
        {aiPanelOpen && (
          <div className="w-80 xl:w-96 shrink-0 overflow-hidden border-l border-[#d4dcc8]">
            <AIPanel />
          </div>
        )}
      </div>
    </div>
  );
}
