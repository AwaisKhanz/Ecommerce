# 02 · ADMIN PANEL ARCHITECTURE

## 1. Purpose

The admin panel is the operational nerve center of the shop. It must let a non-technical owner:
- Add and manage products with zero friction
- Process incoming orders quickly
- Update order statuses with confidence
- See business health at a glance

## 2. Top-Level Layout

```
┌─────────────────────────────────────────────────────┐
│  TopBar: breadcrumbs · search · notifs · profile    │
├──────────┬──────────────────────────────────────────┤
│ Sidebar  │                                          │
│  ─────   │            Page Content                  │
│  Dash    │                                          │
│  Prod    │                                          │
│  Cat     │                                          │
│  Order   │                                          │
│  Cust    │                                          │
│  Msg     │                                          │
│  Set     │                                          │
│  Audit   │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

- Sidebar collapsible (desktop) / drawer (mobile)
- TopBar sticky
- Pages render inside a max-width content area with consistent padding via design tokens

## 3. Modules

### 3.1 Dashboard
- KPI cards: orders today, revenue today, pending orders, low-stock count
- Recent orders table (last 10 with status badges)
- Sales chart (last 30 days)
- Quick actions: "Add product", "View pending orders", "Add category"
- Low-stock alert banner

### 3.2 Product Management
**List View:**
- Searchable, sortable table (name, SKU, category, price, stock, status, last updated)
- Bulk select with actions (activate, deactivate, delete, change category)
- Filters: category, status, stock range, price range
- Pagination
- "Add Product" CTA top-right

**Edit View:**
- Tabbed form: General, Media, Inventory, SEO, Translations
- Live preview on the right (collapsible)
- Sticky save/cancel footer
- Draft autosave every 30s
- Version history (Phase 2)

**Form fields:**
- General: name, slug (auto), brand, short desc, long desc (rich text), tags, status
- Media: drag-drop multi-upload, reorder, set primary, alt text per image
- Inventory: SKU, price, compare-at price, stock, low-stock threshold
- SEO: meta title, meta description, OG image preview
- Translations: same fields per enabled locale

### 3.3 Category Management
- Tree view with drag-to-reorder and drag-to-nest
- Inline edit for name, slug, active toggle
- Detail view: image, description, SEO, translations
- Prevent deletion if products attached (force reassignment)

### 3.4 Order Management
**List View:**
- Columns: order #, customer, total, status, payment, date, actions
- Status badges with colors (semantic via design tokens)
- Filters: status, date range, has notes, locale
- Search by order #, customer name, phone, email
- Quick status update menu per row
- Export to CSV

**Detail View:**
- Header: order #, customer block, status pill, action menu
- Status timeline (visual stepper)
- Line items table with thumbnails
- Totals breakdown
- Delivery address card
- Customer notes box
- Internal notes textarea (admin-only)
- Action buttons: confirm, mark dispatched, mark delivered, cancel
- Print packing slip → PDF (jsPDF / react-pdf)
- Resend confirmation email button
- Audit log section (status changes)

**Actions emit events:**
- `order.confirmed` → email customer, log audit
- `order.cancelled` → restock items, email customer, log audit
- `order.delivered` → log audit, send receipt email

### 3.5 Customers (Derived View)
- Aggregated from orders (group by `customer_email`)
- Columns: name, email, phone, total orders, total spent, last order date
- Detail page: customer info + order history list
- Quick contact: tel:, mailto:, WhatsApp deep link

### 3.6 Messages (Contact Submissions)
- List of contact form messages
- Filters: status (new, read, archived, spam)
- Inline reply via mailto:
- Mark as spam / archive

### 3.7 Settings
- Tabbed: Business Info, Shipping, Tax, Email, Languages, Maintenance
- Each tab is its own form, saved independently
- Changes audit-logged

### 3.8 Audit Log
- Full searchable log of all admin actions
- Filters: actor, resource, action type, date range
- Diff viewer for changes (before/after)
- Read-only

## 4. Tables Component System

A single `<DataTable />` primitive (built on TanStack Table) handles:
- Sorting
- Pagination
- Column visibility toggle
- Row selection with bulk action bar
- Inline cell editing where applicable
- Empty / loading / error states
- CSV export

All admin tables consume this primitive — no duplicate table code.

## 5. Forms System

A single `<Form />` primitive built on React Hook Form + Zod handles:
- Field registration
- Validation display
- Async submit with toast feedback
- Dirty-tracking with "unsaved changes" guard
- Field-level help text and tooltips

## 6. Notifications

- Toast (sonner) for transient feedback
- Dialog confirmation for destructive actions
- Inline alerts for context-specific warnings

## 7. Permissions Matrix

| Action | super_admin | admin | staff | viewer |
|---|---|---|---|---|
| View dashboard | ✅ | ✅ | ✅ | ✅ |
| CRUD products | ✅ | ✅ | ❌ | ❌ |
| CRUD categories | ✅ | ✅ | ❌ | ❌ |
| View orders | ✅ | ✅ | ✅ | ✅ |
| Update order status | ✅ | ✅ | ✅ | ❌ |
| Cancel orders | ✅ | ✅ | ❌ | ❌ |
| Edit settings | ✅ | ✅ | ❌ | ❌ |
| Manage admins | ✅ | ❌ | ❌ | ❌ |
| View audit log | ✅ | ✅ | ❌ | ❌ |

Enforced both client-side (hide UI) and server-side (guard in route handler / Server Action). Server-side is the source of truth.

## 8. Empty / First-Run UX

When the admin opens a freshly seeded store:
- Empty product list shows "Add your first product" with illustration
- Empty orders shows "No orders yet — your future bestsellers will appear here"
- Dashboard shows onboarding checklist:
  1. Add business info
  2. Add a category
  3. Add first product
  4. Configure email
  5. Test order flow

## 9. Performance Considerations

- All admin lists paginated (default 20)
- Heavy charts code-split (`dynamic(() => import('./SalesChart'))`)
- Image upload uses direct-to-Supabase signed URLs (no double bandwidth)
- Rich text editor lazy-loaded only when product form opens

## 10. Mobile-Friendly Admin

The admin is responsive down to 360px:
- Tables collapse to cards
- Sidebar becomes drawer
- Forms remain usable
- Order detail prioritizes status + customer info above the fold

## 11. Keyboard Shortcuts

- `/` — focus search
- `g d` — go to dashboard
- `g p` — go to products
- `g o` — go to orders
- `n p` — new product
- `cmd+s` — save form
- Documented in a help modal (`?`)

## 12. Future Admin Features (Architecturally Ready)

- Multi-admin invites + roles UI
- Webhooks for Zapier/Make
- Inventory adjustments with reasons
- Refund tracking
- Coupon / discount manager
- Marketing email builder
- Reports & analytics page (cohort, retention)
