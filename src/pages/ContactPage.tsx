import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Mail,
  Phone,
  FileText,
  Reply,
  UserCheck,
  Download,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { DataTable, Column, Action } from '../components/data/DataTable'
import { MetricCard } from '../components/charts/MetricCard'
import { contactAPI } from '../services/api'
import { formatDate, getStatusColor, getPriorityColor, cn, downloadBlob } from '../lib/utils'
import type { ContactMessage, ContactFilters } from '../types'

export function ContactPage() {
  const [filters, setFilters] = useState<ContactFilters>({
    page: 1,
    limit: 25,
    search: '',
    status: '',
    category: '',
    priority: '',
  })
  const [selectedMessages, setSelectedMessages] = useState<ContactMessage[]>([])
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showReplyModal, setShowReplyModal] = useState<{ message: ContactMessage; show: boolean }>({
    message: {} as ContactMessage,
    show: false,
  })

  const queryClient = useQueryClient()

  // Fetch contact messages
  const {
    data: messagesResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['contact-messages', filters, sortBy, sortOrder],
    queryFn: async () => {
      const response = await contactAPI.getAll({
        ...filters,
        sortBy,
        sortOrder,
      })
      return response.data
    },
    keepPreviousData: true,
  })

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ messageId, status }: { messageId: string; status: string }) =>
      contactAPI.updateStatus(messageId, status as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] })
      toast.success('Message status updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update message status')
    },
  })

  // Update priority mutation
  const updatePriorityMutation = useMutation({
    mutationFn: ({ messageId, priority }: { messageId: string; priority: string }) =>
      contactAPI.updatePriority(messageId, priority as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] })
      toast.success('Message priority updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update message priority')
    },
  })

  // Add reply mutation
  const addReplyMutation = useMutation({
    mutationFn: ({ messageId, reply }: { messageId: string; reply: string }) =>
      contactAPI.addReply(messageId, reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] })
      toast.success('Reply added successfully')
      setShowReplyModal({ message: {} as ContactMessage, show: false })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add reply')
    },
  })

  // Export CSV mutation
  const exportCSVMutation = useMutation({
    mutationFn: () => contactAPI.exportCSV(filters),
    onSuccess: (response) => {
      downloadBlob(response.data, `contact-messages-${new Date().toISOString().split('T')[0]}.csv`)
      toast.success('Contact messages exported successfully')
    },
    onError: () => {
      toast.error('Failed to export contact messages')
    },
  })

  const messages = messagesResponse?.data || []
  const pagination = messagesResponse?.pagination

  // Calculate metrics
  const totalMessages = pagination?.total || 0
  const newMessages = messages.filter(msg => msg.status === 'NEW').length
  const inProgressMessages = messages.filter(msg => msg.status === 'IN_PROGRESS').length
  const urgentMessages = messages.filter(msg => msg.priority === 'URGENT').length

  const columns: Column<ContactMessage>[] = [
    {
      key: 'name',
      header: 'Contact',
      sortable: true,
      render: (message) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {message.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {message.email}
          </div>
          {message.phone && (
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {message.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      sortable: true,
      render: (message) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
            {message.subject}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span className={cn(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              getStatusColor(message.category.toUpperCase())
            )}>
              {message.category}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (message) => (
        <div className="flex items-center">
          <AlertTriangle className={cn('w-4 h-4 mr-1', getPriorityColor(message.priority || 'MEDIUM'))} />
          <span className={cn('text-sm font-medium', getPriorityColor(message.priority || 'MEDIUM'))}>
            {message.priority || 'MEDIUM'}
          </span>
        </div>
      ),
      width: '120px',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (message) => (
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          getStatusColor(message.status)
        )}>
          {message.status}
        </span>
      ),
      width: '120px',
    },
    {
      key: 'googleSheetsRef',
      header: 'Sheets Ref',
      render: (message) => (
        <div className="text-xs">
          {message.googleSheetsRef ? (
            <div className="flex items-center space-x-1">
              <ExternalLink className="w-3 h-3 text-green-500" />
              <span className="text-green-600 dark:text-green-400 font-mono">
                {message.googleSheetsRef.split('_').pop()}
              </span>
            </div>
          ) : (
            <span className="text-gray-400">No ref</span>
          )}
        </div>
      ),
      width: '100px',
    },
    {
      key: 'createdAt',
      header: 'Received',
      sortable: true,
      render: (message) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white">
            {formatDate(message.createdAt, 'short')}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {formatDate(message.createdAt, 'relative')}
          </div>
        </div>
      ),
      width: '120px',
    },
  ]

  const actions: Action<ContactMessage>[] = [
    {
      label: 'View Details',
      icon: FileText,
      onClick: (message) => {
        // Open message details modal
        console.log('View message:', message.id)
      },
    },
    {
      label: 'Reply',
      icon: Reply,
      onClick: (message) => {
        setShowReplyModal({ message, show: true })
      },
    },
    {
      label: 'Mark In Progress',
      icon: Clock,
      onClick: (message) => {
        updateStatusMutation.mutate({ messageId: message.id, status: 'IN_PROGRESS' })
      },
      disabled: (message) => message.status === 'IN_PROGRESS',
      color: 'primary',
    },
    {
      label: 'Mark Resolved',
      icon: CheckCircle,
      onClick: (message) => {
        updateStatusMutation.mutate({ messageId: message.id, status: 'RESOLVED' })
      },
      disabled: (message) => message.status === 'RESOLVED',
      color: 'primary',
    },
  ]

  const bulkActions = [
    {
      label: 'Mark In Progress',
      icon: Clock,
      onClick: (messages: ContactMessage[]) => {
        // Bulk update status - would need to implement bulk endpoint
        messages.forEach(msg => {
          updateStatusMutation.mutate({ messageId: msg.id, status: 'IN_PROGRESS' })
        })
      },
      color: 'primary' as const,
    },
    {
      label: 'Mark Resolved',
      icon: CheckCircle,
      onClick: (messages: ContactMessage[]) => {
        messages.forEach(msg => {
          updateStatusMutation.mutate({ messageId: msg.id, status: 'RESOLVED' })
        })
      },
      color: 'primary' as const,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Contact & Leads
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage customer inquiries and support requests
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
          title="Total Messages"
          value={totalMessages}
          format="number"
          icon={MessageSquare}
          color="blue"
          loading={isLoading}
        />
        
        <MetricCard
          title="New Messages"
          value={newMessages}
          format="number"
          icon={Mail}
          color="yellow"
          loading={isLoading}
        />
        
        <MetricCard
          title="In Progress"
          value={inProgressMessages}
          format="number"
          icon={Clock}
          color="blue"
          loading={isLoading}
        />
        
        <MetricCard
          title="Urgent Messages"
          value={urgentMessages}
          format="number"
          icon={AlertTriangle}
          color="red"
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
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="GENERAL">General</option>
              <option value="ORDER">Order</option>
              <option value="PAYMENT">Payment</option>
              <option value="PRODUCT">Product</option>
              <option value="TECHNICAL">Technical</option>
              <option value="COMPLAINT">Complaint</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={filters.priority || ''}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assigned To
            </label>
            <select
              value={filters.assignedTo || ''}
              onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <DataTable
        data={messages}
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
          selectedItems: selectedMessages,
          onSelectionChange: setSelectedMessages,
          keyExtractor: (message) => message.id,
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
          title: 'No messages found',
          description: 'There are no contact messages matching your current filters.',
        }}
      />

      {/* Reply Modal */}
      {showReplyModal.show && (
        <ReplyModal
          message={showReplyModal.message}
          onClose={() => setShowReplyModal({ message: {} as ContactMessage, show: false })}
          onSubmit={(reply) => {
            addReplyMutation.mutate({ messageId: showReplyModal.message.id, reply })
          }}
          isLoading={addReplyMutation.isLoading}
        />
      )}
    </div>
  )
}

// Reply Modal Component
interface ReplyModalProps {
  message: ContactMessage
  onClose: () => void
  onSubmit: (reply: string) => void
  isLoading: boolean
}

function ReplyModal({ message, onClose, onSubmit, isLoading }: ReplyModalProps) {
  const [reply, setReply] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (reply.trim()) {
      onSubmit(reply.trim())
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Reply to {message.name}
          </h3>

          {/* Original Message */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{message.subject}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  From: {message.email} | {formatDate(message.createdAt, 'long')}
                </p>
              </div>
              <span className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                getStatusColor(message.category.toUpperCase())
              )}>
                {message.category}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {message.message}
            </p>
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Reply
              </label>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply here..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !reply.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin inline" />
                    Sending...
                  </>
                ) : (
                  'Send Reply'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
