import axios from 'axios'
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  Order,
  Payment,
  Product,
  Review,
  ContactMessage,
  NewsletterSubscriber,
  WishlistItem,
  DashboardStats,
  AnalyticsData,
  SystemHealth,
  SystemLog,
  OrderFilters,
  PaymentFilters,
  ProductFilters,
  UserFilters,
  ReviewFilters,
  ContactFilters,
} from '../types'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ token: string; user: User }>>('/api/auth/login', { email, password }),
  
  getProfile: () =>
    api.get<ApiResponse<User>>('/api/auth/me'),
  
  logout: () => {
    localStorage.removeItem('admin_token')
    delete api.defaults.headers.common['Authorization']
  }
}

// Dashboard API
export const dashboardAPI = {
  getStats: () =>
    api.get<ApiResponse<DashboardStats>>('/api/admin/dashboard'),
  
  getAnalytics: (params?: { startDate?: string; endDate?: string; period?: string }) =>
    api.get<ApiResponse<AnalyticsData>>('/api/analytics/overview', { params }),
  
  getPaymentAnalytics: () =>
    api.get<ApiResponse<any>>('/api/analytics/payments'),
  
  getAdvancedAnalytics: (params?: { startDate?: string; endDate?: string }) =>
    api.get<ApiResponse<any>>('/api/analytics/advanced', { params })
}

// Analytics API (advanced analytics endpoints used by AnalyticsPage)
export const analyticsAPI = {
  getAdvancedAnalytics: (params?: { period?: string; startDate?: string; endDate?: string }) =>
    api.get<ApiResponse<any>>('/api/analytics/advanced', { params }),

  getRevenueTrends: (params?: { period?: string; startDate?: string; endDate?: string }) =>
    api.get<ApiResponse<Array<{ date: string; revenue: number; orders: number }>>>('/api/analytics/revenue-trends', { params }),

  getProductPerformance: (params?: { period?: string; startDate?: string; endDate?: string }) =>
    api.get<ApiResponse<any>>('/api/analytics/product-performance', { params }),

  getCustomerInsights: (params?: { period?: string; startDate?: string; endDate?: string }) =>
    api.get<ApiResponse<any>>('/api/analytics/customer-insights', { params }),

  exportReport: (params: { period?: string; startDate?: string; endDate?: string; format: 'csv' | 'pdf' }) =>
    api.get(`/api/analytics/export`, { params, responseType: 'blob' }),
}

// Orders API
export const ordersAPI = {
  getAll: (filters?: OrderFilters) =>
    api.get<PaginatedResponse<Order>>('/api/admin/orders', { params: filters }),
  
  getById: (id: string) =>
    api.get<ApiResponse<Order>>(`/api/admin/orders/${id}`),
  
  updateStatus: (id: string, status: string, trackingNumber?: string, notes?: string) =>
    api.patch<ApiResponse<Order>>(`/api/admin/orders/${id}/status`, { 
      status, 
      trackingNumber, 
      notes 
    }),
  
  retryPayment: (id: string) =>
    api.post<ApiResponse<any>>(`/api/admin/orders/${id}/retry-payment`),
  
  exportCSV: (filters?: OrderFilters) =>
    api.get('/api/admin/orders/export/csv', { 
      params: filters, 
      responseType: 'blob' 
    }),
  
  exportExcel: (filters?: OrderFilters) =>
    api.get('/api/admin/orders/export/excel', { 
      params: filters, 
      responseType: 'blob' 
    }),
  
  bulkUpdateStatus: (orderIds: string[], status: string) =>
    api.patch<ApiResponse<any>>('/api/admin/orders/bulk-status', { 
      orderIds, 
      status 
    })
}

