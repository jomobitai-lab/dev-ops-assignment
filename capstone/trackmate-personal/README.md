# TrackMate — Personal Progress Tracker

A personal app to track **gym workouts, body weight, nutrition (calories + macros),
sleep, earnings, and achievements**, with a dashboard of progress graphs, personal
records (PRs), and an activity calendar.

Built with **FastAPI** (backend) + **React/Vite** (frontend). Deploys on **Vercel**
(serverless) with a **Neon** Postgres database. Runs locally on SQLite with zero setup.

## Features
- 🏋️ **Workouts** — pick exercises from a built-in template library, log weight / sets / reps / comments, label each day (e.g. "Chest + Triceps").
- ⚖️ **Body weight** — log weight, set a target, see the trend.
- 🍽️ **Nutrition** — daily calories + protein/carbs/fat vs targets.
- 😴 **Sleep** — bedtime + wake time, hours auto-calculated.
- 💰 **Earnings** — income entries with running total.
- 🏆 **Achievements** — milestones you want to remember.
- 🎯 **Goals** — targets for weight, calories, protein, savings.
- 📊 **Dashboard** — weight/calorie/earnings charts, PRs, and a workout activity heatmap.
- 🔒 **Simple password login** so your data stays private online.

## Run locally

**1. Backend (FastAPI)**
```bash
cd api
python -m venv .venv && source .venv/bin/activate
pip install -r ../requirements.txt
export APP_PASSWORD="your-password"
export SECRET_KEY="any-long-random-string"
# DATABASE_URL not set -> uses a local SQLite file automatically
uvicorn app.main:app --reload --port 8000
```

**2. Frontend (React)**
```bash
cd frontend
npm install
npm run dev          # opens http://localhost:5173 (proxies /api to :8000)
```

Open http://localhost:5173 and log in with your password.

## Deploy on Vercel (free) with Neon (free Postgres)

1. **Create a Neon project** at neon.tech → copy the **pooled** connection string
   (the one with `-pooler` in the host).
2. **Import this folder** into Vercel (New Project → pick the repo → set the root
   directory to `capstone/trackmate-personal`).
3. In Vercel → **Settings → Environment Variables**, add:
   - `DATABASE_URL` = your Neon pooled connection string
   - `APP_PASSWORD` = the password you want to log in with
   - `SECRET_KEY` = a long random string
4. **Deploy.** The frontend is served as static files and the API runs as a Python
   serverless function at `/api/*`. Tables are created automatically on first request.

## Notes
- Never commit `.env` (it's gitignored). Use `.env.example` as the template.
- The database is just an env var — switch between local SQLite and Neon with no code change.
