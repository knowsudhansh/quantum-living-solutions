// Run: node --env-file=.env prisma/seed-partners.mjs
import { PrismaClient } from '../src/generated/client/index.js';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.partner.count();
  if (count > 0) {
    console.info(`Partners already exist (${count} records). Skipping.`);
    return;
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

  console.info(`Created partner: ${partner.name} (${partner.id})`);
}

main()
  .catch(err => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
