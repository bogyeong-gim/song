export type DonorType = 'KOICA' | 'CCK' | 'UNICEF' | 'UNDP' | 'WFP' | 'WHO';
export type SectorType = 'education' | 'health' | 'water' | 'agriculture' | 'governance' | 'environment' | 'gender' | 'humanitarian';
export type WorkflowStep = 1 | 2 | 3 | 4 | 5;

export interface ProjectIdea {
  title: string;
  sector: SectorType;
  country: string;
  region: string;
  beneficiaries: string;
  budget: string;
  duration: string;
  description: string;
  donor: DonorType;
}

export interface ProblemNode {
  id: string;
  text: string;
  type: 'core' | 'cause' | 'effect';
  parentId?: string;
  children?: string[];
}

export interface PDMRow {
  id: string;
  level: 'goal' | 'outcome' | 'output' | 'activity';
  description: string;
  indicator: string;
  baselineTarget: string;
  assumption: string;
  meansOfVerification: string;
}

export interface TOCComponent {
  inputs: string[];
  activities: string[];
  outputs: string[];
  outcomes: string[];
  impact: string;
}

export interface RiskItem {
  id: string;
  category: 'political' | 'financial' | 'operational' | 'environmental' | 'social';
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  type: 'beneficiary' | 'government' | 'ngo' | 'donor' | 'community' | 'private';
  interest: 'low' | 'medium' | 'high';
  influence: 'low' | 'medium' | 'high';
  role: string;
}

export interface Citation {
  id: string;
  source: string;
  title: string;
  year: string;
  url?: string;
  confidence: 'official' | 'partial' | 'unverified';
  usedIn: string[];
}

export interface ProposalSection {
  id: string;
  title: string;
  content: string;
  citations: Citation[];
  lastUpdated?: Date;
}

export interface ProposalState {
  idea: ProjectIdea;
  problemTree: ProblemNode[];
  toc: TOCComponent;
  pdm: PDMRow[];
  risks: RiskItem[];
  stakeholders: Stakeholder[];
  sections: ProposalSection[];
  citations: Citation[];
  reviewScore?: ReviewResult;
}

export interface ReviewResult {
  totalScore: number;
  maxScore: number;
  categories: {
    name: string;
    score: number;
    max: number;
    feedback: string;
    issues: string[];
  }[];
  overallFeedback: string;
  weaknesses: string[];
  suggestions: string[];
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentType?: AgentType;
  timestamp: Date;
  citations?: Citation[];
}

export type AgentType =
  | 'idea_intake'
  | 'sector_expert'
  | 'country_expert'
  | 'project_design'
  | 'mne'
  | 'stakeholder'
  | 'risk'
  | 'narrative_writer'
  | 'review';

export const AGENT_INFO: Record<AgentType, { name: string; icon: string; color: string; description: string }> = {
  idea_intake: { name: 'Idea Intake', icon: '💡', color: '#F59E0B', description: '사업 아이디어 구체화' },
  sector_expert: { name: 'Sector Expert', icon: '🎯', color: '#3B82F6', description: '분야별 Best Practice' },
  country_expert: { name: 'Country Expert', icon: '🌍', color: '#10B981', description: 'CPS 정합성 · 지역 분석' },
  project_design: { name: 'Project Design', icon: '📐', color: '#8B5CF6', description: 'Problem Tree · TOC · PDM' },
  mne: { name: 'M&E Expert', icon: '📊', color: '#EF4444', description: 'SMART Indicator · 성과관리' },
  stakeholder: { name: 'Stakeholder', icon: '👥', color: '#06B6D4', description: '이해관계자 분석' },
  risk: { name: 'Risk & Sustainability', icon: '⚠️', color: '#F97316', description: '위험관리 · Exit Strategy' },
  narrative_writer: { name: 'Narrative Writer', icon: '✍️', color: '#6B8E23', description: 'Proposal 작성 · Donor 문체' },
  review: { name: 'Review & Scoring', icon: '🔍', color: '#EC4899', description: 'Compliance · 점수 예측' },
};

export const DONOR_INFO: Record<DonorType, { name: string; color: string; requirements: string[] }> = {
  KOICA: {
    name: 'KOICA',
    color: '#1B5E20',
    requirements: ['PDM 필수', 'CPS 정합성', 'KOICA 가이드라인 준수', '한국어/영어 병기 가능', '성과지표 SMART 기준'],
  },
  CCK: {
    name: '사회복지공동모금회',
    color: '#1565C0',
    requirements: ['사업계획서 양식 준수', '예산 명세 상세', '수혜자 명확화', '성과지표 정량화'],
  },
  UNICEF: {
    name: 'UNICEF',
    color: '#0077C8',
    requirements: ['RBM Framework', 'Child Rights Approach', 'Gender Equality', 'Results Matrix'],
  },
  UNDP: {
    name: 'UNDP',
    color: '#009EDB',
    requirements: ['SDGs Alignment', 'IRRF Framework', 'Gender Marker', 'Environmental Marker'],
  },
  WFP: {
    name: 'WFP',
    color: '#FFB300',
    requirements: ['Logical Framework', 'Food Security Indicators', 'Targeting Criteria', 'Supply Chain'],
  },
  WHO: {
    name: 'WHO',
    color: '#1E88E5',
    requirements: ['Health Indicators', 'Universal Health Coverage', 'Evidence-based Approach', 'One Health'],
  },
};

export const SECTOR_LABELS: Record<SectorType, string> = {
  education: '교육',
  health: '보건',
  water: '식수·위생',
  agriculture: '농업·식량',
  governance: '거버넌스',
  environment: '환경·기후',
  gender: '젠더·여성',
  humanitarian: '인도적지원',
};
