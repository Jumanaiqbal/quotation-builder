import { describe, it, expect } from 'vitest';
import { Decimal } from '@prisma/client-runtime-utils';
import { buildQuotationHtml } from './quotation-html.service';
import type { Client, QuotationItem } from '../generated/prisma/client';

const client = {
  id: 'client1',
  name: 'Fathima VP',
  company: 'VP Technology',
  email: 'fathima@example.com',
  phone: '+973 66301909',
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} as Client;

const makeItem = (overrides: Partial<QuotationItem> = {}): QuotationItem =>
  ({
    id: 'item1',
    quotationId: 'q1',
    title: 'Frontend Dev',
    description: 'React SPA build',
    quantity: 2,
    unitPrice: new Decimal('500'),
    total: new Decimal('1000'),
    estimatedHours: 40,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as QuotationItem;

const makeQuotation = (items: QuotationItem[] = [makeItem()]) => ({
  id: 'cmq9lq35h0007g0ywy3hgloy0',
  title: 'Website Revamp',
  status: 'DRAFT',
  totalAmount: new Decimal('1000'),
  notes: 'Valid for Q3 budget.',
  createdAt: new Date('2026-06-11T00:00:00Z'),
  client,
  items,
});

describe('buildQuotationHtml (English)', () => {
  const html = buildQuotationHtml(makeQuotation(), 'en');

  it('renders an LTR English document', () => {
    expect(html).toContain('<html lang="en" dir="ltr">');
  });

  it('includes client details', () => {
    expect(html).toContain('Fathima VP');
    expect(html).toContain('VP Technology');
    expect(html).toContain('fathima@example.com');
    expect(html).toContain('+973 66301909');
  });

  it('includes item title, description, quantity and formatted prices', () => {
    expect(html).toContain('Frontend Dev');
    expect(html).toContain('React SPA build');
    expect(html).toContain('$500.00');
    expect(html).toContain('$1,000.00');
  });

  it('includes the grand total label and amount', () => {
    expect(html).toContain('Grand Total');
    expect(html).toContain('$1,000.00');
  });

  it('derives a reference code from the quotation id', () => {
    expect(html).toContain('QT-Y3HGLOY0');
  });

  it('renders the notes block when notes exist', () => {
    expect(html).toContain('Valid for Q3 budget.');
  });

  it('omits the notes block when notes are null', () => {
    const noNotes = buildQuotationHtml({ ...makeQuotation(), notes: null }, 'en');
    expect(noNotes).not.toContain('class="notes"');
  });

  it('shows an empty-state row when there are no items', () => {
    const empty = buildQuotationHtml(makeQuotation([]), 'en');
    expect(empty).toContain('No line items');
  });
});

describe('buildQuotationHtml (Arabic)', () => {
  const html = buildQuotationHtml(makeQuotation(), 'ar');

  it('renders an RTL Arabic document', () => {
    expect(html).toContain('<html lang="ar" dir="rtl">');
  });

  it('uses Arabic labels', () => {
    expect(html).toContain('عرض سعر');
    expect(html).toContain('الإجمالي');
  });

  it('forces amounts to LTR so they are not clipped in RTL layout', () => {
    expect(html).toContain('class="amount" dir="ltr"');
  });
});

describe('buildQuotationHtml (XSS safety)', () => {
  it('escapes HTML in user-controlled fields', () => {
    const malicious = makeQuotation([
      makeItem({ title: '<script>alert(1)</script>', description: '<img src=x onerror=alert(1)>' }),
    ]);
    malicious.title = '<b>bold title</b>';
    malicious.client = { ...client, name: '"><svg onload=alert(1)>' } as Client;

    const html = buildQuotationHtml(malicious, 'en');
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).not.toContain('<b>bold title</b>');
    expect(html).toContain('&lt;script&gt;');
  });
});
