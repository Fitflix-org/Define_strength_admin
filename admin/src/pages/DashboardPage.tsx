import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react'

interface DashboardStats {
  overview: {
    totalUsers: number
    totalOrders: number
    totalProducts: number
    totalRevenue: string | number
    netRevenue: string | number
    gatewayFees: string | number
    successfulPayments: number
  }
  recentOrders: Array<{
    id: string
    customerName: string
    total: string | number
    status: string
    paymentStatus: string
    paymentMethod: string
    createdAt: string
  }>
  dailyRevenue: Array<{
    date: string
    revenue: string | number
  }>
}

export const DashboardPage: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3001/api/admin/dashboard')
      return response.data as DashboardStats
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        Failed to load dashboard data. Please try again.
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${Number(stats?.overview?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Orders',
      value: stats?.overview?.totalOrders?.toString() || '0',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Users',
      value: stats?.overview?.totalUsers?.toString() || '0',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Successful Payments',
      value: stats?.overview?.successfulPayments?.toString() || '0',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm lg:text-base text-gray-600">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-4 lg:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${stat.bgColor} p-2 lg:p-3 rounded-md`}>
                      <Icon className={`h-5 w-5 lg:h-6 lg:w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="ml-4 lg:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs lg:text-sm font-medium text-gray-500 truncate">
                        {stat.title}
                      </dt>
                      <dd className="text-base lg:text-lg font-medium text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Revenue Summary */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-4 lg:py-5 lg:px-6">
          <h3 className="text-base lg:text-lg leading-6 font-medium text-gray-900 mb-3 lg:mb-4">
            Revenue Summary
          </h3>
          <div className="grid grid-cols-1 gap-3 lg:gap-5 lg:grid-cols-3">
            <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
              <div className="text-xs lg:text-sm font-medium text-gray-500">Gross Revenue</div>
              <div className="text-lg lg:text-2xl font-bold text-gray-900">
                ${Number(stats?.overview?.totalRevenue || 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
              <div className="text-xs lg:text-sm font-medium text-gray-500">Net Revenue</div>
              <div className="text-lg lg:text-2xl font-bold text-green-600">
                ${Number(stats?.overview?.netRevenue || 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
              <div className="text-xs lg:text-sm font-medium text-gray-500">Gateway Fees</div>
              <div className="text-lg lg:text-2xl font-bold text-red-600">
                ${Number(stats?.overview?.gatewayFees || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-4 lg:py-5 lg:px-6">
          <h3 className="text-base lg:text-lg leading-6 font-medium text-gray-900 mb-3 lg:mb-4">
            Recent Orders
          </h3>
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.customerName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${Number(order.total).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'CONFIRMED' 
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.paymentStatus === 'COMPLETED' 
                              ? 'bg-green-100 text-green-800'
                              : order.paymentStatus === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <ul className="lg:hidden divide-y divide-gray-200">
                {stats.recentOrders.map((order) => (
                  <li key={order.id} className="py-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">${Number(order.total).toFixed(2)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'CONFIRMED' 
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.paymentStatus === 'COMPLETED' 
                            ? 'bg-green-100 text-green-800'
                            : order.paymentStatus === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="text-center text-gray-500 py-6 lg:py-8">
              No recent orders found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
