import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, FileText, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserProfile } from './UserProfile'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onClose: () => void
}




const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/quotations', icon: FileText, label: 'Quotations' },
]

export const Sidebar = ({ open, onClose }: Props) => (
  <>
    {open && (
      <div className="fixed inset-0 bg-burgundy/40 z-30 lg:hidden" onClick={onClose} aria-hidden />
    )}

    <aside
      className={cn(
        'fixed top-0 left-0 h-full w-64 bg-burgundy z-40 flex flex-col',
        'transition-transform duration-200 lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="flex items-center justify-between px-6 h-16 border-b border-cream/15 shrink-0">
        <span className="font-display text-xl font-semibold text-cream tracking-tight">Quotify</span>
        <Button variant="ghostOnDark" size="icon" onClick={onClose} className="lg:hidden" aria-label="Close menu">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-all duration-150',
                isActive
                  ? 'bg-cream text-burgundy font-medium shadow-sm'
                  : 'text-cream/75 hover:text-cream hover:bg-cream/10',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-cream/15 shrink-0 pt-3">
        <UserProfile />
      </div>
    </aside>
  </>
)
