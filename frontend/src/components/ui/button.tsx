import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-sans font-medium transition-colors duration-150 disabled:opacity-60 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-burgundy text-cream hover:bg-burgundy-light',
        secondary: 'bg-cream-dark text-burgundy border border-burgundy/20 hover:bg-cream',
        outline: 'border border-burgundy/30 text-burgundy bg-transparent hover:bg-burgundy/5',
        danger: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100',
        dangerSolid: 'bg-red-600 text-cream hover:bg-red-700',
        ghost: 'text-burgundy/60 hover:text-burgundy hover:bg-burgundy/5',
        ghostOnDark: 'text-cream/70 hover:text-cream hover:bg-cream/10',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-4 py-2.5 text-sm',
        icon: 'p-1.5',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
)
Button.displayName = 'Button'

export { buttonVariants }
