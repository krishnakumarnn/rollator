import Link from 'next/link';

const footerMenus = [
  {
    title: 'Shop',
    links: [
      { label: 'Experience', href: '/rollator' },
      { label: 'Catalog', href: '/#catalog' },
      { label: 'Therapy lab', href: '/c/therapy-lab' },
      { label: 'Accessories', href: '/c/smart' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Account', href: '/account' },
      { label: 'Orders', href: '/orders' },
      { label: 'Care plans', href: '/rollator' },
      { label: 'Contact', href: '/login' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/rollator' },
      { label: 'Careers', href: '/rollator' },
      { label: 'Journal', href: '/signup' },
      { label: 'Admin', href: '/admin' },
    ],
  },
];

export default function AppFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="site-footer__shell">
        <div className="site-footer__brand">
          <Link href="/" className="logo" aria-label="Dawon home">
            DAWON
          </Link>
          <p>
            Dawon is a quiet collection of mobility essentials—clean silhouettes, therapy-ready details, and simple care
            plans built for everyday use.
          </p>
          <div className="site-footer__chips" aria-label="Featured categories">
            <span>Therapy lab</span>
            <span>Outdoor</span>
            <span>Adaptive</span>
          </div>
        </div>
        <div className="site-footer__grid">
          {footerMenus.map((menu) => (
            <div key={menu.title}>
              <p className="site-footer__title">{menu.title}</p>
              <ul>
                {menu.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="site-footer__cta">
            <p className="site-footer__title">Stay in the loop</p>
            <p>Field notes, pilot invites, and seasonal drops once a week.</p>
            <form className="cta-form" action="#">
              <input type="email" placeholder="Email address" aria-label="Email for newsletter" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </div>
      <div className="site-footer__meta">
        <p>© {year} Dawon — calm, therapy-first commerce.</p>
        <div>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
