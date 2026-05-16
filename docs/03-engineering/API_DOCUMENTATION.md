# 03 · API DOCUMENTATION

## 1. Authentication

| Endpoint group | Auth |
|---|---|
| `/api/v1/*` | Public; rate-limited |
| `/api/admin/*` | Cookie-based (Supabase Auth); requires `admin` or higher |
| `/api/webhooks/*` | Signature-verified |

## 2. Public API (`/api/v1`)

### 2.1 `GET /api/v1/products`

List active products.

**Query params:**

| Param | Type | Default |
|---|---|---|
| `q` | string | — |
| `category` | string (slug) | — |
| `sort` | `newest \| price \| -price \| name` | `newest` |
| `page` | int | 1 |
| `perPage` | int (≤100) | 20 |
| `inStock` | bool | — |

**200 Response:**
```json
{
  "ok": true,
  "data": [{
    "id": "...",
    "slug": "honda-eu22i",
    "name": "Honda EU22i Generator",
    "shortDescription": "...",
    "price": 1499.99,
    "compareAtPrice": null,
    "currency": "USD",
    "stockQuantity": 12,
    "primaryImage": "https://cdn.../...jpg",
    "categories": ["generators"]
  }],
  "meta": { "page": 1, "perPage": 20, "total": 142 }
}
```

### 2.2 `GET /api/v1/products/:slug`

Single product detail.

**200 Response:**
```json
{
  "ok": true,
  "data": {
    "id": "...",
    "slug": "honda-eu22i",
    "name": "...",
    "description": "...",
    "specifications": { "Power": "2200W", "Weight": "21kg" },
    "price": 1499.99,
    "compareAtPrice": null,
    "stockQuantity": 12,
    "images": [{"url": "...", "alt": "..."}],
    "categories": [{ "slug": "generators", "name": "Generators" }],
    "relatedProducts": [/* up to 6 */]
  }
}
```

**404** if not found.

### 2.3 `GET /api/v1/categories`

Returns the full active category tree.

```json
{
  "ok": true,
  "data": [{
    "id": "...",
    "slug": "generators",
    "name": "Generators",
    "image": "https://cdn.../...jpg",
    "children": [{ "slug": "portable", "name": "Portable" }]
  }]
}
```

### 2.4 `POST /api/v1/orders`

Place an order (Cash on Delivery).

**Headers:**
- `Idempotency-Key: <uuid>` (required)
- `Content-Type: application/json`

**Body:**
```json
{
  "customer": {
    "name": "Ahmed Khan",
    "email": "ahmed@example.com",
    "phone": "+923001234567"
  },
  "address": {
    "street": "Plot 12, Sector 5",
    "city": "Lahore",
    "region": "Punjab",
    "postalCode": "54000",
    "country": "PK"
  },
  "items": [
    { "productId": "uuid-1", "quantity": 1 },
    { "productId": "uuid-2", "quantity": 2 }
  ],
  "notes": "Please call before delivery",
  "locale": "en"
}
```

**201 Response:**
```json
{
  "ok": true,
  "data": {
    "orderId": "uuid",
    "orderNumber": "ORD-2026-000123",
    "total": 1599.99,
    "confirmationUrl": "/orders/uuid/confirmation?t=<signed>"
  }
}
```

**Possible errors:**
| HTTP | Code |
|---|---|
| 400 | `VALIDATION_ERROR` |
| 409 | `STOCK_INSUFFICIENT` |
| 429 | `RATE_LIMITED` |
| 500 | `INTERNAL` |

### 2.5 `POST /api/v1/contact`

Submit contact form.

**Body:**
```json
{
  "name": "...", "email": "...", "phone": "...",
  "subject": "...", "message": "..."
}
```

**201:** `{ "ok": true, "data": { "id": "..." } }`

### 2.6 `GET /api/v1/orders/:id` *(signed URL only)*

Requires `?t=<signed-token>` from the order confirmation link. Used to render the customer-facing confirmation page.

## 3. Admin API (`/api/admin`)

All admin endpoints require an authenticated admin session (cookie). Service role bypass is reserved for server-internal use only (never exposed to browser).

