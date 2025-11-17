/**
 * User Model
 * Defines the structure and validation for user data
 */

/**
 * Validate user data
 * @param {Object} userData - The user data to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validateUser = (userData, isUpdate = false) => {
  const errors = [];

  // Email validation
  if (!isUpdate || userData.email !== undefined) {
    if (!userData.email || typeof userData.email !== 'string') {
      errors.push('email is required');
    } else {
      const trimmedEmail = userData.email.trim();
      if (trimmedEmail.length === 0) {
        errors.push('email cannot be empty');
      } else if (trimmedEmail.length > 255) {
        errors.push('email must not exceed 255 characters');
      } else {
        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
          errors.push('email must be a valid email address');
        }
      }
    }
  }

  // Password validation (only for creation or if password is being updated)
  if (!isUpdate || userData.password !== undefined) {
    if (!userData.password || typeof userData.password !== 'string') {
      errors.push('password is required');
    } else {
      if (userData.password.length < 8) {
        errors.push('password must be at least 8 characters long');
      }
      if (userData.password.length > 128) {
        errors.push('password must not exceed 128 characters');
      }
      // Password strength requirements
      if (!/[A-Z]/.test(userData.password)) {
        errors.push('password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(userData.password)) {
        errors.push('password must contain at least one lowercase letter');
      }
      if (!/[0-9]/.test(userData.password)) {
        errors.push('password must contain at least one number');
      }
    }
  }

  // Name validation (optional field)
  if (userData.name !== undefined && userData.name !== null) {
    if (typeof userData.name !== 'string') {
      errors.push('name must be a string');
    } else {
      const trimmedName = userData.name.trim();
      if (trimmedName.length > 100) {
        errors.push('name must not exceed 100 characters');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate registration data
 * @param {Object} userData - The user registration data
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validateRegistration = (userData) => {
  return validateUser(userData, false);
};

/**
 * Validate login data
 * @param {Object} credentials - The login credentials
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validateLogin = (credentials) => {
  const errors = [];

  if (!credentials.email || typeof credentials.email !== 'string') {
    errors.push('email is required');
  } else if (credentials.email.trim().length === 0) {
    errors.push('email cannot be empty');
  }

  if (!credentials.password || typeof credentials.password !== 'string') {
    errors.push('password is required');
  } else if (credentials.password.length === 0) {
    errors.push('password cannot be empty');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize user data for safe output (remove sensitive fields)
 * @param {Object} user - The user object
 * @returns {Object} - Sanitized user object without password
 */
export const sanitizeUser = (user) => {
  if (!user) return null;

  const { password_hash, ...safeUser } = user;
  return safeUser;
};
