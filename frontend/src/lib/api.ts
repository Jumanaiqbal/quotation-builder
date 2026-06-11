import axios from 'axios'
import { getToken, removeToken } from './auth'
import type {
  LoginResponse, Client, Quotation, QuotationItem,
  PaginatedResponse, AiDraftResponse,
  QuotationPreviewResponse, SendQuotationResponse, PublicQuotationReview, QuotationLang,
} from '@/types'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      removeToken()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }).then((r) => r.data),
}

export const clientsApi = {
  getAll: (params?: { search?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Client>>('/clients', { params }).then((r) => r.data),
  getOne: (id: string) =>
    api.get<Client>(`/clients/${id}`).then((r) => r.data),
  create: (data: Partial<Client>) =>
    api.post<Client>('/clients', data).then((r) => r.data),
  update: (id: string, data: Partial<Client>) =>
    api.put<Client>(`/clients/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete(`/clients/${id}`),
}

export const quotationsApi = {
  getAll: (params?: { status?: string; search?: string; clientId?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Quotation>>('/quotations', { params }).then((r) => r.data),
  getOne: (id: string) =>
    api.get<Quotation>(`/quotations/${id}`).then((r) => r.data),
  create: (data: { clientId: string; title: string; notes?: string }) =>
    api.post<Quotation>('/quotations', data).then((r) => r.data),
  update: (id: string, data: { title?: string; status?: string; notes?: string }) =>
    api.put<Quotation>(`/quotations/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete(`/quotations/${id}`),
  approve: (id: string) =>
    api.post<{ success: boolean; quotation: Quotation }>(`/quotations/${id}/approve`).then((r) => r.data),
  preview: (id: string, lang: QuotationLang = 'en') =>
    api.get<QuotationPreviewResponse>(`/quotations/${id}/preview`, { params: { lang } }).then((r) => r.data),
  downloadPdf: async (id: string, filename: string, lang: QuotationLang = 'en') => {
    const { downloadPdfFromHtml } = await import('./pdf')
    const { data: preview } = await api.get<QuotationPreviewResponse>(`/quotations/${id}/preview`, { params: { lang } })
    await downloadPdfFromHtml(preview.html, filename)
  },
  send: (id: string) =>
    api.post<SendQuotationResponse>(`/quotations/${id}/send`).then((r) => r.data),
}

const publicApi = axios.create({ baseURL: import.meta.env.VITE_API_URL })

export const publicQuotationsApi = {
  getReview: (token: string, lang: QuotationLang = 'both') =>
    publicApi.get<PublicQuotationReview>(`/public/quotations/review/${token}`, { params: { lang } }).then((r) => r.data),
  approve: (token: string) =>
    publicApi.post<{ success: boolean; status: string }>(`/public/quotations/review/${token}/approve`).then((r) => r.data),
  reject: (token: string) =>
    publicApi.post<{ success: boolean; status: string }>(`/public/quotations/review/${token}/reject`).then((r) => r.data),
  downloadPdf: async (token: string, filename: string, lang: QuotationLang = 'en') => {
    const { downloadPdfFromHtml } = await import('./pdf')
    const { data: review } = await publicApi.get<PublicQuotationReview>(`/public/quotations/review/${token}`, { params: { lang } })
    await downloadPdfFromHtml(review.html, filename)
  },
}

export const itemsApi = {
  create: (quotationId: string, data: { title: string; description?: string; quantity: number; unitPrice: number; estimatedHours?: number }) =>
    api.post<QuotationItem>(`/quotations/${quotationId}/items`, data).then((r) => r.data),
  update: (quotationId: string, itemId: string, data: Partial<{ title: string; description: string; quantity: number; unitPrice: number; estimatedHours: number }>) =>
    api.put<QuotationItem>(`/quotations/${quotationId}/items/${itemId}`, data).then((r) => r.data),
  delete: (quotationId: string, itemId: string) =>
    api.delete(`/quotations/${quotationId}/items/${itemId}`),
}

export const aiApi = {
  generateDraft: (clientRequest: string) =>
    api.post<AiDraftResponse>('/quotations/ai-draft', { clientRequest }).then((r) => r.data),
}

export default api
