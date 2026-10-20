import { Gift, Timer, TrendingUp, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export type TabId = 'timer' | 'progress' | 'awards' | 'profile' | 'creator';

interface BottomNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
  awardsBadge?: boolean;
  onAwardsSeen?: () => void;
}

const TABS: { id: TabId; label: string; icon: typeof Timer }[] = [
  { id: 'timer', label: 'Таймер', icon: Timer },
  { id: 'progress', label: 'Прогресс', icon: TrendingUp },
  { id: 'awards', label: 'Награды', icon: Gift },
  { id: 'profile', label: 'Профиль', icon: User },
];

export function BottomNav({ active, onChange, awardsBadge, onAwardsSeen }: BottomNavProps) {
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    if (awardsBadge) setShowBadge(true);
  }, [awardsBadge]);

  useEffect(() => {
    if (active === 'awards' && showBadge) {
      setShowBadge(false);
      onAwardsSeen?.();
    }
  }, [active, showBadge, onAwardsSeen]);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200/80 bg-white/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-2xl items-stretch justify-around px-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="group relative flex flex-1 flex-col items-center gap-1 py-3 transition-colors"
            >
              <div
                className={[
                  'relative flex h-9 w-9 items-center justify-center rounded-xl transition-all',
                  isActive
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'text-slate-400 group-hover:text-slate-600',
                ].join(' ')}
              >
                <Icon size={20} />
                {tab.id === 'awards' && showBadge && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-rose-500" />
                  </span>
                )}
              </div>
              <span
                className={[
                  'text-xs font-medium transition-colors',
                  isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600',
                ].join(' ')}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute -top-px h-0.5 w-8 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
