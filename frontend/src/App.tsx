import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ClientsPage } from '@/pages/ClientsPage'
import { QuotationsPage } from '@/pages/QuotationsPage'
import { QuotationDetailPage } from '@/pages/QuotationDetailPage'
import { QuotationReviewPage } from '@/pages/QuotationReviewPage'
import { isAuthenticated } from '@/lib/auth'
import type { ReactNode } from 'react'

/** Wrapper that bounces unauthenticated users to /login */
const Protected = ({ children }: { children: ReactNode }) =>
  isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/review/:token" element={<QuotationReviewPage />} />
    <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
    <Route path="/clients" element={<Protected><ClientsPage /></Protected>} />
    <Route path="/quotations" element={<Protected><QuotationsPage /></Protected>} />
    <Route path="/quotations/:id" element={<Protected><QuotationDetailPage /></Protected>} />
  </Routes>
)

export default App
