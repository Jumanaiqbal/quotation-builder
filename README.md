# Quotify — AI-Assisted Quotation Builder

Full-stack technical test submission: React + Express + PostgreSQL + Anthropic AI + n8n.

## Quick start

### Backend
```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY, N8N_WEBHOOK_URL
npm install
npm run prisma:migrate
npm run seed
npm run dev            # http://localhost:4000
```

### Frontend
```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:4000/api
npm install
npm run dev            # http://localhost:5173
```

### Login
- Email: `admin@example.com`
- Password: `password123`

## n8n setup (spec: Approved only)

**When does n8n run?** Only when status becomes **Approved** — not on Send, not on Reject.

```
Draft  →  [Preview & Send]  →  Sent
Sent   →  client approves on /review/:token  OR  admin clicks "Approve (triggers n8n)"
       →  status = Approved  →  POST to N8N_WEBHOOK_URL  →  n8n emails your team
```

1. Import `n8n/quotation-approved-gmail-workflow.json` (Gmail) or `quotation-approved-workflow.json` (SMTP)
2. Use a normal **Send** email node — **not** "Send and wait for response"
3. Fix webhook path: `quotation-approved` (no leading space)
4. Copy production webhook URL into `backend/.env`:
   ```
   N8N_WEBHOOK_URL=https://your-n8n.app/webhook/quotation-approved
   ```
5. Activate the workflow in n8n

## Tests

```bash
cd backend && npm run test:run   # 90 unit tests
```

## Deployment (Vercel)

Both apps deploy as separate Vercel projects from this monorepo.

### Backend (`backend/`)
1. Vercel → New Project → import this repo → **Root Directory: `backend`**
2. Framework preset: **Other** (the Express app is exported from `api/index.ts`)
3. Environment variables:
   - `DATABASE_URL` (Supabase pooled connection string)
   - `DIRECT_URL` (Supabase direct connection string)
   - `JWT_SECRET`
   - `ANTHROPIC_API_KEY`
   - `N8N_WEBHOOK_URL`
   - `FRONTEND_URL` (the deployed frontend URL — set after step 2 below)
4. Deploy — `postinstall` runs `prisma generate` automatically

### Frontend (`frontend/`)
1. Vercel → New Project → same repo → **Root Directory: `frontend`**
2. Framework preset: **Vite**
3. Environment variable: `VITE_API_URL` = `https://<backend-deployment>.vercel.app/api`
4. Deploy, then copy the frontend URL back into the backend's `FRONTEND_URL` and redeploy the backend (needed for CORS and review links)

## Submission docs

- **[APPROACH.md](./APPROACH.md)** — architecture, demo flow, production improvements
- **[ai-notes.md](./ai-notes.md)** — AI tools used during development
- **[prompts/quotation-draft.md](./prompts/quotation-draft.md)** — AI system prompt

## Bonus features

- Preview & PDF export (EN / AR / bilingual)
- Search + status filters on quotations list
- Client review link with approve/reject
- Vitest unit tests
