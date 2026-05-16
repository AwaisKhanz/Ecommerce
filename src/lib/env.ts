import { z } from 'zod';

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string().min(2),
  NEXT_PUBLIC_ENABLED_LOCALES: z.string().min(2),
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.string().length(3),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  ORDER_CONFIRMATION_SIGNING_SECRET: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  RESEND_FROM_NAME: z.string().min(1).optional(),
  ADMIN_NOTIFY_EMAIL: z.string().email().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

const parsedClient = clientSchema.safeParse(process.env);

if (!parsedClient.success) {
  console.error('Invalid public env:', parsedClient.error.flatten().fieldErrors);
  throw new Error('Invalid public env');
}

const parsedServer =
  typeof window === 'undefined' ? serverSchema.safeParse(process.env) : undefined;

if (parsedServer && !parsedServer.success) {
  console.error('Invalid server env:', parsedServer.error.flatten().fieldErrors);
  throw new Error('Invalid server env');
}

export const env = {
  ...parsedClient.data,
  ...(parsedServer?.success ? parsedServer.data : {}),
} as z.infer<typeof clientSchema> & Partial<z.infer<typeof serverSchema>>;
