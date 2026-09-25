'use client';

import { MAX_MEDIA_FILE_SIZE, MEDIA_FILE_SIZE_ERROR } from '@/lib/config/uploads';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface SpecTemplate {
  id: string;
  groupName: string;
  name: string;
}

interface SelectedSpec {
  templateId: string;
  groupName: string;
  name: string;
  value: string;
}

interface SelectedDownload {
  label: string;
  fileUrl: string;
}

interface ProductDetail {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  categoryId: string;
  brandId: string | null;
  price: number;
  hidePrice: boolean;
  availability: string;
  warrantyMonths: number;
  extendedWarrantyAvailable: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  sortOrder: number;
  coverImage: { id: string; fileUrl: string } | null;
  gallery: { media: { id: string; fileUrl: string } }[];
  specifications: { templateId: string; value: string; template: SpecTemplate }[];
  downloads: { label: string; fileUrl: string }[];
}

export default function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  // Basic Info Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [priceInRupees, setPriceInRupees] = useState('');
  const [hidePrice, setHidePrice] = useState(false);
  const [availability, setAvailability] = useState('IN_STOCK');
  const [warrantyMonths, setWarrantyMonths] = useState('12');
  const [extendedWarrantyAvailable, setExtendedWarrantyAvailable] = useState(false);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT');
  const [sortOrder, setSortOrder] = useState('0');

  // Media files states
  const [coverImage, setCoverImage] = useState<{ id: string; fileUrl: string } | null>(null);
  const [gallery, setGallery] = useState<{ id: string; fileUrl: string }[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Dynamic Specs states
  const [specTemplates, setSpecTemplates] = useState<SpecTemplate[]>([]);
  const [selectedSpecs, setSelectedSpecs] = useState<SelectedSpec[]>([]);
  const [activeSpecTemplateId, setActiveSpecTemplateId] = useState('');
  const [activeSpecValue, setActiveSpecValue] = useState('');

  // Downloads states
  const [downloads, setDownloads] = useState<SelectedDownload[]>([]);
  const [newDownloadLabel, setNewDownloadLabel] = useState('');
  const [newDownloadUrl, setNewDownloadUrl] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Metadata Collections
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Inline Creation states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showCatModal, setShowCatModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newSpecGroup, setNewSpecGroup] = useState('');
  const [newSpecName, setNewSpecName] = useState('');
  const [showSpecModal, setShowSpecModal] = useState(false);

  // Page Operations
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch Page Setup Metadata & Product Values
  useEffect(() => {
    const loadPageData = async () => {
      try {
        const [catRes, brandRes, specRes, prodRes] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch('/api/admin/brands'),
          fetch('/api/admin/spec-templates'),
          fetch(`/api/admin/products/${id}`)
        ]);

        if (catRes.ok) {
          const catData = await catRes.json() as { categories: Category[] };
          setCategories(catData.categories);
        }
        if (brandRes.ok) {
          const brandData = await brandRes.json() as { brands: Brand[] };
          setBrands(brandData.brands);
        }
        if (specRes.ok) {
          const specData = await specRes.json() as { templates: SpecTemplate[] };
          setSpecTemplates(specData.templates);
        }

        if (prodRes.ok) {
          const prodData = await prodRes.json() as { product: ProductDetail };
          const p = prodData.product;
          
          setTitle(p.title);
          setSubtitle(p.subtitle || '');
          setDescription(p.description);
          setCategoryId(p.categoryId);
          setBrandId(p.brandId || '');
          setPriceInRupees((p.price / 100).toString());
          setHidePrice(p.hidePrice);
          setAvailability(p.availability);
          setWarrantyMonths(p.warrantyMonths.toString());
          setExtendedWarrantyAvailable(p.extendedWarrantyAvailable);
          setStatus(p.status);
          setSortOrder(p.sortOrder.toString());
          setCoverImage(p.coverImage);
          setGallery(p.gallery.map((g) => g.media));
          setDownloads(p.downloads);
          setSelectedSpecs(
            p.specifications.map((s) => ({
              templateId: s.templateId,
              groupName: s.template.groupName,
              name: s.template.name,
              value: s.value
            }))
          );
        } else {
          throw new Error('Product metadata fetch failed');
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to load product details' });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, [id]);

  // Cover image uploader
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_MEDIA_FILE_SIZE) {
      setMessage({ type: 'error', text: MEDIA_FILE_SIZE_ERROR });
      return;
    }

    setUploadingCover(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData
      });

      const data = await res.json() as { success?: boolean; media?: { id: string; fileUrl: string }; error?: string };
      if (res.ok && data.media) {
        setCoverImage({ id: data.media.id, fileUrl: data.media.fileUrl });
      } else {
        throw new Error(data.error || 'Failed to upload cover image');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error uploading cover' });
    } finally {
      setUploadingCover(false);
    }
  };

  // Gallery image uploader
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_MEDIA_FILE_SIZE) {
      setMessage({ type: 'error', text: MEDIA_FILE_SIZE_ERROR });
      return;
    }

    setUploadingGallery(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData
      });

      const data = await res.json() as { success?: boolean; media?: { id: string; fileUrl: string }; error?: string };
      if (res.ok && data.media) {
        setGallery((prev) => [...prev, { id: data.media!.id, fileUrl: data.media!.fileUrl }]);
      } else {
        throw new Error(data.error || 'Failed to upload gallery image');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error uploading gallery asset' });
    } finally {
      setUploadingGallery(false);
    }
  };

  // Document uploader
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_MEDIA_FILE_SIZE) {
      setMessage({ type: 'error', text: MEDIA_FILE_SIZE_ERROR });
      return;
    }

    setUploadingPdf(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData
      });

      const data = await res.json() as { success?: boolean; media?: { fileUrl: string }; error?: string };
      if (res.ok && data.media) {
        setNewDownloadUrl(data.media.fileUrl);
        setMessage({ type: 'success', text: 'Document uploaded successfully' });
      } else {
        throw new Error(data.error || 'Failed to upload document');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error uploading PDF file' });
    } finally {
      setUploadingPdf(false);
    }
  };

  // Dynamic spec actions
  const addSpecification = () => {
    if (!activeSpecTemplateId || !activeSpecValue.trim()) return;

    const template = specTemplates.find((t) => t.id === activeSpecTemplateId);
    if (!template) return;

    if (selectedSpecs.some((s) => s.templateId === activeSpecTemplateId)) {
      alert('Specification value already defined');
      return;
    }

    setSelectedSpecs((prev) => [
      ...prev,
      {
        templateId: template.id,
        groupName: template.groupName,
        name: template.name,
        value: activeSpecValue.trim()
      }
    ]);

    setActiveSpecValue('');
  };

  // Downloads actions
  const addDownload = () => {
    if (!newDownloadLabel.trim() || !newDownloadUrl.trim()) return;

    setDownloads((prev) => [
      ...prev,
      {
        label: newDownloadLabel.trim(),
        fileUrl: newDownloadUrl.trim()
      }
    ]);

    setNewDownloadLabel('');
    setNewDownloadUrl('');
  };

  // Inline add helpers
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName })
      });
      const data = await res.json() as { success?: boolean; category?: Category; error?: string };
      if (res.ok && data.category) {
        setCategories((prev) => [...prev, data.category!]);
        setCategoryId(data.category.id);
        setShowCatModal(false);
        setNewCategoryName('');
      } else {
        alert(data.error || 'Failed to create category');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return;
    try {
      const res = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBrandName })
      });
      const data = await res.json() as { success?: boolean; brand?: Brand; error?: string };
      if (res.ok && data.brand) {
        setBrands((prev) => [...prev, data.brand!]);
        setBrandId(data.brand.id);
        setShowBrandModal(false);
        setNewBrandName('');
      } else {
        alert(data.error || 'Failed to create brand');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSpecTemplate = async () => {
    if (!newSpecGroup.trim() || !newSpecName.trim()) return;
    try {
      const res = await fetch('/api/admin/spec-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupName: newSpecGroup, name: newSpecName })
      });
      const data = await res.json() as { success?: boolean; template?: SpecTemplate; error?: string };
      if (res.ok && data.template) {
        setSpecTemplates((prev) => [...prev, data.template!]);
        setActiveSpecTemplateId(data.template.id);
        setShowSpecModal(false);
        setNewSpecGroup('');
        setNewSpecName('');
      } else {
        alert(data.error || 'Failed to create spec template');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit product edits payload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    // Convert price to minor units (paise)
    const pricePaise = Math.round(parseFloat(priceInRupees || '0') * 100);

    const payload = {
      title,
      subtitle: subtitle || undefined,
      description,
      categoryId,
      brandId: brandId || null,
      price: pricePaise,
      hidePrice,
      availability,
      warrantyMonths: parseInt(warrantyMonths, 10),
      extendedWarrantyAvailable,
      coverImageId: coverImage?.id || null,
      status,
      sortOrder: parseInt(sortOrder, 10),
      galleryIds: gallery.map((g) => g.id),
      downloads,
      specifications: selectedSpecs.map((s) => ({
        templateId: s.templateId,
        value: s.value
      }))
    };

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json() as { success?: boolean; error?: string };
      if (res.ok) {
        setMessage({ type: 'success', text: 'Product updated successfully' });
        setTimeout(() => router.push('/admin/products'), 1500);
      } else {
        throw new Error(data.error || 'Failed to update product');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error submitting form' });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center font-mono text-xs text-zinc-500 select-none animate-pulse">
        Loading catalog records...
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-16">
      <div>
        <Link
          href="/admin/products"
          className="text-xs font-mono uppercase tracking-wider text-zinc-500 hover:text-white transition-colors duration-150 inline-block mb-3"
        >
          &larr; Back to Listings
        </Link>
        <h1 className="text-3xl font-light text-white tracking-tight">
          Edit Product: {title}
        </h1>
      </div>

      {message && (
        <div
          className={`p-4 border rounded-sm text-xs font-mono ${
            message.type === 'success'
              ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-400'
              : 'bg-red-950/20 border-red-900/60 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left main form controls */}
        <div className="lg:col-span-8 space-y-6 bg-[HSL(220,25%,7%)] border border-zinc-800 p-8 rounded-sm">
          <div>
            <label htmlFor="prod-title" className="block text-xs font-mono uppercase text-zinc-400 mb-2 select-none">
              Product Title *
            </label>
            <input
              id="prod-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 px-4 py-3 text-sm text-white rounded-sm outline-none"
            />
          </div>

          <div>
            <label htmlFor="prod-subtitle" className="block text-xs font-mono uppercase text-zinc-400 mb-2 select-none">
              Subtitle / Subheading
            </label>
            <input
              id="prod-subtitle"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 px-4 py-3 text-sm text-white rounded-sm outline-none"
            />
          </div>

          <div>
            <label htmlFor="prod-description" className="block text-xs font-mono uppercase text-zinc-400 mb-2 select-none">
              Long Description *
            </label>
            <textarea
              id="prod-description"
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 px-4 py-3 text-sm text-white rounded-sm outline-none resize-y"
            />
          </div>

          {/* Pricing & Availability */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="prod-price" className="block text-xs font-mono uppercase text-zinc-400 mb-2 select-none">
                Price (INR) *
              </label>
              <input
                id="prod-price"
                type="number"
                step="0.01"
                required
                value={priceInRupees}
                onChange={(e) => setPriceInRupees(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 px-4 py-3 text-sm text-white rounded-sm outline-none"
              />
              <label className="flex items-center gap-2 mt-3 select-none text-xs text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hidePrice}
                  onChange={(e) => setHidePrice(e.target.checked)}
                  className="rounded-sm bg-zinc-950 border-zinc-800"
                />
                Hide Price on Website
              </label>
            </div>

            <div>
              <label htmlFor="prod-availability" className="block text-xs font-mono uppercase text-zinc-400 mb-2 select-none">
                Availability Status
              </label>
              <select
                id="prod-availability"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 px-4 py-3 text-sm text-white rounded-sm outline-none cursor-pointer"
              >
                <option value="IN_STOCK">In Stock</option>
                <option value="LEAD_TIME">Custom Lead Time</option>
                <option value="SPECIAL_ORDER">Special Order</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>

            <div>
              <label htmlFor="prod-warranty" className="block text-xs font-mono uppercase text-zinc-400 mb-2 select-none">
                Warranty (Months)
              </label>
              <input
                id="prod-warranty"
                type="number"
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 px-4 py-3 text-sm text-white rounded-sm outline-none"
              />
            </div>

            <fieldset>
              <legend className="block text-xs font-mono uppercase text-zinc-400 mb-2 select-none">
                Buy Extended Warranty
              </legend>
              <div className="flex gap-5 text-sm text-zinc-300">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="extended-warranty"
                    checked={extendedWarrantyAvailable}
                    onChange={() => setExtendedWarrantyAvailable(true)}
                    className="border-zinc-700 bg-zinc-950"
                  />
                  Yes
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="extended-warranty"
                    checked={!extendedWarrantyAvailable}
                    onChange={() => setExtendedWarrantyAvailable(false)}
                    className="border-zinc-700 bg-zinc-950"
                  />
                  No
                </label>
              </div>
            </fieldset>
          </div>

          {/* Dynamic Specifications */}
          <div className="border-t border-zinc-800 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400">
                Technical Specifications
              </h3>
              <button
                type="button"
                onClick={() => setShowSpecModal(true)}
                className="text-[10px] font-mono text-[HSL(35,30%,45%)] hover:underline cursor-pointer"
              >
                + Define Custom spec type
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-end bg-zinc-950/40 p-4 border border-zinc-800 rounded-sm">
              <div className="flex-1">
                <label htmlFor="spec-type-select" className="block text-[10px] font-mono uppercase text-zinc-500 mb-2 select-none">
                  Spec Type
                </label>
                <select
                  id="spec-type-select"
                  value={activeSpecTemplateId}
                  onChange={(e) => setActiveSpecTemplateId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-white rounded-sm outline-none cursor-pointer"
                >
                  <option value="">Choose parameter</option>
                  {specTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.groupName}] {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label htmlFor="spec-value-input" className="block text-[10px] font-mono uppercase text-zinc-500 mb-2 select-none">
                  Value / Description
                </label>
                <input
                  id="spec-value-input"
                  type="text"
                  value={activeSpecValue}
                  onChange={(e) => setActiveSpecValue(e.target.value)}
                  placeholder="e.g. 230V AC, 50Hz / KNX TP"
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-white rounded-sm outline-none"
                />
              </div>

              <button
                type="button"
                onClick={addSpecification}
                className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono px-4 py-2.5 rounded-sm transition-colors cursor-pointer"
              >
                Add Spec
              </button>
            </div>

            {selectedSpecs.length > 0 && (
              <div className="border border-zinc-800 rounded-sm overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-950/40 border-b border-zinc-800 text-[10px] font-mono uppercase text-zinc-500">
                      <th className="px-4 py-2">Group</th>
                      <th className="px-4 py-2">Parameter</th>
                      <th className="px-4 py-2">Value</th>
                      <th className="px-4 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-zinc-300">
                    {selectedSpecs.map((s, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/30">
                        <td className="px-4 py-2 font-mono text-[10px] text-zinc-500">{s.groupName}</td>
                        <td className="px-4 py-2 text-white">{s.name}</td>
                        <td className="px-4 py-2">{s.value}</td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedSpecs((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Product Downloads Documents */}
          <div className="border-t border-zinc-800 pt-6 space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400">
              Documentation & Downloads
            </h3>

            <div className="flex flex-col md:flex-row gap-4 items-end bg-zinc-950/40 p-4 border border-zinc-800 rounded-sm">
              <div className="flex-1">
                <label htmlFor="dl-label" className="block text-[10px] font-mono uppercase text-zinc-500 mb-2 select-none">
                  Document Label
                </label>
                <input
                  id="dl-label"
                  type="text"
                  value={newDownloadLabel}
                  onChange={(e) => setNewDownloadLabel(e.target.value)}
                  placeholder="e.g. Datasheet / CAD Drawing"
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-white rounded-sm outline-none"
                />
              </div>

              <div className="flex-1">
                <label htmlFor="dl-upload" className="block text-[10px] font-mono uppercase text-zinc-500 mb-2 select-none">
                  File Upload (PDF) / Link Url
                </label>
                <div className="flex gap-2">
                  <input
                    id="dl-url"
                    type="text"
                    value={newDownloadUrl}
                    onChange={(e) => setNewDownloadUrl(e.target.value)}
                    placeholder="https://example.com/spec.pdf"
                    className="flex-1 bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-white rounded-sm outline-none"
                  />
                  <div className="relative">
                    <input
                      id="dl-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="dl-upload"
                      className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono rounded-sm transition-colors cursor-pointer inline-block text-center"
                    >
                      {uploadingPdf ? '...' : 'Upload'}
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={addDownload}
                className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono px-4 py-2.5 rounded-sm transition-colors cursor-pointer"
              >
                Link DL
              </button>
            </div>

            {downloads.length > 0 && (
              <div className="border border-zinc-800 rounded-sm overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-950/40 border-b border-zinc-800 text-[10px] font-mono uppercase text-zinc-500">
                      <th className="px-4 py-2">Document Label</th>
                      <th className="px-4 py-2">File Link Location</th>
                      <th className="px-4 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-zinc-300">
                    {downloads.map((d, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/30">
                        <td className="px-4 py-2 text-white font-medium">{d.label}</td>
                        <td className="px-4 py-2 font-mono text-[10px] text-zinc-400">{d.fileUrl}</td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => setDownloads((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right side options panels */}
        <div className="lg:col-span-4 space-y-6">
          {/* Classification Panel */}
          <div className="bg-[HSL(220,25%,7%)] border border-zinc-800 p-6 rounded-sm space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 select-none">
              Classification
            </h3>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="prod-category" className="text-xs font-mono uppercase text-zinc-500 select-none">
                  Category *
                </label>
                <button
                  type="button"
                  onClick={() => setShowCatModal(true)}
                  className="text-[9px] font-mono text-[HSL(35,30%,45%)] hover:underline cursor-pointer"
                >
                  + Add New
                </button>
              </div>
              <select
                id="prod-category"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-xs text-white rounded-sm outline-none cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="prod-brand" className="text-xs font-mono uppercase text-zinc-500 select-none">
                  Brand Alliance
                </label>
                <button
                  type="button"
                  onClick={() => setShowBrandModal(true)}
                  className="text-[9px] font-mono text-[HSL(35,30%,45%)] hover:underline cursor-pointer"
                >
                  + Add New
                </button>
              </div>
              <select
                id="prod-brand"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-xs text-white rounded-sm outline-none cursor-pointer"
              >
                <option value="">None (In-House)</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="prod-sort" className="block text-xs font-mono uppercase text-zinc-500 mb-2 select-none">
                Display Order
              </label>
              <input
                id="prod-sort"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-xs text-white rounded-sm outline-none"
              />
            </div>
          </div>

          {/* Publishing Controls */}
          <div className="bg-[HSL(220,25%,7%)] border border-zinc-800 p-6 rounded-sm space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 select-none">
              Publish Status
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 border border-zinc-800 p-3 rounded-sm text-xs font-mono cursor-pointer select-none text-white hover:bg-zinc-950/40">
                <input
                  type="radio"
                  name="status"
                  value="DRAFT"
                  checked={status === 'DRAFT'}
                  onChange={() => setStatus('DRAFT')}
                  className="text-[HSL(35,30%,45%)]"
                />
                Draft
              </label>
              <label className="flex-1 flex items-center justify-center gap-2 border border-zinc-800 p-3 rounded-sm text-xs font-mono cursor-pointer select-none text-white hover:bg-zinc-950/40">
                <input
                  type="radio"
                  name="status"
                  value="PUBLISHED"
                  checked={status === 'PUBLISHED'}
                  onChange={() => setStatus('PUBLISHED')}
                  className="text-[HSL(35,30%,45%)]"
                />
                Publish
              </label>
              <label className="flex-1 flex items-center justify-center gap-2 border border-zinc-800 p-3 rounded-sm text-xs font-mono cursor-pointer select-none text-white hover:bg-zinc-950/40">
                <input
                  type="radio"
                  name="status"
                  value="ARCHIVED"
                  checked={status === 'ARCHIVED'}
                  onChange={() => setStatus('ARCHIVED')}
                  className="text-[HSL(35,30%,45%)]"
                />
                Archive
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[HSL(35,30%,45%)] hover:bg-[HSL(35,30%,50%)] disabled:bg-zinc-850 disabled:text-zinc-600 text-white text-xs font-mono tracking-wider uppercase py-4 rounded-sm transition-colors duration-200 cursor-pointer"
            >
              {submitting ? 'Updating Product...' : 'Update Product'}
            </button>
          </div>

          {/* Cover Photo Selection */}
          <div className="bg-[HSL(220,25%,7%)] border border-zinc-800 p-6 rounded-sm space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 select-none">
              Cover Image *
            </h3>

            <div className="space-y-4">
              {coverImage ? (
                <div className="relative border border-zinc-800 rounded-sm overflow-hidden aspect-video bg-zinc-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage.fileUrl}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImage(null)}
                    className="absolute top-2 right-2 bg-red-950/80 hover:bg-red-900 border border-red-800 text-white text-[10px] font-mono px-2 py-1 rounded-sm cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-zinc-800 rounded-sm aspect-video flex flex-col items-center justify-center bg-zinc-950/20 text-center p-4">
                  <span className="text-[10px] font-mono text-zinc-600 mb-3 select-none">
                    Recommended aspect ratio 16:9 (Max 4 MiB)
                  </span>
                  <input
                    id="cover-file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="cover-file-upload"
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono rounded-sm transition-colors cursor-pointer inline-block"
                  >
                    {uploadingCover ? 'Uploading...' : 'Choose File'}
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Product Gallery Images Selection */}
          <div className="bg-[HSL(220,25%,7%)] border border-zinc-800 p-6 rounded-sm space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 select-none">
              Product Gallery
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {gallery.map((g, idx) => (
                <div key={idx} className="relative aspect-video border border-zinc-850 rounded-sm overflow-hidden bg-zinc-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={g.fileUrl}
                    alt="Gallery item"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setGallery((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute inset-0 bg-red-950/80 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[9px] font-mono transition-opacity duration-150 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="border border-dashed border-zinc-800 rounded-sm aspect-video flex items-center justify-center bg-zinc-950/20">
                <input
                  id="gallery-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
                <label
                  htmlFor="gallery-file-upload"
                  className="w-full h-full flex flex-col items-center justify-center text-zinc-500 hover:text-white cursor-pointer select-none"
                >
                  <span className="text-[20px] font-light leading-none">{uploadingGallery ? '...' : '+'}</span>
                  <span className="text-[8px] font-mono uppercase mt-1 select-none">Add Image</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Modal Dialog for Inline Category creation */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[HSL(220,25%,7%)] border border-zinc-800 p-6 rounded-sm w-full max-w-sm space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-white">
              Create New Category
            </h3>
            <input
              type="text"
              placeholder="e.g. Wall Touch Screens"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-xs text-white rounded-sm outline-none"
            />
            <div className="flex justify-end gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => setShowCatModal(false)}
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCategory}
                className="bg-[HSL(35,30%,45%)] hover:bg-[HSL(35,30%,50%)] text-white px-4 py-2 rounded-sm cursor-pointer"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for Inline Brand creation */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[HSL(220,25%,7%)] border border-zinc-800 p-6 rounded-sm w-full max-w-sm space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-white">
              Create Brand Alliance
            </h3>
            <input
              type="text"
              placeholder="e.g. Crestron Electronics"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-xs text-white rounded-sm outline-none"
            />
            <div className="flex justify-end gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => setShowBrandModal(false)}
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateBrand}
                className="bg-[HSL(35,30%,45%)] hover:bg-[HSL(35,30%,50%)] text-white px-4 py-2 rounded-sm cursor-pointer"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for Custom Spec template creation */}
      {showSpecModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[HSL(220,25%,7%)] border border-zinc-800 p-6 rounded-sm w-full max-w-sm space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-white">
              Define Specification Parameter
            </h3>
            <div>
              <label htmlFor="modal-spec-group" className="block text-[10px] font-mono uppercase text-zinc-500 mb-1 select-none">
                Group Category
              </label>
              <input
                id="modal-spec-group"
                type="text"
                placeholder="e.g. Electrical / Connectivity"
                value={newSpecGroup}
                onChange={(e) => setNewSpecGroup(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2 text-xs text-white rounded-sm outline-none"
              />
            </div>
            <div>
              <label htmlFor="modal-spec-name" className="block text-[10px] font-mono uppercase text-zinc-500 mb-1 select-none">
                Parameter Label
              </label>
              <input
                id="modal-spec-name"
                type="text"
                placeholder="e.g. Supply Voltage / Protocol Port"
                value={newSpecName}
                onChange={(e) => setNewSpecName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2 text-xs text-white rounded-sm outline-none"
              />
            </div>
            <div className="flex justify-end gap-3 font-mono text-xs pt-2">
              <button
                type="button"
                onClick={() => setShowSpecModal(false)}
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateSpecTemplate}
                className="bg-[HSL(35,30%,45%)] hover:bg-[HSL(35,30%,50%)] text-white px-4 py-2 rounded-sm cursor-pointer"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
