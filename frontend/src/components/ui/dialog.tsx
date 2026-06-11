import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  children?: ReactNode
  className?: string
}

export const Dialog = ({ open, onClose, title, description, children, className }: DialogProps) => {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-burgundy/30 backdrop-blur-sm z-40" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal
          className={cn('w-full max-w-sm rounded-lg bg-white border border-cream-dark shadow-xl', className)}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between px-6 pt-5 pb-2">
            <div>
              <h3 className="font-display text-base font-medium text-burgundy">{title}</h3>
              {description && <div className="text-sm text-burgundy/60 mt-1 font-sans">{description}</div>}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
          {children && <div className="px-6 pb-6 pt-2">{children}</div>}
        </div>
      </div>
    </>
  )
}

interface DialogActionsProps {
  children: ReactNode
}

export const DialogActions = ({ children }: DialogActionsProps) => (
  <div className="flex gap-3 mt-6">{children}</div>
)
