import { NextRequest } from 'next/server';

/**
 * Validates admin authentication from request headers or query params
 * @param request - Next.js request object
 * @returns true if authenticated, false otherwise
 */
export function validateAdminAuth(request: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || 'kdsp2025admin';

  // Check Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    // Support both "Bearer <token>" and direct password
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (token === adminPassword) {
      return true;
    }
  }

  // Check query parameter as fallback
  const urlPassword = request.nextUrl.searchParams.get('password');
  if (urlPassword && urlPassword === adminPassword) {
    return true;
  }

  return false;
}
