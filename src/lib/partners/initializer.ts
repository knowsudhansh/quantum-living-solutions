import 'server-only';
import { prisma } from '@/lib/db';

const RCS_SLUG = 'rcs-electricals';

/**
 * Helper to ensure the default logo exists in the MediaItem table.
 */
async function getOrCreateDefaultLogoId(): Promise<string | null> {
  const fileUrl = '/partners/rcs-electricals-logo.jpg';
  const fileName = 'rcs-electricals-logo.jpg';

  // Check if MediaItem already exists for this URL
  const existingMedia = await prisma.mediaItem.findFirst({
    where: { fileUrl }
  });

  if (existingMedia) {
    return existingMedia.id;
  }

  const fileSize = 367627;

  try {
    const newMedia = await prisma.mediaItem.create({
      data: {
        fileName,
        fileUrl,
        mimeType: 'image/jpeg',
        fileSize,
      }
    });
    return newMedia.id;
  } catch (err) {
    console.error('[Initializer] Failed to register default partner logo:', err);
    return null;
  }
}

/**
 * Ensures the Partner table has the default RCS Electricals record.
 * Automatically run on public page requests if the partner count is 0
 * or if RCS Electricals is missing, maintaining full data integrity.
 */
export async function ensureDefaultPartners(): Promise<void> {
  try {
    // Check if RCS Electricals partner exists
    const existingPartner = await prisma.partner.findUnique({
      where: { slug: RCS_SLUG }
    });

    if (existingPartner) {
      const logoId = existingPartner.logoId ?? await getOrCreateDefaultLogoId();
      await prisma.partner.update({
        where: { slug: RCS_SLUG },
        data: {
          isActive: true,
          showOnHome: true,
          showOnAbout: true,
          showOnFooter: true,
          logoId,
        },
      });
      return;
    }

    // Register default logo
    const logoId = await getOrCreateDefaultLogoId();

    await prisma.partner.create({
      data: {
        name: 'RCS Electricals Pvt. Ltd.',
        slug: RCS_SLUG,
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
        logoId,
        isActive: true,
        showOnHome: true,
        showOnAbout: true,
        showOnFooter: true, // Show on footer by default as requested
        displayOrder: 0,
      },
    });

  } catch (err) {
    console.error('[Initializer] Error during partner initialization:', err);
  }
}
