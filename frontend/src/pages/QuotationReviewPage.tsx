import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { CheckCircle, XCircle, Loader2, FileText, Download } from 'lucide-react'
import { publicQuotationsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'
import { QuotationDocumentFrame } from '@/components/quotations/QuotationDocumentFrame'
import { slugifyFilename } from '@/lib/download'
import { QuotationLangToggle } from '@/components/quotations/QuotationLangToggle'
import { toast } from 'sonner'
import type { QuotationLang } from '@/types'

export const QuotationReviewPage = () => {
  const { token } = useParams<{ token: string }>()
  const [searchParams] = useSearchParams()
  const [responded, setResponded] = useState<'APPROVED' | 'REJECTED' | null>(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [docLang, setDocLang] = useState<QuotationLang>('en')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['public-review', token, docLang],
    queryFn: () => publicQuotationsApi.getReview(token!, docLang),
    enabled: !!token,
  })

  const approve = useMutation({
    mutationFn: () => publicQuotationsApi.approve(token!),
    onSuccess: () => { setResponded('APPROVED'); refetch() },
  })

  const reject = useMutation({
    mutationFn: () => publicQuotationsApi.reject(token!),
    onSuccess: () => { setResponded('REJECTED'); refetch() },
  })

  // Auto-action from email link ?action=approve|reject
  useEffect(() => {
    const action = searchParams.get('action')
    if (!data || data.status !== 'SENT' || !action) return
    if (action === 'approve' && !approve.isPending && !responded) approve.mutate()
    if (action === 'reject' && !reject.isPending && !responded) reject.mutate()
  }, [data, searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  const status = responded ?? data?.status
  const isPending = data?.status === 'SENT' && !responded

  const handleDownloadPdf = async () => {
    if (!token || !data) return
    setDownloadingPdf(true)
    try {
      await publicQuotationsApi.downloadPdf(token, slugifyFilename(data.title), docLang)
      toast.success('PDF downloaded')
    } catch {
      toast.error('Failed to download PDF')
    } finally {
      setDownloadingPdf(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-burgundy" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <FileText className="h-12 w-12 text-burgundy/30 mx-auto mb-4" />
          <h1 className="font-display text-xl text-burgundy mb-2">Link not found</h1>
          <p className="text-burgundy/60 font-sans text-sm">This quotation link may have expired or is invalid.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-burgundy text-cream px-6 py-5">
        <div className="max-w-3xl mx-auto">
          <p className="font-display text-2xl font-semibold">Quotify</p>
          <p className="text-cream/70 text-sm font-sans mt-1">Quotation for {data.client.name}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-xl font-medium text-burgundy">{data.title}</h1>
            <p className="text-sm text-burgundy/55 font-sans mt-1">
              {data.sentAt ? `Sent ${formatDate(data.sentAt)}` : formatDate(data.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <QuotationLangToggle value={docLang} onChange={setDocLang} />
            <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={downloadingPdf}>
              {downloadingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download PDF
            </Button>
            {status && <StatusBadge status={status} />}
          </div>
        </div>

        {isPending && (
          <div className="rounded-lg border border-burgundy/20 bg-burgundy/5 p-4 flex flex-col sm:flex-row gap-3">
            <Button className="flex-1" onClick={() => approve.mutate()} disabled={approve.isPending}>
              {approve.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Approve Quotation
            </Button>
            <Button variant="danger" className="flex-1" onClick={() => reject.mutate()} disabled={reject.isPending}>
              {reject.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Reject Quotation
            </Button>
          </div>
        )}

        {status === 'APPROVED' && (
          <div className="rounded-lg bg-burgundy/10 border border-burgundy/20 p-4 text-burgundy font-sans text-sm">
            Thank you — this quotation has been <strong>approved</strong>.
          </div>
        )}

        {status === 'REJECTED' && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 font-sans text-sm">
            This quotation has been <strong>rejected</strong>.
          </div>
        )}

        <QuotationDocumentFrame html={data.html} minHeight={680} />
      </main>
    </div>
  )
}
