import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('order confirmation tokens', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
    vi.stubEnv('NEXT_PUBLIC_APP_NAME', 'IndustrialShop');
    vi.stubEnv('NEXT_PUBLIC_DEFAULT_LOCALE', 'en');
    vi.stubEnv('NEXT_PUBLIC_ENABLED_LOCALES', 'en');
    vi.stubEnv('NEXT_PUBLIC_DEFAULT_CURRENCY', 'USD');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');
    vi.stubEnv('ORDER_CONFIRMATION_SIGNING_SECRET', 'test-order-confirmation-secret');
  });

  it('signs and verifies valid tokens', async () => {
    const { signOrderConfirmationToken, verifyOrderConfirmationToken } =
      await import('../../src/lib/security/order-confirmation');
    const token = signOrderConfirmationToken('order-123', 1_000);

    expect(verifyOrderConfirmationToken(token, 2_000)).toEqual({
      orderId: 'order-123',
      exp: 604_801_000,
    });
  });

  it('rejects expired tokens', async () => {
    const { signOrderConfirmationToken, verifyOrderConfirmationToken } =
      await import('../../src/lib/security/order-confirmation');
    const token = signOrderConfirmationToken('order-123', 1_000);

    expect(verifyOrderConfirmationToken(token, 604_801_001)).toBeNull();
  });

  it('rejects tampered tokens', async () => {
    const { signOrderConfirmationToken, verifyOrderConfirmationToken } =
      await import('../../src/lib/security/order-confirmation');
    const token = signOrderConfirmationToken('order-123', 1_000);

    expect(verifyOrderConfirmationToken(`${token}tampered`, 2_000)).toBeNull();
  });
});
