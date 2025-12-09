import Link from 'next/link';
import AdminGuard from '../components/AdminGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="admin-shell">
        <aside>
          <h3 style={{ marginTop: 0 }}>Admin studio</h3>
          <nav>
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/products">Products</Link>
            <Link href="/admin/products/new">New product</Link>
            <Link href="/admin/orders">Orders</Link>
            <Link href="/admin/experience">Experience media</Link>
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </AdminGuard>
  );
}
