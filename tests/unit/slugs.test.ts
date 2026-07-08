import { describe, it, expect } from 'vitest';
import {
  solutions,
  isValidSolutionSlug,
  getSolutionBySlug
} from '../../src/lib/config/solutions';
import {
  legalDocs,
  isValidLegalSlug,
  getLegalDocBySlug
} from '../../src/lib/config/legal';

describe('Solutions Slugs Config Unit Validation', () => {
  const expectedSlugs = [
    'residential-automation',
    'commercial-automation',
    'lighting-automation',
    'curtains-and-blinds',
    'climate-control',
    'security-and-surveillance',
    'audio-video-entertainment',
    'energy-management'
  ];

  it('should support exactly the 8 approved solution slugs', () => {
    const keys = Object.keys(solutions);
    expect(keys.length).toBe(8);
    expectedSlugs.forEach((slug) => {
      expect(keys).toContain(slug);
      expect(isValidSolutionSlug(slug)).toBe(true);
    });
  });

  it('should resolve a valid solution by slug and return typed content parameters', () => {
    expectedSlugs.forEach((slug) => {
      const sol = getSolutionBySlug(slug);
      expect(sol).not.toBeUndefined();
      expect(sol?.slug).toBe(slug);
      expect(sol?.title).not.toBeUndefined();
      expect(sol?.shortDescription).not.toBeUndefined();
      expect(sol?.detailedOverview).not.toBeUndefined();
      expect(sol?.capabilities).toBeInstanceOf(Array);
      expect(sol?.integrationNotes).not.toBeUndefined();
    });
  });

  it('should reject invalid solution slugs', () => {
    expect(isValidSolutionSlug('invalid-automation-slug')).toBe(false);
    expect(getSolutionBySlug('invalid-automation-slug')).toBeUndefined();
  });
});

describe('Legal Slugs Config Unit Validation', () => {
  const expectedLegalSlugs = [
    'privacy-policy',
    'terms-of-service',
    'refund-policy',
    'payment-disclaimer'
  ];

  it('should support exactly the 4 approved legal slugs', () => {
    const keys = Object.keys(legalDocs);
    expect(keys.length).toBe(4);
    expectedLegalSlugs.forEach((slug) => {
      expect(keys).toContain(slug);
      expect(isValidLegalSlug(slug)).toBe(true);
    });
  });

  it('should resolve a valid legal policy by slug and return typed content', () => {
    expectedLegalSlugs.forEach((slug) => {
      const doc = getLegalDocBySlug(slug);
      expect(doc).not.toBeUndefined();
      expect(doc?.slug).toBe(slug);
      expect(doc?.title).not.toBeUndefined();
      expect(doc?.content).not.toBeUndefined();
    });
  });

  it('should reject invalid legal slugs', () => {
    expect(isValidLegalSlug('invalid-legal-slug')).toBe(false);
    expect(getLegalDocBySlug('invalid-legal-slug')).toBeUndefined();
  });
});
