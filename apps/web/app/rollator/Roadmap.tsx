// apps/web/app/rollator/Roadmap.tsx
"use client";

import type { ReactElement } from "react";
import { motion } from "framer-motion";
import styles from "./roadmap.module.css";

type Step = {
  id: number;
  title: string;
  copy: string;
  icon: ReactElement;
  tag?: string;
};

const Icon = {
  // simple inline icons (no external deps)
  Search: (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" fill="none" strokeWidth="2" />
      <path d="M20 20 L16.6 16.6" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Clipboard: (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <rect x="6" y="5" width="12" height="16" rx="2" stroke="currentColor" fill="none" strokeWidth="2"/>
      <path d="M9 3h6v4H9z" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  ),
  Cube: (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2l9 5-9 5-9-5 9-5z" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M21 7v10l-9 5-9-5V7" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  Play: (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" strokeWidth="2"/>
      <path d="M10 8l6 4-6 4z" fill="currentColor"/>
    </svg>
  ),
  Heart: (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 21s-8-5.3-8-11A5 5 0 0 1 12 7a5 5 0 0 1 8 3c0 5.7-8 11-8 11z" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  Activity: (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path d="M3 12h4l2 6 4-12 2 6h4" stroke="currentColor" fill="none" strokeWidth="2"/>
    </svg>
  ),
  Package: (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path d="M21 16V8a2 2 0 0 0-1-1.73L12 2 4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L12 22l8-4.27A2 2 0 0 0 21 16z" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M3.27 6.96L12 11l8.73-4.04M12 22V11" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  Lifebuoy: (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" strokeWidth="2"/>
      <circle cx="12" cy="12" r="4" stroke="currentColor" fill="none" strokeWidth="2"/>
      <path d="M4.93 4.93l3.54 3.54m6.06 6.06l3.54 3.54M19.07 4.93l-3.54 3.54M4.93 19.07l3.54-3.54" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
};

const steps: Step[] = [
  {
    id: 1,
    title: "Discover needs",
    copy:
      "Brief intake: mobility goals, home vs. outdoor use, balance support, and preferred training style (dance, gait, strength).",
    icon: Icon.Search,
    tag: "2–3 min",
  },
  {
    id: 2,
    title: "Quick assessment",
    copy:
      "Simple at-home checks: Timed Up & Go, balance questions, and safety profile to right-size recommendations.",
    icon: Icon.Clipboard,
    tag: "evidence-informed",
  },
  {
    id: 3,
    title: "Select your model",
    copy:
      "Choose a rollator configuration that matches terrain and lifestyle. Add optional wheelchair package if needed.",
    icon: Icon.Cube,
  },
  {
    id: 4,
    title: "Guided sessions",
    copy:
      "Follow visual/audio cues for dance, gait and strength blocks. Built-in pacing keeps effort safe and enjoyable.",
    icon: Icon.Play,
  },
  {
    id: 5,
    title: "Monitor progress",
    copy:
      "Session analytics: cadence, time-on-task, intensity hints. See balance and mobility trends over time.",
    icon: Icon.Activity,
  },
  {
    id: 6,
    title: "Community & support",
    copy:
      "Access social inclusion features, tips, and remote check-ins. Motivation and safety go hand-in-hand.",
    icon: Icon.Heart,
  },
  {
    id: 7,
    title: "Delivery & setup",
    copy:
      "We assemble, fit, and teach. Your first guided plan is preloaded — just press start.",
    icon: Icon.Package,
  },
  {
    id: 8,
    title: "Ongoing care",
    copy:
      "Tune programs as needs change. Add accessories, update goals, and keep moving confidently.",
    icon: Icon.Lifebuoy,
  },
];

const item = {
  hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export default function Roadmap() {
  return (
    <section className={styles.roadmap}>
      <header className={styles.roadmapHead}>
        <h2>Your roadmap, one clear path</h2>
        <p>
          Each stage builds confidence: start easy, layer guidance, and celebrate
          progress. Short sessions, steady wins.
        </p>
      </header>

      <div className={styles.timelineWrap}>
        <div className={styles.timeline} aria-hidden />
        <ul className={styles.list}>
          {steps.map((s, i) => (
            <motion.li
              key={s.id}
              className={styles.step}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-20% 0px -10% 0px" }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut" }}
              variants={item}
            >
              <div className={styles.badge}>{s.id}</div>
              <div className={styles.icon}>{s.icon}</div>
              <div className={styles.body}>
                <div className={styles.stepTop}>
                  <h3>{s.title}</h3>
                  {s.tag ? <span className={styles.tag}>{s.tag}</span> : null}
                </div>
                <p>{s.copy}</p>

                {/* Micro “session pulse” animation for training/monitoring steps */}
                {(s.id === 4 || s.id === 5) && (
                  <svg className={styles.pulse} viewBox="0 0 240 32" aria-hidden>
                    <path
                      d="M2 16 H40 L52 28 L70 4 L88 22 L102 10 L112 16 H150 L164 8 L178 24 L190 12 L206 20 L238 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={styles.pulseLine}
                    />
                  </svg>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      </div>

      <footer className={styles.roadmapFoot}>
        <a className={`${styles.btn} ${styles.primary}`} href="/assessment">
          Start free assessment
        </a>
        <a className={`${styles.btn} ${styles.ghost}`} href="/rollator/resources">
          See clinical references
        </a>
      </footer>
    </section>
  );
}
