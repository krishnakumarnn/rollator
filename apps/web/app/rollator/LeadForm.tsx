'use client';

import { useState } from 'react';

export default function LeadForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<null | 'ok' | 'err'>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    try {
      // TODO: replace with your real endpoint or a Next API route
      // For now we just simulate success
      await new Promise((r) => setTimeout(r, 400));
      setStatus('ok');
      setEmail('');
    } catch {
      setStatus('err');
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2 items-center">
      <input
        type="email"
        required
        value={email}
        placeholder="Your email"
        onChange={(e) => setEmail(e.target.value)}
        className="border rounded-lg px-3 py-2 w-[260px]"
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90"
      >
        Subscribe
      </button>
      {status === 'ok' && <span className="text-green-600 text-sm">Thanks! 🎉</span>}
      {status === 'err' && <span className="text-red-600 text-sm">Try again.</span>}
    </form>
  );
}
