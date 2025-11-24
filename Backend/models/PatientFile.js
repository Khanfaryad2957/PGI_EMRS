const db = require('../config/database');

class PatientFile {
  constructor(data) {
    this.id = data.id || null;
    this.patient_id = data.patient_id || null;
    this.attachment = data.attachment || [];
    // role is JSONB array: [{ id: 1 }, { id: 2 }]
    this.role = Array.isArray(data.role) ? data.role : (data.role ? JSON.parse(data.role) : []);
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      patient_id: this.patient_id,
      attachment: this.attachment,
      role: this.role,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Find by patient ID
  static async findByPatientId(patient_id) {
    try {
      const result = await db.query(
        `SELECT * FROM patient_files 
         WHERE patient_id = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [patient_id]
      );

      if (!result.rows || result.rows.length === 0) {
        return null;
      }

      return new PatientFile(result.rows[0]);
    } catch (error) {
      console.error('[PatientFile.findByPatientId] Error:', error);
      throw error;
    }
  }

  // Find by ID
  static async findById(id) {
    try {
      const result = await db.query(
        `SELECT * FROM patient_files WHERE id = $1`,
        [id]
      );

      if (!result.rows || result.rows.length === 0) {
        return null;
      }

      return new PatientFile(result.rows[0]);
    } catch (error) {
      console.error('[PatientFile.findById] Error:', error);
      throw error;
    }
  }

  // Create new patient file record
  static async create({ patient_id, attachment, user_id }) {
    try {
      // Ensure attachment is an array
      const attachmentArray = Array.isArray(attachment) ? attachment : [attachment].filter(Boolean);
      
      // Initialize role with user_id: [{ id: user_id }]
      const roleArray = user_id ? [{ id: user_id }] : [];

      const result = await db.query(
        `INSERT INTO patient_files (patient_id, attachment, role)
         VALUES ($1, $2, $3::jsonb)
         RETURNING *`,
        [patient_id, attachmentArray, JSON.stringify(roleArray)]
      );

      if (!result.rows || result.rows.length === 0) {
        throw new Error('Failed to create patient file record');
      }

      return new PatientFile(result.rows[0]);
    } catch (error) {
      console.error('[PatientFile.create] Error:', error);
      throw error;
    }
  }

  // Update patient file record
  static async update(id, { attachment, user_id }) {
    try {
      // Get existing record
      const existing = await PatientFile.findById(id);
      if (!existing) {
        throw new Error('Patient file record not found');
      }

      // Merge attachments if provided
      let attachmentArray = existing.attachment || [];
      if (attachment !== undefined) {
        attachmentArray = Array.isArray(attachment) ? attachment : [attachment].filter(Boolean);
      }

      // Merge role - add user_id if not already present
      let roleArray = existing.role || [];
      if (user_id) {
        const userIdInt = parseInt(user_id, 10);
        const userExists = roleArray.some(r => r.id === userIdInt);
        if (!userExists) {
          roleArray = [...roleArray, { id: userIdInt }];
        }
      }

      const result = await db.query(
        `UPDATE patient_files 
         SET attachment = $1, 
             role = $2::jsonb,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [attachmentArray, JSON.stringify(roleArray), id]
      );

      if (!result.rows || result.rows.length === 0) {
        throw new Error('Failed to update patient file record');
      }

      return new PatientFile(result.rows[0]);
    } catch (error) {
      console.error('[PatientFile.update] Error:', error);
      throw error;
    }
  }

  // Add files to existing record or create new one
  static async addFiles(patient_id, newFiles, user_id) {
    try {
      // Find existing record
      const existing = await PatientFile.findByPatientId(patient_id);

      if (existing) {
        // Merge with existing files
        const updatedFiles = [...(existing.attachment || []), ...newFiles];
        return await PatientFile.update(existing.id, {
          attachment: updatedFiles,
          user_id: user_id
        });
      } else {
        // Create new record
        return await PatientFile.create({
          patient_id,
          attachment: newFiles,
          user_id
        });
      }
    } catch (error) {
      console.error('[PatientFile.addFiles] Error:', error);
      throw error;
    }
  }

  // Remove files from record
  static async removeFiles(patient_id, filesToRemove) {
    try {
      const existing = await PatientFile.findByPatientId(patient_id);
      if (!existing) {
        throw new Error('Patient file record not found');
      }

      // Filter out files to remove
      const filesToRemoveSet = new Set(filesToRemove);
      const updatedFiles = (existing.attachment || []).filter(
        file => !filesToRemoveSet.has(file)
      );

      return await PatientFile.update(existing.id, {
        attachment: updatedFiles,
        user_id: null // Don't update role when just removing files
      });
    } catch (error) {
      console.error('[PatientFile.removeFiles] Error:', error);
      throw error;
    }
  }

  // Delete patient file record
  static async delete(id) {
    try {
      const result = await db.query(
        `DELETE FROM patient_files WHERE id = $1 RETURNING *`,
        [id]
      );

      if (!result.rows || result.rows.length === 0) {
        throw new Error('Patient file record not found');
      }

      return new PatientFile(result.rows[0]);
    } catch (error) {
      console.error('[PatientFile.delete] Error:', error);
      throw error;
    }
  }

  // Delete by patient ID
  static async deleteByPatientId(patient_id) {
    try {
      const result = await db.query(
        `DELETE FROM patient_files WHERE patient_id = $1 RETURNING *`,
        [patient_id]
      );

      return result.rows.map(row => new PatientFile(row));
    } catch (error) {
      console.error('[PatientFile.deleteByPatientId] Error:', error);
      throw error;
    }
  }
}

module.exports = PatientFile;

