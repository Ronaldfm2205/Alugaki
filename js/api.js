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
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
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
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
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
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
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
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
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
