'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getGoals, createGoal, updateGoal, deleteGoal, type Goal } from '@/lib/db';
import { RiAddLine, RiArrowLeftLine, RiDeleteBinLine, RiFocus3Line } from 'react-icons/ri';

const GOAL_COLORS = ['#ff6eb4', '#00e5ff', '#00ff88', '#ffb547', '#8a5bff', '#ff3366'];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', deadline: '', color: GOAL_COLORS[0] });

  useEffect(() => { getGoals().then(setGoals); }, []);

  async function handleCreate() {
    if (!form.title.trim() || !form.deadline) return;
    await createGoal({ title: form.title, deadline: form.deadline, progress: 0, color: form.color });
    setGoals(await getGoals());
    setForm({ title: '', deadline: '', color: GOAL_COLORS[0] });
    setShowForm(false);
  }

  async function handleProgress(id: string, progress: number) {
    await updateGoal(id, { progress });
    setGoals(await getGoals());
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this goal?')) return;
    await deleteGoal(id);
    setGoals(await getGoals());
  }

  function daysLeft(deadline: string) {
    const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    if (diff < 0) return 'overdue';
    if (diff === 0) return 'due today';
    return `${diff}d left`;
  }

  return (
    <div className="container-app py-10 space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-neon-pink)] transition-colors">
          <RiArrowLeftLine size={13} /> $ ls /calendar
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-[var(--color-text-muted)]"><span className="text-[var(--color-neon-green)]">$</span> cat ~/.goals</div>
          <h1 className="text-3xl font-bold mt-2">Goals<span className="caret" /></h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Set targets, track progress, ship results.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded border border-[var(--color-neon-pink)] text-[var(--color-neon-pink)] hover:bg-[rgba(255,110,180,0.08)] transition-colors mt-2">
          <RiAddLine size={14} /> new goal
        </button>
      </div>

      {showForm && (
        <div className="term-card" style={{ borderColor: 'var(--color-neon-pink)' }}>
          <div className="term-card-header" style={{ color: 'var(--color-neon-pink)' }}>
            <span>$ goal --new</span>
            <button onClick={() => setShowForm(false)} className="text-[var(--color-text-dim)] hover:text-[var(--color-neon-red)]">✕</button>
          </div>
          <div className="term-card-body space-y-3">
            <input className="w-full" placeholder="Goal title..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
            <div className="flex gap-3">
              <input type="date" className="flex-1" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
              <div className="flex items-center gap-2">
                {GOAL_COLORS.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                    className="w-5 h-5 rounded-full border-2 transition-all"
                    style={{ background: c, borderColor: form.color === c ? 'white' : 'transparent' }} />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate}
                className="flex-1 py-2 text-sm font-semibold rounded border border-[var(--color-neon-pink)] text-[var(--color-neon-pink)] hover:bg-[rgba(255,110,180,0.08)] transition-colors">
                $ set goal
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm rounded border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors">
                cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {goals.length === 0 && !showForm ? (
        <div className="term-card text-center py-16">
          <RiFocus3Line size={32} className="mx-auto mb-3 text-[var(--color-text-dim)]" />
          <div className="text-[var(--color-text-dim)] text-sm mb-2">$ ls ~/.goals — no goals set</div>
          <p className="text-xs text-[var(--color-text-muted)] mb-4">Set your first goal and track progress toward it.</p>
          <button onClick={() => setShowForm(true)} className="text-xs text-[var(--color-neon-pink)] hover:underline">$ new goal →</button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => {
            const days = daysLeft(goal.deadline);
            const isOverdue = days === 'overdue';
            return (
              <div key={goal.id} className="term-card group" style={{ borderColor: `${goal.color}30` }}>
                <div className="term-card-header" style={{ color: goal.color }}>
                  <span>{goal.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px]" style={{ color: isOverdue ? 'var(--color-neon-red)' : 'var(--color-text-dim)' }}>{days}</span>
                    <button onClick={() => handleDelete(goal.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-text-dim)] hover:text-[var(--color-neon-red)]">
                      <RiDeleteBinLine size={12} />
                    </button>
                  </div>
                </div>
                <div className="term-card-body space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[var(--color-text-dim)]">// progress</span>
                      <span style={{ color: goal.color }}>{goal.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${goal.progress}%`, background: goal.color }} />
                    </div>
                  </div>
                  <input type="range" min={0} max={100} value={goal.progress}
                    onChange={e => handleProgress(goal.id, Number(e.target.value))}
                    className="w-full h-1 cursor-pointer"
                    style={{ accentColor: goal.color }} />
                  <div className="text-[10px] text-[var(--color-text-dim)]">deadline: {goal.deadline}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
