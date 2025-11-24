const express = require('express');
const router = express.Router();
const ClinicalController = require('../controllers/clinicalController');
const { authenticateToken, requireDoctor, requireAdmin, authorizeRoles } = require('../middleware/auth');
const ClinicalOptionsController = require('../controllers/clinicalOptionsController');
const {
  validateClinicalProforma,
  validateId,
  validatePagination
} = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     ClinicalProforma:
 *       type: object
 *       required:
 *         - patient_id
 *         - visit_date
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated proforma ID
 *         patient_id:
 *           type: integer
 *           description: Patient ID
 *         filled_by:
 *           type: integer
 *           description: Doctor user ID who filled the proforma
 *         visit_date:
 *           type: string
 *           format: date
 *           description: Visit date
 *         visit_type:
 *           type: string
 *           enum: [first_visit, follow_up]
 *           description: Type of visit
 *         room_no:
 *           type: string
 *           maxLength: 10
 *         assigned_doctor:
 *           type: integer
 *           description: Doctor assigned to the patient for this visit (references users.id)
 *         informant_present:
 *           type: boolean
 *         nature_of_information:
 *           type: string
 *           maxLength: 50
 *         onset_duration:
 *           type: string
 *           maxLength: 50
 *         course:
 *           type: string
 *           maxLength: 50
 *         precipitating_factor:
 *           type: string
 *         illness_duration:
 *           type: string
 *           maxLength: 100
 *         current_episode_since:
 *           type: string
 *           format: date
 *         mood:
 *           type: string
 *         behaviour:
 *           type: string
 *         speech:
 *           type: string
 *         thought:
 *           type: string
 *         perception:
 *           type: string
 *         somatic:
 *           type: string
 *         bio_functions:
 *           type: string
 *         adjustment:
 *           type: string
 *         cognitive_function:
 *           type: string
 *         fits:
 *           type: string
 *         sexual_problem:
 *           type: string
 *         substance_use:
 *           type: string
 *         past_history:
 *           type: string
 *         family_history:
 *           type: string
 *         associated_medical_surgical:
 *           type: string
 *         mse_behaviour:
 *           type: string
 *         mse_affect:
 *           type: string
 *         mse_thought:
 *           type: string
 *         mse_delusions:
 *           type: string
 *         mse_perception:
 *           type: string
 *         mse_cognitive_function:
 *           type: string
 *         gpe:
 *           type: string
 *         diagnosis:
 *           type: string
 *         icd_code:
 *           type: string
 *           maxLength: 20
 *         disposal:
 *           type: string
 *         workup_appointment:
 *           type: string
 *           format: date
 *         referred_to:
 *           type: string
 *         treatment_prescribed:
 *           type: string
 *           description: Plain text prescription (legacy field, also auto-generated from prescriptions array)
 *         prescriptions:
 *           type: array
 *           description: Array of prescription objects (when provided, creates entries in prescriptions table linked via clinical_proforma_id). Each prescription object should contain medicine, dosage, when, frequency, duration, qty, details, and notes fields.
 *           items:
 *             type: object
 *             properties:
 *               medicine:
 *                 type: string
 *                 description: Name of the medication (required)
 *               dosage:
 *                 type: string
 *                 description: Dosage instructions (e.g., 1-0-1, 500mg)
 *               when:
 *                 type: string
 *                 description: When to take (e.g., before/after food, morning, evening)
 *               frequency:
 *                 type: string
 *                 description: Frequency (e.g., daily, twice daily, SOS)
 *               duration:
 *                 type: string
 *                 description: Duration (e.g., 5 days, 1 month)
 *               qty:
 *                 type: string
 *                 description: Quantity prescribed
 *               details:
 *                 type: string
 *                 description: Additional details
 *               notes:
 *                 type: string
 *                 description: Additional notes or instructions
 *           note: Prescriptions are stored in a separate 'prescriptions' table with a foreign key relationship to clinical_proforma. Use /api/prescriptions endpoints for CRUD operations.
 *         doctor_decision:
 *           type: string
 *           enum: [simple_case, complex_case]
 *         case_severity:
 *           type: string
 *           enum: [mild, moderate, severe, critical]
 *         requires_adl_file:
 *           type: boolean
 *         adl_reasoning:
 *           type: string
     *         adl_file_id:
     *           type: integer
     *           description: Reference to ADL file for complex cases (set automatically by backend when doctor_decision is complex_case). All complex case data is stored in the ADL file, not in clinical_proforma.
 *         created_at:
 *           type: string
 *           format: date-time
 *         patient_name:
 *           type: string
 *           description: Patient name (from join)
 *         cr_no:
 *           type: string
 *           description: CR number (from join)
 *         psy_no:
 *           type: string
 *           description: PSY number (from join)
 *         doctor_name:
 *           type: string
 *           description: Doctor name (from join)
 *         doctor_role:
 *           type: string
 *           description: Doctor role (from join)
 *     
 *     ClinicalProformaCreate:
 *       type: object
 *       required:
 *         - patient_id
 *         - visit_date
 *       properties:
 *         patient_id:
 *           type: integer
 *         visit_date:
 *           type: string
 *           format: date
 *         assigned_doctor:
 *           type: integer
 *           description: Doctor assigned to the patient for this visit (references users.id)
 *         visit_type:
 *           type: string
 *           enum: [first_visit, follow_up]
 *         room_no:
 *           type: string
 *         adl_file_id:
 *           type: integer
 *           description: Reference to ADL file for complex cases (set automatically by backend, optional)
 *         informant_present:
 *           type: boolean
 *         nature_of_information:
 *           type: string
 *         onset_duration:
 *           type: string
 *         course:
 *           type: string
 *         precipitating_factor:
 *           type: string
 *         illness_duration:
 *           type: string
 *         current_episode_since:
 *           type: string
 *           format: date
 *         mood:
 *           type: string
 *         behaviour:
 *           type: string
 *         speech:
 *           type: string
 *         thought:
 *           type: string
 *         perception:
 *           type: string
 *         somatic:
 *           type: string
 *         bio_functions:
 *           type: string
 *         adjustment:
 *           type: string
 *         cognitive_function:
 *           type: string
 *         fits:
 *           type: string
 *         sexual_problem:
 *           type: string
 *         substance_use:
 *           type: string
 *         past_history:
 *           type: string
 *         family_history:
 *           type: string
 *         associated_medical_surgical:
 *           type: string
 *         mse_behaviour:
 *           type: string
 *         mse_affect:
 *           type: string
 *         mse_thought:
 *           type: string
 *         mse_delusions:
 *           type: string
 *         mse_perception:
 *           type: string
 *         mse_cognitive_function:
 *           type: string
 *         gpe:
 *           type: string
 *         diagnosis:
 *           type: string
 *         icd_code:
 *           type: string
 *         disposal:
 *           type: string
 *         workup_appointment:
 *           type: string
 *           format: date
 *         referred_to:
 *           type: string
 *         treatment_prescribed:
 *           type: string
 *           description: Plain text prescription (legacy field, also auto-generated from prescriptions array)
 *         prescriptions:
 *           type: array
 *           description: Array of prescription objects (when provided, creates entries in prescriptions table linked via clinical_proforma_id). Each prescription object should contain medicine, dosage, when, frequency, duration, qty, details, and notes fields.
 *           items:
 *             type: object
 *             properties:
 *               medicine:
 *                 type: string
 *                 description: Name of the medication (required)
 *               dosage:
 *                 type: string
 *                 description: Dosage instructions (e.g., 1-0-1, 500mg)
 *               when:
 *                 type: string
 *                 description: When to take (e.g., before/after food, morning, evening)
 *               frequency:
 *                 type: string
 *                 description: Frequency (e.g., daily, twice daily, SOS)
 *               duration:
 *                 type: string
 *                 description: Duration (e.g., 5 days, 1 month)
 *               qty:
 *                 type: string
 *                 description: Quantity prescribed
 *               details:
 *                 type: string
 *                 description: Additional details
 *               notes:
 *                 type: string
 *                 description: Additional notes or instructions
 *           note: Prescriptions are stored in a separate 'prescriptions' table with a foreign key relationship to clinical_proforma. Use /api/prescriptions endpoints for CRUD operations.
 *         doctor_decision:
 *           type: string
 *           enum: [simple_case, complex_case]
 *         case_severity:
 *           type: string
 *           enum: [mild, moderate, severe, critical]
 *         requires_adl_file:
 *           type: boolean
 *         adl_reasoning:
 *           type: string
 *         # History of Present Illness - Expanded
 *         history_narrative:
 *           type: string
 *         history_specific_enquiry:
 *           type: string
 *         history_drug_intake:
 *           type: string
 *         history_treatment_place:
 *           type: string
 *         history_treatment_dates:
 *           type: string
 *         history_treatment_drugs:
 *           type: string
 *         history_treatment_response:
 *           type: string
 *         # Multiple Informants (JSON array)
 *         informants:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               relationship:
 *                 type: string
 *               name:
 *                 type: string
 *               reliability:
 *                 type: string
 *         # Complaints and Duration (JSON arrays)
 *         complaints_patient:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               complaint:
 *                 type: string
 *               duration:
 *                 type: string
 *         complaints_informant:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               complaint:
 *                 type: string
 *               duration:
 *                 type: string
 *         # Past History - Detailed
 *         past_history_medical:
 *           type: string
 *         past_history_psychiatric_dates:
 *           type: string
 *         past_history_psychiatric_diagnosis:
 *           type: string
 *         past_history_psychiatric_treatment:
 *           type: string
 *         past_history_psychiatric_interim:
 *           type: string
 *         past_history_psychiatric_recovery:
 *           type: string
 *         # Family History - Detailed
 *         family_history_father_age:
 *           type: string
 *         family_history_father_education:
 *           type: string
 *         family_history_father_occupation:
 *           type: string
 *         family_history_father_personality:
 *           type: string
 *         family_history_father_deceased:
 *           type: boolean
 *         family_history_father_death_age:
 *           type: string
 *         family_history_father_death_date:
 *           type: string
 *           format: date
 *         family_history_father_death_cause:
 *           type: string
 *         family_history_mother_age:
 *           type: string
 *         family_history_mother_education:
 *           type: string
 *         family_history_mother_occupation:
 *           type: string
 *         family_history_mother_personality:
 *           type: string
 *         family_history_mother_deceased:
 *           type: boolean
 *         family_history_mother_death_age:
 *           type: string
 *         family_history_mother_death_date:
 *           type: string
 *           format: date
 *         family_history_mother_death_cause:
 *           type: string
 *         family_history_siblings:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               age:
 *                 type: string
 *               sex:
 *                 type: string
 *               education:
 *                 type: string
 *               occupation:
 *                 type: string
 *               marital_status:
 *                 type: string
 *         # Diagnostic Formulation
 *         diagnostic_formulation_summary:
 *           type: string
 *         diagnostic_formulation_features:
 *           type: string
 *         diagnostic_formulation_psychodynamic:
 *           type: string
 *         # Premorbid Personality
 *         premorbid_personality_passive_active:
 *           type: string
 *         premorbid_personality_assertive:
 *           type: string
 *         premorbid_personality_introvert_extrovert:
 *           type: string
 *         premorbid_personality_traits:
 *           type: array
 *           items:
 *             type: string
 *         premorbid_personality_hobbies:
 *           type: string
 *         premorbid_personality_habits:
 *           type: string
 *         premorbid_personality_alcohol_drugs:
 *           type: string
 *         # Physical Examination - Comprehensive
 *         physical_appearance:
 *           type: string
 *         physical_body_build:
 *           type: string
 *         physical_pallor:
 *           type: boolean
 *         physical_icterus:
 *           type: boolean
 *         physical_oedema:
 *           type: boolean
 *         physical_lymphadenopathy:
 *           type: boolean
 *         physical_pulse:
 *           type: string
 *         physical_bp:
 *           type: string
 *         physical_height:
 *           type: string
 *         physical_weight:
 *           type: string
 *         physical_waist:
 *           type: string
 *         physical_fundus:
 *           type: string
 *         physical_cvs_apex:
 *           type: string
 *         physical_cvs_regularity:
 *           type: string
 *         physical_cvs_heart_sounds:
 *           type: string
 *         physical_cvs_murmurs:
 *           type: string
 *         physical_chest_expansion:
 *           type: string
 *         physical_chest_percussion:
 *           type: string
 *         physical_chest_adventitious:
 *           type: string
 *         physical_abdomen_tenderness:
 *           type: string
 *         physical_abdomen_mass:
 *           type: string
 *         physical_abdomen_bowel_sounds:
 *           type: string
 *         physical_cns_cranial:
 *           type: string
 *         physical_cns_motor_sensory:
 *           type: string
 *         physical_cns_rigidity:
 *           type: string
 *         physical_cns_involuntary:
 *           type: string
 *         physical_cns_superficial_reflexes:
 *           type: string
 *         physical_cns_dtrs:
 *           type: string
 *         physical_cns_plantar:
 *           type: string
 *         physical_cns_cerebellar:
 *           type: string
 *         # Mental Status Examination - Expanded
 *         mse_general_demeanour:
 *           type: string
 *         mse_general_tidy:
 *           type: string
 *         mse_general_awareness:
 *           type: string
 *         mse_general_cooperation:
 *           type: string
 *         mse_psychomotor_verbalization:
 *           type: string
 *         mse_psychomotor_pressure:
 *           type: string
 *         mse_psychomotor_tension:
 *           type: string
 *         mse_psychomotor_posture:
 *           type: string
 *         mse_psychomotor_mannerism:
 *           type: string
 *         mse_psychomotor_catatonic:
 *           type: string
 *         mse_affect_subjective:
 *           type: string
 *         mse_affect_tone:
 *           type: string
 *         mse_affect_resting:
 *           type: string
 *         mse_affect_fluctuation:
 *           type: string
 *         mse_thought_flow:
 *           type: string
 *         mse_thought_form:
 *           type: string
 *         mse_thought_content:
 *           type: string
 *         mse_cognitive_consciousness:
 *           type: string
 *         mse_cognitive_orientation_time:
 *           type: string
 *         mse_cognitive_orientation_place:
 *           type: string
 *         mse_cognitive_orientation_person:
 *           type: string
 *         mse_cognitive_memory_immediate:
 *           type: string
 *         mse_cognitive_memory_recent:
 *           type: string
 *         mse_cognitive_memory_remote:
 *           type: string
 *         mse_cognitive_subtraction:
 *           type: string
 *         mse_cognitive_digit_span:
 *           type: string
 *         mse_cognitive_counting:
 *           type: string
 *         mse_cognitive_general_knowledge:
 *           type: string
 *         mse_cognitive_calculation:
 *           type: string
 *         mse_cognitive_similarities:
 *           type: string
 *         mse_cognitive_proverbs:
 *           type: string
 *         mse_insight_understanding:
 *           type: string
 *         mse_insight_judgement:
 *           type: string
 *         # Educational History
 *         education_start_age:
 *           type: string
 *         education_highest_class:
 *           type: string
 *         education_performance:
 *           type: string
 *         education_disciplinary:
 *           type: string
 *         education_peer_relationship:
 *           type: string
 *         education_hobbies:
 *           type: string
 *         education_special_abilities:
 *           type: string
 *         education_discontinue_reason:
 *           type: string
 *         # Occupational History (JSON array)
 *         occupation_jobs:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               job:
 *                 type: string
 *               dates:
 *                 type: string
 *               adjustment:
 *                 type: string
 *               difficulties:
 *                 type: string
 *               promotions:
 *                 type: string
 *               change_reason:
 *                 type: string
 *         # Sexual and Marital History
 *         sexual_menarche_age:
 *           type: string
 *         sexual_menarche_reaction:
 *           type: string
 *         sexual_education:
 *           type: string
 *         sexual_masturbation:
 *           type: string
 *         sexual_contact:
 *           type: string
 *         sexual_premarital_extramarital:
 *           type: string
 *         sexual_marriage_arranged:
 *           type: string
 *         sexual_marriage_date:
 *           type: string
 *           format: date
 *         sexual_spouse_age:
 *           type: string
 *         sexual_spouse_occupation:
 *           type: string
 *         sexual_adjustment_general:
 *           type: string
 *         sexual_adjustment_sexual:
 *           type: string
 *         sexual_children:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               age:
 *                 type: string
 *               sex:
 *                 type: string
 *               sexual_problems:
 *                 type: string
 *         sexual_problems:
 *           type: string
 *         # Religion
 *         religion_type:
 *           type: string
 *         religion_participation:
 *           type: string
 *         religion_changes:
 *           type: string
 *         # Present Living Situation
 *         living_residents:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               relationship:
 *                 type: string
 *               age:
 *                 type: string
 *         living_income_sharing:
 *           type: string
 *         living_expenses:
 *           type: string
 *         living_kitchen:
 *           type: string
 *         living_domestic_conflicts:
 *           type: string
 *         living_social_class:
 *           type: string
 *         living_inlaws:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               relationship:
 *                 type: string
 *               age:
 *                 type: string
 *         # General Home Situation and Early Development
 *         home_situation_childhood:
 *           type: string
 *         home_situation_parents_relationship:
 *           type: string
 *         home_situation_socioeconomic:
 *           type: string
 *         home_situation_interpersonal:
 *           type: string
 *         personal_birth_date:
 *           type: string
 *           format: date
 *         personal_birth_place:
 *           type: string
 *         personal_delivery_type:
 *           type: string
 *         personal_complications_prenatal:
 *           type: string
 *         personal_complications_natal:
 *           type: string
 *         personal_complications_postnatal:
 *           type: string
 *         development_weaning_age:
 *           type: string
 *         development_first_words:
 *           type: string
 *         development_three_words:
 *           type: string
 *         development_walking:
 *           type: string
 *         development_neurotic_traits:
 *           type: string
 *         development_nail_biting:
 *           type: string
 *         development_bedwetting:
 *           type: string
 *         development_phobias:
 *           type: string
 *         development_childhood_illness:
 *           type: string
 *         # Provisional Diagnosis and Treatment Plan
 *         provisional_diagnosis:
 *           type: string
 *         treatment_plan:
 *           type: string
 *         # Comments of the Consultant
 *         consultant_comments:
 *           type: string
 */

