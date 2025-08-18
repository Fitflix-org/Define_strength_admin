# Fit Space Forge API Documentation

## Overview

This is a comprehensive e-commerce API for fitness equipment built with Node.js, Express, TypeScript, and Prisma. The API provides complete functionality for product management, user authentication, shopping cart, orders, payments with Razorpay integration, admin operations with analytics, customer engagement features (reviews, wishlist), privacy compliance, customer support systems, and comprehensive analytics.

**Base URL:** `http://localhost:3001` (Development) | `https://api.fitspaceforge.com` (Production)
**API Documentation:** `/api-docs` (Swagger UI)
**Health Check:** `/health`

## Authentication

The API uses JWT (JSON Web Tokens) with access and refresh token mechanism for authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

**Token Configuration:**
- **Access Token:** Short-lived (15 minutes), used for API requests
- **Refresh Token:** Long-lived (7 days), used to refresh access tokens
- **Issuer:** `fit-space-forge-api`
- **Audience:** `fit-space-forge-users`

## Rate Limiting

- **General API calls:** 100 requests per 15 minutes (production), 1000 requests per 15 minutes (development)
- **Login attempts:** 5 attempts per 15 minutes per IP
- **Speed limiting:** After 50 requests in 15 minutes, each subsequent request gets a 100ms delay

## API Endpoints

### 🔐 Authentication (`/api/auth`)

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "clxy123abc",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/login`
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "clxy123abc",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/refresh`
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/logout`
Logout user and invalidate refresh token.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

#### GET `/api/auth/me`
Get current authenticated user information.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": "clxy123abc",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 🛍️ Products (`/api/products`)

#### GET `/api/products`
Get all products with filtering and pagination.

**Query Parameters:**
- `category` (string): Filter by category slug
- `spaceType` (string): Filter by space type (home, office, commercial)
- `search` (string): Search in product name and description
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `featured` (boolean): Show only featured products
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)

**Response (200):**
```json
{
  "products": [
    {
      "id": "clxy123abc",
      "name": "Adjustable Dumbbell Set",
      "description": "High-quality adjustable dumbbells for home workouts",
      "price": 299.99,
      "salePrice": 249.99,
      "sku": "ADJDB001",
      "stock": 50,
      "images": ["image1.jpg", "image2.jpg"],
      "categoryId": "clxy456def",
      "spaceType": "home",
      "featured": true,
      "active": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "category": {
        "id": "clxy456def",
        "name": "Dumbbells",
        "slug": "dumbbells"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 100,
    "pages": 9
  }
}
```

#### GET `/api/products/:id`
Get a single product by ID.

**Response (200):**
```json
{
  "product": {
    "id": "clxy123abc",
    "name": "Adjustable Dumbbell Set",
    "description": "High-quality adjustable dumbbells for home workouts",
    "price": 299.99,
    "salePrice": 249.99,
    "sku": "ADJDB001",
    "stock": 50,
    "images": ["image1.jpg", "image2.jpg"],
    "category": {
      "id": "clxy456def",
      "name": "Dumbbells",
      "slug": "dumbbells"
    }
  }
}
```

#### GET `/api/products/categories/all`
Get all product categories.

**Response (200):**
```json
{
  "categories": [
    {
      "id": "clxy456def",
      "name": "Dumbbells",
      "description": "All types of dumbbells",
      "slug": "dumbbells"
    }
  ]
}
```

#### GET `/api/products/:id/related`
Get related products for a specific product.

**Query Parameters:**
- `limit` (number): Number of related products (default: 4)

**Response (200):**
```json
{
  "products": [
    {
      "id": "clxy789ghi",
      "name": "Related Product",
      "price": 199.99,
      "images": ["related1.jpg"],
      "category": {
        "name": "Dumbbells"
      }
    }
  ]
}
```

---

### 🛒 Shopping Cart (`/api/cart`)

All cart endpoints require authentication.

#### POST `/api/cart/add`
Add item to cart.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "productId": "clxy123abc",
  "quantity": 2
}
```

**Response (200):**
```json
{
  "message": "Item added to cart successfully"
}
```

#### GET `/api/cart`
Get current user's cart.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "cart": {
    "id": "clxyabc123",
    "items": [
      {
        "id": "clxydef456",
        "cartId": "clxyabc123",
        "productId": "clxy123abc",
        "quantity": 2,
        "product": {
          "id": "clxy123abc",
          "name": "Adjustable Dumbbell Set",
          "price": 299.99,
          "salePrice": 249.99,
          "images": ["image1.jpg"],
          "category": {
            "name": "Dumbbells"
          }
        }
      }
    ],
    "total": 499.98
  }
}
```

#### PUT `/api/cart/items/:itemId`
Update cart item quantity.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response (200):**
```json
{
  "message": "Cart item updated successfully"
}
```

#### DELETE `/api/cart/items/:itemId`
Remove item from cart.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Item removed from cart successfully"
}
```

#### DELETE `/api/cart/clear`
Clear entire cart.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Cart cleared successfully"
}
```

---

### 📦 Orders (`/api/orders`)

All order endpoints require authentication.

#### POST `/api/orders/create`
Create order from cart.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phone": "+1234567890"
  }
}
```

