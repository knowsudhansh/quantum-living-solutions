import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { logger } from '../../../../../lib/utils/logger';

export const dynamic = 'force-dynamic';

interface ProductUpdateBody {
  title?: string;
  subtitle?: string;
  description?: string;
  categoryId?: string;
  brandId?: string;
  price?: number;
  hidePrice?: boolean;
  availability?: string;
  warrantyMonths?: number;
  coverImageId?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  sortOrder?: number;
  galleryIds?: string[];
  downloads?: { label: string; fileUrl: string }[];
  specifications?: { templateId: string; value: string }[];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id, deletedAt: null },
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

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (err) {
    logger.error('Admin Product GET id exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as ProductUpdateBody;
    const {
      title,
      subtitle,
      description,
      categoryId,
      brandId,
      price,
      hidePrice,
      availability,
      warrantyMonths,
      coverImageId,
      status,
      sortOrder,
      galleryIds,
      downloads,
      specifications,
    } = body;

    // Check product existence
    const existingProduct = await prisma.product.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Execute atomic transaction update
    const product = await prisma.$transaction(async (tx) => {
      const dataUpdate: Record<string, unknown> = {};

      if (title !== undefined) {
        const cleanTitle = title.trim();
        if (!cleanTitle) {
          throw new Error('TITLE_REQUIRED');
        }
        dataUpdate.title = cleanTitle;
        dataUpdate.slug = cleanTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Verify slug uniqueness
        const duplicate = await tx.product.findFirst({
          where: {
            slug: dataUpdate.slug as string,
            id: { not: id },
            deletedAt: null,
          },
        });
        if (duplicate) {
          throw new Error('DUPLICATE_SLUG');
        }
      }

      if (subtitle !== undefined) dataUpdate.subtitle = subtitle?.trim() || null;
      if (description !== undefined) {
        if (!description.trim()) {
          throw new Error('DESCRIPTION_REQUIRED');
        }
        dataUpdate.description = description.trim();
      }
      if (categoryId !== undefined) {
        if (!categoryId) {
          throw new Error('CATEGORY_REQUIRED');
        }
        dataUpdate.categoryId = categoryId;
      }
      if (brandId !== undefined) dataUpdate.brandId = brandId || null;
      if (price !== undefined) dataUpdate.price = price;
      if (hidePrice !== undefined) dataUpdate.hidePrice = !!hidePrice;
      if (availability !== undefined) dataUpdate.availability = availability;
      if (warrantyMonths !== undefined) dataUpdate.warrantyMonths = warrantyMonths;
      if (coverImageId !== undefined) dataUpdate.coverImageId = coverImageId || null;
      if (status !== undefined) dataUpdate.status = status;
      if (sortOrder !== undefined) dataUpdate.sortOrder = sortOrder;

      const updated = await tx.product.update({
        where: { id },
        data: dataUpdate,
      });

      // 1. Rewrite Specifications if supplied
      if (specifications !== undefined) {
        await tx.productSpecification.deleteMany({ where: { productId: id } });
        if (specifications.length > 0) {
          await tx.productSpecification.createMany({
            data: specifications.map((spec) => ({
              productId: id,
              templateId: spec.templateId,
              value: spec.value,
            })),
          });
        }
      }

      // 2. Rewrite Downloads documentation links if supplied
      if (downloads !== undefined) {
        await tx.productDownload.deleteMany({ where: { productId: id } });
        if (downloads.length > 0) {
          await tx.productDownload.createMany({
            data: downloads.map((dl) => ({
              productId: id,
              label: dl.label.trim(),
              fileUrl: dl.fileUrl.trim(),
            })),
          });
        }
      }

      // 3. Rewrite Gallery items if supplied
      if (galleryIds !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (galleryIds.length > 0) {
          await tx.productImage.createMany({
            data: galleryIds.map((mediaId, idx) => ({
              productId: id,
              mediaId,
              sortOrder: idx,
            })),
          });
        }
      }

      return updated;
    });

    logger.info(`Product updated successfully by admin: ${product.title} (${product.slug})`);

    return NextResponse.json({ success: true, product });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '';
    if (errorMsg === 'TITLE_REQUIRED') {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }
    if (errorMsg === 'DESCRIPTION_REQUIRED') {
      return NextResponse.json({ error: 'Product description is required' }, { status: 400 });
    }
    if (errorMsg === 'CATEGORY_REQUIRED') {
      return NextResponse.json({ error: 'Category assignment is required' }, { status: 400 });
    }
    if (errorMsg === 'DUPLICATE_SLUG') {
      return NextResponse.json({ error: 'A product with this title or slug already exists' }, { status: 409 });
    }

    logger.error('Admin Product PUT exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingProduct = await prisma.product.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Soft delete product by stamping deletedAt timestamp
    await prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'DRAFT', // Revert status to draft upon archiving
      },
    });

    logger.warn(`Product archived (soft deleted) by admin: ID ${id}`);

    return NextResponse.json({ success: true, message: 'Product archived successfully' });
  } catch (err) {
    logger.error('Admin Product DELETE exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
