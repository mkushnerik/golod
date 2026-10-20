import {
  Flame,
  Heart,
  Leaf,
  Shield,
  SlidersHorizontal,
  Moon,
  Sparkles,
  Sun,
} from 'lucide-react';
import { PROTOCOLS, Protocol } from '@/lib/fasting';

interface ProtocolSelectorProps {
  selected: string;
  onSelect: (protocol: Protocol) => void;
  onCustom: () => void;
  disabled?: boolean;
}

// One entry per protocol in sorted order (index 0 = easiest, 6 = hardest)
const SPECTRUM = [
  {
    inactive: 'border-emerald-200 bg-white/80 hover:border-emerald-300 hover:bg-emerald-50/40',
    active: 'border-emerald-400 bg-emerald-50 shadow-md shadow-emerald-100',
    dot: 'bg-emerald-400',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    hours: 'text-emerald-600',
  },
  {
    inactive: 'border-green-200 bg-white/80 hover:border-green-300 hover:bg-green-50/40',
    active: 'border-green-400 bg-green-50 shadow-md shadow-green-100',
    dot: 'bg-green-400',
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
    hours: 'text-green-600',
  },
  {
    inactive: 'border-lime-200 bg-white/80 hover:border-lime-300 hover:bg-lime-50/40',
    active: 'border-lime-400 bg-lime-50 shadow-md shadow-lime-100',
    dot: 'bg-lime-400',
    iconBg: 'bg-lime-100',
    iconText: 'text-lime-700',
    hours: 'text-lime-700',
  },
  {
    inactive: 'border-yellow-200 bg-white/80 hover:border-yellow-300 hover:bg-yellow-50/40',
    active: 'border-yellow-400 bg-yellow-50 shadow-md shadow-yellow-100',
    dot: 'bg-yellow-400',
    iconBg: 'bg-yellow-100',
    iconText: 'text-yellow-700',
    hours: 'text-yellow-700',
  },
  {
    inactive: 'border-orange-200 bg-white/80 hover:border-orange-300 hover:bg-orange-50/40',
    active: 'border-orange-400 bg-orange-50 shadow-md shadow-orange-100',
    dot: 'bg-orange-400',
    iconBg: 'bg-orange-100',
    iconText: 'text-orange-600',
    hours: 'text-orange-600',
  },
  {
    inactive: 'border-red-200 bg-white/80 hover:border-red-300 hover:bg-red-50/40',
    active: 'border-red-400 bg-red-50 shadow-md shadow-red-100',
    dot: 'bg-red-400',
    iconBg: 'bg-red-100',
    iconText: 'text-red-600',
    hours: 'text-red-600',
  },
  {
    inactive: 'border-rose-300 bg-white/80 hover:border-rose-400 hover:bg-rose-50/40',
    active: 'border-rose-500 bg-rose-50 shadow-md shadow-rose-200',
    dot: 'bg-rose-500',
    iconBg: 'bg-rose-100',
    iconText: 'text-rose-700',
    hours: 'text-rose-700',
  },
];

const icons = {
  leaf: Leaf,
  sun: Sun,
  flame: Flame,
  sparkles: Sparkles,
  shield: Shield,
  moon: Moon,
  heart: Heart,
  sliders: SlidersHorizontal,
};

export function ProtocolSelector({ selected, onSelect, onCustom, disabled }: ProtocolSelectorProps) {
  return (
    <div className="space-y-3">
      {/* Spectrum scale legend */}
      <div className="flex items-center gap-2 px-0.5">
        <span className="shrink-0 text-xs text-slate-400">легче</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-rose-500" />
        <span className="shrink-0 text-xs text-slate-400">сложнее</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PROTOCOLS.map((protocol, index) => {
          const colors = SPECTRUM[index] ?? SPECTRUM[0];
          const Icon = icons[protocol.icon];
          const isActive = protocol.id === selected;
          return (
            <button
              key={protocol.id}
              disabled={disabled}
              onClick={() => onSelect(protocol)}
              className={[
                'flex min-h-[170px] flex-col rounded-2xl border-2 p-4 text-left transition-all duration-200',
                'disabled:cursor-not-allowed disabled:opacity-40',
                isActive ? colors.active : colors.inactive,
              ].join(' ')}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className={[
                  'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
                  isActive ? `${colors.iconBg} ${colors.iconText}` : 'bg-slate-100 text-slate-400',
                ].join(' ')}>
                  <Icon size={18} />
                </span>
                <span className={`h-2.5 w-2.5 rounded-full ${colors.dot} opacity-80`} />
              </div>
              <span className="block text-base font-bold tracking-tight text-slate-800">
                {protocol.label}
              </span>
              <span className="mt-1 block min-h-[2.25rem] text-xs leading-snug text-slate-500">
                {protocol.description}
              </span>
              <span className={[
                'mt-auto block pt-2 text-xs font-semibold transition-colors',
                isActive ? colors.hours : 'text-slate-400',
              ].join(' ')}>
                {protocol.hours} ч голодания
              </span>
            </button>
          );
        })}

        {/* Custom protocol button */}
        <button
          type="button"
          disabled={disabled}
          onClick={onCustom}
          className={[
            'flex min-h-[170px] flex-col rounded-2xl border-2 p-4 text-left transition-all duration-200',
            'disabled:cursor-not-allowed disabled:opacity-40',
            selected === 'custom'
              ? 'border-teal-300 bg-teal-50 shadow-md shadow-teal-100'
              : 'border-dashed border-slate-300 bg-white/80 hover:border-slate-400 hover:bg-white',
          ].join(' ')}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className={[
              'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
              selected === 'custom' ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400',
            ].join(' ')}>
              <SlidersHorizontal size={18} />
            </span>
            <span className="h-2.5 w-2.5 rounded-full bg-teal-400 opacity-80" />
          </div>
          <span className="block text-base font-bold tracking-tight text-slate-800">Свой режим</span>
          <span className="mt-1 block min-h-[2.25rem] text-xs leading-snug text-slate-500">
            Настрой длительность вручную
          </span>
        </button>
      </div>
    </div>
  );
}
