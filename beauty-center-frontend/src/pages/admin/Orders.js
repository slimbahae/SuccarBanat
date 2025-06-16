import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Search, 
  Filter, 
  ArrowLeft,
  Package,
  Eye,
  TrendingUp,
  Download,
  RefreshCw,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  Truck,
  X,
  AlertCircle,
  Copy,
  Calendar,
  ChevronUp,
  ChevronDown,
  Trash2,
  Mail
} from 'lucide-react';
import { ordersAPI } from '../../services/api';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const queryClient = useQueryClient();

  // Fetch orders
  const { data: ordersData, isLoading, error } = useQuery(
    'admin-orders',
    ordersAPI.getAllOrders
  );

  // Update order status mutation
  const updateStatusMutation = useMutation(
    ({ id, status }) => ordersAPI.updateStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-orders');
        toast.success('Le statut de la commande a été mis à jour avec succès');
        setShowOrderModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Échec de la mise à jour du statut de la commande');
      },
    }
  );

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation(
    (orderIds) => Promise.all(orderIds.map(id => ordersAPI.deleteOrder(id))),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-orders');
        toast.success(`${selectedOrders.size} commandes supprimées avec succès`);
        setSelectedOrders(new Set());
      },
      onError: (error) => {
        toast.error('Échec de la suppression des commandes sélectionnées');
      },
    }
  );

  // Bulk update status mutation
  const bulkUpdateStatusMutation = useMutation(
    async ({ orderIds, status }) => {
      const results = await Promise.allSettled(
        orderIds.map(id => ordersAPI.updateStatus(id, status))
      );
      
      const successful = results.filter(result => result.status === 'fulfilled');
      const failed = results.filter(result => result.status === 'rejected');
      
      if (failed.length > 0) {
        throw new Error(`${failed.length} commandes n'ont pas pu être mises à jour`);
      }
      
      return successful;
    },
    {
      onSuccess: (results) => {
        queryClient.invalidateQueries('admin-orders');
        toast.success(`${results.length} commandes mises à jour avec succès`);
        setSelectedOrders(new Set());
        setShowStatusModal(false);
        setBulkStatus('');
      },
      onError: (error) => {
        toast.error(error.message || 'Échec de la mise à jour des commandes sélectionnées');
        queryClient.invalidateQueries('admin-orders');
      },
    }
  );

  const orders = ordersData?.data || [];

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort orders
  const sortedOrders = [...orders].sort((a, b) => {
    const { key, direction } = sortConfig;
    let aValue = a[key];
    let bValue = b[key];

    // Handle different data types
    if (key === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (key === 'total') {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) {
      return direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Filter orders
  const filteredOrders = sortedOrders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || order.orderStatus === statusFilter;
    const matchesPayment = paymentFilter === '' || order.paymentStatus === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedOrders(new Set(filteredOrders.map(order => order.id)));
    } else {
      setSelectedOrders(new Set());
    }
  };

  const handleSelectOrder = (orderId, checked) => {
    const newSelection = new Set(selectedOrders);
    if (checked) {
      newSelection.add(orderId);
    } else {
      newSelection.delete(orderId);
    }
    setSelectedOrders(newSelection);
  };

  const handleExportOrders = (exportType = 'all') => {
    let ordersToExport;
    let filename;
    
    if (exportType === 'selected' && selectedOrders.size > 0) {
      ordersToExport = filteredOrders.filter(order => selectedOrders.has(order.id));
      filename = `commandes-selectionnees-${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      ordersToExport = filteredOrders;
      filename = `toutes-les-commandes-${new Date().toISOString().split('T')[0]}.csv`;
    }

    if (ordersToExport.length === 0) {
      toast.error('Aucune commande à exporter');
      return;
    }

    // Create CSV content
    const csvHeaders = [
      'Order ID',
      'Customer Name',
      'Customer Email',
      'Date',
      'Status',
      'Payment Status',
      'Payment Method',
      'Total',
      'Items Count',
      'Shipping Address'
    ];

    const csvRows = ordersToExport.map(order => [
      order.id,
      order.customerName,
      order.customerEmail,
      new Date(order.createdAt).toLocaleDateString(),
      order.orderStatus,
      order.paymentStatus,
      order.paymentMethod || 'N/A',
      order.total.toFixed(2),
      order.items.length,
      `"${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}"`
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${ordersToExport.length} commandes exportées avec succès`);
  };

  const handleBulkAction = (action) => {
    if (selectedOrders.size === 0) {
      toast.error('Veuillez sélectionner des commandes');
      return;
    }

    switch (action) {
      case 'delete':
        setShowDeleteConfirm(true);
        break;
      case 'update-status':
        setShowStatusModal(true);
        break;
      case 'export':
        handleExportOrders('selectionné');
        break;
      case 'email':
        // Send email to selected customers logic
        toast.success('Envoi des e-mails aux clients sélectionnés...');
        break;
      default:
        break;
    }
  };

  const handleConfirmDelete = () => {
    bulkDeleteMutation.mutate(Array.from(selectedOrders));
    setShowDeleteConfirm(false);
  };

  const handleConfirmStatusUpdate = () => {
    if (!bulkStatus) {
      toast.error('Veuillez sélectionner un statut');
      return;
    }
    bulkUpdateStatusMutation.mutate({
      orderIds: Array.from(selectedOrders),
      status: bulkStatus
    });
  };

  // Get available status options for bulk update
  const getAvailableStatusOptions = () => {
    const selectedOrdersData = filteredOrders.filter(order => selectedOrders.has(order.id));
    const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    
    return statuses.filter(status => {
      const allHaveStatus = selectedOrdersData.every(order => order.orderStatus === status);
      return !allHaveStatus;
    });
  };

  // Calculate statistics
  const stats = [
    {
      label: 'Total des commandes',
      value: orders.length,
      icon: Package,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      label: 'Total de revenue',
      value: `$${orders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(0)}`,
      icon: TrendingUp,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      label: 'Commandes en attente',
      value: orders.filter(order => order.orderStatus === 'PENDING').length,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '-5%'
    },
    {
      label: 'Commandes livrés',
      value: orders.filter(order => order.orderStatus === 'DELIVERED').length,
      icon: CheckCircle,
      color: 'bg-purple-500',
      change: '+15%'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4" />;
      case 'SHIPPED':
        return <Truck className="h-4 w-4" />;
      case 'PROCESSING':
        return <RefreshCw className="h-4 w-4" />;
      case 'CANCELLED':
        return <X className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'credit_card':
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUp className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-gray-700" />
      : <ChevronDown className="h-4 w-4 text-gray-700" />;
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const copyOrderId = (orderId) => {
    navigator.clipboard.writeText(orderId);
    toast.success('ID de commande copié dans le presse-papiers');
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Impossible de charger les commandes</h2>
          <p className="text-gray-600">Veuillez réessayer plus tard.</p>
        </div>
      </div>
    );
  }

  const allSelected = selectedOrders.size === filteredOrders.length && filteredOrders.length > 0;
  const someSelected = selectedOrders.size > 0 && selectedOrders.size < filteredOrders.length;

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
              <h1 className="text-3xl font-bold text-gray-900">Gestion des commandes</h1>
              <p className="text-gray-600">Surveillez et gérez les commandes clients</p>
            </div>
            <Button variant="outline" onClick={() => handleExportOrders('all')}>
              <Download className="h-4 w-4 mr-2" />
              Exporter les commandes
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="PROCESSING">En cours</option>
                <option value="SHIPPED">Expédié</option>
                <option value="DELIVERED">Livré</option>
                <option value="CANCELLED">Annulé</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tous les statuts de paiement</option>
                <option value="PENDING">Paiement en attente</option>
                <option value="PAID">Payé</option>
                <option value="FAILED">échoué</option>
                <option value="REFUNDED">Remboursé</option>
              </select>
            </div>
            
            <p className="text-sm text-gray-600">
              {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.size > 0 && (
          <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">
                  {selectedOrders.size} commande{selectedOrders.size !== 1 ? 's' : ''} sélectioné
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('update-status')}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Mettre à jour le statut
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('export')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Exporter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOrders(new Set())}
              >
                Vider la sélection
              </Button>
            </div>
          </div>
        )}

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande disponible</h3>
            <p className="text-gray-600">
              {orders.length === 0 
                ? "Aucune commande n'a encore été passée." 
                : "Aucune commande ne correspond à vos filtres actuels."}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Commande</span>
                        {getSortIcon('id')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('customerName')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Client</span>
                        {getSortIcon('customerName')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Date</span>
                        {getSortIcon('createdAt')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('total')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Total</span>
                        {getSortIcon('total')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('orderStatus')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Statut</span>
                        {getSortIcon('orderStatus')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('paymentMethod')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Methode de payment</span>
                        {getSortIcon('paymentMethod')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('paymentStatus')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Statut de payment</span>
                        {getSortIcon('paymentStatus')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className={`hover:bg-gray-50 ${selectedOrders.has(order.id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order.id)}
                          onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900">
                                #{order.id.slice(-8)}
                              </span>
                              <button
                                onClick={() => copyOrderId(order.id)}
                                className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ${order.total.toFixed(2)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                          {getStatusIcon(order.orderStatus)}
                          <span className="ml-1">{order.orderStatus}</span>
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          {getPaymentMethodIcon(order.paymentMethod)}
                          <span className="ml-2 capitalize">
                            {order.paymentMethod?.replace('_', ' ') || 'N/A'}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          order.paymentStatus === 'PAID' 
                            ? 'bg-green-100 text-green-800'
                            : order.paymentStatus === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
                            <select
                              onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                              value=""
                              className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                              <option value="">Mettre à jour le statut</option>
                              {order.orderStatus === 'PENDING' && <option value="PROCESSING">Marquer comme en cours</option>}
                              {order.orderStatus === 'PROCESSING' && <option value="SHIPPED">Marquer comme expédié</option>}
                              {order.orderStatus === 'SHIPPED' && <option value="DELIVERED">Marquer comme livré</option>}
                              {order.orderStatus !== 'CANCELLED' && <option value="CANCELLED">Annuler la commande</option>}
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Détails de commande</h2>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Information de client</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Nom:</span> {selectedOrder.customerName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span> {selectedOrder.customerEmail}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Téléphone:</span> {selectedOrder.customerPhone || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Adresse de livraison</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        {selectedOrder.shippingAddress.addressLine1}
                      </p>
                      {selectedOrder.shippingAddress.addressLine2 && (
                        <p className="text-sm text-gray-600">
                          {selectedOrder.shippingAddress.addressLine2}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedOrder.shippingAddress.country}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Articles de la commande</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-white rounded-lg overflow-hidden">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{item.productName}</h4>
                          <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                          <p className="text-sm text-gray-500">Prix: ${item.unitPrice.toFixed(2)} par unité </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${item.totalPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Résumé de la commande</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.orderStatus)}`}>
                      {getStatusIcon(selectedOrder.orderStatus)}
                      <span className="ml-1">{selectedOrder.orderStatus}</span>
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sous-total</span>
                      <span className="text-gray-900">${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Taxes</span>
                      <span className="text-gray-900">${(selectedOrder.subtotal * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Livraison</span>
                      <span className="text-gray-900">
                        {selectedOrder.subtotal >= 50 ? 'Free' : '$5.00'}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-medium border-t border-gray-200 pt-2 mt-2">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowOrderModal(false)}
                  >
                    Ferme
                  </Button>
                  {selectedOrder.orderStatus !== 'DELIVERED' && selectedOrder.orderStatus !== 'CANCELLED' && (
                    <select
                      onChange={(e) => {
                        handleStatusUpdate(selectedOrder.id, e.target.value);
                        e.target.value = '';
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Mettre à jour le statut</option>
                      {selectedOrder.orderStatus === 'PENDING' && <option value="PROCESSING">Marquer comme en cours</option>}
                      {selectedOrder.orderStatus === 'PROCESSING' && <option value="SHIPPED">Marquer comme expédié</option>}
                      {selectedOrder.orderStatus === 'SHIPPED' && <option value="DELIVERED">Marquer comme livré</option>}
                      {selectedOrder.orderStatus !== 'CANCELLED' && <option value="CANCELLED">Annuler la commande</option>}
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Confirmer la suppression</h3>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer {selectedOrders.size} la commande selectioné {selectedOrders.size !== 1 ? 's' : ''}? Cette action est irréversible.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Annuler
                </Button>
                <Button
                  variant="danger"
                  onClick={handleConfirmDelete}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Status Update Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Mettre à jour le statut</h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="mb-6">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  sélectionner un nouveau statut
                </label>
                <select
                  id="status"
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">sélectionnez un statut</option>
                  {getAvailableStatusOptions().map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowStatusModal(false)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleConfirmStatusUpdate}
                  disabled={!bulkStatus}
                >
                  Mettre à jour
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders; 