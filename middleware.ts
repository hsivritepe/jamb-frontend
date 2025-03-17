// jamb-frontend/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip certain paths without any checks:
  // 1) Static files from /_next, /public
  // 2) /access (otherwise we cannot access the page to enter the code)
  // 3) /favicon.ico, /robots.txt, etc.
  // 4) /api/gcs-upload (our new exception for the GCS upload route)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/access') ||
    pathname.startsWith('/api/gcs-upload') ||
    pathname.startsWith('/api/predict')
  ) {
    return NextResponse.next();
  }

  // Check if the "hasAccess" cookie is set
  const hasAccess = request.cookies.get('hasAccess');
  if (!hasAccess) {
    // If not set, redirect to /access
    const url = request.nextUrl.clone();
    url.pathname = '/access';
    return NextResponse.redirect(url);
  }

  // Otherwise, allow access to the requested page
  return NextResponse.next();
}