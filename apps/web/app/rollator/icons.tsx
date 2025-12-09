// apps/web/app/rollator/icons.tsx
// All icons are server-safe (no "use client"); animations are done via CSS classes.

type P = React.SVGProps<SVGSVGElement>;

export function RollatorIcon(props: P) {
  return (
    <svg viewBox="0 0 144 96" width="56" height="56" aria-hidden {...props}>
      {/* frame */}
      <path d="M20 26h52l14-10 8 0" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      <path d="M36 26l-12 36m44-36l-14 36m42-46l10 34" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      {/* handles */}
      <path d="M82 16c0 3 2 5 5 5h9" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      {/* wheels */}
      <g className="ico-wheel-spin" transform="translate(36,74)">
        <circle r="12" fill="none" stroke="currentColor" strokeWidth="4"/>
        <path d="M0-10V10M-10 0H10" stroke="currentColor" strokeWidth="3"/>
      </g>
      <g className="ico-wheel-spin" transform="translate(78,74)">
        <circle r="12" fill="none" stroke="currentColor" strokeWidth="4"/>
        <path d="M0-10V10M-10 0H10" stroke="currentColor" strokeWidth="3"/>
      </g>
    </svg>
  );
}

export function HeartIcon(props: P) {
  return (
    <svg viewBox="0 0 96 96" width="48" height="48" aria-hidden {...props}>
      <path className="ico-heart" d="M48 82C-8 46 20 10 48 30c28-20 56 16 0 52z" fill="currentColor"/>
    </svg>
  );
}

export function BalanceIcon(props: P) {
  return (
    <svg viewBox="0 0 120 96" width="52" height="52" aria-hidden {...props}>
      <rect x="10" y="72" width="100" height="8" rx="4" fill="currentColor" opacity=".2"/>
      <rect className="ico-sway" x="56" y="24" width="8" height="48" rx="4" fill="currentColor"/>
      <circle className="ico-sway" cx="60" cy="22" r="10" fill="currentColor"/>
    </svg>
  );
}

export function StepsIcon(props: P) {
  return (
    <svg viewBox="0 0 120 40" width="64" height="40" aria-hidden {...props}>
      <g className="ico-steps">
        <circle cx="16" cy="24" r="6" fill="currentColor"/>
        <circle cx="44" cy="16" r="6" fill="currentColor"/>
        <circle cx="72" cy="24" r="6" fill="currentColor"/>
        <circle cx="100" cy="16" r="6" fill="currentColor"/>
      </g>
    </svg>
  );
}

export function ShieldIcon(props: P) {
  return (
    <svg viewBox="0 0 96 96" width="48" height="48" aria-hidden {...props}>
      <path d="M48 10l28 8v22c0 20-11 30-28 38C31 70 20 60 20 40V18z" fill="currentColor" opacity=".14"/>
      <path d="M48 10l28 8v22c0 20-11 30-28 38C31 70 20 60 20 40V18z" fill="none" stroke="currentColor" strokeWidth="4"/>
      <path d="M35 44l9 9 18-18" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
    </svg>
  );
}
