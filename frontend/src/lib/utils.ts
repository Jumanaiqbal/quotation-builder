import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { QuotationStatus } from '@/types'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const formatCurrency = (amount: string | number, currency = 'USD'): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount))

export const formatDate = (dateString: string): string =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString))

export const getStatusLabel = (status: QuotationStatus): string =>
  ({ DRAFT: 'Draft', SENT: 'Sent', APPROVED: 'Approved', REJECTED: 'Rejected' })[status]
