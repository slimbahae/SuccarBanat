import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  CreditCard,
  Shield,
  CheckCircle,
  MapPin,
  User,
  Lock
} from "lucide-react";
import { cartAPI, ordersAPI, paymentAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/UI/Button";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import toast from "react-hot-toast";
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Initialize Stripe promise outside component to prevent re-creation
const stripePromise = loadStripe(".");

const CheckoutForm = ({ 
  clientSecret, 
  isProcessing, 
  setIsProcessing, 
  getValuesFromParentForm, 
  checkoutMutation, 
  createPaymentIntentMutation, 
  total, 
  onStripeReady, 
  paymentMethod 
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleStripePayment = useCallback(async () => {
    if (!stripe || !elements) {
      toast.error("Stripe has not loaded yet. Please wait and try again.");
      return;
    }

    if (!clientSecret) {
      toast.error("Payment not initialized. Please try again.");
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error("Card input is not available.");
      setIsProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: getValuesFromParentForm("fullName"),
            email: getValuesFromParentForm("email"),
            phone: getValuesFromParentForm("phoneNumber"),
            address: {
              line1: getValuesFromParentForm("addressLine1"),
              line2: getValuesFromParentForm("addressLine2") || "",
              city: getValuesFromParentForm("city"),
              state: getValuesFromParentForm("state"),
              postal_code: getValuesFromParentForm("postalCode"),
              country: getValuesFromParentForm("country"),
            },
          },
        },
      });

      if (error) {
        let errorMessage = "Payment failed. Please try again.";
        if (error.type === "card_error") {
          errorMessage = error.message;
        } else if (error.type === "validation_error") {
          errorMessage = "Please check your card details and try again.";
        }
        toast.error(errorMessage);
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        const formData = getValuesFromParentForm();
        const checkoutData = {
          ...formData,
          paymentMethod: "STRIPE",
          paymentIntentId: paymentIntent.id,
          paymentMethodId: paymentIntent.payment_method,
        };
        checkoutMutation.mutate(checkoutData);
      } else {
        toast.error("Payment was not completed successfully. Please try again.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("An unexpected error occurred while processing payment. Please try again.");
      setIsProcessing(false);
    }
  }, [stripe, elements, clientSecret, setIsProcessing, getValuesFromParentForm, checkoutMutation]);

  useEffect(() => {
    if (stripe && elements && clientSecret) {
      onStripeReady(() => handleStripePayment);
    }
  }, [stripe, elements, clientSecret, onStripeReady, handleStripePayment]);

  useEffect(() => {
    if (
      !clientSecret &&
      !createPaymentIntentMutation.isLoading &&
      !isProcessing &&
      total > 0 &&
      paymentMethod === "STRIPE"
    ) {
      createPaymentIntentMutation.mutate({
        amount: Math.round(total * 100), // Convert to cents
        currency: "usd",
        customerEmail: getValuesFromParentForm("email"),
        description: `Beauty Center Order - ${getValuesFromParentForm("fullName")}`,
      });
    }
  }, [clientSecret, createPaymentIntentMutation, isProcessing, total, paymentMethod, getValuesFromParentForm]);

  if (paymentMethod !== "STRIPE") {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      {clientSecret ? (
        <>
          <div className="flex items-center mb-4">
            <Lock className="h-4 w-4 text-green-600 mr-2" />
            <p className="text-sm text-gray-600">
              Your payment information is secure and encrypted by Stripe
            </p>
          </div>
          <div className="border border-gray-300 rounded-md p-3 bg-white">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                    fontSmoothing: "antialiased",
                    "::placeholder": { 
                      color: "#aab7c4" 
                    },
                  },
                  invalid: { 
                    color: "#9e2146",
                    iconColor: "#9e2146"
                  },
                },
                hidePostalCode: true,
              }}
            />
          </div>
          {(isProcessing || createPaymentIntentMutation.isLoading) && (
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <LoadingSpinner size="small" />
              <span className="ml-2">Processing payment...</span>
            </div>
          )}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 text-sm text-blue-800 bg-blue-50 p-3 rounded">
              <strong>Test Cards:</strong><br/>
              • 4242 4242 4242 4242 (Visa)<br/>
              • 4000 0566 5566 5556 (Visa Debit)<br/>
              • 5555 5555 5555 4444 (Mastercard)<br/>
              Use any future expiry date and any 3-digit CVC
            </div>
          )}
        </>
      ) : (
        <div className="mt-4 flex items-center text-sm text-gray-600">
          <LoadingSpinner size="small" />
          <span className="ml-2">Preparing secure payment...</span>
        </div>
      )}
    </div>
  );
};

