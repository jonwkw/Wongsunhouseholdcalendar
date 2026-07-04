# 🏡 Wong Sun Family Hub

A household management web app for the whole family — parents, grandma, helper, and kids (big enough text and icons that a 6-year-old reader can follow along).

## Modules

- **Today** (default view) — today + the next 2 days at a glance: activities, notes & reminders, the day's menu, weather snapshot, and anything due from the Family Board.
- **Timetable** — Monday–Sunday week view for every family member.
  - Drag activity cards from the **Activity library** onto any day (or tap the card, then tap a day — works on tablets).
  - Activities can be one-off or **recurring** (pick weekdays, optional end date), with time, location, and notes.
  - Notes & reminders can be tagged to any day; reminders have a tick-off checkbox.
  - Navigate week by week or jump straight to any date up to **one year ahead** (for the academic calendar).
  - Filter by family member.
- **Menu** — weekly meal planner (breakfast / lunch / dinner / snack).
  - Drag dishes from the **Dish library** into a meal box, or tap any box and type directly.
  - Every entry shows who added it.
- **Weather** — today + next 3 days for Singapore, live from NEA (data.gov.sg, no API key), with friendly reminders like "☔ Bring an umbrella!".
- **Family Board** — special requests ("can we add this to the menu?") and one-off reminders ("balcony clean"), with replies and done-ticking.

Family members are switched by tapping an avatar in the header (no passwords — trusted household devices). Edit names/emoji or add members via the ⚙️ button.

## Running it

```bash
npm install
npm run dev      # local development
npm run build    # production build in dist/
```

## Stage 1 vs Stage 2

- **Stage 1 (this)**: all data is stored in the browser (localStorage), so each device keeps its own copy.
- **Stage 2 (planned)**: dynamic updates — a small backend (or hosted DB like Firebase/Supabase) so everyone sees the same data live. The app is ready for this: all reads/writes go through one store (`src/store.tsx`), so only `load`/`persist` need swapping.
