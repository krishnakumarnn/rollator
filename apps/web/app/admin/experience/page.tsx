import ExperienceMediaForm from './ExperienceMediaForm';
import { getJSON } from '../../lib/api';

async function loadMedia() {
  try {
    return await getJSON<{ key: string; dataUrl: string; alt?: string }>('experience/media/rollator-hero');
  } catch {
    return null;
  }
}

export default async function ExperienceAdminPage() {
  const media = await loadMedia();
  return (
    <div className="stack">
      <div>
        <h1 style={{ marginTop: 0 }}>Experience media</h1>
        <p className="muted" style={{ maxWidth: 520 }}>
          Update the hero imagery that appears on the Rollator experience page. Upload a JPEG or PNG up to 5&nbsp;MB.
        </p>
      </div>
      <ExperienceMediaForm initialMedia={media} />
    </div>
  );
}
