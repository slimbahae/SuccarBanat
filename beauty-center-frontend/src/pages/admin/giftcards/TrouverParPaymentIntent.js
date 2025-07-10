import React, { useState } from 'react';
import { giftCardsAPI } from '../../../services/api';
import Button from '../../../components/UI/Button';

const TrouverParPaymentIntent = () => {
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await giftCardsAPI.adminGetByPaymentIntent(paymentIntentId);
      // Extract gift_card and payment_status from the response
      setResult({ ...res.data.gift_card, payment_status: res.data.payment_status });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la recherche.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Trouver une carte cadeau par PaymentIntent</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">ID du PaymentIntent</label>
          <input
            type="text"
            value={paymentIntentId}
            onChange={e => setPaymentIntentId(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Recherche...' : 'Trouver'}
        </Button>
      </form>
      {error && <div className="mt-4 text-red-600">{error}</div>}
      {result && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          {Array.isArray(result) ? (
            result.length === 0 ? (
              <div className="text-gray-600">Aucune carte cadeau trouvée pour ce PaymentIntent.</div>
            ) : (
              result.map((card, idx) => (
                <GiftCardDetails key={card.id || card._id || idx} card={card} />
              ))
            )
          ) : (
            <GiftCardDetails card={result} />
          )}
        </div>
      )}
    </div>
  );
};

export default TrouverParPaymentIntent;

function GiftCardDetails({ card }) {
  if (!card) return null;
  const euroFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
  const statusLabels = { ACTIVE: 'Active', REDEEMED: 'Utilisée', EXPIRED: 'Expirée' };
  const typeLabels = { BALANCE: 'Solde', SERVICE: 'Service' };
  return (
    <div className="mb-4 border-b pb-4">
      <div><b>Type:</b> {typeLabels[card.type] || card.type}</div>
      <div><b>Montant:</b> {euroFormatter.format(card.amount)}</div>
      <div><b>Statut:</b> {statusLabels[card.status] || card.status}</div>
      {card.payment_status && (
        <div><b>Statut du paiement:</b> {card.payment_status}</div>
      )}
      <div><b>Expéditeur:</b> {card.senderName} <span className="text-xs text-gray-500">{card.senderEmail}</span></div>
      <div><b>Destinataire:</b> {card.recipientName} <span className="text-xs text-gray-500">{card.recipientEmail}</span></div>
      <div><b>Date d'achat:</b> {card.purchaseDate ? new Date(card.purchaseDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</div>
      <div><b>Date d'expiration:</b> {card.expirationDate ? new Date(card.expirationDate).toLocaleDateString('fr-FR') : '-'}</div>
      <div><b>Date d'utilisation:</b> {card.redeemedDate ? new Date(card.redeemedDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</div>
      <div><b>Message:</b> {card.message || '-'}</div>
      <div><b>Token:</b> <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">{card.token}</span></div>
      <div><b>ID:</b> <span className="font-mono text-xs">{card.id || card._id}</span></div>
    </div>
  );
} 