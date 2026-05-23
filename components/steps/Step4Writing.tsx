'use client';
import React, { useState } from 'react';
import { useProposal } from '@/contexts/ProposalContext';
import { Citation } from '@/lib/types';
import { confidenceEmoji, confidenceLabel, generateId } from '@/lib/utils';

const SECTION_IDS = ['background', 'problem', 'objective', 'implementation', 'sustainability'];

export default function Step4Writing() {
  const { state, dispatch, setStep } = useProposal();
  const [activeSection, setActiveSection] = useState('background');
  const [generating, setGenerating] = useState<string | null>(null);
  const [showCitations, setShowCitations] = useState(false);

  const currentSection = state.sections.find(s => s.id === activeSection);

  const generateSection = async (sectionId: string) => {
    setGenerating(sectionId);
    try {
      const resp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: sectionId,
          projectState: state,
          donor: state.idea.donor,
        }),
      });

      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  accumulated += parsed.text;
                  dispatch({ type: 'UPDATE_SECTION', payload: { id: sectionId, content: accumulated } });
                }
              } catch {}
            }
          }
        }
      }

      // Extract citations from generated text
      const citations = extractCitations(accumulated, sectionId);
      if (citations.length > 0) {
        dispatch({ type: 'UPDATE_SECTION', payload: { id: sectionId, content: accumulated, citations } });
        citations.forEach(c => dispatch({ type: 'ADD_CITATION', payload: c }));
      }
    } catch {
      dispatch({
        type: 'UPDATE_SECTION',
        payload: { id: sectionId, content: 'API 오류가 발생했습니다. OPENAI_API_KEY를 확인해주세요.' },
      });
    } finally {
      setGenerating(null);
    }
  };

  const allCitations = state.sections.flatMap(s => s.citations);
  const uniqueCitations = allCitations.filter((c, i) => allCitations.findIndex(x => x.source === c.source) === i);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#1a2e0a] mb-1">제안서 작성</h2>
        <p className="text-sm text-[#5a6b47]">각 섹션을 AI로 생성하거나 직접 편집하세요.</p>
      </div>

      <div className="flex gap-4">
        {/* Section Nav */}
        <div className="w-44 shrink-0 space-y-1">
          {state.sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all ${
                activeSection === section.id
                  ? 'bg-[#6B8E23] text-white font-semibold'
                  : 'bg-white border border-[#d4dcc8] text-[#5a6b47] hover:border-[#6B8E23]'
              }`}
            >
              <div className="font-medium truncate">{section.title}</div>
              <div className="flex items-center gap-1 mt-0.5">
                {section.content ? (
                  <span className="text-green-400">●</span>
                ) : (
                  <span className="text-gray-300">○</span>
                )}
                <span className="opacity-70">
                  {section.content ? `${section.content.length}자` : '미작성'}
                </span>
              </div>
            </button>
          ))}

          <button
            onClick={() => setShowCitations(!showCitations)}
            className="w-full text-left px-3 py-2.5 rounded-lg text-xs bg-[#e8f5e9] border border-[#a5d6a7] text-[#2e7d32] hover:bg-[#c8e6c9] transition-colors mt-3"
          >
            <div className="font-medium">📚 출처 목록</div>
            <div className="opacity-70">{uniqueCitations.length}개</div>
          </button>
        </div>

        {/* Editor */}
        <div className="flex-1 min-w-0">
          {showCitations ? (
            <CitationPanel citations={uniqueCitations} onClose={() => setShowCitations(false)} />
          ) : currentSection ? (
            <SectionEditor
              section={currentSection}
              isGenerating={generating === currentSection.id}
              onGenerate={() => generateSection(currentSection.id)}
              onChange={(content) =>
                dispatch({ type: 'UPDATE_SECTION', payload: { id: currentSection.id, content } })
              }
              donor={state.idea.donor}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setStep(3)}
          className="px-4 py-2 border border-[#d4dcc8] text-[#5a6b47] rounded-xl hover:border-[#6B8E23] transition-colors text-sm"
        >
          ← 이전
        </button>
        <button
          onClick={() => setStep(5)}
          className="px-6 py-3 bg-[#6B8E23] text-white rounded-xl font-semibold hover:bg-[#4a6317] transition-colors shadow-sm"
        >
          검토 및 내보내기 →
        </button>
      </div>
    </div>
  );
}

function SectionEditor({
  section, isGenerating, onGenerate, onChange, donor,
}: {
  section: { id: string; title: string; content: string; citations: Citation[] };
  isGenerating: boolean;
  onGenerate: () => void;
  onChange: (c: string) => void;
  donor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#d4dcc8] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#d4dcc8] bg-[#F6F8F2]">
        <h3 className="text-sm font-semibold text-[#1a2e0a]">{section.title}</h3>
        <div className="flex items-center gap-2">
          {section.citations.length > 0 && (
            <span className="text-xs text-[#2e7d32] bg-[#e8f5e9] px-2 py-0.5 rounded-full border border-[#a5d6a7]">
              📚 {section.citations.length}개 출처
            </span>
          )}
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6B8E23] text-white rounded-lg text-xs font-medium disabled:opacity-50 hover:bg-[#4a6317] transition-colors"
          >
            {isGenerating ? (
              <>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span>생성 중...</span>
              </>
            ) : (
              <>✨ AI로 생성 ({donor})</>
            )}
          </button>
        </div>
      </div>

      <div className="p-4">
        <textarea
          value={section.content}
          onChange={e => onChange(e.target.value)}
          placeholder={`${section.title} 내용을 입력하거나 AI 생성 버튼을 클릭하세요.\n\nAI가 생성한 내용은 직접 편집 가능합니다.`}
          className="w-full min-h-[320px] text-sm leading-relaxed focus:outline-none resize-none text-[#1a2e0a]"
          disabled={isGenerating}
        />

        {section.citations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#d4dcc8]">
            <div className="text-xs font-semibold text-[#5a6b47] mb-2">📚 인용 출처</div>
            <div className="space-y-1">
              {section.citations.map(c => (
                <div key={c.id} className="flex items-center gap-2 text-xs">
                  <span>{confidenceEmoji(c.confidence)}</span>
                  <span className="text-[#2e7d32] font-medium">{c.source}</span>
                  <span className="text-[#5a6b47]">— {c.title} ({c.year})</span>
                  <span className="text-gray-400">({confidenceLabel(c.confidence)})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CitationPanel({ citations, onClose }: { citations: Citation[]; onClose: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-[#d4dcc8] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#d4dcc8] bg-[#F6F8F2]">
        <h3 className="text-sm font-semibold text-[#1a2e0a]">📚 참고문헌 목록</h3>
        <button onClick={onClose} className="text-xs text-[#5a6b47] hover:text-[#1a2e0a]">닫기</button>
      </div>
      <div className="p-4 space-y-3">
        {citations.length === 0 ? (
          <div className="text-sm text-[#5a6b47] text-center py-8">
            섹션 생성 후 인용된 출처가 여기에 표시됩니다.
          </div>
        ) : (
          citations.map((c, i) => (
            <div key={c.id} className="flex gap-3 p-3 bg-[#F6F8F2] rounded-lg border border-[#d4dcc8]">
              <span className="text-lg shrink-0">{confidenceEmoji(c.confidence)}</span>
              <div>
                <div className="text-sm font-semibold text-[#1a2e0a]">[{i + 1}] {c.title}</div>
                <div className="text-xs text-[#5a6b47] mt-0.5">{c.source}, {c.year}</div>
                <div className="text-xs text-gray-400 mt-0.5">{confidenceLabel(c.confidence)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function extractCitations(text: string, sectionId: string): Citation[] {
  const citations: Citation[] = [];
  const regex = /\[출처:\s*([^,]+),\s*([^,]+),\s*(\d{4})\]/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    citations.push({
      id: generateId(),
      source: match[1].trim(),
      title: match[2].trim(),
      year: match[3].trim(),
      confidence: 'official',
      usedIn: [sectionId],
    });
  }
  return citations;
}
