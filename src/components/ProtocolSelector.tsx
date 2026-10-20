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

const difficultyStyles = {
  easy: 'border-emerald-200 bg-emerald-50/80 text-emerald-700',
  steady: 'border-sky-200 bg-sky-50/80 text-sky-700',
  advanced: 'border-amber-200 bg-amber-50/80 text-amber-700',
  challenge: 'border-rose-200 bg-rose-50/80 text-rose-700',
};

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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {PROTOCOLS.map((protocol) => {
        const Icon = icons[protocol.icon];
        const isActive = protocol.id === selected;
        return (
          <button
            key={protocol.id}
            disabled={disabled}
            onClick={() => onSelect(protocol)}
            className={[
              'flex min-h-[170px] flex-col rounded-2xl border p-4 text-left transition-all duration-200',
              'disabled:cursor-not-allowed disabled:opacity-40',
              isActive
                ? `${difficultyStyles[protocol.difficulty]} shadow-md`
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
            ].join(' ')}
          >
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 shadow-sm">
              <Icon size={18} />
            </span>
            <span className="block text-lg font-bold tracking-tight text-slate-800">{protocol.label}</span>
            <span className="mt-1 min-h-[2.25rem] block text-xs leading-snug text-slate-500">{protocol.description}</span>
            <span className="mt-auto pt-2 block text-xs font-semibold text-slate-500">{protocol.hours} ч голодания</span>
          </button>
        );
      })}
      <button
        type="button"
        disabled={disabled}
        onClick={onCustom}
        className={[
          'flex min-h-[170px] flex-col rounded-2xl border p-4 text-left transition-all duration-200',
          'disabled:cursor-not-allowed disabled:opacity-40',
          selected === 'custom'
            ? 'border-teal-200 bg-teal-50/80 text-teal-700 shadow-md'
            : 'border-dashed border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-white',
        ].join(' ')}
      >
        <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 shadow-sm">
          <SlidersHorizontal size={18} />
        </span>
        <span className="block text-lg font-bold tracking-tight text-slate-800">Свой режим</span>
        <span className="mt-1 block text-xs leading-snug text-slate-500">Настрой длительность вручную</span>
      </button>
    </div>
  );
}
