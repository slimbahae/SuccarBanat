import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollText, Calendar, CreditCard, Users, AlertCircle, Mail, Phone } from 'lucide-react';

const Terms = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8 lg:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <ScrollText className="h-12 w-12 text-primary-600" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
              Conditions Générales d'Utilisation et de Vente
            </h1>
            <p className="text-gray-600">
              En vigueur au 1er janvier 2025 - Dernière mise à jour : 3 août 2025
            </p>
          </div>

          {/* Company Info */}
          <div className="bg-primary-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-primary-800 mb-4">Informations légales</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Dénomination :</strong> Succar Banat</p>
                <p><strong>Forme juridique :</strong> Entreprise individuelle</p>
                <p><strong>SIRET :</strong> [À compléter]</p>
                <p><strong>Code APE :</strong> 9602B (Soins de beauté)</p>
              </div>
              <div>
                <p><strong>Adresse :</strong> [Adresse complète]</p>
                <p><strong>Téléphone :</strong> [Numéro de téléphone]</p>
                <p><strong>Email :</strong> contact@succarbanat.fr</p>
                <p><strong>TVA :</strong> [Numéro de TVA intracommunautaire]</p>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Article 1 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-primary-600" />
                Article 1 - Objet et champ d'application
              </h2>
              <div className="prose text-gray-700 space-y-4">
                <p>
                  Les présentes conditions générales régissent l'utilisation du site web succarbanat.fr 
                  et l'ensemble des services proposés par l'institut de beauté Succar Banat, notamment :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>La prise de rendez-vous en ligne pour les soins esthétiques</li>
                  <li>La vente de produits de beauté et cosmétiques</li>
                  <li>L'achat et l'utilisation de cartes cadeaux</li>
                  <li>Les prestations de soins esthétiques réalisées en institut</li>
                </ul>
                <p>
                  Toute commande ou réservation implique l'acceptation pleine et entière des présentes conditions.
                </p>
              </div>
            </section>

            {/* Article 2 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary-600" />
                Article 2 - Réservation de prestations
              </h2>
              <div className="prose text-gray-700 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">2.1 Modalités de réservation</h3>
                <p>
                  Les réservations peuvent être effectuées en ligne via notre plateforme ou par téléphone. 
                  Toute réservation est confirmée par email ou SMS.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-800">2.2 Annulation et modification</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Annulation gratuite jusqu'à 24h avant le rendez-vous</li>
                  <li>Annulation tardive (moins de 24h) : 50% du montant de la prestation</li>
                  <li>Absence sans préavis : 100% du montant de la prestation</li>
                  <li>Les modifications sont possibles sous réserve de disponibilité</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800">2.3 Retard</h3>
                <p>
                  Un retard de plus de 15 minutes peut entraîner l'annulation du rendez-vous. 
                  Les retards importants peuvent réduire la durée de la prestation.
                </p>
              </div>
            </section>

            {/* Article 3 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-primary-600" />
                Article 3 - Vente de produits et cartes cadeaux
              </h2>
              <div className="prose text-gray-700 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">3.1 Commandes en ligne</h3>
                <p>
                  Les commandes sont validées après paiement intégral. Les prix s'entendent TTC 
                  et peuvent être modifiés sans préavis.
                </p>

                <h3 className="text-lg font-semibold text-gray-800">3.2 Livraison</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Livraison en France métropolitaine uniquement</li>
                  <li>Délai de livraison : 3 à 7 jours ouvrés</li>
                  <li>Frais de port offerts à partir de 50€ d'achat</li>
                  <li>Retrait gratuit en institut sur rendez-vous</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800">3.3 Cartes cadeaux</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Validité : 12 mois à compter de la date d'achat</li>
                  <li>Utilisables uniquement pour les prestations et produits Succar Banat</li>
                  <li>Non remboursables et non échangeables contre des espèces</li>
                  <li>En cas de perte ou de vol, aucun duplicata ne sera établi</li>
                </ul>
              </div>
            </section>

            {/* Article 4 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-primary-600" />
                Article 4 - Droit de rétractation
              </h2>
              <div className="prose text-gray-700 space-y-4">
                <p>
                  Conformément à l'article L221-18 du Code de la consommation, vous disposez d'un délai 
                  de 14 jours pour exercer votre droit de rétractation pour les achats de produits.
                </p>
                <p>
                  <strong>Exceptions :</strong> Le droit de rétractation ne s'applique pas aux prestations 
                  de services entièrement exécutées avant la fin du délai de rétractation avec votre accord préalable.
                </p>
                <p>
                  Pour les produits d'hygiène et cosmétiques, le retour n'est possible que si l'emballage 
                  n'a pas été ouvert.
                </p>
              </div>
            </section>

            {/* Article 5 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 5 - Paiement</h2>
              <div className="prose text-gray-700 space-y-4">
                <p>Moyens de paiement acceptés :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Carte bancaire (Visa, Mastercard)</li>
                  <li>Espèces (pour les prestations en institut)</li>
                  <li>Chèques (uniquement en institut)</li>
                  <li>Cartes cadeaux Succar Banat</li>
                </ul>
                <p>
                  Les paiements en ligne sont sécurisés et traités par notre prestataire de paiement certifié PCI-DSS.
                </p>
              </div>
            </section>

            {/* Article 6 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 6 - Responsabilité et garanties</h2>
              <div className="prose text-gray-700 space-y-4">
                <p>
                  L'institut Succar Banat s'engage à fournir des prestations conformes aux règles de l'art 
                  et à la réglementation en vigueur.
                </p>
                <p>
                  Avant toute prestation, un questionnaire de santé sera rempli. Il est de votre responsabilité 
                  de signaler toute contre-indication médicale.
                </p>
                <p>
                  Notre responsabilité ne saurait être engagée en cas de réaction allergique non déclarée 
                  ou de non-respect des conseils post-soins.
                </p>
              </div>
            </section>

            {/* Article 7 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 7 - Protection des données personnelles</h2>
              <div className="prose text-gray-700 space-y-4">
                <p>
                  Conformément au RGPD, vos données personnelles sont collectées et traitées pour :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>La gestion des rendez-vous et commandes</li>
                  <li>L'amélioration de nos services</li>
                  <li>L'envoi d'informations commerciales (avec votre consentement)</li>
                </ul>
                <p>
                  Vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité 
                  de vos données. Pour plus d'informations, consultez notre politique de confidentialité.
                </p>
              </div>
            </section>

            {/* Article 8 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 8 - Règlement des litiges</h2>
              <div className="prose text-gray-700 space-y-4">
                <p>
                  En cas de litige, nous privilégions une résolution amiable. Vous pouvez nous contacter 
                  par email ou téléphone.
                </p>
                <p>
                  À défaut d'accord amiable, vous pouvez recourir à la médiation de la consommation via 
                  la plateforme européenne de règlement en ligne des litiges : 
                  <a href="https://ec.europa.eu/consumers/odr/" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    https://ec.europa.eu/consumers/odr/
                  </a>
                </p>
                <p>
                  Les présentes conditions sont soumises au droit français. 
                  Tout litige relève de la compétence des tribunaux français.
                </p>
              </div>
            </section>
          </div>

          {/* Contact */}
          <div className="mt-12 p-6 bg-primary-50 rounded-lg">
            <h2 className="text-xl font-bold text-primary-800 mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact
            </h2>
            <p className="text-primary-700">
              Pour toute question concernant ces conditions générales, contactez-nous :
            </p>
            <div className="mt-2 space-y-1">
              <p className="flex items-center gap-2 text-primary-700">
                <Mail className="h-4 w-4" />
                Email : contact@succarbanat.fr
              </p>
              <p className="flex items-center gap-2 text-primary-700">
                <Phone className="h-4 w-4" />
                Téléphone : [Numéro de téléphone]
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;