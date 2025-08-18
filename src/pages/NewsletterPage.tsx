import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Mail,
  Send,
  Eye,
  Trash2,
  Plus,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  Edit,
  Copy,
  BarChart3,
  Target,
  Calendar,
  Filter,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { DataTable, Column, Action } from '../components/data/DataTable'
import { MetricCard } from '../components/charts/MetricCard'
import { LineChart } from '../components/charts/LineChart'
import { newsletterAPI } from '../services/api'
import { formatDate, formatPercentage, cn, downloadBlob } from '../lib/utils'
import type { NewsletterSubscriber, NewsletterCampaign, NewsletterFilters } from '../types'

export function NewsletterPage() {
  const [activeTab, setActiveTab] = useState<'subscribers' | 'campaigns'>('subscribers')
  const [filters, setFilters] = useState<NewsletterFilters>({
    page: 1,
    limit: 25,
    search: '',
    status: '',
    source: '',
  })
  const [selectedSubscribers, setSelectedSubscribers] = useState<NewsletterSubscriber[]>([])
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showCampaignModal, setShowCampaignModal] = useState<{ 
    campaign?: NewsletterCampaign
    show: boolean 
    mode: 'create' | 'edit' | 'view'
  }>({
    show: false,
    mode: 'create',
  })

  const queryClient = useQueryClient()

  // Fetch subscribers
  const {
    data: subscribersResponse,
    isLoading: subscribersLoading,
    refetch: refetchSubscribers,
  } = useQuery({
    queryKey: ['newsletter-subscribers', filters, sortBy, sortOrder],
    queryFn: async () => {
      const response = await newsletterAPI.getSubscribers({
        ...filters,
        sortBy,
        sortOrder,
      })
      return response.data
    },
    keepPreviousData: true,
    enabled: activeTab === 'subscribers',
  })

  // Fetch campaigns
  const {
    data: campaignsResponse,
    isLoading: campaignsLoading,
    refetch: refetchCampaigns,
  } = useQuery({
    queryKey: ['newsletter-campaigns'],
    queryFn: async () => {
      const response = await newsletterAPI.getCampaigns()
      return response.data
    },
    enabled: activeTab === 'campaigns',
  })

  // Fetch newsletter stats
  const {
    data: newsletterStats,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ['newsletter-stats'],
    queryFn: async () => {
      const response = await newsletterAPI.getStats()
      return response.data.data
    },
  })

  // Update subscriber status mutation
  const updateSubscriberMutation = useMutation({
    mutationFn: ({ subscriberId, isActive }: { subscriberId: string; isActive: boolean }) =>
      newsletterAPI.updateSubscriber(subscriberId, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] })
      queryClient.invalidateQueries({ queryKey: ['newsletter-stats'] })
      toast.success('Subscriber updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update subscriber')
    },
  })

  // Delete subscriber mutation
  const deleteSubscriberMutation = useMutation({
    mutationFn: (subscriberId: string) => newsletterAPI.deleteSubscriber(subscriberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] })
      queryClient.invalidateQueries({ queryKey: ['newsletter-stats'] })
      toast.success('Subscriber deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete subscriber')
    },
  })

  // Send campaign mutation
  const sendCampaignMutation = useMutation({
    mutationFn: (campaignId: string) => newsletterAPI.sendCampaign(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-campaigns'] })
      toast.success('Campaign sent successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send campaign')
    },
  })

  // Export subscribers CSV mutation
  const exportSubscribersMutation = useMutation({
    mutationFn: () => newsletterAPI.exportSubscribers(filters),
    onSuccess: (response) => {
      downloadBlob(response.data, `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`)
      toast.success('Subscribers exported successfully')
    },
    onError: () => {
      toast.error('Failed to export subscribers')
    },
  })

  const subscribers = subscribersResponse?.data || []
  const campaigns = campaignsResponse?.data || []
  const pagination = subscribersResponse?.pagination

  // Calculate derived metrics
  const totalSubscribers = newsletterStats?.totalSubscribers || 0
  const activeSubscribers = newsletterStats?.activeSubscribers || 0
  const unsubscribed = newsletterStats?.unsubscribed || 0
  const averageOpenRate = newsletterStats?.averageOpenRate || 0

  // Subscriber columns
  const subscriberColumns: Column<NewsletterSubscriber>[] = [
    {
      key: 'email',
      header: 'Subscriber',
      sortable: true,
      render: (subscriber) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-medium mr-3">
            {subscriber.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {subscriber.email}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {subscriber.firstName && subscriber.lastName
                ? `${subscriber.firstName} ${subscriber.lastName}`
                : 'Name not provided'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      sortable: true,
      render: (subscriber) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
          {subscriber.source || 'Website'}
        </span>
      ),
      width: '120px',
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      render: (subscriber) => (
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          subscriber.isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        )}>
          {subscriber.isActive ? 'Active' : 'Unsubscribed'}
        </span>
      ),
      width: '120px',
    },
    {
      key: 'subscribedAt',
      header: 'Subscribed',
      sortable: true,
      render: (subscriber) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white">
            {formatDate(subscriber.subscribedAt, 'short')}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {formatDate(subscriber.subscribedAt, 'relative')}
          </div>
        </div>
      ),
      width: '120px',
    },
  ]

  // Campaign columns
  const campaignColumns: Column<NewsletterCampaign>[] = [
    {
      key: 'name',
      header: 'Campaign',
      sortable: true,
      render: (campaign) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {campaign.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {campaign.subject}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (campaign) => (
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          campaign.status === 'SENT'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            : campaign.status === 'SCHEDULED'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        )}>
          {campaign.status}
        </span>
      ),
      width: '100px',
    },
    {
      key: 'recipients',
      header: 'Recipients',
      sortable: true,
      render: (campaign) => (
        <div className="text-center">
          <div className="font-semibold text-gray-900 dark:text-white">
            {campaign.recipients || 0}
          </div>
        </div>
      ),
      width: '100px',
    },
    {
      key: 'openRate',
      header: 'Open Rate',
      sortable: true,
      render: (campaign) => (
        <div className="text-center">
          <div className="font-semibold text-gray-900 dark:text-white">
            {formatPercentage(campaign.openRate || 0)}
          </div>
        </div>
      ),
      width: '100px',
    },
    {
      key: 'sentAt',
      header: 'Sent',
      sortable: true,
      render: (campaign) => (
        <div className="text-sm">
          {campaign.sentAt ? (
            <>
              <div className="text-gray-900 dark:text-white">
                {formatDate(campaign.sentAt, 'short')}
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                {formatDate(campaign.sentAt, 'relative')}
              </div>
            </>
          ) : (
            <span className="text-gray-400">Not sent</span>
          )}
        </div>
      ),
      width: '120px',
    },
  ]

  const subscriberActions: Action<NewsletterSubscriber>[] = [
    {
      label: subscriber => subscriber.isActive ? 'Unsubscribe' : 'Resubscribe',
      icon: subscriber => subscriber.isActive ? XCircle : CheckCircle,
      onClick: (subscriber) => {
        updateSubscriberMutation.mutate({ 
          subscriberId: subscriber.id, 
          isActive: !subscriber.isActive 
        })
      },
      color: subscriber => subscriber.isActive ? 'danger' : 'primary',
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: (subscriber) => {
        if (confirm(`Are you sure you want to delete subscriber "${subscriber.email}"?`)) {
          deleteSubscriberMutation.mutate(subscriber.id)
        }
      },
      color: 'danger',
    },
  ]

  const campaignActions: Action<NewsletterCampaign>[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (campaign) => {
        setShowCampaignModal({ campaign, show: true, mode: 'view' })
      },
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (campaign) => {
        setShowCampaignModal({ campaign, show: true, mode: 'edit' })
      },
      disabled: (campaign) => campaign.status === 'SENT',
    },
    {
      label: 'Send Now',
      icon: Send,
      onClick: (campaign) => {
        if (confirm(`Are you sure you want to send campaign "${campaign.name}"?`)) {
          sendCampaignMutation.mutate(campaign.id)
        }
      },
      disabled: (campaign) => campaign.status === 'SENT',
      color: 'primary',
    },
    {
      label: 'Duplicate',
      icon: Copy,
      onClick: (campaign) => {
        // Logic to duplicate campaign
        toast.info('Campaign duplication feature coming soon')
      },
    },
  ]

  const bulkSubscriberActions = [
    {
      label: 'Activate Subscribers',
      icon: CheckCircle,
      onClick: (subscribers: NewsletterSubscriber[]) => {
        subscribers.forEach(subscriber => {
          updateSubscriberMutation.mutate({ subscriberId: subscriber.id, isActive: true })
        })
      },
      color: 'primary' as const,
    },
    {
      label: 'Unsubscribe All',
      icon: XCircle,
      onClick: (subscribers: NewsletterSubscriber[]) => {
        subscribers.forEach(subscriber => {
          updateSubscriberMutation.mutate({ subscriberId: subscriber.id, isActive: false })
        })
      },
      color: 'danger' as const,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Newsletter
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage newsletter subscribers and email campaigns
          </p>
      </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {activeTab === 'subscribers' && (
            <button
              onClick={() => exportSubscribersMutation.mutate()}
              disabled={exportSubscribersMutation.isLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              {exportSubscribersMutation.isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Export CSV
            </button>
          )}

          {activeTab === 'campaigns' && (
            <button
              onClick={() => setShowCampaignModal({ show: true, mode: 'create' })}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </button>
          )}

          <button
            onClick={() => activeTab === 'subscribers' ? refetchSubscribers() : refetchCampaigns()}
            disabled={subscribersLoading || campaignsLoading}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4', (subscribersLoading || campaignsLoading) && 'animate-spin')} />
          </button>
            </div>
          </div>
          
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Subscribers"
          value={totalSubscribers}
          format="number"
          icon={Users}
          color="blue"
          loading={statsLoading}
        />
        
        <MetricCard
          title="Active Subscribers"
          value={activeSubscribers}
          format="number"
          icon={CheckCircle}
          color="green"
          loading={statsLoading}
        />
        
        <MetricCard
          title="Unsubscribed"
          value={unsubscribed}
          format="number"
          icon={XCircle}
          color="red"
          loading={statsLoading}
        />
        
        <MetricCard
          title="Avg Open Rate"
          value={averageOpenRate}
          format="percentage"
          icon={Target}
          color="purple"
          loading={statsLoading}
        />
          </div>
          
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('subscribers')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'subscribers'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Subscribers ({totalSubscribers})
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'campaigns'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Campaigns ({campaigns.length})
          </button>
        </nav>
          </div>
          
      {activeTab === 'subscribers' ? (
        <>
          {/* Subscriber Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
            <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Unsubscribed</option>
            </select>
          </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Source
                </label>
                <select
                  value={filters.source || ''}
                  onChange={(e) => setFilters({ ...filters, source: e.target.value, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Sources</option>
                  <option value="website">Website</option>
                  <option value="popup">Popup</option>
                  <option value="checkout">Checkout</option>
                  <option value="manual">Manual</option>
                </select>
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
        <DataTable
          data={subscribers}
            columns={subscriberColumns}
            actions={subscriberActions}
            loading={subscribersLoading}
            pagination={pagination ? {
              page: pagination.page,
              limit: pagination.limit,
              total: pagination.total,
              onPageChange: (page) => setFilters({ ...filters, page }),
              onLimitChange: (limit) => setFilters({ ...filters, limit, page: 1 }),
            } : undefined}
            selection={{
              selectedItems: selectedSubscribers,
              onSelectionChange: setSelectedSubscribers,
              keyExtractor: (subscriber) => subscriber.id,
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
            bulkActions={bulkSubscriberActions}
            emptyState={{
              title: 'No subscribers found',
              description: 'There are no newsletter subscribers matching your current filters.',
            }}
          />
        </>
      ) : (
        <>
          {/* Campaigns Table */}
          <DataTable
            data={campaigns}
            columns={campaignColumns}
            actions={campaignActions}
            loading={campaignsLoading}
            emptyState={{
              title: 'No campaigns found',
              description: 'You haven\'t created any email campaigns yet.',
              action: {
                label: 'Create Campaign',
                onClick: () => setShowCampaignModal({ show: true, mode: 'create' })
              }
            }}
          />
        </>
      )}

      {/* Campaign Modal Placeholder */}
      {showCampaignModal.show && (
        <CampaignModal
          campaign={showCampaignModal.campaign}
          mode={showCampaignModal.mode}
          onClose={() => setShowCampaignModal({ show: false, mode: 'create' })}
        />
      )}
    </div>
  )
}

// Campaign Modal Component (placeholder)
interface CampaignModalProps {
  campaign?: NewsletterCampaign
  mode: 'create' | 'edit' | 'view'
  onClose: () => void
}

function CampaignModal({ campaign, mode, onClose }: CampaignModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {mode === 'create' ? 'Create New Campaign' : 
               mode === 'edit' ? 'Edit Campaign' : 'Campaign Details'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Mail className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center py-12">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Campaign Builder Coming Soon
            </h4>
            <p className="text-gray-500 dark:text-gray-400">
              Full email campaign creation and editing interface will be implemented here.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}