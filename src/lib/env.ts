import { z } from 'zod';

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),
  RESEND_FROM_NAME: z.string().min(1),
  ADMIN_NOTIFY_EMAIL: z.string().email(),
  SENTRY_DSN: z.string().url().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string().min(2),
  NEXT_PUBLIC_ENABLED_LOCALES: z.string().min(2),
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.string().length(3),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const parsedClient = clientSchema.safeParse(process.env);

if (!parsedClient.success) {
  console.error('Invalid public env:', parsedClient.error.flatten().fieldErrors);
  throw new Error('Invalid public env');
}

const parsedServer = serverSchema.safeParse(process.env);

if (!parsedServer.success) {
  console.error('Invalid server env:', parsedServer.error.flatten().fieldErrors);
  throw new Error('Invalid server env');
}

export const env = {
  ...parsedClient.data,
  ...parsedServer.data,
};
