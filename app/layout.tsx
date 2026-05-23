import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ODAFlow — AI Proposal Workspace',
  description: 'ODA/국제개발협력 AI 기반 제안서 작성 시스템',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
