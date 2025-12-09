'use client';

import { useState } from 'react';
import { buildProxyUrl } from '../../lib/api';
import { getToken } from '../../lib/auth';

type Props = {
  initialMedia: { key: string; dataUrl: string; alt?: string | null } | null;
};

export default function ExperienceMediaForm({ initialMedia }: Props) {
  const [preview, setPreview] = useState(initialMedia?.dataUrl ?? null);
  const [alt, setAlt] = useState(initialMedia?.alt ?? 'ICT Rollator in the clinic');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const form = event.currentTarget;
    const file = (form.elements.namedItem('image') as HTMLInputElement)?.files?.[0];
    if (!file) {
      setBusy(false);
      setMessage('Choose a JPEG or PNG image to upload.');
      return;
    }
    const token = getToken();
    if (!token) {
      setBusy(false);
      setMessage('Sign in with an admin account first.');
      return;
    }
    const data = new FormData();
    data.append('image', file);
    if (alt) data.append('alt', alt);
    try {
      const res = await fetch(buildProxyUrl('admin/experience/media/rollator-hero'), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Upload failed (${res.status})`);
      }
      const payload = await res.json();
      setPreview(payload.dataUrl ?? null);
      setMessage('Saved · hero image updated');
    } catch (err: any) {
      setMessage(err?.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="stack" onSubmit={submit} encType="multipart/form-data" style={{ maxWidth: 520 }}>
      <div className="card-muted" style={{ padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Hero image</h2>
        <p className="muted">This image appears in the “Experience the Rollator in Action” section.</p>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={alt || 'Rollator hero'}
            style={{ width: '100%', borderRadius: 12, marginTop: 12 }}
          />
        ) : (
          <p className="muted" style={{ marginTop: 12 }}>
            No image uploaded yet.
          </p>
        )}
        <div className="stack" style={{ marginTop: 18 }}>
          <input
            name="image"
            type="file"
            accept="image/jpeg,image/png"
            style={{ border: '1px dashed rgba(15,23,42,0.2)', padding: '16px', borderRadius: 12 }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setPreview(URL.createObjectURL(file));
              }
            }}
          />
          <label className="field-group">
            <span>Alt text</span>
            <input
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="ICT Rollator in the clinic"
            />
          </label>
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save hero image'}
          </button>
          {message && (
            <p style={{ margin: 0, color: message.startsWith('Saved') ? 'var(--success)' : 'crimson' }}>{message}</p>
          )}
        </div>
      </div>
    </form>
  );
}
