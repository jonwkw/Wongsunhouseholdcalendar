# Family Hub — set up your own copy

This is a family organiser web app: shared calendar/timetable, weekly menu
planner, a kids' missions-and-rocket page with daily learning games, live
"what's on" feeds, Singapore weather, English/Chinese toggle, and optional
free multi-device sync. It runs as a static site (GitHub Pages) with no
server of its own.

## 1. Run it locally

```bash
npm install
npm run dev        # opens on http://localhost:5173
```

Requires Node 20+.

## 2. Make it yours

- **Family members** — edit `src/data/seed.ts`: names, colours, who is a
  child (`isChild: true` powers the kids' rocket page), starting avatars,
  and the default daily checklist. You can also add/remove members later
  inside the app (Family tab).
- **App name** — search for "Wong Sun Family Hub" in `src/App.tsx` and
  `index.html` and rename.
- **Kids' learning content** — `src/data/kidContent.ts` holds the word
  lists (English + Chinese), maths generators, and daily missions.
- **Evergreen outing ideas** — `src/data/explore.ts` (currently
  Singapore-flavoured; swap for your city). The "Fresh right now" section
  pulls live news via Google News RSS — tweak the queries in
  `src/utils/feeds.ts` for your city.
- **Weather** — `src/utils/weather.ts` uses Singapore's NEA API; replace
  with your local weather API if you're elsewhere.

## 3. Deploy free on GitHub Pages

1. Create a new GitHub repository and push this folder to its `main` branch.
2. The included workflow (`.github/workflows/deploy.yml`) builds and
   force-pushes the site to a `gh-pages` branch on every push. The first
   push usually auto-enables Pages; if not, turn it on under
   **Settings → Pages → Deploy from branch → `gh-pages`**.
3. Your app appears at `https://<username>.github.io/<repo>/`.

## 4. Optional: multi-device family sync (free)

Out of the box each device keeps its own data (localStorage). To share one
live copy across the family: open the app → **Family tab → ☁️ Family
sync → "How do I create one?"** and follow the 5 steps (a free Firebase
Firestore project, ~5 minutes, no credit card). Then share the setup code
with your family's devices. Keep that code private — anyone holding it can
edit your data.

## Tips

- Data lives per browser until sync is on. The header has Undo/Redo for
  your own edits.
- The 🔒 button locks editing behind a grown-up maths question so kids can
  browse safely; the kids' page has its own gentler unlock.
- All text is bilingual English/Chinese — edit `src/i18n.tsx` to adjust or
  add languages.