### 3.1 Products

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/products` | List (paginated + filterable) |
| POST | `/api/admin/products` | Create |
| GET | `/api/admin/products/:id` | Detail |
| PATCH | `/api/admin/products/:id` | Update |
| DELETE | `/api/admin/products/:id` | Soft delete |
| POST | `/api/admin/products/:id/duplicate` | Clone |
| POST | `/api/admin/products/bulk` | Bulk action |

**Bulk body example:**
```json
{ "action": "activate", "ids": ["uuid1","uuid2"] }
```

### 3.2 Product Images

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/products/:id/images` | Attach image (after upload) |
| PATCH | `/api/admin/products/:id/images/:imageId` | Update alt/order/primary |
| DELETE | `/api/admin/products/:id/images/:imageId` | Remove |

### 3.3 Categories

| Method | Endpoint |
|---|---|
| GET | `/api/admin/categories` |
| POST | `/api/admin/categories` |
| PATCH | `/api/admin/categories/:id` |
| DELETE | `/api/admin/categories/:id` |
| POST | `/api/admin/categories/reorder` |

### 3.4 Orders

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/orders` | List + filter |
| GET | `/api/admin/orders/:id` | Detail incl. items + events |
| PATCH | `/api/admin/orders/:id/status` | Change status (with note) |
| PATCH | `/api/admin/orders/:id/notes` | Update internal notes |
| POST | `/api/admin/orders/:id/resend-email` | Re-send confirmation |
| POST | `/api/admin/orders/export` | CSV export |

**Status change body:**
```json
{ "status": "confirmed", "note": "Stock verified" }
```

### 3.5 Customers (Derived)

| Method | Endpoint |
|---|---|
| GET | `/api/admin/customers` |
| GET | `/api/admin/customers/:email` |

### 3.6 Messages (Contact)

| Method | Endpoint |
|---|---|
| GET | `/api/admin/messages` |
| PATCH | `/api/admin/messages/:id` (mark read / archive / spam) |
| DELETE | `/api/admin/messages/:id` |

### 3.7 Settings

| Method | Endpoint |
|---|---|
| GET | `/api/admin/settings/:key` |
| PUT | `/api/admin/settings/:key` |
| GET | `/api/admin/settings` (all keys) |

### 3.8 Uploads

`POST /api/admin/uploads/sign`

Returns a signed upload URL for direct Supabase Storage upload.

**Body:**
```json
{ "bucket": "product-images", "filename": "photo.jpg", "contentType": "image/jpeg", "size": 482301 }
```

**200:**
```json
{
  "ok": true,
  "data": {
    "uploadUrl": "https://...",
    "path": "products/<uuid>/<uuid>.jpg",
    "expiresIn": 300
  }
}
```

### 3.9 Audit Log

| Method | Endpoint |
|---|---|
| GET | `/api/admin/audit` | filterable list |

## 4. Webhooks

### 4.1 `POST /api/webhooks/resend`

Resend delivery events. Verifies `Resend-Signature` header.

```json
{
  "type": "email.delivered",
  "data": { "to": "...", "tag": "order_placed", "messageId": "..." }
}
```

Updates `email_outbox.status` accordingly.

## 5. Health & Meta

| Endpoint | Returns |
|---|---|
| `GET /api/health` | `{ "ok": true, "ts": "..." }` |
| `GET /sitemap.xml` | XML sitemap |
| `GET /robots.txt` | robots |

## 6. Error Codes Reference

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Body / params invalid |
| `UNAUTHORIZED` | 401 | No session |
| `FORBIDDEN` | 403 | Missing role |
| `NOT_FOUND` | 404 | Resource missing |
| `CONFLICT` | 409 | Stock, idempotency conflict |
| `STOCK_INSUFFICIENT` | 409 | Inventory not enough |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL` | 500 | Unhandled |

## 7. Rate Limits

| Endpoint pattern | Limit |
|---|---|
| `POST /api/v1/orders` | 5/min/IP |
| `POST /api/v1/contact` | 3/min/IP |
| `POST /api/admin/login` (handled via auth flow) | 5/15min/IP |
| Other `/api/v1/*` GET | 60/min/IP |

429 includes `Retry-After` header.

## 8. Versioning

- Public endpoints under `/api/v1`. Breaking changes go to `/api/v2`.
- Admin endpoints are internal and unversioned.

## 9. OpenAPI

`docs/openapi.yaml` is generated from Zod schemas using `zod-to-openapi` and published at `/api/v1/openapi.json` for client codegen (future mobile app).
