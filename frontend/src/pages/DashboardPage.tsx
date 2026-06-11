import { useNavigate } from 'react-router-dom'
import { Users, FileText, CheckCircle, DollarSign, Plus } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { Card, CardContent, SectionLabel } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useClientsQuery } from '@/hooks/useClients'
import { useQuotationsQuery } from '@/hooks/useQuotations'
import { formatCurrency, formatDate } from '@/lib/utils'

export const DashboardPage = () => {
  const navigate = useNavigate()
  const { data: clientsData, isLoading: clientsLoading } = useClientsQuery()
  const { data: quotationsData, isLoading: quotationsLoading } = useQuotationsQuery()

  const clients = clientsData?.data ?? []
  const quotations = quotationsData?.data ?? []
  const approved = quotations.filter((q) => q.status === 'APPROVED')
  const revenue = approved.reduce((sum, q) => sum + Number(q.totalAmount), 0)

  const stats = [
    { label: 'Total Clients', value: clients.length, icon: Users },
    { label: 'Total Quotations', value: quotations.length, icon: FileText },
    { label: 'Approved', value: approved.length, icon: CheckCircle },
    { label: 'Revenue', value: formatCurrency(revenue), icon: DollarSign },
  ]

  return (
    <AppShell title="Dashboard">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {clientsLoading || quotationsLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : stats.map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="p-6">
                <div className="inline-flex p-2 rounded-lg bg-burgundy/10 mb-3">
                  <Icon className="h-4 w-4 text-burgundy" />
                </div>
                <p className="font-display text-2xl font-medium text-burgundy">{value}</p>
                <p className="text-xs text-burgundy/50 mt-1 font-sans">{label}</p>
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <SectionLabel>Recent Quotations</SectionLabel>
            {quotationsLoading ? (
              <SkeletonCard />
            ) : quotations.length === 0 ? (
              <p className="text-sm text-burgundy/50 font-sans">No quotations yet.</p>
            ) : (
              quotations.slice(0, 5).map((q) => (
                <button
                  key={q.id}
                  onClick={() => navigate(`/quotations/${q.id}`)}
                  className="w-full flex items-center justify-between py-3 border-b border-cream-dark last:border-0 hover:bg-cream-dark/40 rounded-md px-1 -mx-1 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-burgundy font-sans">{q.title}</p>
                    <p className="text-xs text-burgundy/50 font-sans">{formatDate(q.createdAt)}</p>
                  </div>
                  <StatusBadge status={q.status} />
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <SectionLabel>Quick Actions</SectionLabel>
            <div className="space-y-3">
              <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/clients')}>
                <Plus className="h-4 w-4" />
                Add new client
              </Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/quotations')}>
                <Plus className="h-4 w-4" />
                Create new quotation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
