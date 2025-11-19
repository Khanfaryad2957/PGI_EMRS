// const db = require('../config/database');

// class ADLFile {
//   constructor(data) {
//     this.id = data.id;
//     this.patient_id = data.patient_id;
//     this.adl_no = data.adl_no;
//     this.created_by = data.created_by;
//     this.clinical_proforma_id = data.clinical_proforma_id;
//     this.file_status = data.file_status;
//     this.physical_file_location = data.physical_file_location;
//     this.file_created_date = data.file_created_date;
//     this.last_accessed_date = data.last_accessed_date;
//     this.last_accessed_by = data.last_accessed_by;
//     this.total_visits = data.total_visits;
//     this.is_active = data.is_active;
//     this.notes = data.notes;
//     this.created_at = data.created_at;
//     this.updated_at = data.updated_at;
//     // Joined fields from patients table
//     this.patient_name = data.patient_name;
//     this.cr_no = data.cr_no;
//     this.psy_no = data.psy_no;
//     // Joined fields from users table (created by)
//     this.created_by_name = data.created_by_name;
//     this.created_by_role = data.created_by_role;
//     this.last_accessed_by_name = data.last_accessed_by_name;
//     // Joined fields from clinical_proforma table
//     this.assigned_doctor = data.assigned_doctor;
//     this.assigned_doctor_name = data.assigned_doctor_name;
//     this.assigned_doctor_role = data.assigned_doctor_role;
//     this.proforma_visit_date = data.proforma_visit_date;
    
//     // Complex Case Data Fields (moved from clinical_proforma)
//     // History of Present Illness - Expanded
//     this.history_narrative = data.history_narrative;
//     this.history_specific_enquiry = data.history_specific_enquiry;
//     this.history_drug_intake = data.history_drug_intake;
//     this.history_treatment_place = data.history_treatment_place;
//     this.history_treatment_dates = data.history_treatment_dates;
//     this.history_treatment_drugs = data.history_treatment_drugs;
//     this.history_treatment_response = data.history_treatment_response;
//     // Multiple Informants (JSONB)
//     this.informants = data.informants ? (typeof data.informants === 'string' ? JSON.parse(data.informants) : data.informants) : [];
//     // Complaints and Duration (JSONB)
//     this.complaints_patient = data.complaints_patient ? (typeof data.complaints_patient === 'string' ? JSON.parse(data.complaints_patient) : data.complaints_patient) : [];
//     this.complaints_informant = data.complaints_informant ? (typeof data.complaints_informant === 'string' ? JSON.parse(data.complaints_informant) : data.complaints_informant) : [];
//     // Past History - Detailed
//     this.past_history_medical = data.past_history_medical;
//     this.past_history_psychiatric_dates = data.past_history_psychiatric_dates;
//     this.past_history_psychiatric_diagnosis = data.past_history_psychiatric_diagnosis;
//     this.past_history_psychiatric_treatment = data.past_history_psychiatric_treatment;
//     this.past_history_psychiatric_interim = data.past_history_psychiatric_interim;
//     this.past_history_psychiatric_recovery = data.past_history_psychiatric_recovery;
//     // Family History - Detailed
//     this.family_history_father_age = data.family_history_father_age;
//     this.family_history_father_education = data.family_history_father_education;
//     this.family_history_father_occupation = data.family_history_father_occupation;
//     this.family_history_father_personality = data.family_history_father_personality;
//     this.family_history_father_deceased = data.family_history_father_deceased || false;
//     this.family_history_father_death_age = data.family_history_father_death_age;
//     this.family_history_father_death_date = data.family_history_father_death_date;
//     this.family_history_father_death_cause = data.family_history_father_death_cause;
//     this.family_history_mother_age = data.family_history_mother_age;
//     this.family_history_mother_education = data.family_history_mother_education;
//     this.family_history_mother_occupation = data.family_history_mother_occupation;
//     this.family_history_mother_personality = data.family_history_mother_personality;
//     this.family_history_mother_deceased = data.family_history_mother_deceased || false;
//     this.family_history_mother_death_age = data.family_history_mother_death_age;
//     this.family_history_mother_death_date = data.family_history_mother_death_date;
//     this.family_history_mother_death_cause = data.family_history_mother_death_cause;
//     this.family_history_siblings = data.family_history_siblings ? (typeof data.family_history_siblings === 'string' ? JSON.parse(data.family_history_siblings) : data.family_history_siblings) : [];
//     // Diagnostic Formulation
//     this.diagnostic_formulation_summary = data.diagnostic_formulation_summary;
//     this.diagnostic_formulation_features = data.diagnostic_formulation_features;
//     this.diagnostic_formulation_psychodynamic = data.diagnostic_formulation_psychodynamic;
//     // Premorbid Personality
//     this.premorbid_personality_passive_active = data.premorbid_personality_passive_active;
//     this.premorbid_personality_assertive = data.premorbid_personality_assertive;
//     this.premorbid_personality_introvert_extrovert = data.premorbid_personality_introvert_extrovert;
//     this.premorbid_personality_traits = data.premorbid_personality_traits ? (typeof data.premorbid_personality_traits === 'string' ? JSON.parse(data.premorbid_personality_traits) : data.premorbid_personality_traits) : [];
//     this.premorbid_personality_hobbies = data.premorbid_personality_hobbies;
//     this.premorbid_personality_habits = data.premorbid_personality_habits;
//     this.premorbid_personality_alcohol_drugs = data.premorbid_personality_alcohol_drugs;
//     // Physical Examination - Comprehensive
//     this.physical_appearance = data.physical_appearance;
//     this.physical_body_build = data.physical_body_build;
//     this.physical_pallor = data.physical_pallor || false;
//     this.physical_icterus = data.physical_icterus || false;
//     this.physical_oedema = data.physical_oedema || false;
//     this.physical_lymphadenopathy = data.physical_lymphadenopathy || false;
//     this.physical_pulse = data.physical_pulse;
//     this.physical_bp = data.physical_bp;
//     this.physical_height = data.physical_height;
//     this.physical_weight = data.physical_weight;
//     this.physical_waist = data.physical_waist;
//     this.physical_fundus = data.physical_fundus;
//     this.physical_cvs_apex = data.physical_cvs_apex;
//     this.physical_cvs_regularity = data.physical_cvs_regularity;
//     this.physical_cvs_heart_sounds = data.physical_cvs_heart_sounds;
//     this.physical_cvs_murmurs = data.physical_cvs_murmurs;
//     this.physical_chest_expansion = data.physical_chest_expansion;
//     this.physical_chest_percussion = data.physical_chest_percussion;
//     this.physical_chest_adventitious = data.physical_chest_adventitious;
//     this.physical_abdomen_tenderness = data.physical_abdomen_tenderness;
//     this.physical_abdomen_mass = data.physical_abdomen_mass;
//     this.physical_abdomen_bowel_sounds = data.physical_abdomen_bowel_sounds;
//     this.physical_cns_cranial = data.physical_cns_cranial;
//     this.physical_cns_motor_sensory = data.physical_cns_motor_sensory;
//     this.physical_cns_rigidity = data.physical_cns_rigidity;
//     this.physical_cns_involuntary = data.physical_cns_involuntary;
//     this.physical_cns_superficial_reflexes = data.physical_cns_superficial_reflexes;
//     this.physical_cns_dtrs = data.physical_cns_dtrs;
//     this.physical_cns_plantar = data.physical_cns_plantar;
//     this.physical_cns_cerebellar = data.physical_cns_cerebellar;
//     // Mental Status Examination - Expanded
//     this.mse_general_demeanour = data.mse_general_demeanour;
//     this.mse_general_tidy = data.mse_general_tidy;
//     this.mse_general_awareness = data.mse_general_awareness;
//     this.mse_general_cooperation = data.mse_general_cooperation;
//     this.mse_psychomotor_verbalization = data.mse_psychomotor_verbalization;
//     this.mse_psychomotor_pressure = data.mse_psychomotor_pressure;
//     this.mse_psychomotor_tension = data.mse_psychomotor_tension;
//     this.mse_psychomotor_posture = data.mse_psychomotor_posture;
//     this.mse_psychomotor_mannerism = data.mse_psychomotor_mannerism;
//     this.mse_psychomotor_catatonic = data.mse_psychomotor_catatonic;
//     this.mse_affect_subjective = data.mse_affect_subjective;
//     this.mse_affect_tone = data.mse_affect_tone;
//     this.mse_affect_resting = data.mse_affect_resting;
//     this.mse_affect_fluctuation = data.mse_affect_fluctuation;
//     this.mse_thought_flow = data.mse_thought_flow;
//     this.mse_thought_form = data.mse_thought_form;
//     this.mse_thought_content = data.mse_thought_content;
//     this.mse_cognitive_consciousness = data.mse_cognitive_consciousness;
//     this.mse_cognitive_orientation_time = data.mse_cognitive_orientation_time;
//     this.mse_cognitive_orientation_place = data.mse_cognitive_orientation_place;
//     this.mse_cognitive_orientation_person = data.mse_cognitive_orientation_person;
//     this.mse_cognitive_memory_immediate = data.mse_cognitive_memory_immediate;
//     this.mse_cognitive_memory_recent = data.mse_cognitive_memory_recent;
//     this.mse_cognitive_memory_remote = data.mse_cognitive_memory_remote;
//     this.mse_cognitive_subtraction = data.mse_cognitive_subtraction;
//     this.mse_cognitive_digit_span = data.mse_cognitive_digit_span;
//     this.mse_cognitive_counting = data.mse_cognitive_counting;
//     this.mse_cognitive_general_knowledge = data.mse_cognitive_general_knowledge;
//     this.mse_cognitive_calculation = data.mse_cognitive_calculation;
//     this.mse_cognitive_similarities = data.mse_cognitive_similarities;
//     this.mse_cognitive_proverbs = data.mse_cognitive_proverbs;
//     this.mse_insight_understanding = data.mse_insight_understanding;
//     this.mse_insight_judgement = data.mse_insight_judgement;
//     // Educational History
//     this.education_start_age = data.education_start_age;
//     this.education_highest_class = data.education_highest_class;
//     this.education_performance = data.education_performance;
//     this.education_disciplinary = data.education_disciplinary;
//     this.education_peer_relationship = data.education_peer_relationship;
//     this.education_hobbies = data.education_hobbies;
//     this.education_special_abilities = data.education_special_abilities;
//     this.education_discontinue_reason = data.education_discontinue_reason;
//     // Occupational History (JSONB)
//     this.occupation_jobs = data.occupation_jobs ? (typeof data.occupation_jobs === 'string' ? JSON.parse(data.occupation_jobs) : data.occupation_jobs) : [];
//     // Sexual and Marital History
//     this.sexual_menarche_age = data.sexual_menarche_age;
//     this.sexual_menarche_reaction = data.sexual_menarche_reaction;
//     this.sexual_education = data.sexual_education;
//     this.sexual_masturbation = data.sexual_masturbation;
//     this.sexual_contact = data.sexual_contact;
//     this.sexual_premarital_extramarital = data.sexual_premarital_extramarital;
//     this.sexual_marriage_arranged = data.sexual_marriage_arranged;
//     this.sexual_marriage_date = data.sexual_marriage_date;
//     this.sexual_spouse_age = data.sexual_spouse_age;
//     this.sexual_spouse_occupation = data.sexual_spouse_occupation;
//     this.sexual_adjustment_general = data.sexual_adjustment_general;
//     this.sexual_adjustment_sexual = data.sexual_adjustment_sexual;
//     this.sexual_children = data.sexual_children ? (typeof data.sexual_children === 'string' ? JSON.parse(data.sexual_children) : data.sexual_children) : [];
//     this.sexual_problems = data.sexual_problems;
//     // Religion
//     this.religion_type = data.religion_type;
//     this.religion_participation = data.religion_participation;
//     this.religion_changes = data.religion_changes;
//     // Present Living Situation
//     this.living_residents = data.living_residents ? (typeof data.living_residents === 'string' ? JSON.parse(data.living_residents) : data.living_residents) : [];
//     this.living_income_sharing = data.living_income_sharing;
//     this.living_expenses = data.living_expenses;
//     this.living_kitchen = data.living_kitchen;
//     this.living_domestic_conflicts = data.living_domestic_conflicts;
//     this.living_social_class = data.living_social_class;
//     this.living_inlaws = data.living_inlaws ? (typeof data.living_inlaws === 'string' ? JSON.parse(data.living_inlaws) : data.living_inlaws) : [];
//     // General Home Situation and Early Development
//     this.home_situation_childhood = data.home_situation_childhood;
//     this.home_situation_parents_relationship = data.home_situation_parents_relationship;
//     this.home_situation_socioeconomic = data.home_situation_socioeconomic;
//     this.home_situation_interpersonal = data.home_situation_interpersonal;
//     this.personal_birth_date = data.personal_birth_date;
//     this.personal_birth_place = data.personal_birth_place;
//     this.personal_delivery_type = data.personal_delivery_type;
//     this.personal_complications_prenatal = data.personal_complications_prenatal;
//     this.personal_complications_natal = data.personal_complications_natal;
//     this.personal_complications_postnatal = data.personal_complications_postnatal;
//     this.development_weaning_age = data.development_weaning_age;
//     this.development_first_words = data.development_first_words;
//     this.development_three_words = data.development_three_words;
//     this.development_walking = data.development_walking;
//     this.development_neurotic_traits = data.development_neurotic_traits;
//     this.development_nail_biting = data.development_nail_biting;
//     this.development_bedwetting = data.development_bedwetting;
//     this.development_phobias = data.development_phobias;
//     this.development_childhood_illness = data.development_childhood_illness;
//     // Provisional Diagnosis and Treatment Plan
//     this.provisional_diagnosis = data.provisional_diagnosis;
//     this.treatment_plan = data.treatment_plan;
//     // Comments of the Consultant
//     this.consultant_comments = data.consultant_comments;
//   }

//   // Find ADL file by ID
//   static async findById(id) {
//     try {
//       const result = await db.query(
//         `SELECT af.*, p.name as patient_name, p.cr_no, p.psy_no, 
//                 u1.name as created_by_name, u1.role as created_by_role,
//                 u2.name as last_accessed_by_name
//          FROM adl_files af
//          LEFT JOIN patients p ON af.patient_id = p.id
//          LEFT JOIN users u1 ON af.created_by = u1.id
//          LEFT JOIN users u2 ON af.last_accessed_by = u2.id
//          WHERE af.id = $1`,
//         [id]
//       );

//       if (result.rows.length === 0) {
//         return null;
//       }

//       return new ADLFile(result.rows[0]);
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Find ADL file by ADL number
//   static async findByADLNo(adl_no) {
//     try {
//       const result = await db.query(
//         `SELECT af.*, p.name as patient_name, p.cr_no, p.psy_no, 
//                 u1.name as created_by_name, u1.role as created_by_role,
//                 u2.name as last_accessed_by_name
//          FROM adl_files af
//          LEFT JOIN patients p ON af.patient_id = p.id
//          LEFT JOIN users u1 ON af.created_by = u1.id
//          LEFT JOIN users u2 ON af.last_accessed_by = u2.id
//          WHERE af.adl_no = $1`,
//         [adl_no]
//       );

//       if (result.rows.length === 0) {
//         return null;
//       }

//       return new ADLFile(result.rows[0]);
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Find ADL file by patient ID
//   static async findByPatientId(patient_id) {
//     try {
//       const result = await db.query(
//         `SELECT af.*, p.name as patient_name, p.cr_no, p.psy_no, 
//                 u1.name as created_by_name, u1.role as created_by_role,
//                 u2.name as last_accessed_by_name
//          FROM adl_files af
//          LEFT JOIN patients p ON af.patient_id = p.id
//          LEFT JOIN users u1 ON af.created_by = u1.id
//          LEFT JOIN users u2 ON af.last_accessed_by = u2.id
//          WHERE af.patient_id = $1
//          ORDER BY af.file_created_date DESC`,
//         [patient_id]
//       );

//       return result.rows.map(row => new ADLFile(row));
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Find ADL file by clinical proforma ID
//   static async findByClinicalProformaId(clinical_proforma_id) {
//     try {
//       const result = await db.query(
//         `SELECT af.*, p.name as patient_name, p.cr_no, p.psy_no, 
//                 u1.name as created_by_name, u1.role as created_by_role,
//                 u2.name as last_accessed_by_name
//          FROM adl_files af
//          LEFT JOIN patients p ON af.patient_id = p.id
//          LEFT JOIN users u1 ON af.created_by = u1.id
//          LEFT JOIN users u2 ON af.last_accessed_by = u2.id
//          WHERE af.clinical_proforma_id = $1`,
//         [clinical_proforma_id]
//       );

//       if (result.rows.length === 0) {
//         return null;
//       }

//       return new ADLFile(result.rows[0]);
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Get all ADL files with pagination and filters
//   // By default, only returns ADL files associated with complex cases (where clinical_proforma_id is not null)
//   // Set filters.include_all = true to get all ADL files regardless of complex case association
//   static async findAll(page = 1, limit = 10, filters = {}) {
//     try {
//       const offset = (page - 1) * limit;
//       let query = `
//         SELECT af.*, 
//                 p.name as patient_name, p.cr_no, p.psy_no,
//                 u1.name as created_by_name, u1.role as created_by_role,
//                 u2.name as last_accessed_by_name,
//                 cp.assigned_doctor, cp.visit_date as proforma_visit_date,
//                 u3.name as assigned_doctor_name, u3.role as assigned_doctor_role,
//                 cp.id as clinical_proforma_id,
//                 cp.doctor_decision
//         FROM adl_files af
//         LEFT JOIN patients p ON af.patient_id = p.id
//         LEFT JOIN users u1 ON af.created_by = u1.id
//         LEFT JOIN users u2 ON af.last_accessed_by = u2.id
//         LEFT JOIN clinical_proforma cp ON af.clinical_proforma_id = cp.id
//         LEFT JOIN users u3 ON cp.assigned_doctor = u3.id
//         WHERE 1=1
//       `;
//       let countQuery = 'SELECT COUNT(*) FROM adl_files af WHERE 1=1';
//       const params = [];
//       let paramCount = 0;

//       // By default, only show ADL files associated with complex cases
//       // (where clinical_proforma_id is not null and doctor_decision is 'complex_case')
//       if (filters.include_all !== true) {
//         query += ` AND af.clinical_proforma_id IS NOT NULL AND cp.doctor_decision = 'complex_case'`;
//         // Update count query to include JOIN for accurate filtering
//         countQuery = `
//           SELECT COUNT(*) FROM adl_files af
//           LEFT JOIN clinical_proforma cp ON af.clinical_proforma_id = cp.id
//           WHERE 1=1 AND af.clinical_proforma_id IS NOT NULL AND cp.doctor_decision = 'complex_case'
//         `;
//       }

//       // Apply filters - build both queries in parallel
//       // For complex case filtering, rebuild countParams separately since countQuery has different structure
//       let finalCountParams = [];
//       let countParamCounter = 0;

//       if (filters.file_status) {
//         paramCount++;
//         query += ` AND af.file_status = $${paramCount}`;
//         params.push(filters.file_status);
        
//         countParamCounter++;
//         countQuery += ` AND af.file_status = $${countParamCounter}`;
//         finalCountParams.push(filters.file_status);
//       }

//       if (filters.is_active !== undefined) {
//         paramCount++;
//         query += ` AND af.is_active = $${paramCount}`;
//         params.push(filters.is_active);
        
//         countParamCounter++;
//         countQuery += ` AND af.is_active = $${countParamCounter}`;
//         finalCountParams.push(filters.is_active);
//       }

//       if (filters.created_by) {
//         paramCount++;
//         query += ` AND af.created_by = $${paramCount}`;
//         params.push(filters.created_by);
        
//         countParamCounter++;
//         countQuery += ` AND af.created_by = $${countParamCounter}`;
//         finalCountParams.push(filters.created_by);
//       }

//       if (filters.last_accessed_by) {
//         paramCount++;
//         query += ` AND af.last_accessed_by = $${paramCount}`;
//         params.push(filters.last_accessed_by);
        
