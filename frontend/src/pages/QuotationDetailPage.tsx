import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft, Trash2, Pencil, Plus, Eye, Download,
  Sparkles, Loader2, MessageCircle, User, Calendar, Package, Clock, Copy, CheckCircle,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label, Input, Textarea, FieldError } from '@/components/ui/input'
import { Dialog, DialogActions } from '@/components/ui/dialog'
import {
  useQuotationQuery, useQuotationPreview, useSendQuotation, useDeleteQuotation,
  useApproveQuotation, useCreateItem, useUpdateItem, useDeleteItem, useAiDraft,
} from '@/hooks/useQuotations'
import { QuotationPreviewDialog } from '@/components/quotations/QuotationPreviewDialog'
import { QuotationLangToggle } from '@/components/quotations/QuotationLangToggle'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { quotationsApi } from '@/lib/api'
import { slugifyFilename } from '@/lib/download'
import type { QuotationItem, AiSuggestedItem, QuotationLang } from '@/types'

const itemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  quantity: z.coerce.number().min(1, 'Min 1'),
  unitPrice: z.coerce.number().min(0, 'Must be ≥ 0'),
  estimatedHours: z.coerce.number().optional(),
})
// z.coerce gives `unknown` input types in Zod v4, so RHF needs separate input/output types
type ItemFormInput = z.input<typeof itemSchema>
type ItemForm = z.output<typeof itemSchema>

