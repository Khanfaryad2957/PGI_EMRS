const crypto = require('crypto');

/**
 * Encryption utility for sensitive data
 * Uses AES-256-GCM encryption algorithm
 */

// Get encryption key from environment variable or use a default (for development only)
// IMPORTANT: In production, set ENCRYPTION_KEY in environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For GCM, this is 12, but we'll use 16 for compatibility
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

/**
 * Derives a key from the encryption key using PBKDF2
 */
function getKeyFromPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
}

/**
 * Encrypts a string value
 * @param {string} text - Text to encrypt
 * @returns {string} - Encrypted string (base64 encoded)
 */
function encrypt(text) {
  if (!text || text === null || text === undefined || text === '') {
    return text;
  }

  try {
    // Convert to string if not already
    const textToEncrypt = String(text);

    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    // Derive key from password and salt
    const key = getKeyFromPassword(ENCRYPTION_KEY, salt);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt
    let encrypted = cipher.update(textToEncrypt, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Get auth tag
    const tag = cipher.getAuthTag();

    // Combine salt + iv + tag + encrypted data
    const combined = Buffer.concat([
      salt,
      iv,
      tag,
      Buffer.from(encrypted, 'base64')
    ]);

    // Return as base64 string
    return combined.toString('base64');
  } catch (error) {
    console.error('[encryption.encrypt] Error encrypting data:', error);
    // Return original text if encryption fails (for backward compatibility)
    return text;
  }
}

/**
 * Decrypts an encrypted string
 * @param {string} encryptedText - Encrypted text (base64 encoded)
 * @returns {string} - Decrypted string
 */
function decrypt(encryptedText) {
  if (!encryptedText || encryptedText === null || encryptedText === undefined || encryptedText === '') {
    return encryptedText;
  }

  try {
    // Check if the text is actually encrypted (base64 format with minimum length)
    // If it doesn't look encrypted, return as-is (for backward compatibility with unencrypted data)
    if (typeof encryptedText !== 'string' || encryptedText.length < ENCRYPTED_POSITION) {
      // Might be unencrypted data, return as-is
      return encryptedText;
    }

    // Decode from base64
    const combined = Buffer.from(encryptedText, 'base64');

    // Extract components
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, TAG_POSITION);
    const tag = combined.slice(TAG_POSITION, ENCRYPTED_POSITION);
    const encrypted = combined.slice(ENCRYPTED_POSITION);

    // Derive key
    const key = getKeyFromPassword(ENCRYPTION_KEY, salt);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    // Decrypt
    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    // If decryption fails, it might be unencrypted data (backward compatibility)
    console.warn('[encryption.decrypt] Decryption failed, returning original value (might be unencrypted):', error.message);
    return encryptedText;
  }
}

/**
 * Encrypts an object's sensitive fields
 * @param {Object} obj - Object to encrypt
 * @param {Array<string>} fieldsToEncrypt - Array of field names to encrypt
 * @returns {Object} - Object with encrypted fields
 */
function encryptObject(obj, fieldsToEncrypt = []) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const encrypted = { ...obj };

  fieldsToEncrypt.forEach(field => {
    if (encrypted[field] !== undefined && encrypted[field] !== null && encrypted[field] !== '') {
      encrypted[field] = encrypt(encrypted[field]);
    }
  });

  return encrypted;
}

/**
 * Decrypts an object's encrypted fields
 * @param {Object} obj - Object to decrypt
 * @param {Array<string>} fieldsToDecrypt - Array of field names to decrypt
 * @returns {Object} - Object with decrypted fields
 */
function decryptObject(obj, fieldsToDecrypt = []) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const decrypted = { ...obj };

  fieldsToDecrypt.forEach(field => {
    if (decrypted[field] !== undefined && decrypted[field] !== null && decrypted[field] !== '') {
      decrypted[field] = decrypt(decrypted[field]);
    }
  });

  return decrypted;
}

/**
 * Encrypts an array of objects
 * @param {Array} array - Array of objects to encrypt
 * @param {Array<string>} fieldsToEncrypt - Array of field names to encrypt
 * @returns {Array} - Array with encrypted fields
 */
function encryptArray(array, fieldsToEncrypt = []) {
  if (!Array.isArray(array)) {
    return array;
  }

  return array.map(item => encryptObject(item, fieldsToEncrypt));
}

/**
 * Decrypts an array of objects
 * @param {Array} array - Array of objects to decrypt
 * @param {Array<string>} fieldsToDecrypt - Array of field names to decrypt
 * @returns {Array} - Array with decrypted fields
 */
function decryptArray(array, fieldsToDecrypt = []) {
  if (!Array.isArray(array)) {
    return array;
  }

  return array.map(item => decryptObject(item, fieldsToDecrypt));
}

module.exports = {
  encrypt,
  decrypt,
  encryptObject,
  decryptObject,
  encryptArray,
  decryptArray
};

