import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  ShoppingCart, 
  Star, 
  Check, 
  Truck, 
  Shield, 
  RotateCcw,
  Heart,
  Share2,
  ChevronLeft,
  Plus,
  Minus,
  Edit,
  X
} from 'lucide-react';
import { productsAPI, cartAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ProductImageUpload from '../components/ProductImageUpload';

const euroFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

const ProductDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch product details
  const { data: product, isLoading, error } = useQuery(
    ['product', id],
    () => productsAPI.getById(id)
  );

  // Add to cart mutation
  const addToCartMutation = useMutation(
    (cartData) => cartAPI.addItem(cartData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
        toast.success('Produit ajouté au panier !');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Échec de l’ajout au panier');
      },
    }
  );

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour ajouter des articles au panier');
      return;
    }

    if (user?.role !== 'CUSTOMER') {
      toast.error('Seuls les clients peuvent ajouter des articles au panier');
      return;
    }

    addToCartMutation.mutate({
      productId: product.data.id,
      quantity: quantity,
    });
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product?.data?.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleShare = async () => {
    try {
      const productUrl = `${window.location.origin}/products/${id}`;
      await navigator.clipboard.writeText(productUrl);
      toast.success('Lien du produit copié dans le presse-papiers !');
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = `${window.location.origin}/products/${id}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Lien du produit copié dans le presse-papiers !');
      } catch (fallbackErr) {
        toast.error('Échec de la copie du lien. Veuillez copier manuellement.');
        console.error('La copie dans le presse-papiers a échoué :', fallbackErr);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !product?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Produit introuvable</h2>
          <p className="text-gray-600 mb-4">Le produit que vous recherchez n'existe pas.</p>
          <Link to="/products">
            <Button>Retour au Produits</Button>
          </Link>
        </div>
      </div>
    );
  }

  const productData = product.data;
  const images = productData.imageUrls || [];
  const isOutOfStock = productData.stockQuantity === 0;
  const hasDiscount = productData.finalPrice !== productData.price;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-primary-600">Accueil</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary-600">Produit</Link>
          <span>/</span>
          <span className="text-gray-900">{productData.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/products" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour au Produits
        </Link>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image Gallery */}
          <div className="flex flex-col-reverse">
            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="hidden mt-6 w-full max-w-2xl mx-auto sm:block lg:max-w-none">
                <div className="grid grid-cols-4 gap-6">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-24 bg-white rounded-md flex items-center justify-center text-sm font-medium uppercase text-gray-900 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring focus:ring-offset-4 focus:ring-primary-500 ${
                        index === selectedImageIndex ? 'ring-2 ring-primary-500' : ''
                      }`}
                    >
                      <span className="sr-only">Image {index + 1}</span>
                      <span className="absolute inset-0 rounded-md overflow-hidden">
                        <img
                          src={image}
                          alt={`${productData.name} ${index + 1}`}
                          className="w-full h-full object-center object-cover"
                        />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main Image */}
            <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {images.length > 0 ? (
                <img
                  src={images[selectedImageIndex]}
                  alt={productData.name}
                  className="w-full h-full object-center object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                {productData.brand && (
                  <p className="text-sm text-gray-600 uppercase tracking-wide">
                    {productData.brand}
                  </p>
                )}
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  {productData.name}
                </h1>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleShare}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Share product"
                >
                  <Share2 className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center space-x-3">
                {hasDiscount ? (
                  <>
                    <p className="text-3xl font-bold text-gray-900">
                      {euroFormatter.format(productData.finalPrice)}
                    </p>
                    <p className="text-xl text-gray-500 line-through">
                      {euroFormatter.format(productData.price)}
                    </p>
                    <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full">
                      Économisez {euroFormatter.format(productData.price - productData.finalPrice)}
                    </span>
                  </>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {euroFormatter.format(productData.price)}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {productData.description}
              </p>
            </div>

            {/* Specifications */}
            {productData.specifications && productData.specifications.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Spécifications</h3>
                <dl className="grid grid-cols-1 gap-3">
                  {productData.specifications.map((spec, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm font-medium text-gray-600">{spec.name}:</dt>
                      <dd className="text-sm text-gray-900">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Stock Status */}
            <div className="mb-6">
              <div className="flex items-center">
                {isOutOfStock ? (
                  <span className="text-red-600 text-sm font-medium">Rupture de stock</span>
                ) : productData.stockQuantity <= 5 ? (
                  <span className="text-orange-600 text-sm font-medium">
                    Seulement {productData.stockQuantity} en stock
                  </span>
                ) : (
                  <span className="text-green-600 text-sm font-medium flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    En stock
                  </span>
                )}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            {!isOutOfStock && (
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <label htmlFor="quantity" className="text-sm font-medium text-gray-900">
                    Quantité:
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 text-gray-900 font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= productData.stockQuantity}
                      className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {user?.role === 'ADMIN' ? (
                  <Button
                    onClick={() => setShowEditModal(true)}
                    className="w-full"
                    size="lg"
                  >
                    <Edit className="mr-2 h-5 w-5" />
                    Modifier ce produit
                  </Button>
                ) : (
                  <Button
                    onClick={handleAddToCart}
                    className="w-full"
                    size="lg"
                    loading={addToCartMutation.isLoading}
                    disabled={!isAuthenticated || user?.role !== 'CUSTOMER'}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Ajouter au panier
                  </Button>
                )}

                {(!isAuthenticated || (user?.role !== 'CUSTOMER' && user?.role !== 'ADMIN')) && (
                  <p className="mt-2 text-sm text-gray-600 text-center">
                    {!isAuthenticated ? (
                      <>
                        <Link to="/login" className="text-primary-600 hover:text-primary-700">
                          Se connecter
                        </Link>{' '}
                        pour ajouter des articles au panier
                      </>
                    ) : (
                      'Seuls les clients peuvent acheter des produits'
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      {showEditModal && (
        <ProductEditModal
          product={productData}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            queryClient.invalidateQueries(['product', id]);
            toast.success('Produit mis à jour avec succès');
          }}
        />
      )}
    </div>
  );
};

// Product Edit Modal Component
const ProductEditModal = ({ product, onClose, onSuccess }) => {
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

  const updateProductMutation = useMutation(
    ({ id, productData }) => productsAPI.update(id, productData),
    {
      onSuccess: () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      updateProductMutation.mutate({ id: product.id, productData });
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

  const categories = [
    'Beauté du regard',
    'Soin',
    'Massage',
    'Épilation',
    'Beauté mains & ongles',
  ];

  const isLoading = isSubmitting || updateProductMutation.isLoading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            Modifier le produit
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
                  Prix * (€)
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={isLoading}
                />
              </div>

              {formData.discountPercentage && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de début de la remise
                    </label>
                    <input
                      type="date"
                      value={formData.discountStartDate}
                      onChange={(e) => setFormData({ ...formData, discountStartDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin de la remise
                    </label>
                    <input
                      type="date"
                      value={formData.discountEndDate}
                      onChange={(e) => setFormData({ ...formData, discountEndDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

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
              Mettre à jour le produit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductDetail;