# 🚨 CampusGuard — Emergency Campus Network

A real-time emergency response system for college campuses. Students report incidents
with one tap, nearby peers get instant alerts with the recommended exit, and campus
security/admins track everything on a live map and incident queue.

## Features

- **One-tap emergency alert** — report fire, medical emergencies, harassment,
  infrastructure danger, suspicious activity, or flooding in seconds.
- **Google OAuth sign-in** — campus identity is verified via Supabase before any
  alert can be sent.
- **Student dashboard** — pick an incident type, add optional details, and broadcast
  an alert. Nearby broadcasts show distance and the recommended exit.
- **Admin dashboard** — live campus map with incident markers, an incident queue
  with status workflow (pending → active → responding → resolved), and stats
  (active incidents, responders on scene, resolved today, students alerted).

## Tech Stack

| Layer     | Technology                                                        |
| --------- | ----------------------------------------------------------------- |
| Frontend  | React 19, Vite, React Router 7, Axios, React Compiler             |
| Backend   | Node.js, Express 5                                                |
| Database  | Supabase (PostgreSQL)                                             |
| Auth      | Supabase Auth (Google OAuth) + JWT bearer tokens                  |

## Project Structure

```
├── client/
│   └── vite-project/          # React frontend
│       └── src/
│           ├── lib/           # supabase client, axios instance, incident types
│           └── pages/         # LoginPage, DashboardPage
└── server/                    # Express API
    ├── controllers/           # request handlers (auth, incidents)
    ├── middleware/            # requireAuth (JWT verification)
    ├── lib/                   # Supabase client
    ├── router/                # route definitions
    └── server.js              # app entry point
```

## Prerequisites

- Node.js 18+ (and npm)
- A [Supabase](https://supabase.com) project with:
  - **Google OAuth** enabled in Auth settings
  - An `incidents` table. Suggested columns:
    - `id` (uuid, primary key)
    - `type` (text)
    - `description` (text)
    - `severity` (text)
    - `status` (text, default `pending`)
    - `reported_by` (uuid, references `auth.users.id`)
    - `created_at` (timestamptz, default `now()`)
  - **Realtime enabled** for the `incidents` table (Database → Replication →
    enable for `incidents`) so new reports stream to the admin queue live.
  - A **SELECT policy** for authenticated users so realtime subscriptions are
    authorized — without it, `postgres_changes` events are not delivered:

    ```sql
    create policy "Authenticated users can read incidents"
    on public.incidents for select
    to authenticated
    using (true);
    ```

## Getting Started

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # create one if it doesn't exist
npm run dev            # starts on http://localhost:3000
```

Environment variables for `server/.env`:

| Variable       | Description                                            |
| -------------- | ------------------------------------------------------ |
| `SUPABASE_URL` | Your Supabase project URL (Settings → API)             |
| `SUPABASE_KEY` | Supabase service-role or anon key (Settings → API)     |
| `PORT`         | Server port (default: `3000`)                          |
| `HOST`         | Bind host (default: `0.0.0.0`)                         |
| `CLIENT_URL`   | Allowed CORS origin(s), comma-separated (default: `http://localhost:5173`) |

> **Note:** the backend verifies JWT tokens with `Supabase.auth.getUser(token)`,
> so the key you use must be one the Supabase client SDK accepts for that call
> (e.g. the anon key).

### 2. Frontend

```bash
cd client/vite-project
npm install
cp .env.example .env
npm run dev          # starts on http://localhost:5173
```

Environment variables for `client/vite-project/.env`:

| Variable                | Description                                  |
| ----------------------- | -------------------------------------------- |
| `VITE_SUPABASE_URL`     | Your Supabase project URL (Settings → API)   |
| `VITE_SUPABASE_ANON_KEY`| Supabase anon (public) key (Settings → API)  |
| `VITE_API_URL`          | Backend API base URL (default: `http://localhost:3000`) |

### 3. Open the app

Visit `http://localhost:5173`, sign in with Google, and report an incident from the
Student tab. Switch to the **Admin** tab to see the live map and incident queue.

## API Endpoints

All endpoints return JSON. Routes under `/api` (except health checks) require a
`Authorization: Bearer <token>` header with a valid Supabase session token — the
frontend attaches this automatically via an Axios interceptor.

| Method | Endpoint         | Auth | Description                                        |
| ------ | ---------------- | ---- | -------------------------------------------------- |
| GET    | `/health`        | No   | Health check                                       |
| GET    | `/test-db`       | No   | Verifies the Supabase connection                   |
| GET    | `/api/auth/me`   | Yes  | Returns the current user's `id` and `email`        |
| POST   | `/api/incidents` | Yes  | Creates an incident (`type`, `description`, `severity` in body) |
| GET    | `/api/incidents` | Yes  | Lists all incidents, newest first                  |

### Example: create an incident

```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <supabase_access_token>" \
  -d '{
    "type": "fire",
    "description": "Smoke on the 2nd floor near the fume hoods",
    "severity": "critical"
  }'
```

## Scripts

### Backend (`server/`)

| Command        | Description                 |
| -------------- | --------------------------- |
| `npm run dev`  | Start with nodemon (hot reload) |
| `npm start`    | Start in production mode    |

### Frontend (`client/vite-project/`)

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Start the Vite dev server |
| `npm run build`| Build for production     |
| `npm run lint` | Run ESLint               |
| `npm run preview` | Preview the production build |

## Notes

- The admin map and incident queue load their initial list from
  `GET /api/incidents`, then live-update via Supabase Realtime
  (`postgres_changes` on the `incidents` table).
- Nearby broadcasts currently only show alerts you've sent in this session; a
  realtime feed of other students' reports would be the next step.
