import { MetadataRoute } from 'next';
import { solutions } from '../lib/config/solutions';
import { legalDocs } from '../lib/config/legal';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://quantumlivingsolutions.com';

  // Static website routes
  const staticPaths = [
    '',
    '/about',
    '/contact',
    '/book-demo',
    '/careers',
    '/experience',
    '/projects',
    '/solutions',
  ];

  const staticEntries = staticPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1.0 : 0.8,
  }));

  // Dynamic solutions slug routes
  const solutionEntries = Object.values(solutions).map((solution) => ({
    url: `${baseUrl}/solutions/${solution.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Dynamic legal documents slug routes
  const legalEntries = Object.values(legalDocs).map((doc) => ({
    url: `${baseUrl}/legal/${doc.slug}`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }));

  return [...staticEntries, ...solutionEntries, ...legalEntries];
}
