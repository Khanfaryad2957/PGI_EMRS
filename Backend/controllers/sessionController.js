const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const { generateAccessToken, getDeviceInfo, getIpAddress } = require('../utils/tokenUtils');
const db = require('../config/database');

class SessionController {
  /**
   * Refresh access token using refresh token
   * Only refreshes if user has been active within the last 15 minutes
   */
  static async refreshToken(req, res) {
    try {
      // Get refresh token from HttpOnly cookie
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      // Find refresh token in database
      const tokenRecord = await RefreshToken.findByToken(refreshToken);
      if (!tokenRecord || !tokenRecord.isValid()) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      // Check if user has been active within last 15 minutes
      const lastActivity = new Date(tokenRecord.last_activity);
      const now = new Date();
      const inactiveMinutes = (now - lastActivity) / (1000 * 60);

      if (inactiveMinutes > 15) {
        // Session expired due to inactivity
        await tokenRecord.revoke();
        
        // Clear refresh token cookie
        res.clearCookie('refreshToken', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });

        return res.status(401).json({
          success: false,
          message: 'Session expired due to inactivity',
          code: 'SESSION_EXPIRED'
        });
      }

      // Get user data
      const user = await User.findById(tokenRecord.user_id);
      if (!user || !user.is_active) {
        await tokenRecord.revoke();
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
      }

      // Update last activity
      await tokenRecord.updateActivity();

      // Generate new access token
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      res.json({
        success: true,
        data: {
          accessToken,
          expiresIn: 300 // 5 minutes in seconds
        }
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to refresh token',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Logout - Revoke refresh token
   */
  static async logout(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        const tokenRecord = await RefreshToken.findByToken(refreshToken);
        if (tokenRecord) {
          await tokenRecord.revoke();
        }
      }

      // Clear refresh token cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to logout',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update activity timestamp
   * Called by frontend to keep session alive
   */
  static async updateActivity(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      const tokenRecord = await RefreshToken.findByToken(refreshToken);
      if (!tokenRecord || !tokenRecord.isValid()) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      // Update last activity
      await tokenRecord.updateActivity();

      res.json({
        success: true,
        message: 'Activity updated'
      });
    } catch (error) {
      console.error('Update activity error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update activity',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get current session info
   */
  static async getSessionInfo(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'No active session'
        });
      }

      const tokenRecord = await RefreshToken.findByToken(refreshToken);
      if (!tokenRecord || !tokenRecord.isValid()) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired session'
        });
      }

      // Calculate time until session expires (15 minutes from last activity)
      const lastActivity = new Date(tokenRecord.last_activity);
      const sessionExpiresAt = new Date(lastActivity.getTime() + 15 * 60 * 1000);
      const now = new Date();
      const secondsUntilExpiry = Math.max(0, Math.floor((sessionExpiresAt - now) / 1000));

      res.json({
        success: true,
        data: {
          lastActivity: tokenRecord.last_activity,
          sessionExpiresAt: sessionExpiresAt.toISOString(),
          secondsUntilExpiry,
          deviceInfo: tokenRecord.device_info
        }
      });
    } catch (error) {
      console.error('Get session info error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get session info',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = SessionController;

