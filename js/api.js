/* ============================================
   ALUGAKI — API Communication Layer
   Fetch wrapper for backend communication
   ============================================ */

const API_BASE = '/api';

const api = {
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
      const response = await fetch(url.toString());
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`API POST ${endpoint} failed:`, error);
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
