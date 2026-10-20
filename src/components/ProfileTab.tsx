import { useEffect, useRef, useState } from 'react';
import { Profile } from '@/lib/supabase';
import { ProfileData } from '@/hooks/useProfile';
import { calculateBMR, calculateTDEE } from '@/lib/fasting';
import {
  LogOut,
  User,
  Save,
  Loader2,
  Ruler,
  Weight,
  Calendar,
  Activity,
} from 'lucide-react';

interface ProfileTabProps {
  profile: Profile | null;
  profileLoading: boolean;
  userId: string | null;
  email: string | null;
  onUpdateProfile: (data: ProfileData) => Promise<void>;
  onSignOut: () => void;
  onOpenCreator: () => void;
}

export function ProfileTab({
  profile,
  profileLoading,
  email,
  onUpdateProfile,
  onSignOut,
  onOpenCreator,
}: ProfileTabProps) {
  const [weight, setWeight] = useState(String(profile?.weight_kg ?? ''));
  const [height, setHeight] = useState(String(profile?.height_cm ?? ''));
  const [age, setAge] = useState(String(profile?.age ?? ''));
  const [gender, setGender] = useState<'male' | 'female' | null>(profile?.gender ?? null);
  const [goalWeight, setGoalWeight] = useState(String(profile?.goal_weight_kg ?? ''));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Sync form when profile loads
  const formInitialized = useRef(false);
  useEffect(() => {
    if (!formInitialized.current && profile) {
      setWeight(profile.weight_kg ? String(profile.weight_kg) : '');
      setHeight(profile.height_cm ? String(profile.height_cm) : '');
      setAge(profile.age ? String(profile.age) : '');
      setGender(profile.gender ?? null);
      setGoalWeight(profile.goal_weight_kg ? String(profile.goal_weight_kg) : '');
      formInitialized.current = true;
    }
  }, [profile]);

  const bodyData: ProfileData = {
    weight_kg: weight ? parseFloat(weight) : null,
    height_cm: height ? parseFloat(height) : null,
    age: age ? parseInt(age) : null,
    gender,
    goal_weight_kg: goalWeight ? parseFloat(goalWeight) : null,
  };

  const bmr = calculateBMR(bodyData);
  const tdee = calculateTDEE(bodyData);

  const handleSave = async () => {
    setError('');
    if (!weight || !height || !age || !gender) {
      setError('Заполните все поля');
      return;
    }
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    if (w <= 0 || w > 500) {
      setError('Некорректный вес');
      return;
    }
    if (h <= 0 || h > 300) {
      setError('Некорректный рост');
      return;
    }
    if (a <= 0 || a > 120) {
      setError('Некорректный возраст');
      return;
    }
    setSaving(true);
    try {
      const gw = goalWeight ? parseFloat(goalWeight) : null;
      await onUpdateProfile({ weight_kg: w, height_cm: h, age: a, gender, goal_weight_kg: gw });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Не удалось сохранить. Попробуйте ещё раз.');
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* User card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/20">
            <User size={26} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-800">
              {email ?? 'Пользователь'}
            </p>
            <p className="text-xs text-slate-400">
              {profile?.created_at
                ? `С нами с ${new Date(profile.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}`
                : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Body data form */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h3 className="mb-1 text-sm font-bold text-slate-800">Данные о теле</h3>
        <p className="mb-4 text-xs text-slate-400">
          Нужны для расчёта сэкономленных калорий
        </p>

        <div className="space-y-4">
          {/* Weight */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Weight size={14} /> Вес (кг)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="например, 70"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Height */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Ruler size={14} /> Рост (см)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="например, 175"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Age */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Calendar size={14} /> Возраст (лет)
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="например, 30"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Goal weight */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Weight size={14} /> Целевой вес (кг)
            </label>
            <input
              type="number"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              placeholder="например, 65"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              Пол
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setGender('male')}
                className={[
                  'flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all',
                  gender === 'male'
                    ? 'border-sky-400 bg-sky-50 text-sky-600'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300',
                ].join(' ')}
              >
                <User size={18} /> Мужчина
              </button>
              <button
                onClick={() => setGender('female')}
                className={[
                  'flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all',
                  gender === 'female'
                    ? 'border-rose-400 bg-rose-50 text-rose-600'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300',
                ].join(' ')}
              >
                <User size={18} /> Женщина
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className={[
            'mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all active:scale-[0.98]',
            saved
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35',
          ].join(' ')}
        >
          {saving ? (
            <><Loader2 size={18} className="animate-spin" /> Сохранение...</>
          ) : saved ? (
            <><Activity size={18} /> Сохранено!</>
          ) : (
            <><Save size={18} /> Сохранить</>
          )}
        </button>
      </div>

      {/* Metabolism info */}
      {bmr !== null && tdee !== null && (
        <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-emerald-50/40 p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-slate-800">Ваш метаболизм</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs text-slate-400">Базовый обмен (BMR)</p>
              <p className="mt-1 text-xl font-bold text-slate-800">
                {Math.round(bmr)} <span className="text-sm font-normal text-slate-400">ккал/день</span>
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs text-slate-400">Расход (TDEE)</p>
              <p className="mt-1 text-xl font-bold text-slate-800">
                {Math.round(tdee)} <span className="text-sm font-normal text-slate-400">ккал/день</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {profile?.is_creator && email?.trim().toLowerCase() === 'mkushnerik@mail.ru' && (
        <button
          onClick={onOpenCreator}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-3.5 text-sm font-semibold text-amber-700 transition-all hover:bg-amber-100 active:scale-[0.98]"
        >
          Панель создателя
        </button>
      )}

      {/* Sign out */}
      <button
        onClick={onSignOut}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500 active:scale-[0.98]"
      >
        <LogOut size={18} /> Выйти из аккаунта
      </button>
    </div>
  );
}
