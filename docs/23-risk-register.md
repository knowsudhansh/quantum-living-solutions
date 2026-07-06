# Risk Register: Quantum Living Solutions

This document catalogs identified risks, assessment profiles, mitigation strategies, and detection criteria.

---

## 1. Summary Matrix

| Risk Name | Likelihood | Impact | Mitigation Strategy | Detection Criteria | Owner |
| :--- | :---: | :---: | :--- | :--- | :---: |
| **3D Performance Degrade** | High | Medium | Enforce performance budgets. Defer WebGL elements for lower-performance mobiles. | Frame rates drop below 40fps on laptops. | UX Lead |
| **Double-Booking Race** | Medium | High | Rely on database check constraints and SQL row locks. | Database capacity constraint violations. | Lead Architect |
| **Payment Signature Spoof**| Low | High | Enforce server-side webhook checks. Verify signatures via API gateway HMAC-SHA256. | Razorpay webhook validation failure logs. | Security Arch |
| **Secret Token Leak** | Medium | High | Ban client components from using raw API keys. Run pre-commit secret scanners (git-secrets). | Automated git secret alerts during build. | Security Arch |
| **Accessibility Failure** | Low | High | Standardize WCAG 2.2 AA testing baseline. Automate axe checks. | Playwright-axe test suite failures. | QA Lead |
| **SEO Impact (Cinematic UI)**| Medium | Medium | Maintain semantic HTML layer behind canvas. Enable server-side rendering for index page. | Page index failure or ranking drop. | SEO Lead |
| **Cost Growth (Media Hosting)**| High | Low | Compress all video/images. Leverage free-tier Cloudflare R2 object storage. | Egress/storage bills exceed budget. | Finance Lead |
| **Vendor Lock-in (DB/Auth)**| Low | Medium | Utilize standard database adapters. Segregate gateway APIs using interfaces. | Complex migration rewrite required. | Solutions Arch|
| **AI Code degradation** | High | Medium | Enforce strict governance rules, pull-request validations, lint pipelines. | Automated build failures, broken tests. | Lead Architect |
| **Data Loss (Neon Branching)**| Low | High | Restrict database branches to development roles. Automatic backups. | Accidentally dropped tables. | DevOps Lead |

---

## 2. Risk Profiles Detail

### Double-Booking Race Condition
- **Detailed Threat**: Multiple customers submit booking requests for the same time slot at the exact same millisecond. If the system relies on web cache keys or client-side checks, both bookings confirm.
- **Mitigation**: Database-enforced isolation levels (Serializable) and slot capacity constraint limits (`current_bookings <= max_capacity`) as defined in [database-architecture.md](file:///c:/Users/SudhanshuV_Ext/Desktop/test/quantum-living-solutions/docs/08-database-architecture.md).

### Secret Token Leakage
- **Detailed Threat**: Developers accidentally prefix private API keys with `NEXT_PUBLIC_` or commit test credentials to GitHub, exposing them to browser inspection.
- **Mitigation**: Implement build check constraints. Static scanner searches the bundle output folder for API key structures before deployment scripts start.
