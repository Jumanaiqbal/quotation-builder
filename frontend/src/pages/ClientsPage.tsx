import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Users, Pencil, Trash2, Plus } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonRow } from '@/components/shared/SkeletonCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Label, Input, Textarea, FieldError, SearchInput } from '@/components/ui/input'
import { Sheet } from '@/components/ui/sheet'
import { Dialog, DialogActions } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { useClientsQuery, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks/useClients'
import { formatDate } from '@/lib/utils'
import type { Client } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().optional(),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const initials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

export const ClientsPage = () => {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    debounceRef.current && clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300)
    return () => { debounceRef.current && clearTimeout(debounceRef.current) }
  }, [search])

  const { data, isLoading } = useClientsQuery(debouncedSearch)
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()
  const clients = data?.data ?? []

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const openAdd = () => { setEditClient(null); reset({}); setSheetOpen(true) }
  const openEdit = (c: Client) => { setEditClient(c); reset(c); setSheetOpen(true) }
  const closeSheet = () => { setSheetOpen(false); setEditClient(null) }

  const onSubmit = async (data: FormData) => {
    if (editClient) await updateClient.mutateAsync({ id: editClient.id, data })
    else await createClient.mutateAsync(data)
    closeSheet()
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    await deleteClient.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <AppShell
      title="Clients"
      actions={
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Client
        </Button>
      }
    >
      <PageHeader title="Clients" description={`${clients.length} total`} />

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-burgundy/45 z-10 pointer-events-none" />
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, company or email…"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}</div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Add your first client to get started"
          actionLabel="Add Client"
          onAction={openAdd}
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-dark bg-cream-light/50">
                {['Name / Company', 'Email', 'Phone', 'Added', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-burgundy/50 uppercase tracking-wider font-sans">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-dark">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-cream-dark/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar initials={initials(c.name)} variant="light" size="sm" />
                      <div>
                        <p className="font-medium text-burgundy font-sans">{c.name}</p>
                        {c.company && <p className="text-xs text-burgundy/50 font-sans">{c.company}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-burgundy/65 font-sans">{c.email}</td>
                  <td className="px-4 py-3 text-burgundy/65 font-sans">{c.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-burgundy/50 text-xs font-sans">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)} aria-label="Edit client">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(c)}
                        className="hover:text-red-600 hover:bg-red-50"
                        aria-label="Delete client"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Sheet
        open={sheetOpen}
        onClose={closeSheet}
        title={editClient ? 'Edit Client' : 'Add Client'}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" type="button" onClick={closeSheet}>Cancel</Button>
            <Button className="flex-1" type="submit" form="client-form" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save'}
            </Button>
          </div>
        }
      >
        <form id="client-form" onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
          <div>
            <Label>Full Name *</Label>
            <Input {...register('name')} placeholder="First and last name" />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <Label>Company</Label>
            <Input {...register('company')} placeholder="Company name" />
          </div>
          <div>
            <Label>Email *</Label>
            <Input {...register('email')} type="email" placeholder="Work email address" />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input {...register('phone')} placeholder="+973 1234 5678" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea {...register('notes')} rows={3} placeholder="Optional notes…" />
          </div>
        </form>
      </Sheet>

      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Client"
        description={
          <>
            Are you sure you want to delete <strong className="text-burgundy">{deleteTarget?.name}</strong>?
            This will also delete all their quotations.
          </>
        }
      >
        <DialogActions>
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  )
}
