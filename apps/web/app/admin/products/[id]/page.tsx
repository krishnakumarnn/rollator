import AdminProductForm from '../AdminProductForm';
import { getJSON } from '../../../lib/api';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [categories, products] = await Promise.all([
    getJSON<any[]>('categories'),
    getJSON<any[]>('products'),
  ]);
  const product = products.find((item) => item.id === params.id) ?? null;

  if (!product) {
    return (
      <div className="card-muted" style={{ padding: '24px' }}>
        <h1>Product not found</h1>
        <p className="muted">The requested product does not exist or has been archived.</p>
      </div>
    );
  }

  return (
    <div className="stack">
      <h1>Edit product</h1>
      <AdminProductForm mode="edit" categories={categories} product={product} />
    </div>
  );
}
