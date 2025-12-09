import Link from 'next/link';
import { getJSON } from './lib/api';

const fallbackImage =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxASEhUQEhMVFhUVFRUVFRUVFRUVFRUWFxUVFhUYHSggGBolHRUVITEiJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGhAQFy0dHR0tKy0rLS0rNystKy0tLS0tKysrKystLS03Ky03LS0rLS0tLSstNy0rNy0tLS0tLS0tLf/AABEIAMIBAwMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABQYBBAcDAv/EADQQAAEDAQYEBQQBBQAAAAAAAAEAAgMEBRESITEGQRNRYXGBIhQjMqGxwfAUI1JicoL/xAAZAQEAAwEBAAAAAAAAAAAAAAAAAgMEAQX/xAAjEQABAwQCAQUAAAAAAAAAAAABAAIREiEDMUEEEyJRYXGB/9oADAMBAAIRAxEAPwD5fEOKt2bZqSeK6FQMqxTkn6n/2Q==';

const formatPrice = (priceCents?: number | null, currency = 'USD') =>
  ((priceCents ?? 0) / 100).toLocaleString(undefined, { style: 'currency', currency });

const spotlightImages = {
  mission: '/dawon-mission.png',
};

export default async function Home() {
  const [categoriesResponse, productsResponse] = await Promise.all([
    getJSON<any>('categories'),
    getJSON<any>('products'),
  ]);

  const categories = Array.isArray(categoriesResponse) ? categoriesResponse : [];
  const products = Array.isArray(productsResponse) ? productsResponse : [];
  const heroProduct = products?.[0];
  const heroImage = heroProduct?.images?.[0]?.dataUrl ?? fallbackImage;

  const customerStories = [
    {
      label: 'Older adults',
      copy:
        'Safe mobility, posture support, and joyful group activities that keep people confident at every step.',
    },
    {
      label: 'Caregivers & therapists',
      copy: 'Ready-made movement plans and automatic tracking reduce manual admin so care feels personal again.',
    },
    {
      label: 'Families',
      copy: 'HappyAge updates show progress and ease long-distance worry about safety, falls, and independence.',
    },
    {
      label: 'Care homes & clinics',
      copy: 'Modern, data-informed programs that scale across residents without needing gyms or extra staff.',
    },
  ];

  const teamMembers = [
    { name: 'Prof. Dr. Edelmann Nusser', role: 'Mentor', photo: '/team-edelmann.jpg' },
    {
      name: 'Prof. Dr. Anita Hökelmann',
      role: 'Founder · Scientific collaborator',
      photo: '/team-anita.jpg',
    },
    { name: 'M.Sc. Niharika Bandaru', role: 'Founder · Team co-ordinator', photo: '/team-niharika.jpg' },
    { name: 'M.Sc. Janardhan', role: 'Team member · Operations', photo: '/team-janardhan.jpg' },
  ];


  return (
    <main>
      <section className="spotlight spotlight--flat" id="mission" style={{ backgroundImage: `url(${spotlightImages.mission})` }}>
        <div className="mission-hero">
          <p className="section-title">Our mission</p>
          <p>
            Dawon simplifies healthy ageing with integrated physical health-tech from personalized programs to remote
            healthcare services, all designed to keep people live longer, active, confident, and connected while ageing.
          </p>
        </div>
      </section>

      <section className="spotlight" id="customers">
        <div className="spotlight__body spotlight__body--full">
          <p className="section-title">Our customers</p>
          <p className="headline">Designed around the people who rely on Dawon daily.</p>
          <div className="card-grid card-grid--four">
            {customerStories.map((story) => (
              <article key={story.label} className="card">
                <p className="card__label">{story.label}</p>
                <p className="muted">{story.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="spotlight" id="upcoming">
        <div className="spotlight__media">
          <img src="/upcoming-cophyfit.jpg" alt="Upcoming CophyFit rollator" />
        </div>
        <div className="spotlight__body">
          <p className="section-title">Upcoming product</p>
          <p className="headline">CophyFit — elevated mobility for 2026</p>
          <p>
            A next-generation rollator experience with soft-touch controls, cloud-enabled guidance, and quiet posture
            support adapted from our care-home pilots.
          </p>
          <ul>
            <li>Integrated handles with haptic cues to coach balance and cadence.</li>
            <li>Seat + frame engineered for at-home therapy sessions and remote check-ins.</li>
            <li>Designed to tuck into living rooms without feeling clinical.</li>
          </ul>
        </div>
      </section>

      <section className="spotlight" id="team">
        <div className="spotlight__body spotlight__body--full">
          <p className="section-title">Our team</p>
          <p className="headline">Sport science meets digital health.</p>
          <p>
            A multidisciplinary crew guides everything we build—ensuring therapy insights, clinical rigor, and joyful
            movement experiences stay at the centre.
          </p>
          <div className="team-list">
            {teamMembers.map((member) => (
              <div key={member.name} className="team-card">
                <img src={member.photo} alt={member.name} />
                <div>
                  <strong>{member.name}</strong>
                  <p className="muted">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="final-cta" id="contact">
        <div className="final-cta__inner">
          <h2>Ready to bring Dawon to your community?</h2>
          <p>
            Equip your home or care facility with CophyFit hardware, HappyAge movement sessions, and remote support—all in
            one calm system.
          </p>
          <div className="final-cta__actions">
            <Link className="pill pill--primary" href="/signup">
              Get started with Dawon
            </Link>
            <Link className="pill pill--ghost" href="/contact">
              Request a care-home pilot
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
