/**
 * Generates a URL-safe slug from a string.
 * Example: "RCS Electricals Pvt. Ltd." → "rcs-electricals-pvt-ltd"
 */
export function generateSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
