import { z } from 'zod';

export const emailSchema = z.string().email().max(254);
export const phoneSchema = z.string().regex(/^\+[1-9]\d{1,14}$/);
export const localeSchema = z.enum(['en', 'ar']);
export const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});
