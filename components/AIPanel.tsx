'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useProposal } from '@/contexts/ProposalContext';
import { AgentMessage, AgentType, AGENT_INFO } from '@/lib/types';
import { generateId, formatDate } from '@/lib/utils';

const DEFAULT_AGENT: AgentType = 'idea_intake';

export default function AIPanel() {
  const { state } = useProposal();
  const [activeAgent, setActiveAgent] = useState<AgentType>(DEFAULT_AGENT);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const agents = Object.entries(AGENT_INFO) as [AgentType, typeof AGENT_INFO[AgentType]][];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: AgentMessage = {
      id: generateId(), role: 'user', content: input.trim(),
      agentType: activeAgent, timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const assistantId = generateId();
    setMessages(prev => [...prev, {
      id: assistantId, role: 'assistant', content: '',
      agentType: activeAgent, timestamp: new Date(),
    }]);

    try {
      const resp = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          agentType: activeAgent,
          projectContext: state.idea,
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
                  setMessages(prev => prev.map(m =>
                    m.id === assistantId ? { ...m, content: accumulated } : m
                  ));
                }
              } catch {}
            }
          }
        }
      }
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: 'API 오류가 발생했습니다. OPENAI_API_KEY를 확인해주세요.' }
          : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => setMessages([]);

  const agent = AGENT_INFO[activeAgent];

  return (
    <div className="flex flex-col h-full bg-white border-l border-[#d4dcc8]" style={{ minWidth: 0 }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#d4dcc8] bg-[#F6F8F2]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{agent.icon}</span>
            <div>
              <div className="text-sm font-semibold text-[#1a2e0a]">{agent.name}</div>
              <div className="text-xs text-[#5a6b47]">{agent.description}</div>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="text-xs text-[#5a6b47] hover:text-[#6B8E23] px-2 py-1 rounded border border-[#d4dcc8] hover:border-[#6B8E23] transition-colors"
          >
            초기화
          </button>
        </div>

        {/* Agent Selector */}
        <div className="flex gap-1 flex-wrap">
          {agents.map(([type, info]) => (
            <button
              key={type}
              onClick={() => setActiveAgent(type)}
              title={info.name}
              className={`text-base px-1.5 py-0.5 rounded transition-all ${
                activeAgent === type
                  ? 'bg-[#6B8E23] text-white shadow-sm scale-110'
                  : 'bg-[#e8ede0] text-[#5a6b47] hover:bg-[#d4dcc8]'
              }`}
            >
              {info.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">{agent.icon}</div>
            <div className="text-sm font-medium text-[#1a2e0a] mb-1">{agent.name}</div>
            <div className="text-xs text-[#5a6b47] mb-4">{agent.description}</div>
            <div className="space-y-2">
              {getQuickPrompts(activeAgent, state.idea.donor).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt)}
                  className="block w-full text-left text-xs px-3 py-2 bg-[#F6F8F2] hover:bg-[#e8ede0] border border-[#d4dcc8] rounded-lg text-[#5a6b47] transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`agent-bubble ${msg.role === 'assistant' ? 'assistant' : 'user'}`}>
              {msg.role === 'assistant' && (
                <div className="text-xs font-medium mb-1 opacity-60">
                  {AGENT_INFO[msg.agentType || 'idea_intake']?.icon} {AGENT_INFO[msg.agentType || 'idea_intake']?.name}
                </div>
              )}
              <div className="whitespace-pre-wrap text-sm">
                {msg.content || (
                  <span className="flex gap-1 items-center">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </span>
                )}
              </div>
              <div className="text-xs opacity-40 mt-1">{formatDate(msg.timestamp)}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#d4dcc8] bg-[#F6F8F2]">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`${agent.name}에게 질문하세요... (Shift+Enter: 줄바꿈)`}
            className="flex-1 resize-none border border-[#d4dcc8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6B8E23] bg-white min-h-[60px] max-h-[120px]"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-3 py-2 bg-[#6B8E23] text-white rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-[#4a6317] transition-colors shrink-0"
          >
            전송
          </button>
        </div>
        {!process.env.NEXT_PUBLIC_HAS_API_KEY && (
          <div className="text-xs text-amber-600 mt-1">
            ⚠ .env.local에 OPENAI_API_KEY를 설정해주세요
          </div>
        )}
      </div>
    </div>
  );
}

function getQuickPrompts(agent: AgentType, donor: string): string[] {
  const prompts: Record<AgentType, string[]> = {
    idea_intake: [
      `${donor} 제안서를 위한 사업 아이디어를 구체화해주세요`,
      '수혜자 설정과 사업 필요성을 어떻게 작성해야 할까요?',
      '사업 규모와 예산은 어떻게 설정하면 좋을까요?',
    ],
    sector_expert: [
      '이 분야의 국제 Best Practice를 알려주세요',
      'SDGs와 어떻게 연계해야 할까요?',
      '관련 국제 통계와 데이터를 제공해주세요',
    ],
    country_expert: [
      `${donor === 'KOICA' ? 'KOICA CPS와의 정합성을 검토해주세요' : '해당 국가의 ODA 현황을 알려주세요'}`,
      '현지 파트너 기관을 어떻게 선정해야 할까요?',
      '주요 리스크 요인을 분석해주세요',
    ],
    project_design: [
      'Problem Tree를 어떻게 구성할까요?',
      'Theory of Change를 설계해주세요',
      'PDM 작성 방법을 안내해주세요',
    ],
    mne: [
      'SMART 성과지표를 설계해주세요',
      'Baseline 데이터를 어떻게 수집할까요?',
      'M&E 계획을 수립해주세요',
    ],
    stakeholder: [
      '주요 이해관계자를 분석해주세요',
      'Power-Interest Matrix를 구성해주세요',
      '이해관계자 참여 전략을 제안해주세요',
    ],
    risk: [
      '주요 리스크를 분석해주세요',
      'Exit Strategy를 설계해주세요',
      '지속가능성 방안을 제안해주세요',
    ],
    narrative_writer: [
      `${donor} 스타일로 사업 배경을 작성해주세요`,
      '문제 분석 섹션을 작성해주세요',
      '사업 목표와 기대 성과를 서술해주세요',
    ],
    review: [
      `${donor} 기준으로 제안서를 검토해주세요`,
      '논리 정합성을 검증해주세요',
      '감점 포인트를 분석해주세요',
    ],
  };
  return prompts[agent] || [];
}
