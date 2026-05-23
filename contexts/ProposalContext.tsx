'use client';
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
  ProposalState, ProjectIdea, ProblemNode, PDMRow,
  TOCComponent, RiskItem, Stakeholder, ProposalSection, Citation,
  ReviewResult, WorkflowStep, DonorType,
} from '@/lib/types';
import { generateId } from '@/lib/utils';

const defaultTOC: TOCComponent = {
  inputs: [], activities: [], outputs: [], outcomes: [], impact: '',
};

const defaultIdea: ProjectIdea = {
  title: '', sector: 'education', country: '', region: '',
  beneficiaries: '', budget: '', duration: '', description: '', donor: 'KOICA',
};

const defaultState: ProposalState = {
  idea: defaultIdea,
  problemTree: [],
  toc: defaultTOC,
  pdm: [],
  risks: [],
  stakeholders: [],
  sections: [
    { id: 'background', title: '사업 배경 및 필요성', content: '', citations: [] },
    { id: 'problem', title: '문제 분석', content: '', citations: [] },
    { id: 'objective', title: '사업 목표', content: '', citations: [] },
    { id: 'implementation', title: '사업 내용 및 추진 방법', content: '', citations: [] },
    { id: 'sustainability', title: '지속가능성', content: '', citations: [] },
  ],
  citations: [],
};

type Action =
  | { type: 'SET_IDEA'; payload: Partial<ProjectIdea> }
  | { type: 'SET_DONOR'; payload: DonorType }
  | { type: 'SET_PROBLEM_TREE'; payload: ProblemNode[] }
  | { type: 'ADD_PROBLEM_NODE'; payload: ProblemNode }
  | { type: 'UPDATE_PROBLEM_NODE'; payload: { id: string; text: string } }
  | { type: 'DELETE_PROBLEM_NODE'; payload: string }
  | { type: 'SET_TOC'; payload: Partial<TOCComponent> }
  | { type: 'SET_PDM'; payload: PDMRow[] }
  | { type: 'ADD_PDM_ROW'; payload: PDMRow }
  | { type: 'UPDATE_PDM_ROW'; payload: PDMRow }
  | { type: 'DELETE_PDM_ROW'; payload: string }
  | { type: 'SET_RISKS'; payload: RiskItem[] }
  | { type: 'ADD_RISK'; payload: RiskItem }
  | { type: 'UPDATE_RISK'; payload: RiskItem }
  | { type: 'SET_STAKEHOLDERS'; payload: Stakeholder[] }
  | { type: 'ADD_STAKEHOLDER'; payload: Stakeholder }
  | { type: 'UPDATE_SECTION'; payload: { id: string; content: string; citations?: Citation[] } }
  | { type: 'ADD_CITATION'; payload: Citation }
  | { type: 'SET_REVIEW'; payload: ReviewResult }
  | { type: 'RESET' };

function reducer(state: ProposalState, action: Action): ProposalState {
  switch (action.type) {
    case 'SET_IDEA':
      return { ...state, idea: { ...state.idea, ...action.payload } };
    case 'SET_DONOR':
      return { ...state, idea: { ...state.idea, donor: action.payload } };
    case 'SET_PROBLEM_TREE':
      return { ...state, problemTree: action.payload };
    case 'ADD_PROBLEM_NODE':
      return { ...state, problemTree: [...state.problemTree, action.payload] };
    case 'UPDATE_PROBLEM_NODE':
      return {
        ...state,
        problemTree: state.problemTree.map(n =>
          n.id === action.payload.id ? { ...n, text: action.payload.text } : n
        ),
      };
    case 'DELETE_PROBLEM_NODE':
      return { ...state, problemTree: state.problemTree.filter(n => n.id !== action.payload) };
    case 'SET_TOC':
      return { ...state, toc: { ...state.toc, ...action.payload } };
    case 'SET_PDM':
      return { ...state, pdm: action.payload };
    case 'ADD_PDM_ROW':
      return { ...state, pdm: [...state.pdm, action.payload] };
    case 'UPDATE_PDM_ROW':
      return { ...state, pdm: state.pdm.map(r => r.id === action.payload.id ? action.payload : r) };
    case 'DELETE_PDM_ROW':
      return { ...state, pdm: state.pdm.filter(r => r.id !== action.payload) };
    case 'SET_RISKS':
      return { ...state, risks: action.payload };
    case 'ADD_RISK':
      return { ...state, risks: [...state.risks, action.payload] };
    case 'UPDATE_RISK':
      return { ...state, risks: state.risks.map(r => r.id === action.payload.id ? action.payload : r) };
    case 'SET_STAKEHOLDERS':
      return { ...state, stakeholders: action.payload };
    case 'ADD_STAKEHOLDER':
      return { ...state, stakeholders: [...state.stakeholders, action.payload] };
    case 'UPDATE_SECTION':
      return {
        ...state,
        sections: state.sections.map(s =>
          s.id === action.payload.id
            ? { ...s, content: action.payload.content, citations: action.payload.citations || s.citations, lastUpdated: new Date() }
            : s
        ),
      };
    case 'ADD_CITATION':
      return { ...state, citations: [...state.citations, action.payload] };
    case 'SET_REVIEW':
      return { ...state, reviewScore: action.payload };
    case 'RESET':
      return defaultState;
    default:
      return state;
  }
}

interface ProposalContextValue {
  state: ProposalState;
  step: WorkflowStep;
  setStep: (s: WorkflowStep) => void;
  dispatch: React.Dispatch<Action>;
  addDefaultPDMRows: () => void;
  addDefaultRisks: () => void;
}

const ProposalContext = createContext<ProposalContextValue | null>(null);

export function ProposalProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const [step, setStep] = React.useState<WorkflowStep>(1);

  const addDefaultPDMRows = useCallback(() => {
    const rows: PDMRow[] = [
      { id: generateId(), level: 'goal', description: '', indicator: '', baselineTarget: '', assumption: '', meansOfVerification: '' },
      { id: generateId(), level: 'outcome', description: '', indicator: '', baselineTarget: '', assumption: '', meansOfVerification: '' },
      { id: generateId(), level: 'output', description: '', indicator: '', baselineTarget: '', assumption: '', meansOfVerification: '' },
      { id: generateId(), level: 'activity', description: '', indicator: '', baselineTarget: '', assumption: '', meansOfVerification: '' },
    ];
    dispatch({ type: 'SET_PDM', payload: rows });
  }, []);

  const addDefaultRisks = useCallback(() => {
    const risks: RiskItem[] = [
      { id: generateId(), category: 'political', description: '', likelihood: 'low', impact: 'medium', mitigation: '' },
      { id: generateId(), category: 'financial', description: '', likelihood: 'low', impact: 'high', mitigation: '' },
      { id: generateId(), category: 'operational', description: '', likelihood: 'medium', impact: 'medium', mitigation: '' },
    ];
    dispatch({ type: 'SET_RISKS', payload: risks });
  }, []);

  return (
    <ProposalContext.Provider value={{ state, step, setStep, dispatch, addDefaultPDMRows, addDefaultRisks }}>
      {children}
    </ProposalContext.Provider>
  );
}

export function useProposal() {
  const ctx = useContext(ProposalContext);
  if (!ctx) throw new Error('useProposal must be used within ProposalProvider');
  return ctx;
}
