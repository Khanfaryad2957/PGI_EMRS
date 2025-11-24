
// models/Patient.js
const db = require('../config/database');

class Patient {
  constructor(data = {}) {
    // 🔹 Core identifiers
    this.id = data.id || null;
    this.cr_no = data.cr_no || null;
    this.psy_no = data.psy_no || null;
    this.adl_no = data.adl_no || null;
    this.special_clinic_no = data.special_clinic_no || null;

    // 🔹 Registration & Quick Entry details
    this.date = data.date || null;
    this.name = data.name || null;
    this.age = data.age || null;
    this.sex = data.sex || null;
    this.category = data.category || null;
    this.father_name = data.father_name || null;
    this.department = data.department || null;
    this.unit_consit = data.unit_consit || null;
    this.room_no = data.room_no || null;
    this.serial_no = data.serial_no || null;
    this.file_no = data.file_no || null;
    this.unit_days = data.unit_days || null;
    this.contact_number = data.contact_number || null;

    // 🔹 Examination & clinic details
    this.seen_in_walk_in_on = data.seen_in_walk_in_on || null;
    this.worked_up_on = data.worked_up_on || null;
    this.age_group = data.age_group || null;

    // 🔹 Personal information
    this.marital_status = data.marital_status || null;
    this.year_of_marriage = data.year_of_marriage || null;
    this.no_of_children_male = data.no_of_children_male || null;
    this.no_of_children_female = data.no_of_children_female || null;

    // 🔹 Occupation & education
    this.occupation = data.occupation || null;
    this.education = data.education || null;
    this.locality = data.locality || null;
   
    this.patient_income = data.patient_income || null;
    this.family_income = data.family_income || null;
    this.religion = data.religion || null;
    this.family_type = data.family_type || null;

    // 🔹 Head of family
    this.head_name = data.head_name || data.father_name || null;
    this.head_age = data.head_age || null;
    this.head_relationship = data.head_relationship || null;
    this.head_education = data.head_education || null;
    this.head_occupation = data.head_occupation || null;
    this.head_income = data.head_income || null;

    // 🔹 Distance & mobility
    this.distance_from_hospital = data.distance_from_hospital || null;
    this.mobility = data.mobility || null;

    // 🔹 Referral & assignment
    this.referred_by = data.referred_by || null;
    this.assigned_room = data.assigned_room || null;

    // 🔹 Address details
    this.address_line = data.address_line || null;
    this.country = data.country || null;
    this.state = data.state || null;
    this.district = data.district || null;
    this.city = data.city || null;
    this.pin_code = data.pin_code || null;

    // 🔹 Permanent Address fields
    this.permanent_address_line_1 = data.permanent_address_line_1 || null;
    this.permanent_city_town_village = data.permanent_city_town_village || null;
    this.permanent_district = data.permanent_district || null;
    this.permanent_state = data.permanent_state || null;
    this.permanent_pin_code = data.permanent_pin_code || null;
    this.permanent_country = data.permanent_country || null;

    // 🔹 Present Address fields
    this.present_address_line_1 = data.present_address_line_1 || null;
    this.present_address_line_2 = data.present_address_line_2 || null;
    this.present_city_town_village = data.present_city_town_village || null;
    this.present_city_town_village_2 = data.present_city_town_village_2 || null;
    this.present_district = data.present_district || null;
    this.present_district_2 = data.present_district_2 || null;
    this.present_state = data.present_state || null;
    this.present_state_2 = data.present_state_2 || null;
    this.present_pin_code = data.present_pin_code || null;
    this.present_pin_code_2 = data.present_pin_code_2 || null;
    this.present_country = data.present_country || null;
    this.present_country_2 = data.present_country_2 || null;

    // 🔹 Local Address field
    this.local_address = data.local_address || null;

    // 🔹 Optional system / metadata fields
    this.has_adl_file = data.has_adl_file || false;
    this.file_status = data.file_status || null;
    this.case_complexity = data.case_complexity || null;
    this.filled_by = data.filled_by || null;
    this.filled_by_name = data.filled_by_name || null;
    this.filled_by_role = data.filled_by_role || null;

    // 🔹 Patient files (JSONB array)
    this.patient_files = data.patient_files || (Array.isArray(data.patient_files) ? data.patient_files : []);

    // 🔹 Timestamps
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;

    // 🔹 Joined / derived fields (query results)
    this.patient_name = data.patient_name || this.name || null;
    this.assigned_doctor_name = data.assigned_doctor_name || null;
    this.assigned_doctor_role = data.assigned_doctor_role || null;
    this.last_assigned_date = data.last_assigned_date || null;
    this.assigned_doctor_id = data.assigned_doctor_id || null;
  }

  // Utilities for unique numbers
  static generateCRNo() {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `CR${year}${timestamp}`;
  }

  static generatePSYNo() {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `PSY${year}${timestamp}`;
  }

  static generateADLNo() {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `ADL${year}${random}`;
  }

