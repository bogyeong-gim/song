'use client';
import React from 'react';
import { useProposal } from '@/contexts/ProposalContext';
import { DonorType, SectorType, DONOR_INFO, SECTOR_LABELS } from '@/lib/types';

export default function Step1IdeaIntake() {
  const { state, dispatch, setStep } = useProposal();
  const { idea } = state;

  const update = (field: string, value: string) =>
    dispatch({ type: 'SET_IDEA', payload: { [field]: value } });

  const isValid = idea.title && idea.sector && idea.country && idea.beneficiaries && idea.donor;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#1a2e0a] mb-1">사업 아이디어 입력</h2>
        <p className="text-sm text-[#5a6b47]">기본 정보를 입력하면 AI가 사업 구조화를 도와드립니다.</p>
      </div>

      <div className="space-y-5">
        {/* Donor Selection */}
        <div>
          <label className="block text-sm font-semibold text-[#1a2e0a] mb-2">
            Donor 기관 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {(Object.entries(DONOR_INFO) as [DonorType, typeof DONOR_INFO[DonorType]][]).map(([key, info]) => (
              <button
                key={key}
                onClick={() => dispatch({ type: 'SET_DONOR', payload: key })}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all text-xs font-medium ${
                  idea.donor === key
                    ? 'border-[#6B8E23] bg-[#6B8E23] text-white shadow-md'
                    : 'border-[#d4dcc8] bg-white text-[#5a6b47] hover:border-[#A3B18A]'
                }`}
              >
                <span className="text-lg mb-1">
                  {key === 'KOICA' ? '🇰🇷' : key === 'CCK' ? '🤝' : key === 'UNICEF' ? '👶' : key === 'UNDP' ? '🌐' : key === 'WFP' ? '🌾' : '🏥'}
                </span>
                {info.name}
              </button>
            ))}
          </div>
          {idea.donor && (
            <div className="mt-2 p-3 bg-[#F6F8F2] rounded-lg border border-[#d4dcc8]">
              <div className="text-xs font-medium text-[#1a2e0a] mb-1">주요 요구사항</div>
              <div className="flex flex-wrap gap-1">
                {DONOR_INFO[idea.donor].requirements.map((req, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-white border border-[#d4dcc8] rounded-full text-[#5a6b47]">
                    {req}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-[#1a2e0a] mb-1">
            사업 제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={idea.title}
            onChange={e => update('title', e.target.value)}
            placeholder="예: 캄보디아 농촌지역 초등교육 접근성 강화 사업"
            className="w-full px-3 py-2 border border-[#d4dcc8] rounded-lg text-sm focus:outline-none focus:border-[#6B8E23] bg-white"
          />
        </div>

        {/* Sector & Country Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#1a2e0a] mb-1">
              사업 분야 <span className="text-red-500">*</span>
            </label>
            <select
              value={idea.sector}
              onChange={e => update('sector', e.target.value)}
              className="w-full px-3 py-2 border border-[#d4dcc8] rounded-lg text-sm focus:outline-none focus:border-[#6B8E23] bg-white"
            >
              {(Object.entries(SECTOR_LABELS) as [SectorType, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1a2e0a] mb-1">
              대상 국가 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={idea.country}
              onChange={e => update('country', e.target.value)}
              placeholder="예: 캄보디아"
              className="w-full px-3 py-2 border border-[#d4dcc8] rounded-lg text-sm focus:outline-none focus:border-[#6B8E23] bg-white"
            />
          </div>
        </div>

        {/* Region & Beneficiaries Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#1a2e0a] mb-1">세부 지역</label>
            <input
              type="text"
              value={idea.region}
              onChange={e => update('region', e.target.value)}
              placeholder="예: 씨엠립 주 농촌 지역"
              className="w-full px-3 py-2 border border-[#d4dcc8] rounded-lg text-sm focus:outline-none focus:border-[#6B8E23] bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1a2e0a] mb-1">
              수혜자 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={idea.beneficiaries}
              onChange={e => update('beneficiaries', e.target.value)}
              placeholder="예: 농촌지역 초등학생 2,000명 및 교사 80명"
              className="w-full px-3 py-2 border border-[#d4dcc8] rounded-lg text-sm focus:outline-none focus:border-[#6B8E23] bg-white"
            />
          </div>
        </div>

        {/* Budget & Duration Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#1a2e0a] mb-1">사업 예산</label>
            <input
              type="text"
              value={idea.budget}
              onChange={e => update('budget', e.target.value)}
              placeholder="예: USD 500,000 (3년)"
              className="w-full px-3 py-2 border border-[#d4dcc8] rounded-lg text-sm focus:outline-none focus:border-[#6B8E23] bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1a2e0a] mb-1">사업 기간</label>
            <input
              type="text"
              value={idea.duration}
              onChange={e => update('duration', e.target.value)}
              placeholder="예: 2025년 1월 - 2027년 12월 (3년)"
              className="w-full px-3 py-2 border border-[#d4dcc8] rounded-lg text-sm focus:outline-none focus:border-[#6B8E23] bg-white"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-[#1a2e0a] mb-1">사업 아이디어 설명</label>
          <textarea
            value={idea.description}
            onChange={e => update('description', e.target.value)}
            placeholder="사업의 핵심 아이디어, 해결하려는 문제, 기대 효과를 자유롭게 작성하세요."
            rows={4}
            className="w-full px-3 py-2 border border-[#d4dcc8] rounded-lg text-sm focus:outline-none focus:border-[#6B8E23] bg-white resize-none"
          />
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => setStep(2)}
          disabled={!isValid}
          className="px-6 py-3 bg-[#6B8E23] text-white rounded-xl font-semibold disabled:opacity-40 hover:bg-[#4a6317] transition-colors shadow-sm flex items-center gap-2"
        >
          전문가 상담으로 →
        </button>
      </div>
    </div>
  );
}
