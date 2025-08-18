import React, { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Star,
  StarOff,
  Image as ImageIcon,
  X,
  RefreshCw,
  Tag,
  Grid,
  List,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Layers,
  Copy,
} from 'lucide-react'
import { toast } from 'sonner'
import { DataTable, Column, Action } from '../components/data/DataTable'
import { MetricCard } from '../components/charts/MetricCard'
import { productsAPI } from '../services/api'
import { formatCurrency, formatDate, getStatusColor, cn, downloadBlob } from '../lib/utils'
import type { Product, ProductFilters } from '../types'

// Product form validation schema
const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be a positive number'),
  salePrice: z.number().min(0, 'Sale price must be a positive number').optional(),
  category: z.string().min(1, 'Category is required'),
  spaceType: z.string().min(1, 'Space type is required'),
  tags: z.array(z.string()).optional(),
  stock: z.number().min(0, 'Stock must be a positive number'),
  sku: z.string().min(1, 'SKU is required'),
  weight: z.number().min(0, 'Weight must be a positive number').optional(),
  dimensions: z.object({
    length: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
  }).optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
})

type ProductForm = z.infer<typeof productSchema>

export function ProductsPage() {
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 25,
    search: '',
    category: '',
    spaceType: '',
    status: '',
    featured: undefined,
  })
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [showProductModal, setShowProductModal] = useState<{ 
    product?: Product
    show: boolean 
    mode: 'create' | 'edit' | 'view'
  }>({
    show: false,
    mode: 'create',
  })

  const queryClient = useQueryClient()

  // Fetch products
  const {
    data: productsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['products', filters, sortBy, sortOrder],
    queryFn: async () => {
      const response = await productsAPI.getAll({
        ...filters,
        sortBy,
        sortOrder,
      })
      return response.data
    },
    keepPreviousData: true,
  })

  // Fetch categories
  const {
    data: categoriesResponse,
  } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const response = await productsAPI.getCategories()
      return response.data.data
    },
  })

  // Create/Update product mutation
  const saveProductMutation = useMutation({
    mutationFn: ({ productData, productId }: { productData: ProductForm; productId?: string }) => {
      if (productId) {
        return productsAPI.update(productId, productData)
      }
      return productsAPI.create(productData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product saved successfully')
      setShowProductModal({ show: false, mode: 'create' })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save product')
    },
  })

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) => productsAPI.delete(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete product')
    },
  })

  // Bulk update status mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: ({ productIds, isActive }: { productIds: string[]; isActive: boolean }) =>
      productsAPI.bulkUpdateStatus(productIds, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Products updated successfully')
      setSelectedProducts([])
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update products')
    },
  })

  const products = productsResponse?.data || []
  const pagination = productsResponse?.pagination
  const categories = categoriesResponse || []

  // Calculate metrics
  const totalProducts = pagination?.total || 0
  const activeProducts = products.filter(product => product.isActive).length
  const featuredProducts = products.filter(product => product.isFeatured).length
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0)

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      sortable: true,
      render: (product) => (
        <div className="flex items-center">
          <img
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            className="w-10 h-10 rounded-lg object-cover mr-3"
          />
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {product.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              SKU: {product.sku}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (product) => (
        <div>
          <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
          )}>
            {product.category}
          </span>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {product.spaceType}
          </div>
        </div>
      ),
      width: '140px',
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      align: 'right',
      render: (product) => (
        <div className="text-right">
          <div className="font-semibold text-gray-900 dark:text-white">
            {formatCurrency(product.price)}
          </div>
          {product.salePrice && (
            <div className="text-xs text-green-600 dark:text-green-400">
              Sale: {formatCurrency(product.salePrice)}
            </div>
          )}
        </div>
      ),
      width: '120px',
    },
    {
      key: 'stock',
      header: 'Stock',
      sortable: true,
      align: 'center',
      render: (product) => (
        <div className="text-center">
          <span className={cn(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            product.stock > 10
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : product.stock > 0
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
          )}>
            {product.stock}
          </span>
        </div>
      ),
      width: '80px',
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      render: (product) => (
        <div className="flex items-center space-x-2">
          <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            product.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
          )}>
            {product.isActive ? 'Active' : 'Inactive'}
          </span>
          {product.isFeatured && (
            <Star className="w-4 h-4 text-yellow-500" />
          )}
        </div>
      ),
      width: '120px',
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (product) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white">
            {formatDate(product.createdAt, 'short')}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {formatDate(product.createdAt, 'relative')}
          </div>
        </div>
      ),
      width: '120px',
    },
  ]

  const actions: Action<Product>[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (product) => {
        setShowProductModal({ product, show: true, mode: 'view' })
      },
    },
    {
      label: 'Edit Product',
      icon: Edit,
      onClick: (product) => {
        setShowProductModal({ product, show: true, mode: 'edit' })
      },
    },
    {
      label: 'Duplicate',
      icon: Copy,
      onClick: (product) => {
        const duplicatedProduct = { ...product, name: `${product.name} (Copy)`, sku: `${product.sku}-copy` }
        setShowProductModal({ product: duplicatedProduct, show: true, mode: 'create' })
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: (product) => {
        if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
          deleteProductMutation.mutate(product.id)
        }
      },
      color: 'danger',
    },
  ]

  const bulkActions = [
    {
      label: 'Activate Products',
      icon: CheckCircle,
      onClick: (products: Product[]) => {
        bulkUpdateMutation.mutate({
          productIds: products.map(p => p.id),
          isActive: true
        })
      },
      color: 'primary' as const,
    },
    {
      label: 'Deactivate Products',
      icon: AlertCircle,
      onClick: (products: Product[]) => {
        bulkUpdateMutation.mutate({
          productIds: products.map(p => p.id),
          isActive: false
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
            Products
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your product catalog and inventory
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-1.5 rounded text-xs',
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-600 shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded text-xs',
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
        </div>

          <button
            onClick={() => setShowProductModal({ show: true, mode: 'create' })}
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
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
          title="Total Products"
          value={totalProducts}
          format="number"
          icon={Package}
          color="blue"
          loading={isLoading}
        />
        
        <MetricCard
          title="Active Products"
          value={activeProducts}
          format="number"
          icon={CheckCircle}
          color="green"
          loading={isLoading}
        />
        
        <MetricCard
          title="Featured Products"
          value={featuredProducts}
          format="number"
          icon={Star}
          color="yellow"
          loading={isLoading}
        />
        
        <MetricCard
          title="Inventory Value"
          value={totalValue}
          format="currency"
          icon={DollarSign}
          color="green"
          loading={isLoading}
          />
        </div>
        
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              {categories.map((category: string) => (
                <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Space Type
            </label>
          <select
              value={filters.spaceType || ''}
              onChange={(e) => setFilters({ ...filters, spaceType: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Space Types</option>
              <option value="Home Gym">Home Gym</option>
              <option value="Commercial Gym">Commercial Gym</option>
              <option value="Office Gym">Office Gym</option>
              <option value="Studio">Studio</option>
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
              Featured
            </label>
            <select
              value={filters.featured === undefined ? '' : filters.featured.toString()}
              onChange={(e) => setFilters({ 
                ...filters, 
                featured: e.target.value === '' ? undefined : e.target.value === 'true',
                page: 1 
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Products</option>
              <option value="true">Featured Only</option>
              <option value="false">Non-Featured</option>
            </select>
                            </div>
                          </div>
                        </div>

      {/* Products Display */}
      {viewMode === 'table' ? (
        <DataTable
          data={products}
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
            selectedItems: selectedProducts,
            onSelectionChange: setSelectedProducts,
            keyExtractor: (product) => product.id,
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
            title: 'No products found',
            description: 'There are no products matching your current filters.',
            action: {
              label: 'Add Product',
              onClick: () => setShowProductModal({ show: true, mode: 'create' })
            }
          }}
        />
      ) : (
        <ProductGridView 
          products={products} 
          isLoading={isLoading}
          onEdit={(product) => setShowProductModal({ product, show: true, mode: 'edit' })}
          onView={(product) => setShowProductModal({ product, show: true, mode: 'view' })}
          onDelete={(product) => {
            if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
              deleteProductMutation.mutate(product.id)
            }
          }}
        />
      )}

      {/* Product Modal */}
      {showProductModal.show && (
        <ProductModal
          product={showProductModal.product}
          mode={showProductModal.mode}
          categories={categories}
          onClose={() => setShowProductModal({ show: false, mode: 'create' })}
          onSave={(productData, productId) => {
            saveProductMutation.mutate({ productData, productId })
          }}
          isLoading={saveProductMutation.isLoading}
        />
                          )}
                        </div>
  )
}

// Product Grid View Component
interface ProductGridViewProps {
  products: Product[]
  isLoading: boolean
  onEdit: (product: Product) => void
  onView: (product: Product) => void
  onDelete: (product: Product) => void
}

function ProductGridView({ products, isLoading, onEdit, onView, onDelete }: ProductGridViewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="animate-pulse">
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-600 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
                        </div>
                  ))}
            </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow group"
        >
          <div className="relative">
            <img
              src={product.images[0] || '/placeholder.svg'}
                          alt={product.name}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        <button
                  onClick={() => onView(product)}
                  className="p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50"
                >
                  <Eye className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onEdit(product)}
                  className="p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50"
                >
                  <Edit className="w-3 h-3" />
                        </button>
                <button
                  onClick={() => onDelete(product)}
                  className="p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50 text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
            {product.isFeatured && (
              <div className="absolute top-2 left-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
              </div>
            )}
            {!product.isActive && (
              <div className="absolute inset-0 bg-black/50 rounded-t-lg flex items-center justify-center">
                <span className="text-white font-medium">Inactive</span>
              </div>
                        )}
                      </div>
          
          <div className="p-4">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {product.category} • {product.spaceType}
            </p>
            <div className="mt-2 flex items-center justify-between">
                      <div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(product.price)}
                      </span>
                {product.salePrice && (
                  <span className="ml-2 text-sm text-green-600 dark:text-green-400">
                    {formatCurrency(product.salePrice)}
                        </span>
                      )}
              </div>
              <span className={cn(
                'text-xs px-2 py-1 rounded-full',
                product.stock > 10
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : product.stock > 0
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              )}>
                {product.stock} in stock
                      </span>
                    </div>
                  </div>
        </motion.div>
      ))}
    </div>
  )
}

// Product Modal Component (placeholder for now)
interface ProductModalProps {
  product?: Product
  mode: 'create' | 'edit' | 'view'
  categories: string[]
  onClose: () => void
  onSave: (productData: ProductForm, productId?: string) => void
  isLoading: boolean
}

function ProductModal({ product, mode, categories, onClose, onSave, isLoading }: ProductModalProps) {
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
              {mode === 'create' ? 'Add New Product' : 
               mode === 'edit' ? 'Edit Product' : 'Product Details'}
              </h3>
              <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
              <X className="w-5 h-5" />
              </button>
            </div>
            
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Product Form Coming Soon
            </h4>
            <p className="text-gray-500 dark:text-gray-400">
              Full product creation/editing form with drag-drop image upload will be implemented here.
            </p>
                  </div>
                </div>
      </motion.div>
    </div>
  )
}
