import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowLeft,
  CheckCircle,
  Star,
  Plus,
  Minus,
  Sparkles,
  MapPin,
  Phone
} from 'lucide-react';
import { servicesAPI, serviceAddonsAPI, reservationsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const BookService = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Fetch service details
  const { data: service, isLoading: serviceLoading } = useQuery(
    ['service', id],
    () => servicesAPI.getById(id)
  );

  // Fetch service add-ons
  const { data: addons } = useQuery(
    ['service-addons', id],
    () => serviceAddonsAPI.getByServiceId(id),
    {
      enabled: !!service?.data
    }
  );

  // Check availability
  const { data: availability, isLoading: availabilityLoading } = useQuery(
    ['availability', id, selectedDate],
    () => reservationsAPI.checkAvailability({ serviceId: id, date: new Date(selectedDate) }),
    {
      enabled: !!selectedDate && !!service?.data
    }
  );

  // Create reservation mutation
  const createReservationMutation = useMutation(
    (reservationData) => reservationsAPI.create(reservationData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('customer-reservations');
        toast.success('Réservation créée avec succès !');
        navigate('/customer/reservations');
      },
      onError: (error) => {
        console.error('Erreur lors de la création de la réservation:', error);
        toast.error(error.response?.data?.message || 'Échec de la création de la réservation');
      },
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const serviceData = service?.data;
  const availableAddons = addons?.data || [];
  const availabilityData = availability?.data;

  // Generate next 30 days for date selection
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' })
      });
    }
    
    return dates;
  };

  const dateOptions = generateDateOptions();

  const handleAddonToggle = (addon) => {
    const isSelected = selectedAddons.find(a => a.id === addon.id);
    if (isSelected) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const calculateTotal = () => {
    if (!serviceData) return 0;
    
    const servicePrice = serviceData.finalPrice || serviceData.price;
    const addonsPrice = selectedAddons.reduce((total, addon) => total + addon.price, 0);
    
    return servicePrice + addonsPrice;
  };

  const calculateDuration = () => {
    if (!serviceData) return 0;
    
    const serviceDuration = serviceData.duration;
    const addonsDuration = selectedAddons.reduce((total, addon) => total + (addon.additionalDuration || 0), 0);
    
    return serviceDuration + addonsDuration;
  };

  const onSubmit = (data) => {
    if (currentStep === 1) {
      if (!selectedDate) {
        toast.error('Veuillez sélectionner une date');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedTimeSlot || !selectedStaff) {
        toast.error('Veuillez sélectionner un créneau horaire et un membre du personnel');
        return;
      }
      setCurrentStep(3);
    } else {
      // Final booking
      const reservationData = {
        staffId: selectedStaff,
        reservationDate: new Date(selectedDate),
        timeSlot: selectedTimeSlot,
        serviceId: id,
        addonIds: selectedAddons.map(addon => addon.id),
        notes: data.notes || ''
      };
      
      createReservationMutation.mutate(reservationData);
    }
  };

  if (serviceLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service introuvable</h2>
          <p className="text-gray-600 mb-4">Le service que vous essayez de réserver n'existe pas.</p>
          <Link to="/services">
            <Button>Retour aux services</Button>
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, name: 'Select Date', icon: Calendar },
    { id: 2, name: 'Choose Time & Staff', icon: Clock },
    { id: 3, name: 'Review & Confirm', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={`/services/${id}`} className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour aux détails du service
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Réserver {serviceData.name}</h1>
          <p className="text-gray-600">Planifiez votre rendez-vous en quelques étapes seulement</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-primary-600 border-primary-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.id ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`mx-4 h-px w-12 ${
                    currentStep > step.id ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            {/* Main Content */}
            <div className="lg:col-span-8">
              {/* Step 1: Select Date */}
              {currentStep === 1 && (
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">
                    <Calendar className="h-5 w-5 inline mr-2" />
                    Sélectionnez votre date préférée
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dateOptions.map((date) => (
                      <button
                        key={date.value}
                        type="button"
                        onClick={() => setSelectedDate(date.value)}
                        className={`p-4 text-left border rounded-lg transition-colors ${
                          selectedDate === date.value
                            ? 'border-primary-600 bg-primary-50 text-primary-900'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{date.dayName}</div>
                        <div className="text-sm text-gray-600">{date.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Choose Time & Staff */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {availabilityLoading ? (
                    <div className="bg-white shadow-sm rounded-lg p-6 text-center">
                      <LoadingSpinner size="default" />
                      <p className="mt-2 text-gray-600">Vérification de la disponibilité...</p>
                    </div>
                  ) : (
                    <>
                      {/* Time Slot Selection */}
                      <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-6">
                          <Clock className="h-5 w-5 inline mr-2" />
                          Choisissez un créneau horaire
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {serviceData.availableMorning && availabilityData?.morningAvailable && (
                            <button
                              type="button"
                              onClick={() => setSelectedTimeSlot('MORNING')}
                              className={`p-4 text-left border rounded-lg transition-colors ${
                                selectedTimeSlot === 'MORNING'
                                  ? 'border-primary-600 bg-primary-50 text-primary-900'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="font-medium">Session du matin</div>
                              <div className="text-sm text-gray-600">9h00 - 12h00</div>
                            </button>
                          )}
                          
                          {serviceData.availableEvening && availabilityData?.eveningAvailable && (
                            <button
                              type="button"
                              onClick={() => setSelectedTimeSlot('EVENING')}
                              className={`p-4 text-left border rounded-lg transition-colors ${
                                selectedTimeSlot === 'EVENING'
                                  ? 'border-primary-600 bg-primary-50 text-primary-900'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="font-medium">Session du soir</div>
                              <div className="text-sm text-gray-600">13h00 - 18h00</div>
                            </button>
                          )}
                        </div>
                        
                        {(!availabilityData?.morningAvailable && !availabilityData?.eveningAvailable) && (
                          <div className="text-center py-8">
                            <p className="text-gray-600">Aucun créneau horaire disponible pour cette date.</p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setCurrentStep(1)}
                              className="mt-4"
                            >
                              Choisissez une autre date
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Staff Selection */}
                      {selectedTimeSlot && availabilityData?.availableStaff && (
                        <div className="bg-white shadow-sm rounded-lg p-6">
                          <h2 className="text-lg font-medium text-gray-900 mb-6">
                            <User className="h-5 w-5 inline mr-2" />
                            Choisissez votre spécialiste
                          </h2>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availabilityData.availableStaff
                              .filter(staff => 
                                selectedTimeSlot === 'MORNING' ? staff.availableMorning : staff.availableEvening
                              )
                              .map((staff) => (
                                <button
                                  key={staff.staffId}
                                  type="button"
                                  onClick={() => setSelectedStaff(staff.staffId)}
                                  className={`p-4 text-left border rounded-lg transition-colors ${
                                    selectedStaff === staff.staffId
                                      ? 'border-primary-600 bg-primary-50 text-primary-900'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                      {staff.staffImage ? (
                                        <img
                                          src={staff.staffImage}
                                          alt={staff.staffName}
                                          className="w-full h-full rounded-full object-cover"
                                        />
                                      ) : (
                                        <User className="h-6 w-6 text-primary-600" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-medium">{staff.staffName}</div>
                                      <div className="flex items-center text-sm text-gray-600">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                                        <span>4.9 rating</span>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Step 3: Review & Confirm */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Booking Summary */}
                  <div className="bg-white shadow-sm rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                      <CheckCircle className="h-5 w-5 inline mr-2" />
                      Confirmez votre réservation
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service:</span>
                        <span className="font-medium">{serviceData.name}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">
                          {new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Heure:</span>
                        <span className="font-medium capitalize">
                          {selectedTimeSlot?.toLowerCase()} Session
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Spécialiste:</span>
                        <span className="font-medium">
                          {availabilityData?.availableStaff?.find(s => s.staffId === selectedStaff)?.staffName}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Durée:</span>
                        <span className="font-medium">{calculateDuration()} minutes</span>
                      </div>
                      
                      {selectedAddons.length > 0 && (
                        <div>
                          <span className="text-gray-600">Options supplémentaires :</span>
                          <div className="mt-1 space-y-1">
                            {selectedAddons.map((addon) => (
                              <div key={addon.id} className="flex justify-between text-sm">
                                <span>• {addon.name}</span>
                                <span>+${addon.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div className="bg-white shadow-sm rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Demandes spéciales</h3>
                    <textarea
                      {...register('notes')}
                      rows={4}
                      placeholder="Des demandes spéciales ou des notes pour votre rendez-vous..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* Booking Policy */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Politique de réservation</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Merci d’arriver 15 minutes avant votre rendez-vous</li>
                      <li>• Annulation gratuite jusqu’à 24 heures avant votre réservation</li>
                      <li>• Vous recevrez des rappels par SMS avant votre rendez-vous</li>
                      <li>• Les retards peuvent entraîner une réduction du temps de service</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    Retour
                  </Button>
                )}
                
                <Button
                  type="submit"
                  loading={createReservationMutation.isLoading}
                  className={currentStep === 1 ? 'w-full' : 'ml-auto'}
                  disabled={
                    (currentStep === 1 && !selectedDate) ||
                    (currentStep === 2 && (!selectedTimeSlot || !selectedStaff)) ||
                    (currentStep === 2 && availabilityLoading)
                  }
                >
                  {currentStep === 3 ? 'Confirmer la réservation' : 'Continuer'}
                </Button>
              </div>
            </div>

            {/* Sidebar - Service Info & Add-ons */}
            <div className="mt-10 lg:mt-0 lg:col-span-4">
              {/* Service Summary */}
              <div className="bg-white shadow-sm rounded-lg sticky top-8">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                      {serviceData.imageUrls && serviceData.imageUrls[0] ? (
                        <img
                          src={serviceData.imageUrls[0]}
                          alt={serviceData.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <Sparkles className="h-8 w-8 text-primary-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{serviceData.name}</h3>
                      <p className="text-sm text-gray-600">{serviceData.category}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Prix de base</span>
                      <span className="font-medium">${(serviceData.finalPrice || serviceData.price).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Durée</span>
                      <span className="font-medium">{serviceData.duration} min</span>
                    </div>
                  </div>

                  {/* Add-ons Selection */}
                  {availableAddons.length > 0 && (
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="font-medium text-gray-900 mb-4">Ajouter des services supplémentaires</h4>
                      <div className="space-y-3">
                        {availableAddons.map((addon) => {
                          const isSelected = selectedAddons.find(a => a.id === addon.id);
                          return (
                            <div
                              key={addon.id}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                isSelected
                                  ? 'border-primary-600 bg-primary-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => handleAddonToggle(addon)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={!!isSelected}
                                      onChange={() => handleAddonToggle(addon)}
                                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    />
                                    <div className="ml-3">
                                      <p className="text-sm font-medium text-gray-900">{addon.name}</p>
                                      <p className="text-xs text-gray-600">{addon.description}</p>
                                      {addon.additionalDuration > 0 && (
                                        <p className="text-xs text-gray-500">+{addon.additionalDuration} min</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  +${addon.price.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="border-t border-gray-200 pt-4 mt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-primary-600">
                        ${calculateTotal().toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Durée estimée: {calculateDuration()} minutes
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Besoin d’aide ?</h4>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>06 03 28 67 03</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>110 Rue des Cras, 25000 Besançon, France</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Notre équipe est disponible de 9h30 à 18h pour vous aider avec votre réservation.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookService;