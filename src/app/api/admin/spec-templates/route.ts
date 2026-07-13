import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { logger } from '../../../../lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const templates = await prisma.specTemplate.findMany({
      orderBy: [
        { groupName: 'asc' },
        { name: 'asc' }
      ]
    });
    return NextResponse.json({ success: true, templates });
  } catch (err) {
    logger.error('Spec templates GET exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { groupName?: string; name?: string };
    const { groupName, name } = body;

    if (!groupName || !groupName.trim() || !name || !name.trim()) {
      return NextResponse.json({ error: 'Group name and specification name are required' }, { status: 400 });
    }

    // Check if duplicate spec exists in the same group
    const existing = await prisma.specTemplate.findFirst({
      where: {
        groupName: groupName.trim(),
        name: name.trim()
      }
    });

    if (existing) {
      return NextResponse.json({ success: true, template: existing });
    }

    const template = await prisma.specTemplate.create({
      data: {
        groupName: groupName.trim(),
        name: name.trim()
      }
    });

    logger.info(`Spec template registered: [${template.groupName}] ${template.name}`);

    return NextResponse.json({ success: true, template }, { status: 201 });
  } catch (err) {
    logger.error('Spec template POST exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
