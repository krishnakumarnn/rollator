'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from '../components/SessionProvider';
import { ensureGuestKey } from '../lib/guestClient';
import { buildProxyUrl } from '../lib/api';
import { getToken } from '../lib/auth';

type CartItem = {
  id: string;
  quantity: number;
  priceCents: number;
  sku?: string;
  product?: { name?: string };
};

type CartSummary = {
  items: CartItem[];
  totalCents: number;
  currency: string;
};

type CheckoutForm = {
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
};

export default function CheckoutPage() {
  const { session, refreshSession } = useSession();
  const isAuthenticated = session.status === 'authenticated';
  const accountEmail = session.user?.email ?? '';
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [cartStatus, setCartStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [form, setForm] = useState<CheckoutForm>({
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    phone: '',
  });

  const update = (key: keyof CheckoutForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const guestKey = useMemo(() => ensureGuestKey(), []);

  const loadCart = useCallback(async () => {
    try {
      setCartStatus('loading');
      const res = await fetch(buildProxyUrl('cart'), {
        headers: { 'x-guest-key': guestKey },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`Cart fetch failed (${res.status})`);
      const data = (await res.json()) as CartSummary;
      setCart(data);
      setCartStatus('ready');
    } catch (err) {
      console.error('cart load failed', err);
      setCartStatus('error');
    }
  }, [guestKey]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const hasItems = useMemo(() => (cart?.items?.length ?? 0) > 0, [cart]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      if (!hasItems) {
        throw new Error('Your cart is empty. Add items before completing checkout.');
      }
      if (!isAuthenticated) {
        throw new Error('Sign in is required before placing an order.');
      }
      const normalizedAccountEmail = accountEmail.trim();
      if (!normalizedAccountEmail) {
        throw new Error('Your account email is missing. Please sign out and sign back in.');
      }
      const payload = {
        email: normalizedAccountEmail,
        shipping: {
          fullName: form.fullName,
          line1: form.line1,
          line2: form.line2 || undefined,
          city: form.city,
          region: form.region || undefined,
          postalCode: form.postalCode,
          country: form.country,
          phone: form.phone || undefined,
        },
      };
      const token = getToken();
      if (!token) throw new Error('Missing session token. Please sign in again.');
      const headers: Record<string, string> = { 'x-guest-key': guestKey, Authorization: `Bearer ${token}` };
      const res = await fetch(buildProxyUrl('orders'), {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Unable to place order (${res.status})`);
      }
      const data = await res.json();
      setMessage(`Order created! Confirmation ID: ${data.id}. Awaiting admin approval.`);
      await loadCart();
    } catch (err: any) {
      setMessage(err?.message || 'Unable to place order');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-section" style={{ maxWidth: '720px' }}>
      <div className="card-muted" style={{ padding: '32px' }}>
        <h1>Checkout</h1>
        <p className="muted">Secure checkout with free returns within 30 days of delivery.</p>
        <div style={{ marginTop: 16, marginBottom: 28 }}>
          <h2 style={{ marginTop: 0 }}>Order summary</h2>
          {cartStatus === 'loading' && <p className="muted">Loading cart…</p>}
          {cartStatus === 'error' && <p style={{ color: 'crimson' }}>We couldn’t load your cart right now.</p>}
          {cartStatus === 'ready' && cart && cart.items.length === 0 && (
            <p className="muted">Your cart is empty. Add products before checking out.</p>
          )}
          {cartStatus === 'ready' && cart && cart.items.length > 0 && (
            <div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
                {cart.items.map((item) => (
                  <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span>{item.product?.name ?? item.sku ?? 'Catalog item'}</span>
                    <span className="muted">
                      Qty {item.quantity} ·
                      {' '}
                      {(item.priceCents * item.quantity / 100).toLocaleString(undefined, {
                        style: 'currency',
                        currency: cart.currency,
                      })}
                    </span>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 12, fontWeight: 600 }}>
                Total{' '}
                {(cart.totalCents / 100).toLocaleString(undefined, {
                  style: 'currency',
                  currency: cart.currency,
                })}
              </div>
            </div>
          )}
        </div>
        {session.status === 'loading' ? (
          <div className="card-muted" style={{ padding: '24px', textAlign: 'center' }}>
            <p className="muted">Validating your account…</p>
          </div>
        ) : !isAuthenticated ? (
          <div className="card-muted" style={{ padding: '24px' }}>
            <h2>Sign in to complete checkout</h2>
            <p className="muted">
              Orders require a verified Rollator account email. Sign in or create an account before placing an order.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <Link className="pill pill--primary" href="/login">
                Sign in
              </Link>
              <Link className="pill pill--ghost" href="/signup">
                Create account
              </Link>
            </div>
          </div>
        ) : (
          <form className="form-grid" onSubmit={submit}>
            <div className="field-group">
              <label>Account email</label>
              <input className="input" type="email" value={accountEmail} readOnly />
              <small className="muted">Orders are tied to this verified email.</small>
            </div>
            <div className="field-group">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                className="input"
                required
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
              />
            </div>
          <div className="field-group">
            <label htmlFor="line1">Address line 1</label>
            <input
              id="line1"
              className="input"
              required
              value={form.line1}
              onChange={(e) => update('line1', e.target.value)}
            />
          </div>
          <div className="field-group">
            <label htmlFor="line2">Address line 2 (optional)</label>
            <input
              id="line2"
              className="input"
              value={form.line2}
              onChange={(e) => update('line2', e.target.value)}
            />
          </div>
          <div className="grid-two">
            <div className="field-group">
              <label htmlFor="city">City</label>
              <input
                id="city"
                className="input"
                required
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
              />
            </div>
            <div className="field-group">
              <label htmlFor="region">Region (optional)</label>
              <input
                id="region"
                className="input"
                value={form.region}
                onChange={(e) => update('region', e.target.value)}
              />
            </div>
          </div>
          <div className="grid-two">
            <div className="field-group">
              <label htmlFor="postal">Postal code</label>
              <input
                id="postal"
                className="input"
                required
                value={form.postalCode}
                onChange={(e) => update('postalCode', e.target.value)}
              />
            </div>
            <div className="field-group">
              <label htmlFor="country">Country</label>
              <input
                id="country"
                className="input"
                required
                value={form.country}
                onChange={(e) => update('country', e.target.value)}
              />
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="phone">Phone (optional)</label>
            <input
              id="phone"
              className="input"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </div>
            <button className="btn-primary" type="submit" disabled={busy || cartStatus !== 'ready' || !hasItems}>
              {busy ? 'Placing order…' : 'Place order'}
            </button>
          </form>
        )}

        {message && (
          <p style={{ marginTop: 18, color: message.startsWith('Order created') ? 'var(--success)' : 'crimson' }}>{message}</p>
        )}
      </div>
    </div>
  );
}
