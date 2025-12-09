// Proxies all methods to your Nest API using the server-side URL.
// Works for JSON and multipart uploads.

const API_BASE = process.env.SERVER_API_URL || 'http://api:8080';
const FALLBACK_ORIGIN =
  process.env.INTERNAL_WEB_BASE_URL ||
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'http://localhost:3000';

function resolveIncomingUrl(req: Request) {
  try {
    return new URL(req.url);
  } catch {
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const origin = host ? `${proto}://${host}` : FALLBACK_ORIGIN;
    return new URL(req.url, origin);
  }
}

function buildTarget(req: Request, path: string[]) {
  const incoming = resolveIncomingUrl(req);
  const qs = incoming.search || '';
  return `${API_BASE}/${path.join('/')}${qs}`;
}

function copyHeaders(src: Headers) {
  const h = new Headers(src);
  // remove hop-by-hop / problematic headers
  h.delete('host'); h.delete('connection'); h.delete('content-length');
  return h;
}

async function handle(req: Request, ctx: { params: { path: string[] } }) {
  const url = buildTarget(req, ctx.params.path || []);
  const init: RequestInit = {
    method: req.method,
    headers: copyHeaders(req.headers),
    // Let API set its own cache headers
    redirect: 'manual',
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = req.body;
    (init as any).duplex = 'half';
  }

  const res = await fetch(url, init);

  // Stream back the response (keeps uploads/downloads efficient)
  const outHeaders = copyHeaders(res.headers);
  return new Response(res.body, { status: res.status, headers: outHeaders });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
