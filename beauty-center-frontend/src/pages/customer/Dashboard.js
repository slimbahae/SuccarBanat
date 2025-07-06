import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Calendar, 
  ShoppingBag, 
  Clock, 
  Star, 
  Package, 
  User,
  TrendingUp,
  Heart,
  ArrowRight,
  CreditCard,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cartAPI, ordersAPI } from '../../services/api';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import BalanceDisplay from '../../components/BalanceDisplay';
import { useTranslation } from 'react-i18next';

const euroFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Fetch user's data
  const { data: cartData } = useQuery('cart', cartAPI.get);
  const { data: ordersData } = useQuery('customer-orders', ordersAPI.getCustomerOrders);

  const stats = [
    {
      label: 'Articles du panier',
      value: cartData?.data?.itemCount || 0,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      link: '/customer/cart'
    },
    {
      label: 'Total de commande',
      value: ordersData?.data?.length || 0,
      icon: Package,
      color: 'bg-green-500',
      link: '/customer/orders'
    }
  ];

  // Get recent orders (last 3)
  const recentOrders = ordersData?.data?.slice(0, 3) || [];

  const quickActions = [
    {
      title: 'Explorer la boutique',
      description: 'Découvrez nos produits de beauté premium',
      icon: ShoppingBag,
      link: '/products',
      color: 'bg-pink-500'
    },
    {
      title: 'Voir le panier',
      description: 'Finalisez votre achat',
      icon: Package,
      link: '/customer/cart',
      color: 'bg-blue-500'
    },
    {
      title: 'Mon Profil',
      description: 'Mettre à jour vos informations personnelles',
      icon: User,
      link: '/customer/profile',
      color: 'bg-gray-500'
    },
    // Gift card actions
    {
      title: 'Acheter une carte cadeau',
      description: 'Offrir une carte à un proche',
      icon: CreditCard,
      link: '/customer/giftcard-purchase',
      color: 'bg-green-500'
    },
    {
      title: 'Utiliser une carte cadeau',
      description: 'Ajouter le montant à votre solde',
      icon: TrendingUp,
      link: '/customer/giftcard-redeem',
      color: 'bg-yellow-500'
    },
    {
      title: 'Cartes cadeaux achetées',
      description: 'Voir vos achats de cartes cadeaux',
      icon: Heart,
      link: '/customer/giftcards-purchased',
      color: 'bg-purple-500'
    },
    {
      title: 'Cartes cadeaux reçues',
      description: 'Voir les cartes reçues',
      icon: Star,
      link: '/customer/giftcards-received',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('welcomeHeader')} {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            {t('welcomeDescription')}
          </p>
        </div>

        {/* Balance Display */}
        <div className="mb-8">
          <BalanceDisplay />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Link
              key={index}
              to={stat.link}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('quickActionsTitle')}
            </h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className={`${action.color} p-2 rounded-lg`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('recentOrdersTitle')}
              </h3>
              <Link to="/customer/orders">
                <Button variant="outline" size="sm">
                  {t('viewAllOrders')}
                </Button>
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-6">
                <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-4">{t('noRecentOrders')}</p>
                <Link to="/products">
                  <Button size="sm">
                    {t('viewProducts')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">Order #{order.id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} articles
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{euroFormatter.format(order.total)}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.orderStatus === 'DELIVERED' 
                          ? 'bg-green-100 text-green-800'
                          : order.orderStatus === 'SHIPPED'
                          ? 'bg-blue-100 text-blue-800'
                          : order.orderStatus === 'PROCESSING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;