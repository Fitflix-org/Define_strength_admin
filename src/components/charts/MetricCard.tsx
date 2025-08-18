import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn, formatCurrency, formatNumber } from '../../lib/utils'

interface MetricCardProps {
  title: string
  value: number | string
  previousValue?: number
  change?: number
  changeType?: 'currency' | 'percentage' | 'number'
  format?: 'currency' | 'number' | 'text'
  icon?: React.ComponentType<{ className?: string }>
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
  loading?: boolean
  className?: string
}

export function MetricCard({
  title,
  value,
  previousValue,
  change,
  changeType = 'percentage',
  format = 'number',
  icon: Icon,
  color = 'blue',
  loading = false,
  className,
}: MetricCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val
    if (format === 'currency') return formatCurrency(val)
    if (format === 'number') return formatNumber(val)
    return val.toString()
  }

  const formatChange = (changeVal: number) => {
    if (changeType === 'currency') return formatCurrency(Math.abs(changeVal))
    if (changeType === 'percentage') return `${Math.abs(changeVal).toFixed(1)}%`
    return formatNumber(Math.abs(changeVal))
  }

  const getColorClasses = () => {
    const colors = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
      gray: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
    }
    return colors[color]
  }

  const getIconColorClasses = () => {
    const colors = {
      blue: 'text-blue-600 dark:text-blue-400',
      green: 'text-green-600 dark:text-green-400',
      yellow: 'text-yellow-600 dark:text-yellow-400',
      red: 'text-red-600 dark:text-red-400',
      purple: 'text-purple-600 dark:text-purple-400',
      gray: 'text-gray-600 dark:text-gray-400',
    }
    return colors[color]
  }

  const getTrendIcon = () => {
    if (!change) return <Minus className="w-3 h-3" />
    if (change > 0) return <TrendingUp className="w-3 h-3" />
    return <TrendingDown className="w-3 h-3" />
  }

  const getTrendColor = () => {
    if (!change) return 'text-gray-500'
    if (change > 0) return 'text-green-600 dark:text-green-400'
    return 'text-red-600 dark:text-red-400'
  }

  if (loading) {
    return (
      <div className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6',
        className
      )}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200',
        getColorClasses(),
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
          {title}
        </h3>
        {Icon && (
          <div className={cn('p-2 rounded-lg', getIconColorClasses())}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatValue(value)}
        </div>

        {change !== undefined && (
          <div className="flex items-center space-x-1">
            <span className={cn('flex items-center text-sm font-medium', getTrendColor())}>
              {getTrendIcon()}
              <span className="ml-1">
                {formatChange(change)}
              </span>
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              vs last period
            </span>
          </div>
        )}

        {previousValue !== undefined && change === undefined && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Previous: {formatValue(previousValue)}
          </div>
        )}
      </div>
    </motion.div>
  )
}
