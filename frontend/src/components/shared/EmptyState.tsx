import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }: Props) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <Icon className="h-12 w-12 text-burgundy/20 mb-4" />
    <h3 className="font-display text-base font-medium text-burgundy/70 mb-1">{title}</h3>
    <p className="text-sm text-burgundy/50 mb-6 font-sans">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="px-4 py-2 rounded-md border border-burgundy/30 text-burgundy text-sm hover:bg-burgundy/5 transition-colors duration-150 font-sans"
      >
        {actionLabel}
      </button>
    )}
  </div>
)
