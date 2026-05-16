import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('order confirmation tokens', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.ORDER_CONFIRMATION_SIGNING_SECRET = 'test-order-confirmation-secret';
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
