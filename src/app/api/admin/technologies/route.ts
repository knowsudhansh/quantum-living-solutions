import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { logger } from '../../../../lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const technologies = await prisma.technology.findMany({
      orderBy: { name: 'asc' },
      include: {
        logo: true
      }
    });
    return NextResponse.json({ success: true, technologies });
  } catch (err) {
    logger.error('Technologies GET exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: string; description?: string; logoId?: string };
    const { name, description, logoId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Technology name is required' }, { status: 400 });
    }

    const technology = await prisma.technology.create({
      data: {
        name: name.trim(),
        description: description || '',
        logoId: logoId || null
      }
    });

    logger.info(`Technology protocol registered: ${technology.name}`);

    return NextResponse.json({ success: true, technology }, { status: 201 });
  } catch (err) {
    logger.error('Technology POST exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
