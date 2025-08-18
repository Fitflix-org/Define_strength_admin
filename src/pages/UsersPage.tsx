import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Crown,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  Activity,
  Download,
  RefreshCw,
  Search,
  Filter,
  MoreVertical,
  MapPin,
  ShoppingBag,
  Star,
} from 'lucide-react'
import { toast } from 'sonner'
import { DataTable, Column, Action } from '../components/data/DataTable'
import { MetricCard } from '../components/charts/MetricCard'
import { usersAPI } from '../services/api'
import { formatDate, getStatusColor, cn, downloadBlob, getInitials } from '../lib/utils'
import type { User, UserFilters } from '../types'

export function UsersPage() {
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 25,
    search: '',
    role: '',
    status: '',
  })
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showUserModal, setShowUserModal] = useState<{ 
    user?: User
    show: boolean 
    mode: 'view' | 'activity'
  }>({
    show: false,
    mode: 'view',
  })

  const queryClient = useQueryClient()

  // Fetch users
  const {
    data: usersResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['users', filters, sortBy, sortOrder],
    queryFn: async () => {
      const response = await usersAPI.getAll({
        ...filters,
        sortBy,
        sortOrder,
      })
      return response.data
    },
    keepPreviousData: true,
  })

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      usersAPI.updateRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User role updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user role')
    },
  })

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      usersAPI.updateStatus(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User status updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user status')
    },
  })

  // Export CSV mutation
  const exportCSVMutation = useMutation({
    mutationFn: () => usersAPI.exportCSV(filters),
    onSuccess: (response) => {
      downloadBlob(response.data, `users-${new Date().toISOString().split('T')[0]}.csv`)
      toast.success('Users exported successfully')
    },
    onError: () => {
      toast.error('Failed to export users')
    },
  })

  const users = usersResponse?.data || []
  const pagination = usersResponse?.pagination

  // Calculate metrics
  const totalUsers = pagination?.total || 0
  const activeUsers = users.filter(user => user.isActive).length
  const adminUsers = users.filter(user => user.role === 'ADMIN' || user.role === 'SUPER_ADMIN').length
  const recentUsers = users.filter(user => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    return new Date(user.createdAt) > oneWeekAgo
  }).length

  const columns: Column<User>[] = [
    {
      key: 'user',
      header: 'User',
      sortable: true,
      render: (user) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
            {getInitials(user.firstName, user.lastName, user.email)}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.email}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (user) => (
        <div className="flex items-center">
          {user.role === 'SUPER_ADMIN' && <Crown className="w-4 h-4 text-yellow-500 mr-2" />}
          {user.role === 'ADMIN' && <Shield className="w-4 h-4 text-blue-500 mr-2" />}
          {user.role === 'USER' && <Users className="w-4 h-4 text-gray-500 mr-2" />}
          <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            user.role === 'SUPER_ADMIN'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
              : user.role === 'ADMIN'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
          )}>
            {user.role.replace('_', ' ')}
          </span>
        </div>
      ),
      width: '140px',
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      render: (user) => (
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          user.isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        )}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
      width: '100px',
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      sortable: true,
      render: (user) => (
        <div className="text-sm">
          {user.lastLogin ? (
            <div>
              <div className="text-gray-900 dark:text-white">
                {formatDate(user.lastLogin, 'short')}
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                {formatDate(user.lastLogin, 'relative')}
              </div>
            </div>
          ) : (
            <span className="text-gray-400">Never</span>
          )}
        </div>
      ),
      width: '140px',
    },
    {
      key: 'createdAt',
      header: 'Joined',
      sortable: true,
      render: (user) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white">
            {formatDate(user.createdAt, 'short')}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {formatDate(user.createdAt, 'relative')}
          </div>
      </div>
      ),
      width: '120px',
    },
  ]

  const actions: Action<User>[] = [
    {
      label: 'View Profile',
      icon: Eye,
      onClick: (user) => {
        setShowUserModal({ user, show: true, mode: 'view' })
      },
    },
    {
      label: 'View Activity',
      icon: Activity,
      onClick: (user) => {
        setShowUserModal({ user, show: true, mode: 'activity' })
      },
    },
    {
      label: 'Make Admin',
      icon: Shield,
      onClick: (user) => {
        updateRoleMutation.mutate({ userId: user.id, role: 'ADMIN' })
      },
      disabled: (user) => user.role === 'ADMIN' || user.role === 'SUPER_ADMIN',
      color: 'primary',
    },
    {
      label: 'Make User',
      icon: Users,
      onClick: (user) => {
        updateRoleMutation.mutate({ userId: user.id, role: 'USER' })
      },
      disabled: (user) => user.role === 'USER',
    },
    {
      label: user => user.isActive ? 'Deactivate' : 'Activate',
      icon: user => user.isActive ? Ban : CheckCircle,
      onClick: (user) => {
        updateStatusMutation.mutate({ userId: user.id, isActive: !user.isActive })
      },
      color: user => user.isActive ? 'danger' : 'primary',
    },
  ]

  const bulkActions = [
    {
      label: 'Activate Users',
      icon: CheckCircle,
      onClick: (users: User[]) => {
        users.forEach(user => {
          updateStatusMutation.mutate({ userId: user.id, isActive: true })
        })
      },
      color: 'primary' as const,
    },
    {
      label: 'Deactivate Users',
      icon: Ban,
      onClick: (users: User[]) => {
        users.forEach(user => {
          updateStatusMutation.mutate({ userId: user.id, isActive: false })
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
            Users
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage user accounts, roles, and permissions
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
          title="Total Users"
          value={totalUsers}
          format="number"
          icon={Users}
          color="blue"
          loading={isLoading}
        />
        
        <MetricCard
          title="Active Users"
          value={activeUsers}
          format="number"
          icon={UserCheck}
          color="green"
          loading={isLoading}
        />
        
        <MetricCard
          title="Admin Users"
          value={adminUsers}
          format="number"
          icon={Shield}
          color="purple"
          loading={isLoading}
        />
        
        <MetricCard
          title="New This Week"
          value={recentUsers}
          format="number"
          icon={Clock}
          color="yellow"
          loading={isLoading}
          />
        </div>
        
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
          <select
              value={filters.role || ''}
              onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>

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
              <option value="inactive">Inactive</option>
            </select>
      </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Login
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="never">Never</option>
            </select>
                            </div>
                          </div>
                        </div>

      {/* Users Table */}
      <DataTable
        data={users}
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
          selectedItems: selectedUsers,
          onSelectionChange: setSelectedUsers,
          keyExtractor: (user) => user.id,
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
          title: 'No users found',
          description: 'There are no users matching your current filters.',
        }}
      />

      {/* User Details Modal */}
      {showUserModal.show && showUserModal.user && (
        <UserModal
          user={showUserModal.user}
          mode={showUserModal.mode}
          onClose={() => setShowUserModal({ show: false, mode: 'view' })}
        />
      )}
                          </div>
  )
}

// User Details Modal Component
interface UserModalProps {
  user: User
  mode: 'view' | 'activity'
  onClose: () => void
}

function UserModal({ user, mode, onClose }: UserModalProps) {
  const [activeTab, setActiveTab] = useState(mode)

  // Fetch user orders
  const { data: userOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['user-orders', user.id],
    queryFn: async () => {
      const response = await usersAPI.getUserOrders(user.id, { limit: 10 })
      return response.data.data
    },
    enabled: showUserModal.show,
  })

  const mockActivityData = [
    { id: '1', action: 'Logged in', timestamp: new Date().toISOString(), ip: '192.168.1.1' },
    { id: '2', action: 'Updated profile', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), ip: '192.168.1.1' },
    { id: '3', action: 'Placed order #ORD-12345', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), ip: '192.168.1.1' },
    { id: '4', action: 'Added item to wishlist', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), ip: '192.168.1.1' },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-medium mr-4">
                {getInitials(user.firstName, user.lastName, user.email)}
            </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                        <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
              <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                    
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
                            <button
                onClick={() => setActiveTab('view')}
                className={cn(
                  'py-2 px-1 border-b-2 font-medium text-sm',
                  activeTab === 'view'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                Profile
                            </button>
                            <button
                onClick={() => setActiveTab('activity')}
                className={cn(
                  'py-2 px-1 border-b-2 font-medium text-sm',
                  activeTab === 'activity'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                Activity
                            </button>
            </nav>
                          </div>

          {/* Tab Content */}
          {activeTab === 'view' ? (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Account Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900 dark:text-white">{user.email}</span>
                      </div>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900 dark:text-white">{user.role.replace('_', ' ')}</span>
                      </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900 dark:text-white">Joined {formatDate(user.createdAt, 'long')}</span>
                      </div>
                    {user.lastLogin && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-900 dark:text-white">Last login {formatDate(user.lastLogin, 'relative')}</span>
          </div>
        )}
      </div>
            </div>
            
            <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Account Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        user.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      )}>
                        {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                </div>
              </div>
              
              {/* Recent Orders */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Recent Orders</h4>
                {ordersLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                ) : userOrders && userOrders.length > 0 ? (
                  <div className="space-y-3">
                    {userOrders.map((order: any) => (
                      <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            Order #{order.id.slice(-8)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(order.createdAt, 'short')}
                          </div>
                </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(order.total)}
                  </div>
                          <span className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                            getStatusColor(order.status)
                          )}>
                            {order.status}
                  </span>
                </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2" />
                    <p>No orders found</p>
                  </div>
                )}
                </div>
                </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Recent Activity</h4>
              <div className="space-y-3">
                {mockActivityData.map((activity) => (
                  <div key={activity.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <Activity className="w-4 h-4 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {activity.action}
                </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {activity.ip}
                </div>
              </div>
            </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(activity.timestamp, 'relative')}
                    </div>
                  </div>
                ))}
          </div>
        </div>
      )}
        </div>
      </motion.div>
    </div>
  )
}
