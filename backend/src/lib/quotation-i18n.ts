export type QuotationLang = 'en' | 'ar';

export const parseQuotationLang = (value: unknown): QuotationLang =>
  value === 'ar' ? 'ar' : 'en';

const labels = {
  en: {
    brand: 'Quotify',
    quotation: 'Quotation',
    billTo: 'Bill To',
    date: 'Date',
    reference: 'Reference',
    project: 'Project',
    item: 'Description',
    qty: 'Qty',
    unitPrice: 'Unit Price',
    lineTotal: 'Amount',
    notes: 'Notes',
    noItems: 'No line items',
    grandTotal: 'Grand Total',
    validFor: 'This quotation is valid for 30 days from the date issued.',
    footer: 'Thank you for your business.',
  },
  ar: {
    brand: 'كوتيفاي',
    quotation: 'عرض سعر',
    billTo: 'العميل',
    date: 'التاريخ',
    reference: 'المرجع',
    project: 'المشروع',
    item: 'البيان',
    qty: 'الكمية',
    unitPrice: 'سعر الوحدة',
    lineTotal: 'المبلغ',
    notes: 'ملاحظات',
    noItems: 'لا توجد بنود',
    grandTotal: 'الإجمالي',
    validFor: 'هذا العرض ساري لمدة ٣٠ يوماً من تاريخ الإصدار.',
    footer: 'شكراً لتعاملكم معنا.',
  },
} as const;

type LabelKey = keyof typeof labels.en;

export const t = (key: LabelKey, lang: QuotationLang): string => labels[lang][key];

export const htmlLang = (lang: QuotationLang): string => (lang === 'ar' ? 'ar' : 'en');

export const htmlDir = (lang: QuotationLang): 'ltr' | 'rtl' =>
  lang === 'ar' ? 'rtl' : 'ltr';

export const formatMoney = (n: string | number, lang: QuotationLang): string => {
  const locale = lang === 'ar' ? 'ar-BH' : 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(Number(n));
};

export const formatDate = (d: Date, lang: QuotationLang): string => {
  const locale = lang === 'ar' ? 'ar-BH' : 'en-US';
  return new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', year: 'numeric' }).format(d);
};
