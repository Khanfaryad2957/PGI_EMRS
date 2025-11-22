export const USER_ROLES = {
  ADMIN: 'Admin',
  FACULTY: 'Faculty',
  RESIDENT: 'Resident',
  MWO: 'Psychiatric Welfare Officer',
};

// Helper function to get display name for a role
export const getRoleDisplayName = (role) => {
  if (!role) return 'N/A';
  return role;
};

// Helper function to normalize role (maps old role names to new ones)
export const normalizeRole = (role) => {
  if (!role) return null;
  const roleMap = {
    // New role names (current)
    'Admin': 'Admin',
    'Faculty': 'Faculty',
    'Resident': 'Resident',
    'Psychiatric Welfare Officer': 'Psychiatric Welfare Officer',
    // Legacy role names (for backward compatibility)
    'System Administrator': 'Admin',
    'MWO': 'Psychiatric Welfare Officer',
    'JR': 'Resident',
    'SR': 'Faculty',
    'Faculty Residents (Junior Resident (JR))': 'Resident',
    'Faculty Residents (Senior Resident (SR))': 'Faculty',
  };
  return roleMap[role] || role;
};

// Helper functions to check roles (handles both old and new names)
export const isAdmin = (role) => {
  const normalized = normalizeRole(role);
  return normalized === 'Admin';
};

export const isMWO = (role) => {
  const normalized = normalizeRole(role);
  return normalized === 'Psychiatric Welfare Officer';
};

export const isJR = (role) => {
  const normalized = normalizeRole(role);
  return normalized === 'Resident';
};

export const isSR = (role) => {
  const normalized = normalizeRole(role);
  return normalized === 'Faculty';
};

export const isJrSr = (role) => {
  return isJR(role) || isSR(role);
};

export const VISIT_TYPES = [
  { value: 'first_visit', label: 'First Visit' },
  { value: 'follow_up', label: 'Follow Up' },
];

export const CASE_SEVERITY = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
  { value: 'critical', label: 'Critical' },
];

export const DOCTOR_DECISION = [
  { value: 'simple_case', label: 'Simple Case' },
  { value: 'complex_case', label: 'Complex Case' },
];

export const FILE_STATUS = [
  { value: 'created', label: 'Created' },
  { value: 'stored', label: 'Stored' },
  { value: 'retrieved', label: 'Retrieved' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];


// Indian States Options
export const INDIAN_STATES = [
  { value: 'andhra_pradesh', label: 'Andhra Pradesh' },
  { value: 'arunachal_pradesh', label: 'Arunachal Pradesh' },
  { value: 'assam', label: 'Assam' },
  { value: 'bihar', label: 'Bihar' },
  { value: 'chhattisgarh', label: 'Chhattisgarh' },
  { value: 'goa', label: 'Goa' },
  { value: 'gujarat', label: 'Gujarat' },
  { value: 'haryana', label: 'Haryana' },
  { value: 'himachal_pradesh', label: 'Himachal Pradesh' },
  { value: 'jharkhand', label: 'Jharkhand' },
  { value: 'karnataka', label: 'Karnataka' },
  { value: 'kerala', label: 'Kerala' },
  { value: 'madhya_pradesh', label: 'Madhya Pradesh' },
  { value: 'maharashtra', label: 'Maharashtra' },
  { value: 'manipur', label: 'Manipur' },
  { value: 'meghalaya', label: 'Meghalaya' },
  { value: 'mizoram', label: 'Mizoram' },
  { value: 'nagaland', label: 'Nagaland' },
  { value: 'odisha', label: 'Odisha' },
  { value: 'punjab', label: 'Punjab' },
  { value: 'rajasthan', label: 'Rajasthan' },
  { value: 'sikkim', label: 'Sikkim' },
  { value: 'tamil_nadu', label: 'Tamil Nadu' },
  { value: 'telangana', label: 'Telangana' },
  { value: 'tripura', label: 'Tripura' },
  { value: 'uttar_pradesh', label: 'Uttar Pradesh' },
  { value: 'uttarakhand', label: 'Uttarakhand' },
  { value: 'west_bengal', label: 'West Bengal' },
  { value: 'andaman_nicobar', label: 'Andaman and Nicobar Islands' },
  { value: 'chandigarh', label: 'Chandigarh' },
  { value: 'dadra_nagar_haveli', label: 'Dadra and Nagar Haveli and Daman and Diu' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'jammu_kashmir', label: 'Jammu and Kashmir' },
  { value: 'ladakh', label: 'Ladakh' },
  { value: 'lakshadweep', label: 'Lakshadweep' },
  { value: 'puducherry', label: 'Puducherry' },
];



// Patient Registration Form Schema
export const PATIENT_REGISTRATION_FORM = [

  // Quick Entry Fields &  Registration Details
  { value: 'cr_no', label: 'CR Number' },
  { value: 'date', label: 'Date' },
  { value: 'name', label: 'Full Name' },
  { value: 'mobile_no', label: 'Mobile Number' },
  { value: 'age', label: 'Age' },
  { value: 'sex', label: 'Sex' },
  { value: 'category', label: 'Category' },
  { value: 'father_name', label: 'Father Name' },
  { value: 'department', label: 'Department' },
  { value: 'unit_consit', label: 'Unit Constituent' },
  { value: 'room_no', label: 'Room Number' }, //sitting room
  { value: 'serial_no', label: 'Serial Number' },
  { value: 'file_no', label: 'File Number' },
  { value: 'unit_days', label: 'Unit Days' },
  { value: "contact_number", label: "Contact Number" },


  { value: 'seen_in_walk_in_on', label: 'Seen in Walk-in On' }, // First examination date (walk-in case)
  { value: 'worked_up_on', label: 'Worked Up On' },
  { value: 'psy_no', label: 'PSY Number' },
  { value: 'special_clinic_no', label: 'Special Clinic Number' },
  { value: 'age_group', label: 'Age Group' },

  // Personal Information
  { value: 'marital_status', label: 'Marital Status' },
  { value: 'year_of_marriage', label: 'Year of Marriage' },
  { value: 'no_of_children_male', label: 'Number of Children - Male' },
  { value: 'no_of_children_female', label: 'Number of Children - Female' },

  // Occupation & Education
  { value: 'occupation', label: 'Occupation' },
  { value: 'education', label: 'Education' },
  { value: 'locality', label: 'Locality' },
  { value: 'income', label: 'Income' },
  { value: 'religion', label: 'Religion' },
  { value: 'family_type', label: 'Family Type' },



  //Head of Family
  { value: 'head_name', label: 'Family Head Name' },
  { value: 'head_age', label: 'Family Head Age' },
  { value: 'head_relationship', label: 'Family Head Relationship' },
  { value: 'head_education', label: 'Family Head Education' },
  { value: 'head_occupation', label: 'Family Head Occupation' },
  { value: 'head_income', label: 'Family Head Income' },

  // Exact Distance from Hospital
  { value: 'distance_from_hospital', label: 'Exact Distance from Hospital' },

  // Mobility
  { value: 'mobility', label: 'Mobility' },

  // Referred By
  { value: 'referred_by', label: 'Referred By' },

  //Address Details
  { value: 'address_line', label: 'Address Line' },
  { value: 'country', label: 'Country' },
  { value: 'state', label: 'State' },
  { value: 'district', label: 'District' },
  { value: 'city', label: 'City' },
  { value: 'pin_code', label: 'Pin Code' },


//Addictional field
  { value: 'assigned_doctor_name', label: 'Assigned Doctor Name' },
  { value: 'assigned_doctor_id', label: 'Assigned Doctor ID' },
  { value: 'assigned_room', label: 'Assigned Room' },

];


export const CATEGORY_OPTIONS = [
  { value: 'GEN', label: 'General (GEN) / Unreserved (UR)' },
  { value: 'SC', label: 'Scheduled Caste (SC)' },
  { value: 'ST', label: 'Scheduled Tribe (ST)' },
  { value: 'OBC', label: 'Other Backward Class (OBC)' },
  { value: 'EWS', label: 'Economically Weaker Section (EWS)' }
];

// Patient Registration Form Schema Options
export const RELIGION_OPTIONS = [
  { value: 'hinduism', label: 'Hinduism' },
  { value: 'islam', label: 'Islam' },
  { value: 'sikhism', label: 'Sikhism' },
  { value: 'christianity', label: 'Christianity' },
  { value: 'others', label: 'Others' },
  { value: 'not_known', label: 'Not Known' },
];


export const HEAD_RELATIONSHIP_OPTIONS = [
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'brother', label: 'Brother' },
  { value: 'sister', label: 'Sister' },
  { value: 'other', label: 'Other' },
];

export const LOCALITY_OPTIONS = [
  { value: 'urban', label: 'Urban' },
  { value: 'rural', label: 'Rural' },
  { value: 'other', label: 'Other' },
];

// Occupation Options
export const OCCUPATION_OPTIONS = [
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'unskilled', label: 'Unskilled' },
  { value: 'semi_skilled', label: 'Semi-skilled' },
  { value: 'skilled', label: 'Skilled' },
  { value: 'clerical_shop_farmer', label: 'Clerical/Shop/Farmer' },
  { value: 'semi_professional', label: 'Semi-professional' },
  { value: 'household_housewife', label: 'Household/housewife' },
  { value: 'retired', label: 'Retired' },
  { value: 'student', label: 'Student' },
  { value: 'professional', label: 'Professional' },
  { value: 'others', label: 'Others' },
];

// Education Options
export const EDUCATION_OPTIONS = [
  { value: 'illiterate_literate', label: 'Illiterate/Literate' },
  { value: 'primary', label: 'Primary' },
  { value: 'middle', label: 'Middle' },
  { value: 'matric', label: 'Matric' },
  { value: 'inter_diploma', label: 'Inter/Diploma' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'master_professional', label: 'Master/Professional' },
  { value: 'not_known', label: 'Not Known' },
];

// Mobility Options
export const MOBILITY_OPTIONS = [
  { value: 'permanent_resident', label: 'Permanent resident of Punjab/Haryana/Chandigarh/Himachal Pradesh' },
  { value: 'transferable', label: 'Transferable' },
  { value: 'visiting_chandigarh', label: 'Visiting Chandigarh for a short duration' },
  { value: 'others', label: 'Others' },
  { value: 'not_known', label: 'Not Known' },
];

// Referred By Options
export const REFERRED_BY_OPTIONS = [
  { value: 'self', label: 'Self' },
  { value: 'medical_specialities_pgi', label: 'Medical Specialities in PGI' },
  { value: 'surgical_specialities_pgi', label: 'Surgical Specialities in PGI' },
  { value: 'physician_surgeon_outside_pgi', label: 'Physician/Surgeon outside PGI' },
  { value: 'psychiatrist_outside_pgi', label: 'Psychiatrist outside PGI' },
  { value: 'relative_family', label: 'Relative/Family' },
  { value: 'others', label: 'Others' },
];



export const SEX_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'T', label: 'Transgender' },
  { value: 'NB', label: 'Non-binary' },
  { value: 'I', label: 'Intersex' },
  { value: 'PNTS', label: 'Prefer not to say' },
  { value: 'O', label: 'Other' },
];

export const MARITAL_STATUS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'remarried', label: 'Remarried' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'separated', label: 'Separated' },
  { value: 'others', label: 'Others' },
  { value: 'not_known', label: 'Not Known' },
];

export const FAMILY_TYPE_OPTIONS = [
  { value: 'nuclear', label: 'Nuclear' },
  { value: 'extended', label: 'Extended' },
  { value: 'joint', label: 'Joint' },
  { value: 'others', label: 'Others' },
  { value: 'not_known', label: 'Not Known' },
];




// Age Group Options
export const AGE_GROUP_OPTIONS = [
  { value: '0-15', label: '0 – 15' },
  { value: '15-30', label: '15 – 30' },
  { value: '30-45', label: '30 – 45' },
  { value: '45-60', label: '45 – 60' },
  { value: '60+', label: '60 – Above' },
];

// Unit Days Options
export const UNIT_DAYS_OPTIONS = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
];













// Walk-in Clinical Proforma Form Schema (Simple Case - Step 1 & Step 2)
// This includes basic information and clinical proforma fields (excluding ADL fields)
export const CLINICAL_PROFORMA_FORM = [
  // Step 1: Basic Information filled by the Medical Welfare officer
  { value: 'patient_id', label: 'Patient ID' },//refrence of the patient schema
  { value: 'name', label: 'Full Name' },//refrence of the patient schema
  // { value: 'visit_date', label: 'Visit Date' },//refrence of the patient schema
  // { value: 'visit_type', label: 'Visit Type' }, //refrence of the patient schema
  {value:"age", label: "Age"},//refrence of the patient schema
  {value:"sex", label: "Sex"},//refrence of the patient schema
  { value: 'room_no', label: 'Room Number / Ward' }, //refrence of the patient schema
  { value: 'assigned_doctor', label: 'Assigned Doctor' }, //refrence of the patient schema



  // Step 2: Walk-in Clinical Proforma filled by the Doctor
  //  Walk-in Clinical Proforma - Informant
  { value: 'informant_present', label: 'Informant Present/Absent' },
  { value: 'nature_of_information', label: 'Nature of Information' },
  { value: 'onset_duration', label: 'Onset Duration' },
  { value: 'course', label: 'Course' },
  { value: 'precipitating_factor', label: 'Precipitating Factor' },
  { value: 'illness_duration', label: 'Total Duration of Illness' },
  { value: 'current_episode_since', label: 'Current Episode Duration / Worsening Since' },

  //  Complaints / History of Presenting Illness
  { value: 'mood', label: 'Mood' },
  { value: 'behaviour', label: 'Behaviour' },
  { value: 'speech', label: 'Speech' },
  { value: 'thought', label: 'Thought' },
  { value: 'perception', label: 'Perception' },
  { value: 'somatic', label: 'Somatic' },
  { value: 'bio_functions', label: 'Bio-functions' },
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'cognitive_function', label: 'Cognitive Function' },
  { value: 'fits', label: 'Fits' },
  { value: 'sexual_problem', label: 'Sexual Problem' },
  { value: 'substance_use', label: 'Substance Use' },

  //  Additional History
  { value: 'past_history', label: 'Past Psychiatric History' },
  { value: 'family_history', label: 'Family History' },
  { value: 'associated_medical_surgical', label: 'Associated Medical/Surgical Illness' },

  //  Mental State Examination (MSE)
  { value: 'mse_behaviour', label: 'MSE - Behaviour' },
  { value: 'mse_affect', label: 'MSE - Affect & Mood' },
  { value: 'mse_thought', label: 'MSE - Thought (Flow, Form, Content)' },
  { value: 'mse_delusions', label: 'MSE - Delusions / Ideas of' },
  { value: 'mse_perception', label: 'MSE - Perception' },
  { value: 'mse_cognitive_function', label: 'MSE - Cognitive Functions' },

  //  General Physical Examination
  { value: 'gpe', label: 'General Physical Examination (GPE) Findings' },
  { value: 'diagnosis', label: 'Diagnosis' },
  { value: 'icd_code', label: 'ICD Code' },
  { value: 'doctor_decision', label: 'Doctor Decision' },// doctor decession is complex then  filled the adl file if case simple then go to precribed medicine
];

