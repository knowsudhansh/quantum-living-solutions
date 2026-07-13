import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { logger } from '../../../../lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        parent: true
      }
    });
    return NextResponse.json({ success: true, categories });
  } catch (err) {
    logger.error('Categories GET exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: string; parentId?: string };
    const { name, parentId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if category slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug }
    });

    if (existing) {
      return NextResponse.json({ error: 'A category with this name or slug already exists' }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: {
        name: cleanName,
        slug,
        parentId: parentId || null
      }
    });

    logger.info(`Category created: ${category.name} (${category.slug})`);

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (err) {
    logger.error('Category POST exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
