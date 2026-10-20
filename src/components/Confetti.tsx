import { useEffect, useRef, useState } from 'react';

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotSpeed: number;
}

const COLORS = ['#10b981', '#14b8a6', '#f59e0b', '#f97316', '#22c55e', '#0ea5e9'];

function makeParticle(id: number): ConfettiParticle {
  return {
    id,
    x: Math.random() * 100,
    y: -10,
    vx: (Math.random() - 0.5) * 2,
    vy: 2 + Math.random() * 3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 8,
  };
}

export function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const raf = useRef<number | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    let nextId = 0;
    const initial: ConfettiParticle[] = Array.from({ length: 60 }, () => makeParticle(nextId++));
    setParticles(initial);

    const animate = () => {
      frameRef.current += 1;

      setParticles((prev) => {
        let updated = prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.12,
            rotation: p.rotation + p.rotSpeed,
          }))
          .filter((p) => p.y < 115);

        // Sprinkle more for first 40 frames
        if (frameRef.current < 40 && frameRef.current % 4 === 0) {
          updated = [...updated, ...Array.from({ length: 6 }, () => makeParticle(nextId++))];
        }

        return updated;
      });

      if (frameRef.current < 200) {
        raf.current = requestAnimationFrame(animate);
      }
    };

    raf.current = requestAnimationFrame(animate);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      frameRef.current = 0;
    };
  }, [active]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size * 0.5,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            opacity: Math.max(0, 1 - p.y / 110),
          }}
        />
      ))}
    </div>
  );
}
