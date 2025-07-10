import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from '../../components/UI/Button';
import { authAPI } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const EmailVerificationResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Lien de vérification invalide.');
      return;
    }
    authAPI.verifyEmail(token)
      .then(res => {
        setStatus('success');
        setMessage(res.data.message || 'Votre email a été vérifié avec succès !');
      })
      .catch(err => {
        let msg = "Erreur lors de la vérification.";
        if (err.response && err.response.data && err.response.data.message) {
          msg = err.response.data.message;
        }
        // Translate specific error message
        if (msg === 'Invalid or expired verification token') {
          msg = 'Lien de vérification invalide ou expiré.';
        }
        setStatus('error');
        setMessage(msg);
      });
  }, [token]);

  // Redirect to login after success
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 2000); // 2 seconds
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow max-w-sm w-full text-center">
        {status === 'loading' && (
          <>
            <LoadingSpinner className="w-10 h-10 text-primary-600 mb-4 mx-auto" />
            <p className="text-gray-700">Vérification en cours...</p>
          </>
        )}
        {status !== 'loading' && (
          <>
            <h2 className={`text-xl font-bold mb-2 ${status === 'success' ? 'text-green-700' : 'text-red-700'}`}>{status === 'success' ? 'Succès !' : 'Erreur'}</h2>
            <p className="mb-4 text-gray-700">{message}</p>
            <Button className="w-full" onClick={() => navigate('/login')}>Aller à la connexion</Button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationResult; 