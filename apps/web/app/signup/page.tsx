'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { postJSON } from '../lib/api';
import { useSession } from '../components/SessionProvider';

type RegisterResponse = { token: string; user: { email: string } };

export default function SignUpPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const { applyToken } = useSession();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await postJSON<RegisterResponse>('auth/register', {
        email: form.email.trim(),
        password: form.password,
      });
      await applyToken(res.token);
      setMessage(`Welcome, ${res.user.email}! Your account is ready.`);
      setForm({ email: res.user.email, password: '' });
      router.push('/account');
    } catch (err: any) {
      setMessage(err?.message || 'Unable to create account');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-section" style={{ maxWidth: '480px' }}>
      <div className="card-muted" style={{ padding: '32px' }}>
        <h1>Create your Rollator account</h1>
        <p className="muted">Save preferences, manage orders, and unlock the admin studio when you receive an invitation.</p>
        <form className="form-grid" onSubmit={submit}>
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input
              className="input"
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              autoComplete="email"
              required
            />
          </div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input
              className="input"
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: 18, color: message.startsWith('Welcome') ? 'var(--success)' : 'crimson' }}>{message}</p>
        )}

        <p style={{ marginTop: 18 }}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
