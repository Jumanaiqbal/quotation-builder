import { LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const displayNameFromEmail = (email: string) => {
  const local = email.split('@')[0] ?? email
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export const UserProfile = () => {
  const { user, logout } = useAuth()
  if (!user) return null

  const initials = user.email.slice(0, 2).toUpperCase()
  const displayName = user.name ?? displayNameFromEmail(user.email)

  return (
    <div className="px-3 pb-4">
      <div className="rounded-lg bg-cream/12 border border-cream/20 p-3 mb-2">
        <div className="flex items-center gap-3">
          <Avatar initials={initials} variant="dark" size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-cream truncate font-sans">{displayName}</p>
            <p className="text-xs text-cream/75 truncate font-sans">{user.email}</p>
          </div>
        </div>
      </div>
      <Button
        variant="ghostOnDark"
        size="md"
        onClick={logout}
        className="w-full justify-start px-3"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  )
}
