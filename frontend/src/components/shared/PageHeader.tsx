import type { ReactNode } from 'react'

interface Props {
  title: string
  description?: string
  children?: ReactNode
}

export const PageHeader = ({ title, description, children }: Props) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="font-display text-xl font-medium text-burgundy">{title}</h1>
      {description && <p className="text-sm text-burgundy/55 mt-1 font-sans">{description}</p>}
    </div>
    {children && <div className="flex items-center gap-3">{children}</div>}
  </div>
)
