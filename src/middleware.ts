import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Pages where authenticated users should not access
const PUBLIC_ROUTES = ['/', '/login', '/signup'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only run for public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    const token = req.cookies.get('token')?.value;

    if (token) {
      try {
        // Verify JWT
        jwt.verify(token, JWT_SECRET);

        // Redirect authenticated user to dashboard
        return NextResponse.redirect(new URL('/dashboard', req.url));
      } catch (err) {
        // Invalid token, let them access public page
        return NextResponse.next();
      }
    }
  }

  // Allow access to all other routes
  return NextResponse.next();
}

// Apply middleware only to specific routes
export const config = {
  matcher: ['/', '/login', '/signup'],
};
