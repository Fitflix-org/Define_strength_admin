import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Download,
  Trash2,
  Edit,
  Eye,
  Filter,
  Search,
} from 'lucide-react'
import { cn } from '../../lib/utils'

export interface Column<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  filterable?: boolean
  render?: (item: T, index: number) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface Action<T> {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: (item: T) => void
  color?: 'default' | 'primary' | 'danger'
  disabled?: (item: T) => boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  actions?: Action<T>[]
  loading?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    onPageChange: (page: number) => void
    onLimitChange: (limit: number) => void
  }
  selection?: {
    selectedItems: T[]
    onSelectionChange: (items: T[]) => void
    keyExtractor: (item: T) => string
  }
  sorting?: {
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    onSortChange: (key: string, order: 'asc' | 'desc') => void
  }
  filtering?: {
    searchTerm?: string
    onSearchChange: (term: string) => void
    filters?: Record<string, any>
    onFilterChange: (filters: Record<string, any>) => void
  }
  bulkActions?: Array<{
    label: string
    icon?: React.ComponentType<{ className?: string }>
    onClick: (selectedItems: T[]) => void
    color?: 'default' | 'primary' | 'danger'
  }>
  emptyState?: {
    title: string
    description: string
    action?: {
      label: string
      onClick: () => void
    }
  }
  className?: string
}

export function DataTable<T>({
  data,
  columns,
  actions,
  loading = false,
  pagination,
  selection,
  sorting,
  filtering,
  bulkActions,
  emptyState,
  className,
}: DataTableProps<T>) {
  const [showFilters, setShowFilters] = useState(false)

  const getValue = (item: T, key: string): any => {
    return key.split('.').reduce((obj: any, k) => obj?.[k], item)
  }

  const handleSort = (key: string) => {
    if (!sorting) return
    
    const newOrder = sorting.sortBy === key && sorting.sortOrder === 'asc' ? 'desc' : 'asc'
    sorting.onSortChange(key, newOrder)
  }

  const handleSelectAll = (checked: boolean) => {
    if (!selection) return
    
    if (checked) {
      selection.onSelectionChange(data)
    } else {
      selection.onSelectionChange([])
    }
  }

  const handleSelectItem = (item: T, checked: boolean) => {
    if (!selection) return
    
    const itemKey = selection.keyExtractor(item)
    if (checked) {
      selection.onSelectionChange([...selection.selectedItems, item])
    } else {
      selection.onSelectionChange(
        selection.selectedItems.filter(
          (selectedItem) => selection.keyExtractor(selectedItem) !== itemKey
        )
      )
    }
  }

  const isSelected = (item: T) => {
    if (!selection) return false
    const itemKey = selection.keyExtractor(item)
    return selection.selectedItems.some(
      (selectedItem) => selection.keyExtractor(selectedItem) === itemKey
    )
  }

  const allSelected = selection && data.length > 0 && selection.selectedItems.length === data.length
  const someSelected = selection && selection.selectedItems.length > 0

  if (loading) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700', className)}>
        <div className="animate-pulse">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex space-x-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0 && !loading) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center', className)}>
        <div className="max-w-sm mx-auto">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {emptyState?.title || 'No data found'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {emptyState?.description || 'There are no items to display.'}
          </p>
          {emptyState?.action && (
            <button
              onClick={emptyState.action.onClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {emptyState.action.label}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      {/* Header with search and filters */}
      {(filtering || bulkActions) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            {/* Search */}
            {filtering && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={filtering.searchTerm || ''}
                  onChange={(e) => filtering.onSearchChange(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              {/* Filter toggle */}
              {filtering && (
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </button>
              )}

              {/* Bulk actions */}
              {bulkActions && someSelected && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selection?.selectedItems.length} selected
                  </span>
                  {bulkActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => action.onClick(selection?.selectedItems || [])}
                      className={cn(
                        'inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium',
                        action.color === 'danger'
                          ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100 dark:border-red-600 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30'
                          : action.color === 'primary'
                          ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/30'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                      )}
                    >
                      {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filters panel */}
          <AnimatePresence>
            {showFilters && filtering && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                {/* Filter controls would go here */}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Filter controls will be implemented based on specific needs
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {selection && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && sorting && (
                      <div className="flex flex-col">
                        <ChevronUp
                          className={cn(
                            'w-3 h-3',
                            sorting.sortBy === column.key && sorting.sortOrder === 'asc'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          )}
                        />
                        <ChevronDown
                          className={cn(
                            'w-3 h-3 -mt-1',
                            sorting.sortBy === column.key && sorting.sortOrder === 'desc'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          )}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item, index) => (
              <motion.tr
                key={selection ? selection.keyExtractor(item) : index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                  isSelected(item) && 'bg-blue-50 dark:bg-blue-900/20'
                )}
              >
                {selection && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected(item)}
                      onChange={(e) => handleSelectItem(item, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={cn(
                      'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                  >
                    {column.render
                      ? column.render(item, index)
                      : getValue(item, String(column.key))}
                  </td>
                ))}
                {actions && actions.length > 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={() => action.onClick(item)}
                          disabled={action.disabled?.(item)}
                          className={cn(
                            'p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed',
                            action.color === 'danger' && 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
                            action.color === 'primary' && 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                          )}
                          title={action.label}
                        >
                          {action.icon ? (
                            <action.icon className="w-4 h-4" />
                          ) : (
                            <MoreVertical className="w-4 h-4" />
                          )}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
              <select
                value={pagination.limit}
                onChange={(e) => pagination.onLimitChange(Number(e.target.value))}
                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                of {pagination.total} results
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.limit)) }, (_, i) => {
                const pageNum = pagination.page - 2 + i
                if (pageNum < 1 || pageNum > Math.ceil(pagination.total / pagination.limit)) return null
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => pagination.onPageChange(pageNum)}
                    className={cn(
                      'px-3 py-1 rounded border text-sm',
                      pageNum === pagination.page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    )}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
