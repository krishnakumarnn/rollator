import Link from 'next/link';
import { getJSON } from '../../lib/api';

const fallbackImage =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUQEhMVFhUVFRUVFRUVFRUVFRUWFxUVFhUYHSggGBolHRUVITEiJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGhAQFy0dHR0tKy0rLS0rNystKy0tLS0tKysrKystLS03Ky03LS0rLS0tLSstNy0rNy0tLS0tLS0tLf/AABEIAMIBAwMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABQYBBAcDAv/EADQQAAEDAQYEBQQBBQAAAAAAAAEAAgMEBRESITEGQRNRYXGBIhQjMqGxwfAUI1JicoL/xAAZAQEAAwEBAAAAAAAAAAAAAAAAAgMEAQX/xAAjEQABAwQCAQUAAAAAAAAAAAABAAIREiEDMUEEEyJRYXGB/9oADAMBAAIRAxEAPwD5fEOKt2bZqSeK6FQMqxTkn6n/2Q==';

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const products = await getJSON<any[]>(`products?category=${params.slug}`);
  let display = products;
  let showingFallback = false;
  if (!products.length) {
    display = await getJSON<any[]>('products');
    showingFallback = display.length > 0;
  }
  return (
    <div className="page-section" style={{ maxWidth: '1000px' }}>
      <h1>Category · {params.slug.replace(/-/g, ' ')}</h1>
      {products.length === 0 && !showingFallback && (
        <p className="muted">We are preparing new releases for this collection. Check back soon.</p>
      )}
      {showingFallback && (
        <p className="muted">
          We are preparing new releases for this collection. In the meantime, explore the full catalog below.
        </p>
      )}
      {display.length > 0 && (
        <div className="product-grid" style={{ marginTop: 30 }}>
          {display.map((product) => (
            <article key={product.id} className="product-card">
              <Link href={`/p/${product.slug}`}>
                <img src={product.images?.[0]?.dataUrl ?? fallbackImage} alt={product.name} loading="lazy" />
              </Link>
              <div className="product-card__body">
                <div className="product-card__title">{product.name}</div>
                <p className="muted">{product.description ?? 'Limited release item.'}</p>
                <Link className="product-card__link" href={`/p/${product.slug}`}>
                  View details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
