// const db = require('../config/database');

// class ClinicalProforma {
//   constructor(data) {
//     this.id = data.id;
//     this.patient_id = data.patient_id;
//     this.filled_by = data.filled_by;
//     this.visit_date = data.visit_date;
//     this.visit_type = data.visit_type;
//     this.room_no = data.room_no;
//     this.assigned_doctor = data.assigned_doctor;
//     this.informant_present = data.informant_present;
//     this.nature_of_information = data.nature_of_information;
//     this.onset_duration = data.onset_duration;
//     this.course = data.course;
//     this.precipitating_factor = data.precipitating_factor;
//     this.illness_duration = data.illness_duration;
//     this.current_episode_since = data.current_episode_since;
//     this.mood = data.mood;
//     this.behaviour = data.behaviour;
//     this.speech = data.speech;
//     this.thought = data.thought;
//     this.perception = data.perception;
//     this.somatic = data.somatic;
//     this.bio_functions = data.bio_functions;
//     this.adjustment = data.adjustment;
//     this.cognitive_function = data.cognitive_function;
//     this.fits = data.fits;
//     this.sexual_problem = data.sexual_problem;
//     this.substance_use = data.substance_use;
//     this.past_history = data.past_history;
//     this.family_history = data.family_history;
//     this.associated_medical_surgical = data.associated_medical_surgical;
//     this.mse_behaviour = data.mse_behaviour;
//     this.mse_affect = data.mse_affect;
//     this.mse_thought = data.mse_thought;
//     this.mse_delusions = data.mse_delusions;
//     this.mse_perception = data.mse_perception;
//     this.mse_cognitive_function = data.mse_cognitive_function;
//     this.gpe = data.gpe;
//     this.diagnosis = data.diagnosis;
//     this.icd_code = data.icd_code;
//     this.disposal = data.disposal;
//     this.workup_appointment = data.workup_appointment;
//     this.referred_to = data.referred_to;
//     this.treatment_prescribed = data.treatment_prescribed;
//     // Prescriptions as JSONB array
//     this.prescriptions = data.prescriptions ? (Array.isArray(data.prescriptions) ? data.prescriptions : JSON.parse(data.prescriptions || '[]')) : [];
//     this.doctor_decision = data.doctor_decision;
//     this.case_severity = data.case_severity;
//     this.requires_adl_file = data.requires_adl_file;
//     this.adl_reasoning = data.adl_reasoning;
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
//     // ADL File Reference (bidirectional link)
//     this.adl_file_id = data.adl_file_id;
//     this.created_at = data.created_at;
//   }

//   // Create a new clinical proforma
//   static async create(proformaData) {
//     try {
//       const {
//         patient_id,
//         filled_by,
//         visit_date,
//         visit_type,
//         room_no,
//         assigned_doctor,
//         informant_present,
//         nature_of_information,
//         onset_duration,
//         course,
//         precipitating_factor,
//         illness_duration,
//         current_episode_since,
//         mood,
//         behaviour,
//         speech,
//         thought,
//         perception,
//         somatic,
//         bio_functions,
//         adjustment,
//         cognitive_function,
//         fits,
//         sexual_problem,
//         substance_use,
//         past_history,
//         family_history,
//         associated_medical_surgical,
//         mse_behaviour,
//         mse_affect,
//         mse_thought,
//         mse_delusions,
//         mse_perception,
//         mse_cognitive_function,
//         gpe,
//         diagnosis,
//         icd_code,
//         disposal,
//         workup_appointment,
//         referred_to,
//         treatment_prescribed,
//         doctor_decision,
//         case_severity,
//         requires_adl_file,
//         adl_reasoning,
//         // History of Present Illness - Expanded
//         history_narrative,
//         history_specific_enquiry,
//         history_drug_intake,
//         history_treatment_place,
//         history_treatment_dates,
//         history_treatment_drugs,
//         history_treatment_response,
//         // Multiple Informants (JSONB)
//         informants,
//         // Complaints and Duration (JSONB)
//         complaints_patient,
//         complaints_informant,
//         // Past History - Detailed
//         past_history_medical,
//         past_history_psychiatric_dates,
//         past_history_psychiatric_diagnosis,
//         past_history_psychiatric_treatment,
//         past_history_psychiatric_interim,
//         past_history_psychiatric_recovery,
//         // Family History - Detailed
//         family_history_father_age,
//         family_history_father_education,
//         family_history_father_occupation,
//         family_history_father_personality,
//         family_history_father_deceased,
//         family_history_father_death_age,
//         family_history_father_death_date,
//         family_history_father_death_cause,
//         family_history_mother_age,
//         family_history_mother_education,
//         family_history_mother_occupation,
//         family_history_mother_personality,
//         family_history_mother_deceased,
//         family_history_mother_death_age,
//         family_history_mother_death_date,
//         family_history_mother_death_cause,
//         family_history_siblings,
//         // Diagnostic Formulation
//         diagnostic_formulation_summary,
//         diagnostic_formulation_features,
//         diagnostic_formulation_psychodynamic,
//         // Premorbid Personality
//         premorbid_personality_passive_active,
//         premorbid_personality_assertive,
//         premorbid_personality_introvert_extrovert,
//         premorbid_personality_traits,
//         premorbid_personality_hobbies,
//         premorbid_personality_habits,
//         premorbid_personality_alcohol_drugs,
//         // Physical Examination - Comprehensive
//         physical_appearance,
//         physical_body_build,
//         physical_pallor,
//         physical_icterus,
//         physical_oedema,
//         physical_lymphadenopathy,
//         physical_pulse,
//         physical_bp,
//         physical_height,
//         physical_weight,
//         physical_waist,
//         physical_fundus,
//         physical_cvs_apex,
//         physical_cvs_regularity,
//         physical_cvs_heart_sounds,
//         physical_cvs_murmurs,
//         physical_chest_expansion,
//         physical_chest_percussion,
//         physical_chest_adventitious,
//         physical_abdomen_tenderness,
//         physical_abdomen_mass,
//         physical_abdomen_bowel_sounds,
//         physical_cns_cranial,
//         physical_cns_motor_sensory,
//         physical_cns_rigidity,
//         physical_cns_involuntary,
//         physical_cns_superficial_reflexes,
//         physical_cns_dtrs,
//         physical_cns_plantar,
//         physical_cns_cerebellar,
//         // Mental Status Examination - Expanded
//         mse_general_demeanour,
//         mse_general_tidy,
//         mse_general_awareness,
//         mse_general_cooperation,
//         mse_psychomotor_verbalization,
//         mse_psychomotor_pressure,
//         mse_psychomotor_tension,
//         mse_psychomotor_posture,
//         mse_psychomotor_mannerism,
//         mse_psychomotor_catatonic,
//         mse_affect_subjective,
//         mse_affect_tone,
//         mse_affect_resting,
//         mse_affect_fluctuation,
//         mse_thought_flow,
//         mse_thought_form,
//         mse_thought_content,
//         mse_cognitive_consciousness,
//         mse_cognitive_orientation_time,
//         mse_cognitive_orientation_place,
//         mse_cognitive_orientation_person,
//         mse_cognitive_memory_immediate,
//         mse_cognitive_memory_recent,
//         mse_cognitive_memory_remote,
//         mse_cognitive_subtraction,
//         mse_cognitive_digit_span,
//         mse_cognitive_counting,
//         mse_cognitive_general_knowledge,
//         mse_cognitive_calculation,
//         mse_cognitive_similarities,
//         mse_cognitive_proverbs,
//         mse_insight_understanding,
//         mse_insight_judgement,
//         // Educational History
//         education_start_age,
//         education_highest_class,
//         education_performance,
//         education_disciplinary,
//         education_peer_relationship,
//         education_hobbies,
//         education_special_abilities,
//         education_discontinue_reason,
//         // Occupational History (JSONB)
//         occupation_jobs,
//         // Sexual and Marital History
//         sexual_menarche_age,
//         sexual_menarche_reaction,
//         sexual_education,
//         sexual_masturbation,
//         sexual_contact,
//         sexual_premarital_extramarital,
//         sexual_marriage_arranged,
//         sexual_marriage_date,
//         sexual_spouse_age,
//         sexual_spouse_occupation,
//         sexual_adjustment_general,
//         sexual_adjustment_sexual,
//         sexual_children,
//         sexual_problems,
//         // Religion
//         religion_type,
//         religion_participation,
//         religion_changes,
//         // Present Living Situation
//         living_residents,
//         living_income_sharing,
//         living_expenses,
//         living_kitchen,
//         living_domestic_conflicts,
//         living_social_class,
//         living_inlaws,
//         // General Home Situation and Early Development
//         home_situation_childhood,
//         home_situation_parents_relationship,
//         home_situation_socioeconomic,
//         home_situation_interpersonal,
//         personal_birth_date,
//         personal_birth_place,
//         personal_delivery_type,
//         personal_complications_prenatal,
//         personal_complications_natal,
//         personal_complications_postnatal,
//         development_weaning_age,
//         development_first_words,
//         development_three_words,
//         development_walking,
//         development_neurotic_traits,
//         development_nail_biting,
//         development_bedwetting,
//         development_phobias,
//         development_childhood_illness,
//         // Provisional Diagnosis and Treatment Plan
//         provisional_diagnosis,
//         treatment_plan,
//         // Comments of the Consultant
//         consultant_comments,
//         // Prescriptions (JSONB array)
//         prescriptions
//       } = proformaData;

