import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Search,
  Filter,
  ShoppingBag,
  Star,
  Tag,
  TrendingDown,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { productsAPI } from '../services/api';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [discountFilter, setDiscountFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Fetch all products
  const { data: products, isLoading, error } = useQuery(
      ['products', searchTerm, selectedCategory],
      async () => {
        if (searchTerm) {
          return productsAPI.search(searchTerm);
        } else if (selectedCategory) {
          return productsAPI.getByCategory(selectedCategory);
        } else {
          return productsAPI.getAll();
        }
      }
  );

  const categories = [
    'Beauté du regard',
    'Soin',
    'Massage',
    'Épilation',
    'Beauté mains & ongles',
  ];

  const discountFilters = [
    { value: '', label: 'Toutes les offres' },
    { value: 'discounted', label: 'En promotion' },
    { value: 'active', label: 'Promotions actives' },
    { value: 'scheduled', label: 'Promotions à venir' },
    { value: 'regular', label: 'Prix régulier' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Nom A-Z' },
    { value: 'price-low', label: 'Prix : du plus bas au plus élevé' },
    { value: 'price-high', label: 'Prix : du plus élevé au plus bas' },
    { value: 'discount', label: 'Plus grande remise' },
    { value: 'featured', label: 'En vedette' },
  ];

  // Filter and sort products
  const processedProducts = React.useMemo(() => {
    if (!products?.data) return [];

    let productList = [...products.data];

    // Apply discount filter
    if (discountFilter) {
      switch (discountFilter) {
        case 'discounted':
          productList = productList.filter(p => p.discountPercentage && p.discountPercentage > 0);
          break;
        case 'active':
          productList = productList.filter(p => p.discountActive === true);
          break;
        case 'scheduled':
          productList = productList.filter(p => p.discountStatus === 'SCHEDULED');
          break;
        case 'regular':
          productList = productList.filter(p => !p.discountPercentage || p.discountPercentage <= 0);
          break;
        default:
          break;
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        return productList.sort((a, b) => a.name.localeCompare(b.name));
      case 'price-low':
        return productList.sort((a, b) => {
          const priceA = a.discountActive && a.finalPrice ? parseFloat(a.finalPrice) : parseFloat(a.price);
          const priceB = b.discountActive && b.finalPrice ? parseFloat(b.finalPrice) : parseFloat(b.price);
          return priceA - priceB;
        });
      case 'price-high':
        return productList.sort((a, b) => {
          const priceA = a.discountActive && a.finalPrice ? parseFloat(a.finalPrice) : parseFloat(a.price);
          const priceB = b.discountActive && b.finalPrice ? parseFloat(b.finalPrice) : parseFloat(b.price);
          return priceB - priceA;
        });
      case 'discount':
        return productList.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
      case 'featured':
        return productList.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      default:
        return productList;
    }
  }, [products?.data, sortBy, discountFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the useQuery dependency
  };

  // Helper function to get discount badge
  const getDiscountBadge = (product) => {
    if (!product.discountPercentage || product.discountPercentage <= 0) {
      return null;
    }

    const badgeConfig = {
      'ACTIVE': {
        color: 'bg-green-600',
        icon: CheckCircle2,
        label: `${product.discountPercentage}% OFF`
      },
      'SCHEDULED': {
        color: 'bg-blue-600',
        icon: Clock,
        label: `${product.discountPercentage}% OFF BIENTÔT`
      },
      'EXPIRED': {
        color: 'bg-gray-500',
        icon: AlertCircle,
        label: `${product.discountPercentage}% EXPIRÉ`
      }
    };

    const config = badgeConfig[product.discountStatus] || {
      color: 'bg-red-600',
      icon: Tag,
      label: `${product.discountPercentage}% OFF`
    };

    const IconComponent = config.icon;

    return (
        <span className={`${config.color} text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1`}>
        <IconComponent className="h-3 w-3" />
        <span>{config.label}</span>
      </span>
    );
  };

  // Helper function to format price
  const formatPrice = (product) => {
    // Check if there's an active discount and final price is different
    const hasActiveDiscount = product.discountActive &&
        product.finalPrice &&
        product.price &&
        parseFloat(product.finalPrice) < parseFloat(product.price);

    if (hasActiveDiscount) {
      return (
          <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-green-600">
            ${parseFloat(product.finalPrice).toFixed(2)}
          </span>
            <span className="text-sm text-gray-500 line-through">
            ${parseFloat(product.price).toFixed(2)}
          </span>
          </div>
      );
    } else {
      return (
          <span className="text-lg font-bold text-gray-900">
          ${parseFloat(product.price).toFixed(2)}
        </span>
      );
    }
  };

  // Helper function to calculate savings
  const getSavingsAmount = (product) => {
    if (product.discountActive &&
        product.finalPrice &&
        product.price &&
        parseFloat(product.finalPrice) < parseFloat(product.price)) {
      const savings = parseFloat(product.price) - parseFloat(product.finalPrice);
      return savings.toFixed(2);
    }
    return null;
  };

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
            <p className="text-gray-600">Impossible de charger les produits. Veuillez réessayer plus tard.</p>
          </div>
        </div>
    );
  }

  const discountedCount = processedProducts.filter(p => p.discountActive).length;
  const featuredCount = processedProducts.filter(p => p.featured).length;

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-4">
                Produits de beauté premium
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Découvrez notre collection sélectionnée de produits de beauté de qualité professionnelle
              </p>

              {/* Promotion banner */}
              {discountedCount > 0 && (
                  <div className="mt-6 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg p-4 max-w-lg mx-auto">
                    <div className="flex items-center justify-center space-x-2">
                      <TrendingDown className="h-5 w-5" />
                      <span className="font-semibold">
                    {discountedCount} produit{discountedCount !== 1 ? 's' : ''} en promotion !
                  </span>
                    </div>
                  </div>
              )}
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Rechercher des produits..."
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
                  Filtres
                </h3>

                {/* Discount Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Tag className="h-4 w-4 mr-2" />
                    Promotions
                  </h4>
                  <div className="space-y-2">
                    {discountFilters.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setDiscountFilter(filter.value)}
                            className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                                discountFilter === filter.value
                                    ? 'bg-primary-100 text-primary-800'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          {filter.label}
                        </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Catégories</h4>
                  <div className="space-y-2">
                    <button
                        onClick={() => setSelectedCategory('')}
                        className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                            selectedCategory === ''
                                ? 'bg-primary-100 text-primary-800'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      Toutes les catégories
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
                  <h4 className="font-medium text-gray-900 mb-3">Trier par</h4>
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

                {/* Quick Stats */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Statistiques</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Total produits:</span>
                      <span className="font-medium">{processedProducts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>En promotion:</span>
                      <span className="font-medium text-red-600">{discountedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>En vedette:</span>
                      <span className="font-medium text-yellow-600">{featuredCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Mobile Filters */}
              <div className="lg:hidden mb-6 space-y-4">
                <div className="flex space-x-4">
                  <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                    ))}
                  </select>
                  <select
                      value={discountFilter}
                      onChange={(e) => setDiscountFilter(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {discountFilters.map((filter) => (
                        <option key={filter.value} value={filter.value}>
                          {filter.label}
                        </option>
                    ))}
                  </select>
                </div>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                  ))}
                </select>
              </div>

              {/* Results Count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600">
                  {processedProducts.length} produit{processedProducts.length !== 1 ? 's' : ''}
                  {selectedCategory && ` dans ${selectedCategory}`}
                  {searchTerm && ` pour "${searchTerm}"`}
                  {discountFilter && discountFilter !== '' && ` (${discountFilters.find(f => f.value === discountFilter)?.label})`}
                </p>

                {discountedCount > 0 && (
                    <span className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full">
                  🏷️ {discountedCount} en promo
                </span>
                )}
              </div>

              {/* Products Grid */}
              {processedProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
                    <p className="text-gray-600">
                      Essayez d'ajuster vos critères de recherche ou de filtre
                    </p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {processedProducts.map((product) => {
                      const savings = getSavingsAmount(product);

                      return (
                          <div
                              key={product.id}
                              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                          >
                            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative group">
                              {product.imageUrls && product.imageUrls[0] ? (
                                  <img
                                      src={product.imageUrls[0]}
                                      alt={product.name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="h-12 w-12 text-gray-400" />
                                  </div>
                              )}

                              {/* Badges */}
                              <div className="absolute top-3 left-3 flex flex-col space-y-2">
                                {product.featured && (
                                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                              <Star className="h-3 w-3" />
                              <span>En vedette</span>
                            </span>
                                )}
                                {getDiscountBadge(product)}
                              </div>

                              {/* Savings indicator */}
                              {savings && (
                                  <div className="absolute top-3 right-3">
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                              Économisez ${savings}
                            </span>
                                  </div>
                              )}

                              {/* Stock indicator */}
                              {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                                  <div className="absolute bottom-3 left-3">
                            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                              Plus que {product.stockQuantity} en stock
                            </span>
                                  </div>
                              )}
                            </div>

                            <div className="p-4">
                              <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            {product.brand || 'Beauty Center'}
                          </span>
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm text-gray-600">4.5</span>
                                </div>
                              </div>

                              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                {product.name}
                              </h3>

                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {product.description}
                              </p>

                              <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                  {formatPrice(product)}
                                  {savings && (
                                      <span className="text-xs text-green-600 font-medium">
                                Vous économisez ${savings}
                              </span>
                                  )}
                                </div>

                                <Link to={`/products/${product.id}`}>
                                  <Button size="sm" className="hover:bg-primary-700">
                                    Voir détails
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                      );
                    })}
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default Products;