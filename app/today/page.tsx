'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getEventsForDate, updateEvent, deleteEvent, toYMD, EVENT_COLORS, type CalEvent } from '@/lib/db';
import { RiCheckboxCircleLine, RiCircleLine, RiDeleteBinLine, RiArrowLeftLine } from 'react-icons/ri';

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function TodayPage() {
  const today = new Date();
  const todayStr = toYMD(today);
  const [events, setEvents] = useState<CalEvent[]>([]);

  useEffect(() => { getEventsForDate(todayStr).then(setEvents); }, [todayStr]);

  async function toggle(id: string, done: boolean) {
    await updateEvent(id, { done: !done });
    setEvents(await getEventsForDate(todayStr));
  }

  async function remove(id: string) {
    await deleteEvent(id);
    setEvents(await getEventsForDate(todayStr));
  }

  const sorted = [...events].sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''));
  const done = events.filter(e => e.done).length;
  const pct = events.length > 0 ? Math.round((done / events.length) * 100) : 0;

  return (
    <div className="container-app py-10 space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-neon-pink)] transition-colors">
          <RiArrowLeftLine size={13} /> $ ls /calendar
        </Link>
      </div>

      <div>
        <div className="text-xs text-[var(--color-text-dim)]">// {DAY_NAMES[today.getDay()]}, {MONTH_NAMES[today.getMonth()]} {today.getDate()}</div>
        <h1 className="text-3xl font-bold mt-1">{greeting()}<span className="caret" /></h1>
      </div>

      {events.length > 0 && (
        <div className="term-card">
          <div className="term-card-header" style={{ color: 'var(--color-neon-pink)' }}>
            <span>// daily progress</span>
            <span>{done}/{events.length} done</span>
          </div>
          <div className="term-card-body">
            <div className="h-2 rounded-full overflow-hidden bg-[var(--color-surface-2)] border border-[var(--color-border)]">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #ff6eb4 0%, #ff6eb480 100%)' }} />
            </div>
            <div className="text-right text-xs mt-1" style={{ color: 'var(--color-neon-pink)' }}>{pct}%</div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {sorted.length === 0 ? (
          <div className="term-card text-center py-16">
            <div className="text-[var(--color-text-dim)] text-sm mb-2">$ cat today.log — nothing scheduled</div>
            <p className="text-xs text-[var(--color-text-muted)] mb-4">No events today. Click a day on the calendar to add one.</p>
            <Link href="/" className="text-xs text-[var(--color-neon-pink)] hover:underline">$ open /calendar →</Link>
          </div>
        ) : sorted.map(event => (
          <div key={event.id} className="term-card group flex items-center gap-3 p-4 transition-all"
            style={{ borderColor: event.done ? 'var(--color-border)' : undefined, opacity: event.done ? 0.6 : 1 }}>
            <button onClick={() => toggle(event.id, event.done)} className="shrink-0"
              style={{ color: event.done ? EVENT_COLORS[event.type] : 'var(--color-text-dim)' }}>
              {event.done ? <RiCheckboxCircleLine size={20} /> : <RiCircleLine size={20} />}
            </button>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold ${event.done ? 'line-through' : ''}`}
                style={{ color: event.done ? 'var(--color-text-dim)' : 'var(--color-text)' }}>
                {event.title}
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                {event.time && <span className="text-xs text-[var(--color-text-muted)]">{event.time}</span>}
                <span className="text-[10px] px-1.5 py-0.5 rounded border"
                  style={{ borderColor: `${EVENT_COLORS[event.type]}40`, color: EVENT_COLORS[event.type] }}>
                  {event.type}
                </span>
                {event.note && <span className="text-xs text-[var(--color-text-dim)] truncate">{event.note}</span>}
              </div>
            </div>
            <button onClick={() => remove(event.id)}
              className="shrink-0 p-1 text-[var(--color-text-dim)] hover:text-[var(--color-neon-red)] transition-colors opacity-0 group-hover:opacity-100">
              <RiDeleteBinLine size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
