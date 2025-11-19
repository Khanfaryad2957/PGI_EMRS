/**
 * Configuration for which fields should be encrypted/decrypted
 * Fields are organized by model/table
 * 
 * IMPORTANT: All sensitive personal and medical information must be encrypted in the database
 * and automatically decrypted when fetched for display in the UI.
 */

module.exports = {
  // Patient (registered_patient table) - Sensitive personal information
  patient: [
    // Basic personal information
    'name',
    'contact_number',
    'father_name',
    
    // Address information
    'address_line',
    'address_line_2',
    'city',
    'district',
    'state',
    'pin_code',
    'country',
    'present_address',
    'present_address_line_1',
    'present_address_line_2',
    'present_city_town_village',
    'present_district',
    'present_state',
    'present_pin_code',
    'present_country',
    'permanent_address',
    'permanent_address_line_1',
    'permanent_address_line_2',
    'permanent_city_town_village',
    'permanent_district',
    'permanent_state',
    'permanent_pin_code',
    'permanent_country',
    'local_address',
    
    // Head of family information
    'head_name',
    'head_relationship',
    'head_occupation',
    'head_education',
    // Note: head_age and head_income are INTEGER/NUMERIC - cannot encrypt
    
    // Additional sensitive information
    'actual_occupation',
    'education_level',
    'completed_years_of_education',
    // Note: patient_income and family_income are NUMERIC - cannot encrypt
    'exact_source',
    'school_college_office',
    
    // Step 1 - Quick Entry fields (sensitive identifiers)
    'unit_consit',
    'room_no',
    'serial_no',
    'file_no',
    'unit_days',
    
    // Step 2 - Personal Information
    'psy_no',
    'special_clinic_no',
    'age_group',
    'marital_status',
    // Note: year_of_marriage, no_of_children_male, no_of_children_female are INTEGER - cannot encrypt
    
    // Step 2 - Occupation & Education
    'occupation',
    'education',
    // Note: income is NUMERIC - cannot encrypt
    
    // Step 2 - Family Information
    'religion',
    'family_type',
    'locality',
    
    // Step 2 - Referral & Mobility
    'distance_from_hospital',
    'mobility',
    'referred_by',
    
    // Step 2 - Assignment
    'assigned_room',
    'assigned_doctor_name'
  ],

  // Clinical Proforma - Sensitive medical information
  clinicalProforma: [
    // Basic Information
    'room_no',
    'assigned_doctor',
    
    // Informant information
    'nature_of_information',
    
    // Present Illness
    'onset_duration',
    'course',
    'precipitating_factor',
    'illness_duration',
    'current_episode_since',
    
    // Complaints / History of Presenting Illness (stored as comma-separated strings)
    'mood',
    'behaviour',
    'speech',
    'thought',
    'perception',
    'somatic',
    'bio_functions',
    'adjustment',
    'cognitive_function',
    'fits',
    'sexual_problem',
    'substance_use',
    
    // Additional History
    'past_history',
    'family_history',
    'associated_medical_surgical',
    
    // Mental State Examination
    'mse_behaviour',
    'mse_affect',
    'mse_thought',
    'mse_delusions',
    'mse_perception',
    'mse_cognitive_function',
    
    // General Physical Examination
    'gpe',
    
    // Diagnosis & Management
    'diagnosis',
    'icd_code',
    'disposal',
    'workup_appointment',
    'referred_to',
    'treatment_prescribed',
    'adl_reasoning',
    
    // ADL-related fields (when stored in clinical_proforma for complex cases)
    'history_narrative',
    'history_specific_enquiry',
    'history_drug_intake',
    'history_treatment_place',
    'history_treatment_dates',
    'history_treatment_drugs',
    'history_treatment_response'
  ],

  // ADL File - All detailed medical and personal history
  adlFile: [
    // History of Present Illness
    'history_narrative',
    'history_specific_enquiry',
    'history_drug_intake',
    'history_treatment_place',
    'history_treatment_dates',
    'history_treatment_drugs',
    'history_treatment_response',
    
    // Past History
    'past_history_medical',
    'past_history_psychiatric_dates',
    'past_history_psychiatric_diagnosis',
    'past_history_psychiatric_treatment',
    'past_history_psychiatric_interim',
    'past_history_psychiatric_recovery',
    
    // Family History - Father
    // Note: family_history_father_age and family_history_father_death_age are INTEGER - cannot encrypt
    'family_history_father_education',
    'family_history_father_occupation',
    'family_history_father_personality',
    'family_history_father_death_date',
    'family_history_father_death_cause',
    
    // Family History - Mother
    // Note: family_history_mother_age and family_history_mother_death_age are INTEGER - cannot encrypt
    'family_history_mother_education',
    'family_history_mother_occupation',
    'family_history_mother_personality',
    'family_history_mother_death_date',
    'family_history_mother_death_cause',
    
    // Diagnostic Formulation
    'diagnostic_formulation_summary',
    'diagnostic_formulation_features',
    'diagnostic_formulation_psychodynamic',
    
    // Premorbid Personality
    'premorbid_personality_passive_active',
    'premorbid_personality_assertive',
    'premorbid_personality_introvert_extrovert',
    'premorbid_personality_traits',
    'premorbid_personality_hobbies',
    'premorbid_personality_habits',
    'premorbid_personality_alcohol_drugs',
    
    // Physical Examination
    'physical_appearance',
    'physical_body_build',
    'physical_pulse',
    'physical_bp',
    'physical_height',
    'physical_weight',
    'physical_waist',
    'physical_fundus',
    'physical_cvs_apex',
    'physical_cvs_regularity',
    'physical_cvs_heart_sounds',
    'physical_cvs_murmurs',
    'physical_chest_expansion',
    'physical_chest_percussion',
    'physical_chest_adventitious',
    'physical_abdomen_tenderness',
    'physical_abdomen_mass',
    'physical_abdomen_bowel_sounds',
    'physical_cns_cranial',
    'physical_cns_motor_sensory',
    'physical_cns_rigidity',
    'physical_cns_involuntary',
    'physical_cns_superficial_reflexes',
    'physical_cns_dtrs',
    'physical_cns_plantar',
    'physical_cns_cerebellar',
    
    // Mental Status Examination
    'mse_general_demeanour',
    'mse_general_tidy',
    'mse_general_awareness',
    'mse_general_cooperation',
    'mse_psychomotor_verbalization',
    'mse_psychomotor_pressure',
    'mse_psychomotor_tension',
    'mse_psychomotor_posture',
    'mse_psychomotor_mannerism',
    'mse_psychomotor_catatonic',
    'mse_affect_subjective',
    'mse_affect_tone',
    'mse_affect_resting',
    'mse_affect_fluctuation',
    'mse_thought_flow',
    'mse_thought_form',
    'mse_thought_content',
    'mse_cognitive_consciousness',
    'mse_cognitive_orientation_time',
    'mse_cognitive_orientation_place',
    'mse_cognitive_orientation_person',
    'mse_cognitive_memory_immediate',
    'mse_cognitive_memory_recent',
    'mse_cognitive_memory_remote',
    'mse_cognitive_subtraction',
    'mse_cognitive_digit_span',
    'mse_cognitive_counting',
    'mse_cognitive_general_knowledge',
    'mse_cognitive_calculation',
    'mse_cognitive_similarities',
    'mse_cognitive_proverbs',
    'mse_insight_understanding',
    'mse_insight_judgement',
    
    // Education
    // Note: education_start_age is INTEGER - cannot encrypt
    'education_highest_class',
    'education_performance',
    'education_disciplinary',
    'education_peer_relationship',
    'education_hobbies',
    'education_special_abilities',
    'education_discontinue_reason',
    
    // Sexual History
    // Note: sexual_menarche_age and sexual_spouse_age are INTEGER - cannot encrypt
    'sexual_menarche_reaction',
    'sexual_education',
    'sexual_masturbation',
    'sexual_contact',
    'sexual_premarital_extramarital',
    'sexual_marriage_arranged',
    'sexual_marriage_date',
    'sexual_spouse_occupation',
    'sexual_adjustment_general',
    'sexual_adjustment_sexual',
    'sexual_problems',
    
    // Religion
    'religion_type',
    'religion_participation',
    'religion_changes',
    
    // Living Situation
    // Note: living_income_sharing might be numeric - check if it's VARCHAR or NUMERIC
    'living_income_sharing',
    'living_expenses',
    'living_kitchen',
    'living_domestic_conflicts',
    'living_social_class',
    
    // Home Situation
    'home_situation_childhood',
    'home_situation_parents_relationship',
    'home_situation_socioeconomic',
    'home_situation_interpersonal',
    
    // Personal History
    'personal_birth_date',
    'personal_birth_place',
    'personal_delivery_type',
    'personal_complications_prenatal',
    'personal_complications_natal',
    'personal_complications_postnatal',
    
    // Development
    // Note: development_weaning_age is INTEGER - cannot encrypt
    'development_first_words',
    'development_three_words',
    'development_walking',
    'development_neurotic_traits',
    'development_nail_biting',
    'development_bedwetting',
    'development_phobias',
    'development_childhood_illness',
    
    // Diagnosis and Treatment
    'provisional_diagnosis',
    'treatment_plan',
    'consultant_comments'
  ],

  // Prescription - Sensitive medication information
  prescription: [
    'medicine',
    'dosage',
    'details',
    'notes'
  ]
};

