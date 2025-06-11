import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Calendar, 
  Clock, 
  User,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  X,
  Filter,
  Search,
  MessageCircle,
  Phone,
  AlertCircle,
  Eye
} from 'lucide-react';
import { reservationsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const StaffReservations = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch staff reservations
  const { data: reservationsData, isLoading, error } = useQuery(
    'staff-reservations',
    reservationsAPI.getStaffReservations
  );

  // Update reservation status mutation
  const updateStatusMutation = useMutation(
    ({ id, status }) => reservationsAPI.updateStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('staff-reservations');
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
    const matchesStatus = statusFilter === '' || reservation.status === statusFilter;
    
    const matchesDate = dateFilter === '' || 
      (dateFilter === 'today' && isToday(new Date(reservation.reservationDate))) ||
      (dateFilter === 'tomorrow' && isTomorrow(new Date(reservation.reservationDate))) ||
      (dateFilter === 'week' && isThisWeek(new Date(reservation.reservationDate))) ||
      (dateFilter === 'upcoming' && isUpcoming(new Date(reservation.reservationDate)));
    
    return matchesStatus && matchesDate;
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

  const isUpcoming = (date) => {
    return date > new Date();
  };

  // Calculate statistics
  const todayReservations = reservations.filter(r => isToday(new Date(r.reservationDate)));
  const upcomingReservations = reservations.filter(r => isUpcoming(new Date(r.reservationDate)));
  const completedToday = todayReservations.filter(r => r.status === 'COMPLETED');
  const pendingReservations = reservations.filter(r => r.status === 'CONFIRMED' && isUpcoming(new Date(r.reservationDate)));

  const stats = [
    {
      label: 'Today\'s Appointments',
      value: todayReservations.length,
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      label: 'Completed Today',
      value: completedToday.length,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      label: 'Upcoming',
      value: upcomingReservations.length,
      icon: Clock,
      color: 'bg-purple-500'
    },
    {
      label: 'Pending',
      value: pendingReservations.length,
      icon: AlertCircle,
      color: 'bg-yellow-500'
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

  const getTimeSlotDisplay = (timeSlot) => {
    return timeSlot === 'MORNING' ? '9:00 AM - 12:00 PM' : '1:00 PM - 6:00 PM';
  };

  const handleViewReservation = (reservation) => {
    setSelectedReservation(reservation);
    setShowReservationModal(true);
  };

  const handleStatusUpdate = (reservationId, newStatus) => {
    updateStatusMutation.mutate({ id: reservationId, status: newStatus });
  };

  const canCompleteReservation = (reservation) => {
    return reservation.status === 'CONFIRMED' && 
           isToday(new Date(reservation.reservationDate));
  };

  const handleContactCustomer = (type, customerInfo) => {
    if (type === 'message') {
      // Handle message functionality
      toast.success('Message feature coming soon!');
    } else if (type === 'phone') {
      // Handle phone call functionality
      if (customerInfo.phone) {
        window.open(`tel:${customerInfo.phone}`);
      } else {
        toast.error('Customer phone number not available');
      }
    }
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
          <Link to="/staff/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-gray-600">Manage your service appointments</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Staff Member</p>
              <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
            </div>
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
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
            
            <p className="text-sm text-gray-600">
              {filteredReservations.length} appointment{filteredReservations.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Reservations List */}
        {filteredReservations.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600">
              {reservations.length === 0 
                ? "You don't have any appointments scheduled yet." 
                : "No appointments match your current filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations
              .sort((a, b) => new Date(a.reservationDate) - new Date(b.reservationDate))
              .map((reservation) => (
                <div key={reservation.id} className="bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                              <Sparkles className="h-6 w-6 text-primary-600" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {reservation.serviceName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Appointment #{reservation.id.slice(-8)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{reservation.customerName}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <span>
                              {new Date(reservation.reservationDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{getTimeSlotDisplay(reservation.timeSlot)}</span>
                          </div>
                        </div>

                        {/* Add-ons */}
                        {reservation.addons && reservation.addons.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Add-ons:</p>
                            <div className="flex flex-wrap gap-2">
                              {reservation.addons.map((addon) => (
                                <span
                                  key={addon.id}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {addon.name} (+${addon.price.toFixed(2)})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {reservation.notes && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Special Requests:</p>
                            <p className="text-sm text-gray-600">{reservation.notes}</p>
                          </div>
                        )}

                        {/* Today indicator */}
                        {isToday(new Date(reservation.reservationDate)) && (
                          <div className="mb-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Today's Appointment
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end space-y-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                          {getStatusIcon(reservation.status)}
                          <span className="ml-1">{reservation.status}</span>
                        </span>

                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ${reservation.totalAmount.toFixed(2)}
                          </p>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewReservation(reservation)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {canCompleteReservation(reservation) && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(reservation.id, 'COMPLETED')}
                              loading={updateStatusMutation.isLoading}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Reservation Detail Modal */}
      {showReservationModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Appointment Details
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
                
                {canCompleteReservation(selectedReservation) && (
                  <Button
                    onClick={() => handleStatusUpdate(selectedReservation.id, 'COMPLETED')}
                    loading={updateStatusMutation.isLoading}
                  >
                    Mark Completed
                  </Button>
                )}
              </div>

              {/* Service Details */}
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
                    <span>{getTimeSlotDisplay(selectedReservation.timeSlot)}</span>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium">{selectedReservation.customerName}</span>
                  </div>
                  {selectedReservation.customerEmail && (
                    <div className="flex items-center">
                      <MessageCircle className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{selectedReservation.customerEmail}</span>
                    </div>
                  )}
                  {selectedReservation.customerPhone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{selectedReservation.customerPhone}</span>
                    </div>
                  )}
                  {selectedReservation.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Special Requests:</p>
                      <p className="text-sm text-gray-600">{selectedReservation.notes}</p>
                    </div>
                  )}
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

              {/* Contact Customer */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleContactCustomer('message', selectedReservation)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleContactCustomer('phone', selectedReservation)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffReservations;