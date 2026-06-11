# AI Tools Used During Development

Per the technical test AI usage policy — what I used, and what I wrote myself.

## Tools used

| Tool | How I used it |
|------|----------------|
| **Stitch AI** | UI design and wireframing (layout, colours, component structure before coding) |
| **Cursor** | IDE assistance — testing, debugging, bilingual EN/AR implementation, syntax help when I was stuck |
| **Anthropic Claude** | In-app AI draft feature only (backend `POST /quotations/ai-draft`, not exposed to frontend) |

## What I wrote myself (core logic)

- Business rules and status workflow (Draft → Sent → Approved / Rejected)
- When n8n webhook fires (Approved only, per spec)
- Database schema, Prisma models, and migrations
- API route design and request/response flow
- AI prompt in `/prompts/quotation-draft.md`
- Environment setup (Supabase, JWT, n8n webhook URL)

I used AI to **review and validate** this logic — not to replace understanding it.

## Where AI helped more directly

| Area | Tool | Notes |
|------|------|-------|
| UI look & feel | Stitch AI | Wireframes and visual direction (burgundy/cream theme) |
| React pages & components | Cursor | Built from wireframes; I reviewed and adjusted |
| Bilingual quotations | Cursor | EN/AR labels, RTL layout, PDF/preview language toggle |
| Testing | Cursor | Helped run and fix issues during local testing |
| Syntax / TypeScript | Cursor | When I did not know exact syntax, I asked and then verified the output |
| Vitest unit tests | Cursor | Calculation and AI schema validation tests |

## What I always did after AI suggestions

1. Read the code and made sure I understood it  
2. Ran the app locally and tested the flow  
3. Fixed anything that did not match the spec or my intent  

## In-app AI (product feature, not dev tool)

The quotation **AI Draft Generator** calls Anthropic from the backend, validates JSON with Zod, and logs failures to `ai_logs`. API keys stay server-side only.