// Doctor-only routes (JR/SR)
/**
 * @swagger
 * /api/clinical-proformas:
 *   post:
     *     summary: Create a new clinical proforma (Admin, JR/SR Doctor only)
     *     description: |
     *       Creates a new clinical proforma with comprehensive patient data.
     *       
     *       **Complex Case Handling:**
     *       - When `doctor_decision` is set to `complex_case`, the system automatically:
 *         1. Creates the clinical_proforma record first (with `adl_file_id` as null)
 *         2. Extracts all complex case fields from the request body
 *         3. Creates an ADL file with all complex case data stored in the `adl_files` table
 *         4. Sets `adl_files.clinical_proforma_id` to reference the created clinical_proforma
 *         5. Updates `clinical_proforma.adl_file_id` to reference the created ADL file (bidirectional linking)
 *         6. **Automatically updates patient record**: Sets `patient.has_adl_file = true` and `patient.case_complexity = 'complex'`
 *         7. Sets `requires_adl_file` to `true` automatically
 *         8. **Transaction-based flow**: If ADL creation or linking fails, the clinical_proforma is rolled back (deleted)
     *       
     *       - For `simple_case`: Only basic proforma data is stored in `clinical_proforma` table (no ADL file created, complex case fields are ignored)
     *       
     *       **Data Storage:**
     *       - Basic proforma fields: Stored in `clinical_proforma` table
     *       - Complex case fields (when `doctor_decision` = `complex_case`): Stored in `adl_files` table
     *       - Complex case fields include: history_narrative, informants, past_history_*, family_history_*, physical_*, mse_*, education_*, occupation_jobs, sexual_*, religion_*, living_*, home_situation_*, personal_*, development_*, provisional_diagnosis, treatment_plan, consultant_comments
 *       
 *       **Patient Status Auto-Update:**
 *       - When an ADL file is created for a complex case, the patient's status is automatically updated:
 *         - `patient.has_adl_file` is set to `true`
 *         - `patient.case_complexity` is set to `'complex'`
 *       - This ensures patient status is consistent across the system
     *       
     *       **Note:** All complex case fields can be included in the request body. They will be automatically routed to the appropriate table based on `doctor_decision`.
 *     tags: [Walk-in Clinical Proforma]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClinicalProformaCreate'
 *           examples:
 *             simple_case:
 *               summary: Simple case example
 *               value:
 *                 patient_id: 1
 *                 visit_date: "2024-01-15"
 *                 visit_type: "first_visit"
 *                 assigned_doctor: 5
 *                 room_no: "Room 101"
 *                 doctor_decision: "simple_case"
 *                 case_severity: "mild"
 *             complex_case:
 *               summary: Complex case example (triggers ADL file creation)
 *               value:
 *                 patient_id: 1
 *                 visit_date: "2024-01-15"
 *                 visit_type: "first_visit"
 *                 assigned_doctor: 5
 *                 room_no: "Room 101"
 *                 doctor_decision: "complex_case"
 *                 case_severity: "severe"
 *                 requires_adl_file: true
 *                 adl_reasoning: "Patient requires comprehensive ADL assessment due to complex psychiatric presentation"
 *     responses:
 *       201:
 *         description: Clinical proforma created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Clinical proforma created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     clinical_proforma:
 *                       $ref: '#/components/schemas/ClinicalProforma'
 *                       description: The created clinical proforma record
 *                     adl_file:
 *                       $ref: '#/components/schemas/ADLFile'
 *                       description: The created ADL file (only present when doctor_decision is 'complex_case')
 *                       nullable: true
 *                 prescriptions:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 2
 *                     prescriptions:
 *                       type: array
 *                       items:
 *                         type: object
 *                   description: Prescription data if provided
 *             examples:
 *               simple_case:
 *                 summary: Simple case response
 *                 value:
 *                   success: true
 *                   message: "Clinical proforma created successfully"
 *                   data:
 *                     clinical_proforma:
 *                       id: 1
 *                       patient_id: 1
 *                       visit_date: "2024-01-15"
 *                       doctor_decision: "simple_case"
 *                       adl_file_id: null
 *                     adl_file: null
 *               complex_case:
 *                 summary: Complex case response with ADL file
 *                 value:
 *                   success: true
 *                   message: "Complex case with ADL file saved successfully"
 *                   data:
 *                     clinical_proforma:
 *                       id: 1
 *                       patient_id: 1
 *                       visit_date: "2024-01-15"
 *                       doctor_decision: "complex_case"
 *                       adl_file_id: 5
 *                     adl_file:
 *                       id: 5
 *                       patient_id: 1
 *                       clinical_proforma_id: 1
 *                       adl_no: "ADL-2024-001"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin or Faculty/Resident access required
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error (or transaction rollback if ADL creation fails)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to handle ADL file for complex case"
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 */
router.post('/', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateClinicalProforma, ClinicalController.createClinicalProforma);

