export interface User { id: string; email: string; name?: string }
export interface LoginResponse { token: string; user: User }

export interface Client {
  id: string; name: string; company?: string
  email: string; phone?: string; notes?: string
  createdAt: string; updatedAt: string
}

export type QuotationStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED'
export type QuotationLang = 'en' | 'ar'

export interface QuotationItem {
  id: string; quotationId: string; title: string
  description?: string; quantity: number
  unitPrice: string; total: string; estimatedHours?: number
  createdAt: string; updatedAt: string
}

export interface Quotation {
  id: string; clientId: string; title: string
  status: QuotationStatus; totalAmount: string
  notes?: string; reviewToken?: string | null; sentAt?: string | null
  createdAt: string; updatedAt: string
  client?: Client; items?: QuotationItem[]
}

export interface QuotationPreviewResponse {
  quotation: Quotation
  html: string
  lang: QuotationLang
}

export interface SendQuotationResponse {
  success: boolean
  quotation: Quotation
  reviewUrl: string
  message: string
}

export interface PublicQuotationReview {
  id: string; title: string; status: QuotationStatus
  totalAmount: string; notes?: string
  createdAt: string; sentAt?: string | null
  client: Client; items: QuotationItem[]
  html: string
  lang: QuotationLang
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: { page: number; limit: number; total: number; pages: number }
}

export interface AiSuggestedItem {
  title: string; description: string
  quantity: number; unit_price: number | null; estimated_hours: number
}

export interface AiDraftResponse {
  project_type: string
  suggested_items: AiSuggestedItem[]
  questions_to_ask_client: string[]
  summary: string
}
