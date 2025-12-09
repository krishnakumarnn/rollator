// apps/web/app/rollator/iconsV2.tsx
type P = React.SVGProps<SVGSVGElement> & { className?: string };

export function IconPath({ className, ...rest }: P) {
  return (
    <svg viewBox="0 0 600 220" className={className} aria-hidden {...rest}>
      <path
        className="path-stroke"
        d="M10,200 C120,120 200,210 300,160 C380,120 420,80 510,90"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle className="path-dot" cx="510" cy="90" r="8" fill="currentColor" />
    </svg>
  );
}

export function IconCoach({ className, ...rest }: P) {
  return (
    <svg viewBox="0 0 96 96" width="52" height="52" className={className} aria-hidden {...rest}>
      <rect x="12" y="18" width="72" height="50" rx="8" fill="currentColor" opacity=".14" />
      <rect x="12" y="18" width="72" height="50" rx="8" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M26 34h44M26 46h28" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="56" cy="46" r="2.5" fill="currentColor" />
      <circle cx="64" cy="46" r="2.5" fill="currentColor" />
      <circle cx="72" cy="46" r="2.5" fill="currentColor" />
      <rect x="36" y="70" width="24" height="6" rx="3" fill="currentColor" />
    </svg>
  );
}

export function IconShield({ className, ...rest }: P) {
  return (
    <svg viewBox="0 0 96 96" width="52" height="52" className={className} aria-hidden {...rest}>
      <path d="M48 10l28 8v22c0 20-11 30-28 38C31 70 20 60 20 40V18z" fill="currentColor" opacity=".14"/>
      <path d="M48 10l28 8v22c0 20-11 30-28 38C31 70 20 60 20 40V18z" fill="none" stroke="currentColor" strokeWidth="4"/>
      <path d="M35 44l9 9 18-18" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconPulse({ className, ...rest }: P) {
  return (
    <svg viewBox="0 0 120 40" width="64" height="40" className={className} aria-hidden {...rest}>
      <path
        className="pulse-line"
        d="M5 20 H30 L38 8 L46 32 L54 20 H70 L78 12 L86 28 L94 20 H115"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCommunity({ className, ...rest }: P) {
  return (
    <svg viewBox="0 0 120 64" width="60" height="40" className={className} aria-hidden {...rest}>
      <circle cx="30" cy="22" r="10" fill="currentColor" opacity=".85" />
      <circle cx="60" cy="18" r="10" fill="currentColor" opacity=".65" />
      <circle cx="90" cy="22" r="10" fill="currentColor" opacity=".85" />
      <rect x="18" y="36" width="24" height="12" rx="6" fill="currentColor" opacity=".15" />
      <rect x="48" y="32" width="24" height="12" rx="6" fill="currentColor" opacity=".15" />
      <rect x="78" y="36" width="24" height="12" rx="6" fill="currentColor" opacity=".15" />
    </svg>
  );
}
