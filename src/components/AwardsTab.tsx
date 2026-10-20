import { LockKeyhole, Trophy } from 'lucide-react';
import { MASCOT_IMAGE } from '@/lib/mascot';

interface AwardsTabProps {
  completedCount: number;
}

const AWARDS = [
  { count: 1, title: 'Первая морковка', description: 'Первое завершённое голодание', tone: 'from-amber-200 to-orange-300' },
  { count: 3, title: 'Ровный ритм', description: 'Три завершённых голодания', tone: 'from-amber-300 to-orange-400' },
  { count: 5, title: 'Сила привычки', description: 'Пять завершённых голоданий', tone: 'from-orange-300 to-rose-400' },
  { count: 10, title: 'Золотая морковка', description: 'Десять завершённых голоданий', tone: 'from-yellow-300 to-amber-500' },
  { count: 25, title: 'Мастер ритма', description: 'Двадцать пять завершённых голоданий', tone: 'from-sky-300 to-emerald-500' },
  { count: 50, title: 'Легенда Кроша', description: 'Пятьдесят завершённых голоданий', tone: 'from-emerald-300 to-teal-600' },
];

export function AwardsTab({ completedCount }: AwardsTabProps) {
  const earned = AWARDS.filter((award) => completedCount >= award.count).length;
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[2rem] border border-emerald-200 bg-emerald-50/95 p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <img src={MASCOT_IMAGE} alt="Крош с морковкой" className="h-24 w-24 object-contain drop-shadow-lg" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Коллекция Кроша</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-800">Морковки за ритм</h2>
            <p className="mt-1 text-sm text-slate-600">{earned} из {AWARDS.length} наград открыто</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {AWARDS.map((award) => {
          const unlocked = completedCount >= award.count;
          return (
            <article key={award.count} className={`relative overflow-hidden rounded-3xl border p-4 shadow-sm transition-transform hover:-translate-y-1 ${unlocked ? 'border-amber-200 bg-white' : 'border-slate-200 bg-slate-100/80'}`}>
              <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${unlocked ? award.tone : 'from-slate-200 to-slate-300'}`}>
                {unlocked ? <img src={MASCOT_IMAGE} alt="" className="h-16 w-16 object-contain" /> : <LockKeyhole size={24} className="text-slate-400" />}
              </div>
              <div className="mt-3 text-center">
                <p className="text-sm font-bold text-slate-800">{award.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{award.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500"><Trophy size={12} /> {award.count}</span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
