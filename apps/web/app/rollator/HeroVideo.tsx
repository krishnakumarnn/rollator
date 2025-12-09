"use client";

import { useEffect, useRef } from "react";
import styles from "./rollator-lilium.module.css";

type Props = {
  src: string;
  poster?: string;
  children?: React.ReactNode;
};

export default function HeroVideo({ src, poster, children }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const tryPlay = async () => {
      try {
        await v.play();
      } catch {
        v.controls = true;
      }
    };
    tryPlay();
  }, []);

  return (
    <div className={styles.heroWrap}>
      <video
        ref={ref}
        className={styles.heroVideo}
        src={src}
        poster={poster}
        playsInline
        muted
        loop
        preload="metadata"
      />
      <div className={styles.heroOverlay} />
      <div className={styles.heroInner}>{children}</div>
    </div>
  );
}
