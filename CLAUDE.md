<!-- claude --resume "expense-tracker-app" -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (`/backend`)

```bash
npm run dev       # nodemon server.js — auto-restarts on change
npm start         # production start
npm run seed      # populate MongoDB with 12 months of demo data (demo@example.com / password123)
```

### Frontend (`/frontend`)

```bash
npm run dev       # Vite dev server on :7002
npm run build     # production build to dist/
npm run preview   # preview production build locally
```

Both packages must be installed separately — there is no root-level package.json or workspace config.

## Architecture

Two independent apps: `backend/` (Express API on :7052) and `frontend/` (React/Vite on :7002). Vite proxies `/api/*` and `/uploads/*` to `:7052` during development, so the frontend always calls relative paths like `/api/expenses`.

### Backend structure

MVC pattern with CommonJS modules:

- `server.js` → `src/app.js` (Express setup + route mounting) → `src/routes/*.js` → `src/controllers/*.js`
- All resource routes (expenses, income, cards, budgets, analytics) require the `protect` middleware from `src/middleware/auth.js`, which reads JWT from `Authorization: Bearer <token>` header or `token` cookie.
- `req.user` is the full Mongoose User document, available in every protected controller.
- All API responses follow `{ success: true/false, data, message?, total?, pages? }`.
- Uploaded files land in `uploads/receipts/` or `uploads/avatars/` and are served statically at `/uploads/*`.
- `src/utils/seed.js` uses its own `mongoose.connect` call — run it directly with `node src/utils/seed.js` from the backend directory (or `npm run seed`).

### Frontend structure

- **Auth:** `AuthContext` (in `src/context/`) stores `user` state. Token persists in `localStorage` and is attached to every request by the Axios interceptor in `src/api/axios.js`. A 401 response clears storage and redirects to `/login`.
- **Routing:** `App.jsx` wraps protected pages in `<ProtectedRoute>` (redirects to `/login`) and public pages in `<PublicRoute>` (redirects to `/dashboard` if already logged in). All authenticated pages are children of `AppLayout` which renders `Sidebar` + `Header` + `<Outlet>`.
- **Data fetching:** Each page fetches its own data with `useEffect` + `useState`. There is no global data cache or query library — API calls go directly through the `api` Axios instance.
- **Forms:** All forms use `react-hook-form`. Validation errors display as `<p className="text-red-400 text-xs mt-1">`.
- **Charts:** Three chart components in `src/components/charts/` wrap Recharts primitives — `AreaChart.jsx` (multi-series area), `DonutChart.jsx` (pie/donut), `BarChart.jsx` (bar). They each accept normalized `data` arrays and handle their own custom tooltips.

## Design System

Tailwind is configured with custom tokens in `tailwind.config.js`:

- **Colors:** `brand-500` = `#6366f1` (indigo), `emerald-500` = `#10b981`. Use these for primary/positive indicators respectively.
- **Fonts:** `font-display` = Sora, `font-body` = DM Sans, `font-mono` = JetBrains Mono (loaded from Google Fonts in `index.html`).
- **Custom shadows:** `shadow-glow` (indigo), `shadow-glow-emerald`, `shadow-card`.

Shared UI utility classes are defined as `@layer components` in `src/index.css` — prefer these over ad-hoc Tailwind when they match:

| Class                            | Purpose                                                                      |
| -------------------------------- | ---------------------------------------------------------------------------- |
| `.glass`                         | `bg-white/5 backdrop-blur-xl border border-white/10` — standard card surface |
| `.glass-dark`                    | Darker inset surface inside cards                                            |
| `.card`                          | `.glass` + `rounded-2xl p-6 shadow-card`                                     |
| `.stat-card`                     | Animated metric card with `relative overflow-hidden`                         |
| `.btn-primary`                   | Brand-colored CTA button                                                     |
| `.btn-secondary`                 | Ghost button                                                                 |
| `.btn-danger`                    | Red-tinted destructive button                                                |
| `.input-field`                   | Standardized form input                                                      |
| `.label`                         | `text-xs uppercase tracking-wider text-slate-400`                            |
| `.badge`                         | Inline tag/chip                                                              |
| `.skeleton`                      | `bg-white/5 rounded-xl animate-pulse` loading placeholder                    |
| `.nav-item` / `.nav-item.active` | Sidebar navigation links                                                     |

**Do not use arbitrary opacity values like `bg-white/8`** — Tailwind v3 only generates opacity steps that appear in source. Stick to `/5`, `/10`, `/20`, `/25` etc.

## Key Conventions

- **Card numbers** are stored as plain strings (no hashing). `maskCardNumber()` in `src/utils/helpers.js` formats display.
- **Expense ↔ Card relationship:** Creating/deleting an expense with a `card` field automatically increments/decrements `Card.currentUsage` in the controller. Keep this side-effect in mind when modifying expense mutations.
- **Budget upsert:** `POST /api/budgets` uses `findOneAndUpdate` with `upsert: true` on `{user, category, month, year}` — re-posting the same category/month updates rather than duplicates.
- **Analytics controllers** use MongoDB aggregation pipelines directly — no Mongoose virtuals or population.
- `CATEGORY_COLORS`, `CATEGORY_ICONS`, `SOURCE_COLORS`, `CARD_GRADIENTS` are the single source of truth for visual mappings — always import from `src/utils/helpers.js` rather than redefining locally.
