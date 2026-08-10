# GroupOrder

A fast, mobile-first group food-ordering app. One person starts a session,
shares a link, and everyone adds their own order from their phone — all
orders land in one shared, live-updating list. Built on **React + Supabase**,
hosted for free on **GitHub Pages**. No backend server, no accounts.

## How it works

- The frontend talks to Supabase directly (Postgres + auto-generated REST
  API + realtime), so there's nothing to deploy except the static site.
- Anyone with the session link can add orders — no login. The person who
  creates a session becomes the **organizer** (their browser holds a secret
  token that unlocks rename/close/mark-paid/edit-any-order controls).
- Data lives in Supabase Postgres and survives refreshes; every connected
  browser gets live updates via Supabase Realtime.

**Honest limitation:** since there are no accounts, "ownership" of an order
is enforced by the app, not the database — anyone with database access
(not just app users) could technically edit any row. Fine for a small trusted
friend group; don't use this for anything sensitive without adding real auth.

---

## 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates
   the `sessions` and `orders` tables, security policies, and turns on
   realtime.
3. Go to **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key

---

## 2. Run it locally (optional but recommended first)

```bash
npm install
cp .env.example .env
# paste your Supabase URL + anon key into .env
npm run dev
```

Open the printed localhost URL, start a session, and confirm orders save
and show up after a refresh.

---

## 3. Deploy with GitHub Pages (via GitHub Actions)

1. Push this project to a new GitHub repository.
2. In the repo, go to **Settings → Pages** and set **Source** to
   "GitHub Actions".
3. Go to **Settings → Secrets and variables → Actions → New repository
   secret** and add two secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Push to the `main` branch (or run the workflow manually from the
   **Actions** tab). The included workflow
   ([`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)) will
   build the app and publish it to GitHub Pages automatically, setting the
   correct base path from your repo name.
5. Your app will be live at:
   `https://<your-username>.github.io/<your-repo-name>/`

Every future push to `main` redeploys automatically.

---

## Project structure

```
src/
  components/
    SessionSetup.jsx   # create-session / join-by-code screen
    SessionView.jsx     # active session shell (header, share, close)
    OrderForm.jsx        # fast "add your order" form
    OrderList.jsx         # receipt-style order rows, edit/delete, payment
    Summary.jsx            # people / items / grand total
  lib/utils.js       # peso formatting, code/token generation
  supabaseClient.js   # Supabase client (reads .env)
supabase/schema.sql   # database schema + RLS policies + realtime setup
```

## What's intentionally NOT built yet (see the app's own "future features")

QR codes, order history, menu presets, split-bill logic, GCash tracking,
Excel export, print view, dark mode, PWA install, multi-restaurant
support, real accounts. The code is organized so any of these can be added
without a rewrite — new columns/tables on the Supabase side, new
components on the React side.
