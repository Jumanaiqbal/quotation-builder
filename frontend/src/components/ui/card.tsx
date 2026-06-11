import { cn } from '@/lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('rounded-lg border border-cream-dark bg-white', className)} {...props} />
)

export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-6 py-4 border-b border-cream-dark', className)} {...props} />
)

export const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6', className)} {...props} />
)

export const CardTitle = ({ children, className }: { children: ReactNode; className?: string }) => (
  <h2 className={cn('font-display text-base font-medium text-burgundy', className)}>{children}</h2>
)

export const SectionLabel = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={cn('text-xs font-medium text-burgundy/55 uppercase tracking-wider font-sans mb-4', className)}>
    {children}
  </p>
)
