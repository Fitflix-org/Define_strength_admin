import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Search, CreditCard, Download, Filter } from 'lucide-react'

interface Payment {
  id: string
  amount: string | number  // API returns string, but we handle conversion
  status: string
  paymentMethod: string
  gatewayTransactionId: string | null
  gatewayProvider: string
  gatewayPaymentId: string | null
  transactionId: string | null
  gatewayFee: string | number
  netAmount: string | number
  currency: string
  createdAt: string
  paidAt: string | null
  failedAt: string | null
  failureReason: string | null
  order: {
    id: string
    total: string | number  // API returns string, but we handle conversion
    user: {
      firstName: string
      lastName: string
      email: string
    }
  }
}

export const PaymentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: paymentResponse, isLoading, error } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3001/api/admin/payments')
      return response.data as { payments: Payment[], pagination: any }
    }
  })

  const payments = paymentResponse?.payments || []

  const filteredPayments = payments?.filter(payment => {
    const matchesSearch = 
      `${payment.order.user.firstName} ${payment.order.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.gatewayPaymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalRevenue = payments?.reduce((sum, payment) => 
    payment.status === 'COMPLETED' ? sum + Number(payment.amount) : sum, 0) || 0

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'REFUNDED', label: 'Refunded' }
  ]

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
        Failed to load payments. Please try again.
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-2 lg:space-y-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Payments Management</h1>
          <p className="text-sm lg:text-base text-gray-600">Track all payment transactions and revenue</p>
        </div>
        <div className="text-left lg:text-right">
          <div className="text-xs lg:text-sm text-gray-500">Total Revenue</div>
          <div className="text-xl lg:text-2xl font-bold text-green-600">
            ${totalRevenue.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by customer, email, or transaction ID..."
            className="block w-full pl-9 lg:pl-10 pr-3 py-2 text-sm lg:text-base border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 lg:pl-10 pr-8 py-2 text-sm lg:text-base border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <button className="flex items-center justify-center px-3 lg:px-4 py-2 border border-gray-300 rounded-md text-xs lg:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <Download className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
          Export
        </button>
      </div>

      {/* Payments List */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {filteredPayments && filteredPayments.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.id.slice(-8)}
                          </div>
                          {payment.transactionId && (
                            <div className="text-sm text-gray-500">
                              TXN: {payment.transactionId.slice(-8)}
                            </div>
                          )}
                          {payment.gatewayPaymentId && (
                            <div className="text-sm text-gray-500">
                              Gateway: {payment.gatewayPaymentId.slice(-8)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.order.user.firstName} {payment.order.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.order.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${Number(payment.amount).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Net: ${Number(payment.netAmount).toFixed(2)}
                        </div>
                        {payment.gatewayFee && Number(payment.gatewayFee) > 0 && (
                          <div className="text-sm text-red-500">
                            Fee: ${Number(payment.gatewayFee).toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 capitalize">
                            {payment.paymentMethod}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.status === 'COMPLETED' 
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : payment.status === 'FAILED'
                            ? 'bg-red-100 text-red-800'
                            : payment.status === 'REFUNDED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div>{new Date(payment.createdAt).toLocaleDateString()}</div>
                          <div>{new Date(payment.createdAt).toLocaleTimeString()}</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <ul className="lg:hidden divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <li key={payment.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {payment.order.user.firstName} {payment.order.user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{payment.order.user.email}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payment.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : payment.status === 'FAILED'
                          ? 'bg-red-100 text-red-800'
                          : payment.status === 'REFUNDED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <p className="font-medium text-gray-900">${Number(payment.amount).toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Net:</span>
                        <p className="font-medium text-gray-900">${Number(payment.netAmount).toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Method:</span>
                        <p className="font-medium text-gray-900 capitalize flex items-center">
                          <CreditCard className="h-3 w-3 mr-1 text-gray-400" />
                          {payment.paymentMethod}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <p className="font-medium text-gray-900">{new Date(payment.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Transaction ID:</span>
                        <span className="text-gray-900">{payment.id.slice(-8)}</span>
                      </div>
                      {payment.transactionId && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">TXN:</span>
                          <span className="text-gray-900">{payment.transactionId.slice(-8)}</span>
                        </div>
                      )}
                      {payment.gatewayPaymentId && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Gateway:</span>
                          <span className="text-gray-900">{payment.gatewayPaymentId.slice(-8)}</span>
                        </div>
                      )}
                      {payment.gatewayFee && Number(payment.gatewayFee) > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Fee:</span>
                          <span className="text-red-600">${Number(payment.gatewayFee).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="text-center py-8 lg:py-12">
            <CreditCard className="mx-auto h-8 w-8 lg:h-12 lg:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria or filters' 
                : 'No payments have been processed yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {payments && payments.length > 0 && (
        <div className="grid grid-cols-1 gap-3 lg:gap-5 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-4 lg:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-green-100 p-2 lg:p-3 rounded-md">
                    <CreditCard className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-4 lg:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs lg:text-sm font-medium text-gray-500 truncate">
                      Completed Payments
                    </dt>
                    <dd className="text-base lg:text-lg font-medium text-gray-900">
                      {payments.filter(p => p.status === 'COMPLETED').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-4 lg:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-yellow-100 p-2 lg:p-3 rounded-md">
                    <CreditCard className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4 lg:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs lg:text-sm font-medium text-gray-500 truncate">
                      Pending Payments
                    </dt>
                    <dd className="text-base lg:text-lg font-medium text-gray-900">
                      {payments.filter(p => p.status === 'PENDING').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-4 lg:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-red-100 p-2 lg:p-3 rounded-md">
                    <CreditCard className="h-5 w-5 lg:h-6 lg:w-6 text-red-600" />
                  </div>
                </div>
                <div className="ml-4 lg:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs lg:text-sm font-medium text-gray-500 truncate">
                      Failed Payments
                    </dt>
                    <dd className="text-base lg:text-lg font-medium text-gray-900">
                      {payments.filter(p => p.status === 'FAILED').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
