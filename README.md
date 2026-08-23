# 🚨 CampusGuard — Emergency Campus Network

<div align="center">

**Real-time emergency response for college campuses.**

Students report incidents with one tap → nearby peers get instant alerts with safe exits → campus security tracks everything on a live map.

![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat&logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=flat&logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat&logo=supabase&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)

</div>

---

## ✨ What it does

| Step | What happens |
|------|-------------|
| 🎓 **Report** | Student picks an incident type (fire, medical, harassment, etc.), adds details, and taps the alert button |
| 📡 **Broadcast** | Nearby students instantly receive the alert with distance and the recommended exit route |
| 🗺️ **Track** | Campus security watches every incident on a live SVG map with pulsing markers |
| ✅ **Resolve** | Admins verify, assign responders, and mark incidents as solved — all in real time |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Why |
|-----------|-----|
| **React 19** | Latest concurrent features, server-ready architecture |
| **React Compiler** | Automatic memoization — no more `useCallback` / `useMemo` boilerplate |
| **Vite 8** | Blazing fast HMR and builds with Rolldown |
| **React Router 7** | Client-side routing with nested layouts |
| **Axios** | HTTP client with interceptors for automatic auth token injection |
| **Supabase JS** | Realtime subscriptions, auth, and database access from the browser |

### Backend

| Technology | Why |
|-----------|-----|
| **Node.js + Express 5** | Modern async error handling, native ES modules |
| **Supabase Admin** | Server-side user management and DB access via service-role key |
| **Resend** | Transactional email alerts to all campus users when an incident is verified |
| **JWT Auth** | Stateless bearer token verification via Supabase on every protected route |

### Infrastructure & Data

| Technology | Why |
|-----------|-----|
| **Supabase (PostgreSQL)** | Managed Postgres with Realtime, Row-Level Security, and OAuth built in |
| **Supabase Realtime** | Live incident streaming via `postgres_changes` — zero polling |
| **Google OAuth** | Campus identity verification through Supabase Auth |

---

## 🎨 UI & Mobile Features

- 📱 **Mobile-first responsive design** — works beautifully from 320px to 4K
- 🔽 **Bottom tab bar** — native-feeling navigation on phones with glass morphism
- 🔄 **Pull-to-refresh** — rubber-band physics, iOS-style gesture on incident lists
- 🪟 **Glassmorphism** — frosted glass panels with `backdrop-filter: blur`
- ✨ **Micro-interactions** — spring animations, staggered list entry, hover transforms
- 🌗 **Dark mode** — automatic via `prefers-color-scheme`
- 🗺️ **SVG campus map** — animated pulsing markers, zone labels, gate indicators
- 🚨 **Animated alert button** — siren shake + shimmer gradient on hover
- ♿ **Accessible** — focus rings, semantic HTML, ARIA roles on tabs

---

## 📁 Project Structure

```
campusguard/
├── client/
│   └── vite-project/                # React frontend (Vite)
│       └── src/
│           ├── components/
│           │   └── PullToRefresh.jsx   # Reusable pull-to-refresh wrapper
│           ├── lib/
│           │   ├── axios.js            # Axios instance + auth interceptor
│           │   ├── incidents.js        # Incident type definitions & helpers
│           │   └── supabase.js         # Supabase browser client
│           ├── pages/
│           │   ├── LoginPage.*         # Hero + Google OAuth sign-in
│           │   └── DashboardPage.*     # Student report + Admin map & queue
│           ├── App.jsx                 # Router setup
│           ├── main.jsx                # Entry point
│           └── index.css               # Global styles, CSS variables, animations
└── server/                          # Express API
    ├── controllers/
    │   ├── auth.controllers.js        # /api/auth/me — token verification
    │   └── incident.controllers.js    # CRUD for incidents
    ├── middleware/
    │   └── auth.js                    # JWT bearer token verification
    ├── services/
    │   ├── email.services.js          # Resend email notifications
    │   └── user.service.js            # List all campus user emails
    ├── lib/
    │   ├── supabase.js                # Supabase client (anon key)
    │   └── supabaseAdmin.js           # Supabase admin client (service-role)
    ├── router/
    │   ├── auth.router.js             # Auth routes
    │   └── incident.router.js         # Incident CRUD routes
    └── server.js                      # Express app entry point
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**
- A [Supabase](https://supabase.com) project with:
  - Google OAuth enabled
  - An `incidents` table (see schema below)
  - Realtime enabled for the `incidents` table

### 1. Database Schema

Create the `incidents` table in your Supabase SQL editor:

```sql
create table public.incidents (
  id          uuid primary key default gen_random_uuid(),
  type        text not null,
  description text,
  severity    text,
  status      text default 'pending',
  reported_by uuid references auth.users(id),
  created_at  timestamptz default now()
);

-- Enable Realtime
alter publication supabase_realtime add table incidents;

-- RLS Policies
create policy "Authenticated users can read incidents"
  on public.incidents for select to authenticated using (true);

create policy "Authenticated users can insert incidents"
  on public.incidents for insert to authenticated
  with check (auth.uid() = reported_by);

create policy "Anyone can read incidents"
  on public.incidents for select to anon using (true);
```

### 2. Backend

```bash
cd server
npm install
cp .env.example .env    # fill in your Supabase credentials
npm run dev             # → http://localhost:3000
```

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key (**bypasses RLS**) |
| `SUPABASE_KEY` | Fallback if service-role key isn't set |
| `RESEND_API_KEY` | Resend API key for email notifications |
| `PORT` | Server port (default: `3000`) |
| `CLIENT_URL` | Allowed CORS origin (default: `http://localhost:5173`) |

### 3. Frontend

```bash
cd client/vite-project
npm install
cp .env.example .env    # fill in your Supabase credentials
npm run dev             # → http://localhost:5173
```

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `VITE_API_URL` | Backend URL (default: `http://localhost:3000`) |

### 4. Open the app

Visit **http://localhost:5173**, sign in with Google, and start reporting incidents. Switch to the **Admin** tab to see the live map and incident queue.

---

## 📡 API Endpoints

All `/api` routes require `Authorization: Bearer <token>` (attached automatically by the frontend).

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/test-db` | Verify Supabase connection |
| `GET` | `/api/auth/me` | Current user info |
| `POST` | `/api/incidents` | Create incident |
| `GET` | `/api/incidents` | List all incidents (newest first) |
| `PATCH` | `/api/incidents/:id/status` | Update incident status |

---

## 📜 Scripts

**Backend** (`server/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon (hot reload) |
| `npm start` | Production start |

**Frontend** (`client/vite-project/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 📄 License

MIT
