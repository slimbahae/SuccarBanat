import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { giftCardsAPI } from '../../services/api';
import Button from '../../components/UI/Button';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const euroFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

const GiftCardRedeem = () => {
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const navigate = useNavigate();

  const mutation = useMutation(giftCardsAPI.redeem, {
    onSuccess: (data) => {
      setConfirmation(data.data);
      toast.success('Carte cadeau utilisée avec succès !');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Erreur lors de l'utilisation de la carte cadeau");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Veuillez entrer le code de la carte cadeau');
      return;
    }
    mutation.mutate({ code: code.trim() });
  };

  if (confirmation) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-white rounded shadow mt-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-green-700">Carte cadeau utilisée !</h1>
        <p className="mb-2">Montant crédité : <span className="font-semibold">{euroFormatter.format(confirmation.amount)}</span></p>
        <Button onClick={() => navigate('/customer/balance/history')} className="mt-4">Voir mon solde</Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-6">Utiliser une carte cadeau</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Code de la carte cadeau</label>
          <input
            type="text"
            name="code"
            value={code}
            onChange={e => setCode(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <Button type="submit" loading={mutation.isLoading} className="w-full">Utiliser</Button>
      </form>
    </div>
  );
};

export default GiftCardRedeem; 