const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.role = data.role;
    this.email = data.email;
    this.mobile = data.mobile;
    this.password_hash = data.password_hash;
    this.two_factor_secret = data.two_factor_secret;
    this.two_factor_enabled = data.two_factor_enabled;
    this.backup_codes = data.backup_codes;
    this.is_active = data.is_active;
    this.last_login = data.last_login;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new user
  static async create(userData) {
    try {
      const { name, role, email, password ,mobile} = userData;
      
      // Check if user already exists
      const existingUser = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Insert user
      const result = await db.query(
        `INSERT INTO users (name, role, email, password_hash, mobile) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, name, role, email, mobile, created_at`,
        [name, role, email, password_hash, mobile]
      );

      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get all users with pagination
  static async findAll(page = 1, limit = 10, role = null) {
    try {
      const offset = (page - 1) * limit;
      let query = 'SELECT id, name, role, email, mobile, created_at FROM users';
      let countQuery = 'SELECT COUNT(*) FROM users';
      const params = [];
      let paramCount = 0;

      if (role) {
        paramCount++;
        query += ` WHERE role = $${paramCount}`;
        countQuery += ` WHERE role = $${paramCount}`;
        params.push(role);
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const [usersResult, countResult] = await Promise.all([
        db.query(query, params),
        db.query(countQuery, role ? [role] : [])
      ]);

      const users = usersResult.rows.map(row => new User(row));
      const total = parseInt(countResult.rows[0].count);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Update user
  async update(updateData) {
    try {
      const allowedFields = ['name', 'role', 'email', 'mobile'];
      const updates = [];
      const values = [];
      let paramCount = 0;

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          paramCount++;
          updates.push(`${key} = $${paramCount}`);
          values.push(value);
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      paramCount++;
      values.push(this.id);

      const result = await db.query(
        `UPDATE users SET ${updates.join(', ')} 
         WHERE id = $${paramCount} 
         RETURNING id, name, role, email, mobile, created_at`,
        values
      );

      if (result.rows.length > 0) {
        Object.assign(this, result.rows[0]);
      }

      return this;
    } catch (error) {
      throw error;
    }
  }

  // Activate user
  async activate() {
    try {
      const result = await db.query(
        'UPDATE users SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, email, role, mobile, is_active, created_at',
        [this.id]
      );

      if (result.rows.length > 0) {
        this.is_active = true;
        return this;
      }
      throw new Error('User not found');
    } catch (error) {
      throw error;
    }
  }

  // Deactivate user
  async deactivate() {
    try {
      const result = await db.query(
        'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, email, role, is_active, created_at',
        [this.id]
      );

      if (result.rows.length > 0) {
        this.is_active = false;
        return this;
      }
      throw new Error('User not found');
    } catch (error) {
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, this.password_hash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await db.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [newPasswordHash, this.id]
      );

      this.password_hash = newPasswordHash;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Update password (for forgot password flow - no current password verification)
  async updatePassword(newPassword) {
    try {
      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await db.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newPasswordHash, this.id]
      );

      this.password_hash = newPasswordHash;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  async verifyPassword(password) {
    try {
      return await bcrypt.compare(password, this.password_hash);
    } catch (error) {
      throw error;
    }
  }

  // Generate JWT token
  generateToken() {
    try {
      return jwt.sign(
        {
          userId: this.id,
          email: this.email,
          role: this.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );
    } catch (error) {
      throw error;
    }
  }

  // Delete user (soft delete by deactivating)
  async delete() {
    try {
      // First, set all foreign key references to NULL or handle them appropriately
      // This prevents foreign key constraint violations
      
      // 1. Set clinical_proforma.filled_by to NULL for records created by this user
      await db.query('UPDATE clinical_proforma SET filled_by = NULL WHERE filled_by = $1', [this.id]);
      
      // 3. Set adl_files.created_by to NULL for files created by this user
      await db.query('UPDATE adl_files SET created_by = NULL WHERE created_by = $1', [this.id]);
      
      // 4. Set adl_files.last_accessed_by to NULL for files last accessed by this user
      await db.query('UPDATE adl_files SET last_accessed_by = NULL WHERE last_accessed_by = $1', [this.id]);
      
      
      // 6. Set patient_assignments.assigned_doctor to NULL for assignments to this user
      await db.query('UPDATE patient_assignments SET assigned_doctor = NULL WHERE assigned_doctor = $1', [this.id]);
      
      // 7. Set audit_logs.changed_by to NULL for logs by this user
      await db.query('UPDATE audit_logs SET changed_by = NULL WHERE changed_by = $1', [this.id]);
      
      await db.query('UPDATE prescriptions SET filled_by = NULL WHERE filled_by = $1', [this.id]);
      // Now delete the user (login_otps and password_reset_tokens will cascade automatically)
      await db.query('DELETE FROM users WHERE id = $1', [this.id]);
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Get user statistics
  static async getStats() {
    try {
      const result = await db.query(`
        SELECT 
          role,
          COUNT(*) as count
        FROM users 
        GROUP BY role
        ORDER BY role
      `);

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Update last login timestamp
  async updateLastLogin() {
    try {
      await db.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [this.id]
      );
      this.last_login = new Date().toISOString();
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Enable 2FA for user
  async enable2FA() {
    try {
      const result = await db.query(
        'UPDATE users SET two_factor_enabled = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING two_factor_enabled',
        [this.id]
      );

      if (result.rows.length > 0) {
        this.two_factor_enabled = result.rows[0].two_factor_enabled;
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Disable 2FA for user
  async disable2FA() {
    try {
      const result = await db.query(
        'UPDATE users SET two_factor_enabled = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING two_factor_enabled',
        [this.id]
      );

      if (result.rows.length > 0) {
        this.two_factor_enabled = result.rows[0].two_factor_enabled;
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Convert to JSON (exclude sensitive data)
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      mobile: this.mobile,
      email: this.email,
      two_factor_enabled: this.two_factor_enabled,
      created_at: this.created_at
    };
  }
}

module.exports = User;
