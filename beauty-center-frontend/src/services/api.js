import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:8083/api',
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
      toast.error("Votre session a expiré, veuillez vous reconnecter.");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
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
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: (email) => api.post(`/auth/resend-verification?email=${encodeURIComponent(email)}`),
  forgotPassword: (email, recaptchaToken) => api.post('/auth/forgot-password', { email, recaptchaToken }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
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

// Add these methods to your existing API file

export const balanceAPI = {
  getBalance: () => {
    console.log('Fetching user balance...');
    return api.get('/customer/balance');
  },

  getTransactions: () => {
    console.log('Fetching balance transactions...');
    return api.get('/customer/balance/transactions');
  },

  addFunds: (amount) => {
    console.log('Adding funds to balance:', amount);
    return api.post('/customer/balance/add', { amount });
  },

  // Admin methods
  getUserBalance: (userId) => {
    console.log('Admin fetching user balance:', userId);
    return api.get(`/admin/users/${userId}/balance`);
  },

  adjustUserBalance: (userId, amount, description) => {
    console.log('Admin adjusting user balance:', userId, amount);
    return api.post(`/admin/users/${userId}/balance/adjust`, {
      amount,
      description
    });
  }
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

export const fileUploadAPI = {
  uploadProductImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);

    console.log('Uploading product image:', file.name);
    return api.post('/files/upload/product-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadProfileImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);

    console.log('Uploading profile image:', file.name);
    return api.post('/files/upload/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadServiceImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);

    console.log('Uploading service image:', file.name);
    return api.post('/files/upload/service-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteImage: (imageUrl) => {
    console.log('Deleting image:', imageUrl);
    return api.delete(`/files/delete?imageUrl=${encodeURIComponent(imageUrl)}`);
  },

  // Health check for file upload system
  checkHealth: () => {
    return api.get('/files/health');
  }
};

// Enhanced Products API with image upload support
export const enhancedProductsAPI = {
  ...productsAPI, // Keep existing methods

  // Create product with images
  createWithImages: (productData, images) => {
    const formData = new FormData();
    formData.append('product', JSON.stringify(productData));

    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    console.log('Creating product with images:', productData.name);
    return api.post('/admin/products/with-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update product with images
  updateWithImages: (id, productData, newImages, keepExistingImages = true) => {
    const formData = new FormData();
    formData.append('product', JSON.stringify(productData));
    formData.append('keepExistingImages', keepExistingImages);

    if (newImages && newImages.length > 0) {
      newImages.forEach((image) => {
        formData.append('images', image);
      });
    }

    console.log('Updating product with images:', id);
    return api.put(`/admin/products/${id}/with-images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Add images to existing product
  addImages: (id, images) => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    console.log('Adding images to product:', id);
    return api.post(`/admin/products/${id}/add-images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Remove specific image from product
  removeImage: (id, imageUrl) => {
    console.log('Removing image from product:', id, imageUrl);
    return api.delete(`/admin/products/${id}/images?imageUrl=${encodeURIComponent(imageUrl)}`);
  }
};

// Reviews API
export const reviewsAPI = {
  getReviews: (limit = 10) => api.get(`/reviews?limit=${limit}`),
  getReviewsByRating: (minRating) => api.get(`/reviews/rating/${minRating}`),
  getReviewStats: () => api.get('/reviews/stats'),
};

// Gift Cards API
export const giftCardsAPI = {
  // Customer endpoints
  purchase: (data) => {
    console.log('Purchasing gift card:', data);
    return api.post('/customer/gift-cards/purchase', data);
  },
  redeem: (data) => {
    console.log('Redeeming gift card:', data);
    return api.post('/customer/gift-cards/redeem', data);
  },
  getPurchased: () => {
    console.log('Fetching purchased gift cards...');
    return api.get('/customer/gift-cards/purchased');
  },
  getReceived: () => {
    console.log('Fetching received gift cards...');
    return api.get('/customer/gift-cards/received');
  },

  // Admin endpoints
  adminVerify: (token) => {
    console.log('Admin verifying gift card with token:', token);
    return api.get(`/admin/gift-cards/verify?token=${encodeURIComponent(token)}`);
  },
  adminMarkUsed: (giftCardId) => {
    console.log('Admin marking gift card as used:', giftCardId);
    return api.post(`/admin/gift-cards/${giftCardId}/mark-used`);
  },
  adminExpire: () => {
    console.log('Admin expiring gift cards...');
    return api.post('/admin/gift-cards/expire');
  }
};

export default api;