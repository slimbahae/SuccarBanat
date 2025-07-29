import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Users, 
  Package, 
  Calendar, 
  TrendingUp, 
  Euro,
  ShoppingBag,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Sparkles,
  UserCheck,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Trash2,
  Eye,
  Download,
  CreditCard,
  Gift
} from 'lucide-react';
import { Menu, Transition} from '@headlessui/react';
import { Fragment } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI, ordersAPI, productsAPI } from '../../services/api';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const euroFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

const AdminDashboard = () => {
  const { user } = useAuth();
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // Fetch admin dashboard data
  const { data: usersData } = useQuery('admin-users', usersAPI.getAll);
  const { data: ordersData } = useQuery('admin-orders', ordersAPI.getAllOrders);
  const { data: productsData } = useQuery('admin-products', productsAPI.getAllAdmin);

  // Recent orders (last 5)
  const recentOrders = ordersData?.data?.slice(0, 3) || [];

  // Calculate real statistics with trends
  const calculateStats = () => {
    const orders = ordersData?.data || [];
    const users = usersData?.data || [];
    const products = productsData?.data || [];
    
    // Calculate current month data
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const currentMonthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });
    
    const lastMonthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
    });
    
    const currentMonthUsers = users.filter(user => {
      const userDate = new Date(user.createdAt);
      return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
    });
    
    const lastMonthUsers = users.filter(user => {
      const userDate = new Date(user.createdAt);
      return userDate.getMonth() === lastMonth && userDate.getFullYear() === lastMonthYear;
    });
    
    // Calculate revenue
    const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Calculate percentage changes
    const ordersChange = lastMonthOrders.length === 0 ? 100 : 
      ((currentMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length * 100);
    const usersChange = lastMonthUsers.length === 0 ? 100 : 
      ((currentMonthUsers.length - lastMonthUsers.length) / lastMonthUsers.length * 100);
    const revenueChange = lastMonthRevenue === 0 ? 100 : 
      ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100);
    
    const customers = users.filter(user => user.role === 'CUSTOMER');
    const currentMonthCustomers = currentMonthUsers.filter(user => user.role === 'CUSTOMER');
    const lastMonthCustomers = lastMonthUsers.filter(user => user.role === 'CUSTOMER');
    const customersChange = lastMonthCustomers.length === 0 ? 100 : 
      ((currentMonthCustomers.length - lastMonthCustomers.length) / lastMonthCustomers.length * 100);
    
    return [
      {
        label: 'Total Utilisateurs',
        value: users.length,
        icon: Users,
        color: 'bg-blue-500',
        change: `${usersChange >= 0 ? '+' : ''}${usersChange.toFixed(1)}%`,
        trend: usersChange >= 0 ? 'up' : 'down',
        link: '/admin/users'
      },
      {
        label: 'Total Commandes',
        value: orders.length,
        icon: ShoppingBag,
        color: 'bg-green-500',
        change: `${ordersChange >= 0 ? '+' : ''}${ordersChange.toFixed(1)}%`,
        trend: ordersChange >= 0 ? 'up' : 'down',
        link: '/admin/orders'
      },
      {
        label: 'Revenu',
        value: euroFormatter.format(totalRevenue),
        icon: Euro,
        color: 'bg-yellow-500',
        change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
        trend: revenueChange >= 0 ? 'up' : 'down',
        link: '/admin/orders'
      },
      {
        label: 'Produits',
        value: products.length,
        icon: Package,
        color: 'bg-purple-500',
        change: products.length > 0 ? '+0.0%' : '0.0%',
        trend: 'neutral',
        link: '/admin/products'
      },
      {
        label: 'Clients',
        value: customers.length,
        icon: UserCheck,
        color: 'bg-orange-500',
        change: `${customersChange >= 0 ? '+' : ''}${customersChange.toFixed(1)}%`,
        trend: customersChange >= 0 ? 'up' : 'down',
        link: '/admin/users?filter=customers'
      }
    ];
  };

  const stats = calculateStats();

  // Sorting function
  const sortedOrders = useMemo(() => {
    if (!ordersData?.data) return [];
    
    const sorted = [...ordersData.data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === bValue) return 0;
      
      if (sortConfig.key === 'createdAt') {
        const comparison = new Date(aValue) - new Date(bValue);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }
      
      if (sortConfig.key === 'total') {
        const comparison = parseFloat(aValue) - parseFloat(bValue);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }
      
      // String comparison for other fields
      const comparison = String(aValue).localeCompare(String(bValue));
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
    
    return sorted.slice(0, 10); // Show first 10 orders
  }, [ordersData?.data, sortConfig]);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle row selection
  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(orderId)) {
        newSelected.delete(orderId);
      } else {
        newSelected.add(orderId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === sortedOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(sortedOrders.map(order => order.id)));
    }
  };

  // Bulk actions
  const handleBulkAction = (action) => {
    if (selectedOrders.size === 0) {
      toast.error('Veuillez sélectionner des commandes d\'abord');
      return;
    }

    switch (action) {
      case 'export':
        toast.success(`Exportation de ${selectedOrders.size} commandes...`);
        break;
      case 'delete':
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedOrders.size} commandes ?`)) {
          toast.success(`Supprimées ${selectedOrders.size} commandes`);
          setSelectedOrders(new Set());
        }
        break;
      default:
        break;
    }
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-blue-600" />
      : <ChevronDown className="h-4 w-4 text-blue-600" />;
  };

  // Quick actions
  const quickActions = [
    {
      title: 'Gérer les produits',
      description: 'Ajouter, modifier ou supprimer des produits',
      icon: Package,
      link: '/admin/products',
      color: 'bg-blue-500'
    },
    {
      title: 'Gérer les utilisateurs',
      description: 'Voir et gérer les comptes utilisateur',
      icon: UserCheck,
      link: '/admin/users',
      color: 'bg-green-500'
    },
    {
      title: 'Voir les rapports',
      description: 'Analyses et insights commerciaux',
      icon: TrendingUp,
      link: '/admin/reports',
      color: 'bg-orange-500'
    }
  ];

  const giftCardAdminLinks = [
    {
      label: 'Vérifier une carte cadeau',
      to: '/admin/gift-cards/verifier',
    },
    {
      label: 'Marquer une carte de service comme utilisée',
      to: '/admin/gift-cards/marquer-utilisee',
    },
    {
      label: 'Expirer les cartes cadeaux',
      to: '/admin/gift-cards/expirer',
    },
    {
      label: 'Trouver par PaymentIntent',
      to: '/admin/gift-cards/par-payment-intent',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'SHIPPED':
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSING':
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'credit_card':
      case 'credit card':
        return <CreditCard className="h-4 w-4" />;
      case 'paypal':
        return <div className="h-4 w-4 bg-blue-600 rounded text-white text-xs flex items-center justify-center">P</div>;
      case 'stripe':
        return <div className="h-4 w-4 bg-purple-600 rounded text-white text-xs flex items-center justify-center">S</div>;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenue à nouveau, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Découvrez les nouveautés et activités du jour chez Succar Banat
          </p>
        </div>

        <div className="flex items-center space-x-4 mt-4 mb-8">
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                <Gift className="h-5 w-5 mr-2 text-pink-500" />
                Gestion des cartes cadeaux
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="origin-top-left absolute left-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1">
                  {giftCardAdminLinks.map((item, idx) => (
                    <Menu.Item key={idx}>
                      {({ active }) => (
                        <Link
                          to={item.to}
                          className={`block px-4 py-2 text-sm ${active ? 'bg-pink-100 text-pink-900' : 'text-gray-700'}`}
                        >
                          {item.label}
                        </Link>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Link
              key={index}
              to={stat.link}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    ) : stat.trend === 'down' ? (
                      <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                    ) : (
                      <div className="h-4 w-4 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 
                      stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions rapides 
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
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-3">
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Commandes récentes 
                </h3>
                <Link to="/admin/orders">
                  <Button variant="outline" size="sm">
                    Voir tout
                  </Button>
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-6">
                  <ShoppingBag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Aucune commande récente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <ShoppingBag className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">Commande #{order.id.slice(-8)}</p>
                          <p className="text-sm text-gray-600">
                            {order.customerName} • {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{euroFormatter.format(order.total)}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.orderStatus)}`}>
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

        {/* Summary Cards - Additional Metrics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Commandes en attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {ordersData?.data?.filter(order => order.orderStatus === 'PENDING').length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-amber-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Valeur moyenne des commandes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {euroFormatter.format(
                    ordersData?.data?.length > 0 ? 
                      (ordersData.data.reduce((sum, order) => sum + (order.total || 0), 0) / ordersData.data.length) : 
                      0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-emerald-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Revenu mensuel</p>
                <p className="text-2xl font-bold text-gray-900">
                  {euroFormatter.format(
                    ordersData?.data?.filter(order => {
                      const orderDate = new Date(order.createdAt);
                      const now = new Date();
                      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
                    }).reduce((sum, order) => sum + (order.total || 0), 0)
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Produits à faible stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {productsData?.data?.filter(product => product.stockQuantity && product.stockQuantity <= 5).length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;