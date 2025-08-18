import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Heart, TrendingUp, ShoppingCart, Users, Calendar } from 'lucide-react'
import { customerEngagementAPI } from '../services/customerEngagementAPI'
import { DataTable } from '../components/DataTable'

interface WishlistAnalytics {
  totalWishlistItems: number
  uniqueWishlistedProducts: number
  averageWishlistSize: number
  conversionRate: number
  topWishlistedProducts: Array<{
    id: string
    name: string
    image: string
    wishlistCount: number
    conversionRate: number
    category: string
    price: number
  }>
}

interface PopularWishlistItem {
  id: string
  productId: string
  productName: string
  productImage: string
  category: string | { name: string }
  price: number
  wishlistCount: number
  addedThisWeek: number
  conversionRate: number
  revenue: number
}

const WishlistAnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('30')

  // Fetch wishlist analytics
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['wishlist-analytics', dateRange],
    queryFn: async () => {
      const response = await customerEngagementAPI.getWishlistAnalytics({
        startDate: new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      });
      console.log('Wishlist Analytics Response:', response);
      return response;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  // Fetch popular wishlist items
  const { data: popularItemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['popular-wishlist-items'],
    queryFn: async () => {
      const response = await customerEngagementAPI.getPopularWishlistItems({ limit: 50 });
      console.log('Popular Items Response:', response);
      return response;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  // Fetch conversion stats
  const { data: conversionData } = useQuery({
    queryKey: ['wishlist-conversion-stats'],
    queryFn: async () => {
      const response = await customerEngagementAPI.getWishlistConversionStats();
      console.log('Conversion Stats Response:', response);
      return response;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  })

  // Process and map the API data to match component expectations
  const analytics = analyticsData?.data ? {
    totalWishlistItems: analyticsData.data.totalWishlistItems || analyticsData.data.total_wishlist_items || 0,
    uniqueWishlistedProducts: analyticsData.data.uniqueWishlistedProducts || analyticsData.data.unique_products || 0,
    averageWishlistSize: analyticsData.data.averageWishlistSize || analyticsData.data.average_wishlist_size || 0,
    conversionRate: analyticsData.data.conversionRate || analyticsData.data.conversion_rate || 0,
    topWishlistedProducts: analyticsData.data.topWishlistedProducts || []
  } : {
    totalWishlistItems: 0,
    uniqueWishlistedProducts: 0,
    averageWishlistSize: 0,
    conversionRate: 0,
    topWishlistedProducts: []
  }

  const popularItems = popularItemsData?.data || [];
  
  // Debug logging
  console.log('Raw Popular Items Data:', popularItemsData);
  console.log('Popular Items Data Structure:', popularItemsData?.data);
  
  // Ensure popularItems is always an array - handle nested structure
  const processedPopularItems = Array.isArray(popularItems) ? popularItems : 
    (popularItems?.popularItems && Array.isArray(popularItems.popularItems)) ? popularItems.popularItems : 
    [];
    
  // Additional logging for processed items
  console.log('Final Processed Popular Items:', processedPopularItems);
  console.log('Final Popular Items Length:', processedPopularItems.length);
  
  if (processedPopularItems.length > 0) {
    console.log('First Popular Item:', processedPopularItems[0]);
    console.log('First Item Keys:', Object.keys(processedPopularItems[0] || {}));
  }
  console.log('Is Array?', Array.isArray(processedPopularItems));
  
  if (Array.isArray(processedPopularItems) && processedPopularItems.length > 0) {
    console.log('First Processed Item:', processedPopularItems[0]);
    console.log('First Processed Item Keys:', Object.keys(processedPopularItems[0] || {}));
  }
  const conversion = conversionData?.data ? {
    averageTimeToConversion: conversionData.data.averageTimeToConversion || conversionData.data.average_time_to_conversion || 0,
    averageOrderValueFromWishlist: conversionData.data.averageOrderValueFromWishlist || conversionData.data.average_order_value || 0,
    wishlistToCartRate: conversionData.data.wishlistToCartRate || conversionData.data.wishlist_to_cart_rate || 0
  } : {
    averageTimeToConversion: 0,
    averageOrderValueFromWishlist: 0,
    wishlistToCartRate: 0
  };

  // Columns for DataTable
  const columns = [
    {
      key: 'product',
      title: 'Product',
      render: (item: PopularWishlistItem) => (
        <div className="flex items-center space-x-3">
          <img
            src={item?.productImage || '/placeholder-product.png'}
            alt={item?.productName || 'Product'}
            className="w-12 h-12 object-cover rounded-lg"
          />
          <div>
            <p className="font-medium text-gray-900">{item?.productName || 'Unknown Product'}</p>
            <p className="text-sm text-gray-500">
              {typeof item?.category === 'object' && item.category && 'name' in item.category 
                ? item.category.name 
                : typeof item?.category === 'string' 
                ? item.category 
                : 'No Category'}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'price',
      title: 'Price',
      render: (item: PopularWishlistItem) => (
        <span className="font-medium text-gray-900">
          {item && typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : '$0.00'}
        </span>
      )
    },
    {
      key: 'wishlistCount',
      title: 'Total Wishlisted',
      render: (item: PopularWishlistItem) => (
        <div className="flex items-center">
          <Heart className="w-4 h-4 text-red-500 mr-2" />
          <span className="font-medium text-gray-900">{item?.wishlistCount?.toLocaleString() || '0'}</span>
        </div>
      )
    },
    {
      key: 'addedThisWeek',
      title: 'Added This Week',
      render: (item: PopularWishlistItem) => (
        <div className="flex items-center">
          <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
          <span className="text-green-600 font-medium">{item?.addedThisWeek || '0'}</span>
        </div>
      )
    },
    {
      key: 'conversionRate',
      title: 'Conversion Rate',
      render: (item: PopularWishlistItem) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${Math.min(item?.conversionRate || 0, 100)}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-900">%</span>
        </div>
      )
    },
    {
      key: 'revenue',
      title: 'Generated Revenue',
      render: (item: PopularWishlistItem) => (
        <span className="font-medium text-green-600">
          {item && typeof item.revenue === 'number' ? `$${item.revenue.toLocaleString()}` : '$0'}
        </span>
      )
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Wishlist Analytics</h1>
        <p className="mt-2 text-gray-600">Track customer wishlist behavior and conversion insights</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <div className="flex items-center space-x-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <label className="text-sm font-medium text-gray-700">Time Period:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-red-500" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Wishlist Items</h3>
                <p className="text-2xl font-bold text-red-600">{analytics.totalWishlistItems?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <ShoppingCart className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Unique Products</h3>
                <p className="text-2xl font-bold text-blue-600">{analytics.uniqueWishlistedProducts?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Avg. Wishlist Size</h3>
                <p className="text-2xl font-bold text-purple-600">{analytics.averageWishlistSize?.toFixed(1) || '0.0'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Conversion Rate</h3>
                <p className="text-2xl font-bold text-green-600">{analytics.conversionRate?.toFixed(1) || '0.0'}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Insights */}
      {conversion && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Conversion Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {conversion.averageTimeToConversion || 0} days
              </div>
              <p className="text-gray-600">Average Time to Purchase</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                ${(conversion.averageOrderValueFromWishlist || 0).toFixed(2)}
              </div>
              <p className="text-gray-600">Avg. Order Value from Wishlist</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {(conversion.wishlistToCartRate || 0).toFixed(1)}%
              </div>
              <p className="text-gray-600">Wishlist to Cart Rate</p>
            </div>
          </div>
        </div>
      )}

      {/* Popular Wishlist Items Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Most Wishlisted Products</h2>
          <p className="text-sm text-gray-600 mt-1">Products with highest wishlist activity and conversion potential</p>
        </div>
        
        <DataTable
          data={processedPopularItems}
          columns={columns}
          loading={itemsLoading || !popularItemsData}
          pagination={{ enabled: true, pageSize: 25 }}
          searchable={true}
          selectable={false}
          emptyState={
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No wishlist data available</p>
            </div>
          }
        />
      </div>

      {/* Top Products by Category */}
      {analytics?.topWishlistedProducts && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Top Products by Category</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analytics.topWishlistedProducts.slice(0, 6).map((product: any) => (
                <div key={product.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0">
                    <img
                      src={product.image || '/placeholder-product.png'}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                    <div className="flex items-center mt-2">
                      <Heart className="w-4 h-4 text-red-500 mr-1" />
                      <span className="text-sm text-gray-600">{product.wishlistCount} wishlisted</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">{product.conversionRate?.toFixed(1) || '0.0'}% conversion</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WishlistAnalyticsPage
