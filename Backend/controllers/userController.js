const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const LoginOTP = require('../models/LoginOTP');
const RefreshToken = require('../models/RefreshToken');
const { sendEmail } = require('../config/email');
const { generateAccessToken, getDeviceInfo, getIpAddress } = require('../utils/tokenUtils');

class UserController {
  // Register a new user
  static async register(req, res) {
    try {
      const { name, role, email, password } = req.body;

      const user = await User.create({
        name,
        role,
        email,
        password
      });

      // Generate token
      const token = user.generateToken();

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: user.toJSON(),
          token
        }
      });
    } catch (error) {
      console.error('User registration error:', error);
      
      if (error.message === 'User with this email already exists') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to register user',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Login user - Conditional 2FA based on user settings
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact administrator.'
        });
      }

      // Verify password
      const isValidPassword = await user.verifyPassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if 2FA is enabled for this user
      if (user.two_factor_enabled) {
        // 2FA is enabled - send OTP
        const loginOTP = await LoginOTP.create(user.id);

        // Send OTP email
        await sendEmail(user.email, 'loginOTP', { userName: user.name, otp: loginOTP.otp });

        res.json({
          success: true,
          message: 'OTP sent to your email. Please check your inbox.',
          data: {
            user_id: user.id,
            email: user.email,
            expires_in: 300 // 5 minutes in seconds
          }
        });
      } else {
        // 2FA is disabled - direct login
        await UserController.completeLogin(user, req, res);
      }
    } catch (error) {
      console.error('User login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Verify login OTP - Step 2: Complete login with OTP
  static async verifyLoginOTP(req, res) {
    try {
      const { user_id, otp } = req.body;

      // Verify OTP
      const loginOTP = await LoginOTP.verifyOTP(user_id, otp);
      if (!loginOTP) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }

      // Get user data
      const userData = loginOTP.getUserData();
      
      // Check if user is still active
      if (!userData.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact administrator.'
        });
      }

      // Mark OTP as used
      await loginOTP.markAsUsed();

      // Create user instance for token generation
      const user = new User(userData);
      
      // Complete login with new token system
      await UserController.completeLogin(user, req, res);
    } catch (error) {
      console.error('Verify login OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'OTP verification failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          user: user.toJSON()
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const { name, email } = req.body;
      const updateData = {};

      if (name) updateData.name = name;
      if (email) updateData.email = email;

      await user.update(updateData);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: user.toJSON()
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error.message.includes('duplicate key')) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.changePassword(currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      
      if (error.message === 'Current password is incorrect') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to change password',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get all users (Admin only)
  static async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const role = req.query.role || null;

      const result = await User.findAll(page, limit, role);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get user by ID (Admin only)
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          user: user.toJSON()
        }
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Update user by ID (Admin only)
  static async updateUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const { name, role, email } = req.body;
      const updateData = {};

      if (name) updateData.name = name;
      if (role) updateData.role = role;
      if (email) updateData.email = email;

      await user.update(updateData);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: {
          user: user.toJSON()
        }
      });
    } catch (error) {
      console.error('Update user by ID error:', error);
      
      if (error.message.includes('duplicate key')) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Activate user by ID (Admin only)
  static async activateUserById(req, res) {
    try {
      const { id } = req.params;
      
      // Prevent admin from deactivating themselves
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot activate your own account (already active)'
        });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.activate();

      res.json({
        success: true,
        message: 'User activated successfully',
        data: {
          user: user.toJSON()
        }
      });
    } catch (error) {
      console.error('Activate user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to activate user',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Deactivate user by ID (Admin only)
  static async deactivateUserById(req, res) {
    try {
      const { id } = req.params;
      
      // Prevent admin from deactivating themselves
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate your own account'
        });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.deactivate();

      res.json({
        success: true,
        message: 'User deactivated successfully',
        data: {
          user: user.toJSON()
        }
      });
    } catch (error) {
      console.error('Deactivate user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate user',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Delete user by ID (Admin only)
  static async deleteUserById(req, res) {
    try {
      const { id } = req.params;
      
      // Prevent admin from deleting themselves
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.delete();

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get user statistics (Admin only)
  static async getUserStats(req, res) {
    try {
      const stats = await User.getStats();

      res.json({
        success: true,
        data: {
          stats
        }
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get doctors (JR/SR) - Accessible to all authenticated users
  static async getDoctors(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;

      // Get users with role Faculty or Resident
      const result = await User.findAll(page, limit, null);

      // Filter for Faculty and Resident roles
      const doctors = result.users.filter(user => {
        const role = user.role || '';
        return role === 'Faculty' || 
               role === 'Resident' ||
               // Legacy support for old role names
               role === 'Faculty Residents (Junior Resident (JR))' || 
               role === 'Faculty Residents (Senior Resident (SR))' ||
               role === 'JR' || 
               role === 'SR';
      });

      res.json({
        success: true,
        data: {
          users: doctors,
          pagination: {
            page,
            limit,
            total: doctors.length,
            pages: Math.ceil(doctors.length / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get doctors error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get doctors',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Forgot password - Send OTP to email
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        // For security, don't reveal if email exists or not
        return res.json({
          success: true,
          message: 'If an account with this email exists, a password reset OTP has been sent.'
        });
      }

      // Create password reset token with OTP
      const resetToken = await PasswordResetToken.create(user.id);

      // Send OTP email
      try {
        await sendEmail(user.email, 'passwordResetOTP', { userName: user.name, otp: resetToken.otp });
        
        res.json({
          success: true,
          message: 'If an account with this email exists, a password reset OTP has been sent.',
          data: {
            token: resetToken.token, // Send token for frontend to use
            expires_at: resetToken.expires_at
          }
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        res.status(500).json({
          success: false,
          message: 'Failed to send reset email. Please try again later.'
        });
      }

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset request',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Verify OTP for password reset
  static async verifyOTP(req, res) {
    try {
      const { token, otp } = req.body;

      // Verify OTP
      const resetToken = await PasswordResetToken.verifyOTP(token, otp);
      if (!resetToken) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }

      res.json({
        success: true,
        message: 'OTP verified successfully',
        data: {
          token: resetToken.token,
          user: {
            name: resetToken.user_name,
            email: resetToken.user_email
          }
        }
      });

    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify OTP',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Reset password with verified token
  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      // Find valid token
      const resetToken = await PasswordResetToken.findByToken(token);
      if (!resetToken) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      // Get user and update password
      const user = await User.findById(resetToken.user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update password
      await user.updatePassword(newPassword);

      // Mark token as used
      await resetToken.markAsUsed();

      // Send success email
      try {
        await sendEmail(user.email, 'passwordResetSuccess', { userName: user.name });
      } catch (emailError) {
        console.error('Success email sending failed:', emailError);
        // Don't fail the request if email fails
      }

      res.json({
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset password',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Enable 2FA for user
  static async enable2FA(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if 2FA is already enabled
      if (user.two_factor_enabled) {
        return res.status(400).json({
          success: false,
          message: '2FA is already enabled for this account'
        });
      }

      // Enable 2FA
      await user.enable2FA();

      res.json({
        success: true,
        message: '2FA has been enabled successfully',
        data: {
          two_factor_enabled: true
        }
      });
    } catch (error) {
      console.error('Enable 2FA error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to enable 2FA',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Disable 2FA for user
  static async disable2FA(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if 2FA is already disabled
      if (!user.two_factor_enabled) {
        return res.status(400).json({
          success: false,
          message: '2FA is already disabled for this account'
        });
      }

      // Disable 2FA
      await user.disable2FA();

      res.json({
        success: true,
        message: '2FA has been disabled successfully',
        data: {
          two_factor_enabled: false
        }
      });
    } catch (error) {
      console.error('Disable 2FA error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to disable 2FA',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Helper method to complete login with access and refresh tokens
  static async completeLogin(user, req, res) {
    try {
      // Generate access token (5 minutes)
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Create refresh token in database
      const deviceInfo = getDeviceInfo(req);
      const ipAddress = getIpAddress(req);
      const refreshTokenRecord = await RefreshToken.create(user.id, deviceInfo, ipAddress);

      // Set refresh token in HttpOnly cookie
      res.cookie('refreshToken', refreshTokenRecord.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Update last login
      await user.updateLastLogin();

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          accessToken,
          expiresIn: 300 // 5 minutes in seconds
        }
      });
    } catch (error) {
      console.error('Complete login error:', error);
      throw error;
    }
  }
}

module.exports = UserController;
