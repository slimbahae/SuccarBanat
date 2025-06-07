import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone,
  CheckCircle,
  X,
  Edit,
  Plus,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { reservationsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const Reservations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Fetch customer reservations
  const { data: reservationsData, isLoading, error } = useQuery(
    'customer-reservations',
    reservationsAPI.getCustomerReservations
  );

  // Update reservation status mutation
  const updateStatusMutation = useMutation(
    ({ id, status }) => reservationsAPI.updateStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('customer-reservations');
        toast.success('Reservation updated successfully');
      },
      onError: (error) => {
        console.error('Update reservation error:', error);
        toast.error(error.response?.data?.message || 'Failed to update reservation');
      },
    }
  );

  const reservations = reservationsData?.data || [];

  // Filter reservations
  const filteredReservations = reservations.filter(reservation => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'UPCOMING') {
      return new Date(reservation.reservationDate) >= new Date() && 
             reservation.status === 'CONFIRMED';
    }
    if (statusFilter === 'PAST') {
      return new Date(reservation.reservationDate) < new Date() || 
             reservation.status === 'COMPLETED';
    }
    return reservation.status === statusFilter;
  });

  // Sort reservations by date (upcoming first, then past)
  const sortedReservations = filteredReservations.sort((a, b) => {
    const dateA = new Date(a.reservationDate);
    const dateB = new Date(b.reservationDate);
    const now = new Date();
    
    // If both are upcoming or both are past, sort by date
    if ((dateA >= now && dateB >= now) || (dateA < now && dateB < now)) {
      return dateA - dateB;
    }
    // Put upcoming before past
    return dateA >= now ? -1 : 1;
  });

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

  const canCancel = (reservation) => {
    const reservationDate = new Date(reservation.reservationDate);
    const now = new Date();
    const hoursUntilReservation = (reservationDate - now) / (1000 * 60 * 60);
    
    return reservation.status === 'CONFIRMED' && hoursUntilReservation > 24;
  };

  const handleCancelReservation = (reservation) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      updateStatusMutation.mutate({ id: reservation.id, status: 'CANCELLED' });
    }
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Reservations</h1>
              <p className="text-gray-600">Manage your beauty appointments</p>
            </div>
            <Link to="/services">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Book New Service
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="ALL">All Reservations</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="PAST">Past</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <span className="text-sm text-gray-600">
              {filteredReservations.length} reservation{filteredReservations.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>

        {/* Reservations List */}
        {sortedReservations.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
            <p className="text-gray-600 mb-6">
              {reservations.length === 0 
                ? "You haven't booked any services yet." 
                : "No reservations match your current filter."}
            </p>
            <Link to="/services">
              <Button>
                Book Your First Service
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedReservations.map((reservation) => (
              <div key={reservation.id} className="bg-white shadow-sm rounded-lg overflow-hidden">
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
                            Reservation #{reservation.id.slice(-8)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span>
                            {new Date(reservation.reservationDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="capitalize">
                            {reservation.timeSlot.toLowerCase()} Session
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <span>with {reservation.staffName}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-semibold text-gray-900">
                            ${reservation.totalAmount.toFixed(2)}
                          </span>
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
                          <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                          <p className="text-sm text-gray-600">{reservation.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                        {getStatusIcon(reservation.status)}
                        <span className="ml-1">{reservation.status}</span>
                      </span>

                      {isUpcoming(reservation.reservationDate) && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>
                            {Math.ceil((new Date(reservation.reservationDate) - new Date()) / (1000 * 60 * 60 * 24))} days away
                          </span>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        {canCancel(reservation) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelReservation(reservation)}
                            loading={updateStatusMutation.isLoading}
                          >
                            Cancel
                          </Button>
                        )}
                        
                        {reservation.status === 'COMPLETED' && (
                          <Link to={`/services/${reservation.serviceId}`}>
                            <Button size="sm">
                              Book Again
                            </Button>
                          </Link>
                        )}
                        
                        {isUpcoming(reservation.reservationDate) && reservation.status === 'CONFIRMED' && (
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Modify
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reminder */}
                  {isUpcoming(reservation.reservationDate) && reservation.status === 'CONFIRMED' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-blue-400 mr-2" />
                        <div className="text-sm">
                          <p className="text-blue-800 font-medium">Reminder</p>
                          <p className="text-blue-700">
                            Please arrive 15 minutes early for your appointment. 
                            {reservation.smsReminderSent 
                              ? ' You will receive an SMS reminder 24 hours before.' 
                              : ' SMS reminders are enabled for this booking.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cancellation Policy */}
                  {isUpcoming(reservation.reservationDate) && reservation.status === 'CONFIRMED' && (
                    <div className="mt-3 text-xs text-gray-500">
                      <p>
                        Cancellation policy: Free cancellation up to 24 hours before your appointment.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/services" className="block">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <div className="flex items-center">
                  <Plus className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Book New Service</h4>
                    <p className="text-sm text-gray-600">Schedule your next appointment</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/customer/dashboard" className="block">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <div className="flex items-center">
                  <User className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Dashboard</h4>
                    <p className="text-sm text-gray-600">View your account overview</p>
                  </div>
                </div>
              </div>
            </Link>

            <a href="tel:+1234567890" className="block">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <div className="flex items-center">
                  <Phone className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Contact Us</h4>
                    <p className="text-sm text-gray-600">Questions about your booking?</p>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservations;