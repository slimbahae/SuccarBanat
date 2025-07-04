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
  Minus
} from 'lucide-react';
import { productsAPI, cartAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const euroFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

const ProductDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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

                {(!isAuthenticated || user?.role !== 'CUSTOMER') && (
                  <p className="mt-2 text-sm text-gray-600 text-center">
                    {!isAuthenticated ? (
                      <>
                        <Link to="/login" className="text-primary-600 hover:text-primary-700">
                          Se connecter
                        </Link>{' '}
                        pour ajouter des articles au panier
                      </>
                    ) : (
                      'Only customers can purchase products'
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;