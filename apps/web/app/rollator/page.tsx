import styles from "./rollator-lilium.module.css";
import HeroVideo from "./HeroVideo";
import Reveal from "./Reveal";
import { buildProxyUrl } from "../lib/api";

export const metadata = {
  title: "ICT Rollator — The Future of Smart Rehabilitation",
  description:
    "Explore how the ICT Rollator blends mobility support, guided therapy, and adaptive feedback to enhance independence and well-being.",
};

async function loadExperienceImage() {
  const fallback =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUQEhMVFhUVFRUVFRUVFRUVFRUWFxUVFhUYHSggGBolHRUVITEiJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGhAQFy0dHR0tKy0rLS0rNystKy0tLS0tKysrKystLS03Ky03LS0rLS0tLSstNy0rNy0tLS0tLS0tLf/AABEIAMIBAwMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABQYBBAcDAv/EADQQAAEDAQYEBQQBBQAAAAAAAAEAAgMEBRESITEGQRNRYXGBIhQjMqGxwfAUI1JicoL/xAAZAQEAAwEBAAAAAAAAAAAAAAAAAgMEAQX/xAAjEQABAwQCAQUAAAAAAAAAAAABAAIREiEDMUEEEyJRYXGB/9oADAMBAAIRAxEAPwD5fEOKt2bZqSeK6FQMqxTkn6n/2Q==";
  try {
    const res = await fetch(buildProxyUrl("experience/media/rollator-hero"), { cache: "no-store" });
    if (!res.ok) throw new Error("no media");
    const data = await res.json();
    return data?.dataUrl ?? fallback;
  } catch {
    return fallback;
  }
}

export default async function RollatorPage() {
  const heroImage = await loadExperienceImage();
  return (
    <main className={styles.page}>
      {/* === HERO === */}
      <section className={styles.hero}>
        <HeroVideo
          src="/videos/lab_rollator.mp4"
          poster="/videos/lab_rollator_poster.jpg"
        >
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>ICT ROLLATOR</p>
            <h1 className={styles.h1}>
              Mobility, <span className={styles.grad}>reimagined</span>.
            </h1>
            <p className={styles.lead}>
              A next-generation rollator combining movement therapy, smart
              sensors, and social interaction to empower independence.
            </p>
            <div className={styles.ctaRow}>
              <a className={`${styles.btn} ${styles.primary}`} href="/assessment">
                Start Assessment
              </a>
              <a className={`${styles.btn} ${styles.ghost}`} href="/contact">
                Talk to Us
              </a>
            </div>
          </div>
        </HeroVideo>
      </section>

      {/* === STORY BLOCK === */}
      <section className={styles.story}>
        <Reveal>
          <h2 className={styles.h2}>Designed for a better tomorrow</h2>
          <p className={styles.storyText}>
            The ICT Rollator is not just mobility assistance — it’s a
            rehabilitation partner. With built-in guidance for balance, strength,
            and cognitive engagement, it bridges therapy and technology through
            an elegant, user-centered design.
          </p>
        </Reveal>
      </section>

      {/* === FEATURE MEDIA SECTION (static to keep a single video on page) === */}
      <section className={styles.featureVideo}>
        <Reveal>
          <div className={styles.featureCopy}>
            <h2 className={styles.h2}>Experience the Rollator in Action</h2>
            <p className={styles.featureLead}>
              A still from our lab walkthrough. Explore the tactile finish, ergonomic frame, and interface that guides
              every session.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className={styles.videoFrame}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt="ICT Rollator in the clinic"
              className={styles.videoTag}
              loading="lazy"
            />
          </div>
        </Reveal>
      </section>

      {/* === ROADMAP === */}
      <section className={styles.roadmap}>
        <Reveal>
          <h2 className={styles.h2}>Your path to progress</h2>
        </Reveal>
        <ol className={styles.steps}>
          <Reveal><li><span>01</span>Quick intake & mobility profile</li></Reveal>
          <Reveal><li><span>02</span>At-home balance & gait assessment</li></Reveal>
          <Reveal><li><span>03</span>Personalized training with ICT Rollator</li></Reveal>
          <Reveal><li><span>04</span>Track improvements in real time</li></Reveal>
          <Reveal><li><span>05</span>Live freely, move confidently</li></Reveal>
        </ol>
      </section>

      {/* === FOOTER CTA === */}
      <section className={styles.tail}>
        <h2 className={styles.h2}>Join the Movement</h2>
        <p className={styles.tailLead}>
          Take part in our pilot or request a demonstration to see how ICT
          Rollator is redefining rehabilitation.
        </p>
        <div className={styles.ctaRow}>
          <a className={`${styles.btn} ${styles.primary}`} href="/assessment">
            Get Started
          </a>
          <a className={`${styles.btn} ${styles.ghost}`} href="/shop">
            Explore Models
          </a>
        </div>
      </section>
    </main>
  );
}
