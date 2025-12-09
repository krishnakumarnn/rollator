'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from '../components/SessionProvider';
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

const formatMoney = (cents: number, currency = 'USD') =>
  (cents / 100).toLocaleString(undefined, { style: 'currency', currency });

const formatDateTime = (input: string) =>
  new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(input));

export default function OrdersPage() {
  const { session, refreshSession } = useSession();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    const load = async () => {
      if (session.status !== 'authenticated') return;
      setStatus('loading');
      setError(null);
      try {
        const token = getToken();
        if (!token) throw new Error('Missing session token');
        const res = await fetch(buildProxyUrl('orders/mine'), {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Unable to load orders');
        const data = (await res.json()) as OrderSummary[];
        setOrders(data);
        setStatus('idle');
      } catch (err: any) {
        setStatus('error');
        setError(err?.message || 'Unable to load orders right now.');
      }
    };
    load();
  }, [session.status, refreshSession]);

  if (session.status === 'loading') {
    return (
      <div className="page-section" style={{ maxWidth: '720px' }}>
        <div className="card-muted" style={{ padding: '32px', textAlign: 'center' }}>
          <p className="muted">Loading orders…</p>
        </div>
      </div>
    );
  }

  if (session.status !== 'authenticated') {
    return (
      <div className="page-section" style={{ maxWidth: '720px' }}>
        <div className="card-muted" style={{ padding: '32px' }}>
          <h1>Track your orders</h1>
          <p className="muted">Sign in to see orders placed with your Rollator account.</p>
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

  return (
    <div className="page-section" style={{ maxWidth: '960px' }}>
      <div className="stack">
        <div>
          <h1 style={{ marginBottom: 8 }}>Your orders</h1>
          <p className="muted">Monitor recent purchases, status updates, and totals from your account history.</p>
          <p className="muted">Orders remain pending until a studio admin approves them.</p>
        </div>

        {status === 'error' && <p style={{ color: 'crimson' }}>{error}</p>}

        {status === 'loading' ? (
          <div className="card-muted" style={{ padding: '28px', textAlign: 'center' }}>
            <p className="muted">Loading orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="card-muted" style={{ padding: '28px' }}>
            <p className="muted">No orders yet. Once you check out, your orders will live here.</p>
            <Link className="pill pill--primary" href="/">
              Start shopping
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="card-muted" style={{ padding: '28px', display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <h2 style={{ margin: 0 }}>Order {order.id.slice(0, 8)}…</h2>
                  <p className="muted" style={{ marginTop: 4 }}>
                    Placed {formatDateTime(order.createdAt)} · Status {order.status}
                  </p>
                </div>
                <strong>{formatMoney(order.totalCents, order.currency)}</strong>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
                {order.items.map((item) => (
                  <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span>{item.nameSnapshot}</span>
                    <span className="muted">
                      Qty {item.quantity} · {formatMoney(item.priceCents, order.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
