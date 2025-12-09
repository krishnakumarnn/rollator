// apps/web/app/admin/page.tsx
import Link from 'next/link';

export default function AdminHome() {
  return (
    <div style={{padding:'24px'}}>
      <h1>Admin</h1>
      <ul>
        <li><Link href="/admin/products/new">➕ Create product (upload images)</Link></li>
        <li><Link href="/admin/products">Products</Link></li>
        <li><Link href="/admin/categories">Categories</Link></li>
      </ul>
    </div>
  );
}

