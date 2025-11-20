const db = require('../config/database');

class Prescription {
  constructor(data) {
    this.id = data.id;
    this.patient_id = data.patient_id;
    this.clinical_proforma_id = data.clinical_proforma_id;
    this.medicine = data.medicine;
    this.dosage = data.dosage;
    // Database column is 'when_to_take', but we support 'when' and 'when_taken' for API compatibility
    this.when_taken = data.when_to_take || data.when_taken || data.when;
    this.frequency = data.frequency;
    this.duration = data.duration;
    // Database column is 'quantity', but we support 'qty' for API compatibility
    this.quantity = data.quantity || data.qty;
    this.details = data.details;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }


  static async create(prescriptionData) {
    try {
      const {
        patient_id,
        clinical_proforma_id,
        medicine,
        dosage,
        when_taken,
        when,
        frequency,
        duration,
        quantity,
        qty,
        details,
        notes
      } = prescriptionData;
  
      // ONLY required field
      if (!clinical_proforma_id) {
        throw new Error("clinical_proforma_id is required");
      }
  
      const whenValue = when_taken || when || null;
      const quantityValue = quantity || qty || null;
  
      // Ensure medicine is never null (DB constraint)
      const safeMedicine = medicine && medicine.trim() !== "" ? medicine : "";
  
      const result = await db.query(
        `INSERT INTO prescriptions (
           patient_id,
           clinical_proforma_id,
           medicine,
           dosage,
           when_to_take,
           frequency,
           duration,
           quantity,
           details,
           notes
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING *`,
        [
          patient_id || null,
          clinical_proforma_id,
          safeMedicine,      // always NON-null
          dosage || null,
          whenValue,
          frequency || null,
          duration || null,
          quantityValue || null,
          details || null,
          notes || null
        ]
      );
  
      return new Prescription(result.rows[0]);
    } catch (error) {
      console.error("Prescription Create Error:", error);
      throw error;
    }
  }
  
  

  static async createBulk(prescriptionsArray) {
    try {
      if (!Array.isArray(prescriptionsArray) || prescriptionsArray.length === 0) {
        return [];
      }

      // Prepare data array for PostgreSQL bulk insert
      const insertData = [];

      for (const prescription of prescriptionsArray) {
        const { 
          patient_id,
          clinical_proforma_id,
          medicine,
          dosage,
          when_taken,
          when,
          frequency,
          duration,
          quantity,
          qty,
          details,
          notes
        } = prescription;

        if (!clinical_proforma_id || !medicine) {
          continue; // Skip invalid prescriptions
        }

        const whenValue = when_taken || when || null;
        const quantityValue = quantity || qty || null;

        insertData.push({
          patient_id,
          clinical_proforma_id,
          medicine: medicine,
          dosage: dosage || null,
          when_to_take: whenValue, // Use correct database column name
          frequency: frequency || null,
          duration: duration || null,
          quantity: quantityValue, // Use correct database column name
          details: details || null,
          notes: notes || null
        });
      }

      if (insertData.length === 0) {
        return [];
      }

      try {
        // Use PostgreSQL for bulk insert
        const values = [];
        const placeholders = [];
        let paramIndex = 1;

        insertData.forEach((prescription, index) => {
          const rowPlaceholders = [];
          rowPlaceholders.push(`$${paramIndex++}`); // patient_id
          rowPlaceholders.push(`$${paramIndex++}`); // clinical_proforma_id
          rowPlaceholders.push(`$${paramIndex++}`); // medicine
          rowPlaceholders.push(`$${paramIndex++}`); // dosage
          rowPlaceholders.push(`$${paramIndex++}`); // when_to_take
          rowPlaceholders.push(`$${paramIndex++}`); // frequency
          rowPlaceholders.push(`$${paramIndex++}`); // duration
          rowPlaceholders.push(`$${paramIndex++}`); // quantity
          rowPlaceholders.push(`$${paramIndex++}`); // details
          rowPlaceholders.push(`$${paramIndex++}`); // notes
          
          placeholders.push(`(${rowPlaceholders.join(', ')})`);
          
          values.push(
            prescription.patient_id,
            prescription.clinical_proforma_id,
            prescription.medicine,
            prescription.dosage,
            prescription.when_to_take,
            prescription.frequency,
            prescription.duration,
            prescription.quantity,
            prescription.details,
            prescription.notes
          );
        });

        const query = `
          INSERT INTO prescriptions (
            patient_idclinical_proforma_id, medicine, dosage, when_to_take, 
            frequency, duration, quantity, details, notes
          )
          VALUES ${placeholders.join(', ')}
          RETURNING *
        `;

        const result = await db.query(query, values);
        return result.rows.map(row => new Prescription(row));
      } catch (dbError) {
        console.error('Database error in createBulk:', dbError);
        console.error('Insert data count:', insertData.length);
        throw dbError;
      }
    } catch (error) {
      throw error;
    }
  }

  static async findByClinicalProformaId(clinical_proforma_id) {
    try {
      const result = await db.query(
        'SELECT * FROM prescriptions WHERE clinical_proforma_id = $1 ORDER BY id ASC',
        [clinical_proforma_id]
      );

      return result.rows.map(row => new Prescription(row));
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT * FROM prescriptions WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new Prescription(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  async update(updateData) {
    try {
      const allowedFields = [
        'patient_id',
        'medicine',
        'dosage',
        'when_to_take',
        'when_taken',
        'when', // Support multiple field names for API compatibility
        'frequency',
        'duration',
        'quantity',
        'qty', // Support both for API compatibility
        'details',
        'notes'
      ];

      const updates = [];
      const values = [];
      let paramCount = 0;

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          paramCount++;
          // Map API field names to database column names
          if (key === 'patient_id') {
            updates.push(`patient_id = $${paramCount}`);
            values.push(value);
          } else if (key === 'when' || key === 'when_taken') {
            updates.push(`when_to_take = $${paramCount}`);
            values.push(value);
          } else if (key === 'qty') {
            updates.push(`quantity = $${paramCount}`);
            values.push(value);
          } else if (key === 'when_to_take') {
            updates.push(`when_to_take = $${paramCount}`);
            values.push(value);
          } else {
            updates.push(`${key} = $${paramCount}`);
            values.push(value);
          }
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      paramCount++;
      values.push(this.id);

      const result = await db.query(
        `UPDATE prescriptions SET ${updates.join(', ')}
         WHERE id = $${paramCount}
         RETURNING *`,
        values
      );

      Object.assign(this, result.rows[0]);
      return this;
    } catch (error) {
      throw error;
    }
  }

  async delete() {
    try {
      await db.query('DELETE FROM prescriptions WHERE id = $1', [this.id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async deleteByClinicalProformaId(clinical_proforma_id) {
    try {
      const result = await db.query(
        'DELETE FROM prescriptions WHERE clinical_proforma_id = $1 RETURNING id',
        [clinical_proforma_id]
      );
      return result.rows.length;
    } catch (error) {
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      patient_id: this.patient_id,
      clinical_proforma_id: this.clinical_proforma_id,
      medicine: this.medicine,
      dosage: this.dosage,
      when: this.when_taken, // Export as "when" for frontend compatibility
      frequency: this.frequency,
      duration: this.duration,
      qty: this.quantity, // Export as "qty" for frontend compatibility
      details: this.details,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Prescription;

