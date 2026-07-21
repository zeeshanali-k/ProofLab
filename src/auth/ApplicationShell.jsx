'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ModuleBackLink } from '../components/ModuleBackLink';
import { Navigation } from '../components/Navigation';
import { safeReturnTo } from '../api/AuthService';
import { useAuth } from './AuthProvider';

export function ApplicationShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useAuth();
  const isLanding = pathname === '/';

  useEffect(() => {
    if (status === 'authenticated' && isLanding) {
      router.replace('/dashboard');
    } else if (status === 'unauthenticated' && !isLanding) {
      router.replace(`/?returnTo=${encodeURIComponent(safeReturnTo(pathname))}`);
    }
  }, [isLanding, pathname, router, status]);

  if (status === 'loading') return <main className="auth-loading">Loading ProofLab…</main>;
  if (isLanding) return children;
  if (status === 'unauthenticated') return <main className="auth-loading">Taking you to sign in…</main>;

  return <>
    <Navigation />
    <ModuleBackLink />
    {children}
  </>;
}
