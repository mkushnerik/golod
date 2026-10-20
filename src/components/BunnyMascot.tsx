import { useEffect, useState } from 'react';
import { MASCOT_IMAGE } from '@/lib/mascot';

interface BunnyMascotProps {
  progress: number;
  message: string;
  visible: boolean;
}

export function BunnyMascot({ progress, message, visible }: BunnyMascotProps) {
  const [show, setShow] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [pose] = useState(() => Math.floor(Math.random() * 3));

  useEffect(() => {
    if (!visible) {
      setShow(false);
      return;
    }
    setCurrentMessage(message);
    setShow(true);
    const timer = window.setTimeout(() => setShow(false), 6000);
    return () => window.clearTimeout(timer);
  }, [visible, message]);

  if (!visible) return null;

  const slimmerScale = 0.92 + progress * 0.08;

  return (
    <div
      className={[
        'pointer-events-none fixed bottom-24 right-2 z-40 sm:right-6',
        'transition-all duration-500',
        show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
      ].join(' ')}
    >
      <div className="flex items-end gap-3">
        <div
          className={[
            'relative max-w-[220px] rounded-2xl bg-white px-4 py-3 text-sm shadow-xl transition-all',
            show ? 'scale-100' : 'scale-90',
          ].join(' ')}
        >
          <p className="leading-snug text-slate-700">{currentMessage}</p>
          <div className="absolute -bottom-2 right-8 h-4 w-4 rotate-45 bg-white" />
        </div>
        <img
          src={MASCOT_IMAGE}
          alt="Кролик Крош поддерживает тебя"
          className="h-28 w-28 object-contain drop-shadow-lg transition-transform duration-700 sm:h-32 sm:w-32"
          style={{
            transform: `${pose === 0 ? 'rotate(-5deg)' : pose === 1 ? 'rotate(4deg) scaleX(-1)' : 'rotate(2deg)'} scale(${slimmerScale})`,
          }}
        />
      </div>
    </div>
  );
}

export function BunnyHero({ size = 160 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <img
        src={MASCOT_IMAGE}
        alt="Кролик Крош показывает класс"
        width={size}
        height={size}
        className="object-contain drop-shadow-xl"
      />
    </div>
  );
}

