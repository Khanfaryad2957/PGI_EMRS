const db = require('../config/database');
const crypto = require('crypto');

class LoginOTP {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.otp = data.otp;
    this.expires_at = data.expires_at;
    this.used = data.used;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    
    // User data fields
    this.name = data.name;
    this.email = data.email;
    this.mobile = data.mobile;
    this.role = data.role;
    this.is_active = data.is_active;
  }

  // Create a new login OTP
  static async create(userId) {
    try {
      // First, mark any existing unused OTPs for this user as used
      await db.query(
        'UPDATE login_otps SET used = true WHERE user_id = $1 AND used = false',
        [userId]
      );

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Set expiration time (5 minutes from now)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      const result = await db.query(
        `INSERT INTO login_otps (user_id, otp, expires_at) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [userId, otp, expiresAt.toISOString()]
      );

      return new LoginOTP(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find login OTP by user ID and OTP
  static async verifyOTP(userId, otp) {
    try {
      const result = await db.query(
        `SELECT * FROM login_otps 
         WHERE user_id = $1 AND otp = $2 AND used = false AND expires_at > NOW()`,
        [userId, otp]
      );

      if (result.rows.length === 0) {
        return null;
      }

      // Get user data separately
      const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length === 0) {
        return null;
      }

      // Combine data - prioritize OTP data, then add user data
      const combinedData = { ...result.rows[0] };
      const userData = userResult.rows[0];
      combinedData.name = userData.name;
      combinedData.mobile = userData.mobile;
      combinedData.email = userData.email;
      combinedData.role = userData.role;
      combinedData.is_active = userData.is_active;
      return new LoginOTP(combinedData);
    } catch (error) {
      throw error;
    }
  }

  // Find login OTP by user ID (for checking if OTP exists)
  static async findByUserId(userId) {
    try {
      const result = await db.query(
        `SELECT * FROM login_otps 
         WHERE user_id = $1 AND used = false AND expires_at > NOW()
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      // Get user data separately
      const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length === 0) {
        return null;
      }

      // Combine data - prioritize OTP data, then add user data
      const combinedData = { ...result.rows[0] };
      const userData = userResult.rows[0];
      combinedData.name = userData.name;
      combinedData.mobile = userData.mobile;
      combinedData.email = userData.email;
      combinedData.role = userData.role;
      combinedData.is_active = userData.is_active;
      return new LoginOTP(combinedData);
    } catch (error) {
      throw error;
    }
  }

  // Mark OTP as used
  async markAsUsed() {
    try {
      const result = await db.query(
        'UPDATE login_otps SET used = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [this.id]
      );

      if (result.rows.length > 0) {
        this.used = true;
        this.updated_at = result.rows[0].updated_at;
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }

  // Clean up expired OTPs
  static async cleanupExpiredOTPs() {
    try {
      const result = await db.query(
        'DELETE FROM login_otps WHERE expires_at < NOW() OR used = true'
      );
      return result.rowCount;
    } catch (error) {
      throw error;
    }
  }

  // Get user data for this OTP
  getUserData() {
    return {
      id: this.user_id,
      name: this.name,
      mobile: this.mobile,
      email: this.email,
      role: this.role,
      is_active: this.is_active
    };
  }
}

module.exports = LoginOTP;