//         countParamCounter++;
//         countQuery += ` AND af.last_accessed_by = $${countParamCounter}`;
//         finalCountParams.push(filters.last_accessed_by);
//       }

//       if (filters.date_from) {
//         paramCount++;
//         query += ` AND af.file_created_date >= $${paramCount}`;
//         params.push(filters.date_from);
        
//         countParamCounter++;
//         countQuery += ` AND af.file_created_date >= $${countParamCounter}`;
//         finalCountParams.push(filters.date_from);
//       }

//       if (filters.date_to) {
//         paramCount++;
//         query += ` AND af.file_created_date <= $${paramCount}`;
//         params.push(filters.date_to);
        
//         countParamCounter++;
//         countQuery += ` AND af.file_created_date <= $${countParamCounter}`;
//         finalCountParams.push(filters.date_to);
//       }

//       query += ` ORDER BY af.file_created_date DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
//       params.push(limit, offset);

//       const [filesResult, countResult] = await Promise.all([
//         db.query(query, params),
//         db.query(countQuery, finalCountParams)
//       ]);

//       const files = filesResult.rows.map(row => new ADLFile(row));
//       const total = parseInt(countResult.rows[0].count);

//       return {
//         files,
//         pagination: {
//           page,
//           limit,
//           total,
//           pages: Math.ceil(total / limit)
//         }
//       };
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Static method to create ADL file with complex case data
//   static async create(adlData) {
//     try {
//       const {
//         patient_id,
//         adl_no,
//         created_by,
//         clinical_proforma_id,
//         file_status = 'created',
//         file_created_date = new Date(),
//         total_visits = 1,
//         // Complex case data fields
//         history_narrative, history_specific_enquiry, history_drug_intake,
//         history_treatment_place, history_treatment_dates, history_treatment_drugs, history_treatment_response,
//         informants, complaints_patient, complaints_informant,
//         past_history_medical, past_history_psychiatric_dates, past_history_psychiatric_diagnosis,
//         past_history_psychiatric_treatment, past_history_psychiatric_interim, past_history_psychiatric_recovery,
//         family_history_father_age, family_history_father_education, family_history_father_occupation,
//         family_history_father_personality, family_history_father_deceased, family_history_father_death_age,
//         family_history_father_death_date, family_history_father_death_cause,
//         family_history_mother_age, family_history_mother_education, family_history_mother_occupation,
//         family_history_mother_personality, family_history_mother_deceased, family_history_mother_death_age,
//         family_history_mother_death_date, family_history_mother_death_cause, family_history_siblings,
//         diagnostic_formulation_summary, diagnostic_formulation_features, diagnostic_formulation_psychodynamic,
//         premorbid_personality_passive_active, premorbid_personality_assertive, premorbid_personality_introvert_extrovert,
//         premorbid_personality_traits, premorbid_personality_hobbies, premorbid_personality_habits, premorbid_personality_alcohol_drugs,
//         physical_appearance, physical_body_build, physical_pallor, physical_icterus, physical_oedema, physical_lymphadenopathy,
//         physical_pulse, physical_bp, physical_height, physical_weight, physical_waist, physical_fundus,
//         physical_cvs_apex, physical_cvs_regularity, physical_cvs_heart_sounds, physical_cvs_murmurs,
//         physical_chest_expansion, physical_chest_percussion, physical_chest_adventitious,
//         physical_abdomen_tenderness, physical_abdomen_mass, physical_abdomen_bowel_sounds,
//         physical_cns_cranial, physical_cns_motor_sensory, physical_cns_rigidity, physical_cns_involuntary,
//         physical_cns_superficial_reflexes, physical_cns_dtrs, physical_cns_plantar, physical_cns_cerebellar,
//         mse_general_demeanour, mse_general_tidy, mse_general_awareness, mse_general_cooperation,
//         mse_psychomotor_verbalization, mse_psychomotor_pressure, mse_psychomotor_tension, mse_psychomotor_posture,
//         mse_psychomotor_mannerism, mse_psychomotor_catatonic, mse_affect_subjective, mse_affect_tone,
//         mse_affect_resting, mse_affect_fluctuation, mse_thought_flow, mse_thought_form, mse_thought_content,
//         mse_cognitive_consciousness, mse_cognitive_orientation_time, mse_cognitive_orientation_place,
//         mse_cognitive_orientation_person, mse_cognitive_memory_immediate, mse_cognitive_memory_recent,
//         mse_cognitive_memory_remote, mse_cognitive_subtraction, mse_cognitive_digit_span, mse_cognitive_counting,
//         mse_cognitive_general_knowledge, mse_cognitive_calculation, mse_cognitive_similarities, mse_cognitive_proverbs,
//         mse_insight_understanding, mse_insight_judgement,
//         education_start_age, education_highest_class, education_performance, education_disciplinary,
//         education_peer_relationship, education_hobbies, education_special_abilities, education_discontinue_reason,
//         occupation_jobs, sexual_menarche_age, sexual_menarche_reaction, sexual_education, sexual_masturbation,
//         sexual_contact, sexual_premarital_extramarital, sexual_marriage_arranged, sexual_marriage_date,
//         sexual_spouse_age, sexual_spouse_occupation, sexual_adjustment_general, sexual_adjustment_sexual,
//         sexual_children, sexual_problems, religion_type, religion_participation, religion_changes,
//         living_residents, living_income_sharing, living_expenses, living_kitchen, living_domestic_conflicts,
//         living_social_class, living_inlaws, home_situation_childhood, home_situation_parents_relationship,
//         home_situation_socioeconomic, home_situation_interpersonal, personal_birth_date, personal_birth_place,
//         personal_delivery_type, personal_complications_prenatal, personal_complications_natal, personal_complications_postnatal,
//         development_weaning_age, development_first_words, development_three_words, development_walking,
//         development_neurotic_traits, development_nail_biting, development_bedwetting, development_phobias,
//         development_childhood_illness, provisional_diagnosis, treatment_plan, consultant_comments
//       } = adlData;

//       // Convert arrays to JSONB
//       const informantsJson = informants ? JSON.stringify(Array.isArray(informants) ? informants : []) : '[]';
//       const complaintsPatientJson = complaints_patient ? JSON.stringify(Array.isArray(complaints_patient) ? complaints_patient : []) : '[]';
//       const complaintsInformantJson = complaints_informant ? JSON.stringify(Array.isArray(complaints_informant) ? complaints_informant : []) : '[]';
//       const familyHistorySiblingsJson = family_history_siblings ? JSON.stringify(Array.isArray(family_history_siblings) ? family_history_siblings : []) : '[]';
//       const premorbidPersonalityTraitsJson = premorbid_personality_traits ? JSON.stringify(Array.isArray(premorbid_personality_traits) ? premorbid_personality_traits : []) : '[]';
//       const occupationJobsJson = occupation_jobs ? JSON.stringify(Array.isArray(occupation_jobs) ? occupation_jobs : []) : '[]';
//       const sexualChildrenJson = sexual_children ? JSON.stringify(Array.isArray(sexual_children) ? sexual_children : []) : '[]';
//       const livingResidentsJson = living_residents ? JSON.stringify(Array.isArray(living_residents) ? living_residents : []) : '[]';
//       const livingInlawsJson = living_inlaws ? JSON.stringify(Array.isArray(living_inlaws) ? living_inlaws : []) : '[]';

//       // Build the INSERT query dynamically to handle all fields
//       // Due to the large number of fields, we'll build this systematically
//       const result = await db.query(
//         `INSERT INTO adl_files (
//           patient_id, adl_no, created_by, clinical_proforma_id, file_status, file_created_date, total_visits,
//           history_narrative, history_specific_enquiry, history_drug_intake, history_treatment_place, history_treatment_dates,
//           history_treatment_drugs, history_treatment_response, informants, complaints_patient, complaints_informant,
//           past_history_medical, past_history_psychiatric_dates, past_history_psychiatric_diagnosis,
//           past_history_psychiatric_treatment, past_history_psychiatric_interim, past_history_psychiatric_recovery,
//           family_history_father_age, family_history_father_education, family_history_father_occupation,
//           family_history_father_personality, family_history_father_deceased, family_history_father_death_age,
//           family_history_father_death_date, family_history_father_death_cause,
//           family_history_mother_age, family_history_mother_education, family_history_mother_occupation,
//           family_history_mother_personality, family_history_mother_deceased, family_history_mother_death_age,
//           family_history_mother_death_date, family_history_mother_death_cause, family_history_siblings,
//           diagnostic_formulation_summary, diagnostic_formulation_features, diagnostic_formulation_psychodynamic,
//           premorbid_personality_passive_active, premorbid_personality_assertive, premorbid_personality_introvert_extrovert,
//           premorbid_personality_traits, premorbid_personality_hobbies, premorbid_personality_habits, premorbid_personality_alcohol_drugs,
//           physical_appearance, physical_body_build, physical_pallor, physical_icterus, physical_oedema, physical_lymphadenopathy,
//           physical_pulse, physical_bp, physical_height, physical_weight, physical_waist, physical_fundus,
//           physical_cvs_apex, physical_cvs_regularity, physical_cvs_heart_sounds, physical_cvs_murmurs,
//           physical_chest_expansion, physical_chest_percussion, physical_chest_adventitious,
//           physical_abdomen_tenderness, physical_abdomen_mass, physical_abdomen_bowel_sounds,
//           physical_cns_cranial, physical_cns_motor_sensory, physical_cns_rigidity, physical_cns_involuntary,
//           physical_cns_superficial_reflexes, physical_cns_dtrs, physical_cns_plantar, physical_cns_cerebellar,
//           mse_general_demeanour, mse_general_tidy, mse_general_awareness, mse_general_cooperation,
//           mse_psychomotor_verbalization, mse_psychomotor_pressure, mse_psychomotor_tension, mse_psychomotor_posture,
//           mse_psychomotor_mannerism, mse_psychomotor_catatonic, mse_affect_subjective, mse_affect_tone,
//           mse_affect_resting, mse_affect_fluctuation, mse_thought_flow, mse_thought_form, mse_thought_content,
//           mse_cognitive_consciousness, mse_cognitive_orientation_time, mse_cognitive_orientation_place,
//           mse_cognitive_orientation_person, mse_cognitive_memory_immediate, mse_cognitive_memory_recent,
//           mse_cognitive_memory_remote, mse_cognitive_subtraction, mse_cognitive_digit_span, mse_cognitive_counting,
//           mse_cognitive_general_knowledge, mse_cognitive_calculation, mse_cognitive_similarities, mse_cognitive_proverbs,
//           mse_insight_understanding, mse_insight_judgement,
//           education_start_age, education_highest_class, education_performance, education_disciplinary,
//           education_peer_relationship, education_hobbies, education_special_abilities, education_discontinue_reason,
//           occupation_jobs, sexual_menarche_age, sexual_menarche_reaction, sexual_education, sexual_masturbation,
//           sexual_contact, sexual_premarital_extramarital, sexual_marriage_arranged, sexual_marriage_date,
//           sexual_spouse_age, sexual_spouse_occupation, sexual_adjustment_general, sexual_adjustment_sexual,
//           sexual_children, sexual_problems, religion_type, religion_participation, religion_changes,
//           living_residents, living_income_sharing, living_expenses, living_kitchen, living_domestic_conflicts,
//           living_social_class, living_inlaws, home_situation_childhood, home_situation_parents_relationship,
//           home_situation_socioeconomic, home_situation_interpersonal, personal_birth_date, personal_birth_place,
//           personal_delivery_type, personal_complications_prenatal, personal_complications_natal, personal_complications_postnatal,
//           development_weaning_age, development_first_words, development_three_words, development_walking,
//           development_neurotic_traits, development_nail_biting, development_bedwetting, development_phobias,
//           development_childhood_illness, provisional_diagnosis, treatment_plan, consultant_comments
//         ) VALUES (
//           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb, $16::jsonb, $17::jsonb,
//           $18, $19, $20, $21, $22, $23,
//           $24, $25, $26, $27, $28, $29, $30, $31,
//           $32, $33, $34, $35, $36, $37, $38, $39, $40::jsonb,
//           $41, $42, $43,
//           $44, $45, $46, $47::jsonb, $48, $49, $50,
//           $51, $52, $53, $54, $55, $56,
//           $57, $58, $59, $60, $61, $62,
//           $63, $64, $65, $66,
//           $67, $68, $69, $70, $71, $72,
//           $73, $74, $75, $76, $77, $78, $79, $80,
//           $81, $82, $83, $84, $85, $86, $87, $88, $89, $90, $91, $92, $93, $94, $95, $96, $97, $98,
//           $99, $100, $101, $102, $103, $104, $105, $106, $107, $108, $109, $110,
//           $111, $112, $113, $114, $115, $116, $117, $118,
//           $119, $120, $121, $122, $123, $124, $125, $126, $127, $128,
//           $129, $130, $131, $132, $133, $134, $135, $136, $137, $138, $139, $140,
//           $141, $142, $143, $144, $145, $146, $147, $148, $149, $150, $151, $152, $153, $154, $155, $156,
//           $157, $158, $159, $160::jsonb, $161, $162, $163, $164, $165, $166, $167, $168,
//           $169, $170, $171, $172, $173, $174, $175, $176,
//           $177, $178, $179, $180, $181, $182, $183, $184, $185,
//           $186::jsonb, $187, $188, $189, $190, $191, $192, $193, $194, $195, $196, $197, $198, $199, $200, $201,
//           $202, $203, $204, $205, $206, $207, $208, $209, $210, $211, $212, $213, $214, $215, $216, $217, $218, $219
//         ) RETURNING *`,
//         [
//           patient_id, adl_no, created_by, clinical_proforma_id, file_status, file_created_date, total_visits,
//           history_narrative, history_specific_enquiry, history_drug_intake, history_treatment_place, history_treatment_dates,
//           history_treatment_drugs, history_treatment_response, informantsJson, complaintsPatientJson, complaintsInformantJson,
//           past_history_medical, past_history_psychiatric_dates, past_history_psychiatric_diagnosis,
//           past_history_psychiatric_treatment, past_history_psychiatric_interim, past_history_psychiatric_recovery,
//           family_history_father_age, family_history_father_education, family_history_father_occupation,
//           family_history_father_personality, family_history_father_deceased, family_history_father_death_age,
//           family_history_father_death_date, family_history_father_death_cause,
//           family_history_mother_age, family_history_mother_education, family_history_mother_occupation,
//           family_history_mother_personality, family_history_mother_deceased, family_history_mother_death_age,
//           family_history_mother_death_date, family_history_mother_death_cause, familyHistorySiblingsJson,
//           diagnostic_formulation_summary, diagnostic_formulation_features, diagnostic_formulation_psychodynamic,
//           premorbid_personality_passive_active, premorbid_personality_assertive, premorbid_personality_introvert_extrovert,
//           premorbidPersonalityTraitsJson, premorbid_personality_hobbies, premorbid_personality_habits, premorbid_personality_alcohol_drugs,
//           physical_appearance, physical_body_build, physical_pallor, physical_icterus, physical_oedema, physical_lymphadenopathy,
//           physical_pulse, physical_bp, physical_height, physical_weight, physical_waist, physical_fundus,
//           physical_cvs_apex, physical_cvs_regularity, physical_cvs_heart_sounds, physical_cvs_murmurs,
//           physical_chest_expansion, physical_chest_percussion, physical_chest_adventitious,
//           physical_abdomen_tenderness, physical_abdomen_mass, physical_abdomen_bowel_sounds,
//           physical_cns_cranial, physical_cns_motor_sensory, physical_cns_rigidity, physical_cns_involuntary,
//           physical_cns_superficial_reflexes, physical_cns_dtrs, physical_cns_plantar, physical_cns_cerebellar,
//           mse_general_demeanour, mse_general_tidy, mse_general_awareness, mse_general_cooperation,
//           mse_psychomotor_verbalization, mse_psychomotor_pressure, mse_psychomotor_tension, mse_psychomotor_posture,
//           mse_psychomotor_mannerism, mse_psychomotor_catatonic, mse_affect_subjective, mse_affect_tone,
//           mse_affect_resting, mse_affect_fluctuation, mse_thought_flow, mse_thought_form, mse_thought_content,
//           mse_cognitive_consciousness, mse_cognitive_orientation_time, mse_cognitive_orientation_place,
//           mse_cognitive_orientation_person, mse_cognitive_memory_immediate, mse_cognitive_memory_recent,
//           mse_cognitive_memory_remote, mse_cognitive_subtraction, mse_cognitive_digit_span, mse_cognitive_counting,
//           mse_cognitive_general_knowledge, mse_cognitive_calculation, mse_cognitive_similarities, mse_cognitive_proverbs,
//           mse_insight_understanding, mse_insight_judgement,
//           education_start_age, education_highest_class, education_performance, education_disciplinary,
//           education_peer_relationship, education_hobbies, education_special_abilities, education_discontinue_reason,
//           occupationJobsJson, sexual_menarche_age, sexual_menarche_reaction, sexual_education, sexual_masturbation,
//           sexual_contact, sexual_premarital_extramarital, sexual_marriage_arranged, sexual_marriage_date,
//           sexual_spouse_age, sexual_spouse_occupation, sexual_adjustment_general, sexual_adjustment_sexual,
//           sexualChildrenJson, sexual_problems, religion_type, religion_participation, religion_changes,
//           livingResidentsJson, living_income_sharing, living_expenses, living_kitchen, living_domestic_conflicts,
//           living_social_class, livingInlawsJson, home_situation_childhood, home_situation_parents_relationship,
//           home_situation_socioeconomic, home_situation_interpersonal, personal_birth_date, personal_birth_place,
//           personal_delivery_type, personal_complications_prenatal, personal_complications_natal, personal_complications_postnatal,
//           development_weaning_age, development_first_words, development_three_words, development_walking,
//           development_neurotic_traits, development_nail_biting, development_bedwetting, development_phobias,
//           development_childhood_illness, provisional_diagnosis, treatment_plan, consultant_comments
//         ]
//       );

