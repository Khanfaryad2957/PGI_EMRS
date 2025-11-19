/**
 * Utility functions to detect encrypted data in the frontend
 * Note: Decryption should happen on the backend, but this helps detect
 * when encrypted data accidentally reaches the frontend
 */

// Minimum length for encrypted data (SALT_LENGTH + IV_LENGTH + TAG_LENGTH = 96 bytes)
// Base64 encoded, so minimum length is approximately 128 characters
const MIN_ENCRYPTED_LENGTH = 128;

/**
 * Detects if a string appears to be encrypted base64 data
 * @param {string} value - The value to check
 * @returns {boolean} - True if the value appears to be encrypted
 */
export const isEncrypted = (value) => {
  if (!value || typeof value !== 'string') {
    return false;
  }

  // Check if it's a long base64 string (encrypted data is base64 encoded)
  // Encrypted data should be at least 128 characters (96 bytes base64 encoded)
  if (value.length < MIN_ENCRYPTED_LENGTH) {
    return false;
  }

  // Check if it matches base64 pattern (A-Z, a-z, 0-9, +, /, =)
  const base64Pattern = /^[A-Za-z0-9+/=]+$/;
  if (!base64Pattern.test(value)) {
    return false;
  }

  // Additional check: encrypted data typically doesn't contain spaces or readable text
  // If it contains spaces or common words, it's likely not encrypted
  if (value.includes(' ') || value.includes('\n') || value.includes('\t')) {
    return false;
  }

  // If it's a very long base64 string without spaces, it's likely encrypted
  return true;
};

/**
 * Formats encrypted data for display with a warning indicator
 * @param {string} value - The encrypted value
 * @param {string} fieldName - The name of the field (for logging)
 * @returns {object} - Object with display value and isEncrypted flag
 */
export const formatEncryptedField = (value, fieldName = '') => {
  if (!value) {
    return { display: value || 'Not specified', isEncrypted: false };
  }

  const encrypted = isEncrypted(value);
  
  if (encrypted) {
    console.warn(`[EncryptionDetection] Encrypted data detected in field: ${fieldName}`, {
      field: fieldName,
      valueLength: value.length,
      preview: value.substring(0, 50) + '...'
    });
    
    return {
      display: '[Encrypted - Decryption Failed]',
      isEncrypted: true,
      originalValue: value
    };
  }

  return {
    display: value,
    isEncrypted: false
  };
};

/**
 * Checks all encrypted fields in a clinical proforma object
 * @param {object} proforma - The clinical proforma object
 * @returns {object} - Object with detected encrypted fields
 */
export const checkEncryptedFields = (proforma) => {
  if (!proforma || typeof proforma !== 'object') {
    return { hasEncrypted: false, encryptedFields: [] };
  }

  const encryptedFields = [
    'diagnosis',
    'gpe',
    'past_history',
    'family_history',
    'treatment_prescribed',
    'precipitating_factor',
    'illness_duration',
    'current_episode_since',
    'mse_delusions',
    'disposal',
    'referred_to',
    'adl_reasoning'
  ];

  const detected = [];
  
  encryptedFields.forEach(field => {
    if (proforma[field] && isEncrypted(proforma[field])) {
      detected.push(field);
    }
  });

  // Also check patient_name (should be decrypted by backend, but check as fallback)
  if (proforma.patient_name && isEncrypted(proforma.patient_name)) {
    detected.push('patient_name');
    console.error('[EncryptionDetection] patient_name is encrypted - backend decryption may have failed');
  }

  return {
    hasEncrypted: detected.length > 0,
    encryptedFields: detected
  };
};