  // Create new patient record
  static async create(patientData) {
    try {
      const {
        // Registration & Quick Entry
        cr_no,
        date,
        name,
        contact_number,
        age,
        sex,
        category,
        father_name,
        department,
        unit_consit,
        room_no,
        serial_no,
        file_no,
        unit_days,
      
        // Examination Details
        seen_in_walk_in_on,
        worked_up_on,
        psy_no,
        special_clinic_no,
        age_group,
      
        // Personal Information
        marital_status,
        year_of_marriage,
        no_of_children_male,
        no_of_children_female,
      
        // Occupation & Education
        occupation,
        education,
        locality,
        patient_income,
        family_income,
        religion,
        family_type,
      
        // Head of Family
        head_name,
        head_age,
        head_relationship,
        head_education,
        head_occupation,
        head_income,
      
        // Distance & Mobility
        distance_from_hospital,
        mobility,
      
        // Referred By
        referred_by,
      
        // Address Details
        address_line,
        country,
        state,
        district,
        city,
        pin_code,
        
        // Permanent Address fields
        permanent_address_line_1,
        permanent_city_town_village,
        permanent_district,
        permanent_state,
        permanent_pin_code,
        permanent_country,
        
        // Present Address fields
        present_address_line_1,
        present_address_line_2,
        present_city_town_village,
        present_city_town_village_2,
        present_district,
        present_district_2,
        present_state,
        present_state_2,
        present_pin_code,
        present_pin_code_2,
        present_country,
        present_country_2,
        
        // Local Address field
        local_address,
      
        // Additional Fields
        assigned_doctor_name,
        assigned_doctor_id,
        assigned_room,
        filled_by,
        has_adl_file,
        file_status
      } = patientData;

      // Generate CR and PSY numbers if not provided
      const final_cr_no = cr_no || Patient.generateCRNo();
      const final_psy_no = psy_no || Patient.generatePSYNo();

      // Build dynamic INSERT query with all provided fields
      const fields = [];
      const values = [];
      const placeholders = [];
      let paramCount = 0;

      // Validate required fields
      if (!name || name.trim() === '') {
        throw new Error('Patient name is required');
      }

      // Required fields (always included)
      fields.push('cr_no');
      placeholders.push(`$${++paramCount}`);
      values.push(final_cr_no);

      fields.push('psy_no');
      placeholders.push(`$${++paramCount}`);
      values.push(final_psy_no);

      fields.push('name');
      placeholders.push(`$${++paramCount}`);
      values.push(name.trim());

      // Sex and age are optional in the database schema, but we'll include them if provided
      if (sex !== undefined && sex !== null && sex !== '') {
        fields.push('sex');
        placeholders.push(`$${++paramCount}`);
        values.push(sex);
      }

      if (age !== undefined && age !== null && age !== '') {
        fields.push('age');
        placeholders.push(`$${++paramCount}`);
        values.push(age);
      }

      // Handle field mappings and fallbacks

      

      // Optional fields - only include if they have values
      // NOTE: name, sex, and age are already added as required fields above, so exclude them here
      const optionalFields = {
        date,
        contact_number,
        category,
        father_name,
        department,
        unit_consit,
        room_no,
        serial_no,
        file_no,
        unit_days,
        seen_in_walk_in_on,
        worked_up_on,
        special_clinic_no,
        age_group,
        marital_status,
        year_of_marriage,
        no_of_children_male,
        no_of_children_female,
        occupation,
        education,
        locality,
        patient_income,
        family_income,
        religion,
        family_type,
        head_name,
        head_age,
        head_relationship,
        head_education,
        head_occupation,
        head_income,
        distance_from_hospital,
        mobility,
        referred_by,
        address_line,
        country,
        state,
        district,
        city,
        pin_code,
        // Permanent Address fields
        permanent_address_line_1,
        permanent_city_town_village,
        permanent_district,
        permanent_state,
        permanent_pin_code,
        permanent_country,
        // Present Address fields
        present_address_line_1,
        present_address_line_2,
        present_city_town_village,
        present_city_town_village_2,
        present_district,
        present_district_2,
        present_state,
        present_state_2,
        present_pin_code,
        present_pin_code_2,
        present_country,
        present_country_2,
        // Local Address field
        local_address,
        assigned_doctor_name,
        assigned_doctor_id,
        assigned_room,
        filled_by,
        has_adl_file,
        file_status
      };

      // Add optional fields that have values
      for (const [fieldName, fieldValue] of Object.entries(optionalFields)) {
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
          fields.push(fieldName);
          placeholders.push(`$${++paramCount}`);
          values.push(fieldValue);
        }
      }

      // If assigned_doctor_id is provided but assigned_doctor_name is not, fetch it
      if (assigned_doctor_id && !assigned_doctor_name) {
        try {
          const doctorResult = await db.query(
            'SELECT name, role FROM users WHERE id = $1',
            [assigned_doctor_id]
          );
          if (doctorResult.rows.length > 0) {
            const doctorName = doctorResult.rows[0].name;
            const doctorRole = doctorResult.rows[0].role;
            // Only add if not already in fields
            if (!fields.includes('assigned_doctor_name')) {
              fields.push('assigned_doctor_name');
              placeholders.push(`$${++paramCount}`);
              values.push(doctorName);
            }
            // Note: assigned_doctor_role is not stored in registered_patient table,
            // it's fetched dynamically in queries, so we don't need to store it here
            console.log(`[Patient.create] Fetched doctor: ${doctorName} (${doctorRole}) for assigned_doctor_id: ${assigned_doctor_id}`);
          } else {
            console.warn(`[Patient.create] Doctor with ID ${assigned_doctor_id} not found in users table`);
          }
        } catch (err) {
          console.warn('[Patient.create] Could not fetch doctor name:', err.message);
        }
      }

      // Add created_at timestamp (use DEFAULT in SQL, don't add to values array)
      fields.push('created_at');
      placeholders.push('CURRENT_TIMESTAMP');

      // Build and execute INSERT query
      const query = `
        INSERT INTO registered_patient (${fields.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
      `;

      console.log(`[Patient.create] Inserting patient with ${fields.length} fields`);
      console.log(`[Patient.create] Fields:`, fields.slice(0, 10), '...');
      console.log(`[Patient.create] Placeholders: ${placeholders.length}, Values: ${values.length}`);

      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Failed to create patient: No row returned');
      }

