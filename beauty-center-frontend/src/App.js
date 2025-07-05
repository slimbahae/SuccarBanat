import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useTranslation } from 'react-i18next';

// Layout components
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Public pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmailNotice from './pages/auth/VerifyEmailNotice';
import EmailVerificationResult from './pages/auth/EmailVerificationResult';

// Customer pages
import CustomerDashboard from './pages/customer/Dashboard';
import OrderConfirmation from './pages/customer/OrderConfirmation';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminServices from './pages/admin/Services';
import AdminUsers from './pages/admin/Users';
import AdminOrders from './pages/admin/Orders';
import AdminReservations from './pages/admin/Reservations';

//Staff pages

// Placeholder pages
import {
  Cart,
  Checkout,
  CustomerOrders,
  BookService
} from './components/PlaceholderPages';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (redirect authenticated users)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Dashboard Route Component (redirect to appropriate dashboard)
const DashboardRoute = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'STAFF':
      return <Navigate to="/customer/dashboard" replace />;
    case 'CUSTOMER':
      return <Navigate to="/customer/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

function AppContent() {
  const { t } = useTranslation();
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          <Route 
            path="/reset-password" 
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } 
          />
          <Route 
            path="/verify-email" 
            element={<VerifyEmailNotice />} 
          />
          <Route 
            path="/verify-email/result" 
            element={<EmailVerificationResult />} 
          />

          {/* Dashboard Redirect */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardRoute />
              </ProtectedRoute>
            } 
          />

          {/* Customer Routes */}
          <Route 
            path="/customer/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer/order-confirmation/:orderId" 
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <OrderConfirmation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer/cart" 
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <Cart />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer/checkout" 
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <Checkout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer/orders" 
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerOrders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer/orders/:orderId" 
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerOrders />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/products" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminProducts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminUsers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/orders" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminOrders />
              </ProtectedRoute>
            } 
          />


          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  const { t } = useTranslation();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
              },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;