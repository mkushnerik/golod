import { useEffect, useMemo, useState } from 'react';
import { Difficulty } from '@/lib/fasting';

type ThemeKey = Difficulty | 'neutral';

interface Theme {
  background: string;
  emojis: string[];
  count: number;
}

const THEMES: Record<ThemeKey, Theme> = {
  neutral: {
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
    emojis: [],
    count: 0,
  },
  easy: {
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 35%, #d1fae5 65%, #ccfbf1 100%)',
    emojis: ['🌸', '🌼', '🌺', '🌻', '🍀', '🌷', '🌱', '🦋'],
    count: 13,
  },
  steady: {
    background: 'linear-gradient(135deg, #f7fee7 0%, #ecfccb 35%, #fef9c3 65%, #fef3c7 100%)',
    emojis: ['🍃', '🌿', '🌾', '🍂', '🌱', '🍀'],
    count: 9,
  },
  advanced: {
    background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 35%, #fed7aa 65%, #fde68a 100%)',
    emojis: ['✨', '⚡', '💫', '🌟', '⭐'],
    count: 9,
  },
  challenge: {
    background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 20%, #fecdd3 40%, #fca5a5 70%, #f87171 100%)',
    emojis: ['🔥', '🔥', '🔥', '💥', '⚡', '🌋', '🔥'],
    count: 18,
  },
};

interface ParticleConfig {
  id: number;
  emoji: string;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  rotate: number;
}

function buildParticles(theme: Theme): ParticleConfig[] {
  if (!theme.emojis.length) return [];
  return Array.from({ length: theme.count }, (_, i) => ({
    id: i,
    emoji: theme.emojis[i % theme.emojis.length],
    left: Math.round((i * 13.7 + 3) % 94),
    size: 1.0 + (i % 4) * 0.3,
    duration: 5 + (i % 6) * 1.3,
    delay: -(i * 1.4) % 10,
    drift: ((i % 9) - 4) * 28,
    rotate: ((i % 2) === 0 ? 1 : -1) * (90 + (i % 4) * 50),
  }));
}

interface ProtocolBackgroundProps {
  difficulty: Difficulty | null;
}

export function ProtocolBackground({ difficulty }: ProtocolBackgroundProps) {
  const targetKey: ThemeKey = difficulty ?? 'neutral';
  const [visibleKey, setVisibleKey] = useState<ThemeKey>(targetKey);
  const [particleOpacity, setParticleOpacity] = useState(1);

  useEffect(() => {
    if (visibleKey === targetKey) return;
    setParticleOpacity(0);
    const t = setTimeout(() => {
      setVisibleKey(targetKey);
      setParticleOpacity(1);
    }, 350);
    return () => clearTimeout(t);
  }, [targetKey, visibleKey]);

  const theme = THEMES[visibleKey];
  const particles = useMemo(() => buildParticles(theme), [theme]);

  return (
    <div
      className="fixed inset-0 -z-10"
      style={{
        background: THEMES[targetKey].background,
        transition: 'background 0.9s ease-in-out',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          opacity: particleOpacity,
          transition: 'opacity 0.35s ease',
        }}
      >
        {particles.map((p) => (
          <span
            key={p.id}
            className="pointer-events-none absolute select-none"
            style={{
              left: `${p.left}%`,
              bottom: '-60px',
              fontSize: `${p.size}em`,
              animation: `float-particle ${p.duration}s ${p.delay}s linear infinite`,
              '--drift': `${p.drift}px`,
              '--rotate': `${p.rotate}deg`,
            } as React.CSSProperties}
          >
            {p.emoji}
          </span>
        ))}
      </div>
    </div>
  );
}
