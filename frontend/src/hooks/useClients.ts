import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { clientsApi } from '@/lib/api'
import type { Client } from '@/types'

const CLIENTS_KEY = 'clients'

export const useClientsQuery = (search?: string) =>
  useQuery({
    queryKey: [CLIENTS_KEY, search],
    queryFn: () => clientsApi.getAll({ search, limit: 100 }),
  })

export const useClientQuery = (id: string) =>
  useQuery({
    queryKey: [CLIENTS_KEY, id],
    queryFn: () => clientsApi.getOne(id),
    enabled: !!id,
  })

export const useCreateClient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Client>) => clientsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CLIENTS_KEY] })
      toast.success('Client created')
    },
    onError: () => toast.error('Failed to create client'),
  })
}

export const useUpdateClient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) => clientsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CLIENTS_KEY] })
      toast.success('Client updated')
    },
    onError: () => toast.error('Failed to update client'),
  })
}

export const useDeleteClient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CLIENTS_KEY] })
      toast.success('Client deleted')
    },
    onError: () => toast.error('Failed to delete client'),
  })
}