/**
 * @swagger
 * /api/clinical-proformas/my-proformas:
 *   get:
 *     summary: Get proformas created by current doctor
 *     tags: [Walk-in Clinical Proforma]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of proformas per page
 *     responses:
 *       200:
 *         description: Proformas retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Doctor access required
 *       500:
 *         description: Server error
 */
router.get('/my-proformas', authenticateToken, requireDoctor, validatePagination, ClinicalController.getMyProformas);

/**
 * @swagger
 * /api/clinical-proformas/complex-cases:
 *   get:
 *     summary: Get complex cases requiring ADL files
 *     tags: [Walk-in Clinical Proforma]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of proformas per page
 *     responses:
 *       200:
 *         description: Complex cases retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/complex-cases', authenticateToken, validatePagination, ClinicalController.getComplexCases);

// Protected routes (Doctor and Admin)
/**
 * @swagger
 * /api/clinical-proformas:
 *   get:
 *     summary: Get all clinical proformas with pagination and filters
 *     tags: [Walk-in Clinical Proforma]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of proformas per page
 *       - in: query
 *         name: visit_type
 *         schema:
 *           type: string
 *           enum: [first_visit, follow_up]
 *         description: Filter by visit type
 *       - in: query
 *         name: doctor_decision
 *         schema:
 *           type: string
 *           enum: [simple_case, complex_case]
 *         description: Filter by doctor decision
 *       - in: query
 *         name: case_severity
 *         schema:
 *           type: string
 *           enum: [mild, moderate, severe, critical]
 *         description: Filter by case severity
 *       - in: query
 *         name: requires_adl_file
 *         schema:
 *           type: boolean
 *         description: Filter by ADL file requirement
 *       - in: query
 *         name: filled_by
 *         schema:
 *           type: integer
 *         description: Filter by doctor who filled the proforma
 *       - in: query
 *         name: room_no
 *         schema:
 *           type: string
 *         description: Filter by room number
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *     responses:
 *       200:
 *         description: Proformas retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, validatePagination, ClinicalController.getAllClinicalProformas);

/**
 * @swagger
 * /api/clinical-proformas/stats:
 *   get:
 *     summary: Get clinical proforma statistics
 *     tags: [Walk-in Clinical Proforma]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/stats', authenticateToken, requireAdmin, ClinicalController.getClinicalStats);

/**
 * @swagger
 * /api/clinical-proformas/decision-stats:
 *   get:
 *     summary: Get cases by decision statistics
 *     tags: [Walk-in Clinical Proforma]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Decision statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/decision-stats', authenticateToken, ClinicalController.getCasesByDecision);

/**
 * @swagger
 * /api/clinical-proformas/visit-trends:
 *   get:
 *     summary: Get visit trends by period
 *     tags: [Walk-in Clinical Proforma]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: week
 *         description: Time period for trends
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by user ID (optional)
 *     responses:
 *       200:
 *         description: Visit trends retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/visit-trends', authenticateToken, ClinicalController.getVisitTrends);

/**
 * @swagger
 * /api/clinical-proformas/{id}:
 *   get:
 *     summary: Get clinical proforma by ID
 *     tags: [Walk-in Clinical Proforma]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Proforma ID
 *     responses:
 *       200:
 *         description: Proforma retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Proforma not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, validateId, ClinicalController.getClinicalProformaById);

/**
 * @swagger
 * /api/clinical-proformas/{id}:
 *   put:
 *     summary: Update clinical proforma
 *     description: |
 *       Updates an existing clinical proforma with comprehensive patient data.
 *       
 *       **Complex Case Handling:**
 *       - When `doctor_decision` is set to `complex_case`, the system automatically:
 *         1. Checks if an ADL file already exists for this clinical_proforma
 *         2. If ADL file exists: Updates the existing ADL file with complex case data
 *         3. If ADL file doesn't exist: Creates a new ADL file with complex case data
 *         4. Sets `adl_files.clinical_proforma_id` to reference the clinical_proforma
 *         5. Updates `clinical_proforma.adl_file_id` to reference the ADL file (bidirectional linking)
 *         6. **Automatically updates patient record**: Sets `patient.has_adl_file = true` and `patient.case_complexity = 'complex'`
 *       
 *       - When updating from `simple_case` to `complex_case`: A new ADL file is automatically created
 *       - When updating from `complex_case` to `simple_case`: The ADL file remains but is not updated
 *       
 *       **Patient Status Auto-Update:**
 *       - When an ADL file is created or updated for a complex case, the patient's status is automatically updated:
 *         - `patient.has_adl_file` is set to `true`
 *         - `patient.case_complexity` is set to `'complex'`
 *       - This ensures patient status is consistent across the system
 *     tags: [Walk-in Clinical Proforma]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Proforma ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               visit_date:
 *                 type: string
 *                 format: date
 *               visit_type:
 *                 type: string
 *                 enum: [first_visit, follow_up]
 *               room_no:
 *                 type: string
 *               informant_present:
 *                 type: boolean
 *               nature_of_information:
 *                 type: string
 *               onset_duration:
 *                 type: string
 *               course:
 *                 type: string
 *               precipitating_factor:
 *                 type: string
 *               illness_duration:
 *                 type: string
 *               current_episode_since:
 *                 type: string
 *                 format: date
 *               mood:
 *                 type: string
 *               behaviour:
 *                 type: string
 *               speech:
 *                 type: string
 *               thought:
 *                 type: string
 *               perception:
 *                 type: string
 *               somatic:
 *                 type: string
 *               bio_functions:
 *                 type: string
 *               adjustment:
 *                 type: string
 *               cognitive_function:
 *                 type: string
 *               fits:
 *                 type: string
 *               sexual_problem:
 *                 type: string
 *               substance_use:
 *                 type: string
 *               past_history:
 *                 type: string
 *               family_history:
 *                 type: string
 *               associated_medical_surgical:
 *                 type: string
 *               mse_behaviour:
 *                 type: string
 *               mse_affect:
 *                 type: string
 *               mse_thought:
 *                 type: string
 *               mse_delusions:
 *                 type: string
 *               mse_perception:
 *                 type: string
 *               mse_cognitive_function:
 *                 type: string
 *               gpe:
 *                 type: string
 *               diagnosis:
 *                 type: string
 *               icd_code:
 *                 type: string
 *               disposal:
 *                 type: string
 *               workup_appointment:
 *                 type: string
 *                 format: date
 *               referred_to:
 *                 type: string
 *               treatment_prescribed:
 *                 type: string
 *               doctor_decision:
 *                 type: string
 *                 enum: [simple_case, complex_case]
 *               case_severity:
 *                 type: string
 *                 enum: [mild, moderate, severe, critical]
 *               requires_adl_file:
 *                 type: boolean
 *               adl_reasoning:
 *                 type: string
 *     responses:
 *       200:
 *         description: Proforma updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Clinical proforma updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     clinical_proforma:
 *                       $ref: '#/components/schemas/ClinicalProforma'
 *                       description: The updated clinical proforma record
 *                     adl_file:
 *                       $ref: '#/components/schemas/ADLFile'
 *                       description: The associated ADL file (only present when doctor_decision is 'complex_case' and ADL file exists)
 *                       nullable: true
 *                     prescriptions:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         count:
 *                           type: integer
 *                         prescriptions:
 *                           type: array
 *                           items:
 *                             type: object
 *                       description: Prescription data if provided
 *             examples:
 *               simple_case:
 *                 summary: Simple case update response
 *                 value:
 *                   success: true
 *                   message: "Clinical proforma updated successfully"
 *                   data:
 *                     clinical_proforma:
 *                       id: 1
 *                       patient_id: 1
 *                       visit_date: "2024-01-15"
 *                       doctor_decision: "simple_case"
 *                       adl_file_id: null
 *                     adl_file: null
 *               complex_case:
 *                 summary: Complex case update response with ADL file
 *                 value:
 *                   success: true
 *                   message: "Clinical proforma updated successfully"
 *                   data:
 *                     clinical_proforma:
 *                       id: 1
 *                       patient_id: 1
 *                       visit_date: "2024-01-15"
 *                       doctor_decision: "complex_case"
 *                       adl_file_id: 5
 *                     adl_file:
 *                       id: 5
 *                       patient_id: 1
 *                       clinical_proforma_id: 1
 *                       adl_no: "ADL-2024-001"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied - can only update own proformas
 *       404:
 *         description: Proforma not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateToken, validateId, ClinicalController.updateClinicalProforma);

/**
 * @swagger
 * /api/clinical-proformas/{id}:
 *   delete:
 *     summary: Delete clinical proforma
 *     tags: [Walk-in Clinical Proforma]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Proforma ID
 *     responses:
 *       200:
 *         description: Proforma deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied - can only delete own proformas
 *       404:
 *         description: Proforma not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, validateId, ClinicalController.deleteClinicalProforma);

/**
 * @swagger
 * /api/clinical-proformas/patient/{patient_id}:
 *   get:
 *     summary: Get clinical proformas by patient ID
 *     tags: [Walk-in Clinical Proforma]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Proformas retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/patient/:patient_id', authenticateToken, ClinicalController.getClinicalProformaByPatientId);

// Dynamic clinical options
/**
 * @swagger
 * /api/clinical-proformas/options/{group}:
 *   get:
 *     summary: Get options for a clinical group
 *     tags: [Walk-in Clinical Proforma]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: group
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Options fetched
 */
router.get('/options/:group', authenticateToken, ClinicalOptionsController.getGroup);

/**
 * @swagger
 * /api/clinical-proformas/options/{group}:
 *   post:
 *     summary: Add an option to a clinical group
 *     tags: [Walk-in Clinical Proforma]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: group
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *     responses:
 *       201:
 *         description: Option added
 */
router.post('/options/:group', authenticateToken, ClinicalOptionsController.addOption);

/**
 * @swagger
 * /api/clinical-proformas/options/{group}:
 *   delete:
 *     summary: Delete an option from a clinical group
 *     tags: [Walk-in Clinical Proforma]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: group
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *     responses:
 *       200:
 *         description: Option deleted
 */
router.delete('/options/:group', authenticateToken, ClinicalOptionsController.deleteOption);

module.exports = router;
