# Camp Ops – Biology Camp Operations System

A full-stack **LINE Bot + LIFF Web App + Admin Dashboard** for running a biology camp.
Real-time points leaderboard · QR check-in · Homework grading · Incident reporting · Offline PWA

---

## 🗂️ Monorepo Structure

```
BioCamp/
├── backend/          # 🐍 Python FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── auth/       # JWT + LINE token
│   │   ├── routers/    # One file per feature
│   │   ├── ws/         # WebSocket manager
│   │   └── services/   # S3, LINE push, scheduler
│   ├── alembic/        # DB migrations
│   ├── scripts/        # seed.py, import_schedule.py
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/         # ⚛️ Next.js 14 (LIFF + Admin)
│   ├── app/
│   │   ├── schedule/today/    # Camper: Now & Next
│   │   ├── points/            # Leaderboard + log
│   │   ├── homework/          # Submit & view grades
│   │   ├── announcements/
│   │   ├── checkin/scan/      # QR scanner
│   │   ├── me/                # Profile + quick links
│   │   ├── photos/            # Photo wall
│   │   ├── incidents/new/     # Report form
│   │   └── admin/             # Staff pages (role-gated)
│   │       ├── game/          # Rapid scoring
│   │       ├── schedule/      # Editor
│   │       ├── points/        # Console + audit
│   │       ├── homework/      # Grade submissions
│   │       ├── checkin/       # QR generator
│   │       ├── announcements/
│   │       ├── photos/        # Publish manager
│   │       ├── incidents/     # Private list
│   │       └── users/         # Groups + roles
│   ├── components/
│   ├── lib/          # LIFF, auth, API client, WS hook
│   ├── Dockerfile
│   └── package.json
└── infra/
    └── docker-compose.yml    # Local dev: postgres + minio + redis
```

---

## ⚙️ Prerequisites

