'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  price: number;
  hidePrice: boolean;
  availability: string;
  status: 'DRAFT' | 'PUBLISHED';
  sortOrder: number;
  category: { id: string; name: string };
  brand: { id: string; name: string } | null;
  coverImage: { fileUrl: string } | null;
}

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

export default function AdminProductListPage() {
  const router = useRouter();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  // Operations state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch('/api/admin/brands')
        ]);

        if (catRes.ok) {
          const catData = await catRes.json() as { categories: Category[] };
          setCategories(catData.categories);
        }
        if (brandRes.ok) {
          const brandData = await brandRes.json() as { brands: Brand[] };
          setBrands(brandData.brands);
        }
      } catch (err) {
        console.error('Failed to load metadata filters', err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          search,
          category,
          brand,
          status,
          page: page.toString(),
          limit: '8'
        });

        const res = await fetch(`/api/admin/products?${queryParams.toString()}`);
        if (res.ok && active) {
          const data = await res.json() as {
            products: Product[];
            pagination: { pages: number; total: number };
          };
          setProducts(data.products);
          setTotalPages(data.pagination.pages);
          setTotalItems(data.pagination.total);
        } else if (!res.ok) {
          throw new Error('Failed to fetch products');
        }
      } catch (err) {
        if (active) {
          setMessage({ type: 'error', text: 'Error loading product catalogs' });
        }
        console.error(err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchProducts();
    return () => {
      active = false;
    };
  }, [search, category, brand, status, page, refreshTrigger]);

  // Handle Soft Delete / Archive
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to archive this product? This hides it from the public listings.')) {
      return;
    }

    setDeletingId(id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Product archived successfully' });
        setRefreshTrigger((t) => t + 1);
      } else {
        const errData = await res.json() as { error?: string };
        throw new Error(errData.error || 'Failed to archive product');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error archiving product' });
    } finally {
      setDeletingId(null);
    }
  };

  const handlePublish = async (id: string) => {
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Product published successfully' });
        setRefreshTrigger((t) => t + 1);
      } else {
        const errData = await res.json() as { error?: string };
        throw new Error(errData.error || 'Failed to publish product');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error publishing product' });
    }
  };

  const formatPrice = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(paise / 100);
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[HSL(35,30%,45%)] font-semibold select-none">
            Business Catalog CMS
          </span>
          <h1 className="text-3xl font-light text-white tracking-tight mt-1">
            Products Directory
          </h1>
        </div>

        <Link
          href="/admin/products/create"
          className="bg-[HSL(35,30%,45%)] hover:bg-[HSL(35,30%,50%)] text-white text-xs font-mono tracking-wider uppercase px-5 py-3 rounded-sm transition-colors duration-200 text-center"
        >
          + Add New Product
        </Link>
      </div>

      {/* Notifications */}
      {message && (
        <div
          className={`p-4 border rounded-sm text-xs font-mono transition-opacity duration-300 ${
            message.type === 'success'
              ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-400'
              : 'bg-red-950/20 border-red-900/60 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Search & Filters Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-[HSL(220,25%,7%)] p-6 border border-zinc-800 rounded-sm">
        <div className="lg:col-span-2">
          <label htmlFor="search-input" className="block text-[10px] font-mono uppercase text-zinc-500 mb-2 select-none">
            Query Search
          </label>
          <input
            id="search-input"
            type="text"
            placeholder="Search by title, SKU, description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 px-4 py-2.5 text-xs text-white rounded-sm outline-none"
          />
        </div>

        <div>
          <label htmlFor="category-select" className="block text-[10px] font-mono uppercase text-zinc-500 mb-2 select-none">
            Category
          </label>
          <select
            id="category-select"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 px-4 py-2.5 text-xs text-white rounded-sm outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="brand-select" className="block text-[10px] font-mono uppercase text-zinc-500 mb-2 select-none">
            Brand
          </label>
          <select
            id="brand-select"
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              setPage(1);
            }}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 px-4 py-2.5 text-xs text-white rounded-sm outline-none cursor-pointer"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status-select" className="block text-[10px] font-mono uppercase text-zinc-500 mb-2 select-none">
            Publish Status
          </label>
          <select
            id="status-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 px-4 py-2.5 text-xs text-white rounded-sm outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-[HSL(220,25%,7%)] border border-zinc-800 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/40 text-[10px] font-mono uppercase tracking-wider text-zinc-500 select-none">
                <th className="px-6 py-4 font-normal">Cover</th>
                <th className="px-6 py-4 font-normal">Title</th>
                <th className="px-6 py-4 font-normal">Category</th>
                <th className="px-6 py-4 font-normal">Brand</th>
                <th className="px-6 py-4 font-normal">Price</th>
                <th className="px-6 py-4 font-normal">Status</th>
                <th className="px-6 py-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-xs text-zinc-300">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="w-12 h-8 bg-zinc-800 rounded-sm" /></td>
                    <td className="px-6 py-4"><div className="w-32 h-4 bg-zinc-800 rounded-sm" /></td>
                    <td className="px-6 py-4"><div className="w-20 h-4 bg-zinc-800 rounded-sm" /></td>
                    <td className="px-6 py-4"><div className="w-16 h-4 bg-zinc-800 rounded-sm" /></td>
                    <td className="px-6 py-4"><div className="w-20 h-4 bg-zinc-800 rounded-sm" /></td>
                    <td className="px-6 py-4"><div className="w-16 h-4 bg-zinc-800 rounded-sm" /></td>
                    <td className="px-6 py-4 text-right"><div className="w-16 h-4 bg-zinc-800 rounded-sm ml-auto" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-600 font-mono text-xs select-none">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-950/40 transition-colors duration-150">
                    <td className="px-6 py-4">
                      {p.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.coverImage.fileUrl}
                          alt={p.title}
                          className="w-12 h-8 object-cover rounded-sm border border-zinc-800"
                        />
                      ) : (
                        <div className="w-12 h-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[8px] font-mono text-zinc-700 uppercase">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      <div>{p.title}</div>
                      {p.subtitle && <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{p.subtitle}</div>}
                    </td>
                    <td className="px-6 py-4 font-mono text-zinc-400">{p.category.name}</td>
                    <td className="px-6 py-4 text-zinc-400">{p.brand?.name || '—'}</td>
                    <td className="px-6 py-4 font-mono text-zinc-300">
                      {p.hidePrice ? <span className="text-zinc-600">Hidden</span> : formatPrice(p.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold ${
                          p.status === 'PUBLISHED'
                            ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/60'
                            : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3 font-mono">
                      {p.status === 'DRAFT' && (
                        <button
                          onClick={() => handlePublish(p.id)}
                          className="text-emerald-500 hover:text-emerald-400 transition-colors duration-150 cursor-pointer"
                        >
                          Publish
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/admin/products/edit/${p.id}`)}
                        className="text-zinc-400 hover:text-white transition-colors duration-150 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="text-red-500 hover:text-red-400 transition-colors duration-150 disabled:text-zinc-700 cursor-pointer"
                      >
                        {deletingId === p.id ? 'Archiving...' : 'Archive'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination rail */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/40 flex items-center justify-between font-mono text-xs">
            <span className="text-zinc-500 select-none">
              Showing {products.length} of {totalItems} items
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-zinc-800 hover:bg-zinc-900 disabled:opacity-30 disabled:hover:bg-transparent rounded-sm transition-colors text-white cursor-pointer"
              >
                &larr; Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-zinc-800 hover:bg-zinc-900 disabled:opacity-30 disabled:hover:bg-transparent rounded-sm transition-colors text-white cursor-pointer"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
