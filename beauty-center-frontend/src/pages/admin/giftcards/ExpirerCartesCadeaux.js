import React, { useState } from 'react';
import { giftCardsAPI } from '../../../services/api';
import Button from '../../../components/UI/Button';

const ExpirerCartesCadeaux = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExpire = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await giftCardsAPI.adminExpire();
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'expiration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Expirer les cartes cadeaux</h2>
      <Button onClick={handleExpire} disabled={loading}>
        {loading ? 'Expiration...' : 'Expirer les cartes cadeaux'}
      </Button>
      {error && <div className="mt-4 text-red-600">{error}</div>}
      {message && <div className="mt-4 text-green-700">{message}</div>}
    </div>
  );
};

export default ExpirerCartesCadeaux; 