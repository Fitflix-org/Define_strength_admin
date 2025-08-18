import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Star,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  PieChart,
  Target,
  Activity,
  Eye,
  MousePointer,
} from 'lucide-react'
import { toast } from 'sonner'
import { MetricCard } from '../components/charts/MetricCard'
import { LineChart } from '../components/charts/LineChart'
import { analyticsAPI, dashboardAPI } from '../services/api'
import { formatCurrency, formatDate, cn, downloadBlob, calculatePercentageChange } from '../lib/utils'

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  // Fetch analytics data
  const {
    data: analyticsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: async () => {
      const response = await analyticsAPI.getAdvancedAnalytics({ period: dateRange })
      return response.data.data
    },
    refetchInterval: 60000, // Refresh every minute
  })

  // Fetch revenue trends
  const {
    data: revenueTrends,
    isLoading: trendsLoading,
  } = useQuery({
    queryKey: ['revenue-trends', dateRange],
    queryFn: async () => {
      const response = await analyticsAPI.getRevenueTrends({ period: dateRange })
      return response.data.data
    },
  })

  // Fetch product performance
  const {
    data: productPerformance,
    isLoading: productLoading,
  } = useQuery({
    queryKey: ['product-performance', dateRange],
    queryFn: async () => {
      const response = await analyticsAPI.getProductPerformance({ period: dateRange })
      return response.data.data
    },
  })

  // Fetch customer insights
  const {
    data: customerInsights,
    isLoading: customerLoading,
  } = useQuery({
    queryKey: ['customer-insights', dateRange],
    queryFn: async () => {
      const response = await analyticsAPI.getCustomerInsights({ period: dateRange })
      return response.data.data
    },
  })

  // Export analytics report
  const exportReport = async (format: 'csv' | 'pdf') => {
    try {
      const response = await analyticsAPI.exportReport({ period: dateRange, format })
      downloadBlob(
        response.data,
        `analytics-report-${dateRange}-${new Date().toISOString().split('T')[0]}.${format}`
      )
      toast.success(`Analytics report exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Failed to export analytics report')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Advanced analytics and business insights
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {/* Date Range Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="all">All time</option>
          </select>

          {/* Export Buttons */}
          <button
            onClick={() => exportReport('csv')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>

          <button
            onClick={() => exportReport('pdf')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
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
          value={analyticsData?.revenue?.total || 0}
          previousValue={analyticsData?.revenue?.previous || 0}
          format="currency"
          icon={DollarSign}
          color="green"
          loading={isLoading}
        />
        
        <MetricCard
          title="Orders"
          value={analyticsData?.orders?.total || 0}
          previousValue={analyticsData?.orders?.previous || 0}
          format="number"
          icon={ShoppingCart}
          color="blue"
          loading={isLoading}
        />
        
        <MetricCard
          title="New Customers"
          value={analyticsData?.customers?.new || 0}
          previousValue={analyticsData?.customers?.previousNew || 0}
          format="number"
          icon={Users}
          color="purple"
          loading={isLoading}
        />
        
        <MetricCard
          title="Conversion Rate"
          value={analyticsData?.conversionRate?.current || 0}
          previousValue={analyticsData?.conversionRate?.previous || 0}
          format="percentage"
          icon={Target}
          color="orange"
          loading={isLoading}
        />
      </div>

      {/* Revenue Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Revenue Trends
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Daily revenue and order trends over time
            </p>
          </div>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        
        <LineChart
          data={revenueTrends || []}
          xKey="date"
          yKeys={[
            {
              key: 'revenue',
              name: 'Revenue',
              color: '#10b981',
              format: 'currency',
            },
            {
              key: 'orders',
              name: 'Orders',
              color: '#3b82f6',
              format: 'number',
            },
          ]}
          height={400}
          loading={trendsLoading}
        />
      </motion.div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Products
            </h2>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          
          {productLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex justify-between items-center">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {productPerformance?.topProducts?.map((product: any, index: number) => (
                <div key={product.id} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-medium mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {product.sales} sales
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(product.revenue)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {((product.revenue / productPerformance.totalRevenue) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Package className="w-8 h-8 mx-auto mb-2" />
                  <p>No product data available</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Customer Segments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Customer Insights
            </h2>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          
          {customerLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {customerInsights?.segments?.map((segment: any) => (
                <div key={segment.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {segment.name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {segment.count} customers ({segment.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${segment.percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn(
                        "h-2 rounded-full",
                        segment.name === 'New Customers' && "bg-green-500",
                        segment.name === 'Returning Customers' && "bg-blue-500",
                        segment.name === 'VIP Customers' && "bg-purple-500",
                        segment.name === 'Inactive Customers' && "bg-gray-400"
                      )}
                    />
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p>No customer data available</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Traffic Sources
            </h2>
            <MousePointer className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {analyticsData?.trafficSources?.map((source: any) => (
              <div key={source.name} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={cn(
                    "w-3 h-3 rounded-full mr-3",
                    source.name === 'Direct' && "bg-blue-500",
                    source.name === 'Search' && "bg-green-500",
                    source.name === 'Social' && "bg-purple-500",
                    source.name === 'Referral' && "bg-orange-500"
                  )}></div>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {source.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {source.percentage}%
                </span>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <p>No traffic data available</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sales Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sales Performance
            </h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Average Order Value</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatCurrency(analyticsData?.salesMetrics?.averageOrderValue || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Orders per Day</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {analyticsData?.salesMetrics?.ordersPerDay || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Customer Lifetime Value</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatCurrency(analyticsData?.salesMetrics?.customerLifetimeValue || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Return Rate</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {analyticsData?.salesMetrics?.returnRate || 0}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {analyticsData?.recentActivity?.map((activity: any, index: number) => (
              <div key={index} className="flex items-center text-sm">
                <div className={cn(
                  "w-2 h-2 rounded-full mr-3",
                  activity.type === 'order' && "bg-green-500",
                  activity.type === 'signup' && "bg-blue-500",
                  activity.type === 'product' && "bg-purple-500"
                )}></div>
                <span className="text-gray-900 dark:text-white flex-1">
                  {activity.description}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {formatDate(activity.timestamp, 'relative')}
                </span>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}