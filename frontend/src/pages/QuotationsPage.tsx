import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, FileText, Plus, User } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label, Input, Textarea, FieldError, SearchInput } from '@/components/ui/input'
import { Dialog, DialogActions } from '@/components/ui/dialog'
import { useQuotationsQuery, useCreateQuotation } from '@/hooks/useQuotations'
import { useClientsQuery } from '@/hooks/useClients'
import { formatDate } from '@/lib/utils'
import type { QuotationStatus } from '@/types'
import { cn } from '@/lib/utils'

const schema = z.object({
  clientId: z.string().min(1, 'Select a client'),
  title: z.string().min(1, 'Title is required'),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const STATUSES: { label: string; value: QuotationStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
]

export const QuotationsPage = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | 'ALL'>('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data, isLoading } = useQuotationsQuery({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search,
  })
  const { data: clientsData } = useClientsQuery()
  const createQuotation = useCreateQuotation()

  const clients = clientsData?.data ?? []
  const quotations = data?.data ?? []

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    const q = await createQuotation.mutateAsync(data)
    reset()
    setDialogOpen(false)
    navigate(`/quotations/${q.id}`)
  }

  return (
    <AppShell
      title="Quotations"
      actions={
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> New Quotation
        </Button>
      }
    >
      <PageHeader title="Quotations" description={`${quotations.length} total`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-burgundy/45 z-10 pointer-events-none" />
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quotations…"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-medium font-sans transition-colors duration-150',
                statusFilter === value
                  ? 'bg-burgundy text-cream'
                  : 'bg-cream-dark text-burgundy/65 border border-burgundy/15 hover:text-burgundy hover:bg-cream',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : quotations.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No quotations yet"
          description="Create your first quotation to get started"
          actionLabel="New Quotation"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {quotations.map((q) => (
            <Card
              key={q.id}
              onClick={() => navigate(`/quotations/${q.id}`)}
              className="p-5 cursor-pointer hover:border-burgundy/25 hover:shadow-md transition-all duration-150 group"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="font-medium text-burgundy text-sm leading-tight pr-2 font-sans">{q.title}</p>
                <StatusBadge status={q.status} />
              </div>
              {q.client && (
                <div className="flex items-center gap-1.5 mb-3">
                  <User className="h-3 w-3 text-burgundy/45" />
                  <p className="text-xs text-burgundy/60 font-sans">{q.client.name}</p>
                </div>
              )}
              <p className="font-display text-xl font-medium text-burgundy mb-4">
                {Number(q.totalAmount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </p>
              <div className="flex items-center justify-between border-t border-cream-dark pt-3">
                <p className="text-xs text-burgundy/50 font-sans">{formatDate(q.createdAt)}</p>
                <span className="text-xs text-burgundy font-sans group-hover:underline">View Details →</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="New Quotation">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Client *</Label>
            <select
              {...register('clientId')}
              className="w-full rounded-lg bg-cream-dark border border-burgundy/20 text-burgundy text-sm font-sans px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-burgundy"
            >
              <option value="">Select a client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.company ? ` — ${c.company}` : ''}
                </option>
              ))}
            </select>
            <FieldError message={errors.clientId?.message} />
          </div>
          <div>
            <Label>Title *</Label>
            <Input {...register('title')} placeholder="E.g. Website Redesign" />
            <FieldError message={errors.title?.message} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea {...register('notes')} rows={2} placeholder="Optional…" />
          </div>
          <DialogActions>
            <Button variant="secondary" type="button" className="flex-1" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </AppShell>
  )
}
