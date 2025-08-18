import api, { PaginationParams } from './api';

// Customer Engagement APIs for Admin
const customerEngagementAPI = {
  // Product Reviews Management
  getReviews: (params?: PaginationParams & { 
    productId?: string; 
    rating?: number; 
    verified?: boolean; 
    search?: string;
    sortBy?: string;
  }) =>
    api.get('/api/admin/reviews', { params }),
  
  getReviewById: (id: string) =>
    api.get(`/api/admin/reviews/${id}`),
  
  updateReviewStatus: (id: string, status: 'approved' | 'rejected' | 'pending') =>
    api.patch(`/api/admin/reviews/${id}/status`, { status }),
  
  deleteReview: (id: string) =>
    api.delete(`/api/admin/reviews/${id}`),
  
  getReviewStats: () =>
    api.get('/api/admin/reviews/stats'),

  // Contact & Support Management
  getContactMessages: (params?: PaginationParams & { 
    category?: string; 
    status?: string; 
    search?: string;
    priority?: string;
  }) =>
    api.get('/api/admin/contact-messages', { params }),
  
  getContactMessageById: (id: string) =>
    api.get(`/api/admin/contact-messages/${id}`),
  
  updateMessageStatus: (id: string, status: 'new' | 'in-progress' | 'resolved' | 'closed') =>
    api.patch(`/api/admin/contact-messages/${id}/status`, { status }),
  
  addMessageReply: (id: string, reply: string) =>
    api.post(`/api/admin/contact-messages/${id}/reply`, { reply }),
  
  assignMessage: (id: string, assignedTo: string) =>
    api.patch(`/api/admin/contact-messages/${id}/assign`, { assignedTo }),

  // Newsletter Management
  getNewsletterSubscribers: (params?: PaginationParams & { 
    status?: 'active' | 'unsubscribed'; 
    search?: string;
  }) =>
    api.get('/api/admin/newsletter/subscribers', { params }),
  
  getNewsletterStats: () =>
    api.get('/api/admin/newsletter/stats'),
  
  exportSubscribers: (format: 'csv' | 'excel') =>
    api.get(`/api/admin/newsletter/export?format=${format}`, { responseType: 'blob' }),
  
  updateSubscriberStatus: (email: string, status: 'active' | 'unsubscribed') =>
    api.patch('/api/admin/newsletter/subscribers/status', { email, status }),

  // Wishlist Analytics
  getWishlistAnalytics: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/api/admin/wishlist/analytics', { params }),
  
  getPopularWishlistItems: (params?: PaginationParams) =>
    api.get('/api/admin/wishlist/popular-items', { params }),
  
  getWishlistConversionStats: () =>
    api.get('/api/admin/wishlist/conversion-stats')
}

// Add to main API export
export { customerEngagementAPI }
