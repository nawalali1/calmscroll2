import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('onboarding_complete').eq('id', user.id).maybeSingle();
  if (!profile?.onboarding_complete) redirect('/onboarding');
  redirect('/home');
}
