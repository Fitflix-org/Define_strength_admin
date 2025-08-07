# Admin Dashboard

Simple admin dashboard for Fit Space Forge with strong security.

## Features

- **Authentication**: Admin-only access with JWT tokens
- **Dashboard Overview**: Revenue metrics and recent payments
- **Orders Management**: View and track all customer orders
- **Payments Tracking**: Monitor payment transactions and revenue
- **Responsive Design**: Clean Tailwind CSS interface

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Admin Access

- Only users with `ADMIN` role can access the dashboard
- Admin users must authenticate through the login page
- Backend API runs on `http://localhost:3001`

## API Endpoints Used

- `POST /auth/login` - Admin authentication
- `GET /admin/dashboard` - Dashboard statistics
- `GET /admin/orders` - Orders data
- `GET /admin/payments` - Payments data
- `GET /admin/profile` - Admin profile verification

## Security Features

- JWT token-based authentication
- Role-based access control (ADMIN only)
- Protected routes with authentication middleware
- Secure token storage in localStorage
- Auto-logout on token expiration

## Tech Stack

- React 18 with TypeScript
- Vite for development and building
- React Query for data fetching
- React Router for navigation
- Tailwind CSS for styling
- Axios for HTTP requests
- Lucide React for icons
