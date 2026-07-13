/**
 * Re-exports the client-side HomePartnersSection so that consumers
 * don't need to care about the client/server split.
 * The client version fetches from the public API to avoid importing
 * prisma (server-only) into client component bundles.
 */
export { HomePartnersSectionClient as HomePartnersSection } from './home-partners-section-client';