// ADL File Form Schema (Complex Case - Step 3)
// Additional Detail (ADL) fields for complex cases
export const ADL_FILE_FORM = [
  // History
  { value: 'history_narrative', label: 'History Narrative' },
  { value: 'history_specific_enquiry', label: 'History Specific Enquiry' },
  { value: 'history_drug_intake', label: 'History Drug Intake' },
  { value: 'history_treatment_place', label: 'History Treatment Place' },
  { value: 'history_treatment_dates', label: 'History Treatment Dates' },
  { value: 'history_treatment_drugs', label: 'History Treatment Drugs' },
  { value: 'history_treatment_response', label: 'History Treatment Response' },

  // Informants
  { value: 'informants', label: 'Informants' },

  // Complaints
  { value: 'complaints_patient', label: 'Complaints - Patient' },
  { value: 'complaints_informant', label: 'Complaints - Informant' },

  // Past History
  { value: 'past_history_medical', label: 'Past History - Medical' },
  { value: 'past_history_psychiatric_dates', label: 'Past History - Psychiatric Dates' },
  { value: 'past_history_psychiatric_diagnosis', label: 'Past History - Psychiatric Diagnosis' },
  { value: 'past_history_psychiatric_treatment', label: 'Past History - Psychiatric Treatment' },
  { value: 'past_history_psychiatric_interim', label: 'Past History - Psychiatric Interim' },
  { value: 'past_history_psychiatric_recovery', label: 'Past History - Psychiatric Recovery' },

  // Family History - Father
  { value: 'family_history_father_age', label: 'Family History - Father Age' },
  { value: 'family_history_father_education', label: 'Family History - Father Education' },
  { value: 'family_history_father_occupation', label: 'Family History - Father Occupation' },
  { value: 'family_history_father_personality', label: 'Family History - Father Personality' },
  { value: 'family_history_father_deceased', label: 'Family History - Father Deceased' },
  { value: 'family_history_father_death_age', label: 'Family History - Father Death Age' },
  { value: 'family_history_father_death_date', label: 'Family History - Father Death Date' },
  { value: 'family_history_father_death_cause', label: 'Family History - Father Death Cause' },

  // Family History - Mother
  { value: 'family_history_mother_age', label: 'Family History - Mother Age' },
  { value: 'family_history_mother_education', label: 'Family History - Mother Education' },
  { value: 'family_history_mother_occupation', label: 'Family History - Mother Occupation' },
  { value: 'family_history_mother_personality', label: 'Family History - Mother Personality' },
  { value: 'family_history_mother_deceased', label: 'Family History - Mother Deceased' },
  { value: 'family_history_mother_death_age', label: 'Family History - Mother Death Age' },
  { value: 'family_history_mother_death_date', label: 'Family History - Mother Death Date' },
  { value: 'family_history_mother_death_cause', label: 'Family History - Mother Death Cause' },

  // Family History - Siblings
  { value: 'family_history_siblings', label: 'Family History - Siblings' },

  // Diagnostic Formulation
  { value: 'diagnostic_formulation_summary', label: 'Diagnostic Formulation - Summary' },
  { value: 'diagnostic_formulation_features', label: 'Diagnostic Formulation - Features' },
  { value: 'diagnostic_formulation_psychodynamic', label: 'Diagnostic Formulation - Psychodynamic' },

  // Premorbid Personality
  { value: 'premorbid_personality_passive_active', label: 'Premorbid Personality - Passive/Active' },
  { value: 'premorbid_personality_assertive', label: 'Premorbid Personality - Assertive' },
  { value: 'premorbid_personality_introvert_extrovert', label: 'Premorbid Personality - Introvert/Extrovert' },
  { value: 'premorbid_personality_traits', label: 'Premorbid Personality - Traits' },
  { value: 'premorbid_personality_hobbies', label: 'Premorbid Personality - Hobbies' },
  { value: 'premorbid_personality_habits', label: 'Premorbid Personality - Habits' },
  { value: 'premorbid_personality_alcohol_drugs', label: 'Premorbid Personality - Alcohol/Drugs' },

  // Physical Examination
  { value: 'physical_appearance', label: 'Physical - Appearance' },
  { value: 'physical_body_build', label: 'Physical - Body Build' },
  { value: 'physical_pallor', label: 'Physical - Pallor' },
  { value: 'physical_icterus', label: 'Physical - Icterus' },
  { value: 'physical_oedema', label: 'Physical - Oedema' },
  { value: 'physical_lymphadenopathy', label: 'Physical - Lymphadenopathy' },
  { value: 'physical_pulse', label: 'Physical - Pulse' },
  { value: 'physical_bp', label: 'Physical - Blood Pressure' },
  { value: 'physical_height', label: 'Physical - Height' },
  { value: 'physical_weight', label: 'Physical - Weight' },
  { value: 'physical_waist', label: 'Physical - Waist' },
  { value: 'physical_fundus', label: 'Physical - Fundus' },
  { value: 'physical_cvs_apex', label: 'Physical - CVS Apex' },
  { value: 'physical_cvs_regularity', label: 'Physical - CVS Regularity' },
  { value: 'physical_cvs_heart_sounds', label: 'Physical - CVS Heart Sounds' },
  { value: 'physical_cvs_murmurs', label: 'Physical - CVS Murmurs' },
  { value: 'physical_chest_expansion', label: 'Physical - Chest Expansion' },
  { value: 'physical_chest_percussion', label: 'Physical - Chest Percussion' },
  { value: 'physical_chest_adventitious', label: 'Physical - Chest Adventitious' },
  { value: 'physical_abdomen_tenderness', label: 'Physical - Abdomen Tenderness' },
  { value: 'physical_abdomen_mass', label: 'Physical - Abdomen Mass' },
  { value: 'physical_abdomen_bowel_sounds', label: 'Physical - Abdomen Bowel Sounds' },
  { value: 'physical_cns_cranial', label: 'Physical - CNS Cranial' },
  { value: 'physical_cns_motor_sensory', label: 'Physical - CNS Motor/Sensory' },
  { value: 'physical_cns_rigidity', label: 'Physical - CNS Rigidity' },
  { value: 'physical_cns_involuntary', label: 'Physical - CNS Involuntary' },
  { value: 'physical_cns_superficial_reflexes', label: 'Physical - CNS Superficial Reflexes' },
  { value: 'physical_cns_dtrs', label: 'Physical - CNS DTRs' },
  { value: 'physical_cns_plantar', label: 'Physical - CNS Plantar' },
  { value: 'physical_cns_cerebellar', label: 'Physical - CNS Cerebellar' },

  // MSE - General
  { value: 'mse_general_demeanour', label: 'MSE - General Demeanour' },
  { value: 'mse_general_tidy', label: 'MSE - General Tidy' },
  { value: 'mse_general_awareness', label: 'MSE - General Awareness' },
  { value: 'mse_general_cooperation', label: 'MSE - General Cooperation' },

  // MSE - Psychomotor
  { value: 'mse_psychomotor_verbalization', label: 'MSE - Psychomotor Verbalization' },
  { value: 'mse_psychomotor_pressure', label: 'MSE - Psychomotor Pressure' },
  { value: 'mse_psychomotor_tension', label: 'MSE - Psychomotor Tension' },
  { value: 'mse_psychomotor_posture', label: 'MSE - Psychomotor Posture' },
  { value: 'mse_psychomotor_mannerism', label: 'MSE - Psychomotor Mannerism' },
  { value: 'mse_psychomotor_catatonic', label: 'MSE - Psychomotor Catatonic' },

  // MSE - Affect
  { value: 'mse_affect_subjective', label: 'MSE - Affect Subjective' },
  { value: 'mse_affect_tone', label: 'MSE - Affect Tone' },
  { value: 'mse_affect_resting', label: 'MSE - Affect Resting' },
  { value: 'mse_affect_fluctuation', label: 'MSE - Affect Fluctuation' },

  // MSE - Thought
  { value: 'mse_thought_flow', label: 'MSE - Thought Flow' },
  { value: 'mse_thought_form', label: 'MSE - Thought Form' },
  { value: 'mse_thought_content', label: 'MSE - Thought Content' },

  // MSE - Cognitive
  { value: 'mse_cognitive_consciousness', label: 'MSE - Cognitive Consciousness' },
  { value: 'mse_cognitive_orientation_time', label: 'MSE - Cognitive Orientation Time' },
  { value: 'mse_cognitive_orientation_place', label: 'MSE - Cognitive Orientation Place' },
  { value: 'mse_cognitive_orientation_person', label: 'MSE - Cognitive Orientation Person' },
  { value: 'mse_cognitive_memory_immediate', label: 'MSE - Cognitive Memory Immediate' },
  { value: 'mse_cognitive_memory_recent', label: 'MSE - Cognitive Memory Recent' },
  { value: 'mse_cognitive_memory_remote', label: 'MSE - Cognitive Memory Remote' },
  { value: 'mse_cognitive_subtraction', label: 'MSE - Cognitive Subtraction' },
  { value: 'mse_cognitive_digit_span', label: 'MSE - Cognitive Digit Span' },
  { value: 'mse_cognitive_counting', label: 'MSE - Cognitive Counting' },
  { value: 'mse_cognitive_general_knowledge', label: 'MSE - Cognitive General Knowledge' },
  { value: 'mse_cognitive_calculation', label: 'MSE - Cognitive Calculation' },
  { value: 'mse_cognitive_similarities', label: 'MSE - Cognitive Similarities' },
  { value: 'mse_cognitive_proverbs', label: 'MSE - Cognitive Proverbs' },
  { value: 'mse_insight_understanding', label: 'MSE - Insight Understanding' },
  { value: 'mse_insight_judgement', label: 'MSE - Insight Judgement' },

  // Education
  { value: 'education_start_age', label: 'Education - Start Age' },
  { value: 'education_highest_class', label: 'Education - Highest Class' },
  { value: 'education_performance', label: 'Education - Performance' },
  { value: 'education_disciplinary', label: 'Education - Disciplinary' },
  { value: 'education_peer_relationship', label: 'Education - Peer Relationship' },
  { value: 'education_hobbies', label: 'Education - Hobbies' },
  { value: 'education_special_abilities', label: 'Education - Special Abilities' },
  { value: 'education_discontinue_reason', label: 'Education - Discontinue Reason' },

  // Occupation
  { value: 'occupation_jobs', label: 'Occupation - Jobs' },

  // Sexual History
  { value: 'sexual_menarche_age', label: 'Sexual - Menarche Age' },
  { value: 'sexual_menarche_reaction', label: 'Sexual - Menarche Reaction' },
  { value: 'sexual_education', label: 'Sexual - Education' },
  { value: 'sexual_masturbation', label: 'Sexual - Masturbation' },
  { value: 'sexual_contact', label: 'Sexual - Contact' },
  { value: 'sexual_premarital_extramarital', label: 'Sexual - Premarital/Extramarital' },
  { value: 'sexual_marriage_arranged', label: 'Sexual - Marriage Arranged' },
  { value: 'sexual_marriage_date', label: 'Sexual - Marriage Date' },
  { value: 'sexual_spouse_age', label: 'Sexual - Spouse Age' },
  { value: 'sexual_spouse_occupation', label: 'Sexual - Spouse Occupation' },
  { value: 'sexual_adjustment_general', label: 'Sexual - Adjustment General' },
  { value: 'sexual_adjustment_sexual', label: 'Sexual - Adjustment Sexual' },
  { value: 'sexual_children', label: 'Sexual - Children' },
  { value: 'sexual_problems', label: 'Sexual - Problems' },

  // Religion
  { value: 'religion_type', label: 'Religion - Type' },
  { value: 'religion_participation', label: 'Religion - Participation' },
  { value: 'religion_changes', label: 'Religion - Changes' },

  // Living Situation
  { value: 'living_residents', label: 'Living - Residents' },
  { value: 'living_income_sharing', label: 'Living - Income Sharing' },
  { value: 'living_expenses', label: 'Living - Expenses' },
  { value: 'living_kitchen', label: 'Living - Kitchen' },
  { value: 'living_domestic_conflicts', label: 'Living - Domestic Conflicts' },
  { value: 'living_social_class', label: 'Living - Social Class' },
  { value: 'living_inlaws', label: 'Living - In-laws' },

  // Home Situation
  { value: 'home_situation_childhood', label: 'Home Situation - Childhood' },
  { value: 'home_situation_parents_relationship', label: 'Home Situation - Parents Relationship' },
  { value: 'home_situation_socioeconomic', label: 'Home Situation - Socioeconomic' },
  { value: 'home_situation_interpersonal', label: 'Home Situation - Interpersonal' },

  // Personal History
  { value: 'personal_birth_date', label: 'Personal - Birth Date' },
  { value: 'personal_birth_place', label: 'Personal - Birth Place' },
  { value: 'personal_delivery_type', label: 'Personal - Delivery Type' },
  { value: 'personal_complications_prenatal', label: 'Personal - Complications Prenatal' },
  { value: 'personal_complications_natal', label: 'Personal - Complications Natal' },
  { value: 'personal_complications_postnatal', label: 'Personal - Complications Postnatal' },

  // Development
  { value: 'development_weaning_age', label: 'Development - Weaning Age' },
  { value: 'development_first_words', label: 'Development - First Words' },
  { value: 'development_three_words', label: 'Development - Three Words' },
  { value: 'development_walking', label: 'Development - Walking' },
  { value: 'development_neurotic_traits', label: 'Development - Neurotic Traits' },
  { value: 'development_nail_biting', label: 'Development - Nail Biting' },
  { value: 'development_bedwetting', label: 'Development - Bedwetting' },
  { value: 'development_phobias', label: 'Development - Phobias' },
  { value: 'development_childhood_illness', label: 'Development - Childhood Illness' },

  // Final Assessment
  { value: 'provisional_diagnosis', label: 'Provisional Diagnosis' },
  { value: 'treatment_plan', label: 'Treatment Plan' },
  { value: 'consultant_comments', label: 'Consultant Comments' },
];



