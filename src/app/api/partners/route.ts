import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ensureDefaultPartners } from '@/lib/partners/initializer';

export const dynamic = 'force-dynamic';

// Revalidate public partner data every 5 minutes
export const revalidate = 300;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const placement = searchParams.get('placement') as 'home' | 'about' | 'footer' | null;

  // Auto-seed default partners on first access
  await ensureDefaultPartners();

  // Build filter based on requested placement
  const whereClause: Record<string, unknown> = { isActive: true };
  if (placement === 'home') whereClause.showOnHome = true;
  else if (placement === 'about') whereClause.showOnAbout = true;
  else if (placement === 'footer') whereClause.showOnFooter = true;
  // No placement filter = return all active

  const partners = await prisma.partner.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      tagline: true,
      overview: true,
      partnership: true,
      services: true,
      websiteUrl: true,
      displayOrder: true,
      logo: { select: { fileUrl: true, fileName: true } },
    },
    orderBy: { displayOrder: 'asc' },
  });

  return NextResponse.json(
    { success: true, partners },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    }
  );
}
