import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  X, 
  Eye,
  Search,
  Filter,
  Download,
  ArrowLeft,
  Star,
  MessageCircle,
  RefreshCw,
  AlertCircle,
  Copy,
  Share2,
  MapPin,
  CreditCard
} from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const Orders = () => {
  const { user } = useAuth();
  const { orderId } = useParams();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch customer orders
  const { data: ordersData, isLoading, error } = useQuery(
    'customer-orders',
    ordersAPI.getCustomerOrders
  );

  // Fetch specific order if orderId is provided
  const { data: specificOrder, isLoading: orderLoading } = useQuery(
    ['order', orderId],
    () => ordersAPI.getById(orderId),
    {
      enabled: !!orderId
    }
  );

  const orders = ordersData?.data || [];

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'ALL' || order.orderStatus === statusFilter;
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => 
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesStatus && matchesSearch;
  });

  const copyOrderNumber = (orderNumber) => {
    navigator.clipboard.writeText(orderNumber);
    toast.success('Order number copied to clipboard');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4" />;
      case 'SHIPPED':
        return <Truck className="h-4 w-4" />;
      case 'PROCESSING':
        return <Clock className="h-4 w-4" />;
      case 'CANCELLED':
        return <X className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getEstimatedDelivery = (order) => {
    if (order.orderStatus === 'DELIVERED') return 'Delivered';
    
    const orderDate = new Date(order.createdAt);
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(orderDate.getDate() + 5); // 5 business days
    
    return `Est. ${estimatedDate.toLocaleDateString()}`;
  };

  // If viewing specific order
  if (orderId) {
    if (orderLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="large" />
        </div>
      );
    }

    const order = specificOrder?.data;
    if (!order) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
            <Link to="/customer/orders">
              <Button>Back to Orders</Button>
            </Link>
          </div>
        </div>
      );
    }

    const trackingSteps = [
      {
        id: 'confirmed',
        name: 'Order Confirmed',
        description: 'Your order has been placed successfully',
        completed: true,
        current: order.orderStatus === 'PENDING',
        icon: CheckCircle
      },
      {
        id: 'processing',
        name: 'Processing',
        description: 'We are preparing your items',
        completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.orderStatus),
        current: order.orderStatus === 'PROCESSING',
        icon: Package
      },
      {
        id: 'shipped',
        name: 'Shipped',
        description: 'Your package is on its way',
        completed: ['SHIPPED', 'DELIVERED'].includes(order.orderStatus),
        current: order.orderStatus === 'SHIPPED',
        icon: Truck
      },
      {
        id: 'delivered',
        name: 'Delivered',
        description: 'Package delivered successfully',
        completed: order.orderStatus === 'DELIVERED',
        current: false,
        icon: CheckCircle
      }
    ];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/customer/orders" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Orders
          </Link>

          {/* Order Header */}
          <div className="bg-white shadow-sm rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    Order #{order.id.slice(-8)}
                    <button 
                      onClick={() => copyOrderNumber(order.id)}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                    {getStatusIcon(order.orderStatus)}
                    <span className="ml-1">{order.orderStatus}</span>
                  </span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Invoice
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status Tracking */}
            {order.orderStatus !== 'CANCELLED' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Order Tracking</h3>
                <div className="space-y-6">
                  {trackingSteps.map((step, stepIdx) => (
                    <div key={step.id} className="relative flex items-start">
                      {stepIdx !== trackingSteps.length - 1 && (
                        <div 
                          className={`absolute top-8 left-4 w-0.5 h-16 ${
                            step.completed ? 'bg-green-500' : 'bg-gray-200'
                          }`} 
                        />
                      )}
                      <div className={`relative flex items-center justify-center w-8 h-8 rounded-full ${
                        step.completed ? 'bg-green-500' : step.current ? 'bg-primary-500' : 'bg-gray-200'
                      }`}>
                        <step.icon className={`h-4 w-4 ${
                          step.completed || step.current ? 'text-white' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="ml-4">
                        <h4 className={`text-sm font-medium ${
                          step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.name}
                        </h4>
                        <p className="text-sm text-gray-500">{step.description}</p>
                        {step.current && (
                          <p className="text-xs text-primary-600 mt-1">Current status</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {order.orderStatus === 'SHIPPED' && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Truck className="h-5 w-5 text-blue-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Estimated Delivery: {getEstimatedDelivery(order)}
                        </p>
                        <p className="text-sm text-blue-700">
                          Your package is on its way! Track your shipment for real-time updates.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Order Items ({order.items.length})
                </h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{item.productName}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Qty: {item.quantity}</span>
                          <span>${item.unitPrice.toFixed(2)} each</span>
                        </div>
                        {order.orderStatus === 'DELIVERED' && (
                          <div className="mt-2 flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Star className="h-4 w-4 mr-1" />
                              Rate Product
                            </Button>
                            <Button size="sm" variant="outline">
                              Buy Again
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${item.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-3">
                    {order.orderStatus === 'DELIVERED' && (
                      <>
                        <Button size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reorder
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Leave Review
                        </Button>
                        <Button variant="outline" size="sm">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Report Issue
                        </Button>
                      </>
                    )}
                    {order.orderStatus === 'PROCESSING' && (
                      <Button variant="outline" size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Cancel Order
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary & Details */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      {order.shippingCost === 0 ? 'Free' : `${order.shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-primary-600">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipping Address
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && (
                    <p>{order.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  <p className="pt-2">{order.shippingAddress.phoneNumber}</p>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={`font-medium ${
                      order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium text-gray-900">TXN-{order.id.slice(-8)}</span>
                  </div>
                </div>
              </div>

              {/* Customer Support */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
                <p className="text-sm text-blue-800 mb-4">
                  Our customer support team is here to help with any questions about your order.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full border-blue-200 text-blue-800 hover:bg-blue-100">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Live Chat
                  </Button>
                  <Button variant="outline" size="sm" className="w-full border-blue-200 text-blue-800 hover:bg-blue-100">
                    Call (555) 123-4567
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main orders list view
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to load orders</h2>
          <p className="text-gray-600 mb-4">Please try again later.</p>
          <Link to="/customer/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/customer/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="ALL">All Orders</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <p className="text-sm text-gray-600">
              {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {orders.length === 0 
                ? "You haven't placed any orders yet." 
                : "No orders match your current filters."}
            </p>
            <Link to="/products">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white shadow-sm rounded-lg hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        Order #{order.id.slice(-8)}
                        <button 
                          onClick={() => copyOrderNumber(order.id)}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString()} • 
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="ml-1">{order.orderStatus}</span>
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="w-10 h-10 border-2 border-white rounded-md overflow-hidden">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-full h-full object-center object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100" />
                          )}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-10 h-10 border-2 border-white rounded-md bg-gray-100 flex items-center justify-center">
                          <span className="text-xs text-gray-600">+{order.items.length - 3}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <Link to={`/customer/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      {order.orderStatus === 'DELIVERED' && (
                        <Button size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reorder
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Quick Status Info */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{getEstimatedDelivery(order)}</span>
                      {order.orderStatus === 'SHIPPED' && (
                        <span className="text-blue-600 font-medium">Track Package</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;