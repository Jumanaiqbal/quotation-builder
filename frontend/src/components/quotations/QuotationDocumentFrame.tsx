interface Props {
  html: string
  className?: string
  minHeight?: number
}

/** Renders quotation HTML in a sized iframe so preview matches PDF layout. */
export const QuotationDocumentFrame = ({ html, className = '', minHeight = 640 }: Props) => (
  <div
    className={`rounded-xl overflow-hidden bg-[#ebe4d8] border border-cream-dark shadow-lg ${className}`}
    style={{ minHeight }}
  >
    <iframe
      title="Quotation document"
      srcDoc={html}
      className="w-full border-0 block"
      style={{ minHeight, height: minHeight }}
      sandbox="allow-same-origin"
    />
  </div>
)
