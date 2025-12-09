'use client';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { buildProxyUrl } from '../../lib/api';
import { getToken } from '../../lib/auth';

type FormState = { name: string; slug: string };

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/--+/g, '-');

export default function CreateCategory() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ name: '', slug: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const derivedSlug = useMemo(() => {
    if (slugTouched && form.slug.trim()) return form.slug.trim();
    return slugify(form.name);
  }, [form, slugTouched]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    const token = getToken();
    if (!token) {
      setBusy(false);
      setMessage('Sign in with an admin account to create categories.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: derivedSlug,
      isActive: true,
    };

    if (!payload.name) {
      setBusy(false);
      setMessage('Category name is required.');
      return;
    }
    if (!payload.slug) {
      setBusy(false);
      setMessage('Slug could not be generated. Add one manually.');
      return;
    }

    try {
      const res = await fetch(buildProxyUrl('admin/categories'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Request failed (${res.status})`);
      }
      const result = await res.json();
      setMessage(`Created • ${result.name}`);
      setForm({ name: '', slug: '' });
      setSlugTouched(false);
      router.refresh();
    } catch (err: any) {
      setMessage(err?.message || 'Unable to create category right now.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ marginTop: 24, display: 'grid', gap: 12, maxWidth: 420 }}>
      <label className="field-group">
        <span>Name</span>
        <input
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Soft goods"
          required
        />
      </label>
      <label className="field-group">
        <span>Slug</span>
        <input
          value={slugTouched ? form.slug : derivedSlug}
          onChange={(e) => {
            setSlugTouched(true);
            setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }));
          }}
          onFocus={() => setSlugTouched(true)}
          placeholder="soft-goods"
          required
        />
      </label>
      <button
        type="submit"
        className="pill pill--primary"
        disabled={busy}
        style={{ justifySelf: 'flex-start', padding: '10px 18px' }}
      >
        {busy ? 'Saving…' : 'Create category'}
      </button>
      {message && (
        <p style={{ margin: 0, color: message.startsWith('Created') ? 'var(--success)' : 'crimson' }}>{message}</p>
      )}
    </form>
  );
}
