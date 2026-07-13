import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST /api/admin/partners/seed
// Seeds the default RCS Electricals partner if no partners exist
export async function POST(request: NextRequest) {
  void request; // middleware handles auth
  const existing = await prisma.partner.count();
  if (existing > 0) {
    return NextResponse.json({ message: 'Partners already seeded', seeded: false });
  }

  const partner = await prisma.partner.create({
    data: {
      name: 'RCS Electricals Pvt. Ltd.',
      slug: 'rcs-electricals',
      tagline: 'High-Performance Electrical Infrastructure & Distribution',
      overview:
        'RCS Electricals Pvt. Ltd. is a premier electrical engineering company specialising in industrial electrical infrastructure, distribution systems, switchgear installations, and EPC contracting. With a proven track record across residential complexes, commercial towers, and industrial facilities, RCS Electricals delivers world-class solutions that power the spaces we automate.',
      partnership:
        'Quantum Living Solutions has formalized an engineering partnership with RCS Electricals to deliver complete smart-home-ready electrical infrastructure. RCS Electricals handles primary electrical distribution, switchboard design, earthing systems, and cable management — forming the reliable backbone on which our automation systems operate. This collaboration ensures that every Quantum installation is built on a certified, professionally engineered electrical foundation.',
      services: [
        'Industrial & Residential Electrical Contracting',
        'LT/HT Switchgear Installation',
        'Distribution Panel Engineering',
        'Structured Cabling & Cable Management',
        'Earthing & Lightning Protection Systems',
        'EPC Project Management',
      ],
      websiteUrl: 'https://rcselectricals.com/',
      isActive: true,
      showOnHome: true,
      showOnAbout: true,
      showOnFooter: true,
      displayOrder: 0,
    },
  });

  return NextResponse.json({ success: true, seeded: true, partner }, { status: 201 });
}
