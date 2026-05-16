# 04 · EMAIL SYSTEM

## 1. Provider

**Resend** for all transactional email. React Email for templates.

## 2. Why Resend
- Modern, developer-friendly API
- React-based templates (typed, themable, reusable)
- Excellent deliverability with proper DNS
- Webhook support for delivery events
- Cheap and scales linearly

## 3. Email Catalog

| Template | Trigger | Recipient | Locale-aware |
|---|---|---|---|
| `order_placed` | Customer places order | Customer + admin (cc/bcc) | ✅ |
| `order_confirmed` | Admin confirms order | Customer | ✅ |
| `order_processing` | Status → processing | Customer (optional) | ✅ |
| `order_out_for_delivery` | Status → out_for_delivery | Customer | ✅ |
| `order_delivered` | Status → delivered | Customer | ✅ |
| `order_cancelled` | Status → cancelled | Customer | ✅ |
| `contact_submission` | Contact form submit | Admin | ❌ (English to admin) |
| `password_reset` | Forgot password | Admin | ✅ |

## 4. Architecture

```
Caller (Server Action / Route Handler)
   │
   ▼
sendEmail(template, to, payload, locale)        ← src/lib/email/send.ts
   │
   ├── Phase 1: send immediately via Resend SDK
   │
   └── Phase 2+: insert into email_outbox, return; cron flushes outbox
```

The interface stays identical between phases — callers never change.

## 5. `sendEmail` Implementation

```ts
// src/lib/email/send.ts
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger/server';
import { adminSupabase } from '@/lib/supabase/admin';
import { templates } from './templates';

const resend = new Resend(env.RESEND_API_KEY);

type SendInput<T extends keyof typeof templates> = {
  template: T;
  to: string;
  payload: Parameters<typeof templates[T]>[0];
  locale?: string;
  bcc?: string[];
};

export async function sendEmail<T extends keyof typeof templates>(input: SendInput<T>) {
  const { template, to, payload, locale = 'en', bcc } = input;
  const Template = templates[template] as any;
  const html = await render(Template({ ...payload, locale }));
  const subject = templates[template].subject(payload as any, locale);

  try {
    const { data, error } = await resend.emails.send({
      from: `${env.RESEND_FROM_NAME} <${env.RESEND_FROM_EMAIL}>`,
      to,
      bcc,
      subject,
      html,
      tags: [{ name: 'template', value: template }],
    });
    if (error) throw error;
    logger.info({ template, to, messageId: data?.id }, 'email_sent');
    return data?.id;
  } catch (err) {
    logger.error({ err, template, to }, 'email_failed');
    // Phase 1: log + continue. Phase 2: enqueue to outbox for retry.
    await adminSupabase.from('email_outbox').insert({
      to_email: to, template, payload, locale, status: 'failed', last_error: String(err),
    });
    return null;
  }
}
```

## 6. Templates (React Email)

```tsx
// src/lib/email/templates/order-placed.tsx
import { Body, Container, Head, Heading, Html, Section, Text, Tailwind } from '@react-email/components';
import { EmailLayout } from './_components';

export function OrderPlacedEmail({ orderNumber, customerName, items, total, currency, locale = 'en' }: Props) {
  // i18n keys loaded statically per locale at build time
  return (
    <EmailLayout locale={locale}>
      <Heading className="text-2xl">Order #{orderNumber}</Heading>
      <Text>Hi {customerName}, we received your order.</Text>
      <Section>
        {items.map(it => (
          <Text key={it.id}>{it.name} × {it.qty} — {format(it.lineTotal, currency)}</Text>
        ))}
        <Text className="font-bold">Total: {format(total, currency)}</Text>
      </Section>
      <Text>You will pay on delivery. We'll notify you when it's on its way.</Text>
    </EmailLayout>
  );
}

OrderPlacedEmail.subject = (p: Props, locale: string) =>
  locale === 'ar' ? `طلب رقم ${p.orderNumber} - تم الاستلام` : `Order ${p.orderNumber} received`;
```

Reusable bits live in `_components.tsx` (Layout, Header with logo, Footer, Button, ItemRow).

## 7. Email Layout

- Width: 600px container, centered
- Inline-safe CSS via Tailwind email plugin
- Logo (light theme only — most clients ignore dark mode)
- Footer: address, unsubscribe link (transactional → not strictly required but courteous), reply-to support email

## 8. Locale & RTL

- Each template accepts `locale` and reads from `messages/<locale>.json`
- For Arabic, set `dir="rtl"` on the root `<Html>` element
- Right-align headings
- Test in Gmail (Latin), Outlook web, Apple Mail, mobile Gmail (Arabic)

## 9. Deliverability Best Practices

- Configure SPF, DKIM, DMARC on your domain (see `DEPLOYMENT_GUIDE.md §3.4`)
- Use a sub-domain like `mail.industrialshop.com` for sending if domain reputation is a concern
- Friendly `from` name and stable `from` address
- Plaintext + HTML version (React Email auto-generates plaintext)
- Avoid spammy words and ALL CAPS
- Keep image-to-text ratio reasonable (≥ 60% text)
- Include physical postal address in footer for some regions

## 10. The Outbox Table

```sql
-- already defined in DATABASE_SCHEMA.md
email_outbox (id, to_email, template, payload, locale, status, attempts, last_error, sent_at, created_at)
```

Phase 1: only failed sends go in. Phase 2: every send goes in first, then a cron flushes them with retry-with-backoff (1m, 5m, 30m, 2h, 12h).

```ts
// Phase 2 flush job
export async function flushOutbox() {
  const { data: rows } = await adminSupabase
    .from('email_outbox')
    .select('*')
    .eq('status', 'pending')
    .order('created_at')
    .limit(50);

  for (const row of rows ?? []) {
    try {
      await sendEmailRaw(row);
      await adminSupabase.from('email_outbox').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', row.id);
    } catch (err) {
      const attempts = row.attempts + 1;
      const status = attempts >= 5 ? 'failed' : 'pending';
      await adminSupabase.from('email_outbox').update({ attempts, last_error: String(err), status }).eq('id', row.id);
    }
  }
}
```

## 11. Webhooks (Phase 2)

`POST /api/webhooks/resend` receives delivery, bounce, open, complaint events. Verify signature using `RESEND_WEBHOOK_SECRET`.

Persist relevant events into `email_outbox` for visibility, and trigger alerts on bounce/complaint rate.

## 12. Admin Visibility

`/admin/messages/emails` (Phase 2) shows:
- Email log with status (sent, failed, bounced, complaint)
- Search by recipient
- Resend button
- Top-line metrics

## 13. Testing

- React Email's dev server: `pnpm email:dev` → http://localhost:3000 preview
- Snapshot tests for each template rendered HTML
- Integration tests stub the Resend client and assert the right template + payload were called
- Send a real test email to a known address from staging weekly

## 14. Localization Keys (Sample)

```json
// messages/en.json
{
  "emails": {
    "orderPlaced": {
      "subject": "Order {orderNumber} received",
      "heading": "Thanks for your order!",
      "intro": "Hi {name}, we got it. You'll pay on delivery.",
      "totalLabel": "Total"
    }
  }
}
```

## 15. Performance & Reliability

- Email sending is **never** in the critical path of a Server Action's success.
- Order placement always returns success even if email send is delayed.
- The outbox + cron pattern decouples the user experience from email infra.

## 16. Future Enhancements

- Plain-text version templates
- Email preference center (Phase 3)
- Marketing emails via separate provider (Customer.io, Loops, etc.) — never mixed with transactional
- SMS notifications via Twilio / local SMS gateway (Phase 2)
