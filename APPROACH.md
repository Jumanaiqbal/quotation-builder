# Approach & Production Improvements

## What we built (technical test scope)

Quotify is a full-stack quotation manager: login, clients, quotations with line items, AI draft generation, status workflow (Draft → Sent → Approved/Rejected), preview/PDF export, and bilingual documents (English / Arabic / both).

**n8n integration follows the spec exactly:** the backend calls the n8n webhook **only when a quotation status becomes Approved** — whether approved by the client via the public review link or via the admin approve endpoint. The exported workflow (`n8n/quotation-approved-workflow.json`) receives the webhook and sends a simple team email notification.

## Demo flow vs production flow

### Demo (this submission)

```
Draft → Preview & Send → status = Sent
       → copy review link to client
       → client opens /review/:token → Approve or Reject
       → on Approve → n8n webhook → team notification
```

Send/reject do **not** call n8n in this build, because the test spec limits n8n to the Approved event.

### Production (what we would add)

| Area | Production improvement |
|------|------------------------|
| **Send quotation** | n8n workflow on `quotation.sent`: email client HTML/PDF + approve/reject links (we already built the review page and HTML generator for this) |
| **Reject** | n8n or in-app notification to sales team when client rejects |
| **Auth on review links** | Optional OTP or signed expiring tokens instead of static `reviewToken` |
| **Database region** | Move Supabase from Sydney → Mumbai/Bahrain region to cut latency (~300ms → ~50ms per query) |
| **PDF** | Currently client-side (html2pdf.js) to stay serverless-friendly; in production, server-side rendering (Puppeteer/Gotenberg behind a queue) would guarantee pixel-perfect output |
| **Bilingual** | Store per-client language preference; AI draft in Arabic when client locale is `ar-BH` |
| **Audit** | Status change log table for compliance (banking use case) |
| **Tests** | Expand Vitest coverage + Playwright E2E for full quotation lifecycle |

## Status workflow decisions

The spec requires Draft, Sent, Approved, Rejected. We chose:

- **Draft → Sent** only via “Preview & Send” (requires at least one item)
- **Sent → Approved / Rejected** via client review link (no internal approve while Sent)
- **Approved** triggers n8n (spec requirement)

## Bonus features implemented

- Quotation preview + PDF download
- Bilingual EN/AR documents (`?lang=en|ar|both`)
- Search and status filters on quotation list
- Vitest tests for total calculation and AI JSON schema validation

## AI usage

See [`ai-notes.md`](./ai-notes.md) for tools used during development.
