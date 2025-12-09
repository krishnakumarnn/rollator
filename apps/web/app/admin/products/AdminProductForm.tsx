'use client';
import { useMemo, useState } from 'react';
import { buildProxyUrl } from '../../lib/api';
import { getToken } from '../../lib/auth';

type Category = { id: string; name: string };
type Variant = { id: string; sku: string; priceCents: number; stock: number; currency?: string };
type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  specifications?: Record<string, unknown> | null;
  category?: { id: string; name: string } | null;
  isActive?: boolean;
  images?: { id: string; dataUrl: string; alt?: string | null }[];
  variants?: Variant[];
};

type Props = {
  mode: 'create' | 'edit';
  categories: Category[];
  product?: Product | null;
};

const toCurrency = (priceCents?: number, currency = 'USD') =>
  ((priceCents ?? 0) / 100).toLocaleString(undefined, { style: 'currency', currency });

export default function AdminProductForm({ mode, categories, product }: Props) {
  if (!categories.length) {
    return (
      <div className="card-muted" style={{ padding: '24px' }}>
        <p className="muted">No categories available. Create a category before adding products.</p>
      </div>
    );
  }

  const initialVariant = product?.variants?.[0];
  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: initialVariant ? String(initialVariant.priceCents / 100) : '',
    stock: initialVariant ? String(initialVariant.stock) : '0',
    sku: initialVariant?.sku ?? '',
    categoryId: product?.category?.id ?? categories[0]?.id ?? '',
    imageAlt: product?.images?.[0]?.alt ?? '',
    specJson: product?.specifications ? JSON.stringify(product.specifications, null, 2) : '',
    isActive: product?.isActive ?? true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(product?.images?.[0]?.dataUrl ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const actionLabel = mode === 'create' ? 'Create product' : 'Update product';

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageFile(null);
      return;
    }
    if (!file.type.includes('jpeg')) {
      setMessage('Please upload a JPEG image.');
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const token = getToken();
    if (!token) {
      setSubmitting(false);
      setMessage('Sign in with an admin account to continue.');
      return;
    }

    try {
      const endpoint = mode === 'create' ? 'admin/products' : `admin/products/${product?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('slug', form.slug.trim());
      formData.append('description', form.description.trim());
      formData.append('price', form.price.trim());
      formData.append('stock', form.stock.trim());
      formData.append('sku', form.sku.trim());
      formData.append('categoryId', form.categoryId);
      formData.append('isActive', String(form.isActive));
      if (form.imageAlt) formData.append('imageAlt', form.imageAlt.trim());
      if (form.specJson) formData.append('specifications', form.specJson);
      if (imageFile) formData.append('image', imageFile);

      const res = await fetch(buildProxyUrl(endpoint), {
        method,
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Request failed (${res.status})`);
      }

      const payload = await res.json();
      setMessage(`Saved · ${payload.name ?? 'Product'}`);
    } catch (err: any) {
      setMessage(err?.message || 'Something went wrong while saving');
    } finally {
      setSubmitting(false);
    }
  };

  const previewLabel = useMemo(() => {
    if (mode === 'create') return 'Upload product imagery (JPEG)';
    if (imageFile) return `Selected ${imageFile.name}`;
    return preview ? 'Current image' : 'Upload product imagery (JPEG)';
  }, [mode, imageFile, preview]);

  return (
    <form className="stack" onSubmit={submit} encType="multipart/form-data">
      <div className="grid-two">
        <div className="field-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            className="input"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div className="field-group">
          <label htmlFor="slug">Slug</label>
          <input
            id="slug"
            className="input"
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
            required
          />
        </div>
      </div>
      <div className="field-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          className="input"
          style={{ minHeight: 96, resize: 'vertical' }}
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="grid-two">
        <div className="field-group">
          <label htmlFor="price">Price (USD)</label>
          <input
            id="price"
            className="input"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            placeholder={initialVariant ? toCurrency(initialVariant.priceCents) : '129.99'}
            required
          />
        </div>
        <div className="field-group">
          <label htmlFor="stock">Stock</label>
          <input
            id="stock"
            className="input"
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid-two">
        <div className="field-group">
          <label htmlFor="sku">SKU</label>
          <input
            id="sku"
            className="input"
            value={form.sku}
            onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
            required
          />
        </div>
        <div className="field-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            className="input"
            value={form.categoryId}
            onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-group">
        <label htmlFor="image">{previewLabel}</label>
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview" className="thumbnail" style={{ width: 120, height: 120, marginBottom: 12 }} />
        )}
        <input id="image" type="file" accept="image/jpeg" onChange={handleFileChange} />
      </div>

      <div className="field-group">
        <label htmlFor="imageAlt">Image alt text</label>
        <input
          id="imageAlt"
          className="input"
          value={form.imageAlt}
          onChange={(e) => setForm((prev) => ({ ...prev, imageAlt: e.target.value }))}
        />
      </div>

      <div className="field-group">
        <label htmlFor="specs">Specifications (JSON, optional)</label>
        <textarea
          id="specs"
          className="input"
          style={{ minHeight: 120, resize: 'vertical' }}
          value={form.specJson}
          onChange={(e) => setForm((prev) => ({ ...prev, specJson: e.target.value }))}
          placeholder='{"battery": "30h"}'
        />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
        />
        Active / visible in storefront
      </label>

      <button className="btn-primary" type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : actionLabel}
      </button>

      {message && <p style={{ color: message.startsWith('Saved') ? 'var(--success)' : 'crimson' }}>{message}</p>}
    </form>
  );
}
