import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Cookie, Settings, Eye, BarChart3, Target, Shield, CheckCircle } from 'lucide-react';

const Cookies = () => {
  const { t } = useTranslation();
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true, // Toujours activé
    analytics: false,
    marketing: false,
    personalization: false
  });

  // Charger les préférences depuis localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('cookiePreferences');
    if (savedPreferences) {
      setCookiePreferences(prevPreferences => ({
        ...prevPreferences,
        ...JSON.parse(savedPreferences)
      }));
    }
  }, []); // Dépendance vide car on veut charger qu'une seule fois

  // Sauvegarder les préférences
  const savePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    // Ici vous pouvez ajouter la logique pour activer/désactiver les cookies
    alert('Vos préférences ont été sauvegardées !');
  };

  const acceptAll = () => {
    const newPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true
    };
    setCookiePreferences(newPreferences);
    localStorage.setItem('cookiePreferences', JSON.stringify(newPreferences));
    alert('Tous les cookies ont été acceptés !');
  };

  const rejectAll = () => {
    const newPreferences = {
      necessary: true, // Les cookies nécessaires restent activés
      analytics: false,
      marketing: false,
      personalization: false
    };
    setCookiePreferences(newPreferences);
    localStorage.setItem('cookiePreferences', JSON.stringify(newPreferences));
    alert('Seuls les cookies nécessaires ont été conservés !');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8 lg:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Cookie className="h-12 w-12 text-primary-600" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
              Politique des Cookies
            </h1>
            <p className="text-gray-600">
              Gérez vos préférences de cookies et découvrez comment nous les utilisons
            </p>
          </div>

          {/* Cookie Preferences Panel */}
          <div className="bg-primary-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-primary-800 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Gérer mes préférences
            </h2>
            
            <div className="space-y-4">
              {/* Cookies nécessaires */}
              <div className="border border-primary-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Cookies nécessaires
                  </h3>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Toujours activé</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Ces cookies sont indispensables au fonctionnement du site et ne peuvent pas être désactivés.
                </p>
                <div className="text-xs text-gray-500">
                  Exemples : session utilisateur, panier d'achat, sécurité
                </div>
              </div>

              {/* Cookies d'analyse */}
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Cookies d'analyse
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={cookiePreferences.analytics}
                      onChange={(e) => setCookiePreferences({
                        ...cookiePreferences,
                        analytics: e.target.checked
                      })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Ces cookies nous aident à comprendre comment vous utilisez notre site pour l'améliorer.
                </p>
                <div className="text-xs text-gray-500">
                  Exemples : Google Analytics, statistiques de visite, pages populaires
                </div>
              </div>

              {/* Cookies marketing */}
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    Cookies marketing
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={cookiePreferences.marketing}
                      onChange={(e) => setCookiePreferences({
                        ...cookiePreferences,
                        marketing: e.target.checked
                      })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Ces cookies nous permettent de vous proposer des publicités et offres personnalisées.
                </p>
                <div className="text-xs text-gray-500">
                  Exemples : Facebook Pixel, Google Ads, retargeting
                </div>
              </div>

              {/* Cookies de personnalisation */}
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-600" />
                    Cookies de personnalisation
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={cookiePreferences.personalization}
                      onChange={(e) => setCookiePreferences({
                        ...cookiePreferences,
                        personalization: e.target.checked
                      })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Ces cookies mémorisent vos préférences pour personnaliser votre expérience.
                </p>
                <div className="text-xs text-gray-500">
                  Exemples : langue préférée, préférences d'affichage, contenu personnalisé
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button 
                onClick={savePreferences} 
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Sauvegarder mes préférences
              </button>
              <button 
                onClick={acceptAll} 
                className="border border-green-500 text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Tout accepter
              </button>
              <button 
                onClick={rejectAll} 
                className="border border-red-500 text-red-600 hover:bg-red-50 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Tout refuser
              </button>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Qu'est-ce qu'un cookie ?</h2>
              <div className="prose text-gray-700 space-y-4">
                <p>
                  Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) 
                  lors de votre visite sur notre site web. Il permet de reconnaître votre navigateur et de conserver 
                  certaines informations vous concernant.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Types de cookies utilisés</h3>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>• <strong>Cookies de session</strong> : supprimés à la fermeture du navigateur</li>
                    <li>• <strong>Cookies persistants</strong> : conservés pendant une durée définie</li>
                    <li>• <strong>Cookies internes</strong> : déposés directement par Succar Banat</li>
                    <li>• <strong>Cookies tiers</strong> : déposés par nos partenaires (Google, Facebook, etc.)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Pourquoi utilisons-nous des cookies ?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Fonctionnement du site
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Maintenir votre session de navigation</li>
                    <li>• Mémoriser votre panier d'achat</li>
                    <li>• Assurer la sécurité des transactions</li>
                    <li>• Gérer vos préférences de cookies</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Amélioration continue
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Analyser l'utilisation du site</li>
                    <li>• Identifier les problèmes techniques</li>
                    <li>• Comprendre les préférences des visiteurs</li>
                    <li>• Optimiser nos contenus et services</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-600" />
                    Personnalisation
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Mémoriser votre langue préférée</li>
                    <li>• Adapter l'affichage à vos goûts</li>
                    <li>• Proposer du contenu personnalisé</li>
                    <li>• Faciliter votre navigation</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    Communication ciblée
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Limiter l'affichage répétitif de publicités</li>
                    <li>• Proposer des offres pertinentes</li>
                    <li>• Mesurer l'efficacité de nos campagnes</li>
                    <li>• Vous reconnaître lors de visites futures</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Liste détaillée des cookies</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-800">Nom</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-800">Catégorie</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-800">Finalité</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-800">Durée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs">PHPSESSID</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Nécessaire</span></td>
                      <td className="px-4 py-3">Identifiant de session utilisateur</td>
                      <td className="px-4 py-3">Session</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs">cookie_consent</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Nécessaire</span></td>
                      <td className="px-4 py-3">Préférences de cookies</td>
                      <td className="px-4 py-3">1 an</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs">_ga</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Analyse</span></td>
                      <td className="px-4 py-3">Google Analytics - Visiteur unique</td>
                      <td className="px-4 py-3">2 ans</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs">_gid</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Analyse</span></td>
                      <td className="px-4 py-3">Google Analytics - Session</td>
                      <td className="px-4 py-3">24 heures</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs">_fbp</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">Marketing</span></td>
                      <td className="px-4 py-3">Facebook Pixel</td>
                      <td className="px-4 py-3">3 mois</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs">user_preferences</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Personnalisation</span></td>
                      <td className="px-4 py-3">Préférences utilisateur</td>
                      <td className="px-4 py-3">6 mois</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Comment gérer vos cookies ?</h2>
              <div className="prose text-gray-700 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">1. Via notre interface</h3>
                <p>
                  Utilisez le panneau de préférences ci-dessus pour activer ou désactiver chaque catégorie de cookies.
                </p>

                <h3 className="text-lg font-semibold text-gray-800">2. Via votre navigateur</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Chrome</h4>
                    <p className="text-sm">Paramètres → Confidentialité et sécurité → Cookies et autres données de sites</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Firefox</h4>
                    <p className="text-sm">Options → Vie privée et sécurité → Cookies et données de sites</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Safari</h4>
                    <p className="text-sm">Préférences → Confidentialité → Gérer les données de sites web</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Edge</h4>
                    <p className="text-sm">Paramètres → Cookies et autorisations de site → Gérer et supprimer les cookies</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Attention</h4>
                  <p className="text-sm text-yellow-700">
                    La désactivation de certains cookies peut affecter le fonctionnement du site et votre expérience utilisateur.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies de nos partenaires</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Google Analytics</h3>
                  <p className="text-sm text-gray-600 mb-3">Analyse d'audience et statistiques de visite</p>
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" 
                     className="text-primary-600 hover:underline text-sm">
                    Politique de confidentialité →
                  </a>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Facebook</h3>
                  <p className="text-sm text-gray-600 mb-3">Publicités ciblées et mesure d'audience</p>
                  <a href="https://www.facebook.com/privacy/explanation" target="_blank" rel="noopener noreferrer" 
                     className="text-primary-600 hover:underline text-sm">
                    Politique de confidentialité →
                  </a>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Stripe</h3>
                  <p className="text-sm text-gray-600 mb-3">Traitement sécurisé des paiements</p>
                  <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" 
                     className="text-primary-600 hover:underline text-sm">
                    Politique de confidentialité →
                  </a>
                </div>
              </div>
            </section>
          </div>

          {/* Contact */}
          <div className="mt-12 p-6 bg-primary-50 rounded-lg">
            <h2 className="text-xl font-bold text-primary-800 mb-4">Questions sur les cookies ?</h2>
            <p className="text-primary-700 mb-4">
              Pour toute question concernant notre utilisation des cookies, contactez-nous :
            </p>
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-primary-700">
                <Cookie className="h-4 w-4" />
                Email : contact@succarbanat.fr
              </p>
              <p className="text-sm text-primary-600">
                Nous nous engageons à vous répondre dans les plus brefs délais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cookies;