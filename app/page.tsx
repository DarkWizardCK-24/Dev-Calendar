'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getEvents, getDaysInMonth, getFirstDayOfMonth, toYMD,
  EVENT_COLORS, createEvent, type EventType, type CalEvent,
} from '@/lib/db';
import { RiAddLine, RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', time: '', type: 'task' as EventType, note: '' });

  useEffect(() => { getEvents().then(setEvents); }, []);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const todayStr = toYMD(today);

  function eventDotColors(dateStr: string) {
    return events.filter(e => e.date === dateStr).slice(0, 3).map(e => EVENT_COLORS[e.type]);
  }

  function handleDayClick(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setShowForm(true);
    setForm({ title: '', time: '', type: 'task', note: '' });
  }

  async function handleSave() {
    if (!form.title.trim() || !selectedDate) return;
    await createEvent({ title: form.title, date: selectedDate, time: form.time || null, type: form.type, note: form.note || null });
    setEvents(await getEvents());
    setShowForm(false);
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="container-app py-10 space-y-6 max-w-4xl">
      <div>
        <div className="text-xs text-[var(--color-text-muted)]"><span className="text-[var(--color-neon-green)]">$</span> cat /dev/calendar</div>
        <h1 className="text-3xl font-bold mt-2">Calendar<span className="caret" /></h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Plan your dev life. Click any day to add an event.</p>
      </div>

      <div className="term-card">
        {/* Month nav */}
        <div className="term-card-header">
          <button onClick={prevMonth} className="text-[var(--color-text-dim)] hover:text-[var(--color-neon-pink)] transition-colors p-1">
            <RiArrowLeftSLine size={16} />
          </button>
          <span style={{ color: 'var(--color-neon-pink)' }}>{MONTH_NAMES[month]} {year}</span>
          <button onClick={nextMonth} className="text-[var(--color-text-dim)] hover:text-[var(--color-neon-pink)] transition-colors p-1">
            <RiArrowRightSLine size={16} />
          </button>
        </div>

        <div className="term-card-body p-0">
          {/* Day labels */}
          <div className="grid grid-cols-7 border-b border-[var(--color-border)]">
            {DAY_LABELS.map(d => (
              <div key={d} className="text-center text-[10px] text-[var(--color-text-dim)] py-2 uppercase tracking-widest">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (!day) return <div key={i} className="border-r border-b border-[var(--color-border)] h-20 last:border-r-0" />;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;
              const dots = eventDotColors(dateStr);
              return (
                <button key={i} onClick={() => handleDayClick(day)}
                  className="border-r border-b border-[var(--color-border)] h-20 p-2 text-left hover:bg-[var(--color-surface-2)] transition-colors relative group">
                  <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                    ${isToday ? 'bg-[var(--color-neon-pink)] text-black' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]'}`}>
                    {day}
                  </span>
                  {dots.length > 0 && (
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      {dots.map((c, di) => <span key={di} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add event modal */}
      {showForm && selectedDate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="term-card w-full max-w-sm">
            <div className="term-card-header" style={{ color: 'var(--color-neon-pink)' }}>
              <span>$ touch event — {selectedDate}</span>
              <button onClick={() => setShowForm(false)} className="text-[var(--color-text-dim)] hover:text-[var(--color-neon-red)]">✕</button>
            </div>
            <div className="term-card-body space-y-3">
              <input className="w-full" placeholder="Event title..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
              <div className="grid grid-cols-2 gap-3">
                <input type="time" className="w-full" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
                <select className="w-full" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as EventType }))}>
                  <option value="task">Task</option>
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>
              <input className="w-full" placeholder="Note (optional)..." value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
              <div className="flex gap-2 pt-1">
                <button onClick={handleSave}
                  className="flex-1 py-2 text-sm font-semibold rounded border border-[var(--color-neon-pink)] text-[var(--color-neon-pink)] hover:bg-[rgba(255,110,180,0.1)] transition-colors">
                  $ add event
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick nav */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { href: '/today', label: '~/today', desc: "today's agenda", color: 'var(--color-neon-pink)' },
          { href: '/schedule', label: '~/schedule', desc: 'all events', color: 'var(--color-neon-cyan)' },
          { href: '/goals', label: '~/goals', desc: 'track goals', color: 'var(--color-neon-green)' },
        ].map(item => (
          <Link key={item.href} href={item.href} className="term-card block p-4 hover:scale-[1.02] transition-all">
            <div className="text-xs font-semibold" style={{ color: item.color }}>{item.label}</div>
            <div className="text-[10px] text-[var(--color-text-dim)] mt-1">{item.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
