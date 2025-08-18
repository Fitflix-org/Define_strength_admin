import React from 'react'
import { Heart } from 'lucide-react'

export function WishlistPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Wishlist Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Analyze wishlist behavior and conversion
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
        <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Wishlist Analytics
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Wishlist analytics coming soon...
        </p>
      </div>
    </div>
  )
}
