import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../services/api';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react';

interface AdvancedAnalytics {
  revenueMetrics: {
    totalRevenue: number;
    revenueGrowth: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  salesMetrics: {
    totalOrders: number;
    ordersGrowth: number;
    completedOrders: number;
    cancelledOrders: number;
  };
  customerMetrics: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    customerLifetimeValue: number;
  };
  productMetrics: {
    topSellingProducts: Array<{
      id: string;
      name: string;
      sales: number;
      revenue: number;
    }>;
    categoryPerformance: Array<{
      category: string;
      sales: number;
      revenue: number;
    }>;
  };
  timeSeriesData: Array<{
    date: string;
    revenue: number;
    orders: number;
    customers: number;
  }>;
}

export const AdvancedAnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['advanced-analytics', dateRange],
    queryFn: async () => {
      const response = await dashboardAPI.getAdvancedAnalytics({
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      return response.data as AdvancedAnalytics;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const kpiCards = useMemo(() => {
    if (!analytics) return [];

    return [
      {
        title: 'Total Revenue',
        value: `$${analytics.revenueMetrics.totalRevenue.toLocaleString()}`,
        change: analytics.revenueMetrics.revenueGrowth,
        icon: DollarSign,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        title: 'Average Order Value',
        value: `$${analytics.revenueMetrics.averageOrderValue.toFixed(2)}`,
        change: 0, // Could be calculated if we had previous period data
        icon: Target,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      {
        title: 'Total Orders',
        value: analytics.salesMetrics.totalOrders.toLocaleString(),
        change: analytics.salesMetrics.ordersGrowth,
        icon: ShoppingCart,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      },
      {
        title: 'Conversion Rate',
        value: `${analytics.revenueMetrics.conversionRate.toFixed(2)}%`,
        change: 0,
        icon: BarChart3,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      },
      {
        title: 'New Customers',
        value: analytics.customerMetrics.newCustomers.toLocaleString(),
        change: 0,
        icon: Users,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100'
      },
      {
        title: 'Customer LTV',
        value: `$${analytics.customerMetrics.customerLifetimeValue.toFixed(2)}`,
        change: 0,
        icon: TrendingUp,
        color: 'text-pink-600',
        bgColor: 'bg-pink-100'
      }
    ];
  }, [analytics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">Analytics Unavailable</h3>
        <p className="text-sm text-gray-500 mt-2">
          Unable to load analytics data. This feature requires the backend analytics service.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600">Comprehensive business insights and metrics</p>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          const isPositive = kpi.change > 0;
          const isNegative = kpi.change < 0;
          
          return (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${kpi.bgColor} p-3 rounded-md`}>
                      <Icon className={`h-6 w-6 ${kpi.color}`} />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {kpi.title}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-lg font-medium text-gray-900">
                          {kpi.value}
                        </div>
                        {kpi.change !== 0 && (
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {isPositive && <TrendingUp className="h-3 w-3 mr-1" />}
                            {isNegative && <TrendingDown className="h-3 w-3 mr-1" />}
                            {Math.abs(kpi.change).toFixed(1)}%
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Selling Products</h3>
            <div className="space-y-3">
              {analytics.productMetrics.topSellingProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">{product.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ${product.revenue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Category Performance</h3>
            <div className="space-y-3">
              {analytics.productMetrics.categoryPerformance.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <PieChart className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {category.category}
                      </p>
                      <p className="text-xs text-gray-500">{category.sales} items sold</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ${category.revenue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Order Status Breakdown */}
      {analytics && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analytics.salesMetrics.completedOrders}
              </div>
              <div className="text-sm text-gray-500">Completed Orders</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{
                    width: `${(analytics.salesMetrics.completedOrders / analytics.salesMetrics.totalOrders) * 100}%`
                  }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {analytics.salesMetrics.totalOrders - analytics.salesMetrics.completedOrders - analytics.salesMetrics.cancelledOrders}
              </div>
              <div className="text-sm text-gray-500">Pending Orders</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{
                    width: `${((analytics.salesMetrics.totalOrders - analytics.salesMetrics.completedOrders - analytics.salesMetrics.cancelledOrders) / analytics.salesMetrics.totalOrders) * 100}%`
                  }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {analytics.salesMetrics.cancelledOrders}
              </div>
              <div className="text-sm text-gray-500">Cancelled Orders</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{
                    width: `${(analytics.salesMetrics.cancelledOrders / analytics.salesMetrics.totalOrders) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