export const PRESCRIPTION_FORM = [
  { value: 'medicine', label: 'Medicine' },
  { value: 'dosage', label: 'Dosage' },
  { value: 'frequency', label: 'Frequency' },
  { value: 'duration', label: 'Duration' },
  { value: 'qty', label: 'Quantity' },
  { value: 'details', label: 'Details' },
  { value: 'notes', label: 'Notes' },
];



export const DOSAGE_OPTIONS = [
  { value: '1-0-1', label: '1-0-1' },
  { value: '1-1-1', label: '1-1-1' },
  { value: '1-0-0', label: '1-0-0' },
  { value: '0-1-0', label: '0-1-0' },
  { value: '0-0-1', label: '0-0-1' },
  { value: '1-1-0', label: '1-1-0' },
  { value: '0-1-1', label: '0-1-1' },
  { value: '1-0-1½', label: '1-0-1½' },
  { value: '½-0-½', label: '½-0-½' },
  { value: 'SOS', label: 'SOS' },
  { value: 'STAT', label: 'STAT' }, 
]

export const WHEN_OPTIONS = [
  { value: 'Before Food', label: 'Before Food' },
  { value: 'After Food', label: 'After Food' },
  { value: 'With Food', label: 'With Food' },
  { value: 'Empty Stomach', label: 'Empty Stomach' },
  { value: 'Bedtime', label: 'Bedtime' },
  { value: 'Morning', label: 'Morning' },
  { value: 'Afternoon', label: 'Afternoon' },
  { value: 'Evening', label: 'Evening' },
  { value: 'Night', label: 'Night' },
]

