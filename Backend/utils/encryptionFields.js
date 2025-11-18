/**
 * Configuration for which fields should be encrypted/decrypted
 * Fields are organized by model/table
 */

module.exports = {
  // Patient (registered_patient table) - Sensitive personal information
  patient: [
    'name',
    'contact_number',
    'father_name',
    'address_line',
    'city',
    'district',
    'state',
    'pin_code',
    'head_name',
    'head_relationship',
    'head_occupation'
  ],

  // Clinical Proforma - Sensitive medical information
  clinicalProforma: [
    'diagnosis',
    'gpe',
    'past_history',
    'family_history',
    'treatment_prescribed',
    'precipitating_factor',
    'illness_duration',
    'current_episode_since',
    'mse_delusions',
    'disposal',
    'referred_to',
    'adl_reasoning'
  ],

  // ADL File - All detailed medical and personal history
  adlFile: [
    // History of Present Illness
    'history_narrative',
    'history_specific_enquiry',
    'history_drug_intake',
    'history_treatment_place',
    'history_treatment_drugs',
    'history_treatment_response',
    
    // Past History
    'past_history_medical',
    'past_history_psychiatric_diagnosis',
    'past_history_psychiatric_treatment',
    'past_history_psychiatric_interim',
    'past_history_psychiatric_recovery',
    
    // Family History
    'family_history_father_personality',
    'family_history_father_death_cause',
    'family_history_mother_personality',
    'family_history_mother_death_cause',
    
    // Diagnostic Formulation
    'diagnostic_formulation_summary',
    'diagnostic_formulation_features',
    'diagnostic_formulation_psychodynamic',
    
    // Premorbid Personality
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
    'education_performance',
    'education_disciplinary',
    'education_peer_relationship',
    'education_hobbies',
    'education_special_abilities',
    'education_discontinue_reason',
    
    // Sexual History
    'sexual_menarche_reaction',
    'sexual_education',
    'sexual_masturbation',
    'sexual_contact',
    'sexual_premarital_extramarital',
    'sexual_adjustment_general',
    'sexual_adjustment_sexual',
    'sexual_problems',
    
    // Religion
    'religion_type',
    'religion_participation',
    'religion_changes',
    
    // Living Situation
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
    'personal_birth_place',
    'personal_delivery_type',
    'personal_complications_prenatal',
    'personal_complications_natal',
    'personal_complications_postnatal',
    
    // Development
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

