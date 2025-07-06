import React, { useState, useEffect } from 'react';
import { useMutation } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/UI/Button';
import toast from 'react-hot-toast';
import { giftCardsAPI } from '../../services/api';
import { Gift } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const euroFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const purchaseGiftCard = async (data) => {
  return (await giftCardsAPI.purchase(data)).data;
};

const GiftCardPurchase = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    amount: '',
    type: 'BALANCE',
    purchaserEmail: user?.email || '',
    purchaserName: user?.name || '',
    recipientEmail: '',
    recipientName: '',
    message: ''
  });
  const [confirmation, setConfirmation] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [prevName, setPrevName] = useState(user?.name || '');
  const [step, setStep] = useState('form'); // 'form' | 'payment' | 'processing'
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [isPaying, setIsPaying] = useState(false);

  const mutation = useMutation(purchaseGiftCard, {
    onSuccess: (data) => {
      setConfirmation(data);
      toast.success('Carte cadeau achetée avec succès !');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Erreur lors de l'achat de la carte cadeau");
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(form.amount) < 1) {
      toast.error('Le montant doit être au moins 1€');
      return;
    }
    // Step 1: Create PaymentIntent
    setIsPaying(true);
    setPaymentError(null);
    try {
      const { data } = await api.post('/customer/gift-cards/create-payment-intent', {
        amount: Number(form.amount),
        type: form.type,
        purchaserEmail: form.purchaserEmail,
        purchaserName: form.purchaserName,
        recipientEmail: form.recipientEmail,
        recipientName: form.recipientName,
        message: form.message
      });
      setClientSecret(data.client_secret || data.clientSecret);
      setStep('payment');
    } catch (err) {
      setPaymentError(err?.response?.data?.message || "Erreur lors de la création du paiement");
    } finally {
      setIsPaying(false);
    }
  };

  // Stripe hooks must be inside Elements context
  const stripe = useStripe();
  const elements = useElements();

  // Handle Stripe payment
  const handleStripePayment = async (e) => {
    e.preventDefault();
    setIsPaying(true);
    setPaymentError(null);
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement }
    });
    if (error) {
      setPaymentError(error.message);
      setIsPaying(false);
      return;
    }
    if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Call purchase endpoint
      mutation.mutate({ ...form, paymentIntentId: paymentIntent.id });
      setStep('processing');
    } else {
      setPaymentError("Le paiement n'a pas abouti. Veuillez réessayer.");
      setIsPaying(false);
    }
  };

  const predefinedAmounts = [10, 20, 30, 50, 100];

  if (confirmation) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-16 text-center border border-[#DDCABC]">
        <Gift className="h-12 w-12 mx-auto text-[#B97230] mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-green-700">Carte cadeau achetée !</h1>
        <p className="mb-2">Votre carte cadeau a été envoyée à <span className="font-semibold">{confirmation.recipientEmail}</span>.</p>
        {confirmation.code && (
          <div className="my-4">
            <p className="font-semibold">Code de la carte cadeau :</p>
            <div className="text-lg font-mono bg-gray-100 rounded p-2 inline-block">{confirmation.code}</div>
          </div>
        )}
        <Button onClick={() => setConfirmation(null)} className="mt-4 bg-[#B97230] hover:bg-[#936342] text-white font-bold px-6 py-3 rounded-full">Acheter une autre carte</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] to-[#DDCABC]/40 py-12 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 border border-[#DDCABC]">
        <div className="flex flex-col items-center mb-6">
          <Gift className="h-14 w-14 text-[#B97230] mb-2" />
          <h1 className="text-3xl font-bold text-[#3D2118] mb-1">Offrir une carte cadeau</h1>
          <p className="text-[#B97230] text-base mb-2">Faites plaisir à vos proches avec une carte cadeau personnalisée, valable sur tous nos soins et produits.</p>
        </div>
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="col-span-1">
              <label className="block text-gray-700 mb-1 font-medium">Montant prédéfini</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {predefinedAmounts.map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    className={`px-5 py-2 rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#B97230] border-2 ${String(form.amount) === String(amt) ? 'bg-[#B97230] text-white border-[#B97230]' : 'bg-[#FFF8F0] text-[#B97230] border-[#DDCABC] hover:bg-[#DDCABC] hover:text-[#3D2118]'}`}
                    onClick={() => setForm((prev) => ({ ...prev, amount: amt }))}
                  >
                    {amt} €
                  </button>
                ))}
              </div>
              <label className="block text-gray-700 mb-1 font-medium">Montant (€)</label>
              <input
                type="number"
                name="amount"
                min="1"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#B97230]"
                required
              />
              <label className="block text-gray-700 mb-1 font-medium mt-4">Type de carte</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#B97230]"
                required
              >
                <option value="BALANCE">Solde (créditer le compte)</option>
                <option value="SERVICE">Service (utilisable pour un service)</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-gray-700 mb-1 font-medium">Votre nom</label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={e => {
                    setIsAnonymous(e.target.checked);
                    if (e.target.checked) {
                      setPrevName(form.purchaserName);
                      setForm(prev => ({ ...prev, purchaserName: 'Anonyme' }));
                    } else {
                      setForm(prev => ({ ...prev, purchaserName: prevName || '' }));
                    }
                  }}
                  className="mr-2 accent-[#B97230]"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-600 select-none">Rester anonyme</label>
              </div>
              <input
                type="text"
                name="purchaserName"
                value={form.purchaserName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#B97230]"
                disabled={isAnonymous}
              />
              <label className="block text-gray-700 mb-1 font-medium mt-4">Votre email</label>
              <input
                type="email"
                name="purchaserEmail"
                value={form.purchaserEmail}
                disabled
                className="w-full border rounded px-3 py-2 bg-gray-100"
              />
              <label className="block text-gray-700 mb-1 font-medium mt-4">Nom du destinataire</label>
              <input
                type="text"
                name="recipientName"
                value={form.recipientName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#B97230]"
                required
              />
              <label className="block text-gray-700 mb-1 font-medium mt-4">Email du destinataire</label>
              <input
                type="email"
                name="recipientEmail"
                value={form.recipientEmail}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#B97230]"
                required
              />
              <label className="block text-gray-700 mb-1 font-medium mt-4">Message (optionnel)</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#B97230]"
                rows={3}
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <Button type="submit" loading={isPaying} className="w-full bg-[#B97230] hover:bg-[#936342] text-white font-bold px-6 py-3 rounded-full mt-2">Payer par carte</Button>
              {paymentError && <div className="text-red-600 mt-2 text-center">{paymentError}</div>}
            </div>
          </form>
        )}
        {step === 'payment' && (
          <form onSubmit={handleStripePayment} className="space-y-6">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">Informations de paiement</label>
              <div className="bg-[#FFF8F0] rounded-lg p-4 border border-[#DDCABC]">
                <CardElement options={{ style: { base: { fontSize: '18px', color: '#3D2118' } } }} />
              </div>
            </div>
            <Button type="submit" loading={isPaying} className="w-full bg-[#B97230] hover:bg-[#936342] text-white font-bold px-6 py-3 rounded-full">Confirmer le paiement</Button>
            {paymentError && <div className="text-red-600 mt-2 text-center">{paymentError}</div>}
          </form>
        )}
        {step === 'processing' && (
          <div className="text-center py-12">
            <span className="text-lg text-[#B97230] font-semibold">Traitement du paiement...</span>
          </div>
        )}
      </div>
    </div>
  );
};

// StripeElementsWrapper for context safety
const StripeElementsWrapper = ({ children }) => {
  const [stripeLoaded, setStripeLoaded] = useState(false);

  useEffect(() => {
    const checkStripe = async () => {
      try {
        const stripe = await stripePromise;
        if (stripe) setStripeLoaded(true);
      } catch (error) {
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

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

export default function GiftCardPurchaseWithStripe() {
  return (
    <StripeElementsWrapper>
      <GiftCardPurchase />
    </StripeElementsWrapper>
  );
} 