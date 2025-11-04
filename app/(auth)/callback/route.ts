import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  if (error) return NextResponse.redirect(new URL('/login?error=' + error, request.url));
  if (!code) return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  try {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) return NextResponse.redirect(new URL('/login?error=' + exchangeError.message, request.url));
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
      if (!profile) {
        await supabase.from('profiles').insert({ id: user.id, onboarding_complete: false });
      }
    }
    
    return NextResponse.redirect(new URL('/', request.url));
  } catch (err) {
    return NextResponse.redirect(new URL('/login?error=unknown', request.url));
  }
}
