import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');
  if (!urlParam) {
    return new Response('Missing url', { status: 400 });
  }

  try {
    // Restrict proxying to Google user content for safety
    const allowed = urlParam.startsWith('https://lh3.googleusercontent.com/') || urlParam.includes('googleusercontent.com');
    if (!allowed) {
      return new Response('Domain not allowed', { status: 403 });
    }

    const upstream = await fetch(urlParam, {
      headers: {
        // Some providers require a UA; avoid sending cookies
        'User-Agent': 'ONAGUI-ImageProxy/1.0',
        'Accept': 'image/*'
      },
      cache: 'no-store',
    });

    if (!upstream.ok) {
      return new Response('Upstream error', { status: upstream.status });
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    const buffer = await upstream.arrayBuffer();

    return new Response(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=600',
      },
    });
  } catch (err) {
    return new Response('Proxy failed', { status: 500 });
  }
}