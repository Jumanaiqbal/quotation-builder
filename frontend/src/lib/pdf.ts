import html2pdf from 'html2pdf.js'

const A4_WIDTH_PX = 794
const PAGE_WIDTH_PX = 746

const waitForFonts = async (doc: Document) => {
  if (doc.fonts?.ready) await doc.fonts.ready
  await new Promise((r) => setTimeout(r, 600))
}

/** Generate and download a PDF from quotation HTML in the browser. */
export const downloadPdfFromHtml = async (html: string, filename: string): Promise<void> => {
  const iframe = document.createElement('iframe')
  iframe.style.cssText = `position:fixed;left:-9999px;top:0;width:${A4_WIDTH_PX}px;height:1400px;border:0`
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  if (!doc) {
    iframe.remove()
    throw new Error('Could not create print frame')
  }

  doc.open()
  doc.write(html)
  doc.close()

  await new Promise<void>((resolve) => {
    iframe.onload = () => resolve()
    setTimeout(resolve, 300)
  })

  await waitForFonts(doc)

  const element = doc.querySelector('.page') as HTMLElement | null
  if (!element) {
    iframe.remove()
    throw new Error('Quotation content not found')
  }

  try {
    await html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: PAGE_WIDTH_PX,
          windowWidth: A4_WIDTH_PX,
          scrollX: 0,
          scrollY: 0,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc: Document) => {
            const page = clonedDoc.querySelector('.page') as HTMLElement | null
            if (!page) return
            page.style.boxShadow = 'none'
            page.style.margin = '0'
            page.style.width = `${PAGE_WIDTH_PX}px`
            clonedDoc.body.style.margin = '0'
            clonedDoc.body.style.padding = '0'
            clonedDoc.body.style.background = '#ffffff'
          },
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      })
      .from(element)
      .save()
  } finally {
    iframe.remove()
  }
}
