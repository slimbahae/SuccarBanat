import React from 'react';
import { useQuery } from 'react-query';
import { giftCardsAPI } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const euroFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

const statusLabels = {
  ACTIVE: 'Active',
  REDEEMED: 'Utilisée',
  EXPIRED: 'Expirée'
};

const typeLabels = {
  BALANCE: 'Solde',
  SERVICE: 'Service'
};

const GiftCardsReceived = () => {
  const { data, isLoading, error } = useQuery('giftcards-received', giftCardsAPI.getReceived);
  const cards = data?.data || [];

  if (isLoading) return <div className="flex justify-center mt-12"><LoadingSpinner /></div>;
  if (error) return <div className="text-center text-red-600 mt-8">Erreur lors du chargement des cartes cadeaux reçues.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Cartes cadeaux reçues</h1>
      {cards.length === 0 ? (
        <div className="text-center text-gray-500">Aucune carte cadeau reçue pour le moment.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Expéditeur</th>
                <th className="px-4 py-2">Montant</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Expiration</th>
                <th className="px-4 py-2">Message</th>
                <th className="px-4 py-2">Date de réception</th>
                <th className="px-4 py-2">Date d'utilisation</th>
              </tr>
            </thead>
            <tbody>
              {cards.map(card => (
                <tr key={card.id || card._id} className="border-t">
                  <td className="px-4 py-2">{typeLabels[card.type] || card.type}</td>
                  <td className="px-4 py-2">{card.senderName}<br /><span className="text-xs text-gray-500">{card.senderEmail}</span></td>
                  <td className="px-4 py-2">{euroFormatter.format(card.amount)}</td>
                  <td className="px-4 py-2">{statusLabels[card.status] || card.status}</td>
                  <td className="px-4 py-2">{card.expirationDate ? new Date(card.expirationDate).toLocaleDateString('fr-FR') : '-'}</td>
                  <td className="px-4 py-2">{card.message || '-'}</td>
                  <td className="px-4 py-2">{card.receivedDate ? new Date(card.receivedDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                  <td className="px-4 py-2">{card.status === 'REDEEMED' && card.redeemedDate ? new Date(card.redeemedDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GiftCardsReceived; 