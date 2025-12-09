'use client';
import { useState, useEffect } from 'react';

export default function QtyPicker({
  value = 1,
  min = 1,
  max = 99,
  onChange,
  compact = false
}: {
  value?: number; min?: number; max?: number;
  onChange?: (q: number) => void;
  compact?: boolean;
}) {
  const [q, setQ] = useState(value);
  useEffect(() => setQ(value), [value]);

  const set = (n: number) => {
    const v = Math.max(min, Math.min(max, Math.round(n || 0)));
    setQ(v);
    onChange?.(v);
  };

  const btnStyle: React.CSSProperties = compact
    ? { padding:'6px 10px', border:'1px solid #ddd', borderRadius:8, background:'#fff' }
    : { padding:'8px 12px', border:'1px solid #ddd', borderRadius:8, background:'#fff' };

  return (
    <div style={{display:'inline-flex', alignItems:'center', gap:8}}>
      <button type="button" onClick={() => set(q - 1)} disabled={q <= min} style={btnStyle}>−</button>
      <input
        type="number"
        value={q}
        onChange={e => set(parseInt(e.target.value, 10))}
        min={min}
        max={max}
        style={{ width: compact ? 52 : 64, textAlign:'center', padding:'8px 6px', border:'1px solid #ddd', borderRadius:8 }}
      />
      <button type="button" onClick={() => set(q + 1)} disabled={q >= max} style={btnStyle}>+</button>
    </div>
  );
}
