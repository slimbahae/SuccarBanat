import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Search, Filter, Calendar, Clock, Star, Sparkles } from 'lucide-react';
import { servicesAPI } from '../services/api';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const Services = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const { isAuthenticated, user } = useAuth();

  // Fetch all services
  const { data: services, isLoading, error } = useQuery(
    ['services', selectedCategory],
    async () => {
      if (selectedCategory) {
        return servicesAPI.getByCategory(selectedCategory);
      } else {
        return servicesAPI.getAll();
      }
    }
  );

  const categories = [
    'Hair Services',
    'Skin Care',
    'Massage',
    'Nail Care',
    'Body Treatments',
    'Facial Treatments',
  ];

  const sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'duration', label: 'Duration' },
    { value: 'featured', label: 'Featured' },
  ];

  // Sort services
  const sortedServices = React.useMemo(() => {
    if (!services?.data) return [];
    
    const serviceList = [...services.data];
    
    switch (sortBy) {
      case 'name':
        return serviceList.sort((a, b) => a.name.localeCompare(b.name));
      case 'price-low':
        return serviceList.sort((a, b) => (a.finalPrice || a.price) - (b.finalPrice || b.price));
      case 'price-high':
        return serviceList.sort((a, b) => (b.finalPrice || b.price) - (a.finalPrice || a.price));
      case 'duration':
        return serviceList.sort((a, b) => a.duration - b.duration);
      case 'featured':
        return serviceList.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      default:
        return serviceList;
    }
  }, [services?.data, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600">Unable to load services. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-4">
              Professional Beauty Services
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience our comprehensive range of beauty treatments performed by certified professionals
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                      selectedCategory === ''
                        ? 'bg-primary-100 text-primary-800'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All Services
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedCategory === category
                          ? 'bg-primary-100 text-primary-800'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                <h4 className="font-medium text-primary-900 mb-2">Need Help?</h4>
                <p className="text-sm text-primary-700 mb-3">
                  Not sure which service is right for you? Our experts are here to help!
                </p>
                <Button size="sm" className="w-full">
                  Contact Us
                </Button>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="lg:col-span-3">
            {/* Mobile Filters */}
            <div className="lg:hidden mb-6 flex space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Services</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {sortedServices.length} service{sortedServices.length !== 1 ? 's' : ''}
                {selectedCategory && ` in ${selectedCategory}`}
              </p>
            </div>

            {/* Services Grid */}
            {sortedServices.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-600">
                  Try adjusting your filter criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sortedServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 relative">
                      {service.imageUrls && service.imageUrls[0] ? (
                        <img
                          src={service.imageUrls[0]}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Sparkles className="h-12 w-12 text-primary-600" />
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col space-y-2">
                        {service.featured && (
                          <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                            Featured
                          </span>
                        )}
                        {service.discountPercentage && (
                          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                            -{service.discountPercentage}%
                          </span>
                        )}
                      </div>

                      {/* Availability indicators */}
                      <div className="absolute top-3 right-3 flex space-x-1">
                        {service.availableMorning && (
                          <span className="bg-white/90 text-gray-700 text-xs px-2 py-1 rounded-full">
                            AM
                          </span>
                        )}
                        {service.availableEvening && (
                          <span className="bg-white/90 text-gray-700 text-xs px-2 py-1 rounded-full">
                            PM
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-primary-600 font-medium">
                          {service.category}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">4.8</span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {service.name}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {service.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{service.duration} min</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {service.finalPrice !== service.price ? (
                            <>
                              <span className="text-xl font-bold text-gray-900">
                                ${service.finalPrice}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                ${service.price}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-gray-900">
                              ${service.price}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Link to={`/services/${service.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            View Details
                          </Button>
                        </Link>
                        
                        {isAuthenticated && user?.role === 'CUSTOMER' ? (
                          <Link to={`/book-service/${service.id}`} className="flex-1">
                            <Button className="w-full">
                              <Calendar className="mr-2 h-4 w-4" />
                              Book Now
                            </Button>
                          </Link>
                        ) : (
                          <Link to="/login" className="flex-1">
                            <Button className="w-full">
                              <Calendar className="mr-2 h-4 w-4" />
                              Book Now
                            </Button>
                          </Link>
                        )}
                      </div>
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

export default Services;