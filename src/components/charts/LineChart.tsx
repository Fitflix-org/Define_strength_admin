import React from 'react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatCurrency, formatDate } from '../../lib/utils'

interface LineChartProps {
  data: any[]
  xKey: string
  yKeys: Array<{
    key: string
    name: string
    color: string
    format?: 'currency' | 'number'
  }>
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  loading?: boolean
}

export function LineChart({
  data,
  xKey,
  yKeys,
  height = 300,
  showGrid = true,
  showLegend = true,
  loading = false,
}: LineChartProps) {
  const formatXAxis = (value: any) => {
    // Try to parse as date first
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      return formatDate(date, 'short')
    }
    return value
  }

  const formatTooltipValue = (value: any, name: string) => {
    const yKey = yKeys.find(y => y.name === name)
    if (yKey?.format === 'currency') {
      return [formatCurrency(value), name]
    }
    return [value.toLocaleString(), name]
  }

  const formatTooltipLabel = (label: any) => {
    const date = new Date(label)
    if (!isNaN(date.getTime())) {
      return formatDate(date, 'long')
    }
    return label
  }

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg"
        style={{ height }}
      >
        <div className="flex flex-col items-center space-y-2">
          <div className="spinner w-6 h-6" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Loading chart...</span>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg"
        style={{ height }}
      >
        <span className="text-sm text-gray-500 dark:text-gray-400">No data available</span>
      </div>
    )
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              className="stroke-gray-200 dark:stroke-gray-700" 
            />
          )}
          <XAxis
            dataKey={xKey}
            tickFormatter={formatXAxis}
            className="text-xs fill-gray-600 dark:fill-gray-400"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            className="text-xs fill-gray-600 dark:fill-gray-400"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              if (yKeys[0]?.format === 'currency') {
                return formatCurrency(value)
              }
              return value.toLocaleString()
            }}
          />
          <Tooltip
            formatter={formatTooltipValue}
            labelFormatter={formatTooltipLabel}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }}
            className="dark:bg-gray-800 dark:border-gray-600"
          />
          {showLegend && (
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
          )}
          {yKeys.map((yKey, index) => (
            <Line
              key={yKey.key}
              type="monotone"
              dataKey={yKey.key}
              name={yKey.name}
              stroke={yKey.color}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              connectNulls
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}
