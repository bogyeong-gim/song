import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Citation } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function confidenceEmoji(confidence: Citation['confidence']): string {
  switch (confidence) {
    case 'official': return '🟢';
    case 'partial': return '🟡';
    case 'unverified': return '🔴';
  }
}

export function confidenceLabel(confidence: Citation['confidence']): string {
  switch (confidence) {
    case 'official': return '공식 출처 기반';
    case 'partial': return '부분 추론 포함';
    case 'unverified': return '검증 안됨';
  }
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);
}

export function scoreColor(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.8) return 'text-green-600';
  if (pct >= 0.6) return 'text-yellow-600';
  return 'text-red-600';
}

export function scoreBg(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.8) return 'bg-green-100 border-green-300';
  if (pct >= 0.6) return 'bg-yellow-100 border-yellow-300';
  return 'bg-red-100 border-red-300';
}
