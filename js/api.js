/* ============================================
   ALUGAKI — API Communication Layer
   Fetch wrapper for backend communication
   ============================================ */

const API_BASE = '/api';

const api = {
  /**
   * Helper to get common headers including Auth token
   */
  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const userJson = localStorage.getItem('alugaki_user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.token) {
          headers['Authorization'] = `Bearer ${user.token}`;
        }
      } catch (e) {}
    }
    return headers;
  },

  /**
   * Helper to handle response and intercept 401 Unauthorized globally
   */
  async checkResponse(response) {
    if (response.status === 401) {
      console.warn('Token expired or invalid. Forcing logout.');
      localStorage.removeItem('alugaki_user');
      window.location.href = 'login.html?expired=true';
      throw new Error('Unauthorized');
    }
    if (!response.ok) {
      // Tentar extrair a mensagem de erro do backend, se houver
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {}
      throw new Error(errorMessage);
    }
    return await response.json();
  },

  /**
   * Generic GET request
   */
  async get(endpoint, params = {}) {
    const url = new URL(`${API_BASE}${endpoint}`, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });

    try {
      const response = await fetch(url.toString(), {
        headers: api.getHeaders()
      });
      return await api.checkResponse(response);
    } catch (error) {
      console.error(`API GET ${endpoint} failed:`, error);
      throw error;
    }
  },

  /**
   * Generic POST request
   */
  async post(endpoint, data = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify(data),
      });
      return await api.checkResponse(response);
    } catch (error) {
      console.error(`API POST ${endpoint} failed:`, error);
      throw error;
    }
  },

  /**
   * Generic PUT request
   */
  async put(endpoint, data = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: api.getHeaders(),
        body: JSON.stringify(data),
      });
      return await api.checkResponse(response);
    } catch (error) {
      console.error(`API PUT ${endpoint} failed:`, error);
      throw error;
    }
  },

  /**
   * Generic DELETE request
   */
  async delete(endpoint) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
        headers: api.getHeaders()
      });
      return await api.checkResponse(response);
    } catch (error) {
      console.error(`API DELETE ${endpoint} failed:`, error);
      throw error;
    }
  },

  // ── Product Endpoints ──
  products: {
    list(params) { return api.get('/products', params); },
    getById(id) { return api.get(`/products/${id}`); },
    featured() { return api.get('/products/featured'); },
  },

  // ── Auth Endpoints ──
  auth: {
    login(email, password) { return api.post('/auth/login', { email, password }); },
    register(data) { return api.post('/auth/register', data); },
    updateProfile(data) { return api.put('/auth/profile', data); },
  },

  // ── Booking Endpoints ──
  bookings: {
    create(data) { return api.post('/bookings', data); },
    getById(id) { return api.get(`/bookings/${id}`); },
  },

  // ── Category Endpoints ──
  categories: {
    list() { return api.get('/categories'); },
  },
};

// Export for use in other scripts
window.AlugakiAPI = api;
