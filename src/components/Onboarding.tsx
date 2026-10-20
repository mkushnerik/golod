import { useState } from 'react';
import { BunnyHero } from '@/components/BunnyMascot';
import { MASCOT_IMAGE } from '@/lib/mascot';
import { Loader2 } from 'lucide-react';

interface OnboardingProps {
  onSignUp: (email: string, password: string) => Promise<unknown>;
  onSignIn: (email: string, password: string) => Promise<unknown>;
}

export function Onboarding({ onSignUp, onSignIn }: OnboardingProps) {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен быть не короче 6 символов');
      return;
    }
    setError('');
    setNotice('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const result = await onSignUp(email, password);
        if (requiresEmailConfirmation(result)) {
          setNotice('Аккаунт создан. Проверьте почту и подтвердите адрес, затем войдите.');
          setMode('login');
        }
      } else {
        await onSignIn(email, password);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Что-то пошло не так';
      setError(translateAuthError(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Logo + mascot */}
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20">
            <img src={MASCOT_IMAGE} alt="Крош" className="h-full w-full object-cover" />
          </div>
          <span className="text-xl font-bold text-slate-800">ФастТрек</span>
        </div>

        <div className="my-6">
          <BunnyHero size={180} />
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold text-slate-800">
          {mode === 'signup' ? 'Привет! Я Крош!' : 'С возвращением!'}
        </h1>
        <p className="mb-8 max-w-xs text-center text-sm text-slate-500">
          {mode === 'signup'
            ? 'Зарегистрируйся по почте — и я помогу тебе голодать с улыбкой!'
            : 'Войди, чтобы продолжить своё голодание'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Электронная почта
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {notice && (
            <div className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm leading-relaxed text-emerald-700">
              {notice}
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" /> Подождите...
              </span>
            ) : mode === 'signup' ? (
              'Создать аккаунт'
            ) : (
              'Войти'
            )}
          </button>
        </form>

        {/* Toggle mode */}
        <button
          onClick={() => {
            setMode(mode === 'signup' ? 'login' : 'signup');
            setError('');
            setNotice('');
          }}
          className="mt-4 text-sm text-slate-500 transition-colors hover:text-emerald-600"
        >
          {mode === 'signup'
            ? 'Уже есть аккаунт? Войти'
            : 'Нет аккаунта? Зарегистрироваться'}
        </button>

        {/* Terms link */}
        <button
          onClick={() => setShowTerms(true)}
          className="mt-6 text-xs text-slate-400 underline transition-colors hover:text-slate-600"
        >
          Условия использования и политика конфиденциальности
        </button>
      </div>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </div>
  );
}

function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[80vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="mb-4 text-lg font-bold text-slate-800">
          Условия использования
        </h2>
        <div className="space-y-3 text-sm leading-relaxed text-slate-600">
          <p>
            <strong>Сбор данных.</strong> При регистрации мы сохраняем ваш адрес
            электронной почты и пароль (в зашифрованном виде). В личном кабинете
            вы можете указать вес, рост, возраст и пол — эти данные используются
            исключительно для расчёта сэкономленных калорий.
          </p>
          <p>
            <strong>Хранение данных.</strong> Все данные хранятся в защищённой
            базе данных. Доступ к вашим данным есть только у вас. Мы не передаём
            ваши данные третьим лицам.
          </p>
          <p>
            <strong>Медицинский дисклеймер.</strong> Приложение носит
            информационный характер и не является медицинским советом. Перед
            началом интервального голодания проконсультируйтесь с врачом.
          </p>
          <p>
            <strong>Удаление аккаунта.</strong> Вы можете удалить все свои данные
            в любой момент в личном кабинете.
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
        >
          Понятно
        </button>
      </div>
    </div>
  );
}

function requiresEmailConfirmation(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const response = value as { user?: unknown; session?: unknown };
  return 'user' in response && 'session' in response && response.user !== null && response.session === null;
}

function translateAuthError(msg: string): string {
  const normalized = msg.toLowerCase();
  if (normalized.includes('already registered') || normalized.includes('already been registered'))
    return 'Этот email уже зарегистрирован. Попробуйте войти.';
  if (normalized.includes('invalid login') || normalized.includes('invalid credentials'))
    return 'Неверный email или пароль.';
  if (normalized.includes('email not confirmed'))
    return 'Email не подтверждён. Проверьте почту.';
  if (normalized.includes('password should be') || normalized.includes('password must'))
    return 'Пароль должен быть не короче 6 символов.';
  if (normalized.includes('unable to validate email') || normalized.includes('invalid email'))
    return 'Некорректный email адрес.';
  if (normalized.includes('rate limit') || normalized.includes('too many requests'))
    return 'Слишком много попыток. Подождите немного и попробуйте снова.';
  return 'Не удалось создать аккаунт. Проверьте данные и попробуйте ещё раз.';
}
