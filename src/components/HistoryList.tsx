import { FastingSession } from '@/lib/supabase';
import { formatHoursShort } from '@/lib/fasting';
import { CheckCircle2, Clock, Trash2, XCircle } from 'lucide-react';

interface HistoryListProps {
  history: FastingSession[];
  loading: boolean;
  onDelete: (id: string) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function HistoryList({ history, loading, onDelete }: HistoryListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-2xl bg-slate-100"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <p className="text-sm text-slate-400">
          Здесь пока пусто. Начни первое голодание выше!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((session) => {
        const target = session.target_hours;
        const actual = session.actual_hours ?? 0;
        const pct = Math.min((actual / target) * 100, 100);

        return (
          <div
            key={session.id}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 transition-colors hover:border-slate-300"
          >
            <div
              className={[
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                session.completed
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-amber-100 text-amber-600',
              ].join(' ')}
            >
              {session.completed ? (
                <CheckCircle2 size={20} />
              ) : (
                <XCircle size={20} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-semibold text-slate-700">
                  {session.protocol}
                </span>
                <span className="shrink-0 text-xs text-slate-400">
                  {formatDate(session.start_time)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={[
                      'h-full rounded-full transition-all',
                      session.completed ? 'bg-emerald-500' : 'bg-amber-400',
                    ].join(' ')}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="flex shrink-0 items-center gap-1 text-xs text-slate-400">
                  <Clock size={12} />
                  {formatHoursShort(actual)} / {formatHoursShort(target)}
                </span>
              </div>
            </div>

            <button
              onClick={() => onDelete(session.id)}
              className="shrink-0 rounded-lg p-2 text-slate-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-400 group-hover:opacity-100"
              aria-label="Удалить запись"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
