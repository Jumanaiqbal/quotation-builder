import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './button'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

export const Sheet = ({ open, onClose, title, children, footer }: SheetProps) => {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-burgundy/30 backdrop-blur-sm z-40" onClick={onClose} aria-hidden />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-cream-dark z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark shrink-0">
          <h2 className="font-display text-base font-medium text-burgundy">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-cream-dark shrink-0">{footer}</div>}
      </div>
    </>
  )
}