**Response (201):**
```json
{
  "message": "Order created successfully",
  "order": {
    "id": "clxyord123",
    "orderNumber": "ORD-RD123ABC",
    "userId": "clxyuser123",
    "status": "pending",
    "total": 599.97,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "items": [
      {
        "id": "clxyitem123",
        "productId": "clxy123abc",
        "quantity": 2,
        "price": 249.99,
        "product": {
          "id": "clxy123abc",
          "name": "Adjustable Dumbbell Set",
          "images": ["image1.jpg"]
        }
      }
    ]
  }
}
```

#### GET `/api/orders`
Get user's orders with pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

**Response (200):**
```json
[
  {
    "id": "clxyord123",
    "orderNumber": "ORD-RD123ABC",
    "userId": "clxyuser123",
    "status": "pending",
    "total": 599.97,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "items": [
      {
        "id": "clxyitem123",
        "quantity": 2,
        "price": 249.99,
        "product": {
          "id": "clxy123abc",
          "name": "Adjustable Dumbbell Set",
          "images": ["image1.jpg"]
        }
      }
    ]
  }
]
```

#### GET `/api/orders/:id`
Get single order by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "clxyord123",
  "orderNumber": "ORD-RD123ABC",
  "status": "pending",
  "total": 599.97,
  "items": [
    {
      "id": "clxyitem123",
      "quantity": 2,
      "price": 249.99,
      "product": {
        "name": "Adjustable Dumbbell Set",
        "images": ["image1.jpg"]
      }
    }
  ]
}
```

#### PATCH `/api/orders/:id/status`
Update order status.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "shipped"
}
```

**Valid statuses:** `pending`, `processing`, `shipped`, `delivered`, `cancelled`

**Response (200):**
```json
{
  "message": "Order status updated successfully",
  "order": {
    "id": "clxyord123",
    "status": "shipped",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 📍 Addresses (`/api/addresses`)

All address endpoints require authentication.

#### GET `/api/addresses`
Get user's saved addresses.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "addresses": [
    {
      "id": "clxyaddr123",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "addressLine1": "123 Main St",
      "addressLine2": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA",
      "isDefault": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/addresses`
Create new address.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "isDefault": false
}
```

**Response (201):**
```json
{
  "address": {
    "id": "clxyaddr123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "addressLine1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "isDefault": false
  }
}
```

#### PUT `/api/addresses/:id`
Update existing address.

**Headers:** `Authorization: Bearer <token>`

**Request Body:** Same as POST

**Response (200):**
```json
{
  "address": {
    "id": "clxyaddr123",
    "firstName": "John",
    "lastName": "Doe",
    "isDefault": true
  }
}
```

#### DELETE `/api/addresses/:id`
Delete address.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Address deleted successfully"
}
```

#### POST `/api/addresses/:id/set-default`
Set address as default.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "address": {
    "id": "clxyaddr123",
    "isDefault": true
  }
}
```

---

### 💳 Payments (`/api/payments`)

All payment endpoints require authentication.

#### POST `/api/payments/create`
Create payment for an order.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "orderId": "clxyord123",
  "amount": 599.97,
  "currency": "INR",
  "paymentMethod": "card",
  "gatewayProvider": "razorpay",
  "cardLast4": "1234",
  "cardBrand": "visa"
}
```

**Response (201):**
```json
{
  "message": "Payment created successfully",
  "payment": {
    "id": "clxypay123",
    "orderId": "clxyord123",
    "amount": 599.97,
    "currency": "INR",
    "paymentMethod": "card",
    "status": "PENDING",
    "gatewayPaymentId": "pay_abc123",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PATCH `/api/payments/:paymentId/status`
Update payment status.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "COMPLETED",
  "gatewayPaymentId": "pay_abc123",
  "transactionId": "txn_xyz789",
  "gatewayFee": 14.99
}
```

