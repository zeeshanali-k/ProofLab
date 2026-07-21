'use client';

import Link from 'next/link';

export function WorkspaceTabs({ current }) {
  return (
    <nav className="workspace-tabs" aria-label="Workspace navigation">
      <Link href="/math" className={`workspace-tab ${current === 'learn' ? 'is-active' : ''}`} aria-current={current === 'learn' ? 'page' : undefined}>
        Learn
      </Link>
      <Link href="/math/foundations" className={`workspace-tab ${current === 'foundations' ? 'is-active' : ''}`} aria-current={current === 'foundations' ? 'page' : undefined}>
        Foundations
      </Link>
      <Link href="/leetmath" className={`workspace-tab ${current === 'leetmath' ? 'is-active' : ''}`} aria-current={current === 'leetmath' ? 'page' : undefined}>
        LeetMath
      </Link>
    </nav>
  );
}
