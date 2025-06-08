import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Users, 
  Package, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  ShoppingBag,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Sparkles,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI, ordersAPI, reservationsAPI, productsAPI, servicesAPI } from '../../services/api';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const AdminDashboard = () => {
  const { user } = useAuth();

  // Fetch admin dashboard data
  const { data: usersData } = useQuery('admin-users', usersAPI.getAll);
  const { data: ordersData } = useQuery('admin-orders', ordersAPI.getAllOrders);
  const { data: reservationsData } = useQuery('admin-reservations', reservationsAPI.getAllReservations);
  const { data: productsData } = useQuery('admin-products', productsAPI.getAllAdmin);
  const { data: servicesData } = useQuery('admin-services', servicesAPI.getAllAdmin);

  // Calculate statistics
  const stats = [
    {
      label: 'Total Users',
      value: usersData?.data?.length || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      trend: 'up',
      link: '/admin/users'
    },
    {
      label: 'Total Orders',
      value: ordersData?.data?.length || 0,
      icon: ShoppingBag,
      color: 'bg-green-500',
      change: '+8%',
      trend: 'up',
      link: '/admin/orders'
    },
    {
      label: 'Total Reservations',
      value: reservationsData?.data?.length || 0,
      icon: Calendar,
      color: 'bg-purple-500',
      change: '+15%',
      trend: 'up',
      link: '/admin/reservations'
    },
    {
      label: 'Revenue',
      value: `$${(ordersData?.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0).toFixed(0)}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+23%',
      trend: 'up',
      link: '/admin/orders'
    }
  ];

  // Recent orders (last 5)
  const recentOrders = ordersData?.data?.slice(0, 5) || [];

  // Recent reservations (last 5)
  const recentReservations = reservationsData?.data?.slice(0, 5) || [];

  // Quick actions
  const quickActions = [
    {
      title: 'Manage Products',
      description: 'Add, edit, or remove products',
      icon: Package,
      link: '/admin/products',
      color: 'bg-blue-500'
    },
    {
      title: 'Manage Services',
      description: 'Manage beauty services and pricing',
      icon: Sparkles,
      link: '/admin/services',
      color: 'bg-purple-500'
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: UserCheck,
      link: '/admin/users',
      color: 'bg-green-500'
    },
    {
      title: 'View Reports',
      description: 'Analytics and business insights',
      icon: TrendingUp,
      link: '/admin/reports',
      color: 'bg-orange-500'
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening at Beauty Center today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">from last month</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
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

            {/* System Status */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="flex items-center text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email Service</span>
                  <span className="flex items-center text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">SMS Service</span>
                  <span className="flex items-center text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Storage</span>
                  <span className="flex items-center text-sm text-yellow-600">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    75% Used
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Orders
                </h3>
                <Link to="/admin/orders">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-6">
                  <ShoppingBag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No recent orders</p>
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
                          <p className="font-medium text-gray-900">Order #{order.id.slice(-8)}</p>
                          <p className="text-sm text-gray-600">
                            {order.customerName} • {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${order.total}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Reservations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Reservations
                </h3>
                <Link to="/admin/reservations">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              {recentReservations.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No recent reservations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentReservations.map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{reservation.serviceName}</p>
                          <p className="text-sm text-gray-600">
                            {reservation.customerName} • {new Date(reservation.reservationDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            with {reservation.staffName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${reservation.totalAmount}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                          {reservation.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-2xl font-bold text-gray-900">{productsData?.data?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Services</p>
                <p className="text-2xl font-bold text-gray-900">{servicesData?.data?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Staff Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {usersData?.data?.filter(user => user.role === 'STAFF').length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {usersData?.data?.filter(user => user.role === 'CUSTOMER').length || 0}
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