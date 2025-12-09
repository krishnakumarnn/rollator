'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from '../../components/SessionProvider';
import { buildProxyUrl } from '../../lib/api';
import { getToken } from '../../lib/auth';

type AdminOrderSummary = {
  id: string;
  email: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: string;
};

const formatMoney = (cents: number, currency = 'USD') =>
  (cents / 100).toLocaleString(undefined, { style: 'currency', currency });

const formatTimestamp = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

export default function AdminOrders() {
  const { session, refreshSession } = useSession();
  const isAdmin = session.status === 'authenticated' && !!session.user?.isAdmin;
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const loadOrders = useCallback(async () => {
    if (!isAdmin) return;
    setStatus('loading');
    setError(null);
    try {
      const token = getToken();
      if (!token) throw new Error('Missing session token');
      const res = await fetch(buildProxyUrl('orders'), {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Unable to load orders');
      const data = (await res.json()) as AdminOrderSummary[];
      setOrders(data);
      setStatus('idle');
    } catch (err: any) {
      setError(err?.message || 'Unable to load orders');
      setStatus('error');
    }
  }, [isAdmin]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const approveOrder = useCallback(
    async (id: string) => {
      setApprovingId(id);
      setError(null);
      try {
        const token = getToken();
        if (!token) throw new Error('Missing session token');
        const res = await fetch(buildProxyUrl(`orders/${id}/approve`), {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Unable to approve order');
        const updated = (await res.json()) as { id: string; status: string };
        setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status: updated.status } : order)));
      } catch (err: any) {
        setError(err?.message || 'Unable to approve order');
      } finally {
        setApprovingId(null);
      }
    },
    [],
  );

  const pendingCount = useMemo(() => orders.filter((order) => order.status === 'PENDING').length, [orders]);

  if (session.status === 'loading') {
    return (
      <div className="stack" style={{ padding: '32px' }}>
        <div className="card-muted" style={{ padding: '24px', textAlign: 'center' }}>
          <p className="muted">Loading admin session…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="stack" style={{ padding: '32px' }}>
        <div className="card-muted" style={{ padding: '24px' }}>
          <h2>Admin permissions required</h2>
          <p className="muted">This view is restricted to studio admins. Sign in with an approved account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stack" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Orders</h1>
          <p className="muted">Review account-linked orders and approve them before fulfillment.</p>
        </div>
        <div className="badge">
          Pending approvals:
          {' '}
          {pendingCount}
        </div>
      </div>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {status === 'loading' ? (
        <div className="card-muted" style={{ padding: '24px', textAlign: 'center' }}>
          <p className="muted">Loading orders…</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="card-muted" style={{ padding: '24px' }}>
          <p className="muted">No orders found yet.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Status</th>
              <th>Total</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id.slice(0, 8)}…</td>
                <td>{order.email}</td>
                <td>{order.status}</td>
                <td>{formatMoney(order.totalCents ?? 0, order.currency)}</td>
                <td>{formatTimestamp(order.createdAt)}</td>
                <td>
                  {order.status === 'PENDING' ? (
                    <button
                      className="pill pill--primary"
                      type="button"
                      onClick={() => approveOrder(order.id)}
                      disabled={approvingId === order.id}
                      style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                    >
                      {approvingId === order.id ? 'Approving…' : 'Approve'}
                    </button>
                  ) : (
                    <span className="muted">Approved</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
