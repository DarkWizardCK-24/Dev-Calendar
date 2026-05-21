# DevCalendar

Terminal-styled developer calendar for planning tasks, meetings, deadlines, and reminders with color-coded event types. Includes a goal tracker with deadline countdowns and progress bars. Cloud-synced via Supabase with GitHub auth. Part of the **DevEco** ecosystem — twelve connected developer tools, one unified Supabase backend.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Auth + DB | Supabase (GitHub OAuth + Postgres) |
| Icons | React Icons (Remix set) |
| Font | JetBrains Mono |

---

## Features

- **Monthly calendar grid** — navigate months, click any day to view or add events
- **Event types** — four color-coded types: `task`, `meeting`, `deadline`, `reminder`
- **Event details** — title, date, optional time, optional note per event
- **Done toggle** — mark events complete without deleting them
- **Goal tracker** — long-term goals with a deadline date, color label, and progress percentage
- **Deadline countdown** — days remaining shown on every goal card
- **Cloud sync** — sign in with GitHub to persist events and goals to Supabase
- **Single-login SSO** — shared auth with the DevFolio ecosystem, no re-login required

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3004](http://localhost:3004).

### Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_DEVFOLIO_URL=https://your-devfolio-url.vercel.app
```

### Supabase setup

1. Run the shared `schema.sql` from the DevFolio repo in the Supabase SQL Editor
2. Enable GitHub provider in **Authentication → Providers**
3. Add `http://localhost:3004/api/auth/callback` to **Authentication → URL Configuration → Redirect URLs**

---

## Routes

| Route | Description |
|---|---|
| `/` | Calendar grid — monthly view with event dots and goal sidebar |
| `/api/auth/callback` | OAuth callback — redeems SSO ticket or exchanges code |

---

## Project Structure

```
DevCalendar/
├── app/
│   ├── layout.tsx               # root layout — fonts, navbar
│   ├── page.tsx                 # calendar grid + event panel + goal tracker
│   ├── globals.css              # design tokens
│   └── api/auth/
│       └── callback/route.ts    # SSO ticket redemption + OAuth callback
├── components/
│   ├── layout/                  # Navbar
│   └── auth/                    # AuthButton
├── lib/
│   ├── supabase.ts              # browser Supabase client
│   ├── supabase-server.ts       # server Supabase client (cookie-based)
│   └── db.ts                    # events + goals CRUD, date helpers
├── middleware.ts                 # session refresh on every request
```

---

## Data Schema

```
calendar_events
├── id        UUID
├── user_id   UUID → profiles
├── title     TEXT
├── date      DATE
├── time      TIME  (optional)
├── type      TEXT  ('task' | 'meeting' | 'deadline' | 'reminder')
├── done      BOOLEAN
└── note      TEXT  (optional)

calendar_goals
├── id        UUID
├── user_id   UUID → profiles
├── title     TEXT
├── deadline  DATE
├── progress  INTEGER  (0–100)
└── color     TEXT     (hex color label)
```

---

## DevEco Ecosystem

DevCalendar is part of a twelve-app ecosystem sharing one Supabase project and one GitHub login.

| App | Description |
|---|---|
| **DevFolio** | Developer portfolio hub — central auth provider |
| **DevBlog** | Write & publish dev posts |
| **DevResume** | Generate PDF resume |
| **DevRoadmap** | Skill learning tracks |
| **DevCalendar** | Schedule & goals — this repo |
| **DevTimer** | Pomodoro focus timer |
| **DevNotes** | Markdown notes |
| **DevStatus** | Project status pages |
| **DevEnv** | Environment vault |
| **DevWidgets** | Embeddable widgets |
| **DevShare** | Share & showcase code snippets |
| **DevPulse** | Dev activity & pulse tracker |

---

## Design System

Terminal / Linux / GitHub-inspired aesthetic.

| Token | Hex | Use |
|---|---|---|
| `bg` | `#05070F` | scaffold background |
| `surface` | `#0B1020` | nav, cards |
| `neon-cyan` | `#00E5FF` | selected day, primary accents |
| `neon-green` | `#00FFA3` | task events, done state |
| `neon-blue` | `#4D8CFF` | meeting events |
| `neon-purple` | `#8A5BFF` | reminder events |
| `neon-red` | `#FF3D71` | deadline events |
| `neon-amber` | `#FFB547` | goal warnings, near-deadline |

---

## Roadmap

- [x] Monthly calendar grid with navigation
- [x] Event CRUD with four event types
- [x] Done toggle on events
- [x] Goal tracker with progress bars
- [x] Deadline countdown per goal
- [x] Supabase backend with RLS
- [x] SSO with DevFolio ecosystem
- [ ] Week view and agenda view
- [ ] Recurring events
- [ ] iCal export

---

## License

MIT