//       return new ADLFile(result.rows[0]);
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Update ADL file (including all complex case fields)
//   async update(updateData) {
//     try {
//       // All fields that can be updated, including complex case fields
//       const allowedFields = [
//         // Basic ADL file fields
//         'file_status', 'physical_file_location', 'last_accessed_date',
//         'last_accessed_by', 'total_visits', 'is_active', 'notes', 'clinical_proforma_id',
//         // Complex case data fields
//         'history_narrative', 'history_specific_enquiry', 'history_drug_intake',
//         'history_treatment_place', 'history_treatment_dates', 'history_treatment_drugs', 'history_treatment_response',
//         'informants', 'complaints_patient', 'complaints_informant',
//         'past_history_medical', 'past_history_psychiatric_dates', 'past_history_psychiatric_diagnosis',
//         'past_history_psychiatric_treatment', 'past_history_psychiatric_interim', 'past_history_psychiatric_recovery',
//         'family_history_father_age', 'family_history_father_education', 'family_history_father_occupation',
//         'family_history_father_personality', 'family_history_father_deceased', 'family_history_father_death_age',
//         'family_history_father_death_date', 'family_history_father_death_cause',
//         'family_history_mother_age', 'family_history_mother_education', 'family_history_mother_occupation',
//         'family_history_mother_personality', 'family_history_mother_deceased', 'family_history_mother_death_age',
//         'family_history_mother_death_date', 'family_history_mother_death_cause', 'family_history_siblings',
//         'diagnostic_formulation_summary', 'diagnostic_formulation_features', 'diagnostic_formulation_psychodynamic',
//         'premorbid_personality_passive_active', 'premorbid_personality_assertive', 'premorbid_personality_introvert_extrovert',
//         'premorbid_personality_traits', 'premorbid_personality_hobbies', 'premorbid_personality_habits', 'premorbid_personality_alcohol_drugs',
//         'physical_appearance', 'physical_body_build', 'physical_pallor', 'physical_icterus', 'physical_oedema', 'physical_lymphadenopathy',
//         'physical_pulse', 'physical_bp', 'physical_height', 'physical_weight', 'physical_waist', 'physical_fundus',
//         'physical_cvs_apex', 'physical_cvs_regularity', 'physical_cvs_heart_sounds', 'physical_cvs_murmurs',
//         'physical_chest_expansion', 'physical_chest_percussion', 'physical_chest_adventitious',
//         'physical_abdomen_tenderness', 'physical_abdomen_mass', 'physical_abdomen_bowel_sounds',
//         'physical_cns_cranial', 'physical_cns_motor_sensory', 'physical_cns_rigidity', 'physical_cns_involuntary',
//         'physical_cns_superficial_reflexes', 'physical_cns_dtrs', 'physical_cns_plantar', 'physical_cns_cerebellar',
//         'mse_general_demeanour', 'mse_general_tidy', 'mse_general_awareness', 'mse_general_cooperation',
//         'mse_psychomotor_verbalization', 'mse_psychomotor_pressure', 'mse_psychomotor_tension', 'mse_psychomotor_posture',
//         'mse_psychomotor_mannerism', 'mse_psychomotor_catatonic', 'mse_affect_subjective', 'mse_affect_tone',
//         'mse_affect_resting', 'mse_affect_fluctuation', 'mse_thought_flow', 'mse_thought_form', 'mse_thought_content',
//         'mse_cognitive_consciousness', 'mse_cognitive_orientation_time', 'mse_cognitive_orientation_place',
//         'mse_cognitive_orientation_person', 'mse_cognitive_memory_immediate', 'mse_cognitive_memory_recent',
//         'mse_cognitive_memory_remote', 'mse_cognitive_subtraction', 'mse_cognitive_digit_span', 'mse_cognitive_counting',
//         'mse_cognitive_general_knowledge', 'mse_cognitive_calculation', 'mse_cognitive_similarities', 'mse_cognitive_proverbs',
//         'mse_insight_understanding', 'mse_insight_judgement',
//         'education_start_age', 'education_highest_class', 'education_performance', 'education_disciplinary',
//         'education_peer_relationship', 'education_hobbies', 'education_special_abilities', 'education_discontinue_reason',
//         'occupation_jobs', 'sexual_menarche_age', 'sexual_menarche_reaction', 'sexual_education', 'sexual_masturbation',
//         'sexual_contact', 'sexual_premarital_extramarital', 'sexual_marriage_arranged', 'sexual_marriage_date',
//         'sexual_spouse_age', 'sexual_spouse_occupation', 'sexual_adjustment_general', 'sexual_adjustment_sexual',
//         'sexual_children', 'sexual_problems', 'religion_type', 'religion_participation', 'religion_changes',
//         'living_residents', 'living_income_sharing', 'living_expenses', 'living_kitchen', 'living_domestic_conflicts',
//         'living_social_class', 'living_inlaws', 'home_situation_childhood', 'home_situation_parents_relationship',
//         'home_situation_socioeconomic', 'home_situation_interpersonal', 'personal_birth_date', 'personal_birth_place',
//         'personal_delivery_type', 'personal_complications_prenatal', 'personal_complications_natal', 'personal_complications_postnatal',
//         'development_weaning_age', 'development_first_words', 'development_three_words', 'development_walking',
//         'development_neurotic_traits', 'development_nail_biting', 'development_bedwetting', 'development_phobias',
//         'development_childhood_illness', 'provisional_diagnosis', 'treatment_plan', 'consultant_comments'
//       ];

//       const updates = [];
//       const values = [];
//       let paramCount = 0;
      
//       // JSONB fields that need conversion
//       const jsonbFields = ['informants', 'complaints_patient', 'complaints_informant', 'family_history_siblings',
//         'premorbid_personality_traits', 'occupation_jobs', 'sexual_children', 'living_residents', 'living_inlaws'];

//       for (const [key, value] of Object.entries(updateData)) {
//         if (allowedFields.includes(key) && value !== undefined) {
//           paramCount++;
//           if (jsonbFields.includes(key)) {
//             // Convert to JSONB string
//             const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
//             updates.push(`${key} = $${paramCount}::jsonb`);
//             values.push(jsonValue);
//           } else {
//             updates.push(`${key} = $${paramCount}`);
//             values.push(value);
//           }
//         }
//       }

//       if (updates.length === 0) {
//         throw new Error('No valid fields to update');
//       }

//       // Add updated_at
//       paramCount++;
//       updates.push(`updated_at = CURRENT_TIMESTAMP`);

//       paramCount++;
//       values.push(this.id);

//       const result = await db.query(
//         `UPDATE adl_files SET ${updates.join(', ')} 
//          WHERE id = $${paramCount} 
//          RETURNING *`,
//         values
//       );

//       if (result.rows.length > 0) {
//         Object.assign(this, result.rows[0]);
//       }

//       return this;
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Retrieve file (update status to retrieved)
//   async retrieveFile(accessedBy) {
//     try {
//       await this.update({
//         file_status: 'retrieved',
//         last_accessed_date: new Date(),
//         last_accessed_by: accessedBy
//       });

//       // Log the movement
//       await this.logMovement('retrieved', 'Record Room', 'Doctor Office', accessedBy);
      
//       return this;
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Return file to storage
//   async returnFile(returnedBy) {
//     try {
//       await this.update({
//         file_status: 'stored',
//         last_accessed_date: new Date(),
//         last_accessed_by: returnedBy
//       });

//       // Log the movement
//       await this.logMovement('returned', 'Doctor Office', 'Record Room', returnedBy);
      
//       return this;
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Archive file
//   async archiveFile(archivedBy) {
//     try {
//       await this.update({
//         file_status: 'archived',
//         is_active: false,
//         last_accessed_date: new Date(),
//         last_accessed_by: archivedBy
//       });

//       // Log the movement
//       await this.logMovement('archived', 'Record Room', 'Archive Room', archivedBy);
      
//       return this;
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Log file movement
//   async logMovement(movementType, fromLocation, toLocation, movedBy, notes = null) {
//     try {
//       await db.query(
//         `INSERT INTO file_movements (adl_file_id, patient_id, moved_by, movement_type, from_location, to_location, notes) 
//          VALUES ($1, $2, $3, $4, $5, $6, $7)`,
//         [this.id, this.patient_id, movedBy, movementType, fromLocation, toLocation, notes]
//       );
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Get file movement history
//   async getMovementHistory() {
//     try {
//       const result = await db.query(
//         `SELECT fm.*, u.name as moved_by_name, u.role as moved_by_role
//          FROM file_movements fm
//          LEFT JOIN users u ON fm.moved_by = u.id
//          WHERE fm.adl_file_id = $1
//          ORDER BY fm.movement_date DESC`,
//         [this.id]
//       );

//       return result.rows;
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Get files that need to be retrieved
//   static async getFilesToRetrieve() {
//     try {
//       const result = await db.query(
//         `SELECT af.*, p.name as patient_name, p.cr_no, p.psy_no, 
//                 u1.name as created_by_name, u1.role as created_by_role
//          FROM adl_files af
//          LEFT JOIN patients p ON af.patient_id = p.id
//          LEFT JOIN users u1 ON af.created_by = u1.id
//          WHERE af.file_status = 'stored' AND af.is_active = true
//          ORDER BY af.file_created_date ASC`
//       );

//       return result.rows.map(row => new ADLFile(row));
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Get active files (currently retrieved)
//   static async getActiveFiles() {
//     try {
//       const result = await db.query(
//         `SELECT af.*, p.name as patient_name, p.cr_no, p.psy_no, 
//                 u1.name as created_by_name, u1.role as created_by_role,
//                 u2.name as last_accessed_by_name
//          FROM adl_files af
//          LEFT JOIN patients p ON af.patient_id = p.id
//          LEFT JOIN users u1 ON af.created_by = u1.id
//          LEFT JOIN users u2 ON af.last_accessed_by = u2.id
//          WHERE af.file_status = 'retrieved' AND af.is_active = true
//          ORDER BY af.last_accessed_date ASC`
//       );

//       return result.rows.map(row => new ADLFile(row));
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Get ADL file statistics
//   static async getStats() {
//     try {
//       const result = await db.query(`
//         SELECT 
//           COUNT(*) as total_files,
//           COUNT(CASE WHEN file_status = 'created' THEN 1 END) as created_files,
//           COUNT(CASE WHEN file_status = 'stored' THEN 1 END) as stored_files,
//           COUNT(CASE WHEN file_status = 'retrieved' THEN 1 END) as retrieved_files,
//           COUNT(CASE WHEN file_status = 'archived' THEN 1 END) as archived_files,
//           COUNT(CASE WHEN is_active = true THEN 1 END) as active_files,
//           COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_files,
//           AVG(total_visits) as avg_visits_per_file
//         FROM adl_files
//       `);

//       return result.rows[0];
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Get files by status
//   static async getFilesByStatus() {
//     try {
//       const result = await db.query(`
//         SELECT 
//           file_status,
//           COUNT(*) as count
//         FROM adl_files 
//         WHERE file_status IS NOT NULL
//         GROUP BY file_status
//         ORDER BY count DESC
//       `);

//       return result.rows;
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Delete ADL file (soft delete by archiving)
//   async delete() {
//     try {
//       // Archive the file instead of hard delete
//       await this.update({
//         file_status: 'archived',
//         is_active: false,
//         notes: this.notes ? `${this.notes}\n[DELETED]` : '[DELETED]'
//       });

//       return true;
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Convert to JSON
//   toJSON() {
//     return {
//       id: this.id,
//       patient_id: this.patient_id,
//       adl_no: this.adl_no,
//       created_by: this.created_by,
//       clinical_proforma_id: this.clinical_proforma_id, // Link to complex case clinical proforma
//       file_status: this.file_status,
//       physical_file_location: this.physical_file_location,
//       file_created_date: this.file_created_date,
//       last_accessed_date: this.last_accessed_date,
//       last_accessed_by: this.last_accessed_by,
//       total_visits: this.total_visits,
//       is_active: this.is_active,
//       notes: this.notes,
//       created_at: this.created_at,
//       updated_at: this.updated_at,
//       // Additional fields from joins
//       patient_name: this.patient_name,
//       cr_no: this.cr_no,
//       psy_no: this.psy_no,
//       created_by_name: this.created_by_name,
//       created_by_role: this.created_by_role,
//       last_accessed_by_name: this.last_accessed_by_name,
//       // Clinical proforma details (assigned doctor)
//       assigned_doctor: this.assigned_doctor,
//       assigned_doctor_name: this.assigned_doctor_name,
//       assigned_doctor_role: this.assigned_doctor_role,
//       proforma_visit_date: this.proforma_visit_date,
//       // Complex Case Data Fields (all detailed information stored here)
//       history_narrative: this.history_narrative,
//       history_specific_enquiry: this.history_specific_enquiry,
//       history_drug_intake: this.history_drug_intake,
//       history_treatment_place: this.history_treatment_place,
//       history_treatment_dates: this.history_treatment_dates,
//       history_treatment_drugs: this.history_treatment_drugs,
//       history_treatment_response: this.history_treatment_response,
//       informants: this.informants,
//       complaints_patient: this.complaints_patient,
//       complaints_informant: this.complaints_informant,
//       past_history_medical: this.past_history_medical,
//       past_history_psychiatric_dates: this.past_history_psychiatric_dates,
//       past_history_psychiatric_diagnosis: this.past_history_psychiatric_diagnosis,
//       past_history_psychiatric_treatment: this.past_history_psychiatric_treatment,
//       past_history_psychiatric_interim: this.past_history_psychiatric_interim,
//       past_history_psychiatric_recovery: this.past_history_psychiatric_recovery,
//       family_history_father_age: this.family_history_father_age,
//       family_history_father_education: this.family_history_father_education,
//       family_history_father_occupation: this.family_history_father_occupation,
//       family_history_father_personality: this.family_history_father_personality,
//       family_history_father_deceased: this.family_history_father_deceased,
//       family_history_father_death_age: this.family_history_father_death_age,
//       family_history_father_death_date: this.family_history_father_death_date,
//       family_history_father_death_cause: this.family_history_father_death_cause,
//       family_history_mother_age: this.family_history_mother_age,
//       family_history_mother_education: this.family_history_mother_education,
//       family_history_mother_occupation: this.family_history_mother_occupation,
//       family_history_mother_personality: this.family_history_mother_personality,
//       family_history_mother_deceased: this.family_history_mother_deceased,
//       family_history_mother_death_age: this.family_history_mother_death_age,
//       family_history_mother_death_date: this.family_history_mother_death_date,
//       family_history_mother_death_cause: this.family_history_mother_death_cause,
//       family_history_siblings: this.family_history_siblings,
//       diagnostic_formulation_summary: this.diagnostic_formulation_summary,
//       diagnostic_formulation_features: this.diagnostic_formulation_features,
//       diagnostic_formulation_psychodynamic: this.diagnostic_formulation_psychodynamic,
//       premorbid_personality_passive_active: this.premorbid_personality_passive_active,
//       premorbid_personality_assertive: this.premorbid_personality_assertive,
//       premorbid_personality_introvert_extrovert: this.premorbid_personality_introvert_extrovert,
//       premorbid_personality_traits: this.premorbid_personality_traits,
//       premorbid_personality_hobbies: this.premorbid_personality_hobbies,
//       premorbid_personality_habits: this.premorbid_personality_habits,
//       premorbid_personality_alcohol_drugs: this.premorbid_personality_alcohol_drugs,
//       physical_appearance: this.physical_appearance,
//       physical_body_build: this.physical_body_build,
//       physical_pallor: this.physical_pallor,
//       physical_icterus: this.physical_icterus,
//       physical_oedema: this.physical_oedema,
//       physical_lymphadenopathy: this.physical_lymphadenopathy,
//       physical_pulse: this.physical_pulse,
//       physical_bp: this.physical_bp,
//       physical_height: this.physical_height,
//       physical_weight: this.physical_weight,
//       physical_waist: this.physical_waist,
//       physical_fundus: this.physical_fundus,
//       physical_cvs_apex: this.physical_cvs_apex,
//       physical_cvs_regularity: this.physical_cvs_regularity,
//       physical_cvs_heart_sounds: this.physical_cvs_heart_sounds,
//       physical_cvs_murmurs: this.physical_cvs_murmurs,
//       physical_chest_expansion: this.physical_chest_expansion,
//       physical_chest_percussion: this.physical_chest_percussion,
//       physical_chest_adventitious: this.physical_chest_adventitious,
//       physical_abdomen_tenderness: this.physical_abdomen_tenderness,
//       physical_abdomen_mass: this.physical_abdomen_mass,
//       physical_abdomen_bowel_sounds: this.physical_abdomen_bowel_sounds,
//       physical_cns_cranial: this.physical_cns_cranial,
//       physical_cns_motor_sensory: this.physical_cns_motor_sensory,
//       physical_cns_rigidity: this.physical_cns_rigidity,
//       physical_cns_involuntary: this.physical_cns_involuntary,
//       physical_cns_superficial_reflexes: this.physical_cns_superficial_reflexes,
//       physical_cns_dtrs: this.physical_cns_dtrs,
//       physical_cns_plantar: this.physical_cns_plantar,
//       physical_cns_cerebellar: this.physical_cns_cerebellar,
//       mse_general_demeanour: this.mse_general_demeanour,
//       mse_general_tidy: this.mse_general_tidy,
//       mse_general_awareness: this.mse_general_awareness,
//       mse_general_cooperation: this.mse_general_cooperation,
//       mse_psychomotor_verbalization: this.mse_psychomotor_verbalization,
//       mse_psychomotor_pressure: this.mse_psychomotor_pressure,
//       mse_psychomotor_tension: this.mse_psychomotor_tension,
//       mse_psychomotor_posture: this.mse_psychomotor_posture,
//       mse_psychomotor_mannerism: this.mse_psychomotor_mannerism,
//       mse_psychomotor_catatonic: this.mse_psychomotor_catatonic,
//       mse_affect_subjective: this.mse_affect_subjective,
//       mse_affect_tone: this.mse_affect_tone,
//       mse_affect_resting: this.mse_affect_resting,
//       mse_affect_fluctuation: this.mse_affect_fluctuation,
//       mse_thought_flow: this.mse_thought_flow,
//       mse_thought_form: this.mse_thought_form,
//       mse_thought_content: this.mse_thought_content,
//       mse_cognitive_consciousness: this.mse_cognitive_consciousness,
//       mse_cognitive_orientation_time: this.mse_cognitive_orientation_time,
//       mse_cognitive_orientation_place: this.mse_cognitive_orientation_place,
//       mse_cognitive_orientation_person: this.mse_cognitive_orientation_person,
//       mse_cognitive_memory_immediate: this.mse_cognitive_memory_immediate,
//       mse_cognitive_memory_recent: this.mse_cognitive_memory_recent,
//       mse_cognitive_memory_remote: this.mse_cognitive_memory_remote,
//       mse_cognitive_subtraction: this.mse_cognitive_subtraction,
//       mse_cognitive_digit_span: this.mse_cognitive_digit_span,
//       mse_cognitive_counting: this.mse_cognitive_counting,
//       mse_cognitive_general_knowledge: this.mse_cognitive_general_knowledge,
//       mse_cognitive_calculation: this.mse_cognitive_calculation,
//       mse_cognitive_similarities: this.mse_cognitive_similarities,
//       mse_cognitive_proverbs: this.mse_cognitive_proverbs,
//       mse_insight_understanding: this.mse_insight_understanding,
//       mse_insight_judgement: this.mse_insight_judgement,
//       education_start_age: this.education_start_age,
//       education_highest_class: this.education_highest_class,
//       education_performance: this.education_performance,
//       education_disciplinary: this.education_disciplinary,
//       education_peer_relationship: this.education_peer_relationship,
//       education_hobbies: this.education_hobbies,
//       education_special_abilities: this.education_special_abilities,
//       education_discontinue_reason: this.education_discontinue_reason,
//       occupation_jobs: this.occupation_jobs,
//       sexual_menarche_age: this.sexual_menarche_age,
//       sexual_menarche_reaction: this.sexual_menarche_reaction,
//       sexual_education: this.sexual_education,
//       sexual_masturbation: this.sexual_masturbation,
//       sexual_contact: this.sexual_contact,
//       sexual_premarital_extramarital: this.sexual_premarital_extramarital,
//       sexual_marriage_arranged: this.sexual_marriage_arranged,
//       sexual_marriage_date: this.sexual_marriage_date,
//       sexual_spouse_age: this.sexual_spouse_age,
//       sexual_spouse_occupation: this.sexual_spouse_occupation,
//       sexual_adjustment_general: this.sexual_adjustment_general,
//       sexual_adjustment_sexual: this.sexual_adjustment_sexual,
//       sexual_children: this.sexual_children,
//       sexual_problems: this.sexual_problems,
//       religion_type: this.religion_type,
//       religion_participation: this.religion_participation,
//       religion_changes: this.religion_changes,
//       living_residents: this.living_residents,
//       living_income_sharing: this.living_income_sharing,
//       living_expenses: this.living_expenses,
//       living_kitchen: this.living_kitchen,
//       living_domestic_conflicts: this.living_domestic_conflicts,
//       living_social_class: this.living_social_class,
//       living_inlaws: this.living_inlaws,
//       home_situation_childhood: this.home_situation_childhood,
//       home_situation_parents_relationship: this.home_situation_parents_relationship,
//       home_situation_socioeconomic: this.home_situation_socioeconomic,
//       home_situation_interpersonal: this.home_situation_interpersonal,
//       personal_birth_date: this.personal_birth_date,
//       personal_birth_place: this.personal_birth_place,
//       personal_delivery_type: this.personal_delivery_type,
//       personal_complications_prenatal: this.personal_complications_prenatal,
//       personal_complications_natal: this.personal_complications_natal,
//       personal_complications_postnatal: this.personal_complications_postnatal,
//       development_weaning_age: this.development_weaning_age,
//       development_first_words: this.development_first_words,
//       development_three_words: this.development_three_words,
//       development_walking: this.development_walking,
//       development_neurotic_traits: this.development_neurotic_traits,
//       development_nail_biting: this.development_nail_biting,
//       development_bedwetting: this.development_bedwetting,
//       development_phobias: this.development_phobias,
//       development_childhood_illness: this.development_childhood_illness,
//       provisional_diagnosis: this.provisional_diagnosis,
//       treatment_plan: this.treatment_plan,
//       consultant_comments: this.consultant_comments
//     };
//   }
// }

