import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();

  // SSR client exchanges ?code= for session via cookies
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_complete')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || profile.onboarding_complete !== true) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  return NextResponse.redirect(new URL('/home', request.url));
}
