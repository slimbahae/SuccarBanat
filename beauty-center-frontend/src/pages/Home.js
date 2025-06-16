import React from 'react';
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
  Flower
} from 'lucide-react';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { productsAPI, servicesAPI } from '../services/api';

const Home = () => {
  // Fetch featured products and services
  const { data: featuredProducts, isLoading: productsLoading } = useQuery(
    'featured-products',
    productsAPI.getFeatured
  );

  const { data: featuredServices, isLoading: servicesLoading } = useQuery(
    'featured-services',
    servicesAPI.getFeatured
  );

  const stats = [
    { label: 'Clients Satisfaits', value: '800+', icon: Users, color: 'from-[#DDCABC] to-[#B97230]', iconColor: 'text-[#3D2118]' },
    { label: 'Naturel', value: '100%', icon: Flower, color: 'from-[#B97230] to-[#936342]', iconColor: 'text-[#3D2118]' },
    { label: 'Traditionnel', value: '100%', icon: Sparkles, color: 'from-[#936342] to-[#904913]', iconColor: 'text-[#DDCABC]' },
    { label: 'Années d’Expérience', value: '10+', icon: Star, color: 'from-[#904913] to-[#3D2118]', iconColor: 'text-[#DDCABC]' },
  ];

  const features = [
    {
      title: 'Expertise Professionnelle',
      description: 'Vous êtes entre les mains de professionnels certifiés qui vous offrent des soins de beauté d’exception.',
      icon: Award,
    },
    {
      title: 'Produits Haut de Gamme',
      description: 'Vous profitez des meilleurs produits de beauté 100% naturels, rien que pour vous.',
      icon: Star,
    },
    {
      title: 'Environnement Relaxant',
      description: 'Vous vous détendez dans une ambiance paisible et luxueuse, pensée pour votre bien-être.',
      icon: Sparkles,
    },
  ];

  const testimonials = [
  {
    content:
      "Très satisfaite de mon passage chez Dounia qui a des mains de fée professionnelle, méticuleuse et très gentille. J'ai hâte d'y retourner pour d'autres prestations. La meilleure de toutes",
    author: {
      name: "Aleyna Lena",
      image: "/placeholder.svg?height=100&width=100",
    },
  },
  {
    content:
      "Très bel institut. Prestation de qualité et résultat plus que satisfaisant, c’est de loin la meilleure !",
    author: {
      name: "imane b",
      image: "/placeholder.svg?height=100&width=100",
    },
  },
  {
    content:
      "Je sors à l'instant de l'institut où Dounia m'a fait passé un excellent moment de détente. Ses massages du cuir chevelu et du corps se sont parfaitement adaptés à mes besoins. J'y retournerai très prochainement avec un grand plaisir. Merci encore !",
    author: {
      name: "Adrianne Guyot",
      image: "/placeholder.svg?height=100&width=100",
    },
  },
  {
    content:
      "Première fois que je vais à l’institut ! Un super accueil et une super prestation, j’y retournerais sans hésiter",
    author: {
      name: "Clem Martins",
      image: "/placeholder.svg?height=100&width=100",
    },
  },
  
] 


  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden ">
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
                  Institut de beauté
                  <span className="block text-primary-600">𝑵𝒂𝒕𝒖𝒓𝒆𝒍 & 𝑶𝒓𝒊𝒆𝒏𝒕𝒂𝒍</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Retrouvez chez SUCCAR BANAT un univers où le 100% naturel prône 
                  Vous découvrirez ainsi l’étendue des secrets d’Orient et leurs bienfaits
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="https://book.squareup.com/appointments/gemetyvfc7c4vj/location/LBNFGCA12NYB6/services">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Calendar className="mr-2 h-5 w-5" />
                    Prendre RDV
                  </Button>
                </Link>
                <Link to="/products">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Explorer la boutique
                  </Button>
                </Link>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="h-5 w-5 text-primary-600" />
                <span>Une équipe de professionnels certifiés</span>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary-200 to-primary-300 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="accueil_pic.jpeg"
                  alt="Beauty salon interior"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    {['M', 'D', 'B'].map((letter, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 bg-primary-200 rounded-full border-2 border-white flex items-center justify-center text-white font-bold"
                      >{letter}</div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">800+ Clients Satisfaits</p>
                  </div>
                </div>
              </div>
            </div>
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
              Produits Sélectionnés avec Soin
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explorez notre sélection raffinée de produits de beauté de qualité professionnelle
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
                              ${product.finalPrice}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ${product.price}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">
                            ${product.price}
                          </span>
                        )}
                      </div>
                      <Link to={`/products/${product.id}`}>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link to="/products">
              <Button variant="outline" size="lg">
                Explorer la boutique
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-4">
              Bienvenue chez Succar Banat
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              <b>Mon promesse :</b> vous rendre belles et confiantes chaque matin, même durant les périodes les plus délicates du mois.
            </p>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              <b>Ma mission :</b> transformer mes années d’apprentissage et d’expérience en prestations parfaites, répondant précisément à vos besoins, mêmes ceux qui restent silencieux.
              J’ai appris à lire entre les lignes, à décoder vos souhaits, même s’ils étaient timidement formulés. 
            </p>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              <b>Mon souhait :</b> vous libérer du maquillage et faire en sorte qu’ils deviennent un choix, une manière de sublimer votre beauté naturelle et non une nécessité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                  <feature.icon className="h-10 w-10 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*section d'avie*/}
      <section id="testimonials" className="py-20 bg-[#DDCABC]/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Leurs témoignages, notre fierté</h2>
          <p className="mt-4 text-lg text-[#3D2118]/80 max-w-2xl mx-auto">
            Chaque cliente compte, et leurs retours sont ma plus belle récompense. Voici ce que disent celles qui m’ont fait confiance. <br>
            </br>Des témoignages sincères qui reflètent la passion que je mets dans chaque prestation.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 bg-[#EADED0]/50">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="border-0 shadow-md">
              <div className="p-6">
                <Quote className="h-8 w-8 text-[#B97230]/60 mb-4" />
                <p className="text-lg mb-6">{testimonial.content}</p>
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <img
                      className="h-12 w-12 rounded-full"
                      src="avie_pic.jpeg"
                      alt=""
                      width={48}
                      height={48}
                    />
                  </div>
                  <div>
                    <div className="font-medium">{testimonial.author.name}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-[#DDCABC] to-[#936342]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-white mb-4">
              C’est l’heure de briller autrement !
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Offrez-vous un moment rien qu’à vous — réservez dès maintenant et sentez la différence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="https://book.squareup.com/appointments/gemetyvfc7c4vj/location/LBNFGCA12NYB6/services">
                <Button 
                  size="lg" 
                  className="bg-white !text-gray-900 border-2 border-gray-900 hover:bg-gray-900 hover:!text-white focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 w-full sm:w-auto transition-all duration-200"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Prendre RDV
                </Button>
              </Link>
              <Link to="/contact">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white hover:text-primary-600 w-full sm:w-auto"
                >
                  Contact
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;