// module.exports = ADLFile;



































const db = require('../config/database');
const { encrypt, decrypt, encryptObject, decryptObject } = require('../utils/encryption');
const encryptionFields = require('../utils/encryptionFields');

class ADLFile {
  constructor(data) {
    // Decrypt sensitive fields after receiving from database
    const decryptedData = decryptObject(data, encryptionFields.adlFile);
    
    this.id = decryptedData.id;
    this.patient_id = data.patient_id;
    this.adl_no = data.adl_no;
    this.created_by = data.created_by;
    this.clinical_proforma_id = data.clinical_proforma_id;
    this.file_status = data.file_status;
    this.physical_file_location = data.physical_file_location;
    this.file_created_date = data.file_created_date;
    this.last_accessed_date = data.last_accessed_date;
    this.last_accessed_by = data.last_accessed_by;
    this.total_visits = data.total_visits;
    this.is_active = data.is_active;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    
    // Joined fields from patients table
    // IMPORTANT: patient_name comes from registered_patient table and is encrypted there
    // We need to decrypt it separately since it's not in adlFile encryption fields
    // The decrypt() function handles null/empty values and decryption failures gracefully
    if (data.patient_name) {
      this.patient_name = decrypt(data.patient_name);
    } else {
      this.patient_name = data.patient_name || null;
    }
    this.cr_no = data.cr_no;
    this.psy_no = data.psy_no;
    
    // Joined fields from users table
    this.created_by_name = data.created_by_name;
    this.created_by_role = data.created_by_role;
    this.last_accessed_by_name = data.last_accessed_by_name;
    
    // Joined fields from clinical_proforma table
    // assigned_doctor is the ID (integer), assigned_doctor_name and assigned_doctor_role come from users table JOIN
    this.assigned_doctor = data.assigned_doctor || null;
    this.assigned_doctor_name = data.assigned_doctor_name || null;
    this.assigned_doctor_role = data.assigned_doctor_role || null;
    this.proforma_visit_date = data.proforma_visit_date || null;
    
    // Complex Case Data Fields (stored in ADL file, not in clinical_proforma)
    // History of Present Illness - Expanded
    this.history_narrative = decryptedData.history_narrative;
    this.history_specific_enquiry = decryptedData.history_specific_enquiry;
    this.history_drug_intake = decryptedData.history_drug_intake;
    this.history_treatment_place = decryptedData.history_treatment_place;
    this.history_treatment_dates = decryptedData.history_treatment_dates;
    this.history_treatment_drugs = decryptedData.history_treatment_drugs;
    this.history_treatment_response = decryptedData.history_treatment_response;
    
    // Multiple Informants (JSONB)
    this.informants = data.informants ? (typeof data.informants === 'string' ? JSON.parse(data.informants) : data.informants) : [];
    
    // Complaints and Duration (JSONB)
    this.complaints_patient = data.complaints_patient ? (typeof data.complaints_patient === 'string' ? JSON.parse(data.complaints_patient) : data.complaints_patient) : [];
    this.complaints_informant = data.complaints_informant ? (typeof data.complaints_informant === 'string' ? JSON.parse(data.complaints_informant) : data.complaints_informant) : [];
    
    // Past History - Detailed
    this.past_history_medical = decryptedData.past_history_medical;
    this.past_history_psychiatric_dates = decryptedData.past_history_psychiatric_dates;
    this.past_history_psychiatric_diagnosis = decryptedData.past_history_psychiatric_diagnosis;
    this.past_history_psychiatric_treatment = decryptedData.past_history_psychiatric_treatment;
    this.past_history_psychiatric_interim = decryptedData.past_history_psychiatric_interim;
    this.past_history_psychiatric_recovery = decryptedData.past_history_psychiatric_recovery;
    
    // Family History - Detailed
    this.family_history_father_age = decryptedData.family_history_father_age;
    this.family_history_father_education = decryptedData.family_history_father_education;
    this.family_history_father_occupation = decryptedData.family_history_father_occupation;
    this.family_history_father_personality = decryptedData.family_history_father_personality;
    this.family_history_father_deceased = decryptedData.family_history_father_deceased || false;
    this.family_history_father_death_age = decryptedData.family_history_father_death_age;
    this.family_history_father_death_date = decryptedData.family_history_father_death_date;
    this.family_history_father_death_cause = decryptedData.family_history_father_death_cause;
    this.family_history_mother_age = decryptedData.family_history_mother_age;
    this.family_history_mother_education = decryptedData.family_history_mother_education;
    this.family_history_mother_occupation = decryptedData.family_history_mother_occupation;
    this.family_history_mother_personality = decryptedData.family_history_mother_personality;
    this.family_history_mother_deceased = decryptedData.family_history_mother_deceased || false;
    this.family_history_mother_death_age = decryptedData.family_history_mother_death_age;
    this.family_history_mother_death_date = decryptedData.family_history_mother_death_date;
    this.family_history_mother_death_cause = decryptedData.family_history_mother_death_cause;
    this.family_history_siblings = data.family_history_siblings ? (typeof data.family_history_siblings === 'string' ? JSON.parse(data.family_history_siblings) : data.family_history_siblings) : [];
    
    // Diagnostic Formulation
    this.diagnostic_formulation_summary = decryptedData.diagnostic_formulation_summary;
    this.diagnostic_formulation_features = decryptedData.diagnostic_formulation_features;
    this.diagnostic_formulation_psychodynamic = decryptedData.diagnostic_formulation_psychodynamic;
    
    // Premorbid Personality
    this.premorbid_personality_passive_active = decryptedData.premorbid_personality_passive_active;
    this.premorbid_personality_assertive = decryptedData.premorbid_personality_assertive;
    this.premorbid_personality_introvert_extrovert = decryptedData.premorbid_personality_introvert_extrovert;
    this.premorbid_personality_traits = decryptedData.premorbid_personality_traits ? (typeof decryptedData.premorbid_personality_traits === 'string' ? JSON.parse(decryptedData.premorbid_personality_traits) : decryptedData.premorbid_personality_traits) : [];
    this.premorbid_personality_hobbies = decryptedData.premorbid_personality_hobbies;
    this.premorbid_personality_habits = decryptedData.premorbid_personality_habits;
    this.premorbid_personality_alcohol_drugs = decryptedData.premorbid_personality_alcohol_drugs;
    
    // Physical Examination - Comprehensive
    this.physical_appearance = decryptedData.physical_appearance;
    this.physical_body_build = decryptedData.physical_body_build;
    this.physical_pallor = decryptedData.physical_pallor || false;
    this.physical_icterus = decryptedData.physical_icterus || false;
    this.physical_oedema = decryptedData.physical_oedema || false;
    this.physical_lymphadenopathy = decryptedData.physical_lymphadenopathy || false;
    this.physical_pulse = decryptedData.physical_pulse;
    this.physical_bp = decryptedData.physical_bp;
    this.physical_height = decryptedData.physical_height;
    this.physical_weight = decryptedData.physical_weight;
    this.physical_waist = decryptedData.physical_waist;
    this.physical_fundus = decryptedData.physical_fundus;
    this.physical_cvs_apex = decryptedData.physical_cvs_apex;
    this.physical_cvs_regularity = decryptedData.physical_cvs_regularity;
    this.physical_cvs_heart_sounds = decryptedData.physical_cvs_heart_sounds;
    this.physical_cvs_murmurs = decryptedData.physical_cvs_murmurs;
    this.physical_chest_expansion = decryptedData.physical_chest_expansion;
    this.physical_chest_percussion = decryptedData.physical_chest_percussion;
    this.physical_chest_adventitious = decryptedData.physical_chest_adventitious;
    this.physical_abdomen_tenderness = decryptedData.physical_abdomen_tenderness;
    this.physical_abdomen_mass = decryptedData.physical_abdomen_mass;
    this.physical_abdomen_bowel_sounds = decryptedData.physical_abdomen_bowel_sounds;
    this.physical_cns_cranial = decryptedData.physical_cns_cranial;
    this.physical_cns_motor_sensory = decryptedData.physical_cns_motor_sensory;
    this.physical_cns_rigidity = decryptedData.physical_cns_rigidity;
    this.physical_cns_involuntary = decryptedData.physical_cns_involuntary;
    this.physical_cns_superficial_reflexes = decryptedData.physical_cns_superficial_reflexes;
    this.physical_cns_dtrs = decryptedData.physical_cns_dtrs;
    this.physical_cns_plantar = decryptedData.physical_cns_plantar;
    this.physical_cns_cerebellar = decryptedData.physical_cns_cerebellar;
    
    // Mental Status Examination - Expanded
    this.mse_general_demeanour = decryptedData.mse_general_demeanour;
    this.mse_general_tidy = decryptedData.mse_general_tidy;
    this.mse_general_awareness = decryptedData.mse_general_awareness;
    this.mse_general_cooperation = decryptedData.mse_general_cooperation;
    this.mse_psychomotor_verbalization = decryptedData.mse_psychomotor_verbalization;
    this.mse_psychomotor_pressure = decryptedData.mse_psychomotor_pressure;
    this.mse_psychomotor_tension = decryptedData.mse_psychomotor_tension;
    this.mse_psychomotor_posture = decryptedData.mse_psychomotor_posture;
    this.mse_psychomotor_mannerism = decryptedData.mse_psychomotor_mannerism;
    this.mse_psychomotor_catatonic = decryptedData.mse_psychomotor_catatonic;
    this.mse_affect_subjective = decryptedData.mse_affect_subjective;
    this.mse_affect_tone = decryptedData.mse_affect_tone;
    this.mse_affect_resting = decryptedData.mse_affect_resting;
    this.mse_affect_fluctuation = decryptedData.mse_affect_fluctuation;
    this.mse_thought_flow = decryptedData.mse_thought_flow;
    this.mse_thought_form = decryptedData.mse_thought_form;
    this.mse_thought_content = decryptedData.mse_thought_content;
    this.mse_cognitive_consciousness = decryptedData.mse_cognitive_consciousness;
    this.mse_cognitive_orientation_time = decryptedData.mse_cognitive_orientation_time;
    this.mse_cognitive_orientation_place = decryptedData.mse_cognitive_orientation_place;
    this.mse_cognitive_orientation_person = decryptedData.mse_cognitive_orientation_person;
    this.mse_cognitive_memory_immediate = decryptedData.mse_cognitive_memory_immediate;
    this.mse_cognitive_memory_recent = decryptedData.mse_cognitive_memory_recent;
    this.mse_cognitive_memory_remote = decryptedData.mse_cognitive_memory_remote;
    this.mse_cognitive_subtraction = decryptedData.mse_cognitive_subtraction;
    this.mse_cognitive_digit_span = decryptedData.mse_cognitive_digit_span;
    this.mse_cognitive_counting = decryptedData.mse_cognitive_counting;
    this.mse_cognitive_general_knowledge = decryptedData.mse_cognitive_general_knowledge;
    this.mse_cognitive_calculation = decryptedData.mse_cognitive_calculation;
    this.mse_cognitive_similarities = decryptedData.mse_cognitive_similarities;
    this.mse_cognitive_proverbs = decryptedData.mse_cognitive_proverbs;
    this.mse_insight_understanding = decryptedData.mse_insight_understanding;
    this.mse_insight_judgement = decryptedData.mse_insight_judgement;
    
    // Educational History
    this.education_start_age = decryptedData.education_start_age;
    this.education_highest_class = decryptedData.education_highest_class;
    this.education_performance = decryptedData.education_performance;
    this.education_disciplinary = decryptedData.education_disciplinary;
    this.education_peer_relationship = decryptedData.education_peer_relationship;
    this.education_hobbies = decryptedData.education_hobbies;
    this.education_special_abilities = decryptedData.education_special_abilities;
    this.education_discontinue_reason = decryptedData.education_discontinue_reason;
    
    // Occupational History (JSONB)
    this.occupation_jobs = data.occupation_jobs ? (typeof data.occupation_jobs === 'string' ? JSON.parse(data.occupation_jobs) : data.occupation_jobs) : [];
    
    // Sexual and Marital History
    this.sexual_menarche_age = decryptedData.sexual_menarche_age;
    this.sexual_menarche_reaction = decryptedData.sexual_menarche_reaction;
    this.sexual_education = decryptedData.sexual_education;
    this.sexual_masturbation = decryptedData.sexual_masturbation;
    this.sexual_contact = decryptedData.sexual_contact;
    this.sexual_premarital_extramarital = decryptedData.sexual_premarital_extramarital;
    this.sexual_marriage_arranged = decryptedData.sexual_marriage_arranged;
    this.sexual_marriage_date = decryptedData.sexual_marriage_date;
    this.sexual_spouse_age = decryptedData.sexual_spouse_age;
    this.sexual_spouse_occupation = decryptedData.sexual_spouse_occupation;
    this.sexual_adjustment_general = decryptedData.sexual_adjustment_general;
    this.sexual_adjustment_sexual = decryptedData.sexual_adjustment_sexual;
    this.sexual_children = decryptedData.sexual_children ? (typeof decryptedData.sexual_children === 'string' ? JSON.parse(decryptedData.sexual_children) : decryptedData.sexual_children) : [];
    this.sexual_problems = decryptedData.sexual_problems;
    
    // Religion
    this.religion_type = decryptedData.religion_type;
    this.religion_participation = decryptedData.religion_participation;
    this.religion_changes = decryptedData.religion_changes;
    
    // Present Living Situation
    this.living_residents = decryptedData.living_residents ? (typeof decryptedData.living_residents === 'string' ? JSON.parse(decryptedData.living_residents) : decryptedData.living_residents) : [];
    this.living_income_sharing = decryptedData.living_income_sharing;
    this.living_expenses = decryptedData.living_expenses;
    this.living_kitchen = decryptedData.living_kitchen;
    this.living_domestic_conflicts = decryptedData.living_domestic_conflicts;
    this.living_social_class = decryptedData.living_social_class;
    this.living_inlaws = decryptedData.living_inlaws ? (typeof decryptedData.living_inlaws === 'string' ? JSON.parse(decryptedData.living_inlaws) : decryptedData.living_inlaws) : [];
    
    // General Home Situation and Early Development
    this.home_situation_childhood = decryptedData.home_situation_childhood;
    this.home_situation_parents_relationship = decryptedData.home_situation_parents_relationship;
    this.home_situation_socioeconomic = decryptedData.home_situation_socioeconomic;
    this.home_situation_interpersonal = decryptedData.home_situation_interpersonal;
    this.personal_birth_date = decryptedData.personal_birth_date;
    this.personal_birth_place = decryptedData.personal_birth_place;
    this.personal_delivery_type = decryptedData.personal_delivery_type;
    this.personal_complications_prenatal = decryptedData.personal_complications_prenatal;
    this.personal_complications_natal = decryptedData.personal_complications_natal;
    this.personal_complications_postnatal = decryptedData.personal_complications_postnatal;
    this.development_weaning_age = decryptedData.development_weaning_age;
    this.development_first_words = decryptedData.development_first_words;
    this.development_three_words = decryptedData.development_three_words;
    this.development_walking = decryptedData.development_walking;
    this.development_neurotic_traits = decryptedData.development_neurotic_traits;
    this.development_nail_biting = decryptedData.development_nail_biting;
    this.development_bedwetting = decryptedData.development_bedwetting;
    this.development_phobias = decryptedData.development_phobias;
    this.development_childhood_illness = decryptedData.development_childhood_illness;
    
    // Provisional Diagnosis and Treatment Plan
    this.provisional_diagnosis = decryptedData.provisional_diagnosis;
    this.treatment_plan = decryptedData.treatment_plan;
    
    // Comments of the Consultant
    this.consultant_comments = decryptedData.consultant_comments;
  }

