import type { Client, QuotationItem } from '../generated/prisma/client';
import {
  type QuotationLang,
  t,
  htmlLang,
  htmlDir,
  formatMoney,
  formatDate,
} from '../lib/quotation-i18n';

type QuotationDoc = {
  id: string;
  title: string;
  status: string;
  totalAmount: { toString(): string };
  notes: string | null;
  createdAt: Date;
  client: Client;
  items: QuotationItem[];
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Currency values always render LTR so Arabic PDFs don't clip amounts. */
const amount = (n: string | number, lang: QuotationLang) =>
  `<span class="amount" dir="ltr">${formatMoney(n, lang)}</span>`;

const refCode = (id: string) => `QT-${id.slice(-8).toUpperCase()}`;

export const buildQuotationHtml = (q: QuotationDoc, lang: QuotationLang = 'en'): string => {
  const dir = htmlDir(lang);
  const isRtl = dir === 'rtl';

  const rows = q.items
    .map(
      (item) => `
      <tr>
        <td class="col-desc">
          <div class="item-title">${esc(item.title)}</div>
          ${item.description ? `<div class="item-desc">${esc(item.description)}</div>` : ''}
        </td>
        <td class="col-qty"><span class="amount" dir="ltr">${item.quantity}</span></td>
        <td class="col-money">${amount(item.unitPrice.toString(), lang)}</td>
        <td class="col-money">${amount(item.total.toString(), lang)}</td>
      </tr>`,
    )
    .join('');

  const bodyFont = isRtl
    ? "'Noto Naskh Arabic', 'DM Sans', sans-serif"
    : "'DM Sans', 'Segoe UI', sans-serif";
  const displayFont = isRtl
    ? "'Noto Naskh Arabic', 'Playfair Display', serif"
    : "'Playfair Display', Georgia, serif";

  // Styles live INSIDE .page so PDF export (html2canvas) captures them — head styles are ignored when only .page is snapshotted.
  const pageStyles = `
    *, *::before, *::after { box-sizing: border-box; }
    .page {
      width: 746px;
      max-width: 100%;
      margin: 0 auto;
      background: #ffffff;
      box-shadow: 0 4px 32px rgba(74, 14, 28, 0.1);
      overflow: hidden;
      color: #4a0e1c;
      font-family: ${bodyFont};
      font-size: 13px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .doc-header {
      background: linear-gradient(135deg, #4a0e1c 0%, #6b1a2e 100%);
      color: #faf6f0;
      padding: 28px 40px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 24px;
    }
    .brand {
      font-family: ${displayFont};
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 0.02em;
      margin: 0;
    }
    .doc-type {
      text-align: ${isRtl ? 'left' : 'right'};
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      opacity: 0.9;
    }
    .doc-type strong {
      display: block;
      font-family: ${displayFont};
      font-size: 20px;
      letter-spacing: 0.04em;
      margin-top: 4px;
      text-transform: none;
    }
    .doc-body { padding: 32px 40px 36px; }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 28px;
      padding-bottom: 24px;
      border-bottom: 1px solid #e8dcc8;
    }
    .meta-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #8b4a58;
      margin-bottom: 8px;
    }
    .client-name { font-size: 16px; font-weight: 600; color: #4a0e1c; margin-bottom: 4px; }
    .client-detail { font-size: 13px; color: #6b4a52; }
    .meta-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      font-size: 13px;
      padding: 4px 0;
    }
    .meta-row span:first-child { color: #8b4a58; font-weight: 500; }
    .meta-row span:last-child { font-weight: 600; color: #4a0e1c; }
    .project-title {
      font-family: ${displayFont};
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 20px;
      color: #4a0e1c;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      margin-bottom: 8px;
    }
    .items-table col.col-desc { width: 44%; }
    .items-table col.col-qty { width: 10%; }
    .items-table col.col-money { width: 23%; }
    .items-table thead th {
      background: #f2e8d5;
      color: #4a0e1c;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 10px 12px;
      border-bottom: 2px solid #d4c4a8;
      text-align: ${isRtl ? 'right' : 'left'};
    }
    .items-table thead th.col-qty,
    .items-table thead th.col-money { text-align: center; }
    .items-table thead th.col-money:last-child { text-align: right; }
    .items-table tbody td {
      padding: 12px;
      border-bottom: 1px solid #efe6d6;
      vertical-align: top;
    }
    .col-desc { text-align: ${isRtl ? 'right' : 'left'}; }
    .col-qty { text-align: center; }
    .col-money { text-align: right; }
    .item-title { font-weight: 600; color: #4a0e1c; font-size: 13px; }
    .item-desc { font-size: 12px; color: #6b4a52; margin-top: 4px; line-height: 1.45; }
    .amount {
      display: inline-block;
      direction: ltr;
      unicode-bidi: isolate;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
      font-weight: 600;
    }
    .summary {
      width: 280px;
      max-width: 100%;
      margin-top: 16px;
      margin-inline-start: auto;
      border: 1px solid #d4c4a8;
      border-radius: 6px;
      overflow: hidden;
    }
    .summary-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 14px 18px;
      background: #4a0e1c;
      color: #faf6f0;
      font-size: 14px;
      font-weight: 600;
    }
    .summary-total .amount {
      font-size: 18px;
      font-weight: 700;
      color: #faf6f0;
    }
    .notes {
      margin-top: 24px;
      padding: 16px 18px;
      background: #faf6f0;
      border-radius: 6px;
      border-inline-start: 4px solid #4a0e1c;
      font-size: 13px;
      color: #4a0e1c;
    }
    .notes strong {
      display: block;
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #8b4a58;
      margin-bottom: 6px;
    }
    .doc-footer {
      margin-top: 28px;
      padding-top: 16px;
      border-top: 1px solid #e8dcc8;
      font-size: 11px;
      color: #8b4a58;
      text-align: center;
      line-height: 1.6;
    }
    .empty-row td {
      text-align: center;
      color: #8b4a58;
      padding: 24px;
      font-style: italic;
    }
  `;

  return `<!DOCTYPE html>
<html lang="${htmlLang(lang)}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(q.title)} — ${t('quotation', lang)}</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&family=Noto+Naskh+Arabic:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    body { margin: 0; padding: 20px; background: #ebe4d8; }
    ${pageStyles}
  </style>
</head>
<body>
  <div class="page">
    <style>${pageStyles}</style>
    <header class="doc-header">
      <h1 class="brand">${t('brand', lang)}</h1>
      <div class="doc-type">
        ${isRtl ? 'مستند رسمي' : 'Official Document'}
        <strong>${t('quotation', lang)}</strong>
      </div>
    </header>

    <div class="doc-body">
      <div class="meta-grid">
        <div>
          <div class="meta-label">${t('billTo', lang)}</div>
          <div class="client-name">${esc(q.client.name)}</div>
          ${q.client.company ? `<div class="client-detail">${esc(q.client.company)}</div>` : ''}
          <div class="client-detail">${esc(q.client.email)}</div>
          ${q.client.phone ? `<div class="client-detail">${esc(q.client.phone)}</div>` : ''}
        </div>
        <div>
          <div class="meta-row"><span>${t('date', lang)}</span><span>${formatDate(q.createdAt, lang)}</span></div>
          <div class="meta-row"><span>${t('reference', lang)}</span><span class="amount" dir="ltr">${refCode(q.id)}</span></div>
          <div class="meta-row"><span>${t('project', lang)}</span><span>${esc(q.title)}</span></div>
        </div>
      </div>

      <table class="items-table">
        <colgroup>
          <col class="col-desc" />
          <col class="col-qty" />
          <col class="col-money" />
          <col class="col-money" />
        </colgroup>
        <thead>
          <tr>
            <th class="col-desc">${t('item', lang)}</th>
            <th class="col-qty">${t('qty', lang)}</th>
            <th class="col-money">${t('unitPrice', lang)}</th>
            <th class="col-money">${t('lineTotal', lang)}</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr class="empty-row"><td colspan="4">${t('noItems', lang)}</td></tr>`}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-total">
          <span>${t('grandTotal', lang)}</span>
          ${amount(q.totalAmount.toString(), lang)}
        </div>
      </div>

      ${q.notes ? `<div class="notes"><strong>${t('notes', lang)}</strong>${esc(q.notes)}</div>` : ''}

      <footer class="doc-footer">
        <div>${t('validFor', lang)}</div>
        <div style="margin-top:6px;font-weight:600;color:#6b4a52;">${t('footer', lang)}</div>
      </footer>
    </div>
  </div>
</body>
</html>`;
};
