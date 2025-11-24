
const db = require('../config/database');
const ADLFile = require('./ADLFile');
const Patient = require('./Patient');

class ClinicalProforma {
  constructor(data) {
    this.id = data.id;
    this.patient_id = data.patient_id;
    this.filled_by = data.filled_by;
    this.visit_date = data.visit_date;
    this.visit_type = data.visit_type;
    this.room_no = data.room_no;
    this.assigned_doctor = data.assigned_doctor;
    this.informant_present = data.informant_present;
    this.nature_of_information = data.nature_of_information;
    this.onset_duration = data.onset_duration;
    this.course = data.course;
    this.precipitating_factor = data.precipitating_factor;
    this.illness_duration = data.illness_duration;
    this.current_episode_since = data.current_episode_since;
    this.mood = data.mood;
    this.behaviour = data.behaviour;
    this.speech = data.speech;
    this.thought = data.thought;
    this.perception = data.perception;
    this.somatic = data.somatic;
    this.bio_functions = data.bio_functions;
    this.adjustment = data.adjustment;
    this.cognitive_function = data.cognitive_function;
    this.fits = data.fits;
    this.sexual_problem = data.sexual_problem;
    this.substance_use = data.substance_use;
    this.past_history = data.past_history;
    this.family_history = data.family_history;
    this.associated_medical_surgical = data.associated_medical_surgical;
    this.mse_behaviour = data.mse_behaviour;
    this.mse_affect = data.mse_affect;
    this.mse_thought = data.mse_thought;
    this.mse_delusions = data.mse_delusions;
    this.mse_perception = data.mse_perception;
    this.mse_cognitive_function = data.mse_cognitive_function;
    this.gpe = data.gpe;
    this.diagnosis = data.diagnosis;
    this.icd_code = data.icd_code;
    this.disposal = data.disposal;
    this.workup_appointment = data.workup_appointment;
    this.referred_to = data.referred_to;
    this.treatment_prescribed = data.treatment_prescribed;
    this.prescriptions = data.prescriptions ? (Array.isArray(data.prescriptions) ? data.prescriptions : JSON.parse(data.prescriptions || '[]')) : [];
    this.doctor_decision = data.doctor_decision;
    this.requires_adl_file = data.requires_adl_file;
    this.adl_reasoning = data.adl_reasoning;

    // ADL File Reference (only reference, no ADL data stored here)
    this.adl_file_id = data.adl_file_id;

    // Joined fields from related tables (for queries with JOINs)
    this.patient_name = data.patient_name || null;
    this.cr_no = data.cr_no;
    this.psy_no = data.psy_no;
    this.doctor_name = data.doctor_name;
    this.doctor_role = data.doctor_role;

    this.created_at = data.created_at;
  }