export const FREQUENCY_OPTIONS = [
  { value: 'Once Daily', label: 'Once Daily' },
  { value: 'Twice Daily', label: 'Twice Daily' },
  { value: 'Thrice Daily', label: 'Thrice Daily' },
  { value: 'Four Times Daily', label: 'Four Times Daily' },
  { value: 'Every Hour', label: 'Every Hour' },
  { value: 'Every 2 Hours', label: 'Every 2 Hours' },
  { value: 'Every 4 Hours', label: 'Every 4 Hours' },
  { value: 'Every 6 Hours', label: 'Every 6 Hours' },
  { value: 'Every 8 Hours', label: 'Every 8 Hours' },
]

export const DURATION_OPTIONS = [
  { value: '3 Days', label: '3 Days' },
  { value: '5 Days', label: '5 Days' },
  { value: '7 Days', label: '7 Days' },
  { value: '10 Days', label: '10 Days' },
  { value: '14 Days', label: '14 Days' },
  { value: '21 Days', label: '21 Days' },
  { value: '1 Month', label: '1 Month' },
  { value: '2 Months', label: '2 Months' },
  { value: '3 Months', label: '3 Months' },
  { value: '6 Months', label: '6 Months' },
]

export const QUANTITY_OPTIONS = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '5', label: '5' },
  { value: '7', label: '7' },
  { value: '10', label: '10' },
  { value: '15', label: '15' },
  { value: '20', label: '20' },
  { value: '30', label: '30' },
  { value: '60', label: '60' },
  { value: '90', label: '90' },
  { value: '100', label: '100' }
]





