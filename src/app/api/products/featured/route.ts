import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { logger } from '../../../../lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null
      },
      include: {
        category: true,
        brand: true,
        coverImage: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 4
    });
    return NextResponse.json({ success: true, products });
  } catch (err) {
    logger.error('Featured products GET exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Failed to fetch featured products' }, { status: 500 });
  }
}
