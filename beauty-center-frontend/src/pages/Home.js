import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Quote } from "lucide-react";
import { 
  Sparkles, 
  Star, 
  Calendar, 
  ShoppingBag, 
  Users, 
  Award,
  ArrowRight,
  CheckCircle,
  Flower,
  UserCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { productsAPI, servicesAPI, reviewsAPI } from '../services/api';
import { useTranslation } from 'react-i18next';

const euroFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

const Home = () => {
  const { t } = useTranslation();
  // Fetch featured products and services
  const { data: featuredProducts, isLoading: productsLoading } = useQuery(
    'featured-products',
    productsAPI.getFeatured
  );

  const { data: featuredServices, isLoading: servicesLoading } = useQuery(
    'featured-services',
    servicesAPI.getFeatured
  );

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery(
    'reviews',
    () => reviewsAPI.getReviews(100).then(res => res.data.data)
  );

  const stats = [
    { label: t('Clients Satisfaits'), value: '800+', icon: Users, color: 'from-[#DDCABC] to-[#B97230]', iconColor: 'text-[#3D2118]' },
    { label: t('Naturel'), value: '100%', icon: Flower, color: 'from-[#B97230] to-[#936342]', iconColor: 'text-[#3D2118]' },
    { label: t('Traditionnel'), value: '100%', icon: Sparkles, color: 'from-[#936342] to-[#904913]', iconColor: 'text-[#DDCABC]' },
    { label: t("Années d'Expérience"), value: '10+', icon: Star, color: 'from-[#904913] to-[#3D2118]', iconColor: 'text-[#DDCABC]' },
  ];

  const features = [
    {
      title: t('Expertise Professionnelle'),
      description: t('Vous êtes entre les mains de professionnels certifiés qui vous offrent des soins de beauté d\'exception.'),
      icon: Award,
    },
    {
      title: t('Produits Haut de Gamme'),
      description: t('Vous profitez des meilleurs produits de beauté 100% naturels, rien que pour vous.'),
      icon: Star,
    },
    {
      title: t('Environnement Relaxant'),
      description: t('Vous vous détendez dans une ambiance paisible et luxueuse, pensée pour votre bien-être.'),
      icon: Sparkles,
    },
  ];

  const testimonials = [
  {
    content:
      t("Très satisfaite de mon passage chez Dounia qui a des mains de fée professionnelle, méticuleuse et très gentille. J'ai hâte d'y retourner pour d'autres prestations. La meilleure de toutes"),
    author: {
      name: "Aleyna Lena",
      image: "/placeholder.svg?height=100&width=100",
    },
  },
  {
    content:
      t("Très bel institut. Prestation de qualité et résultat plus que satisfaisant, c'est de loin la meilleure !"),
    author: {
      name: "imane b",
      image: "/placeholder.svg?height=100&width=100",
    },
  },
  {
    content:
      t("Je sors à l'instant de l'institut où Dounia m'a fait passé un excellent moment de détente. Ses massages du cuir chevelu et du corps se sont parfaitement adaptés à mes besoins. J'y retournerai très prochainement avec un grand plaisir. Merci encore !"),
    author: {
      name: "Adrianne Guyot",
      image: "/placeholder.svg?height=100&width=100",
    },
  },
  {
    content:
      t("Première fois que je vais à l'institut ! Un super accueil et une super prestation, j'y retournerais sans hésiter"),
    author: {
      name: "Clem Martins",
      image: "/placeholder.svg?height=100&width=100",
    },
  },
  
] 

  const reviewsContainerRef = useRef(null);
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const pageSize = 12;

  useEffect(() => {
    loadMoreReviews();
    // eslint-disable-next-line
  }, []);

  const loadMoreReviews = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await reviewsAPI.getReviews(pageSize * page);
      const newReviews = res.data.data;
      setReviews(newReviews);
      setHasMore(newReviews.length === pageSize * page);
      setPage(page + 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const container = reviewsContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      if (
        container.scrollLeft + container.offsetWidth >= container.scrollWidth - 100 &&
        hasMore &&
        !loading
      ) {
        loadMoreReviews();
      }
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line
  }, [hasMore, loading, page]);

  // Inject Elfsight script for Google Reviews widget
  useEffect(() => {
    if (!document.querySelector('script[src="https://static.elfsight.com/platform/platform.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://static.elfsight.com/platform/platform.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden ">
        {/* Logos décoratifs en background */}
        <div className="pointer-events-none select-none absolute inset-0 z-0">
          <img
            src="/logo-lightmode.png"
            alt="Logo décoratif"
            className="absolute top-10 left-10 w-40 opacity-10 rotate-12"
            draggable="false"
          />
          <img
            src="/logo-lightmode.png"
            alt="Logo décoratif"
            className="absolute bottom-20 right-20 w-56 opacity-10 -rotate-6"
            draggable="false"
          />
          <img
            src="/logo-lightmode.png"
            alt="Logo décoratif"
            className="absolute top-1/2 left-1/2 w-80 opacity-5 -translate-x-1/2 -translate-y-1/2"
            draggable="false"
          />
        </div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-transparent" />
          <svg
            className="absolute bottom-0 left-0 right-0 text-white"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0V120L1200,40V0Z"
              className="fill-current"
            />
          </svg>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-serif font-bold text-gray-900 leading-tight">
                  {t('Institut de beauté')}
                  <span className="block text-primary-600">𝑵𝒂𝒖𝒓𝒆 & 𝑶𝒓𝒊𝒆𝒏𝒕𝒂𝒍</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  {t('Retrouvez chez SUCCAR BANAT un univers où le 100% naturel prône. Vous découvrirez ainsi l\'étendue des secrets d\'Orient et leurs bienfaits')}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="flex flex-row items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-400 text-white font-bold shadow-lg border-2 border-primary-700 hover:from-primary-700 hover:to-primary-500 hover:scale-105 transition-all duration-200 text-lg px-8 py-3 rounded-full focus:ring-4 focus:ring-primary-300 w-full sm:w-auto"
                  size="lg"
                >
                  <Calendar className="h-6 w-6 mr-2" />
                  <span className="whitespace-nowrap">{t('Prendre RDV')}</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-row items-center justify-center gap-2 border-2 border-primary-600 text-primary-700 font-bold bg-white hover:bg-primary-50 hover:text-primary-900 hover:border-primary-800 shadow focus:ring-4 focus:ring-primary-200 text-lg px-8 py-3 rounded-full transition-all duration-200 no-underline w-full sm:w-auto"
                  size="lg"
                >
                  <ShoppingBag className="h-6 w-6 mr-2" />
                  <span className="whitespace-nowrap">{t('Explorer la boutique')}</span>
                </Button>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="h-5 w-5 text-primary-600" />
                <span>{t('Une équipe de professionnels certifiés')}</span>
              </div>

            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary-200 to-primary-300 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/accueil_pic.jpeg"
                  alt="Beauty salon interior"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                  <div class="elfsight-app-0c8bc18b-f275-43cc-8a63-31d46bfc3804" data-elfsight-app-lazy></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Meet Dounia Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 w-full flex justify-center relative">
            {/* Logo décoratif derrière la photo de Dounia */}
            <img
              src="/solid2.png"
              alt="Logo décoratif"
              className="absolute z-0 left-1/2 md:left-1/6 top-1/2 w-[28rem] md:w-[56rem] opacity-20 md:opacity-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
              draggable="false"
            />
            <div className="rounded-3xl overflow-hidden shadow-2xl w-72 h-72 md:w-96 md:h-96 bg-gray-100 flex items-center justify-center relative z-10">
              <img
                src="https://client.ludovic-godard-photo.com/wp-content/uploads/picu/collections/4227/091024-08-34-22-dounia-asri-4345%C2%A9-ludovic-godard-bd.jpg"
                alt="Dounia Asri, fondatrice de Succar Banat"
                className="object-cover w-full h-full"
                loading="lazy"
              />
            </div>
          </div>
          <div className="md:w-1/2 w-full space-y-6">
            <h2 className="text-3xl lg:text-4xl font-serif font-extrabold text-primary-700 mb-2 tracking-tight">
              <span className="block font-sans text-gray-900 text-2xl lg:text-3xl mb-1 uppercase tracking-widest">Rencontrer Dounia</span>
              <span className="block font-serif italic text-primary-700 text-3xl lg:text-4xl">La femme derrière Succar Banat !</span>
            </h2>
            <h3 className="text-xl font-bold text-primary-800 font-sans uppercase tracking-wide">Dounia Asri</h3>
            <p className="text-gray-700 text-lg font-light font-sans">
              Diplômée <span className="font-semibold">(BTS esthétique & management)</span> avec <span className="font-semibold">10 ans d'expérience</span>, Dounia est la fondatrice de l'institut de beauté et des produits Succar Banat. Véritable passionnée, elle a fait de sa vocation un art de vivre, en mettant son expertise et son cœur au service de chaque client(e).
            </p>
            <p className="text-gray-700 text-lg font-sans">
              <span className="font-semibold text-primary-700">Son objectif ?</span> Révéler l'éclat de votre peau, sublimer votre regard, prendre soin de votre corps et de vos cheveux, tout en respectant votre authenticité. Dounia croit que la beauté n'est pas une transformation, mais une révélation de ce qui est déjà là. Son approche bienveillante et personnalisée fait de chaque visite un moment unique, où l'on se sent compris(e), valorisé(e) et rayonnant(e).
            </p>
            <blockquote className="border-l-4 border-primary-400 bg-primary-50/60 p-6 rounded-xl shadow font-serif italic text-xl text-primary-800 relative">
              <svg className="absolute -left-4 -top-4 w-10 h-10 text-primary-200 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5h.01M15 5h.01M6.5 8.5a5.5 5.5 0 0111 0c0 2.485-2.015 4.5-4.5 4.5S8 10.985 8 8.5z" /></svg>
              <span className="block">"Ma priorité, c'est de <span className="font-bold text-primary-700">sublimer chaque client(e)</span> tout en préservant sa véritable identité. Le <span className="font-bold text-primary-700">relooking beauté</span>, pour moi, c'est révéler la meilleure version de soi-même, sans jamais masquer l'essentiel : <span className="underline">votre personnalité</span>."</span>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <stat.icon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-b from-[#DDCABC] to-[#936342]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-4">
              {t('Produits Sélectionnés avec Soin')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('Explorez notre sélection raffinée de produits de beauté de qualité professionnelle')}
            </p>
          </div>

          {productsLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {featuredProducts?.data?.slice(0, 4).map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
                    {product.imageUrls && product.imageUrls[0] ? (
                      <img
                        src={product.imageUrls[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        {product.brand}
                      </span>
                      {product.discountPercentage && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          -{product.discountPercentage}%
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {product.finalPrice !== product.price ? (
                          <>
                            <span className="text-lg font-bold text-gray-900">
                              {euroFormatter.format(product.finalPrice)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {euroFormatter.format(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">
                            {euroFormatter.format(product.price)}
                          </span>
                        )}
                      </div>
                      <Link to={`/products/${product.id}`}>
                        <Button size="sm" variant="outline">
                          {t('View')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <Button 
              className="flex flex-row items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-400 text-white font-bold shadow-lg border-2 border-primary-700 hover:from-primary-700 hover:to-primary-500 hover:scale-105 transition-all duration-200 text-lg px-8 py-3 rounded-full focus:ring-4 focus:ring-primary-300"
              size="lg"
            >
              {t('Explorer la boutique')}
              <ArrowRight className="h-6 w-6 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-row items-center justify-center gap-2 ml-4 border-2 border-primary-600 text-primary-700 font-bold bg-white hover:bg-primary-50 hover:text-primary-900 hover:border-primary-800 shadow focus:ring-4 focus:ring-primary-200 text-lg px-8 py-3 rounded-full transition-all duration-200 no-underline"
              size="lg"
            >
              {t('Explorer les services')}
              <ArrowRight className="h-6 w-6 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center lg:items-center gap-12">
          {/* Bloc texte à gauche */}
          <div className="flex-1 lg:w-1/2">
            <div className="text-left lg:text-left mb-16 space-y-6">
              <h2 className="text-4xl font-serif font-extrabold text-primary-700 mb-4 flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary-400 animate-pulse" />
                {t('Bienvenue chez Succar Banat')}
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Flower className="h-6 w-6 text-primary-400 flex-shrink-0 mt-1" />
                  <div>
                    <span className="block text-base font-serif italic text-primary-800 mb-1">
                      {t('Mon promesse :')}
                    </span>
                    <span className="text-base text-gray-700">
                      {t('vous rendre belles et confiantes chaque matin, même durant les périodes les plus délicates du mois.')}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="h-6 w-6 text-primary-400 flex-shrink-0 mt-1" />
                  <div>
                    <span className="block text-base font-serif italic text-primary-800 mb-1">
                      {t('Ma mission :')}
                    </span>
                    <span className="text-base text-gray-700">
                      {t('transformer mes années d\'apprentissage et d\'expérience en prestations parfaites, répondant précisément à vos besoins, mêmes ceux qui restent silencieux.')}
                      <br />
                      {t('J\'ai appris à lire entre les lignes, à décoder vos souhaits, même s\'ils étaient timidement formulés.')}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="h-6 w-6 text-primary-400 flex-shrink-0 mt-1" />
                  <div>
                    <span className="block text-base font-serif italic text-primary-800 mb-1">
                      {t('Mon souhait :')}
                    </span>
                    <span className="text-base text-gray-700">
                      {t('vous libérer du maquillage et faire en sorte qu\'ils deviennent un choix, une manière de sublimer votre beauté naturelle et non une nécessité.')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Logo décoratif et photo à droite */}
          <div className="flex-1 lg:w-1/2 relative flex justify-center items-center min-h-[300px]">
            {/* Logo décoratif en arrière-plan */}
            <img
              src="/logo-lightmode.png"
              alt="Logo décoratif"
              className="absolute right-0 top-1/2 -translate-y-1/2 w-80 md:w-[32rem] opacity-10 pointer-events-none select-none"
              draggable="false"
            />
            {/* Photo de Dounia au premier plan */}
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl w-48 h-48 md:w-80 md:h-80 bg-gray-100 flex items-center justify-center">
              <img
                src="https://client.ludovic-godard-photo.com/wp-content/uploads/picu/collections/4227/091024-09-03-13-dounia-asri-4509%C2%A9-ludovic-godard-bd.jpg"
                alt="Dounia Asri, fondatrice de Succar Banat"
                className="object-cover w-full h-full"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/*section d'avie*/}
      <section id="testimonials" className="py-20 bg-[#DDCABC]/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('Leurs témoignages, notre fierté')}</h2>
          </div>
          <div className="relative">
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-primary-100 border border-primary-200 rounded-full p-2 shadow transition disabled:opacity-30"
              onClick={() => reviewsContainerRef.current.scrollBy({ left: -350, behavior: 'smooth' })}
              aria-label="Scroll left"
              style={{ display: reviews.length > 1 ? 'block' : 'none' }}
            >
              <ChevronLeft className="h-6 w-6 text-primary-700" />
            </button>
            <div
              ref={reviewsContainerRef}
              className="flex flex-row gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary-200 scrollbar-track-primary-50 scroll-smooth hide-scrollbar"
              style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {reviews.map((review) => (
                <div key={review.reviewId} className="bg-white rounded-xl shadow-lg p-6 flex flex-col min-w-[320px] max-w-xs">
                  <div className="flex items-center mb-2">
                    <a
                      href={review.userProfileImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mr-3"
                    >
                      <img
                        src={review.userProfileImage}
                        alt={review.userName}
                        className="w-10 h-10 rounded-full border-2 border-primary-200 hover:border-primary-400 transition"
                      />
                    </a>
                    <div>
                      <div className="flex items-center gap-1 font-bold text-primary-700">
                        {/* Logo Google */}
                        <img src="https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp=s48-fcrop64=1,00000000ffffffff-rw" alt="Google" className="h-4 w-4 inline-block mr-1" />
                        {review.userName}
                        {review.userLocalGuideInfo === 'true' && (
                          <CheckCircle className="h-4 w-4 text-blue-500 ml-1" title="Utilisateur vérifié" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{review.reviewDate ? new Date(review.reviewDate).toLocaleDateString() : ''}</div>
                    </div>
                  </div>
                  <div className="flex items-center mb-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <div className="text-gray-700 text-sm mb-2" style={{ whiteSpace: 'pre-line' }}>
                    {review.reviewText}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center justify-center min-w-[320px] max-w-xs">
                  <span>Chargement...</span>
                </div>
              )}
            </div>
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-primary-100 border border-primary-200 rounded-full p-2 shadow transition disabled:opacity-30"
              onClick={() => reviewsContainerRef.current.scrollBy({ left: 350, behavior: 'smooth' })}
              aria-label="Scroll right"
              style={{ display: reviews.length > 1 ? 'block' : 'none' }}
            >
              <ChevronRight className="h-6 w-6 text-primary-700" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-[#DDCABC] to-[#936342]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-white mb-4">
              {t('C\'est l\'heure de briller autrement !')}
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              {t('Offrez-vous un moment rien qu\'à vous — réservez dès maintenant et sentez la différence.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="flex flex-row items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-400 text-white font-bold shadow-lg border-2 border-primary-700 hover:from-primary-700 hover:to-primary-500 hover:scale-105 transition-all duration-200 text-lg px-8 py-3 rounded-full focus:ring-4 focus:ring-primary-300 w-full sm:w-auto"
                size="lg"
              >
                <Calendar className="h-6 w-6 mr-2" />
                <span className="whitespace-nowrap">{t('Prendre RDV')}</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-row items-center justify-center gap-2 border-2 border-primary-600 text-primary-700 font-bold bg-white hover:bg-primary-50 hover:text-primary-900 hover:border-primary-800 shadow focus:ring-4 focus:ring-primary-200 text-lg px-8 py-3 rounded-full transition-all duration-200 no-underline w-full sm:w-auto"
                size="lg"
              >
                {t('Contact')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;