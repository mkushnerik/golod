export type Difficulty = 'easy' | 'steady' | 'advanced' | 'challenge';

export interface Protocol {
  id: string;
  label: string;
  hours: number;
  description: string;
  difficulty: Difficulty;
  icon: 'leaf' | 'sun' | 'flame' | 'sparkles' | 'shield' | 'moon' | 'heart' | 'sliders';
}

// Sorted easiest → hardest (ascending hours)
export const PROTOCOLS: Protocol[] = [
  { id: '10:14', label: '10:14', hours: 10, description: 'Мягкий режим для возвращения в ритм', difficulty: 'easy', icon: 'heart' },
  { id: '12:12', label: '12:12', hours: 12, description: 'Для новичков — мягкое начало', difficulty: 'easy', icon: 'leaf' },
  { id: '14:10', label: '14:10', hours: 14, description: 'Спокойный ритм на каждый день', difficulty: 'easy', icon: 'sun' },
  { id: '16:8', label: '16:8', hours: 16, description: 'Баланс дисциплины и комфорта', difficulty: 'steady', icon: 'flame' },
  { id: '18:6', label: '18:6', hours: 18, description: 'Продвинутый уровень', difficulty: 'advanced', icon: 'sparkles' },
  { id: '20:4', label: '20:4', hours: 20, description: 'Серьёзный вызов для опытных', difficulty: 'challenge', icon: 'shield' },
  { id: '23:1', label: 'ОМД', hours: 23, description: 'Один приём пищи в день', difficulty: 'challenge', icon: 'moon' },
];

export const MOTIVATIONAL_MESSAGES: string[] = [
  'Тело переходит в режим сжигания жира. Так держать!',
  'Гормон роста растёт — обмен веществ просыпается!',
  'Уровень инсулина снижается. Каждая минута важна!',
  'Запускается аутофагия — клетки очищают сами себя!',
  'Ты вырабатываешь дисциплину, которая меняет всё!',
  'Голод сейчас — временный. Результат — навсегда!',
  'Твоё тело исцеляется и восстанавливается прямо сейчас!',
  'Ясность ума уже близко. Голодание обостряет разум!',
  'Каждый час после 12 усиливает сжигание жира. Вау!',
  'Воспаление снижается с каждым прошедшим часом!',
  'Ты доказываешь, что управляешь привычками, а не они тобой!',
  'Сила воли — это мышца. Ты делаешь повторение за повторением!',
  'Сахар в крови стабилизируется. Будущее «спасибо» скажет!',
  'Ты следуешь миллионам лет эволюции. Природа на твоей стороне!',
  'Дискомфорт — это и есть трансформация. Держи курс!',
  'У тебя отлично получается! Я верю в тебя!',
  'Ещё немного — и результат тебя порадует!',
  'Ты сильнее, чем думаешь. Продолжай!',
];

export const HOURLY_FACTS = [
  'Инсулин постепенно снижается, и телу проще использовать запасы энергии.',
  'Запасы гликогена расходуются — организм переключается на более устойчивое топливо.',
  'Гормон роста поддерживает восстановление тканей и помогает сохранять мышцы.',
  'Тело активнее использует жирные кислоты как источник энергии.',
  'Кетоновые тела становятся заметнее и могут поддерживать ясность мышления.',
  'Клеточные процессы восстановления работают активнее во время отдыха от еды.',
  'Стабильный ритм голодания помогает тренировать реакцию на привычные перекусы.',
  'Организм продолжает адаптироваться — регулярность важнее экстремальной цели.',
];

export function getHourlyFact(elapsedHours: number): string {
  return HOURLY_FACTS[Math.floor(elapsedHours) % HOURLY_FACTS.length];
}

export function getMessageForProgress(progress: number): string {
  const idx = Math.min(
    Math.floor(progress * MOTIVATIONAL_MESSAGES.length),
    MOTIVATIONAL_MESSAGES.length - 1,
  );
  return MOTIVATIONAL_MESSAGES[idx];
}

export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatHoursShort(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} мин`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h} ч ${m} мин` : `${h} ч`;
}

/* ---- Calorie calculations ---- */

export interface BodyData {
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  gender: 'male' | 'female' | null;
}

/**
 * Mifflin-St Jeor BMR (Basal Metabolic Rate) in kcal/day.
 * Male:   10*weight + 6.25*height - 5*age + 5
 * Female: 10*weight + 6.25*height - 5*age - 161
 */
export function calculateBMR(data: BodyData): number | null {
  if (!data.weight_kg || !data.height_cm || !data.age || !data.gender) return null;
  const base = 10 * data.weight_kg + 6.25 * data.height_cm - 5 * data.age;
  return data.gender === 'male' ? base + 5 : base - 161;
}

/**
 * TDEE (Total Daily Energy Expenditure) — sedentary multiplier.
 * We use 1.2 (sedentary) as a conservative estimate.
 */
export function calculateTDEE(data: BodyData): number | null {
  const bmr = calculateBMR(data);
  if (bmr === null) return null;
  return bmr * 1.2;
}

/**
 * Estimated calories "saved" during a fast.
 * Based on the proportion of daily TDEE that corresponds to the fast duration.
 * We assume the user would have consumed ~TDEE calories if not fasting,
 * so saved = TDEE * (fastHours / 24).
 * This is a simplification — actual savings depend on what the user eats
 * during eating windows, but it provides a motivational metric.
 */
export function calculateSavedCalories(data: BodyData, fastHours: number): number {
  const tdee = calculateTDEE(data);
  if (tdee === null) return 0;
  return Math.round(tdee * (fastHours / 24));
}

export function calculateSavedCaloriesForSessions(
  data: BodyData,
  sessions: { actual_hours: number | null }[],
): number {
  const tdee = calculateTDEE(data);
  if (tdee === null) return 0;
  return sessions.reduce((sum, s) => {
    if (!s.actual_hours) return sum;
    return sum + Math.round(tdee * (s.actual_hours / 24));
  }, 0);
}
