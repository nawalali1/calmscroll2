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
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      return NextResponse.redirect(new URL('/login?error=' + exchangeError.message, request.url));
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, onboarding_complete')
        .eq('id', user.id)
        .maybeSingle();
      
      if (!profile) {
        // Create new profile for first-time user
        await supabase.from('profiles').insert({ 
          id: user.id, 
          onboarding_complete: false 
        });
        
        // Redirect to onboarding for first-time users
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
      
      // Check if onboarding is complete
      if (!profile.onboarding_complete) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    }
    
    // Redirect to home for existing users who completed onboarding
    return NextResponse.redirect(new URL('/home', request.url));
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.redirect(new URL('/login?error=unknown', request.url));
  }
}