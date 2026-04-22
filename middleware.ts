import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host');
  const url = request.nextUrl.clone();

  // If visiting the root domain (gidanatech.com)
  if (host === 'gidanatech.com' || host === 'www.gidanatech.com') {
    // If they are at the homepage, show them the landing page content
    if (url.pathname === '/') {
      url.pathname = '/landing.html';
      return NextResponse.rewrite(url);
    }
  }

  // If visiting the subdomain (myfunkynewapp.mysuperduperdomain.com)
  // It will naturally serve app/page.tsx (your main app)
  return NextResponse.next();
}
