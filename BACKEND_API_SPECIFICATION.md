# Backend API Requirements for Fit Space Forge Admin Panel

## Overview
This document outlines the expected backend API endpoints and data structures needed to support the admin panel features.

## Authentication Endpoints

### POST /api/auth/login
**Purpose**: Admin login authentication
**Request Body**:
```json
{
  "email": "admin@fitspace.com",
  "password": "securePassword123"
}
```
**Response**:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "admin@fitspace.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN"
  }
}
```

### GET /api/auth/me
**Purpose**: Get current user profile
**Headers**: `Authorization: Bearer {token}`
**Response**:
```json
{
  "id": "user_id",
  "email": "admin@fitspace.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "ADMIN"
}
```

## Dashboard Endpoints

### GET /api/admin/dashboard
**Purpose**: Dashboard overview statistics
**Headers**: `Authorization: Bearer {token}`
**Response**:
```json
{
  "overview": {
    "totalUsers": 1250,
    "totalOrders": 3400,
    "totalProducts": 150,
    "totalRevenue": "125000.50",
    "netRevenue": "118000.25",
    "gatewayFees": "7000.25",
    "successfulPayments": 3200
  },
  "recentOrders": [
    {
      "id": "order_123",
      "customerName": "Jane Smith",
      "total": "89.99",
      "status": "CONFIRMED",
      "paymentStatus": "COMPLETED",
      "paymentMethod": "STRIPE",
      "createdAt": "2025-08-08T10:30:00Z"
    }
  ],
  "dailyRevenue": [
    {
      "date": "2025-08-01",
      "revenue": "5200.00"
    }
  ]
}
```

## Order Management Endpoints

### GET /api/admin/orders
**Purpose**: List all orders with pagination and filters
**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search term for customer name/email/order number
- `status` (string): Filter by order status
- `startDate` (string): Filter by date range start
- `endDate` (string): Filter by date range end

**Response**:
```json
{
  "orders": [
    {
      "id": "order_123",
      "orderNumber": "ORD-2025-001",
      "total": "89.99",
      "status": "CONFIRMED",
      "createdAt": "2025-08-08T10:30:00Z",
      "customer": {
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "payment": {
        "status": "COMPLETED",
        "method": "STRIPE",
        "amount": "89.99"
      },
      "itemCount": 3,
      "shippingAddress": {
        "name": "Jane Smith",
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3400,
    "totalPages": 170
  }
}
```

### PATCH /api/admin/orders/:id/status
**Purpose**: Update order status
**Request Body**:
```json
{
  "status": "SHIPPED"
}
```
**Response**:
```json
{
  "success": true,
  "order": {
    "id": "order_123",
    "status": "SHIPPED",
    "updatedAt": "2025-08-08T11:00:00Z"
  }
}
```

## Payment Management Endpoints

### GET /api/admin/payments
**Purpose**: List all payments
**Query Parameters**: Same as orders (page, limit, search, status, dates)
**Response**:
```json
{
  "payments": [
    {
      "id": "payment_123",
      "amount": "89.99",
      "status": "COMPLETED",
      "method": "STRIPE",
      "gateway": "stripe",
      "gatewayPaymentId": "pi_1234567890",
      "transactionId": "txn_987654321",
      "createdAt": "2025-08-08T10:30:00Z",
      "order": {
        "id": "order_123",
        "orderNumber": "ORD-2025-001",
        "user": {
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "jane@example.com"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3200,
    "totalPages": 160
  }
}
```

### GET /api/payments/:id
**Purpose**: Get payment details
**Response**: Single payment object with full details

### PATCH /api/payments/:id/status
**Purpose**: Update payment status
**Request Body**:
```json
{
  "status": "REFUNDED"
}
```

### POST /api/payments/:id/refund
**Purpose**: Process refund
**Request Body**:
```json
{
  "amount": "89.99",
  "reason": "Customer request"
}
```

## Analytics Endpoints

### GET /api/analytics/overview
**Purpose**: Basic analytics data
**Query Parameters**:
- `startDate` (string): Analytics period start
- `endDate` (string): Analytics period end

**Response**:
```json
{
  "totalRevenue": "45000.00",
  "totalOrders": 450,
  "averageOrderValue": "100.00",
  "topProducts": [
    {
      "id": "prod_1",
      "name": "Premium Whey Protein",
      "sales": 150,
      "revenue": "7500.00"
    }
  ],
  "revenueByDay": [
    {
      "date": "2025-08-01",
      "revenue": "1500.00",
      "orders": 15
    }
  ]
}
```

### GET /api/analytics/payments
**Purpose**: Payment analytics
**Response**:
```json
{
  "paymentMethods": [
    {
      "method": "STRIPE",
      "count": 200,
      "totalAmount": "20000.00"
    },
    {
      "method": "PAYPAL",
      "count": 100,
      "totalAmount": "10000.00"
    }
  ],
  "paymentGateways": [
    {
      "gateway": "stripe",
      "successRate": 98.5,
      "totalTransactions": 200,
      "totalFees": "600.00"
    }
  ]
}
```

### GET /api/analytics/advanced
**Purpose**: Advanced analytics for the new dashboard
**Query Parameters**: `startDate`, `endDate`
**Response**:
```json
{
  "revenueMetrics": {
    "totalRevenue": 125000.50,
    "revenueGrowth": 12.5,
    "averageOrderValue": 89.50,
    "conversionRate": 3.2
  },
  "salesMetrics": {
    "totalOrders": 1400,
    "ordersGrowth": 8.3,
    "completedOrders": 1250,
    "cancelledOrders": 50
  },
  "customerMetrics": {
    "totalCustomers": 850,
    "newCustomers": 120,
    "returningCustomers": 730,
    "customerLifetimeValue": 147.25
  },
  "productMetrics": {
    "topSellingProducts": [
      {
        "id": "prod_1",
        "name": "Premium Whey Protein",
        "sales": 150,
        "revenue": 7500.00
      }
    ],
    "categoryPerformance": [
      {
        "category": "Supplements",
        "sales": 500,
        "revenue": 25000.00
      }
    ]
  },
  "timeSeriesData": [
    {
      "date": "2025-08-01",
      "revenue": 1500.00,
      "orders": 15,
      "customers": 12
    }
  ]
}
```

## Product Management Endpoints

### GET /api/products
**Purpose**: List products with filters
**Query Parameters**:
- `page`, `limit` (pagination)
- `search` (string): Search by name
- `category` (string): Filter by category
- `status` (string): Filter by status (ACTIVE, INACTIVE)
- `inStock` (boolean): Filter by stock availability

**Response**:
```json
{
  "products": [
    {
      "id": "prod_1",
      "name": "Premium Whey Protein",
      "description": "High-quality whey protein powder",
      "price": "49.99",
      "category": "Supplements",
      "status": "ACTIVE",
      "stockQuantity": 150,
      "images": [
        "https://example.com/product1.jpg"
      ],
      "createdAt": "2025-07-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### GET /api/products/categories/all
**Purpose**: Get all product categories
**Response**:
```json
{
  "categories": [
    {
      "id": "cat_1",
      "name": "Supplements",
      "productCount": 50
    },
    {
      "id": "cat_2", 
      "name": "Equipment",
      "productCount": 75
    }
  ]
}
```

## User Management Endpoints

### GET /api/admin/users
**Purpose**: List all users
**Query Parameters**: `page`, `limit`, `search`, `role`
**Response**:
```json
{
  "users": [
    {
      "id": "user_1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "USER",
      "status": "ACTIVE",
      "createdAt": "2025-07-01T00:00:00Z",
      "orderCount": 5,
      "totalSpent": "450.00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1250,
    "totalPages": 63
  }
}
```

### PATCH /api/admin/users/:id/role
**Purpose**: Update user role
**Request Body**:
```json
{
  "role": "ADMIN"
}
```

## Data Export Endpoints

### POST /api/admin/export
**Purpose**: Generate data export (used by BulkExportModal)
**Request Body**:
```json
{
  "dataType": "orders",
  "format": "csv",
  "dateRange": {
    "start": "2025-07-01",
    "end": "2025-08-01"
  },
  "filters": {}
}
```
**Response**:
```json
{
  "exportId": "export_123",
  "downloadUrl": "https://api.fitspace.com/exports/export_123.csv",
  "expiresAt": "2025-08-09T10:30:00Z"
}
```

## System Health Endpoints

### GET /api/health
**Purpose**: System health check (used by HealthCheck component)
**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-08T10:30:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "payment_gateway": "healthy"
  },
  "version": "1.0.0"
}
```

## Settings Management Endpoints

### GET /api/admin/settings
**Purpose**: Get current admin settings
**Response**:
```json
{
  "security": {
    "sessionTimeout": 30,
    "maxLoginAttempts": 5,
    "requireTwoFactor": false,
    "passwordPolicy": {
      "minLength": 8,
      "requireSpecialChars": true,
      "requireNumbers": true
    }
  },
  "notifications": {
    "emailNotifications": true,
    "newOrderAlerts": true,
    "lowStockAlerts": true,
    "paymentFailureAlerts": true
  },
  "system": {
    "maintenanceMode": false,
    "backupFrequency": "daily",
    "logRetentionDays": 30
  }
}
```

### PUT /api/admin/settings
**Purpose**: Update admin settings
**Request Body**: Same structure as GET response

## Error Responses

All endpoints should return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Email is required"
    }
  }
}
```

## Authentication & Authorization

- All admin endpoints require `Authorization: Bearer {token}` header
- Token should contain user role information
- Only users with `ADMIN` role can access these endpoints
- Implement rate limiting for security
- Use HTTPS in production

## CORS Configuration

Allow requests from your admin panel domain:
```javascript
{
  origin: ['http://localhost:3000', 'https://admin.fitspace.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

## Database Schema Recommendations

### Key Tables Needed:
- `users` (id, email, firstName, lastName, role, status, createdAt)
- `orders` (id, orderNumber, userId, total, status, createdAt, shippingAddress)
- `payments` (id, orderId, amount, status, method, gateway, gatewayPaymentId, transactionId)
- `products` (id, name, description, price, category, status, stockQuantity, images)
- `order_items` (id, orderId, productId, quantity, price)
- `admin_settings` (key, value, updatedAt)

This backend specification will fully support all the features implemented in the admin panel!
