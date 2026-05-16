import { createHmac, timingSafeEqual } from 'node:crypto';

import { env } from '@/lib/env';

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type OrderConfirmationPayload = {
  orderId: string;
  exp: number;
};

function getSigningSecret(): string {
  const secret = env.ORDER_CONFIRMATION_SIGNING_SECRET;

  if (!secret) {
    throw new Error('ORDER_CONFIRMATION_SIGNING_SECRET is required to sign order tokens.');
  }

  return secret;
}

function encodeJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

function decodeJson<T>(value: string): T {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as T;
}

function signEncodedPayload(encodedPayload: string): string {
  return createHmac('sha256', getSigningSecret()).update(encodedPayload).digest('base64url');
}

export function signOrderConfirmationToken(orderId: string, now = Date.now()): string {
  const payload = encodeJson({
    orderId,
    exp: now + TOKEN_TTL_MS,
  } satisfies OrderConfirmationPayload);
  const signature = signEncodedPayload(payload);
  return `${payload}.${signature}`;
}

export function verifyOrderConfirmationToken(
  token: string,
  now = Date.now(),
): OrderConfirmationPayload | null {
  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) return null;

  const expectedSignature = signEncodedPayload(encodedPayload);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;

  try {
    const payload = decodeJson<OrderConfirmationPayload>(encodedPayload);
    if (!payload.orderId || payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}
