'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { buildProxyUrl } from '../lib/api';
import { clearToken, getToken, saveToken } from '../lib/auth';

type SessionStatus = 'loading' | 'guest' | 'authenticated';

type SessionUser = {
  id?: string;
  email: string;
  isAdmin?: boolean;
};

type SessionState = {
  status: SessionStatus;
  user?: SessionUser;
};

type SessionContextValue = {
  session: SessionState;
  refreshSession: () => Promise<void>;
  applyToken: (token: string) => Promise<void>;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionState>({ status: 'loading' });

  const refreshSession = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setSession({ status: 'guest' });
      return;
    }
    setSession((prev) => {
      if (prev.status === 'authenticated') return prev;
      return { status: 'loading' };
    });
    try {
      const res = await fetch(buildProxyUrl('auth/me'), {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('unauthorized');
      const data = await res.json();
      const user = data?.user ?? data;
      setSession({ status: 'authenticated', user });
    } catch {
      clearToken();
      setSession({ status: 'guest' });
    }
  }, []);

  const applyToken = useCallback(
    async (token: string) => {
      saveToken(token);
      await refreshSession();
    },
    [refreshSession],
  );

  const signOut = useCallback(() => {
    clearToken();
    setSession({ status: 'guest' });
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const value = useMemo(
    () => ({
      session,
      refreshSession,
      applyToken,
      signOut,
    }),
    [session, refreshSession, applyToken, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
