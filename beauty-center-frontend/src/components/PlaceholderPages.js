import React from 'react';
import { Link } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';
import Button from './UI/Button';

// Import the actual components
import Cart from '../pages/customer/Cart';
import Checkout from '../pages/customer/Checkout';
import CustomerOrders from '../pages/customer/Orders';
import BookService from '../pages/customer/BookService';

// Export the real components
export { Cart, Checkout, CustomerOrders, BookService};

// Generic placeholder component for remaining pages
const PlaceholderPage = ({ title, description, backLink = "/" }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="max-w-md w-full text-center">
      <Construction className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600 mb-6">{description}</p>
      <Link to={backLink}>
        <Button>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </Link>
    </div>
  </div>
);

// Admin Pages (Still placeholders)
export const AdminDashboard = () => (
  <PlaceholderPage 
    title="Admin Dashboard" 
    description="Administrative control panel and analytics."
    backLink="/"
  />
);

export const AdminProducts = () => (
  <PlaceholderPage 
    title="Manage Products" 
    description="Product management interface for administrators."
    backLink="/admin/dashboard"
  />
);

export const AdminServices = () => (
  <PlaceholderPage 
    title="Manage Services" 
    description="Service management interface for administrators."
    backLink="/admin/dashboard"
  />
);

export const AdminUsers = () => (
  <PlaceholderPage 
    title="Manage Users" 
    description="User management interface for administrators."
    backLink="/admin/dashboard"
  />
);

export const AdminOrders = () => (
  <PlaceholderPage 
    title="Manage Orders" 
    description="Order management and fulfillment interface."
    backLink="/admin/dashboard"
  />
);

export const AdminReservations = () => (
  <PlaceholderPage 
    title="Manage Reservations" 
    description="Reservation management interface for administrators."
    backLink="/admin/dashboard"
  />
);

