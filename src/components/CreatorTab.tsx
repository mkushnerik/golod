import { Loader2, ShieldCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface CreatorUser {
  user_id: string;
  email: string | null;
  registered_at: string;
  total_fastings: number;
  completed_fastings: number;
}

export function CreatorTab() {
  const [users, setUsers] = useState<CreatorUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase.rpc('get_creator_dashboard');
      if (!mounted) return;
      if (error) {
        setForbidden(true);
      } else {
        setUsers((data ?? []) as CreatorUser[]);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" /></div>;
  if (forbidden) return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">Доступ к странице создателя закрыт.</div>;

  return (
    <div className="space-y-5">
      <div className="rounded-[2rem] bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10">
        <div className="flex items-center gap-3"><ShieldCheck className="text-emerald-300" /><div><p className="text-xs uppercase tracking-[0.18em] text-slate-400">Creator space</p><h2 className="text-2xl font-bold">Пользователи</h2></div></div>
        <p className="mt-4 text-sm text-slate-300">Зарегистрировано аккаунтов: <strong className="text-white">{users.length}</strong></p>
      </div>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {users.map((user) => (
          <div key={user.user_id} className="flex items-center gap-3 border-b border-slate-100 p-4 last:border-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><Users size={18} /></div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{user.email ?? 'Без email'}</p><p className="text-xs text-slate-400">С нами с {new Date(user.registered_at).toLocaleDateString('ru-RU')}</p></div>
            <div className="text-right text-xs text-slate-500"><p>{user.completed_fastings} завершено</p><p>{user.total_fastings} всего</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
