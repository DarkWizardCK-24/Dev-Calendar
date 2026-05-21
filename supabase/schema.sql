-- ============================================================
-- DevCalendar — Supabase Schema (standalone)
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Shared trigger ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Calendar events ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calendar_events (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  description TEXT    DEFAULT '',
  date        DATE    NOT NULL,
  start_time  TIME,
  end_time    TIME,
  type        TEXT    NOT NULL DEFAULT 'task'
                CHECK (type IN ('task', 'meeting', 'deadline', 'reminder', 'focus', 'event')),
  done        BOOLEAN DEFAULT FALSE,
  recurring   TEXT    CHECK (recurring IN ('daily', 'weekly', 'monthly', 'yearly')),
  recurring_end DATE,
  color       TEXT    DEFAULT '#00e5ff',
  priority    SMALLINT NOT NULL DEFAULT 2 CHECK (priority IN (1, 2, 3)), -- 1=low 2=normal 3=high
  note        TEXT    DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_calendar_events_user     ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date     ON calendar_events(user_id, date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type     ON calendar_events(user_id, type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_undone   ON calendar_events(user_id, date) WHERE done = false;

-- ── Goals ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calendar_goals (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  description TEXT    DEFAULT '',
  deadline    DATE    NOT NULL,
  progress    INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  color       TEXT    NOT NULL DEFAULT '#ff6eb4',
  status      TEXT    NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  milestones  JSONB   NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_calendar_goals_updated_at
  BEFORE UPDATE ON calendar_goals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_calendar_goals_user     ON calendar_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_goals_deadline ON calendar_goals(user_id, deadline);
CREATE INDEX IF NOT EXISTS idx_calendar_goals_status   ON calendar_goals(user_id, status);

-- ── Focus sessions (Pomodoro-style) ──────────────────────────
CREATE TABLE IF NOT EXISTS focus_sessions (
  id           UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id     UUID    REFERENCES calendar_events(id) ON DELETE SET NULL,
  duration_min INTEGER NOT NULL DEFAULT 25,
  completed    BOOLEAN DEFAULT FALSE,
  notes        TEXT    DEFAULT '',
  started_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_user ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_date ON focus_sessions(user_id, started_at DESC);

-- ── Daily summaries (cached aggregates) ──────────────────────
CREATE TABLE IF NOT EXISTS daily_summaries (
  user_id        UUID  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date           DATE  NOT NULL,
  events_total   INTEGER NOT NULL DEFAULT 0,
  events_done    INTEGER NOT NULL DEFAULT 0,
  focus_minutes  INTEGER NOT NULL DEFAULT 0,
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_summaries_user ON daily_summaries(user_id, date DESC);

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE calendar_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_goals   ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "calendar_events_owner"   ON calendar_events  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "calendar_goals_owner"    ON calendar_goals   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "focus_sessions_owner"    ON focus_sessions   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "daily_summaries_owner"   ON daily_summaries  FOR ALL USING (auth.uid() = user_id);
