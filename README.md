# Ellivance (lite) — post an event, RSVP a place

The trimmed-down version of Ellivance: sign up, post an event, and RSVP to
book a place — nothing else. Built for a student project where the goal is
a clean, understandable, fully working system rather than a feature-complete
clone of Eventbrite.

## What's here (and what isn't)

**Included:** signup/login/logout, post/edit/delete an event, browse with
text + date-range search, an event detail page, RSVP with a hard capacity
limit enforced by the database (not just the UI), a share button (native
share sheet on mobile, copy-link fallback on desktop), a profile page (name
+ avatar), and a dashboard split into "events you posted" and "events
you're going to."

**Still deliberately left out**, to keep this understandable: rich text
editor (plain textarea instead), multi-step wizard (single form instead),
tags/categories, QR tickets, payments, notifications, an admin panel, and
reviews/comments. The fuller build ("Ellivance," not "lite") already has
these if you need them later.

## 1. Set up Supabase (free tier)

1. Create a project at [supabase.com](https://supabase.com) — no cost.
2. **SQL Editor** → paste and run all of `supabase/schema.sql`. This creates
   three tables (`profiles`, `events`, `rsvps`), Row Level Security policies,
   a trigger that enforces event capacity server-side, and two public storage
   buckets (`event-banners` and `avatars`). If you already ran an earlier
   version of this file, it's still safe to re-run in full — every statement
   uses `if not exists` / `or replace` / `drop policy if exists`.
3. **Project Settings → API** → copy your Project URL and **anon public** key.
4. Optional: **Authentication → Providers → Email** → turn off "Confirm
   email" while testing, so new accounts can sign in immediately.

**One thing to remember before a demo or submission**: Supabase pauses free
projects after 7 days with no activity. If you haven't opened the app in a
week, log into the Supabase dashboard and resume the project *before* you
need to show it — otherwise it'll look offline for a few seconds while it
wakes up, or need a manual "resume" click.

## 2. Run it

```bash
cp .env.example .env
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

## 3. Deploy for free (optional)

Push this folder to a GitHub repo, then import it on
[Netlify](https://netlify.com) or [Vercel](https://vercel.com) (both free
for a project this size). Build command `npm run build`, publish directory
`dist`, and add the same two environment variables in the host's dashboard.

## How capacity enforcement works

The `capacity` check isn't just a disabled button in the UI — it's a
Postgres trigger (`enforce_event_capacity` in `schema.sql`) that runs
*inside the database* before any RSVP is inserted, counting existing RSVPs
and rejecting the insert if the event is already full. That means even a
direct API call that skips your React code entirely still can't over-book
an event — worth mentioning if your project write-up discusses how you
enforced business rules, not just how the UI looks.
