import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  ArrowLeft,
  CreditCard,
  Shield,
  CheckCircle,
  MapPin,
  User,
  Phone,
  Mail,
  Lock
} from 'lucide-react';
import { cartAPI, ordersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);

  // Fetch cart data
  const { data: cartData, isLoading: cartLoading } = useQuery('cart', cartAPI.get);

  // Checkout mutation
  const checkoutMutation = useMutation(
    (checkoutData) => ordersAPI.checkout(checkoutData),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('cart');
        queryClient.invalidateQueries('customer-orders');
        toast.success('Order placed successfully!');
        // Redirect to order confirmation page
        navigate(`/customer/order-confirmation/${response.data.id}`);
      },
      onError: (error) => {
        console.error('Checkout error:', error);
        toast.error(error.response?.data?.message || 'Checkout failed');
      },
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      paymentMethod: 'CREDIT_CARD',
    },
  });

  const cart = cartData?.data;
  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const tax = subtotal * 0.1;
  const shipping = subtotal > 50 ? 0 : 5;
  const total = subtotal + tax + shipping;

  const paymentMethod = watch('paymentMethod');

  const onSubmit = (data) => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else {
      // Final checkout
      checkoutMutation.mutate(data);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!cart || items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-4">Add some items to your cart before checking out.</p>
          <Link to="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, name: 'Shipping Information', icon: User },
    { id: 2, name: 'Payment Method', icon: CreditCard },
    { id: 3, name: 'Review Order', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/customer/cart" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-primary-600 border-primary-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.id ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`mx-4 h-px w-12 ${
                    currentStep > step.id ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            {/* Main Content */}
            <div className="lg:col-span-7">
              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">
                    <MapPin className="h-5 w-5 inline mr-2" />
                    Shipping Information
                  </h2>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="input"
                        {...register('fullName', { required: 'Full name is required' })}
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        className="input"
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Invalid email address'
                          }
                        })}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="input"
                        {...register('phoneNumber', { required: 'Phone number is required' })}
                      />
                      {errors.phoneNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        className="input"
                        {...register('addressLine1', { required: 'Address is required' })}
                      />
                      {errors.addressLine1 && (
                        <p className="mt-1 text-sm text-red-600">{errors.addressLine1.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        className="input"
                        {...register('addressLine2')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        className="input"
                        {...register('city', { required: 'City is required' })}
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        className="input"
                        {...register('state', { required: 'State is required' })}
                      />
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        className="input"
                        {...register('postalCode', { required: 'Postal code is required' })}
                      />
                      {errors.postalCode && (
                        <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <select
                        className="input"
                        {...register('country', { required: 'Country is required' })}
                      >
                        <option value="">Select Country</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="FR">France</option>
                        <option value="DE">Germany</option>
                      </select>
                      {errors.country && (
                        <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === 2 && (
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">
                    <CreditCard className="h-5 w-5 inline mr-2" />
                    Payment Method
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        id="credit_card"
                        type="radio"
                        value="CREDIT_CARD"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        {...register('paymentMethod')}
                      />
                      <label htmlFor="credit_card" className="ml-3 block text-sm font-medium text-gray-700">
                        Credit Card
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="paypal"
                        type="radio"
                        value="PAYPAL"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        {...register('paymentMethod')}
                      />
                      <label htmlFor="paypal" className="ml-3 block text-sm font-medium text-gray-700">
                        PayPal
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="bank_transfer"
                        type="radio"
                        value="BANK_TRANSFER"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        {...register('paymentMethod')}
                      />
                      <label htmlFor="bank_transfer" className="ml-3 block text-sm font-medium text-gray-700">
                        Bank Transfer
                      </label>
                    </div>
                  </div>

                  {paymentMethod === 'CREDIT_CARD' && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-4">
                        <Lock className="h-4 w-4 inline mr-1" />
                        Your payment information is secure and encrypted
                      </p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            placeholder="123"
                            className="input"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Review Order */}
              {currentStep === 3 && (
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">
                    <CheckCircle className="h-5 w-5 inline mr-2" />
                    Review Your Order
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Order Items */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Order Items</h3>
                      <ul className="divide-y divide-gray-200">
                        {items.map((item) => (
                          <li key={item.productId} className="py-3 flex justify-between">
                            <div className="flex">
                              <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.productName}
                                    className="w-full h-full object-center object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100" />
                                )}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-gray-900">${item.totalPrice.toFixed(2)}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Shipping Address</h3>
                      <div className="text-sm text-gray-600">
                        <p>{watch('fullName')}</p>
                        <p>{watch('addressLine1')}</p>
                        {watch('addressLine2') && <p>{watch('addressLine2')}</p>}
                        <p>{watch('city')}, {watch('state')} {watch('postalCode')}</p>
                        <p>{watch('country')}</p>
                        <p className="mt-1">
                          <Phone className="h-4 w-4 inline mr-1" />
                          {watch('phoneNumber')}
                        </p>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Payment Method</h3>
                      <p className="text-sm text-gray-600">
                        {paymentMethod === 'CREDIT_CARD' && 'Credit Card'}
                        {paymentMethod === 'PAYPAL' && 'PayPal'}
                        {paymentMethod === 'BANK_TRANSFER' && 'Bank Transfer'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-6 flex justify-between">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    Back
                  </Button>
                )}
                
                <Button
                  type="submit"
                  loading={checkoutMutation.isLoading}
                  className={currentStep === 1 ? 'w-full' : 'ml-auto'}
                >
                  {currentStep === 3 ? 'Place Order' : 'Continue'}
                </Button>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="mt-10 lg:mt-0 lg:col-span-5">
              <div className="bg-white shadow-sm rounded-lg sticky top-8">
                <div className="px-4 py-6 sm:px-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                  
                  <div className="flow-root">
                    <ul className="-my-4 divide-y divide-gray-200">
                      {items.map((item) => (
                        <li key={item.productId} className="py-4 flex">
                          <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                className="w-full h-full object-center object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100" />
                            )}
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between text-sm">
                              <h3 className="font-medium text-gray-900">{item.productName}</h3>
                              <p className="text-gray-900">${item.totalPrice.toFixed(2)}</p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-gray-200 mt-6 pt-6 space-y-4">
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
                        {shipping === 0 ? 'Free' : `${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
                    <Shield className="h-4 w-4 mr-2 text-green-500" />
                    Secure checkout with SSL encryption
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;