import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '../../../lib/db';
import { MotionCard, MotionReveal } from '../../../components/ui/motion';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, deletedAt: null },
  });

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.title} | Quantum Living Solutions`,
    description: product.subtitle || `Detailed technical specifications and resources for ${product.title}.`,
  };
}

export default async function PublicProductDetailPage({ params }: Props) {
  const { slug } = await params;

  // Query product records matching slug
  const product = await prisma.product.findFirst({
    where: { slug, deletedAt: null },
    include: {
      category: true,
      brand: true,
      coverImage: true,
      gallery: {
        include: {
          media: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
      specifications: {
        include: {
          template: true,
        },
      },
      downloads: true,
    },
  });

  if (!product || product.status !== 'PUBLISHED') {
    notFound();
  }

  // Group specifications by groupName (e.g. Electrical, Connectivity)
  const specsByGroup = product.specifications.reduce((acc, spec) => {
    const groupName = spec.template.groupName;
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push({
      name: spec.template.name,
      value: spec.value,
    });
    return acc;
  }, {} as Record<string, { name: string; value: string }[]>);

  const formatPrice = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(paise / 100);
  };

  return (
    <div className="qls-page">
      {/* Breadcrumb */}
      <nav className="mb-6 font-mono text-[10px] uppercase tracking-wider text-zinc-500 select-none">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span className="mx-2">&rarr;</span>
        <Link href="/products" className="hover:text-white transition-colors">Products</Link>
        <span className="mx-2">&rarr;</span>
        <span className="text-zinc-400">{product.category.name}</span>
      </nav>

      {/* Main product presentation columns */}
      <MotionReveal className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start mb-16">
        {/* Left Column: Cover & Description & Gallery */}
        <div className="lg:col-span-7 space-y-8">
          <div className="qls-card aspect-video w-full relative bg-zinc-950 overflow-hidden">
            {product.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.coverImage.fileUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-zinc-700 uppercase">
                No Image Registered
              </div>
            )}
          </div>

          {/* Gallery Listing */}
          {product.gallery.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                Photo Gallery
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {product.gallery.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.media.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="qls-card qls-card-hover aspect-video overflow-hidden bg-zinc-900"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.media.fileUrl}
                      alt={`Gallery view ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Overview text */}
          <div className="space-y-4 border-t border-zinc-800/80 pt-8">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Overview & Capabilities
            </h3>
            <p className="text-base text-foreground/80 leading-relaxed font-normal whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Downloads Documentation Links */}
          {product.downloads.length > 0 && (
            <div className="space-y-4 border-t border-zinc-800/80 pt-8">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Resource Downloads
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.downloads.map((dl, idx) => (
                  <a
                    key={idx}
                    href={dl.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="qls-card qls-card-hover flex items-center justify-between p-4"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-white">{dl.label}</span>
                      <span className="text-[9px] font-mono text-zinc-500 mt-1 uppercase">PDF Document</span>
                    </div>
                    <span className="text-[10px] font-mono text-[HSL(35,30%,45%)]">&darr; Download</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Meta details, specs & actions */}
        <div className="lg:col-span-5 space-y-6">
          <MotionCard className="qls-card p-6 md:p-8 space-y-6">
            <div>
              <span className="text-[10px] font-mono uppercase text-[HSL(35,30%,45%)] tracking-wider">
                {product.category.name}
              </span>
              <h1 className="text-3xl font-light text-white tracking-tight mt-1">
                {product.title}
              </h1>
              {product.subtitle && (
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  {product.subtitle}
                </p>
              )}
            </div>

            <div className="border-t border-zinc-800/80 pt-4 flex justify-between items-baseline">
              <span className="text-xs font-mono text-zinc-500">Suggested Price</span>
              <span className="text-xl font-mono text-white">
                {product.hidePrice ? 'Call for price' : formatPrice(product.price)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs border-t border-zinc-800/80 pt-4">
              <span className="font-mono text-zinc-500">Availability</span>
              <span className="font-semibold text-zinc-300">
                {product.availability === 'IN_STOCK' && 'In Stock'}
                {product.availability === 'LEAD_TIME' && 'Made to Order'}
                {product.availability === 'SPECIAL_ORDER' && 'Special Order'}
                {product.availability === 'OUT_OF_STOCK' && 'Out of Stock'}
              </span>
            </div>

            {product.brand && (
              <div className="flex justify-between items-center text-xs border-t border-zinc-800/80 pt-4">
                <span className="font-mono text-zinc-500">Brand Integration</span>
                <span className="text-zinc-300">{product.brand.name}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-xs border-t border-zinc-800/80 pt-4">
              <span className="font-mono text-zinc-500">Warranty Coverage</span>
              <span className="text-zinc-300">{product.warrantyMonths} Months</span>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-4">
              <Link
                href="/book-demo"
                className="qls-button qls-button-primary w-full"
              >
                Book Showroom Demo
              </Link>
              <Link
                href="/contact"
                className="qls-button qls-button-secondary w-full"
              >
                Inquire About Integration
              </Link>
            </div>
          </MotionCard>

          {/* Detailed Specifications Specifications Accordion Grid */}
          {Object.keys(specsByGroup).length > 0 && (
            <MotionCard className="qls-card p-6 md:p-8 space-y-6">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 select-none">
                Technical Specifications
              </h3>
              
              <div className="space-y-6">
                {Object.entries(specsByGroup).map(([group, list]) => (
                  <div key={group} className="space-y-2">
                    <h4 className="text-[10px] font-mono uppercase text-[HSL(35,30%,45%)] border-b border-zinc-800/50 pb-1">
                      {group}
                    </h4>
                    <div className="divide-y divide-zinc-900">
                      {list.map((spec, idx) => (
                        <div key={idx} className="flex justify-between text-xs py-2">
                          <span className="text-zinc-500">{spec.name}</span>
                          <span className="text-zinc-300 font-mono text-right">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </MotionCard>
          )}
        </div>
      </MotionReveal>
    </div>
  );
}
