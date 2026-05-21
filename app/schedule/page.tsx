'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getEvents, deleteEvent, updateEvent, EVENT_COLORS, type CalEvent } from '@/lib/db';
import { RiArrowLeftLine, RiDeleteBinLine, RiCheckboxCircleLine, RiCircleLine } from 'react-icons/ri';

type Filter = 'all' | 'upcoming' | 'done';

export default function SchedulePage() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => { getEvents().then(setEvents); }, []);

  async function toggle(id: string, done: boolean) {
    await updateEvent(id, { done: !done });
    setEvents(await getEvents());
  }

  async function remove(id: string) {
    if (!confirm('Delete this event?')) return;
    await deleteEvent(id);
    setEvents(await getEvents());
  }

  const today = new Date().toISOString().split('T')[0];
  const filtered = events
    .filter(e => {
      if (filter === 'upcoming') return !e.done && e.date >= today;
      if (filter === 'done') return e.done;
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''));

  const grouped = filtered.reduce<Record<string, CalEvent[]>>((acc, e) => {
    (acc[e.date] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div className="container-app py-10 space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-neon-pink)] transition-colors">
          <RiArrowLeftLine size={13} /> $ ls /calendar
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-[var(--color-text-muted)]"><span className="text-[var(--color-neon-green)]">$</span> grep -r events ~/.devcal/</div>
          <h1 className="text-3xl font-bold mt-2">Schedule<span className="caret" /></h1>
        </div>
        <div className="flex gap-1 mt-2">
          {(['all', 'upcoming', 'done'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-2 py-1 text-[10px] rounded border transition-colors"
              style={{
                borderColor: filter === f ? 'var(--color-neon-pink)' : 'var(--color-border)',
                color: filter === f ? 'var(--color-neon-pink)' : 'var(--color-text-dim)',
                background: filter === f ? 'rgba(255,110,180,0.08)' : 'transparent',
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="term-card text-center py-16">
          <div className="text-[var(--color-text-dim)] text-sm mb-2">$ ls — no events found</div>
          <Link href="/" className="text-xs text-[var(--color-neon-pink)] hover:underline">$ open /calendar →</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dayEvents]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-[10px] uppercase tracking-widest" style={{ color: date === today ? 'var(--color-neon-pink)' : 'var(--color-text-dim)' }}>
                  {date === today ? '▸ today' : date}
                </div>
                <div className="flex-1 h-px bg-[var(--color-border)]" />
              </div>
              <div className="space-y-2">
                {dayEvents.map(event => (
                  <div key={event.id} className="term-card group flex items-center gap-3 p-3 transition-all"
                    style={{ opacity: event.done ? 0.55 : 1 }}>
                    <button onClick={() => toggle(event.id, event.done)}
                      style={{ color: event.done ? EVENT_COLORS[event.type] : 'var(--color-text-dim)' }}>
                      {event.done ? <RiCheckboxCircleLine size={18} /> : <RiCircleLine size={18} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm ${event.done ? 'line-through text-[var(--color-text-dim)]' : 'text-[var(--color-text)]'}`}>
                        {event.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {event.time && <span className="text-[10px] text-[var(--color-text-muted)]">{event.time}</span>}
                        <span className="text-[10px] px-1 py-0.5 rounded border"
                          style={{ borderColor: `${EVENT_COLORS[event.type]}40`, color: EVENT_COLORS[event.type] }}>
                          {event.type}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => remove(event.id)}
                      className="shrink-0 p-1 text-[var(--color-text-dim)] hover:text-[var(--color-neon-red)] transition-colors opacity-0 group-hover:opacity-100">
                      <RiDeleteBinLine size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
