export interface LegalDoc {
  slug: string;
  title: string;
  shortDescription: string;
  content: string;
}

export const legalDocs: Record<string, LegalDoc> = {
  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    shortDescription: 'Data protection standards and cookie tracking disclosures.',
    content: 'This website is informational. No user account registration or personal data collection features are active. Privacy policies and data handling disclosures will be published before user data capture features are made available.'
  },
  'terms-of-service': {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    shortDescription: 'Acceptable usage rules and liabilities disclaimers.',
    content: 'This website is provided for informational purposes only. System configurations and design guidelines are descriptions of our custom architectural concepts and do not constitute binding engineering warranties.'
  },
  'refund-policy': {
    slug: 'refund-policy',
    title: 'Refund & Cancellation Policy',
    shortDescription: 'Reservation cancellation rules and refund processing timelines.',
    content: 'Online booking and payment are not currently available through this website. Applicable cancellation and refund terms will be provided before those services are offered.'
  },
  'payment-disclaimer': {
    slug: 'payment-disclaimer',
    title: 'Payment Disclaimer',
    shortDescription: 'Billing entities details and tokenization transaction compliance.',
    content: 'Online payment terms will be provided before payment functionality is made available.'
  }
};

export function getAllLegalDocs(): LegalDoc[] {
  return Object.values(legalDocs);
}

export function getLegalDocBySlug(slug: string): LegalDoc | undefined {
  return legalDocs[slug];
}

export function isValidLegalSlug(slug: string): boolean {
  return slug in legalDocs;
}
