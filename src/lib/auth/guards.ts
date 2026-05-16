import { forbidden, unauthorized } from '@/lib/errors';
import { createClient } from '@/lib/supabase/server';

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw unauthorized();
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.is_active) throw forbidden();
  if (!['super_admin', 'admin'].includes(profile.role)) throw forbidden();
  return { user, profile };
}

export async function requireRole(roles: readonly string[]) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || !roles.includes(profile.role)) throw forbidden();
  return { user, profile };
}
