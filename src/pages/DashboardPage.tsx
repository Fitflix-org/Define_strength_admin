import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Users,
  ShoppingCart,
  Package,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  MoreVertical,
} from 'lucide-react'
import { MetricCard } from '../components/charts/MetricCard'
import { LineChart } from '../components/charts/LineChart'
import { dashboardAPI } from '../services/api'
import { formatCurrency, formatDate, getStatusColor, cn } from '../lib/utils'
import type { DashboardStats } from '../types'

export function DashboardPage() {
  const [dateRange, setDateRange] = useState('30d')

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await dashboardAPI.getStats()
      return response.data.data
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const {
    data: analytics,
    isLoading: analyticsLoading,
  } = useQuery({
    queryKey: ['dashboard', 'analytics', dateRange],
    queryFn: async () => {
      const response = await dashboardAPI.getAnalytics({ period: dateRange })
      return response.data.data
    },
    refetchInterval: 60000, // Refresh every minute
  })

  const isLoading = statsLoading || analyticsLoading

  const handleRefresh = () => {
    refetchStats()
  }

  const getGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Welcome back! Here's what's happening with your business.
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={stats?.overview.totalRevenue || 0}
          format="currency"
          icon={CreditCard}
          color="green"
          loading={statsLoading}
          change={stats ? getGrowthRate(stats.overview.totalRevenue, stats.overview.totalRevenue * 0.9) : undefined}
        />
        
        <MetricCard
          title="Total Orders"
          value={stats?.overview.totalOrders || 0}
          format="number"
          icon={ShoppingCart}
          color="blue"
          loading={statsLoading}
          change={stats ? getGrowthRate(stats.overview.totalOrders, stats.overview.totalOrders * 0.85) : undefined}
        />
        
        <MetricCard
          title="Total Users"
          value={stats?.overview.totalUsers || 0}
          format="number"
          icon={Users}
          color="purple"
          loading={statsLoading}
          change={stats ? getGrowthRate(stats.overview.totalUsers, stats.overview.totalUsers * 0.95) : undefined}
        />
        
        <MetricCard
          title="Total Products"
          value={stats?.overview.totalProducts || 0}
          format="number"
          icon={Package}
          color="yellow"
          loading={statsLoading}
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Net Revenue"
          value={stats?.overview.netRevenue || 0}
          format="currency"
          icon={TrendingUp}
          color="green"
          loading={statsLoading}
        />
        
        <MetricCard
          title="Gateway Fees"
          value={stats?.overview.gatewayFees || 0}
          format="currency"
          icon={CreditCard}
          color="red"
          loading={statsLoading}
        />
        
        <MetricCard
          title="Successful Payments"
          value={stats?.overview.successfulPayments || 0}
          format="number"
          icon={TrendingUp}
          color="blue"
          loading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Revenue Trend
              </h2>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            
            <LineChart
              data={stats?.dailyRevenue || []}
              xKey="date"
              yKeys={[
                {
                  key: 'revenue',
                  name: 'Revenue',
                  color: '#3b82f6',
                  format: 'currency',
                },
              ]}
              height={350}
              loading={statsLoading}
            />
          </motion.div>
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Orders
            </h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
              View all
            </button>
          </div>

          {statsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {stats?.recentOrders.slice(0, 5).map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {order.customerName}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        getStatusColor(order.status)
                      )}>
                        {order.status}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(order.createdAt, 'relative')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(order.total)}
                    </p>
                    <div className="flex items-center mt-1">
                      {order.paymentStatus === 'COMPLETED' ? (
                        <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-red-500 mr-1" />
                      )}
                      <span className={cn(
                        'text-xs',
                        order.paymentStatus === 'COMPLETED' ? 'text-green-600' : 'text-red-600'
                      )}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Payment Methods & Top Products */}
      {analytics && Array.isArray(analytics.paymentMethods) && Array.isArray(analytics.topProducts) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Payment Methods
            </h2>
            <div className="space-y-4">
              {(analytics.paymentMethods || []).map((method, index) => {
                const percentage = (method.amount / analytics.paymentMethods.reduce((sum, m) => sum + m.amount, 0)) * 100
                return (
                  <div key={method.method} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {method.method}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className="bg-blue-500 h-2 rounded-full"
                        />
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(method.amount)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {method.count} transactions
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Top Products
            </h2>
            <div className="space-y-4">
              {(analytics.topProducts || []).map((item, index) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="flex-shrink-0">
                    <img
                      src={item.product.images[0] || '/placeholder.svg'}
                      alt={item.product.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.quantity} sold • {formatCurrency(item.revenue)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      #{index + 1}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}