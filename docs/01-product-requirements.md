# Product Requirements: Quantum Living Solutions

## 1. Primary Business Goals
1. **Premium Positioning**: Establishes brand positioning through cinematic storytelling.
2. **Education**: Demonstrates advanced smart home operations visually.
3. **Qualified Lead Generation**: Filters leads before they contact sales.
4. **Interactive Demos**: Schedules and secures physical and virtual showroom slot bookings.
5. **Flexible Payments**: Accepts full payments, deposits, or pay-on-visit.
6. **Internal CRM & Analytics**: Real-time admin views of customer, lead, booking, and payment lifecycles.

---

## 2. Lead Capture & Lifecycles
The public site captures leads through:
- Cinematic Storyboard calls-to-action (CTAs).
- Comprehensive booking request forms.
- Simple newsletter subscriptions.
- Career application submissions.

### Lead State Machine (CRM)
```
[ NEW ] ---> [ CONTACTED ] ---> [ QUALIFIED ] ---> [ INTERESTED ]
                                       |                 |
                                       v                 v
[ LOST ] <--- [ NOT_INTERESTED ] <----------------- [ DEMO_SCHEDULED ]
                                                         |
                                                         v
[ CONVERTED ] <--- [ QUOTATION_SENT ] <----------- [ DEMO_COMPLETED ]
```

---

## 3. CRM Requirements (Internal Portal)
- **Dashboard**: Metric trends (Total bookings, revenue, lead capture rate, drop-off rates).
- **Lead Manager**: View lead profiles, logs of emails, booking histories, status flags, and custom action buttons.
- **Booking Manager**: Full calendar interface displaying slot occupancy, cancellation triggers, and rescheduling workflows.
- **Payment & Refund Controller**: Track balance dues, process full/partial refunds, verify transaction reconciliation.
- **Career Portal**: Resume viewer, applicant status tracker (Applied, Interviewing, Offered, Rejected).
- **Notification Settings**: Control SMS, Email, and Push triggers.
