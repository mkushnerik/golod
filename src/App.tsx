import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Bell,
  Moon,
  Sun,
  Timer,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFasting } from '@/hooks/useFasting';
import { useFastingReminders } from '@/hooks/useFastingReminders';
import { useProfile } from '@/hooks/useProfile';
import { useLiveActivity } from '@/hooks/useLiveActivity';
import { ProgressRing } from '@/components/ProgressRing';
import { ProtocolSelector } from '@/components/ProtocolSelector';
import { HistoryList } from '@/components/HistoryList';
import { BunnyMascot } from '@/components/BunnyMascot';
import { MASCOT_IMAGE } from '@/lib/mascot';
import { Onboarding } from '@/components/Onboarding';
import { BottomNav, TabId } from '@/components/BottomNav';
import { ProgressTab } from '@/components/ProgressTab';
import { ProfileTab } from '@/components/ProfileTab';
import { AwardsTab } from '@/components/AwardsTab';
import { CreatorTab } from '@/components/CreatorTab';
import { ProtocolBackground } from '@/components/ProtocolBackground';
import {
  PROTOCOLS,
  Protocol,
  formatDuration,
  formatHoursShort,
  getHourlyFact,
  getMessageForProgress,
} from '@/lib/fasting';

function App() {
  const auth = useAuth();
  const fasting = useFasting(auth.userId);
  const profileHook = useProfile(auth.userId);
  const liveActivity = useLiveActivity({
    active: fasting.active,
    protocol: fasting.protocol,
    targetHours: fasting.targetHours,
    startTime: fasting.startTime,
    elapsedMs: fasting.elapsedMs,
    progress: fasting.progress,
  });
  const [activeTab, setActiveTab] = useState<TabId>('timer');
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol>(
    PROTOCOLS.find((p) => p.id === '16:8') ?? PROTOCOLS[2],
  );
  const [customHours, setCustomHours] = useState(10);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [mascotMessage, setMascotMessage] = useState('');
  const [mascotVisible, setMascotVisible] = useState(false);

  useFastingReminders(fasting.active, fasting.history);

  // Motivational message
  const currentMessage = useMemo(() => {
    if (!fasting.active) return '';
    return getMessageForProgress(fasting.progress);
  }, [fasting.active, fasting.progress]);

  // Mascot pop-up logic
  useEffect(() => {
    if (!fasting.active) {
      setMascotVisible(false);
      return;
    }
    setMascotMessage(currentMessage);
    setMascotVisible(true);

    const interval = window.setInterval(() => {
      const msgs = getMessageForProgress(fasting.progress);
      setMascotMessage(msgs);
      setMascotVisible(true);
    }, 45000);

    return () => window.clearInterval(interval);
  }, [fasting.active, currentMessage, fasting.progress]);

  // Stats
  const stats = useMemo(() => {
    const completed = fasting.history.filter((s) => s.completed).length;
    const totalHours = fasting.history.reduce(
      (sum, s) => sum + (s.actual_hours ?? 0),
      0,
    );
    const longest = fasting.history.reduce(
      (max, s) => Math.max(max, s.actual_hours ?? 0),
      0,
    );
    return { completed, totalHours, longest };
  }, [fasting.history]);

  const remainingMs = fasting.active
    ? Math.max(fasting.targetHours * 3600_000 - fasting.elapsedMs, 0)
    : 0;

  const handleStart = async () => {
    if (fasting.active) return;
    await liveActivity.startLiveActivity();
    const started = await fasting.startFast(selectedProtocol.id, selectedProtocol.hours);
    if (!started) liveActivity.stopLiveActivity();
  };
  const handleFinish = (completed: boolean) => {
    liveActivity.stopLiveActivity();
    fasting.finishFast(completed);
    setShowFinishConfirm(false);
  };

  // Loading state while checking auth
  if (!auth.ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500">
          <img src={MASCOT_IMAGE} alt="Крош" className="h-full w-full object-cover" />
        </div>
      </div>
    );
  }

  // Not authenticated → show onboarding
  if (!auth.isAuthenticated) {
    return (
      <Onboarding
        onSignUp={auth.signUp}
        onSignIn={auth.signIn}
      />
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-800">
      <ProtocolBackground difficulty={activeTab === 'timer' ? selectedProtocol.difficulty : null} />

      <div className="relative z-10 mx-auto max-w-2xl px-5 pb-28 pt-8 sm:pt-12">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20">
              <img src={MASCOT_IMAGE} alt="Крош" className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-800">ФастТрек</h1>
              <p className="text-xs text-slate-400">Таймер интервального голодания</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs text-slate-500 shadow-sm">
            {new Date().getHours() < 20 && new Date().getHours() >= 6 ? (
              <>
                <Sun size={14} className="text-amber-400" /> День
              </>
            ) : (
              <>
                <Moon size={14} className="text-indigo-400" /> Ночь
              </>
            )}
          </div>
        </header>

        {fasting.active && (
          <section className="mb-6 rounded-3xl border border-amber-200 bg-amber-50/95 px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Час {Math.floor(fasting.elapsedMs / 3600000) + 1}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">{getHourlyFact(fasting.elapsedMs / 3600000)}</p>
          </section>
        )}

        {/* Tab content */}
        {activeTab === 'timer' && (
          <>
            {/* Timer card */}
            <section className="mb-6">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                {fasting.active ? (
                  <ActiveTimer
                    elapsedMs={fasting.elapsedMs}
                    progress={fasting.progress}
                    protocol={fasting.protocol}
                    targetHours={fasting.targetHours}
                    remainingMs={remainingMs}
                    message={currentMessage}
                    onFinish={() => setShowFinishConfirm(true)}
                  />
                ) : (
                  <IdleTimer
                    selectedProtocol={selectedProtocol}
                    onSelect={setSelectedProtocol}
                    onStart={handleStart}
                    onCustom={() => setSelectedProtocol({ id: 'custom', label: 'Свой режим', hours: customHours, description: 'Твоя персональная длительность', difficulty: 'steady', icon: 'sliders' })}
                    customHours={customHours}
                    onCustomHours={(hours) => {
                      setCustomHours(hours);
                      if (selectedProtocol.id === 'custom') {
                        setSelectedProtocol({ id: 'custom', label: 'Свой режим', hours, description: 'Твоя персональная длительность', difficulty: 'steady', icon: 'sliders' });
                      }
                    }}
                  />
                )}
              </div>
            </section>

            {/* Stats */}
            <section className="mb-6 grid grid-cols-3 gap-3">
              <StatCard
                icon={<Activity size={18} />}
                label="Завершено"
                value={String(stats.completed)}
                tint="emerald"
              />
              <StatCard
                icon={<Zap size={18} />}
                label="Всего часов"
                value={formatHoursShort(stats.totalHours)}
                tint="teal"
              />
              <StatCard
                icon={<Timer size={18} />}
                label="Рекорд"
                value={stats.longest > 0 ? formatHoursShort(stats.longest) : '—'}
                tint="sky"
              />
            </section>

            {/* History */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-700">История</h2>
                {fasting.history.length > 0 && (
                  <span className="text-xs text-slate-400">
                    {fasting.history.length}{' '}
                    {fasting.history.length === 1
                      ? 'сессия'
                      : fasting.history.length < 5
                        ? 'сессии'
                        : 'сессий'}
                  </span>
                )}
              </div>
              <HistoryList
                history={fasting.history}
                loading={fasting.historyLoading}
                onDelete={fasting.deleteSession}
              />
            </section>
          </>
        )}

        {activeTab === 'progress' && (
          <ProgressTab history={fasting.history} profile={profileHook.profile} />
        )}

        {activeTab === 'awards' && <AwardsTab completedCount={stats.completed} />}

        {activeTab === 'creator' && <CreatorTab />}

        {activeTab === 'profile' && (
          <ProfileTab
            profile={profileHook.profile}
            profileLoading={profileHook.loading}
            userId={auth.userId}
            email={auth.email}
            onUpdateProfile={profileHook.updateProfile}
            onSignOut={auth.signOut}
            onOpenCreator={() => setActiveTab('creator')}
          />
        )}
      </div>

      {/* Bunny mascot */}
      <BunnyMascot
        progress={fasting.progress}
        message={mascotMessage}
        visible={mascotVisible}
      />

      {/* Finish confirmation modal */}
      {showFinishConfirm && (
        <FinishModal
          protocol={fasting.protocol}
          elapsedMs={fasting.elapsedMs}
          targetHours={fasting.targetHours}
          onCompleted={() => handleFinish(true)}
          onStopped={() => handleFinish(false)}
          onCancel={() => setShowFinishConfirm(false)}
        />
      )}

      {/* Bottom navigation */}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}

/* ---- Active Timer ---- */

interface ActiveTimerProps {
  elapsedMs: number;
  progress: number;
  protocol: string;
  targetHours: number;
  remainingMs: number;
  message: string;
  onFinish: () => void;
}

function ActiveTimer({
  elapsedMs,
  progress,
  protocol,
  targetHours,
  remainingMs,
  message,
  onFinish,
}: ActiveTimerProps) {
  const completed = progress >= 1;

  return (
    <div className="flex flex-col items-center">
      <div className="mb-1 flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="text-xs font-medium text-emerald-700">Голодание · {protocol}</span>
      </div>

      <div className="my-5">
        <ProgressRing progress={progress} size={264} stroke={14}>
          <span className="text-xs uppercase tracking-widest text-slate-400">
            {completed ? 'Готово' : 'Прошло'}
          </span>
          <span className="mt-1 font-mono text-3xl font-bold tabular-nums tracking-tight text-slate-800 sm:text-4xl">
            {formatDuration(elapsedMs)}
          </span>
          <span className="mt-2 text-xs text-slate-400">
            {completed
              ? 'Цель достигнута!'
              : `${formatDuration(remainingMs)} осталось`}
          </span>
        </ProgressRing>
      </div>

      {/* Progress bar */}
      <div className="mb-5 w-full max-w-xs">
        <div className="mb-1.5 flex justify-between text-xs text-slate-400">
          <span>0 ч</span>
          <span>{formatHoursShort(targetHours)}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000 ease-out"
            style={{ width: `${Math.max(progress * 100, 2)}%` }}
          />
        </div>
      </div>

      {/* Motivational message */}
      <div className="mb-6 min-h-[3rem] w-full rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-center">
        <p className="text-sm leading-relaxed text-slate-600">
          {completed ? 'Потрясающе — ты достиг цели!' : message}
        </p>
      </div>

      <button
        onClick={onFinish}
        className="w-full rounded-2xl bg-slate-100 px-6 py-3.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-200 active:scale-[0.98]"
      >
        Завершить голодание
      </button>
    </div>
  );
}

/* ---- Idle Timer ---- */

interface IdleTimerProps {
  selectedProtocol: Protocol;
  onSelect: (p: Protocol) => void;
  onStart: () => void;
  onCustom: () => void;
  customHours: number;
  onCustomHours: (hours: number) => void;
}

function IdleTimer({ selectedProtocol, onSelect, onStart, onCustom, customHours, onCustomHours }: IdleTimerProps) {
  return (
    <div>
      <div className="mb-5 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
          <Timer size={28} className="text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800">Готов голодать?</h2>
        <p className="mt-1 text-sm text-slate-400">
          Выбери режим и запусти таймер
        </p>
      </div>

      <div className="mb-5">
        <ProtocolSelector
          selected={selectedProtocol.id}
          onSelect={onSelect}
          onCustom={onCustom}
        />
      </div>

      {selectedProtocol.id === 'custom' && (
        <div className="mb-4 rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
          <label className="mb-2 block text-xs font-semibold text-teal-800">Длительность голодания: {customHours} ч</label>
          <input type="range" min="1" max="72" value={customHours} onChange={(event) => onCustomHours(Number(event.target.value))} className="w-full accent-teal-500" />
          <div className="mt-1 flex justify-between text-[11px] text-teal-600"><span>1 ч</span><span>72 ч</span></div>
        </div>
      )}

      <div className="mb-6 rounded-2xl bg-emerald-50/50 px-4 py-3 text-center">
        <span className="text-sm text-slate-500">Режим <span className="font-bold text-slate-700">{selectedProtocol.label}</span> — <span className="font-semibold text-emerald-600">{selectedProtocol.hours} часов</span></span>
      </div>

      <button
        onClick={onStart}
        className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 active:scale-[0.98]"
      >
        Начать голодание
      </button>

      <div className="mt-4 flex items-start gap-2 rounded-2xl bg-sky-50/70 px-4 py-3 text-xs text-sky-600">
        <Bell size={14} className="mt-0.5 shrink-0" />
        <span className="leading-snug">
          Совет: добавь приложение на экран «Домой» iPhone — уведомления
          будут приходить в шторку с мотивацией и напоминаниями.
        </span>
      </div>
    </div>
  );
}

/* ---- Stat Card ---- */

const TINTS: Record<string, { bg: string; text: string }> = {
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-600' },
  sky: { bg: 'bg-sky-100', text: 'text-sky-600' },
};

function StatCard({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: keyof typeof TINTS | string;
}) {
  const t = TINTS[tint] ?? TINTS.emerald;
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
      <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${t.bg} ${t.text}`}>
        {icon}
      </div>
      <div className="text-lg font-bold tabular-nums text-slate-800">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

/* ---- Finish Modal ---- */

function FinishModal({
  protocol,
  elapsedMs,
  targetHours,
  onCompleted,
  onStopped,
  onCancel,
}: {
  protocol: string;
  elapsedMs: number;
  targetHours: number;
  onCompleted: () => void;
  onStopped: () => void;
  onCancel: () => void;
}) {
  const reached = elapsedMs >= targetHours * 3600_000;
  const hours = elapsedMs / 3600_000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-800">Завершить голодание?</h3>
        <p className="mt-2 text-sm text-slate-500">
          {reached
            ? `Ты достиг цели ${protocol} — ${formatHoursShort(hours)} голодания. Отметить как завершённое?`
            : `Ты постился ${formatHoursShort(hours)} из ${formatHoursShort(targetHours)}. Сохранить эту сессию?`}
        </p>

        <div className="mt-6 space-y-2.5">
          {reached && (
            <button
              onClick={onCompleted}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
            >
              Завершить успешно
            </button>
          )}
          <button
            onClick={onStopped}
            className="w-full rounded-2xl bg-slate-100 px-6 py-3.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-200 active:scale-[0.98]"
          >
            {reached ? 'Просто сохранить' : 'Сохранить и остановить'}
          </button>
          <button
            onClick={onCancel}
            className="w-full rounded-2xl px-6 py-3 text-sm font-medium text-slate-400 transition-colors hover:text-slate-600"
          >
            Продолжить голодание
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
