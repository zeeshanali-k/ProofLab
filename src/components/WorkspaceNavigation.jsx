'use client';

import Link from 'next/link';

const THEME_STORAGE_KEY = 'prooflab:theme';

export function WorkspaceTabs({ current }) {
  return (
    <nav className="workspace-tabs" aria-label="Workspace navigation">
      <Link href="/" className={`workspace-tab ${current === 'learn' ? 'is-active' : ''}`} aria-current={current === 'learn' ? 'page' : undefined}>
        Learn
      </Link>
      <Link href="/leetmath" className={`workspace-tab ${current === 'leetmath' ? 'is-active' : ''}`} aria-current={current === 'leetmath' ? 'page' : undefined}>
        LeetMath
      </Link>
    </nav>
  );
}

export function ThemeToggle() {
  const toggleTheme = () => {
    const root = document.documentElement;
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = nextTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode" title="Toggle dark mode">
      <svg className="theme-icon theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.5" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" /></svg>
      <svg className="theme-icon theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.4A8.7 8.7 0 0 1 8.6 3.5 8.8 8.8 0 1 0 20.5 15.4Z" /></svg>
    </button>
  );
}
