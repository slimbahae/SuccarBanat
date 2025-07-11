import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      // General
      "Welcome": "Bienvenue",
      "Products": "Produits",
      "Cart": "Panier",
      "Checkout": "Paiement",
      "Order Confirmation": "Confirmation de commande",
      "Contact": "Contact",
      "View": "Voir",
      "Back": "Retour",
      "Continue": "Continuer",
      "Free": "Gratuit",
      "Total": "Total",
      "Subtotal": "Sous-total",
      "Tax": "Taxe",
      "Taxes": "Taxes",
      "Shipping": "Livraison",
      
      // Home page
      "Institut de beauté": "Institut de beauté",
      "Clients Satisfaits": "Clients Satisfaits",
      "Naturel": "Naturel",
      "Traditionnel": "Traditionnel",
      "Années d'Expérience": "Années d'Expérience",
      "Expertise Professionnelle": "Expertise Professionnelle",
      "Vous êtes entre les mains de professionnels certifiés qui vous offrent des soins de beauté d'exception.": "Vous êtes entre les mains de professionnels certifiés qui vous offrent des soins de beauté d'exception.",
      "Produits Haut de Gamme": "Produits Haut de Gamme",
      "Vous profitez des meilleurs produits de beauté 100% naturels, rien que pour vous.": "Vous profitez des meilleurs produits de beauté 100% naturels, rien que pour vous.",
      "Environnement Relaxant": "Environnement Relaxant",
      "Vous vous détendez dans une ambiance paisible et luxueuse, pensée pour votre bien-être.": "Vous vous détendez dans une ambiance paisible et luxueuse, pensée pour votre bien-être.",
      "Retrouvez chez SUCCAR BANAT un univers où le 100% naturel prône \n                   Vous découvrirez ainsi l'étendue des secrets d'Orient et leurs bienfaits": "Retrouvez chez SUCCAR BANAT un univers où le 100% naturel prône. Vous découvrirez ainsi l'étendue des secrets d'Orient et leurs bienfaits",
      "Prendre RDV": "Prendre RDV",
      "Explorer la boutique": "Explorer la boutique",
      "Une équipe de professionnels certifiés": "Une équipe de professionnels certifiés",
      "Produits Sélectionnés avec Soin": "Produits Sélectionnés avec Soin",
      "Explorez notre sélection raffinée de produits de beauté de qualité professionnelle": "Explorez notre sélection raffinée de produits de beauté de qualité professionnelle",
      "Bienvenue chez Succar Banat": "Bienvenue chez Succar Banat",
      "Mon promesse :": "Ma promesse :",
      "vous rendre belles et confiantes chaque matin, même durant les périodes les plus délicates du mois.": "vous rendre belles et confiantes chaque matin, même durant les périodes les plus délicates du mois.",
      "Ma mission :": "Ma mission :",
      "transformer mes années d'apprentissage et d'expérience en prestations parfaites, répondant précisément à vos besoins, mêmes ceux qui restent silencieux.": "transformer mes années d'apprentissage et d'expérience en prestations parfaites, répondant précisément à vos besoins, mêmes ceux qui restent silencieux.",
      "J'ai appris à lire entre les lignes, à décoder vos souhaits, même s'ils étaient timidement formulés.": "J'ai appris à lire entre les lignes, à décoder vos souhaits, même s'ils étaient timidement formulés.",
      "Mon souhait :": "Mon souhait :",
      "vous libérer du maquillage et faire en sorte qu'ils deviennent un choix, une manière de sublimer votre beauté naturelle et non une nécessité.": "vous libérer du maquillage et faire en sorte qu'ils deviennent un choix, une manière de sublimer votre beauté naturelle et non une nécessité.",
      "Leurs témoignages, notre fierté": "Leurs témoignages, notre fierté",
      "Chaque cliente compte, et leurs retours sont ma plus belle récompense. Voici ce que disent celles qui m'ont fait confiance.": "Chaque cliente compte, et leurs retours sont ma plus belle récompense. Voici ce que disent celles qui m'ont fait confiance.",
      "Des témoignages sincères qui reflètent la passion que je mets dans chaque prestation.": "Des témoignages sincères qui reflètent la passion que je mets dans chaque prestation.",
      "C'est l'heure de briller autrement !": "C'est l'heure de briller autrement !",
      "Offrez-vous un moment rien qu'à vous — réservez dès maintenant et sentez la différence.": "Offrez-vous un moment rien qu'à vous — réservez dès maintenant et sentez la différence.",
      
      // Products page
      "products.title": "Produits de beauté premium",
      "products.description": "Découvrez notre collection sélectionnée de produits de beauté de qualité professionnelle",
      "products.searchPlaceholder": "Rechercher des produits...",
      "products.filters": "Filtres",
      "products.categories": "Catégories",
      "products.allCategories": "Toutes les catégories",
      "products.sortBy": "Trier par",
      "products.showing": "Affichage de {{count}} produit{{count !== 1 ? 's' : ''}}{{category ? ` dans ${category}` : ''}}{{search ? ` pour \"${search}\"` : ''}}",
      "products.noProductsFound": "Aucun produit trouvé",
      "products.adjustSearchOrFilter": "Essayez d'ajuster vos critères de recherche ou de filtre",
      "products.featured": "En vedette",
      "products.viewDetails": "Voir les détails",

      // Services page
      "Nos Services": "Nos Services",
      "Découvrez notre gamme complète de soins et prestations, inspirés par la tradition et le naturel.": "Découvrez notre gamme complète de soins et prestations, inspirés par la tradition et le naturel.",
      "Rechercher un service...": "Rechercher un service...",
      "Filtres": "Filtres",
      "Catégories": "Catégories",
      "Toutes les catégories": "Toutes les catégories",
      "Affichage de {{count}} services": "Affichage de {{count}} services",
      "Aucun service trouvé": "Aucun service trouvé",
      "Ajustez votre recherche ou filtrez par une autre catégorie.": "Ajustez votre recherche ou filtrez par une autre catégorie.",
      "Prendre RDV": "Prendre RDV",
      "Explorer les services": "Explorer les services",
      
      // Checkout page
      "stripe_not_ready": "Stripe ne s'est pas encore chargé. Veuillez patienter et réessayer.",
      "payment_not_initialized": "Le paiement n'a pas été initialisé. Veuillez réessayer.",
      "card_input_unavailable": "La saisie de la carte n'est pas disponible.",
      "payment_failed": "Le paiement a échoué. Veuillez réessayer.",
      "verify_card_info": "Veuillez vérifier les informations de votre carte et réessayer.",
      "payment_not_succeeded": "Le paiement n'a pas été effectué avec succès. Veuillez réessayer.",
      "unexpected_error": "Une erreur inattendue s'est produite lors du traitement du paiement. Veuillez réessayer.",
      "processing_payment": "Traitement du paiement",
      "preparing_secure_payment": "Préparation du paiement sécurisé",
      "stripe_loading_error": "Échec du chargement du système de paiement. Veuillez rafraîchir la page.",
      "loading_payment_system": "Chargement du système de paiement",
      "payment_initialization_error": "Échec de l'initialisation du paiement : ",
      "order_success": "Commande passée avec succès !",
      "payment_system_not_ready": "Le système de paiement n'est pas prêt. Veuillez patienter un instant puis réessayer.",
      "empty_cart": "Votre panier est vide",
      "add_items_before_checkout": "Ajoutez des articles à votre panier avant de passer à la caisse.",
      "continue_shopping": "Continuer vos achats",
      "shipping_information": "Informations de livraison",
      "payment_method": "Méthode de paiement",
      "order_verification": "Vérification de la commande",
      "select_country": "Sélectionnez un pays",
      "back_to_cart": "Retour au panier",
      "full_name": "Nom complet",
      "full_name_required": "Nom complet est requis",
      "email": "Email",
      "email_required": "Email est requis",
      "invalid_email": "Adresse email invalide",
      "phone_number": "Numéro de téléphone",
      "phone_number_required": "Numéro de téléphone est requis",
      "address_line_1": "Adresse-ligne 1",
      "address_required": "Adresse est requise",
      "address_line_2": "Adresse-ligne 2",
      "city": "Ville",
      "city_required": "La ville est requise",
      "state": "Région",
      "state_required": "La région est requise",
      "postal_code": "Code Postal",
      "postal_code_required": "Code Postal est requis",
      "country": "Pays",
      "country_required": "Pays est requis",
      "credit_debit_card": "Carte de crédit/débit",
      "you_will_be_redirected_to_paypal": "Vous serez redirigé(e) vers PayPal pour finaliser votre paiement.",
      "bank_transfer_instructions": "Les instructions pour le virement bancaire seront fournies après la confirmation de la commande.",
      "order_will_be_processed_once_payment_received": "Votre commande sera traitée une fois le paiement reçu.",
      "verify_order": "Vérifiez votre commande",
      "qty": "Qté",
      "credit_debit_card_stripe": "Credit/Debit Card (Stripe)",
      "paypal": "PayPal",
      "bank_transfer": "Bank Transfer",
      "payment_will_be_processed_securely_via_stripe": "Le paiement sera traité en toute sécurité via Stripe.",
      "order_terms": "Termes de commande",
      "free_shipping_above_50_eur": "Livraison gratuite pour les commandes supérieures à 50 €",
      "return_policy_within_30_days": "Politique de retour sous 30 jours pour les articles non ouverts",
      "order_confirmation_email": "Confirmation de commande envoyée par email",
      "estimated_delivery_3_to_5_business_days": "Livraison estimée : 3 à 5 jours ouvrables",
      "place_order": "Passer la commande",
      "order_summary": "Résumé de la commande",
      "secure_payment_with_ssl_encryption": "Paiement sécurisé avec chiffrement SSL",
      
      // Orders page
      "order.notFound": "Commande introuvable",
      "order.returnOrders": "Retour aux commandes",
      "order.tracking": "Suivi de commande",
      "order.currentStatus": "Statut actuel",
      "order.estimatedDelivery": "Livraison estimée:",
      "order.shippingTracking": "Votre colis est en route ! Suivez votre envoi pour des mises à jour en temps réel.",
      "order.rateProduct": "Noter le produit",
      "order.buyAgain": "Acheter à nouveau",
      "order.leaveReview": "Laisser un avis",
      "order.reportProblem": "Signaler un problème",
      "order.orderSummary": "Résumé de commande",
      "order.shippingAddress": "Adresse de Livraison",
      "order.paymentInformation": "Informations de paiement",
      "order.paymentMethod": "Méthode de paiement",
      "order.paymentStatus": "Statut de paiement",
      "order.transactionID": "ID de transaction",
      "order.loadError": "Impossible de charger les commandes",
      "order.tryAgainLater": "Veuillez réessayer plus tard.",
      "order.returnDashboard": "Retour au tableau de bord",
      "order.myOrders": "Mes commandes",
      "order.followManage": "Suivez et gérez vos commandes",
      "order.searchOrders": "Search orders...",
      "order.allOrders": "Toutes les commandes",
      "order.pending": "En attente",
      "order.processing": "En cours",
      "order.shipped": "Expédiées",
      "order.delivered": "Livrées",
      "order.cancelled": "Annulées",
      "order.foundOrders": "commande(s) trouvée(s)",
      "order.noOrdersFound": "Aucune commande trouvée",
      "order.noOrdersYet": "Vous n'avez pas encore passé de commande.",
      "order.noOrdersMatch": "Aucune commande ne correspond à vos filtres actuels.",
      "order.startShopping": "Commencer vos achats",
      "order.viewDetails": "Voir les détails",
      "order.trackShipment": "Suivre le colis",
      
      // Dashboard
      "welcomeHeader": "Bon retour,",
      "welcomeDescription": "Voici ce qui se passe dans votre parcours beauté",
      "quickActionsTitle": "Actions immédiates",
      "recentOrdersTitle": "Commande Récente",
      "viewAllOrders": "Voir tout",
      "noRecentOrders": "Aucune commande récente",
      "viewProducts": "Voir les produits",
      
      // Cart
      "freeShipping": "Livraison gratuite dès 50 €",
      "returnPolicy": "Politique de retour sous 30 jours",
      "enterPromoCode": "Entrer le code promo",
      
      // Contact page
      "contact.title": "Contactez-nous",
      "contact.description": "Nous sommes là pour répondre à toutes vos questions et vous accompagner dans votre parcours beauté.",
      "contact.location.title": "Notre emplacement",
      
      // Header
      "logout": "Se déconnecter",
      "login": "Se connecter",
      "register": "S'inscrire",
      
      // Footer
      "footer.description": "Retrouvez chez SUCCAR BANAT un univers où le 100% naturel prône. Vous découvrirez ainsi l'étendue des secrets d'Orient et leurs bienfaits.",
      "footer.services": "Services",
      "footer.company": "Entreprise",
      "footer.support": "Support",
      "footer.terms": "Conditions d'utilisation",
      "footer.privacy": "Politique de confidentialité",
      "footer.cookies": "Politique des cookies",
      
      // Free shipping text
      "Free shipping on orders over $50": "Livraison gratuite pour les commandes supérieures à 50 €",
    }
  },
  en: {
    translation: {
      // General
      "Welcome": "Welcome",
      "Products": "Products",
      "Cart": "Cart",
      "Checkout": "Checkout",
      "Order Confirmation": "Order Confirmation",
      "Contact": "Contact",
      "View": "View",
      "Back": "Back",
      "Continue": "Continue",
      "Free": "Free",
      "Total": "Total",
      "Subtotal": "Subtotal",
      "Tax": "Tax",
      "Taxes": "Taxes",
      "Shipping": "Shipping",
      
      // Home page
      "Institut de beauté": "Beauty Institute",
      "Clients Satisfaits": "Satisfied Clients",
      "Naturel": "Natural",
      "Traditionnel": "Traditional",
      "Années d'Expérience": "Years of Experience",
      "Expertise Professionnelle": "Professional Expertise",
      "Vous êtes entre les mains de professionnels certifiés qui vous offrent des soins de beauté d'exception.": "You are in the hands of certified professionals who offer you exceptional beauty treatments.",
      "Produits Haut de Gamme": "Premium Products",
      "Vous profitez des meilleurs produits de beauté 100% naturels, rien que pour vous.": "You enjoy the best 100% natural beauty products, just for you.",
      "Environnement Relaxant": "Relaxing Environment",
      "Vous vous détendez dans une ambiance paisible et luxueuse, pensée pour votre bien-être.": "You relax in a peaceful and luxurious atmosphere, designed for your well-being.",
      "Retrouvez chez SUCCAR BANAT un univers où le 100% naturel prône \n                   Vous découvrirez ainsi l'étendue des secrets d'Orient et leurs bienfaits": "Find at SUCCAR BANAT a universe where 100% natural prevails. You will discover the extent of Oriental secrets and their benefits",
      "Prendre RDV": "Book Appointment",
      "Explorer la boutique": "Explore the shop",
      "Une équipe de professionnels certifiés": "A team of certified professionals",
      "Produits Sélectionnés avec Soin": "Carefully Selected Products",
      "Explorez notre sélection raffinée de produits de beauté de qualité professionnelle": "Explore our refined selection of professional quality beauty products",
      "Bienvenue chez Succar Banat": "Welcome to Succar Banat",
      "Mon promesse :": "My promise:",
      "vous rendre belles et confiantes chaque matin, même durant les périodes les plus délicates du mois.": "to make you beautiful and confident every morning, even during the most delicate periods of the month.",
      "Ma mission :": "My mission:",
      "transformer mes années d'apprentissage et d'expérience en prestations parfaites, répondant précisément à vos besoins, mêmes ceux qui restent silencieux.": "to transform my years of learning and experience into perfect services, responding precisely to your needs, even those that remain silent.",
      "J'ai appris à lire entre les lignes, à décoder vos souhaits, même s'ils étaient timidement formulés.": "I have learned to read between the lines, to decode your wishes, even if they were timidly formulated.",
      "Mon souhait :": "My wish:",
      "vous libérer du maquillage et faire en sorte qu'ils deviennent un choix, une manière de sublimer votre beauté naturelle et non une nécessité.": "to free you from makeup and make it a choice, a way to enhance your natural beauty and not a necessity.",
      "Leurs témoignages, notre fierté": "Their testimonials, our pride",
      "Chaque cliente compte, et leurs retours sont ma plus belle récompense. Voici ce que disent celles qui m'ont fait confiance.": "Every client counts, and their feedback is my most beautiful reward. Here's what those who trusted me say.",
      "Des témoignages sincères qui reflètent la passion que je mets dans chaque prestation.": "Sincere testimonials that reflect the passion I put into each service.",
      "C'est l'heure de briller autrement !": "It's time to shine differently!",
      "Offrez-vous un moment rien qu'à vous — réservez dès maintenant et sentez la différence.": "Treat yourself to a moment just for you — book now and feel the difference.",
      
      // Products page
      "products.title": "Premium Beauty Products",
      "products.description": "Discover our carefully selected collection of professional quality beauty products",
      "products.searchPlaceholder": "Search products...",
      "products.filters": "Filters",
      "products.categories": "Categories",
      "products.allCategories": "All Categories",
      "products.sortBy": "Sort by",
      "products.showing": "Showing {{count}} product{{count !== 1 ? 's' : ''}}{{category ? ` in ${category}` : ''}}{{search ? ` for \"${search}\"` : ''}}",
      "products.noProductsFound": "No products found",
      "products.adjustSearchOrFilter": "Try adjusting your search or filter criteria",
      "products.featured": "Featured",
      "products.viewDetails": "View Details",
      
      // Services page
      "Nos Services": "Nos Services",
      "Découvrez notre gamme complète de soins et prestations, inspirés par la tradition et le naturel.": "Découvrez notre gamme complète de soins et prestations, inspirés par la tradition et le naturel.",
      "Rechercher un service...": "Rechercher un service...",
      "Filtres": "Filtres",
      "Catégories": "Catégories",
      "Toutes les catégories": "Toutes les catégories",
      "Affichage de {{count}} services": "Affichage de {{count}} services",
      "Aucun service trouvé": "Aucun service trouvé",
      "Ajustez votre recherche ou filtrez par une autre catégorie.": "Ajustez votre recherche ou filtrez par une autre catégorie.",
      "Prendre RDV": "Prendre RDV",
      "Explorer les services": "Explorer les services",
      
      // Checkout page
      "stripe_not_ready": "Stripe hasn't loaded yet. Please wait and try again.",
      "payment_not_initialized": "Payment hasn't been initialized. Please try again.",
      "card_input_unavailable": "Card input is not available.",
      "payment_failed": "Payment failed. Please try again.",
      "verify_card_info": "Please verify your card information and try again.",
      "payment_not_succeeded": "Payment was not successful. Please try again.",
      "unexpected_error": "An unexpected error occurred during payment processing. Please try again.",
      "processing_payment": "Processing payment",
      "preparing_secure_payment": "Preparing secure payment",
      "stripe_loading_error": "Failed to load payment system. Please refresh the page.",
      "loading_payment_system": "Loading payment system",
      "payment_initialization_error": "Payment initialization failed: ",
      "order_success": "Order placed successfully!",
      "payment_system_not_ready": "Payment system is not ready. Please wait a moment and try again.",
      "empty_cart": "Your cart is empty",
      "add_items_before_checkout": "Add items to your cart before checkout.",
      "continue_shopping": "Continue shopping",
      "shipping_information": "Shipping Information",
      "payment_method": "Payment Method",
      "order_verification": "Order Verification",
      "select_country": "Select a country",
      "back_to_cart": "Back to cart",
      "full_name": "Full Name",
      "full_name_required": "Full name is required",
      "email": "Email",
      "email_required": "Email is required",
      "invalid_email": "Invalid email address",
      "phone_number": "Phone Number",
      "phone_number_required": "Phone number is required",
      "address_line_1": "Address Line 1",
      "address_required": "Address is required",
      "address_line_2": "Address Line 2",
      "city": "City",
      "city_required": "City is required",
      "state": "State",
      "state_required": "State is required",
      "postal_code": "Postal Code",
      "postal_code_required": "Postal code is required",
      "country": "Country",
      "country_required": "Country is required",
      "credit_debit_card": "Credit/Debit Card",
      "you_will_be_redirected_to_paypal": "You will be redirected to PayPal to complete your payment.",
      "bank_transfer_instructions": "Bank transfer instructions will be provided after order confirmation.",
      "order_will_be_processed_once_payment_received": "Your order will be processed once payment is received.",
      "verify_order": "Verify your order",
      "qty": "Qty",
      "credit_debit_card_stripe": "Credit/Debit Card (Stripe)",
      "paypal": "PayPal",
      "bank_transfer": "Bank Transfer",
      "payment_will_be_processed_securely_via_stripe": "Payment will be processed securely via Stripe.",
      "order_terms": "Order Terms",
      "free_shipping_above_50_eur": "Free shipping on orders over €50",
      "return_policy_within_30_days": "30-day return policy for unopened items",
      "order_confirmation_email": "Order confirmation sent by email",
      "estimated_delivery_3_to_5_business_days": "Estimated delivery: 3-5 business days",
      "place_order": "Place Order",
      "order_summary": "Order Summary",
      "secure_payment_with_ssl_encryption": "Secure payment with SSL encryption",
      
      // Orders page
      "order.notFound": "Order not found",
      "order.returnOrders": "Back to orders",
      "order.tracking": "Order tracking",
      "order.currentStatus": "Current status",
      "order.estimatedDelivery": "Estimated delivery:",
      "order.shippingTracking": "Your package is on its way! Track your shipment for real-time updates.",
      "order.rateProduct": "Rate product",
      "order.buyAgain": "Buy again",
      "order.leaveReview": "Leave review",
      "order.reportProblem": "Report problem",
      "order.orderSummary": "Order summary",
      "order.shippingAddress": "Shipping Address",
      "order.paymentInformation": "Payment Information",
      "order.paymentMethod": "Payment method",
      "order.paymentStatus": "Payment status",
      "order.transactionID": "Transaction ID",
      "order.loadError": "Unable to load orders",
      "order.tryAgainLater": "Please try again later.",
      "order.returnDashboard": "Back to dashboard",
      "order.myOrders": "My Orders",
      "order.followManage": "Track and manage your orders",
      "order.searchOrders": "Search orders...",
      "order.allOrders": "All orders",
      "order.pending": "Pending",
      "order.processing": "Processing",
      "order.shipped": "Shipped",
      "order.delivered": "Delivered",
      "order.cancelled": "Cancelled",
      "order.foundOrders": "order(s) found",
      "order.noOrdersFound": "No orders found",
      "order.noOrdersYet": "You haven't placed any orders yet.",
      "order.noOrdersMatch": "No orders match your current filters.",
      "order.startShopping": "Start shopping",
      "order.viewDetails": "View details",
      "order.trackShipment": "Track shipment",
      
      // Dashboard
      "welcomeHeader": "Welcome back,",
      "welcomeDescription": "Here's what's happening in your beauty journey",
      "quickActionsTitle": "Quick Actions",
      "recentOrdersTitle": "Recent Order",
      "viewAllOrders": "View all",
      "noRecentOrders": "No recent orders",
      "viewProducts": "View products",
      
      // Cart
      "freeShipping": "Free shipping on orders over €50",
      "returnPolicy": "30-day return policy",
      "enterPromoCode": "Enter promo code",
      
      // Contact page
      "contact.title": "Contact Us",
      "contact.description": "We're here to answer any questions and help you along your beauty journey.",
      "contact.location.title": "Our Location",
      
      // Header
      "logout": "Logout",
      "login": "Login",
      "register": "Register",
      
      // Footer
      "footer.description": "Find at SUCCAR BANAT a universe where 100% natural prevails. You will discover the extent of Oriental secrets and their benefits.",
      "footer.services": "Services",
      "footer.company": "Company",
      "footer.support": "Support",
      "footer.terms": "Terms of Service",
      "footer.privacy": "Privacy Policy",
      "footer.cookies": "Cookie Policy",
      
      // Free shipping text
      "Free shipping on orders over $50": "Free shipping on orders over €50",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);