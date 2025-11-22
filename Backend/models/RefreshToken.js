const db = require('../config/database');
const crypto = require('crypto');

class RefreshToken {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.token = data.token;
    this.device_info = data.device_info;
    this.ip_address = data.ip_address;
    this.last_activity = data.last_activity;
    this.expires_at = data.expires_at;
    this.is_revoked = data.is_revoked || false;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Generate a secure random refresh token
  static generateToken() {
    return crypto.randomBytes(64).toString('hex');
  }

  // Create a new refresh token
  static async create(userId, deviceInfo = null, ipAddress = null) {
    try {
      const token = this.generateToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days TTL

      const result = await db.query(
        `INSERT INTO refresh_tokens (user_id, token, device_info, ip_address, expires_at, last_activity)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
         RETURNING *`,
        [userId, token, deviceInfo, ipAddress, expiresAt]
      );

      return new RefreshToken(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find refresh token by token string
  static async findByToken(token) {
    try {
      const result = await db.query(
        `SELECT * FROM refresh_tokens 
         WHERE token = $1 
         AND is_revoked = false 
         AND expires_at > NOW()`,
        [token]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new RefreshToken(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find all active refresh tokens for a user
  static async findByUserId(userId) {
    try {
      const result = await db.query(
        `SELECT * FROM refresh_tokens 
         WHERE user_id = $1 
         AND is_revoked = false 
         AND expires_at > NOW()
         ORDER BY created_at DESC`,
        [userId]
      );

      return result.rows.map(row => new RefreshToken(row));
    } catch (error) {
      throw error;
    }
  }

  // Update last activity timestamp
  async updateActivity() {
    try {
      const result = await db.query(
        `UPDATE refresh_tokens 
         SET last_activity = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 
         RETURNING *`,
        [this.id]
      );

      if (result.rows.length > 0) {
        this.last_activity = result.rows[0].last_activity;
        this.updated_at = result.rows[0].updated_at;
      }

      return this;
    } catch (error) {
      throw error;
    }
  }

  // Revoke a refresh token
  async revoke() {
    try {
      const result = await db.query(
        `UPDATE refresh_tokens 
         SET is_revoked = true, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 
         RETURNING *`,
        [this.id]
      );

      if (result.rows.length > 0) {
        this.is_revoked = true;
        this.updated_at = result.rows[0].updated_at;
      }

      return this;
    } catch (error) {
      throw error;
    }
  }

  // Revoke all refresh tokens for a user
  static async revokeAllForUser(userId) {
    try {
      const result = await db.query(
        `UPDATE refresh_tokens 
         SET is_revoked = true, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $1 AND is_revoked = false 
         RETURNING *`,
        [userId]
      );

      return result.rowCount;
    } catch (error) {
      throw error;
    }
  }

  // Clean up expired tokens
  static async cleanupExpired() {
    try {
      const result = await db.query(
        `DELETE FROM refresh_tokens 
         WHERE expires_at < NOW() OR is_revoked = true`
      );

      return result.rowCount;
    } catch (error) {
      throw error;
    }
  }

  // Check if token is still valid (not expired and not revoked)
  isValid() {
    const now = new Date();
    const expiresAt = new Date(this.expires_at);
    return !this.is_revoked && expiresAt > now;
  }

  // Convert to JSON (exclude sensitive token)
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      device_info: this.device_info,
      ip_address: this.ip_address,
      last_activity: this.last_activity,
      expires_at: this.expires_at,
      created_at: this.created_at
    };
  }
}

module.exports = RefreshToken;

