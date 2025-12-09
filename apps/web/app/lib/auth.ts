export function saveToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem('auth_token', token);
}
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}
export function clearToken() {
  if (typeof window !== 'undefined') localStorage.removeItem('auth_token');
}
