'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import QtyPicker from '../components/QtyPicker';
import { ensureGuestKey } from '../lib/guestClient';
import { buildProxyUrl } from '../lib/api';

type CartItem = {
  id: string;
  quantity: number;
  priceCents: number;
  sku?: string;
  product?: { name?: string; image?: string };
};

type Cart = { items: CartItem[]; totalCents: number; currency: string };

const formatMoney = (cents: number, currency = 'USD') =>
  (cents / 100).toLocaleString(undefined, { style: 'currency', currency });

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const guestKey = ensureGuestKey();
      const res = await fetch(buildProxyUrl('cart'), {
        headers: { 'x-guest-key': guestKey },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`cart fetch failed (${res.status})`);
      const data = await res.json();
      setCart(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load cart');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const removeItem = async (id: string) => {
    try {
      setBusyId(id);
      const guestKey = ensureGuestKey();
      const res = await fetch(buildProxyUrl(`cart/items/${id}`), {
        method: 'DELETE',
        headers: { 'x-guest-key': guestKey },
      });
      if (!res.ok) throw new Error(`delete failed (${res.status})`);
      await load();
    } catch (err: any) {
      alert(err?.message || 'Remove failed');
    } finally {
      setBusyId(null);
    }
  };

  const updateQty = async (id: string, quantity: number) => {
    try {
      setBusyId(id);
      const guestKey = ensureGuestKey();
      const res = await fetch(buildProxyUrl(`cart/items/${id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-guest-key': guestKey },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error(`update failed (${res.status})`);
      await load();
    } catch (err: any) {
      alert(err?.message || 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  if (error) {
    return (
      <div className="page-section">
        <div className="card-muted">
          <h1>Cart</h1>
          <p style={{ color: 'crimson' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="page-section">
        <div className="card-muted">
          <h1>Cart</h1>
          <p className="muted">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-section" style={{ maxWidth: '900px' }}>
      <h1>Shopping cart</h1>
      <p className="muted">
        Items ship within 2–3 business days with complimentary setup support. Adjust quantities or remove items below.
      </p>

      <div className="stack" style={{ marginTop: 32 }}>
        {cart.items.length === 0 ? (
          <div className="card-muted">
            <p className="muted">Your cart is empty. Explore the collection to add your first item.</p>
            <Link href="/#catalog" className="pill pill--primary" style={{ width: 'fit-content' }}>
              Browse products
            </Link>
          </div>
        ) : (
          cart.items.map((item) => (
            <div key={item.id} className="card-muted" style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
              {item.product?.image && (
                <img src={item.product.image} alt="" className="thumbnail" loading="lazy" />
              )}
              <div style={{ flex: 1 }}>
                <strong>{item.product?.name ?? item.sku}</strong>
                <div className="muted">SKU: {item.sku}</div>
              </div>
              <QtyPicker
                compact
                value={item.quantity}
                min={1}
                max={12}
                onChange={(q) => updateQty(item.id, q)}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="product-card__price">{formatMoney(item.priceCents, cart.currency)}</span>
                <button className="btn-ghost" disabled={busyId === item.id} onClick={() => removeItem(item.id)}>
                  {busyId === item.id ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </div>
          ))
        )}

        <div className="card-muted" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Total</strong>
            <div className="muted">Shipping calculated at checkout</div>
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>
            {formatMoney(cart.totalCents, cart.currency)}
          </div>
        </div>

        <a className="pill pill--primary" href="/checkout" style={{ width: 'fit-content' }}>
          Proceed to checkout
        </a>
      </div>
    </div>
  );
}