**Valid statuses:** `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `CANCELLED`

**Response (200):**
```json
{
  "message": "Payment status updated successfully",
  "payment": {
    "id": "clxypay123",
    "status": "COMPLETED",
    "paidAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/api/payments/:paymentId`
Get payment details.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "payment": {
    "id": "clxypay123",
    "orderId": "clxyord123",
    "amount": 599.97,
    "status": "COMPLETED",
    "paymentMethod": "card",
    "gatewayFee": 14.99,
    "netAmount": 584.98,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "refunds": []
  }
}
```

#### POST `/api/payments/:paymentId/refund`
Create refund request.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 100.00,
  "reason": "Product damaged"
}
```

**Response (201):**
```json
{
  "message": "Refund request created successfully",
  "refund": {
    "id": "clxyref123",
    "paymentId": "clxypay123",
    "amount": 100.00,
    "reason": "Product damaged",
    "status": "PENDING"
  }
}
```

---

### 📊 Analytics (`/api/analytics`)

All analytics endpoints require authentication.

#### GET `/api/analytics/overview`
Get revenue overview and metrics.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate` (string): Start date (YYYY-MM-DD)
- `endDate` (string): End date (YYYY-MM-DD)
- `period` (string): Period type (day, week, month, year)

**Response (200):**
```json
{
  "period": {
    "start": "2024-01-01T00:00:00.000Z",
    "end": "2024-01-31T23:59:59.999Z"
  },
  "totals": {
    "totalRevenue": 50000.00,
    "netRevenue": 47500.00,
    "gatewayFees": 2500.00,
    "totalOrders": 150,
    "successfulPayments": 145,
    "averageOrderValue": 333.33,
    "conversionRate": 96.67
  },
  "dailyReports": [
    {
      "date": "2024-01-01T00:00:00.000Z",
      "totalRevenue": 1500.00,
      "totalOrders": 5
    }
  ]
}
```

#### GET `/api/analytics/payments`
Get payment analytics and breakdowns.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "paymentMethods": [
    {
      "method": "card",
      "totalAmount": 30000.00,
      "transactionCount": 100,
      "averageAmount": 300.00
    }
  ],
  "paymentStatuses": [
    {
      "status": "COMPLETED",
      "totalAmount": 45000.00,
      "transactionCount": 145
    }
  ],
  "gatewayAnalysis": [
    {
      "provider": "razorpay",
      "totalAmount": 45000.00,
      "totalFees": 2250.00,
      "feePercentage": 5.0
    }
  ]
}
```

---

### 👑 Admin (`/api/admin`)

All admin endpoints require admin authentication (role: ADMIN).

#### GET `/api/admin/dashboard`
Get admin dashboard overview.

**Headers:** `Authorization: Bearer <admin-token>`

**Response (200):**
```json
{
  "overview": {
    "totalUsers": 1000,
    "totalOrders": 500,
    "totalProducts": 100,
    "totalRevenue": 150000.00,
    "successfulPayments": 480
  },
  "recentOrders": [
    {
      "id": "clxyord123",
      "customerName": "John Doe",
      "total": 599.97,
      "status": "PENDING",
      "paymentStatus": "COMPLETED",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET `/api/admin/orders`
Get all orders with admin filters.

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by order status
- `search` (string): Search by order ID or customer info

**Response (200):**
```json
{
  "orders": [
    {
      "id": "clxyord123",
      "orderNumber": "ORD-RD123ABC",
      "customer": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "total": 599.97,
      "status": "PENDING",
      "payment": {
        "status": "COMPLETED",
        "method": "card",
        "amount": 599.97
      },
      "itemCount": 2,
      "shippingAddress": {
        "name": "John Doe",
        "address": "123 Main St",
        "city": "New York"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "totalPages": 25
  }
}
```

#### PATCH `/api/admin/orders/:orderId/status`
Update order status (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "status": "SHIPPED"
}
```

**Valid statuses:** `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`

**Response (200):**
```json
{
  "message": "Order status updated successfully",
  "order": {
    "id": "clxyord123",
    "status": "SHIPPED",
    "customer": "John Doe"
  }
}
```

#### GET `/api/admin/revenue`
Get detailed revenue analytics.

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `timeframe` (string): `daily`, `weekly`, `monthly`, `yearly`
- `startDate` (string): Start date (YYYY-MM-DD)
- `endDate` (string): End date (YYYY-MM-DD)

**Response (200):**
```json
{
  "totalRevenue": 150000.00,
  "totalTransactions": 500,
  "averageOrderValue": 300.00,
  "refundAmount": 5000.00,
  "netRevenue": 145000.00,
  "topProducts": [
    {
      "productId": "clxy123abc",
      "name": "Adjustable Dumbbell Set",
      "revenue": 15000.00,
      "orderCount": 50
    }
  ],
  "dailyBreakdown": [
    {
      "date": "2024-01-01",
      "revenue": 5000.00,
      "orders": 20
    }
  ]
}
```

#### GET `/api/admin/payments`
Get all payments with admin filters.

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by payment status
- `method` (string): Filter by payment method

**Response (200):**
```json
{
  "payments": [
    {
      "id": "clxypay123",
      "orderId": "clxyord123",
      "amount": 599.97,
      "status": "COMPLETED",
      "method": "razorpay",
      "gatewayPaymentId": "pay_razorpay123",
      "customer": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "totalPages": 25
  }
}
```

#### GET `/api/admin/wishlist/analytics`
Get comprehensive wishlist analytics.

**Headers:** `Authorization: Bearer <admin-token>`

**Response (200):**
```json
{
  "totalWishlistItems": 1247,
  "totalUsersWithWishlist": 342,
  "averageItemsPerUser": 3.6,
  "topCategories": [
    {
      "categoryId": "clxy456def",
      "categoryName": "Dumbbells",
      "wishlistCount": 156,
      "percentage": 23.4
    }
  ],
  "recentActivity": [
    {
      "userId": "clxyuser123",
      "productId": "clxy123abc",
      "productName": "Adjustable Dumbbell Set",
      "action": "ADDED",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "conversionMetrics": {
    "wishlistToPurchaseRate": 24.5,
    "averageTimeToConversion": "5.2 days",
    "totalConversions": 89
  },
  "growthTrends": {
    "thisMonth": 156,
    "lastMonth": 134,
    "growthRate": 16.4
  }
}
```

#### GET `/api/admin/wishlist/popular-items`
Get most wishlisted products with detailed analytics.

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `limit` (number): Number of items to return (default: 10, max: 50)
- `timeframe` (string): `7d`, `30d`, `90d`, `all` (default: `30d`)

**Response (200):**
```json
{
  "popularItems": [
    {
      "productId": "clxy123abc",
      "productName": "Adjustable Dumbbell Set",
      "wishlistCount": 89,
      "categoryName": "Dumbbells",
      "price": 299.99,
      "salePrice": 249.99,
      "conversionRate": 34.8,
      "conversionsCount": 31,
      "revenueGenerated": 7749.69,
      "averageRating": 4.7,
      "reviewCount": 45,
      "stockLevel": 25,
      "imageUrl": "adjustable-dumbbell.jpg",
      "trendDirection": "UP",
      "previousRank": 2
    }
  ],
  "summary": {
    "totalItemsAnalyzed": 156,
    "totalWishlistCount": 1247,
    "averageConversionRate": 24.5,
    "topPerformingCategory": "Dumbbells"
  }
}
```

#### GET `/api/admin/wishlist/conversion-stats`
Get detailed wishlist to purchase conversion analytics.

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `timeframe` (string): `7d`, `30d`, `90d`, `all` (default: `30d`)
- `categoryId` (string): Filter by specific category

**Response (200):**
```json
{
  "conversionOverview": {
    "totalWishlistItems": 1247,
    "totalConversions": 305,
    "overallConversionRate": 24.5,
    "totalRevenue": 76,234.50,
    "averageOrderValue": 249.95
  },
  "timeBasedAnalysis": [
    {
      "date": "2024-01-01",
      "wishlistAdded": 23,
      "conversions": 8,
      "conversionRate": 34.8,
      "revenue": 1999.60
    }
  ],
  "categoryBreakdown": [
    {
      "categoryId": "clxy456def",
      "categoryName": "Dumbbells",
      "wishlistCount": 156,
      "conversions": 54,
      "conversionRate": 34.6,
      "revenue": 13456.78,
      "averageTimeToConversion": "4.2 days"
    }
  ],
  "conversionPatterns": {
    "immediateConversions": 12.3,
    "within24Hours": 31.2,
    "within7Days": 68.5,
    "within30Days": 89.1,
    "beyond30Days": 10.9
  },
  "userBehavior": {
    "averageWishlistSize": 3.6,
    "usersWhoConvert": 89.3,
    "repeatWishlisters": 67.8,
    "seasonalTrends": [
      {
        "month": "January",
        "conversionBoost": 23.4
      }
    ]
  }
}
```

---

### 💳 Payments (`/api/payments`)

All payment endpoints require authentication.

#### POST `/api/payments/create`
Create a new payment record.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "orderId": "clxyord123",
  "amount": 599.97,
  "method": "razorpay",
  "metadata": {
    "gateway_payment_id": "pay_razorpay123"
  }
}
```

**Response (201):**
```json
{
  "message": "Payment created successfully",
  "payment": {
    "id": "clxypay123",
    "orderId": "clxyord123",
    "amount": 599.97,
    "status": "PENDING",
    "method": "razorpay",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PATCH `/api/payments/:paymentId/status`
Update payment status.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "COMPLETED",
  "gatewayPaymentId": "pay_razorpay123"
}
```

**Response (200):**
```json
{
  "message": "Payment status updated successfully"
}
```

#### GET `/api/payments/:paymentId`
Get payment details by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "payment": {
    "id": "clxypay123",
    "orderId": "clxyord123",
    "amount": 599.97,
    "status": "COMPLETED",
    "method": "razorpay",
    "gatewayPaymentId": "pay_razorpay123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "order": {
      "orderNumber": "ORD-RD123ABC",
      "total": 599.97
    }
  }
}
```

#### GET `/api/payments/order/:orderId`
Get payments for a specific order.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "payments": [
    {
      "id": "clxypay123",
      "amount": 599.97,
      "status": "COMPLETED",
      "method": "razorpay",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/payments/:paymentId/refund`
Process a refund for a payment.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 299.97,
  "reason": "Product defect"
}
```

**Response (200):**
```json
{
  "message": "Refund processed successfully",
  "refund": {
    "id": "clxyref123",
    "amount": 299.97,
    "status": "PENDING",
    "reason": "Product defect"
  }
}
```

#### POST `/api/payments/:paymentId/retry`
Retry a failed payment.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Payment retry initiated",
  "payment": {
    "id": "clxypay123",
    "status": "RETRYING"
  }
}
```

---

### 💰 Razorpay Integration (`/api/payments`)

#### POST `/api/payments/create-razorpay-order`
Create a Razorpay order for payment processing.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "orderId": "clxyord123"
}
```

**Response (200):**
```json
{
  "success": true,
  "razorpayOrder": {
    "id": "order_razorpay123",
    "amount": 59997,
    "currency": "INR",
    "status": "created"
  },
  "key": "rzp_test_keyid",
  "orderDetails": {
    "id": "clxyord123",
    "total": 599.97,
    "items": []
  }
}
```

#### POST `/api/payments/verify-payment`
Verify Razorpay payment signature and update order status.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "razorpay_order_id": "order_razorpay123",
  "razorpay_payment_id": "pay_razorpay123",
  "razorpay_signature": "signature_string",
  "orderId": "clxyord123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment verified and order updated successfully",
  "order": {
    "id": "clxyord123",
    "status": "CONFIRMED",
    "paymentStatus": "COMPLETED"
  }
}
```

#### POST `/api/payments/payment-failed`
Handle failed payment and update order status.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "orderId": "clxyord123",
  "error": {
    "code": "BAD_REQUEST_ERROR",
    "description": "Payment failed due to insufficient funds"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment failure recorded successfully"
}
```

#### POST `/api/payments/refund`
Process a Razorpay refund.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "paymentId": "pay_razorpay123",
  "amount": 29997,
  "reason": "Product defect"
}
```

**Response (200):**
```json
{
  "success": true,
  "refund": {
    "id": "rfnd_razorpay123",
    "amount": 29997,
    "status": "processed"
  }
}
```

#### GET `/api/payments/status/:paymentId`
Get Razorpay payment status.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "payment": {
    "id": "pay_razorpay123",
    "status": "captured",
    "amount": 59997,
    "method": "card"
  }
}
```

#### POST `/api/payments/webhook`
Razorpay webhook endpoint for automatic payment updates.

**Request Body:** (Razorpay webhook payload)

**Response (200):**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

---

### 📍 Addresses (`/api/addresses`)

All address endpoints require authentication.

#### GET `/api/addresses`
Get user's saved addresses.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "addresses": [
    {
      "id": "clxyaddr123",
      "firstName": "John",
      "lastName": "Doe",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA",
      "phone": "+1234567890",
      "isDefault": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/addresses`
Add a new address.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "phone": "+1234567890",
  "isDefault": false
}
```

**Response (201):**
```json
{
  "message": "Address added successfully",
  "address": {
    "id": "clxyaddr123",
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "isDefault": false
  }
}
```

#### PUT `/api/addresses/:id`
Update an existing address.

**Headers:** `Authorization: Bearer <token>`

**Request Body:** Same as POST `/api/addresses`

**Response (200):**
```json
{
  "message": "Address updated successfully"
}
```

#### DELETE `/api/addresses/:id`
Delete an address.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Address deleted successfully"
}
```

#### POST `/api/addresses/:id/set-default`
Set an address as default.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Default address updated successfully"
}
```

---

### 📞 Contact & Support (`/api/contact`)

#### POST `/api/contact/send`
Send a contact form message with automatic email notifications.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "subject": "Product Inquiry",
  "message": "I have a question about the home gym equipment.",
  "category": "product"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Your message has been sent successfully. We'll get back to you within 24 hours.",
  "reference": "ABC12345"
}
```

**Categories:** `general`, `order`, `payment`, `product`, `technical`, `complaint`

#### POST `/api/contact/newsletter/subscribe`
Subscribe to the newsletter.

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully subscribed to our newsletter! Check your email for confirmation."
}
```

#### POST `/api/contact/newsletter/unsubscribe`
Unsubscribe from the newsletter.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully unsubscribed from our newsletter."
}
```

---

### ❤️ Wishlist (`/api/wishlist`)

All wishlist endpoints require authentication.

#### GET `/api/wishlist`
Get user's wishlist with pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 10, max: 50)

**Response (200):**
```json
{
  "success": true,
  "message": "Wishlist retrieved successfully",
  "data": {
    "items": [
      {
        "id": "clxywish123",
        "userId": "clxyuser123",
        "productId": "clxy123abc",
        "addedAt": "2024-01-01T00:00:00.000Z",
        "product": {
          "id": "clxy123abc",
          "name": "Adjustable Dumbbell Set",
          "price": 299.99,
          "salePrice": 249.99,
          "images": ["image1.jpg"],
          "stock": 50,
          "category": {
            "name": "Dumbbells"
          }
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### POST `/api/wishlist/add`
Add a product to wishlist.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "productId": "clxy123abc"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product added to wishlist successfully",
  "data": {
    "id": "clxywish123",
    "productId": "clxy123abc",
    "addedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### DELETE `/api/wishlist/remove/:productId`
Remove a product from wishlist.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Product removed from wishlist successfully"
}
```

#### DELETE `/api/wishlist/clear`
Clear entire wishlist.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Wishlist cleared successfully"
}
```

#### GET `/api/wishlist/check/:productId`
Check if a product is in user's wishlist.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "inWishlist": true,
    "wishlistId": "clxywish123"
  }
}
```

---

### ⭐ Reviews (`/api/reviews`)

#### GET `/api/reviews/:productId`
Get reviews for a specific product with pagination and filtering.

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 10, max: 50)
- `rating` (integer, 1-5): Filter by rating
- `verified` (boolean): Filter by verified purchases only
- `sort` (string): `newest`, `oldest`, `highest`, `lowest`, `helpful`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "clxy789ghi",
        "userId": "clxyuser123",
        "productId": "clxy123abc",
        "rating": 5,
        "title": "Excellent Product!",
        "comment": "This adjustable dumbbell set exceeded my expectations.",
        "verified": true,
        "helpful": 12,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "user": {
          "name": "John D."
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    },
    "stats": {
      "averageRating": 4.7,
      "totalReviews": 45,
      "ratingDistribution": {
        "5": 30,
        "4": 10,
        "3": 3,
        "2": 1,
        "1": 1
      }
    }
  }
}
```

#### POST `/api/reviews`
Create a new product review.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "productId": "clxy123abc",
  "rating": 5,
  "title": "Excellent Product!",
  "comment": "This adjustable dumbbell set exceeded my expectations. Great quality and fast shipping."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "id": "clxy789ghi",
    "rating": 5,
    "title": "Excellent Product!",
    "comment": "This adjustable dumbbell set exceeded my expectations.",
    "verified": true,
    "helpful": 0,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT `/api/reviews/:reviewId`
Update an existing review (only by the review author).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "rating": 4,
  "title": "Updated Review Title",
  "comment": "Updated review comment with new insights."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "id": "clxy789ghi",
    "rating": 4,
    "title": "Updated Review Title",
    "comment": "Updated review comment with new insights.",
    "verified": true,
    "helpful": 12,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z",
    "user": {
      "name": "John D."
    }
  }
}
```

#### DELETE `/api/reviews/:reviewId`
Delete a review (only by the review author).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

#### POST `/api/reviews/:reviewId/helpful`
Mark a review as helpful (increases helpful count).

**Response (200):**
```json
{
  "success": true,
  "message": "Review marked as helpful",
  "data": {
    "helpful": 13
  }
}
```

---

### 🔒 Privacy & GDPR (`/api/privacy`)

All privacy endpoints require authentication.

#### POST `/api/privacy/export`
Export user data (GDPR compliance).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Data export initiated. You will receive an email with your data within 24 hours.",
  "exportId": "exp_abc123"
}
```

#### DELETE `/api/privacy/delete`
Request account deletion (GDPR compliance).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Account deletion request submitted. Your account will be deleted within 30 days."
}
```

#### POST `/api/privacy/consent`
Update user consent preferences.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "marketing": true,
  "analytics": false,
  "necessary": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Consent preferences updated successfully"
}
```

