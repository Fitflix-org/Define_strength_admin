// Common types
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: 'ADMIN' | 'USER' | 'SUPER_ADMIN'
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLogin?: string
}

export interface Order {
  id: string
  userId: string
  user: {
    firstName?: string
    lastName?: string
    email: string
  }
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  total: number
  subtotal: number
  tax: number
  shipping: number
  discount: number
  items: OrderItem[]
  payments: Payment[]
  shippingAddress?: Address
  billingAddress?: Address
  trackingNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
  expiresAt?: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product: {
    name: string
    images: string[]
    price: number
  }
  quantity: number
  price: number
  total: number
}

export interface Payment {
  id: string
  orderId: string
  order?: Order
  userId: string
  user?: User
  amount: number
  currency: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
  paymentMethod: 'CARD' | 'UPI' | 'WALLET' | 'BANK_TRANSFER' | 'COD'
  gatewayPaymentId?: string
  transactionId?: string
  gatewayFee: number
  netAmount: number
  refundAmount?: number
  refundReason?: string
  failureReason?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  salePrice?: number
  images: string[]
  category: string
  spaceType: string
  tags: string[]
  specifications: Record<string, any>
  isActive: boolean
  isFeatured: boolean
  stock: number
  sku: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  createdAt: string
  updatedAt: string
}

export interface Address {
  id: string
  type: 'SHIPPING' | 'BILLING'
  firstName: string
  lastName: string
  company?: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
  isDefault: boolean
}

export interface Review {
  id: string
  userId: string
  user: {
    firstName?: string
    lastName?: string
    email: string
  }
  productId: string
  product: {
    name: string
    images: string[]
  }
  rating: number
  title?: string
  comment?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  isVerified: boolean
  helpfulCount: number
  createdAt: string
  updatedAt: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  category: 'GENERAL' | 'ORDER' | 'PAYMENT' | 'PRODUCT' | 'TECHNICAL' | 'COMPLAINT'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  subject: string
  message: string
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  assignedTo?: string
  replies: ContactReply[]
  googleSheetsRef?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface ContactReply {
  id: string
  contactMessageId: string
  adminId: string
  adminName: string
  message: string
  createdAt: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  status: 'ACTIVE' | 'UNSUBSCRIBED'
  source?: string
  tags: string[]
  subscribedAt: string
  unsubscribedAt?: string
  metadata?: Record<string, any>
}

export interface WishlistItem {
  id: string
  userId: string
  user: {
    firstName?: string
    lastName?: string
    email: string
  }
  productId: string
  product: {
    name: string
    price: number
    images: string[]
    category: string
  }
  addedAt: string
  convertedAt?: string
  orderId?: string
}

export interface DashboardStats {
  overview: {
    totalUsers: number
    totalOrders: number
    totalProducts: number
    totalRevenue: number
    netRevenue: number
    gatewayFees: number
    successfulPayments: number
  }
  recentOrders: Array<{
    id: string
    customerName: string
    total: number
    status: string
    paymentStatus: string
    paymentMethod?: string
    createdAt: string
  }>
  dailyRevenue: Array<{
    date: string
    revenue: number
  }>
}

export interface AnalyticsData {
  revenue: {
    total: number
    net: number
    fees: number
    transactions: number
  }
  paymentMethods: Array<{
    method: string
    amount: number
    count: number
  }>
  topProducts: Array<{
    product: {
      id: string
      name: string
      images: string[]
    }
    quantity: number
    revenue: number
  }>
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'error'
  uptime: number
  memory: {
    used: number
    total: number
    percentage: number
  }
  cpu: {
    usage: number
  }
  database: {
    status: 'connected' | 'disconnected'
    responseTime: number
  }
  services: {
    api: boolean
    payment: boolean
    email: boolean
    storage: boolean
  }
  lastChecked: string
}

export interface SystemLog {
  id: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  service: string
  userId?: string
  metadata?: Record<string, any>
  timestamp: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface OrderUpdateForm {
  status: Order['status']
  trackingNumber?: string
  notes?: string
}

export interface PaymentRefundForm {
  amount: number
  reason: string
}

export interface ProductForm {
  name: string
  description: string
  price: number
  salePrice?: number
  category: string
  spaceType: string
  tags: string[]
  specifications: Record<string, any>
  isActive: boolean
  isFeatured: boolean
  stock: number
  sku: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
}

// Filter types
export interface OrderFilters {
  status?: string
  paymentStatus?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
}

export interface PaymentFilters {
  status?: string
  method?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
}

export interface ProductFilters {
  category?: string
  spaceType?: string
  status?: string
  featured?: boolean
  search?: string
  page?: number
  limit?: number
}

export interface UserFilters {
  role?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}

export interface ReviewFilters {
  productId?: string
  rating?: number
  status?: string
  verified?: boolean
  search?: string
  page?: number
  limit?: number
}

export interface ContactFilters {
  category?: string
  status?: string
  priority?: string
  assignedTo?: string
  search?: string
  page?: number
  limit?: number
}

// Export types
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf'
  dateRange?: {
    start: string
    end: string
  }
  filters?: Record<string, any>
  fields?: string[]
}