//       // Check if patient exists
//       const patientCheck = await db.query(
//         'SELECT id FROM registered_patient WHERE id = $1',
//         [patient_id]
//       );

//       if (patientCheck.rows.length === 0) {
//         throw new Error('Patient not found');
//       }

//       // Convert arrays to JSONB for database storage
//       const informantsJson = informants ? JSON.stringify(Array.isArray(informants) ? informants : []) : '[]';
//       const complaintsPatientJson = complaints_patient ? JSON.stringify(Array.isArray(complaints_patient) ? complaints_patient : []) : '[]';
//       const complaintsInformantJson = complaints_informant ? JSON.stringify(Array.isArray(complaints_informant) ? complaints_informant : []) : '[]';
//       const familyHistorySiblingsJson = family_history_siblings ? JSON.stringify(Array.isArray(family_history_siblings) ? family_history_siblings : []) : '[]';
//       const premorbidPersonalityTraitsJson = premorbid_personality_traits ? JSON.stringify(Array.isArray(premorbid_personality_traits) ? premorbid_personality_traits : []) : '[]';
//       const occupationJobsJson = occupation_jobs ? JSON.stringify(Array.isArray(occupation_jobs) ? occupation_jobs : []) : '[]';
//       const sexualChildrenJson = sexual_children ? JSON.stringify(Array.isArray(sexual_children) ? sexual_children : []) : '[]';
//       const livingResidentsJson = living_residents ? JSON.stringify(Array.isArray(living_residents) ? living_residents : []) : '[]';
//       const livingInlawsJson = living_inlaws ? JSON.stringify(Array.isArray(living_inlaws) ? living_inlaws : []) : '[]';
      
//       // Convert prescriptions array to JSONB (if provided, otherwise empty array)
//       const prescriptionsJson = prescriptions ? JSON.stringify(Array.isArray(prescriptions) ? prescriptions : []) : '[]';

//       // Insert clinical proforma
//       // Note: assigned_doctor is optional - only include if column exists in database
//       // For now, we'll try to include it, but handle gracefully if column doesn't exist
//       const result = await db.query(
//         `INSERT INTO clinical_proforma (
//           patient_id, filled_by, visit_date, visit_type, room_no, informant_present,
//           nature_of_information, onset_duration, course, precipitating_factor,
//           illness_duration, current_episode_since, mood, behaviour, speech, thought,
//           perception, somatic, bio_functions, adjustment, cognitive_function, fits,
//           sexual_problem, substance_use, past_history, family_history,
//           associated_medical_surgical, mse_behaviour, mse_affect, mse_thought,
//           mse_delusions, mse_perception, mse_cognitive_function, gpe, diagnosis,
//           icd_code, disposal, workup_appointment, referred_to, treatment_prescribed,
//           doctor_decision, case_severity, requires_adl_file, adl_reasoning,
//           history_narrative, history_specific_enquiry, history_drug_intake,
//           history_treatment_place, history_treatment_dates, history_treatment_drugs,
//           history_treatment_response, informants, complaints_patient, complaints_informant,
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
//           development_childhood_illness, provisional_diagnosis, treatment_plan, consultant_comments, prescriptions
//         ) VALUES (
//           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
//           $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
//           $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45,
//           $46, $47, $48, $49, $50, $51, $52, $53::jsonb, $54::jsonb, $55::jsonb,
//           $56, $57, $58, $59, $60, $61,
//           $62, $63, $64, $65, $66, $67, $68, $69, $70,
//           $71, $72, $73, $74, $75, $76, $77, $78,
//           $79::jsonb, $80, $81, $82, $83,
//           $84, $85, $86, $87::jsonb,
//           $88, $89, $90, $91, $92, $93, $94, $95, $96, $97, $98, $99,
//           $100, $101, $102, $103, $104, $105, $106, $107,
//           $108, $109, $110, $111, $112, $113, $114, $115, $116, $117, $118, $119,
//           $120, $121, $122, $123, $124, $125, $126, $127, $128, $129,
//           $130, $131, $132, $133, $134, $135, $136, $137, $138, $139, $140,
//           $141, $142, $143, $144, $145, $146, $147, $148,
//           $149::jsonb, $150, $151, $152, $153, $154, $155, $156,
//           $157, $158, $159, $160, $161::jsonb, $162, $163, $164, $165,
//           $166::jsonb, $167, $168, $169, $170, $171, $172,
//           $173::jsonb, $174, $175, $176, $177, $178, $179,
//           $180, $181, $182, $183, $184, $185, $186, $187, $188, $189, $190, $191, $192::jsonb
//         ) RETURNING *`,
//         [
//           patient_id, filled_by, visit_date, visit_type, room_no, informant_present,
//           nature_of_information, onset_duration, course, precipitating_factor,
//           illness_duration, current_episode_since, mood, behaviour, speech, thought,
//           perception, somatic, bio_functions, adjustment, cognitive_function, fits,
//           sexual_problem, substance_use, past_history, family_history,
//           associated_medical_surgical, mse_behaviour, mse_affect, mse_thought,
//           mse_delusions, mse_perception, mse_cognitive_function, gpe, diagnosis,
//           icd_code, disposal, workup_appointment, referred_to, treatment_prescribed,
//           doctor_decision, case_severity, requires_adl_file, adl_reasoning,
//           history_narrative, history_specific_enquiry, history_drug_intake,
//           history_treatment_place, history_treatment_dates, history_treatment_drugs,
//           history_treatment_response, informantsJson, complaintsPatientJson, complaintsInformantJson,
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
//           development_childhood_illness, provisional_diagnosis, treatment_plan, consultant_comments, prescriptionsJson
//           // adl_file_id is set to NULL by default and updated after ADL file creation for complex cases
//         ]
//       );

