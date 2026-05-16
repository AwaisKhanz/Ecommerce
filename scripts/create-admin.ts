import { createClient } from '@supabase/supabase-js';

import type { Database } from '../src/types/db';

const emailArgIndex = process.argv.indexOf('--email');
const passwordArgIndex = process.argv.indexOf('--password');
const email = emailArgIndex >= 0 ? process.argv[emailArgIndex + 1] : undefined;
const password = passwordArgIndex >= 0 ? process.argv[passwordArgIndex + 1] : undefined;

if (!email || !password) {
  throw new Error('Usage: pnpm tsx scripts/create-admin.ts --email <email> --password <password>');
}

const url = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

if (!url || !serviceRoleKey) {
  throw new Error('Supabase admin credentials are required.');
}

const admin = createClient<Database>(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) throw error;

const { error: profileError } = await admin.from('profiles').insert({
  id: data.user.id,
  email,
  role: 'super_admin',
});

if (profileError) throw profileError;

process.stdout.write(`Created super admin: ${email}\n`);
