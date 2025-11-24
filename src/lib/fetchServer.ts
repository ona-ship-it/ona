import { cookies } from 'next/headers';

/**
 * Server-side fetch wrapper for internal API calls.
 * - Builds absolute URLs using NEXT_PUBLIC_SITE_URL
 * - Forwards cookies to preserve user session
 */
export async function serverFetch(path: string, init: RequestInit = {}) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`;

  // Forward cookies from the current request
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

  const headers = new Headers(init.headers || {});
  if (cookieHeader) {
    headers.set('cookie', cookieHeader);
  }

  // Ensure credentials are included when contacting same-origin
  const finalInit: RequestInit = {
    ...init,
    headers,
  };

  return fetch(url, finalInit);
}

export default serverFetch;