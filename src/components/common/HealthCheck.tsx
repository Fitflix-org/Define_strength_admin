import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, AlertCircle, CheckCircle, Wifi, WifiOff, X } from 'lucide-react'
import { systemAPI } from '../../services/api'
import type { SystemHealth } from '../../types'

export function HealthCheck() {
  const [isVisible, setIsVisible] = useState(false)

  const { data: health, isError } = useQuery({
    queryKey: ['system', 'health'],
    queryFn: async () => {
      const response = await systemAPI.getHealth()
      return response.data.data as SystemHealth
    },
    refetchInterval: 30000, // Check every 30 seconds
    retry: 3,
  })

  const getStatusIcon = () => {
    if (isError) return <WifiOff className="w-4 h-4 text-red-500" />
    if (!health) return <Wifi className="w-4 h-4 text-gray-400" />
    
    switch (health.status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    if (isError) return 'bg-red-500'
    if (!health) return 'bg-gray-400'
    
    switch (health.status) {
      case 'healthy':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <>
      {/* Health status indicator */}
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
        title="System Health"
      >
        <div className="relative">
          {getStatusIcon()}
          <div className={`absolute -top-1 -right-1 w-3 h-3 ${getStatusColor()} rounded-full animate-pulse`} />
        </div>
      </button>

      {/* Health details modal */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setIsVisible(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  System Health
                </h3>
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isError ? (
                <div className="text-center py-8">
                  <WifiOff className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 dark:text-red-400">
                    Unable to check system health
                  </p>
                </div>
              ) : !health ? (
                <div className="text-center py-8">
                  <div className="spinner w-8 h-8 mx-auto mb-4" />
                  <p className="text-gray-500">Loading health status...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Overall status */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="font-medium">Overall Status</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon()}
                      <span className={`capitalize ${
                        health.status === 'healthy' ? 'text-green-600 dark:text-green-400' :
                        health.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {health.status}
                      </span>
                    </div>
                  </div>

                  {/* System metrics */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
                      <span className="text-sm font-medium">
                        {Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</span>
                      <span className="text-sm font-medium">
                        {health.memory.percentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</span>
                      <span className="text-sm font-medium">
                        {health.cpu.usage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          health.database.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span className="text-sm font-medium capitalize">
                          {health.database.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Services status */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <h4 className="text-sm font-medium mb-3">Services</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(health.services).map(([service, status]) => (
                        <div
                          key={service}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <span className="text-xs capitalize">{service}</span>
                          <div className={`w-2 h-2 rounded-full ${
                            status ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 text-center pt-2">
                    Last checked: {new Date(health.lastChecked).toLocaleTimeString()}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
