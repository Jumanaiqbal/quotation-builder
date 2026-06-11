import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const avatarVariants = cva(
  'inline-flex items-center justify-center rounded-full font-semibold font-sans shrink-0',
  {
    variants: {
      variant: {
        light: 'bg-burgundy/10 text-burgundy',
        dark: 'bg-cream text-burgundy',
      },
      size: {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-11 w-11 text-sm',
      },
    },
    defaultVariants: { variant: 'light', size: 'sm' },
  },
)

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  initials: string
  className?: string
}

export const Avatar = ({ initials, variant, size, className }: AvatarProps) => (
  <div className={cn(avatarVariants({ variant, size }), className)}>
    {initials.slice(0, 2).toUpperCase()}
  </div>
)
