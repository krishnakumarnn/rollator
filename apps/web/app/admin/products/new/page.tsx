import AdminProductForm from '../AdminProductForm';
import { getJSON } from '../../../lib/api';

export default async function NewProductPage() {
  const categories = await getJSON<any[]>('categories');
  return (
    <div className="stack">
      <h1>Create new product</h1>
      <p className="muted">
        Upload imagery, set pricing, and connect the product to a collection. All uploads are stored securely in the
        database as JPEG assets.
      </p>
      <AdminProductForm mode="create" categories={categories} />
    </div>
  );
}