//       return new ClinicalProforma(result.rows[0]);
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Find clinical proforma by ID
//   static async findById(id) {
//     try {
//       const result = await db.query(
//         `SELECT cp.*, p.name as patient_name, p.cr_no, p.psy_no, u.name as doctor_name, u.role as doctor_role
//          FROM clinical_proforma cp
//          LEFT JOIN patients p ON cp.patient_id = p.id
//          LEFT JOIN users u ON cp.filled_by = u.id
//          WHERE cp.id = $1`,
//         [id]
//       );

//       if (result.rows.length === 0) {
//         return null;
//       }

//       return new ClinicalProforma(result.rows[0]);
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Find clinical proforma by patient ID
//   static async findByPatientId(patient_id) {
//     try {
//       const result = await db.query(
//         `SELECT cp.*, p.name as patient_name, p.cr_no, p.psy_no, u.name as doctor_name, u.role as doctor_role
//          FROM clinical_proforma cp
//          LEFT JOIN patients p ON cp.patient_id = p.id
//          LEFT JOIN users u ON cp.filled_by = u.id
//          WHERE cp.patient_id = $1
//          ORDER BY cp.visit_date DESC`,
//         [patient_id]
//       );

//       return result.rows.map(row => new ClinicalProforma(row));
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Get all clinical proforma with pagination and filters
//   static async findAll(page = 1, limit = 10, filters = {}) {
//     try {
//       const offset = (page - 1) * limit;
//       let query = `
//         SELECT cp.*, p.name as patient_name, p.cr_no, p.psy_no, u.name as doctor_name, u.role as doctor_role
//         FROM clinical_proforma cp
//         LEFT JOIN patients p ON cp.patient_id = p.id
//         LEFT JOIN users u ON cp.filled_by = u.id
//         WHERE 1=1
//       `;
//       let countQuery = 'SELECT COUNT(*) FROM clinical_proforma WHERE 1=1';
//       const params = [];
//       let paramCount = 0;

//       // Apply filters
//       if (filters.visit_type) {
//         paramCount++;
//         query += ` AND cp.visit_type = $${paramCount}`;
//         countQuery += ` AND visit_type = $${paramCount}`;
//         params.push(filters.visit_type);
//       }

//       if (filters.doctor_decision) {
//         paramCount++;
//         query += ` AND cp.doctor_decision = $${paramCount}`;
//         countQuery += ` AND doctor_decision = $${paramCount}`;
//         params.push(filters.doctor_decision);
//       }

//       if (filters.case_severity) {
//         paramCount++;
//         query += ` AND cp.case_severity = $${paramCount}`;
//         countQuery += ` AND case_severity = $${paramCount}`;
//         params.push(filters.case_severity);
//       }

//       if (filters.requires_adl_file !== undefined) {
//         paramCount++;
//         query += ` AND cp.requires_adl_file = $${paramCount}`;
//         countQuery += ` AND requires_adl_file = $${paramCount}`;
//         params.push(filters.requires_adl_file);
//       }

//       if (filters.filled_by) {
//         paramCount++;
//         query += ` AND cp.filled_by = $${paramCount}`;
//         countQuery += ` AND filled_by = $${paramCount}`;
//         params.push(filters.filled_by);
//       }

//       if (filters.room_no) {
//         paramCount++;
//         query += ` AND cp.room_no = $${paramCount}`;
//         countQuery += ` AND room_no = $${paramCount}`;
//         params.push(filters.room_no);
//       }

//       if (filters.date_from) {
//         paramCount++;
//         query += ` AND cp.visit_date >= $${paramCount}`;
//         countQuery += ` AND visit_date >= $${paramCount}`;
//         params.push(filters.date_from);
//       }

//       if (filters.date_to) {
//         paramCount++;
//         query += ` AND cp.visit_date <= $${paramCount}`;
//         countQuery += ` AND visit_date <= $${paramCount}`;
//         params.push(filters.date_to);
//       }

//       query += ` ORDER BY cp.visit_date DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
//       params.push(limit, offset);

//       const [proformaResult, countResult] = await Promise.all([
//         db.query(query, params),
//         db.query(countQuery, Object.values(filters))
//       ]);

//       const proformas = proformaResult.rows.map(row => new ClinicalProforma(row));
//       const total = parseInt(countResult.rows[0].count);

//       return {
//         proformas,
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

//   // Update clinical proforma
//   async update(updateData) {
//     try {
//       // Fields that may not exist until migration is run
//       const optionalFields = ['assigned_doctor', 'adl_file_id'];
      
