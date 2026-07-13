import React from 'react';
import Link from 'next/link';
import { prisma } from '../../lib/db';
import { MotionCard, MotionReveal } from '../../components/ui/motion';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Product Catalog | Quantum Living Solutions',
  description: 'Browse our range of luxury home automation devices, controllers, and accessories.',
};

interface SearchParams {
  search?: string;
  category?: string;
  brand?: string;
}

// Helper to extract technology badges dynamically from product metadata texts
function getTechBadges(product: { title: string; subtitle: string | null; description: string; specifications?: { value: string }[] }) {
  const text = `${product.title} ${product.subtitle || ''} ${product.description} ${
    product.specifications?.map(s => s.value).join(' ') || ''
  }`.toLowerCase();
  
  const techs = ['matter', 'zigbee', 'knx', 'esp32', 'wifi', 'thread', 'bluetooth', 'mqtt', 'bacnet', 'modbus'];
  return techs.filter(t => text.includes(t)).map(t => t.toUpperCase());
}

export default async function PublicProductListingPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { search = '', category = '', brand = '' } = await searchParams;

  // Build query filters for active, published catalog items
  const whereClause: Record<string, unknown> = {
    status: 'PUBLISHED',
    deletedAt: null,
  };

  if (search.trim()) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { subtitle: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category) {
    whereClause.categoryId = category;
  }

  if (brand) {
    whereClause.brandId = brand;
  }

  // Fetch data in parallel with all relations
  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        brand: {
          include: {
            logo: true
          }
        },
        coverImage: true,
        specifications: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const formatPrice = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(paise / 100);
  };

  return (
    <div className="qls-page">
      <MotionReveal className="qls-hero">
        <span className="qls-eyebrow">
          SYSTEM CATALOG
        </span>
        <h1 className="qls-title mb-5">
          Integrated Components
        </h1>
        <p className="qls-lead">
          Explore the industrial-grade controllers, control interfaces, and sensors that power our smart homes.
        </p>
      </MotionReveal>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <form method="GET" action="/products" className="qls-card space-y-6 p-5 lg:sticky lg:top-24">
            <div>
              <label htmlFor="search-input" className="qls-label">
                Search Catalog
              </label>
              <input
                id="search-input"
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Type keyword..."
                className="qls-field text-xs"
              />
            </div>

            <div>
              <label htmlFor="category-select" className="qls-label">
                Category
              </label>
              <select
                id="category-select"
                name="category"
                defaultValue={category}
                className="qls-field text-xs cursor-pointer"
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
              <label htmlFor="brand-select" className="qls-label">
                Brand
              </label>
              <select
                id="brand-select"
                name="brand"
                defaultValue={brand}
                className="qls-field text-xs cursor-pointer"
              >
                <option value="">All Brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="qls-button qls-button-primary w-full cursor-pointer"
            >
              Apply Filters
            </button>

            {(search || category || brand) && (
              <Link
                href="/products"
                className="qls-text-link block text-center mt-2"
              >
                Clear Filters
              </Link>
            )}
          </form>
        </aside>

        {/* Product Cards Grid */}
        <div className="lg:col-span-3">
          {products.length === 0 ? (
            <div className="qls-empty">
              {/* Premium minimal SVG illustration */}
              <svg className="w-16 h-16 text-zinc-700 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.008 1.24l.885 1.77a2.25 2.25 0 0 0 2.007 1.24h2.98a2.25 2.25 0 0 0 2.007-1.24l.885-1.77a2.25 2.25 0 0 1 2.007-1.24h3.86m-18 0h18a2.25 2.25 0 0 0 2.25-2.25V5.25A2.25 2.25 0 0 0 19.5 3h-15A2.25 2.25 0 0 0 2.25 5.25v6a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400 mb-2">
                No products available yet.
              </h3>
              <p className="text-xs text-zinc-600 max-w-sm">
                We are currently indexing our hardware catalog. Select other filter combinations or contact our office for a specifications quote.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((p) => {
                const techs = getTechBadges(p);
                const shortDesc = p.description.length > 90 ? `${p.description.substring(0, 90)}...` : p.description;

                return (
                  <MotionCard
                    key={p.id}
                    className="qls-card qls-card-hover group flex flex-col h-full overflow-hidden"
                  >
                    {/* Cover image container */}
                    <div className="aspect-video w-full relative bg-zinc-900 border-b border-zinc-800/80 overflow-hidden shrink-0">
                      {p.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.coverImage.fileUrl}
                          alt={p.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-zinc-700 uppercase select-none">
                          No Image
                        </div>
                      )}

                      {/* Floating availability indicator */}
                      <span
                        className={`absolute top-3 right-3 px-2 py-0.5 rounded-sm text-[9px] font-mono font-semibold tracking-wider uppercase border ${
                          p.availability === 'IN_STOCK'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60'
                            : p.availability === 'OUT_OF_STOCK'
                            ? 'bg-red-950/40 text-red-400 border-red-900/60'
                            : 'bg-zinc-900/80 text-zinc-400 border-zinc-800'
                        }`}
                      >
                        {p.availability === 'IN_STOCK' && 'In Stock'}
                        {p.availability === 'LEAD_TIME' && 'Lead Time'}
                        {p.availability === 'SPECIAL_ORDER' && 'Special Order'}
                        {p.availability === 'OUT_OF_STOCK' && 'Out of Stock'}
                      </span>
                    </div>

                    {/* Card Content body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider">
                            {p.category.name}
                          </span>
                          {p.brand && (
                            <span className="text-[9px] font-mono text-[HSL(35,30%,45%)] border border-[HSL(35,30%,45%)]/30 px-1.5 py-0.5 rounded-sm bg-[HSL(35,30%,45%)]/5 font-semibold">
                              {p.brand.name}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-light text-white tracking-tight mt-1">
                          {p.title}
                        </h3>

                        <p className="text-xs text-zinc-400 font-normal leading-relaxed line-clamp-2">
                          {shortDesc}
                        </p>
                      </div>

                      {/* Tech badges */}
                      {techs.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {techs.map((tech) => (
                            <span
                              key={tech}
                              className="text-[8px] font-mono px-1.5 py-0.5 bg-zinc-900 border border-zinc-800/80 rounded-sm text-zinc-500 font-semibold"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Pricing, Action Buttons */}
                      <div className="space-y-4 pt-3 border-t border-zinc-800/60">
                        <div className="flex justify-between items-baseline text-xs font-mono">
                          <span className="text-zinc-500">Suggested Price</span>
                          <span className="text-white font-medium">
                            {p.hidePrice ? 'Call for price' : formatPrice(p.price)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <Link
                            href={`/products/${p.slug}`}
                            className="qls-button qls-button-secondary min-h-0 py-2.5 text-[10px]"
                          >
                            Details
                          </Link>
                          <Link
                            href="/book-demo"
                            className="qls-button qls-button-primary min-h-0 py-2.5 text-[10px]"
                          >
                            Book Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </MotionCard>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
