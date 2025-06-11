import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Search, 
  Filter, 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Sparkles,
  CheckCircle,
  X,
  AlertCircle,
  TrendingUp,
  Users,
  Eye,
  MessageCircle
} from 'lucide-react';
import { reservationsAPI } from '../../services/api';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminReservations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch reservations
  const { data: reservationsData, isLoading, error } = useQuery(
    'admin-reservations',
    reservationsAPI.getAllReservations
  );

  // Update reservation status mutation
  const updateStatusMutation = useMutation(
    ({ id, status }) => reservationsAPI.updateStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-reservations');
        toast.success('Reservation status updated successfully');
        setShowReservationModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update reservation status');
      },
    }
  );

  const reservations = reservationsData?.data || [];

  // Filter reservations
  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = searchTerm === '' || 
      reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || reservation.status === statusFilter;
    
    const matchesDate = dateFilter === '' || 
      (dateFilter === 'today' && isToday(new Date(reservation.reservationDate))) ||
      (dateFilter === 'tomorrow' && isTomorrow(new Date(reservation.reservationDate))) ||
      (dateFilter === 'week' && isThisWeek(new Date(reservation.reservationDate))) ||
      (dateFilter === 'month' && isThisMonth(new Date(reservation.reservationDate)));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Helper functions for date filtering
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isTomorrow = (date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  };

  const isThisWeek = (date) => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return date >= startOfWeek && date <= endOfWeek;
  };

  const isThisMonth = (date) => {
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  // Calculate statistics
  const todayReservations = reservations.filter(r => isToday(new Date(r.reservationDate)));
  const upcomingReservations = reservations.filter(r => new Date(r.reservationDate) > new Date());
  const totalRevenue = reservations
    .filter(r => r.status === 'COMPLETED')
    .reduce((sum, r) => sum + (r.totalAmount || 0), 0);

  const stats = [
    {
      label: 'Total Reservations',
      value: reservations.length,
      icon: Calendar,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      label: 'Today\'s Appointments',
      value: todayReservations.length,
      icon: Clock,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      label: 'Upcoming',
      value: upcomingReservations.length,
      icon: Users,
      color: 'bg-purple-500',
      change: '+15%'
    },
    {
      label: 'Service Revenue',
      value: `${totalRevenue.toFixed(0)}`,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      change: '+23%'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleViewReservation = (reservation) => {
    setSelectedReservation(reservation);
    setShowReservationModal(true);
  };

  const handleStatusUpdate = (reservationId, newStatus) => {
    updateStatusMutation.mutate({ id: reservationId, status: newStatus });
  };

  const isUpcoming = (date) => {
    return new Date(date) >= new Date();
  };

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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to load reservations</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reservation Management</h1>
              <p className="text-gray-600">Monitor and manage service appointments</p>
            </div>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reservations..."
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
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Dates</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            
            <p className="text-sm text-gray-600">
              {filteredReservations.length} reservation{filteredReservations.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Reservations Table */}
        {filteredReservations.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
            <p className="text-gray-600">
              {reservations.length === 0 
                ? "No reservations have been made yet." 
                : "No reservations match your current filters."}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <Sparkles className="h-5 w-5 text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {reservation.serviceName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: #{reservation.id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">
                            {reservation.customerName}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{reservation.staffName}</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(reservation.reservationDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {reservation.timeSlot.toLowerCase()} session
                        </div>
                        {isUpcoming(reservation.reservationDate) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                            Upcoming
                          </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ${reservation.totalAmount.toFixed(2)}
                        </div>
                        {reservation.addons && reservation.addons.length > 0 && (
                          <div className="text-xs text-gray-500">
                            +{reservation.addons.length} addon{reservation.addons.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                          {getStatusIcon(reservation.status)}
                          <span className="ml-1">{reservation.status}</span>
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewReservation(reservation)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {reservation.status === 'CONFIRMED' && isUpcoming(reservation.reservationDate) && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(reservation.id, 'COMPLETED')}
                              loading={updateStatusMutation.isLoading}
                            >
                              Complete
                            </Button>
                          )}
                          
                          {reservation.status !== 'COMPLETED' && reservation.status !== 'CANCELLED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(reservation.id, 'CANCELLED')}
                              loading={updateStatusMutation.isLoading}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Reservation Detail Modal */}
      {showReservationModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Reservation Details
                </h2>
                <p className="text-sm text-gray-600">
                  #{selectedReservation.id.slice(-8)}
                </p>
              </div>
              <button
                onClick={() => setShowReservationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Actions */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Status</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedReservation.status)}`}>
                    {getStatusIcon(selectedReservation.status)}
                    <span className="ml-1">{selectedReservation.status}</span>
                  </span>
                </div>
                
                {selectedReservation.status !== 'COMPLETED' && selectedReservation.status !== 'CANCELLED' && (
                  <div className="flex space-x-2">
                    {selectedReservation.status === 'CONFIRMED' && isUpcoming(selectedReservation.reservationDate) && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(selectedReservation.id, 'COMPLETED')}
                        loading={updateStatusMutation.isLoading}
                      >
                        Mark Completed
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(selectedReservation.id, 'CANCELLED')}
                      loading={updateStatusMutation.isLoading}
                    >
                      Cancel Reservation
                    </Button>
                  </div>
                )}
              </div>

              {/* Reservation Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Service Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center">
                      <Sparkles className="h-5 w-5 text-primary-600 mr-2" />
                      <span className="font-medium">{selectedReservation.serviceName}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{new Date(selectedReservation.reservationDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="capitalize">{selectedReservation.timeSlot.toLowerCase()} Session</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <span>with {selectedReservation.staffName}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="font-medium">{selectedReservation.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Booked on: {new Date(selectedReservation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedReservation.notes && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Special Requests:</p>
                        <p className="text-sm text-gray-600">{selectedReservation.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Add-ons */}
              {selectedReservation.addons && selectedReservation.addons.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Add-on Services</h3>
                  <div className="space-y-2">
                    {selectedReservation.addons.map((addon) => (
                      <div key={addon.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <span className="text-sm font-medium text-gray-900">{addon.name}</span>
                        <span className="text-sm font-semibold text-gray-900">+${addon.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Amount */}
              <div className="bg-primary-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-primary-600">
                    ${selectedReservation.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <Button variant="outline" className="flex-1">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Customer
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Staff
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservations;