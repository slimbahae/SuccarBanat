import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter,
  Linkedin,
  Clock,
  CreditCard,
  Gift
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { name: 'Beauté du regard', href: '/services' },
      { name: 'Soin', href: '/services' },
      { name: 'Massage', href: '/services' },
      { name: 'Épilation', href: '/services' },
      { name: 'Beauté mains & ongles', href: '/services' },
    ],
    company: [
      { name: 'Contact', href:'/contact'},
    ],
    support: [
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61551637964944', label: 'Facebook' },
    { icon: Instagram, href: 'https://www.instagram.com/succar_banat', label: 'Instagram' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/dounia-asri', label: 'Twitter' },
  ];

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      <img
        src="/logo-lightmode.png"
        alt="Logo décoratif"
        className="hidden md:block pointer-events-none select-none absolute bottom-0 right-0 w-64 opacity-10 rotate-12 z-0"
        draggable="false"
      />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <img src="/logo-lightmode.png" alt="Logo Succar Banat" className="h-10 w-auto" />
              <span className="text-xl font-serif font-bold">
                SUCCAR BANAT INSTITUT
              </span>
            </Link>
            
            <p className="text-gray-300 text-sm">
              {t('footer.description')}
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Horaires */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center"><Clock className="h-5 w-5 mr-2" />Horaires</h3>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>Lundi : fermé</li>
              <li>Mardi : 10h-19h</li>
              <li>Mercredi : 10h-19h</li>
              <li>Jeudi : 10h-19h</li>
              <li>Vendredi : 10h-19h</li>
              <li>Samedi : 10h-15h</li>
              <li>Dimanche : fermé</li>
            </ul>
          </div>

          {/* Contact & Réseaux */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Contact & Réseaux</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Phone className="h-4 w-4" />
                <span>+33 6 03 28 67 03</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Phone className="h-4 w-4" />
                <span>dounia.beaute.pro@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <MapPin className="h-4 w-4" />
                <span>
                  110 Rue des Cras,<br />
                  25000 Besançon, France
                </span>
              </div>
            </div>
            <div>
              <Link to="/contact" className="text-primary-400 hover:text-white underline text-sm">Contact</Link>
            </div>
            <div className="flex space-x-4 mt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Support */}
          {/* Support : désactivé car pas de liens fonctionnels */}
        </div>

        {/* Gift Card Footer Section */}
        <div className="w-full bg-[#232A34] rounded-lg shadow mb-6 p-3 flex flex-col md:flex-row items-center justify-between gap-4 border border-[#2C3748] mt-8">
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            <Gift className="h-6 w-6 text-[#B3C2D1]" />
            <div>
              <h3 className="text-base font-bold text-white mb-0.5">Cartes Cadeaux</h3>
              <p className="text-[#B3C2D1] text-xs">Offrez ou utilisez une carte cadeau Succar Banat pour faire plaisir ou vous faire plaisir.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link to="/customer/giftcard-purchase">
              <button className="flex items-center gap-1 bg-[#2C3748] hover:bg-[#3D4A5C] text-white font-bold px-3 py-1.5 rounded-full shadow border border-[#3D4A5C] text-xs">
                <CreditCard className="h-3 w-3 mr-1" />Acheter
              </button>
            </Link>
            <Link to="/customer/giftcard-redeem">
              <button className="flex items-center gap-1 border-2 border-[#B3C2D1] text-[#B3C2D1] font-bold bg-[#232A34] hover:bg-[#2C3748] hover:text-white hover:border-white shadow px-3 py-1.5 rounded-full text-xs">
                <Gift className="h-3 w-3 mr-1" />Utiliser
              </button>
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} SuccarBanat. Tous droits réservés.
            </p>
            
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                to="/terms"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {t('footer.terms')}
              </Link>
              <Link
                to="/privacy"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {t('footer.privacy')}
              </Link>
              <Link
                to="/cookies"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {t('footer.cookies')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;