---

### 📊 Analytics (`/api/analytics`)

All analytics endpoints require authentication. Some require admin privileges.

#### GET `/api/analytics/overview`
Get user analytics overview.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "totalOrders": 15,
  "totalSpent": 4500.00,
  "averageOrderValue": 300.00,
  "favoriteCategory": "Dumbbells",
  "recentActivity": [
    {
      "type": "ORDER_PLACED",
      "description": "Order #ORD-123 placed",
      "date": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET `/api/analytics/payments`
Get user payment analytics.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "totalPayments": 15,
  "successfulPayments": 14,
  "failedPayments": 1,
  "totalAmount": 4500.00,
  "averageAmount": 300.00,
  "paymentMethods": [
    {
      "method": "razorpay",
      "count": 12,
      "totalAmount": 3600.00
    }
  ]
}
```

#### GET `/api/analytics/products`
Get user product interaction analytics.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "mostViewedProducts": [
    {
      "productId": "clxy123abc",
      "name": "Adjustable Dumbbell Set",
      "viewCount": 25
    }
  ],
  "purchaseHistory": [
    {
      "productId": "clxy123abc",
      "name": "Adjustable Dumbbell Set",
      "purchaseCount": 2,
      "totalSpent": 599.98
    }
  ]
}
```

#### GET `/api/analytics/refunds`
Get user refund analytics.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "totalRefunds": 2,
  "totalRefundAmount": 299.99,
  "refundRate": 13.3,
  "refunds": [
    {
      "id": "clxyref123",
      "amount": 149.99,
      "reason": "Product defect",
      "status": "COMPLETED",
      "processedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET `/api/analytics/advanced`
Get advanced analytics (Admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Response (200):**
```json
{
  "userMetrics": {
    "totalUsers": 1000,
    "activeUsers": 750,
    "newUsersThisMonth": 100
  },
  "salesMetrics": {
    "totalRevenue": 150000.00,
    "averageOrderValue": 300.00,
    "conversionRate": 24.5
  },
  "productMetrics": {
    "totalProducts": 100,
    "outOfStockProducts": 5,
    "topSellingProduct": "Adjustable Dumbbell Set"
  }
}
```
```json
{
  "success": true,
  "wishlist": [
    {
      "id": "clxy123abc",
      "addedAt": "2024-01-01T00:00:00.000Z",
      "product": {
        "id": "clxy456def",
        "name": "Adjustable Dumbbells",
        "description": "Professional grade adjustable dumbbells",
        "price": 299.99,
        "salePrice": 249.99,
        "images": ["image1.jpg", "image2.jpg"],
        "stock": 25,
        "category": "Strength Training",
        "featured": true,
        "active": true
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

#### POST `/api/wishlist/add`
Add a product to wishlist.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "productId": "clxy456def"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product added to wishlist successfully",
  "wishlistItem": {
    "id": "clxy123abc",
    "addedAt": "2024-01-01T00:00:00.000Z",
    "product": {
      "id": "clxy456def",
      "name": "Adjustable Dumbbells",
      "price": 299.99,
      "salePrice": 249.99,
      "images": ["image1.jpg"],
      "category": "Strength Training"
    }
  }
}
```

#### DELETE `/api/wishlist/remove/:productId`
Remove a product from wishlist.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Product removed from wishlist successfully"
}
```

#### DELETE `/api/wishlist/clear`
Clear entire wishlist.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Wishlist cleared successfully",
  "deletedCount": 5
}
```

#### GET `/api/wishlist/check/:productId`
Check if a product is in the user's wishlist.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "inWishlist": true,
  "addedAt": "2024-01-01T00:00:00.000Z"
}
```

### ⭐ Product Reviews (`/api/reviews`)

#### GET `/api/reviews/:productId`
Get reviews for a specific product with pagination and sorting.

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 10)
- `sortBy` (string, options: `newest`, `oldest`, `rating-high`, `rating-low`, `helpful`, default: `newest`)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "clxy789ghi",
        "rating": 5,
        "title": "Excellent Quality!",
        "comment": "These dumbbells are fantastic. Great build quality and perfect for home workouts.",
        "verified": true,
        "helpful": 12,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "user": {
          "name": "John D.",
          "firstName": "John"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    },
    "summary": {
      "averageRating": 4.3,
      "totalReviews": 45,
      "ratingDistribution": {
        "5": 25,
        "4": 12,
        "3": 5,
        "2": 2,
        "1": 1
      }
    }
  }
}
```

#### POST `/api/reviews`
Create a new product review.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "productId": "clxy456def",
  "rating": 5,
  "title": "Excellent Quality!",
  "comment": "These dumbbells are fantastic. Great build quality and perfect for home workouts."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "id": "clxy789ghi",
    "rating": 5,
    "title": "Excellent Quality!",
    "comment": "These dumbbells are fantastic. Great build quality and perfect for home workouts.",
    "verified": true,
    "helpful": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "name": "John D."
    }
  }
}
```

**Note:** Users can only review products they have purchased. The `verified` field indicates if the review is from a verified purchase.

#### PUT `/api/reviews/:reviewId`
Update an existing review (only by the review author).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "rating": 4,
  "title": "Updated Review Title",
  "comment": "Updated review comment with new insights."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "id": "clxy789ghi",
    "rating": 4,
    "title": "Updated Review Title",
    "comment": "Updated review comment with new insights.",
    "verified": true,
    "helpful": 12,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z",
    "user": {
      "name": "John D."
    }
  }
}
```

