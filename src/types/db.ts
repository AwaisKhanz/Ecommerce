import type { Database } from './db.generated';

type Tables = Database['public']['Tables'];

export type { Database };
export type Profile = Tables['profiles']['Row'];
export type ProfileInsert = Tables['profiles']['Insert'];
export type ProfileUpdate = Tables['profiles']['Update'];
export type Category = Tables['categories']['Row'];
export type CategoryInsert = Tables['categories']['Insert'];
export type CategoryUpdate = Tables['categories']['Update'];
export type Product = Tables['products']['Row'];
export type ProductInsert = Tables['products']['Insert'];
export type ProductUpdate = Tables['products']['Update'];
export type ProductImage = Tables['product_images']['Row'];
export type ProductCategory = Tables['product_categories']['Row'];
export type Order = Tables['orders']['Row'];
export type OrderInsert = Tables['orders']['Insert'];
export type OrderUpdate = Tables['orders']['Update'];
export type OrderItem = Tables['order_items']['Row'];
export type OrderStatusEvent = Tables['order_status_events']['Row'];
export type EmailOutboxItem = Tables['email_outbox']['Row'];
export type ContactMessage = Tables['contact_messages']['Row'];
export type Setting = Tables['settings']['Row'];
export type AuditLog = Tables['audit_logs']['Row'];
export type FeatureFlag = Tables['feature_flags']['Row'];
