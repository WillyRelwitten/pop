# Pop

A tiny daily task app. Tasks float as bubbles. Tap one, confirm, and pop it when it’s done. Unfinished tasks stick around until you deal with them. No accounts, no history, no clutter.

## Features

- Floating bubble tasks with soft physics
- Confirm-before-pop (no accidental completes)
- Satisfying pop animation + sound
- Unfinished tasks persist in your browser (local storage)
- Mobile-first, installable as a home-screen web app

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:8080`).

```bash
npm run build      # production build
npm run typecheck  # TypeScript
```

## Deploy (Vercel — recommended)

This app is set up for **Vercel** (TanStack Start + Nitro).

1. Push this repo to GitHub (already done if you’re reading this).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Leave defaults → Deploy.

After deploy you’ll get a public URL you can share or add to your phone home screen.

### Optional: custom domain

In the Vercel project → **Settings → Domains**, add something like `pop.yourdomain.com`.

## Stack

- React 19 + TypeScript
- TanStack Start / Router
- Tailwind CSS v4
- Zustand (persisted tasks)
- Vite

## Notes

- Tasks never leave your device — they live in `localStorage` under the key `pop-today-tasks`.
- Completing a task is permanent in the app (no history on purpose).
- Audio unlocks on first tap (mobile browser policy).
