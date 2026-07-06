# SEO & Content Strategy: Quantum Living Solutions

This document defines content principles, search engine metadata configurations, and copy standards.

---

## 1. Technical SEO Configuration
- **Semantic HTML**: Limit page layouts to a single `<h1>` tag matching key focus queries. Use `<header>`, `<main>`, `<section>`, `<article>`, and `<footer>` tags to outline the layout.
- **Canonical Strategy**: Implement canonical URL tags in page metadata to avoid duplicate page indexes:
  `<link rel="canonical" href="https://quantumlivingsolutions.com/solutions/lighting-automation" />`
- **Dynamic Sitemap**: Auto-generate sitemaps under `/sitemap.xml` mapping solutions, projects, team profiles, and legal pages.
- **Local Business Structured Data**: Inject JSON-LD markup on index and contact pages to boost local search rankings:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "name": "Quantum Living Solutions",
    "image": "https://quantumlivingsolutions.com/logo.png",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Bengaluru",
      "addressRegion": "KA",
      "addressCountry": "IN"
    },
    "priceRange": "$$$$"
  }
  ```

---

## 2. Content Tone & Voice Guidelines
We maintain a premium, understated, and technically precise brand voice.

### Content Philosophy
- **Do Not Exaggerate**: Never use generic hype-copy like "revolutionary platform," "cutting-edge AI," or "paradigm shifting."
- **Focus on Experience & Science**: Describe interactions by detailing sensory properties (natural materials, lighting transitions, silent motorized actuators).
- **Be Concise**: High-end customers value their time. Explain features using simple lists, clear structural diagrams, and clean architectural drawings rather than walls of marketing text.
