# Pop

A tiny daily task app. Tasks float as bubbles. Tap one, confirm, and pop it when it’s done. Unfinished tasks stick around until you deal with them. No accounts, no history, no clutter.

## Two versions in this repo

| Version | Where | Host with |
| --- | --- | --- |
| **Static HTML** (simple) | [`docs/`](./docs/) | **GitHub Pages** — no build step |
| **Full app** (React + TanStack Start) | repo root (`src/`, Vite) | **Vercel** — needs a build |

Same product behavior: floating bubbles, confirm-to-pop, pop SFX, localStorage carry-over (`pop-today-tasks`).

---

## Static HTML (recommended if you want “just put it online”)

Files:

- `docs/index.html`
- `docs/styles.css`
- `docs/app.js`
- `docs/favicon.svg`, `docs/apple-touch-icon.png`, `docs/manifest.webmanifest`

### Enable GitHub Pages

1. Repo **Settings → Pages**
2. **Source:** Deploy from a branch
3. **Branch:** `main` → folder **`/docs`**
4. Save

After a minute you’ll get something like:

`https://willyrelwitten.github.io/pop/`

Open that on your phone → Share → **Add to Home Screen**.

You can also open `docs/index.html` locally in a browser (double-click or any static server).

---

## Full React app (Vercel)

```bash
npm install
npm run dev        # local
npm run build
npm run typecheck
```

Deploy: import this repo on [vercel.com/new](https://vercel.com/new) → Deploy.

The full app is the original build (TypeScript, TanStack Start, Tailwind, Zustand). Keep it if you want that deploy path later; day-to-day use can be the static `docs/` site.

---

## Features (both versions)

- Floating bubble tasks with soft physics  
- Confirm before complete (no accidental pops)  
- Satisfying pop animation + sound  
- Unfinished tasks persist in the browser  
- Mobile-first, installable feel  

## Notes

- Tasks stay on your device (localStorage).  
- Completing a task is permanent in the app (no history on purpose).  
- Easter eggs brainstormed, not shipped yet.
