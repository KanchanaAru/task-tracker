# Task Tracker — setup and deployment guide

Next.js 15 (App Router) + TypeScript + Tailwind v4 + Supabase (Auth + PostgreSQL).
All data operations go through `/api/*` route handlers — no component talks to the database directly.

---

## Step 1 — Open the project in VS Code

Unzip the folder, then:

```bash
cd task-tracker
code .
```

Install dependencies (Node 18.18+ required, Node 20+ recommended):

```bash
npm install
```

Useful VS Code extensions: **ESLint**, **Tailwind CSS IntelliSense**, **Prettier**.

---

## Step 2 — Create the Supabase project

1. Go to https://supabase.com → **New project**.
2. Name it `task-tracker`, set a database password, pick the region closest to you (Singapore or Mumbai from Sri Lanka), and create it. Wait ~2 minutes.
3. In the sidebar go to **Authentication → Sign In / Providers → Email** and turn **Confirm email** *off* while you are developing. That lets sign-up log you straight in. Turn it back on before you hand the app to real users.

---

## Step 3 — Create the tables

1. Sidebar → **SQL Editor** → **New query**.
2. Paste the entire contents of `supabase/schema.sql` and press **Run**.
3. Sidebar → **Table Editor** — you should now see `profiles` and `tasks`.

What that script creates:

| Table | Purpose | Relationship |
|---|---|---|
| `profiles` | one row per user | `profiles.id` → `auth.users.id` (FK, cascade delete) |
| `tasks` | title, description, priority, status, due date | `tasks.user_id` → `profiles.id` (FK, cascade delete) |

It also adds a trigger that creates a profile row automatically at sign-up, an `updated_at` trigger, and Row Level Security so a user can only read and write their own rows.

---

## Step 4 — Add your environment variables

In Supabase: **Project Settings → API keys** (or **Data API**). Copy the Project URL and the `anon` public key.

In VS Code, create a file called `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

`.env.local` is git-ignored. Never commit it. The `anon` key is safe in the browser because RLS is on — the `service_role` key is not, so don't put it in this app.

---

## Step 5 — Run it

```bash
npm run dev
```

Open http://localhost:3000. You'll be redirected to `/login`. Create an account at `/signup`, and you land on the dashboard.

Check it worked: add a task on the **Board**, then look at **Table Editor → tasks** in Supabase. The row is really there.

---

## Step 6 — Test the two viewports

In Chrome: `F12` → device toolbar (`Ctrl/Cmd + Shift + M`).

- **375px** — columns stack vertically, the task dialog slides up from the bottom, nav wraps.
- **1280px+** — three columns side by side, five stat tiles in one row.

---

## Step 7 — Push to GitHub

```bash
git init
git add .
git commit -m "Task tracker"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/task-tracker.git
git push -u origin main
```

---

## Step 8 — Deploy to Vercel

1. https://vercel.com → **Add New → Project** → import your GitHub repo.
2. Framework preset: Next.js (detected automatically). Leave build settings alone.
3. Expand **Environment Variables** and add both keys from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy**. You get a URL like `https://task-tracker-xyz.vercel.app`.
5. Back in Supabase → **Authentication → URL Configuration**: set **Site URL** to your Vercel URL, and add it under **Redirect URLs**. (Needed once you turn email confirmation back on.)

Every `git push` to `main` redeploys.

---

## Project map

```
src/
  middleware.ts              refreshes the session, guards every route
  app/
    layout.tsx               fonts, global styles
    login/ signup/           auth screens
    (app)/layout.tsx         nav + auth guard for signed-in pages
    (app)/dashboard/page.tsx counts by status, overdue list
    (app)/tasks/page.tsx     the board
    api/tasks/route.ts       GET list (filters), POST create
    api/tasks/[id]/route.ts  PATCH edit or change status, DELETE
    api/stats/route.ts       dashboard counts, computed on the server
  components/                Nav, Board, TaskCard, TaskForm
  lib/supabase/              browser client, server client + requireUser()
  lib/types.ts               shared task types and labels
supabase/schema.sql          tables, FKs, triggers, RLS policies
```

## API reference

| Method | Route | Body / query | Returns |
|---|---|---|---|
| GET | `/api/tasks` | `?status=&priority=&q=` | `{ tasks }` |
| POST | `/api/tasks` | `title, description, priority, status, due_date` | `{ task }` |
| PATCH | `/api/tasks/:id` | any subset of the above | `{ task }` |
| DELETE | `/api/tasks/:id` | — | `{ ok: true }` |
| GET | `/api/stats` | — | `{ stats }` |

Every route calls `requireUser()` first and returns 401 without a session. Writes are scoped with `.eq("user_id", user.id)` *and* enforced again by RLS in the database.

---

## If something breaks

**"Invalid API key" or a redirect loop back to /login** — `.env.local` is missing, misspelled, or the dev server wasn't restarted after you created it. Stop and rerun `npm run dev`.

**Sign-up succeeds but nothing appears in `profiles`** — the trigger from Step 3 didn't run. Re-run `supabase/schema.sql`.

**Tasks save but the board is empty** — you're signed in as a different user than the one that owns the rows, or RLS policies weren't created. Check `tasks.user_id` against **Authentication → Users**.

**`Module not found: @/lib/...`** — the `paths` alias lives in `tsconfig.json`; make sure you opened the project root in VS Code, not a parent folder.

**Vercel build fails on types** — run `npm run build` locally first; it reproduces the same errors with better context.

---

## Optional next steps

- Swap the raw `select` elements for shadcn/ui (`npx shadcn@latest init`) — the layout already leaves room for it.
- Add Prisma or Drizzle if your brief requires an ORM: point `DATABASE_URL` at the Supabase connection pooler and introspect the existing schema with `npx prisma db pull`.
- Add a `labels` table with a many-to-many join to `tasks` if you want a third relationship.