  // Static method to create ADL file with transaction support
  static async createWithTransaction(client, adlData) {
    const {
      patient_id, adl_no, created_by, clinical_proforma_id,
      file_status = 'created', file_created_date = new Date(), total_visits = 1,
      history_narrative, history_specific_enquiry, history_drug_intake,
      history_treatment_place, history_treatment_dates, history_treatment_drugs, 
      history_treatment_response, informants, complaints_patient, complaints_informant,
      past_history_medical, past_history_psychiatric_dates, past_history_psychiatric_diagnosis,
      past_history_psychiatric_treatment, past_history_psychiatric_interim, 
      past_history_psychiatric_recovery, family_history_father_age, 
      family_history_father_education, family_history_father_occupation,
      family_history_father_personality, family_history_father_deceased, 
      family_history_father_death_age, family_history_father_death_date, 
      family_history_father_death_cause, family_history_mother_age, 
      family_history_mother_education, family_history_mother_occupation,
      family_history_mother_personality, family_history_mother_deceased, 
      family_history_mother_death_age, family_history_mother_death_date, 
      family_history_mother_death_cause, family_history_siblings,
      diagnostic_formulation_summary, diagnostic_formulation_features, 
      diagnostic_formulation_psychodynamic, premorbid_personality_passive_active, 
      premorbid_personality_assertive, premorbid_personality_introvert_extrovert,
      premorbid_personality_traits, premorbid_personality_hobbies, 
      premorbid_personality_habits, premorbid_personality_alcohol_drugs,
      physical_appearance, physical_body_build, physical_pallor, physical_icterus, 
      physical_oedema, physical_lymphadenopathy, physical_pulse, physical_bp, 
      physical_height, physical_weight, physical_waist, physical_fundus,
      physical_cvs_apex, physical_cvs_regularity, physical_cvs_heart_sounds, 
      physical_cvs_murmurs, physical_chest_expansion, physical_chest_percussion, 
      physical_chest_adventitious, physical_abdomen_tenderness, physical_abdomen_mass, 
      physical_abdomen_bowel_sounds, physical_cns_cranial, physical_cns_motor_sensory, 
      physical_cns_rigidity, physical_cns_involuntary, physical_cns_superficial_reflexes, 
      physical_cns_dtrs, physical_cns_plantar, physical_cns_cerebellar,
      mse_general_demeanour, mse_general_tidy, mse_general_awareness, 
      mse_general_cooperation, mse_psychomotor_verbalization, mse_psychomotor_pressure, 
      mse_psychomotor_tension, mse_psychomotor_posture, mse_psychomotor_mannerism, 
      mse_psychomotor_catatonic, mse_affect_subjective, mse_affect_tone,
      mse_affect_resting, mse_affect_fluctuation, mse_thought_flow, mse_thought_form, 
      mse_thought_content, mse_cognitive_consciousness, mse_cognitive_orientation_time, 
      mse_cognitive_orientation_place, mse_cognitive_orientation_person, 
      mse_cognitive_memory_immediate, mse_cognitive_memory_recent,
      mse_cognitive_memory_remote, mse_cognitive_subtraction, mse_cognitive_digit_span, 
      mse_cognitive_counting, mse_cognitive_general_knowledge, mse_cognitive_calculation, 
      mse_cognitive_similarities, mse_cognitive_proverbs, mse_insight_understanding, 
      mse_insight_judgement, education_start_age, education_highest_class, 
      education_performance, education_disciplinary, education_peer_relationship, 
      education_hobbies, education_special_abilities, education_discontinue_reason,
      occupation_jobs, sexual_menarche_age, sexual_menarche_reaction, sexual_education, 
      sexual_masturbation, sexual_contact, sexual_premarital_extramarital, 
      sexual_marriage_arranged, sexual_marriage_date, sexual_spouse_age, 
      sexual_spouse_occupation, sexual_adjustment_general, sexual_adjustment_sexual,
      sexual_children, sexual_problems, religion_type, religion_participation, 
      religion_changes, living_residents, living_income_sharing, living_expenses, 
      living_kitchen, living_domestic_conflicts, living_social_class, living_inlaws, 
      home_situation_childhood, home_situation_parents_relationship,
      home_situation_socioeconomic, home_situation_interpersonal, personal_birth_date, 
      personal_birth_place, personal_delivery_type, personal_complications_prenatal, 
      personal_complications_natal, personal_complications_postnatal,
      development_weaning_age, development_first_words, development_three_words, 
      development_walking, development_neurotic_traits, development_nail_biting, 
      development_bedwetting, development_phobias, development_childhood_illness, 
      provisional_diagnosis, treatment_plan, consultant_comments
    } = adlData;

    // Convert arrays to JSONB
    const informantsJson = informants ? JSON.stringify(Array.isArray(informants) ? informants : []) : '[]';
    const complaintsPatientJson = complaints_patient ? JSON.stringify(Array.isArray(complaints_patient) ? complaints_patient : []) : '[]';
    const complaintsInformantJson = complaints_informant ? JSON.stringify(Array.isArray(complaints_informant) ? complaints_informant : []) : '[]';
    const familyHistorySiblingsJson = family_history_siblings ? JSON.stringify(Array.isArray(family_history_siblings) ? family_history_siblings : []) : '[]';
    const premorbidPersonalityTraitsJson = premorbid_personality_traits ? JSON.stringify(Array.isArray(premorbid_personality_traits) ? premorbid_personality_traits : []) : '[]';
    const occupationJobsJson = occupation_jobs ? JSON.stringify(Array.isArray(occupation_jobs) ? occupation_jobs : []) : '[]';
    const sexualChildrenJson = sexual_children ? JSON.stringify(Array.isArray(sexual_children) ? sexual_children : []) : '[]';
    const livingResidentsJson = living_residents ? JSON.stringify(Array.isArray(living_residents) ? living_residents : []) : '[]';
    const livingInlawsJson = living_inlaws ? JSON.stringify(Array.isArray(living_inlaws) ? living_inlaws : []) : '[]';

    // Encrypt sensitive fields before saving
    const encryptedAdlData = encryptObject(adlData, encryptionFields.adlFile);

    const result = await client.query(
      `INSERT INTO adl_files (
        patient_id, adl_no, created_by, clinical_proforma_id, file_status, 
        file_created_date, total_visits, history_narrative, history_specific_enquiry, 
        history_drug_intake, history_treatment_place, history_treatment_dates,
        history_treatment_drugs, history_treatment_response, informants, 
        complaints_patient, complaints_informant, past_history_medical, 
        past_history_psychiatric_dates, past_history_psychiatric_diagnosis,
        past_history_psychiatric_treatment, past_history_psychiatric_interim, 
        past_history_psychiatric_recovery, family_history_father_age, 
        family_history_father_education, family_history_father_occupation,
        family_history_father_personality, family_history_father_deceased, 
        family_history_father_death_age, family_history_father_death_date, 
        family_history_father_death_cause, family_history_mother_age, 
        family_history_mother_education, family_history_mother_occupation,
        family_history_mother_personality, family_history_mother_deceased, 
        family_history_mother_death_age, family_history_mother_death_date, 
        family_history_mother_death_cause, family_history_siblings,
        diagnostic_formulation_summary, diagnostic_formulation_features, 
        diagnostic_formulation_psychodynamic, premorbid_personality_passive_active, 
        premorbid_personality_assertive, premorbid_personality_introvert_extrovert,
        premorbid_personality_traits, premorbid_personality_hobbies, 
        premorbid_personality_habits, premorbid_personality_alcohol_drugs,
        physical_appearance, physical_body_build, physical_pallor, physical_icterus, 
        physical_oedema, physical_lymphadenopathy, physical_pulse, physical_bp, 
        physical_height, physical_weight, physical_waist, physical_fundus,
        physical_cvs_apex, physical_cvs_regularity, physical_cvs_heart_sounds, 
        physical_cvs_murmurs, physical_chest_expansion, physical_chest_percussion, 
        physical_chest_adventitious, physical_abdomen_tenderness, physical_abdomen_mass, 
        physical_abdomen_bowel_sounds, physical_cns_cranial, physical_cns_motor_sensory, 
        physical_cns_rigidity, physical_cns_involuntary, physical_cns_superficial_reflexes, 
        physical_cns_dtrs, physical_cns_plantar, physical_cns_cerebellar,
        mse_general_demeanour, mse_general_tidy, mse_general_awareness, 
        mse_general_cooperation, mse_psychomotor_verbalization, mse_psychomotor_pressure, 
        mse_psychomotor_tension, mse_psychomotor_posture, mse_psychomotor_mannerism, 
        mse_psychomotor_catatonic, mse_affect_subjective, mse_affect_tone,
        mse_affect_resting, mse_affect_fluctuation, mse_thought_flow, mse_thought_form, 
        mse_thought_content, mse_cognitive_consciousness, mse_cognitive_orientation_time, 
        mse_cognitive_orientation_place, mse_cognitive_orientation_person, 
        mse_cognitive_memory_immediate, mse_cognitive_memory_recent,
        mse_cognitive_memory_remote, mse_cognitive_subtraction, mse_cognitive_digit_span, 
        mse_cognitive_counting, mse_cognitive_general_knowledge, mse_cognitive_calculation, 
        mse_cognitive_similarities, mse_cognitive_proverbs, mse_insight_understanding, 
        mse_insight_judgement, education_start_age, education_highest_class, 
        education_performance, education_disciplinary, education_peer_relationship, 
        education_hobbies, education_special_abilities, education_discontinue_reason,
        occupation_jobs, sexual_menarche_age, sexual_menarche_reaction, sexual_education, 
        sexual_masturbation, sexual_contact, sexual_premarital_extramarital, 
        sexual_marriage_arranged, sexual_marriage_date, sexual_spouse_age, 
        sexual_spouse_occupation, sexual_adjustment_general, sexual_adjustment_sexual,
        sexual_children, sexual_problems, religion_type, religion_participation, 
        religion_changes, living_residents, living_income_sharing, living_expenses, 
        living_kitchen, living_domestic_conflicts, living_social_class, living_inlaws, 
        home_situation_childhood, home_situation_parents_relationship,
        home_situation_socioeconomic, home_situation_interpersonal, personal_birth_date, 
        personal_birth_place, personal_delivery_type, personal_complications_prenatal, 
        personal_complications_natal, personal_complications_postnatal,
        development_weaning_age, development_first_words, development_three_words, 
        development_walking, development_neurotic_traits, development_nail_biting, 
        development_bedwetting, development_phobias, development_childhood_illness, 
        provisional_diagnosis, treatment_plan, consultant_comments
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb, 
        $16::jsonb, $17::jsonb, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, 
        $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40::jsonb,
        $41, $42, $43, $44, $45, $46, $47::jsonb, $48, $49, $50, $51, $52, $53, 
        $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67, $68, 
        $69, $70, $71, $72, $73, $74, $75, $76, $77, $78, $79, $80, $81, $82, $83, 
        $84, $85, $86, $87, $88, $89, $90, $91, $92, $93, $94, $95, $96, $97, $98,
        $99, $100, $101, $102, $103, $104, $105, $106, $107, $108, $109, $110,
        $111, $112, $113, $114, $115, $116, $117, $118, $119::jsonb, $120, $121, 
        $122, $123, $124, $125, $126, $127, $128, $129, $130, $131, $132, $133, 
        $134, $135, $136, $137, $138, $139, $140, $141, $142, $143, $144, $145, 
        $146, $147, $148, $149, $150, $151, $152, $153, $154, $155, $156, $157, 
        $158, $159, $160::jsonb, $161, $162, $163, $164, $165, $166, $167, $168,
        $169, $170, $171, $172, $173, $174, $175, $176, $177::jsonb, $178, $179, 
        $180, $181, $182, $183, $184, $185, $186::jsonb, $187, $188, $189, $190, 
        $191, $192, $193, $194, $195, $196, $197, $198, $199, $200, $201, $202, 
        $203, $204, $205, $206, $207, $208, $209, $210, $211, $212
      ) RETURNING *`,
      [
        patient_id, adl_no, created_by, clinical_proforma_id, file_status, 
        file_created_date, total_visits, 
        encryptedAdlData.history_narrative || history_narrative, 
        encryptedAdlData.history_specific_enquiry || history_specific_enquiry, 
        encryptedAdlData.history_drug_intake || history_drug_intake, 
        encryptedAdlData.history_treatment_place || history_treatment_place, 
        encryptedAdlData.history_treatment_dates || history_treatment_dates,
        encryptedAdlData.history_treatment_drugs || history_treatment_drugs, 
        encryptedAdlData.history_treatment_response || history_treatment_response, 
        informantsJson, 
        complaintsPatientJson, complaintsInformantJson, 
        encryptedAdlData.past_history_medical || past_history_medical, 
        encryptedAdlData.past_history_psychiatric_dates || past_history_psychiatric_dates, 
        encryptedAdlData.past_history_psychiatric_diagnosis || past_history_psychiatric_diagnosis,
        encryptedAdlData.past_history_psychiatric_treatment || past_history_psychiatric_treatment, 
        encryptedAdlData.past_history_psychiatric_interim || past_history_psychiatric_interim, 
        encryptedAdlData.past_history_psychiatric_recovery || past_history_psychiatric_recovery, 
        encryptedAdlData.family_history_father_age || family_history_father_age, 
        encryptedAdlData.family_history_father_education || family_history_father_education, 
        encryptedAdlData.family_history_father_occupation || family_history_father_occupation,
        encryptedAdlData.family_history_father_personality || family_history_father_personality, 
        family_history_father_deceased, 
        encryptedAdlData.family_history_father_death_age || family_history_father_death_age, 
        encryptedAdlData.family_history_father_death_date || family_history_father_death_date, 
        encryptedAdlData.family_history_father_death_cause || family_history_father_death_cause, 
        encryptedAdlData.family_history_mother_age || family_history_mother_age, 
        encryptedAdlData.family_history_mother_education || family_history_mother_education, 
        encryptedAdlData.family_history_mother_occupation || family_history_mother_occupation,
        encryptedAdlData.family_history_mother_personality || family_history_mother_personality, 
        family_history_mother_deceased, 
        encryptedAdlData.family_history_mother_death_age || family_history_mother_death_age, 
        encryptedAdlData.family_history_mother_death_date || family_history_mother_death_date, 
        encryptedAdlData.family_history_mother_death_cause || family_history_mother_death_cause, 
        familyHistorySiblingsJson,
        encryptedAdlData.diagnostic_formulation_summary || diagnostic_formulation_summary, 
        encryptedAdlData.diagnostic_formulation_features || diagnostic_formulation_features, 
        encryptedAdlData.diagnostic_formulation_psychodynamic || diagnostic_formulation_psychodynamic, 
        encryptedAdlData.premorbid_personality_passive_active || premorbid_personality_passive_active, 
        encryptedAdlData.premorbid_personality_assertive || premorbid_personality_assertive, 
        encryptedAdlData.premorbid_personality_introvert_extrovert || premorbid_personality_introvert_extrovert,
        premorbidPersonalityTraitsJson, 
        encryptedAdlData.premorbid_personality_hobbies || premorbid_personality_hobbies, 
        encryptedAdlData.premorbid_personality_habits || premorbid_personality_habits, 
        encryptedAdlData.premorbid_personality_alcohol_drugs || premorbid_personality_alcohol_drugs,
        encryptedAdlData.physical_appearance || physical_appearance, 
        encryptedAdlData.physical_body_build || physical_body_build, 
        physical_pallor, physical_icterus, 
        physical_oedema, physical_lymphadenopathy, 
        encryptedAdlData.physical_pulse || physical_pulse, 
        encryptedAdlData.physical_bp || physical_bp, 
        encryptedAdlData.physical_height || physical_height, 
        encryptedAdlData.physical_weight || physical_weight, 
        encryptedAdlData.physical_waist || physical_waist, 
        encryptedAdlData.physical_fundus || physical_fundus,
        encryptedAdlData.physical_cvs_apex || physical_cvs_apex, 
        encryptedAdlData.physical_cvs_regularity || physical_cvs_regularity, 
        encryptedAdlData.physical_cvs_heart_sounds || physical_cvs_heart_sounds, 
        encryptedAdlData.physical_cvs_murmurs || physical_cvs_murmurs, 
        encryptedAdlData.physical_chest_expansion || physical_chest_expansion, 
        encryptedAdlData.physical_chest_percussion || physical_chest_percussion, 
        encryptedAdlData.physical_chest_adventitious || physical_chest_adventitious, 
        encryptedAdlData.physical_abdomen_tenderness || physical_abdomen_tenderness, 
        encryptedAdlData.physical_abdomen_mass || physical_abdomen_mass, 
        encryptedAdlData.physical_abdomen_bowel_sounds || physical_abdomen_bowel_sounds, 
        encryptedAdlData.physical_cns_cranial || physical_cns_cranial, 
        encryptedAdlData.physical_cns_motor_sensory || physical_cns_motor_sensory, 
        encryptedAdlData.physical_cns_rigidity || physical_cns_rigidity, 
        encryptedAdlData.physical_cns_involuntary || physical_cns_involuntary, 
        encryptedAdlData.physical_cns_superficial_reflexes || physical_cns_superficial_reflexes, 
        encryptedAdlData.physical_cns_dtrs || physical_cns_dtrs, 
        encryptedAdlData.physical_cns_plantar || physical_cns_plantar, 
        encryptedAdlData.physical_cns_cerebellar || physical_cns_cerebellar,
        encryptedAdlData.mse_general_demeanour || mse_general_demeanour, 
        encryptedAdlData.mse_general_tidy || mse_general_tidy, 
        encryptedAdlData.mse_general_awareness || mse_general_awareness, 
        encryptedAdlData.mse_general_cooperation || mse_general_cooperation, 
        encryptedAdlData.mse_psychomotor_verbalization || mse_psychomotor_verbalization, 
        encryptedAdlData.mse_psychomotor_pressure || mse_psychomotor_pressure, 
        encryptedAdlData.mse_psychomotor_tension || mse_psychomotor_tension, 
        encryptedAdlData.mse_psychomotor_posture || mse_psychomotor_posture, 
        encryptedAdlData.mse_psychomotor_mannerism || mse_psychomotor_mannerism, 
        encryptedAdlData.mse_psychomotor_catatonic || mse_psychomotor_catatonic, 
        encryptedAdlData.mse_affect_subjective || mse_affect_subjective, 
        encryptedAdlData.mse_affect_tone || mse_affect_tone,
        encryptedAdlData.mse_affect_resting || mse_affect_resting, 
        encryptedAdlData.mse_affect_fluctuation || mse_affect_fluctuation, 
        encryptedAdlData.mse_thought_flow || mse_thought_flow, 
        encryptedAdlData.mse_thought_form || mse_thought_form, 
        encryptedAdlData.mse_thought_content || mse_thought_content, 
        encryptedAdlData.mse_cognitive_consciousness || mse_cognitive_consciousness, 
        encryptedAdlData.mse_cognitive_orientation_time || mse_cognitive_orientation_time, 
        encryptedAdlData.mse_cognitive_orientation_place || mse_cognitive_orientation_place, 
        encryptedAdlData.mse_cognitive_orientation_person || mse_cognitive_orientation_person, 
        encryptedAdlData.mse_cognitive_memory_immediate || mse_cognitive_memory_immediate, 
        encryptedAdlData.mse_cognitive_memory_recent || mse_cognitive_memory_recent,
        encryptedAdlData.mse_cognitive_memory_remote || mse_cognitive_memory_remote, 
        encryptedAdlData.mse_cognitive_subtraction || mse_cognitive_subtraction, 
        encryptedAdlData.mse_cognitive_digit_span || mse_cognitive_digit_span, 
        encryptedAdlData.mse_cognitive_counting || mse_cognitive_counting, 
        encryptedAdlData.mse_cognitive_general_knowledge || mse_cognitive_general_knowledge, 
        encryptedAdlData.mse_cognitive_calculation || mse_cognitive_calculation, 
        encryptedAdlData.mse_cognitive_similarities || mse_cognitive_similarities, 
        encryptedAdlData.mse_cognitive_proverbs || mse_cognitive_proverbs, 
        encryptedAdlData.mse_insight_understanding || mse_insight_understanding, 
        encryptedAdlData.mse_insight_judgement || mse_insight_judgement, 
        education_start_age, education_highest_class, 
        encryptedAdlData.education_performance || education_performance, 
        encryptedAdlData.education_disciplinary || education_disciplinary, 
        encryptedAdlData.education_peer_relationship || education_peer_relationship, 
        encryptedAdlData.education_hobbies || education_hobbies, 
        encryptedAdlData.education_special_abilities || education_special_abilities, 
        encryptedAdlData.education_discontinue_reason || education_discontinue_reason,
        occupationJobsJson, sexual_menarche_age, 
        encryptedAdlData.sexual_menarche_reaction || sexual_menarche_reaction, 
        encryptedAdlData.sexual_education || sexual_education, 
        encryptedAdlData.sexual_masturbation || sexual_masturbation, 
        encryptedAdlData.sexual_contact || sexual_contact, 
        encryptedAdlData.sexual_premarital_extramarital || sexual_premarital_extramarital, 
        sexual_marriage_arranged, sexual_marriage_date, sexual_spouse_age, 
        encryptedAdlData.sexual_spouse_occupation || sexual_spouse_occupation, 
        encryptedAdlData.sexual_adjustment_general || sexual_adjustment_general, 
        encryptedAdlData.sexual_adjustment_sexual || sexual_adjustment_sexual,
        sexualChildrenJson, 
        encryptedAdlData.sexual_problems || sexual_problems, 
        encryptedAdlData.religion_type || religion_type, 
        encryptedAdlData.religion_participation || religion_participation, 
        encryptedAdlData.religion_changes || religion_changes, 
        livingResidentsJson, 
        encryptedAdlData.living_income_sharing || living_income_sharing, 
        encryptedAdlData.living_expenses || living_expenses, 
        encryptedAdlData.living_kitchen || living_kitchen, 
        encryptedAdlData.living_domestic_conflicts || living_domestic_conflicts, 
        encryptedAdlData.living_social_class || living_social_class, 
        livingInlawsJson, 
        encryptedAdlData.home_situation_childhood || home_situation_childhood, 
        encryptedAdlData.home_situation_parents_relationship || home_situation_parents_relationship,
        encryptedAdlData.home_situation_socioeconomic || home_situation_socioeconomic, 
        encryptedAdlData.home_situation_interpersonal || home_situation_interpersonal, 
        personal_birth_date, 
        encryptedAdlData.personal_birth_place || personal_birth_place, 
        encryptedAdlData.personal_delivery_type || personal_delivery_type, 
        encryptedAdlData.personal_complications_prenatal || personal_complications_prenatal, 
        encryptedAdlData.personal_complications_natal || personal_complications_natal, 
        encryptedAdlData.personal_complications_postnatal || personal_complications_postnatal,
        development_weaning_age, development_first_words, development_three_words, 
        development_walking, 
        encryptedAdlData.development_neurotic_traits || development_neurotic_traits, 
        encryptedAdlData.development_nail_biting || development_nail_biting, 
        encryptedAdlData.development_bedwetting || development_bedwetting, 
        encryptedAdlData.development_phobias || development_phobias, 
        encryptedAdlData.development_childhood_illness || development_childhood_illness, 
        encryptedAdlData.provisional_diagnosis || provisional_diagnosis, 
        encryptedAdlData.treatment_plan || treatment_plan, 
        encryptedAdlData.consultant_comments || consultant_comments
      ]
    );

    return new ADLFile(result.rows[0]);
  }