//       const allowedFields = [
//         'visit_date', 'visit_type', 'room_no', 'assigned_doctor', 'informant_present', 'nature_of_information',
//         'onset_duration', 'course', 'precipitating_factor', 'illness_duration',
//         'current_episode_since', 'mood', 'behaviour', 'speech', 'thought', 'perception',
//         'somatic', 'bio_functions', 'adjustment', 'cognitive_function', 'fits',
//         'sexual_problem', 'substance_use', 'past_history', 'family_history',
//         'associated_medical_surgical', 'mse_behaviour', 'mse_affect', 'mse_thought',
//         'mse_delusions', 'mse_perception', 'mse_cognitive_function', 'gpe',
//         'diagnosis', 'icd_code', 'disposal', 'workup_appointment', 'referred_to',
//         'treatment_prescribed', 'doctor_decision', 'case_severity', 'requires_adl_file',
//         'adl_reasoning',
//         // History of Present Illness - Expanded
//         'history_narrative', 'history_specific_enquiry', 'history_drug_intake',
//         'history_treatment_place', 'history_treatment_dates', 'history_treatment_drugs', 'history_treatment_response',
//         // Multiple Informants (JSONB)
//         'informants',
//         // Complaints and Duration (JSONB)
//         'complaints_patient', 'complaints_informant',
//         // Past History - Detailed
//         'past_history_medical', 'past_history_psychiatric_dates', 'past_history_psychiatric_diagnosis',
//         'past_history_psychiatric_treatment', 'past_history_psychiatric_interim', 'past_history_psychiatric_recovery',
//         // Family History - Detailed
//         'family_history_father_age', 'family_history_father_education', 'family_history_father_occupation',
//         'family_history_father_personality', 'family_history_father_deceased', 'family_history_father_death_age',
//         'family_history_father_death_date', 'family_history_father_death_cause',
//         'family_history_mother_age', 'family_history_mother_education', 'family_history_mother_occupation',
//         'family_history_mother_personality', 'family_history_mother_deceased', 'family_history_mother_death_age',
//         'family_history_mother_death_date', 'family_history_mother_death_cause', 'family_history_siblings',
//         // Diagnostic Formulation
//         'diagnostic_formulation_summary', 'diagnostic_formulation_features', 'diagnostic_formulation_psychodynamic',
//         // Premorbid Personality
//         'premorbid_personality_passive_active', 'premorbid_personality_assertive', 'premorbid_personality_introvert_extrovert',
//         'premorbid_personality_traits', 'premorbid_personality_hobbies', 'premorbid_personality_habits', 'premorbid_personality_alcohol_drugs',
//         // Physical Examination - Comprehensive
//         'physical_appearance', 'physical_body_build', 'physical_pallor', 'physical_icterus', 'physical_oedema', 'physical_lymphadenopathy',
//         'physical_pulse', 'physical_bp', 'physical_height', 'physical_weight', 'physical_waist', 'physical_fundus',
//         'physical_cvs_apex', 'physical_cvs_regularity', 'physical_cvs_heart_sounds', 'physical_cvs_murmurs',
//         'physical_chest_expansion', 'physical_chest_percussion', 'physical_chest_adventitious',
//         'physical_abdomen_tenderness', 'physical_abdomen_mass', 'physical_abdomen_bowel_sounds',
//         'physical_cns_cranial', 'physical_cns_motor_sensory', 'physical_cns_rigidity', 'physical_cns_involuntary',
//         'physical_cns_superficial_reflexes', 'physical_cns_dtrs', 'physical_cns_plantar', 'physical_cns_cerebellar',
//         // Mental Status Examination - Expanded
//         'mse_general_demeanour', 'mse_general_tidy', 'mse_general_awareness', 'mse_general_cooperation',
//         'mse_psychomotor_verbalization', 'mse_psychomotor_pressure', 'mse_psychomotor_tension', 'mse_psychomotor_posture',
//         'mse_psychomotor_mannerism', 'mse_psychomotor_catatonic', 'mse_affect_subjective', 'mse_affect_tone',
//         'mse_affect_resting', 'mse_affect_fluctuation', 'mse_thought_flow', 'mse_thought_form', 'mse_thought_content',
//         'mse_cognitive_consciousness', 'mse_cognitive_orientation_time', 'mse_cognitive_orientation_place',
//         'mse_cognitive_orientation_person', 'mse_cognitive_memory_immediate', 'mse_cognitive_memory_recent',
//         'mse_cognitive_memory_remote', 'mse_cognitive_subtraction', 'mse_cognitive_digit_span', 'mse_cognitive_counting',
//         'mse_cognitive_general_knowledge', 'mse_cognitive_calculation', 'mse_cognitive_similarities', 'mse_cognitive_proverbs',
//         'mse_insight_understanding', 'mse_insight_judgement',
//         // Educational History
//         'education_start_age', 'education_highest_class', 'education_performance', 'education_disciplinary',
//         'education_peer_relationship', 'education_hobbies', 'education_special_abilities', 'education_discontinue_reason',
//         // Occupational History (JSONB)
//         'occupation_jobs',
//         // Sexual and Marital History
//         'sexual_menarche_age', 'sexual_menarche_reaction', 'sexual_education', 'sexual_masturbation',
//         'sexual_contact', 'sexual_premarital_extramarital', 'sexual_marriage_arranged', 'sexual_marriage_date',
//         'sexual_spouse_age', 'sexual_spouse_occupation', 'sexual_adjustment_general', 'sexual_adjustment_sexual',
//         'sexual_children', 'sexual_problems',
//         // Religion
//         'religion_type', 'religion_participation', 'religion_changes',
//         // Present Living Situation
//         'living_residents', 'living_income_sharing', 'living_expenses', 'living_kitchen', 'living_domestic_conflicts',
//         'living_social_class', 'living_inlaws',
//         // General Home Situation and Early Development
//         'home_situation_childhood', 'home_situation_parents_relationship',
//         'home_situation_socioeconomic', 'home_situation_interpersonal', 'personal_birth_date', 'personal_birth_place',
//         'personal_delivery_type', 'personal_complications_prenatal', 'personal_complications_natal', 'personal_complications_postnatal',
//         'development_weaning_age', 'development_first_words', 'development_three_words', 'development_walking',
//         'development_neurotic_traits', 'development_nail_biting', 'development_bedwetting', 'development_phobias',
//         'development_childhood_illness',
//         // Provisional Diagnosis and Treatment Plan
//         'provisional_diagnosis', 'treatment_plan',
//         // Comments of the Consultant
//         'consultant_comments',
//         // ADL File Reference
//         'adl_file_id',
//         // Prescriptions (JSONB array)
//         'prescriptions'
//       ];

//       const updates = [];
//       const values = [];
//       let paramCount = 0;

//       // JSONB fields that need special handling
//       const jsonbFields = ['informants', 'complaints_patient', 'complaints_informant', 'family_history_siblings',
//         'premorbid_personality_traits', 'occupation_jobs', 'sexual_children', 'living_residents', 'living_inlaws', 'prescriptions'];

//       for (const [key, value] of Object.entries(updateData)) {
//         if (allowedFields.includes(key) && value !== undefined) {
//           paramCount++;
//           if (jsonbFields.includes(key)) {
//             // Convert arrays to JSON string for JSONB fields
//             const jsonValue = Array.isArray(value) ? JSON.stringify(value) : (typeof value === 'string' ? value : JSON.stringify(value || []));
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

//       paramCount++;
//       values.push(this.id);

//       try {
//         const result = await db.query(
//           `UPDATE clinical_proforma SET ${updates.join(', ')} 
//            WHERE id = $${paramCount} 
//            RETURNING *`,
//           values
//         );

//         if (result.rows.length > 0) {
//           Object.assign(this, result.rows[0]);
//         }