#### DELETE `/api/reviews/:reviewId`
Delete a review (only by the review author).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

#### POST `/api/reviews/:reviewId/helpful`
Mark a review as helpful (increases helpful count).

**Response (200):**
```json
{
  "success": true,
  "message": "Review marked as helpful",
  "data": {
    "helpful": 13
  }
}
```

---

## Error Handling

The API uses standard HTTP status codes and returns consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "details": "Additional error details (validation errors, etc.)"
}
```

### Common HTTP Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **409** - Conflict (duplicate resource)
- **429** - Too Many Requests (rate limit exceeded)
- **500** - Internal Server Error

### Common Error Types

- **Validation Error** - Invalid input data
- **Unauthorized** - Authentication required
- **Forbidden** - Access denied
- **Not Found** - Resource not found
- **Conflict** - Resource already exists
- **Too Many Requests** - Rate limit exceeded

## Database Schema

The API uses PostgreSQL with Prisma ORM. Key models include:

- **User** - User accounts and authentication
- **Product** - Product catalog with categories
- **Cart/CartItem** - Shopping cart functionality
- **Order/OrderItem** - Order management
- **Payment** - Payment processing and tracking
- **Address** - User shipping addresses
- **Category** - Product categorization
- **Refund** - Refund management
- **RevenueReport** - Daily revenue analytics
- **ContactMessage** - Customer support inquiries
- **NewsletterSubscription** - Email marketing subscriptions
- **Wishlist** - User product wishlist functionality
- **ProductReview** - Product reviews and ratings system

## Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fitspace

# JWT
JWT_SECRET=your-secret-key

# CORS
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Node Environment
NODE_ENV=development

# Server
PORT=3001
```

