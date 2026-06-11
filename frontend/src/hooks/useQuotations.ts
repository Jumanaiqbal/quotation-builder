import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { quotationsApi, itemsApi, aiApi } from '@/lib/api'
import type { QuotationStatus, QuotationLang } from '@/types'

const Q_KEY = 'quotations'

export const useQuotationsQuery = (params?: { status?: QuotationStatus; search?: string; clientId?: string }) =>
  useQuery({
    queryKey: [Q_KEY, params],
    queryFn: () => quotationsApi.getAll({ ...params, limit: 100 }),
  })

export const useQuotationQuery = (id: string) =>
  useQuery({
    queryKey: [Q_KEY, id],
    queryFn: () => quotationsApi.getOne(id),
    enabled: !!id,
  })

export const useCreateQuotation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { clientId: string; title: string; notes?: string }) => quotationsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [Q_KEY] }); toast.success('Quotation created') },
    onError: () => toast.error('Failed to create quotation'),
  })
}

export const useUpdateQuotation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; status?: string; notes?: string } }) =>
      quotationsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [Q_KEY] }); toast.success('Quotation updated') },
    onError: () => toast.error('Failed to update quotation'),
  })
}

export const useDeleteQuotation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => quotationsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [Q_KEY] }); toast.success('Quotation deleted') },
    onError: () => toast.error('Failed to delete quotation'),
  })
}

export const useQuotationPreview = (id: string, enabled: boolean, lang: QuotationLang = 'en') =>
  useQuery({
    queryKey: [Q_KEY, id, 'preview', lang],
    queryFn: () => quotationsApi.preview(id, lang),
    enabled: enabled && !!id,
  })

export const useSendQuotation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => quotationsApi.send(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [Q_KEY] })
      toast.success(data.message)
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message ?? 'Failed to send quotation'),
  })
}

export const useApproveQuotation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => quotationsApi.approve(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [Q_KEY] }); toast.success('Quotation approved 🎉') },
    onError: () => toast.error('Failed to approve quotation'),
  })
}

export const useCreateItem = (quotationId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; description?: string; quantity: number; unitPrice: number; estimatedHours?: number }) =>
      itemsApi.create(quotationId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [Q_KEY, quotationId] }); toast.success('Item added') },
    onError: () => toast.error('Failed to add item'),
  })
}

export const useUpdateItem = (quotationId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: Partial<{ title: string; description: string; quantity: number; unitPrice: number; estimatedHours: number }> }) =>
      itemsApi.update(quotationId, itemId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [Q_KEY, quotationId] }); toast.success('Item updated') },
    onError: () => toast.error('Failed to update item'),
  })
}

export const useDeleteItem = (quotationId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => itemsApi.delete(quotationId, itemId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [Q_KEY, quotationId] }); toast.success('Item deleted') },
    onError: () => toast.error('Failed to delete item'),
  })
}

export const useAiDraft = () =>
  useMutation({
    mutationFn: (clientRequest: string) => aiApi.generateDraft(clientRequest),
    onError: () => toast.error('AI generation failed'),
  })
