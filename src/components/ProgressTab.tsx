import { useMemo } from 'react';
import { FastingSession, Profile } from '@/lib/supabase';
import {
  calculateSavedCaloriesForSessions,
  calculateTDEE,
  formatHoursShort,
} from '@/lib/fasting';
import { CheckCircle2, Flame, TrendingUp, XCircle } from 'lucide-react';

interface ProgressTabProps {
  history: FastingSession[];
  profile: Profile | null;
}

interface DayData {
  date: string;
  label: string;
  weekday: string;
  completed: boolean;
  partial: boolean;
  hours: number;
}

export function ProgressTab({ history, profile }: ProgressTabProps) {
  // Build last 28 days (4 weeks)
  const calendar = useMemo(() => {
    const days: DayData[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      // Find sessions that started on this day
      const daySessions = history.filter((s) => {
        const sDate = new Date(s.start_time).toISOString().slice(0, 10);
        return sDate === dateStr;
      });

      const completed = daySessions.some((s) => s.completed);
      const totalHours = daySessions.reduce(
        (sum, s) => sum + (s.actual_hours ?? 0),
        0,
      );
      const partial = !completed && totalHours > 0;

      days.push({
        date: dateStr,
        label: d.getDate().toString(),
        weekday: d.toLocaleDateString('ru-RU', { weekday: 'short' }),
        completed,
        partial,
        hours: totalHours,
      });
    }
    return days;
  }, [history]);

  const bodyData = {
    weight_kg: profile?.weight_kg ?? null,
    height_cm: profile?.height_cm ?? null,
    age: profile?.age ?? null,
    gender: profile?.gender ?? null,
  };

  const totalSavedCalories = useMemo(
    () => calculateSavedCaloriesForSessions(bodyData, history),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, profile],
  );

  const tdee = calculateTDEE(bodyData);
  const completedCount = calendar.filter((d) => d.completed).length;
  const partialCount = calendar.filter((d) => d.partial).length;

  const goalWeight = profile?.goal_weight_kg ?? null;
  const currentWeight = profile?.weight_kg ?? null;
  const weightToGoal =
    goalWeight !== null && currentWeight !== null
      ? Math.max(currentWeight - goalWeight, 0)
      : null;
  const weightProgress =
    goalWeight !== null && currentWeight !== null && currentWeight > goalWeight
      ? Math.min(1 - (currentWeight - goalWeight) / currentWeight, 1)
      : goalWeight !== null && currentWeight !== null && currentWeight <= goalWeight
        ? 1
        : null;

  return (
    <div className="space-y-5">
      {/* Calorie savings card */}
      <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg shadow-emerald-500/15">
        <div className="flex items-center gap-2 text-emerald-50/80">
          <Flame size={18} />
          <span className="text-sm font-medium">Сэкономлено калорий</span>
        </div>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-4xl font-bold tabular-nums">
            {totalSavedCalories.toLocaleString('ru-RU')}
          </span>
          <span className="mb-1 text-sm text-emerald-50/70">ккал</span>
        </div>
        <p className="mt-2 text-sm text-emerald-50/70">
          {tdee
            ? `Примерно ${(tdee * 7).toFixed(0)} ккал в неделю при вашем уровне метаболизма`
            : 'Заполните данные в профиле для точного расчёта'}
        </p>
      </div>

      {/* Weight goal card */}
      {goalWeight !== null && currentWeight !== null && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Цель по весу</h3>
            {currentWeight <= goalWeight && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Достигнуто!
              </span>
            )}
          </div>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-xs text-slate-400">Сейчас</p>
              <p className="text-2xl font-bold tabular-nums text-slate-800">{currentWeight} <span className="text-sm font-normal text-slate-400">кг</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Цель</p>
              <p className="text-2xl font-bold tabular-nums text-emerald-600">{goalWeight} <span className="text-sm font-normal text-slate-400">кг</span></p>
            </div>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700"
              style={{ width: `${Math.round((weightProgress ?? 0) * 100)}%` }}
            />
          </div>
          {weightToGoal !== null && weightToGoal > 0 && (
            <p className="mt-2 text-xs text-slate-400">
              Осталось похудеть на <span className="font-semibold text-slate-600">{weightToGoal.toFixed(1)} кг</span>
            </p>
          )}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <MiniStat
          icon={<CheckCircle2 size={18} className="text-emerald-500" />}
          label="Цель достигнута"
          value={String(completedCount)}
        />
        <MiniStat
          icon={<XCircle size={18} className="text-amber-500" />}
          label="Частично"
          value={String(partialCount)}
        />
        <MiniStat
          icon={<TrendingUp size={18} className="text-sky-500" />}
          label="Всего дней"
          value={String(completedCount + partialCount)}
        />
      </div>

      {/* Calendar chart */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h3 className="mb-1 text-sm font-bold text-slate-800">Последние 4 недели</h3>
        <p className="mb-4 text-xs text-slate-400">Дни с голоданием</p>

        <div className="grid grid-cols-7 gap-1.5">
          {calendar.map((day, i) => {
            const colStart = i % 7;
            return (
              <div key={day.date} className="flex flex-col items-center gap-1">
                {colStart === 0 && null}
                <div
                  className={[
                    'flex h-10 w-full items-center justify-center rounded-lg text-xs font-medium transition-all',
                    day.completed
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                      : day.partial
                        ? 'bg-amber-200 text-amber-700'
                        : 'bg-slate-100 text-slate-300',
                  ].join(' ')}
                  title={
                    day.completed || day.partial
                      ? `${day.date}: ${formatHoursShort(day.hours)}`
                      : day.date
                  }
                >
                  {day.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-emerald-500" /> Цель достигнута
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-amber-200" /> Частично
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-slate-100" /> Нет голодания
          </div>
        </div>
      </div>

      {/* Recent sessions */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-slate-800">Недавние сессии</h3>
        {history.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            Пока нет завершённых сессий
          </p>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 6).map((s) => {
              const actual = s.actual_hours ?? 0;
              const target = s.target_hours;
              const pct = Math.min((actual / target) * 100, 100);
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                >
                  <div
                    className={[
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                      s.completed
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-amber-100 text-amber-600',
                    ].join(' ')}
                  >
                    {s.completed ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        {s.protocol}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(s.start_time).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={[
                          'h-full rounded-full',
                          s.completed ? 'bg-emerald-500' : 'bg-amber-400',
                        ].join(' ')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="mt-0.5 block text-xs text-slate-400">
                      {formatHoursShort(actual)} из {formatHoursShort(target)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 text-center shadow-sm">
      <div className="mb-1 flex justify-center">{icon}</div>
      <div className="text-lg font-bold tabular-nums text-slate-800">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
