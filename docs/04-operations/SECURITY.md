# 04 · SECURITY

## 1. Security Model in One Line

> Defense in depth: every request is authenticated, authorized, validated, rate-limited, and logged — and the database is the last line of defense via RLS.

## 2. Threat Model

| Threat | Mitigation |
|---|---|
| Stolen admin credentials | Strong password + MFA-ready + rate-limited login + audit log |
| SQL injection | Parameterized queries via Supabase client; no raw SQL with user input |
| XSS | React auto-escapes; no `dangerouslySetInnerHTML` without DOMPurify |
| CSRF | SameSite cookies + Next.js Server Action origin check |
| SSRF | No user-supplied URLs fetched by server (unless allowlisted) |
| Open redirect | Allowlist redirect targets |
| Mass enumeration of orders | Signed URL tokens, no public lookup by order # alone |
| Brute force | Rate limit at edge + account lockouts |
| Fraudulent orders | Idempotency + phone verification (Phase 2) |
| Image/asset abuse | File type + size limits, storage RLS |
| Bot scraping | Robots.txt + rate limit + Cloudflare-style WAF (Phase 2) |
| Insider risk (admin) | Audit log + least-privilege roles |

## 3. Transport Security

- HTTPS only (Vercel enforces)
- HSTS: `max-age=63072000; includeSubDomains; preload`
- TLS 1.2+ (Vercel default)
- Custom domain with valid cert (auto-renewed)

## 4. Security Headers

Set in `vercel.json` and `next.config.mjs`:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-XXX' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.supabase.co; connect-src 'self' https://*.supabase.co https://o0.ingest.sentry.io; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'
```

CSP nonces generated per request via Next.js middleware.

## 5. Authentication & Sessions

- Supabase Auth + HTTP-only Secure SameSite=Lax cookies (see `AUTH_FLOW.md`)
- Refresh tokens rotated
- Idle session timeout: 7 days
- Hard session timeout: 30 days (re-login required)

## 6. Authorization

- Server-side guards (`requireAdmin`, `requireRole`) on every protected route
- Postgres RLS as the final fence
- UI hiding ≠ enforcement — never trust the client

## 7. Input Validation

- **Every** input parsed with Zod before use:
  - Body, query, params, headers (Idempotency-Key, etc.)
- Length limits and shape constraints everywhere
- Reject extra/unknown fields with `.strict()` for sensitive endpoints

## 8. Output Encoding

- React's default escaping covers virtually all XSS
- Rich text fields (product description): sanitize with `isomorphic-dompurify` before storing **and** before rendering (defense in depth)
- File names: server-generated UUIDs, never echoed back unsanitized

## 9. Secrets Management

- Stored in Vercel env (not in repo)
- Never logged (Pino redact + ESLint rule)
- Service role key never reaches browser bundles
- Rotation policy in `ENVIRONMENT_VARIABLES.md §7`

## 10. Rate Limiting

| Endpoint | Limit |
|---|---|
| `POST /api/v1/orders` | 5/min/IP |
| `POST /api/v1/contact` | 3/min/IP |
| Admin login | 5 / 15 min / IP |
| Public GETs | 60/min/IP |

Implemented via Upstash Redis with sliding window. Always returns `429` + `Retry-After`.

## 11. CSRF Protection

- Server Actions: Next.js encrypts and validates origin
- `/api/admin/*`: requires auth cookie; SameSite=Lax blocks cross-site forms
- Custom origin check for any non-Action mutating endpoint

## 12. File Upload Security

- Allowed MIME types per bucket
- Max size per bucket (see `STORAGE_ARCHITECTURE.md §7`)
- Server-generated filenames (UUID + sanitized extension)
- Strip EXIF on user-uploaded images (Phase 2)
- No file types that can be executed by browsers (e.g., `.svg` only via separate bucket with stricter rules)

## 13. SQL Safety

- Use the typed Supabase client — never `query` raw SQL with template strings
- For RPC: validate inputs in the function and use `security definer` carefully
- Stored procedures execute under defined role with limited GRANTs

## 14. Cross-Site Scripting (XSS)

- Default React escaping
- Disallow `dangerouslySetInnerHTML` via ESLint; exceptions need explicit DOMPurify call
- Sanitize markdown / rich text on read **and** write
- Never inject untrusted HTML into emails

## 15. Open Redirect

- Any `?next=` or `?redirect=` param checked against an allowlist of internal paths
- External redirects must go through an interstitial page (Phase 2)

## 16. Sensitive Data Handling

- PII (phone, address) stored encrypted at rest (Supabase managed)
- Logs mask PII (see `LOGGING_MONITORING.md §13`)
- Customer phone never displayed in URLs / query strings
- Order tokens use HMAC signing with `SUPABASE_JWT_SECRET`

## 17. Admin Account Hygiene

- Strong password policy (see `AUTH_FLOW.md §8`)
- MFA architecturally ready (Phase 2)
- Roles enforced via DB (`profiles.role`)
- Activity audit log per admin

## 18. Vulnerability Management

- Dependabot / Renovate weekly PRs
- `pnpm audit` in CI; fails on `high`+
- Snyk / GitHub Advanced Security (Phase 2)
- Subscribe to Supabase, Next.js, Vercel advisories

## 19. Backups & Recovery

- See `DEPLOYMENT_GUIDE.md §14`
- DR drill quarterly: restore staging from backup and verify integrity

## 20. Logging & Audit

- Auth events logged
- Admin actions logged in `audit_logs`
- Customer order history immutable (no edit of placed orders, only status changes)

## 21. GDPR / Privacy Readiness

- Customer data minimization (only what's needed for delivery)
- Right to be forgotten: admin endpoint to anonymize a customer's orders
- Right to data export: CSV of all data for an email (Phase 2)
- Cookie banner (Phase 2)
- Privacy policy + Terms pages live at launch

## 22. Security Headers Test

Run after every deploy:
- `https://securityheaders.com/?q=<your-domain>` — target grade A
- `https://observatory.mozilla.org/` — target ≥ 90

## 23. Penetration Testing

- Self-test with OWASP ZAP automated scan (CI optional)
- Manual security review pre-launch
- Annual external pentest (when business size justifies)

## 24. Incident Response

- Detection via Sentry / Better Stack
- Response steps in `LOGGING_MONITORING.md §17`
- Disclosure: 72-hour notification for personal-data breaches
- Public security contact: `security@industrialshop.com`

## 25. Security Checklist (pre-launch)

- [ ] HTTPS forced + HSTS preloaded
- [ ] Security headers in place (grade A on securityheaders.com)
- [ ] CSP enforced with nonces
- [ ] All inputs validated with Zod
- [ ] RLS enabled on every table
- [ ] Service role key never in client bundle (`grep` your build output)
- [ ] Rate limits configured on mutations and login
- [ ] Dependabot enabled
- [ ] `pnpm audit` clean
- [ ] Privacy policy + Terms live
- [ ] Backup + recovery tested
- [ ] Sentry receiving + scrubbing PII
- [ ] Admin MFA-ready (UI present, can enable per user)
- [ ] Strong admin password set, BOOTSTRAP_* env vars purged after first run
