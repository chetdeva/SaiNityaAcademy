# SaiNitya Academy

Next.js + Supabase MVP for live Grade 3 math tutoring. Students and teachers share one backend so a later React Native app can use the same Auth, tables, and RLS.

## What this MVP includes

- Email/password sign up and sign in as **student** or **teacher**
- Role dashboards (WHJR-style student home, calendar-first teacher home)
- Teacher availability, student book / cancel / reschedule
- **Join Class** on Zoom, enabled 10 minutes before the session
- Curriculum launchpad: Khan Academy, Zoom whiteboard, Drive sheets, GeoGebra

Placeholder shells (visible, not wired): rewards, daily quest, mastery radar, showcase, wallet, chat, report cards, recordings.

## Setup

1. Create a [Supabase](https://supabase.com) project.
2. In **SQL Editor**, run [`supabase/migrations/20260827100000_init.sql`](supabase/migrations/20260827100000_init.sql).
3. Auth → Providers → Email: turn **off** “Confirm email” while developing.
4. Copy env and fill in project keys:

```bash
cp .env.example .env.local
```

5. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) locally, or the production app at [https://sai-nitya-academy.vercel.app](https://sai-nitya-academy.vercel.app).

In **Authentication → URL Configuration** set:

- Site URL: `https://sai-nitya-academy.vercel.app`
- Redirect URLs:
  - `https://sai-nitya-academy.vercel.app/auth/callback`
  - `http://127.0.0.1:3000/auth/callback`
  - `http://localhost:3000/auth/callback`

Signup confirmation emails use `emailRedirectTo` on the current origin (`/auth/callback`), so production links no longer send you to localhost.

## First-run demo

1. Sign up as a **teacher**. Paste a Zoom join URL (or set `NEXT_PUBLIC_DEMO_ZOOM_URL`). Save weekday availability (default 16:00–20:00 IST).
2. Sign up as a **student** in another browser/profile.
3. Student: Schedule → Book a slot. Dashboard **Join Class** unlocks 10 minutes before start.

Class length is 50 minutes. Times are **Asia/Kolkata**.

## React Native later

Keep business logic in `src/lib/` (slot math, join window, lesson pack) and in Supabase. Do not add Next.js API routes for booking or profiles. The Expo app should call `@supabase/supabase-js` with the same JWT.

## Grade 3 / COPPA

This MVP uses student self-serve accounts. For real Grade 3 production, add a parent/guardian account and consent flow.
