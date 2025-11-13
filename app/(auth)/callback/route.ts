import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);
  }

  // After exchanging code, check user and redirect
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', requestUrl.origin));
  }

  // Check if profile exists and if onboarding is complete
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_complete')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || profile.onboarding_complete !== true) {
    return NextResponse.redirect(new URL('/onboarding', requestUrl.origin));
  }

  return NextResponse.redirect(new URL('/home', requestUrl.origin));
}