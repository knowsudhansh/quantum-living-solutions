import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { logger } from '../../../../lib/utils/logger';

export const dynamic = 'force-dynamic';

interface ProductCreateBody {
  title?: string;
  subtitle?: string;
  description?: string;
  categoryId?: string;
  brandId?: string;
  price?: number;
  hidePrice?: boolean;
  availability?: string;
  warrantyMonths?: number;
  extendedWarrantyAvailable?: boolean;
  coverImageId?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  sortOrder?: number;
  galleryIds?: string[];
  downloads?: { label: string; fileUrl: string }[];
  specifications?: { templateId: string; value: string }[];
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const categoryId = url.searchParams.get('category') || '';
    const brandId = url.searchParams.get('brand') || '';
    const status = url.searchParams.get('status') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    const skip = (page - 1) * limit;

    // Build query filters
    const whereClause: Record<string, unknown> = {
      deletedAt: null,
    };

    if (search.trim()) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subtitle: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (brandId) {
      whereClause.brandId = brandId;
    }

    if (status) {
      whereClause.status = status;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
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
        orderBy: {
          sortOrder: 'asc',
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    logger.error('Admin Products GET exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProductCreateBody;
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
      extendedWarrantyAvailable,
      coverImageId,
      status,
      sortOrder,
      galleryIds,
      downloads,
      specifications,
    } = body;

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }

    if (!description || !description.trim()) {
      return NextResponse.json({ error: 'Product description is required' }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ error: 'Category assignment is required' }, { status: 400 });
    }

    const cleanTitle = title.trim();
    const slug = cleanTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check unique slug
    const duplicate = await prisma.product.findFirst({
      where: { slug, deletedAt: null },
    });

    if (duplicate) {
      return NextResponse.json({ error: 'A product with this title or slug already exists' }, { status: 409 });
    }

    // Execute product composition inside transaction blocks
    const product = await prisma.$transaction(async (tx) => {
      // 1. Create main product record
      const prod = await tx.product.create({
        data: {
          title: cleanTitle,
          subtitle: subtitle?.trim() || null,
          slug,
          description: description.trim(),
          categoryId,
          brandId: brandId || null,
          price: price || 0,
          hidePrice: !!hidePrice,
          availability: availability || 'IN_STOCK',
          warrantyMonths: warrantyMonths || 12,
          extendedWarrantyAvailable: !!extendedWarrantyAvailable,
          coverImageId: coverImageId || null,
          status: status || 'DRAFT',
          sortOrder: sortOrder || 0,
        },
      });

      // 2. Create specification relations
      if (specifications && specifications.length > 0) {
        await tx.productSpecification.createMany({
          data: specifications.map((spec) => ({
            productId: prod.id,
            templateId: spec.templateId,
            value: spec.value,
          })),
        });
      }

      // 3. Create downloads documentation relations
      if (downloads && downloads.length > 0) {
        await tx.productDownload.createMany({
          data: downloads.map((dl) => ({
            productId: prod.id,
            label: dl.label.trim(),
            fileUrl: dl.fileUrl.trim(),
          })),
        });
      }

      // 4. Create image gallery relations
      if (galleryIds && galleryIds.length > 0) {
        await tx.productImage.createMany({
          data: galleryIds.map((mediaId, idx) => ({
            productId: prod.id,
            mediaId,
            sortOrder: idx,
          })),
        });
      }

      return prod;
    });

    logger.info(`Product created successfully by admin: ${product.title} (${product.slug})`);

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err) {
    logger.error('Admin Product POST exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
