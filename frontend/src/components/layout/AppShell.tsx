import { useState, type ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'

interface Props {
  title: string
  actions?: ReactNode
  children: ReactNode
}

export const AppShell = ({ title, actions, children }: Props) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-cream">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-64">
        <header className="h-16 border-b border-cream-dark bg-cream-light/80 backdrop-blur sticky top-0 z-20 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-burgundy/60 hover:text-burgundy transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-medium text-burgundy">{title}</h1>
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </header>

        <main className="p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  )
}
