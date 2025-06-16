import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  ArrowLeft,
  Sparkles,
  Clock,
  Star,
  Users,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { servicesAPI, usersAPI } from '../../services/api';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminServices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const queryClient = useQueryClient();

  // Fetch services and staff
  const { data: servicesData, isLoading, error } = useQuery(
    'admin-services',
    servicesAPI.getAllAdmin
  );

  const { data: staffData } = useQuery(
    'staff-users',
    () => usersAPI.getByRole('STAFF')
  );

  // Delete service mutation
  const deleteServiceMutation = useMutation(
    (id) => servicesAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-services');
        toast.success('Service supprimé avec succès');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Échec de la suppression du service');
      },
    }
  );

  const services = servicesData?.data || [];
  const staff = staffData?.data || [];

  const categories = [
    'Beauté du regard',
    'Soin',
    'Massage',
    'Épilation',
    'Beauté mains & ongles',
  ];

  // Filter services
  const filteredServices = services.filter(service => {
    const matchesSearch = searchTerm === '' || 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || service.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleDeleteService = (service) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${service.name}"?`)) {
      deleteServiceMutation.mutate(service.id);
    }
  };

  const getAssignedStaffNames = (staffIds) => {
    if (!staffIds || staffIds.length === 0) return 'Aucun personnel assigné';
    
    const staffNames = staffIds
      .map(id => {
        const staffMember = staff.find(s => s.id === id);
        return staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : null;
      })
      .filter(name => name);
    
    return staffNames.length > 0 ? staffNames.join(', ') : 'Aucun personnel assigné';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Impossible de charger les services</h2>
          <p className="text-gray-600">Veuillez réessayer plus tard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour au tableau de bord
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des services</h1>
              <p className="text-gray-600">Gérez vos services et soins de beauté</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un service
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="recherche services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-sm text-gray-600">
              {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} trouvé
            </p>
          </div>
        </div>

        {/* Services Table */}
        {filteredServices.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-12 text-center">
            <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun service trouvé</h3>
            <p className="text-gray-600 mb-6">
              {services.length === 0 
                ? "Get started by adding your first service." 
                : "No services match your current filters."}
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              Ajouter un service
            </Button>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix et durée
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Personnel assigné
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Disponibilité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredServices.map((service) => {
                    return (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {service.imageUrls && service.imageUrls[0] ? (
                                <img
                                  className="h-12 w-12 rounded-lg object-cover"
                                  src={service.imageUrls[0]}
                                  alt={service.name}
                                />
                              ) : (
                                <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                  <Sparkles className="h-6 w-6 text-primary-600" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {service.name}
                                {service.featured && (
                                  <Star className="inline h-4 w-4 text-yellow-400 ml-1" />
                                )}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {service.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            {service.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {service.finalPrice !== service.price ? (
                              <>
                                <span className="font-semibold">${service.finalPrice}</span>
                                <span className="text-gray-500 line-through ml-1">${service.price}</span>
                              </>
                            ) : (
                              <span className="font-semibold">${service.price}</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {service.duration} min
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="truncate max-w-xs">
                                {getAssignedStaffNames(service.assignedStaffIds)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-1">
                            {service.availableMorning && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                <Sun className="h-3 w-3 mr-1" />
                                AM
                              </span>
                            )}
                            {service.availableEvening && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                <Moon className="h-3 w-3 mr-1" />
                                PM
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            service.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {service.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link to={`/services/${service.id}`} target="_blank">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingService(service)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteService(service)}
                              loading={deleteServiceMutation.isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Service Modal */}
      {(showCreateForm || editingService) && (
        <ServiceModal
          service={editingService}
          staff={staff}
          onClose={() => {
            setShowCreateForm(false);
            setEditingService(null);
          }}
          onSuccess={() => {
            setShowCreateForm(false);
            setEditingService(null);
            queryClient.invalidateQueries('admin-services');
          }}
        />
      )}
    </div>
  );
};

// Service Modal Component
const ServiceModal = ({ service, staff, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || '',
    price: service?.price || '',
    duration: service?.duration || '',
    assignedStaffIds: service?.assignedStaffIds || [],
    featured: service?.featured || false,
    active: service?.active !== undefined ? service.active : true,
    availableMorning: service?.availableMorning !== undefined ? service.availableMorning : true,
    availableEvening: service?.availableEvening !== undefined ? service.availableEvening : true,
    imageUrls: service?.imageUrls || [],
    discountPercentage: service?.discountPercentage || '',
    discountStartDate: service?.discountStartDate ? new Date(service.discountStartDate).toISOString().split('T')[0] : '',
    discountEndDate: service?.discountEndDate ? new Date(service.discountEndDate).toISOString().split('T')[0] : '',
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  const createServiceMutation = useMutation(
    (serviceData) => servicesAPI.create(serviceData),
    {
      onSuccess: () => {
        toast.success('Service créé avec succès');
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Échec de la création du service');
      },
    }
  );

  const updateServiceMutation = useMutation(
    ({ id, serviceData }) => servicesAPI.update(id, serviceData),
    {
      onSuccess: () => {
        toast.success('Service mis à jour avec succès');
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Échec de la mise à jour du service');
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const serviceData = {
      ...formData,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : null,
      discountStartDate: formData.discountStartDate ? new Date(formData.discountStartDate) : null,
      discountEndDate: formData.discountEndDate ? new Date(formData.discountEndDate) : null,
    };

    if (service) {
      updateServiceMutation.mutate({ id: service.id, serviceData });
    } else {
      createServiceMutation.mutate(serviceData);
    }
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setFormData({
        ...formData,
        imageUrls: [...formData.imageUrls, newImageUrl.trim()]
      });
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index)
    });
  };

  const handleStaffSelection = (staffId) => {
    const isSelected = formData.assignedStaffIds.includes(staffId);
    if (isSelected) {
      setFormData({
        ...formData,
        assignedStaffIds: formData.assignedStaffIds.filter(id => id !== staffId)
      });
    } else {
      setFormData({
        ...formData,
        assignedStaffIds: [...formData.assignedStaffIds, staffId]
      });
    }
  };

  const categories = [
    'Beauté du regard',
    'Soin',
    'Massage',
    'Épilation',
    'Beauté mains & ongles',
  ];

  const isLoading = createServiceMutation.isLoading || updateServiceMutation.isLoading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {service ? 'Modifier le service' : 'Ajouter un nouveau service'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Informations générales</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                 Nom du service *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix * ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    durée * (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Paramètres et disponibilité</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pourcentage de remise (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {formData.discountPercentage && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de début de la remise
                    </label>
                    <input
                      type="date"
                      value={formData.discountStartDate}
                      onChange={(e) => setFormData({ ...formData, discountStartDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de fin de la remise
                    </label>
                    <input
                      type="date"
                      value={formData.discountEndDate}
                      onChange={(e) => setFormData({ ...formData, discountEndDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="availableMorning"
                    checked={formData.availableMorning}
                    onChange={(e) => setFormData({ ...formData, availableMorning: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="availableMorning" className="ml-2 block text-sm text-gray-900">
                    Disponible le matin (9h - 12h)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="availableEvening"
                    checked={formData.availableEvening}
                    onChange={(e) => setFormData({ ...formData, availableEvening: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="availableEvening" className="ml-2 block text-sm text-gray-900">
                    Disponible le soir (13h - 18h)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                    Service en vedette
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                    Service actif
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Assignment */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personnel assigné</h3>
            
            {staff.length === 0 ? (
              <p className="text-gray-600">Aucun membre du personnel disponible</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {staff.map((staffMember) => (
                  <div
                    key={staffMember.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.assignedStaffIds.includes(staffMember.id)
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleStaffSelection(staffMember.id)}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.assignedStaffIds.includes(staffMember.id)}
                        onChange={() => handleStaffSelection(staffMember.id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {staffMember.firstName} {staffMember.lastName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {staffMember.specialties?.join(', ') || 'Aucune spécialité répertoriée'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image URLs */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Images de service</h3>
            
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Entrer URL d'image "
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <Button type="button" onClick={addImageUrl} variant="outline">
                  Ajouter une image
                </Button>
              </div>

              {formData.imageUrls.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-md">
                      <img src={url} alt={`Service ${index + 1}`} className="w-12 h-12 object-cover rounded" />
                      <span className="flex-1 text-sm text-gray-600 truncate">{url}</span>
                      <button
                        type="button"
                        onClick={() => removeImageUrl(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" loading={isLoading}>
              {service ? 'Mettre à jour le service' : 'Créer un service'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminServices;