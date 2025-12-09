// Always call the local Next proxy. It figures out the real API internally.
const PROXY = '/backend';

export type RequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: HeadersInit;
  authToken?: string;
};

function mergeHeaders(defaults: Record<string, string> | undefined, incoming?: HeadersInit, authToken?: string) {
  const headers = new Headers(defaults);
  if (incoming) {
    new Headers(incoming).forEach((value, key) => headers.set(key, value));
  }
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`);
  return headers;
}

export function buildProxyUrl(path: string) {
  const suffix = path.replace(/^\/+/, '');
  const target = `${PROXY}/${suffix}`.replace(/\/{2,}/g, '/');
  if (typeof window !== 'undefined') return target;
  const base =
    process.env.INTERNAL_WEB_BASE_URL ||
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000';
  return `${base.replace(/\/$/, '')}${target}`;
}

function resolveOptions(options?: RequestOptions, defaults?: Record<string, string>): RequestInit {
  if (!options) {
    return defaults ? { headers: defaults } : {};
  }
  const { authToken, headers, ...rest } = options;
  const mergedHeaders = mergeHeaders(defaults, headers, authToken);
  return { ...rest, headers: mergedHeaders };
}

export async function getJSON<T = any>(path: string, options?: RequestOptions): Promise<T> {
  const url = buildProxyUrl(path);
  const fetchOptions = resolveOptions(options);
  const r = await fetch(url, { cache: 'no-store', ...fetchOptions });
  if (!r.ok) throw new Error(`${path} failed: ${r.status}`);
  return r.json();
}

export async function postJSON<T = any>(path: string, body: any, options?: RequestOptions): Promise<T> {
  const url = buildProxyUrl(path);
  const fetchOptions = resolveOptions(options, { 'Content-Type': 'application/json' });
  const r = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    cache: 'no-store',
    ...fetchOptions,
  });
  if (!r.ok) throw new Error(`${path} failed: ${r.status}`);
  return r.json();
}

export async function putJSON<T = any>(path: string, body: any, options?: RequestOptions): Promise<T> {
  const url = buildProxyUrl(path);
  const fetchOptions = resolveOptions(options, { 'Content-Type': 'application/json' });
  const r = await fetch(url, {
    method: 'PUT',
    body: JSON.stringify(body),
    cache: 'no-store',
    ...fetchOptions,
  });
  if (!r.ok) throw new Error(`${path} failed: ${r.status}`);
  return r.json();
}

export async function deleteJSON<T = any>(path: string, options?: RequestOptions): Promise<T> {
  const url = buildProxyUrl(path);
  const fetchOptions = resolveOptions(options);
  const r = await fetch(url, { method: 'DELETE', cache: 'no-store', ...fetchOptions });
  if (!r.ok) throw new Error(`${path} failed: ${r.status}`);
  return r.json().catch(() => ({} as T));
}
