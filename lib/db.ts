import { createClient } from './supabase';

export type EventType = 'task' | 'meeting' | 'deadline' | 'reminder';

export type CalEvent = {
  id: string;
  title: string;
  date: string;
  time?: string | null;
  type: EventType;
  done: boolean;
  note?: string | null;
  created_at?: string;
};

export type Goal = {
  id: string;
  title: string;
  deadline: string;
  progress: number;
  color: string;
  created_at?: string;
};

export const EVENT_COLORS: Record<EventType, string> = {
  task: '#ff6eb4', meeting: '#00e5ff', deadline: '#ff3366', reminder: '#ffb547',
};

// ─── localStorage fallback helpers ───────────────────────────────────────────
const EV_KEY = 'devcal_events';
const GL_KEY = 'devcal_goals';
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const lsEvGet = (): CalEvent[] => { try { return JSON.parse(localStorage.getItem(EV_KEY) ?? '[]'); } catch { return []; } };
const lsGlGet = (): Goal[] => { try { return JSON.parse(localStorage.getItem(GL_KEY) ?? '[]'); } catch { return []; } };

// ─── Events ──────────────────────────────────────────────────────────────────
export async function getEvents(): Promise<CalEvent[]> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return lsEvGet();
  const { data } = await sb.from('calendar_events').select('*').eq('user_id', user.id).order('date').order('time', { nullsFirst: true });
  return data ?? [];
}

export async function getEventsForDate(date: string): Promise<CalEvent[]> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return lsEvGet().filter(e => e.date === date);
  const { data } = await sb.from('calendar_events').select('*').eq('user_id', user.id).eq('date', date).order('time', { nullsFirst: true });
  return data ?? [];
}

export async function createEvent(ev: Omit<CalEvent, 'id' | 'done'>): Promise<CalEvent> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    const e: CalEvent = { ...ev, id: uid(), done: false };
    localStorage.setItem(EV_KEY, JSON.stringify([...lsEvGet(), e]));
    return e;
  }
  const { data, error } = await sb.from('calendar_events').insert({ user_id: user.id, ...ev, done: false }).select().single();
  if (error) throw error;
  return data;
}

export async function updateEvent(id: string, patch: Partial<CalEvent>): Promise<void> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) { localStorage.setItem(EV_KEY, JSON.stringify(lsEvGet().map(e => e.id === id ? { ...e, ...patch } : e))); return; }
  await sb.from('calendar_events').update(patch).eq('id', id).eq('user_id', user.id);
}

export async function deleteEvent(id: string): Promise<void> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) { localStorage.setItem(EV_KEY, JSON.stringify(lsEvGet().filter(e => e.id !== id))); return; }
  await sb.from('calendar_events').delete().eq('id', id).eq('user_id', user.id);
}

// ─── Goals ───────────────────────────────────────────────────────────────────
export async function getGoals(): Promise<Goal[]> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return lsGlGet();
  const { data } = await sb.from('calendar_goals').select('*').eq('user_id', user.id).order('deadline');
  return data ?? [];
}

export async function createGoal(goal: Omit<Goal, 'id'>): Promise<Goal> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    const g: Goal = { ...goal, id: uid() };
    localStorage.setItem(GL_KEY, JSON.stringify([...lsGlGet(), g]));
    return g;
  }
  const { data, error } = await sb.from('calendar_goals').insert({ user_id: user.id, ...goal }).select().single();
  if (error) throw error;
  return data;
}

export async function updateGoal(id: string, patch: Partial<Goal>): Promise<void> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) { localStorage.setItem(GL_KEY, JSON.stringify(lsGlGet().map(g => g.id === id ? { ...g, ...patch } : g))); return; }
  await sb.from('calendar_goals').update(patch).eq('id', id).eq('user_id', user.id);
}

export async function deleteGoal(id: string): Promise<void> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) { localStorage.setItem(GL_KEY, JSON.stringify(lsGlGet().filter(g => g.id !== id))); return; }
  await sb.from('calendar_goals').delete().eq('id', id).eq('user_id', user.id);
}

export function toYMD(date: Date): string { return date.toISOString().split('T')[0]; }
export function getDaysInMonth(y: number, m: number): number { return new Date(y, m + 1, 0).getDate(); }
export function getFirstDayOfMonth(y: number, m: number): number { return new Date(y, m, 1).getDay(); }
