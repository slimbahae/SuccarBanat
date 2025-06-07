import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Calendar, 
  Clock, 
  Star, 
  Users, 
  Award,
  ChevronLeft,
  Sparkles,
  CheckCircle,
  Heart,
  Share2
} from 'lucide-react';
import { servicesAPI, serviceAddonsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const ServiceDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();

  // Fetch service details
  const { data: service, isLoading, error } = useQuery(
    ['service', id],
    () => servicesAPI.getById(id)
  );

  // Fetch compatible add-ons
  const { data: addons } = useQuery(
    ['service-addons', id],
    () => serviceAddonsAPI.getByServiceId(id),
    {
      enabled: !!service?.data
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !service?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service not found</h2>
          <p className="text-gray-600 mb-4">The service you're looking for doesn't exist.</p>
          <Link to="/services">
            <Button>Back to Services</Button>
          </Link>
        </div>
      </div>
    );
  }

  const serviceData = service.data;
  const hasDiscount = serviceData.finalPrice !== serviceData.price;
  const availableAddons = addons?.data || [];

  const features = [
    'Professional certified staff',
    'Premium quality products',
    'Relaxing environment',
    'Personalized consultation',
    'Aftercare guidance',
  ];

  const benefits = [
    { icon: Award, text: 'Certified professionals only' },
    { icon: Users, text: 'Personalized service' },
    { icon: CheckCircle, text: 'Satisfaction guaranteed' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <span>/</span>
          <Link to="/services" className="hover:text-primary-600">Services</Link>
          <span>/</span>
          <span className="text-gray-900">{serviceData.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/services" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Services
        </Link>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Service Image */}
          <div className="w-full aspect-video bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl overflow-hidden relative">
            {serviceData.imageUrls && serviceData.imageUrls[0] ? (
              <img
                src={serviceData.imageUrls[0]}
                alt={serviceData.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Sparkles className="h-16 w-16 text-primary-600" />
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col space-y-2">
              {serviceData.featured && (
                <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                  Featured
                </span>
              )}
              {hasDiscount && (
                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                  -{serviceData.discountPercentage}%
                </span>
              )}
            </div>

            {/* Availability indicators */}
            <div className="absolute top-4 right-4 flex space-x-1">
              {serviceData.availableMorning && (
                <span className="bg-white/90 text-gray-700 text-xs px-2 py-1 rounded-full">
                  Morning Available
                </span>
              )}
              {serviceData.availableEvening && (
                <span className="bg-white/90 text-gray-700 text-xs px-2 py-1 rounded-full">
                  Evening Available
                </span>
              )}
            </div>
          </div>

          {/* Service Info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-primary-600 font-medium uppercase tracking-wide">
                  {serviceData.category}
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  {serviceData.name}
                </h1>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-red-500">
                  <Heart className="h-6 w-6" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Share2 className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="ml-2 text-sm text-gray-600">(89 reviews)</p>
            </div>

            {/* Price and Duration */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                {hasDiscount ? (
                  <div className="flex items-center space-x-3">
                    <p className="text-3xl font-bold text-gray-900">
                      ${serviceData.finalPrice}
                    </p>
                    <p className="text-xl text-gray-500 line-through">
                      ${serviceData.price}
                    </p>
                    <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full">
                      Save ${(serviceData.price - serviceData.finalPrice).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    ${serviceData.price}
                  </p>
                )}
                
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-1" />
                  <span>{serviceData.duration} minutes</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">About This Service</h3>
              <p className="text-gray-600 leading-relaxed">
                {serviceData.description}
              </p>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">What's Included</h3>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Add-ons */}
            {availableAddons.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Available Add-ons</h3>
                <div className="space-y-2">
                  {availableAddons.slice(0, 3).map((addon) => (
                    <div key={addon.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{addon.name}</p>
                        <p className="text-sm text-gray-600">{addon.description}</p>
                        {addon.additionalDuration > 0 && (
                          <p className="text-xs text-gray-500">+{addon.additionalDuration} minutes</p>
                        )}
                      </div>
                      <span className="font-semibold text-gray-900">+${addon.price}</span>
                    </div>
                  ))}
                  {availableAddons.length > 3 && (
                    <p className="text-sm text-gray-600 text-center">
                      +{availableAddons.length - 3} more add-ons available during booking
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Book Now Button */}
            <div className="mb-6">
              {isAuthenticated && user?.role === 'CUSTOMER' ? (
                <Link to={`/book-service/${serviceData.id}`} className="block">
                  <Button className="w-full" size="lg">
                    <Calendar className="mr-2 h-5 w-5" />
                    Book This Service
                  </Button>
                </Link>
              ) : (
                <Link to="/login" className="block">
                  <Button className="w-full" size="lg">
                    <Calendar className="mr-2 h-5 w-5" />
                    Sign In to Book
                  </Button>
                </Link>
              )}

              {(!isAuthenticated || user?.role !== 'CUSTOMER') && (
                <p className="mt-2 text-sm text-gray-600 text-center">
                  {!isAuthenticated ? (
                    <>
                      <Link to="/login" className="text-primary-600 hover:text-primary-700">
                        Sign in
                      </Link>{' '}
                      to book services
                    </>
                  ) : (
                    'Only customers can book services'
                  )}
                </p>
              )}
            </div>

            {/* Benefits */}
            <div className="border-t border-gray-200 pt-6">
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <benefit.icon className="h-5 w-5 text-primary-600 mr-3" />
                    {benefit.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Have Questions?</h4>
              <p className="text-sm text-gray-600 mb-3">
                Our beauty consultants are here to help you choose the perfect service.
              </p>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm">
                  Call Us
                </Button>
                <Button variant="outline" size="sm">
                  Live Chat
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t border-gray-200 pt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sample reviews */}
            {[
              {
                name: 'Sarah Johnson',
                rating: 5,
                comment: 'Amazing service! The staff was professional and the results exceeded my expectations.',
                date: '2 weeks ago'
              },
              {
                name: 'Emily Chen',
                rating: 5,
                comment: 'Absolutely love this place. The atmosphere is so relaxing and the quality is top-notch.',
                date: '1 month ago'
              },
              {
                name: 'Jessica Williams',
                rating: 4,
                comment: 'Great experience overall. Will definitely be coming back soon!',
                date: '1 month ago'
              }
            ].map((review, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">{review.date}</span>
                </div>
                <p className="text-gray-600 mb-2">{review.comment}</p>
                <p className="text-sm font-medium text-gray-900">{review.name}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline">
              View All Reviews
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;