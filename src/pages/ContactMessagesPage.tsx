import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, User, Calendar, ArrowRight, Package, CreditCard, ShoppingBag, Settings, AlertTriangle, X } from 'lucide-react'
import { customerEngagementAPI } from '../services/api'
import { useNotifications } from '../context/NotificationContext'
import { DataTable } from '../components/DataTable'
import { BulkExportModal } from '../components/BulkExportModal'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  category: string
  status: 'new' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  createdAt: string
  updatedAt?: string
  replies?: {
    id: string
    message: string
    sender: string
    createdAt: string
  }[]
}

const ContactMessagesPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  const { addNotification } = useNotifications()
  const queryClient = useQueryClient()

  // Fetch contact messages
  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['contact-messages', statusFilter, categoryFilter, priorityFilter],
    queryFn: () => customerEngagementAPI.getContactMessages({
      limit: 100,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined
    }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Update message status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'new' | 'in-progress' | 'resolved' | 'closed' }) =>
      customerEngagementAPI.updateMessageStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] })
      addNotification({
        type: 'success',
        title: 'Message status updated successfully'
      })
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Failed to update message status'
      })
    }
  })

  const messages = messagesData?.data?.messages || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-100'
      case 'in-progress': return 'text-yellow-600 bg-yellow-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      case 'closed': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general': return <MessageSquare className="w-4 h-4" />
      case 'order': return <Package className="w-4 h-4" />
      case 'payment': return <CreditCard className="w-4 h-4" />
      case 'product': return <ShoppingBag className="w-4 h-4" />
      case 'technical': return <Settings className="w-4 h-4" />
      case 'complaint': return <AlertTriangle className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  const columns = [
    {
      key: 'customer',
      title: 'Customer',
      render: (message: ContactMessage) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{message.name}</p>
            <p className="text-sm text-gray-500">{message.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'subject',
      title: 'Subject & Category',
      render: (message: ContactMessage) => (
        <div>
          <p className="font-medium text-gray-900 truncate max-w-xs">{message.subject}</p>
          <div className="flex items-center mt-1">
            {getCategoryIcon(message.category)}
            <span className="text-sm text-gray-600 ml-1 capitalize">{message.category}</span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (message: ContactMessage) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
          <span className="capitalize">{message.status.replace('-', ' ')}</span>
        </span>
      )
    },
    {
      key: 'priority',
      title: 'Priority',
      render: (message: ContactMessage) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
          <span className="capitalize">{message.priority}</span>
        </span>
      )
    },
    {
      key: 'date',
      title: 'Date',
      render: (message: ContactMessage) => (
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date(message.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (message: ContactMessage) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedMessage(message)}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            title="View Details"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <select
            value={message.status}
            onChange={(e) => updateStatusMutation.mutate({ 
              id: message.id, 
              status: e.target.value as 'new' | 'in-progress' | 'resolved' | 'closed'
            })}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      )
    }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
        <p className="mt-2 text-gray-600">Manage customer inquiries and support requests</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Messages</h3>
          <p className="text-3xl font-bold text-blue-600">{messages.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">New</h3>
          <p className="text-3xl font-bold text-blue-600">
            {messages.filter((m: ContactMessage) => m.status === 'new').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">In Progress</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {messages.filter((m: ContactMessage) => m.status === 'in-progress').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Resolved</h3>
          <p className="text-3xl font-bold text-green-600">
            {messages.filter((m: ContactMessage) => m.status === 'resolved').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="order">Order</option>
            <option value="payment">Payment</option>
            <option value="product">Product</option>
            <option value="technical">Technical</option>
            <option value="complaint">Complaint</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            onClick={() => setShowExportModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <DataTable
          data={messages}
          columns={columns}
          loading={isLoading}
          pagination={{ enabled: true, pageSize: 20 }}
          searchable={true}
          selectable={false}
          emptyState={
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No contact messages found</p>
            </div>
          }
        />
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Message Details</h2>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedMessage.name} ({selectedMessage.email})</p>
                  {selectedMessage.phone && (
                    <p className="text-sm text-gray-600">{selectedMessage.phone}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedMessage.subject}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedMessage.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedMessage.priority)}`}>
                      {selectedMessage.priority}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date Received</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement reply functionality
                    addNotification({
                      type: 'info',
                      title: 'Reply feature coming soon'
                    })
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <BulkExportModal
          onExport={(options) => {
            console.log('Exporting contact messages:', options)
            setShowExportModal(false)
          }}
          isLoading={false}
        />
      )}
    </div>
  )
}

export default ContactMessagesPage