// Payments API
export const paymentsAPI = {
  getAll: (filters?: PaymentFilters) =>
    api.get<PaginatedResponse<Payment>>('/api/admin/payments', { params: filters }),
  
  getById: (id: string) =>
    api.get<ApiResponse<Payment>>(`/api/payments/${id}`),
  
  updateStatus: (id: string, status: string, data?: {
    gatewayPaymentId?: string
    transactionId?: string
    gatewayFee?: number
    failureReason?: string
  }) =>
    api.patch<ApiResponse<Payment>>(`/api/payments/${id}/status`, { 
      status, 
      ...data 
    }),
  
  createRefund: (id: string, amount: number, reason: string) =>
    api.post<ApiResponse<Payment>>(`/api/payments/${id}/refund`, { amount, reason }),
  
  quickRefund: (id: string, percentage: number = 100) =>
    api.post<ApiResponse<Payment>>(`/api/payments/${id}/quick-refund`, { percentage }),
  
  exportCSV: (filters?: PaymentFilters) =>
    api.get('/api/admin/payments/export/csv', { 
      params: filters, 
      responseType: 'blob' 
    })
}

// Products API
export const productsAPI = {
  getAll: (filters?: ProductFilters) =>
    api.get<PaginatedResponse<Product>>('/api/products', { params: filters }),
  
  getById: (id: string) =>
    api.get<ApiResponse<Product>>(`/api/products/${id}`),
  
  create: (data: Partial<Product>) =>
    api.post<ApiResponse<Product>>('/api/admin/products', data),
  
  update: (id: string, data: Partial<Product>) =>
    api.patch<ApiResponse<Product>>(`/api/admin/products/${id}`, data),
  
  delete: (id: string) =>
    api.delete<ApiResponse<any>>(`/api/admin/products/${id}`),
  
  uploadImages: (productId: string, files: File[]) => {
    const formData = new FormData()
    files.forEach(file => formData.append('images', file))
    return api.post<ApiResponse<string[]>>(`/api/admin/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  deleteImage: (productId: string, imageUrl: string) =>
    api.delete<ApiResponse<any>>(`/api/admin/products/${productId}/images`, {
      data: { imageUrl }
    }),
  
  getCategories: () =>
    api.get<ApiResponse<string[]>>('/api/products/categories/all'),
  
  bulkUpdateStatus: (productIds: string[], isActive: boolean) =>
    api.patch<ApiResponse<any>>('/api/admin/products/bulk-status', { 
      productIds, 
      isActive 
    })
}

// Users API
export const usersAPI = {
  getAll: (filters?: UserFilters) =>
    api.get<PaginatedResponse<User>>('/api/admin/users', { params: filters }),
  
  getById: (id: string) =>
    api.get<ApiResponse<User>>(`/api/admin/users/${id}`),
  
  updateRole: (id: string, role: string) =>
    api.patch<ApiResponse<User>>(`/api/admin/users/${id}/role`, { role }),
  
  updateStatus: (id: string, isActive: boolean) =>
    api.patch<ApiResponse<User>>(`/api/admin/users/${id}/status`, { isActive }),
  
  getUserOrders: (userId: string, filters?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Order>>(`/api/admin/users/${userId}/orders`, { params: filters }),
  
  exportCSV: (filters?: UserFilters) =>
    api.get('/api/admin/users/export/csv', { 
      params: filters, 
      responseType: 'blob' 
    })
}

// Reviews API
export const reviewsAPI = {
  getAll: (filters?: ReviewFilters) =>
    api.get<PaginatedResponse<Review>>('/api/admin/reviews', { params: filters }),
  
  getById: (id: string) =>
    api.get<ApiResponse<Review>>(`/api/admin/reviews/${id}`),
  
  updateStatus: (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') =>
    api.patch<ApiResponse<Review>>(`/api/admin/reviews/${id}/status`, { status }),
  
  delete: (id: string) =>
    api.delete<ApiResponse<any>>(`/api/admin/reviews/${id}`),
  
  getStats: () =>
    api.get<ApiResponse<{
      total: number
      approved: number
      pending: number
      rejected: number
      averageRating: number
    }>>('/api/admin/reviews/stats'),
  
  bulkUpdateStatus: (reviewIds: string[], status: string) =>
    api.patch<ApiResponse<any>>('/api/admin/reviews/bulk-status', { 
      reviewIds, 
      status 
    })
}

// Contact Messages API
export const contactAPI = {
  getAll: (filters?: ContactFilters) =>
    api.get<PaginatedResponse<ContactMessage>>('/api/admin/contact-messages', { params: filters }),
  
  getById: (id: string) =>
    api.get<ApiResponse<ContactMessage>>(`/api/admin/contact-messages/${id}`),
  
  updateStatus: (id: string, status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED') =>
    api.patch<ApiResponse<ContactMessage>>(`/api/admin/contact-messages/${id}/status`, { status }),
  
  addReply: (id: string, message: string) =>
    api.post<ApiResponse<ContactMessage>>(`/api/admin/contact-messages/${id}/reply`, { message }),
  
  assign: (id: string, assignedTo: string) =>
    api.patch<ApiResponse<ContactMessage>>(`/api/admin/contact-messages/${id}/assign`, { assignedTo }),
  
  updatePriority: (id: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') =>
    api.patch<ApiResponse<ContactMessage>>(`/api/admin/contact-messages/${id}/priority`, { priority }),
  
  exportCSV: (filters?: ContactFilters) =>
    api.get('/api/admin/contact-messages/export/csv', { 
      params: filters, 
      responseType: 'blob' 
    })
}

// Newsletter API
export const newsletterAPI = {
  getSubscribers: (filters?: { status?: 'ACTIVE' | 'UNSUBSCRIBED'; search?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<NewsletterSubscriber>>('/api/admin/newsletter/subscribers', { params: filters }),
  
  getStats: () =>
    api.get<ApiResponse<{
      total: number
      active: number
      unsubscribed: number
      growthRate: number
      recentSubscriptions: Array<{ date: string; count: number }>
    }>>('/api/admin/newsletter/stats'),
  
  updateSubscriberStatus: (email: string, status: 'ACTIVE' | 'UNSUBSCRIBED') =>
    api.patch<ApiResponse<NewsletterSubscriber>>('/api/admin/newsletter/subscribers/status', { email, status }),
  
  exportSubscribers: (format: 'csv' | 'excel') =>
    api.get(`/api/admin/newsletter/export?format=${format}`, { responseType: 'blob' }),
  
  sendNewsletter: (data: {
    subject: string
    content: string
    recipients?: string[]
    scheduleAt?: string
  }) =>
    api.post<ApiResponse<any>>('/api/admin/newsletter/send', data)
}

// Wishlist API
export const wishlistAPI = {
  getAnalytics: (params?: { startDate?: string; endDate?: string }) =>
    api.get<ApiResponse<{
      totalItems: number
      conversionRate: number
      revenueAttribution: number
      topProducts: Array<{
        productId: string
        product: { name: string; price: number; images: string[] }
        wishlistCount: number
        conversionCount: number
        conversionRate: number
      }>
      categoryBreakdown: Array<{
        category: string
        count: number
        percentage: number
      }>
    }>>('/api/admin/wishlist/analytics', { params }),
  
  getPopularItems: (filters?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<WishlistItem>>('/api/admin/wishlist/popular-items', { params: filters }),
  
  getConversionStats: () =>
    api.get<ApiResponse<{
      totalConversions: number
      conversionRate: number
      averageTimeToConvert: number
      revenueFromWishlist: number
    }>>('/api/admin/wishlist/conversion-stats')
}

// System Monitoring API
export const systemAPI = {
  getHealth: () =>
    api.get<ApiResponse<SystemHealth>>('/api/admin/system/health'),
  
  getLogs: (filters?: {
    level?: 'info' | 'warn' | 'error' | 'debug'
    service?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }) =>
    api.get<PaginatedResponse<SystemLog>>('/api/admin/system/logs', { params: filters }),
  
  getSecurityEvents: (filters?: {
    type?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }) =>
    api.get<PaginatedResponse<any>>('/api/admin/security/events', { params: filters }),
  
  getPerformanceMetrics: (period?: 'hour' | 'day' | 'week' | 'month') =>
    api.get<ApiResponse<{
      responseTime: Array<{ timestamp: string; value: number }>
      throughput: Array<{ timestamp: string; value: number }>
      errorRate: Array<{ timestamp: string; value: number }>
      activeUsers: number
      serverLoad: number
    }>>('/api/admin/system/performance', { params: { period } })
}

export default api