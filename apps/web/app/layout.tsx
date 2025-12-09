import './globals.css';
import AppHeader from './components/AppHeader';
import AppFooter from './components/AppFooter';
import SessionProvider from './components/SessionProvider';

export const metadata = {
  title: 'Dawon — Calm Mobility Shop',
  description: 'Essential mobility gear, therapy-ready add-ons, and service programs without the noise.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="page-shell">
        <SessionProvider>
          <AppHeader />
          <main>{children}</main>
          <AppFooter />
        </SessionProvider>
      </body>
    </html>
  );
}
