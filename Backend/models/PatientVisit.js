const db = require('../config/database');

class PatientVisit {
  static async assignPatient({ patient_id, assigned_doctor_id, room_no, visit_date, notes }) {
    try {
      const dateToUse = visit_date || new Date().toISOString().slice(0, 10);

      // Use PostgreSQL query
      const result = await db.query(
        `INSERT INTO patient_visits (patient_id, visit_date, visit_type, has_file, assigned_doctor_id, room_no, visit_status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [patient_id, dateToUse, 'follow_up', false, assigned_doctor_id, room_no || null, 'scheduled', notes || null]
      );

      if (!result.rows || result.rows.length === 0) {
        throw new Error('Failed to create patient visit');
      }

      return result.rows[0];
    } catch (error) {
      console.error('[PatientVisit.assignPatient] Error:', error);
      
      // Check for UUID type errors
      const isUUIDError = error.message && (
        error.message.includes('invalid input syntax for type uuid') ||
        error.message.includes('invalid input syntax for type integer') ||
        error.message.includes('type mismatch') ||
        error.code === '22P02' // PostgreSQL invalid input syntax error code
      );

      if (isUUIDError) {
        if (error.message.includes('invalid input syntax for type uuid')) {
          throw new Error(`Invalid patient_id format: Expected UUID but received "${patient_id}". The patient_visits table uses UUID for patient_id. Please ensure the patient record has a valid UUID.`);
        }
        
        if (error.message.includes('invalid input syntax for type integer')) {
          throw new Error(`Database schema mismatch: The patient_visits.patient_id column is still INT type, but you're trying to insert a UUID. Please run the migration script to convert it to UUID. Error: ${error.message}`);
        }
        
        throw new Error(`Type mismatch error: ${error.message}`);
      }

      throw error;
    }
  }
}

module.exports = PatientVisit;
