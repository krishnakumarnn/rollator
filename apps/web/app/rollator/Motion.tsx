'use client';

import { useEffect, useRef, useState } from 'react';
import s from './rollator.module.css';

type Props = {
  children: React.ReactNode;
  delay?: number;   // ms
  y?: number;       // px offset before reveal (default 12)
};

export default function Reveal({ children, delay = 0, y = 12 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip animations if user prefers reduced motion
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${s.reveal} ${inView ? s.revealIn : ''}`}
      style={{ transitionDelay: `${delay}ms`, ['--ry' as any]: `${y}px` }}
    >
      {children}
    </div>
  );
}