// Wrapper component to handle Stripe loading
const StripeElementsWrapper = ({ children }) => {
  const [stripeLoaded, setStripeLoaded] = useState(false);

  useEffect(() => {
    const checkStripe = async () => {
      try {
        const stripe = await stripePromise;
        if (stripe) {
          setStripeLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load Stripe:', error);
        toast.error('Failed to load payment system. Please refresh the page.');
      }
    };

    checkStripe();
  }, []);

  if (!stripeLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="large" />
        <span className="ml-3 text-gray-600">Loading payment system...</span>
      </div>
    );
  }

  const elementsOptions = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#4F46E5',
        colorBackground: '#ffffff',
        colorText: '#1F2937',
        colorDanger: '#EF4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '4px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      {children}
    </Elements>
  );
};

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [clientSecret, setClientSecret] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripePaymentTrigger, setStripePaymentTrigger] = useState(null);

  const { data: cartData, isLoading: cartLoading } = useQuery("cart", cartAPI.get);

  const { register, handleSubmit, formState: { errors }, watch, getValues, trigger } = useForm({
    defaultValues: {
      fullName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      paymentMethod: "STRIPE",
    },
  });

  const paymentMethod = watch("paymentMethod");

  const cart = cartData?.data;
  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const tax = subtotal * 0.1;
  const shipping = subtotal >= 50 ? 0 : 5;
  const total = subtotal + tax + shipping;

  const createPaymentIntentMutation = useMutation(
    (paymentData) => paymentAPI.createPaymentIntent(paymentData),
    {
      onSuccess: (response) => {
        console.log("Payment intent created:", response.data);
        setClientSecret(response.data.clientSecret);
      },
      onError: (error) => {
        console.error("Payment intent error:", error);
        toast.error("Failed to initialize payment: " + (error.response?.data?.message || error.message));
        setIsProcessing(false);
      },
    }
  );

  const checkoutMutation = useMutation(
    (checkoutData) => ordersAPI.checkout(checkoutData),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries("cart");
        queryClient.invalidateQueries("customer-orders");
        toast.success("Order placed successfully!");
        navigate(`/customer/order-confirmation/${response.data.id}`);
      },
      onError: (error) => {
        console.error("Checkout error:", error);
        toast.error(error.response?.data?.message || "Checkout failed");
        setIsProcessing(false);
      },
    }
  );

  const onSubmit = async (data) => {
    if (currentStep === 1) {
      const isValid = await trigger();
      if (!isValid) {
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (paymentMethod === "STRIPE") {
        if (stripePaymentTrigger) {
          await stripePaymentTrigger();
        } else {
          toast.error("Payment system not ready. Please wait a moment and try again.");
        }
      } else {
        setCurrentStep(3);
      }
    } else {
      if (paymentMethod !== "STRIPE") {
        setIsProcessing(true);
        checkoutMutation.mutate(data);
      }
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
    { id: 1, name: "Shipping Information", icon: User },
    { id: 2, name: "Payment Method", icon: CreditCard },
    { id: 3, name: "Review Order", icon: CheckCircle },
  ];

  const countryOptions = [
    { value: "", label: "Select Country" },
    { value: "US", label: "United States" },
    { value: "CA", label: "Canada" },
    { value: "GB", label: "United Kingdom" },
    { value: "FR", label: "France" },
    { value: "DE", label: "Germany" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to="/customer/cart" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? "bg-primary-600 border-primary-600 text-white" 
                    : "border-gray-300 text-gray-500"
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.id ? "text-primary-600" : "text-gray-500"
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`mx-4 h-px w-12 ${
                    currentStep > step.id ? "bg-primary-600" : "bg-gray-300"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <StripeElementsWrapper>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
              <div className="lg:col-span-7">
                {currentStep === 1 && (
                  <div className="bg-white shadow-sm rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                      <MapPin className="h-5 w-5 inline mr-2" />
                      Shipping Information
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          className="input"
                          {...register("fullName", { required: "Full name is required" })}
                        />
                        {errors.fullName && (
                          <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          className="input"
                          {...register("email", { 
                            required: "Email is required",
                            pattern: {
                              value: /^\S+@\S+$/i,
                              message: "Invalid email address"
                            }
                          })}
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          id="phoneNumber"
                          type="tel"
                          className="input"
                          {...register("phoneNumber", { required: "Phone number is required" })}
                        />
                        {errors.phoneNumber && (
                          <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-2">
                          Address Line 1
                        </label>
                        <input
                          id="addressLine1"
                          type="text"
                          className="input"
                          {...register("addressLine1", { required: "Address is required" })}
                        />
                        {errors.addressLine1 && (
                          <p className="mt-1 text-sm text-red-600">{errors.addressLine1.message}</p>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-2">
                          Address Line 2 (Optional)
                        </label>
                        <input
                          id="addressLine2"
                          type="text"
                          className="input"
                          {...register("addressLine2")}
                        />
                      </div>

                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          id="city"
                          type="text"
                          className="input"
                          {...register("city", { required: "City is required" })}
                        />
                        {errors.city && (
                          <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <input
                          id="state"
                          type="text"
                          className="input"
                          {...register("state", { required: "State is required" })}
                        />
                        {errors.state && (
                          <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                          Postal Code
                        </label>
                        <input
                          id="postalCode"
                          type="text"
                          className="input"
                          {...register("postalCode", { required: "Postal code is required" })}
                        />
                        {errors.postalCode && (
                          <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <select
                          id="country"
                          className="input"
                          {...register("country", { required: "Country is required" })}
                        >
                          {countryOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {errors.country && (
                          <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="bg-white shadow-sm rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                      <CreditCard className="h-5 w-5 inline mr-2" />
                      Payment Method
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          id="stripe"
                          type="radio"
                          value="STRIPE"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          {...register("paymentMethod")}
                        />
                        <label htmlFor="stripe" className="ml-3 block text-sm font-medium text-gray-700">
                          Credit/Debit Card (Stripe)
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="paypal"
                          type="radio"
                          value="PAYPAL"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          {...register("paymentMethod")}
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
                          {...register("paymentMethod")}
                        />
                        <label htmlFor="bank_transfer" className="ml-3 block text-sm font-medium text-gray-700">
                          Bank Transfer
                        </label>
                      </div>
                    </div>

                    <CheckoutForm 
                      clientSecret={clientSecret} 
                      isProcessing={isProcessing}
                      setIsProcessing={setIsProcessing}
                      getValuesFromParentForm={getValues}
                      createPaymentIntentMutation={createPaymentIntentMutation}
                      checkoutMutation={checkoutMutation}
                      total={total}
                      onStripeReady={setStripePaymentTrigger}
                      paymentMethod={paymentMethod}
                    />

                    {paymentMethod === "PAYPAL" && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          You will be redirected to PayPal to complete your payment.
                        </p>
                      </div>
                    )}

                    {paymentMethod === "BANK_TRANSFER" && (
                      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          Bank transfer instructions will be provided after order confirmation.
                          Your order will be processed once payment is received.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="bg-white shadow-sm rounded-lg p-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-6">
                        <CheckCircle className="h-5 w-5 inline mr-2" />
                        Review Your Order
                      </h2>
                      
                      <div className="space-y-4">
                        {cart?.items?.map((item) => (
                          <div key={item.productId || item._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName}
                                  className="w-full h-full object-center object-cover"
                                />
                              ) : (
                                <div className="w-full h-16 bg-gray-100" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">{item.productName}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>Qty: {item.quantity}</span>
                                <span>${item.unitPrice.toFixed(2)} each</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">${item.totalPrice.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white shadow-sm rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-lg">
                          <CreditCard className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {paymentMethod === "STRIPE" && "Credit/Debit Card (Stripe)"}
                            {paymentMethod === "PAYPAL" && "PayPal"}
                            {paymentMethod === "BANK_TRANSFER" && "Bank Transfer"}
                          </p>
                          {paymentMethod === "STRIPE" && (
                            <p className="text-sm text-gray-600">Payment will be processed securely via Stripe</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Order Terms</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Free shipping on orders over $50</li>
                        <li>• 30-day return policy for unopened items</li>
                        <li>• Order confirmation will be sent via email</li>
                        <li>• Estimated delivery: 3-5 business days</li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-between">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      disabled={isProcessing}
                    >
                      Back
                    </Button>
                  )}
                  
                  <Button
                    type="submit"
                    loading={isProcessing || createPaymentIntentMutation.isLoading}
                    className={currentStep === 1 ? "w-full" : "ml-auto"}
                    disabled={isProcessing}
                  >
                    {currentStep === 3 ? 
                      (isProcessing ? "Processing Payment..." : "Place Order") : 
                      "Continue"
                    }
                  </Button>
                </div>
              </div>

              <div className="mt-10 lg:mt-0 lg:col-span-5">
                <div className="bg-white shadow-sm rounded-lg sticky top-8">
                  <div className="px-4 py-6 sm:px-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                    
                    <div className="flow-root">
                      <ul className="-my-4 divide-y divide-gray-200">
                        {cart?.items?.map((item) => (
                          <li key={item.productId || item._id} className="py-4 flex">
                            <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName}
                                  className="w-full h-full object-center object-cover"
                                />
                              ) : (
                                <div className="w-full h-16 bg-gray-100" />
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
                        <span className="text-gray-900">${cart?.subtotal?.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span className="text-gray-900">${(cart?.subtotal * 0.1)?.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <span className="text-gray-600">Shipping</span>
                          {cart?.subtotal >= 50 && (
                            <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              FREE
                            </span>
                          )}
                        </div>
                        <span className="text-gray-900">
                          {cart?.subtotal >= 50 ? "Free" : "$5.00"}
                        </span>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <span>Total</span>
                          <span>${total?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
                      <Shield className="h-4 w-4 mr-2 text-green-500" />
                      Secure checkout with SSL encryption
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </StripeElementsWrapper>
      </div>
    </div>
  );
};

export default Checkout;