import { cn } from '@/lib/utils'
import type { QuotationStatus } from '@/types'

interface Props { status: QuotationStatus }

const config: Record<QuotationStatus, { label: string; className: string; dot: string }> = {
  DRAFT: {
    label: 'Draft',
    className: 'bg-cream-dark text-burgundy/80 border border-burgundy/15',
    dot: 'bg-burgundy/50',
  },
  SENT: {
    label: 'Sent',
    className: 'bg-sky-50 text-sky-800 border border-sky-200',
    dot: 'bg-sky-600',
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-burgundy/10 text-burgundy border border-burgundy/25',
    dot: 'bg-burgundy',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-700 border border-red-200',
    dot: 'bg-red-500',
  },
}

export const StatusBadge = ({ status }: Props) => {
  const c = config[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium font-sans', c.className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', c.dot)} />
      {c.label}
    </span>
  )
}