1. **Node.js 20+** and **npm**
2. **Python 3.11.3** (Anaconda environment `BioCamp`)
3. **Docker** (for local dev with services)
4. **LINE Developer Account** → [developers.line.biz](https://developers.line.biz)

---

## 1️⃣ LINE Setup (Required Before Running)

### A. Create a Messaging API Channel
1. Go to LINE Developers Console → **Create a new channel** → **Messaging API**
2. Note: **Channel Secret** and **Channel Access Token**
3. Set **Webhook URL**: `https://your-backend-url/api/line/webhook`
4. Enable **Use webhook**

### B. Create a LINE Login Channel (for LIFF)
1. Create a new channel → **LINE Login**
2. Note: **Channel ID** (this is `LINE_LOGIN_CHANNEL_ID`)
3. Under the channel → **LIFF** tab → **Add** a LIFF app
   - Endpoint URL: `https://your-frontend-url`
   - Scope: `profile openid`
   - Note the **LIFF ID**

---

## 2️⃣ Local Development

### Step 1: Copy env files
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```
Fill in your LINE credentials in both files.

### Step 2: Start infrastructure (postgres + minio + redis)
```bash
cd infra
docker compose up -d postgres minio redis
```

### Step 3: Backend (Anaconda BioCamp env)
```bash
conda activate BioCamp
cd backend
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Seed sample data
python scripts/seed.py

# Start dev server
uvicorn app.main:app --reload --port 8000
```
API docs at: http://localhost:8000/docs

### Step 4: Frontend
```bash
cd frontend
npm install
npm run dev
```
App at: http://localhost:3000

### Step 5: MinIO Setup (first time only)
1. Open MinIO console: http://localhost:9001 (user: `minioadmin`, pass: `minioadmin_secret`)
2. The backend auto-creates the `campops` bucket on first file upload.

---

## 3️⃣ Deploy to Render.com

### Backend (Web Service)
1. Create a **Web Service** → connect your GitHub repo → **Root directory: `backend`**
2. **Runtime**: Python 3
3. **Build command**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Start command**:
   ```bash
   alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
5. **Environment variables** (from `backend/.env.example`):
   - `DATABASE_URL` → Render PostgreSQL connection string (use `postgresql+asyncpg://...`)
   - `JWT_SECRET` → long random string
   - `LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_LOGIN_CHANNEL_ID`
   - `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_PUBLIC_BASE_URL`
   - For S3, use **Cloudflare R2** or **AWS S3** in production

### Database (PostgreSQL)
1. Create a **PostgreSQL** instance on Render
2. Copy the **Internal Database URL** to the backend's `DATABASE_URL` env var
3. Change `postgresql://` to `postgresql+asyncpg://`

### Frontend (Static Site or Web Service)
1. Create a **Web Service** → Root directory: `frontend`
2. **Build command**: `npm install && npm run build`
3. **Start command**: `npm start`
4. **Environment variables**:
   - `NEXT_PUBLIC_API_BASE_URL` → your backend Render URL (e.g. `https://camp-ops-backend.onrender.com`)
   - `NEXT_PUBLIC_LIFF_ID` → your LINE LIFF ID

---

## 4️⃣ Import Schedule from CSV/Excel

```bash
conda activate BioCamp
cd backend
python scripts/import_schedule.py schedule.csv <staff_user_id>
```

CSV columns: `title, start_at, end_at, location_text, maps_url, description, is_published`

Example:
```csv
title,start_at,end_at,location_text,maps_url,description,is_published
DNA Extraction Lab,2026-07-01 10:00,2026-07-01 12:00,Lab A,,Hands-on experiment,true
```

---

## 5️⃣ Running Tests

```bash
conda activate BioCamp
cd backend
pip install aiosqlite  # SQLite for test DB
pytest tests/ -v
```

Tests cover:
- JWT valid/invalid tokens
- Points: staff can add, camper cannot
- Points: undo creates reversal
- Check-in: duplicate scan returns 409

---

## 6️⃣ Promote User to Staff/Admin

After a user first logs in via LIFF, their user ID appears in `/api/auth/me`.
Use the Admin panel (`/admin/users`) or the API directly:

```bash
curl -X PATCH "https://your-api/api/groups/<user_id>/role?role=staff" \
  -H "Authorization: Bearer <admin_jwt>"
```

---

## 📋 Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Description |
|------|------|
| `DATABASE_URL` | PostgreSQL async URL (`postgresql+asyncpg://...`) |
| `JWT_SECRET` | Long random secret for JWT signing |
| `LINE_CHANNEL_SECRET` | Messaging API channel secret |
| `LINE_CHANNEL_ACCESS_TOKEN` | Messaging API access token |
| `LINE_LOGIN_CHANNEL_ID` | LINE Login channel ID (for LIFF token verify) |
| `S3_ENDPOINT` | S3 endpoint (MinIO: `http://localhost:9000`) |
| `S3_BUCKET` | Bucket name (default: `campops`) |
| `S3_ACCESS_KEY` | S3 access key |
| `S3_SECRET_KEY` | S3 secret key |
| `S3_PUBLIC_BASE_URL` | Public base URL for uploaded files |
| `REDIS_URL` | Redis URL (optional; default `redis://localhost:6379/0`) |
| `TZ` | Timezone (default: `Asia/Taipei`) |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|------|------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend URL (e.g. `http://localhost:8000`) |
| `NEXT_PUBLIC_LIFF_ID` | LINE LIFF App ID |

---

## 🔒 Security Notes
- LINE webhook signature is validated on every request
- LINE LIFF idToken is verified against LINE's API before issuing app JWT
- All staff-only actions enforce role server-side
- File uploads are limited by server memory; add nginx limits in production
- Incident reports are staff-only; high severity auto-pushes LINE notification

---

## 📱 Offline Support (PWA)
The LIFF app uses a service worker (via `next-pwa`) to cache:
- `/schedule/today` page and its API response
- `/points/leaderboard` API response

When offline, campers see cached data with a "last updated at…" timestamp.
When back online, data refreshes automatically.