export const PRESCRIPTION_OPTIONS = {
  Medicine: [
    { value: 'medicine', label: 'Medicine' },
    { value: 'dosage', label: 'Dosage' },
    { value: 'when_to_take', label: 'When to Take' },
    { value: 'frequency', label: 'Frequency' },
    { value: 'duration', label: 'Duration' },
    { value: 'quantity', label: 'Quantity' },
    { value: 'details', label: 'Details' },
    { value: 'notes', label: 'Notes' },
  ],

  DOSAGE: [
    { value: "1-0-1", label: "1-0-1" },
    { value: "1-1-1", label: "1-1-1" },
    { value: "1-0-0", label: "1-0-0" },
    { value: "0-1-0", label: "0-1-0" },
    { value: "0-0-1", label: "0-0-1" },
    { value: "1-1-0", label: "1-1-0" },
    { value: "0-1-1", label: "0-1-1" },
    { value: "1-0-1½", label: "1-0-1½" },
    { value: "½-0-½", label: "½-0-½" },
    { value: "SOS", label: "SOS" },
    { value: "STAT", label: "STAT" },
    { value: "PRN", label: "PRN" },
    { value: "OD", label: "OD" },
    { value: "BD", label: "BD" },
    { value: "TDS", label: "TDS" },
    { value: "QID", label: "QID" },
    { value: "HS", label: "HS" },
    { value: "Q4H", label: "Q4H" },
    { value: "Q6H", label: "Q6H" },
    { value: "Q8H", label: "Q8H" }
  ],

  WHEN: [
    { value: "Before Food", label: "Before Food" },
    { value: "After Food", label: "After Food" },
    { value: "With Food", label: "With Food" },
    { value: "Empty Stomach", label: "Empty Stomach" },
    { value: "Bedtime", label: "Bedtime" },
    { value: "Morning", label: "Morning" },
    { value: "Afternoon", label: "Afternoon" },
    { value: "Evening", label: "Evening" },
    { value: "Night", label: "Night" },
    { value: "Any Time", label: "Any Time" },
    { value: "Before Breakfast", label: "Before Breakfast" },
    { value: "After Breakfast", label: "After Breakfast" },
    { value: "Before Lunch", label: "Before Lunch" },
    { value: "After Lunch", label: "After Lunch" },
    { value: "Before Dinner", label: "Before Dinner" },
    { value: "After Dinner", label: "After Dinner" }
  ],

  FREQUENCY: [
    { value: "Once Daily", label: "Once Daily" },
    { value: "Twice Daily", label: "Twice Daily" },
    { value: "Thrice Daily", label: "Thrice Daily" },
    { value: "Four Times Daily", label: "Four Times Daily" },
    { value: "Every Hour", label: "Every Hour" },
    { value: "Every 2 Hours", label: "Every 2 Hours" },
    { value: "Every 4 Hours", label: "Every 4 Hours" },
    { value: "Every 6 Hours", label: "Every 6 Hours" },
    { value: "Every 8 Hours", label: "Every 8 Hours" },
    { value: "Every 12 Hours", label: "Every 12 Hours" },
    { value: "Alternate Day", label: "Alternate Day" },
    { value: "Weekly", label: "Weekly" },
    { value: "Monthly", label: "Monthly" },
    { value: "SOS", label: "SOS" },
    { value: "Continuous", label: "Continuous" },
    { value: "Once", label: "Once" },
    { value: "Tapering Dose", label: "Tapering Dose" }
  ],

  DURATION: [
    { value: "3 Days", label: "3 Days" },
    { value: "5 Days", label: "5 Days" },
    { value: "7 Days", label: "7 Days" },
    { value: "10 Days", label: "10 Days" },
    { value: "14 Days", label: "14 Days" },
    { value: "21 Days", label: "21 Days" },
    { value: "1 Month", label: "1 Month" },
    { value: "2 Months", label: "2 Months" },
    { value: "3 Months", label: "3 Months" },
    { value: "6 Months", label: "6 Months" },
    { value: "Until Symptoms Subside", label: "Until Symptoms Subside" },
    { value: "Continuous", label: "Continuous" },
    { value: "As Directed", label: "As Directed" }
  ],

  QUANTITY: [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "5", label: "5" },
    { value: "7", label: "7" },
    { value: "10", label: "10" },
    { value: "15", label: "15" },
    { value: "20", label: "20" },
    { value: "30", label: "30" },
    { value: "60", label: "60" },
    { value: "90", label: "90" },
    { value: "100", label: "100" },
    { value: "Custom", label: "Custom" }
  ]
};