  // Create a new clinical proforma
  static async create(proformaData) {
    try {
      const {
        patient_id,
        filled_by,
        visit_date,
        visit_type,
        room_no,
        assigned_doctor,
        informant_present,
        nature_of_information,
        onset_duration,
        course,
        precipitating_factor,
        illness_duration,
        current_episode_since,
        mood,
        behaviour,
        speech,
        thought,
        perception,
        somatic,
        bio_functions,
        adjustment,
        cognitive_function,
        fits,
        sexual_problem,
        substance_use,
        past_history,
        family_history,
        associated_medical_surgical,
        mse_behaviour,
        mse_affect,
        mse_thought,
        mse_delusions,
        mse_perception,
        mse_cognitive_function,
        gpe,
        diagnosis,
        icd_code,
        disposal,
        workup_appointment,
        referred_to,
        treatment_prescribed,
        doctor_decision,
        requires_adl_file,
        adl_reasoning,
        prescriptions,
        // Complex case data (will be moved to ADL file)
        complexCaseData
      } = proformaData;

      // Check if patient exists
      const patientCheck = await db.query(
        'SELECT id FROM registered_patient WHERE id = $1',
        [patient_id]
      );

      if (patientCheck.rows.length === 0) {
        throw new Error('Patient not found');
      }

      // Convert prescriptions array to JSONB
      const prescriptionsJson = prescriptions ? JSON.stringify(Array.isArray(prescriptions) ? prescriptions : []) : '[]';

      // Insert clinical proforma (without complex case data)
      // IMPORTANT: Complex case data fields are NOT included in this INSERT
      // They are saved separately in adl_files table when requires_adl_file is true
      // This INSERT only contains basic clinical proforma fields and a reference (adl_file_id) if needed
      // ✅ adl_file_id is included in the INSERT to match the schema
      const adl_file_id = proformaData.adl_file_id || null;

      // Prepare all proforma data for insertion
      const allProformaData = {
        nature_of_information,
        onset_duration,
        course,
        precipitating_factor,
        illness_duration,
        current_episode_since,
        mood,
        behaviour,
        speech,
        thought,
        perception,
        somatic,
        bio_functions,
        adjustment,
        cognitive_function,
        fits,
        sexual_problem,
        substance_use,
        past_history,
        family_history,
        associated_medical_surgical,
        mse_behaviour,
        mse_affect,
        mse_thought,
        mse_delusions,
        mse_perception,
        mse_cognitive_function,
        gpe,
        diagnosis,
        icd_code,
        disposal,
        workup_appointment,
        referred_to,
        treatment_prescribed,
        adl_reasoning,
        // ADL-related fields (if stored in clinical_proforma)
        history_narrative: proformaData.history_narrative,
        history_specific_enquiry: proformaData.history_specific_enquiry,
        history_drug_intake: proformaData.history_drug_intake,
        history_treatment_place: proformaData.history_treatment_place,
        history_treatment_dates: proformaData.history_treatment_dates,
        history_treatment_drugs: proformaData.history_treatment_drugs,
        history_treatment_response: proformaData.history_treatment_response
      };

      // All complex case data MUST be saved ONLY in adl_files table, NOT in clinical_proforma
      // The clinical_proforma table should only store a reference (adl_file_id) to the ADL file
      const proformaResult = await db.query(
        `INSERT INTO clinical_proforma (
          patient_id, filled_by, visit_date, visit_type, room_no, assigned_doctor,
          informant_present, nature_of_information, onset_duration, course, 
          precipitating_factor, illness_duration, current_episode_since, mood, behaviour,
          speech, thought, perception, somatic, bio_functions, adjustment, cognitive_function,
          fits, sexual_problem, substance_use, past_history, family_history, 
          associated_medical_surgical, mse_behaviour, mse_affect, mse_thought, mse_delusions,
          mse_perception, mse_cognitive_function, gpe, diagnosis, icd_code, disposal,
          workup_appointment, referred_to, treatment_prescribed, prescriptions, doctor_decision,
          requires_adl_file, adl_reasoning, adl_file_id
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38,
          $39, $40, $41, $42, $43, $44, $45
        ) RETURNING *`,
        [
          patient_id, filled_by, visit_date, visit_type, room_no, assigned_doctor,
          informant_present, allProformaData.nature_of_information, allProformaData.onset_duration, 
          allProformaData.course, allProformaData.precipitating_factor, allProformaData.illness_duration,
          allProformaData.current_episode_since, allProformaData.mood, allProformaData.behaviour,
          allProformaData.speech, allProformaData.thought, allProformaData.perception, 
          allProformaData.somatic, allProformaData.bio_functions, allProformaData.adjustment,
          allProformaData.cognitive_function, allProformaData.fits, allProformaData.sexual_problem,
          allProformaData.substance_use, allProformaData.past_history, allProformaData.family_history,
          allProformaData.associated_medical_surgical, allProformaData.mse_behaviour, 
          allProformaData.mse_affect, allProformaData.mse_thought, allProformaData.mse_delusions,
          allProformaData.mse_perception, allProformaData.mse_cognitive_function, allProformaData.gpe,
          allProformaData.diagnosis, allProformaData.icd_code, allProformaData.disposal,
          allProformaData.workup_appointment, allProformaData.referred_to, 
          allProformaData.treatment_prescribed, prescriptionsJson, doctor_decision,
          requires_adl_file, allProformaData.adl_reasoning, adl_file_id
        ]
      );

      const proforma = new ClinicalProforma(proformaResult.rows[0]);

      // Handle complex case and ADL file creation
      if (doctor_decision === 'complex_case' && requires_adl_file === true && complexCaseData && Object.keys(complexCaseData).length > 0) {
        try {
          // Auto-generate ADL number if not provided
          let nextAdlNo = complexCaseData.adl_no;
          if (!nextAdlNo) {
            nextAdlNo = Patient.generateADLNo();
            console.log(`[ClinicalProforma.create] ✅ Auto - generated ADL number: ${ nextAdlNo }`);
          }

          // Create ADL file with complex case data
          const adlData = {
            patient_id,
            adl_no: nextAdlNo,
            created_by: filled_by,
            clinical_proforma_id: proforma.id,
            file_status: 'created',
            file_created_date: visit_date || new Date(),
            total_visits: 1,
            ...complexCaseData // All complex case data goes to ADL file
          };

          console.log(`[ClinicalProforma.create] ✅ Creating ADL file for complex case `);
          console.log(`[ClinicalProforma.create] ADL No: ${ nextAdlNo }, Proforma ID: ${ proforma.id }, Patient ID: ${ patient_id } `);
          console.log(`[ClinicalProforma.create] Complex case data keys count: ${ Object.keys(complexCaseData).length } `);
          console.log(`[ClinicalProforma.create] Complex case data sample: `, {
            has_informants: Array.isArray(complexCaseData.informants),
            informants_count: Array.isArray(complexCaseData.informants) ? complexCaseData.informants.length : 0,
            has_complaints: !!complexCaseData.complaints_patient,
            has_family_history: !!complexCaseData.family_history_father_age,
            has_physical_exam: !!complexCaseData.physical_appearance,
            has_mse: !!complexCaseData.mse_general_demeanour,
            has_provisional_diagnosis: !!complexCaseData.provisional_diagnosis,
            has_treatment_plan: !!complexCaseData.treatment_plan,
            has_consultant_comments: !!complexCaseData.consultant_comments
          });
          console.log(`[ClinicalProforma.create] All complex case data will be saved to adl_files table`);

          const adlFile = await ADLFile.create(adlData);

          if (!adlFile || !adlFile.id) {
            throw new Error('Failed to create ADL file: No ID returned');
          }

          // Update clinical proforma with ADL file reference
          await db.query(
            'UPDATE clinical_proforma SET adl_file_id = $1 WHERE id = $2',
            [adlFile.id, proforma.id]
          );

          proforma.adl_file_id = adlFile.id;
          console.log(`[ClinicalProforma.create] Successfully created ADL file ${ adlFile.id } and linked to proforma ${ proforma.id } `);
        } catch (adlError) {
          console.error('[ClinicalProforma.create] Error creating ADL file:', adlError);
          // Don't fail the entire proforma creation, but log the error
          // The proforma is already created, but ADL file creation failed
          throw new Error(`Failed to create ADL file for complex case: ${ adlError.message } `);
        }
      }

      return proforma;
    } catch (error) {
      throw error;
    }
  }

