import React, { useState } from 'react';
import { giftCardsAPI } from '../../../services/api';
import Button from '../../../components/UI/Button';

const MarquerCarteServiceUtilisee = () => {
  const [giftCardId, setGiftCardId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await giftCardsAPI.adminMarkUsed(giftCardId);
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du marquage.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Marquer une carte de service comme utilisée</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">ID de la carte cadeau</label>
          <input
            type="text"
            value={giftCardId}
            onChange={e => setGiftCardId(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Traitement...' : 'Marquer comme utilisée'}
        </Button>
      </form>
      {error && <div className="mt-4 text-red-600">{error}</div>}
      {message && <div className="mt-4 text-green-700">{message}</div>}
    </div>
  );
};

export default MarquerCarteServiceUtilisee; 