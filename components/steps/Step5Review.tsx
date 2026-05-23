'use client';
import React, { useState } from 'react';
import { useProposal } from '@/contexts/ProposalContext';
import { ReviewResult } from '@/lib/types';
import { scoreColor, scoreBg } from '@/lib/utils';

export default function Step5Review() {
  const { state, dispatch, setStep } = useProposal();
  const [reviewing, setReviewing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const reviewResult = state.reviewScore;

  const runReview = async () => {
    setReviewing(true);
    try {
      const resp = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalState: state, donor: state.idea.donor }),
      });
      const result: ReviewResult = await resp.json();
      dispatch({ type: 'SET_REVIEW', payload: result });
    } catch {
      alert('검토 중 오류가 발생했습니다.');
    } finally {
      setReviewing(false);
    }
  };

  const exportDOCX = async () => {
    setExporting(true);
    try {
      const { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, Packer } = await import('docx');

      const donorName = state.idea.donor;
      const title = state.idea.title || 'ODA Proposal';
      const allCitations = state.sections.flatMap(s => s.citations)
        .filter((c, i, arr) => arr.findIndex(x => x.source === c.source) === i);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const children: any[] = [
        new Paragraph({
          text: title,
          heading: HeadingLevel.TITLE,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [new TextRun({ text: `Donor: ${donorName}  |  국가: ${state.idea.country}  |  분야: ${state.idea.sector}`, size: 22, color: '5a6b47' })],
          spacing: { after: 200 },
        }),
        new Paragraph({ text: '', spacing: { after: 200 } }),
      ];

      // Sections
      for (const section of state.sections) {
        if (!section.content) continue;
        children.push(
          new Paragraph({ text: section.title, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } })
        );
        const paragraphs = section.content.split('\n').filter(p => p.trim());
        for (const para of paragraphs) {
          children.push(new Paragraph({ text: para.replace(/\[출처:.*?\]/g, ''), spacing: { after: 120 } }));
        }
      }

      // PDM Table
      if (state.pdm.length > 0) {
        children.push(new Paragraph({ text: 'PDM (Project Design Matrix)', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
        const tableRows = [
          new TableRow({
            children: ['구분', '내용', '지표', '가정', '검증수단'].map(h =>
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })] })
            ),
          }),
          ...state.pdm.map(row =>
            new TableRow({
              children: [row.level, row.description, row.indicator, row.assumption, row.meansOfVerification].map(text =>
                new TableCell({ children: [new Paragraph({ text: text || '' })] })
              ),
            })
          ),
        ];
        children.push(new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
      }

      // Risk Table
      if (state.risks.length > 0) {
        children.push(new Paragraph({ text: '위험관리 매트릭스', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
        const riskRows = [
          new TableRow({
            children: ['카테고리', '위험 내용', '발생가능성', '영향도', '완화 방안'].map(h =>
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })] })
            ),
          }),
          ...state.risks.map(r =>
            new TableRow({
              children: [r.category, r.description, r.likelihood, r.impact, r.mitigation].map(text =>
                new TableCell({ children: [new Paragraph({ text: text || '' })] })
              ),
            })
          ),
        ];
        children.push(new Table({ rows: riskRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
      }

      // References
      if (allCitations.length > 0) {
        children.push(new Paragraph({ text: '참고문헌', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
        allCitations.forEach((c, i) => {
          children.push(new Paragraph({
            children: [new TextRun({ text: `[${i + 1}] ${c.source}. ${c.title}. ${c.year}.`, size: 20 })],
            spacing: { after: 100 },
          }));
        });
      }

      const doc = new Document({
        sections: [{ properties: {}, children }],
        creator: 'ODAFlow',
        title,
        description: `${donorName} Proposal for ${state.idea.country}`,
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}_Proposal.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('DOCX 생성 중 오류가 발생했습니다.');
    } finally {
      setExporting(false);
    }
  };

  const completedSections = state.sections.filter(s => s.content).length;
  const totalSections = state.sections.length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#1a2e0a] mb-1">검토 및 내보내기</h2>
        <p className="text-sm text-[#5a6b47]">제안서를 최종 검토하고 DOCX로 내보내세요.</p>
      </div>

      {/* Completion Status */}
      <div className="mb-6 p-4 bg-[#F6F8F2] rounded-xl border border-[#d4dcc8]">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-[#1a2e0a]">제안서 완성도</div>
          <div className="text-sm font-bold text-[#6B8E23]">
            {Math.round((completedSections / totalSections) * 100)}%
          </div>
        </div>
        <div className="w-full bg-[#d4dcc8] rounded-full h-2 mb-3">
          <div
            className="bg-[#6B8E23] h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedSections / totalSections) * 100}%` }}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {state.sections.map(s => (
            <div key={s.id} className="flex items-center gap-1.5 text-xs text-[#5a6b47]">
              <span className={s.content ? 'text-green-500' : 'text-gray-300'}>
                {s.content ? '✓' : '○'}
              </span>
              {s.title}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-xs text-[#5a6b47]">
            <span className={state.pdm.length > 0 ? 'text-green-500' : 'text-gray-300'}>
              {state.pdm.length > 0 ? '✓' : '○'}
            </span>
            PDM ({state.pdm.length}행)
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#5a6b47]">
            <span className={state.risks.length > 0 ? 'text-green-500' : 'text-gray-300'}>
              {state.risks.length > 0 ? '✓' : '○'}
            </span>
            Risk Matrix ({state.risks.length}개)
          </div>
        </div>
      </div>

      {/* Review */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#1a2e0a]">🔍 AI 품질 검토</h3>
          <button
            onClick={runReview}
            disabled={reviewing}
            className="flex items-center gap-2 px-4 py-2 bg-[#6B8E23] text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-[#4a6317] transition-colors"
          >
            {reviewing ? (
              <><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /><span>검토 중...</span></>
            ) : (
              `${state.idea.donor} 기준 검토 실행`
            )}
          </button>
        </div>

        {reviewResult && <ReviewResultPanel result={reviewResult} />}
      </div>

      {/* Export */}
      <div className="p-4 bg-white rounded-xl border-2 border-[#6B8E23]">
        <div className="text-sm font-semibold text-[#1a2e0a] mb-3">📄 문서 내보내기</div>
        <div className="flex gap-3">
          <button
            onClick={exportDOCX}
            disabled={exporting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#6B8E23] text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-[#4a6317] transition-colors shadow-sm"
          >
            {exporting ? '생성 중...' : '📄 DOCX 다운로드'}
          </button>
        </div>
        <div className="mt-2 text-xs text-[#5a6b47]">
          * 제안서 본문, PDM, Risk Matrix, 참고문헌이 포함된 Word 문서로 내보냅니다.
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setStep(4)}
          className="px-4 py-2 border border-[#d4dcc8] text-[#5a6b47] rounded-xl hover:border-[#6B8E23] transition-colors text-sm"
        >
          ← 이전
        </button>
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="px-4 py-2 border border-red-200 text-red-400 rounded-xl hover:border-red-400 transition-colors text-sm"
        >
          새 제안서 시작
        </button>
      </div>
    </div>
  );
}

function ReviewResultPanel({ result }: { result: ReviewResult }) {
  const pct = result.totalScore / result.maxScore;
  const scoreLabel = pct >= 0.8 ? '우수' : pct >= 0.6 ? '양호' : '보완 필요';
  const scoreBgColor = pct >= 0.8 ? 'bg-green-50 border-green-200' : pct >= 0.6 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';

  return (
    <div className="space-y-4">
      {/* Score Summary */}
      <div className={`p-4 rounded-xl border-2 ${scoreBgColor}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-bold text-[#1a2e0a]">종합 점수</div>
          <div className={`text-2xl font-bold ${scoreColor(result.totalScore, result.maxScore)}`}>
            {result.totalScore} / {result.maxScore}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${pct >= 0.8 ? 'bg-green-500' : pct >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${pct * 100}%` }}
          />
        </div>
        <div className="text-xs text-center font-semibold">
          {scoreLabel} — {result.overallFeedback}
        </div>
      </div>

      {/* Category Scores */}
      <div className="grid grid-cols-1 gap-3">
        {result.categories.map((cat, i) => (
          <div key={i} className={`p-3 rounded-lg border ${scoreBg(cat.score, cat.max)}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-[#1a2e0a]">{cat.name}</span>
              <span className={`text-xs font-bold ${scoreColor(cat.score, cat.max)}`}>
                {cat.score}/{cat.max}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5">
              <div
                className={`h-1.5 rounded-full ${cat.score / cat.max >= 0.8 ? 'bg-green-500' : cat.score / cat.max >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${(cat.score / cat.max) * 100}%` }}
              />
            </div>
            <div className="text-xs text-[#5a6b47]">{cat.feedback}</div>
            {cat.issues.length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {cat.issues.map((issue, j) => (
                  <li key={j} className="text-xs text-red-600 flex items-start gap-1">
                    <span className="shrink-0">•</span>{issue}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="text-xs font-semibold text-blue-800 mb-2">💡 개선 제안</div>
          <ul className="space-y-1">
            {result.suggestions.map((s, i) => (
              <li key={i} className="text-xs text-blue-700 flex items-start gap-1.5">
                <span className="shrink-0 font-bold">{i + 1}.</span>{s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
