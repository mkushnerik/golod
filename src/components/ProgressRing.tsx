import { ReactNode } from 'react';

type RingPhase = 'start' | 'mid' | 'near' | 'done';

function getPhase(progress: number): RingPhase {
  if (progress >= 1) return 'done';
  if (progress >= 0.75) return 'near';
  if (progress >= 0.4) return 'mid';
  return 'start';
}

const GRADIENTS: Record<RingPhase, [string, string, string]> = {
  start:  ['#38bdf8', '#0ea5e9', '#0284c7'],
  mid:    ['#10b981', '#14b8a6', '#0d9488'],
  near:   ['#f59e0b', '#f97316', '#ef4444'],
  done:   ['#22c55e', '#16a34a', '#15803d'],
};

interface ProgressRingProps {
  progress: number; // 0–1
  size?: number;
  stroke?: number;
  children?: ReactNode;
}

export function ProgressRing({ progress, size = 280, stroke = 12, children }: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 1);
  const offset = circumference * (1 - clamped);
  const phase = getPhase(progress);
  const [c0, c1, c2] = GRADIENTS[phase];
  const gradId = `ring-${phase}`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c0} />
            <stop offset="50%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-slate-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s ease-out, stroke 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