## Deployment Considerations

### Production Checklist

- ✅ Rate limiting enabled
- ✅ Security headers (Helmet)
- ✅ CORS configured
- ✅ Request compression
- ✅ Error handling
- ✅ Input validation
- ✅ JWT authentication
- ✅ API documentation
- ✅ Health checks
- ✅ Graceful shutdown
- ✅ Process monitoring
- ✅ Email notifications
- ✅ Payment webhooks
- ✅ Customer support system
- ✅ Product reviews & ratings
- ✅ Wishlist functionality
- ✅ Newsletter management

### Complete Feature Set

#### Core E-commerce (29 endpoints)
- **Authentication (5 endpoints):** User registration, login, token refresh, logout, profile
- **Products (4 endpoints):** Product listing with filters, single product, categories, related products
- **Shopping Cart (5 endpoints):** Add items, view cart, update quantities, remove items, clear cart
- **Orders (4 endpoints):** Create order, list orders, get order details, update status
- **Addresses (5 endpoints):** List, create, update, delete, set default address
- **Payments (6 endpoints):** Create payment, update status, get details, refunds, retry failed payments

#### Razorpay Integration (6 endpoints)
- **Payment Processing:** Create Razorpay orders, verify payments, handle failures
- **Refund Management:** Process refunds through Razorpay
- **Status Tracking:** Get payment status and webhook handling

