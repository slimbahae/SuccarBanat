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
  Heart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cartAPI, ordersAPI, reservationsAPI } from '../../services/api';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const CustomerDashboard = () => {
  const { user } = useAuth();

  // Fetch user's data
  const { data: cartData } = useQuery('cart', cartAPI.get);
  const { data: ordersData } = useQuery('customer-orders', ordersAPI.getCustomerOrders);
  const { data: reservationsData } = useQuery('customer-reservations', reservationsAPI.getCustomerReservations);

  const stats = [
    {
      label: 'Cart Items',
      value: cartData?.data?.itemCount || 0,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      link: '/customer/cart'
    },
    {
      label: 'Total Orders',
      value: ordersData?.data?.length || 0,
      icon: Package,
      color: 'bg-green-500',
      link: '/customer/orders'
    },
    {
      label: 'Reservations',
      value: reservationsData?.data?.length || 0,
      icon: Calendar,
      color: 'bg-purple-500',
      link: '/customer/reservations'
    },
    {
      label: 'Loyalty Points',
      value: '1,250',
      icon: Star,
      color: 'bg-yellow-500',
      link: '#'
    }
  ];

  // Get recent orders (last 3)
  const recentOrders = ordersData?.data?.slice(0, 3) || [];

  // Get upcoming reservations (next 3)
  const upcomingReservations = reservationsData?.data
    ?.filter(reservation => new Date(reservation.reservationDate) >= new Date())
    ?.slice(0, 3) || [];

  const quickActions = [
    {
      title: 'Book a Service',
      description: 'Schedule your next beauty appointment',
      icon: Calendar,
      link: '/services',
      color: 'bg-primary-500'
    },
    {
      title: 'Shop Products',
      description: 'Browse our premium beauty products',
      icon: ShoppingBag,
      link: '/products',
      color: 'bg-pink-500'
    },
    {
      title: 'View Cart',
      description: 'Complete your purchase',
      icon: Package,
      link: '/customer/cart',
      color: 'bg-blue-500'
    },
    {
      title: 'My Profile',
      description: 'Update your personal information',
      icon: User,
      link: '/customer/profile',
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your beauty journey
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

            {/* Loyalty Program */}
            <div className="mt-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-sm p-6 text-white">
              <div className="flex items-center mb-4">
                <Heart className="h-6 w-6 mr-2" />
                <h3 className="text-lg font-semibold">Loyalty Program</h3>
              </div>
              <p className="text-primary-100 mb-4">
                You have 1,250 points! You're 250 points away from your next reward.
              </p>
              <div className="bg-white/20 rounded-full h-2 mb-4">
                <div className="bg-white rounded-full h-2" style={{ width: '83%' }}></div>
              </div>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary-600"
                size="sm"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Recent Orders & Upcoming Reservations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Reservations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Upcoming Reservations
                </h3>
                <Link to="/customer/reservations">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              {upcomingReservations.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-4">No upcoming reservations</p>
                  <Link to="/services">
                    <Button size="sm">
                      Book a Service
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingReservations.map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-primary-100 p-2 rounded-lg">
                          <Calendar className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{reservation.serviceName}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(reservation.reservationDate).toLocaleDateString()} • {reservation.timeSlot}
                          </p>
                          <p className="text-sm text-gray-600">with {reservation.staffName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${reservation.totalAmount}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          reservation.status === 'CONFIRMED' 
                            ? 'bg-green-100 text-green-800'
                            : reservation.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {reservation.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Orders
                </h3>
                <Link to="/customer/orders">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-6">
                  <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-4">No recent orders</p>
                  <Link to="/products">
                    <Button size="sm">
                      Shop Products
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
                            {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${order.total}</p>
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
    </div>
  );
};

export default CustomerDashboard;