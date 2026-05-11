# FinFlow — Full-Stack Expense Tracker

A production-ready personal finance management platform with a premium fintech UI.

## Tech Stack

**Frontend:** React 18 + Vite, Tailwind CSS, Framer Motion, Recharts, React Hook Form, Lucide Icons  
**Backend:** Node.js, Express.js, MongoDB + Mongoose, JWT Auth, Multer  
**Fonts:** Sora (display) + DM Sans (body) + JetBrains Mono

## Features

- Dashboard with animated stat cards, area charts, donut charts
- Full CRUD for expenses (with receipt upload, tags, recurring, location)
- Income management with source breakdown
- Credit card tracking with beautiful 3D-style card UI and utilization meters
- Budget planner with progress bars and overspending alerts
- Analytics with 12-month trends, category breakdown, savings rate
- Dark/light mode toggle
- JWT auth with profile management and avatar upload
- Seeded demo data

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Clone & install

```bash
# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

### 2. Configure backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Seed demo data (optional)

```bash
cd backend
npm run seed
# Demo login: demo@example.com / password123
```

### 4. Start development

```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm run dev
```

App runs at: http://localhost:5173  
API runs at: http://localhost:5000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get profile |
| PUT | `/api/auth/profile` | Update profile |
| GET | `/api/expenses` | List expenses (pagination, filters) |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/income` | List income |
| POST | `/api/income` | Add income |
| GET | `/api/cards` | List cards |
| POST | `/api/cards` | Add card |
| GET | `/api/budgets` | Get budgets with spending |
| POST | `/api/budgets` | Set budget |
| GET | `/api/analytics/dashboard` | Dashboard stats |
| GET | `/api/analytics/monthly-trend` | 12-month trend |
| GET | `/api/analytics/category-trend` | YTD category breakdown |

## Folder Structure

```
expense-tracker-fullstack/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/seed.js
│   ├── uploads/
│   ├── server.js
│   └── .env
└── frontend/
    └── src/
        ├── api/
        ├── components/
        │   ├── charts/
        │   ├── layout/
        │   └── ui/
        ├── context/
        ├── pages/
        └── utils/
```

## Deployment

**Backend (Railway / Render):**
- Set environment variables from `.env`
- Use MongoDB Atlas for cloud database
- Set `NODE_ENV=production`

**Frontend (Vercel / Netlify):**
- Build: `npm run build`
- Set `VITE_API_URL` if deploying separately
- Update `vite.config.js` proxy for production
