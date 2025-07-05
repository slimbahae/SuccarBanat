import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Button from '../../components/UI/Button';
import { authAPI } from '../../services/api';
import { Lock } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await authAPI.resetPassword(token, data.password);
      setStatus({ type: 'success', message: res.data.message || 'Mot de passe réinitialisé avec succès.' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      let msg = "Erreur lors de la réinitialisation.";
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setStatus({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow max-w-sm w-full text-center">
          <h2 className="text-xl font-bold mb-2">Lien invalide</h2>
          <p className="text-gray-600">Le lien de réinitialisation est manquant ou invalide.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Nouveau mot de passe</h2>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Entrez un nouveau mot de passe"
                {...register('password', {
                  required: 'Le mot de passe est requis',
                  minLength: { value: 6, message: 'Au moins 6 caractères' },
                })}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirm"
                type="password"
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.confirm ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Confirmez le mot de passe"
                {...register('confirm', {
                  required: 'Veuillez confirmer le mot de passe',
                  validate: value => value === watch('password') || 'Les mots de passe ne correspondent pas',
                })}
              />
            </div>
            {errors.confirm && (
              <p className="mt-1 text-sm text-red-600">{errors.confirm.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" loading={loading} disabled={loading}>
            Réinitialiser
          </Button>
        </form>
        {status && (
          <div className={`mt-4 text-center text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{status.message}</div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword; 