      return new Patient(result.rows[0]);
    } catch (error) {
      console.error('[Patient.create] Error creating patient:', error);
      console.error('[Patient.create] Error details:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        constraint: error.constraint,
        table: error.table,
        column: error.column
      });
      // Re-throw with more context if it's a database error
      if (error.code) {
        const dbError = new Error(`Database error: ${error.message}`);
        dbError.originalError = error;
        dbError.code = error.code;
        throw dbError;
      }
      throw error;
    }
  }



  static async findById(id) {
    try {
      if (!id) {
        console.error(`[Patient.findById] ❌ No ID provided`);
        return null;
      }
  
      // Validate that id is a valid integer
      const patientId = parseInt(id, 10);
      if (isNaN(patientId) || patientId <= 0) {
        console.error(`[Patient.findById] ❌ Invalid integer ID: ${id}`);
        return null;
      }
  
      const query = `
        SELECT 
          p.id, p.cr_no, p.date, p.name, p.age, p.sex, p.category, p.father_name, p.department, p.unit_consit,
          p.room_no, p.serial_no, p.file_no, p.unit_days, p.contact_number, p.seen_in_walk_in_on,
          p.worked_up_on, p.psy_no, p.special_clinic_no, p.age_group, p.marital_status,
          p.year_of_marriage, p.no_of_children_male, p.no_of_children_female, p.occupation,
          p.education, p.locality, p.patient_income, p.family_income, p.religion, p.family_type, p.head_name, p.head_age,
          p.head_relationship, p.head_education, p.head_occupation, p.head_income,
          p.distance_from_hospital, p.mobility, p.referred_by, p.address_line, p.country,
          p.state, p.district, p.city, p.pin_code,
          p.permanent_address_line_1, p.permanent_city_town_village, p.permanent_district,
          p.permanent_state, p.permanent_pin_code, p.permanent_country,
          p.present_address_line_1, p.present_address_line_2, p.present_city_town_village, p.present_city_town_village_2,
          p.present_district, p.present_district_2, p.present_state, p.present_state_2,
          p.present_pin_code, p.present_pin_code_2, p.present_country, p.present_country_2,
          p.local_address,
          p.assigned_room, p.filled_by, p.patient_files,
          p.has_adl_file, p.file_status, p.created_at, p.updated_at,
          -- ✅ Get filled_by user role
          (
            SELECT u.role
            FROM users u
            WHERE u.id = p.filled_by
            LIMIT 1
          ) AS filled_by_role,
          -- ✅ Get filled_by user name
          (
            SELECT u.name
            FROM users u
            WHERE u.id = p.filled_by
            LIMIT 1
          ) AS filled_by_name,
          -- ✅ Store original assigned_doctor_id and assigned_doctor_name before overriding
          p.assigned_doctor_id,
          p.assigned_doctor_name,
          -- ✅ Ensure ADL and complexity flags
          CASE WHEN af.id IS NOT NULL THEN true ELSE COALESCE(p.has_adl_file, false) END AS has_adl_file,
          CASE WHEN af.id IS NOT NULL THEN 'complex' ELSE 'simple' END AS case_complexity,
          -- ✅ Assigned Doctor ID: use p.assigned_doctor_id directly (it's already in the table)
          -- Only fallback to patient_visits if it's NULL
          COALESCE(
            p.assigned_doctor_id,
            (
              SELECT pv.assigned_doctor_id
              FROM patient_visits pv
              WHERE pv.patient_id = p.id
              ORDER BY pv.visit_date DESC
              LIMIT 1
            )
          ) AS assigned_doctor_id,
          -- ✅ Doctor name: use p.assigned_doctor_name directly (if not empty or "Unknown Doctor"), or fetch from users table
          COALESCE(
            NULLIF(NULLIF(p.assigned_doctor_name, ''), 'Unknown Doctor'),
            (
              SELECT u.name
              FROM users u
              WHERE u.id = COALESCE(
                p.assigned_doctor_id,
                (
                  SELECT pv.assigned_doctor_id
                  FROM patient_visits pv
                  WHERE pv.patient_id = p.id
                  ORDER BY pv.visit_date DESC
                  LIMIT 1
                )
              )
              LIMIT 1
            )
          ) AS assigned_doctor_name,
          -- ✅ Doctor role: fetch from users table using assigned_doctor_id
          (
            SELECT u.role
            FROM users u
            WHERE u.id = COALESCE(
              p.assigned_doctor_id,
              (
                SELECT pv.assigned_doctor_id
                FROM patient_visits pv
                WHERE pv.patient_id = p.id
                ORDER BY pv.visit_date DESC
                LIMIT 1
              )
            )
            LIMIT 1
          ) AS assigned_doctor_role,
          -- ✅ Last assigned date from patient_visits
          (
            SELECT pv.visit_date
            FROM patient_visits pv
            WHERE pv.patient_id = p.id
            ORDER BY pv.visit_date DESC
            LIMIT 1
          ) AS last_assigned_date
        FROM registered_patient p
        LEFT JOIN adl_files af ON af.patient_id = p.id
        WHERE p.id = $1
        LIMIT 1;
      `;
  
      const result = await db.query(query, [patientId]);
  
      if (result.rows.length === 0) {
        console.warn(`[Patient.findById] ⚠️ No patient found for ID ${patientId}`);
        return null;
      }
  
      const row = result.rows[0];
      
      // Debug: Log the raw row data to see what we're getting
      console.log(`[Patient.findById] 🔍 Raw row data:`, {
        original_assigned_doctor_id: row.original_assigned_doctor_id,
        original_assigned_doctor_name: row.original_assigned_doctor_name,
        assigned_doctor_id: row.assigned_doctor_id,
        assigned_doctor_name: row.assigned_doctor_name,
        assigned_doctor_role: row.assigned_doctor_role,
        last_assigned_date: row.last_assigned_date
      });
      
      const patient = new Patient(row);

      // ✅ Explicitly map joined/derived doctor fields
      // Use the COALESCE result (assigned_doctor_id alias), but fallback to original if needed
      const doctorId = row.assigned_doctor_id || null;
      const doctorName = row.assigned_doctor_name || null;
      const doctorRole = row.assigned_doctor_role || null;
      
      if (doctorId !== undefined && doctorId !== null) {
        patient.assigned_doctor_id = String(doctorId);
      } else {
        patient.assigned_doctor_id = null;
      }
      
      // Filter out "Unknown Doctor" - treat it as null
      patient.assigned_doctor_name = (doctorName && doctorName !== 'Unknown Doctor') ? doctorName : null;
      patient.assigned_doctor_role = doctorRole || null;
      patient.last_assigned_date = row.last_assigned_date || null;

      console.log(
        `[Patient.findById] ✅ Found patient ${row.name} (${row.id}) — Doctor ID: ${patient.assigned_doctor_id}, Name: ${patient.assigned_doctor_name || 'None'}, Role: ${patient.assigned_doctor_role || 'None'}`
      );

      return patient;
    } catch (error) {
      console.error('[Patient.findById] ❌ Error:', error);
      throw error;
    }
  }
  
  
  

  // Find by cr, psy, adl
  static async findByCRNo(cr_no) {
    try {
      const result = await db.query('SELECT * FROM registered_patient WHERE cr_no = $1', [cr_no]);
      if (result.rows.length === 0) return null;
      return new Patient(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findByPSYNo(psy_no) {
    try {
      const result = await db.query('SELECT * FROM registered_patient WHERE psy_no = $1', [psy_no]);
      if (result.rows.length === 0) return null;
      return new Patient(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findByADLNo(adl_no) {
    try {
      const result = await db.query('SELECT * FROM registered_patient WHERE adl_no = $1', [adl_no]);
      if (result.rows.length === 0) return null;
      return new Patient(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Search (name / cr / psy / adl) with pagination
  static async search(searchTerm = '', page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const searchPattern = `%${searchTerm}%`;

      const query = `
        SELECT
          p.*,
          CASE WHEN af.id IS NOT NULL THEN true ELSE COALESCE(p.has_adl_file, false) END as has_adl_file,
          CASE 
            WHEN af.id IS NOT NULL THEN 'complex'
            WHEN p.case_complexity IS NOT NULL THEN p.case_complexity
            ELSE 'simple'
          END as case_complexity
        FROM registered_patient p
        LEFT JOIN adl_files af ON af.patient_id = p.id
        WHERE p.name ILIKE $1 OR p.cr_no ILIKE $1 OR p.psy_no ILIKE $1 OR p.adl_no ILIKE $1
        GROUP BY p.id, af.id
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const countQuery = `
        SELECT COUNT(DISTINCT p.id) as cnt FROM registered_patient p
        LEFT JOIN adl_files af ON af.patient_id = p.id
        WHERE p.name ILIKE $1 OR p.cr_no ILIKE $1 OR p.psy_no ILIKE $1 OR p.adl_no ILIKE $1
      `;

      const [result, countResult] = await Promise.all([
        db.query(query, [searchPattern, limit, offset]),
        db.query(countQuery, [searchPattern])
      ]);

      const total = parseInt(countResult.rows[0].cnt, 10);
      const patientIds = result.rows.map(row => row.id);

      // Fetch latest visit and doctor info separately
      let visitMap = new Map();
      let doctorMap = new Map();
      
      if (patientIds.length > 0) {
        try {
          // Get latest visit per patient using PostgreSQL
          const visitsQuery = `
            SELECT DISTINCT ON (patient_id) 
              patient_id, visit_date, assigned_doctor_id
            FROM patient_visits
            WHERE patient_id = ANY($1)
            ORDER BY patient_id, visit_date DESC
          `;
          const visitsResult = await db.query(visitsQuery, [patientIds]);
          const visits = visitsResult.rows || [];

          if (visits.length > 0) {
            // Get unique doctor IDs
            const doctorIds = [...new Set(visits.map(v => v.assigned_doctor_id).filter(id => id))];
            
            // Fetch doctor info
            if (doctorIds.length > 0) {
              const doctorsQuery = `
                SELECT id, name, role
                FROM users
                WHERE id = ANY($1)
              `;
              const doctorsResult = await db.query(doctorsQuery, [doctorIds]);
              const doctors = doctorsResult.rows || [];

              doctors.forEach(d => {
                doctorMap.set(d.id, { name: d.name, role: d.role });
              });
            }

            // Create visit map (latest visit per patient)
            visits.forEach(v => {
              if (!visitMap.has(v.patient_id)) {
                visitMap.set(v.patient_id, {
                  assigned_doctor_id: v.assigned_doctor_id,
                  visit_date: v.visit_date
                });
              }
            });
          }
        } catch (dbError) {
          console.warn('[Patient.search] Error fetching visit/doctor info:', dbError.message);
        }
      }

      const patients = result.rows.map(row => {
        const patient = new Patient(row);
        const visitInfo = visitMap.get(row.id);
        const doctorInfo = visitInfo?.assigned_doctor_id ? doctorMap.get(visitInfo.assigned_doctor_id) : null;
        
        return {
          ...patient.toJSON(),
          assigned_doctor_id: visitInfo?.assigned_doctor_id || null,
          assigned_doctor_name: doctorInfo?.name || null,
          assigned_doctor_role: doctorInfo?.role || null,
          last_assigned_date: visitInfo?.visit_date || null
        };
      });

      return {
        patients,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('[Patient.search] Error:', error);
      throw error;
    }
  }

  // Get all with filters
  static async findAll(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const where = [];
      const params = [];
      let idx = 1;

      if (filters.sex) {
        where.push(`p.sex = $${idx++}`);
        params.push(filters.sex);
      }
      if (filters.case_complexity) {
        if (filters.case_complexity === 'complex') {
          where.push(`(p.case_complexity = 'complex' OR af.id IS NOT NULL)`);
        } else {
          where.push(`p.case_complexity = $${idx++}`);
          params.push(filters.case_complexity);
        }
      }
      if (filters.has_adl_file !== undefined) {
        if (filters.has_adl_file) {
          where.push(`(p.has_adl_file = true OR af.id IS NOT NULL)`);
        } else {
          where.push(`(p.has_adl_file = false AND af.id IS NULL)`);
        }
      }
      if (filters.file_status) {
        where.push(`p.file_status = $${idx++}`);
        params.push(filters.file_status);
      }
      if (filters.assigned_room) {
        where.push(`p.assigned_room = $${idx++}`);
        params.push(filters.assigned_room);
      }

      const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const query = `
        SELECT 
          p.*,
          CASE WHEN af.id IS NOT NULL THEN true ELSE COALESCE(p.has_adl_file, false) END as has_adl_file,
          CASE 
            WHEN af.id IS NOT NULL THEN 'complex'
            WHEN p.case_complexity IS NOT NULL THEN p.case_complexity
            ELSE 'simple'
          END as case_complexity,
          -- Fetch assigned doctor ID: use p.assigned_doctor_id, fallback to latest visit
          COALESCE(
            p.assigned_doctor_id,
            (
              SELECT pv.assigned_doctor_id
              FROM patient_visits pv
              WHERE pv.patient_id = p.id
              ORDER BY pv.visit_date DESC
              LIMIT 1
            )
          ) AS assigned_doctor_id,
          -- Fetch assigned doctor name: use p.assigned_doctor_name (if not empty or "Unknown Doctor"), fallback to users table, then to visits
          COALESCE(
            NULLIF(NULLIF(p.assigned_doctor_name, ''), 'Unknown Doctor'),
            (
              SELECT u.name
              FROM users u
              WHERE u.id = COALESCE(
                p.assigned_doctor_id,
                (
                  SELECT pv.assigned_doctor_id
                  FROM patient_visits pv
                  WHERE pv.patient_id = p.id
                  ORDER BY pv.visit_date DESC
                  LIMIT 1
                )
              )
              LIMIT 1
            )
          ) AS assigned_doctor_name,
          -- Fetch assigned doctor role: from users table using assigned_doctor_id
          (
            SELECT u.role
            FROM users u
            WHERE u.id = COALESCE(
              p.assigned_doctor_id,
              (
                SELECT pv.assigned_doctor_id
                FROM patient_visits pv
                WHERE pv.patient_id = p.id
                ORDER BY pv.visit_date DESC
                LIMIT 1
              )
            )
            LIMIT 1
          ) AS assigned_doctor_role,
          -- Fetch filled_by name and role
          (SELECT u.name FROM users u WHERE u.id = p.filled_by LIMIT 1) AS filled_by_name,
          (SELECT u.role FROM users u WHERE u.id = p.filled_by LIMIT 1) AS filled_by_role
        FROM registered_patient p
        LEFT JOIN adl_files af ON af.patient_id = p.id
        ${whereClause}
        GROUP BY p.id, af.id
        ORDER BY p.created_at DESC
        LIMIT $${idx++} OFFSET $${idx++}
      `;
      params.push(limit, offset);

      const countParams = params.slice(0, params.length - 2);
      const countQuery = `
        SELECT COUNT(DISTINCT p.id) as cnt FROM registered_patient p
        LEFT JOIN adl_files af ON af.patient_id = p.id
        ${whereClause}
      `;

      const [patientsResult, countResult] = await Promise.all([
        db.query(query, params),
        db.query(countQuery, countParams)
      ]);

      const patients = patientsResult.rows.map(r => {
        const patient = new Patient(r);
        // Ensure assigned_doctor_name and assigned_doctor_role are properly set from query results
        // Filter out "Unknown Doctor" - treat it as null
        const doctorName = r.assigned_doctor_name && r.assigned_doctor_name !== 'Unknown Doctor' 
          ? r.assigned_doctor_name 
          : null;
        patient.assigned_doctor_name = doctorName;
        patient.assigned_doctor_role = r.assigned_doctor_role || null;
        if (r.filled_by_name) patient.filled_by_name = r.filled_by_name;
        if (r.filled_by_role) patient.filled_by_role = r.filled_by_role;
        // Also update assigned_doctor_id from the query result (which may have been resolved from visits)
        if (r.assigned_doctor_id) patient.assigned_doctor_id = r.assigned_doctor_id;
        return patient.toJSON();
      });
      const total = parseInt(countResult.rows[0].cnt, 10);

      return {
        patients,
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

  // Update patient
  async update(updateData = {}) {
    try {
      const allowedFields = [
        'name', 'sex', 'age', 'date', 'contact_number', 'category', 'father_name',
        'department', 'unit_consit', 'room_no', 'serial_no', 'file_no', 'unit_days',
        'seen_in_walk_in_on', 'worked_up_on', 'age_group',
        'marital_status', 'year_of_marriage', 'no_of_children_male', 'no_of_children_female',
        'occupation', 'education', 'locality','patient_income', 'family_income', 
        'religion', 'family_type',
        'head_name', 'head_age', 'head_relationship', 
        'head_education', 'head_occupation', 'head_income',
        'distance_from_hospital', 'mobility', 'referred_by',
        'address_line', 'country', 'state', 'district', 'city', 'pin_code',
        // Permanent Address fields
        'permanent_address_line_1', 'permanent_city_town_village',
        'permanent_district', 'permanent_state', 'permanent_pin_code', 'permanent_country',
        // Present Address fields
        'present_address_line_1', 'present_address_line_2', 'present_city_town_village', 'present_city_town_village_2',
        'present_district', 'present_district_2', 'present_state', 'present_state_2',
        'present_pin_code', 'present_pin_code_2', 'present_country', 'present_country_2',
        // Local Address field
        'local_address',
        'assigned_room', 'assigned_doctor_id', 'assigned_doctor_name', 'file_status', 'has_adl_file', 
        'special_clinic_no', 'psy_no'
      ];

      const updates = [];
      const values = [];
      let idx = 1;

      for (const [k, v] of Object.entries(updateData)) {
        // Only include fields that are in allowedFields
        // Allow null values (they can be used to explicitly clear fields)
        // Skip undefined values (they won't be updated)
        if (allowedFields.includes(k) && v !== undefined) {
          updates.push(`${k} = $${idx++}`);
          values.push(v);
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(this.id);
      const result = await db.query(
        `UPDATE registered_patient SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`,
        values
      );

      if (result.rows.length) {
        Object.assign(this, result.rows[0]);
      }

      return this;
    } catch (error) {
      throw error;
    }
  }

  // Create ADL file
  async createADLFile(clinicalProformaId, createdBy) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      if (this.has_adl_file) {
        throw new Error('Patient already has an ADL file');
      }

      const adl_no = Patient.generateADLNo();

      await client.query(
        `UPDATE registered_patient SET adl_no = $1, has_adl_file = true, file_status = $2, case_complexity = $3 WHERE id = $4`,
        [adl_no, 'created', 'complex', this.id]
      );

      this.adl_no = adl_no;
      this.has_adl_file = true;
      this.file_status = 'created';
      this.case_complexity = 'complex';

      const adlResult = await client.query(
        `INSERT INTO adl_files (patient_id, adl_no, created_by, clinical_proforma_id, file_status, file_created_date, total_visits)
         VALUES ($1,$2,$3,$4,$5,CURRENT_DATE,1) RETURNING *`,
        [this.id, adl_no, createdBy, clinicalProformaId, 'created']
      );


      await client.query('COMMIT');
      return adlResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get visit history
  async getVisitHistory() {
    try {
      const result = await db.query(
        `SELECT pv.*, u.name as doctor_name, u.role as doctor_role
         FROM patient_visits pv
         LEFT JOIN users u ON pv.assigned_doctor_id = u.id
         WHERE pv.patient_id = $1
         ORDER BY pv.visit_date DESC`,
        [this.id]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get clinical records
  async getClinicalRecords() {
    try {
      const result = await db.query(
        `SELECT cp.*, u.name as doctor_name, u.role as doctor_role
         FROM clinical_proforma cp
         LEFT JOIN users u ON cp.filled_by = u.id
         WHERE cp.patient_id = $1
         ORDER BY cp.visit_date DESC`,
        [this.id]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get ADL files
  async getADLFiles() {
    try {
      const result = await db.query(
        `SELECT af.*, u.name as created_by_name, u.role as created_by_role
         FROM adl_files af
         LEFT JOIN users u ON af.created_by = u.id
         WHERE af.patient_id = $1
         ORDER BY af.file_created_date DESC`,
        [this.id]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Delete patient and all related records
  async delete() {
    const client = await db.getClient();
    try {
      console.log(`[Patient.delete] Starting deletion for patient ID: ${this.id}`);
      await client.query('BEGIN');
      
      // Step 1: Get all clinical_proforma IDs
      const clinicalProformasResult = await client.query(
        'SELECT id FROM clinical_proforma WHERE patient_id = $1',
        [this.id]
      );
      
      const clinicalProformaIds = clinicalProformasResult.rows.map(cp => cp.id);
      console.log(`[Patient.delete] Found ${clinicalProformaIds.length} clinical proforma(s)`);
      
      // Step 2: Delete prescriptions
      if (clinicalProformaIds.length > 0) {
        await client.query(
          'DELETE FROM prescriptions WHERE clinical_proforma_id = ANY($1)',
          [clinicalProformaIds]
        );
        console.log(`[Patient.delete] Deleted prescriptions`);
      }
      
      // Step 3: Delete ADL files
      await client.query(
        'DELETE FROM adl_files WHERE patient_id = $1',
        [this.id]
      );
      console.log(`[Patient.delete] Deleted ADL files for patient ${this.id}`);
      
      // Step 5: Delete clinical proformas
      await client.query(
        'DELETE FROM clinical_proforma WHERE patient_id = $1',
        [this.id]
      );
      console.log(`[Patient.delete] Deleted clinical proformas for patient ${this.id}`);
      
      await client.query(
        'DELETE FROM prescriptions WHERE patient_id = $1',
        [this.id]
      );
      console.log(`[Patient.delete] Deleted prescriptions for patient ${this.id}`);
      

      // Step 6: Delete patient visits
      try {
        await client.query(
          'DELETE FROM patient_visits WHERE patient_id = $1',
          [this.id]
        );
        console.log(`[Patient.delete] Deleted patient visits for patient ${this.id}`);
      } catch (visitsErr) {
        console.warn(`[Patient.delete] Error deleting patient visits: ${visitsErr.message}`);
      }
      
      // Step 7: Finally, delete the patient record itself
      await client.query(
        'DELETE FROM registered_patient WHERE id = $1',
        [this.id]
      );
      
      await client.query('COMMIT');
      console.log(`[Patient.delete] Successfully deleted patient ID: ${this.id}`);
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`[Patient.delete] Error deleting patient ID ${this.id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Statistics
  static async getStats() {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as total_patients,
          COUNT(CASE WHEN sex = 'M' THEN 1 END) as male_patients,
          COUNT(CASE WHEN sex = 'F' THEN 1 END) as female_patients,
          COUNT(CASE WHEN sex NOT IN ('M','F') THEN 1 END) as other_patients,
          COUNT(CASE WHEN has_adl_file = true THEN 1 END) as patients_with_adl,
          COUNT(CASE WHEN case_complexity = 'complex' THEN 1 END) as complex_cases,
          COUNT(CASE WHEN case_complexity = 'simple' THEN 1 END) as simple_cases
        FROM registered_patient
      `);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get age distribution
  static async getAgeDistribution() {
    try {
      const result = await db.query(`
        SELECT 
          CASE 
            WHEN age < 18 THEN 'Under 18'
            WHEN age BETWEEN 18 AND 25 THEN '18-25'
            WHEN age BETWEEN 26 AND 35 THEN '26-35'
            WHEN age BETWEEN 36 AND 45 THEN '36-45'
            WHEN age BETWEEN 46 AND 55 THEN '46-55'
            WHEN age BETWEEN 56 AND 65 THEN '56-65'
            WHEN age > 65 THEN '65+'
            ELSE 'Unknown'
          END as age_group,
          COUNT(*) as count
        FROM registered_patient
        WHERE age IS NOT NULL
        GROUP BY age_group
        ORDER BY 
          CASE age_group
            WHEN 'Under 18' THEN 1
            WHEN '18-25' THEN 2
            WHEN '26-35' THEN 3
            WHEN '36-45' THEN 4
            WHEN '46-55' THEN 5
            WHEN '56-65' THEN 6
            WHEN '65+' THEN 7
            ELSE 8
          END
      `);
      return result.rows;
    } catch (error) {
      console.error('[Patient.getAgeDistribution] Error:', error);
      throw error;
    }
  }

  // toJSON: return all fields for comprehensive export
  toJSON() {
    return {
    
      id : this.id ,
      cr_no : this.cr_no ,
      psy_no : this.psy_no ,
      adl_no : this.adl_no ,
      special_clinic_no : this.special_clinic_no ,
  
      // 🔹 Registration & Quick Entry details
      date : this.date ,
      name : this.name ,
      age : this.age ,
      sex : this.sex ,
      category : this.category ,
      father_name : this.father_name ,
      department : this.department ,
      unit_consit : this.unit_consit ,
      room_no : this.room_no ,
      serial_no : this.serial_no ,
      file_no : this.file_no ,
      unit_days : this.unit_days ,
      contact_number : this.contact_number || this.contact_number ,
  
      // 🔹 Examination & clinic details
      seen_in_walk_in_on : this.seen_in_walk_in_on ,
      worked_up_on : this.worked_up_on ,
      age_group : this.age_group ,
  
      // 🔹 Personal information
      marital_status : this.marital_status ,
      year_of_marriage : this.year_of_marriage ,
      no_of_children_male : this.no_of_children_male ,
      no_of_children_female : this.no_of_children_female ,
  
      // 🔹 Occupation & education
      occupation : this.occupation ,
      education : this.education ,
      locality : this.locality ,
      patient_income : this.patient_income ,
      family_income : this.family_income ,
      religion : this.religion ,
      family_type : this.family_type ,
  
      // 🔹 Head of family
      head_name : this.head_name || this.father_name ,
      head_age : this.head_age ,
      head_relationship : this.head_relationship ,
      head_education : this.head_education ,
      head_occupation : this.head_occupation ,
      head_income : this.head_income ,
  
      // 🔹 Distance & mobility
      distance_from_hospital : this.distance_from_hospital ,
      mobility : this.mobility ,
  
      // 🔹 Referral & assignment
      referred_by : this.referred_by ,
      assigned_room : this.assigned_room ,
  
      // 🔹 Address details
      address_line : this.address_line ,
      country : this.country ,
      state : this.state ,
      district : this.district ,
      city : this.city ,
      pin_code : this.pin_code ,
  
      // 🔹 Permanent Address fields
      permanent_address_line_1 : this.permanent_address_line_1 ,
      permanent_city_town_village : this.permanent_city_town_village ,
      permanent_district : this.permanent_district ,
      permanent_state : this.permanent_state ,
      permanent_pin_code : this.permanent_pin_code ,
      permanent_country : this.permanent_country ,
  
      // 🔹 Present Address fields
      present_address_line_1 : this.present_address_line_1 ,
      present_address_line_2 : this.present_address_line_2 ,
      present_city_town_village : this.present_city_town_village ,
      present_city_town_village_2 : this.present_city_town_village_2 ,
      present_district : this.present_district ,
      present_district_2 : this.present_district_2 ,
      present_state : this.present_state ,
      present_state_2 : this.present_state_2 ,
      present_pin_code : this.present_pin_code ,
      present_pin_code_2 : this.present_pin_code_2 ,
      present_country : this.present_country ,
      present_country_2 : this.present_country_2 ,
  
      // 🔹 Local Address field
      local_address : this.local_address ,
  
      // 🔹 Optional system / metathis fields
      has_adl_file : this.has_adl_file ,
      file_status : this.file_status ,
      // case_complexity : this.case_complexity ,
      filled_by : this.filled_by ,
      filled_by_name : this.filled_by_name ,
      filled_by_role : this.filled_by_role ,
  
      // 🔹 Timestamps
      created_at : this.created_at ,
      updated_at : this.updated_at ,
  
      // 🔹 Patient files
      patient_files : this.patient_files || [],
  
      // 🔹 Joined / derived fields (query results)
      assigned_doctor_name : this.assigned_doctor_name ,
      assigned_doctor_role : this.assigned_doctor_role ,
      last_assigned_date : this.last_assigned_date ,
      assigned_doctor_id : this.assigned_doctor_id ,

    };
  }

  // Update patient files
  static async updateFiles(patientId, files) {
    try {
      const result = await db.query(
        'UPDATE registered_patient SET patient_files = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [JSON.stringify(files), patientId]
      );
      if (result.rows.length === 0) {
        throw new Error('Patient not found');
      }
      return new Patient(result.rows[0]);
    } catch (error) {
      console.error('[Patient.updateFiles] Error:', error);
      throw error;
    }
  }
}

module.exports = Patient;
