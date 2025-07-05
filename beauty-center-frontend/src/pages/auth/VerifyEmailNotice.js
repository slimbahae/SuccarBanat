import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/UI/Button';
import { authAPI } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const VerifyEmailNotice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Email transmis via state lors de la redirection
  const email = location.state?.email;
  const [resendStatus, setResendStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Redirection automatique si token dans l'URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      navigate(`/verify-email/result?token=${token}`, { replace: true });
    }
  }, [searchParams, navigate]);

  const handleResend = async () => {
    setLoading(true);
    setResendStatus(null);
    try {
      const res = await authAPI.resendVerification(email);
      setResendStatus(res.data.message);
    } catch {
      setResendStatus("Erreur lors de l'envoi.");
    }
    setLoading(false);
  };

  if (!email) {
    // Si pas d'email, retour à l'accueil
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow max-w-sm w-full text-center">
        <div className="flex flex-col items-center mb-4">
          <LoadingSpinner className="w-10 h-10 text-primary-600 mb-2" />
          <h2 className="text-xl font-bold text-green-700 mb-2">Inscription réussie !</h2>
        </div>
        <p className="mb-2 text-gray-700">Un email de vérification a été envoyé à :</p>
        <p className="mb-4 font-semibold text-primary-700">{email}</p>
        <p className="mb-4 text-gray-600">Veuillez vérifier votre boîte de réception (et vos spams) pour valider votre compte.</p>
        <Button onClick={handleResend} loading={loading} className="w-full mb-2">
          Renvoyer l'email de vérification
        </Button>
        {resendStatus && <div className="mt-2 text-sm text-gray-700">{resendStatus}</div>}
      </div>
    </div>
  );
};

export default VerifyEmailNotice; 