const ClinicalProforma = require('../models/ClinicalProforma');
const Patient = require('../models/Patient');
const ADLFile = require('../models/ADLFile');
const Prescription = require('../models/Prescription');
const db = require('../config/database');


class ClinicalController {
  // Helper function to validate and sanitize date fields
  static sanitizeDateField(value) {
    if (!value || value === '' || value === null || value === undefined) {
      return null;
    }
    // If it's already a valid date string, return it
    if (typeof value === 'string' && value.length >= 8) {
      // Check if it's a valid date format (YYYY-MM-DD or similar)
      const dateRegex = /^\d{4}-\d{2}-\d{2}/;
      if (dateRegex.test(value)) {
        return value.split('T')[0]; // Extract just the date part if it includes time
      }
    }
    // If it's a number or short string that doesn't look like a date, return null
    if (typeof value === 'number' || (typeof value === 'string' && value.length < 8)) {
      return null;
    }
    // Try to parse as date
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString().split('T')[0];
  }

    static async createRecord(table, data) {
      // Use PostgreSQL for write operations
      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
      
      const query = `
        INSERT INTO ${table} (${columns.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;
      
      const result = await db.query(query, values);
      if (!result.rows || result.rows.length === 0) {
        throw new Error(`No data returned from ${table} insert`);
      }
      return result.rows[0];
    }
  
    static async createClinicalProforma(req, res) {
      try {
        const data = req.body;
  
        // 🔹 Basic validation
        if (!data.patient_id || !data.visit_date) {
          return res.status(400).json({
            success: false,
            message: "Missing required fields",
          });
        }
  
    // 🔹 Complex Case (with ADL) - Transaction-like atomicity
    // When doctor_decision === 'complex_case', create ADL file and link bidirectionally
    if (data.doctor_decision === "complex_case") {
      // Ensure requires_adl_file is true for complex cases
      if (data.requires_adl_file !== true && data.requires_adl_file !== "true") {
        data.requires_adl_file = true;
      }

      // Extract complex case fields (ADL-specific fields only)
          const complexCaseFields = [
            'history_narrative', 'history_specific_enquiry', 'history_drug_intake',
            'history_treatment_place', 'history_treatment_dates', 'history_treatment_drugs', 'history_treatment_response',
            'informants', 'complaints_patient', 'complaints_informant',
            'past_history_medical', 'past_history_psychiatric_dates', 'past_history_psychiatric_diagnosis',
            'past_history_psychiatric_treatment', 'past_history_psychiatric_interim', 'past_history_psychiatric_recovery',
            'family_history_father_age', 'family_history_father_education', 'family_history_father_occupation',
            'family_history_father_personality', 'family_history_father_deceased', 'family_history_father_death_age',
            'family_history_father_death_date', 'family_history_father_death_cause',
            'family_history_mother_age', 'family_history_mother_education', 'family_history_mother_occupation',
            'family_history_mother_personality', 'family_history_mother_deceased', 'family_history_mother_death_age',
            'family_history_mother_death_date', 'family_history_mother_death_cause', 'family_history_siblings',
            'diagnostic_formulation_summary', 'diagnostic_formulation_features', 'diagnostic_formulation_psychodynamic',
            'premorbid_personality_passive_active', 'premorbid_personality_assertive', 'premorbid_personality_introvert_extrovert',
            'premorbid_personality_traits', 'premorbid_personality_hobbies', 'premorbid_personality_habits', 'premorbid_personality_alcohol_drugs',
            'physical_appearance', 'physical_body_build', 'physical_pallor', 'physical_icterus', 'physical_oedema', 'physical_lymphadenopathy',
            'physical_pulse', 'physical_bp', 'physical_height', 'physical_weight', 'physical_waist', 'physical_fundus',
            'physical_cvs_apex', 'physical_cvs_regularity', 'physical_cvs_heart_sounds', 'physical_cvs_murmurs',
            'physical_chest_expansion', 'physical_chest_percussion', 'physical_chest_adventitious',
            'physical_abdomen_tenderness', 'physical_abdomen_mass', 'physical_abdomen_bowel_sounds',
            'physical_cns_cranial', 'physical_cns_motor_sensory', 'physical_cns_rigidity', 'physical_cns_involuntary',
            'physical_cns_superficial_reflexes', 'physical_cns_dtrs', 'physical_cns_plantar', 'physical_cns_cerebellar',
            'mse_general_demeanour', 'mse_general_tidy', 'mse_general_awareness', 'mse_general_cooperation',
            'mse_psychomotor_verbalization', 'mse_psychomotor_pressure', 'mse_psychomotor_tension', 'mse_psychomotor_posture',
            'mse_psychomotor_mannerism', 'mse_psychomotor_catatonic', 'mse_affect_subjective', 'mse_affect_tone',
            'mse_affect_resting', 'mse_affect_fluctuation', 'mse_thought_flow', 'mse_thought_form', 'mse_thought_content',
            'mse_cognitive_consciousness', 'mse_cognitive_orientation_time', 'mse_cognitive_orientation_place',
            'mse_cognitive_orientation_person', 'mse_cognitive_memory_immediate', 'mse_cognitive_memory_recent',
            'mse_cognitive_memory_remote', 'mse_cognitive_subtraction', 'mse_cognitive_digit_span', 'mse_cognitive_counting',
            'mse_cognitive_general_knowledge', 'mse_cognitive_calculation', 'mse_cognitive_similarities', 'mse_cognitive_proverbs',
            'mse_insight_understanding', 'mse_insight_judgement',
            'education_start_age', 'education_highest_class', 'education_performance', 'education_disciplinary',
            'education_peer_relationship', 'education_hobbies', 'education_special_abilities', 'education_discontinue_reason',
            'occupation_jobs', 'sexual_menarche_age', 'sexual_menarche_reaction', 'sexual_education', 'sexual_masturbation',
            'sexual_contact', 'sexual_premarital_extramarital', 'sexual_marriage_arranged', 'sexual_marriage_date',
            'sexual_spouse_age', 'sexual_spouse_occupation', 'sexual_adjustment_general', 'sexual_adjustment_sexual',
            'sexual_children', 'sexual_problems', 'religion_type', 'religion_participation', 'religion_changes',
            'living_residents', 'living_income_sharing', 'living_expenses', 'living_kitchen', 'living_domestic_conflicts',
            'living_social_class', 'living_inlaws', 'home_situation_childhood', 'home_situation_parents_relationship',
            'home_situation_socioeconomic', 'home_situation_interpersonal', 'personal_birth_date', 'personal_birth_place',
            'personal_delivery_type', 'personal_complications_prenatal', 'personal_complications_natal', 'personal_complications_postnatal',
            'development_weaning_age', 'development_first_words', 'development_three_words', 'development_walking',
            'development_neurotic_traits', 'development_nail_biting', 'development_bedwetting', 'development_phobias',
            'development_childhood_illness', 'provisional_diagnosis', 'treatment_plan', 'consultant_comments'
          ];

      // Extract complex case fields for ADL file
          const complexCaseData = {};
          // List of date fields that need sanitization
          const dateFields = [
            'family_history_father_death_date', 'family_history_mother_death_date',
            'past_history_psychiatric_dates', 'history_treatment_dates',
            'personal_birth_date'
          ];
          complexCaseFields.forEach(field => {
        if (data.hasOwnProperty(field) && data[field] !== undefined && data[field] !== null) {
              // Sanitize date fields
              if (dateFields.includes(field)) {
                complexCaseData[field] = ClinicalController.sanitizeDateField(data[field]);
              } else {
                complexCaseData[field] = data[field];
              }
            }
          });

      // ✅ TRANSACTION-LIKE FLOW: Create clinical_proforma, then ADL file, then update clinical_proforma
      // This ensures atomicity with rollback on failure
      let clinicalRecord = null;
      let adlFile = null;
      
      try {
        // STEP 1: Create clinical_proforma (adl_file_id will be null initially)
          const clinicalData = {
            patient_id: data.patient_id,
          filled_by: req.user.id,
            visit_date: ClinicalController.sanitizeDateField(data.visit_date) || new Date().toISOString().split('T')[0],
          visit_type: data.visit_type || 'first_visit',
            room_no: data.room_no,
            assigned_doctor: data.assigned_doctor && data.assigned_doctor !== '' ? parseInt(data.assigned_doctor) : null,
            informant_present: data.informant_present,
            nature_of_information: data.nature_of_information,
            onset_duration: data.onset_duration,
            course: data.course,
            precipitating_factor: data.precipitating_factor,
            illness_duration: data.illness_duration,
            current_episode_since: ClinicalController.sanitizeDateField(data.current_episode_since),
            mood: data.mood,
            behaviour: data.behaviour,
            speech: data.speech,
            thought: data.thought,
            perception: data.perception,
            somatic: data.somatic,
            bio_functions: data.bio_functions,
            adjustment: data.adjustment,
            cognitive_function: data.cognitive_function,
            fits: data.fits,
            sexual_problem: data.sexual_problem,
            substance_use: data.substance_use,
            past_history: data.past_history,
            family_history: data.family_history,
            associated_medical_surgical: data.associated_medical_surgical,
            mse_behaviour: data.mse_behaviour,
            mse_affect: data.mse_affect,
            mse_thought: data.mse_thought,
            mse_delusions: data.mse_delusions,
            mse_perception: data.mse_perception,
            mse_cognitive_function: data.mse_cognitive_function,
            gpe: data.gpe,
            diagnosis: data.diagnosis,
            icd_code: data.icd_code,
            disposal: data.disposal,
            workup_appointment: ClinicalController.sanitizeDateField(data.workup_appointment),
            referred_to: data.referred_to,
            treatment_prescribed: data.treatment_prescribed,
            doctor_decision: data.doctor_decision,
            // case_severity: data.case_severity,
            requires_adl_file: true,
            adl_reasoning: data.adl_reasoning,
          adl_file_id: null // Will be set after ADL file creation
        };

        clinicalRecord = await ClinicalController.createRecord("clinical_proforma", clinicalData);
       
        // Sync visit_type between patient_visits and clinical_proforma
        if (clinicalRecord && data.visit_type) {
          try {
            const visitDate = clinicalData.visit_date || new Date().toISOString().split('T')[0];
            const updateResult = await db.query(
              `UPDATE patient_visits 
               SET visit_type = $1, clinical_proforma_id = $2
               WHERE patient_id = $3 AND visit_date = $4`,
              [data.visit_type, clinicalRecord.id, data.patient_id, visitDate]
            );
            if (updateResult.rowCount > 0) {
              console.log(`[createClinicalProforma] ✅ Synced visit_type '${data.visit_type}' to patient_visits for patient ${data.patient_id}`);
            } else {
              console.warn(`[createClinicalProforma] ⚠️ No visit record found to sync for patient ${data.patient_id} on ${visitDate}. Visit record should be created first.`);
            }
          } catch (updateError) {
            console.error('[createClinicalProforma] ⚠️ Error syncing visit_type to patient_visits:', updateError);
            // Don't fail the whole operation if this update fails
          }
        }

        // STEP 2: Create or reuse ADL file
        // Check if ADL file already exists for this clinical_proforma (shouldn't happen on create, but handle gracefully)
        let existingAdlFile = null;
        if (clinicalRecord.adl_file_id) {
          try {
            existingAdlFile = await ADLFile.findById(clinicalRecord.adl_file_id);
            if (existingAdlFile) {
              console.log(`[createClinicalProforma] ⚠️ ADL file ${existingAdlFile.id} already exists, reusing it`);
            }
          } catch (err) {
            console.warn(`[createClinicalProforma] Could not fetch existing ADL file: ${err.message}`);
          }
        }

        if (!existingAdlFile) {
          // Auto-generate ADL number if not provided
          let nextAdlNo = req.body.adl_no;
          if (!nextAdlNo) {
            nextAdlNo = Patient.generateADLNo();
            console.log(`[createClinicalProforma] ✅ Auto-generated ADL number: ${nextAdlNo}`);
          }

          // Prepare ADL data with complex case fields
          // Note: is_active has a default value in the table, so we don't need to include it
          const adlData = {
            patient_id: data.patient_id,
            adl_no: nextAdlNo,
            created_by: req.user.id,
            clinical_proforma_id: clinicalRecord.id, // ✅ Link to clinical_proforma
            file_status: 'created',
            file_created_date: ClinicalController.sanitizeDateField(data.visit_date) || new Date().toISOString().split('T')[0],
            total_visits: 1,
            ...complexCaseData // All ADL-specific fields
          };

          // Ensure JSONB fields are arrays
          const jsonbFields = ['informants', 'complaints_patient', 'complaints_informant', 
            'family_history_siblings', 'premorbid_personality_traits', 'occupation_jobs', 
            'sexual_children', 'living_residents', 'living_inlaws'];
          
          jsonbFields.forEach(field => {
            if (adlData[field] !== undefined && adlData[field] !== null) {
              if (!Array.isArray(adlData[field])) {
                if (typeof adlData[field] === 'string') {
                  try {
                    adlData[field] = JSON.parse(adlData[field]);
                  } catch {
                    adlData[field] = [];
                  }
                } else {
                  adlData[field] = [];
                }
              }
            } else {
              adlData[field] = [];
            }
          });

          console.log(`[createClinicalProforma] 📋 ADL data keys: ${Object.keys(adlData).length} fields`);
          console.log(`[createClinicalProforma] 📋 ADL data sample fields:`, Object.keys(adlData).slice(0, 10));
          
          adlFile = await ADLFile.create(adlData);
          if (!adlFile || !adlFile.id) {
            throw new Error('ADL file creation returned no ID');
          }
          console.log(`[createClinicalProforma] ✅ Step 2: Created ADL file ${adlFile.id} (${adlFile.adl_no})`);
        } else {
          adlFile = existingAdlFile;
          console.log(`[createClinicalProforma] ✅ Step 2: Reusing existing ADL file ${adlFile.id}`);
        }

        // STEP 3: Update clinical_proforma with adl_file_id (bidirectional link)
        await db.query(
          'UPDATE clinical_proforma SET adl_file_id = $1 WHERE id = $2',
          [adlFile.id, clinicalRecord.id]
        );

        console.log(`[createClinicalProforma] ✅ Step 3: Updated Walk-in Clinical Proforma ${clinicalRecord.id} with adl_file_id: ${adlFile.id}`);

        // ✅ STEP 4: Update patient record to reflect complex case status
        try {
          const patient = await Patient.findById(data.patient_id);
          if (patient) {
            await patient.update({
              has_adl_file: true,
              case_complexity: 'complex'
            });
            console.log(`[createClinicalProforma] ✅ Step 4: Updated patient ${data.patient_id} - has_adl_file=true, case_complexity=complex`);
          } else {
            console.warn(`[createClinicalProforma] ⚠️ Patient ${data.patient_id} not found for status update`);
          }
        } catch (patientUpdateError) {
          console.error('[createClinicalProforma] ❌ Failed to update patient status:', patientUpdateError);
          // Non-critical error - continue with response
        }

        // Refresh clinical record to get updated adl_file_id
        const updatedClinicalResult = await db.query(
          'SELECT * FROM clinical_proforma WHERE id = $1',
          [clinicalRecord.id]
        );
        const updatedClinical = updatedClinicalResult.rows[0];

          // Handle prescriptions if provided
          let createdPrescriptions = [];
          if (data.prescriptions && Array.isArray(data.prescriptions) && data.prescriptions.length > 0) {
            try {
              // Ensure patient_id is an integer
              const patientIdInt = parseInt(data.patient_id || clinicalRecord.patient_id);
              if (isNaN(patientIdInt)) {
                throw new Error("Invalid patient_id: must be an integer");
              }
              
              const prescription = await Prescription.create({
                patient_id: patientIdInt,
                clinical_proforma_id: clinicalRecord.id,
                prescription: data.prescriptions
              });
              createdPrescriptions = [prescription];
            } catch (prescriptionError) {
            console.error('[createClinicalProforma] Failed to create prescriptions:', prescriptionError);
            }
          }

        // ✅ Return combined response with both clinical_proforma and adl_file
          return res.status(201).json({
            success: true,
            message: "Complex case with ADL file saved successfully",
            data: { 
            clinical_proforma: updatedClinical || clinicalRecord,
            adl_file: adlFile.toJSON() // Full ADL file data for frontend to prefill Step 3
          },
              prescriptions: createdPrescriptions.length > 0 ? {
                count: createdPrescriptions.length,
                prescriptions: createdPrescriptions
              } : null
        });

      } catch (error) {
        console.error('[createClinicalProforma] ❌ Transaction failed:', error);
        
        // ✅ ROLLBACK: Delete clinical_proforma if it was created but ADL creation/linking failed
        if (clinicalRecord && clinicalRecord.id && !adlFile) {
          try {
            await db.query(
              'DELETE FROM clinical_proforma WHERE id = $1',
              [clinicalRecord.id]
            );
            console.log(`[createClinicalProforma] ✅ Rollback: Deleted Walk-in Clinical Proforma ${clinicalRecord.id}`);
          } catch (rollbackError) {
            console.error('[createClinicalProforma] ❌ Rollback failed:', rollbackError);
          }
        }
        
        return res.status(500).json({
          success: false,
          message: "Failed to handle ADL file for complex case",
          error: error.message || "Internal server error"
        });
      }
    }

    // 🔹 Simple Case (no ADL)
        const clinicalData = {
          patient_id: data.patient_id,
          visit_date: ClinicalController.sanitizeDateField(data.visit_date) || new Date().toISOString().split('T')[0],
          visit_type: data.visit_type,
          room_no: data.room_no,
          assigned_doctor: data.assigned_doctor && data.assigned_doctor !== '' ? parseInt(data.assigned_doctor) : null,
          filled_by: req.user.id,
          informant_present: data.informant_present,
          nature_of_information: data.nature_of_information,
          onset_duration: data.onset_duration,
          course: data.course,
          precipitating_factor: data.precipitating_factor,
          illness_duration: data.illness_duration,
          current_episode_since: ClinicalController.sanitizeDateField(data.current_episode_since),
          mood: data.mood,
          behaviour: data.behaviour,
          speech: data.speech,
          thought: data.thought,
          perception: data.perception,
          somatic: data.somatic,
          bio_functions: data.bio_functions,
          adjustment: data.adjustment,
          cognitive_function: data.cognitive_function,
          fits: data.fits,
          sexual_problem: data.sexual_problem,
          substance_use: data.substance_use,
          past_history: data.past_history,
          family_history: data.family_history,
          associated_medical_surgical: data.associated_medical_surgical,
          mse_behaviour: data.mse_behaviour,
          mse_affect: data.mse_affect,
          mse_thought: data.mse_thought,
          mse_delusions: data.mse_delusions,
          mse_perception: data.mse_perception,
          mse_cognitive_function: data.mse_cognitive_function,
          gpe: data.gpe,
          diagnosis: data.diagnosis,
          icd_code: data.icd_code,
          disposal: data.disposal,
          workup_appointment: ClinicalController.sanitizeDateField(data.workup_appointment),
          referred_to: data.referred_to,
          treatment_prescribed: data.treatment_prescribed,
          doctor_decision: data.doctor_decision,
          // case_severity: data.case_severity,
          requires_adl_file: false,
          adl_file_id: null,
          adl_reasoning: data.adl_reasoning,
        };
  
        const simpleClinical = await ClinicalController.createRecord("clinical_proforma", clinicalData);

        // Sync visit_type between patient_visits and clinical_proforma
        if (simpleClinical && data.visit_type) {
          try {
            const visitDate = clinicalData.visit_date || new Date().toISOString().split('T')[0];
            const updateResult = await db.query(
              `UPDATE patient_visits 
               SET visit_type = $1, clinical_proforma_id = $2
               WHERE patient_id = $3 AND visit_date = $4`,
              [data.visit_type, simpleClinical.id, data.patient_id, visitDate]
            );
            if (updateResult.rowCount > 0) {
              console.log(`[createClinicalProforma] ✅ Synced visit_type '${data.visit_type}' to patient_visits for patient ${data.patient_id} (simple case)`);
            } else {
              console.warn(`[createClinicalProforma] ⚠️ No visit record found to sync for patient ${data.patient_id} on ${visitDate}. Visit record should be created first.`);
            }
          } catch (updateError) {
            console.error('[createClinicalProforma] ⚠️ Error syncing visit_type to patient_visits:', updateError);
            // Don't fail the whole operation if this update fails
          }
        }

    // Handle prescriptions
        let createdPrescriptions = [];
        if (data.prescriptions && Array.isArray(data.prescriptions) && data.prescriptions.length > 0) {
          try {
            // Ensure patient_id is an integer
            const patientIdInt = parseInt(data.patient_id || simpleClinical.patient_id);
            if (isNaN(patientIdInt)) {
              throw new Error("Invalid patient_id: must be an integer");
            }
            
            const prescription = await Prescription.create({
              patient_id: patientIdInt,
              clinical_proforma_id: simpleClinical.id,
              prescription: data.prescriptions
            });
            createdPrescriptions = [prescription];
          } catch (prescriptionError) {
            console.error('Failed to create prescriptions:', prescriptionError);
          }
        }
  
        return res.status(201).json({
          success: true,
          message: "Simple Walk-in Clinical Proforma saved successfully",
          data: {
            proforma: simpleClinical,
            prescriptions: createdPrescriptions.length > 0 ? {
              count: createdPrescriptions.length,
              prescriptions: createdPrescriptions
            } : null
          },
        });
      } catch (err) {
    console.error("❌ Unhandled Error:", err);
        return res.status(500).json({
          success: false,
          message: err.message || "Server Error",
        });
      }
    }
  
 
  static async getAllClinicalProformas(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {};

      // Apply filters
      if (req.query.visit_type) filters.visit_type = req.query.visit_type;
      if (req.query.doctor_decision) filters.doctor_decision = req.query.doctor_decision;
      // if (req.query.case_severity) filters.case_severity = req.query.case_severity;
      if (req.query.requires_adl_file !== undefined) filters.requires_adl_file = req.query.requires_adl_file === 'true';
      if (req.query.filled_by) filters.filled_by = req.query.filled_by;
      if (req.query.room_no) filters.room_no = req.query.room_no;
      if (req.query.date_from) filters.date_from = req.query.date_from;
      if (req.query.date_to) filters.date_to = req.query.date_to;

      const result = await ClinicalProforma.findAll(page, limit, filters);

      res.json({
        success: true,
        data: {
          proformas: result.proformas.map(p => p.toJSON()),
          pagination: result.pagination
        }
      });
    } catch (error) {
      console.error('Get all clinical proformas error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get clinical proformas',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get clinical proforma by ID
  static async getClinicalProformaById(req, res) {
    try {
      const { id } = req.params;
      console.log('[ClinicalController.getClinicalProformaById] Request received for ID:', id);
      console.log('[ClinicalController.getClinicalProformaById] ID type:', typeof id);
      
      const proforma = await ClinicalProforma.findById(id);
      console.log('[ClinicalController.getClinicalProformaById] Proforma found:', !!proforma);

      if (!proforma) {
        console.log('[ClinicalController.getClinicalProformaById] Proforma not found for ID:', id);
        return res.status(404).json({
          success: false,
          message: 'Clinical proforma not found'
        });
      }

      console.log('[ClinicalController.getClinicalProformaById] Returning proforma data');
      res.json({
        success: true,
        data: {
          proforma: proforma.toJSON()
        }
      });
    } catch (error) {
      console.error('[ClinicalController.getClinicalProformaById] Error:', error);
      console.error('[ClinicalController.getClinicalProformaById] Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Failed to get clinical proforma',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get clinical proforma by patient ID
  static async getClinicalProformaByPatientId(req, res) {
    try {
      const { patient_id } = req.params;
      const proformas = await ClinicalProforma.findByPatientId(patient_id);

      res.json({
        success: true,
        data: {
          proformas: proformas.map(p => p.toJSON())
        }
      });
    } catch (error) {
      console.error('Get clinical proforma by patient ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get clinical proformas',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Update clinical proforma
  static async updateClinicalProforma(req, res) {
    try {
      const { id } = req.params;
      
      // Validate that id is a valid integer
      const proformaId = parseInt(id, 10);
      if (isNaN(proformaId) || proformaId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid clinical proforma ID format. ID must be a valid integer.'
        });
      }
      
      const proforma = await ClinicalProforma.findById(proformaId);

      if (!proforma) {
        return res.status(404).json({
          success: false,
          message: 'Clinical proforma not found'
        });
      }

      // Allow the doctor who created the proforma, Admin, or Faculty/Resident roles to update
      const isCreator = proforma.filled_by === req.user.id;
      const isAdmin = req.user.role === 'Admin';
      const isResident = req.user.role === 'Resident';
      const isFaculty = req.user.role === 'Faculty';
      
      if (!isCreator && !isAdmin && !isResident && !isFaculty) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update proformas if you created them, or if you are an Admin, Faculty, or Resident.'
        });
      }

      // Extract prescriptions and complex case data from updateData
      const { prescriptions, ...proformaUpdateData } = req.body;
      
      // Define complex case fields that should go to ADL file
      const complexCaseFields = [
        'history_narrative', 'history_specific_enquiry', 'history_drug_intake',
        'history_treatment_place', 'history_treatment_dates', 'history_treatment_drugs', 'history_treatment_response',
        'informants', 'complaints_patient', 'complaints_informant',
        'past_history_medical', 'past_history_psychiatric_dates', 'past_history_psychiatric_diagnosis',
        'past_history_psychiatric_treatment', 'past_history_psychiatric_interim', 'past_history_psychiatric_recovery',
        'family_history_father_age', 'family_history_father_education', 'family_history_father_occupation',
        'family_history_father_personality', 'family_history_father_deceased', 'family_history_father_death_age',
        'family_history_father_death_date', 'family_history_father_death_cause',
        'family_history_mother_age', 'family_history_mother_education', 'family_history_mother_occupation',
        'family_history_mother_personality', 'family_history_mother_deceased', 'family_history_mother_death_age',
        'family_history_mother_death_date', 'family_history_mother_death_cause', 'family_history_siblings',
        'diagnostic_formulation_summary', 'diagnostic_formulation_features', 'diagnostic_formulation_psychodynamic',
        'premorbid_personality_passive_active', 'premorbid_personality_assertive', 'premorbid_personality_introvert_extrovert',
        'premorbid_personality_traits', 'premorbid_personality_hobbies', 'premorbid_personality_habits', 'premorbid_personality_alcohol_drugs',
        'physical_appearance', 'physical_body_build', 'physical_pallor', 'physical_icterus', 'physical_oedema', 'physical_lymphadenopathy',
        'physical_pulse', 'physical_bp', 'physical_height', 'physical_weight', 'physical_waist', 'physical_fundus',
        'physical_cvs_apex', 'physical_cvs_regularity', 'physical_cvs_heart_sounds', 'physical_cvs_murmurs',
        'physical_chest_expansion', 'physical_chest_percussion', 'physical_chest_adventitious',
        'physical_abdomen_tenderness', 'physical_abdomen_mass', 'physical_abdomen_bowel_sounds',
        'physical_cns_cranial', 'physical_cns_motor_sensory', 'physical_cns_rigidity', 'physical_cns_involuntary',
        'physical_cns_superficial_reflexes', 'physical_cns_dtrs', 'physical_cns_plantar', 'physical_cns_cerebellar',
        'mse_general_demeanour', 'mse_general_tidy', 'mse_general_awareness', 'mse_general_cooperation',
        'mse_psychomotor_verbalization', 'mse_psychomotor_pressure', 'mse_psychomotor_tension', 'mse_psychomotor_posture',
        'mse_psychomotor_mannerism', 'mse_psychomotor_catatonic', 'mse_affect_subjective', 'mse_affect_tone',
        'mse_affect_resting', 'mse_affect_fluctuation', 'mse_thought_flow', 'mse_thought_form', 'mse_thought_content',
        'mse_cognitive_consciousness', 'mse_cognitive_orientation_time', 'mse_cognitive_orientation_place',
        'mse_cognitive_orientation_person', 'mse_cognitive_memory_immediate', 'mse_cognitive_memory_recent',
        'mse_cognitive_memory_remote', 'mse_cognitive_subtraction', 'mse_cognitive_digit_span', 'mse_cognitive_counting',
        'mse_cognitive_general_knowledge', 'mse_cognitive_calculation', 'mse_cognitive_similarities', 'mse_cognitive_proverbs',
        'mse_insight_understanding', 'mse_insight_judgement',
        'education_start_age', 'education_highest_class', 'education_performance', 'education_disciplinary',
        'education_peer_relationship', 'education_hobbies', 'education_special_abilities', 'education_discontinue_reason',
        'occupation_jobs', 'sexual_menarche_age', 'sexual_menarche_reaction', 'sexual_education', 'sexual_masturbation',
        'sexual_contact', 'sexual_premarital_extramarital', 'sexual_marriage_arranged', 'sexual_marriage_date',
        'sexual_spouse_age', 'sexual_spouse_occupation', 'sexual_adjustment_general', 'sexual_adjustment_sexual',
        'sexual_children', 'sexual_problems', 'religion_type', 'religion_participation', 'religion_changes',
        'living_residents', 'living_income_sharing', 'living_expenses', 'living_kitchen', 'living_domestic_conflicts',
        'living_social_class', 'living_inlaws', 'home_situation_childhood', 'home_situation_parents_relationship',
        'home_situation_socioeconomic', 'home_situation_interpersonal', 'personal_birth_date', 'personal_birth_place',
        'personal_delivery_type', 'personal_complications_prenatal', 'personal_complications_natal', 'personal_complications_postnatal',
        'development_weaning_age', 'development_first_words', 'development_three_words', 'development_walking',
        'development_neurotic_traits', 'development_nail_biting', 'development_bedwetting', 'development_phobias',
        'development_childhood_illness', 'provisional_diagnosis', 'treatment_plan', 'consultant_comments'
      ];

      // Separate complex case data from basic proforma data
      // IMPORTANT: Complex case fields are extracted and removed from proformaUpdateData
      // They will be saved ONLY in adl_files table (not in clinical_proforma)
      // The clinical_proforma table will only store a reference (adl_file_id) to the ADL file
      const complexCaseData = {};
      // List of date fields that need sanitization
      const dateFields = [
        'family_history_father_death_date', 'family_history_mother_death_date',
        'past_history_psychiatric_dates', 'history_treatment_dates',
        'personal_birth_date'
      ];
      complexCaseFields.forEach(field => {
        if (proformaUpdateData[field] !== undefined) {
          // Sanitize date fields
          if (dateFields.includes(field)) {
            complexCaseData[field] = ClinicalController.sanitizeDateField(proformaUpdateData[field]);
          } else {
            complexCaseData[field] = proformaUpdateData[field];
          }
          delete proformaUpdateData[field]; // Remove from basic proforma data to prevent duplication
        }
      });
      
      // Also sanitize date fields in proformaUpdateData
      if (proformaUpdateData.visit_date) {
        proformaUpdateData.visit_date = ClinicalController.sanitizeDateField(proformaUpdateData.visit_date);
      }
      if (proformaUpdateData.current_episode_since) {
        proformaUpdateData.current_episode_since = ClinicalController.sanitizeDateField(proformaUpdateData.current_episode_since);
      }
      if (proformaUpdateData.workup_appointment) {
        proformaUpdateData.workup_appointment = ClinicalController.sanitizeDateField(proformaUpdateData.workup_appointment);
      }

      // Check if changing to complex case or already is complex case
      const changingToComplexCase = proformaUpdateData.doctor_decision === 'complex_case' && 
                                     proforma.doctor_decision !== 'complex_case';
      const isComplexCase = proformaUpdateData.doctor_decision === 'complex_case' || proforma.doctor_decision === 'complex_case';
      
      // Ensure requires_adl_file is true for complex cases
      if (isComplexCase && proformaUpdateData.requires_adl_file !== true && proformaUpdateData.requires_adl_file !== "true") {
        proformaUpdateData.requires_adl_file = true;
      }
      
      // Handle ADL file separately (don't pass to model's update method)
      // Remove complexCaseData from updateData to prevent model from trying to handle it
      delete proformaUpdateData.complexCaseData;
      
      // CRITICAL: Remove patient_id from update data - it should never be updated
      // patient_id is set during creation and should remain constant
      delete proformaUpdateData.patient_id;
      delete proformaUpdateData.id; // Also remove id if present
      delete proformaUpdateData.filled_by; // filled_by should not be updated via this endpoint
      
      // Define fields that are integers in the database (to handle empty strings properly)
      const integerFields = ['assigned_doctor']; // Add any other integer fields here
      
      // Sanitize update data: convert empty strings to null for fields that might cause issues
      // This prevents "invalid input syntax for type integer" errors
      const sanitizedUpdateData = {};
      for (const [key, value] of Object.entries(proformaUpdateData)) {
        // Skip undefined values (they won't be updated)
        if (value === undefined) {
          continue;
        }
        
        // Convert empty strings to null (PostgreSQL handles null better than empty strings)
        // This is especially important for integer/numeric fields
        if (value === '' || (typeof value === 'string' && value.trim() === '')) {
          sanitizedUpdateData[key] = null;
        } else if (integerFields.includes(key)) {
          // For integer fields, ensure we have a valid integer or null
          const intValue = parseInt(value, 10);
          if (isNaN(intValue) || intValue <= 0) {
            sanitizedUpdateData[key] = null;
          } else {
            sanitizedUpdateData[key] = intValue;
          }
        } else {
          sanitizedUpdateData[key] = value;
        }
      }
      
      // Update the clinical proforma (without ADL data)
      await proforma.update(sanitizedUpdateData);

      // ✅ Handle ADL file creation/update if complex case
      let adlFile = null;
      let adlFileUpdated = false;

      if (isComplexCase) {
        try {
          // Check if ADL file already exists for this clinical_proforma
          if (proforma.adl_file_id) {
            try {
            adlFile = await ADLFile.findById(proforma.adl_file_id);
            if (adlFile) {
                console.log(`[updateClinicalProforma] ✅ Found existing ADL file ${adlFile.id}`);
                
                // If complex case data provided, update the ADL file
                if (Object.keys(complexCaseData).length > 0) {
              await adlFile.update(complexCaseData);
              adlFileUpdated = true;
                  console.log(`[updateClinicalProforma] ✅ Updated existing ADL file ${adlFile.id}`);
                }
                
                // ✅ Ensure patient status is updated (has_adl_file=true, case_complexity=complex)
                try {
                  const patient = await Patient.findById(proforma.patient_id);
                  if (patient) {
                    await patient.update({
                      has_adl_file: true,
                      case_complexity: 'complex'
                    });
                    console.log(`[updateClinicalProforma] ✅ Updated patient ${proforma.patient_id} status (existing ADL file)`);
                  }
                } catch (patientUpdateError) {
                  console.error('[updateClinicalProforma] ❌ Failed to update patient status:', patientUpdateError);
                }
              }
            } catch (err) {
              console.warn(`[updateClinicalProforma] Could not fetch existing ADL file: ${err.message}`);
            }
          }
          
          // Create new ADL file if it doesn't exist or changing to complex case
          if (!adlFile && (changingToComplexCase || !proforma.adl_file_id)) {
            // Auto-generate ADL number if not provided
            let nextAdlNo = req.body.adl_no;
            if (!nextAdlNo) {
              nextAdlNo = Patient.generateADLNo();
              console.log(`[updateClinicalProforma] ✅ Auto-generated ADL number: ${nextAdlNo}`);
            }

            // Prepare ADL data
            const adlData = {
              patient_id: proforma.patient_id,
              adl_no: nextAdlNo,
              created_by: proforma.filled_by,
              clinical_proforma_id: proforma.id, // ✅ Link to existing clinical_proforma
              file_status: 'created',
              file_created_date: ClinicalController.sanitizeDateField(proformaUpdateData.visit_date) || ClinicalController.sanitizeDateField(proforma.visit_date) || new Date().toISOString().split('T')[0],
              total_visits: 1,
              // is_active has a default value in the table, so we don't need to include it
              ...complexCaseData // All ADL-specific fields
            };
            
            // Ensure JSONB fields are arrays
            const jsonbFields = ['informants', 'complaints_patient', 'complaints_informant', 
              'family_history_siblings', 'premorbid_personality_traits', 'occupation_jobs', 
              'sexual_children', 'living_residents', 'living_inlaws'];
            
            jsonbFields.forEach(field => {
              if (adlData[field] !== undefined && adlData[field] !== null) {
                if (!Array.isArray(adlData[field])) {
                  if (typeof adlData[field] === 'string') {
                    try {
                      adlData[field] = JSON.parse(adlData[field]);
                    } catch {
                      adlData[field] = [];
                    }
                  } else {
                    adlData[field] = [];
                  }
                }
              } else {
                adlData[field] = [];
              }
            });

            adlFile = await ADLFile.create(adlData);
            if (!adlFile || !adlFile.id) {
              throw new Error('ADL file creation returned no ID');
            }

            // ✅ Update clinical_proforma with adl_file_id (bidirectional link)
            await db.query(
              'UPDATE clinical_proforma SET adl_file_id = $1 WHERE id = $2',
              [adlFile.id, proforma.id]
            );

            adlFileUpdated = true;
            console.log(`[updateClinicalProforma] ✅ Created ADL file ${adlFile.id} and linked to clinical_proforma ${proforma.id}`);
            
            // ✅ Update patient record to reflect complex case status
            try {
              const patient = await Patient.findById(proforma.patient_id);
              if (patient) {
                await patient.update({
                  has_adl_file: true,
                  case_complexity: 'complex'
                });
                console.log(`[updateClinicalProforma] ✅ Updated patient ${proforma.patient_id} - has_adl_file=true, case_complexity=complex`);
              }
            } catch (patientUpdateError) {
              console.error('[updateClinicalProforma] ❌ Failed to update patient status:', patientUpdateError);
              // Non-critical error - continue
            }
          }
        } catch (adlError) {
          console.error('[updateClinicalProforma] ❌ Error handling ADL file:', adlError);
          // Don't fail the entire update, but log the error
          // The clinical_proforma update already succeeded, so we continue
        }
      }

      // Handle prescriptions update
      let updatedPrescriptions = [];
      if (prescriptions !== undefined && Array.isArray(prescriptions)) {
        try {
          // Delete existing prescriptions for this proforma
          await Prescription.deleteByClinicalProformaId(proforma.id);
          
          // Create new prescriptions if any were provided
          if (prescriptions.length > 0) {
            // Ensure patient_id is an integer
            const patientIdInt = parseInt(proforma.patient_id);
            if (isNaN(patientIdInt)) {
              throw new Error("Invalid patient_id: must be an integer");
            }
            
            const prescription = await Prescription.create({
              patient_id: patientIdInt,
              clinical_proforma_id: proforma.id,
              prescription: prescriptions
            });
            updatedPrescriptions = [prescription];
          }
        } catch (prescriptionError) {
          console.error('Failed to update prescriptions:', prescriptionError);
          // Don't fail the entire request, just log the error
        }
      }

      // Refresh proforma to get latest data (including adl_file_id if updated)
      const updatedProforma = await ClinicalProforma.findById(proforma.id);

      // Refresh ADL file if it exists
      if (adlFile && adlFile.id) {
        try {
          adlFile = await ADLFile.findById(adlFile.id);
        } catch (err) {
          console.warn(`[updateClinicalProforma] Could not refresh ADL file: ${err.message}`);
        }
      } else if (updatedProforma?.adl_file_id) {
        try {
          adlFile = await ADLFile.findById(updatedProforma.adl_file_id);
        } catch (err) {
          console.warn(`[updateClinicalProforma] Could not fetch ADL file: ${err.message}`);
        }
      }

      // ✅ Return combined response matching createClinicalProforma format
      res.status(200).json({
        success: true,
        message: 'Clinical proforma updated successfully',
        data: {
          clinical_proforma: updatedProforma ? updatedProforma.toJSON() : proforma.toJSON(),
          adl_file: adlFile ? adlFile.toJSON() : null, // Full ADL file data for frontend
          prescriptions: updatedPrescriptions.length > 0 ? {
            count: updatedPrescriptions.length,
            prescriptions: updatedPrescriptions.map(p => p.toJSON())
          } : null
        }
      });
    } catch (error) {
      console.error('Update clinical proforma error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update clinical proforma',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Delete clinical proforma
  static async deleteClinicalProforma(req, res) {
    try {
      const { id } = req.params;
      const proforma = await ClinicalProforma.findById(id);

      if (!proforma) {
        return res.status(404).json({
          success: false,
          message: 'Clinical proforma not found'
        });
      }

      // Allow the doctor who created the proforma, Admin, or Faculty/Resident roles to delete
      const isCreator = proforma.filled_by === req.user.id;
      const isAdmin = req.user.role === 'Admin';
      const isResident = req.user.role === 'Resident';
      const isFaculty = req.user.role === 'Faculty';
      
      if (!isCreator && !isAdmin && !isResident && !isFaculty) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only delete proformas if you created them, or if you are an Admin, Faculty, or Resident.'
        });
      }

      await proforma.delete();

      res.json({
        success: true,
        message: 'Clinical proforma deleted successfully'
      });
    } catch (error) {
      console.error('Delete clinical proforma error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete clinical proforma',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get clinical proforma statistics
  static async getClinicalStats(req, res) {
    try {
      const stats = await ClinicalProforma.getStats();

      res.json({
        success: true,
        data: {
          stats
        }
      });
    } catch (error) {
      console.error('Get clinical stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get clinical statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get cases by decision
  static async getCasesByDecision(req, res) {
    try {
      const user_id = req.query.user_id ? parseInt(req.query.user_id, 10) : null;
      
      let filteredStats;
      if (user_id) {
        // Get proformas by user and group by decision
        const db = require('../config/database');
        const result = await db.query(`
          SELECT 
            doctor_decision,
            COUNT(*) as count
          FROM clinical_proforma 
          WHERE doctor_decision IS NOT NULL AND filled_by = $1
          GROUP BY doctor_decision
          ORDER BY count DESC
        `, [user_id]);
        filteredStats = result.rows;
      } else {
        // Get all stats
        filteredStats = await ClinicalProforma.getCasesByDecision();
      }

      res.json({
        success: true,
        data: {
          decisionStats: filteredStats || []
        }
      });
    } catch (error) {
      console.error('Get cases by decision error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Failed to get decision statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  static async getVisitTrends(req, res) {
    try {
      const period = req.query.period || 'week'; // day, week, month
      const user_id = req.query.user_id ? parseInt(req.query.user_id, 10) : null;
      
      // Validate period
      if (!['day', 'week', 'month'].includes(period)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid period. Must be day, week, or month'
        });
      }

      const trends = await ClinicalProforma.getVisitTrends(period, user_id);

      res.json({
        success: true,
        data: {
          trends: trends || []
        }
      });
    } catch (error) {
      console.error('Get visit trends error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Failed to get visit trends',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get proformas created by current doctor
  static async getMyProformas(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        filled_by: req.user.id
      };

      const result = await ClinicalProforma.findAll(page, limit, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get my proformas error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get your proformas',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get complex cases requiring ADL files
  static async getComplexCases(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        doctor_decision: 'complex_case',
        requires_adl_file: true
      };

      const result = await ClinicalProforma.findAll(page, limit, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get complex cases error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get complex cases',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = ClinicalController;