export const QuotationDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<QuotationItem | null>(null)
  const [deleteItemTarget, setDeleteItemTarget] = useState<string | null>(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiResult, setAiResult] = useState<import('@/types').AiDraftResponse | null>(null)
  const [deleteQuotationConfirm, setDeleteQuotationConfirm] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [docLang, setDocLang] = useState<QuotationLang>('en')

  const { data: quotation, isLoading, refetch } = useQuotationQuery(id ?? '')
  const { data: previewData, isLoading: previewLoading } = useQuotationPreview(id ?? '', previewOpen, docLang)
  const sendQuotation = useSendQuotation()
  const approveQuotation = useApproveQuotation()
  const deleteQuotation = useDeleteQuotation()
  const createItem = useCreateItem(id ?? '')
  const updateItem = useUpdateItem(id ?? '')
  const deleteItem = useDeleteItem(id ?? '')
  const aiDraft = useAiDraft()

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<ItemFormInput, unknown, ItemForm>({
    resolver: zodResolver(itemSchema),
    defaultValues: { quantity: 1, unitPrice: 0 },
  })

  const qty = Number(watch('quantity')) || 0
  const price = Number(watch('unitPrice')) || 0
  const lineTotal = (qty * price).toFixed(2)

  const openAddItem = () => { setEditItem(null); reset({ quantity: 1, unitPrice: 0 }); setItemDialogOpen(true) }
  const openEditItem = (item: QuotationItem) => {
    setEditItem(item)
    reset({ title: item.title, description: item.description, quantity: item.quantity, unitPrice: Number(item.unitPrice), estimatedHours: item.estimatedHours })
    setItemDialogOpen(true)
  }

  const onItemSubmit = async (data: ItemForm) => {
    // strip estimatedHours if blank so the backend optional field is truly omitted
    const payload = { ...data, estimatedHours: data.estimatedHours || undefined }
    if (editItem) await updateItem.mutateAsync({ itemId: editItem.id, data: payload })
    else await createItem.mutateAsync(payload)
    setItemDialogOpen(false)
  }

  const handleGenerateAi = async () => {
    if (!aiPrompt.trim()) return
    const res = await aiDraft.mutateAsync(aiPrompt)
    setAiResult(res)
  }

  const addAiItem = (item: AiSuggestedItem) =>
    createItem.mutateAsync({ title: item.title, description: item.description, quantity: item.quantity, unitPrice: item.unit_price ?? 0, estimatedHours: item.estimated_hours })

  const addAllAiItems = () => aiResult?.suggested_items.forEach((item) => addAiItem(item))

  // Poll while waiting for client response via email link
  useEffect(() => {
    if (quotation?.status !== 'SENT') return
    const interval = setInterval(() => { void refetch() }, 10000)
    return () => clearInterval(interval)
  }, [quotation?.status, refetch])

  const handleSend = async () => {
    if (!quotation) return
    await sendQuotation.mutateAsync(quotation.id)
    setPreviewOpen(false)
    void refetch()
  }

  const handleDownloadPdf = async () => {
    if (!quotation) return
    setDownloadingPdf(true)
    try {
      await quotationsApi.downloadPdf(quotation.id, slugifyFilename(quotation.title), docLang)
      toast.success('PDF downloaded')
    } catch {
      toast.error('Failed to generate PDF')
    } finally {
      setDownloadingPdf(false)
    }
  }

  const reviewUrl = quotation?.reviewToken
    ? `${window.location.origin}/review/${quotation.reviewToken}`
    : null

  const copyReviewLink = () => {
    if (!reviewUrl) return
    void navigator.clipboard.writeText(reviewUrl)
    toast.success('Review link copied')
  }

  if (isLoading) return (
    <AppShell title="Quotation Detail">
      <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
    </AppShell>
  )

  if (!quotation) return (
    <AppShell title="Not Found">
      <p className="text-burgundy/60">Quotation not found.</p>
    </AppShell>
  )

  return (
    <AppShell
      title={quotation.title}
      actions={
        <div className="flex items-center gap-3">
          <StatusBadge status={quotation.status} />

          <QuotationLangToggle value={docLang} onChange={setDocLang} />

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
          >
            {downloadingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download PDF
          </Button>

          {quotation.status === 'DRAFT' && (
            <Button variant="secondary" size="sm" onClick={() => setPreviewOpen(true)}>
              <Eye className="h-4 w-4" /> Preview & Send
            </Button>
          )}

          {quotation.status === 'SENT' && (
            <Button
              size="sm"
              onClick={() => approveQuotation.mutate(quotation.id)}
              disabled={approveQuotation.isPending}
            >
              {approveQuotation.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <CheckCircle className="h-4 w-4" />}
              Approve (triggers n8n)
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteQuotationConfirm(true)}
            className="hover:text-red-600 hover:bg-red-50"
            aria-label="Delete quotation"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      }
    >
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/quotations')} className="mb-6 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back to Quotations
      </Button>

      {quotation.status === 'SENT' && (
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-sky-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-sky-900 font-sans">Sent — waiting for approval</p>
              <ol className="text-xs text-sky-700/90 font-sans mt-1.5 space-y-0.5 list-decimal list-inside">
                <li>Copy the review link and send it to your client (email/WhatsApp).</li>
                <li>Client opens the link and clicks <strong>Approve</strong> — or you click <strong>Approve (triggers n8n)</strong> above.</li>
                <li>Status becomes <strong>Approved</strong> → backend calls your n8n webhook → n8n emails your team.</li>
              </ol>
            </div>
          </div>
          {reviewUrl && (
            <Button variant="outline" size="sm" onClick={copyReviewLink} className="shrink-0">
              <Copy className="h-3.5 w-3.5" /> Copy review link
            </Button>
          )}
        </div>
      )}

      <QuotationPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        html={previewData?.html}
        isLoading={previewLoading}
        isSending={sendQuotation.isPending}
        clientEmail={quotation.client?.email}
        onConfirmSend={handleSend}
        onDownloadPdf={handleDownloadPdf}
        isDownloading={downloadingPdf}
        lang={docLang}
        onLangChange={setDocLang}
      />

      {/* Info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg border border-cream-dark bg-white p-5">
          <p className="text-xs font-medium text-burgundy/50 uppercase tracking-wider mb-3 flex items-center gap-1.5"><User className="h-3 w-3" /> Client</p>
          {quotation.client ? (
            <>
              <p className="font-medium text-burgundy">{quotation.client.name}</p>
              {quotation.client.company && <p className="text-xs text-burgundy/50 mt-0.5">{quotation.client.company}</p>}
              <p className="text-sm text-burgundy/60 mt-1">{quotation.client.email}</p>
              {quotation.client.phone && <p className="text-sm text-burgundy/60">{quotation.client.phone}</p>}
            </>
          ) : <p className="text-sm text-burgundy/50">No client info</p>}
        </div>

        <div className="rounded-lg border border-cream-dark bg-white p-5">
          <p className="text-xs font-medium text-burgundy/50 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Quotation</p>
          <p className="font-medium text-burgundy">{quotation.title}</p>
          <p className="text-xs text-burgundy/50 mt-0.5">Created {formatDate(quotation.createdAt)}</p>
          {quotation.notes && <p className="text-sm text-burgundy/60 mt-2">{quotation.notes}</p>}
        </div>

        <div className="rounded-lg border border-cream-dark bg-white p-5">
          <p className="text-xs font-medium text-burgundy/50 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Package className="h-3 w-3" /> Total</p>
          <p className="text-3xl font-bold text-burgundy">{formatCurrency(quotation.totalAmount)}</p>
          <p className="text-xs text-burgundy/50 mt-1">{quotation.items?.length ?? 0} item(s)</p>
        </div>
      </div>

      {/* Items section */}
      <div className="rounded-lg border border-cream-dark bg-white overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark">
          <h2 className="text-sm font-medium text-burgundy">Quotation Items</h2>
          <Button variant="outline" size="sm" onClick={openAddItem}>
            <Plus className="h-3.5 w-3.5" /> Add Item
          </Button>
        </div>

        {!quotation.items || quotation.items.length === 0 ? (
          <p className="text-sm text-burgundy/50 px-6 py-8 text-center">No items yet. Add your first item.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-dark bg-white/60">
                {['Title', 'Description', 'Qty', 'Unit Price', 'Total', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-burgundy/50 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-dark">
              {quotation.items.map((item) => (
                <tr key={item.id} className="hover:bg-cream-dark/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-burgundy">{item.title}</td>
                  <td className="px-4 py-3 text-burgundy/60 max-w-xs truncate">{item.description ?? '—'}</td>
                  <td className="px-4 py-3 text-burgundy/80">{item.quantity}</td>
                  <td className="px-4 py-3 text-burgundy/80">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-3 font-medium text-burgundy">{formatCurrency(item.total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEditItem(item)} aria-label="Edit item"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteItemTarget(item.id)} className="hover:text-red-600 hover:bg-red-50" aria-label="Delete item"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-burgundy/20 bg-cream-dark/50">
                <td colSpan={4} className="px-4 py-3 text-sm font-medium text-burgundy/60">Total</td>
                <td className="px-4 py-3 font-bold text-burgundy">{formatCurrency(quotation.totalAmount)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* AI Draft section */}
      <Card className="border-burgundy/20 bg-burgundy/5 p-6 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-burgundy" />
          <h2 className="font-display text-sm font-medium text-burgundy">AI Draft Generator</h2>
        </div>
        <p className="text-xs text-burgundy/60 mb-4 font-sans">Describe the client project and AI will suggest quotation items</p>
        <Textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          rows={3}
          placeholder="E.g. Client needs a 10-page e-commerce website with payment integration..."
          className="mb-3"
        />
        <Button onClick={handleGenerateAi} disabled={aiDraft.isPending || !aiPrompt.trim()}>
          {aiDraft.isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Thinking… (may take ~20s)</> : <><Sparkles className="h-4 w-4" />Generate with AI</>}
        </Button>

        {aiDraft.isError && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-red-700 text-sm font-sans">AI generation failed. Please try again.</p>
          </div>
        )}
      </Card>

      {/* AI Results */}
      {aiResult && (
        <div className="rounded-lg border border-cream-dark bg-white p-6 space-y-6">
          <div>
            <p className="text-xs font-medium text-burgundy/50 uppercase tracking-wider mb-1">Project Type</p>
            <p className="text-sm font-medium text-burgundy">{aiResult.project_type}</p>
            <p className="text-sm text-burgundy/60 mt-2">{aiResult.summary}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-burgundy/60 uppercase tracking-wider mb-3">Suggested Items</h3>
            <div className="space-y-3">
              {aiResult.suggested_items.map((item, i) => (
                <div key={i} className="rounded-lg border border-burgundy/20 bg-cream-dark p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-burgundy text-sm">{item.title}</p>
                    <p className="text-xs text-burgundy/60 mt-0.5">{item.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-burgundy/50">
                      <span>{item.quantity} unit(s)</span>
                      <span>{item.estimated_hours}h estimated</span>
                      <span className="text-burgundy/80">{item.unit_price ? formatCurrency(item.unit_price) : 'Price TBD'}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => addAiItem(item)} className="shrink-0">
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {aiResult.questions_to_ask_client.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-burgundy/60 uppercase tracking-wider mb-3">Questions to Ask</h3>
              <ul className="space-y-2">
                {aiResult.questions_to_ask_client.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-burgundy/60">
                    <MessageCircle className="h-4 w-4 text-burgundy/40 mt-0.5 shrink-0" />
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button onClick={addAllAiItems} className="w-full">
            <Plus className="h-4 w-4" /> Add All Items to Quotation
          </Button>
        </div>
      )}

      <Dialog open={itemDialogOpen} onClose={() => setItemDialogOpen(false)} title={editItem ? 'Edit Item' : 'Add Item'}>
        <form onSubmit={handleSubmit(onItemSubmit)} className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input {...register('title')} placeholder="E.g. Frontend Development" />
            <FieldError message={errors.title?.message} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea {...register('description')} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Quantity *</Label>
              <Input {...register('quantity')} type="number" min="1" />
              <FieldError message={errors.quantity?.message} />
            </div>
            <div>
              <Label>Unit Price *</Label>
              <Input {...register('unitPrice')} type="number" min="0" step="0.01" />
              <FieldError message={errors.unitPrice?.message} />
            </div>
          </div>
          <div>
            <Label>Est. Hours</Label>
            <Input {...register('estimatedHours')} type="number" min="0" />
          </div>
          <div className="rounded-lg bg-cream-dark px-3 py-2 text-sm text-burgundy/65 font-sans">
            Line total: <span className="font-semibold text-burgundy">{formatCurrency(lineTotal)}</span>
          </div>
          <DialogActions>
            <Button variant="secondary" type="button" className="flex-1" onClick={() => setItemDialogOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={!!deleteItemTarget}
        onClose={() => setDeleteItemTarget(null)}
        title="Remove Item"
        description="Are you sure you want to remove this item?"
      >
        <DialogActions>
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteItemTarget(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={() => { deleteItem.mutateAsync(deleteItemTarget!); setDeleteItemTarget(null) }}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteQuotationConfirm}
        onClose={() => setDeleteQuotationConfirm(false)}
        title="Delete Quotation"
        description="Are you sure you want to delete this quotation? This cannot be undone."
      >
        <DialogActions>
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteQuotationConfirm(false)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={async () => { await deleteQuotation.mutateAsync(quotation.id); navigate('/quotations') }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  )
}
