import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useTranslation } from 'react-i18next';

const Services = () => {
  const { t } = useTranslation();
  const [servicesData, setServicesData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    fetch('/services.json')
      .then((res) => res.json())
      .then((data) => {
        setServicesData(data.services || []);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, []);

  // Gather all categories
  const categories = useMemo(() => {
    return servicesData.map((cat) => cat.category).filter(Boolean);
  }, [servicesData]);

  // Filtered and searched services
  const filteredServices = useMemo(() => {
    let all = servicesData;
    if (selectedCategory) {
      all = all.filter((cat) => cat.category === selectedCategory);
    }
    // Flatten services with category info
    let flat = [];
    all.forEach((cat) => {
      cat.services.forEach((service) => {
        flat.push({ ...service, category: cat.category, categoryImage: cat.categoryImage });
      });
    });
    if (searchTerm) {
      flat = flat.filter(
        (service) =>
          service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return flat;
  }, [servicesData, selectedCategory, searchTerm]);

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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Une erreur s'est produite</h2>
          <p className="text-gray-600">Impossible de charger les services. Veuillez réessayer plus tard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-4">
              {t('Nos Services')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('Découvrez notre gamme complète de soins et prestations, inspirés par la tradition et le naturel.')}
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={e => e.preventDefault()} className="max-w-xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t('Rechercher un service...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                {t('Filtres')}
              </h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">{t('Catégories')}</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                      selectedCategory === ''
                        ? 'bg-primary-100 text-primary-800'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {t('Toutes les catégories')}
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
                <option value="">{t('Toutes les catégories')}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                {t('Affichage de {{count}} services', { count: filteredServices.length })}
              </p>
            </div>

            {/* Services Grid */}
            {filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('Aucun service trouvé')}</h3>
                <p className="text-gray-600">
                  {t('Ajustez votre recherche ou filtrez par une autre catégorie.')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service, idx) => (
                  <div
                    key={service.title + idx}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative">
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          {service.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {service.duration}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {service.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          {service.price}
                        </span>
                        <a href={service.link} target="_blank" rel="noopener noreferrer">
                          <Button size="sm">
                            {t('Prendre RDV')}
                          </Button>
                        </a>
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