  // Find clinical proforma by ID
  static async findById(id) {
    try {
      // Validate that id is a valid integer
      const proformaId = parseInt(id, 10);
      if (isNaN(proformaId) || proformaId <= 0) {
        console.error(`[ClinicalProforma.findById] ❌ Invalid integer ID: ${ id } `);
        return null;
      }
      
      const query = `SELECT cp.*, p.name as patient_name, p.cr_no, p.psy_no,
  u.name as doctor_name, u.role as doctor_role
       FROM clinical_proforma cp
       LEFT JOIN registered_patient p ON cp.patient_id = p.id
       LEFT JOIN users u ON cp.filled_by = u.id
       WHERE cp.id = $1`;

      const result = await db.query(query, [proformaId]);

      if (result.rows.length === 0) {
        return null;
      }

      return new ClinicalProforma(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find clinical proforma by patient ID
  static async findByPatientId(patient_id) {
    try {
      // Validate that patient_id is a valid integer
      const patientIdNum = parseInt(patient_id, 10);
      if (isNaN(patientIdNum) || patientIdNum <= 0) {
        console.error(`[ClinicalProforma.findByPatientId] ❌ Invalid integer patient_id: ${ patient_id } `);
        return [];
      }
      
      const query = `
        SELECT cp.*, p.name as patient_name, p.cr_no, p.psy_no,
  u.name as doctor_name, u.role as doctor_role
        FROM clinical_proforma cp
        LEFT JOIN registered_patient p ON cp.patient_id = p.id
        LEFT JOIN users u ON cp.filled_by = u.id
        WHERE cp.patient_id = $1
        ORDER BY cp.visit_date DESC
  `;
      
      const result = await db.query(query, [patientIdNum]);

      return result.rows.map(row => new ClinicalProforma(row));
    } catch (error) {
      throw error;
    }
  }

  // Get all clinical proforma with pagination and filters
  static async findAll(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT cp.*, p.name as patient_name, p.cr_no, p.psy_no,
  u.name as doctor_name, u.role as doctor_role
        FROM clinical_proforma cp
        LEFT JOIN registered_patient p ON cp.patient_id = p.id
        LEFT JOIN users u ON cp.filled_by = u.id
        WHERE 1 = 1
  `;
      let countQuery = 'SELECT COUNT(*) FROM clinical_proforma WHERE 1=1';
      const params = [];
      let paramCount = 0;

      // Apply filters
      if (filters.visit_type) {
        paramCount++;
        query += ` AND cp.visit_type = $${ paramCount } `;
        countQuery += ` AND visit_type = $${ paramCount } `;
        params.push(filters.visit_type);
      }

      if (filters.doctor_decision) {
        paramCount++;
        query += ` AND cp.doctor_decision = $${ paramCount } `;
        countQuery += ` AND doctor_decision = $${ paramCount } `;
        params.push(filters.doctor_decision);
      }


      if (filters.requires_adl_file !== undefined) {
        paramCount++;
        query += ` AND cp.requires_adl_file = $${ paramCount } `;
        countQuery += ` AND requires_adl_file = $${ paramCount } `;
        params.push(filters.requires_adl_file);
      }

      if (filters.filled_by) {
        paramCount++;
        // filled_by is always an integer
        query += ` AND cp.filled_by = $${ paramCount } `;
        countQuery += ` AND filled_by = $${ paramCount } `;
        params.push(filters.filled_by);
      }

      if (filters.room_no) {
        paramCount++;
        query += ` AND cp.room_no = $${ paramCount } `;
        countQuery += ` AND room_no = $${ paramCount } `;
        params.push(filters.room_no);
      }

      if (filters.date_from) {
        paramCount++;
        query += ` AND cp.visit_date >= $${ paramCount } `;
        countQuery += ` AND visit_date >= $${ paramCount } `;
        params.push(filters.date_from);
      }

      if (filters.date_to) {
        paramCount++;
        query += ` AND cp.visit_date <= $${ paramCount } `;
        countQuery += ` AND visit_date <= $${ paramCount } `;
        params.push(filters.date_to);
      }

      query += ` ORDER BY cp.visit_date DESC LIMIT $${ paramCount + 1 } OFFSET $${ paramCount + 2 } `;
      params.push(limit, offset);

      // Count query uses the same params array but without limit/offset (slice to exclude last 2)
      const countParams = params.slice(0, -2);

      const [proformaResult, countResult] = await Promise.all([
        db.query(query, params),
        db.query(countQuery, countParams)
      ]);

      const proformas = proformaResult.rows.map(row => new ClinicalProforma(row));
      const total = parseInt(countResult.rows[0].count);

      return {
        proformas,
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

  // Update clinical proforma
  async update(updateData) {
    try {
      // IMPORTANT: Allowed fields for clinical_proforma updates
      // Complex case fields (e.g., history_narrative, informants, physical_appearance, etc.) are NOT in this list
      // Complex case data is saved ONLY in adl_files table when requires_adl_file is true
      // This ensures no duplication - clinical_proforma only stores a reference (adl_file_id) to the ADL file
      const allowedFields = [
        'visit_date', 'visit_type', 'room_no', 'assigned_doctor', 
        'informant_present', 'nature_of_information', 'onset_duration', 
        'course', 'precipitating_factor', 'illness_duration',
        'current_episode_since', 'mood', 'behaviour', 'speech', 'thought', 
        'perception', 'somatic', 'bio_functions', 'adjustment', 
        'cognitive_function', 'fits', 'sexual_problem', 'substance_use', 
        'past_history', 'family_history', 'associated_medical_surgical', 
        'mse_behaviour', 'mse_affect', 'mse_thought', 'mse_delusions', 
        'mse_perception', 'mse_cognitive_function', 'gpe', 'diagnosis', 
        'icd_code', 'disposal', 'workup_appointment', 'referred_to',
        'treatment_prescribed', 'doctor_decision', 
        'requires_adl_file', 'adl_reasoning', 'prescriptions'
      ];

      const updates = [];
      const values = [];
      let paramCount = 0;

      // Handle doctor_decision change and complex case data
      const changingToComplexCase = updateData.doctor_decision === 'complex_case' && 
                                     this.doctor_decision !== 'complex_case';
      const isComplexCase = updateData.doctor_decision === 'complex_case' || this.doctor_decision === 'complex_case';
      const complexCaseData = updateData.complexCaseData;

      // Define fields that should be integers (to handle empty strings)
      const integerFields = ['assigned_doctor']; // Add any other integer fields if needed
      const dateFields = ['visit_date', 'workup_appointment']; // Date fields
      
      // CRITICAL: Remove fields that should never be updated
      // These fields are set during creation and should remain constant
      delete updateData.patient_id;
      delete updateData.id;
      delete updateData.filled_by;
      
      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined && key !== 'complexCaseData') {
          paramCount++;
          if (key === 'prescriptions') {
            const jsonValue = Array.isArray(value) ? JSON.stringify(value) : 
                            (typeof value === 'string' ? value : JSON.stringify(value || []));
            updates.push(`${ key } = $${ paramCount }:: jsonb`);
            values.push(jsonValue);
          } else if (dateFields.includes(key)) {
            // Handle date fields - convert empty strings to null
            let sanitizedDate = value;
            if (value === '' || (typeof value === 'string' && value.trim() === '')) {
              sanitizedDate = null;
            }
            updates.push(`${ key } = $${ paramCount } `);
            values.push(sanitizedDate);
          } else {
            // Sanitize value: convert empty strings to null to prevent PostgreSQL type errors
            // PostgreSQL doesn't accept empty strings for integer/numeric fields
            let sanitizedValue = value;
            
            // Convert empty strings to null (PostgreSQL handles null better than empty strings)
            if (value === '' || (typeof value === 'string' && value.trim() === '')) {
              sanitizedValue = null;
            } else if (integerFields.includes(key)) {
              // For integer fields, ensure we have a valid integer or null
              const intValue = parseInt(value, 10);
              if (isNaN(intValue) || intValue <= 0) {
                sanitizedValue = null;
              } else {
                sanitizedValue = intValue;
              }
            }
            
            updates.push(`${ key } = $${ paramCount } `);
            values.push(sanitizedValue);
          }
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      // Update clinical proforma
      if (updates.length > 0) {
      paramCount++;
      values.push(this.id);

      const result = await db.query(
        `UPDATE clinical_proforma SET ${ updates.join(', ') } 
         WHERE id = $${ paramCount }
RETURNING * `,
        values
      );

      if (result.rows.length > 0) {
        Object.assign(this, result.rows[0]);
        }
      }

      // NOTE: ADL file handling is done in the controller (ClinicalController.updateClinicalProforma)
      // to avoid duplicate creation/updates. The model's update method only handles clinical_proforma table updates.
      // Complex case data (complexCaseData) is removed from updateData before calling this method.

      return this;
    } catch (error) {
      throw error;
    }
  }

  // Delete clinical proforma
  async delete() {
    try {
      // If ADL file exists, archive it
      if (this.adl_file_id) {
        const adlFile = await ADLFile.findById(this.adl_file_id);
        if (adlFile) {
          await adlFile.delete();
        }
      }

      // Delete clinical proforma
      await db.query('DELETE FROM clinical_proforma WHERE id = $1', [this.id]);

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get clinical proforma statistics
  static async getStats() {
    try {
      const result = await db.query(`
SELECT
COUNT(*) as total_proformas,
  COUNT(CASE WHEN visit_type = 'first_visit' THEN 1 END) as first_visits,
  COUNT(CASE WHEN visit_type = 'follow_up' THEN 1 END) as follow_ups,
  COUNT(CASE WHEN doctor_decision = 'simple_case' THEN 1 END) as simple_cases,
  COUNT(CASE WHEN doctor_decision = 'complex_case' THEN 1 END) as complex_cases,
  COUNT(CASE WHEN requires_adl_file = true THEN 1 END) as cases_requiring_adl
  FROM clinical_proforma
    `);

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get cases by severity
  // static async getCasesBySeverity() {
  //   try {
  //     const result = await db.query(`
  //       SELECT 
  //         case_severity,
  //         COUNT(*) as count
  //       FROM clinical_proforma 
  //       WHERE case_severity IS NOT NULL
  //       GROUP BY case_severity
  //       ORDER BY count DESC
  //     `);

  //     return result.rows;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // Get cases by decision
  static async getCasesByDecision() {
  try {
    const result = await db.query(`
        SELECT 
          doctor_decision,
          COUNT(*) as count
        FROM clinical_proforma 
        WHERE doctor_decision IS NOT NULL
        GROUP BY doctor_decision
        ORDER BY count DESC
      `);

    return result.rows;
  } catch (error) {
    throw error;
  }
}

  // Get visit trends by period (day, week, month)
  static async getVisitTrends(period = 'week', user_id = null) {
    try {
      let query;
      let params = [];

      if (period === 'day') {
        // Last 7 days
        if (user_id) {
          query = `
            SELECT 
              DATE(created_at) as date,
              COUNT(*) as count
            FROM clinical_proforma
            WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
            AND filled_by = $1
            GROUP BY DATE(created_at)
            ORDER BY date ASC
          `;
          params = [user_id];
        } else {
          query = `
            SELECT 
              DATE(created_at) as date,
              COUNT(*) as count
            FROM clinical_proforma
            WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY DATE(created_at)
            ORDER BY date ASC
          `;
        }
      } else if (period === 'week') {
        // Last 7 weeks
        if (user_id) {
          query = `
            SELECT 
              DATE_TRUNC('week', created_at) as week_start,
              COUNT(*) as count
            FROM clinical_proforma
            WHERE created_at >= CURRENT_DATE - INTERVAL '7 weeks'
            AND filled_by = $1
            GROUP BY DATE_TRUNC('week', created_at)
            ORDER BY week_start ASC
          `;
          params = [user_id];
        } else {
          query = `
            SELECT 
              DATE_TRUNC('week', created_at) as week_start,
              COUNT(*) as count
            FROM clinical_proforma
            WHERE created_at >= CURRENT_DATE - INTERVAL '7 weeks'
            GROUP BY DATE_TRUNC('week', created_at)
            ORDER BY week_start ASC
          `;
        }
      } else {
        // Last 12 months
        if (user_id) {
          query = `
            SELECT 
              DATE_TRUNC('month', created_at) as month_start,
              COUNT(*) as count
            FROM clinical_proforma
            WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
            AND filled_by = $1
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY month_start ASC
          `;
          params = [user_id];
        } else {
          query = `
            SELECT 
              DATE_TRUNC('month', created_at) as month_start,
              COUNT(*) as count
            FROM clinical_proforma
            WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY month_start ASC
          `;
        }
      }

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('[ClinicalProforma.getVisitTrends] Error:', error);
      throw error;
    }
  }

// Convert to JSON
toJSON() {
  return {
    id: this.id,
    patient_id: this.patient_id,
    filled_by: this.filled_by,
    visit_date: this.visit_date,
    visit_type: this.visit_type,
    room_no: this.room_no,
    assigned_doctor: this.assigned_doctor,
    informant_present: this.informant_present,
    nature_of_information: this.nature_of_information,
    onset_duration: this.onset_duration,
    course: this.course,
    precipitating_factor: this.precipitating_factor,
    illness_duration: this.illness_duration,
    current_episode_since: this.current_episode_since,
    mood: this.mood,
    behaviour: this.behaviour,
    speech: this.speech,
    thought: this.thought,
    perception: this.perception,
    somatic: this.somatic,
    bio_functions: this.bio_functions,
    adjustment: this.adjustment,
    cognitive_function: this.cognitive_function,
    fits: this.fits,
    sexual_problem: this.sexual_problem,
    substance_use: this.substance_use,
    past_history: this.past_history,
    family_history: this.family_history,
    associated_medical_surgical: this.associated_medical_surgical,
    mse_behaviour: this.mse_behaviour,
    mse_affect: this.mse_affect,
    mse_thought: this.mse_thought,
    mse_delusions: this.mse_delusions,
    mse_perception: this.mse_perception,
    mse_cognitive_function: this.mse_cognitive_function,
    gpe: this.gpe,
    diagnosis: this.diagnosis,
    icd_code: this.icd_code,
    disposal: this.disposal,
    workup_appointment: this.workup_appointment,
    referred_to: this.referred_to,
    treatment_prescribed: this.treatment_prescribed,
    prescriptions: this.prescriptions,
    doctor_decision: this.doctor_decision,
    requires_adl_file: this.requires_adl_file,
    adl_reasoning: this.adl_reasoning,
    adl_file_id: this.adl_file_id,
    created_at: this.created_at,
    patient_name: this.patient_name,
    cr_no: this.cr_no,
    psy_no: this.psy_no,
    doctor_name: this.doctor_name,
    doctor_role: this.doctor_role
  };
}
}

module.exports = ClinicalProforma;
