import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, Phone, Mail, Clock, Sparkles, Send, CheckCircle } from 'lucide-react';
import Button from '../components/UI/Button';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import emailjs from 'emailjs-com';

const Contact = () => {
  const { t } = useTranslation();
  const contactInfo = [
    {
      icon: MapPin,
      title: 'Adresse',
      content: (
        <a
          href="https://maps.app.goo.gl/MFDhp3vEaXRAHWAy7"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary-700 transition-colors"
        >
          110 Rue des Cras, 25000 Besançon, France
        </a>
      ),
      color: 'from-[#DDCABC] to-[#B97230]',
      iconColor: 'text-[#3D2118]',
      bgColor: 'bg-[#DDCABC]'
    },
    {
      icon: Phone,
      title: 'Téléphone',
      content: (
        <a
          href="tel:0603286703"
          className="underline hover:text-primary-700 transition-colors"
        >
          06 03 28 67 03
        </a>
      ),
      color: 'from-[#DDCABC] to-[#B97230]',
      iconColor: 'text-[#3D2118]',
      bgColor: 'bg-[#DDCABC]'
    },
    {
      icon: Mail,
      title: 'Email',
      content: (
        <a
          href="mailto:dounia.beaute.pro@gmail.com"
          className="underline hover:text-primary-700 transition-colors"
        >
          dounia.beaute.pro@gmail.com
        </a>
      ),
      color: 'from-[#DDCABC] to-[#B97230]',
      iconColor: 'text-[#3D2118]',
      bgColor: 'bg-[#DDCABC]'
    },
    {
      icon: Clock,
      title: 'Horaires',
      content: `Lundi : fermé\nMardi : 10h-19h\nMercredi : 10h-19h\nJeudi : 10h-19h\nVendredi : 10h-19h\nSamedi : 10h-15h\nDimanche : fermé`,
      color: 'from-[#DDCABC] to-[#B97230]',
      iconColor: 'text-[#3D2118]',
      bgColor: 'bg-[#DDCABC]'
    },
  ];

  // EmailJS form state
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormLoading(true);
    emailjs.send(
      'service_lkr4gxp', // replace with your EmailJS service ID
      'template_gnxb21e', // replace with your EmailJS template ID
      {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
      },
      '6vGdFqTXg9cqMUYI_' // replace with your EmailJS user/public key
    )
      .then(() => {
        setFormLoading(false);
        setFormData({ name: '', email: '', message: '' });
        toast.success('Message envoyé avec succès !');
      })
      .catch(() => {
        setFormLoading(false);
        toast.error('Erreur lors de l\'envoi du message.');
      });
  };

  return (
    <div className="min-h-screen bg-[#DDCABC] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#B97230] rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#936342] rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#904913] rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block mb-4">
              <Sparkles className="h-8 w-8 text-[#B97230] animate-pulse" />
            </div>
            <h1 className="text-5xl font-serif font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#3D2118] via-[#B97230] to-[#936342]">
              {t('contact.title')}
            </h1>
            <p className="text-xl text-[#3D2118]/80 max-w-2xl mx-auto leading-relaxed">
              {t('contact.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div 
                  key={index} 
                  className={`bg-gradient-to-br ${info.color} rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-14 h-14 ${info.bgColor} rounded-full flex items-center justify-center transform transition-transform duration-300 hover:rotate-12`}>
                        <info.icon className={`h-7 w-7 ${info.iconColor}`} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#3D2118] mb-2">
                        {info.title}
                      </h3>
                      <p className="text-[#3D2118]/80 whitespace-pre-line leading-relaxed">
                        {info.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl border-2 border-[#B97230]/30">
              <h2 className="text-2xl font-serif font-bold text-[#3D2118] mb-6 flex items-center">
                <MapPin className="h-6 w-6 text-[#B97230] mr-2" />
                {t('contact.location.title')}
              </h2>
              <div className="aspect-video bg-[#DDCABC] rounded-lg overflow-hidden shadow-lg border border-[#B97230]/20 mb-8">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2710.1234567890123!2d6.023456789012345!3d47.23456789012345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478d7c8c4c4c4c4c%3A0x1234567890123456!2s110%20Rue%20des%20Cras%2C%2025000%20Besan%C3%A7on%2C%20France!5e0!3m2!1sfr!2sfr!4v1234567890123!5m2!1sfr!2sfr"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localisation de Succar Banat"
                  className="transform transition-transform duration-300 hover:scale-105"
                ></iframe>
              </div>
              {/* Contact Form */}
              <form onSubmit={handleFormSubmit} className="space-y-6 mt-8">
                <h3 className="text-xl font-semibold text-[#3D2118] mb-2">Contactez-nous</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Votre nom"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="px-4 py-3 rounded-lg border border-[#B97230]/30 focus:ring-2 focus:ring-[#B97230] focus:outline-none bg-[#F9F6F2] text-[#3D2118]"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Votre email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    className="px-4 py-3 rounded-lg border border-[#B97230]/30 focus:ring-2 focus:ring-[#B97230] focus:outline-none bg-[#F9F6F2] text-[#3D2118]"
                  />
                </div>
                <textarea
                  name="message"
                  placeholder="Votre message"
                  value={formData.message}
                  onChange={handleFormChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-[#B97230]/30 focus:ring-2 focus:ring-[#B97230] focus:outline-none bg-[#F9F6F2] text-[#3D2118]"
                />
                <Button type="submit" size="lg" className="w-full md:w-auto" disabled={formLoading}>
                  {formLoading ? 'Envoi en cours...' : 'Envoyer'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact; 