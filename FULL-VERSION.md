# Full version (retained reference)

This repo’s **full** Pop implementation is the React 19 + TypeScript + TanStack Start + Vite + Tailwind v4 + Zustand app at the repository root (`src/`).

- **Product:** floating daily task bubbles, short-press → confirm → pop + Web Audio SFX + particles  
- **Persistence:** `localStorage` key `pop-today-tasks` (Zustand persist); unfinished tasks carry over days  
- **Scope:** no categories, no history, no accounts  
- **Deploy:** Vercel (Nitro `vercel` preset in `vite.config.ts`)  
- **Static twin:** `docs/` — plain HTML/CSS/JS for GitHub Pages; same UX and shared storage key  
- **Repo:** https://github.com/WillyRelwitten/pop  
- **Status as of 2026-07-30:** full app on `main`; static site in `docs/`; easter eggs discussed, not implemented  

Do not delete the full app source when editing the static site — both are intentional.
