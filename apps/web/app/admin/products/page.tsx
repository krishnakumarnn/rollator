import Link from 'next/link';
import { getJSON } from '../../lib/api';

const fallbackImage =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUQEhMVFhUVFRUVFRUVFRUVFRUWFxUVFhUYHSggGBolHRUVITEiJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGhAQFy0dHR0tKy0rLS0rNystKy0tLS0tKysrKystLS03Ky03LS0rLS0tLSstNy0rNy0tLS0tLS0tLf/AABEIAMIBAwMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABQYBBAcDAv/EADQQAAEDAQYEBQQBBQAAAAAAAAEAAgMEBRESITEGQRNRYXGBIhQjMqGxwfAUI1JicoL/xAAZAQEAAwEBAAAAAAAAAAAAAAAAAgMEAQX/xAAjEQABAwQCAQUAAAAAAAAAAAABAAIREiEDMUEEEyJRYXGB/9oADAMBAAIRAxEAPwD5fEOKt2bZqSeK6FQMqxTkn6n/2Q==';

export default async function ProductsList() {
  const products = await getJSON<any[]>('products');
  return (
    <div className="stack">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Products</h1>
        <Link className="pill pill--primary" href="/admin/products/new">
          New product
        </Link>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const variant = product.variants?.[0];
            return (
              <tr key={product.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={product.images?.[0]?.dataUrl ?? fallbackImage}
                      alt=""
                      className="thumbnail"
                      loading="lazy"
                    />
                    <div>
                      <strong>{product.name}</strong>
                      <div className="muted">SKU {variant?.sku ?? '—'}</div>
                    </div>
                  </div>
                </td>
                <td>{product.category?.name ?? '—'}</td>
                <td>{((variant?.priceCents ?? 0) / 100).toLocaleString(undefined, { style: 'currency', currency: variant?.currency ?? 'USD' })}</td>
                <td>{variant?.stock ?? 0}</td>
                <td>{product.isActive ? <span className="status-ok">Active</span> : <span className="muted">Hidden</span>}</td>
                <td>
                  <Link href={`/admin/products/${product.id}`}>Edit</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="muted">Changes publish immediately to the storefront after saving.</p>
    </div>
  );
}
