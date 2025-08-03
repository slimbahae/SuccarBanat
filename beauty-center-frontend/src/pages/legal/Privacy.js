import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Eye, Lock, Users, Database, Mail, Phone, FileText } from 'lucide-react';

const Privacy = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8 lg:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-primary-600" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
              Politique de Confidentialité
            </h1>
            <p className="text-gray-600">
              En vigueur au 1er janvier 2025 - Dernière mise à jour : 3 août 2025
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-primary-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-primary-800 mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Notre engagement
            </h2>
            <p className="text-primary-700">
              Chez Succar Banat, nous prenons très au sérieux la protection de vos données personnelles. 
              Cette politique vous explique comment nous collectons, utilisons et protégeons vos informations 
              conformément au Règlement Général sur la Protection des Données (RGPD).
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="h-6 w-6 text-primary-600" />
                1. Données collectées
              </h2>
              <div className="prose text-gray-700 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">1.1 Données d'identification</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Nom, prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone</li>
                  <li>Adresse postale (pour les livraisons)</li>
                  <li>Date de naissance (si nécessaire pour les soins)</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800">1.2 Données de santé</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Questionnaire de santé (allergies, contre-indications)</li>
                  <li>Type de peau et préférences de soins</li>
                  <li>Historique des prestations réalisées</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800">1.3 Données de navigation</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Adresse IP</li>
                  <li>Type de navigateur</li>
                  <li>Pages visitées et temps de consultation</li>
                  <li>Données de géolocalisation (avec votre accord)</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800">1.4 Données commerciales</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Historique des achats et réservations</li>
                  <li>Préférences et centres d'intérêt</li>
                  <li>Avis et commentaires laissés</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary-600" />
                2. Finalités du traitement
              </h2>
              <div className="prose text-gray-700 space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Gestion des services</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Prise de rendez-vous</li>
                      <li>• Traitement des commandes</li>
                      <li>• Facturation et paiement</li>
                      <li>• Service client</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Amélioration des services</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Personnalisation des soins</li>
                      <li>• Analyse de satisfaction</li>
                      <li>• Développement de nouveaux services</li>
                      <li>• Optimisation du site web</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Communication</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Confirmations de RDV</li>
                      <li>• Rappels et notifications</li>
                      <li>• Newsletter (avec consentement)</li>
                      <li>• Offres personnalisées</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Obligations légales</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Comptabilité et fiscalité</li>
                      <li>• Respect des réglementations</li>
                      <li>• Lutte contre la fraude</li>
                      <li>• Gestion des litiges</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-primary-600" />
                3. Base légale du traitement
              </h2>
              <div className="prose text-gray-700 space-y-4">
                <div className="grid gap-4">
                  <div className="border border-primary-200 rounded-lg p-4">
                    <h3 className="font-semibold text-primary-800">Exécution du contrat</h3>
                    <p className="text-sm text-gray-600">
                      Traitement nécessaire à l'exécution des prestations de services et vente de produits.
                    </p>
                  </div>
                  <div className="border border-primary-200 rounded-lg p-4">
                    <h3 className="font-semibold text-primary-800">Consentement</h3>
                    <p className="text-sm text-gray-600">
                      Pour l'envoi de communications marketing et l'utilisation de cookies non essentiels.
                    </p>
                  </div>
                  <div className="border border-primary-200 rounded-lg p-4">
                    <h3 className="font-semibold text-primary-800">Intérêt légitime</h3>
                    <p className="text-sm text-gray-600">
                      Amélioration de nos services, prévention de la fraude, analyses statistiques.
                    </p>
                  </div>
                  <div className="border border-primary-200 rounded-lg p-4">
                    <h3 className="font-semibold text-primary-800">Obligation légale</h3>
                    <p className="text-sm text-gray-600">
                      Respect des obligations comptables, fiscales et réglementaires.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-primary-600" />
                4. Partage des données
              </h2>
              <div className="prose text-gray-700 space-y-4">
                <p>
                  Vos données peuvent être partagées uniquement dans les cas suivants :
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">Prestataires de services</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Plateforme de paiement sécurisé</li>
                    <li>• Service de livraison</li>
                    <li>• Hébergeur du site web</li>
                    <li>• Outils de communication (email, SMS)</li>
                  </ul>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">Obligations légales</h3>
                  <p className="text-sm text-red-700">
                    En cas de demande des autorités compétentes (police, justice, administrations).
                  </p>
                </div>
                <p className="text-sm italic">
                  Tous nos prestataires sont soumis à des obligations contractuelles strictes 
                  et ne peuvent utiliser vos données qu'aux fins pour lesquelles nous les avons engagés.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Durée de conservation</h2>
              <div className="prose text-gray-700 space-y-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-800">Type de données</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-800">Durée de conservation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-2">Données clients actifs</td>
                        <td className="px-4 py-2">3 ans après le dernier contact</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2">Données de santé</td>
                        <td className="px-4 py-2">5 ans après la dernière prestation</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2">Données comptables</td>
                        <td className="px-4 py-2">10 ans (obligation légale)</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2">Cookies et logs</td>
                        <td className="px-4 py-2">13 mois maximum</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2">Données prospects</td>
                        <td className="px-4 py-2">3 ans sans contact</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Vos droits</h2>
              <div className="prose text-gray-700 space-y-4">
                <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Droit d'accès</h3>
                    <p className="text-sm">Connaître les données que nous détenons sur vous</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Droit de rectification</h3>
                    <p className="text-sm">Corriger des données inexactes ou incomplètes</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Droit à l'effacement</h3>
                    <p className="text-sm">Demander la suppression de vos données</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Droit à la portabilité</h3>
                    <p className="text-sm">Récupérer vos données dans un format lisible</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Droit d'opposition</h3>
                    <p className="text-sm">Vous opposer au traitement pour motif légitime</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Droit de limitation</h3>
                    <p className="text-sm">Limiter le traitement dans certains cas</p>
                  </div>
                </div>
                <div className="bg-primary-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary-800 mb-2">Comment exercer vos droits ?</h3>
                  <p className="text-primary-700 text-sm">
                    Contactez-nous par email à <strong>contact@succarbanat.fr</strong> ou par courrier. 
                    Nous vous répondrons dans un délai d'un mois.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Sécurité des données</h2>
              <div className="prose text-gray-700 space-y-4">
                <p>Nous mettons en œuvre les mesures techniques et organisationnelles appropriées :</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Lock className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-800">Chiffrement</h3>
                    <p className="text-sm text-gray-600">SSL/TLS pour toutes les communications</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Shield className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-800">Protection</h3>
                    <p className="text-sm text-gray-600">Accès limité et authentification forte</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Database className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-800">Sauvegarde</h3>
                    <p className="text-sm text-gray-600">Sauvegardes régulières et sécurisées</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Transferts internationaux</h2>
              <div className="prose text-gray-700 space-y-4">
                <p>
                  Vos données sont hébergées en France/Union Européenne. En cas de transfert vers un pays tiers, 
                  nous nous assurons d'un niveau de protection adéquat (décision d'adéquation ou clauses contractuelles types).
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modifications</h2>
              <div className="prose text-gray-700 space-y-4">
                <p>
                  Cette politique peut être modifiée pour s'adapter aux évolutions légales ou de nos services. 
                  Nous vous informerons de tout changement important par email ou notification sur le site.
                </p>
              </div>
            </section>
          </div>

          {/* Contact */}
          <div className="mt-12 p-6 bg-primary-50 rounded-lg">
            <h2 className="text-xl font-bold text-primary-800 mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Délégué à la Protection des Données
            </h2>
            <p className="text-primary-700 mb-4">
              Pour toute question relative à la protection de vos données personnelles :
            </p>
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-primary-700">
                <Mail className="h-4 w-4" />
                Email : dpo@succarbanat.fr
              </p>
              <p className="flex items-center gap-2 text-primary-700">
                <Phone className="h-4 w-4" />
                Téléphone : [Numéro de téléphone]
              </p>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-blue-800 text-sm">
                <strong>Réclamation :</strong> Vous avez également la possibilité d'introduire une réclamation 
                auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) - www.cnil.fr
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;