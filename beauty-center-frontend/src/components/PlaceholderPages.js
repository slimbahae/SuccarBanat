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
          Retour
        </Button>
      </Link>
    </div>
  </div>
);

// Admin Pages (Still placeholders)
export const AdminDashboard = () => (
  <PlaceholderPage 
    title="Admin Dashboard" 
    description="Panneau de contrôle administratif et analyses."
    backLink="/"
  />
);

export const AdminProducts = () => (
  <PlaceholderPage 
    title="Manage Products" 
    description="Interface de gestion des produits pour les administrateurs."
    backLink="/admin/dashboard"
  />
);

export const AdminServices = () => (
  <PlaceholderPage 
    title="Manage Services" 
    description="Interface de gestion des services pour les administrateurs."
    backLink="/admin/dashboard"
  />
);

export const AdminUsers = () => (
  <PlaceholderPage 
    title="Manage Users" 
    description="Interface de gestion des utilisateurs pour les administrateurs."
    backLink="/admin/dashboard"
  />
);

export const AdminOrders = () => (
  <PlaceholderPage 
    title="Manage Orders" 
    description="Interface de gestion et de traitement des commandes."
    backLink="/admin/dashboard"
  />
);

export const AdminReservations = () => (
  <PlaceholderPage 
    title="Manage Reservations" 
    description="Interface de gestion des réservations pour les administrateurs."
    backLink="/admin/dashboard"
  />
);

