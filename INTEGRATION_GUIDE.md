# Frontend-Backend Integration Guide

## Overview
This guide shows how to integrate the admin panel components with the expected backend APIs.

## 1. BulkExportModal Integration

### Frontend Implementation (Already Done)
The `BulkExportModal` component expects an `onExport` callback that receives export options.

### Backend Integration Example

```typescript
// In your page component (e.g., OrdersPage.tsx)
import { BulkExportModal } from '../components/BulkExportModal';
import { useNotificationActions } from '../context/NotificationContext';

const OrdersPage: React.FC = () => {
  const { notifySuccess, notifyError } = useNotificationActions();

  const handleExport = async (options: ExportOptions) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/export`,
        {
          dataType: options.dataType,
          format: options.format,
          dateRange: options.dateRange,
          filters: options.filters
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.downloadUrl) {
        // Trigger download
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = `${options.dataType}_export.${options.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        notifySuccess('Export completed', 'Your file has been downloaded');
      }
    } catch (error) {
      notifyError('Export failed', 'Please try again later');
    }
  };

  return (
    <div>
      {/* Your existing page content */}
      <BulkExportModal onExport={handleExport} />
    </div>
  );
};
```

### Expected Backend Response
```json
{
  "success": true,
  "exportId": "export_12345",
  "downloadUrl": "https://api.fitspace.com/exports/orders_2025-08-08.csv",
  "filename": "orders_2025-08-08.csv",
  "expiresAt": "2025-08-09T10:30:00Z",
  "fileSize": "2.5MB"
}
```

## 2. Advanced Analytics Integration

### Frontend Usage
```typescript
// AdvancedAnalyticsPage.tsx is already implemented
// It expects this API endpoint to return comprehensive analytics data

const { data: analytics } = useQuery({
  queryKey: ['advanced-analytics', dateRange],
  queryFn: async () => {
    const response = await axios.get(
      `${API_BASE_URL}/api/analytics/advanced`,
      {
        params: {
          startDate: dateRange.start,
          endDate: dateRange.end
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  }
});
```

### Backend Implementation Required
```javascript
// Example Express.js endpoint
app.get('/api/analytics/advanced', authenticateAdmin, async (req, res) => {
  const { startDate, endDate } = req.query;
  
  try {
    // Calculate revenue metrics
    const revenueMetrics = await calculateRevenueMetrics(startDate, endDate);
    
    // Calculate sales metrics
    const salesMetrics = await calculateSalesMetrics(startDate, endDate);
    
    // Calculate customer metrics
    const customerMetrics = await calculateCustomerMetrics(startDate, endDate);
    
    // Get product performance
    const productMetrics = await getProductMetrics(startDate, endDate);
    
    // Get time series data
    const timeSeriesData = await getTimeSeriesData(startDate, endDate);
    
    res.json({
      revenueMetrics,
      salesMetrics,
      customerMetrics,
      productMetrics,
      timeSeriesData
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});
```

## 3. Notification System Integration

### Frontend Usage (Already Implemented)
```typescript
// Any component can use notifications
import { useNotificationActions } from '../context/NotificationContext';

const SomeComponent = () => {
  const { notifySuccess, notifyError, notifyWarning, notifyInfo } = useNotificationActions();

  const handleAction = async () => {
    try {
      // Some API call
      await apiCall();
      notifySuccess('Success!', 'Operation completed successfully');
    } catch (error) {
      notifyError('Error occurred', error.message);
    }
  };

  return <button onClick={handleAction}>Do Something</button>;
};
```

### Backend Integration
No special backend integration needed - notifications are purely frontend.
However, your API responses should provide clear success/error messages:

```json
// Success response
{
  "success": true,
  "message": "Order status updated successfully",
  "data": { ... }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid order status",
    "details": "Status must be one of: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED"
  }
}
```

## 4. DataTable Integration

### Frontend Usage
```typescript
// Example usage in OrdersPage
import { DataTable, Column } from '../components/DataTable';

const OrdersPage = () => {
  const columns: Column<Order>[] = [
    {
      key: 'orderNumber',
      title: 'Order Number',
      sortable: true,
      filterable: true
    },
    {
      key: 'customer',
      title: 'Customer',
      render: (value, order) => (
        <div>
          <div className="font-medium">{order.customer.name}</div>
          <div className="text-gray-500">{order.customer.email}</div>
        </div>
      )
    },
    {
      key: 'total',
      title: 'Total',
      sortable: true,
      align: 'right',
      render: (value) => `$${Number(value).toFixed(2)}`
    },
    // ... more columns
  ];

  return (
    <DataTable
      data={orders}
      columns={columns}
      loading={isLoading}
      pagination={{ enabled: true, pageSize: 20 }}
      searchable={true}
      exportable={true}
      onExport={() => handleExport({ dataType: 'orders', format: 'csv' })}
      onRowClick={(order) => setSelectedOrder(order)}
    />
  );
};
```

## 5. Settings Page Integration

### Frontend Implementation (Already Done)
The settings page manages local state and calls a save API.

### Backend Integration
```typescript
// Settings save handler
const handleSaveSettings = async (settings: AdminSettings) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/admin/settings`,
      settings,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    notifySuccess('Settings saved', 'Configuration updated successfully');
  } catch (error) {
    notifyError('Save failed', 'Could not update settings');
  }
};
```

### Expected Backend Endpoints
```javascript
// GET /api/admin/settings
app.get('/api/admin/settings', authenticateAdmin, async (req, res) => {
  try {
    const settings = await getAdminSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/admin/settings
app.put('/api/admin/settings', authenticateAdmin, async (req, res) => {
  try {
    const updatedSettings = await updateAdminSettings(req.body);
    res.json({ success: true, settings: updatedSettings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});
```

## 6. Authentication Integration

### Current Implementation
The admin panel already has authentication implemented in `AuthContext.tsx`:

```typescript
// Login function expects this API response
const login = async (email: string, password: string) => {
  const response = await axios.post('/api/auth/login', { email, password });
  
  if (response.data.token && response.data.user.role === 'ADMIN') {
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return true;
  }
  throw new Error('Invalid admin credentials');
};
```

### Required Backend Implementation
```javascript
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await authenticateUser(email, password);
    
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Access denied - Admin role required' 
      });
    }
    
    const token = generateJWT(user);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});
```

## 7. Error Handling Integration

### Frontend Error Handling (Already Implemented)
```typescript
// ErrorBoundary catches React errors
// Notification system handles API errors
// Each API call has try/catch with user-friendly messages
```

### Backend Error Standards
```javascript
// Consistent error response format
const errorResponse = (res, statusCode, code, message, details = null) => {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString()
    }
  });
};

