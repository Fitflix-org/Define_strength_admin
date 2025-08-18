# Fit Space Forge Admin Panel 🚀

A **production-ready** comprehensive admin dashboard for managing the Fit Space Forge e-commerce platform. Built with React, TypeScript, Tailwind CSS, and Vite.

## ✨ Features

### Core Admin Features
- **Dashboard Overview**: Revenue metrics, recent orders, and key statistics with real-time data
- **Order Management**: Complete order lifecycle management with status updates and detailed views
- **Payment Tracking**: Comprehensive payment monitoring with transaction details and refund capabilities
- **Product Management**: Full product catalog management with search, filtering, and category organization
- **User Management**: Customer account management with role-based access control and order history
- **Analytics Dashboard**: Revenue analytics with date filtering, payment insights, and trend analysis

### Advanced Features
- **Advanced Analytics**: Enterprise-level business intelligence with KPIs, performance metrics, and visual charts
- **Data Export System**: Multi-format export (CSV, Excel, PDF) with date range selection and filtering
- **Notification System**: Real-time toast notifications with action buttons and auto-dismiss
- **Settings Management**: Comprehensive admin configuration for security, notifications, system, and email
- **Advanced Data Tables**: Sortable, filterable, paginated tables with bulk selection and export
- **Search & Filtering**: Global search functionality across all data with advanced filtering options

### Technical Excellence
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop with Tailwind CSS
- **Real-time Updates**: React Query for efficient data fetching, caching, and synchronization
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Health Monitoring**: System health checks and status indicators for production environments
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Performance**: Optimized bundle size (~96KB gzipped), code splitting, lazy loading, and debouncing

## 🔒 Security & Production Features

- **JWT Authentication**: Secure token-based authentication with automatic refresh
- **Role-based Access Control**: Admin role verification and protected routes
- **Error Boundaries**: Graceful error handling preventing application crashes
- **Environment Configuration**: Secure environment variable handling
- **Production Optimizations**: Optimized bundle size (~96KB gzipped) with code splitting

## API Integration

This admin panel connects to the Fit Space Forge API and uses the following endpoints:

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user profile

### Admin Dashboard
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/analytics/overview` - Revenue analytics
- `GET /api/analytics/payments` - Payment analytics

### Order Management
- `GET /api/admin/orders` - List all orders with pagination and filters
- `PATCH /api/admin/orders/:id/status` - Update order status

### Payment Management
- `GET /api/admin/payments` - List all payments
- `GET /api/payments/:id` - Get payment details
- `PATCH /api/payments/:id/status` - Update payment status
- `POST /api/payments/:id/refund` - Create refund

### Product Management
- `GET /api/products` - List products with filters
- `GET /api/products/categories/all` - Get all categories

### User Management
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:id/role` - Update user role

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Lucide React** - Icons
- **Axios** - HTTP client

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Access to the Fit Space Forge API

### Installation

1. Clone the repository:
```bash
## 🚀 Quick Start & Deployment

### Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd Define_strength_admin
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Update environment variables in `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_NAME=Fit Space Forge Admin
VITE_APP_VERSION=1.0.0
```

5. Start development server:
```bash
npm run dev
```

The admin panel will be available at `http://localhost:3000`

### 🏗️ Production Deployment

**This application is production-ready!** See [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete checklist and deployment guide.

#### Quick Deploy with Docker:
```bash
# Build production image
docker build -t fit-space-admin:latest .

# Run production container
docker run -p 3000:80 fit-space-admin:latest

# Or use Docker Compose
docker-compose up -d
```

#### Production Build:
```bash
npm run build
# Output: Optimized build (~96KB gzipped) in /dist folder
```

### 🔐 Authentication

Use admin credentials to access the dashboard:
- Email: Your admin email
- Password: Your admin password

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:prod` - Build for production with optimizations
- `npm run preview` - Preview production build
- `npm run lint` - Type check
- `npm run serve` - Serve production build

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ErrorBoundary.tsx
│   ├── Layout.tsx
│   └── ProtectedRoute.tsx
├── context/            # React contexts
│   └── AuthContext.tsx
├── pages/              # Page components
│   ├── AnalyticsPage.tsx
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   ├── OrdersPage.tsx
│   ├── PaymentsPage.tsx
│   ├── ProductsPage.tsx
│   └── UsersPage.tsx
├── services/           # API services
│   └── api.ts
├── App.tsx            # Main app component
└── main.tsx           # App entry point
```

## Production Deployment

### Docker Deployment

1. Build the Docker image:
```bash
docker build -t fit-space-admin .
```

2. Run the container:
```bash
docker run -p 3000:80 fit-space-admin
```

### Docker Compose

Use the provided `docker-compose.yml`:

```bash
docker-compose up -d
```

### Manual Deployment

1. Build the application:
```bash
npm run build:prod
```

2. Upload the `dist/` folder to your web server

3. Configure your web server to serve the SPA correctly (handle client-side routing)

### Environment Variables for Production

Create a `.env.production` file:

```env
VITE_API_BASE_URL=https://api.fitspaceforge.com
VITE_APP_NAME=Fit Space Forge Admin
VITE_APP_VERSION=1.0.0
```

### Security Considerations

- **HTTPS Only**: Always use HTTPS in production
- **CORS Configuration**: Configure API CORS for your domain
- **Authentication**: Secure JWT token storage
- **CSP Headers**: Set Content Security Policy headers
- **Rate Limiting**: API rate limiting is handled by the backend

### Performance Optimizations

- Code splitting for reduced bundle size
- Image optimization
- Service worker for caching (optional)
- CDN for static assets
- Gzip compression enabled

## API Requirements

### Backend API Must Support:

1. **Admin Authentication**: JWT-based authentication with admin role verification
2. **CORS**: Properly configured for your domain
3. **Rate Limiting**: Protection against abuse
4. **Error Handling**: Consistent error response format
5. **Pagination**: For large datasets
6. **Filtering**: Search and filter capabilities

### Expected API Response Format:

```json
{
  "data": { ... },
  "message": "Success message",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Security Features

- JWT token-based authentication
- Role-based access control (ADMIN only)
- Protected routes with authentication middleware
- Secure token storage in localStorage
- Auto-logout on token expiration
- Error boundaries for graceful error handling
- Security headers via nginx configuration

## Monitoring and Analytics

### Error Tracking

The app includes error boundaries for graceful error handling. In production, consider integrating:

- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for usage analytics

### Performance Monitoring

- Web Vitals tracking
- API response time monitoring
- Bundle size monitoring

## Support

For issues and questions:

1. Check the API documentation
2. Verify environment variables
3. Check browser console for errors
4. Ensure API is running and accessible

## License

This project is proprietary software for Fit Space Forge.

## Changelog

### v1.0.0
- Initial release with complete admin functionality
- Dashboard with key metrics
- Order and payment management
- User and product management
- Analytics and reporting
- Mobile-responsive design
- Production-ready deployment
