# 04 · LOGGING & MONITORING

## 1. Goals

- Diagnose any production incident in minutes, not hours
- Surface bad customer experiences before customers complain
- Catch regressions in performance, errors, and business metrics
- Comply with privacy: never log secrets or full PII

## 2. The Three Pillars

| Pillar      | Tool                                   | Use                |
| ----------- | -------------------------------------- | ------------------ |
| **Logs**    | Pino → Vercel logs → Logtail (Phase 2) | What happened      |
| **Errors**  | Pino + client logger                   | What broke + stack |
| **Metrics** | Vercel Analytics + custom events       | How is it doing    |

Optional fourth: **Traces** — only add a dedicated tracing tool if the owner later chooses one.

## 3. Logging — Server

```ts
// src/lib/logger/server.ts
import pino from 'pino';
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  base: { service: 'industrial-shop', env: process.env.VERCEL_ENV ?? 'local' },
  redact: {
    paths: [
      'password',
      'token',
      '*.password',
      '*.token',
      'authorization',
      'cookie',
      'req.headers.cookie',
    ],
    censor: '[REDACTED]',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
```

### Log levels

| Level   | Use                                             |
| ------- | ----------------------------------------------- |
| `error` | Unhandled exceptions, infra failures            |
| `warn`  | Expected business errors (validation, conflict) |
| `info`  | Business events (order placed, status changed)  |
| `debug` | Detailed dev traces (off in prod)               |

### Log format

Structured JSON only. Always include:

- `requestId` (set via middleware, propagated)
- `userId` if authenticated
- relevant entity IDs
- `event` name in snake_case

```ts
logger.info({ event: 'order_placed', orderId, customerId, total }, 'Order placed');
```

## 4. Request IDs

```ts
// src/middleware.ts
const requestId = req.headers.get('x-request-id') ?? crypto.randomUUID();
res.headers.set('x-request-id', requestId);
// Available downstream via AsyncLocalStorage or context header
```

Every log, every error, every API response carries the same `requestId` so one request can be followed end-to-end in the active logging path.

## 5. Logging — Client

```ts
// src/lib/logger/client.ts
'use client';

export const clientLogger = {
  info: (msg: string, data?: object) => {
    if (process.env.NODE_ENV !== 'production') console.warn(msg, data);
  },
  warn: (msg: string, data?: object) => console.warn(msg, data),
  error: (err: unknown, ctx?: object) => console.error(err, ctx),
};
```

Avoid `console.log` in committed code. ESLint blocks `console.log` (allows `warn`/`error`).

## 6. Error Reporting Setup

- Current stack: Pino on the server, shared client logger in the browser
- Third-party error tracking is intentionally not enabled by owner decision
- If a tracker is added later, preserve the existing redaction rules and request-id flow

## 7. Sampling

No third-party sampling configuration is active in the current stack.

## 8. Critical Alerts

| Alert                    | Trigger                    | Channel                     |
| ------------------------ | -------------------------- | --------------------------- |
| Error rate spike         | > 1% over 5 min            | Logs review + Slack #alerts |
| New error type           | First occurrence           | Logs review                 |
| Order placement failures | > 3 in 10 min              | Logs review + Slack + SMS   |
| Email send failures      | > 5 in 1h                  | Logs review + Slack         |
| 5xx rate                 | > 0.5% over 5 min          | Better Stack → SMS          |
| LCP regression           | p75 > 3s over 1 hour       | Vercel → Slack              |
| Uptime                   | 2 consecutive failed pings | Better Stack → SMS          |

## 9. Business Event Stream

For analytical purposes, business events also write to an `events` audit (in `audit_logs`):

- `order.placed`
- `order.status_changed`
- `product.created` / `.updated` / `.deleted`
- `auth.login.success` / `.failure`
- `admin.action.*`

These power both audit log and analytics dashboards.

## 10. Uptime Monitoring

- **Better Stack** or **UptimeRobot** ping `/api/health` every 60s from 3 regions
- Pings also: `/`, `/shop`, `/admin/login`
- Status page (public) at `status.industrialshop.com` (Phase 2)

## 11. Performance Monitoring

- **Vercel Speed Insights** — RUM data per page
- **Vercel Web Vitals** — LCP, CLS, INP
- Custom thresholds per page (home: LCP 2s, product: 2.5s)
- Weekly review email auto-generated

## 12. Log Retention

| Layer                 | Retention                             |
| --------------------- | ------------------------------------- |
| Vercel built-in logs  | 1 day (Hobby) / 30 days (Pro)         |
| Logtail (Phase 2)     | 30–90 days                            |
| Database `audit_logs` | 1 year, then archived to cold storage |

## 13. Privacy & PII

Always mask before logging:

- Phone: `+92*****4567`
- Email: `a***@example.com`
- Address: store only `city`/`region` in logs

Helper:

```ts
export const mask = {
  email: (e: string) => e.replace(/(.).+(@.+)/, '$1***$2'),
  phone: (p: string) => p.replace(/(.{3}).+(.{4})/, '$1***$2'),
};
```

## 14. Runbooks

Each alert has a runbook at `docs/runbooks/<alert>.md` describing:

- Symptoms
- First 5 things to check
- Common causes
- Escalation contacts

Sample runbooks created at launch:

- `error-rate-spike.md`
- `order-placement-failure.md`
- `db-down.md`
- `email-not-sending.md`

## 15. On-Call

- Phase 1: solo developer / client
- Phase 2: rotation via Better Stack (1-week shifts)
- Acknowledgment SLA: 15 min for SEV-1, 1 hour for SEV-2

## 16. Severity Levels

| Sev   | Definition                  | Example                          |
| ----- | --------------------------- | -------------------------------- |
| SEV-1 | Site down or orders failing | DB unreachable                   |
| SEV-2 | Major feature broken        | Search returns nothing           |
| SEV-3 | Minor or cosmetic           | Image not loading on one product |
| SEV-4 | Improvement request         | Better empty state copy          |

## 17. Incident Process

1. **Detect** — alert fires
2. **Acknowledge** — on-call posts in #incidents within SLA
3. **Mitigate** — feature flag off, rollback, or DB fix
4. **Communicate** — status update every 30 min
5. **Resolve** — verify metrics back to normal
6. **Postmortem** — within 5 business days for SEV-1/2, blameless

## 18. Observability Checklist (before launch)

- [ ] Pino logging visible in Vercel dashboard
- [ ] Better Stack monitor for `/api/health`
- [ ] Slack #alerts channel exists with at least one routed alert
- [ ] Runbooks committed
- [ ] PII redaction tested with a contrived log statement
