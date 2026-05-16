'use client';

import { track as vercelTrack } from '@vercel/analytics';

type EventMap = {
  'product.viewed': { productId: string; slug: string; price: number };
  'product.added_to_cart': { productId: string; qty: number; price: number };
  'checkout.submitted': { lineCount: number; total: number };
  'order.placed': { orderId: string; total: number; itemCount: number };
};

export function track<K extends keyof EventMap>(name: K, props: EventMap[K]): void {
  vercelTrack(name, props);
}
