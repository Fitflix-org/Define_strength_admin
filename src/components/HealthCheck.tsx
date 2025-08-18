import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import api from '../services/api'

interface HealthStatus {
  api: 'healthy' | 'unhealthy' | 'checking'
  auth: 'healthy' | 'unhealthy' | 'checking'
  database: 'healthy' | 'unhealthy' | 'checking'
  lastChecked?: string
}

export const HealthCheck: React.FC = () => {
  const [status, setStatus] = useState<HealthStatus>({
    api: 'checking',
    auth: 'checking',
    database: 'checking'
  })
  const [isVisible, setIsVisible] = useState(false)

  const checkHealth = async () => {
    setStatus({
      api: 'checking',
      auth: 'checking',
      database: 'checking'
    })

    try {
      // Check API health
      const healthResponse = await api.get('/health')
      const apiStatus = healthResponse.status === 200 ? 'healthy' : 'unhealthy'
      
      // Check auth endpoint
      let authStatus: 'healthy' | 'unhealthy' = 'unhealthy'
      try {
        await api.get('/api/auth/me')
        authStatus = 'healthy'
      } catch (error: any) {
        // 401 is expected if not logged in, but endpoint is working
        if (error.response?.status === 401) {
          authStatus = 'healthy'
        }
      }

      // Database status from health endpoint
      const dbStatus = healthResponse.data?.database === 'connected' ? 'healthy' : 'unhealthy'

      setStatus({
        api: apiStatus,
        auth: authStatus,
        database: dbStatus,
        lastChecked: new Date().toLocaleTimeString()
      })
    } catch (error) {
      setStatus({
        api: 'unhealthy',
        auth: 'unhealthy',
        database: 'unhealthy',
        lastChecked: new Date().toLocaleTimeString()
      })
    }
  }

  useEffect(() => {
    // Only check health in development or when explicitly requested
    if (import.meta.env.DEV) {
      checkHealth()
    }
  }, [])

  const getStatusIcon = (status: 'healthy' | 'unhealthy' | 'checking') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
    }
  }

  const getStatusColor = (status: 'healthy' | 'unhealthy' | 'checking') => {
    switch (status) {
      case 'healthy':
        return 'text-green-600'
      case 'unhealthy':
        return 'text-red-600'
      case 'checking':
        return 'text-yellow-600'
    }
  }

  const overallHealth = Object.values(status).filter(s => s === 'healthy').length >= 2 ? 'healthy' : 'unhealthy'

  if (!import.meta.env.DEV && !isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-2 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="System Health"
      >
        <AlertCircle className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border p-4 min-w-64">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          {getStatusIcon(overallHealth as any)}
          <span className="ml-2">System Health</span>
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={checkHealth}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          {!import.meta.env.DEV && (
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Close"
            >
              ×
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">API Server</span>
          <div className="flex items-center space-x-1">
            {getStatusIcon(status.api)}
            <span className={`text-sm font-medium ${getStatusColor(status.api)}`}>
              {status.api}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Authentication</span>
          <div className="flex items-center space-x-1">
            {getStatusIcon(status.auth)}
            <span className={`text-sm font-medium ${getStatusColor(status.auth)}`}>
              {status.auth}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Database</span>
          <div className="flex items-center space-x-1">
            {getStatusIcon(status.database)}
            <span className={`text-sm font-medium ${getStatusColor(status.database)}`}>
              {status.database}
            </span>
          </div>
        </div>
      </div>
      
      {status.lastChecked && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            Last checked: {status.lastChecked}
          </span>
        </div>
      )}
    </div>
  )
}
