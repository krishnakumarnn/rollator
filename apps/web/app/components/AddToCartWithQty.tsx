'use client';

import { useState } from 'react';
import { ensureGuestKey } from '../lib/guestClient';
import { buildProxyUrl } from '../lib/api';

export default function AddToCartWithQty({ variantId }: { variantId: string }) {
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function add() {
    try {
      setBusy(true);
      setMsg(null);
      const guestKey = ensureGuestKey();
      const res = await fetch(buildProxyUrl('cart/items'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-guest-key': guestKey,
        },
        body: JSON.stringify({ variantId, quantity: qty }),
        cache: 'no-store',
      });
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(t || `Add failed (${res.status})`);
      }
      setMsg('✅ Added to cart');
    } catch (e: any) {
      setMsg(e?.message || 'Failed to add');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
      <input
        type="number"
        min={1}
        value={qty}
        onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
        style={{ width: 72, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(15, 23, 42, 0.12)' }}
      />
      <button onClick={add} disabled={busy} className="btn-primary" style={{ opacity: busy ? 0.7 : 1 }}>
        {busy ? 'Adding…' : 'Add to cart'}
      </button>
      {msg && <span className="muted">{msg}</span>}
    </div>
  );
}
