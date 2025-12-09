// Client-only helper for guest key storage
export function ensureGuestKey(): string {
  if (typeof window === 'undefined') return '';
  let key = localStorage.getItem('guestKey');
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem('guestKey', key);
    document.cookie = `guestKey=${key}; Path=/; Max-Age=${60*60*24*30}`;
  }
  return key;
}
