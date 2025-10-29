import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth routes and public routes
  if (pathname.startsWith('/auth') || pathname.startsWith('/(auth)') || pathname === '/login') {
    return NextResponse.next();
  }

  // For now, allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.well-known).*)',
  ],
};
