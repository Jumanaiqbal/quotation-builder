import { Decimal } from '@prisma/client-runtime-utils';

export const calculateItemTotal = (quantity: number, unitPrice: Decimal): Decimal => {
  return new Decimal(quantity).mul(unitPrice);
};

export const calculateQuotationTotal = (items: { total: Decimal }[]): Decimal => {
  return items.reduce((acc, item) => acc.add(item.total), new Decimal(0));
};
