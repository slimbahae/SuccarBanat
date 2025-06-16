import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8083/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set to false for now to test
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    // Debug logging
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data: error.response?.data,
      headers: error.response?.headers,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      console.log('Unauthorized access - clearing token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect automatically, let the component handle it
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => {
    console.log('Attempting login with:', credentials.email);
    return api.post('/auth/login', credentials);
  },
  register: (userData) => {
    console.log('Attempting registration for:', userData.email);
    return api.post('/auth/register', userData);
  },
};

// Products API
export const productsAPI = {
  getAll: () => api.get('/public/products'),
  getFeatured: () => api.get('/public/products/featured'),
  getByCategory: (category) => api.get(`/public/products/category/${category}`),
  search: (keyword) => api.get(`/public/products/search?keyword=${keyword}`),
  getById: (id) => api.get(`/public/products/${id}`),
  
  // Admin endpoints
  getAllAdmin: () => api.get('/admin/products'),
  create: (product) => api.post('/admin/products', product),
  update: (id, product) => api.put(`/admin/products/${id}`, product),
  delete: (id) => api.delete(`/admin/products/${id}`),
};

// Services API
export const servicesAPI = {
  getAll: () => api.get('/public/services'),
  getFeatured: () => api.get('/public/services/featured'),
  getByCategory: (category) => api.get(`/public/services/category/${category}`),
  getById: (id) => api.get(`/public/services/${id}`),
  
  // Admin endpoints
  getAllAdmin: () => api.get('/admin/services'),
  create: (service) => api.post('/admin/services', service),
  update: (id, service) => api.put(`/admin/services/${id}`, service),
  delete: (id) => api.delete(`/admin/services/${id}`),
};

// Service Addons API
export const serviceAddonsAPI = {
  getAll: () => api.get('/public/service-addons'),
  getByServiceId: (serviceId) => api.get(`/public/service-addons/service/${serviceId}`),
  getById: (id) => api.get(`/public/service-addons/${id}`),
  
  // Admin endpoints
  getAllAdmin: () => api.get('/admin/service-addons'),
  create: (addon) => api.post('/admin/service-addons', addon),
  update: (id, addon) => api.put(`/admin/service-addons/${id}`, addon),
  delete: (id) => api.delete(`/admin/service-addons/${id}`),
};

// Cart API
export const cartAPI = {
  get: () => {
    console.log('Fetching cart data...');
    return api.get('/customer/cart');
  },
  addItem: (item) => {
    console.log('Adding item to cart:', item);
    return api.post('/customer/cart', item);
  },
  updateItem: (productId, data) => {
    console.log('Updating cart item:', productId, data);
    return api.patch(`/customer/cart/${productId}`, data);
  },
  removeItem: (productId) => {
    console.log('Removing cart item:', productId);
    return api.delete(`/customer/cart/${productId}`);
  },
  clear: () => {
    console.log('Clearing cart...');
    return api.delete('/customer/cart');
  },
};

// Payment API (Stripe)
export const paymentAPI = {
  createPaymentIntent: (paymentData) => {
    console.log('Creating payment intent:', paymentData);
    return api.post('/payment/create-payment-intent', paymentData);
  },
  getPaymentStatus: (paymentIntentId) => {
    console.log('Getting payment status for:', paymentIntentId);
    return api.get(`/payment/payment-status/${paymentIntentId}`);
  },
  cancelPayment: (paymentIntentId) => {
    console.log('Cancelling payment:', paymentIntentId);
    return api.post(`/payment/cancel-payment/${paymentIntentId}`);
  },
};

// Orders API
export const ordersAPI = {
  // Customer endpoints
  getCustomerOrders: () => {
    console.log('Fetching customer orders...');
    return api.get('/customer/orders');
  },
  getById: (id) => {
    console.log('Fetching order by ID:', id);
    return api.get(`/customer/orders/${id}`);
  },
  getInvoice: (id) => {
    console.log('Fetching invoice for order:', id);
    return api.get(`/customer/orders/${id}/invoice`, {
      responseType: 'blob' // Important for handling PDF files
    });
  },
  downloadInvoice: (id) => {
    console.log('Downloading invoice for order:', id);
    return api.get(`/customer/orders/${id}/invoice`, {
      responseType: 'blob' // Important for handling PDF files
    });
  },
  checkout: (checkoutData) => {
    console.log('Processing checkout:', checkoutData);
    return api.post('/customer/checkout', checkoutData);
  },
  
  // Admin endpoints
  getAllOrders: () => api.get('/admin/orders'),
  updateStatus: (id, status) => api.patch(`/admin/orders/${id}/status?status=${status}`),
};

// Reservations API
export const reservationsAPI = {
  // Public
  checkAvailability: (data) => {
    console.log('Checking availability:', data);
    return api.post('/public/services/availability', data);
  },
  
  // Customer endpoints
  getCustomerReservations: () => {
    console.log('Fetching customer reservations...');
    return api.get('/customer/reservations');
  },
  create: (reservation) => {
    console.log('Creating reservation:', reservation);
    console.log('Token check:', localStorage.getItem('token') ? 'Token exists' : 'No token');
    return api.post('/customer/reservations', reservation);
  },
  
  // Staff endpoints
  getStaffReservations: () => api.get('/staff/reservations'),
  
  // Admin endpoints
  getAllReservations: () => api.get('/admin/reservations'),
  
  // Shared endpoints
  getById: (id) => api.get(`/reservations/${id}`),
  updateStatus: (id, status) => {
    console.log('Updating reservation status:', id, status);
    return api.patch(`/reservations/${id}/status?status=${status}`);
  },
};

// Users API (Admin only)
export const usersAPI = {
  getAll: () => api.get('/admin/users'),
  getByRole: (role) => api.get(`/admin/users/${role}`),
  getById: (id) => api.get(`/admin/users/${id}`),
  create: (user) => api.post('/admin/users', user),
  update: (id, user) => api.put(`/admin/users/${id}`, user),
  delete: (id) => api.delete(`/admin/users/${id}`),
};


export default api;