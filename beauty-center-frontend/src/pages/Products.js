import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Search, Filter, ShoppingBag, Star } from 'lucide-react';
import { productsAPI } from '../services/api';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
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
    'Beauté de regard',
    'Soin',
    'Massage',
    'Épilation',
    'Beauté mains & ongles',
  ];

  const sortOptions = [
    { value: 'name', label: 'Nom A-Z' },
    { value: 'price-low', label: 'Prix : du plus bas au plus élevé' },
    { value: 'price-high', label: 'Prix : du plus élevé au plus bas' },
    { value: 'featured', label: 'En vedette' },
  ];

  // Sort products
  const sortedProducts = React.useMemo(() => {
    if (!products?.data) return [];
    
    const productList = [...products.data];
    
    switch (sortBy) {
      case 'name':
        return productList.sort((a, b) => a.name.localeCompare(b.name));
      case 'price-low':
        return productList.sort((a, b) => (a.finalPrice || a.price) - (b.finalPrice || b.price));
      case 'price-high':
        return productList.sort((a, b) => (b.finalPrice || b.price) - (a.finalPrice || a.price));
      case 'featured':
        return productList.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      default:
        return productList;
    }
  }, [products?.data, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the useQuery dependency
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
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Mobile Filters */}
            <div className="lg:hidden mb-6 flex space-x-4">
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
                Showing {sortedProducts.length} produit{sortedProducts.length !== 1 ? 's' : ''}
                {selectedCategory && ` in ${selectedCategory}`}
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            </div>

            {/* Products Grid */}
            {sortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-600">
                  Essayez d’ajuster vos critères de recherche ou de filtre
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative">
                      {product.imageUrls && product.imageUrls[0] ? (
                        <img
                          src={product.imageUrls[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col space-y-2">
                        {product.featured && (
                          <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                            En vedette
                          </span>
                        )}
                        {product.discountPercentage && (
                          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                            -{product.discountPercentage}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          {product.brand}
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
                        <div className="flex items-center space-x-2">
                          {product.finalPrice !== product.price ? (
                            <>
                              <span className="text-lg font-bold text-gray-900">
                                ${product.finalPrice}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                ${product.price}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">
                              ${product.price}
                            </span>
                          )}
                        </div>
                        
                        <Link to={`/products/${product.id}`}>
                          <Button size="sm">
                            Voir les détails
                          </Button>
                        </Link>
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

export default Products;