//         return this;
//       } catch (dbError) {
//         // Handle missing column error - filter out optional fields and retry
//         if (dbError.message && (
//           dbError.message.includes("Could not find") || 
//           dbError.message.includes("column") ||
//           dbError.message.includes("does not exist")
//         )) {
//           // Check which optional field is causing the error
//           let missingField = null;
//           for (const field of optionalFields) {
//             if (dbError.message.includes(field)) {
//               missingField = field;
//               break;
//             }
//           }
          
//           if (missingField) {
//             // Find the index of the missing field in updates array
//             const missingIndex = updates.findIndex(u => u.includes(`${missingField} =`));
            
//             if (missingIndex >= 0) {
//               // Remove the missing field from updates
//               const filteredUpdates = [];
//               const filteredValues = [];
//               let newParamCount = 0;
              
//               // Rebuild updates and values arrays, skipping the missing field
//               for (let i = 0; i < updates.length; i++) {
//                 if (i !== missingIndex) {
//                   newParamCount++;
//                   // Rebuild the SQL with correct parameter number
//                   const updateSQL = updates[i].replace(/\$\d+/, `$${newParamCount}`);
//                   filteredUpdates.push(updateSQL);
//                   filteredValues.push(values[i]);
//                 }
//               }
              
//               if (filteredUpdates.length === 0) {
//                 throw new Error('No valid fields to update after filtering missing columns');
//               }
              
//               // Add ID parameter
//               newParamCount++;
//               filteredValues.push(this.id);
              
//               // Retry with filtered updates
//               const result = await db.query(
//                 `UPDATE clinical_proforma SET ${filteredUpdates.join(', ')} 
//                  WHERE id = $${newParamCount} 
//                  RETURNING *`,
//                 filteredValues
//               );

//               if (result.rows.length > 0) {
//                 Object.assign(this, result.rows[0]);
//               }

//               // Log warning about skipped field
//               console.warn(`Warning: ${missingField} column does not exist. Field was skipped. Please run migration to add this column.`);
              
//               return this;
//             }
//           }
//         }
        
//         // Re-throw if not a column missing error
//         throw dbError;
//       }
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Delete clinical proforma
//   async delete() {
//     try {
//       await db.query('DELETE FROM clinical_proforma WHERE id = $1', [this.id]);
//       return true;
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Get clinical proforma statistics
//   static async getStats() {
//     try {
//       const result = await db.query(`
//         SELECT 
//           COUNT(*) as total_proformas,
//           COUNT(CASE WHEN visit_type = 'first_visit' THEN 1 END) as first_visits,
//           COUNT(CASE WHEN visit_type = 'follow_up' THEN 1 END) as follow_ups,
//           COUNT(CASE WHEN doctor_decision = 'simple_case' THEN 1 END) as simple_cases,
//           COUNT(CASE WHEN doctor_decision = 'complex_case' THEN 1 END) as complex_cases,
//           COUNT(CASE WHEN requires_adl_file = true THEN 1 END) as cases_requiring_adl,
//           COUNT(CASE WHEN case_severity = 'mild' THEN 1 END) as mild_cases,
//           COUNT(CASE WHEN case_severity = 'moderate' THEN 1 END) as moderate_cases,
//           COUNT(CASE WHEN case_severity = 'severe' THEN 1 END) as severe_cases,
//           COUNT(CASE WHEN case_severity = 'critical' THEN 1 END) as critical_cases
//         FROM clinical_proforma
//       `);

//       return result.rows[0];
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Get cases by severity
//   static async getCasesBySeverity() {
//     try {
//       const result = await db.query(`
//         SELECT 
//           case_severity,
//           COUNT(*) as count
//         FROM clinical_proforma 
//         WHERE case_severity IS NOT NULL
//         GROUP BY case_severity
//         ORDER BY count DESC
//       `);

//       return result.rows;
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Get cases by decision
//   static async getCasesByDecision() {
//     try {
//       const result = await db.query(`
//         SELECT 
//           doctor_decision,
//           COUNT(*) as count
//         FROM clinical_proforma 
//         WHERE doctor_decision IS NOT NULL
//         GROUP BY doctor_decision
//         ORDER BY count DESC
//       `);

