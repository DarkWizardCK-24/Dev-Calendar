export type EventType = 'task' | 'meeting' | 'deadline' | 'reminder';

export type CalendarEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  type: EventType;
  done: boolean;
  note?: string;
};

export type Goal = {
  id: string;
  title: string;
  deadline: string; // YYYY-MM-DD
  progress: number; // 0-100
  color: string;
};

const EVENTS_KEY = 'devcal_events';
const GOALS_KEY = 'devcal_goals';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function getEvents(): CalendarEvent[] {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) ?? '[]');
  } catch { return []; }
}

export function getEventsForDate(date: string): CalendarEvent[] {
  return getEvents().filter(e => e.date === date);
}

export function createEvent(data: Omit<CalendarEvent, 'id' | 'done'>): CalendarEvent {
  const event: CalendarEvent = { ...data, id: uid(), done: false };
  const all = getEvents();
  all.push(event);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(all));
  return event;
}

export function updateEvent(id: string, patch: Partial<CalendarEvent>): void {
  const all = getEvents().map(e => e.id === id ? { ...e, ...patch } : e);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(all));
}

export function deleteEvent(id: string): void {
  const all = getEvents().filter(e => e.id !== id);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(all));
}

export function getGoals(): Goal[] {
  try {
    return JSON.parse(localStorage.getItem(GOALS_KEY) ?? '[]');
  } catch { return []; }
}

export function createGoal(data: Omit<Goal, 'id'>): Goal {
  const goal: Goal = { ...data, id: uid() };
  const all = getGoals();
  all.push(goal);
  localStorage.setItem(GOALS_KEY, JSON.stringify(all));
  return goal;
}

export function updateGoal(id: string, patch: Partial<Goal>): void {
  const all = getGoals().map(g => g.id === id ? { ...g, ...patch } : g);
  localStorage.setItem(GOALS_KEY, JSON.stringify(all));
}

export function deleteGoal(id: string): void {
  const all = getGoals().filter(g => g.id !== id);
  localStorage.setItem(GOALS_KEY, JSON.stringify(all));
}

export function toYMD(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export const EVENT_COLORS: Record<EventType, string> = {
  task: '#ff6eb4',
  meeting: '#00e5ff',
  deadline: '#ff3366',
  reminder: '#ffb547',
};
