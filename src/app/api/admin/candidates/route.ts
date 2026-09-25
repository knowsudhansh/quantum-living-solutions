import { NextResponse } from 'next/server';
import { Prisma } from '../../../../generated/client';
import { prisma } from '../../../../lib/db';
import { logger } from '../../../../lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = (url.searchParams.get('search') || '').trim();
    const status = (url.searchParams.get('status') || 'ALL').trim();
    const role = (url.searchParams.get('role') || 'ALL').trim();
    const position = (url.searchParams.get('position') || 'ALL').trim();

    const where: Prisma.CareerApplicationWhereInput = {};

    if (status !== 'ALL') where.status = status;
    if (role !== 'ALL') where.role = role;
    if (position !== 'ALL') where.positionSlug = position;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { role: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { skills: { has: search } },
      ];
    }

    const [candidates, total, statusGroups, roleGroups, positionGroups] = await Promise.all([
      prisma.careerApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.careerApplication.count(),
      prisma.careerApplication.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.careerApplication.groupBy({
        by: ['role'],
        _count: { _all: true },
      }),
      prisma.careerApplication.groupBy({
        by: ['positionSlug'],
        _count: { _all: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      candidates: candidates.map((candidate) => ({
        ...candidate,
        resumeUrl: `/api/admin/candidates/${candidate.id}/resume`,
      })),
      summary: {
        total,
        filtered: candidates.length,
        byStatus: Object.fromEntries(statusGroups.map((item) => [item.status, item._count._all])),
        byRole: Object.fromEntries(roleGroups.map((item) => [item.role, item._count._all])),
        byPosition: Object.fromEntries(positionGroups.map((item) => [item.positionSlug, item._count._all])),
      },
    });
  } catch (err) {
    logger.error('Admin Candidates list API exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
