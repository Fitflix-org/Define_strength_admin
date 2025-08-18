import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Star,
  StarOff,
  Eye,
  Trash2,
  Flag,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  Filter,
  User,
  Package,
} from 'lucide-react'
import { toast } from 'sonner'
import { DataTable, Column, Action } from '../components/data/DataTable'
import { MetricCard } from '../components/charts/MetricCard'
import { reviewsAPI } from '../services/api'
import { formatDate, getStatusColor, cn, downloadBlob } from '../lib/utils'
import type { Review, ReviewFilters } from '../types'

export function ReviewsPage() {
  const [filters, setFilters] = useState<ReviewFilters>({
    page: 1,
    limit: 25,
    search: '',
    rating: '',
    status: '',
    product: '',
  })
  const [selectedReviews, setSelectedReviews] = useState<Review[]>([])
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showReviewModal, setShowReviewModal] = useState<{ 
    review?: Review
    show: boolean 
    mode: 'view' | 'moderate'
  }>({
    show: false,
    mode: 'view',
  })

  const queryClient = useQueryClient()

  // Fetch reviews
  const {
    data: reviewsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['reviews', filters, sortBy, sortOrder],
    queryFn: async () => {
      const response = await reviewsAPI.getAll({
        ...filters,
        sortBy,
        sortOrder,
      })
      return response.data
    },
    keepPreviousData: true,
  })

  // Fetch review stats
  const {
    data: reviewStats,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ['review-stats'],
    queryFn: async () => {
      const response = await reviewsAPI.getStats()
      return response.data.data
    },
  })

  // Update review status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ reviewId, status }: { reviewId: string; status: string }) =>
      reviewsAPI.updateStatus(reviewId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['review-stats'] })
      toast.success('Review status updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update review status')
    },
  })

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) => reviewsAPI.delete(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['review-stats'] })
      toast.success('Review deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete review')
    },
  })

  // Bulk moderate reviews mutation
  const bulkModerateMutation = useMutation({
    mutationFn: ({ reviewIds, status }: { reviewIds: string[]; status: string }) =>
      reviewsAPI.bulkModerate(reviewIds, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['review-stats'] })
      toast.success('Reviews moderated successfully')
      setSelectedReviews([])
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to moderate reviews')
    },
  })

  const reviews = reviewsResponse?.data || []
  const pagination = reviewsResponse?.pagination

  // Calculate derived metrics
  const averageRating = reviewStats?.averageRating || 0
  const totalReviews = reviewStats?.total || 0
  const pendingReviews = reviewStats?.pending || 0
  const approvedReviews = reviewStats?.approved || 0

  // Render star rating
  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const stars = []
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
          <Star
          key={i}
          className={cn(
            sizeClass,
            i <= rating 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300 dark:text-gray-600'
          )}
        />
      )
    }
    return <div className="flex">{stars}</div>
  }

  const columns: Column<Review>[] = [
    {
      key: 'product',
      header: 'Product',
      sortable: true,
      render: (review) => (
        <div className="flex items-center">
          <img
            src={review.product?.images?.[0] || '/placeholder.svg'}
            alt={review.product?.name}
            className="w-10 h-10 rounded-lg object-cover mr-3"
          />
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {review.product?.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              by {review.user?.firstName || review.user?.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      sortable: true,
      render: (review) => (
        <div className="flex items-center">
          {renderStars(review.rating)}
          <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
            {review.rating}/5
          </span>
        </div>
      ),
      width: '120px',
    },
    {
      key: 'comment',
      header: 'Review',
      render: (review) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
            {review.comment}
          </p>
          {review.comment.length > 100 && (
            <button
              onClick={() => setShowReviewModal({ review, show: true, mode: 'view' })}
              className="text-xs text-blue-600 hover:text-blue-700 mt-1"
            >
              Read more
            </button>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (review) => (
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          review.status === 'APPROVED'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            : review.status === 'PENDING'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        )}>
          {review.status}
        </span>
      ),
      width: '100px',
    },
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      render: (review) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white">
            {formatDate(review.createdAt, 'short')}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {formatDate(review.createdAt, 'relative')}
          </div>
        </div>
      ),
      width: '120px',
    },
  ]

  const actions: Action<Review>[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (review) => {
        setShowReviewModal({ review, show: true, mode: 'view' })
      },
    },
    {
      label: 'Approve',
      icon: CheckCircle,
      onClick: (review) => {
        updateStatusMutation.mutate({ reviewId: review.id, status: 'APPROVED' })
      },
      disabled: (review) => review.status === 'APPROVED',
      color: 'primary',
    },
    {
      label: 'Reject',
      icon: XCircle,
      onClick: (review) => {
        updateStatusMutation.mutate({ reviewId: review.id, status: 'REJECTED' })
      },
      disabled: (review) => review.status === 'REJECTED',
      color: 'danger',
    },
    {
      label: 'Flag',
      icon: Flag,
      onClick: (review) => {
        updateStatusMutation.mutate({ reviewId: review.id, status: 'FLAGGED' })
      },
      color: 'warning',
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: (review) => {
        if (confirm('Are you sure you want to delete this review?')) {
          deleteReviewMutation.mutate(review.id)
        }
      },
      color: 'danger',
    },
  ]

  const bulkActions = [
    {
      label: 'Approve Reviews',
      icon: CheckCircle,
      onClick: (reviews: Review[]) => {
        bulkModerateMutation.mutate({
          reviewIds: reviews.map(r => r.id),
          status: 'APPROVED'
        })
      },
      color: 'primary' as const,
    },
    {
      label: 'Reject Reviews',
      icon: XCircle,
      onClick: (reviews: Review[]) => {
        bulkModerateMutation.mutate({
          reviewIds: reviews.map(r => r.id),
          status: 'REJECTED'
        })
      },
      color: 'danger' as const,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reviews
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage customer reviews and ratings
          </p>
      </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </button>
            </div>
          </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Reviews"
          value={totalReviews}
          format="number"
          icon={MessageSquare}
          color="blue"
          loading={statsLoading}
        />
        
        <MetricCard
          title="Average Rating"
          value={averageRating}
          format="decimal"
          icon={Star}
          color="yellow"
          loading={statsLoading}
          suffix="/5"
        />
        
        <MetricCard
          title="Approved Reviews"
          value={approvedReviews}
          format="number"
          icon={CheckCircle}
          color="green"
          loading={statsLoading}
        />
        
        <MetricCard
          title="Pending Reviews"
          value={pendingReviews}
          format="number"
          icon={Clock}
          color="orange"
          loading={statsLoading}
            />
          </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rating
            </label>
          <select
              value={filters.rating || ''}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
          <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="FLAGGED">Flagged</option>
          </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product
            </label>
            <input
              type="text"
              placeholder="Search by product name..."
              value={filters.product || ''}
              onChange={(e) => setFilters({ ...filters, product: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Reviews Table */}
        <DataTable
          data={reviews}
          columns={columns}
        actions={actions}
          loading={isLoading}
        pagination={pagination ? {
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          onPageChange: (page) => setFilters({ ...filters, page }),
          onLimitChange: (limit) => setFilters({ ...filters, limit, page: 1 }),
        } : undefined}
        selection={{
          selectedItems: selectedReviews,
          onSelectionChange: setSelectedReviews,
          keyExtractor: (review) => review.id,
        }}
        sorting={{
          sortBy,
          sortOrder,
          onSortChange: (key, order) => {
            setSortBy(key)
            setSortOrder(order)
          },
        }}
        filtering={{
          searchTerm: filters.search,
          onSearchChange: (search) => setFilters({ ...filters, search, page: 1 }),
        }}
        bulkActions={bulkActions}
        emptyState={{
          title: 'No reviews found',
          description: 'There are no reviews matching your current filters.',
        }}
      />

      {/* Review Details Modal */}
      {showReviewModal.show && showReviewModal.review && (
        <ReviewModal
          review={showReviewModal.review}
          mode={showReviewModal.mode}
          onClose={() => setShowReviewModal({ show: false, mode: 'view' })}
          onStatusUpdate={(reviewId, status) => {
            updateStatusMutation.mutate({ reviewId, status })
            setShowReviewModal({ show: false, mode: 'view' })
          }}
        />
      )}
    </div>
  )
}

// Review Details Modal Component
interface ReviewModalProps {
  review: Review
  mode: 'view' | 'moderate'
  onClose: () => void
  onStatusUpdate: (reviewId: string, status: string) => void
}

function ReviewModal({ review, mode, onClose, onStatusUpdate }: ReviewModalProps) {
  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={cn(
            'w-5 h-5',
            i <= rating 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300 dark:text-gray-600'
          )}
        />
      )
    }
    return <div className="flex">{stars}</div>
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Review Details
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Product Info */}
            <div className="flex items-center">
              <img
                src={review.product?.images?.[0] || '/placeholder.svg'}
                alt={review.product?.name}
                className="w-16 h-16 rounded-lg object-cover mr-4"
              />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {review.product?.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Reviewed by {review.user?.firstName || review.user?.email}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating
              </label>
              <div className="flex items-center">
                {renderStars(review.rating)}
                <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {review.rating}/5
                </span>
              </div>
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Review
              </label>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-900 dark:text-white">
                  {review.comment}
                </p>
              </div>
            </div>

            {/* Status and Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Status: </span>
                <span className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  review.status === 'APPROVED'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : review.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                )}>
                  {review.status}
                </span>
              </div>

              <div className="flex space-x-2">
                {review.status !== 'APPROVED' && (
                  <button
                    onClick={() => onStatusUpdate(review.id, 'APPROVED')}
                    className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                )}
                
                {review.status !== 'REJECTED' && (
                  <button
                    onClick={() => onStatusUpdate(review.id, 'REJECTED')}
                    className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}