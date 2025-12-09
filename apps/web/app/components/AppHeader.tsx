'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useSession } from './SessionProvider';

export default function AppHeader() {
  const router = useRouter();
  const { session, signOut } = useSession();

  const userEmail = session.user?.email ?? '';
  const shortEmail = useMemo(() => {
    if (!userEmail) return '';
    if (userEmail.length <= 24) return userEmail;
    const [name, domain] = userEmail.split('@');
    if (!domain) return userEmail.slice(0, 24);
    return `${name.slice(0, 3)}…@${domain}`;
  }, [userEmail]);

  const isAdmin = session.user?.isAdmin;
  const isAuthenticated = session.status === 'authenticated';

  const handleSignOut = () => {
    signOut();
    router.push('/');
  };

  return (
    <header className="topbar">
      <div className="topbar__brand">
        <Link href="/" className="logo" aria-label="Dawon home">
          D&nbsp;&nbsp;A&nbsp;&nbsp;W&nbsp;&nbsp;O&nbsp;&nbsp;N
        </Link>
        <span aria-hidden="true" className="topbar__tagline">
          Simplifying healthy ageing
        </span>
      </div>

      <nav className="nav" aria-label="Primary">
        <Link href="/rollator">Showcase</Link>
        <Link href="/#catalog">Catalog</Link>
        <Link href="/account">Account</Link>
      </nav>

      <div className="nav-actions">
        <Link className="nav-link nav-link--ghost" href="/cart">
          Cart
        </Link>
        {isAuthenticated ? (
          <>
            <Link className="nav-link nav-link--ghost" href="/orders">
              Orders
            </Link>
            {isAdmin && (
              <Link className="nav-link nav-link--ghost" href="/admin">
                Admin
              </Link>
            )}
            <button className="nav-link" onClick={handleSignOut} type="button">
              Sign out
            </button>
            {shortEmail && (
              <span className="user-chip" title={userEmail}>
                {shortEmail}
              </span>
            )}
          </>
        ) : (
          <>
            <Link className="nav-link nav-link--ghost" href="/login">
              Sign in
            </Link>
            <Link className="pill pill--primary" href="/signup">
              Join now
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
