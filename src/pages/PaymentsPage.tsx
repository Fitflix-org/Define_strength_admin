import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  CreditCard,
  RefreshCw,
  Download,
  Eye,
  RotateCcw,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  PieChart,
  BarChart3,
  Smartphone,
  Wallet,
  Building,
  Banknote,
  Filter,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'
import { DataTable, Column, Action } from '../components/data/DataTable'
import { MetricCard } from '../components/charts/MetricCard'
import { LineChart } from '../components/charts/LineChart'
import { paymentsAPI, dashboardAPI } from '../services/api'
import { formatCurrency, formatDate, getStatusColor, cn, downloadBlob, calculatePercentageChange } from '../lib/utils'
import type { Payment, PaymentFilters } from '../types'

export function PaymentsPage() {
  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    limit: 25,
    search: '',
    status: '',
    method: '',
  })
  const [selectedPayments, setSelectedPayments] = useState<Payment[]>([])
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showRefundModal, setShowRefundModal] = useState<{ payment: Payment; show: boolean }>({
    payment: {} as Payment,
    show: false,
  })

  const queryClient = useQueryClient()

  // Fetch payments
  const {
    data: paymentsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['payments', filters, sortBy, sortOrder],
    queryFn: async () => {
      const response = await paymentsAPI.getAll({
        ...filters,
        sortBy,
        sortOrder,
      })
      return response.data
    },
    keepPreviousData: true,
  })

  // Fetch payment analytics
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
  } = useQuery({
    queryKey: ['payment-analytics'],
    queryFn: async () => {
      const response = await dashboardAPI.getPaymentAnalytics()
      return response.data.data
    },
    refetchInterval: 60000, // Refresh every minute
  })

  // Quick refund mutation
  const quickRefundMutation = useMutation({
    mutationFn: ({ paymentId, percentage }: { paymentId: string; percentage: number }) =>
      paymentsAPI.quickRefund(paymentId, percentage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      toast.success('Refund processed successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process refund')
    },
  })

  // Export CSV mutation
  const exportCSVMutation = useMutation({
    mutationFn: () => paymentsAPI.exportCSV(filters),
    onSuccess: (response) => {
      downloadBlob(response.data, `payments-${new Date().toISOString().split('T')[0]}.csv`)
      toast.success('Payments exported successfully')
    },
    onError: () => {
      toast.error('Failed to export payments')
    },
  })

  const payments = paymentsResponse?.data || []
  const pagination = paymentsResponse?.pagination

  // Calculate metrics
  const totalRevenue = payments.reduce((sum, payment) => 
    payment.status === 'COMPLETED' ? sum + payment.amount : sum, 0
  )
  const completedPayments = payments.filter(payment => payment.status === 'COMPLETED').length
  const failedPayments = payments.filter(payment => payment.status === 'FAILED').length
  const pendingPayments = payments.filter(payment => payment.status === 'PENDING').length

  const columns: Column<Payment>[] = [
    {
      key: 'id',
      header: 'Payment ID',
      sortable: true,
      render: (payment) => (
        <div className="font-mono text-xs text-blue-600 dark:text-blue-400">
          #{payment.id.slice(-8)}
        </div>
      ),
      width: '120px',
    },
    {
      key: 'order',
      header: 'Order',
      render: (payment) => (
        <div>
          {payment.order ? (
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Order #{payment.order.id.slice(-8)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {payment.order.user?.firstName && payment.order.user?.lastName
                  ? `${payment.order.user.firstName} ${payment.order.user.lastName}`
                  : payment.order.user?.email}
              </div>
            </div>
          ) : (
            <span className="text-gray-400">No order</span>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      align: 'right',
      render: (payment) => (
        <div className="text-right">
          <div className="font-semibold text-gray-900 dark:text-white">
            {formatCurrency(payment.amount)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Net: {formatCurrency(payment.netAmount)}
          </div>
        </div>
      ),
      width: '120px',
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      sortable: true,
      render: (payment) => (
        <div className="flex items-center">
          <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {payment.paymentMethod}
          </span>
        </div>
      ),
      width: '120px',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (payment) => (
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          getStatusColor(payment.status)
        )}>
          {payment.status}
        </span>
      ),
      width: '120px',
    },
    {
      key: 'gatewayFee',
      header: 'Gateway Fee',
      align: 'right',
      render: (payment) => (
        <div className="text-right text-sm text-gray-600 dark:text-gray-400">
          {formatCurrency(payment.gatewayFee)}
        </div>
      ),
      width: '100px',
    },
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      render: (payment) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white">
            {formatDate(payment.createdAt, 'short')}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {formatDate(payment.createdAt, 'relative')}
          </div>
        </div>
      ),
      width: '120px',
    },
  ]

  const actions: Action<Payment>[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (payment) => {
        console.log('View payment:', payment.id)
      },
    },
    {
      label: 'Quick Refund (100%)',
      icon: RotateCcw,
      onClick: (payment) => {
        if (confirm('Are you sure you want to process a full refund?')) {
          quickRefundMutation.mutate({ paymentId: payment.id, percentage: 100 })
        }
      },
      disabled: (payment) => payment.status !== 'COMPLETED',
      color: 'danger',
    },
    {
      label: 'Partial Refund',
      icon: DollarSign,
      onClick: (payment) => {
        setShowRefundModal({ payment, show: true })
      },
      disabled: (payment) => payment.status !== 'COMPLETED',
      color: 'primary',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payments
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage payment transactions and process refunds
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            onClick={() => exportCSVMutation.mutate()}
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
          title="Total Revenue"
          value={totalRevenue}
          format="currency"
          icon={TrendingUp}
          color="green"
          loading={isLoading}
        />
        
        <MetricCard
          title="Completed Payments"
          value={completedPayments}
          format="number"
          icon={CheckCircle}
          color="green"
          loading={isLoading}
        />
        
        <MetricCard
          title="Failed Payments"
          value={failedPayments}
          format="number"
          icon={AlertTriangle}
          color="red"
          loading={isLoading}
        />
        
        <MetricCard
          title="Pending Payments"
          value={pendingPayments}
          format="number"
          icon={Clock}
          color="yellow"
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
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Method
            </label>
          <select
              value={filters.method || ''}
              onChange={(e) => setFilters({ ...filters, method: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Methods</option>
              <option value="CARD">Card</option>
              <option value="UPI">UPI</option>
              <option value="WALLET">Wallet</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="COD">Cash on Delivery</option>
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

      {/* Payment Analytics Charts */}
      {analyticsData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Payment Methods
              </h2>
              <PieChart className="w-5 h-5 text-gray-400" />
                            </div>
            
            <div className="space-y-4">
              {analyticsData.paymentMethods?.map((method: any, index: number) => {
                const total = analyticsData.paymentMethods.reduce((sum: number, m: any) => sum + m.amount, 0)
                const percentage = (method.amount / total) * 100
                const icon = getPaymentMethodIcon(method.method)
                
                return (
                  <div key={method.method} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {icon}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {method.method}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {method.count} transactions
                          </div>
                          </div>
                        </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(method.amount)}
                        </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {percentage.toFixed(1)}%
                        </div>
                          </div>
                        </div>
                )
              })}
                        </div>
          </motion.div>

          {/* Payment Success Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Payment Success Rate
              </h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {(completedPayments / (payments.length || 1) * 100).toFixed(1)}%
                      </span>
                    </div>
                    
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completedPayments / (payments.length || 1) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-green-500 h-3 rounded-full"
                />
                    </div>
                    
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
                  <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {completedPayments}
                    </div>
                  </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Failed</div>
                  <div className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {failedPayments}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
                  <div className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                    {pendingPayments}
                </div>
              </div>
            </div>
          </div>
          </motion.div>
        </div>
      )}

      {/* Recent Transactions Trend */}
      {analyticsData?.transactionTrend && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Transaction Trend (Last 30 Days)
            </h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
                  </div>
          
          <LineChart
            data={analyticsData.transactionTrend}
            xKey="date"
            yKeys={[
              {
                key: 'amount',
                name: 'Amount',
                color: '#3b82f6',
                format: 'currency',
              },
              {
                key: 'count',
                name: 'Count',
                color: '#10b981',
                format: 'number',
              },
            ]}
            height={300}
            loading={analyticsLoading}
          />
        </motion.div>
      )}

      {/* Payments Table */}
      <DataTable
        data={payments}
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
          selectedItems: selectedPayments,
          onSelectionChange: setSelectedPayments,
          keyExtractor: (payment) => payment.id,
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
        emptyState={{
          title: 'No payments found',
          description: 'There are no payments matching your current filters.',
        }}
      />

      {/* Refund Modal */}
      {showRefundModal.show && (
        <RefundModal
          payment={showRefundModal.payment}
          onClose={() => setShowRefundModal({ payment: {} as Payment, show: false })}
          onSubmit={(percentage) => {
            quickRefundMutation.mutate({ 
              paymentId: showRefundModal.payment.id, 
              percentage 
            })
            setShowRefundModal({ payment: {} as Payment, show: false })
          }}
          isLoading={quickRefundMutation.isLoading}
        />
      )}
                </div>
  )
}

// Helper function to get payment method icons
function getPaymentMethodIcon(method: string) {
  switch (method) {
    case 'CARD':
      return <CreditCard className="w-4 h-4 text-blue-500" />
    case 'UPI':
      return <Smartphone className="w-4 h-4 text-green-500" />
    case 'WALLET':
      return <Wallet className="w-4 h-4 text-purple-500" />
    case 'BANK_TRANSFER':
      return <Building className="w-4 h-4 text-indigo-500" />
    case 'COD':
      return <Banknote className="w-4 h-4 text-orange-500" />
    default:
      return <CreditCard className="w-4 h-4 text-gray-500" />
  }
}

// Refund Modal Component
interface RefundModalProps {
  payment: Payment
  onClose: () => void
  onSubmit: (percentage: number) => void
  isLoading: boolean
}

function RefundModal({ payment, onClose, onSubmit, isLoading }: RefundModalProps) {
  const [percentage, setPercentage] = useState(100)
  const refundAmount = (payment.amount * percentage) / 100

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (percentage > 0 && percentage <= 100) {
      onSubmit(percentage)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Process Refund
        </h3>

        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Payment Details</div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {formatCurrency(payment.amount)}
                </div>
          <div className="text-xs text-gray-500">
            Payment ID: #{payment.id.slice(-8)}
            </div>
          </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Refund Percentage
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="1"
                max="100"
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                {percentage}%
              </span>
                  </div>
                </div>

          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Refund Amount</div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(refundAmount)}
                </div>
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
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin inline" />
                  Processing...
                </>
              ) : (
                'Process Refund'
              )}
            </button>
            </div>
        </form>
      </motion.div>
    </div>
  )
}
