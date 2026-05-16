# 01 · PRODUCT REQUIREMENTS (PRD)

## 1. Pages & Public Surface

### 1.1 Home Page
- Hero section (headline, subheadline, primary CTA → Shop)
- Featured product categories (visual grid, 4–8 categories)
- Featured / best-selling products (carousel or grid)
- Trust signals (years in business, customer count, certifications)
- Brief services teaser linking to /services
- Newsletter / contact CTA
- Footer (links, contact, social, payment methods icon "COD")

### 1.2 Shop (Main Focus)
- Listing of all products with:
  - Product image
  - Product name
  - Short description / specs preview
  - Price
  - Stock indicator (In Stock / Out of Stock / Low Stock)
  - "Add to Cart" button
  - "View Details" button
- Sidebar / top bar filters:
  - Category
  - Price range
  - Availability (in stock toggle)
  - Brand (if applicable)
- Sort options: Newest, Price asc/desc, Popularity
- Search bar with debounced input
- Pagination OR infinite scroll (decision: **pagination** for SEO)
- Empty state UI
- URL must reflect filters (`/shop?category=generators&sort=price-asc`) for shareability and SEO

### 1.3 Category Page
- Same UI as Shop but pre-filtered by category
- Category banner image + description
- Breadcrumbs: Home › Shop › [Category]

### 1.4 Product Detail Page
- Image gallery (zoom, multiple images, thumbnails)
- Product name, SKU, price
- Stock status
- Long-form description (rich text)
- Specifications table (key-value)
- Quantity selector
- "Add to Cart" button
- "Buy Now" (skip cart, go straight to checkout)
- Related products section
- Breadcrumbs
- Share buttons (WhatsApp, copy link)
- SEO-optimized structured data (JSON-LD Product schema)

### 1.5 Cart
- Sliding drawer OR dedicated page (`/cart`) — **both** supported, drawer for quick view, page for full review
- Line items with image, name, qty selector, line total, remove button
- Subtotal, estimated delivery, total
- "Proceed to Checkout" button
- Empty cart state

### 1.6 Checkout (No Online Payment)
- Single-page checkout (no multi-step) for speed
- Form fields:
  - Full name *
  - Phone number * (with country code)
  - Email * (for confirmation)
  - Delivery address (street, city, region, postal code) *
  - Notes (optional)
- Order summary on the right (sticky on desktop)
- "Place Order — Pay on Delivery" CTA button
- Clear messaging: "You will pay when the product is delivered."
- Order success page with order ID, summary, and "what happens next"

### 1.7 Order Confirmation Page
- Order number (prominent)
- Items ordered
- Delivery address
- Estimated delivery time
- Contact info for support
- "What happens next" timeline (Confirmed → Processing → Out for Delivery → Delivered)
- Print / save as PDF option

### 1.8 About Us Page
- Company story
- Mission, vision, values
- Team section (optional)
- Statistics / achievements
- CTA to shop or contact

### 1.9 Services Page
- List of services offered (installation, repair, consultation, etc.)
- Each service: icon, title, description, "Request Service" CTA → contact form prefilled

### 1.10 Contact Page
- Contact form (name, email, phone, subject, message)
- Business info (address, phone, email, hours)
- Embedded map
- Social media links
- Form submissions stored in DB + emailed to admin

### 1.11 Legal Pages
- Privacy Policy
- Terms of Service
- Return / Refund Policy
- Cookie Notice
- 404 / 500 error pages

## 2. Order Flow (Customer)

```
Browse → Add to Cart → Review Cart → Checkout Form
                                      ↓
                              Place Order (COD)
                                      ↓
                         Order saved + Email sent
                                      ↓
                          Order Confirmation Page
                                      ↓
                  Admin reviews → updates status → emails sent
```

## 3. Order Status Lifecycle

| Status | Trigger | Customer Email |
|---|---|---|
| `pending` | Customer places order | ✅ Confirmation |
| `confirmed` | Admin confirms availability | ✅ Confirmation #2 |
| `processing` | Admin prepares the order | Optional |
| `out_for_delivery` | Order dispatched | ✅ Notification |
| `delivered` | Delivery completed | ✅ Receipt + thank you |
| `cancelled` | Customer or admin cancels | ✅ Cancellation reason |
| `failed` | Could not deliver | ✅ Notification + retry option |

## 4. Admin Panel Features

### 4.1 Authentication
- Email + password login
- Forgot password flow (email reset link via Resend)
- Session via Supabase Auth (HTTP-only cookies)
- MFA-ready (TOTP) — Phase 2

### 4.2 Dashboard Home
- Today's orders count
- Pending orders count
- Revenue today / this week / this month (computed from delivered orders)
- Recent activity feed
- Low-stock products alert
- Quick actions (add product, view pending orders)

### 4.3 Product Management
- Product list with search, filters, bulk actions
- Add / Edit product form:
  - Name, slug (auto-generated, editable)
  - Description (rich text)
  - Multiple images (drag-and-drop, reorder, set primary)
  - Price, compare-at price (sale)
  - Stock quantity, low-stock threshold
  - SKU, barcode (optional)
  - Category (multi-select supported)
  - Tags
  - Specifications (key-value editor)
  - Status: draft / active / archived
  - SEO fields: meta title, meta description
  - Translations (per-language fields) — i18n-ready
