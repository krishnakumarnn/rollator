// apps/web/app/p/[slug]/page.tsx
import AddToCartWithQty from '@/components/AddToCartWithQty';
import { buildProxyUrl } from '@/lib/api';

const fallbackImage =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUQEhMVFhUVFRUVFRUVFRUVFRUWFxUVFhUYHSggGBolHRUVITEiJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGhAQFy0dHR0tKy0rLS0rNystKy0tLS0tKysrKystLS03Ky03LS0rLS0tLSstNy0rNy0tLS0tLS0tLf/AABEIAMIBAwMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABQYBBAcDAv/EADQQAAEDAQYEBQQBBQAAAAAAAAEAAgMEBRESITEGQRNRYXGBIhQjMqGxwfAUI1JicoL/xAAZAQEAAwEBAAAAAAAAAAAAAAAAAgMEAQX/xAAjEQABAwQCAQUAAAAAAAAAAAABAAIREiEDMUEEEyJRYXGB/9oADAMBAAIRAxEAPwD5fEOKt2bZqSeK6FQMqxTkn6n/2Q==';

const formatPrice = (priceCents?: number | null, currency = 'USD') =>
  ((priceCents ?? 0) / 100).toLocaleString(undefined, { style: 'currency', currency });

async function loadProduct(slug: string) {
  const res = await fetch(buildProxyUrl(`products/${slug}`), { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetch products/${slug} failed: ${res.status}`);
  return res.json();
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await loadProduct(params.slug);
  const primaryImage = product.images?.[0]?.dataUrl ?? fallbackImage;
  const variant = product.variants?.[0];

  return (
    <div className="page-section" style={{ maxWidth: '1100px' }}>
      <div className="grid-two" style={{ alignItems: 'start' }}>
        <div className="card-muted" style={{ padding: 0, overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={primaryImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div className="stack">
          <div>
            <p className="badge">{product.category?.name ?? 'Collection'}</p>
            <h1>{product.name}</h1>
            <p className="muted">{product.description ?? 'Thoughtfully crafted placement from the Rollator studio.'}</p>
          </div>

          <div className="card-muted">
            <div className="stack">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="muted">Price</span>
                <strong>{formatPrice(variant?.priceCents, variant?.currency ?? 'USD')}</strong>
              </div>
              {variant && <AddToCartWithQty variantId={variant.id} />}
            </div>
          </div>

          <div className="card-muted">
            <h3>Why you’ll love it</h3>
            <ul>
              <li>Modular by design — pair with ICT Rollator accessories in seconds.</li>
              <li>Materials selected for durability, sensory comfort, and easy cleaning.</li>
              <li>Ships with setup guide and access to the Rollator companion app.</li>
            </ul>
          </div>

          {product.specifications && (
            <div className="card-muted">
              <h3>Specifications</h3>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(product.specifications, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
