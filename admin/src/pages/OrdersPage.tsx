import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Search, Eye, Package, Edit3, CheckCircle } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  total: string | number  // API returns string, but we handle conversion
  status: string
  createdAt: string
  customer: {
    name: string
    email: string
  }
  payment: {
    status: string
    method: string
    amount: string | number  // API returns string, but we handle conversion
  } | null
  itemCount: number
  shippingAddress: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export const OrdersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState('')

  const queryClient = useQueryClient()

  const statusOptions = [
    { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { value: 'PROCESSING', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
    { value: 'SHIPPED', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'DELIVERED', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ]

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: string }) => {
      const response = await axios.patch(
        `http://localhost:3001/api/admin/orders/${orderId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setEditingOrderId(null)
      setNewStatus('')
    },
    onError: (error) => {
      console.error('Failed to update order status:', error)
      alert('Failed to update order status')
    }
  })

  const { data: orderResponse, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3001/api/admin/orders')
      return response.data as { orders: Order[], pagination: any }
    }
  })

  const orders = orderResponse?.orders || []

  const filteredOrders = orders?.filter(order => {
    if (!order.customer) return false;
    
    const fullName = order.customer.name?.toLowerCase() || '';
    const email = order.customer.email?.toLowerCase() || '';
    const orderId = order.id.toLowerCase();
    const orderNumber = order.orderNumber?.toLowerCase() || '';
    
    return fullName.includes(searchTerm.toLowerCase()) ||
           email.includes(searchTerm.toLowerCase()) ||
           orderId.includes(searchTerm.toLowerCase()) ||
           orderNumber.includes(searchTerm.toLowerCase());
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
        Failed to load orders. Please try again.
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-sm lg:text-base text-gray-600">View and manage all customer orders</p>
        </div>
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-500">
            {filteredOrders?.length || 0} orders
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search orders..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Orders List - Mobile-friendly */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredOrders && filteredOrders.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <li key={order.id}>
                <div className="px-4 py-4 hover:bg-gray-50">
                  {/* Mobile Layout */}
                  <div className="sm:hidden">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {order.orderNumber}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {order.customer ? order.customer.name : 'No customer data'}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {order.customer?.email}
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          ${Number(order.total).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {editingOrderId === order.id ? (
                          <div className="flex items-center space-x-1">
                            <select
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1 min-w-0"
                            >
                              <option value="">Select</option>
                              {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => {
                                if (newStatus) {
                                  updateOrderStatusMutation.mutate({ orderId: order.id, status: newStatus })
                                }
                              }}
                              disabled={!newStatus || updateOrderStatusMutation.isPending}
                              className="p-1 text-green-600 hover:text-green-800 disabled:text-gray-400"
                              title="Save"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingOrderId(null)
                                setNewStatus('')
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Cancel"
                            >
                              <span className="text-xs">×</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              statusOptions.find(s => s.value === order.status)?.color || 'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                            <button
                              onClick={() => {
                                setEditingOrderId(order.id)
                                setNewStatus(order.status)
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600"
                              title="Edit Status"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {order.customer ? `${order.customer.name} (${order.customer.email})` : 'No customer data'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ${Number(order.total).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {editingOrderId === order.id ? (
                        <div className="flex items-center space-x-2">
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="">Select status</option>
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              if (newStatus) {
                                updateOrderStatusMutation.mutate({ orderId: order.id, status: newStatus })
                              }
                            }}
                            disabled={!newStatus || updateOrderStatusMutation.isPending}
                            className="p-1 text-green-600 hover:text-green-800 disabled:text-gray-400"
                            title="Save"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingOrderId(null)
                              setNewStatus('')
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Cancel"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            statusOptions.find(s => s.value === order.status)?.color || 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                          <button
                            onClick={() => {
                              setEditingOrderId(order.id)
                              setNewStatus(order.status)
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Edit Status"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 lg:py-12">
            <Package className="mx-auto h-8 w-8 lg:h-12 lg:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria' : 'No orders have been placed yet'}
            </p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4">
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] lg:max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base lg:text-lg font-medium text-gray-900">
                Order Details - #{selectedOrder.id.slice(-8)}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-lg lg:text-xl p-1"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3 lg:space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 text-sm lg:text-base">Customer Information</h4>
                <p className="text-xs lg:text-sm text-gray-600">
                  {selectedOrder.customer ? selectedOrder.customer.name : 'No customer data'}
                </p>
                <p className="text-xs lg:text-sm text-gray-600">{selectedOrder.customer?.email || 'No email'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 text-sm lg:text-base">Order Details</h4>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-gray-900">Order Number</p>
                      <p className="text-xs lg:text-sm text-gray-500">{selectedOrder.orderNumber}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-gray-900">Items Count</p>
                      <p className="text-xs lg:text-sm text-gray-500">{selectedOrder.itemCount} items</p>
                    </div>
                  </div>
                  {selectedOrder.shippingAddress && (
                    <div className="py-2 border-b border-gray-200">
                      <p className="text-xs lg:text-sm font-medium text-gray-900">Shipping Address</p>
                      <p className="text-xs lg:text-sm text-gray-500 leading-relaxed">
                        {selectedOrder.shippingAddress.name}<br/>
                        {selectedOrder.shippingAddress.address}<br/>
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}<br/>
                        {selectedOrder.shippingAddress.country}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-3 lg:pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 text-sm lg:text-base">Total Amount:</span>
                  <span className="text-base lg:text-lg font-bold text-gray-900">
                    ${Number(selectedOrder.total).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs lg:text-sm text-gray-600">Order Status:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedOrder.status === 'CONFIRMED' 
                      ? 'bg-green-100 text-green-800' 
                      : selectedOrder.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>
                {selectedOrder.payment && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs lg:text-sm text-gray-600">Payment Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedOrder.payment.status === 'COMPLETED' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedOrder.payment.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedOrder.payment.status}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs lg:text-sm text-gray-600">Order Date:</span>
                  <span className="text-xs lg:text-sm text-gray-900">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
