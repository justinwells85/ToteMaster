// Use direct backend URL in Docker, proxy in local dev
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

console.log('[API] Using base URL:', API_BASE_URL);

/**
 * API Client with automatic Authorization header injection and request deduplication
 */
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    // Cache for in-flight requests to prevent duplicate concurrent requests
    this.pendingRequests = new Map();
  }

  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.headers),
    };

    // Create a cache key for deduplication (only for GET requests)
    const cacheKey = options.method === 'GET' ? `${options.method}:${url}` : null;

    // Check if this exact request is already in-flight
    if (cacheKey && this.pendingRequests.has(cacheKey)) {
      console.log(`[API] Deduplicating request: ${cacheKey}`);
      return this.pendingRequests.get(cacheKey);
    }

    // Make the actual request
    const requestPromise = (async () => {
      try {
        const response = await fetch(url, config);

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Request failed' }));
          throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        // Handle 204 No Content
        if (response.status === 204) {
          return null;
        }

        return response.json();
      } finally {
        // Remove from pending requests when done
        if (cacheKey) {
          this.pendingRequests.delete(cacheKey);
        }
      }
    })();

    // Store in pending requests for deduplication
    if (cacheKey) {
      this.pendingRequests.set(cacheKey, requestPromise);
    }

    return requestPromise;
  }

  async get(endpoint, options = {}) {
    const params = options.params ? `?${new URLSearchParams(options.params)}` : '';
    return this.request(`${endpoint}${params}`, { method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