// Usage examples
errorResponse(res, 400, 'VALIDATION_ERROR', 'Invalid input data', { field: 'email' });
errorResponse(res, 401, 'UNAUTHORIZED', 'Access token required');
errorResponse(res, 403, 'FORBIDDEN', 'Admin role required');
errorResponse(res, 404, 'NOT_FOUND', 'Resource not found');
errorResponse(res, 500, 'INTERNAL_ERROR', 'Server error occurred');
```

## 8. Real-time Updates (Optional Enhancement)

### WebSocket Integration (Future Enhancement)
```typescript
// Add real-time order updates
const useOrderUpdates = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/admin/orders`);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      if (update.type === 'ORDER_STATUS_CHANGED') {
        queryClient.invalidateQueries(['orders']);
        notifyInfo('Order Updated', `Order ${update.orderNumber} status changed to ${update.status}`);
      }
    };
    
    return () => ws.close();
  }, []);
};
```

## 9. Environment Configuration

### Required Environment Variables
```bash
# .env.production
VITE_API_BASE_URL=https://api.fitspace.com
VITE_WS_URL=wss://api.fitspace.com
VITE_APP_NAME=Fit Space Forge Admin
VITE_APP_VERSION=1.0.0
```

### Backend CORS Configuration
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://admin.fitspace.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

This integration guide provides everything needed to connect the admin panel with a backend API!
