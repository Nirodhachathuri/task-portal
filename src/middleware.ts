import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get('task_portal_session')?.value);
  if (request.nextUrl.pathname.startsWith('/tasks') && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/tasks/:path*'] };
