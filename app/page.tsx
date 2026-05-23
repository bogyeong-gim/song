'use client';
import { ProposalProvider } from '@/contexts/ProposalContext';
import WorkspaceLayout from '@/components/WorkspaceLayout';

export default function Home() {
  return (
    <ProposalProvider>
      <WorkspaceLayout />
    </ProposalProvider>
  );
}
