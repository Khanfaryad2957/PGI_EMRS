const Patient = require('../models/Patient');
const PatientFile = require('../models/PatientFile');
const PatientVisit = require('../models/PatientVisit');
const ClinicalProforma = require('../models/ClinicalProforma');
const ADLFile = require('../models/ADLFile');
const path = require('path');
const fs = require('fs');
const uploadConfig = require('../config/uploadConfig');

class PatientController {

  static async getPatientStats(req, res) {
    try {
      const stats = await Patient.getStats();

      res.json({
        success: true,
        data: {
          stats
        }
      });
    } catch (error) {
      console.error('Get patient stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  static async getAgeDistribution(req, res) {
    try {
      const distribution = await Patient.getAgeDistribution();

      res.json({
        success: true,
        data: {
          distribution
        }
      });
    } catch (error) {
      console.error('Get age distribution error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get age distribution',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  static async createPatient(req, res) {
    try {
      const { name, sex, age, assigned_room, cr_no, psy_no, patient_id } = req.body;

      // If patient_id is provided, this is a visit for an existing patient
      if (patient_id) {
        const existingPatient = await Patient.findById(patient_id);
        if (!existingPatient) {
          return res.status(404).json({
            success: false,
            message: 'Patient not found'
          });
        }

        // Create a visit record for the existing patient
        // patient_id is now an integer
        const patientIdInt = parseInt(patient_id, 10);
        if (isNaN(patientIdInt)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid patient ID format'
          });
        }
        
        // assigned_doctor_id is an integer
        const assignedDoctorId = existingPatient.assigned_doctor_id 
          ? parseInt(existingPatient.assigned_doctor_id, 10)
          : null;
        
        // Get visit count to determine visit type
        const visitCount = await PatientVisit.getVisitCount(patientIdInt);
        const visitType = visitCount === 0 ? 'first_visit' : 'follow_up';
        
        const visit = await PatientVisit.assignPatient({
          patient_id: patientIdInt, // patient_id is now integer
          assigned_doctor_id: assignedDoctorId,
          room_no: existingPatient.assigned_room || assigned_room || null,
          visit_date: new Date().toISOString().slice(0, 10),
          visit_type: visitType, // Determined by visit count
          notes: `Visit created via Existing Patient flow - Visit #${visitCount + 1}`
        });

        return res.status(201).json({
          success: true,
          message: 'Visit record created successfully',
          data: {
            patient: existingPatient.toJSON(),
            visit: visit,
            visit_count: visitCount + 1, // Include in response
            visit_type: visitType
          }
        });
      }

      // Create new patient
      const patient = await Patient.create({
        name,
        sex,
        age,
        assigned_room,
        cr_no,
        psy_no
      });

      res.status(201).json({
        success: true,
        message: 'Patient registered successfully',
        data: {
          patient: patient.toJSON()
        }
      });
    } catch (error) {
      console.error('Patient creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register patient',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get visit count for a patient
  static async getPatientVisitCount(req, res) {
    try {
      const { id } = req.params;
      const patientIdInt = parseInt(id, 10);
      
      if (isNaN(patientIdInt)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid patient ID format'
        });
      }

      const visitCount = await PatientVisit.getVisitCount(patientIdInt);
      const visits = await PatientVisit.getPatientVisits(patientIdInt);

      res.status(200).json({
        success: true,
        data: {
          visit_count: visitCount,
          visits: visits,
          next_visit_number: visitCount + 1
        }
      });
    } catch (error) {
      console.error('[getPatientVisitCount] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get visit count',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  // Comprehensive patient registration (includes all patient information for MWO)
  static async registerPatientWithDetails(req, res) {
    try {
      console.log('[patientController.registerPatientWithDetails] Received request body with keys:', Object.keys(req.body).length);
      console.log('[patientController.registerPatientWithDetails] Sample fields:', {
        name: req.body.name,
        sex: req.body.sex,
        age: req.body.age,
        mobile_no: req.body.mobile_no,
        father_name: req.body.father_name,
        education: req.body.education,
        patient_income: req.body.patient_income,
        family_income: req.body.family_income,
        distance_from_hospital: req.body.distance_from_hospital
      });

      // Create patient record with all information
      // Map frontend field names to database field names
      const patientData = {
        ...req.body,
        // Map mobile_no to contact_number if provided
        contact_number: req.body.contact_number || req.body.mobile_no,
        filled_by: req.user.id
      };
      
      // Remove mobile_no if it exists (to avoid duplicate)
      if (patientData.mobile_no && patientData.contact_number) {
        delete patientData.mobile_no;
      }
      
      const patient = await Patient.create(patientData);

      // Fetch related data to populate joined fields in response
      let assignedDoctorName = null;
      let assignedDoctorRole = null;
      let filledByName = null;

      // Fetch assigned doctor info if assigned_doctor_id exists
      if (patient.assigned_doctor_id) {
        try {
          const db = require('../config/database');
          const doctorResult = await db.query(
            'SELECT name, role FROM users WHERE id = $1',
            [patient.assigned_doctor_id]
          );
          if (doctorResult.rows.length > 0) {
            assignedDoctorName = doctorResult.rows[0].name;
            assignedDoctorRole = doctorResult.rows[0].role;
          }
        } catch (err) {
          console.error('[patientController] Error fetching assigned doctor:', err);
        }
      }

      // Fetch filled_by user info (MWO who registered the patient)
      if (patient.filled_by) {
        try {
          const db = require('../config/database');
          const filledByResult = await db.query(
            'SELECT name FROM users WHERE id = $1',
            [patient.filled_by]
          );
          if (filledByResult.rows.length > 0) {
            filledByName = filledByResult.rows[0].name;
          }
        } catch (err) {
          console.error('[patientController] Error fetching filled_by user:', err);
        }
      }

      // Build response with populated related fields
      const patientResponse = {
        ...patient.toJSON(),
        assigned_doctor_name: assignedDoctorName,
        assigned_doctor_role: assignedDoctorRole,
        filled_by_name: filledByName
      };

      console.log('[patientController.registerPatientWithDetails] Patient created successfully. ID:', patient.id);
  
      res.status(201).json({
        success: true,
        message: 'Patient registered successfully with complete information',
        data: {
          patient: patientResponse
        }
      });
    } catch (error) {
      console.error('Comprehensive patient registration error:', error);
      console.error('Error stack:', error.stack);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        constraint: error.constraint,
        table: error.table,
        column: error.column
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to register patient with details',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? {
          code: error.code,
          detail: error.detail,
          constraint: error.constraint,
          table: error.table,
          column: error.column
        } : undefined
      });
    }
  }

  // Get all patients with pagination and filters
  static async getAllPatients(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {};

      // If id is provided, redirect to getPatientById for better performance
      if (req.query.id) {
        // getPatientById expects id in req.params, so we need to set it
        req.params = req.params || {};
        req.params.id = req.query.id;
        return PatientController.getPatientById(req, res);
      }

      // Check if search parameter is provided
      if (req.query.search && req.query.search.trim().length >= 2) {
        const result = await Patient.search(req.query.search.trim(), page, limit);
        return res.json({
          success: true,
          data: result
        });
      }

      // Apply filters
      if (req.query.sex) filters.sex = req.query.sex;
      // if (req.query.case_complexity) filters.case_complexity = req.query.case_complexity;
      if (req.query.has_adl_file !== undefined) filters.has_adl_file = req.query.has_adl_file === 'true';
      if (req.query.file_status) filters.file_status = req.query.file_status;
      if (req.query.assigned_room) filters.assigned_room = req.query.assigned_room;

      // Limit the maximum page size to prevent timeouts
      const safeLimit = Math.min(limit, 100); // Cap at 100 to prevent performance issues
      const result = await Patient.findAll(page, safeLimit, filters);

      // Enrich with latest assignment info
      try {
        const db = require('../config/database');
        const patientIds = (result.patients || []).map(p => p.id);
        if (patientIds.length > 0) {
          const today = new Date().toISOString().slice(0, 10);
          
          console.log(`[getAllPatients] Fetching visits for ${patientIds.length} patients (sample IDs: ${patientIds.slice(0, 3).join(', ')})`);
          
          // Fetch visits with assigned_doctor info using PostgreSQL
          let visits = [];
          let visitsToday = [];
          let visitsTodayError = false;
          
          try {
            const visitsResult = await db.query(
              `SELECT patient_id, visit_date, assigned_doctor_id
               FROM patient_visits
               WHERE patient_id = ANY($1)
               ORDER BY visit_date DESC`,
              [patientIds]
            );
            
            visits = visitsResult.rows || [];
            
            const visitsTodayResult = await db.query(
              `SELECT patient_id, visit_date, assigned_doctor_id, visit_status
               FROM patient_visits
               WHERE patient_id = ANY($1) AND visit_date = $2
               ORDER BY created_at DESC`,
              [patientIds, today]
            );
            
            visitsToday = visitsTodayResult.rows || [];
          } catch (queryErr) {
            console.error('[getAllPatients] Error in PostgreSQL query:', queryErr);
            visitsTodayError = true;
          }
          
          // Fetch clinical proformas created today
          let proformasToday = [];
          let proformasTodayError = false;
          try {
            const proformasTodayResult = await db.query(
              `SELECT patient_id, created_at
               FROM clinical_proforma
               WHERE patient_id = ANY($1) 
                 AND DATE(created_at) = $2
               ORDER BY created_at DESC`,
              [patientIds, today]
            );
            
            proformasToday = proformasTodayResult.rows || [];
          } catch (queryErr) {
            console.error('[getAllPatients] Error fetching proformas today:', queryErr);
            proformasTodayError = true;
          }
          
          console.log(`[getAllPatients] Found ${visits?.length || 0} visits, ${visitsToday?.length || 0} visits today, ${proformasToday?.length || 0} proformas today`);

          // Build set of patients with proformas today
          const patientsWithProformaToday = new Set();
          if (!proformasTodayError && Array.isArray(proformasToday)) {
            proformasToday.forEach(p => patientsWithProformaToday.add(String(p.patient_id)));
          }

          if (Array.isArray(visits) && visits.length > 0) {
            // Get unique assigned_doctor IDs
            const assignedDoctorIds = [...new Set(
              visits
                .map(v => v.assigned_doctor_id)
                .filter(id => id !== null && id !== undefined)
            )];

            // Fetch doctor information
            let doctorsMap = {};
            if (assignedDoctorIds.length > 0) {
              const doctorsResult = await db.query(
                `SELECT id, name, role
                 FROM users
                 WHERE id = ANY($1)`,
                [assignedDoctorIds]
              );

              if (doctorsResult.rows) {
                doctorsMap = doctorsResult.rows.reduce((acc, doc) => {
                  acc[doc.id] = doc;
                  return acc;
                }, {});
              }
            }

            // Group visits by patient_id (get latest)
            // Use integer comparison for IDs
            const latestByPatient = new Map();
            for (const v of visits) {
              const visitPatientId = String(v.patient_id);
              if (!latestByPatient.has(visitPatientId)) {
                latestByPatient.set(visitPatientId, v);
              }
            }
            
            const patientsWithVisitToday = new Set();
            if (!visitsTodayError && Array.isArray(visitsToday)) {
              visitsToday.forEach(v => patientsWithVisitToday.add(String(v.patient_id)));
            }
            
            result.patients = result.patients.map(p => {
              const patientIdStr = String(p.id);
              const latest = latestByPatient.get(patientIdStr);
              const hasVisitToday = patientsWithVisitToday.has(patientIdStr);
              const hasProformaToday = patientsWithProformaToday.has(patientIdStr);
              const visitInfo = hasVisitToday && visitsToday?.find(v => String(v.patient_id) === patientIdStr) 
                ? visitsToday.find(v => String(v.patient_id) === patientIdStr)
                : latest;
              
              // Use doctor from visit if available, otherwise use from patient record
              const doctorId = visitInfo?.assigned_doctor_id || latest?.assigned_doctor_id || p.assigned_doctor_id;
              const doctor = doctorId ? doctorsMap[doctorId] : null;
              
              return {
                ...p,
                assigned_doctor_id: doctorId || p.assigned_doctor_id || null,
                // Use doctor from visits if available, otherwise use from patient record (already fetched in findAll)
                // Filter out "Unknown Doctor" - treat it as null
                assigned_doctor_name: doctor?.name || (p.assigned_doctor_name && p.assigned_doctor_name !== 'Unknown Doctor' ? p.assigned_doctor_name : null) || null,
                assigned_doctor_role: doctor?.role || p.assigned_doctor_role || null,
                last_assigned_date: latest?.visit_date || null,
                visit_date: visitInfo?.visit_date || null,
                visit_status: visitInfo?.visit_status || latest?.visit_status || null,
                has_visit_today: hasVisitToday,
                has_proforma_today: hasProformaToday,
              };
            });
          } else {
            // If no visits found, ensure assigned_doctor fields are null (filter out "Unknown Doctor")
            result.patients = result.patients.map(p => ({
              ...p,
              assigned_doctor_id: p.assigned_doctor_id || null,
              assigned_doctor_name: (p.assigned_doctor_name && p.assigned_doctor_name !== 'Unknown Doctor') ? p.assigned_doctor_name : null,
              assigned_doctor_role: p.assigned_doctor_role || null,
              has_visit_today: false,
              has_proforma_today: patientsWithProformaToday.has(String(p.id)),
            }));
          }
        }
      } catch (err) {
        console.error('[getAllPatients] Error enriching patient data:', err);
        // Ensure fields are set to null if enrichment fails
        if (result.patients) {
          result.patients = result.patients.map(p => ({
            ...p,
            assigned_doctor_id: p.assigned_doctor_id || null,
            assigned_doctor_name: p.assigned_doctor_name || null,
            assigned_doctor_role: p.assigned_doctor_role || null,
          }));
        }
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all patients error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patients',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Search patients
  static async searchPatients(req, res) {
    try {
      const { q } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search term must be at least 2 characters long'
        });
      }

      const result = await Patient.search(q.trim(), page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Search patients error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search patients',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get patient by ID (integer)
  static async getPatientById(req, res) {
    try {
      const { id } = req.params;
      
      // Pass ID to Patient.findById (integer)
      console.log(`[getPatientById] Fetching patient with ID: ${id} (type: ${typeof id})`);
      
      const patient = await Patient.findById(id);
  console.log(">>>>>>>",patient)
      if (!patient) {
        console.log(`[getPatientById] Patient with ID ${id} not found`);
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      // Verify ID matches (integer comparison)
      const requestedId = parseInt(id, 10);
      const returnedId = parseInt(patient.id, 10);
      const idMatches = (typeof returnedId === 'string' && returnedId.includes('-'))
        ? returnedId === requestedId // Integer comparison
        : parseInt(returnedId, 10) === parseInt(requestedId, 10); // Integer comparison

      if (!idMatches) {
        console.error(`[getPatientById] CRITICAL: ID mismatch! Requested: ${requestedId}, Returned: ${returnedId}`);
        return res.status(500).json({
          success: false,
          message: 'Data integrity error: Patient ID mismatch'
        });
      }

      console.log(`[getPatientById] Successfully fetched patient ID: ${patient.id}, Name: ${patient.name}`);

      res.json({
        success: true,
        data: {
          patient: patient.toJSON()
        }
      });
    } catch (error) {
      console.error('[getPatientById] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get patient by CR number
  static async getPatientByCRNo(req, res) {
    try {
      const { cr_no } = req.params;
      const patient = await Patient.findByCRNo(cr_no);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.json({
        success: true,
        data: {
          patient: patient.toJSON()
        }
      });
    } catch (error) {
      console.error('Get patient by CR number error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get patient by PSY number
  static async getPatientByPSYNo(req, res) {
    try {
      const { psy_no } = req.params;
      const patient = await Patient.findByPSYNo(psy_no);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.json({
        success: true,
        data: {
          patient: patient.toJSON()
        }
      });
    } catch (error) {
      console.error('Get patient by PSY number error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get patient by ADL number
  static async getPatientByADLNo(req, res) {
    try {
      const { adl_no } = req.params;
      const patient = await Patient.findByADLNo(adl_no);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.json({
        success: true,
        data: {
          patient: patient.toJSON()
        }
      });
    } catch (error) {
      console.error('Get patient by ADL number error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }




  static async updatePatient(req, res) {
    try {
      const { id } = req.params;
  
      // Find the patient by ID
      const patient = await Patient.findById(id);
  
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }
  
      // Allowed fields for update (matching Patient model's update method and DB schema)
      const allowedFields = [
        'name',
        'sex',
        'age',
        'date',
        'contact_number',
        'category',
        'father_name',
        'department',
        'unit_consit',
        'room_no',
        'serial_no',
        'file_no',
        'unit_days',
        'seen_in_walk_in_on',
        'worked_up_on',
        'special_clinic_no',
        'age_group',
        'marital_status',
        'year_of_marriage',
        'no_of_children_male',
        'no_of_children_female',
        'occupation',
        'education',
        'locality',
        'patient_income',
        'family_income',
        'religion',
        'family_type',
        'head_name',
        'head_age',
        'head_relationship',
        'head_education',
        'head_occupation',
        'head_income',
        'distance_from_hospital',
        'mobility',
        'referred_by',
        'address_line',
        'country',
        'state',
        'district',
        'city',
        'pin_code',
        // Permanent Address fields
        'permanent_address_line_1', 'permanent_city_town_village',
        'permanent_district', 'permanent_state', 'permanent_pin_code', 'permanent_country',
        // Present Address fields
        'present_address_line_1', 'present_address_line_2', 'present_city_town_village', 'present_city_town_village_2',
        'present_district', 'present_district_2', 'present_state', 'present_state_2',
        'present_pin_code', 'present_pin_code_2', 'present_country', 'present_country_2',
        // Local Address field
        'local_address',
        'assigned_room',
        'assigned_doctor_id',
        'assigned_doctor_name',
        'has_adl_file',
        'file_status'
      ];
  
      // Build update data object only with defined fields that have actual values
      // IMPORTANT: Only include fields that are explicitly provided AND have meaningful values
      // This prevents null/empty values from overwriting existing data
      const updateData = {};
      for (const field of allowedFields) {
        // Only process fields that are explicitly provided (not undefined)
        if (req.body[field] !== undefined) {
          const value = req.body[field];
          
          // Skip null values and empty strings - these would overwrite existing data
          // Only include if the value is explicitly meant to clear a field (we'll handle this case-by-case)
          if (value === null || value === '') {
            // For certain fields, allow null to clear them (e.g., assigned_doctor_id can be null)
            // For most fields, skip null/empty to preserve existing values
            if (field === 'assigned_doctor_id' || field === 'assigned_doctor_name' || field === 'assigned_room') {
              // These fields can be explicitly cleared
              updateData[field] = null;
            }
            // For all other fields, skip null/empty values to preserve existing data
            continue;
          }
          
          // Handle assigned_doctor_id - it's integer
          if (field === 'assigned_doctor_id') {
            // Convert to integer
            const doctorIdInt = parseInt(value, 10);
            if (!isNaN(doctorIdInt) && doctorIdInt > 0) {
              updateData[field] = doctorIdInt;
              
              // If assigned_doctor_id is provided but assigned_doctor_name is not, fetch it
              if (!req.body.assigned_doctor_name) {
                try {
                  const db = require('../config/database');
                  const doctorResult = await db.query(
                    'SELECT name FROM users WHERE id = $1',
                    [doctorIdInt]
                  );
                  if (doctorResult.rows.length > 0) {
                    updateData.assigned_doctor_name = doctorResult.rows[0].name;
                  }
                } catch (err) {
                  console.warn('[updatePatient] Could not fetch doctor name:', err.message);
                }
              }
            }
          } else {
            // For all other fields, include the value as-is (it's not null/empty)
            updateData[field] = value;
          }
        }
      }
  
      console.log('[updatePatient] Updating patient with data:', JSON.stringify(updateData, null, 2));
      console.log('[updatePatient] Fields to update:', Object.keys(updateData));
      
      // Verify we have fields to update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update. All provided values were null or empty.',
        });
      }
  
      // Perform the update
      await patient.update(updateData);
  
      // Handle file uploads if any files are present
      console.log('[updatePatient] Checking for files. req.files:', req.files ? (Array.isArray(req.files) ? req.files.length + ' files' : 'object with keys: ' + Object.keys(req.files).join(', ')) : 'no files');
      console.log('[updatePatient] req.body keys:', Object.keys(req.body || {}));
      
      if (req.files && req.files.length > 0) {
        console.log('[updatePatient] Processing', req.files.length, 'file(s) for patient', id);
        try {
          const PatientFileController = require('./patientFileController');
          
          // Parse files_to_remove from request body
          // FormData sends arrays as multiple fields with same name, so check both formats
          let filesToRemove = [];
          if (req.body.files_to_remove) {
            if (Array.isArray(req.body.files_to_remove)) {
              filesToRemove = req.body.files_to_remove;
            } else if (typeof req.body.files_to_remove === 'string') {
              try {
                filesToRemove = JSON.parse(req.body.files_to_remove);
              } catch (e) {
                // If not JSON, treat as single value
                filesToRemove = [req.body.files_to_remove];
              }
            }
          }
          // Also check for files_to_remove[] format (FormData array)
          if (req.body['files_to_remove[]']) {
            if (Array.isArray(req.body['files_to_remove[]'])) {
              filesToRemove = [...filesToRemove, ...req.body['files_to_remove[]']];
            } else {
              filesToRemove.push(req.body['files_to_remove[]']);
            }
          }
          
          console.log('[updatePatient] Files to remove:', filesToRemove);
          console.log('[updatePatient] New files:', req.files.map(f => f.originalname));
          
          // Create a proper request object for updatePatientFiles
          const fileUpdateReq = {
            params: { patient_id: id },
            body: { files_to_remove: filesToRemove },
            files: req.files,
            user: req.user
          };
          
          // Create a proper response object that can handle the response
          let fileUpdateSuccess = false;
          let fileUpdateError = null;
          
          const fileUpdateRes = {
            status: (code) => ({
              json: (data) => {
                if (code >= 400) {
                  console.error('[updatePatient] File update error:', code, data);
                  fileUpdateError = data;
                } else {
                  console.log('[updatePatient] Files updated successfully:', data);
                  fileUpdateSuccess = true;
                }
              }
            })
          };
          
          // Update files using PatientFileController
          await PatientFileController.updatePatientFiles(fileUpdateReq, fileUpdateRes);
          
          if (fileUpdateError) {
            console.error('[updatePatient] File update failed:', fileUpdateError);
            // Don't fail the entire update, but log the error
          }
        } catch (fileError) {
          console.error('[updatePatient] Error updating files:', fileError);
          console.error('[updatePatient] Error stack:', fileError.stack);
          // Don't fail the entire update if file upload fails
          // The patient data update was successful
        }
      } else if (req.body.files_to_remove) {
        // Handle file removal even if no new files are uploaded
        try {
          const PatientFileController = require('./patientFileController');
          const filesToRemove = Array.isArray(req.body.files_to_remove) 
            ? req.body.files_to_remove 
            : JSON.parse(req.body.files_to_remove);
          
          const fileUpdateReq = {
            params: { patient_id: id },
            body: { files_to_remove: filesToRemove },
            files: [],
            user: req.user
          };
          
          const fileUpdateRes = {
            status: (code) => ({
              json: (data) => {
                if (code >= 400) {
                  console.error('[updatePatient] File removal error:', data);
                }
              }
            })
          };
          
          await PatientFileController.updatePatientFiles(fileUpdateReq, fileUpdateRes);
        } catch (fileError) {
          console.error('[updatePatient] Error removing files:', fileError);
        }
      }
  
      // Re-fetch updated patient (findById already includes doctor info from patient_visits)
      const updatedPatient = await Patient.findById(id);
  
      if (!updatedPatient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found after update',
        });
      }
  
      res.json({
        success: true,
        message: 'Patient updated successfully' + (req.files && req.files.length > 0 ? ` with ${req.files.length} file(s)` : ''),
        data: { patient: updatedPatient.toJSON() },
      });
    } catch (error) {
      console.error('Update patient error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update patient',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Internal server error',
      });
    }
  }
  
  
  
  // Get patient's complete profile
  static async getPatientProfile(req, res) {
    try {
      const { id } = req.params;
      const patient = await Patient.findById(id);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      const [visitHistory, clinicalRecords, adlFiles] = await Promise.all([
        patient.getVisitHistory(),
        patient.getClinicalRecords(),
        patient.getADLFiles()
      ]);

      res.json({
        success: true,
        data: {
          patient: patient.toJSON(),
          visitHistory,
          clinicalRecords,
          adlFiles
        }
      });
    } catch (error) {
      console.error('Get patient profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get patient's visit history
  static async getPatientVisitHistory(req, res) {
    try {
      const { id } = req.params;
      const patient = await Patient.findById(id);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      const visitHistory = await patient.getVisitHistory();

      res.json({
        success: true,
        data: {
          patient: patient.toJSON(),
          visitHistory
        }
      });
    } catch (error) {
      console.error('Get patient visit history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient visit history',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get patient's clinical records
  static async getPatientClinicalRecords(req, res) {
    try {
      const { id } = req.params;
      const patient = await Patient.findById(id);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      const clinicalRecords = await patient.getClinicalRecords();

      res.json({
        success: true,
        data: {
          patient: patient.toJSON(),
          clinicalRecords
        }
      });
    } catch (error) {
      console.error('Get patient clinical records error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient clinical records',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get patient's ADL files
  static async getPatientADLFiles(req, res) {
    try {
      const { id } = req.params;
      const patient = await Patient.findById(id);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      const adlFiles = await patient.getADLFiles();

      res.json({
        success: true,
        data: {
          patient: patient.toJSON(),
          adlFiles
        }
      });
    } catch (error) {
      console.error('Get patient ADL files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient ADL files',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Delete patient and all related records
  // static async deletePatient(req, res) {
  //   try {
  //     const { id } = req.params;

  //     const patientId = id;
  //     if (isNaN(patientId) || patientId <= 0) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Invalid patient ID'
  //       });
  //     }

  //     console.log(`[deletePatient] Attempting to delete patient ID: ${patientId}`);

  //     const patient = await Patient.findById(patientId);

  //     if (!patient) {
  //       console.error(`[deletePatient] Patient with ID ${patientId} not found`);
  //       return res.status(404).json({
  //         success: false,
  //         message: 'Patient not found'
  //       });
  //     }

  //     console.log(`[deletePatient] Patient found: ${patient.name} (ID: ${patientId})`);

  //     await patient.delete();

  //     console.log(`[deletePatient] Successfully deleted patient ID: ${patientId}`);

  //     res.json({
  //       success: true,
  //       message: 'Patient and all related records deleted successfully',
  //       deletedPatientId: patientId
  //     });

  //   } catch (error) {
  //     console.error('[deletePatient] Error:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Failed to delete patient and related records',
  //       error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  //     });
  //   }
  // }
  // static async deletePatient(req, res) {
  //   try {
  //     const { id } = req.params;
  
  //     // UUID validation (string, not number)
  //     if (!id || typeof id !== "string" || id.length < 36) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Invalid patient ID'
  //       });
  //     }
  
  //     console.log(`[deletePatient] Attempting to delete patient ID: ${id}`);
  
  //     const patient = await Patient.findOne({ where: { id } });
  
  //     if (!patient) {
  //       console.error(`[deletePatient] Patient with ID ${id} not found`);
  //       return res.status(404).json({
  //         success: false,
  //         message: 'Patient not found'
  //       });
  //     }
  
  //     console.log(`[deletePatient] Patient found: ${patient.name} (ID: ${id})`);
  
  //     await patient.destroy(); // Sequelize / ORM delete
  
  //     console.log(`[deletePatient] Successfully deleted patient ID: ${id}`);
  
  //     return res.json({
  //       success: true,
  //       message: 'Patient and all related records deleted successfully',
  //       deletedPatientId: id
  //     });
  
  //   } catch (error) {
  //     console.error('[deletePatient] Error:', error);
  //     return res.status(500).json({
  //       success: false,
  //       message: 'Failed to delete patient and related records'
  //     });
  //   }
  // }


  // static async deletePatient(req, res) {
  //   try {
  //     const { id } = req.params;
  
  //     // UUID validation
  //     const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  //     if (!uuidRegex.test(id)) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Invalid patient ID'
  //       });
  //     }
  
  //     console.log(`[deletePatient] Attempting to delete patient ID: ${id}`);
  
  //     // UUID lookup — correct method
  //     const patient = await Patient.findOne({ where: { id } });
  
  //     if (!patient) {
  //       return res.status(404).json({
  //         success: false,
  //         message: 'Patient not found'
  //       });
  //     }
  
  //     await patient.destroy();
  
  //     return res.status(200).json({
  //       success: true,
  //       message: 'Patient and all related records deleted successfully',
  //       deletedPatientId: id
  //     });
  
  //   } catch (error) {
  //     console.error('[deletePatient] Error:', error);
  //     return res.status(500).json({
  //       success: false,
  //       message: 'Failed to delete patient and related records'
  //     });
  //   }
  // }
  

  static async deletePatient(req, res) {
    try {
      const { id } = req.params;
  
      // Validate integer ID
      const patientId = parseInt(id, 10);
      if (isNaN(patientId) || patientId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid patient ID. ID must be a positive integer",
        });
      }
  
      console.log(`[deletePatient] Attempting to delete patient ID: ${id}`);

      const db = require('../config/database');
      const client = await db.getClient();
      
      try {
        await client.query('BEGIN');
        
        // 1️⃣ Check if patient exists in registered_patient table
        const patientCheckResult = await client.query(
          'SELECT id FROM registered_patient WHERE id = $1',
          [id]
        );
        
        if (!patientCheckResult.rows || patientCheckResult.rows.length === 0) {
          await client.query('ROLLBACK');
          console.log(`[deletePatient] Patient with ID ${id} not found in registered_patient`);
          return res.status(404).json({
            success: false,
            message: "Patient not found",
          });
        }
        
        console.log(`[deletePatient] Patient found in registered_patient table`);
        
        // 2️⃣ Check if patient_id exists in clinical_proforma table
        const clinicalResult = await client.query(
          'SELECT id FROM clinical_proforma WHERE patient_id = $1',
          [id]
        );
        const clinicalProformas = clinicalResult.rows || [];
        console.log(`[deletePatient] Found ${clinicalProformas.length} clinical proforma record(s) for patient ${id}`);
        
        // 3️⃣ Check if patient_id exists in adl_files table
        const adlResult = await client.query(
          'SELECT id FROM adl_files WHERE patient_id = $1',
          [id]
        );
        const adlFiles = adlResult.rows || [];
        console.log(`[deletePatient] Found ${adlFiles.length} ADL file record(s) for patient ${id}`);
        
        // 4️⃣ Delete related records first (in correct order to avoid foreign key constraints)
        
        // Step 4a: Delete prescriptions linked to clinical proformas
        if (clinicalProformas.length > 0) {
          const clinicalProformaIds = clinicalProformas.map(cp => cp.id);
          await client.query(
            'DELETE FROM prescriptions WHERE clinical_proforma_id = ANY($1)',
            [clinicalProformaIds]
          );
          console.log(`[deletePatient] Deleted prescriptions for clinical proformas`);
        }
        
        // Step 4b: Delete ADL files
        if (adlFiles.length > 0) {
          await client.query(
            'DELETE FROM adl_files WHERE patient_id = $1',
            [id]
          );
          console.log(`[deletePatient] Deleted ${adlFiles.length} ADL file(s)`);
        }

        
        
        // Step 4c: Delete clinical proformas
        if (clinicalProformas.length > 0) {
          await client.query(
            'DELETE FROM clinical_proforma WHERE patient_id = $1',
            [id]
          );
          console.log(`[deletePatient] Deleted ${clinicalProformas.length} clinical proforma(s)`);
        }
        
        // Step 4d: Delete patient visits
        await client.query(
          'DELETE FROM patient_visits WHERE patient_id = $1',
          [id]
        );
        console.log(`[deletePatient] Deleted patient visits`);
        
        // Step 5: Finally, delete the patient record itself
        await client.query(
          'DELETE FROM registered_patient WHERE id = $1',
          [id]
        );
        
        await client.query('COMMIT');
      
        console.log(`[deletePatient] Successfully deleted patient ID: ${id}`);
        
        return res.status(200).json({
          success: true,
          message: "Patient and all related records deleted successfully",
          deletedPatientId: id,
          deleted: {
            patient: true,
            clinicalProformas: clinicalProformas.length || 0,
            adlFiles: adlFiles.length || 0
          }
        });
      } catch (dbError) {
        await client.query('ROLLBACK');
        console.error(`[deletePatient] Database error: ${dbError.message}`);
        throw dbError;
      } finally {
        client.release();
      }
  
    } catch (error) {
      console.error("[deletePatient] Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete patient and related records",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  
  // Assign patient to a doctor
  static async assignPatient(req, res) {
    try {
      const { patient_id, assigned_doctor_id, room_no, visit_date, notes } = req.body;

      if (!patient_id || !assigned_doctor_id) {
        return res.status(400).json({ 
          success: false, 
          message: 'patient_id and assigned_doctor_id are required' 
        });
      }

      // Validate patient_id is an integer
      const patientIdInt = parseInt(patient_id, 10);
      if (isNaN(patientIdInt) || patientIdInt <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid patient ID format. Patient ID must be a positive integer.'
        });
      }
      
      // Validate doctor_id is an integer
      const doctorIdInt = parseInt(assigned_doctor_id, 10);
      if (isNaN(doctorIdInt) || doctorIdInt <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid doctor ID format. Doctor ID must be a positive integer.'
        });
      }
      
      // Verify patient exists
      const patient = await Patient.findById(patientIdInt);
      if (!patient) {
        return res.status(404).json({ 
          success: false, 
          message: 'Patient not found' 
        });
      }
      
      // Use integers for both patient and doctor IDs
      const patientIdForVisit = patientIdInt;
      const doctorIdForVisit = doctorIdInt;
   
      const assignment = await PatientVisit.assignPatient({ 
        patient_id: patientIdForVisit, 
        assigned_doctor_id: doctorIdForVisit, 
        room_no, 
        visit_date, 
        notes 
      });

      return res.status(201).json({ 
        success: true, 
        message: 'Patient assigned successfully', 
        data: { assignment } 
      });
    } catch (error) {
      console.error('Assign patient error:', error);
      
      // Check if error is due to invalid ID format
      if (error.message && (
        error.message.includes('invalid input syntax for type integer') ||
        error.message.includes('Invalid patient_id format') ||
        error.message.includes('type mismatch')
      )) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid ID format. Patient ID and Doctor ID must be valid integers.',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to assign patient', 
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
      });
    }
  }

  // Mark patient visit as completed
  static async markVisitCompleted(req, res) {
    try {
      const { id } = req.params; // Use 'id' to match validateId middleware
      const { visit_date } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Patient ID is required'
        });
      }

      const patientIdInt = parseInt(id, 10);
      if (isNaN(patientIdInt) || patientIdInt <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid patient ID format'
        });
      }

      // Mark today's visit as completed
      const visit = await PatientVisit.markPatientVisitCompletedToday(patientIdInt, visit_date);

      if (!visit) {
        // Check if patient exists to provide a more helpful error message
        const patient = await Patient.findById(patientIdInt);
        if (!patient) {
          return res.status(404).json({
            success: false,
            message: 'Patient not found'
          });
        }
        
        // Check if there's any visit record for today
        const db = require('../config/database');
        const today = visit_date || new Date().toISOString().slice(0, 10);
        const visitCheck = await db.query(
          `SELECT visit_status FROM patient_visits 
           WHERE patient_id = $1 AND visit_date = $2 
           ORDER BY created_at DESC LIMIT 1`,
          [patientIdInt, today]
        );
        
        if (visitCheck.rows && visitCheck.rows.length > 0) {
          // Visit exists but is already completed
          return res.status(404).json({
            success: false,
            message: 'Visit for today is already marked as completed'
          });
        } else {
          // No visit record exists for today
          return res.status(404).json({
            success: false,
            message: 'No visit record found for today. Please create a visit record first before marking as completed.'
          });
        }
      }

      res.json({
        success: true,
        message: 'Visit marked as completed successfully',
        data: { visit }
      });
    } catch (error) {
      console.error('Mark visit completed error:', error);
      
      // Check if it's a "not found" error
      if (error.message && error.message.includes('No visit found')) {
        return res.status(404).json({
          success: false,
          message: error.message || 'No active visit found for today to mark as completed'
        });
      }
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to mark visit as completed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  static async uploadPatientFiles(req, res) {
    try {
      const { id } = req.params;
      const patientIdInt = parseInt(id, 10);

      if (isNaN(patientIdInt) || patientIdInt <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid patient ID format'
        });
      }

      // Check if patient exists
      const patient = await Patient.findById(patientIdInt);
      if (!patient) {
        // Clean up uploaded files if patient doesn't exist
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => {
            if (file.path && fs.existsSync(file.path)) {
              try {
                fs.unlinkSync(file.path);
              } catch (err) {
                console.error('Error cleaning up file:', err);
              }
            }
          });
        }
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Get existing files
      const existingFiles = patient.patient_files || [];
      const uploadedFiles = [];

      // Process each uploaded file using PatientFileController
      // This ensures files are saved using the configurable path system
      const PatientFileController = require('./patientFileController');
      const fileCreateReq = {
        body: { patient_id: patientIdInt, user_id: req.user?.id },
        files: req.files,
        user: req.user
      };
      
      const fileCreateRes = {
        status: (code) => ({
          json: (data) => {
            if (code >= 400) {
              throw new Error(data.message || 'Failed to upload files');
            }
          }
        })
      };
      
      await PatientFileController.createPatientFiles(fileCreateReq, fileCreateRes);
      
      // Get updated file list
      const updatedPatientFile = await PatientFile.findByPatientId(patientIdInt);
      const allFiles = updatedPatientFile ? updatedPatientFile.attachment : [];
      
      // Format files for response
      req.files.forEach((file, index) => {
        if (allFiles[index]) {
          uploadedFiles.push({
            filename: path.basename(allFiles[index]),
            originalname: file.originalname,
            path: allFiles[index],
            type: file.mimetype,
            size: file.size,
            uploaded_at: new Date().toISOString()
          });
        }
      });

      // Files are already saved by PatientFileController, no need to update patient_files column
      // The patient_files column is legacy, files are now stored in patient_files table

      res.status(200).json({
        success: true,
        message: `${uploadedFiles.length} file(s) uploaded successfully`,
        data: {
          files: uploadedFiles,
          total_files: updatedFiles.length
        }
      });
    } catch (error) {
      console.error('Upload patient files error:', error);
      // Clean up uploaded files on error
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          if (file.path && fs.existsSync(file.path)) {
            try {
              fs.unlinkSync(file.path);
            } catch (unlinkError) {
              console.error('Error deleting file:', unlinkError);
            }
          }
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to upload files',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  static async getPatientFiles(req, res) {
    try {
      const { id } = req.params;
      const patientIdInt = parseInt(id, 10);

      if (isNaN(patientIdInt) || patientIdInt <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid patient ID format'
        });
      }

      const patient = await Patient.findById(patientIdInt);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      // Use the new PatientFileController to get files from patient_files table
      const PatientFileController = require('./patientFileController');
      const fileReq = {
        params: { patient_id: patientIdInt },
        user: req.user
      };
      
      // Call PatientFileController.getPatientFiles
      const PatientFile = require('../models/PatientFile');
      const patientFile = await PatientFile.findByPatientId(patientIdInt);
      
      const files = patientFile ? patientFile.attachment : [];
      
      // Also include legacy files from patient.patient_files for backward compatibility
      const legacyFiles = patient.patient_files || [];
      const allFiles = [...files, ...legacyFiles];

      res.status(200).json({
        success: true,
        data: {
          files: allFiles,
          count: allFiles.length
        }
      });
    } catch (error) {
      console.error('Get patient files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient files',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  static async deletePatientFile(req, res) {
    try {
      const { id, filename } = req.params;
      const patientIdInt = parseInt(id, 10);

      if (isNaN(patientIdInt) || patientIdInt <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid patient ID format'
        });
      }

      const patient = await Patient.findById(patientIdInt);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      const files = patient.patient_files || [];
      const fileIndex = files.findIndex(f => f.filename === filename);

      if (fileIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // Delete physical file
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkError) {
          console.error('Error deleting physical file:', unlinkError);
          // Continue even if physical file deletion fails
        }
      }

      // Remove from database
      const updatedFiles = files.filter(f => f.filename !== filename);
      await Patient.updateFiles(patientIdInt, updatedFiles);

      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
        data: {
          deleted_file: files[fileIndex],
          remaining_files: updatedFiles.length
        }
      });
    } catch (error) {
      console.error('Delete patient file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete file',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = PatientController;
