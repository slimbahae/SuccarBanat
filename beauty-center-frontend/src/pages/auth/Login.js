import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Sparkles, Mail, Lock, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/UI/Button';
import { authAPI } from '../../services/api';
import ReCAPTCHA from "react-google-recaptcha";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [verificationMessage, setVerificationMessage] = useState(null);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState(null);
  const [resendStatus, setResendStatus] = useState(null);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  // Vérification email via token dans l'URL
  useEffect(() => {
    const token = searchParams.get('verify');
    if (token) {
      authAPI.verifyEmail(token)
        .then(res => setVerificationMessage(res.data.message))
        .catch(() => setVerificationMessage("Erreur lors de la vérification de l'email."));
    }
  }, [searchParams]);

  const onSubmit = async (data) => {
    const result = await login(data);
    if (result.accessToken) {
      navigate(from, { replace: true });
    } else {
      let errorMessage = result.message || 'Une erreur inattendue s\'est produite';
      if (result && result.status === 401) {
        // Non vérifié
        errorMessage = (
          <span>
            Votre email n'est pas vérifié. <button type="button" className="underline text-primary-600" onClick={async () => {
              setResendStatus('Envoi...');
              try {
                const res = await authAPI.resendVerification(register('email').value);
                setResendStatus(res.data.message);
              } catch {
                setResendStatus("Erreur lors de l'envoi.");
              }
            }}>Renvoyer l'email de vérification</button>
            {resendStatus && <span className="block text-xs mt-1">{resendStatus}</span>}
          </span>
        );
      } else if (errorMessage.includes('User is disabled')) {
        errorMessage = 'Votre compte est désactivé. Veuillez contacter le support.';
      } else if (errorMessage.includes('Bad credentials')) {
        errorMessage = 'Email ou mot de passe invalide.';
      }
      setError('email', {
        type: 'manual',
        message: errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-8">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-2 rounded-lg">
                <img src="/logo-dark.png" alt="logo" className="h-6 w-6"/>
              </div>
              <span className="text-2xl font-serif font-bold text-gray-900">
                Succar Banat Institut
              </span>
            </Link>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Ravi de vous revoir
            </h2>
            <p className="text-gray-600 mb-8">
               Veuillez vous connecter à votre compte
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Address email 
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Entrez votre adresse email"
                  {...register('email', {
                    required: 'adresse email est requise',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Adresse email invalide',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Entrez votre mot de passe"
                  {...register('password', {
                    required: 'Le mot de passe est requis',
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Rester connecté
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-primary-600 hover:text-primary-500 underline"
                  onClick={() => setShowForgot(true)}
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={isLoading}
                disabled={isLoading}
              >
                Se connecter
              </Button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Vous n'avez pas de compte ?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Inscrivez-vous
                </Link>
              </span>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Demo Credentials:</h3>
            <div className="space-y-1 text-xs text-gray-600">
              <p><strong>Admin:</strong> admin@beautycenter.com / admin123</p>
              <p><strong>Staff:</strong> jane.smith@beautycenter.com / staff123</p>
              <p><strong>Client:</strong> alice@example.com / customer123</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://client.ludovic-godard-photo.com/wp-content/uploads/picu/collections/4227/091024-09-03-13-dounia-asri-4509%C2%A9-ludovic-godard-bd.jpg"
          alt="Dounia Asri"
        />
        <div className="absolute inset-0 bg-primary-600 opacity-75" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-4xl font-serif font-bold mb-4">
              Bienvenue à Succar Banat 
            </h2>
            <p className="text-xl opacity-90">
              Votre voyage vers une beauté éclatante commence ici
            </p>
          </div>
        </div>
      </div>

      {/* Message de vérification email */}
      {verificationMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
          {verificationMessage}
        </div>
      )}

      {/* Modal ou bloc pour mot de passe oublié */}
      {showForgot && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => { setShowForgot(false); setForgotStatus(null); }} aria-label="Fermer">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold mb-2">Réinitialiser le mot de passe</h3>
            <p className="text-sm text-gray-600 mb-2">Vous recevrez un email de réinitialisation si l'adresse existe dans notre base. Pensez à vérifier vos spams.</p>
            <input
              type="email"
              className="border p-2 w-full mb-2"
              placeholder="Votre adresse email"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
            />
            <ReCAPTCHA
              sitekey="6Lcxv3crAAAAADA8p-G5jYhVJiT96sHczlPshhqJ"
              onChange={token => {
                setRecaptchaToken(token);
                setCaptchaChecked(!!token);
              }}
              className="mb-2"
            />
            <button
              className="bg-primary-600 text-white px-4 py-2 rounded w-full"
              onClick={async () => {
                setForgotStatus('Envoi...');
                try {
                  const res = await authAPI.forgotPassword(forgotEmail, recaptchaToken);
                  setForgotStatus(res.data.message);
                } catch (err) {
                  if (err.response && err.response.data && err.response.data.message) {
                    setForgotStatus(err.response.data.message);
                  } else {
                    setForgotStatus("Erreur lors de l'envoi.");
                  }
                }
              }}
              disabled={!captchaChecked}
            >Envoyer</button>
            {forgotStatus && <div className="mt-2 text-sm text-gray-700">{forgotStatus}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;