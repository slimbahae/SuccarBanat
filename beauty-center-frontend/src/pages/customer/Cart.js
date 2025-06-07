import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Tag,
  Truck
} from 'lucide-react';
import { cartAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const Cart = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch cart data
  const { data: cartData, isLoading, error } = useQuery(
    'cart',
    cartAPI.get,
    {
      retry: 1,
      onError: (error) => {
        console.error('Cart fetch error:', error);
        if (error.response?.status === 401) {
          toast.error('Please log in to view your cart');
          navigate('/login');
        } else {
          toast.error('Failed to load cart');
        }
      }
    }
  );

  // Update cart item mutation
  const updateCartMutation = useMutation(
    ({ productId, quantity }) => cartAPI.updateItem(productId, { quantity }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
        toast.success('Cart updated');
      },
      onError: (error) => {
        console.error('Update cart error:', error);
        toast.error(error.response?.data?.message || 'Failed to update cart');
      },
    }
  );

  // Remove cart item mutation
  const removeCartMutation = useMutation(
    (productId) => cartAPI.removeItem(productId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
        toast.success('Item removed from cart');
      },
      onError: (error) => {
        console.error('Remove item error:', error);
        toast.error(error.response?.data?.message || 'Failed to remove item');
      },
    }
  );

  // Clear cart mutation
  const clearCartMutation = useMutation(
    () => cartAPI.clear(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
        toast.success('Cart cleared');
      },
      onError: (error) => {
        console.error('Clear cart error:', error);
        toast.error(error.response?.data?.message || 'Failed to clear cart');
      },
    }
  );

  const handleQuantityChange = (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateCartMutation.mutate({ productId, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (productId) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      removeCartMutation.mutate(productId);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      clearCartMutation.mutate();
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
        <div className="text-center max-w-md">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Cart</h2>
          <p className="text-gray-600 mb-4">
            {error.response?.status === 401 
              ? 'Please log in to view your cart'
              : 'There was an error loading your cart. Please try again.'}
          </p>
          <div className="space-x-3">
            <Link to="/products">
              <Button>Continue Shopping</Button>
            </Link>
            {error.response?.status === 401 && (
              <Link to="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const cart = cartData?.data;
  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 50 ? 0 : 5; // Free shipping over $50
  const total = subtotal + tax + shipping;
  const isCartEmpty = items.length === 0;

  if (isCartEmpty) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/products" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Continue Shopping
          </Link>

          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link to="/products">
              <Button size="lg">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/products" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Continue Shopping
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
          </div>
          
          {items.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearCart}
              loading={clearCartMutation.isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          )}
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Cart Items */}
          <div className="lg:col-span-7">
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-4 py-6 sm:px-6">
                <div className="flow-root">
                  <ul className="-my-6 divide-y divide-gray-200">
                    {items.map((item) => (
                      <li key={item.productId} className="py-6 flex">
                        <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-full h-full object-center object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <ShoppingBag className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div className="ml-4 flex-1 flex flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3>
                                <Link 
                                  to={`/products/${item.productId}`}
                                  className="hover:text-primary-600"
                                >
                                  {item.productName}
                                </Link>
                              </h3>
                              <p className="ml-4">${item.totalPrice.toFixed(2)}</p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              ${item.unitPrice.toFixed(2)} each
                            </p>
                          </div>
                          <div className="flex-1 flex items-end justify-between text-sm">
                            <div className="flex items-center space-x-3">
                              <span className="text-gray-500">Qty:</span>
                              <div className="flex items-center border border-gray-300 rounded-md">
                                <button
                                  onClick={() => handleQuantityChange(item.productId, item.quantity, -1)}
                                  disabled={item.quantity <= 1 || updateCartMutation.isLoading}
                                  className="p-1 hover:bg-gray-100 disabled:opacity-50"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="px-3 py-1 text-gray-900 font-medium">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item.productId, item.quantity, 1)}
                                  disabled={updateCartMutation.isLoading}
                                  className="p-1 hover:bg-gray-100 disabled:opacity-50"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="flex">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.productId)}
                                disabled={removeCartMutation.isLoading}
                                className="font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-16 lg:mt-0 lg:col-span-5">
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-4 py-6 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-600">Shipping</span>
                      {shipping === 0 && (
                        <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          FREE
                        </span>
                      )}
                    </div>
                    <span className="text-gray-900">
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <div className="mt-6">
                  <Link to="/customer/checkout">
                    <Button className="w-full" size="lg">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Proceed to Checkout
                    </Button>
                  </Link>
                </div>

                {/* Benefits */}
                <div className="mt-6 text-center text-sm text-gray-500">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 mr-1" />
                      <span>Free shipping over $50</span>
                    </div>
                  </div>
                  <p className="mt-2">
                    <Tag className="h-4 w-4 inline mr-1" />
                    30-day return policy
                  </p>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="mt-6 bg-white shadow-sm rounded-lg">
              <div className="px-4 py-6 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Promo Code</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <Button variant="outline">Apply</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;