//       return result.rows;
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Convert to JSON
//   toJSON() {
//     return {
//       id: this.id,
//       patient_id: this.patient_id,
//       filled_by: this.filled_by,
//       visit_date: this.visit_date,
//       visit_type: this.visit_type,
//       room_no: this.room_no,
//       assigned_doctor: this.assigned_doctor,
//       informant_present: this.informant_present,
//       nature_of_information: this.nature_of_information,
//       onset_duration: this.onset_duration,
//       course: this.course,
//       precipitating_factor: this.precipitating_factor,
//       illness_duration: this.illness_duration,
//       current_episode_since: this.current_episode_since,
//       mood: this.mood,
//       behaviour: this.behaviour,
//       speech: this.speech,
//       thought: this.thought,
//       perception: this.perception,
//       somatic: this.somatic,
//       bio_functions: this.bio_functions,
//       adjustment: this.adjustment,
//       cognitive_function: this.cognitive_function,
//       fits: this.fits,
//       sexual_problem: this.sexual_problem,
//       substance_use: this.substance_use,
//       past_history: this.past_history,
//       family_history: this.family_history,
//       associated_medical_surgical: this.associated_medical_surgical,
//       mse_behaviour: this.mse_behaviour,
//       mse_affect: this.mse_affect,
//       mse_thought: this.mse_thought,
//       mse_delusions: this.mse_delusions,
//       mse_perception: this.mse_perception,
//       mse_cognitive_function: this.mse_cognitive_function,
//       gpe: this.gpe,
//       diagnosis: this.diagnosis,
//       icd_code: this.icd_code,
//       disposal: this.disposal,
//       workup_appointment: this.workup_appointment,
//       referred_to: this.referred_to,
//       treatment_prescribed: this.treatment_prescribed,
//       prescriptions: this.prescriptions,
//       doctor_decision: this.doctor_decision,
//       case_severity: this.case_severity,
//       requires_adl_file: this.requires_adl_file,
//       adl_reasoning: this.adl_reasoning,
//       // History of Present Illness - Expanded
//       history_narrative: this.history_narrative,
//       history_specific_enquiry: this.history_specific_enquiry,
//       history_drug_intake: this.history_drug_intake,
//       history_treatment_place: this.history_treatment_place,
//       history_treatment_dates: this.history_treatment_dates,
//       history_treatment_drugs: this.history_treatment_drugs,
//       history_treatment_response: this.history_treatment_response,
//       // Multiple Informants (JSONB)
//       informants: this.informants,
//       // Complaints and Duration (JSONB)
//       complaints_patient: this.complaints_patient,
//       complaints_informant: this.complaints_informant,
//       // Past History - Detailed
//       past_history_medical: this.past_history_medical,
//       past_history_psychiatric_dates: this.past_history_psychiatric_dates,
//       past_history_psychiatric_diagnosis: this.past_history_psychiatric_diagnosis,
//       past_history_psychiatric_treatment: this.past_history_psychiatric_treatment,
//       past_history_psychiatric_interim: this.past_history_psychiatric_interim,
//       past_history_psychiatric_recovery: this.past_history_psychiatric_recovery,
//       // Family History - Detailed
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
//       // Diagnostic Formulation
//       diagnostic_formulation_summary: this.diagnostic_formulation_summary,
//       diagnostic_formulation_features: this.diagnostic_formulation_features,
//       diagnostic_formulation_psychodynamic: this.diagnostic_formulation_psychodynamic,
//       // Premorbid Personality
//       premorbid_personality_passive_active: this.premorbid_personality_passive_active,
//       premorbid_personality_assertive: this.premorbid_personality_assertive,
//       premorbid_personality_introvert_extrovert: this.premorbid_personality_introvert_extrovert,
//       premorbid_personality_traits: this.premorbid_personality_traits,
//       premorbid_personality_hobbies: this.premorbid_personality_hobbies,
//       premorbid_personality_habits: this.premorbid_personality_habits,
//       premorbid_personality_alcohol_drugs: this.premorbid_personality_alcohol_drugs,
//       // Physical Examination - Comprehensive
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
//       // Mental Status Examination - Expanded
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
//       // Educational History
//       education_start_age: this.education_start_age,
//       education_highest_class: this.education_highest_class,
//       education_performance: this.education_performance,
//       education_disciplinary: this.education_disciplinary,
//       education_peer_relationship: this.education_peer_relationship,
//       education_hobbies: this.education_hobbies,
//       education_special_abilities: this.education_special_abilities,
//       education_discontinue_reason: this.education_discontinue_reason,
//       // Occupational History (JSONB)
//       occupation_jobs: this.occupation_jobs,
//       // Sexual and Marital History
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
//       // Religion
//       religion_type: this.religion_type,
//       religion_participation: this.religion_participation,
//       religion_changes: this.religion_changes,
//       // Present Living Situation
//       living_residents: this.living_residents,
//       living_income_sharing: this.living_income_sharing,
//       living_expenses: this.living_expenses,
//       living_kitchen: this.living_kitchen,
//       living_domestic_conflicts: this.living_domestic_conflicts,
//       living_social_class: this.living_social_class,
//       living_inlaws: this.living_inlaws,
//       // General Home Situation and Early Development
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
//       // Provisional Diagnosis and Treatment Plan
//       provisional_diagnosis: this.provisional_diagnosis,
//       treatment_plan: this.treatment_plan,
//       // Comments of the Consultant
//       consultant_comments: this.consultant_comments,
//       // ADL File Reference
//       adl_file_id: this.adl_file_id,
//       created_at: this.created_at,
//       // Additional fields from joins
//       patient_name: this.patient_name,
//       cr_no: this.cr_no,
//       psy_no: this.psy_no,
//       doctor_name: this.doctor_name,
//       doctor_role: this.doctor_role
//     };
//   }
// }

// module.exports = ClinicalProforma;























const db = require('../config/database');
const ADLFile = require('./ADLFile');
const { encrypt, decrypt, encryptObject, decryptObject } = require('../utils/encryption');
const encryptionFields = require('../utils/encryptionFields');