#### Customer Engagement (14 endpoints)
- **Product Reviews (5 endpoints):** Get reviews, create, update, delete, mark helpful
- **Wishlist (5 endpoints):** Get wishlist, add/remove items, clear wishlist, check status
- **Newsletter (2 endpoints):** Subscribe and unsubscribe
- **Contact Form (1 endpoint):** Send support messages with email automation
- **Privacy & GDPR (3 endpoints):** Data export, account deletion, consent management

#### Admin Dashboard (11 endpoints)
- **Order Management (3 endpoints):** Dashboard overview, order list, status updates
- **Revenue Analytics (1 endpoint):** Detailed revenue and transaction analytics
- **Payment Monitoring (1 endpoint):** Payment overview and tracking
- **Wishlist Analytics (3 endpoints):** Comprehensive wishlist insights, popular items, conversion stats
- **User Analytics (5 endpoints):** Overview, payment analytics, product interactions, refund analytics, advanced metrics

#### Security Features

- **JWT Authentication:** Access and refresh token mechanism with proper issuer/audience validation
- **Rate Limiting:** 100 requests per 15 minutes in production, 1000 in development
- **Progressive Speed Limiting:** Automatic delays after 50 requests in 15 minutes
- **Login Protection:** 5 login attempts per 15 minutes per IP address
- **CORS Security:** Configurable origin protection
- **Security Headers:** Helmet middleware for security headers
- **Input Validation:** Comprehensive Zod schema validation
- **SQL Injection Prevention:** Prisma ORM with parameterized queries
- **Password Security:** bcrypt hashing with salt rounds

