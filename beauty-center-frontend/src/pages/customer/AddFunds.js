import React, { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { ArrowLeft, CreditCard, Wallet, Plus, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { balanceAPI, paymentAPI } from '../../services/api';
import { useBalance } from '../../contexts/BalanceContext';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Initialize Stripe promise outside component to prevent re-creation
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const AddFundsForm = ({ amount, onAmountChange, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { refreshBalance } = useBalance();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  const createPaymentIntentMutation = useMutation(
    (paymentData) => paymentAPI.createPaymentIntent(paymentData),
    {
      onSuccess: (response) => {
        console.log("Intention de paiement créée :", response.data);
        setClientSecret(response.data.clientSecret);
      },
      onError: (error) => {
        console.error("Erreur d'intention de paiement :", error);
        toast.error("Erreur d'initialisation du paiement");
        setIsProcessing(false);
      },
    }
  );

  const addFundsMutation = useMutation(
    (amount) => balanceAPI.addFunds(amount),
    {
      onSuccess: (response) => {
        toast.success(`Fonds ajoutés avec succès! +${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)}`);
        refreshBalance();
        queryClient.invalidateQueries('balance');
        onSuccess();
      },
      onError: (error) => {
        console.error('Erreur lors de l\'ajout de fonds:', error);
        toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout de fonds');
        setIsProcessing(false);
      },
    }
  );

  const handleStripePayment = useCallback(async () => {
    if (!stripe || !elements) {
      toast.error("Système de paiement non prêt");
      return;
    }

    if (!clientSecret) {
      toast.error("Paiement non initialisé");
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error("Champ de carte non disponible");
      setIsProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        let errorMessage = "Échec du paiement";
        if (error.type === "card_error") {
          errorMessage = error.message;
        } else if (error.type === "validation_error") {
          errorMessage = "Vérifiez les informations de votre carte";
        }
        toast.error(errorMessage);
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Now add funds to balance - send just the amount as expected by backend
        console.log('Payment succeeded, adding funds to balance:', {
          amountInEuros: parseFloat(amount),
          paymentIntentId: paymentIntent.id
        });
        addFundsMutation.mutate(parseFloat(amount));
      } else {
        toast.error("Paiement non réussi");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Erreur de paiement:", err);
      toast.error("Erreur inattendue");
      setIsProcessing(false);
    }
  }, [stripe, elements, clientSecret, amount, addFundsMutation]);

  useEffect(() => {
    if (amount && amount >= 5 && !clientSecret && !createPaymentIntentMutation.isLoading) {
      const amountInEuros = parseFloat(amount);
      console.log('Creating payment intent:', {
        amountInEuros: amountInEuros,
        description: `Recharge de solde - ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)}`
      });
      
      createPaymentIntentMutation.mutate({
        amount: amountInEuros, // Send in euros as backend expects
        currency: "eur",
        description: `Recharge de solde - ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)}`,
      });
    }
  }, [amount, clientSecret, createPaymentIntentMutation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (clientSecret) {
      handleStripePayment();
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Predefined Amounts */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Montants prédéfinis
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[10, 25, 50, 100, 200, 500].map((predefinedAmount) => (
            <button
              key={predefinedAmount}
              type="button"
              onClick={() => onAmountChange(predefinedAmount.toString())}
              className={`p-4 border rounded-lg text-center transition-all ${
                amount === predefinedAmount.toString()
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-semibold">{formatCurrency(predefinedAmount)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Ou entrez un montant personnalisé
        </label>
        <div className="relative">
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00"
            min="5"
            step="0.01"
            className="input pl-8 w-full"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Montant minimum: 5€
        </p>
      </div>

      {/* Stripe Card Element */}
      {amount && parseFloat(amount) >= 5 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-4">
            <Lock className="h-4 w-4 text-green-600 mr-2" />
            <p className="text-sm text-gray-600">
              Vos informations de paiement sont sécurisées et chiffrées par Stripe.
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
              <span className="ml-2">Traitement du paiement...</span>
            </div>
          )}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 text-sm text-blue-800 bg-blue-50 p-3 rounded">
              <strong>Cartes de test:</strong><br/>
              • 4242 4242 4242 4242 (Visa)<br/>
              • 4000 0566 5566 5556 (Visa Debit)<br/>
              • 5555 5555 5555 4444 (Mastercard)<br/>
              Utilisez n'importe quelle date d'expiration future et un CVC à 3 chiffres
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        loading={isProcessing || createPaymentIntentMutation.isLoading}
        disabled={!amount || parseFloat(amount) < 5 || !clientSecret}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        {isProcessing || createPaymentIntentMutation.isLoading 
          ? 'Traitement...' 
          : `Ajouter ${amount ? formatCurrency(parseFloat(amount)) : '0€'}`
        }
      </Button>
    </form>
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
        console.error('Échec du chargement de Stripe:', error);
        toast.error("Erreur de chargement du système de paiement");
      }
    };

    checkStripe();
  }, []);

  if (!stripeLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="large" />
        <span className="ml-3 text-gray-600">Chargement du système de paiement...</span>
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

const AddFunds = () => {
  const [amount, setAmount] = useState('');

  const handleAmountChange = (newAmount) => {
    setAmount(newAmount);
  };

  const handleSuccess = () => {
    setAmount('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to="/customer/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour au tableau de bord
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Ajouter des fonds</h1>
          <p className="text-gray-600 mt-2">
            Rechargez votre solde pour effectuer des achats plus rapidement
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Wallet className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recharger le solde</h2>
              <p className="text-gray-600">Choisissez le montant à ajouter</p>
            </div>
          </div>

          <StripeElementsWrapper>
            <AddFundsForm 
              amount={amount}
              onAmountChange={handleAmountChange}
              onSuccess={handleSuccess}
            />
          </StripeElementsWrapper>

          {/* Benefits */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Avantages du solde</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Paiement plus rapide lors du checkout
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Pas besoin de saisir les informations de carte à chaque fois
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Historique détaillé de vos transactions
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Solde disponible pour tous vos achats
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFunds; 