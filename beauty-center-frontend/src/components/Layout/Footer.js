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
  Linkedin
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { name: 'Beauté du regard', href: 'https://book.squareup.com/appointments/gemetyvfc7c4vj/location/LBNFGCA12NYB6/services' },
      { name: 'Soin', href: 'https://book.squareup.com/appointments/gemetyvfc7c4vj/location/LBNFGCA12NYB6/services' },
      { name: 'Massage', href: 'https://book.squareup.com/appointments/gemetyvfc7c4vj/location/LBNFGCA12NYB6/services' },
      { name: 'Épilation', href: 'https://book.squareup.com/appointments/gemetyvfc7c4vj/location/LBNFGCA12NYB6/services' },
      { name: 'Beauté mains & ongles', href: 'https://book.squareup.com/appointments/gemetyvfc7c4vj/location/LBNFGCA12NYB6/services' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contacts', href:'/Contact'},
      { name: 'Privacy Policy', href: '/privacy' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Booking Policy', href: '/booking-policy' },
      { name: 'Cancellation', href: '/cancellation' },
      { name: 'Gift Cards', href: '/gift-cards' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61551637964944', label: 'Facebook' },
    { icon: Instagram, href: 'https://www.instagram.com/succar_banat', label: 'Instagram' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/dounia-asri', label: 'Twitter' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-2 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-serif font-bold ">
                SUCCAR BANAT INSTITUT
              </span>
            </Link>
            
            <p className="text-gray-300 text-sm">
              Retrouvez chez SUCCAR BANAT un univers où le 100% naturel prône. Vous découvrirez ainsi l’étendue des secrets d’Orient et leurs bienfaits.
            </p>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Phone className="h-4 w-4" />
                <span>(212) 603-286703</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Mail className="h-4 w-4" />
                <span>dounia.beaute.pro@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <MapPin className="h-4 w-4" />
                <span>110 Rue des Cras, 25000 Besançon, France</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
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

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
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

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
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
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Beauty Center. All rights reserved.
            </p>
            
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                to="/terms"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Terms of Service
              </Link>
              <Link
                to="/privacy"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                to="/cookies"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;