- Duplicate product action
- Bulk operations: activate/deactivate, delete, change category
- Image upload via Supabase Storage with optimization

### 4.4 Category Management
- CRUD categories
- Hierarchical (parent → child) support
- Category image, description, slug, SEO fields
- Sort order
- Active/inactive toggle

### 4.5 Order Management
- Order list with filters (status, date range, customer)
- Search by order ID, customer name, phone
- Order detail view:
  - All customer info
  - Line items with thumbnails
  - Status timeline
  - Internal notes (admin-only)
  - Action buttons (confirm, cancel, mark delivered, etc.)
- Export orders to CSV
- Print order / packing slip

### 4.6 Customer View (Order History)
- List of unique customers (derived from orders)
- Customer detail view shows all their orders
- Quick contact (tel:, mailto:, WhatsApp link)

### 4.7 Settings
- Business info (name, logo, contact, hours)
- Shipping settings (zones, fees if any)
- Tax settings (single rate at launch)
- Email templates (editable subject + body)
- Language settings (enabled languages)
- Maintenance mode toggle

### 4.8 Staff / Roles (Architecturally Ready, Optional Build)
- Roles: super_admin, admin, staff, viewer
- Permissions matrix
- Invite via email

## 5. Email Notifications (via Resend)

| Trigger | Recipient | Template |
|---|---|---|
| Order placed | Customer + Admin | order_placed |
| Order confirmed | Customer | order_confirmed |
| Order out for delivery | Customer | order_out_for_delivery |
| Order delivered | Customer | order_delivered |
| Order cancelled | Customer | order_cancelled |
| Contact form submission | Admin | contact_submission |
| Admin password reset | Admin | password_reset |

All templates must be:
- Responsive (works in Gmail, Outlook, Apple Mail)
- Translatable (i18n-ready)
- Tested across major email clients
- Sent via background job (not blocking HTTP response)

## 6. Validation Rules

| Field | Rule |
|---|---|
| Email | RFC 5322; max 254 chars |
| Phone | E.164 format; country-aware |
| Name | 2–100 chars; no script tags |
| Address | 5–500 chars |
| Product name | 2–200 chars; unique slug |
| Price | > 0; up to 2 decimal places |
| Stock | ≥ 0 integer |
| Quantity in cart | ≥ 1, ≤ available stock |

## 7. Edge Cases

- **Out-of-stock at checkout time:** show error, refresh cart, never silently fail.
- **Concurrent stock decrement:** Postgres `FOR UPDATE` locking inside transaction.
- **Duplicate order submission:** idempotency key from frontend; ignore if order with key exists.
- **Email send failure:** retry queue with exponential backoff; never block order placement.
- **Image upload failure:** show retry option; partial product save allowed.
- **Slow network on checkout:** disable submit button after click, show loading state, no double-submit.
- **Admin accidental delete:** soft delete with 30-day recovery.
- **Customer typo in email:** allow admin to resend confirmation to corrected address.
- **Cart persistence:** localStorage for guests; rehydrate on page load; clear after successful order.

## 8. Multilingual Requirements (Architectural)

Even though launch is single-language, the architecture must support:
- Per-product translated fields (name, description, specs)
- Per-category translated fields
- Per-page translated content
- URL routing with locale prefix (`/en/shop`, `/ar/shop`)
- RTL layout support (CSS logical properties)
- Language switcher in header + footer
- Default language fallback

## 9. SEO Requirements

- Server-rendered pages (Next.js App Router with RSC)
- Per-page metadata (title, description, OG, Twitter cards)
- JSON-LD structured data: Product, Organization, BreadcrumbList, LocalBusiness
- XML sitemap auto-generated
- robots.txt
- Clean URLs (slug-based)
- 301 redirects for renamed slugs
- Canonical tags

## 10. Performance Targets

| Metric | Target |
|---|---|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| TTFB | < 600ms |
| Bundle size (initial JS) | < 150KB gzipped |
| Image weight per product card | < 50KB (next/image + WebP) |

## 11. Browser & Device Support

- Chrome, Safari, Firefox, Edge (last 2 versions)
- iOS Safari 15+
- Android Chrome (last 3 versions)
- Mobile-first responsive: 320px → 1920px+

## 12. Compliance & Legal

- GDPR-ready (cookie banner, data export, account deletion)
- PCI N/A (no card data handled)
- Accessibility: WCAG 2.2 AA target

## 13. Phase Roadmap (Product-Level)

- **Phase 1 (Launch):** Core shop, checkout, admin panel, email
- **Phase 2:** Multilingual rollout, coupons/discounts, customer accounts
- **Phase 3:** Online payments, reviews, wishlists
- **Phase 4:** B2B pricing tiers, bulk orders, RFQ
- **Phase 5:** Mobile app (React Native, shares backend)
