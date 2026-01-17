'use client';

import { useState, useEffect } from 'react';

interface Reklam {
  id: number;
  ad: string;
  icerik: string;
}

interface ReklamWidgetProps {
  konum: 'header' | 'sidebar' | 'content' | 'footer';
  className?: string;
}

export default function ReklamWidget({ konum, className = '' }: ReklamWidgetProps) {
  const [reklamlar, setReklamlar] = useState<Reklam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReklamlar = async () => {
      try {
        const res = await fetch(`/api/reklamlar?konum=${konum}`);
        const data = await res.json();
        setReklamlar(data);
      } catch {
        console.error('Reklamlar yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    fetchReklamlar();
  }, [konum]);

  if (loading || reklamlar.length === 0) {
    return null;
  }

  return (
    <div className={`reklam-widget reklam-${konum} ${className}`}>
      {reklamlar.map((reklam) => (
        <div
          key={reklam.id}
          className="reklam-item"
          dangerouslySetInnerHTML={{ __html: reklam.icerik }}
        />
      ))}
    </div>
  );
}
