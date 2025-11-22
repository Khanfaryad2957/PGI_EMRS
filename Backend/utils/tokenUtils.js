const jwt = require('jsonwebtoken');

/**
 * Generate a short-lived access token (5 minutes)
 * @param {Object} payload - Token payload (userId, email, role)
 * @returns {string} JWT access token
 */
function generateAccessToken(payload) {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      type: 'access'
    },
    process.env.JWT_SECRET,
    { expiresIn: '5m' } // 5 minutes TTL
  );
}

/**
 * Generate a long-lived refresh token (7 days)
 * Note: This is just for signing, actual token is stored in DB
 * @param {Object} payload - Token payload (userId, tokenId)
 * @returns {string} JWT refresh token
 */
function generateRefreshTokenJWT(payload) {
  return jwt.sign(
    {
      userId: payload.userId,
      tokenId: payload.tokenId,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' } // 7 days TTL
  );
}

/**
 * Verify and decode an access token
 * @param {string} token - JWT access token
 * @returns {Object} Decoded token payload
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
}

/**
 * Verify and decode a refresh token JWT
 * @param {string} token - JWT refresh token
 * @returns {Object} Decoded token payload
 */
function verifyRefreshTokenJWT(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
}

/**
 * Extract device info from request headers
 * @param {Object} req - Express request object
 * @returns {string} Device information string
 */
function getDeviceInfo(req) {
  const userAgent = req.headers['user-agent'] || 'Unknown';
  return userAgent.substring(0, 255); // Limit length
}

/**
 * Extract IP address from request
 * @param {Object} req - Express request object
 * @returns {string} IP address
 */
function getIpAddress(req) {
  return req.ip || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         req.connection.remoteAddress || 
         'Unknown';
}

module.exports = {
  generateAccessToken,
  generateRefreshTokenJWT,
  verifyAccessToken,
  verifyRefreshTokenJWT,
  getDeviceInfo,
  getIpAddress
};