class ClinicalProforma {
  constructor(data) {
    // Decrypt sensitive fields after receiving from database
    const decryptedData = decryptObject(data, encryptionFields.clinicalProforma);
    
    // Log warning if any fields appear to still be encrypted after decryption attempt
    // This helps identify decryption failures
    if (process.env.NODE_ENV === 'development') {
      const encryptedFields = encryptionFields.clinicalProforma;
      encryptedFields.forEach(field => {
        if (decryptedData[field] && typeof decryptedData[field] === 'string' && decryptedData[field].length > 128) {
          // Check if it looks like base64 encrypted data
          if (/^[A-Za-z0-9+/=]+$/.test(decryptedData[field]) && !decryptedData[field].includes(' ')) {
            console.warn(`[ClinicalProforma] Field '${field}' may still be encrypted after decryption attempt (ID: ${data.id || 'unknown'})`);
          }
        }
      });
    }
    
    this.id = decryptedData.id;
    this.patient_id = decryptedData.patient_id;
    this.filled_by = decryptedData.filled_by;
    this.visit_date = decryptedData.visit_date;
    this.visit_type = decryptedData.visit_type;
    this.room_no = decryptedData.room_no;
    this.assigned_doctor = decryptedData.assigned_doctor;
    this.informant_present = decryptedData.informant_present;
    this.nature_of_information = decryptedData.nature_of_information;
    this.onset_duration = decryptedData.onset_duration;
    this.course = decryptedData.course;
    this.precipitating_factor = decryptedData.precipitating_factor;
    this.illness_duration = decryptedData.illness_duration;
    this.current_episode_since = decryptedData.current_episode_since;
    this.mood = decryptedData.mood;
    this.behaviour = decryptedData.behaviour;
    this.speech = decryptedData.speech;
    this.thought = decryptedData.thought;
    this.perception = decryptedData.perception;
    this.somatic = decryptedData.somatic;
    this.bio_functions = decryptedData.bio_functions;
    this.adjustment = decryptedData.adjustment;
    this.cognitive_function = decryptedData.cognitive_function;
    this.fits = decryptedData.fits;
    this.sexual_problem = decryptedData.sexual_problem;
    this.substance_use = decryptedData.substance_use;
    this.past_history = decryptedData.past_history;
    this.family_history = decryptedData.family_history;
    this.associated_medical_surgical = decryptedData.associated_medical_surgical;
    this.mse_behaviour = decryptedData.mse_behaviour;
    this.mse_affect = decryptedData.mse_affect;
    this.mse_thought = decryptedData.mse_thought;
    this.mse_delusions = decryptedData.mse_delusions;
    this.mse_perception = decryptedData.mse_perception;
    this.mse_cognitive_function = decryptedData.mse_cognitive_function;
    this.gpe = decryptedData.gpe;
    this.diagnosis = decryptedData.diagnosis;
    this.icd_code = decryptedData.icd_code;
    this.disposal = decryptedData.disposal;
    this.workup_appointment = decryptedData.workup_appointment;
    this.referred_to = decryptedData.referred_to;
    this.treatment_prescribed = decryptedData.treatment_prescribed;
    this.prescriptions = decryptedData.prescriptions ? (Array.isArray(decryptedData.prescriptions) ? decryptedData.prescriptions : JSON.parse(decryptedData.prescriptions || '[]')) : [];
    this.doctor_decision = decryptedData.doctor_decision;
    this.case_severity = decryptedData.case_severity;
    this.requires_adl_file = decryptedData.requires_adl_file;
    this.adl_reasoning = decryptedData.adl_reasoning;
    
    // ADL File Reference (only reference, no ADL data stored here)
    this.adl_file_id = decryptedData.adl_file_id;
    
    // Joined fields from related tables (for queries with JOINs)
    // IMPORTANT: patient_name comes from registered_patient table and is encrypted there
    // We need to decrypt it separately since it's not in clinicalProforma encryption fields
    // The decrypt() function handles null/empty values and decryption failures gracefully
    if (decryptedData.patient_name) {
      this.patient_name = decrypt(decryptedData.patient_name);
    } else {
      this.patient_name = decryptedData.patient_name || null;
    }
    this.cr_no = decryptedData.cr_no;
    this.psy_no = decryptedData.psy_no;
    this.doctor_name = decryptedData.doctor_name;
    this.doctor_role = decryptedData.doctor_role;
    
    this.created_at = decryptedData.created_at;
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
        case_severity,
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
      
      // Encrypt ALL sensitive fields before saving
      // encryptObject will automatically encrypt only fields that are in encryptionFields.clinicalProforma
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
      const encryptedData = encryptObject(allProformaData, encryptionFields.clinicalProforma);

      const proformaResult = await db.query(
        `INSERT INTO clinical_proforma (
          patient_id, filled_by, visit_date, visit_type, room_no, assigned_doctor,
          informant_present, nature_of_information, onset_duration, course, 
          precipitating_factor, illness_duration, current_episode_since, mood, 
          behaviour, speech, thought, perception, somatic, bio_functions, 
          adjustment, cognitive_function, fits, sexual_problem, substance_use, 
          past_history, family_history, associated_medical_surgical, mse_behaviour, 
          mse_affect, mse_thought, mse_delusions, mse_perception, 
          mse_cognitive_function, gpe, diagnosis, icd_code, disposal, 
          workup_appointment, referred_to, treatment_prescribed, doctor_decision, 
          case_severity, requires_adl_file, adl_reasoning, adl_file_id, prescriptions
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, 
          $45, $46, $47::jsonb
        ) RETURNING *`,
        [
          patient_id, filled_by, visit_date, visit_type, room_no, assigned_doctor,
          informant_present, 
          encryptedData.nature_of_information || nature_of_information, 
          encryptedData.onset_duration || onset_duration, 
          encryptedData.course || course,
          encryptedData.precipitating_factor || precipitating_factor, 
          encryptedData.illness_duration || illness_duration, 
          encryptedData.current_episode_since || current_episode_since, 
          encryptedData.mood || mood,
          encryptedData.behaviour || behaviour, 
          encryptedData.speech || speech, 
          encryptedData.thought || thought, 
          encryptedData.perception || perception, 
          encryptedData.somatic || somatic, 
          encryptedData.bio_functions || bio_functions,
          encryptedData.adjustment || adjustment, 
          encryptedData.cognitive_function || cognitive_function, 
          encryptedData.fits || fits, 
          encryptedData.sexual_problem || sexual_problem, 
          encryptedData.substance_use || substance_use,
          encryptedData.past_history || past_history, 
          encryptedData.family_history || family_history, 
          encryptedData.associated_medical_surgical || associated_medical_surgical, 
          encryptedData.mse_behaviour || mse_behaviour,
          encryptedData.mse_affect || mse_affect, 
          encryptedData.mse_thought || mse_thought, 
          encryptedData.mse_delusions || mse_delusions, 
          encryptedData.mse_perception || mse_perception,
          encryptedData.mse_cognitive_function || mse_cognitive_function, 
          encryptedData.gpe || gpe, 
          encryptedData.diagnosis || diagnosis, 
          encryptedData.icd_code || icd_code, 
          encryptedData.disposal || disposal,
          encryptedData.workup_appointment || workup_appointment, 
          encryptedData.referred_to || referred_to, 
          encryptedData.treatment_prescribed || treatment_prescribed, 
          doctor_decision,
          case_severity, requires_adl_file, 
          encryptedData.adl_reasoning || adl_reasoning, 
          adl_file_id, prescriptionsJson
        ]
      );

      const proforma = new ClinicalProforma(proformaResult.rows[0]);

      // If this is a complex case AND requires_adl_file is true, create ADL file automatically
      // All complex case data MUST be saved ONLY in adl_files table, NOT in clinical_proforma
      // The clinical_proforma table should only store a reference (adl_file_id) to the ADL file
      if (doctor_decision === 'complex_case' && requires_adl_file === true && complexCaseData && Object.keys(complexCaseData).length > 0) {
        try {
          // Generate ADL number using PostgreSQL function (matches schema: ADL + year + 8-char random)
          const adlNoResult = await db.query('SELECT generate_adl_number() as adl_no');
          const nextAdlNo = adlNoResult.rows[0].adl_no;

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

          console.log(`[ClinicalProforma.create] ✅ Creating ADL file for complex case`);
          console.log(`[ClinicalProforma.create] ADL No: ${nextAdlNo}, Proforma ID: ${proforma.id}, Patient ID: ${patient_id}`);
          console.log(`[ClinicalProforma.create] Complex case data keys count: ${Object.keys(complexCaseData).length}`);
          console.log(`[ClinicalProforma.create] Complex case data sample:`, {
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
          console.log(`[ClinicalProforma.create] Successfully created ADL file ${adlFile.id} and linked to proforma ${proforma.id}`);
        } catch (adlError) {
          console.error('[ClinicalProforma.create] Error creating ADL file:', adlError);
          // Don't fail the entire proforma creation, but log the error
          // The proforma is already created, but ADL file creation failed
          throw new Error(`Failed to create ADL file for complex case: ${adlError.message}`);
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
      // Check if id is a UUID (contains hyphens and is 36 chars) or integer
      const isUUID = typeof id === 'string' && id.includes('-') && id.length === 36;
      
      let query;
      let queryParam;
      
      if (isUUID) {
        // For UUID, use UUID type casting
        query = `SELECT cp.*, p.name as patient_name, p.cr_no, p.psy_no, 
                u.name as doctor_name, u.role as doctor_role
         FROM clinical_proforma cp
         LEFT JOIN registered_patient p ON cp.patient_id::text = p.id::text
         LEFT JOIN users u ON cp.filled_by = u.id
         WHERE cp.id::text = $1`;
        queryParam = String(id);
      } else {
        // For integer, use integer comparison
        query = `SELECT cp.*, p.name as patient_name, p.cr_no, p.psy_no, 
                u.name as doctor_name, u.role as doctor_role
         FROM clinical_proforma cp
         LEFT JOIN registered_patient p ON cp.patient_id::text = p.id::text
         LEFT JOIN users u ON cp.filled_by = u.id
         WHERE cp.id = $1`;
        queryParam = typeof id === 'number' ? id : parseInt(id, 10);
      }

      const result = await db.query(query, [queryParam]);

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
      // Check if ID is a UUID (contains hyphens and is 36 chars) or integer
      const isUUID = typeof patient_id === 'string' && patient_id.includes('-') && patient_id.length === 36;
      
      console.log(`[ClinicalProforma.findByPatientId] Querying for patient_id: ${patient_id}, isUUID: ${isUUID}`);
      
      // If UUID, use text comparison directly (since clinical_proforma.patient_id may be INTEGER)
      // This avoids type casting issues
      let query;
      let queryParam;
      
      if (isUUID) {
        // Use text comparison to handle both UUID and INTEGER column types
        query = `
          SELECT cp.*, p.name as patient_name, p.cr_no, p.psy_no, 
                 u.name as doctor_name, u.role as doctor_role
          FROM clinical_proforma cp
          LEFT JOIN registered_patient p ON cp.patient_id::text = p.id::text
          LEFT JOIN users u ON cp.filled_by = u.id
          WHERE cp.patient_id::text = $1
          ORDER BY cp.visit_date DESC
        `;
        queryParam = String(patient_id);
      } else {
        // For integer, use integer comparison
        query = `
          SELECT cp.*, p.name as patient_name, p.cr_no, p.psy_no, 
                 u.name as doctor_name, u.role as doctor_role
          FROM clinical_proforma cp
          LEFT JOIN registered_patient p ON cp.patient_id = p.id
          LEFT JOIN users u ON cp.filled_by = u.id
          WHERE cp.patient_id = $1
          ORDER BY cp.visit_date DESC
        `;
        queryParam = parseInt(patient_id, 10);
      }
      
      const result = await db.query(query, [queryParam]);

      return result.rows.map(row => new ClinicalProforma(row));
    } catch (error) {
      throw error;
    }
  }

  // Get all clinical proforma with pagination and filters
  static async findAll(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      // Check if we need to filter by filled_by with UUID - if so, we'll need to join users in count query too
      const needsUserJoinForFilter = filters.filled_by && 
        typeof filters.filled_by === 'string' && 
        filters.filled_by.includes('-') && 
        filters.filled_by.length === 36;
      
      let query = `
        SELECT cp.*, p.name as patient_name, p.cr_no, p.psy_no, 
               u.name as doctor_name, u.role as doctor_role
        FROM clinical_proforma cp
        LEFT JOIN registered_patient p ON cp.patient_id = p.id
        LEFT JOIN users u ON cp.filled_by = u.id
        WHERE 1=1
      `;
      let countQuery = needsUserJoinForFilter 
        ? 'SELECT COUNT(*) FROM clinical_proforma cp LEFT JOIN users u ON cp.filled_by = u.id WHERE 1=1'
        : 'SELECT COUNT(*) FROM clinical_proforma WHERE 1=1';
      const params = [];
      let paramCount = 0;

      // Apply filters
      if (filters.visit_type) {
        paramCount++;
        query += ` AND cp.visit_type = $${paramCount}`;
        countQuery += ` AND visit_type = $${paramCount}`;
        params.push(filters.visit_type);
      }

      if (filters.doctor_decision) {
        paramCount++;
        query += ` AND cp.doctor_decision = $${paramCount}`;
        countQuery += ` AND doctor_decision = $${paramCount}`;
        params.push(filters.doctor_decision);
      }

      if (filters.case_severity) {
        paramCount++;
        query += ` AND cp.case_severity = $${paramCount}`;
        countQuery += ` AND case_severity = $${paramCount}`;
        params.push(filters.case_severity);
      }

      if (filters.requires_adl_file !== undefined) {
        paramCount++;
        query += ` AND cp.requires_adl_file = $${paramCount}`;
        countQuery += ` AND requires_adl_file = $${paramCount}`;
        params.push(filters.requires_adl_file);
      }

      if (filters.filled_by) {
        paramCount++;
        // Handle UUID user IDs - check if filled_by is a UUID string
        const isUUID = typeof filters.filled_by === 'string' && 
                      filters.filled_by.includes('-') && 
                      filters.filled_by.length === 36;
        
        if (isUUID) {
          // If it's a UUID, match using the users table join (u.id) instead of cp.filled_by directly
          // This avoids type conversion issues between UUID and integer
          query += ` AND u.id::text = $${paramCount}::text`;
          countQuery += ` AND u.id::text = $${paramCount}::text`;
        } else {
          // If it's an integer, use direct comparison with cp.filled_by
          query += ` AND cp.filled_by = $${paramCount}`;
          countQuery += ` AND filled_by = $${paramCount}`;
        }
        params.push(filters.filled_by);
      }

      if (filters.room_no) {
        paramCount++;
        query += ` AND cp.room_no = $${paramCount}`;
        countQuery += ` AND room_no = $${paramCount}`;
        params.push(filters.room_no);
      }

      if (filters.date_from) {
        paramCount++;
        query += ` AND cp.visit_date >= $${paramCount}`;
        countQuery += ` AND visit_date >= $${paramCount}`;
        params.push(filters.date_from);
      }

      if (filters.date_to) {
        paramCount++;
        query += ` AND cp.visit_date <= $${paramCount}`;
        countQuery += ` AND visit_date <= $${paramCount}`;
        params.push(filters.date_to);
      }

      query += ` ORDER BY cp.visit_date DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
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
        'treatment_prescribed', 'doctor_decision', 'case_severity', 
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
      const dateFields = ['visit_date', 'workup_appointment']; // Date fields that should not be encrypted
      
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
            updates.push(`${key} = $${paramCount}::jsonb`);
            values.push(jsonValue);
          } else if (dateFields.includes(key)) {
            // Handle date fields - convert empty strings to null, never encrypt
            let sanitizedDate = value;
            if (value === '' || (typeof value === 'string' && value.trim() === '')) {
              sanitizedDate = null;
            }
            updates.push(`${key} = $${paramCount}`);
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
            
            updates.push(`${key} = $${paramCount}`);
            // Encrypt sensitive fields before saving (but never encrypt date or integer fields)
            if (encryptionFields.clinicalProforma.includes(key) && !dateFields.includes(key) && !integerFields.includes(key)) {
              values.push(encrypt(sanitizedValue));
            } else {
              values.push(sanitizedValue);
            }
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
        `UPDATE clinical_proforma SET ${updates.join(', ')} 
         WHERE id = $${paramCount} 
         RETURNING *`,
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
          COUNT(CASE WHEN requires_adl_file = true THEN 1 END) as cases_requiring_adl,
          COUNT(CASE WHEN case_severity = 'mild' THEN 1 END) as mild_cases,
          COUNT(CASE WHEN case_severity = 'moderate' THEN 1 END) as moderate_cases,
          COUNT(CASE WHEN case_severity = 'severe' THEN 1 END) as severe_cases,
          COUNT(CASE WHEN case_severity = 'critical' THEN 1 END) as critical_cases
        FROM clinical_proforma
      `);

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get cases by severity
  static async getCasesBySeverity() {
    try {
      const result = await db.query(`
        SELECT 
          case_severity,
          COUNT(*) as count
        FROM clinical_proforma 
        WHERE case_severity IS NOT NULL
        GROUP BY case_severity
        ORDER BY count DESC
      `);

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

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
      case_severity: this.case_severity,
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