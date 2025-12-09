'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { postJSON, getJSON } from '../lib/api';
import { getToken } from '../lib/auth';
import { useSession } from '../components/SessionProvider';

type LoginResponse = { token: string; user: { email: string; isAdmin?: boolean } };

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const { applyToken, signOut } = useSession();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await postJSON<LoginResponse>('auth/login', form);
      await applyToken(res.token);
      setMessage(`Welcome back, ${res.user.email}${res.user.isAdmin ? ' · admin mode' : ''}`);
      router.push('/account');
    } catch (err: any) {
      signOut();
      setMessage(err?.message || 'Unable to sign in');
    } finally {
      setBusy(false);
    }
  };

  const verifySession = async () => {
    const token = getToken();
    if (!token) return setMessage('No saved session token yet.');
    try {
      const me = await getJSON<{ user: { email: string; isAdmin?: boolean } }>('auth/me', { authToken: token });
      setMessage(`Signed in as ${me.user.email}${me.user.isAdmin ? ' · admin' : ''}`);
    } catch (err: any) {
      signOut();
      setMessage(err?.message || 'Token check failed');
    }
  };

  return (
    <div className="page-section" style={{ maxWidth: '480px' }}>
      <div className="card-muted" style={{ padding: '32px' }}>
        <h1>Sign in</h1>
        <p className="muted">Access order history, Faster checkout, and the admin dashboard when enabled.</p>
        <form className="form-grid" onSubmit={submit}>
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input
              className="input"
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input
              className="input"
              id="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
              minLength={6}
            />
          </div>
          <button className="btn-primary" disabled={busy} type="submit">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="stack" style={{ marginTop: 20 }}>
          <button className="btn-ghost" onClick={verifySession} type="button">
            Check current session
          </button>
          <button
            className="btn-ghost"
            type="button"
            onClick={() => {
              signOut();
              setMessage('Signed out and cleared local session token.');
            }}
          >
            Sign out locally
          </button>
        </div>

        {message && (
          <p style={{ marginTop: 18, color: message.includes('Welcome') || message.includes('Signed in') ? 'var(--success)' : 'crimson' }}>
            {message}
          </p>
        )}

        <p style={{ marginTop: 18 }}>
          Need an account? <Link href="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}
