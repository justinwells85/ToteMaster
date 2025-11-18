const API_BASE_URL = '/api';

/**
 * Auth API Client
 * Handles authentication-related API calls
 */

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} User and token
 */
export const register = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  return response.json();
};

/**
 * Login user
 * @param {Object} credentials - Email and password
 * @returns {Promise<Object>} User and token
 */
export const login = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
};

/**
 * Get current user profile
 * @param {string} token - JWT token
 * @returns {Promise<Object>} User profile
 */
export const getCurrentUser = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get user profile');
  }

  return response.json();
};

/**
 * Update user profile
 * @param {string} token - JWT token
 * @param {Object} updates - Profile updates
 * @returns {Promise<Object>} Updated user
 */
export const updateProfile = async (token, updates) => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update profile');
  }

  return response.json();
};

/**
 * Change password
 * @param {string} token - JWT token
 * @param {Object} passwords - Current and new passwords
 * @returns {Promise<Object>} Success message
 */
export const changePassword = async (token, passwords) => {
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(passwords),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to change password');
  }

  return response.json();
};

/**
 * Delete user account
 * @param {string} token - JWT token
 * @param {string} password - User password for confirmation
 * @returns {Promise<void>}
 */
export const deleteAccount = async (token, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete account');
  }
};
