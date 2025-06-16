// Enhanced AdminProducts component with discount functionality
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Package,
  Star,
  X,
  Image as ImageIcon,
  Tag,
  Calendar,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { enhancedProductsAPI as productsAPI } from '../../services/api';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ProductImageUpload from '../../components/ProductImageUpload';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [discountFilter, setDiscountFilter] = useState(''); // New discount filter
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const queryClient = useQueryClient();

  // Fetch products
  const { data: productsData, isLoading, error } = useQuery(
      'admin-products',
      productsAPI.getAllAdmin
  );

  // Delete product mutation
  const deleteProductMutation = useMutation(
      (id) => productsAPI.delete(id),
      {
        onSuccess: () => {
          queryClient.invalidateQueries('admin-products');
          toast.success('Produit supprimé avec succès');
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Échec de la suppression du produit');
        },
      }
  );

  const products = productsData?.data || [];

  const categories = [
    'Beauté du regard',
    'Soin',
    'Massage',
    'Épilation',
    'Beauté mains & ongles',
  ];

  const discountFilterOptions = [
    { value: '', label: 'Toutes les remises' },
    { value: 'ACTIVE', label: 'Remises actives' },
    { value: 'SCHEDULED', label: 'Remises programmées' },
    { value: 'EXPIRED', label: 'Remises expirées' },
    { value: 'NO_DISCOUNT', label: 'Sans remise' }
  ];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;

    const matchesDiscount = discountFilter === '' || product.discountStatus === discountFilter;

    return matchesSearch && matchesCategory && matchesDiscount;
  });

  const handleDeleteProduct = (product) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}"?`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { label: 'Rupture de stock', color: 'text-red-600' };
    if (quantity <= 5) return { label: 'Stock faible', color: 'text-yellow-600' };
    return { label: 'En stock', color: 'text-green-600' };
  };

  const getDiscountBadge = (product) => {
    if (!product.hasDiscount) {
      return null;
    }

    const badgeConfig = {
      'ACTIVE': {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: `Actif -${product.discountPercentage}%`
      },
      'SCHEDULED': {
        color: 'bg-blue-100 text-blue-800',
        icon: Clock,
        label: `Programmé -${product.discountPercentage}%`
      },
      'EXPIRED': {
        color: 'bg-red-100 text-red-800',
        icon: AlertTriangle,
        label: `Expiré -${product.discountPercentage}%`
      }
    };

    const config = badgeConfig[product.discountStatus];
    if (!config) return null;

    const IconComponent = config.icon;

    return (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
          {config.label}
      </span>
    );
  };

  const formatPrice = (product) => {
    if (product.discountActive && product.finalPrice !== product.price) {
      return (
          <div className="text-sm">
            <div className="font-semibold text-green-600">${product.finalPrice}</div>
            <div className="text-gray-500 line-through text-xs">${product.price}</div>
          </div>
      );
    } else {
      return (
          <div className="text-sm font-semibold text-gray-900">${product.price}</div>
      );
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Impossible de charger les produits</h2>
            <p className="text-gray-600">Veuillez réessayer plus tard.</p>
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
              Retour au tableau de bord
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion des produits</h1>
                <p className="text-gray-600">Gérez votre catalogue de produits et les remises</p>
              </div>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                      type="text"
                      placeholder="Rechercher des produits..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {discountFilterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}</span>
                <span>•</span>
                <span>{filteredProducts.filter(p => p.discountActive).length} en promotion</span>
              </div>
            </div>
          </div>

          {/* Products Table */}
          {filteredProducts.length === 0 ? (
              <div className="bg-white shadow-sm rounded-lg p-12 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-600 mb-6">
                  {products.length === 0
                      ? "Commencez par ajouter votre premier produit."
                      : "Aucun produit ne correspond à vos filtres actuels."}
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  Ajouter un produit
                </Button>
              </div>
          ) : (
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remise
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Images
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => {
                      const stockStatus = getStockStatus(product.stockQuantity);
                      return (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12 relative">
                                  {product.imageUrls && product.imageUrls[0] ? (
                                      <img
                                          className="h-12 w-12 rounded-lg object-cover"
                                          src={product.imageUrls[0]}
                                          alt={product.name}
                                      />
                                  ) : (
                                      <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <Package className="h-6 w-6 text-gray-400" />
                                      </div>
                                  )}
                                  {product.discountActive && (
                                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        <TrendingDown className="h-3 w-3" />
                                      </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {product.name}
                                    {product.featured && (
                                        <Star className="inline h-4 w-4 text-yellow-400 ml-1" />
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {product.brand} • SKU: {product.sku}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            {product.category}
                          </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {formatPrice(product)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getDiscountBadge(product) || (
                                  <span className="text-xs text-gray-400">Aucune</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm font-medium ${stockStatus.color}`}>
                                {product.stockQuantity} unités
                              </div>
                              <div className={`text-xs ${stockStatus.color}`}>
                                {stockStatus.label}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-1">
                                <ImageIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                              {product.imageUrls?.length || 0}
                            </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              product.active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                          }`}>
                            {product.active ? 'Active' : 'Inactive'}
                          </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <Link to={`/products/${product.id}`} target="_blank">
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingProduct(product)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteProduct(product)}
                                    loading={deleteProductMutation.isLoading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>
              </div>
          )}
        </div>

        {/* Create/Edit Product Modal */}
        {(showCreateForm || editingProduct) && (
            <ProductModalWithDiscount
                product={editingProduct}
                onClose={() => {
                  setShowCreateForm(false);
                  setEditingProduct(null);
                }}
                onSuccess={() => {
                  setShowCreateForm(false);
                  setEditingProduct(null);
                  queryClient.invalidateQueries('admin-products');
                }}
            />
        )}
      </div>
  );
};

// Enhanced Product Modal Component with Discount Management
const ProductModalWithDiscount = ({ product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    price: product?.price || '',
    stockQuantity: product?.stockQuantity || '',
    brand: product?.brand || '',
    sku: product?.sku || '',
    featured: product?.featured || false,
    active: product?.active !== undefined ? product.active : true,
    imageUrls: product?.imageUrls || [],
    tags: product?.tags?.join(', ') || '',
    discountPercentage: product?.discountPercentage || '',
    discountStartDate: product?.discountStartDate ? new Date(product.discountStartDate).toISOString().split('T')[0] : '',
    discountEndDate: product?.discountEndDate ? new Date(product.discountEndDate).toISOString().split('T')[0] : '',
    specifications: product?.specifications || []
  });

  const [newSpecification, setNewSpecification] = useState({ name: '', value: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountPreview, setDiscountPreview] = useState(null);

  // Calculate discount preview
  React.useEffect(() => {
    if (formData.price && formData.discountPercentage) {
      const originalPrice = parseFloat(formData.price);
      const discountPercent = parseFloat(formData.discountPercentage);

      if (originalPrice > 0 && discountPercent > 0 && discountPercent <= 100) {
        const discountAmount = (originalPrice * discountPercent) / 100;
        const finalPrice = originalPrice - discountAmount;

        setDiscountPreview({
          originalPrice,
          discountPercent,
          discountAmount: discountAmount.toFixed(2),
          finalPrice: finalPrice.toFixed(2),
          savings: discountPercent
        });
      } else {
        setDiscountPreview(null);
      }
    } else {
      setDiscountPreview(null);
    }
  }, [formData.price, formData.discountPercentage]);

  const createProductMutation = useMutation(
      (productData) => productsAPI.create(productData),
      {
        onSuccess: () => {
          toast.success('Produit créé avec succès');
          onSuccess();
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Échec de la création du produit');
        },
      }
  );

  const updateProductMutation = useMutation(
      ({ id, productData }) => productsAPI.update(id, productData),
      {
        onSuccess: () => {
          toast.success('Produit mis à jour avec succès');
          onSuccess();
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Échec de la mise à jour du produit');
        },
      }
  );

  const handleImagesChange = (newImages) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: newImages
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Le nom du produit est requis');
      return false;
    }

    if (!formData.category) {
      toast.error('La catégorie est requise');
      return false;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Le prix doit être supérieur à 0');
      return false;
    }

    if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 0) {
      toast.error('La quantité en stock ne peut pas être négative');
      return false;
    }

    // Validate discount data
    if (formData.discountPercentage) {
      const discount = parseFloat(formData.discountPercentage);
      if (discount < 0 || discount > 100) {
        toast.error('Le pourcentage de remise doit être entre 0 et 100');
        return false;
      }

      if (!formData.discountStartDate || !formData.discountEndDate) {
        toast.error('Les dates de début et de fin de remise sont requises');
        return false;
      }

      const startDate = new Date(formData.discountStartDate);
      const endDate = new Date(formData.discountEndDate);

      if (startDate >= endDate) {
        toast.error('La date de début doit être antérieure à la date de fin');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : null,
        discountStartDate: formData.discountStartDate ? new Date(formData.discountStartDate) : null,
        discountEndDate: formData.discountEndDate ? new Date(formData.discountEndDate) : null,
      };

      if (product) {
        updateProductMutation.mutate({ id: product.id, productData });
      } else {
        createProductMutation.mutate(productData);
      }
    } catch (error) {
      toast.error('Erreur lors de la soumission du formulaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSpecification = () => {
    if (newSpecification.name.trim() && newSpecification.value.trim()) {
      setFormData({
        ...formData,
        specifications: [...formData.specifications, { ...newSpecification }]
      });
      setNewSpecification({ name: '', value: '' });
    }
  };

  const removeSpecification = (index) => {
    setFormData({
      ...formData,
      specifications: formData.specifications.filter((_, i) => i !== index)
    });
  };

  const clearDiscount = () => {
    setFormData({
      ...formData,
      discountPercentage: '',
      discountStartDate: '',
      discountEndDate: ''
    });
  };

  const categories = [
    'Beauté du regard',
    'Soin',
    'Massage',
    'Épilation',
    'Beauté mains & ongles',
  ];

  const isLoading = isSubmitting || createProductMutation.isLoading || updateProductMutation.isLoading;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h2 className="text-xl font-semibold text-gray-900">
              {product ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
            </h2>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                disabled={isLoading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Image Upload Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <ProductImageUpload
                  images={formData.imageUrls}
                  onImagesChange={handleImagesChange}
                  maxImages={5}
                  productId={product?.id}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  Informations générales
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du produit *
                  </label>
                  <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      disabled={isLoading}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marque
                    </label>
                    <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU
                    </label>
                    <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Étiquettes (séparées par des virgules)
                  </label>
                  <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="ex: bio, premium, bestseller"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      disabled={isLoading}
                  />
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  Prix et gestion des stocks
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix * ($)
                  </label>
                  <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité en Stock *
                  </label>
                  <input
                      type="number"
                      min="0"
                      required
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      disabled={isLoading}
                  />
                </div>

                {/* Enhanced Discount Section */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900 flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-red-600" />
                      Gestion des remises
                    </h4>
                    {(formData.discountPercentage || formData.discountStartDate || formData.discountEndDate) && (
                        <button
                            type="button"
                            onClick={clearDiscount}
                            className="text-sm text-red-600 hover:text-red-800"
                            disabled={isLoading}
                        >
                          Effacer la remise
                        </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pourcentage de remise (%)
                      </label>
                      <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={formData.discountPercentage}
                          onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          disabled={isLoading}
                          placeholder="Ex: 25 pour 25%"
                      />
                    </div>

                    {formData.discountPercentage && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Calendar className="inline h-4 w-4 mr-1" />
                              Date de début
                            </label>
                            <input
                                type="date"
                                value={formData.discountStartDate}
                                onChange={(e) => setFormData({ ...formData, discountStartDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                disabled={isLoading}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Calendar className="inline h-4 w-4 mr-1" />
                              Date de fin
                            </label>
                            <input
                                type="date"
                                value={formData.discountEndDate}
                                onChange={(e) => setFormData({ ...formData, discountEndDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                disabled={isLoading}
                            />
                          </div>
                        </div>
                    )}

                    {/* Discount Preview */}
                    {discountPreview && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Aperçu de la remise</h5>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Prix original:</span>
                              <span className="ml-2 font-medium">${discountPreview.originalPrice}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Remise:</span>
                              <span className="ml-2 font-medium text-red-600">-${discountPreview.discountAmount}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Prix final:</span>
                              <span className="ml-2 font-bold text-green-600">${discountPreview.finalPrice}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Économies:</span>
                              <span className="ml-2 font-medium text-red-600">{discountPreview.savings}%</span>
                            </div>
                          </div>
                        </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        disabled={isLoading}
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                      Produit en vedette
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="active"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        disabled={isLoading}
                    />
                    <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                      Produit actif
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Spécifications du produit</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                      type="text"
                      value={newSpecification.name}
                      onChange={(e) => setNewSpecification({ ...newSpecification, name: e.target.value })}
                      placeholder="Nom de la spécification (ex: Volume)"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      disabled={isLoading}
                  />
                  <input
                      type="text"
                      value={newSpecification.value}
                      onChange={(e) => setNewSpecification({ ...newSpecification, value: e.target.value })}
                      placeholder="Valeur (ex: 250ml)"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      disabled={isLoading}
                  />
                  <Button
                      type="button"
                      onClick={addSpecification}
                      variant="outline"
                      disabled={isLoading || !newSpecification.name.trim() || !newSpecification.value.trim()}
                  >
                    Ajouter
                  </Button>
                </div>

                {formData.specifications.length > 0 && (
                    <div className="space-y-2">
                      {formData.specifications.map((spec, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
                      <span className="text-sm">
                        <strong className="text-gray-900">{spec.name}:</strong>
                        <span className="text-gray-600 ml-1">{spec.value}</span>
                      </span>
                            <button
                                type="button"
                                onClick={() => removeSpecification(index)}
                                className="text-red-600 hover:text-red-800 p-1"
                                disabled={isLoading}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                      ))}
                    </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 sticky bottom-0 bg-white">
              <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading}
              >
                {product ? 'Mettre à jour le produit' : 'Créer le produit'}
              </Button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default AdminProducts;