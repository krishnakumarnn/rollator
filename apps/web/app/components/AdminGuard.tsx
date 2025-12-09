'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useSession } from './SessionProvider';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { session, refreshSession } = useSession();

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  if (session.status === 'loading') {
    return (
      <div className="page-section" style={{ maxWidth: '320px' }}>
        <div className="card-muted" style={{ padding: '24px', textAlign: 'center' }}>
          <p className="muted">Checking admin access…</p>
        </div>
      </div>
    );
  }

  if (session.status !== 'authenticated') {
    return (
      <div className="page-section" style={{ maxWidth: '420px' }}>
        <div className="card-muted" style={{ padding: '28px' }}>
          <h2>Sign in required</h2>
          <p className="muted">You need to sign in with an admin-enabled account to access this section.</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
            <Link className="pill pill--primary" href="/login">
              Sign in
            </Link>
            <Link className="pill pill--ghost" href="/signup">
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!session.user?.isAdmin) {
    return (
      <div className="page-section" style={{ maxWidth: '480px' }}>
        <div className="card-muted" style={{ padding: '28px' }}>
          <h2>Admin permissions required</h2>
          <p className="muted">
            Your account is active but does not have administrative privileges. Contact your Rollator studio admin to
            request access.
          </p>
          <Link className="pill pill--ghost" href="/account">
            Return to account overview
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
