import { Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './pages/auth/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { OrdersPage } from './pages/OrdersPage'
import { PaymentsPage } from './pages/PaymentsPage'
import { ProductsPage } from './pages/ProductsPage'
import { UsersPage } from './pages/UsersPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { ReviewsPage } from './pages/ReviewsPage'
import { ContactPage } from './pages/ContactPage'
import { NewsletterPage } from './pages/NewsletterPage'
import { WishlistPage } from './pages/WishlistPage'
import { SecurityPage } from './pages/SecurityPage'
import { PerformancePage } from './pages/PerformancePage'
import { SettingsPage } from './pages/SettingsPage'
import { HealthCheck } from './components/common/HealthCheck'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/payments" element={<PaymentsPage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/users" element={<UsersPage />} />
                      <Route path="/analytics" element={<AnalyticsPage />} />
                      <Route path="/reviews" element={<ReviewsPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/newsletter" element={<NewsletterPage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/security" element={<SecurityPage />} />
                      <Route path="/performance" element={<PerformancePage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
          <HealthCheck />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App