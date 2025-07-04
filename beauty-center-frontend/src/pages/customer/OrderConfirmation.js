import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Calendar,
  Download,
  Share2,
  ArrowRight,
  Star,
  Heart,
  Gift,
  ArrowLeft,
  MapPin,
  CreditCard
} from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const euroFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

const OrderConfirmation = () => {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch order details
  const { data: orderData, isLoading, error } = useQuery(
    ['order', orderId],
    () => ordersAPI.getById(orderId),
    {
      enabled: !!orderId,
      onError: (error) => {
        if (error.response?.status === 404) {
          toast.error('Order not found');
          navigate('/customer/orders');
        }
      }
    }
  );

  // Handle invoice download
  const handleDownloadInvoice = async () => {
    try {
      const response = await ordersAPI.downloadInvoice(orderId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement de la facture :', error);
      toast.error('Échec du téléchargement de la facture. Veuillez réessayer plus tard.');
    }
  };

  // Celebrate effect
  useEffect(() => {
    if (orderData?.data) {
      // Show success message
      toast.success('🎉 Commande passée avec succès !', {
        duration: 5000,
        style: {
          background: '#10B981',
          color: 'white',
        },
      });
    }
  }, [orderData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !orderData?.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Commande introuvable</h2>
          <p className="text-gray-600 mb-4">Impossible de trouver les détails de votre commande.</p>
          <Link to="/customer/orders">
            <Button>Voir toutes les commandes</Button>
          </Link>
        </div>
      </div>
    );
  }

  const order = orderData.data;
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5); // 5 days from now

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Commande confirmée ! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Merci pour votre achat, {user?.firstName}!
          </p>
          <div className="bg-white rounded-lg shadow-sm p-6 inline-block">
            <p className="text-sm text-gray-600 mb-1">Numéro de commande</p>
            <p className="text-2xl font-bold text-primary-600">#{order.id.slice(-8)}</p>
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Statut de commande</h2>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">Confirmée</span>
              <span className="text-xs text-gray-500 mt-1">À l'instant</span>
            </div>
            
            <div className="flex-1 h-px bg-gray-200 mx-4" />
            
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                order.orderStatus === 'PROCESSING' || order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED'
                  ? 'bg-green-500' : 'bg-gray-200'
              }`}>
                <Package className={`h-6 w-6 ${
                  order.orderStatus === 'PROCESSING' || order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED'
                    ? 'text-white' : 'text-gray-400'
                }`} />
              </div>
              <span className={`text-sm font-medium ${
                order.orderStatus === 'PROCESSING' || order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED'
                  ? 'text-green-600' : 'text-gray-400'
              }`}>
                En cours
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {order.orderStatus === 'PROCESSING' ? 'En cours' : 'En attente'}
              </span>
            </div>
            
            <div className="flex-1 h-px bg-gray-200 mx-4" />
            
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED'
                  ? 'bg-green-500' : 'bg-gray-200'
              }`}>
                <Truck className={`h-6 w-6 ${
                  order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED'
                    ? 'text-white' : 'text-gray-400'
                }`} />
              </div>
              <span className={`text-sm font-medium ${
                order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED'
                  ? 'text-green-600' : 'text-gray-400'
              }`}>
                Expédié
              </span>
              <span className="text-xs text-gray-500 mt-1">
                Est. {estimatedDelivery.toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex-1 h-px bg-gray-200 mx-4" />
            
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                order.orderStatus === 'DELIVERED' ? 'bg-green-500' : 'bg-gray-200'
              }`}>
                <Gift className={`h-6 w-6 ${
                  order.orderStatus === 'DELIVERED' ? 'text-white' : 'text-gray-400'
                }`} />
              </div>
              <span className={`text-sm font-medium ${
                order.orderStatus === 'DELIVERED' ? 'text-green-600' : 'text-gray-400'
              }`}>
                Delivered
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {order.orderStatus === 'DELIVERED' ? 'Complété' : 'En attente'}
              </span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé de la commande</h2>
          
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.productName}</h3>
                  <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                  <p className="text-sm text-gray-600">${item.unitPrice.toFixed(2)} par unité</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${item.totalPrice.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 mt-6 pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total</span>
                <span className="text-gray-900">{euroFormatter.format(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taxes</span>
                <span className="text-gray-900">{euroFormatter.format(order.tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Livraison</span>
                <span className="text-gray-900">
                  {order.shippingCost === 0 ? 'Free' : euroFormatter.format(order.shippingCost)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-gray-900">Total</span>
                  <span className="text-primary-600">{euroFormatter.format(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Adresse de Livraison</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="pt-2">{order.shippingAddress.phoneNumber}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Information de paiement</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Methode de paiement:</span>
                <span className="font-medium text-gray-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Statut de paiement:</span>
                <span className={`font-medium ${
                  order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Date de commande:</span>
                <span className="font-medium text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`/customer/orders/${order.id}`}>
              <Button className="w-full sm:w-auto">
                <Package className="h-4 w-4 mr-2" />
                Voir les détails de commande
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={handleDownloadInvoice}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger le reçu
            </Button>
            
            <Button variant="outline" className="w-full sm:w-auto">
              <Share2 className="h-4 w-4 mr-2" />
              Partager la commande
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-4">
              Nous vous enverrons des mises à jour par email et SMS concernant le statut de votre commande.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/products">
                <Button variant="outline" size="sm">
                  Continuer vos achats
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/customer/orders">
                <Button variant="outline" size="sm">
                  Voir toutes les commandes 
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Section d'aide */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Une question sur votre commande ? {' '}
            <Link to="/contact" className="text-primary-600 hover:text-primary-700 font-medium">
              Contactez-nous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;