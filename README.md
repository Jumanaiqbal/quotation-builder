# Quotify — AI-Assisted Quotation Builder

Full-stack technical test: React + Express + PostgreSQL + Anthropic AI + n8n.

## Live demo

| | URL |
|---|---|
| **App** | https://quotation-builder-b2y1.vercel.app |
| **API** | https://quotation-builder-hazel.vercel.app/api/health |

Login: `admin@example.com` / `password123`

## Quick start

### Backend
```bash
cd backend
cp .env.example .env   # DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY, N8N_WEBHOOK_URL
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

## n8n (Approved only)

n8n runs **only** when a quotation becomes **Approved** — not on Send or Reject.

```
Draft → Preview & Send → Sent
Sent  → client approves on /review/:token  OR  admin clicks "Approve (triggers n8n)"
      → Approved → POST to N8N_WEBHOOK_URL → Gmail notification
```

1. Import [`n8n/quotation-approved-workflow.json`](./n8n/quotation-approved-workflow.json) into n8n
2. Connect Gmail on the **Send notification email** node
3. Webhook path: `quotation-approved`
4. Set `N8N_WEBHOOK_URL` in `backend/.env` to the production webhook URL
5. Activate the workflow

## Tests

```bash
cd backend && npm run test:run
```

## Deployment (Vercel)

Deploy **backend** and **frontend** as two separate Vercel projects from this repo.

| Project | Root directory | Key env vars |
|---------|----------------|--------------|
| Backend | `backend` | `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `ANTHROPIC_API_KEY`, `N8N_WEBHOOK_URL`, `FRONTEND_URL` |
| Frontend | `frontend` | `VITE_API_URL` = `https://<backend>.vercel.app/api` |

Set `FRONTEND_URL` on the backend to the deployed frontend URL (needed for CORS and client review links).

## Docs

- **[APPROACH.md](./APPROACH.md)** — architecture, demo flow, production improvements
- **[ai-notes.md](./ai-notes.md)** — AI tools used during development
- **[prompts/quotation-draft.md](./prompts/quotation-draft.md)** — AI system prompt
