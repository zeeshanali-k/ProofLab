'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthService } from '../api/AuthService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading');
  const [account, setAccount] = useState(null);

  const refresh = useCallback(async () => {
    setStatus('loading');
    try {
      const nextAccount = await AuthService.me();
      setAccount(nextAccount);
      setStatus('authenticated');
      return nextAccount;
    } catch {
      setAccount(null);
      setStatus('unauthenticated');
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    AuthService.me().then((nextAccount) => {
      if (!active) return;
      setAccount(nextAccount);
      setStatus('authenticated');
    }).catch(() => {
      if (!active) return;
      setAccount(null);
      setStatus('unauthenticated');
    });
    return () => { active = false; };
  }, []);

  const authenticate = useCallback(async (method, payload) => {
    const nextAccount = await AuthService[method](payload);
    setAccount(nextAccount);
    setStatus('authenticated');
    return nextAccount;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const nextAccount = await AuthService.updateProfile(payload);
    setAccount(nextAccount);
    return nextAccount;
  }, []);

  const logout = useCallback(async () => {
    await AuthService.logout();
    setAccount(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(() => ({
    status,
    account,
    user: account?.user ?? null,
    profile: account?.profile ?? null,
    refresh,
    login: (payload) => authenticate('login', payload),
    register: (payload) => authenticate('register', payload),
    updateProfile,
    logout,
  }), [account, authenticate, logout, refresh, status, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