#### Performance Features

- **Response Compression:** Automatic gzip compression for all responses
- **Database Optimization:** Efficient Prisma queries with proper indexing
- **Pagination:** Consistent pagination across all list endpoints
- **Connection Pooling:** PostgreSQL connection optimization
- **Error Handling:** Comprehensive error middleware with structured responses

### Business Intelligence

#### Wishlist Analytics
- **Comprehensive Insights:** Total items, user engagement, category preferences
- **Conversion Tracking:** Wishlist-to-purchase analytics with time-based patterns
- **Popular Items Analysis:** Most wishlisted products with conversion rates and revenue impact
- **Growth Trends:** Month-over-month growth tracking and seasonal patterns
- **User Behavior:** Average wishlist size, repeat engagement, conversion timing

#### Revenue Analytics
- **Time-based Analysis:** Daily, weekly, monthly, yearly revenue breakdowns
- **Product Performance:** Top-selling products with revenue and order count
- **Refund Tracking:** Refund amounts and impact on net revenue
- **Average Order Value:** AOV trends and customer spending patterns

#### Payment Analytics
- **Gateway Analysis:** Payment provider performance and fee analysis
- **Success Rates:** Payment completion and failure rate tracking
- **Method Distribution:** Payment method preferences and performance
- **Transaction Monitoring:** Real-time payment status and webhook processing

### Total API Coverage: 60+ Endpoints

### Security Features

- JWT token authentication
- Rate limiting (100 req/15min in production)
- Speed limiting (progressive delays)
- CORS protection
- Helmet security headers
- Input validation with Zod
- SQL injection prevention (Prisma)
- Password hashing (bcrypt)

### Performance Features

- Response compression
- Database query optimization
- Pagination for large datasets
- Efficient database indexing
- Connection pooling

## Support

For API support, contact: support@fitspaceforge.com

## Version History

- **v2.0.0** - Major update with comprehensive analytics and business intelligence
  - Added advanced wishlist analytics with conversion tracking
  - Implemented comprehensive admin dashboard with revenue analytics
  - Enhanced JWT authentication with access/refresh token mechanism
  - Added Razorpay payment integration with webhook support
  - Improved security with progressive rate limiting and enhanced validation
  - Total endpoints: 60+ covering complete e-commerce functionality

- **v1.3.0** - Added comprehensive business features: Product Reviews, Wishlist, Contact & Support, Newsletter management
- **v1.2.0** - Enhanced payment integration with Razorpay webhooks and improved security features
- **v1.1.0** - Added admin dashboard, analytics, and enterprise security features
- **v1.0.0** - Initial release with core e-commerce functionality
