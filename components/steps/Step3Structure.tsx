'use client';
import React, { useState } from 'react';
import { useProposal } from '@/contexts/ProposalContext';
import { ProblemNode, PDMRow, RiskItem } from '@/lib/types';
import { generateId } from '@/lib/utils';

type Tab = 'problem' | 'toc' | 'pdm' | 'risk';

export default function Step3Structure() {
  const { state, dispatch, setStep } = useProposal();
  const [tab, setTab] = useState<Tab>('problem');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'problem', label: 'Problem Tree', icon: '🌳' },
    { id: 'toc', label: 'Theory of Change', icon: '🔄' },
    { id: 'pdm', label: 'PDM', icon: '📋' },
    { id: 'risk', label: 'Risk Matrix', icon: '⚠️' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#1a2e0a] mb-1">사업 구조화</h2>
        <p className="text-sm text-[#5a6b47]">Problem Tree, TOC, PDM, Risk Matrix를 작성하세요.</p>
      </div>

      <div className="flex gap-1 mb-6 bg-[#F6F8F2] p-1 rounded-xl border border-[#d4dcc8]">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-white text-[#6B8E23] shadow-sm border border-[#d4dcc8]'
                : 'text-[#5a6b47] hover:text-[#1a2e0a]'
            }`}
          >
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'problem' && <ProblemTreeEditor />}
      {tab === 'toc' && <TOCEditor />}
      {tab === 'pdm' && <PDMEditor />}
      {tab === 'risk' && <RiskEditor />}

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setStep(2)}
          className="px-4 py-2 border border-[#d4dcc8] text-[#5a6b47] rounded-xl hover:border-[#6B8E23] transition-colors text-sm"
        >
          ← 이전
        </button>
        <button
          onClick={() => setStep(4)}
          className="px-6 py-3 bg-[#6B8E23] text-white rounded-xl font-semibold hover:bg-[#4a6317] transition-colors shadow-sm"
        >
          제안서 작성 →
        </button>
      </div>
    </div>
  );
}

function ProblemTreeEditor() {
  const { state, dispatch } = useProposal();
  const { problemTree } = state;

  const addNode = (type: ProblemNode['type']) => {
    dispatch({
      type: 'ADD_PROBLEM_NODE',
      payload: { id: generateId(), text: '', type },
    });
  };

  const updateNode = (id: string, text: string) =>
    dispatch({ type: 'UPDATE_PROBLEM_NODE', payload: { id, text } });

  const deleteNode = (id: string) =>
    dispatch({ type: 'DELETE_PROBLEM_NODE', payload: id });

  const core = problemTree.filter(n => n.type === 'core');
  const causes = problemTree.filter(n => n.type === 'cause');
  const effects = problemTree.filter(n => n.type === 'effect');

  return (
    <div className="space-y-6">
      {/* Effects */}
      <NodeSection
        title="결과 (Effects)"
        icon="⬆️"
        color="bg-red-50 border-red-200"
        nodes={effects}
        onAdd={() => addNode('effect')}
        onUpdate={updateNode}
        onDelete={deleteNode}
        placeholder="핵심 문제로 인해 발생하는 결과·영향"
      />

      {/* Core Problem */}
      <NodeSection
        title="핵심 문제 (Core Problem)"
        icon="🎯"
        color="bg-amber-50 border-amber-300"
        nodes={core}
        onAdd={() => addNode('core')}
        onUpdate={updateNode}
        onDelete={deleteNode}
        placeholder="해결하려는 핵심 문제"
        maxNodes={1}
      />

      {/* Causes */}
      <NodeSection
        title="원인 (Causes)"
        icon="⬇️"
        color="bg-blue-50 border-blue-200"
        nodes={causes}
        onAdd={() => addNode('cause')}
        onUpdate={updateNode}
        onDelete={deleteNode}
        placeholder="핵심 문제의 근본 원인"
      />

      {problemTree.length === 0 && (
        <div className="text-center py-8 text-sm text-[#5a6b47]">
          위 버튼을 클릭해 Problem Tree를 구성하세요.
          <br />오른쪽 AI 패널의 Project Design Agent에게 도움을 요청할 수 있습니다.
        </div>
      )}
    </div>
  );
}

function NodeSection({
  title, icon, color, nodes, onAdd, onUpdate, onDelete, placeholder, maxNodes,
}: {
  title: string; icon: string; color: string;
  nodes: ProblemNode[]; onAdd: () => void;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  placeholder: string; maxNodes?: number;
}) {
  const canAdd = !maxNodes || nodes.length < maxNodes;
  return (
    <div className={`p-4 rounded-xl border-2 ${color}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-[#1a2e0a]">{icon} {title}</span>
        {canAdd && (
          <button
            onClick={onAdd}
            className="text-xs px-2 py-1 bg-white border border-[#d4dcc8] rounded-lg text-[#5a6b47] hover:border-[#6B8E23] hover:text-[#6B8E23] transition-colors"
          >
            + 추가
          </button>
        )}
      </div>
      <div className="space-y-2">
        {nodes.map(node => (
          <div key={node.id} className="flex gap-2">
            <input
              value={node.text}
              onChange={e => onUpdate(node.id, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 border border-[#d4dcc8] rounded-lg text-sm bg-white focus:outline-none focus:border-[#6B8E23]"
            />
            <button
              onClick={() => onDelete(node.id)}
              className="px-2 text-red-400 hover:text-red-600 text-sm"
            >
              ✕
            </button>
          </div>
        ))}
        {nodes.length === 0 && (
          <div className="text-xs text-gray-400 italic px-2">{placeholder}</div>
        )}
      </div>
    </div>
  );
}

function TOCEditor() {
  const { state, dispatch } = useProposal();
  const { toc } = state;

  const updateList = (field: keyof typeof toc, index: number, value: string) => {
    if (field === 'impact') return;
    const arr = [...(toc[field] as string[])];
    arr[index] = value;
    dispatch({ type: 'SET_TOC', payload: { [field]: arr } });
  };

  const addToList = (field: keyof typeof toc) => {
    if (field === 'impact') return;
    const arr = [...(toc[field] as string[]), ''];
    dispatch({ type: 'SET_TOC', payload: { [field]: arr } });
  };

  const removeFromList = (field: keyof typeof toc, index: number) => {
    if (field === 'impact') return;
    const arr = (toc[field] as string[]).filter((_, i) => i !== index);
    dispatch({ type: 'SET_TOC', payload: { [field]: arr } });
  };

  const tocFields: { key: keyof typeof toc; label: string; icon: string; color: string; placeholder: string }[] = [
    { key: 'inputs', label: 'Inputs', icon: '📥', color: 'bg-gray-50 border-gray-200', placeholder: '투입 자원' },
    { key: 'activities', label: 'Activities', icon: '⚙️', color: 'bg-blue-50 border-blue-200', placeholder: '주요 활동' },
    { key: 'outputs', label: 'Outputs', icon: '📤', color: 'bg-green-50 border-green-200', placeholder: '산출물/결과물' },
    { key: 'outcomes', label: 'Outcomes', icon: '🎯', color: 'bg-amber-50 border-amber-200', placeholder: '성과/변화' },
  ];

  return (
    <div className="space-y-4">
      {tocFields.map(f => (
        <div key={f.key} className={`p-4 rounded-xl border-2 ${f.color}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[#1a2e0a]">{f.icon} {f.label}</span>
            <button
              onClick={() => addToList(f.key)}
              className="text-xs px-2 py-1 bg-white border border-[#d4dcc8] rounded-lg text-[#5a6b47] hover:border-[#6B8E23] transition-colors"
            >
              + 추가
            </button>
          </div>
          <div className="space-y-2">
            {(toc[f.key] as string[]).map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={item}
                  onChange={e => updateList(f.key, i, e.target.value)}
                  placeholder={f.placeholder}
                  className="flex-1 px-3 py-2 border border-[#d4dcc8] rounded-lg text-sm bg-white focus:outline-none focus:border-[#6B8E23]"
                />
                <button onClick={() => removeFromList(f.key, i)} className="px-2 text-red-400 hover:text-red-600 text-sm">✕</button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="p-4 rounded-xl border-2 bg-purple-50 border-purple-200">
        <div className="text-sm font-semibold text-[#1a2e0a] mb-2">🏆 Impact (최종 영향)</div>
        <textarea
          value={toc.impact}
          onChange={e => dispatch({ type: 'SET_TOC', payload: { impact: e.target.value } })}
          placeholder="장기적으로 달성하려는 최종 사회적 변화"
          rows={2}
          className="w-full px-3 py-2 border border-[#d4dcc8] rounded-lg text-sm bg-white focus:outline-none focus:border-[#6B8E23] resize-none"
        />
      </div>
    </div>
  );
}

function PDMEditor() {
  const { state, dispatch } = useProposal();
  const { pdm } = state;

  const levelConfig = {
    goal: { label: 'Goal (목표)', color: 'bg-purple-100', border: 'border-l-4 border-purple-400' },
    outcome: { label: 'Outcome (성과)', color: 'bg-green-100', border: 'border-l-4 border-green-400' },
    output: { label: 'Output (산출)', color: 'bg-blue-100', border: 'border-l-4 border-blue-400' },
    activity: { label: 'Activity (활동)', color: 'bg-gray-100', border: 'border-l-4 border-gray-400' },
  };

  const updateRow = (row: PDMRow) => dispatch({ type: 'UPDATE_PDM_ROW', payload: row });
  const deleteRow = (id: string) => dispatch({ type: 'DELETE_PDM_ROW', payload: id });
  const addRow = (level: PDMRow['level']) =>
    dispatch({
      type: 'ADD_PDM_ROW',
      payload: { id: generateId(), level, description: '', indicator: '', baselineTarget: '', assumption: '', meansOfVerification: '' },
    });

  return (
    <div className="space-y-4">
      {((['goal', 'outcome', 'output', 'activity'] as PDMRow['level'][]).map(level => {
        const rows = pdm.filter(r => r.level === level);
        const cfg = levelConfig[level];
        return (
          <div key={level} className={`p-4 rounded-xl border ${cfg.color}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[#1a2e0a]">{cfg.label}</span>
              <button
                onClick={() => addRow(level)}
                className="text-xs px-2 py-1 bg-white border border-[#d4dcc8] rounded-lg text-[#5a6b47] hover:border-[#6B8E23] transition-colors"
              >
                + 추가
              </button>
            </div>
            <div className="space-y-3">
              {rows.map(row => (
                <div key={row.id} className={`bg-white p-3 rounded-lg ${cfg.border}`}>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">내용</label>
                      <input
                        value={row.description}
                        onChange={e => updateRow({ ...row, description: e.target.value })}
                        placeholder="구체적인 내용을 입력하세요"
                        className="w-full px-2 py-1.5 border border-[#d4dcc8] rounded text-sm focus:outline-none focus:border-[#6B8E23]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">지표 (Indicator)</label>
                        <input
                          value={row.indicator}
                          onChange={e => updateRow({ ...row, indicator: e.target.value })}
                          placeholder="측정 지표"
                          className="w-full px-2 py-1.5 border border-[#d4dcc8] rounded text-sm focus:outline-none focus:border-[#6B8E23]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">기준치/목표치</label>
                        <input
                          value={row.baselineTarget}
                          onChange={e => updateRow({ ...row, baselineTarget: e.target.value })}
                          placeholder="Baseline → Target"
                          className="w-full px-2 py-1.5 border border-[#d4dcc8] rounded text-sm focus:outline-none focus:border-[#6B8E23]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">가정 (Assumption)</label>
                        <input
                          value={row.assumption}
                          onChange={e => updateRow({ ...row, assumption: e.target.value })}
                          placeholder="전제 조건"
                          className="w-full px-2 py-1.5 border border-[#d4dcc8] rounded text-sm focus:outline-none focus:border-[#6B8E23]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">검증 수단 (MOV)</label>
                        <input
                          value={row.meansOfVerification}
                          onChange={e => updateRow({ ...row, meansOfVerification: e.target.value })}
                          placeholder="데이터 수집 방법"
                          className="w-full px-2 py-1.5 border border-[#d4dcc8] rounded text-sm focus:outline-none focus:border-[#6B8E23]"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteRow(row.id)}
                    className="mt-2 text-xs text-red-400 hover:text-red-600"
                  >
                    삭제
                  </button>
                </div>
              ))}
              {rows.length === 0 && (
                <div className="text-xs text-gray-400 italic text-center py-2">
                  + 추가 버튼을 클릭해 항목을 추가하세요
                </div>
              )}
            </div>
          </div>
        );
      }))}
    </div>
  );
}

function RiskEditor() {
  const { state, dispatch } = useProposal();
  const { risks } = state;

  const categoryLabels: Record<string, string> = {
    political: '정치', financial: '재정', operational: '운영',
    environmental: '환경', social: '사회',
  };
  const levelColors = { low: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', high: 'bg-red-100 text-red-700' };

  const updateRisk = (risk: RiskItem) => dispatch({ type: 'UPDATE_RISK', payload: risk });
  const addRisk = () =>
    dispatch({
      type: 'ADD_RISK',
      payload: { id: generateId(), category: 'operational', description: '', likelihood: 'medium', impact: 'medium', mitigation: '' },
    });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-[#5a6b47]">{risks.length}개 리스크 식별됨</span>
        <button
          onClick={addRisk}
          className="text-sm px-3 py-1.5 bg-[#6B8E23] text-white rounded-lg hover:bg-[#4a6317] transition-colors"
        >
          + 리스크 추가
        </button>
      </div>

      {risks.map(risk => (
        <div key={risk.id} className="p-4 bg-white rounded-xl border border-[#d4dcc8]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">카테고리</label>
              <select
                value={risk.category}
                onChange={e => updateRisk({ ...risk, category: e.target.value as RiskItem['category'] })}
                className="w-full px-2 py-1.5 border border-[#d4dcc8] rounded text-sm focus:outline-none focus:border-[#6B8E23]"
              >
                {Object.entries(categoryLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">발생 가능성</label>
              <select
                value={risk.likelihood}
                onChange={e => updateRisk({ ...risk, likelihood: e.target.value as RiskItem['likelihood'] })}
                className="w-full px-2 py-1.5 border border-[#d4dcc8] rounded text-sm focus:outline-none focus:border-[#6B8E23]"
              >
                <option value="low">낮음</option>
                <option value="medium">중간</option>
                <option value="high">높음</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">영향도</label>
              <select
                value={risk.impact}
                onChange={e => updateRisk({ ...risk, impact: e.target.value as RiskItem['impact'] })}
                className="w-full px-2 py-1.5 border border-[#d4dcc8] rounded text-sm focus:outline-none focus:border-[#6B8E23]"
              >
                <option value="low">낮음</option>
                <option value="medium">중간</option>
                <option value="high">높음</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <input
              value={risk.description}
              onChange={e => updateRisk({ ...risk, description: e.target.value })}
              placeholder="리스크 설명"
              className="w-full px-2 py-1.5 border border-[#d4dcc8] rounded text-sm focus:outline-none focus:border-[#6B8E23]"
            />
            <input
              value={risk.mitigation}
              onChange={e => updateRisk({ ...risk, mitigation: e.target.value })}
              placeholder="완화 방안"
              className="w-full px-2 py-1.5 border border-[#d4dcc8] rounded text-sm focus:outline-none focus:border-[#6B8E23]"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColors[risk.likelihood]}`}>
              발생: {risk.likelihood === 'low' ? '낮음' : risk.likelihood === 'medium' ? '중간' : '높음'}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColors[risk.impact]}`}>
              영향: {risk.impact === 'low' ? '낮음' : risk.impact === 'medium' ? '중간' : '높음'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
