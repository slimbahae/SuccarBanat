import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Calendar, 
  Clock, 
  User,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Users,
  TrendingUp,
  MessageCircle,
  Phone,
  Star
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { reservationsAPI } from '../../services/api';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const StaffDashboard = () => {
  const { user } = useAuth();

  // Fetch staff's reservations
  const { data: reservationsData, isLoading } = useQuery(
    'staff-reservations',
    reservationsAPI.getStaffReservations
  );

  const reservations = reservationsData?.data || [];

  // Filter reservations by different criteria
  const todayReservations = reservations.filter(reservation => {
    const today = new Date().toDateString();
    const reservationDate = new Date(reservation.reservationDate).toDateString();
    return reservationDate === today;
  });

  const upcomingReservations = reservations.filter(reservation => {
    const now = new Date();
    const reservationDate = new Date(reservation.reservationDate);
    return reservationDate > now;
  }).slice(0, 5);

  const thisWeekReservations = reservations.filter(reservation => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    const reservationDate = new Date(reservation.reservationDate);
    return reservationDate >= startOfWeek && reservationDate <= endOfWeek;
  });

  const completedThisMonth = reservations.filter(reservation => {
    const now = new Date();
    const reservationDate = new Date(reservation.reservationDate);
    return reservationDate.getMonth() === now.getMonth() && 
           reservationDate.getFullYear() === now.getFullYear() &&
           reservation.status === 'COMPLETED';
  });

  const stats = [
    {
      label: 'Today\'s Appointments',
      value: todayReservations.length,
      icon: Calendar,
      color: 'bg-blue-500',
      description: 'Scheduled for today'
    },
    {
      label: 'This Week',
      value: thisWeekReservations.length,
      icon: Clock,
      color: 'bg-green-500',
      description: 'Total appointments'
    },
    {
      label: 'Completed This Month',
      value: completedThisMonth.length,
      icon: CheckCircle,
      color: 'bg-purple-500',
      description: 'Services completed'
    },
    {
      label: 'Total Revenue',
      value: `$${completedThisMonth.reduce((sum, r) => sum + (r.totalAmount || 0), 0).toFixed(0)}`,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      description: 'This month'
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeSlotDisplay = (timeSlot) => {
    return timeSlot === 'MORNING' ? '9:00 AM - 12:00 PM' : '1:00 PM - 6:00 PM';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your schedule and activity overview
          </p>
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
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Today's Schedule
                </h3>
                <span className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              {todayReservations.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No appointments today</h4>
                  <p className="text-gray-600">Enjoy your free day!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayReservations
                    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                    .map((reservation) => (
                      <div key={reservation.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                              <Sparkles className="h-6 w-6 text-primary-600" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{reservation.serviceName}</h4>
                            <p className="text-sm text-gray-600">with {reservation.customerName}</p>
                            <p className="text-xs text-gray-500">
                              {getTimeSlotDisplay(reservation.timeSlot)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                            {reservation.status}
                          </span>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            ${reservation.totalAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/staff/reservations"
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">View All Appointments</p>
                    <p className="text-sm text-gray-600">Manage your schedule</p>
                  </div>
                </Link>

                <button className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full">
                  <Clock className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Update Availability</p>
                    <p className="text-sm text-gray-600">Manage your work hours</p>
                  </div>
                </button>

                <button className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full">
                  <MessageCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Customer Messages</p>
                    <p className="text-sm text-gray-600">View and respond</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Upcoming Appointments
              </h3>
              
              {upcomingReservations.length === 0 ? (
                <div className="text-center py-4">
                  <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No upcoming appointments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingReservations.map((reservation) => (
                    <div key={reservation.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{reservation.serviceName}</p>
                          <p className="text-xs text-gray-600">{reservation.customerName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(reservation.reservationDate).toLocaleDateString()} • {reservation.timeSlot}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-primary-600">
                          ${reservation.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4">
                <Link to="/staff/reservations">
                  <Button variant="outline" size="sm" className="w-full">
                    View All
                  </Button>
                </Link>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">This Month's Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-primary-100">Services Completed:</span>
                  <span className="font-semibold">{completedThisMonth.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-100">Revenue Generated:</span>
                  <span className="font-semibold">
                    ${completedThisMonth.reduce((sum, r) => sum + (r.totalAmount || 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-100">Customer Rating:</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-semibold">4.8</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-primary-400">
                <p className="text-sm text-primary-100">
                  Great work! You're exceeding your monthly targets.
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Need Help?
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>Front Desk: (555) 123-4567</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  <span>manager@beautycenter.com</span>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  Contact Manager
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          
          {reservations.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reservations
                .filter(r => r.status === 'COMPLETED' || r.status === 'CANCELLED')
                .slice(0, 5)
                .map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        reservation.status === 'COMPLETED' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{reservation.serviceName}</p>
                        <p className="text-sm text-gray-600">
                          {reservation.customerName} • {new Date(reservation.reservationDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        ${reservation.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;