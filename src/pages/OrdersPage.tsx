import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  RefreshCw,
  Download,
  Package,
  Eye,
  Edit,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Calendar,
  Filter,
  Search,
  MoreVertical,
} from 'lucide-react'
import { toast } from 'sonner'
import { DataTable, Column, Action } from '../components/data/DataTable'
import { MetricCard } from '../components/charts/MetricCard'
import { ordersAPI } from '../services/api'
import { formatCurrency, formatDate, getStatusColor, cn, downloadBlob } from '../lib/utils'
import type { Order, OrderFilters } from '../types'

export function OrdersPage() {
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 25,
    search: '',
    status: '',
    paymentStatus: '',
  })
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([])
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showStatusModal, setShowStatusModal] = useState<{ order: Order; show: boolean }>({ 
    order: {} as Order, 
    show: false 
  })

  const queryClient = useQueryClient()

  // Fetch orders
  const {
    data: ordersResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['orders', filters, sortBy, sortOrder],
    queryFn: async () => {
      const response = await ordersAPI.getAll({
        ...filters,
        sortBy,
        sortOrder,
      })
      return response.data
    },
    keepPreviousData: true,
  })

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ 
      orderId, 
      status, 
      trackingNumber, 
      notes 
    }: { 
      orderId: string
      status: string
      trackingNumber?: string
      notes?: string
    }) => 
      ordersAPI.updateStatus(orderId, status, trackingNumber, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order status updated successfully')
      setShowStatusModal({ order: {} as Order, show: false })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update order status')
    },
  })

  // Retry payment mutation
  const retryPaymentMutation = useMutation({
    mutationFn: (orderId: string) => ordersAPI.retryPayment(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Payment retry initiated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to retry payment')
    },
  })

  // Bulk status update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: ({ orderIds, status }: { orderIds: string[], status: string }) =>
      ordersAPI.bulkUpdateStatus(orderIds, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Orders updated successfully')
      setSelectedOrders([])
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update orders')
    },
  })

  // Export mutations
  const exportCSVMutation = useMutation({
    mutationFn: () => ordersAPI.exportCSV(filters),
    onSuccess: (response) => {
      downloadBlob(response.data, `orders-${new Date().toISOString().split('T')[0]}.csv`)
      toast.success('Orders exported successfully')
    },
    onError: () => {
      toast.error('Failed to export orders')
    },
  })

  const exportExcelMutation = useMutation({
    mutationFn: () => ordersAPI.exportExcel(filters),
    onSuccess: (response) => {
      downloadBlob(response.data, `orders-${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success('Orders exported successfully')
    },
    onError: () => {
      toast.error('Failed to export orders')
    },
  })

  const orders = ordersResponse?.data || []
  const pagination = ordersResponse?.pagination

  // Calculate metrics
  const totalOrders = pagination?.total || 0
  const pendingOrders = orders.filter(order => order.status === 'PENDING').length
  const completedOrders = orders.filter(order => order.status === 'DELIVERED').length
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)

  const columns: Column<Order>[] = [
    {
      key: 'id',
      header: 'Order ID',
      sortable: true,
      render: (order) => (
        <div className="font-mono text-xs text-blue-600 dark:text-blue-400">
          #{order.id.slice(-8)}
        </div>
      ),
      width: '120px',
    },
    {
      key: 'user.email',
      header: 'Customer',
      sortable: true,
      render: (order) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {order.user.firstName && order.user.lastName
              ? `${order.user.firstName} ${order.user.lastName}`
              : order.user.email}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {order.user.email}
          </div>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      align: 'right',
      render: (order) => (
        <div className="font-semibold text-gray-900 dark:text-white">
          {formatCurrency(order.total)}
        </div>
      ),
      width: '120px',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (order) => (
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          getStatusColor(order.status)
        )}>
          {order.status}
        </span>
      ),
      width: '120px',
    },
    {
      key: 'payments',
      header: 'Payment',
      render: (order) => {
        const payment = order.payments[0]
        if (!payment) {
    return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
              No Payment
            </span>
          )
        }
    return (
          <div>
            <span className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              getStatusColor(payment.status)
            )}>
              {payment.status}
            </span>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {payment.paymentMethod}
            </div>
      </div>
    )
      },
      width: '140px',
    },
    {
      key: 'items',
      header: 'Items',
      render: (order) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-white">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {order.items.slice(0, 2).map(item => item.product.name).join(', ')}
            {order.items.length > 2 && ` +${order.items.length - 2} more`}
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (order) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white">
            {formatDate(order.createdAt, 'short')}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {formatDate(order.createdAt, 'relative')}
          </div>
        </div>
      ),
      width: '120px',
    },
  ]

  const actions: Action<Order>[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (order) => {
        // Navigate to order details
        console.log('View order:', order.id)
      },
    },
    {
      label: 'Update Status',
      icon: Edit,
      onClick: (order) => {
        setShowStatusModal({ order, show: true })
      },
    },
    {
      label: 'Retry Payment',
      icon: CreditCard,
      onClick: (order) => {
        retryPaymentMutation.mutate(order.id)
      },
      disabled: (order) => {
        const payment = order.payments[0]
        return !payment || payment.status === 'COMPLETED'
      },
      color: 'primary',
    },
  ]

  const bulkActions = [
    {
      label: 'Mark as Confirmed',
      icon: CheckCircle,
      onClick: (orders: Order[]) => {
        bulkUpdateMutation.mutate({
          orderIds: orders.map(o => o.id),
          status: 'CONFIRMED'
        })
      },
      color: 'primary' as const,
    },
    {
      label: 'Mark as Shipped',
      icon: Truck,
      onClick: (orders: Order[]) => {
        bulkUpdateMutation.mutate({
          orderIds: orders.map(o => o.id),
          status: 'SHIPPED'
        })
      },
      color: 'primary' as const,
    },
    {
      label: 'Cancel Orders',
      icon: XCircle,
      onClick: (orders: Order[]) => {
        bulkUpdateMutation.mutate({
          orderIds: orders.map(o => o.id),
          status: 'CANCELLED'
        })
      },
      color: 'danger' as const,
    },
  ]

  const handleExport = (format: 'csv' | 'excel') => {
    if (format === 'csv') {
      exportCSVMutation.mutate()
    } else {
      exportExcelMutation.mutate()
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Orders
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage and track customer orders
          </p>
      </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {/* Export buttons */}
      <div className="relative">
            <button
              onClick={() => handleExport('csv')}
              disabled={exportCSVMutation.isLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              {exportCSVMutation.isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Export CSV
            </button>
      </div>

          <button
            onClick={() => handleExport('excel')}
            disabled={exportExcelMutation.isLoading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            {exportExcelMutation.isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            Export Excel
          </button>

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
          title="Total Orders"
          value={totalOrders}
          format="number"
          icon={Package}
          color="blue"
          loading={isLoading}
        />
        
        <MetricCard
          title="Pending Orders"
          value={pendingOrders}
          format="number"
          icon={AlertCircle}
          color="yellow"
          loading={isLoading}
        />
        
        <MetricCard
          title="Completed Orders"
          value={completedOrders}
          format="number"
          icon={CheckCircle}
          color="green"
          loading={isLoading}
        />
        
        <MetricCard
          title="Total Revenue"
          value={totalRevenue}
          format="currency"
          icon={CreditCard}
          color="green"
          loading={isLoading}
        />
                      </div>
                      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
                            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Status
            </label>
            <select
              value={filters.paymentStatus || ''}
              onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Payment Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
                          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date From
            </label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
                  </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date To
            </label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
                        </div>
                      </div>
                    </div>
                    
      {/* Orders Table */}
      <DataTable
        data={orders}
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
          selectedItems: selectedOrders,
          onSelectionChange: setSelectedOrders,
          keyExtractor: (order) => order.id,
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
          title: 'No orders found',
          description: 'There are no orders matching your current filters.',
        }}
      />

      {/* Status Update Modal */}
      {showStatusModal.show && (
        <StatusUpdateModal
          order={showStatusModal.order}
          onClose={() => setShowStatusModal({ order: {} as Order, show: false })}
          onUpdate={(status, trackingNumber, notes) => {
            updateStatusMutation.mutate({
              orderId: showStatusModal.order.id,
              status,
              trackingNumber,
              notes,
            })
          }}
          isLoading={updateStatusMutation.isLoading}
        />
        )}
      </div>
  )
}

// Status Update Modal Component
interface StatusUpdateModalProps {
  order: Order
  onClose: () => void
  onUpdate: (status: string, trackingNumber?: string, notes?: string) => void
  isLoading: boolean
}

function StatusUpdateModal({ order, onClose, onUpdate, isLoading }: StatusUpdateModalProps) {
  const [status, setStatus] = useState(order.status)
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '')
  const [notes, setNotes] = useState(order.notes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(status, trackingNumber || undefined, notes || undefined)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Update Order Status
              </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            </div>
            
              <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tracking Number (optional)
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
              </div>
              
              <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
              </div>
              
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin inline" />
                  Updating...
                </>
              ) : (
                'Update Order'
              )}
            </button>
                </div>
        </form>
      </motion.div>
    </div>
  )
}
