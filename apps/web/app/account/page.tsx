'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from '../components/SessionProvider';
import { ensureGuestKey } from '../lib/guestClient';
import { buildProxyUrl } from '../lib/api';
import { getToken } from '../lib/auth';

type OrderItemSummary = {
  id: string;
  nameSnapshot: string;
  quantity: number;
  priceCents: number;
};

type OrderSummary = {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  items: OrderItemSummary[];
};

type CartSummary = {
  items: { id: string; quantity: number; priceCents: number; product?: { name?: string; image?: string } }[];
  totalCents: number;
  currency: string;
};

const formatMoney = (cents: number, currency = 'USD') =>
  (cents / 100).toLocaleString(undefined, { style: 'currency', currency });

const formatDate = (input: string) =>
  new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(input));

export default function AccountPage() {
  const { session, refreshSession, signOut } = useSession();
  const isAuthenticated = session.status === 'authenticated';
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated) return;
      setOrdersLoading(true);
      setOrdersError(null);
      try {
        const token = getToken();
        if (!token) throw new Error('Missing session token');
        const res = await fetch(buildProxyUrl('orders/mine'), {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (res.status === 401) {
          signOut();
          throw new Error('Session expired. Please sign in again.');
        }
        if (!res.ok) throw new Error('Unable to load orders');
        const data = (await res.json()) as OrderSummary[];
        setOrders(data);
      } catch (err: any) {
        setOrdersError(err?.message || 'Unable to load orders');
      } finally {
        setOrdersLoading(false);
      }
    };
    load();
  }, [isAuthenticated, signOut]);

  useEffect(() => {
    const syncCart = async () => {
      setCartError(null);
      try {
        const guestKey = ensureGuestKey();
        const res = await fetch(buildProxyUrl('cart'), {
          headers: { 'x-guest-key': guestKey },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Unable to load cart');
        const data = (await res.json()) as CartSummary;
        setCart(data);
      } catch (err: any) {
        setCartError(err?.message || 'Unable to load cart');
      }
    };
    syncCart();
  }, []);

  const cartItems = cart?.items ?? [];
  const hasOrders = orders.length > 0;

  if (session.status === 'loading') {
    return (
      <div className="page-section" style={{ maxWidth: '480px' }}>
        <div className="card-muted" style={{ padding: '32px', textAlign: 'center' }}>
          <p className="muted">Loading account…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="page-section" style={{ maxWidth: '760px' }}>
        <div className="grid-two">
          <div className="card-muted">
            <h1>Account &amp; preferences</h1>
            <p className="muted">
              Sign in to manage orders, download guides for the ICT Rollator, and access the admin studio if your team has
              granted permissions.
            </p>
            <ul>
              <li>Track shipments and upcoming maintenance cycles</li>
              <li>Save address and payment details for faster checkout</li>
              <li>Access beta programs and exclusive accessory drops</li>
            </ul>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <Link className="pill pill--primary" href="/login">
                Sign in
              </Link>
              <Link className="pill pill--ghost" href="/signup">
                Create account
              </Link>
            </div>
          </div>
          <div className="card-muted">
            <h2>Need admin access?</h2>
            <p className="muted">
              Admin invitations are issued to clinical teams and studio partners. If you should have access to manage
              product listings or pilot programs, request an invite using the contact form.
            </p>
            <Link className="pill pill--ghost" href="/rollator">
              Discover the Rollator experience
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const primaryEmail = session.user?.email ?? '';

  return (
    <div className="page-section" style={{ maxWidth: '960px' }}>
      <div className="stack">
        <div className="card-muted" style={{ padding: '32px' }}>
          <h1 style={{ marginTop: 0 }}>Welcome back</h1>
          <p className="muted">Signed in as {primaryEmail}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
            <Link className="pill pill--ghost" href="/orders">
              View orders
            </Link>
            <Link className="pill pill--ghost" href="/cart">
              Go to cart
            </Link>
            {session.user?.isAdmin && (
              <Link className="pill pill--primary" href="/admin">
                Open admin studio
              </Link>
            )}
            <button className="pill pill--ghost" type="button" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>

        <section className="card-muted" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Your cart snapshot</h2>
            <Link href="/cart" className="pill pill--ghost" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
              Manage cart
            </Link>
          </div>
          {cartError ? (
            <p style={{ color: 'crimson', marginTop: 16 }}>{cartError}</p>
          ) : cartItems.length === 0 ? (
            <p className="muted" style={{ marginTop: 16 }}>
              Your cart is currently empty. Browse the collection to add items.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 0', display: 'grid', gap: 12 }}>
              {cartItems.map((item) => (
                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span>
                    {item.product?.name ?? 'Catalog item'} · Qty {item.quantity}
                  </span>
                  <span className="muted">
                    {formatMoney(item.priceCents * item.quantity, cart?.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {cart && (
            <div style={{ marginTop: 18, fontWeight: 600 }}>
              Total {formatMoney(cart.totalCents, cart.currency)}
            </div>
          )}
        </section>

        <section className="card-muted" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Recent orders</h2>
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            Orders remain pending until a studio admin approves them.
          </p>
          {ordersError && <p style={{ color: 'crimson', marginTop: 16 }}>{ordersError}</p>}
          {!ordersError && (ordersLoading ? (
            <p className="muted" style={{ marginTop: 16 }}>
              Loading your orders…
            </p>
          ) : hasOrders ? (
            <table className="admin-table" style={{ marginTop: 18 }}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id.slice(0, 8)}…</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{order.status}</td>
                    <td>{formatMoney(order.totalCents, order.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted" style={{ marginTop: 16 }}>
              No orders yet. Your purchases will appear here once checkout is complete.
            </p>
          ))}
        </section>
      </div>
    </div>
  );
}
