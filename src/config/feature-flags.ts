export const FEATURE_FLAGS = {
  ONLINE_PAYMENTS: { default: false, description: 'Enable Stripe checkout' },
  CUSTOMER_ACCOUNTS: { default: false, description: 'Enable customer login/signup' },
  REVIEWS: { default: false, description: 'Enable product reviews' },
  WISHLIST: { default: false, description: 'Enable wishlist' },
  COUPONS: { default: false, description: 'Enable discount codes' },
  MULTILANG_AR: { default: false, description: 'Enable Arabic locale UI' },
  ADMIN_AUDIT_DIFF_VIEW: { default: true, description: 'Show before/after diff in audit log' },
  CHAT_WIDGET: { default: false, description: 'Show live chat widget' },
  MAINTENANCE_MODE: { default: false, description: 'Show maintenance page to non-admins' },
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;