  // Static method to create ADL file (without transaction)
  static async create(adlData) {
    try {
      // Verify that required columns exist in the table
      const columnCheck = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'adl_files' 
        AND column_name IN ('history_narrative', 'informants', 'physical_appearance', 'mse_general_demeanour')
      `);
      
      if (columnCheck.rows.length < 4) {
        throw new Error(
          'Database schema mismatch: The adl_files table is missing required complex case columns. ' +
          'Please run the migration script: Backend/database/add_complex_case_columns_to_adl_files.sql ' +
          `(Found only ${columnCheck.rows.length} of 4 test columns)`
        );
      }
      const {
        patient_id, adl_no, created_by, clinical_proforma_id,
        file_status = 'created', file_created_date = new Date(), total_visits = 1,
        history_narrative, history_specific_enquiry, history_drug_intake,
        history_treatment_place, history_treatment_dates, history_treatment_drugs, 
        history_treatment_response, informants, complaints_patient, complaints_informant,
        past_history_medical, past_history_psychiatric_dates, past_history_psychiatric_diagnosis,
        past_history_psychiatric_treatment, past_history_psychiatric_interim, 
        past_history_psychiatric_recovery, family_history_father_age, 
        family_history_father_education, family_history_father_occupation,
        family_history_father_personality, family_history_father_deceased, 
        family_history_father_death_age, family_history_father_death_date, 
        family_history_father_death_cause, family_history_mother_age, 
        family_history_mother_education, family_history_mother_occupation,
        family_history_mother_personality, family_history_mother_deceased, 
        family_history_mother_death_age, family_history_mother_death_date, 
        family_history_mother_death_cause, family_history_siblings,
        diagnostic_formulation_summary, diagnostic_formulation_features, 
        diagnostic_formulation_psychodynamic, premorbid_personality_passive_active, 
        premorbid_personality_assertive, premorbid_personality_introvert_extrovert,
        premorbid_personality_traits, premorbid_personality_hobbies, 
        premorbid_personality_habits, premorbid_personality_alcohol_drugs,
        physical_appearance, physical_body_build, physical_pallor, physical_icterus, 
        physical_oedema, physical_lymphadenopathy, physical_pulse, physical_bp, 
        physical_height, physical_weight, physical_waist, physical_fundus,
        physical_cvs_apex, physical_cvs_regularity, physical_cvs_heart_sounds, 
        physical_cvs_murmurs, physical_chest_expansion, physical_chest_percussion, 
        physical_chest_adventitious, physical_abdomen_tenderness, physical_abdomen_mass, 
        physical_abdomen_bowel_sounds, physical_cns_cranial, physical_cns_motor_sensory, 
        physical_cns_rigidity, physical_cns_involuntary, physical_cns_superficial_reflexes, 
        physical_cns_dtrs, physical_cns_plantar, physical_cns_cerebellar,
        mse_general_demeanour, mse_general_tidy, mse_general_awareness, 
        mse_general_cooperation, mse_psychomotor_verbalization, mse_psychomotor_pressure, 
        mse_psychomotor_tension, mse_psychomotor_posture, mse_psychomotor_mannerism, 
        mse_psychomotor_catatonic, mse_affect_subjective, mse_affect_tone,
        mse_affect_resting, mse_affect_fluctuation, mse_thought_flow, mse_thought_form, 
        mse_thought_content, mse_cognitive_consciousness, mse_cognitive_orientation_time, 
        mse_cognitive_orientation_place, mse_cognitive_orientation_person, 
        mse_cognitive_memory_immediate, mse_cognitive_memory_recent,
        mse_cognitive_memory_remote, mse_cognitive_subtraction, mse_cognitive_digit_span, 
        mse_cognitive_counting, mse_cognitive_general_knowledge, mse_cognitive_calculation, 
        mse_cognitive_similarities, mse_cognitive_proverbs, mse_insight_understanding, 
        mse_insight_judgement, education_start_age, education_highest_class, 
        education_performance, education_disciplinary, education_peer_relationship, 
        education_hobbies, education_special_abilities, education_discontinue_reason,
        occupation_jobs, sexual_menarche_age, sexual_menarche_reaction, sexual_education, 
        sexual_masturbation, sexual_contact, sexual_premarital_extramarital, 
        sexual_marriage_arranged, sexual_marriage_date, sexual_spouse_age, 
        sexual_spouse_occupation, sexual_adjustment_general, sexual_adjustment_sexual,
        sexual_children, sexual_problems, religion_type, religion_participation, 
        religion_changes, living_residents, living_income_sharing, living_expenses, 
        living_kitchen, living_domestic_conflicts, living_social_class, living_inlaws, 
        home_situation_childhood, home_situation_parents_relationship,
        home_situation_socioeconomic, home_situation_interpersonal, personal_birth_date, 
        personal_birth_place, personal_delivery_type, personal_complications_prenatal, 
        personal_complications_natal, personal_complications_postnatal,
        development_weaning_age, development_first_words, development_three_words, 
        development_walking, development_neurotic_traits, development_nail_biting, 
        development_bedwetting, development_phobias, development_childhood_illness, 
        provisional_diagnosis, treatment_plan, consultant_comments
      } = adlData;

      // Convert arrays to JSONB
      const informantsJson = informants ? JSON.stringify(Array.isArray(informants) ? informants : []) : '[]';
      const complaintsPatientJson = complaints_patient ? JSON.stringify(Array.isArray(complaints_patient) ? complaints_patient : []) : '[]';
      const complaintsInformantJson = complaints_informant ? JSON.stringify(Array.isArray(complaints_informant) ? complaints_informant : []) : '[]';
      const familyHistorySiblingsJson = family_history_siblings ? JSON.stringify(Array.isArray(family_history_siblings) ? family_history_siblings : []) : '[]';
      const premorbidPersonalityTraitsJson = premorbid_personality_traits ? JSON.stringify(Array.isArray(premorbid_personality_traits) ? premorbid_personality_traits : []) : '[]';
      const occupationJobsJson = occupation_jobs ? JSON.stringify(Array.isArray(occupation_jobs) ? occupation_jobs : []) : '[]';
      const sexualChildrenJson = sexual_children ? JSON.stringify(Array.isArray(sexual_children) ? sexual_children : []) : '[]';
      const livingResidentsJson = living_residents ? JSON.stringify(Array.isArray(living_residents) ? living_residents : []) : '[]';
      const livingInlawsJson = living_inlaws ? JSON.stringify(Array.isArray(living_inlaws) ? living_inlaws : []) : '[]';

      // Encrypt sensitive fields before saving
      const encryptedAdlData = encryptObject(adlData, encryptionFields.adlFile);

      // Use db.query directly instead of managing separate transaction
      // This allows it to work within the existing transaction context from ClinicalProforma.create()
      const result = await db.query(
        `INSERT INTO adl_files (
          patient_id, adl_no, created_by, clinical_proforma_id, file_status, 
          file_created_date, total_visits, history_narrative, history_specific_enquiry, 
          history_drug_intake, history_treatment_place, history_treatment_dates,
          history_treatment_drugs, history_treatment_response, informants, 
          complaints_patient, complaints_informant, past_history_medical, 
          past_history_psychiatric_dates, past_history_psychiatric_diagnosis,
          past_history_psychiatric_treatment, past_history_psychiatric_interim, 
          past_history_psychiatric_recovery, family_history_father_age, 
          family_history_father_education, family_history_father_occupation,
          family_history_father_personality, family_history_father_deceased, 
          family_history_father_death_age, family_history_father_death_date, 
          family_history_father_death_cause, family_history_mother_age, 
          family_history_mother_education, family_history_mother_occupation,
          family_history_mother_personality, family_history_mother_deceased, 
          family_history_mother_death_age, family_history_mother_death_date, 
          family_history_mother_death_cause, family_history_siblings,
          diagnostic_formulation_summary, diagnostic_formulation_features, 
          diagnostic_formulation_psychodynamic, premorbid_personality_passive_active, 
          premorbid_personality_assertive, premorbid_personality_introvert_extrovert,
          premorbid_personality_traits, premorbid_personality_hobbies, 
          premorbid_personality_habits, premorbid_personality_alcohol_drugs,
          physical_appearance, physical_body_build, physical_pallor, physical_icterus, 
          physical_oedema, physical_lymphadenopathy, physical_pulse, physical_bp, 
          physical_height, physical_weight, physical_waist, physical_fundus,
          physical_cvs_apex, physical_cvs_regularity, physical_cvs_heart_sounds, 
          physical_cvs_murmurs, physical_chest_expansion, physical_chest_percussion, 
          physical_chest_adventitious, physical_abdomen_tenderness, physical_abdomen_mass, 
          physical_abdomen_bowel_sounds, physical_cns_cranial, physical_cns_motor_sensory, 
          physical_cns_rigidity, physical_cns_involuntary, physical_cns_superficial_reflexes, 
          physical_cns_dtrs, physical_cns_plantar, physical_cns_cerebellar,
          mse_general_demeanour, mse_general_tidy, mse_general_awareness, 
          mse_general_cooperation, mse_psychomotor_verbalization, mse_psychomotor_pressure, 
          mse_psychomotor_tension, mse_psychomotor_posture, mse_psychomotor_mannerism, 
          mse_psychomotor_catatonic, mse_affect_subjective, mse_affect_tone,
          mse_affect_resting, mse_affect_fluctuation, mse_thought_flow, mse_thought_form, 
          mse_thought_content, mse_cognitive_consciousness, mse_cognitive_orientation_time, 
          mse_cognitive_orientation_place, mse_cognitive_orientation_person, 
          mse_cognitive_memory_immediate, mse_cognitive_memory_recent,
          mse_cognitive_memory_remote, mse_cognitive_subtraction, mse_cognitive_digit_span, 
          mse_cognitive_counting, mse_cognitive_general_knowledge, mse_cognitive_calculation, 
          mse_cognitive_similarities, mse_cognitive_proverbs, mse_insight_understanding, 
          mse_insight_judgement, education_start_age, education_highest_class, 
          education_performance, education_disciplinary, education_peer_relationship, 
          education_hobbies, education_special_abilities, education_discontinue_reason,
          occupation_jobs, sexual_menarche_age, sexual_menarche_reaction, sexual_education, 
          sexual_masturbation, sexual_contact, sexual_premarital_extramarital, 
          sexual_marriage_arranged, sexual_marriage_date, sexual_spouse_age, 
          sexual_spouse_occupation, sexual_adjustment_general, sexual_adjustment_sexual,
          sexual_children, sexual_problems, religion_type, religion_participation, 
          religion_changes, living_residents, living_income_sharing, living_expenses, 
          living_kitchen, living_domestic_conflicts, living_social_class, living_inlaws, 
          home_situation_childhood, home_situation_parents_relationship,
          home_situation_socioeconomic, home_situation_interpersonal, personal_birth_date, 
          personal_birth_place, personal_delivery_type, personal_complications_prenatal, 
          personal_complications_natal, personal_complications_postnatal,
          development_weaning_age, development_first_words, development_three_words, 
          development_walking, development_neurotic_traits, development_nail_biting, 
          development_bedwetting, development_phobias, development_childhood_illness, 
          provisional_diagnosis, treatment_plan, consultant_comments
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb, 
          $16::jsonb, $17::jsonb, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, 
          $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40::jsonb,
          $41, $42, $43, $44, $45, $46, $47::jsonb, $48, $49, $50, $51, $52, $53, 
          $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67, $68, 
          $69, $70, $71, $72, $73, $74, $75, $76, $77, $78, $79, $80, $81, $82, $83, 
          $84, $85, $86, $87, $88, $89, $90, $91, $92, $93, $94, $95, $96, $97, $98,
          $99, $100, $101, $102, $103, $104, $105, $106, $107, $108, $109, $110,
          $111, $112, $113, $114, $115, $116, $117, $118, $119::jsonb, $120, $121, 
          $122, $123, $124, $125, $126, $127, $128, $129, $130, $131, $132, $133, 
          $134, $135, $136, $137, $138, $139, $140, $141, $142, $143, $144, $145, 
          $146, $147, $148, $149, $150, $151, $152, $153, $154, $155, $156, $157, 
          $158, $159, $160::jsonb, $161, $162, $163, $164, $165, $166, $167, $168
        ) RETURNING *`,
        [
          patient_id, adl_no, created_by, clinical_proforma_id, file_status, 
          file_created_date, total_visits, 
          encryptedAdlData.history_narrative || history_narrative, 
          encryptedAdlData.history_specific_enquiry || history_specific_enquiry, 
          encryptedAdlData.history_drug_intake || history_drug_intake, 
          encryptedAdlData.history_treatment_place || history_treatment_place, 
          encryptedAdlData.history_treatment_dates || history_treatment_dates,
          encryptedAdlData.history_treatment_drugs || history_treatment_drugs, 
          encryptedAdlData.history_treatment_response || history_treatment_response, 
          informantsJson, 
          complaintsPatientJson, complaintsInformantJson, 
          encryptedAdlData.past_history_medical || past_history_medical, 
          encryptedAdlData.past_history_psychiatric_dates || past_history_psychiatric_dates, 
          encryptedAdlData.past_history_psychiatric_diagnosis || past_history_psychiatric_diagnosis,
          encryptedAdlData.past_history_psychiatric_treatment || past_history_psychiatric_treatment, 
          encryptedAdlData.past_history_psychiatric_interim || past_history_psychiatric_interim, 
          encryptedAdlData.past_history_psychiatric_recovery || past_history_psychiatric_recovery, 
          encryptedAdlData.family_history_father_age || family_history_father_age, 
          encryptedAdlData.family_history_father_education || family_history_father_education, 
          encryptedAdlData.family_history_father_occupation || family_history_father_occupation,
          encryptedAdlData.family_history_father_personality || family_history_father_personality, 
          family_history_father_deceased, 
          encryptedAdlData.family_history_father_death_age || family_history_father_death_age, 
          encryptedAdlData.family_history_father_death_date || family_history_father_death_date, 
          encryptedAdlData.family_history_father_death_cause || family_history_father_death_cause, 
          encryptedAdlData.family_history_mother_age || family_history_mother_age, 
          encryptedAdlData.family_history_mother_education || family_history_mother_education, 
          encryptedAdlData.family_history_mother_occupation || family_history_mother_occupation,
          encryptedAdlData.family_history_mother_personality || family_history_mother_personality, 
          family_history_mother_deceased, 
          encryptedAdlData.family_history_mother_death_age || family_history_mother_death_age, 
          encryptedAdlData.family_history_mother_death_date || family_history_mother_death_date, 
          encryptedAdlData.family_history_mother_death_cause || family_history_mother_death_cause, 
          familyHistorySiblingsJson,
          encryptedAdlData.diagnostic_formulation_summary || diagnostic_formulation_summary, 
          encryptedAdlData.diagnostic_formulation_features || diagnostic_formulation_features, 
          encryptedAdlData.diagnostic_formulation_psychodynamic || diagnostic_formulation_psychodynamic, 
          encryptedAdlData.premorbid_personality_passive_active || premorbid_personality_passive_active, 
          encryptedAdlData.premorbid_personality_assertive || premorbid_personality_assertive, 
          encryptedAdlData.premorbid_personality_introvert_extrovert || premorbid_personality_introvert_extrovert,
          premorbidPersonalityTraitsJson, 
          encryptedAdlData.premorbid_personality_hobbies || premorbid_personality_hobbies, 
          encryptedAdlData.premorbid_personality_habits || premorbid_personality_habits, 
          encryptedAdlData.premorbid_personality_alcohol_drugs || premorbid_personality_alcohol_drugs,
          encryptedAdlData.physical_appearance || physical_appearance, 
          encryptedAdlData.physical_body_build || physical_body_build, 
          physical_pallor, physical_icterus, 
          physical_oedema, physical_lymphadenopathy, 
          encryptedAdlData.physical_pulse || physical_pulse, 
          encryptedAdlData.physical_bp || physical_bp, 
          encryptedAdlData.physical_height || physical_height, 
          encryptedAdlData.physical_weight || physical_weight, 
          encryptedAdlData.physical_waist || physical_waist, 
          encryptedAdlData.physical_fundus || physical_fundus,
          encryptedAdlData.physical_cvs_apex || physical_cvs_apex, 
          encryptedAdlData.physical_cvs_regularity || physical_cvs_regularity, 
          encryptedAdlData.physical_cvs_heart_sounds || physical_cvs_heart_sounds, 
          encryptedAdlData.physical_cvs_murmurs || physical_cvs_murmurs, 
          encryptedAdlData.physical_chest_expansion || physical_chest_expansion, 
          encryptedAdlData.physical_chest_percussion || physical_chest_percussion, 
          encryptedAdlData.physical_chest_adventitious || physical_chest_adventitious, 
          encryptedAdlData.physical_abdomen_tenderness || physical_abdomen_tenderness, 
          encryptedAdlData.physical_abdomen_mass || physical_abdomen_mass, 
          encryptedAdlData.physical_abdomen_bowel_sounds || physical_abdomen_bowel_sounds, 
          encryptedAdlData.physical_cns_cranial || physical_cns_cranial, 
          encryptedAdlData.physical_cns_motor_sensory || physical_cns_motor_sensory, 
          encryptedAdlData.physical_cns_rigidity || physical_cns_rigidity, 
          encryptedAdlData.physical_cns_involuntary || physical_cns_involuntary, 
          encryptedAdlData.physical_cns_superficial_reflexes || physical_cns_superficial_reflexes, 
          encryptedAdlData.physical_cns_dtrs || physical_cns_dtrs, 
          encryptedAdlData.physical_cns_plantar || physical_cns_plantar, 
          encryptedAdlData.physical_cns_cerebellar || physical_cns_cerebellar,
          encryptedAdlData.mse_general_demeanour || mse_general_demeanour, 
          encryptedAdlData.mse_general_tidy || mse_general_tidy, 
          encryptedAdlData.mse_general_awareness || mse_general_awareness, 
          encryptedAdlData.mse_general_cooperation || mse_general_cooperation, 
          encryptedAdlData.mse_psychomotor_verbalization || mse_psychomotor_verbalization, 
          encryptedAdlData.mse_psychomotor_pressure || mse_psychomotor_pressure, 
          encryptedAdlData.mse_psychomotor_tension || mse_psychomotor_tension, 
          encryptedAdlData.mse_psychomotor_posture || mse_psychomotor_posture, 
          encryptedAdlData.mse_psychomotor_mannerism || mse_psychomotor_mannerism, 
          encryptedAdlData.mse_psychomotor_catatonic || mse_psychomotor_catatonic, 
          encryptedAdlData.mse_affect_subjective || mse_affect_subjective, 
          encryptedAdlData.mse_affect_tone || mse_affect_tone,
          encryptedAdlData.mse_affect_resting || mse_affect_resting, 
          encryptedAdlData.mse_affect_fluctuation || mse_affect_fluctuation, 
          encryptedAdlData.mse_thought_flow || mse_thought_flow, 
          encryptedAdlData.mse_thought_form || mse_thought_form, 
          encryptedAdlData.mse_thought_content || mse_thought_content, 
          encryptedAdlData.mse_cognitive_consciousness || mse_cognitive_consciousness, 
          encryptedAdlData.mse_cognitive_orientation_time || mse_cognitive_orientation_time, 
          encryptedAdlData.mse_cognitive_orientation_place || mse_cognitive_orientation_place, 
          encryptedAdlData.mse_cognitive_orientation_person || mse_cognitive_orientation_person, 
          encryptedAdlData.mse_cognitive_memory_immediate || mse_cognitive_memory_immediate, 
          encryptedAdlData.mse_cognitive_memory_recent || mse_cognitive_memory_recent,
          encryptedAdlData.mse_cognitive_memory_remote || mse_cognitive_memory_remote, 
          encryptedAdlData.mse_cognitive_subtraction || mse_cognitive_subtraction, 
          encryptedAdlData.mse_cognitive_digit_span || mse_cognitive_digit_span, 
          encryptedAdlData.mse_cognitive_counting || mse_cognitive_counting, 
          encryptedAdlData.mse_cognitive_general_knowledge || mse_cognitive_general_knowledge, 
          encryptedAdlData.mse_cognitive_calculation || mse_cognitive_calculation, 
          encryptedAdlData.mse_cognitive_similarities || mse_cognitive_similarities, 
          encryptedAdlData.mse_cognitive_proverbs || mse_cognitive_proverbs, 
          encryptedAdlData.mse_insight_understanding || mse_insight_understanding, 
          encryptedAdlData.mse_insight_judgement || mse_insight_judgement, 
          encryptedAdlData.education_start_age || education_start_age, 
          encryptedAdlData.education_highest_class || education_highest_class, 
          encryptedAdlData.education_performance || education_performance, 
          encryptedAdlData.education_disciplinary || education_disciplinary, 
          encryptedAdlData.education_peer_relationship || education_peer_relationship, 
          encryptedAdlData.education_hobbies || education_hobbies, 
          encryptedAdlData.education_special_abilities || education_special_abilities, 
          encryptedAdlData.education_discontinue_reason || education_discontinue_reason,
          occupationJobsJson, 
          encryptedAdlData.sexual_menarche_age || sexual_menarche_age, 
          encryptedAdlData.sexual_menarche_reaction || sexual_menarche_reaction, 
          encryptedAdlData.sexual_education || sexual_education, 
          encryptedAdlData.sexual_masturbation || sexual_masturbation, 
          encryptedAdlData.sexual_contact || sexual_contact, 
          encryptedAdlData.sexual_premarital_extramarital || sexual_premarital_extramarital, 
          encryptedAdlData.sexual_marriage_arranged || sexual_marriage_arranged, 
          encryptedAdlData.sexual_marriage_date || sexual_marriage_date, 
          encryptedAdlData.sexual_spouse_age || sexual_spouse_age, 
          encryptedAdlData.sexual_spouse_occupation || sexual_spouse_occupation, 
          encryptedAdlData.sexual_adjustment_general || sexual_adjustment_general, 
          encryptedAdlData.sexual_adjustment_sexual || sexual_adjustment_sexual,
          sexualChildrenJson, 
          encryptedAdlData.sexual_problems || sexual_problems, 
          encryptedAdlData.religion_type || religion_type, 
          encryptedAdlData.religion_participation || religion_participation, 
          encryptedAdlData.religion_changes || religion_changes, 
          livingResidentsJson, 
          encryptedAdlData.living_income_sharing || living_income_sharing, 
          encryptedAdlData.living_expenses || living_expenses, 
          encryptedAdlData.living_kitchen || living_kitchen, 
          encryptedAdlData.living_domestic_conflicts || living_domestic_conflicts, 
          encryptedAdlData.living_social_class || living_social_class, 
          livingInlawsJson, 
          encryptedAdlData.home_situation_childhood || home_situation_childhood, 
          encryptedAdlData.home_situation_parents_relationship || home_situation_parents_relationship,
          encryptedAdlData.home_situation_socioeconomic || home_situation_socioeconomic, 
          encryptedAdlData.home_situation_interpersonal || home_situation_interpersonal, 
          encryptedAdlData.personal_birth_date || personal_birth_date, 
          encryptedAdlData.personal_birth_place || personal_birth_place, 
          encryptedAdlData.personal_delivery_type || personal_delivery_type, 
          encryptedAdlData.personal_complications_prenatal || personal_complications_prenatal, 
          encryptedAdlData.personal_complications_natal || personal_complications_natal, 
          encryptedAdlData.personal_complications_postnatal || personal_complications_postnatal,
          encryptedAdlData.development_weaning_age || development_weaning_age, 
          encryptedAdlData.development_first_words || development_first_words, 
          encryptedAdlData.development_three_words || development_three_words, 
          encryptedAdlData.development_walking || development_walking, 
          encryptedAdlData.development_neurotic_traits || development_neurotic_traits, 
          encryptedAdlData.development_nail_biting || development_nail_biting, 
          encryptedAdlData.development_bedwetting || development_bedwetting, 
          encryptedAdlData.development_phobias || development_phobias, 
          encryptedAdlData.development_childhood_illness || development_childhood_illness, 
          encryptedAdlData.provisional_diagnosis || provisional_diagnosis, 
          encryptedAdlData.treatment_plan || treatment_plan, 
          encryptedAdlData.consultant_comments || consultant_comments
        ]
      );

      return new ADLFile(result.rows[0]);
    } catch (error) {
      console.error('ADLFile.create error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint
      });
      
      // Provide more helpful error message
      if (error.message && error.message.includes('more expressions than target columns')) {
        throw new Error(`Database schema mismatch: The adl_files table is missing required columns. Please run the migration script: Backend/database/add_complex_case_columns_to_adl_files.sql. Original error: ${error.message}`);
      }
      
      if (error.message && error.message.includes('does not exist')) {
        throw new Error(`Database schema mismatch: Some columns are missing from the adl_files table. Please run the migration script: Backend/database/add_complex_case_columns_to_adl_files.sql. Original error: ${error.message}`);
      }
      
      throw error;
    }
  }

  // Find ADL file by ID
  static async findById(id) {
    try {
      const result = await db.query(
        `SELECT af.*, p.name as patient_name, p.cr_no, p.psy_no, 
                u1.name as created_by_name, u1.role as created_by_role,
                u2.name as last_accessed_by_name
         FROM adl_files af
         LEFT JOIN registered_patient p ON af.patient_id = p.id
         LEFT JOIN users u1 ON af.created_by = u1.id
         LEFT JOIN users u2 ON af.last_accessed_by = u2.id
         WHERE af.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new ADLFile(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find ADL file by ADL number
  static async findByADLNo(adl_no) {
    try {
      const result = await db.query(
        `SELECT af.*, p.name as patient_name, p.cr_no, p.psy_no, 
                u1.name as created_by_name, u1.role as created_by_role,
                u2.name as last_accessed_by_name
         FROM adl_files af
         LEFT JOIN registered_patient p ON af.patient_id = p.id
         LEFT JOIN users u1 ON af.created_by = u1.id
         LEFT JOIN users u2 ON af.last_accessed_by = u2.id
         WHERE af.adl_no = $1`,
        [adl_no]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new ADLFile(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find ADL file by patient ID (supports both UUID and integer)
  static async findByPatientId(patient_id) {
    try {
      // Check if ID is a UUID (contains hyphens and is 36 chars) or integer
      const isUUID = typeof patient_id === 'string' && patient_id.includes('-') && patient_id.length === 36;
      
      let query;
      let queryParam;
      
      if (isUUID) {
        // For UUID, explicitly cast parameter to UUID type
        query = `
          SELECT af.*, 
                 p.name as patient_name, p.cr_no, p.psy_no, 
                 u1.name as created_by_name, u1.role as created_by_role,
                 u2.name as last_accessed_by_name,
                 cp.assigned_doctor, cp.visit_date as proforma_visit_date,
                 u3.name as assigned_doctor_name, u3.role as assigned_doctor_role,
                 cp.id as clinical_proforma_id
          FROM adl_files af
          LEFT JOIN registered_patient p ON af.patient_id = p.id
          LEFT JOIN users u1 ON af.created_by = u1.id
          LEFT JOIN users u2 ON af.last_accessed_by = u2.id
          LEFT JOIN clinical_proforma cp ON af.clinical_proforma_id = cp.id
          LEFT JOIN users u3 ON cp.assigned_doctor = u3.id
          WHERE af.patient_id = $1::uuid
          ORDER BY af.file_created_date DESC
        `;
        queryParam = patient_id;
      } else {
        // For integer, use integer comparison
        const patientIdNum = parseInt(patient_id, 10);
        if (isNaN(patientIdNum)) {
          console.error('[ADLFile.findByPatientId] Invalid patient_id:', patient_id);
          return [];
        }
        query = `
          SELECT af.*, 
                 p.name as patient_name, p.cr_no, p.psy_no, 
                 u1.name as created_by_name, u1.role as created_by_role,
                 u2.name as last_accessed_by_name,
                 cp.assigned_doctor, cp.visit_date as proforma_visit_date,
                 u3.name as assigned_doctor_name, u3.role as assigned_doctor_role,
                 cp.id as clinical_proforma_id
          FROM adl_files af
          LEFT JOIN registered_patient p ON af.patient_id = p.id
          LEFT JOIN users u1 ON af.created_by = u1.id
          LEFT JOIN users u2 ON af.last_accessed_by = u2.id
          LEFT JOIN clinical_proforma cp ON af.clinical_proforma_id = cp.id
          LEFT JOIN users u3 ON cp.assigned_doctor = u3.id
          WHERE af.patient_id = $1
          ORDER BY af.file_created_date DESC
        `;
        queryParam = patientIdNum;
      }

      let result;
      try {
        result = await db.query(query, [queryParam]);
      } catch (queryError) {
        // If UUID casting fails, try text comparison as fallback
        if (isUUID && queryError.message && (
          queryError.message.includes('invalid input syntax for type uuid') ||
          queryError.message.includes('cannot cast') ||
          queryError.message.includes('uuid')
        )) {
          console.warn(`[ADLFile.findByPatientId] UUID cast failed, trying text comparison: ${queryError.message}`);
          const fallbackQuery = `
            SELECT af.*, 
                   p.name as patient_name, p.cr_no, p.psy_no, 
                   u1.name as created_by_name, u1.role as created_by_role,
                   u2.name as last_accessed_by_name,
                   cp.assigned_doctor, cp.visit_date as proforma_visit_date,
                   u3.name as assigned_doctor_name, u3.role as assigned_doctor_role,
                   cp.id as clinical_proforma_id
            FROM adl_files af
            LEFT JOIN registered_patient p ON af.patient_id::text = p.id::text
            LEFT JOIN users u1 ON af.created_by = u1.id
            LEFT JOIN users u2 ON af.last_accessed_by = u2.id
            LEFT JOIN clinical_proforma cp ON af.clinical_proforma_id = cp.id
            LEFT JOIN users u3 ON cp.assigned_doctor = u3.id
            WHERE af.patient_id::text = $1
            ORDER BY af.file_created_date DESC
          `;
          result = await db.query(fallbackQuery, [String(patient_id)]);
        } else {
          throw queryError;
        }
      }

      console.log(`[ADLFile.findByPatientId] Found ${result.rows.length} ADL files for patient_id: ${patient_id}`);

      return result.rows.map(row => new ADLFile(row));
    } catch (error) {
      console.error('[ADLFile.findByPatientId] Error:', error);
      throw error;
    }
  }

  // Find ADL file by clinical proforma ID
  static async findByClinicalProformaId(clinical_proforma_id) {
    try {
      const result = await db.query(
        `SELECT af.*, p.name as patient_name, p.cr_no, p.psy_no, 
                u1.name as created_by_name, u1.role as created_by_role,
                u2.name as last_accessed_by_name
         FROM adl_files af
         LEFT JOIN registered_patient p ON af.patient_id = p.id
         LEFT JOIN users u1 ON af.created_by = u1.id
         LEFT JOIN users u2 ON af.last_accessed_by = u2.id
         WHERE af.clinical_proforma_id = $1`,
        [clinical_proforma_id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new ADLFile(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get all ADL files with pagination and filters
  static async findAll(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT af.*, 
                p.name as patient_name, p.cr_no, p.psy_no,
                u1.name as created_by_name, u1.role as created_by_role,
                u2.name as last_accessed_by_name,
                cp.assigned_doctor, cp.visit_date as proforma_visit_date,
                u3.name as assigned_doctor_name, u3.role as assigned_doctor_role,
                cp.id as clinical_proforma_id,
                cp.doctor_decision
        FROM adl_files af
        LEFT JOIN registered_patient p ON af.patient_id = p.id
        LEFT JOIN users u1 ON af.created_by = u1.id
        LEFT JOIN users u2 ON af.last_accessed_by = u2.id
        LEFT JOIN clinical_proforma cp ON af.clinical_proforma_id = cp.id
        LEFT JOIN users u3 ON cp.assigned_doctor = u3.id
        WHERE 1=1
      `;
      let countQuery = 'SELECT COUNT(*) FROM adl_files af WHERE 1=1';
      const params = [];
      let paramCount = 0;

      // By default, only show ADL files associated with complex cases
      if (filters.include_all !== true) {
        query += ` AND af.clinical_proforma_id IS NOT NULL AND cp.doctor_decision = 'complex_case'`;
        countQuery = `
          SELECT COUNT(*) FROM adl_files af
          LEFT JOIN clinical_proforma cp ON af.clinical_proforma_id = cp.id
          WHERE 1=1 AND af.clinical_proforma_id IS NOT NULL AND cp.doctor_decision = 'complex_case'
        `;
      }

      let finalCountParams = [];
      let countParamCounter = 0;

      if (filters.file_status) {
        paramCount++;
        query += ` AND af.file_status = $${paramCount}`;
        params.push(filters.file_status);
        
        countParamCounter++;
        countQuery += ` AND af.file_status = $${countParamCounter}`;
        finalCountParams.push(filters.file_status);
      }

      if (filters.is_active !== undefined) {
        paramCount++;
        query += ` AND af.is_active = $${paramCount}`;
        params.push(filters.is_active);
        
        countParamCounter++;
        countQuery += ` AND af.is_active = $${countParamCounter}`;
        finalCountParams.push(filters.is_active);
      }

      if (filters.created_by) {
        paramCount++;
        query += ` AND af.created_by = $${paramCount}`;
        params.push(filters.created_by);
        
        countParamCounter++;
        countQuery += ` AND af.created_by = $${countParamCounter}`;
        finalCountParams.push(filters.created_by);
      }

      if (filters.last_accessed_by) {
        paramCount++;
        query += ` AND af.last_accessed_by = $${paramCount}`;
        params.push(filters.last_accessed_by);
        
        countParamCounter++;
        countQuery += ` AND af.last_accessed_by = $${countParamCounter}`;
        finalCountParams.push(filters.last_accessed_by);
      }

      if (filters.date_from) {
        paramCount++;
        query += ` AND af.file_created_date >= $${paramCount}`;
        params.push(filters.date_from);
        
        countParamCounter++;
        countQuery += ` AND af.file_created_date >= $${countParamCounter}`;
        finalCountParams.push(filters.date_from);
      }

      if (filters.date_to) {
        paramCount++;
        query += ` AND af.file_created_date <= $${paramCount}`;
        params.push(filters.date_to);
        
        countParamCounter++;
        countQuery += ` AND af.file_created_date <= $${countParamCounter}`;
        finalCountParams.push(filters.date_to);
      }

      query += ` ORDER BY af.file_created_date DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const [filesResult, countResult] = await Promise.all([
        db.query(query, params),
        db.query(countQuery, finalCountParams)
      ]);

      const files = filesResult.rows.map(row => new ADLFile(row));
      const total = parseInt(countResult.rows[0].count);

      return {
        files,
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

  // Update ADL file (including all complex case fields)
  async update(updateData) {
    try {
      const allowedFields = [
        'file_status', 'physical_file_location', 'last_accessed_date',
        'last_accessed_by', 'total_visits', 'is_active', 'notes', 'clinical_proforma_id',
        'history_narrative', 'history_specific_enquiry', 'history_drug_intake',
        'history_treatment_place', 'history_treatment_dates', 'history_treatment_drugs', 
        'history_treatment_response', 'informants', 'complaints_patient', 'complaints_informant',
        'past_history_medical', 'past_history_psychiatric_dates', 'past_history_psychiatric_diagnosis',
        'past_history_psychiatric_treatment', 'past_history_psychiatric_interim', 
        'past_history_psychiatric_recovery', 'family_history_father_age', 
        'family_history_father_education', 'family_history_father_occupation',
        'family_history_father_personality', 'family_history_father_deceased', 
        'family_history_father_death_age', 'family_history_father_death_date', 
        'family_history_father_death_cause', 'family_history_mother_age', 
        'family_history_mother_education', 'family_history_mother_occupation',
        'family_history_mother_personality', 'family_history_mother_deceased', 
        'family_history_mother_death_age', 'family_history_mother_death_date', 
        'family_history_mother_death_cause', 'family_history_siblings',
        'diagnostic_formulation_summary', 'diagnostic_formulation_features', 
        'diagnostic_formulation_psychodynamic', 'premorbid_personality_passive_active', 
        'premorbid_personality_assertive', 'premorbid_personality_introvert_extrovert',
        'premorbid_personality_traits', 'premorbid_personality_hobbies', 
        'premorbid_personality_habits', 'premorbid_personality_alcohol_drugs',
        'physical_appearance', 'physical_body_build', 'physical_pallor', 'physical_icterus', 
        'physical_oedema', 'physical_lymphadenopathy', 'physical_pulse', 'physical_bp', 
        'physical_height', 'physical_weight', 'physical_waist', 'physical_fundus',
        'physical_cvs_apex', 'physical_cvs_regularity', 'physical_cvs_heart_sounds', 
        'physical_cvs_murmurs', 'physical_chest_expansion', 'physical_chest_percussion', 
        'physical_chest_adventitious', 'physical_abdomen_tenderness', 'physical_abdomen_mass', 
        'physical_abdomen_bowel_sounds', 'physical_cns_cranial', 'physical_cns_motor_sensory', 
        'physical_cns_rigidity', 'physical_cns_involuntary', 'physical_cns_superficial_reflexes', 
        'physical_cns_dtrs', 'physical_cns_plantar', 'physical_cns_cerebellar',
        'mse_general_demeanour', 'mse_general_tidy', 'mse_general_awareness', 
        'mse_general_cooperation', 'mse_psychomotor_verbalization', 'mse_psychomotor_pressure', 
        'mse_psychomotor_tension', 'mse_psychomotor_posture', 'mse_psychomotor_mannerism', 
        'mse_psychomotor_catatonic', 'mse_affect_subjective', 'mse_affect_tone',
        'mse_affect_resting', 'mse_affect_fluctuation', 'mse_thought_flow', 'mse_thought_form', 
        'mse_thought_content', 'mse_cognitive_consciousness', 'mse_cognitive_orientation_time', 
        'mse_cognitive_orientation_place', 'mse_cognitive_orientation_person', 
        'mse_cognitive_memory_immediate', 'mse_cognitive_memory_recent',
        'mse_cognitive_memory_remote', 'mse_cognitive_subtraction', 'mse_cognitive_digit_span', 
        'mse_cognitive_counting', 'mse_cognitive_general_knowledge', 'mse_cognitive_calculation', 
        'mse_cognitive_similarities', 'mse_cognitive_proverbs', 'mse_insight_understanding', 
        'mse_insight_judgement', 'education_start_age', 'education_highest_class', 
        'education_performance', 'education_disciplinary', 'education_peer_relationship', 
        'education_hobbies', 'education_special_abilities', 'education_discontinue_reason',
        'occupation_jobs', 'sexual_menarche_age', 'sexual_menarche_reaction', 'sexual_education', 
        'sexual_masturbation', 'sexual_contact', 'sexual_premarital_extramarital', 
        'sexual_marriage_arranged', 'sexual_marriage_date', 'sexual_spouse_age', 
        'sexual_spouse_occupation', 'sexual_adjustment_general', 'sexual_adjustment_sexual',
        'sexual_children', 'sexual_problems', 'religion_type', 'religion_participation', 
        'religion_changes', 'living_residents', 'living_income_sharing', 'living_expenses', 
        'living_kitchen', 'living_domestic_conflicts', 'living_social_class', 'living_inlaws', 
        'home_situation_childhood', 'home_situation_parents_relationship',
        'home_situation_socioeconomic', 'home_situation_interpersonal', 'personal_birth_date', 
        'personal_birth_place', 'personal_delivery_type', 'personal_complications_prenatal', 
        'personal_complications_natal', 'personal_complications_postnatal',
        'development_weaning_age', 'development_first_words', 'development_three_words', 
        'development_walking', 'development_neurotic_traits', 'development_nail_biting', 
        'development_bedwetting', 'development_phobias', 'development_childhood_illness', 
        'provisional_diagnosis', 'treatment_plan', 'consultant_comments'
      ];

      const updates = [];
      const values = [];
      let paramCount = 0;
      
      const jsonbFields = ['informants', 'complaints_patient', 'complaints_informant', 
        'family_history_siblings', 'premorbid_personality_traits', 'occupation_jobs', 
        'sexual_children', 'living_residents', 'living_inlaws'];
      
      // Date fields that need sanitization (empty strings should become null)
      const dateFields = [
        'history_treatment_dates', 'past_history_psychiatric_dates',
        'family_history_father_death_date', 'family_history_mother_death_date',
        'sexual_marriage_date', 'personal_birth_date', 'last_accessed_date'
      ];
      
      // Helper function to sanitize date fields
      const sanitizeDateField = (value) => {
        if (value === null || value === undefined || value === '') {
          return null;
        }
        // If it's already a Date object, convert to ISO string and extract date part
        if (value instanceof Date) {
          return value.toISOString().split('T')[0];
        }
        // If it's a string, validate it's a valid date format (YYYY-MM-DD)
        if (typeof value === 'string') {
          const dateRegex = /^\d{4}-\d{2}-\d{2}/;
          if (dateRegex.test(value)) {
            return value.split('T')[0]; // Extract date part if it includes time
          }
          // If it's not a valid date format, return null
          return null;
        }
        return value;
      };

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          paramCount++;
          if (jsonbFields.includes(key)) {
            // Handle JSONB fields - convert arrays/objects to JSON string
            let jsonValue;
            if (value === null || value === '') {
              jsonValue = '[]'; // Default to empty array for JSONB fields
            } else if (typeof value === 'string') {
              // If it's already a string, use it (might be JSON string)
              try {
                // Validate it's valid JSON
                JSON.parse(value);
                jsonValue = value;
              } catch {
                // If not valid JSON, stringify it
                jsonValue = JSON.stringify(value);
              }
            } else {
              jsonValue = JSON.stringify(value);
            }
            updates.push(`${key} = $${paramCount}::jsonb`);
            values.push(jsonValue);
          } else if (dateFields.includes(key)) {
            // Sanitize date fields - convert empty strings to null
            const sanitizedDate = sanitizeDateField(value);
            // Encrypt date fields if they are in the encryption fields list
            let finalDateValue = sanitizedDate;
            if (encryptionFields.adlFile.includes(key) && finalDateValue !== null && finalDateValue !== undefined && finalDateValue !== '') {
              finalDateValue = encrypt(finalDateValue);
            }
            updates.push(`${key} = $${paramCount}`);
            values.push(finalDateValue);
          } else {
            // For non-JSONB, non-date fields, allow null and empty strings
            // Encrypt sensitive fields before saving
            let finalValue = value === '' ? null : value;
            if (encryptionFields.adlFile.includes(key) && finalValue !== null) {
              finalValue = encrypt(finalValue);
            }
            updates.push(`${key} = $${paramCount}`);
            values.push(finalValue);
          }
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);

      paramCount++;
      values.push(this.id);

      // Build the final query string and verify all parameter placeholders have $ prefix
      const updateQuery = `UPDATE adl_files SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
      
      // Safety check: verify no bare numbers appear after = signs (which would indicate missing $ prefix)
      // Match patterns like "column = 5" (without $) but allow "column = $5" or "CURRENT_TIMESTAMP"
      const setClause = updateQuery.match(/SET\s+(.+?)\s+WHERE/is)?.[1] || '';
      const bareNumberAfterEquals = /=\s*(\d+)(?:\s|,|$)/g;
      const matches = [];
      let match;
      while ((match = bareNumberAfterEquals.exec(setClause)) !== null) {
        // Check if it's not CURRENT_TIMESTAMP or a parameter with $
        if (!setClause.substring(Math.max(0, match.index - 20), match.index).includes('CURRENT_TIMESTAMP') &&
            !setClause.substring(Math.max(0, match.index - 5), match.index).includes('$')) {
          matches.push(match[1]);
        }
      }
      
      if (matches.length > 0) {
        console.error('[ADLFile.update] CRITICAL: Found bare numbers after = signs (missing $ prefix):', matches);
        console.error('[ADLFile.update] Query:', updateQuery);
        console.error('[ADLFile.update] Updates array:', updates.slice(0, 10));
        throw new Error(`Invalid UPDATE query: Found bare number(s) "${matches.join(', ')}" without $ prefix after = sign. Parameter placeholders must start with $.`);
      }

      console.log(`[ADLFile.update] Executing UPDATE with ${updates.length} fields, params: ${values.length}`);
      console.log(`[ADLFile.update] Query preview: ${updateQuery.substring(0, 200)}...`);

      try {
        const result = await db.query(updateQuery, values);

        if (result.rows.length > 0) {
          Object.assign(this, result.rows[0]);
        }

        return this;
      } catch (dbError) {
        // Enhanced error logging for debugging
        console.error('[ADLFile.update] Database query error:', dbError);
        console.error('[ADLFile.update] Query text:', updateQuery);
        console.error('[ADLFile.update] Updates count:', updates.length);
        console.error('[ADLFile.update] Values count:', values.length);
        console.error('[ADLFile.update] Sample updates:', updates.slice(0, 5));
        console.error('[ADLFile.update] Sample values:', values.slice(0, 5));
        
        // Check for the specific "public.5" table error
        if (dbError.message && dbError.message.includes('table') && dbError.message.includes('public')) {
          const tableMatch = dbError.message.match(/table\s+['"]?([^'"]+)['"]?/i);
          if (tableMatch && /^\d+$/.test(tableMatch[1])) {
            console.error(`[ADLFile.update] CRITICAL: Parameter number "${tableMatch[1]}" was interpreted as table name!`);
            console.error(`[ADLFile.update] This indicates a parameter placeholder is missing $ prefix in the query.`);
            console.error(`[ADLFile.update] Full query:`, updateQuery);
            throw new Error(`UPDATE query error: Parameter placeholder missing $ prefix. Number "${tableMatch[1]}" was interpreted as a table name. Please check that all parameters use $ prefix (e.g., $1, $2, etc.). Original error: ${dbError.message}`);
          }
        }
        
        throw dbError;
      }
    } catch (error) {
      console.error('[ADLFile.update] Outer error:', error);
      throw error;
    }
  }

  // Retrieve file (update status to retrieved)
  async retrieveFile(accessedBy) {
    try {
      await this.update({
        file_status: 'retrieved',
        last_accessed_date: new Date(),
        last_accessed_by: accessedBy
      });

      await this.logMovement('retrieved', 'Record Room', 'Doctor Office', accessedBy);
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Return file to storage
  async returnFile(returnedBy) {
    try {
      await this.update({
        file_status: 'stored',
        last_accessed_date: new Date(),
        last_accessed_by: returnedBy
      });

      await this.logMovement('returned', 'Doctor Office', 'Record Room', returnedBy);
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Archive file
  async archiveFile(archivedBy) {
    try {
      await this.update({
        file_status: 'archived',
        is_active: false,
        last_accessed_date: new Date(),
        last_accessed_by: archivedBy
      });

      await this.logMovement('archived', 'Record Room', 'Archive Room', archivedBy);
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Log file movement
  async logMovement(movementType, fromLocation, toLocation, movedBy, notes = null) {
    try {
      await db.query(
        `INSERT INTO file_movements (adl_file_id, patient_id, moved_by, movement_type, from_location, to_location, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [this.id, this.patient_id, movedBy, movementType, fromLocation, toLocation, notes]
      );
    } catch (error) {
      throw error;
    }
  }

  // Get file movement history
  async getMovementHistory() {
    try {
      const result = await db.query(
        `SELECT fm.*, u.name as moved_by_name, u.role as moved_by_role
         FROM file_movements fm
         LEFT JOIN users u ON fm.moved_by = u.id
         WHERE fm.adl_file_id = $1
         ORDER BY fm.movement_date DESC`,
        [this.id]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get files that need to be retrieved
  static async getFilesToRetrieve() {
    try {
      const result = await db.query(
        `SELECT af.*, p.name as patient_name, p.cr_no, p.psy_no, 
                u1.name as created_by_name, u1.role as created_by_role
         FROM adl_files af
         LEFT JOIN registered_patient p ON af.patient_id = p.id
         LEFT JOIN users u1 ON af.created_by = u1.id
         WHERE af.file_status = 'stored' AND af.is_active = true
         ORDER BY af.file_created_date ASC`
      );

      return result.rows.map(row => new ADLFile(row));
    } catch (error) {
      throw error;
    }
  }

  // Get active files (currently retrieved)
  static async getActiveFiles() {
    try {
      const result = await db.query(
        `SELECT af.*, p.name as patient_name, p.cr_no, p.psy_no, 
                u1.name as created_by_name, u1.role as created_by_role,
                u2.name as last_accessed_by_name
         FROM adl_files af
         LEFT JOIN registered_patient p ON af.patient_id = p.id
         LEFT JOIN users u1 ON af.created_by = u1.id
         LEFT JOIN users u2 ON af.last_accessed_by = u2.id
         WHERE af.file_status = 'retrieved' AND af.is_active = true
         ORDER BY af.last_accessed_date ASC`
      );

      return result.rows.map(row => new ADLFile(row));
    } catch (error) {
      throw error;
    }
  }

  // Get ADL file statistics
  static async getStats() {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as total_files,
          COUNT(CASE WHEN file_status = 'created' THEN 1 END) as created_files,
          COUNT(CASE WHEN file_status = 'stored' THEN 1 END) as stored_files,
          COUNT(CASE WHEN file_status = 'retrieved' THEN 1 END) as retrieved_files,
          COUNT(CASE WHEN file_status = 'archived' THEN 1 END) as archived_files,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_files,
          COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_files,
          AVG(total_visits) as avg_visits_per_file
        FROM adl_files
      `);

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get files by status
  static async getFilesByStatus() {
    try {
      const result = await db.query(`
        SELECT 
          file_status,
          COUNT(*) as count
        FROM adl_files 
        WHERE file_status IS NOT NULL
        GROUP BY file_status
        ORDER BY count DESC
      `);

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Delete ADL file (soft delete by archiving)
  async delete() {
    try {
      await this.update({
        file_status: 'archived',
        is_active: false,
        notes: this.notes ? `${this.notes}\n[DELETED]` : '[DELETED]'
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      patient_id: this.patient_id,
      adl_no: this.adl_no,
      created_by: this.created_by,
      clinical_proforma_id: this.clinical_proforma_id,
      file_status: this.file_status,
      physical_file_location: this.physical_file_location,
      file_created_date: this.file_created_date,
      last_accessed_date: this.last_accessed_date,
      last_accessed_by: this.last_accessed_by,
      total_visits: this.total_visits,
      is_active: this.is_active,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at,
      patient_name: this.patient_name,
      cr_no: this.cr_no,
      psy_no: this.psy_no,
      created_by_name: this.created_by_name,
      created_by_role: this.created_by_role,
      last_accessed_by_name: this.last_accessed_by_name,
      assigned_doctor: this.assigned_doctor,
      assigned_doctor_name: this.assigned_doctor_name,
      assigned_doctor_role: this.assigned_doctor_role,
      proforma_visit_date: this.proforma_visit_date,
      history_narrative: this.history_narrative,
      history_specific_enquiry: this.history_specific_enquiry,
      history_drug_intake: this.history_drug_intake,
      history_treatment_place: this.history_treatment_place,
      history_treatment_dates: this.history_treatment_dates,
      history_treatment_drugs: this.history_treatment_drugs,
      history_treatment_response: this.history_treatment_response,
      informants: this.informants,
      complaints_patient: this.complaints_patient,
      complaints_informant: this.complaints_informant,
      past_history_medical: this.past_history_medical,
      past_history_psychiatric_dates: this.past_history_psychiatric_dates,
      past_history_psychiatric_diagnosis: this.past_history_psychiatric_diagnosis,
      past_history_psychiatric_treatment: this.past_history_psychiatric_treatment,
      past_history_psychiatric_interim: this.past_history_psychiatric_interim,
      past_history_psychiatric_recovery: this.past_history_psychiatric_recovery,
      family_history_father_age: this.family_history_father_age,
      family_history_father_education: this.family_history_father_education,
      family_history_father_occupation: this.family_history_father_occupation,
      family_history_father_personality: this.family_history_father_personality,
      family_history_father_deceased: this.family_history_father_deceased,
      family_history_father_death_age: this.family_history_father_death_age,
      family_history_father_death_date: this.family_history_father_death_date,
      family_history_father_death_cause: this.family_history_father_death_cause,
      family_history_mother_age: this.family_history_mother_age,
      family_history_mother_education: this.family_history_mother_education,
      family_history_mother_occupation: this.family_history_mother_occupation,
      family_history_mother_personality: this.family_history_mother_personality,
      family_history_mother_deceased: this.family_history_mother_deceased,
      family_history_mother_death_age: this.family_history_mother_death_age,
      family_history_mother_death_date: this.family_history_mother_death_date,
      family_history_mother_death_cause: this.family_history_mother_death_cause,
      family_history_siblings: this.family_history_siblings,
      diagnostic_formulation_summary: this.diagnostic_formulation_summary,
      diagnostic_formulation_features: this.diagnostic_formulation_features,
      diagnostic_formulation_psychodynamic: this.diagnostic_formulation_psychodynamic,
      premorbid_personality_passive_active: this.premorbid_personality_passive_active,
      premorbid_personality_assertive: this.premorbid_personality_assertive,
      premorbid_personality_introvert_extrovert: this.premorbid_personality_introvert_extrovert,
      premorbid_personality_traits: this.premorbid_personality_traits,
      premorbid_personality_hobbies: this.premorbid_personality_hobbies,
      premorbid_personality_habits: this.premorbid_personality_habits,
      premorbid_personality_alcohol_drugs: this.premorbid_personality_alcohol_drugs,
      physical_appearance: this.physical_appearance,
      physical_body_build: this.physical_body_build,
      physical_pallor: this.physical_pallor,
      physical_icterus: this.physical_icterus,
      physical_oedema: this.physical_oedema,
      physical_lymphadenopathy: this.physical_lymphadenopathy,
      physical_pulse: this.physical_pulse,
      physical_bp: this.physical_bp,
      physical_height: this.physical_height,
      physical_weight: this.physical_weight,
      physical_waist: this.physical_waist,
      physical_fundus: this.physical_fundus,
      physical_cvs_apex: this.physical_cvs_apex,
      physical_cvs_regularity: this.physical_cvs_regularity,
      physical_cvs_heart_sounds: this.physical_cvs_heart_sounds,
      physical_cvs_murmurs: this.physical_cvs_murmurs,
      physical_chest_expansion: this.physical_chest_expansion,
      physical_chest_percussion: this.physical_chest_percussion,
      physical_chest_adventitious: this.physical_chest_adventitious,
      physical_abdomen_tenderness: this.physical_abdomen_tenderness,
      physical_abdomen_mass: this.physical_abdomen_mass,
      physical_abdomen_bowel_sounds: this.physical_abdomen_bowel_sounds,
      physical_cns_cranial: this.physical_cns_cranial,
      physical_cns_motor_sensory: this.physical_cns_motor_sensory,
      physical_cns_rigidity: this.physical_cns_rigidity,
      physical_cns_involuntary: this.physical_cns_involuntary,
      physical_cns_superficial_reflexes: this.physical_cns_superficial_reflexes,
      physical_cns_dtrs: this.physical_cns_dtrs,
      physical_cns_plantar: this.physical_cns_plantar,
      physical_cns_cerebellar: this.physical_cns_cerebellar,
      mse_general_demeanour: this.mse_general_demeanour,
      mse_general_tidy: this.mse_general_tidy,
      mse_general_awareness: this.mse_general_awareness,
      mse_general_cooperation: this.mse_general_cooperation,
      mse_psychomotor_verbalization: this.mse_psychomotor_verbalization,
      mse_psychomotor_pressure: this.mse_psychomotor_pressure,
      mse_psychomotor_tension: this.mse_psychomotor_tension,
      mse_psychomotor_posture: this.mse_psychomotor_posture,
      mse_psychomotor_mannerism: this.mse_psychomotor_mannerism,
      mse_psychomotor_catatonic: this.mse_psychomotor_catatonic,
      mse_affect_subjective: this.mse_affect_subjective,
      mse_affect_tone: this.mse_affect_tone,
      mse_affect_resting: this.mse_affect_resting,
      mse_affect_fluctuation: this.mse_affect_fluctuation,
      mse_thought_flow: this.mse_thought_flow,
      mse_thought_form: this.mse_thought_form,
      mse_thought_content: this.mse_thought_content,
      mse_cognitive_consciousness: this.mse_cognitive_consciousness,
      mse_cognitive_orientation_time: this.mse_cognitive_orientation_time,
      mse_cognitive_orientation_place: this.mse_cognitive_orientation_place,
      mse_cognitive_orientation_person: this.mse_cognitive_orientation_person,
      mse_cognitive_memory_immediate: this.mse_cognitive_memory_immediate,
      mse_cognitive_memory_recent: this.mse_cognitive_memory_recent,
      mse_cognitive_memory_remote: this.mse_cognitive_memory_remote,
      mse_cognitive_subtraction: this.mse_cognitive_subtraction,
      mse_cognitive_digit_span: this.mse_cognitive_digit_span,
      mse_cognitive_counting: this.mse_cognitive_counting,
      mse_cognitive_general_knowledge: this.mse_cognitive_general_knowledge,
      mse_cognitive_calculation: this.mse_cognitive_calculation,
      mse_cognitive_similarities: this.mse_cognitive_similarities,
      mse_cognitive_proverbs: this.mse_cognitive_proverbs,
      mse_insight_understanding: this.mse_insight_understanding,
      mse_insight_judgement: this.mse_insight_judgement,
      education_start_age: this.education_start_age,
      education_highest_class: this.education_highest_class,
      education_performance: this.education_performance,
      education_disciplinary: this.education_disciplinary,
      education_peer_relationship: this.education_peer_relationship,
      education_hobbies: this.education_hobbies,
      education_special_abilities: this.education_special_abilities,
      education_discontinue_reason: this.education_discontinue_reason,
      occupation_jobs: this.occupation_jobs,
      sexual_menarche_age: this.sexual_menarche_age,
      sexual_menarche_reaction: this.sexual_menarche_reaction,
      sexual_education: this.sexual_education,
      sexual_masturbation: this.sexual_masturbation,
      sexual_contact: this.sexual_contact,
      sexual_premarital_extramarital: this.sexual_premarital_extramarital,
      sexual_marriage_arranged: this.sexual_marriage_arranged,
      sexual_marriage_date: this.sexual_marriage_date,
      sexual_spouse_age: this.sexual_spouse_age,
      sexual_spouse_occupation: this.sexual_spouse_occupation,
      sexual_adjustment_general: this.sexual_adjustment_general,
      sexual_adjustment_sexual: this.sexual_adjustment_sexual,
      sexual_children: this.sexual_children,
      sexual_problems: this.sexual_problems,
      religion_type: this.religion_type,
      religion_participation: this.religion_participation,
      religion_changes: this.religion_changes,
      living_residents: this.living_residents,
      living_income_sharing: this.living_income_sharing,
      living_expenses: this.living_expenses,
      living_kitchen: this.living_kitchen,
      living_domestic_conflicts: this.living_domestic_conflicts,
      living_social_class: this.living_social_class,
      living_inlaws: this.living_inlaws,
      home_situation_childhood: this.home_situation_childhood,
      home_situation_parents_relationship: this.home_situation_parents_relationship,
      home_situation_socioeconomic: this.home_situation_socioeconomic,
      home_situation_interpersonal: this.home_situation_interpersonal,
      personal_birth_date: this.personal_birth_date,
      personal_birth_place: this.personal_birth_place,
      personal_delivery_type: this.personal_delivery_type,
      personal_complications_prenatal: this.personal_complications_prenatal,
      personal_complications_natal: this.personal_complications_natal,
      personal_complications_postnatal: this.personal_complications_postnatal,
      development_weaning_age: this.development_weaning_age,
      development_first_words: this.development_first_words,
      development_three_words: this.development_three_words,
      development_walking: this.development_walking,
      development_neurotic_traits: this.development_neurotic_traits,
      development_nail_biting: this.development_nail_biting,
      development_bedwetting: this.development_bedwetting,
      development_phobias: this.development_phobias,
      development_childhood_illness: this.development_childhood_illness,
      provisional_diagnosis: this.provisional_diagnosis,
      treatment_plan: this.treatment_plan,
      consultant_comments: this.consultant_comments
    };
  }
}

module.exports = ADLFile;