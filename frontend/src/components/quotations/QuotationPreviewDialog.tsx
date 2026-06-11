import { Loader2, Send, Download } from 'lucide-react'
import { Dialog, DialogActions } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { QuotationLangToggle } from '@/components/quotations/QuotationLangToggle'
import { QuotationDocumentFrame } from '@/components/quotations/QuotationDocumentFrame'
import type { QuotationLang } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  html: string | undefined
  isLoading: boolean
  isSending: boolean
  clientEmail?: string
  onConfirmSend: () => void
  onDownloadPdf?: () => void
  isDownloading?: boolean
  lang: QuotationLang
  onLangChange: (lang: QuotationLang) => void
}

export const QuotationPreviewDialog = ({
  open,
  onClose,
  html,
  isLoading,
  isSending,
  clientEmail,
  onConfirmSend,
  onDownloadPdf,
  isDownloading,
  lang,
  onLangChange,
}: Props) => (
  <Dialog
    open={open}
    onClose={onClose}
    title="Preview Quotation"
    description={
      clientEmail
        ? `Review before marking as sent. Share the review link with ${clientEmail} — they can approve or reject online.`
        : 'Review before marking as sent and sharing the client link.'
    }
    className="max-w-4xl"
  >
    <div className="flex items-center justify-between gap-3 mb-3">
      <p className="text-xs text-burgundy/55 font-sans">Document language</p>
      <QuotationLangToggle value={lang} onChange={onLangChange} />
    </div>
    {isLoading ? (
      <div className="flex items-center justify-center rounded-xl border border-cream-dark bg-cream-light text-burgundy/50 font-sans" style={{ height: 520 }}>
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading preview…
      </div>
    ) : html ? (
      <QuotationDocumentFrame html={html} minHeight={520} />
    ) : (
      <div className="flex items-center justify-center rounded-xl border border-cream-dark bg-cream-light text-burgundy/50 font-sans text-sm" style={{ height: 520 }}>
        Preview unavailable
      </div>
    )}
    <DialogActions>
      {onDownloadPdf && (
        <Button
          variant="outline"
          onClick={onDownloadPdf}
          disabled={isLoading || isDownloading || !html}
          className="sm:mr-auto"
        >
          {isDownloading ? <><Loader2 className="h-4 w-4 animate-spin" /> Downloading…</> : <><Download className="h-4 w-4" /> Download PDF</>}
        </Button>
      )}
      <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isSending}>
        Cancel
      </Button>
      <Button className="flex-1" onClick={onConfirmSend} disabled={isLoading || isSending || !html}>
        {isSending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><Send className="h-4 w-4" /> Send to Client</>}
      </Button>
    </DialogActions>
  </Dialog>
)
