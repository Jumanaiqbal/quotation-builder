import type { QuotationLang } from '@/types'
import { cn } from '@/lib/utils'

const OPTIONS: { value: QuotationLang; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
]

interface Props {
  value: QuotationLang
  onChange: (lang: QuotationLang) => void
  className?: string
}

export const QuotationLangToggle = ({ value, onChange, className }: Props) => (
  <div className={cn('inline-flex rounded-lg bg-cream-dark border border-burgundy/15 p-1', className)}>
    {OPTIONS.map(({ value: opt, label }) => (
      <button
        key={opt}
        type="button"
        onClick={() => onChange(opt)}
        className={cn(
          'px-3 py-1.5 rounded-md text-xs font-medium font-sans transition-colors whitespace-nowrap',
          value === opt
            ? 'bg-burgundy text-cream shadow-sm'
            : 'text-burgundy/65 hover:text-burgundy hover:bg-cream',
        )}
      >
        {label}
      </button>
    ))}
  </div>
)
