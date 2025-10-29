import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/login?error=' + error, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  try {
    const supabase = await createClient();

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code
    );

    if (exchangeError) {
      return NextResponse.redirect(
        new URL('/login?error=' + exchangeError.message, request.url)
      );
    }

    // Redirect to onboarding or home
    return NextResponse.redirect(new URL('/onboarding', request.url));
  } catch (err) {
    return NextResponse.redirect(new URL('/login?error=unknown', request.url));
  }
}
