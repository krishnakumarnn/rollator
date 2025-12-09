import { getJSON } from '../../lib/api';
import CreateCategory from './CreateCategory';

type Category = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

async function getCategories() {
  return getJSON<Category[]>('categories');
}

export default async function Categories() {
  const cats = await getCategories();
  return (
    <div className="stack">
      <div>
        <h1 style={{ marginTop: 0 }}>Catalog categories</h1>
        <p className="muted" style={{ maxWidth: 520 }}>
          Categories keep the storefront navigation focused. Create a new category below and it will be available in
          product forms immediately.
        </p>
      </div>

      <table className="admin-table" style={{ maxWidth: 640 }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {cats.map((category) => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td>
                <code>{category.slug}</code>
              </td>
              <td>{category.isActive ? <span className="status-ok">Active</span> : <span className="muted">Hidden</span>}</td>
            </tr>
          ))}
          {cats.length === 0 && (
            <tr>
              <td colSpan={3} className="muted" style={{ textAlign: 'center', padding: '18px 12px' }}>
                No categories yet. Create the first one below.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <CreateCategory />
    </div>
  );
}
