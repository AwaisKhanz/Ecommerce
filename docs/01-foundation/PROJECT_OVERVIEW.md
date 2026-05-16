# 01 · PROJECT OVERVIEW

## 1. Vision

Build a fast, modern, mobile-first e-commerce platform for selling industrial and work-related products (generators, water pumps, electrical equipment, tools, and accessories). The platform must operate on a **Cash-on-Delivery (COD)** model — customers place orders online, payment happens on physical delivery.

The platform should feel as polished as any major DTC commerce site while remaining operationally simple for a small team to manage.

## 2. Business Context

| Aspect | Detail |
|---|---|
| Business Model | Single-vendor B2C / B2B hybrid e-commerce |
| Payment | Cash on Delivery (no online payment in Phase 1) |
| Inventory | Single warehouse / single source of truth |
| Geography | Single country at launch; multi-region ready |
| Languages | Single language at launch; i18n-ready architecture |
| Operations | Manual order fulfillment via admin panel |

## 3. Primary Goals

1. **Drive sales** via a clean, trustworthy shopfront.
2. **Enable self-service order placement** with zero friction.
3. **Empower the client** to fully manage products and orders without developer intervention.
4. **Provide reliable order communication** through automated email notifications.
5. **Be scalable** for future expansion (payments, multi-language, multi-currency, mobile app).

## 4. Non-Goals (Phase 1)

- Online payment processing (Stripe, PayPal, etc.) — explicitly excluded
- Customer-facing accounts/profiles (guest checkout only at launch)
- Reviews / ratings system
- Wishlists / favorites
- Multi-vendor marketplace
- Loyalty programs / coupons / discount codes (planned for Phase 2)
- Mobile native apps (web-only at launch; backend ready for future apps)

## 5. Target Users

### 5.1 End Customer (Buyer)
- **Profile:** Contractor, electrician, business owner, technician, homeowner with industrial needs.
- **Device:** ~70% mobile, ~30% desktop.
- **Tech savviness:** Mixed — UX must be obvious and frictionless.
- **Primary action:** Find a product → understand it → place an order → wait for delivery.

### 5.2 Admin (Client / Shop Owner)
- **Profile:** Business owner or assigned staff member.
- **Device:** Mostly desktop; mobile-friendly required for on-the-go order checks.
- **Primary actions:** Add products, manage stock, update prices, view and process orders, mark order statuses.

### 5.3 Future Roles (Architectural Headroom)
- **Staff / Operator** (limited admin)
- **Delivery Agent** (view-only access to assigned orders)

## 6. Core Feature Pillars

1. **Product Catalog** — categories, search, filters, detail pages
2. **Order Flow** — cart → checkout → COD confirmation
3. **Email Notifications** — order confirmation, status updates
4. **Admin Panel** — full product + order management
5. **Multilingual-Ready Foundation** — i18n architecture from day 1
6. **Scalable Backend** — Supabase Postgres with proper schema design

## 7. Key Success Metrics

| Metric | Target |
|---|---|
| Page load (LCP) | < 2.5s on 4G |
| Order placement success rate | > 98% |
| Admin task time (add product) | < 60 seconds |
| Lighthouse Performance score | ≥ 90 |
| Lighthouse Accessibility score | ≥ 95 |
| Order email delivery rate | ≥ 99% |

## 8. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Spam / fraudulent orders | Rate limiting + phone verification (Phase 2) |
| Email deliverability | Use Resend with proper SPF/DKIM/DMARC setup |
| Stock conflicts | Atomic stock decrement via Postgres transactions |
| Admin account compromise | Strong password + MFA-ready architecture |
| Scaling pain | Indexed schema, RLS, edge caching, CDN images |

## 9. Stakeholders

- **Product Owner:** Client (shop owner)
- **Engineering:** Solo developer / small team using Claude Code
- **Design:** Custom designs provided post-acceptance
- **Operations:** Client + delivery team

## 10. Out-of-Scope Decisions (Deferred)

The following decisions are intentionally deferred to keep scope tight:

- Loyalty program design
- Multi-currency strategy
- Tax/VAT engine (single tax rate at launch)
- Returns/refunds workflow (manual at launch)
- B2B account pricing tiers

All of these are **architecturally enabled** — the schema and code structure must not block these additions later.
