'use client';
import { useState } from 'react';
import { ensureGuestKey } from '../lib/guestClient';
import { buildProxyUrl } from '../lib/api';

export default function AddToCartButton({ variantId, quantity = 1 }: { variantId: string; quantity?: number }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  const add = async () => {
    try {
      setBusy(true);
      setStatus('idle');
      const guestKey = ensureGuestKey();
      const r = await fetch(buildProxyUrl('cart/items'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-guest-key': guestKey },
        body: JSON.stringify({ variantId, quantity }),
        cache: 'no-store',
      });
      if (!r.ok) throw new Error('Add failed');
      setStatus('ok');
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setBusy(false);
    }
  };

  const label = busy ? 'Adding…' : status === 'ok' ? 'Added!' : status === 'error' ? 'Try again' : 'Add to cart';

  return (
    <button
      onClick={add}
      disabled={busy}
      style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #111', background: '#111', color: '#fff' }}
    >
      {label}
    </button>
  );
}
