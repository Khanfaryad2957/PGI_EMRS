import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGetADLFileByIdQuery, useUpdateADLFileMutation, useCreateADLFileMutation } from '../../features/adl/adlApiSlice';
import { useGetPatientByIdQuery } from '../../features/patients/patientsApiSlice';
import { useGetPatientFilesQuery, useUpdatePatientFilesMutation, useCreatePatientFilesMutation } from '../../features/patients/patientFilesApiSlice';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { ADL_FILE_FORM } from '../../utils/constants';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import { FiSave, FiPlus, FiX, FiChevronDown, FiChevronUp, FiFileText, FiCalendar } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';
import DatePicker from '../../components/CustomDatePicker';
import FileUpload from '../../components/FileUpload';
import FilePreview from '../../components/FilePreview';

// Display Field Component for read-only mode with glassmorphism
const DisplayField = ({ label, value, icon, className = '', rows }) => {
  const displayValue = value || 'N/A';
  const isTextarea = rows && rows > 1;
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"></div>
      <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
        {label && (
          <label className={`flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 ${icon ? '' : 'block'}`}>
            {icon && <span className="text-primary-600">{icon}</span>}
            {label}
          </label>
        )}
        {isTextarea ? (
          <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">{displayValue}</p>
        ) : (
          <p className="text-base font-medium text-gray-900">{displayValue}</p>
        )}
      </div>
    </div>
  );
};

// Helper function to render Input or DisplayField based on readOnly
const ConditionalInput = ({ readOnly, label, value, icon, ...inputProps }) => {
  if (readOnly) {
    return <DisplayField label={label} value={value} icon={icon} />;
  }
  return <Input label={label} value={value} {...inputProps} />;
};

// Helper function to render Select or DisplayField based on readOnly
const ConditionalSelect = ({ readOnly, label, value, options, icon, ...selectProps }) => {
  if (readOnly) {
    const selectedOption = options?.find(opt => opt.value === value);
    return <DisplayField label={label} value={selectedOption?.label || value || ''} icon={icon} />;
  }
  return <Select label={label} value={value} options={options} {...selectProps} />;
};

// Helper function to render Textarea or DisplayField based on readOnly
const ConditionalTextarea = ({ readOnly, label, value, icon, rows, ...textareaProps }) => {
  if (readOnly) {
    return <DisplayField label={label} value={value} icon={icon} rows={rows} />;
  }
  return <Textarea label={label} value={value} rows={rows} {...textareaProps} />;
};

const EditADL = ({ adlFileId, isEmbedded = false, patientId: propPatientId = null, clinicalProformaId: propClinicalProformaId = null, readOnly = false }) => {
  const navigate = useNavigate();
  const { id: urlId } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode'); // 'create' or 'update' from URL

  // Use prop id if provided, otherwise use URL param
  const id = adlFileId || urlId;

  const { data: adlData, isLoading: isLoadingADL } = useGetADLFileByIdQuery(id, { skip: !id });
  // Handle different possible API response structures
  // Backend returns: { success: true, data: { adlFile: ... } }
  const adlFile = adlData?.data?.adlFile || adlData?.data?.adl_file || adlData?.data?.file || adlData?.data;
  
  

  const [updateADLFile, { isLoading: isUpdating }] = useUpdateADLFileMutation();
  const [createADLFile, { isLoading: isCreating }] = useCreateADLFileMutation();
  const currentUser = useSelector(selectCurrentUser);

  // Determine if this is create or update mode
  // Update mode: id exists AND adlFile exists OR mode === 'update'
  // Create mode: no id OR no adlFile OR mode === 'create'
  const isUpdateMode = mode === 'update' || (mode !== 'create' && id && adlFile);
  
  // Get patientId and clinicalProformaId - must be declared before useGetPatientFilesQuery
  const patientId = propPatientId || adlFile?.patient_id;
  const clinicalProformaId = propClinicalProformaId || adlFile?.clinical_proforma_id;

  // File upload state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filesToRemove, setFilesToRemove] = useState([]);
  const { data: patientFilesData, refetch: refetchFiles } = useGetPatientFilesQuery(patientId, {
    skip: !patientId
  });
  const [updatePatientFiles, { isLoading: isUploadingFiles }] = useUpdatePatientFilesMutation();
  const [createPatientFiles] = useCreatePatientFilesMutation();
  
  // Get existing files from API
  const existingFiles = patientFilesData?.data?.files || [];
  const canEditFiles = patientFilesData?.data?.can_edit !== false;
  
  const { data: patientData, isLoading: isLoadingPatient } = useGetPatientByIdQuery(patientId, { skip: !patientId });
  const patient = patientData?.data?.patient;

  // Card expand/collapse state
  const [expandedCards, setExpandedCards] = useState({
    mainWrapper: true, // Main wrapper card state
    history: true,
    informants: true,
    complaints: true,
    pastHistory: true,
    familyHistory: true,
    homeSituation: true,
    education: true,
    occupation: true,
    sexual: true,
    religion: true,
    living: true,
    premorbid: true,
    physical: true,
    mse: true,
    diagnostic: true,
    final: true,
  });

  const toggleCard = useCallback((cardName) => {
    // Allow mainWrapper to toggle even in read-only mode
    if (readOnly && cardName !== 'mainWrapper') return; // Prevent card toggling in read-only mode (except main wrapper)
    setExpandedCards(prev => ({ ...prev, [cardName]: !prev[cardName] }));
  }, [readOnly]);

  // Prepare initial form data from existing ADL file
  const initialFormData = useMemo(() => {
    if (!adlFile) {
      
      return null;
    }
    
    

    // Helper function to parse JSON array fields
    const parseArray = (field) => {
      if (!field) return [];
      try {
        return typeof field === 'string' ? JSON.parse(field) : field;
      } catch {
        return [];
      }
    };

    // Helper function to format date fields from ISO string to yyyy-MM-dd
    const formatDateField = (value) => {
      if (!value || value === null || value === undefined) return '';
      if (typeof value === 'string') {
        // If it's already in yyyy-MM-dd format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          return value;
        }
        // If it's an ISO datetime string, extract the date part
        if (value.includes('T')) {
          return value.split('T')[0];
        }
        // Try to parse and format
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        } catch {
          return '';
        }
      }
      if (value instanceof Date) {
        return value.toISOString().split('T')[0];
      }
      return '';
    };

    return {
      patient_id: adlFile.patient_id || '',
      clinical_proforma_id: adlFile.clinical_proforma_id || '',
      // History
      history_narrative: adlFile.history_narrative || '',
      history_specific_enquiry: adlFile.history_specific_enquiry || '',
      history_drug_intake: adlFile.history_drug_intake || '',
      history_treatment_place: adlFile.history_treatment_place || '',
      history_treatment_dates: formatDateField(adlFile.history_treatment_dates),
      history_treatment_drugs: adlFile.history_treatment_drugs || '',
      history_treatment_response: adlFile.history_treatment_response || '',
      // Informants
      informants: parseArray(adlFile.informants).length > 0 ? parseArray(adlFile.informants) : [{ relationship: '', name: '', reliability: '' }],
      // Complaints
      complaints_patient: parseArray(adlFile.complaints_patient).length > 0 ? parseArray(adlFile.complaints_patient) : [{ complaint: '', duration: '' }],
      complaints_informant: parseArray(adlFile.complaints_informant).length > 0 ? parseArray(adlFile.complaints_informant) : [{ complaint: '', duration: '' }],
      // Onset, Precipitating Factor, Course
      onset_duration: adlFile.onset_duration || '',
      precipitating_factor: adlFile.precipitating_factor || '',
      course: adlFile.course || '',
      // Past History
      past_history_medical: adlFile.past_history_medical || '',
      past_history_psychiatric_dates: formatDateField(adlFile.past_history_psychiatric_dates),
      past_history_psychiatric_diagnosis: adlFile.past_history_psychiatric_diagnosis || '',
      past_history_psychiatric_treatment: adlFile.past_history_psychiatric_treatment || '',
      past_history_psychiatric_interim: adlFile.past_history_psychiatric_interim || '',
      past_history_psychiatric_recovery: adlFile.past_history_psychiatric_recovery || '',
      // Family History - Father
      family_history_father_age: adlFile.family_history_father_age || '',
      family_history_father_education: adlFile.family_history_father_education || '',
      family_history_father_occupation: adlFile.family_history_father_occupation || '',
      family_history_father_personality: adlFile.family_history_father_personality || '',
      family_history_father_deceased: adlFile.family_history_father_deceased || false,
      family_history_father_death_age: adlFile.family_history_father_death_age || '',
      family_history_father_death_date: formatDateField(adlFile.family_history_father_death_date),
      family_history_father_death_cause: adlFile.family_history_father_death_cause || '',
      // Family History - Mother
      family_history_mother_age: adlFile.family_history_mother_age || '',
      family_history_mother_education: adlFile.family_history_mother_education || '',
      family_history_mother_occupation: adlFile.family_history_mother_occupation || '',
      family_history_mother_personality: adlFile.family_history_mother_personality || '',
      family_history_mother_deceased: adlFile.family_history_mother_deceased || false,
      family_history_mother_death_age: adlFile.family_history_mother_death_age || '',
      family_history_mother_death_date: formatDateField(adlFile.family_history_mother_death_date),
      family_history_mother_death_cause: adlFile.family_history_mother_death_cause || '',
      // Family History - Siblings
      family_history_siblings: parseArray(adlFile.family_history_siblings).length > 0 ? parseArray(adlFile.family_history_siblings) : [{ age: '', sex: '', education: '', occupation: '', marital_status: '' }],
      // Diagnostic Formulation
      diagnostic_formulation_summary: adlFile.diagnostic_formulation_summary || '',
      diagnostic_formulation_features: adlFile.diagnostic_formulation_features || '',
      diagnostic_formulation_psychodynamic: adlFile.diagnostic_formulation_psychodynamic || '',
      // Premorbid Personality
      premorbid_personality_passive_active: adlFile.premorbid_personality_passive_active || '',
      premorbid_personality_assertive: adlFile.premorbid_personality_assertive || '',
      premorbid_personality_introvert_extrovert: adlFile.premorbid_personality_introvert_extrovert || '',
      premorbid_personality_traits: parseArray(adlFile.premorbid_personality_traits),
      premorbid_personality_hobbies: adlFile.premorbid_personality_hobbies || '',
      premorbid_personality_habits: adlFile.premorbid_personality_habits || '',
      premorbid_personality_alcohol_drugs: adlFile.premorbid_personality_alcohol_drugs || '',
      // Physical Examination
      physical_appearance: adlFile.physical_appearance || '',
      physical_body_build: adlFile.physical_body_build || '',
      physical_pallor: adlFile.physical_pallor || false,
      physical_icterus: adlFile.physical_icterus || false,
      physical_oedema: adlFile.physical_oedema || false,
      physical_lymphadenopathy: adlFile.physical_lymphadenopathy || false,
      physical_pulse: adlFile.physical_pulse || '',
      physical_bp: adlFile.physical_bp || '',
      physical_height: adlFile.physical_height || '',
      physical_weight: adlFile.physical_weight || '',
      physical_waist: adlFile.physical_waist || '',
      physical_fundus: adlFile.physical_fundus || '',
      physical_cvs_apex: adlFile.physical_cvs_apex || '',
      physical_cvs_regularity: adlFile.physical_cvs_regularity || '',
      physical_cvs_heart_sounds: adlFile.physical_cvs_heart_sounds || '',
      physical_cvs_murmurs: adlFile.physical_cvs_murmurs || '',
      physical_chest_expansion: adlFile.physical_chest_expansion || '',
      physical_chest_percussion: adlFile.physical_chest_percussion || '',
      physical_chest_adventitious: adlFile.physical_chest_adventitious || '',
      physical_abdomen_tenderness: adlFile.physical_abdomen_tenderness || '',
      physical_abdomen_mass: adlFile.physical_abdomen_mass || '',
      physical_abdomen_bowel_sounds: adlFile.physical_abdomen_bowel_sounds || '',
      physical_cns_cranial: adlFile.physical_cns_cranial || '',
      physical_cns_motor_sensory: adlFile.physical_cns_motor_sensory || '',
      physical_cns_rigidity: adlFile.physical_cns_rigidity || '',
      physical_cns_involuntary: adlFile.physical_cns_involuntary || '',
      physical_cns_superficial_reflexes: adlFile.physical_cns_superficial_reflexes || '',
      physical_cns_dtrs: adlFile.physical_cns_dtrs || '',
      physical_cns_plantar: adlFile.physical_cns_plantar || '',
      physical_cns_cerebellar: adlFile.physical_cns_cerebellar || '',
      // MSE - General
      mse_general_demeanour: adlFile.mse_general_demeanour || '',
      mse_general_tidy: adlFile.mse_general_tidy || '',
      mse_general_awareness: adlFile.mse_general_awareness || '',
      mse_general_cooperation: adlFile.mse_general_cooperation || '',
      // MSE - Psychomotor
      mse_psychomotor_verbalization: adlFile.mse_psychomotor_verbalization || '',
      mse_psychomotor_pressure: adlFile.mse_psychomotor_pressure || '',
      mse_psychomotor_tension: adlFile.mse_psychomotor_tension || '',
      mse_psychomotor_posture: adlFile.mse_psychomotor_posture || '',
      mse_psychomotor_mannerism: adlFile.mse_psychomotor_mannerism || '',
      mse_psychomotor_catatonic: adlFile.mse_psychomotor_catatonic || '',
      // MSE - Affect
      mse_affect_subjective: adlFile.mse_affect_subjective || '',
      mse_affect_tone: adlFile.mse_affect_tone || '',
      mse_affect_resting: adlFile.mse_affect_resting || '',
      mse_affect_fluctuation: adlFile.mse_affect_fluctuation || '',
      // MSE - Thought
      mse_thought_flow: adlFile.mse_thought_flow || '',
      mse_thought_form: adlFile.mse_thought_form || '',
      mse_thought_content: adlFile.mse_thought_content || '',
      // MSE - Cognitive
      mse_cognitive_consciousness: adlFile.mse_cognitive_consciousness || '',
      mse_cognitive_orientation_time: adlFile.mse_cognitive_orientation_time || '',
      mse_cognitive_orientation_place: adlFile.mse_cognitive_orientation_place || '',
      mse_cognitive_orientation_person: adlFile.mse_cognitive_orientation_person || '',
      mse_cognitive_memory_immediate: adlFile.mse_cognitive_memory_immediate || '',
      mse_cognitive_memory_recent: adlFile.mse_cognitive_memory_recent || '',
      mse_cognitive_memory_remote: adlFile.mse_cognitive_memory_remote || '',
      mse_cognitive_subtraction: adlFile.mse_cognitive_subtraction || '',
      mse_cognitive_digit_span: adlFile.mse_cognitive_digit_span || '',
      mse_cognitive_counting: adlFile.mse_cognitive_counting || '',
      mse_cognitive_general_knowledge: adlFile.mse_cognitive_general_knowledge || '',
      mse_cognitive_calculation: adlFile.mse_cognitive_calculation || '',
      mse_cognitive_similarities: adlFile.mse_cognitive_similarities || '',
      mse_cognitive_proverbs: adlFile.mse_cognitive_proverbs || '',
      mse_insight_understanding: adlFile.mse_insight_understanding || '',
      mse_insight_judgement: adlFile.mse_insight_judgement || '',
      // Education
      education_start_age: adlFile.education_start_age || '',
      education_highest_class: adlFile.education_highest_class || '',
      education_performance: adlFile.education_performance || '',
      education_disciplinary: adlFile.education_disciplinary || '',
      education_peer_relationship: adlFile.education_peer_relationship || '',
      education_hobbies: adlFile.education_hobbies || '',
      education_special_abilities: adlFile.education_special_abilities || '',
      education_discontinue_reason: adlFile.education_discontinue_reason || '',
      // Occupation
      occupation_jobs: parseArray(adlFile.occupation_jobs).length > 0 ? parseArray(adlFile.occupation_jobs) : [{ job: '', dates: '', adjustment: '', difficulties: '', promotions: '', change_reason: '' }],
      // Sexual History
      sexual_menarche_age: adlFile.sexual_menarche_age || '',
      sexual_menarche_reaction: adlFile.sexual_menarche_reaction || '',
      sexual_education: adlFile.sexual_education || '',
      sexual_masturbation: adlFile.sexual_masturbation || '',
      sexual_contact: adlFile.sexual_contact || '',
      sexual_premarital_extramarital: adlFile.sexual_premarital_extramarital || '',
      sexual_marriage_arranged: adlFile.sexual_marriage_arranged || '',
      sexual_marriage_date: formatDateField(adlFile.sexual_marriage_date),
      sexual_spouse_age: adlFile.sexual_spouse_age || '',
      sexual_spouse_occupation: adlFile.sexual_spouse_occupation || '',
      sexual_adjustment_general: adlFile.sexual_adjustment_general || '',
      sexual_adjustment_sexual: adlFile.sexual_adjustment_sexual || '',
      sexual_children: parseArray(adlFile.sexual_children).length > 0 ? parseArray(adlFile.sexual_children) : [{ age: '', sex: '' }],
      sexual_problems: adlFile.sexual_problems || '',
      // Religion
      religion_type: adlFile.religion_type || '',
      religion_participation: adlFile.religion_participation || '',
      religion_changes: adlFile.religion_changes || '',
      // Living Situation
      living_residents: parseArray(adlFile.living_residents).length > 0 ? parseArray(adlFile.living_residents) : [{ name: '', relationship: '', age: '' }],
      living_income_sharing: adlFile.living_income_sharing || '',
      living_expenses: adlFile.living_expenses || '',
      living_kitchen: adlFile.living_kitchen || '',
      living_domestic_conflicts: adlFile.living_domestic_conflicts || '',
      living_social_class: adlFile.living_social_class || '',
      living_inlaws: parseArray(adlFile.living_inlaws).length > 0 ? parseArray(adlFile.living_inlaws) : [{ name: '', relationship: '', age: '' }],
      // Home Situation
      home_situation_childhood: adlFile.home_situation_childhood || '',
      home_situation_parents_relationship: adlFile.home_situation_parents_relationship || '',
      home_situation_socioeconomic: adlFile.home_situation_socioeconomic || '',
      home_situation_interpersonal: adlFile.home_situation_interpersonal || '',
      // Personal History
      personal_birth_date: formatDateField(adlFile.personal_birth_date),
      personal_birth_place: adlFile.personal_birth_place || '',
      personal_delivery_type: adlFile.personal_delivery_type || '',
      personal_complications_prenatal: adlFile.personal_complications_prenatal || '',
      personal_complications_natal: adlFile.personal_complications_natal || '',
      personal_complications_postnatal: adlFile.personal_complications_postnatal || '',
      // Development
      development_weaning_age: adlFile.development_weaning_age || '',
      development_first_words: adlFile.development_first_words || '',
      development_three_words: adlFile.development_three_words || '',
      development_walking: adlFile.development_walking || '',
      development_neurotic_traits: adlFile.development_neurotic_traits || '',
      development_nail_biting: adlFile.development_nail_biting || '',
      development_bedwetting: adlFile.development_bedwetting || '',
      development_phobias: adlFile.development_phobias || '',
      development_childhood_illness: adlFile.development_childhood_illness || '',
      // Final Assessment
      provisional_diagnosis: adlFile.provisional_diagnosis || '',
      treatment_plan: adlFile.treatment_plan || '',
      consultant_comments: adlFile.consultant_comments || '',
    };
  }, [adlFile]);

  // Initialize form data with default values or from ADL file
  const defaultFormData = {
    patient_id: '',
    clinical_proforma_id: '',
    history_narrative: '',
    history_specific_enquiry: '',
    history_drug_intake: '',
    history_treatment_place: '',
    history_treatment_dates: '',
    history_treatment_drugs: '',
    history_treatment_response: '',
    informants: [{ relationship: '', name: '', reliability: '' }],
    complaints_patient: [{ complaint: '', duration: '' }],
    complaints_informant: [{ complaint: '', duration: '' }],
    onset_duration: '',
    precipitating_factor: '',
    course: '',
    past_history_medical: '',
    past_history_psychiatric_dates: '',
    past_history_psychiatric_diagnosis: '',
    past_history_psychiatric_treatment: '',
    past_history_psychiatric_interim: '',
    past_history_psychiatric_recovery: '',
    family_history_father_age: '',
    family_history_father_education: '',
    family_history_father_occupation: '',
    family_history_father_personality: '',
    family_history_father_deceased: false,
    family_history_father_death_age: '',
    family_history_father_death_date: '',
    family_history_father_death_cause: '',
    family_history_mother_age: '',
    family_history_mother_education: '',
    family_history_mother_occupation: '',
    family_history_mother_personality: '',
    family_history_mother_deceased: false,
    family_history_mother_death_age: '',
    family_history_mother_death_date: '',
    family_history_mother_death_cause: '',
    family_history_siblings: [{ age: '', sex: '', education: '', occupation: '', marital_status: '' }],
    diagnostic_formulation_summary: '',
    diagnostic_formulation_features: '',
    diagnostic_formulation_psychodynamic: '',
    premorbid_personality_passive_active: '',
    premorbid_personality_assertive: '',
    premorbid_personality_introvert_extrovert: '',
    premorbid_personality_traits: [],
    premorbid_personality_hobbies: '',
    premorbid_personality_habits: '',
    premorbid_personality_alcohol_drugs: '',
    physical_appearance: '',
    physical_body_build: '',
    physical_pallor: false,
    physical_icterus: false,
    physical_oedema: false,
    physical_lymphadenopathy: false,
    physical_pulse: '',
    physical_bp: '',
    physical_height: '',
    physical_weight: '',
    physical_waist: '',
    physical_fundus: '',
    physical_cvs_apex: '',
    physical_cvs_regularity: '',
    physical_cvs_heart_sounds: '',
    physical_cvs_murmurs: '',
    physical_chest_expansion: '',
    physical_chest_percussion: '',
    physical_chest_adventitious: '',
    physical_abdomen_tenderness: '',
    physical_abdomen_mass: '',
    physical_abdomen_bowel_sounds: '',
    physical_cns_cranial: '',
    physical_cns_motor_sensory: '',
    physical_cns_rigidity: '',
    physical_cns_involuntary: '',
    physical_cns_superficial_reflexes: '',
    physical_cns_dtrs: '',
    physical_cns_plantar: '',
    physical_cns_cerebellar: '',
    mse_general_demeanour: '',
    mse_general_tidy: '',
    mse_general_awareness: '',
    mse_general_cooperation: '',
    mse_psychomotor_verbalization: '',
    mse_psychomotor_pressure: '',
    mse_psychomotor_tension: '',
    mse_psychomotor_posture: '',
    mse_psychomotor_mannerism: '',
    mse_psychomotor_catatonic: '',
    mse_affect_subjective: '',
    mse_affect_tone: '',
    mse_affect_resting: '',
    mse_affect_fluctuation: '',
    mse_thought_flow: '',
    mse_thought_form: '',
    mse_thought_content: '',
    mse_cognitive_consciousness: '',
    mse_cognitive_orientation_time: '',
    mse_cognitive_orientation_place: '',
    mse_cognitive_orientation_person: '',
    mse_cognitive_memory_immediate: '',
    mse_cognitive_memory_recent: '',
    mse_cognitive_memory_remote: '',
    mse_cognitive_subtraction: '',
    mse_cognitive_digit_span: '',
    mse_cognitive_counting: '',
    mse_cognitive_general_knowledge: '',
    mse_cognitive_calculation: '',
    mse_cognitive_similarities: '',
    mse_cognitive_proverbs: '',
    mse_insight_understanding: '',
    mse_insight_judgement: '',
    education_start_age: '',
    education_highest_class: '',
    education_performance: '',
    education_disciplinary: '',
    education_peer_relationship: '',
    education_hobbies: '',
    education_special_abilities: '',
    education_discontinue_reason: '',
    occupation_jobs: [{ job: '', dates: '', adjustment: '', difficulties: '', promotions: '', change_reason: '' }],
    sexual_menarche_age: '',
    sexual_menarche_reaction: '',
    sexual_education: '',
    sexual_masturbation: '',
    sexual_contact: '',
    sexual_premarital_extramarital: '',
    sexual_marriage_arranged: '',
    sexual_marriage_date: '',
    sexual_spouse_age: '',
    sexual_spouse_occupation: '',
    sexual_adjustment_general: '',
    sexual_adjustment_sexual: '',
    sexual_children: [{ age: '', sex: '' }],
    sexual_problems: '',
    religion_type: '',
    religion_participation: '',
    religion_changes: '',
    living_residents: [{ name: '', relationship: '', age: '' }],
    living_income_sharing: '',
    living_expenses: '',
    living_kitchen: '',
    living_domestic_conflicts: '',
    living_social_class: '',
    living_inlaws: [{ name: '', relationship: '', age: '' }],
    home_situation_childhood: '',
    home_situation_parents_relationship: '',
    home_situation_socioeconomic: '',
    home_situation_interpersonal: '',
    personal_birth_date: '',
    personal_birth_place: '',
    personal_delivery_type: '',
    personal_complications_prenatal: '',
    personal_complications_natal: '',
    personal_complications_postnatal: '',
    development_weaning_age: '',
    development_first_words: '',
    development_three_words: '',
    development_walking: '',
    development_neurotic_traits: '',
    development_nail_biting: '',
    development_bedwetting: '',
    development_phobias: '',
    development_childhood_illness: '',
    provisional_diagnosis: '',
    treatment_plan: '',
    consultant_comments: '',
  };

  const [formData, setFormData] = useState(defaultFormData);

  // Update formData when ADL file is loaded
  useEffect(() => {
    if (initialFormData) {
      setFormData(initialFormData);
    } else if (!id) {
      // Reset to defaults if no ADL file ID
      setFormData(defaultFormData);
    }
    // Note: If id exists but adlFile is not loaded yet, wait for it to load
  }, [initialFormData, id, adlFile, isLoadingADL]);

  // Ensure formData is always defined
  const safeFormData = formData || defaultFormData;

  // Also directly update formData when adlFile loads (backup mechanism)
  useEffect(() => {
    if (adlFile && id && initialFormData) {
      // Check if formData still has default empty values but adlFile has data
      const hasData = adlFile.history_narrative || adlFile.history_specific_enquiry || adlFile.history_drug_intake;
      const formIsEmpty = !formData.history_narrative && !formData.history_specific_enquiry && !formData.history_drug_intake;
      
      if (hasData && formIsEmpty) {
        
        setFormData(initialFormData);
      }
    }
  }, [adlFile, id, formData.history_narrative, formData.history_specific_enquiry, formData.history_drug_intake, initialFormData]);

  const handleChange = (e) => {
    if (readOnly) return; // Prevent changes in read-only mode
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert array fields to JSON strings for storage
      const prepareDataForSubmission = (data) => {
        const prepared = { ...data };
        const arrayFields = [
          'informants', 'complaints_patient', 'complaints_informant',
          'family_history_siblings', 'occupation_jobs', 'sexual_children',
          'living_residents', 'living_inlaws', 'premorbid_personality_traits'
        ];
        
        arrayFields.forEach(field => {
          if (Array.isArray(prepared[field])) {
            prepared[field] = JSON.stringify(prepared[field]);
          }
        });
        
        return prepared;
      };

      // If no ADL file exists and we have patientId, create new one
      if (!adlFile && patientId) {
        const createData = {
          patient_id: parseInt(patientId),
          clinical_proforma_id: clinicalProformaId ? parseInt(clinicalProformaId) : null,
          ...prepareDataForSubmission(formData)
        };
        await createADLFile(createData).unwrap();
        toast.success('ADL File created successfully!');
        
        // Handle file uploads for new ADL file
        if (patientId && selectedFiles && selectedFiles.length > 0) {
          try {
            await createPatientFiles({
              patient_id: patientId,
              user_id: currentUser?.id,
              files: selectedFiles
            }).unwrap();
            
            toast.success(`${selectedFiles.length} file(s) uploaded successfully!`);
            setSelectedFiles([]);
            refetchFiles();
          } catch (fileErr) {
            console.error('File upload error:', fileErr);
            toast.error(fileErr?.data?.message || 'Failed to upload files. ADL file was created successfully.');
          }
        }
        
        if (isEmbedded) {
          // If embedded, don't navigate - just refresh or show success
          // The parent component will handle refetching
          return;
        }
        if (patientId) {
          navigate(`/patients/${patientId}?tab=adl`);
        } else {
          navigate('/adl-files');
        }
      } else if (adlFile && id) {
        // Update existing ADL file
        const updateData = {
          id: parseInt(id),
          ...prepareDataForSubmission(formData)
        };
        await updateADLFile(updateData).unwrap();
        toast.success('ADL File updated successfully!');
        
        // Handle file uploads/updates for existing ADL file
        if (patientId && ((selectedFiles && selectedFiles.length > 0) || (filesToRemove && filesToRemove.length > 0))) {
          try {
            const hasExistingFiles = existingFiles && existingFiles.length > 0;
            
            if (hasExistingFiles && (selectedFiles.length > 0 || filesToRemove.length > 0)) {
              // Update existing record
              const fileRecord = patientFilesData?.data;
              await updatePatientFiles({
                patient_id: patientId,
                record_id: fileRecord?.id,
                files_to_add: selectedFiles,
                files_to_remove: filesToRemove,
                user_id: currentUser?.id
              }).unwrap();
              
              if (selectedFiles.length > 0) {
                toast.success(`${selectedFiles.length} file(s) uploaded successfully!`);
              }
              if (filesToRemove.length > 0) {
                toast.success(`${filesToRemove.length} file(s) removed successfully!`);
              }
              
              setSelectedFiles([]);
              setFilesToRemove([]);
              refetchFiles();
            } else if (selectedFiles.length > 0) {
              // Create new record if no existing files
              await createPatientFiles({
                patient_id: patientId,
                user_id: currentUser?.id,
                files: selectedFiles
              }).unwrap();
              
              toast.success(`${selectedFiles.length} file(s) uploaded successfully!`);
              setSelectedFiles([]);
              refetchFiles();
            }
          } catch (fileErr) {
            console.error('File upload error:', fileErr);
            toast.error(fileErr?.data?.message || 'Failed to update files. ADL file was saved successfully.');
          }
        }
        
        if (isEmbedded) {
          // If embedded, don't navigate
          return;
        }
        if (patientId) {
          navigate(`/patients/${patientId}?tab=adl`);
        } else {
          navigate('/adl-files');
        }
      } else {
        toast.error('Cannot save: Missing required information');
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save ADL file');
    }
  };

  // Render form content - reusable for both embedded and full page modes
  const renderFormContent = () => (
    <>

     {/* Informant Section */}
      <Card className="relative mb-8 shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden">
            <div className="p-6">
              {/* Patient Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Patient Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {readOnly ? (
                          <DisplayField
                            label="Date"
                            value={patient?.date ? (patient.date.includes('T') ? patient.date.split('T')[0] : patient.date) : ''}
                            icon={<FiCalendar className="w-4 h-4" />}
                          />
                        ) : (
                          <Input
                            label="Date"
                            name="date"
                            value={patient?.date ? (patient.date.includes('T') ? patient.date.split('T')[0] : patient.date) : ''}
                            onChange={handleChange}
                            disabled={true}
                            className="disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        )}
                        {readOnly ? (
                          <DisplayField
                            label="Patient Name"
                            value={patient?.name || ''}
                            icon={<FiFileText className="w-4 h-4" />}
                          />
                        ) : (
                          <Input
                            label="Patient Name"
                            value={patient?.name || ''}
                            onChange={handleChange}
                            disabled={true}
                            className="disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        )}
                        {readOnly ? (
                          <DisplayField
                            label="Age"
                            value={patient?.age || ''}
                          />
                        ) : (
                          <Input
                            label="Age"
                            value={patient?.age || ''}
                            onChange={handleChange}
                            disabled={true}
                            className="disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        )}
                        {readOnly ? (
                          <DisplayField
                            label="Sex"
                            value={patient?.sex || ''}
                          />
                        ) : (
                          <Input
                            label="Sex"
                            value={patient?.sex || ''}
                            onChange={handleChange}
                            disabled={true}
                            className="disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        )}
                        {readOnly ? (
                          <DisplayField
                            label="Psy. No."
                            value={patient?.psy_no || ''}
                            icon={<FiFileText className="w-4 h-4" />}
                          />
                        ) : (
                          <Input
                            label="Psy. No."
                            value={patient?.psy_no || ''}
                            onChange={handleChange}
                            disabled={true}
                            className="disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        {readOnly ? (
                          <DisplayField
                            label="Marital Status"
                            value={patient?.marital_status || ''}
                          />
                        ) : (
                          <Input
                            label="Marital Status"
                            name="marital_status"
                            value={patient?.marital_status || ''}
                            onChange={handleChange}
                            disabled={true}
                            className="disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        )}
                        {readOnly ? (
                          <DisplayField
                            label="Education"
                            value={patient?.education || patient?.education_level || ''}
                          />
                        ) : (
                          <Input
                            label="Education"
                            name="education"
                            value={patient?.education || patient?.education_level || ''}
                            onChange={handleChange}
                            disabled={true}
                            className="disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        )}
                        {readOnly ? (
                          <DisplayField
                            label="Occupation"
                            value={patient?.occupation || ''}
                          />
                        ) : (
                          <Input
                            label="Occupation"
                            name="occupation"
                            value={patient?.occupation || ''}
                            onChange={handleChange}
                            disabled={true}
                            className="disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        )}
                        {readOnly ? (
                          <DisplayField
                            label="Name of the City/District"
                            value={(() => {
                              const city = patient?.city || patient?.present_city_town_village || '';
                              const district = patient?.district || patient?.present_district || '';
                              if (city && district) {
                                return `${city}, ${district}`;
                              }
                              return city || district || '';
                            })()}
                          />
                        ) : (
                          <Input
                            label="Name of the City/District"
                            name="city_district"
                            value={(() => {
                              const city = patient?.city || patient?.present_city_town_village || '';
                              const district = patient?.district || patient?.present_district || '';
                              if (city && district) {
                                return `${city}, ${district}`;
                              }
                              return city || district || '';
                            })()}
                            onChange={handleChange}
                            disabled={true}
                            className="disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        )}
                        </div>
                      </div>

                    </div>
          </Card>

         {/* Informants */}
      <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
        <div
          className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={() => toggleCard('informants')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 backdrop-blur-md bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-white/30 shadow-lg">
              <FiFileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Informants</h3>
              <p className="text-sm text-gray-500 mt-1">Multiple informants with relationship and reliability</p>
            </div>
          </div>
          {expandedCards.informants ? (
            <FiChevronUp className="h-6 w-6 text-gray-500" />
          ) : (
            <FiChevronDown className="h-6 w-6 text-gray-500" />
          )}
        </div>

        {expandedCards.informants && (
          <div className="p-6 space-y-4">
            {(formData.informants || [{ relationship: '', name: '', reliability: '' }])?.map((informant, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-700">Informant {index + 1}</h4>
                  {!readOnly && (formData.informants || []).length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newInformants = (formData.informants || []).filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, informants: newInformants.length > 0 ? newInformants : [{ relationship: '', name: '', reliability: '' }] }));
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FiX className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {readOnly ? (
                    <DisplayField
                      label="Relationship"
                      value={informant.relationship}
                    />
                  ) : (
                    <Input
                      label="Relationship"
                      value={informant.relationship}
                      onChange={(e) => {
                        const newInformants = (formData.informants || []).map((item, i) => 
                          i === index ? { ...item, relationship: e.target.value } : { ...item }
                        );
                        setFormData(prev => ({ ...prev, informants: newInformants }));
                      }}
                      placeholder="e.g., Father, Mother, Spouse"
                      disabled={readOnly}
                    />
                  )}
                  {readOnly ? (
                    <DisplayField
                      label="Name"
                      value={informant.name}
                    />
                  ) : (
                    <Input
                      label="Name"
                      value={informant.name}
                      onChange={(e) => {
                        const newInformants = (formData.informants || []).map((item, i) => 
                          i === index ? { ...item, name: e.target.value } : { ...item }
                        );
                        setFormData(prev => ({ ...prev, informants: newInformants }));
                      }}
                      placeholder="Full name"
                      disabled={readOnly}
                    />
                  )}
                  {readOnly ? (
                    <DisplayField
                      label="Reliability / Ability to report"
                      value={informant.reliability}
                    />
                  ) : (
                    <Input
                      label="Reliability / Ability to report"
                      value={informant.reliability}
                      onChange={(e) => {
                        const newInformants = (formData.informants || []).map((item, i) => 
                          i === index ? { ...item, reliability: e.target.value } : { ...item }
                        );
                        setFormData(prev => ({ ...prev, informants: newInformants }));
                      }}
                      placeholder="Assessment of reliability"
                      disabled={readOnly}
                    />
                  )}
                </div>
              </div>
            ))}
            {!readOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    informants: [...prev.informants, { relationship: '', name: '', reliability: '' }]
                  }));
                }}
                className="flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Add Informant
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Complaints and Duration */}
      <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
        <div
          className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={() => toggleCard('complaints')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-white/30 shadow-lg">
              <FiFileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Complaints and Duration</h3>
              <p className="text-sm text-gray-500 mt-1">Chief complaints from patient and informant</p>
            </div>
          </div>
          {expandedCards.complaints ? (
            <FiChevronUp className="h-6 w-6 text-gray-500" />
          ) : (
            <FiChevronDown className="h-6 w-6 text-gray-500" />
          )}
        </div>

        {expandedCards.complaints && formData && (
          <div className="p-6 space-y-6">
            {/* Illness Details - Onset, Precipitating Factor, Course */}
           

            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Chief Complaints as per patient</h4>
              {(formData.complaints_patient || [{ complaint: '', duration: '' }])?.map((complaint, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                  <div className="md:col-span-2">
                    {readOnly ? (
                      <DisplayField
                        label={`Complaint ${index + 1}`}
                        value={complaint.complaint}
                      />
                    ) : (
                      <Input
                        label={`Complaint ${index + 1}`}
                        value={complaint.complaint}
                        onChange={(e) => {
                          if (readOnly) return;
                          const newComplaints = (formData.complaints_patient || []).map((item, i) =>
                            i === index ? { ...item, complaint: e.target.value } : item
                          );
                          setFormData(prev => ({ ...prev, complaints_patient: newComplaints }));
                        }}
                        placeholder="Enter complaint"
                        disabled={readOnly}
                      />
                    )}
                  </div>
                  <div className="md:col-span-2">
                    {readOnly ? (
                      <DisplayField
                        label="Duration"
                        value={complaint.duration}
                      />
                    ) : (
                      <Input
                        label="Duration"
                        value={complaint.duration}
                        onChange={(e) => {
                          if (readOnly) return;
                          const newComplaints = [...(formData.complaints_patient || [])];
                          newComplaints[index].duration = e.target.value;
                          setFormData(prev => ({ ...prev, complaints_patient: newComplaints }));
                        }}
                        disabled={readOnly}
                        placeholder="e.g., 6 months"
                      />
                    )}
                  </div>
                  <div className="flex items-end">
                    {!readOnly && (formData.complaints_patient || []).length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newComplaints = (formData.complaints_patient || []).filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, complaints_patient: newComplaints.length > 0 ? newComplaints : [{ complaint: '', duration: '' }] }));
                        }}
                        className="text-red-600"
                      >
                        <FiX />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {!readOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      complaints_patient: [...prev.complaints_patient, { complaint: '', duration: '' }]
                    }));
                  }}
                  className="flex items-center gap-2 mb-6"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Complaint
                </Button>
              )}
            </div>

            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-800 mb-3">Chief Complaints as per informant</h4>
              {(formData.complaints_informant || [{ complaint: '', duration: '' }])?.map((complaint, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                  <div className="md:col-span-2">
                    {readOnly ? (
                      <DisplayField
                        label={`Complaint ${index + 1}`}
                        value={complaint.complaint}
                      />
                    ) : (
                      <Input
                        label={`Complaint ${index + 1}`}
                        value={complaint.complaint}
                        onChange={(e) => {
                          if (readOnly) return;
                          const newComplaints = [...(formData.complaints_informant || [])];
                          newComplaints[index].complaint = e.target.value;
                          setFormData(prev => ({ ...prev, complaints_informant: newComplaints }));
                        }}
                        placeholder="Enter complaint"
                        disabled={readOnly}
                      />
                    )}
                  </div>
                  <div className="md:col-span-2">
                    {readOnly ? (
                      <DisplayField
                        label="Duration"
                        value={complaint.duration}
                      />
                    ) : (
                      <Input
                        label="Duration"
                        value={complaint.duration}
                        onChange={(e) => {
                          if (readOnly) return;
                          const newComplaints = [...(formData.complaints_informant || [])];
                          newComplaints[index].duration = e.target.value;
                          setFormData(prev => ({ ...prev, complaints_informant: newComplaints }));
                        }}
                        disabled={readOnly}
                        placeholder="e.g., 6 months"
                      />
                    )}
                  </div>
                  <div className="flex items-end">
                    {!readOnly && (formData.complaints_informant || []).length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newComplaints = (formData.complaints_informant || []).filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, complaints_informant: newComplaints.length > 0 ? newComplaints : [{ complaint: '', duration: '' }] }));
                        }}
                        className="text-red-600"
                      >
                        <FiX />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {!readOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      complaints_informant: [...prev.complaints_informant, { complaint: '', duration: '' }]
                    }));
                  }}
                  className="flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Complaint
                </Button>
              )}
            </div>
            <div className="border-b pb-6 mb-6">
              <h4 className="font-semibold text-gray-800 mb-4">Onset, Precipitating Factor, Course</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  {readOnly ? (
                    <DisplayField
                      label="Onset"
                      value={formData?.onset_duration || ''}
                    />
                  ) : (
                    <Input
                      label="Onset"
                      name="onset_duration"
                      value={formData?.onset_duration || ''}
                      onChange={handleChange}
                      disabled={readOnly}
                      placeholder="e.g., Gradual over 6 months"
                    />
                  )}
                </div>
                <div>
                  {readOnly ? (
                    <DisplayField
                      label="Precipitating Factor"
                      value={formData?.precipitating_factor || ''}
                    />
                  ) : (
                    <Input
                      label="Precipitating Factor"
                      name="precipitating_factor"
                      value={formData?.precipitating_factor || ''}
                      onChange={handleChange}
                      disabled={readOnly}
                      placeholder="e.g., Job loss, family conflict"
                    />
                  )}
                </div>
                <div>
                  {readOnly ? (
                    <DisplayField
                      label="Course"
                      value={formData?.course || ''}
                    />
                  ) : (
                    <Input
                      label="Course"
                      name="course"
                      value={formData?.course || ''}
                      onChange={handleChange}
                      disabled={readOnly}
                      placeholder="e.g., Progressive, episodic, continuous"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>


      
      {/* History of Present Illness */}
      <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
        <div
          className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={() => toggleCard('history')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl border border-white/30 shadow-lg">
              <FiFileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">History of Present Illness</h3>
              <p className="text-sm text-gray-500 mt-1">Spontaneous narrative, specific enquiry, drug intake, treatment</p>
            </div>
          </div>
          {expandedCards.history ? (
            <FiChevronUp className="h-6 w-6 text-gray-500" />
          ) : (
            <FiChevronDown className="h-6 w-6 text-gray-500" />
          )}
        </div>

        {expandedCards.history && (
          <div className="p-6 space-y-6">
            {readOnly ? (
              <DisplayField
                label="A. Spontaneous narrative account"
                value={formData.history_narrative}
                rows={4}
              />
            ) : (
              <Textarea
                label="A. Spontaneous narrative account"
                name="history_narrative"
                value={formData.history_narrative}
                onChange={handleChange}
                placeholder="Patient's spontaneous account of the illness..."
                rows={4}
              />
            )}
            
            {readOnly ? (
              <DisplayField
                label="B. Specific enquiry about mood, sleep, appetite, anxiety symptoms, suicidal risk, social interaction, job efficiency, personal hygiene, memory, etc."
                value={formData.history_specific_enquiry}
                rows={5}
              />
            ) : (
              <Textarea
                label="B. Specific enquiry about mood, sleep, appetite, anxiety symptoms, suicidal risk, social interaction, job efficiency, personal hygiene, memory, etc."
                name="history_specific_enquiry"
                value={formData.history_specific_enquiry}
                onChange={handleChange}
                placeholder="Detailed specific enquiries..."
                rows={5}
              />
            )}
            
            {readOnly ? (
              <DisplayField
                label="C. Intake of dependence producing and prescription drugs"
                value={formData.history_drug_intake}
                rows={3}
              />
            ) : (
              <Textarea
                label="C. Intake of dependence producing and prescription drugs"
                name="history_drug_intake"
                value={formData.history_drug_intake}
                onChange={handleChange}
                placeholder="List all dependence producing substances and prescription drugs..."
                rows={3}
              />
            )}
            
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">D. Treatment received so far in this illness</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {readOnly ? (
                  <DisplayField
                    label="Place"
                    value={formData.history_treatment_place}
                  />
                ) : (
                  <Input
                    label="Place"
                    name="history_treatment_place"
                    value={formData.history_treatment_place}
                    onChange={handleChange}
                    placeholder="Location of treatment"
                  />
                )}
                {readOnly ? (
                  <DisplayField
                    label="Dates"
                    value={formData.history_treatment_dates}
                  />
                ) : (
                  <Input
                    label="Dates"
                    name="history_treatment_dates"
                    value={formData.history_treatment_dates}
                    onChange={handleChange}
                    placeholder="Treatment dates"
                  />
                )}
                {readOnly ? (
                  <DisplayField
                    label="Drugs"
                    value={formData.history_treatment_drugs}
                    rows={3}
                  />
                ) : (
                  <Textarea
                    label="Drugs"
                    name="history_treatment_drugs"
                    value={formData.history_treatment_drugs}
                    onChange={handleChange}
                    placeholder="Medications administered"
                    rows={2}
                    className="md:col-span-2"
                  />
                )}
                {readOnly ? (
                  <DisplayField
                    label="Response"
                    value={formData.history_treatment_response}
                    rows={2}
                    className="md:col-span-2"
                  />
                ) : (
                  <Textarea
                    label="Response"
                    name="history_treatment_response"
                    value={formData.history_treatment_response}
                    onChange={handleChange}
                    placeholder="Patient's response to treatment"
                    rows={2}
                    className="md:col-span-2"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

     

      

      {/* Past History - Detailed */}
      <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
        <div
          className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={() => toggleCard('pastHistory')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 backdrop-blur-md bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-xl border border-white/30 shadow-lg">
              <FiFileText className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Past History</h3>
              <p className="text-sm text-gray-500 mt-1">Medical and psychiatric history</p>
            </div>
          </div>
          {expandedCards.pastHistory ? (
            <FiChevronUp className="h-6 w-6 text-gray-500" />
          ) : (
            <FiChevronDown className="h-6 w-6 text-gray-500" />
          )}
        </div>

        {expandedCards.pastHistory && (
          <div className="p-6 space-y-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">A. Medical</h4>
              {readOnly ? (
                <DisplayField
                  label="Including injuries and operations"
                  value={formData.past_history_medical}
                  rows={3}
                />
              ) : (
                <Textarea
                  label="Including injuries and operations"
                  name="past_history_medical"
                  value={formData.past_history_medical}
                  onChange={handleChange}
                  placeholder="Past medical history, injuries, operations..."
                  rows={3}
                />
              )}
            </div>
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">B. Psychiatric</h4>
              <div className="space-y-4">
                {readOnly ? (
                  <DisplayField
                    label="Dates"
                    value={formData.past_history_psychiatric_dates}
                  />
                ) : (
                  <Input
                    label="Dates"
                    name="past_history_psychiatric_dates"
                    value={formData.past_history_psychiatric_dates}
                    onChange={handleChange}
                    placeholder="Dates of previous psychiatric illness/treatment"
                  />
                )}
                {readOnly ? (
                  <DisplayField
                    label="Diagnosis or salient features"
                    value={formData.past_history_psychiatric_diagnosis}
                    rows={2}
                  />
                ) : (
                  <Textarea
                    label="Diagnosis or salient features"
                    name="past_history_psychiatric_diagnosis"
                    value={formData.past_history_psychiatric_diagnosis}
                    onChange={handleChange}
                    placeholder="Previous psychiatric diagnoses or key features"
                    rows={2}
                  />
                )}
                {readOnly ? (
                  <DisplayField
                    label="Treatment"
                    value={formData.past_history_psychiatric_treatment}
                    rows={2}
                  />
                ) : (
                  <Textarea
                    label="Treatment"
                    name="past_history_psychiatric_treatment"
                    value={formData.past_history_psychiatric_treatment}
                    onChange={handleChange}
                    placeholder="Treatment received"
                    rows={2}
                  />
                )}
                {readOnly ? (
                  <DisplayField
                    label="Interim history of previous psychiatric illness"
                    value={formData.past_history_psychiatric_interim}
                    rows={2}
                  />
                ) : (
                  <Textarea
                    label="Interim history of previous psychiatric illness"
                    name="past_history_psychiatric_interim"
                    value={formData.past_history_psychiatric_interim}
                    onChange={handleChange}
                    placeholder="History between episodes"
                    rows={2}
                  />
                )}
                {readOnly ? (
                  <DisplayField
                    label="Specific enquiry into completeness of recovery and socialization/personal care in the interim period"
                    value={formData.past_history_psychiatric_recovery}
                    rows={3}
                  />
                ) : (
                  <Textarea
                    label="Specific enquiry into completeness of recovery and socialization/personal care in the interim period"
                    name="past_history_psychiatric_recovery"
                    value={formData.past_history_psychiatric_recovery}
                    onChange={handleChange}
                    placeholder="Recovery assessment, socialization, personal care during interim"
                    rows={3}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Family History - Detailed */}
      <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
        <div
          className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={() => toggleCard('familyHistory')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 backdrop-blur-md bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-xl border border-white/30 shadow-lg">
              <FiFileText className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Family History</h3>
              <p className="text-sm text-gray-500 mt-1">Father, Mother, and Siblings information</p>
            </div>
          </div>
          {expandedCards.familyHistory ? (
            <FiChevronUp className="h-6 w-6 text-gray-500" />
          ) : (
            <FiChevronDown className="h-6 w-6 text-gray-500" />
          )}
        </div>

        {expandedCards.familyHistory && (
          <div className="p-6 space-y-6">
            {/* Family Tree Visualization - ERD Style */}
            <div className="border-2 border-gray-200 rounded-xl p-4 md:p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 mb-6 overflow-x-auto shadow-inner">
              <h4 className="font-bold text-lg md:text-xl text-gray-800 mb-6 md:mb-8 text-center uppercase tracking-wide">Family Tree - Entity Relationship Diagram</h4>
              <div className="relative flex flex-col items-center min-h-[450px] md:min-h-[550px] py-6 md:py-8">
                {/* Parents Row - Responsive: Stack on mobile, side-by-side on desktop */}
                <div className="relative flex flex-col md:flex-row justify-center gap-6 md:gap-16 lg:gap-24 mb-8 md:mb-12 w-full" style={{ zIndex: 2 }}>
                  {/* Father Entity */}
                  <div className="relative flex flex-col items-center" id="father-entity">
                    <div className={`relative bg-white border-2 rounded-lg p-4 md:p-5 shadow-xl w-full md:min-w-[170px] md:max-w-[170px] lg:min-w-[190px] lg:max-w-[190px] text-center transition-all hover:shadow-2xl hover:scale-105 ${formData.family_history_father_deceased ? 'border-red-500 bg-red-50 opacity-80' : 'border-blue-500 bg-blue-50'}`} style={{ borderWidth: '3px' }}>
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 md:px-4 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                        FATHER
                      </div>
                      <div className="mt-4 pt-2">
                        <div className="text-xs md:text-sm font-bold text-gray-800 mb-2">
                          {formData.family_history_father_age ? `Age: ${formData.family_history_father_age}` : 'Not specified'}
                        </div>
                        {formData.family_history_father_education && (
                          <div className="text-xs text-gray-700 mt-2 truncate" title={formData.family_history_father_education}>
                            <span className="font-semibold">Edu:</span> {formData.family_history_father_education}
                          </div>
                        )}
                        {formData.family_history_father_occupation && (
                          <div className="text-xs text-gray-600 mt-1 truncate" title={formData.family_history_father_occupation}>
                            <span className="font-semibold">Occ:</span> {formData.family_history_father_occupation}
                          </div>
                        )}
                        {formData.family_history_father_deceased && (
                          <div className="absolute -top-2 -right-2">
                            <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full font-bold shadow-lg">✝</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Connection line from father - Desktop: down to horizontal line, Mobile: down to patient */}
                    <div className="hidden md:block absolute top-full left-1/2 transform -translate-x-1/2" style={{ zIndex: 1, marginTop: '2px' }}>
                      <div className="w-1 h-14 bg-blue-500 relative">
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-transparent border-t-blue-500"></div>
                      </div>
                    </div>
                    <div className="md:hidden absolute top-full left-1/2 transform -translate-x-1/2" style={{ zIndex: 1, marginTop: '2px' }}>
                      <div className="w-1 h-12 bg-blue-500 relative">
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-transparent border-t-blue-500"></div>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal connector between parents - Desktop only */}
                  <div className="hidden md:block absolute top-[85px] left-1/2 transform -translate-x-1/2" style={{ zIndex: 1 }}>
                    <div className="flex items-center">
                      <div className="w-[calc(50%-100px)] lg:w-[calc(50%-140px)] h-0.5 bg-gray-400"></div>
                      <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[10px] border-transparent border-l-gray-400"></div>
                      <div className="w-[calc(50%-100px)] lg:w-[calc(50%-140px)] h-0.5 bg-gray-400"></div>
                    </div>
                  </div>

                  {/* Mother Entity */}
                  <div className="relative flex flex-col items-center" id="mother-entity">
                    <div className={`relative bg-white border-2 rounded-lg p-4 md:p-5 shadow-xl w-full md:min-w-[170px] md:max-w-[170px] lg:min-w-[190px] lg:max-w-[190px] text-center transition-all hover:shadow-2xl hover:scale-105 ${formData.family_history_mother_deceased ? 'border-red-500 bg-red-50 opacity-80' : 'border-pink-500 bg-pink-50'}`} style={{ borderWidth: '3px' }}>
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-pink-600 text-white text-xs font-bold px-3 md:px-4 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                        MOTHER
                      </div>
                      <div className="mt-4 pt-2">
                        <div className="text-xs md:text-sm font-bold text-gray-800 mb-2">
                          {formData.family_history_mother_age ? `Age: ${formData.family_history_mother_age}` : 'Not specified'}
                        </div>
                        {formData.family_history_mother_education && (
                          <div className="text-xs text-gray-700 mt-2 truncate" title={formData.family_history_mother_education}>
                            <span className="font-semibold">Edu:</span> {formData.family_history_mother_education}
                          </div>
                        )}
                        {formData.family_history_mother_occupation && (
                          <div className="text-xs text-gray-600 mt-1 truncate" title={formData.family_history_mother_occupation}>
                            <span className="font-semibold">Occ:</span> {formData.family_history_mother_occupation}
                          </div>
                        )}
                        {formData.family_history_mother_deceased && (
                          <div className="absolute -top-2 -right-2">
                            <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full font-bold shadow-lg">✝</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Connection line from mother - Desktop: down to horizontal line, Mobile: down to patient */}
                    <div className="hidden md:block absolute top-full left-1/2 transform -translate-x-1/2" style={{ zIndex: 1, marginTop: '2px' }}>
                      <div className="w-1 h-14 bg-pink-500 relative">
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-transparent border-t-pink-500"></div>
                      </div>
                    </div>
                    <div className="md:hidden absolute top-full left-1/2 transform -translate-x-1/2" style={{ zIndex: 1, marginTop: '2px' }}>
                      <div className="w-1 h-12 bg-pink-500 relative">
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-transparent border-t-pink-500"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vertical connector from horizontal line to patient - Desktop only */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2" style={{ top: '155px', zIndex: 1 }}>
                  <div className="w-1 h-20 bg-gray-400 relative">
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-transparent border-t-gray-400"></div>
                  </div>
                </div>
                {/* Mobile: Connection from center to patient */}
                <div className="md:hidden absolute left-1/2 transform -translate-x-1/2" style={{ top: '200px', zIndex: 1 }}>
                  <div className="w-1 h-10 bg-gray-400 relative">
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-transparent border-t-gray-400"></div>
                  </div>
                </div>

                {/* Patient Entity (Center) - Primary Entity */}
                <div className="relative bg-gradient-to-br from-amber-200 via-amber-100 to-yellow-100 border-4 border-amber-600 rounded-xl p-5 md:p-6 shadow-2xl w-full md:min-w-[210px] md:max-w-[210px] lg:min-w-[230px] lg:max-w-[230px] text-center mb-8 md:mb-12 z-10 transform transition-all hover:scale-105" style={{ zIndex: 2 }}>
                  <div className="absolute -top-4 md:-top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-600 to-amber-500 text-white text-xs md:text-sm font-bold px-4 md:px-5 py-2 rounded-md shadow-xl whitespace-nowrap">
                    PATIENT (PRIMARY)
                  </div>
                  <div className="mt-5 pt-1">
                    <div className="text-base md:text-lg font-bold text-gray-900 truncate mb-2" title={patient?.name || 'Patient Name'}>
                      {patient?.name || 'Patient Name'}
                    </div>
                    {patient?.age && (
                      <div className="text-xs md:text-sm font-semibold text-gray-700 mt-1">Age: {patient.age}</div>
                    )}
                    {patient?.sex && (
                      <div className="text-xs text-gray-600 mt-1 font-medium">
                        ({patient.sex === 'M' ? 'Male' : patient.sex === 'F' ? 'Female' : patient.sex})
                      </div>
                    )}
                  </div>
                </div>

                {/* Connection line from patient to siblings */}
                {(formData.family_history_siblings && formData.family_history_siblings.length > 0 && formData.family_history_siblings.some(s => s.age || s.sex || s.education || s.occupation)) && (
                  <>
                    <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2" style={{ top: '360px', zIndex: 1 }}>
                      <div className="w-1 h-10 bg-green-500 relative">
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-transparent border-t-green-500"></div>
                      </div>
                    </div>
                    <div className="md:hidden absolute left-1/2 transform -translate-x-1/2" style={{ top: '340px', zIndex: 1 }}>
                      <div className="w-1 h-10 bg-green-500 relative">
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-transparent border-t-green-500"></div>
                      </div>
                    </div>
                  </>
                )}

                {/* Siblings Row - Child Entities */}
                {(formData.family_history_siblings && formData.family_history_siblings.length > 0 && formData.family_history_siblings.some(s => s.age || s.sex || s.education || s.occupation)) && (
                  <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-5xl w-full" style={{ zIndex: 2 }}>
                    {formData.family_history_siblings.map((sibling, index) => {
                      if (!sibling.age && !sibling.sex && !sibling.education && !sibling.occupation) return null;
                      return (
                        <div key={index} className="relative flex flex-col items-center w-full sm:w-auto" id={`sibling-entity-${index}`}>
                          <div className="relative bg-white border-2 border-green-500 rounded-lg p-3 md:p-4 shadow-xl w-full sm:min-w-[130px] sm:max-w-[130px] md:min-w-[150px] md:max-w-[150px] text-center transition-all hover:shadow-2xl hover:scale-105 bg-green-50" style={{ borderWidth: '3px' }}>
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-2 md:px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                              SIBLING {index + 1}
                            </div>
                            <div className="mt-4 pt-1">
                              {sibling.age && (
                                <div className="text-xs md:text-sm font-bold text-gray-800 mb-1">Age: {sibling.age}</div>
                              )}
                              {sibling.sex && (
                                <div className="text-xs text-gray-700 mt-1 font-medium">
                                  ({sibling.sex === 'M' ? 'Male' : sibling.sex === 'F' ? 'Female' : sibling.sex})
                                </div>
                              )}
                              {sibling.education && (
                                <div className="text-xs text-gray-700 mt-2 truncate" title={sibling.education}>
                                  <span className="font-semibold">Edu:</span> {sibling.education}
                                </div>
                              )}
                              {sibling.occupation && (
                                <div className="text-xs text-gray-600 mt-1 truncate" title={sibling.occupation}>
                                  <span className="font-semibold">Occ:</span> {sibling.occupation}
                                </div>
                              )}
                              {sibling.marital_status && (
                                <div className="text-xs text-purple-700 mt-2 font-semibold bg-purple-100 px-2 py-1 rounded">
                                  {sibling.marital_status}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Father</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Age"
                  value={formData.family_history_father_age}
                  onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_age: e.target.value }))}
                  placeholder="Age"
                />
                <Input
                  label="Education"
                  value={formData.family_history_father_education}
                  onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_education: e.target.value }))}
                  placeholder="Education level"
                />
                <Input
                  label="Occupation"
                  value={formData.family_history_father_occupation}
                  onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_occupation: e.target.value }))}
                  placeholder="Occupation"
                />
                <Textarea
                  label="General personality and relationship with patient"
                  value={formData.family_history_father_personality}
                  onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_personality: e.target.value }))}
                  placeholder="Personality and relationship details"
                  rows={2}
                  className="md:col-span-2"
                />
                <div className="flex items-center gap-2 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={formData.family_history_father_deceased}
                    onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_deceased: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 rounded"
                  />
                  <label className="text-sm text-gray-700">Deceased</label>
                </div>
                {formData.family_history_father_deceased && (
                  <>
                    <Input
                      label="Age at death"
                      value={formData.family_history_father_death_age}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_death_age: e.target.value }))}
                      placeholder="Age"
                    />
                    <DatePicker
                      icon={<FiCalendar className="w-4 h-4" />}
                      label="Date of death"
                      name="family_history_father_death_date"
                      value={formData.family_history_father_death_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_death_date: e.target.value }))}
                    />
                    <Textarea
                      label="Cause of death"
                      value={formData.family_history_father_death_cause}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_death_cause: e.target.value }))}
                      placeholder="Cause of death"
                      rows={2}
                      className="md:col-span-2"
                    />
                  </>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-800 mb-4">Mother</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Age"
                  value={formData.family_history_mother_age}
                  onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_age: e.target.value }))}
                  placeholder="Age"
                />
                <Input
                  label="Education"
                  value={formData.family_history_mother_education}
                  onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_education: e.target.value }))}
                  placeholder="Education level"
                />
                <Input
                  label="Occupation"
                  value={formData.family_history_mother_occupation}
                  onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_occupation: e.target.value }))}
                  placeholder="Occupation"
                />
                <Textarea
                  label="General personality and relationship with patient"
                  value={formData.family_history_mother_personality}
                  onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_personality: e.target.value }))}
                  placeholder="Personality and relationship details"
                  rows={2}
                  className="md:col-span-2"
                />
                <div className="flex items-center gap-2 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={formData.family_history_mother_deceased}
                    onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_deceased: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 rounded"
                  />
                  <label className="text-sm text-gray-700">Deceased</label>
                </div>
                {formData.family_history_mother_deceased && (
                  <>
                    <Input
                      label="Age at death"
                      value={formData.family_history_mother_death_age}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_death_age: e.target.value }))}
                      placeholder="Age"
                    />
                    <DatePicker
                      icon={<FiCalendar className="w-4 h-4" />}
                      label="Date of death"
                      name="family_history_mother_death_date"
                      value={formData.family_history_mother_death_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_death_date: e.target.value }))}
                    />
                    <Textarea
                      label="Cause of death"
                      value={formData.family_history_mother_death_cause}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_death_cause: e.target.value }))}
                      placeholder="Cause of death"
                      rows={2}
                      className="md:col-span-2"
                    />
                  </>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-800 mb-4">Siblings</h4>
              {(formData.family_history_siblings || [{ age: '', sex: '', education: '', occupation: '', marital_status: '' }])?.map((sibling, index) => (
                <div key={index} className="border-b pb-4 mb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-700">Sibling {index + 1}</h5>
                    {!readOnly && (formData.family_history_siblings || []).length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newSiblings = (formData.family_history_siblings || []).filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, family_history_siblings: newSiblings.length > 0 ? newSiblings : [{ age: '', sex: '', education: '', occupation: '', marital_status: '' }] }));
                        }}
                        className="text-red-600"
                      >
                        <FiX className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Input
                      label="Age"
                      value={sibling.age}
                      onChange={(e) => {
                        if (readOnly) return;
                        const newSiblings = [...(formData.family_history_siblings || [])];
                        newSiblings[index].age = e.target.value;
                        setFormData(prev => ({ ...prev, family_history_siblings: newSiblings }));
                      }}
                      placeholder="Age"
                      disabled={readOnly}
                    />
                    <Select
                      label="Sex"
                      value={sibling.sex}
                      onChange={(e) => {
                        if (readOnly) return;
                        const newSiblings = [...(formData.family_history_siblings || [])];
                        newSiblings[index].sex = e.target.value;
                        setFormData(prev => ({ ...prev, family_history_siblings: newSiblings }));
                      }}
                      options={[{ value: '', label: 'Select' }, { value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }]}
                      disabled={readOnly}
                    />
                    <Input
                      label="Education"
                      value={sibling.education}
                      onChange={(e) => {
                        if (readOnly) return;
                        const newSiblings = [...(formData.family_history_siblings || [])];
                        newSiblings[index].education = e.target.value;
                        setFormData(prev => ({ ...prev, family_history_siblings: newSiblings }));
                      }}
                      placeholder="Education"
                      disabled={readOnly}
                    />
                    <Input
                      label="Occupation"
                      value={sibling.occupation}
                      onChange={(e) => {
                        if (readOnly) return;
                        const newSiblings = [...(formData.family_history_siblings || [])];
                        newSiblings[index].occupation = e.target.value;
                        setFormData(prev => ({ ...prev, family_history_siblings: newSiblings }));
                      }}
                      placeholder="Occupation"
                      disabled={readOnly}
                    />
                    <Select
                      label="Marital Status"
                      value={sibling.marital_status}
                      onChange={(e) => {
                        if (readOnly) return;
                        const newSiblings = [...(formData.family_history_siblings || [])];
                        newSiblings[index].marital_status = e.target.value;
                        setFormData(prev => ({ ...prev, family_history_siblings: newSiblings }));
                      }}
                      options={[{ value: '', label: 'Select' }, { value: 'Single', label: 'Single' }, { value: 'Married', label: 'Married' }, { value: 'Divorced', label: 'Divorced' }, { value: 'Widowed', label: 'Widowed' }]}
                      disabled={readOnly}
                    />
                  </div>
                </div>
              ))}
              {!readOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      family_history_siblings: [...prev.family_history_siblings, { age: '', sex: '', education: '', occupation: '', marital_status: '' }]
                    }));
                  }}
                  className="flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Sibling
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Home Situation and Early Development */}
      <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
        <div
          className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={() => toggleCard('homeSituation')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 backdrop-blur-md bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-xl border border-white/30 shadow-lg">
              <FiFileText className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Home Situation & Early Development</h3>
              <p className="text-sm text-gray-500 mt-1">Personal history, birth, and development milestones</p>
            </div>
          </div>
          {expandedCards.homeSituation ? (
            <FiChevronUp className="h-6 w-6 text-gray-500" />
          ) : (
            <FiChevronDown className="h-6 w-6 text-gray-500" />
          )}
        </div>

        {expandedCards.homeSituation && (
          <div className="p-6 space-y-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">General Home Situation</h4>
              <Textarea
                label="Description of childhood home situation"
                name="home_situation_childhood"
                value={formData.home_situation_childhood}
                onChange={handleChange}
                rows={3}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Textarea
                  label="Parents' relationship"
                  name="home_situation_parents_relationship"
                  value={formData.home_situation_parents_relationship}
                  onChange={handleChange}
                  rows={2}
                />
                <Textarea
                  label="Socioeconomic status"
                  name="home_situation_socioeconomic"
                  value={formData.home_situation_socioeconomic}
                  onChange={handleChange}
                  rows={2}
                />
                <Textarea
                  label="Interpersonal relationships"
                  name="home_situation_interpersonal"
                  value={formData.home_situation_interpersonal}
                  onChange={handleChange}
                  rows={2}
                  className="md:col-span-2"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-800 mb-3">Personal History</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DatePicker
                  icon={<FiCalendar className="w-4 h-4" />}
                  label="Birth Date"
                  name="personal_birth_date"
                  value={formData.personal_birth_date}
                  onChange={handleChange}
                />
                <Input
                  label="Birth Place"
                  name="personal_birth_place"
                  value={formData.personal_birth_place}
                  onChange={handleChange}
                />
                <Select
                  label="Delivery Type"
                  name="personal_delivery_type"
                  value={formData.personal_delivery_type}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select' },
                    { value: 'Normal', label: 'Normal' },
                    { value: 'Forceps', label: 'Forceps' },
                    { value: 'Caesarean', label: 'Caesarean' }
                  ]}
                />
                <Textarea
                  label="Prenatal complications"
                  name="personal_complications_prenatal"
                  value={formData.personal_complications_prenatal}
                  onChange={handleChange}
                  rows={2}
                />
                <Textarea
                  label="Natal complications"
                  name="personal_complications_natal"
                  value={formData.personal_complications_natal}
                  onChange={handleChange}
                  rows={2}
                />
                <Textarea
                  label="Postnatal complications"
                  name="personal_complications_postnatal"
                  value={formData.personal_complications_postnatal}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-800 mb-3">Development</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Weaning age"
                  name="development_weaning_age"
                  value={formData.development_weaning_age}
                  onChange={handleChange}
                />
                <Input
                  label="First words"
                  name="development_first_words"
                  value={formData.development_first_words}
                  onChange={handleChange}
                />
                <Input
                  label="Three words sentences"
                  name="development_three_words"
                  value={formData.development_three_words}
                  onChange={handleChange}
                />
                <Input
                  label="Walking age"
                  name="development_walking"
                  value={formData.development_walking}
                  onChange={handleChange}
                />
                <Textarea
                  label="Neurotic traits"
                  name="development_neurotic_traits"
                  value={formData.development_neurotic_traits}
                  onChange={handleChange}
                  rows={2}
                  className="md:col-span-2"
                />
                <Input
                  label="Nail biting"
                  name="development_nail_biting"
                  value={formData.development_nail_biting}
                  onChange={handleChange}
                />
                <Input
                  label="Bedwetting"
                  name="development_bedwetting"
                  value={formData.development_bedwetting}
                  onChange={handleChange}
                />
                <Textarea
                  label="Phobias"
                  name="development_phobias"
                  value={formData.development_phobias}
                  onChange={handleChange}
                  rows={2}
                />
                <Textarea
                  label="Childhood illness"
                  name="development_childhood_illness"
                  value={formData.development_childhood_illness}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Education */}
      <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
        <div
          className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={() => toggleCard('education')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 backdrop-blur-md bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-white/30 shadow-lg">
              <FiFileText className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Education</h3>
              <p className="text-sm text-gray-500 mt-1">Educational history and performance</p>
            </div>
          </div>
          {expandedCards.education ? (
            <FiChevronUp className="h-6 w-6 text-gray-500" />
          ) : (
            <FiChevronDown className="h-6 w-6 text-gray-500" />
          )}
        </div>

        {expandedCards.education && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Age at start of education"
                name="education_start_age"
                value={formData.education_start_age}
                onChange={handleChange}
              />
              <Input
                label="Highest class passed"
                name="education_highest_class"
                value={formData.education_highest_class}
                onChange={handleChange}
              />
              <Textarea
                label="Performance"
                name="education_performance"
                value={formData.education_performance}
                onChange={handleChange}
                rows={2}
              />
              <Textarea
                label="Disciplinary problems"
                name="education_disciplinary"
                value={formData.education_disciplinary}
                onChange={handleChange}
                rows={2}
              />
              <Textarea
                label="Peer relationships"
                name="education_peer_relationship"
                value={formData.education_peer_relationship}
                onChange={handleChange}
                rows={2}
              />
              <Textarea
                label="Hobbies and interests"
                name="education_hobbies"
                value={formData.education_hobbies}
                onChange={handleChange}
                rows={2}
              />
              <Textarea
                label="Special abilities"
                name="education_special_abilities"
                value={formData.education_special_abilities}
                onChange={handleChange}
                rows={2}
              />
              <Textarea
                label="Reason for discontinuing education"
                name="education_discontinue_reason"
                value={formData.education_discontinue_reason}
                onChange={handleChange}
                rows={2}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Occupation */}
      <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
        <div
          className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={() => toggleCard('occupation')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 backdrop-blur-md bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl border border-white/30 shadow-lg">
              <FiFileText className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Occupation</h3>
              <p className="text-sm text-gray-500 mt-1">Employment history and work adjustments</p>
            </div>
          </div>
          {expandedCards.occupation ? (
            <FiChevronUp className="h-6 w-6 text-gray-500" />
          ) : (
            <FiChevronDown className="h-6 w-6 text-gray-500" />
          )}
        </div>

        {expandedCards.occupation && (
          <div className="p-6 space-y-4">
            {(formData.occupation_jobs || [{ job: '', dates: '', adjustment: '', difficulties: '', promotions: '', change_reason: '' }])?.map((job, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-700">Job {index + 1}</h4>
                  {!readOnly && (formData.occupation_jobs || []).length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newJobs = (formData.occupation_jobs || []).filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, occupation_jobs: newJobs.length > 0 ? newJobs : [{ job: '', dates: '', adjustment: '', difficulties: '', promotions: '', change_reason: '' }] }));
                      }}
                      className="text-red-600"
                    >
                      <FiX className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Job title"
                    value={job.job}
                    onChange={(e) => {
                      if (readOnly) return;
                      const newJobs = [...(formData.occupation_jobs || [])];
                      newJobs[index].job = e.target.value;
                      setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                    }}
                    disabled={readOnly}
                  />
                  <Input
                    label="Dates"
                    value={job.dates}
                    onChange={(e) => {
                      if (readOnly) return;
                      const newJobs = [...(formData.occupation_jobs || [])];
                      newJobs[index].dates = e.target.value;
                      setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                    }}
                    disabled={readOnly}
                  />
                  <Textarea
                    label="Adjustment"
                    value={job.adjustment}
                    onChange={(e) => {
                      if (readOnly) return;
                      const newJobs = [...(formData.occupation_jobs || [])];
                      newJobs[index].adjustment = e.target.value;
                      setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                    }}
                    rows={2}
                    disabled={readOnly}
                  />
                  <Textarea
                    label="Difficulties"
                    value={job.difficulties}
                    onChange={(e) => {
                      if (readOnly) return;
                      const newJobs = [...(formData.occupation_jobs || [])];
                      newJobs[index].difficulties = e.target.value;
                      setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                    }}
                    rows={2}
                    disabled={readOnly}
                  />
                  <Input
                    label="Promotions"
                    value={job.promotions}
                    onChange={(e) => {
                      if (readOnly) return;
                      const newJobs = [...(formData.occupation_jobs || [])];
                      newJobs[index].promotions = e.target.value;
                      setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                    }}
                    disabled={readOnly}
                  />
                  <Textarea
                    label="Reason for change"
                    value={job.change_reason}
                    onChange={(e) => {
                      if (readOnly) return;
                      const newJobs = [...(formData.occupation_jobs || [])];
                      newJobs[index].change_reason = e.target.value;
                      setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                    }}
                    rows={2}
                    disabled={readOnly}
                  />
                </div>
              </div>
            ))}
            {!readOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    occupation_jobs: [...prev.occupation_jobs, { job: '', dates: '', adjustment: '', difficulties: '', promotions: '', change_reason: '' }]
                  }));
                }}
                className="flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Add Job
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Sexual History */}
      <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
        <div
          className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={() => toggleCard('sexual')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 backdrop-blur-md bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-xl border border-white/30 shadow-lg">
              <FiFileText className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Sexual & Marital History</h3>
              <p className="text-sm text-gray-500 mt-1">Development, relationships, and family</p>
            </div>
          </div>
          {expandedCards.sexual ? (
            <FiChevronUp className="h-6 w-6 text-gray-500" />
          ) : (
            <FiChevronDown className="h-6 w-6 text-gray-500" />
          )}
        </div>

        {expandedCards.sexual && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Menarche age (for females)"
                name="sexual_menarche_age"
                value={formData.sexual_menarche_age}
                onChange={handleChange}
              />
              <Textarea
                label="Reaction to menarche"
                name="sexual_menarche_reaction"
                value={formData.sexual_menarche_reaction}
                onChange={handleChange}
                rows={2}
              />
              <Textarea
                label="Sexual education"
                name="sexual_education"
                value={formData.sexual_education}
                onChange={handleChange}
                rows={2}
                className="md:col-span-2"
              />
              <Textarea
                label="Masturbation"
                name="sexual_masturbation"
                value={formData.sexual_masturbation}
                onChange={handleChange}
                rows={2}
              />
              <Textarea
                label="Sexual contact"
                name="sexual_contact"
                value={formData.sexual_contact}
                onChange={handleChange}
                rows={2}
              />
              <Textarea
                label="Premarital/Extramarital relationships"
                name="sexual_premarital_extramarital"
                value={formData.sexual_premarital_extramarital}
                onChange={handleChange}
                rows={2}
                className="md:col-span-2"
              />
            </div>

            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-800 mb-3">Marriage</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Marriage type"
                  name="sexual_marriage_arranged"
                  value={formData.sexual_marriage_arranged}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select' },
                    { value: 'Arranged', label: 'Arranged' },
                    { value: 'Love', label: 'Love' },
                    { value: 'Other', label: 'Other' }
                  ]}
                />
                    <DatePicker
                      icon={<FiCalendar className="w-4 h-4" />}
                      label="Marriage date"
                      name="sexual_marriage_date"
                      value={formData.sexual_marriage_date}
                      onChange={handleChange}
                    disabled={readOnly}
                    />
                <Input
                  label="Spouse age"
                  name="sexual_spouse_age"
                  value={formData.sexual_spouse_age}
                  onChange={handleChange}
                />
                <Input
                  label="Spouse occupation"
                  name="sexual_spouse_occupation"
                  value={formData.sexual_spouse_occupation}
                  onChange={handleChange}
                />
                <Textarea
                  label="General adjustment"
                  name="sexual_adjustment_general"
                  value={formData.sexual_adjustment_general}
                  onChange={handleChange}
                  rows={2}
                />
                <Textarea
                  label="Sexual adjustment"
                  name="sexual_adjustment_sexual"
                  value={formData.sexual_adjustment_sexual}
                  onChange={handleChange}
                  rows={2}
                />
                <Textarea
                  label="Sexual problems"
                  name="sexual_problems"
                  value={formData.sexual_problems}
                  onChange={handleChange}
                  rows={2}
                  className="md:col-span-2"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-800 mb-3">Children</h4>
              {(formData.sexual_children || [{ age: '', sex: '' }])?.map((child, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                  <div className="md:col-span-2">
                    <Input
                      label={`Child ${index + 1} - Age`}
                      value={child.age}
                      onChange={(e) => {
                        const newChildren = [...(formData.sexual_children || [])];
                        newChildren[index].age = e.target.value;
                        setFormData(prev => ({ ...prev, sexual_children: newChildren }));
                      }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Select
                      label="Sex"
                      value={child.sex}
                      onChange={(e) => {
                        const newChildren = [...(formData.sexual_children || [])];
                        newChildren[index].sex = e.target.value;
                        setFormData(prev => ({ ...prev, sexual_children: newChildren }));
                      }}
                      options={[
                        { value: '', label: 'Select' },
                        { value: 'M', label: 'Male' },
                        { value: 'F', label: 'Female' }
                      ]}
                    />
                  </div>
                  <div className="flex items-end">
                    {!readOnly && (formData.sexual_children || []).length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newChildren = (formData.sexual_children || []).filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, sexual_children: newChildren.length > 0 ? newChildren : [{ age: '', sex: '' }] }));
                        }}
                        className="text-red-600"
                      >
                        <FiX />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {!readOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      sexual_children: [...prev.sexual_children, { age: '', sex: '' }]
                    }));
                  }}
                  className="flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Child
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Religion */}
      <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
        <div
          className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={() => toggleCard('religion')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-100 rounded-lg">
              <FiFileText className="h-6 w-6 text-cyan-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Religion</h3>
              <p className="text-sm text-gray-500 mt-1">Religious beliefs and practices</p>
            </div>
          </div>
          {expandedCards.religion ? (
            <FiChevronUp className="h-6 w-6 text-gray-500" />
          ) : (
            <FiChevronDown className="h-6 w-6 text-gray-500" />
          )}
        </div>

        {expandedCards.religion && (
          <div className="p-6 space-y-4">
            <Input
              label="Type of religion"
              name="religion_type"
              value={formData.religion_type}
              onChange={handleChange}
            />
            <Textarea
              label="Participation in religious activities"
              name="religion_participation"
              value={formData.religion_participation}
              onChange={handleChange}
              rows={2}
            />
            <Textarea
              label="Changes in religious beliefs"
              name="religion_changes"
              value={formData.religion_changes}
              onChange={handleChange}
              rows={2}
            />
          </div>
        )}
      </Card>

      {/* Living Situation */}
      <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
        <div
          className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={() => toggleCard('living')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-lime-100 rounded-lg">
              <FiFileText className="h-6 w-6 text-lime-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Living Situation</h3>
              <p className="text-sm text-gray-500 mt-1">Current household and living arrangements</p>
            </div>
          </div>
          {expandedCards.living ? (
            <FiChevronUp className="h-6 w-6 text-gray-500" />
          ) : (
            <FiChevronDown className="h-6 w-6 text-gray-500" />
          )}
        </div>

        {expandedCards.living && (
          <div className="p-6 space-y-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Household Residents</h4>
              {(formData.living_residents || [{ name: '', relationship: '', age: '' }])?.map((resident, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                  <Input
                    label={`Resident ${index + 1} - Name`}
                    value={resident.name}
                    onChange={(e) => {
                      if (readOnly) return;
                      const newResidents = (formData.living_residents || []).map((item, i) =>
                        i === index ? { ...item, name: e.target.value } : item
                      );
                      setFormData(prev => ({ ...prev, living_residents: newResidents }));
                    }}
                    disabled={readOnly}
                  />
                  <Input
                    label="Relationship"
                    value={resident.relationship}
                    onChange={(e) => {
                      if (readOnly) return;
                      const newResidents = (formData.living_residents || []).map((item, i) =>
                        i === index ? { ...item, relationship: e.target.value } : item
                      );
                      setFormData(prev => ({ ...prev, living_residents: newResidents }));
                    }}
                    disabled={readOnly}
                  />
                  <Input
                    label="Age"
                    value={resident.age}
                    onChange={(e) => {
                      if (readOnly) return;
                      const newResidents = (formData.living_residents || []).map((item, i) =>
                        i === index ? { ...item, age: e.target.value } : item
                      );
                      setFormData(prev => ({ ...prev, living_residents: newResidents }));
                    }}
                    disabled={readOnly}
                  />
                  <div className="flex items-end">
                    {!readOnly && (formData.living_residents || []).length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newResidents = (formData.living_residents || []).filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, living_residents: newResidents.length > 0 ? newResidents : [{ name: '', relationship: '', age: '' }] }));
                        }}
                        className="text-red-600"
                      >
                        <FiX />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {!readOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      living_residents: [...prev.living_residents, { name: '', relationship: '', age: '' }]
                    }));
                  }}
                  className="flex items-center gap-2 mb-4"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Resident
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea
                label="Income sharing arrangements"
                name="living_income_sharing"
                value={formData.living_income_sharing}
                onChange={handleChange}
                rows={2}
              />
              <Textarea
                label="Expenses"
                name="living_expenses"
                value={formData.living_expenses}
                onChange={handleChange}
                rows={2}
              />
              <Textarea
                label="Kitchen arrangements"
                name="living_kitchen"
                value={formData.living_kitchen}
                onChange={handleChange}
                rows={2}
              />
              <Textarea
                label="Domestic conflicts"
                name="living_domestic_conflicts"
                value={formData.living_domestic_conflicts}
                onChange={handleChange}
                rows={2}
              />
              <Input
                label="Social class"
                name="living_social_class"
                value={formData.living_social_class}
                onChange={handleChange}
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">In-laws (if applicable)</h4>
              {(formData.living_inlaws || [{ name: '', relationship: '', age: '' }])?.map((inlaw, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                  <Input
                    label={`In-law ${index + 1} - Name`}
                    value={inlaw.name}
                    onChange={(e) => {
                      if (readOnly) return;
                      const newInlaws = (formData.living_inlaws || []).map((item, i) =>
                        i === index ? { ...item, name: e.target.value } : item
                      );
                      setFormData(prev => ({ ...prev, living_inlaws: newInlaws }));
                    }}
                    disabled={readOnly}
                  />
                  <Input
                    label="Relationship"
                    value={inlaw.relationship}
                    onChange={(e) => {
                      if (readOnly) return;
                      const newInlaws = (formData.living_inlaws || []).map((item, i) =>
                        i === index ? { ...item, relationship: e.target.value } : item
                      );
                      setFormData(prev => ({ ...prev, living_inlaws: newInlaws }));
                    }}
                    disabled={readOnly}
                  />
                  <Input
                    label="Age"
                    value={inlaw.age}
                    onChange={(e) => {
                      if (readOnly) return;
                      const newInlaws = (formData.living_inlaws || []).map((item, i) =>
                        i === index ? { ...item, age: e.target.value } : item
                      );
                      setFormData(prev => ({ ...prev, living_inlaws: newInlaws }));
                    }}
                    disabled={readOnly}
                  />
                  <div className="flex items-end">
                    {!readOnly && (formData.living_inlaws || []).length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newInlaws = (formData.living_inlaws || []).filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, living_inlaws: newInlaws.length > 0 ? newInlaws : [{ name: '', relationship: '', age: '' }] }));
                        }}
                        className="text-red-600"
                      >
                        <FiX />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {!readOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      living_inlaws: [...prev.living_inlaws, { name: '', relationship: '', age: '' }]
                    }));
                  }}
                  className="flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Add In-law
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Premorbid Personality */}
      <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
        <div
          className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={() => toggleCard('premorbid')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-100 rounded-lg">
              <FiFileText className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Premorbid Personality</h3>
              <p className="text-sm text-gray-500 mt-1">Personality traits, habits, and behaviors</p>
            </div>
          </div>
          {expandedCards.premorbid ? (
            <FiChevronUp className="h-6 w-6 text-gray-500" />
          ) : (
            <FiChevronDown className="h-6 w-6 text-gray-500" />
          )}
        </div>

        {expandedCards.premorbid && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Passive vs Active"
                name="premorbid_personality_passive_active"
                value={formData.premorbid_personality_passive_active}
                onChange={handleChange}
              />
              <Input
                label="Assertiveness"
                name="premorbid_personality_assertive"
                value={formData.premorbid_personality_assertive}
                onChange={handleChange}
              />
              <Input
                label="Introvert vs Extrovert"
                name="premorbid_personality_introvert_extrovert"
                value={formData.premorbid_personality_introvert_extrovert}
                onChange={handleChange}
              />
            </div>
            <Textarea
              label="Personality traits"
              name="premorbid_personality_traits"
              value={Array.isArray(formData.premorbid_personality_traits) ? formData.premorbid_personality_traits.join(', ') : formData.premorbid_personality_traits}
              onChange={(e) => setFormData(prev => ({ ...prev, premorbid_personality_traits: e.target.value.split(',').map(t => t.trim()) }))}
              placeholder="Enter traits separated by commas"
              rows={2}
            />
            <Textarea
              label="Hobbies and interests"
              name="premorbid_personality_hobbies"
              value={formData.premorbid_personality_hobbies}
              onChange={handleChange}
              rows={2}
            />
            <Textarea
              label="Habits"
              name="premorbid_personality_habits"
              value={formData.premorbid_personality_habits}
              onChange={handleChange}
              rows={2}
            />
            <Textarea
              label="Alcohol and drug use"
              name="premorbid_personality_alcohol_drugs"
              value={formData.premorbid_personality_alcohol_drugs}
              onChange={handleChange}
              rows={2}
            />
          </div>
        )}
      </Card>

      {/* Physical Examination */}
      <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
        <div
          className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={() => toggleCard('physical')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-100 rounded-lg">
              <FiFileText className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Physical Examination</h3>
              <p className="text-sm text-gray-500 mt-1">General appearance, vitals, and system examination</p>
            </div>
          </div>
          {expandedCards.physical ? (
            <FiChevronUp className="h-6 w-6 text-gray-500" />
          ) : (
            <FiChevronDown className="h-6 w-6 text-gray-500" />
          )}
        </div>

        {expandedCards.physical && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea
                label="General appearance"
                name="physical_appearance"
                value={formData.physical_appearance}
                onChange={handleChange}
                rows={2}
                className="md:col-span-2"
              />
              <Input
                label="Body build"
                name="physical_body_build"
                value={formData.physical_body_build}
                onChange={handleChange}
              />
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="physical_pallor"
                    checked={formData.physical_pallor}
                    onChange={handleChange}
                    disabled={readOnly}
                    className="h-4 w-4 text-primary-600 rounded"
                  />
                  <label className="text-sm text-gray-700">Pallor</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="physical_icterus"
                    checked={formData.physical_icterus}
                    onChange={handleChange}
                    disabled={readOnly}
                    className="h-4 w-4 text-primary-600 rounded"
                  />
                  <label className="text-sm text-gray-700">Icterus</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="physical_oedema"
                    checked={formData.physical_oedema}
                    onChange={handleChange}
                    disabled={readOnly}
                    className="h-4 w-4 text-primary-600 rounded"
                  />
                  <label className="text-sm text-gray-700">Oedema</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="physical_lymphadenopathy"
                    checked={formData.physical_lymphadenopathy}
                    onChange={handleChange}
                    disabled={readOnly}
                    className="h-4 w-4 text-primary-600 rounded"
                  />
                  <label className="text-sm text-gray-700">Lymphadenopathy</label>
                </div>
              </div>
              <Input label="Pulse" name="physical_pulse" value={formData.physical_pulse} onChange={handleChange} />
              <Input label="Blood Pressure" name="physical_bp" value={formData.physical_bp} onChange={handleChange} />
              <Input label="Height" name="physical_height" value={formData.physical_height} onChange={handleChange} />
              <Input label="Weight" name="physical_weight" value={formData.physical_weight} onChange={handleChange} />
              <Input label="Waist" name="physical_waist" value={formData.physical_waist} onChange={handleChange} />
              <Input label="Fundus" name="physical_fundus" value={formData.physical_fundus} onChange={handleChange} />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Cardiovascular System</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Apex" name="physical_cvs_apex" value={formData.physical_cvs_apex} onChange={handleChange} />
                <Input label="Regularity" name="physical_cvs_regularity" value={formData.physical_cvs_regularity} onChange={handleChange} />
                <Textarea label="Heart sounds" name="physical_cvs_heart_sounds" value={formData.physical_cvs_heart_sounds} onChange={handleChange} rows={2} />
                <Textarea label="Murmurs" name="physical_cvs_murmurs" value={formData.physical_cvs_murmurs} onChange={handleChange} rows={2} />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Respiratory System</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Chest expansion" name="physical_chest_expansion" value={formData.physical_chest_expansion} onChange={handleChange} />
                <Input label="Percussion" name="physical_chest_percussion" value={formData.physical_chest_percussion} onChange={handleChange} />
                <Textarea label="Adventitious sounds" name="physical_chest_adventitious" value={formData.physical_chest_adventitious} onChange={handleChange} rows={2} className="md:col-span-2" />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Abdomen</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textarea label="Tenderness" name="physical_abdomen_tenderness" value={formData.physical_abdomen_tenderness} onChange={handleChange} rows={2} />
                <Textarea label="Mass" name="physical_abdomen_mass" value={formData.physical_abdomen_mass} onChange={handleChange} rows={2} />
                <Textarea label="Bowel sounds" name="physical_abdomen_bowel_sounds" value={formData.physical_abdomen_bowel_sounds} onChange={handleChange} rows={2} className="md:col-span-2" />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Central Nervous System</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textarea label="Cranial nerves" name="physical_cns_cranial" value={formData.physical_cns_cranial} onChange={handleChange} rows={2} />
                <Textarea label="Motor/Sensory" name="physical_cns_motor_sensory" value={formData.physical_cns_motor_sensory} onChange={handleChange} rows={2} />
                <Input label="Rigidity" name="physical_cns_rigidity" value={formData.physical_cns_rigidity} onChange={handleChange} />
                <Input label="Involuntary movements" name="physical_cns_involuntary" value={formData.physical_cns_involuntary} onChange={handleChange} />
                <Input label="Superficial reflexes" name="physical_cns_superficial_reflexes" value={formData.physical_cns_superficial_reflexes} onChange={handleChange} />
                <Input label="DTRs" name="physical_cns_dtrs" value={formData.physical_cns_dtrs} onChange={handleChange} />
                <Input label="Plantar" name="physical_cns_plantar" value={formData.physical_cns_plantar} onChange={handleChange} />
                <Input label="Cerebellar signs" name="physical_cns_cerebellar" value={formData.physical_cns_cerebellar} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Mental Status Examination */}
      <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
        <div
          className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={() => toggleCard('mse')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <FiFileText className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Mental Status Examination</h3>
              <p className="text-sm text-gray-500 mt-1">Comprehensive psychiatric assessment</p>
            </div>
          </div>
          {expandedCards.mse ? (
            <FiChevronUp className="h-6 w-6 text-gray-500" />
          ) : (
            <FiChevronDown className="h-6 w-6 text-gray-500" />
          )}
        </div>

        {expandedCards.mse && (
          <div className="p-6 space-y-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">General Appearance & Behavior</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textarea label="Demeanour" name="mse_general_demeanour" value={formData.mse_general_demeanour} onChange={handleChange} rows={2} />
                <Input label="Tidy/Unkempt" name="mse_general_tidy" value={formData.mse_general_tidy} onChange={handleChange} />
                <Input label="Awareness" name="mse_general_awareness" value={formData.mse_general_awareness} onChange={handleChange} />
                <Input label="Cooperation" name="mse_general_cooperation" value={formData.mse_general_cooperation} onChange={handleChange} />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Psychomotor Activity</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Verbalization" name="mse_psychomotor_verbalization" value={formData.mse_psychomotor_verbalization} onChange={handleChange} />
                <Input label="Pressure of activity" name="mse_psychomotor_pressure" value={formData.mse_psychomotor_pressure} onChange={handleChange} />
                <Input label="Tension" name="mse_psychomotor_tension" value={formData.mse_psychomotor_tension} onChange={handleChange} />
                <Textarea label="Posture" name="mse_psychomotor_posture" value={formData.mse_psychomotor_posture} onChange={handleChange} rows={2} />
                <Textarea label="Mannerism/Stereotypy" name="mse_psychomotor_mannerism" value={formData.mse_psychomotor_mannerism} onChange={handleChange} rows={2} />
                <Textarea label="Catatonic features" name="mse_psychomotor_catatonic" value={formData.mse_psychomotor_catatonic} onChange={handleChange} rows={2} />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Affect & Mood</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textarea label="Subjective feeling" name="mse_affect_subjective" value={formData.mse_affect_subjective} onChange={handleChange} rows={2} />
                <Input label="Tone" name="mse_affect_tone" value={formData.mse_affect_tone} onChange={handleChange} />
                <Input label="Resting expression" name="mse_affect_resting" value={formData.mse_affect_resting} onChange={handleChange} />
                <Input label="Fluctuation" name="mse_affect_fluctuation" value={formData.mse_affect_fluctuation} onChange={handleChange} />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Thought</h4>
              <div className="grid grid-cols-1 gap-4">
                <Textarea label="Flow" name="mse_thought_flow" value={formData.mse_thought_flow} onChange={handleChange} rows={2} />
                <Textarea label="Form" name="mse_thought_form" value={formData.mse_thought_form} onChange={handleChange} rows={2} />
                <Textarea label="Content" name="mse_thought_content" value={formData.mse_thought_content} onChange={handleChange} rows={3} />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Cognitive Functions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Consciousness" name="mse_cognitive_consciousness" value={formData.mse_cognitive_consciousness} onChange={handleChange} />
                <Input label="Orientation - Time" name="mse_cognitive_orientation_time" value={formData.mse_cognitive_orientation_time} onChange={handleChange} />
                <Input label="Orientation - Place" name="mse_cognitive_orientation_place" value={formData.mse_cognitive_orientation_place} onChange={handleChange} />
                <Input label="Orientation - Person" name="mse_cognitive_orientation_person" value={formData.mse_cognitive_orientation_person} onChange={handleChange} />
                <Input label="Memory - Immediate" name="mse_cognitive_memory_immediate" value={formData.mse_cognitive_memory_immediate} onChange={handleChange} />
                <Input label="Memory - Recent" name="mse_cognitive_memory_recent" value={formData.mse_cognitive_memory_recent} onChange={handleChange} />
                <Input label="Memory - Remote" name="mse_cognitive_memory_remote" value={formData.mse_cognitive_memory_remote} onChange={handleChange} />
                <Input label="Subtraction" name="mse_cognitive_subtraction" value={formData.mse_cognitive_subtraction} onChange={handleChange} />
                <Input label="Digit span" name="mse_cognitive_digit_span" value={formData.mse_cognitive_digit_span} onChange={handleChange} />
                <Input label="Counting backwards" name="mse_cognitive_counting" value={formData.mse_cognitive_counting} onChange={handleChange} />
                <Textarea label="General knowledge" name="mse_cognitive_general_knowledge" value={formData.mse_cognitive_general_knowledge} onChange={handleChange} rows={2} />
                <Textarea label="Calculation" name="mse_cognitive_calculation" value={formData.mse_cognitive_calculation} onChange={handleChange} rows={2} />
                <Textarea label="Similarities" name="mse_cognitive_similarities" value={formData.mse_cognitive_similarities} onChange={handleChange} rows={2} />
                <Textarea label="Proverbs" name="mse_cognitive_proverbs" value={formData.mse_cognitive_proverbs} onChange={handleChange} rows={2} />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Insight & Judgement</h4>
              <div className="grid grid-cols-1 gap-4">
                <Textarea label="Understanding of illness" name="mse_insight_understanding" value={formData.mse_insight_understanding} onChange={handleChange} rows={2} />
                <Textarea label="Judgement" name="mse_insight_judgement" value={formData.mse_insight_judgement} onChange={handleChange} rows={2} />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Diagnostic Formulation */}
      <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
        <div
          className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={() => toggleCard('diagnostic')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <FiFileText className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Diagnostic Formulation</h3>
              <p className="text-sm text-gray-500 mt-1">Clinical summary and diagnostic assessment</p>
            </div>
          </div>
          {expandedCards.diagnostic ? (
            <FiChevronUp className="h-6 w-6 text-gray-500" />
          ) : (
            <FiChevronDown className="h-6 w-6 text-gray-500" />
          )}
        </div>

        {expandedCards.diagnostic && (
          <div className="p-6 space-y-4">
            <Textarea
              label="Brief clinical summary"
              name="diagnostic_formulation_summary"
              value={formData.diagnostic_formulation_summary}
              onChange={handleChange}
              rows={4}
              placeholder="Summarize the clinical presentation..."
            />
            <Textarea
              label="Salient features supporting diagnosis"
              name="diagnostic_formulation_features"
              value={formData.diagnostic_formulation_features}
              onChange={handleChange}
              rows={4}
              placeholder="Key diagnostic features..."
            />
            <Textarea
              label="Psychodynamic formulation"
              name="diagnostic_formulation_psychodynamic"
              value={formData.diagnostic_formulation_psychodynamic}
              onChange={handleChange}
              rows={4}
              placeholder="Psychodynamic understanding..."
            />
          </div>
        )}
      </Card>

      {/* Final Assessment */}
      <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
        <div
          className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={() => toggleCard('final')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-sky-100 rounded-lg">
              <FiFileText className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Final Assessment</h3>
              <p className="text-sm text-gray-500 mt-1">Diagnosis, treatment plan, and consultant comments</p>
            </div>
          </div>
          {expandedCards.final ? (
            <FiChevronUp className="h-6 w-6 text-gray-500" />
          ) : (
            <FiChevronDown className="h-6 w-6 text-gray-500" />
          )}
        </div>

        {expandedCards.final && (
          <div className="p-6 space-y-4">
            <Textarea
              label="Provisional Diagnosis"
              name="provisional_diagnosis"
              value={formData.provisional_diagnosis}
              onChange={handleChange}
              rows={3}
              placeholder="Enter provisional diagnosis..."
            />
            <Textarea
              label="Treatment Plan"
              name="treatment_plan"
              value={formData.treatment_plan}
              onChange={handleChange}
              rows={4}
              placeholder="Comprehensive treatment plan..."
            />
            <Textarea
              label="Consultant Comments"
              name="consultant_comments"
              value={formData.consultant_comments}
              onChange={handleChange}
              rows={3}
              placeholder="Comments from consultant..."
            />
          </div>
        )}
      </Card>
    </>
  );


  // If embedded, show form inline without full page layout
  if (isEmbedded) {
    if (isLoadingADL || isLoadingPatient) {
      return (
        <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-r from-purple-50 to-pink-50">
          <LoadingSpinner />
        </div>
      );
    }

    // When embedded, show the full form in a scrollable container
    return (
      <div className="border border-gray-200 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="p-4 border-b border-gray-300 bg-white/50">
          <h4 className="text-lg font-semibold text-gray-900">
            {adlFile ? `Out Patient Intake Record No. ${adlFile.adl_no ? ` - ${adlFile.adl_no}` : ''}` : 'Create Out Patient Intake Record'}
          </h4>
        </div>
        <div className="max-h-[800px] overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Render all form sections */}
            {renderFormContent()}

            {/* Patient Documents & Files Section - Above Submit Button */}
            {!readOnly && (
              <div className="mt-8 pt-6 border-t border-gray-300">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <FiFileText className="w-4 h-4 text-purple-600" />
                  </div>
                  Patient Documents & Files
                </h4>

                {/* File Upload Component */}
                <div className="mb-4">
                  <FileUpload
                    files={selectedFiles}
                    onFilesChange={setSelectedFiles}
                    maxFiles={20}
                    maxSizeMB={10}
                    patientId={patientId}
                    disabled={!patientId || readOnly}
                  />
                </div>

                {/* Existing Files Preview */}
                {patientId && existingFiles && existingFiles.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-md font-semibold text-gray-800 mb-3">Existing Files</h5>
                    <FilePreview
                      files={existingFiles.filter(file => !filesToRemove.includes(file))}
                      onDelete={canEditFiles ? (filePath) => {
                        setFilesToRemove(prev => {
                          if (!prev.includes(filePath)) {
                            return [...prev, filePath];
                          }
                          return prev;
                        });
                      } : undefined}
                      canDelete={canEditFiles}
                      baseUrl={import.meta.env.VITE_API_URL || 'http://localhost:2025/api'}
                    />
                  </div>
                )}

                {/* Files to be removed indicator */}
                {filesToRemove.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>{filesToRemove.length}</strong> file(s) will be removed when you save.
                    </p>
                  </div>
                )}

                {/* Info message if patientId is not available */}
                {!patientId && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Patient ID is required to upload files. Please save the ADL file first to enable file uploads.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button for embedded mode */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-300">
              <Button
                type="submit"
                variant="primary"
                disabled={isUpdating || isCreating || isUploadingFiles}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 gap-2"
              >
                <FiSave className="w-4 h-4" />
                {isUpdating || isCreating || isUploadingFiles ? 'Saving...' : isCreating ? 'Creating...' : (isUpdateMode ? 'Update Out Patient Intake Record' : 'Create Out Patient Intake Record')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Full page mode
  if (isLoadingADL || isLoadingPatient) {
    return <LoadingSpinner />;
  }

  if (!adlFile && !isEmbedded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-teal-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2"> Out Patient Intake Record Not Found</h2>
          <p className="text-gray-600 mb-6">The ADL file you're trying to edit doesn't exist.</p>
          <Button onClick={() => navigate('/adl-files')} variant="primary">
            Back to Out Patient Intake Records
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Main Wrapper Card - Collapsible */}
        <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
          <div
            className="flex items-center justify-between cursor-pointer p-6 border-b border-white/30 backdrop-blur-sm bg-white/30 hover:bg-white/40 transition-all duration-300 select-none"
            onClick={(e) => {
              e.stopPropagation();
              toggleCard('mainWrapper');
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCard('mainWrapper');
              }
            }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 backdrop-blur-md bg-gradient-to-br from-primary-500/20 to-indigo-600/20 rounded-xl border border-white/30 shadow-lg">
                <FiFileText className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {readOnly ? 'View Out Patient Intake Record' : 'Edit Out Patient Intake Record'}
                </h2>
                {patient && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold">{patient.name}</span>
                    {patient.cr_no && <span className="text-gray-500"> - CR No: {patient.cr_no}</span>}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {expandedCards.mainWrapper ? (
                <FiChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <FiChevronDown className="h-6 w-6 text-gray-500" />
              )}
              {/* {!readOnly && ( */}
                {/* <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(-1);
                  }}
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 hover:border-gray-400 transition-colors ml-2"
                >
                  <FiChevronDown className="w-4 h-4 rotate-90" />
                  Back to All Out Patient Intake Records
                </Button> */}
              {/* )} */}
            </div>
          </div>

          {expandedCards.mainWrapper && (
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
          {/* History of Present Illness */}
          <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-white/30 backdrop-blur-sm bg-white/30 hover:bg-white/40 transition-all duration-300"
              onClick={() => toggleCard('history')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl border border-white/30 shadow-lg">
                  <FiFileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">History of Present Illness</h3>
                  <p className="text-sm text-gray-500 mt-1">Spontaneous narrative, specific enquiry, drug intake, treatment</p>
                </div>
              </div>
              {expandedCards.history ? (
                <FiChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <FiChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </div>

            {expandedCards.history && (
              <div className="p-6 space-y-6">
                <Textarea
                  label="A. Spontaneous narrative account"
                  name="history_narrative"
                  value={formData.history_narrative}
                  onChange={handleChange}
                  placeholder="Patient's spontaneous account of the illness..."
                  rows={4}
                />
                
                <Textarea
                  label="B. Specific enquiry about mood, sleep, appetite, anxiety symptoms, suicidal risk, social interaction, job efficiency, personal hygiene, memory, etc."
                  name="history_specific_enquiry"
                  value={formData.history_specific_enquiry}
                  onChange={handleChange}
                  placeholder="Detailed specific enquiries..."
                  rows={5}
                />
                
                <Textarea
                  label="C. Intake of dependence producing and prescription drugs"
                  name="history_drug_intake"
                  value={formData.history_drug_intake}
                  onChange={handleChange}
                  placeholder="List all dependence producing substances and prescription drugs..."
                  rows={3}
                />
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">D. Treatment received so far in this illness</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Place"
                      name="history_treatment_place"
                      value={formData.history_treatment_place}
                      onChange={handleChange}
                    disabled={readOnly}
                      placeholder="Location of treatment"
                    />
                    <Input
                      label="Dates"
                      name="history_treatment_dates"
                      value={formData.history_treatment_dates}
                      onChange={handleChange}
                    disabled={readOnly}
                      placeholder="Treatment dates"
                    />
                    <Textarea
                      label="Drugs"
                      name="history_treatment_drugs"
                      value={formData.history_treatment_drugs}
                      onChange={handleChange}
                    disabled={readOnly}
                      placeholder="Medications administered"
                      rows={2}
                      className="md:col-span-2"
                    />
                    <Textarea
                      label="Response"
                      name="history_treatment_response"
                      value={formData.history_treatment_response}
                      onChange={handleChange}
                    disabled={readOnly}
                      placeholder="Patient's response to treatment"
                      rows={2}
                      className="md:col-span-2"
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Informants */}
          <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-white/30 backdrop-blur-sm bg-white/30 hover:bg-white/40 transition-all duration-300"
              onClick={() => toggleCard('informants')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 backdrop-blur-md bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-white/30 shadow-lg">
                  <FiFileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Informants</h3>
                  <p className="text-sm text-gray-500 mt-1">Multiple informants with relationship and reliability</p>
                </div>
              </div>
              {expandedCards.informants ? (
                <FiChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <FiChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </div>

            {expandedCards.informants && (
              <div className="p-6 space-y-4">
                {(formData.informants || [{ relationship: '', name: '', reliability: '' }])?.map((informant, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-700">Informant {index + 1}</h4>
                      {!readOnly && (formData.informants || []).length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newInformants = (formData.informants || []).filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, informants: newInformants.length > 0 ? newInformants : [{ relationship: '', name: '', reliability: '' }] }));
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiX className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Relationship"
                        value={informant.relationship}
                        onChange={(e) => {
                          if (readOnly) return;
                          const newInformants = (formData.informants || []).map((item, i) => 
                            i === index ? { ...item, relationship: e.target.value } : { ...item }
                          );
                          setFormData(prev => ({ ...prev, informants: newInformants }));
                        }}
                        placeholder="e.g., Father, Mother, Spouse"
                        disabled={readOnly}
                      />
                      <Input
                        label="Name"
                        value={informant.name}
                        onChange={(e) => {
                          if (readOnly) return;
                          const newInformants = (formData.informants || []).map((item, i) => 
                            i === index ? { ...item, name: e.target.value } : { ...item }
                          );
                          setFormData(prev => ({ ...prev, informants: newInformants }));
                        }}
                        placeholder="Full name"
                      />
                      <Input
                        label="Reliability / Ability to report"
                        value={informant.reliability}
                        onChange={(e) => {
                          if (readOnly) return;
                          const newInformants = (formData.informants || []).map((item, i) => 
                            i === index ? { ...item, reliability: e.target.value } : { ...item }
                          );
                          setFormData(prev => ({ ...prev, informants: newInformants }));
                        }}
                        placeholder="Assessment of reliability"
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                ))}
                {!readOnly && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        informants: [...prev.informants, { relationship: '', name: '', reliability: '' }]
                      }));
                    }}
                    className="flex items-center gap-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Informant
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* Complaints and Duration */}
          <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-white/30 backdrop-blur-sm bg-white/30 hover:bg-white/40 transition-all duration-300"
              onClick={() => toggleCard('complaints')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-white/30 shadow-lg">
                  <FiFileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Complaints and Duration</h3>
                  <p className="text-sm text-gray-500 mt-1">Chief complaints from patient and informant</p>
                </div>
              </div>
              {expandedCards.complaints ? (
                <FiChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <FiChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </div>

            {expandedCards.complaints && (
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Chief Complaints as per patient</h4>
                  {(formData.complaints_patient || [{ complaint: '', duration: '' }])?.map((complaint, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                      <div className="md:col-span-2">
                        <Input
                          label={`Complaint ${index + 1}`}
                          value={complaint.complaint}
                          onChange={(e) => {
                            const newComplaints = [...formData.complaints_patient];
                            newComplaints[index].complaint = e.target.value;
                            setFormData(prev => ({ ...prev, complaints_patient: newComplaints }));
                          }}
                          placeholder="Enter complaint"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          label="Duration"
                          value={complaint.duration}
                          onChange={(e) => {
                            const newComplaints = [...formData.complaints_patient];
                            newComplaints[index].duration = e.target.value;
                            setFormData(prev => ({ ...prev, complaints_patient: newComplaints }));
                          }}
                          placeholder="e.g., 6 months"
                        />
                      </div>
                      <div className="flex items-end">
                        {(formData.complaints_patient || []).length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newComplaints = (formData.complaints_patient || []).filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, complaints_patient: newComplaints.length > 0 ? newComplaints : [{ complaint: '', duration: '' }] }));
                            }}
                            className="text-red-600"
                          >
                            <FiX />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {!readOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          complaints_patient: [...prev.complaints_patient, { complaint: '', duration: '' }]
                        }));
                      }}
                      className="flex items-center gap-2 mb-6"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add Complaint
                    </Button>
                  )}
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Chief Complaints as per informant</h4>
                  {(formData.complaints_informant || [{ complaint: '', duration: '' }])?.map((complaint, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                      <div className="md:col-span-2">
                        <Input
                          label={`Complaint ${index + 1}`}
                          value={complaint.complaint}
                          onChange={(e) => {
                            const newComplaints = [...formData.complaints_informant];
                            newComplaints[index].complaint = e.target.value;
                            setFormData(prev => ({ ...prev, complaints_informant: newComplaints }));
                          }}
                          placeholder="Enter complaint"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          label="Duration"
                          value={complaint.duration}
                          onChange={(e) => {
                            const newComplaints = [...formData.complaints_informant];
                            newComplaints[index].duration = e.target.value;
                            setFormData(prev => ({ ...prev, complaints_informant: newComplaints }));
                          }}
                          placeholder="e.g., 6 months"
                        />
                      </div>
                      <div className="flex items-end">
                        {(formData.complaints_informant || []).length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newComplaints = (formData.complaints_informant || []).filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, complaints_informant: newComplaints.length > 0 ? newComplaints : [{ complaint: '', duration: '' }] }));
                            }}
                            className="text-red-600"
                          >
                            <FiX />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {!readOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          complaints_informant: [...prev.complaints_informant, { complaint: '', duration: '' }]
                        }));
                      }}
                      className="flex items-center gap-2"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add Complaint
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Past History - Detailed */}
          <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-white/30 backdrop-blur-sm bg-white/30 hover:bg-white/40 transition-all duration-300"
              onClick={() => toggleCard('pastHistory')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 backdrop-blur-md bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-xl border border-white/30 shadow-lg">
                  <FiFileText className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Past History</h3>
                  <p className="text-sm text-gray-500 mt-1">Medical and psychiatric history</p>
                </div>
              </div>
              {expandedCards.pastHistory ? (
                <FiChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <FiChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </div>

            {expandedCards.pastHistory && (
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">A. Medical</h4>
                  <Textarea
                    label="Including injuries and operations"
                    name="past_history_medical"
                    value={formData.past_history_medical}
                    onChange={handleChange}
                    disabled={readOnly}
                    placeholder="Past medical history, injuries, operations..."
                    rows={3}
                  />
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">B. Psychiatric</h4>
                  <div className="space-y-4">
                    <Input
                      label="Dates"
                      name="past_history_psychiatric_dates"
                      value={formData.past_history_psychiatric_dates}
                      onChange={handleChange}
                    disabled={readOnly}
                      placeholder="Dates of previous psychiatric illness/treatment"
                    />
                    <Textarea
                      label="Diagnosis or salient features"
                      name="past_history_psychiatric_diagnosis"
                      value={formData.past_history_psychiatric_diagnosis}
                      onChange={handleChange}
                    disabled={readOnly}
                      placeholder="Previous psychiatric diagnoses or key features"
                      rows={2}
                    />
                    <Textarea
                      label="Treatment"
                      name="past_history_psychiatric_treatment"
                      value={formData.past_history_psychiatric_treatment}
                      onChange={handleChange}
                    disabled={readOnly}
                      placeholder="Treatment received"
                      rows={2}
                    />
                    <Textarea
                      label="Interim history of previous psychiatric illness"
                      name="past_history_psychiatric_interim"
                      value={formData.past_history_psychiatric_interim}
                      onChange={handleChange}
                    disabled={readOnly}
                      placeholder="History between episodes"
                      rows={2}
                    />
                    <Textarea
                      label="Specific enquiry into completeness of recovery and socialization/personal care in the interim period"
                      name="past_history_psychiatric_recovery"
                      value={formData.past_history_psychiatric_recovery}
                      onChange={handleChange}
                    disabled={readOnly}
                      placeholder="Recovery assessment, socialization, personal care during interim"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Family History - Detailed */}
          <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-white/30 backdrop-blur-sm bg-white/30 hover:bg-white/40 transition-all duration-300"
              onClick={() => toggleCard('familyHistory')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 backdrop-blur-md bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-xl border border-white/30 shadow-lg">
                  <FiFileText className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Family History</h3>
                  <p className="text-sm text-gray-500 mt-1">Father, Mother, and Siblings information</p>
                </div>
              </div>
              {expandedCards.familyHistory ? (
                <FiChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <FiChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </div>

            {expandedCards.familyHistory && (
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Father</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Age"
                      value={formData.family_history_father_age}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_age: e.target.value }))}
                      placeholder="Age"
                    />
                    <Input
                      label="Education"
                      value={formData.family_history_father_education}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_education: e.target.value }))}
                      placeholder="Education level"
                    />
                    <Input
                      label="Occupation"
                      value={formData.family_history_father_occupation}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_occupation: e.target.value }))}
                      placeholder="Occupation"
                    />
                    <Textarea
                      label="General personality and relationship with patient"
                      value={formData.family_history_father_personality}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_personality: e.target.value }))}
                      placeholder="Personality and relationship details"
                      rows={2}
                      className="md:col-span-2"
                    />
                    <div className="flex items-center gap-2 md:col-span-2">
                      <input
                        type="checkbox"
                        checked={formData.family_history_father_deceased}
                        onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_deceased: e.target.checked }))}
                        className="h-4 w-4 text-primary-600 rounded"
                      />
                      <label className="text-sm text-gray-700">Deceased</label>
                    </div>
                    {formData.family_history_father_deceased && (
                      <>
                        <Input
                          label="Age at death"
                          value={formData.family_history_father_death_age}
                          onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_death_age: e.target.value }))}
                          placeholder="Age"
                        />
                        <DatePicker
                          icon={<FiCalendar className="w-4 h-4" />}
                          label="Date of death"
                          name="family_history_father_death_date"
                          value={formData.family_history_father_death_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_death_date: e.target.value }))}
                        />
                        <Textarea
                          label="Cause of death"
                          value={formData.family_history_father_death_cause}
                          onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_death_cause: e.target.value }))}
                          placeholder="Cause of death"
                          rows={2}
                          className="md:col-span-2"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Mother</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Age"
                      value={formData.family_history_mother_age}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_age: e.target.value }))}
                      placeholder="Age"
                    />
                    <Input
                      label="Education"
                      value={formData.family_history_mother_education}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_education: e.target.value }))}
                      placeholder="Education level"
                    />
                    <Input
                      label="Occupation"
                      value={formData.family_history_mother_occupation}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_occupation: e.target.value }))}
                      placeholder="Occupation"
                    />
                    <Textarea
                      label="General personality and relationship with patient"
                      value={formData.family_history_mother_personality}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_personality: e.target.value }))}
                      placeholder="Personality and relationship details"
                      rows={2}
                      className="md:col-span-2"
                    />
                    <div className="flex items-center gap-2 md:col-span-2">
                      <input
                        type="checkbox"
                        checked={formData.family_history_mother_deceased}
                        onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_deceased: e.target.checked }))}
                        className="h-4 w-4 text-primary-600 rounded"
                      />
                      <label className="text-sm text-gray-700">Deceased</label>
                    </div>
                    {formData.family_history_mother_deceased && (
                      <>
                        <Input
                          label="Age at death"
                          value={formData.family_history_mother_death_age}
                          onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_death_age: e.target.value }))}
                          placeholder="Age"
                        />
                        <DatePicker
                          icon={<FiCalendar className="w-4 h-4" />}
                          label="Date of death"
                          name="family_history_mother_death_date"
                          value={formData.family_history_mother_death_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_death_date: e.target.value }))}
                        />
                        <Textarea
                          label="Cause of death"
                          value={formData.family_history_mother_death_cause}
                          onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_death_cause: e.target.value }))}
                          placeholder="Cause of death"
                          rows={2}
                          className="md:col-span-2"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Siblings</h4>
                  {(formData.family_history_siblings || [{ age: '', sex: '', education: '', occupation: '', marital_status: '' }])?.map((sibling, index) => (
                    <div key={index} className="border-b pb-4 mb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-700">Sibling {index + 1}</h5>
                        {(formData.family_history_siblings || []).length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newSiblings = (formData.family_history_siblings || []).filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, family_history_siblings: newSiblings.length > 0 ? newSiblings : [{ age: '', sex: '', education: '', occupation: '', marital_status: '' }] }));
                            }}
                            className="text-red-600"
                          >
                            <FiX className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <Input
                          label="Age"
                          value={sibling.age}
                          onChange={(e) => {
                            const newSiblings = [...(formData.family_history_siblings || [])];
                            newSiblings[index].age = e.target.value;
                            setFormData(prev => ({ ...prev, family_history_siblings: newSiblings }));
                          }}
                          placeholder="Age"
                        />
                        <Select
                          label="Sex"
                          value={sibling.sex}
                          onChange={(e) => {
                            const newSiblings = [...(formData.family_history_siblings || [])];
                            newSiblings[index].sex = e.target.value;
                            setFormData(prev => ({ ...prev, family_history_siblings: newSiblings }));
                          }}
                          options={[{ value: '', label: 'Select' }, { value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }]}
                        />
                        <Input
                          label="Education"
                          value={sibling.education}
                          onChange={(e) => {
                            const newSiblings = [...(formData.family_history_siblings || [])];
                            newSiblings[index].education = e.target.value;
                            setFormData(prev => ({ ...prev, family_history_siblings: newSiblings }));
                          }}
                          placeholder="Education"
                        />
                        <Input
                          label="Occupation"
                          value={sibling.occupation}
                          onChange={(e) => {
                            const newSiblings = [...(formData.family_history_siblings || [])];
                            newSiblings[index].occupation = e.target.value;
                            setFormData(prev => ({ ...prev, family_history_siblings: newSiblings }));
                          }}
                          placeholder="Occupation"
                        />
                        <Select
                          label="Marital Status"
                          value={sibling.marital_status}
                          onChange={(e) => {
                            const newSiblings = [...(formData.family_history_siblings || [])];
                            newSiblings[index].marital_status = e.target.value;
                            setFormData(prev => ({ ...prev, family_history_siblings: newSiblings }));
                          }}
                          options={[{ value: '', label: 'Select' }, { value: 'Single', label: 'Single' }, { value: 'Married', label: 'Married' }, { value: 'Divorced', label: 'Divorced' }, { value: 'Widowed', label: 'Widowed' }]}
                        />
                      </div>
                    </div>
                  ))}
                  {!readOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          family_history_siblings: [...prev.family_history_siblings, { age: '', sex: '', education: '', occupation: '', marital_status: '' }]
                        }));
                      }}
                      className="flex items-center gap-2"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add Sibling
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Home Situation and Early Development */}
          <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-white/30 backdrop-blur-sm bg-white/30 hover:bg-white/40 transition-all duration-300"
              onClick={() => toggleCard('homeSituation')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 backdrop-blur-md bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-xl border border-white/30 shadow-lg">
                  <FiFileText className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Home Situation & Early Development</h3>
                  <p className="text-sm text-gray-500 mt-1">Personal history, birth, and development milestones</p>
                </div>
              </div>
              {expandedCards.homeSituation ? (
                <FiChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <FiChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </div>

            {expandedCards.homeSituation && (
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">General Home Situation</h4>
                  <Textarea
                    label="Description of childhood home situation"
                    name="home_situation_childhood"
                    value={formData.home_situation_childhood}
                    onChange={handleChange}
                    disabled={readOnly}
                    rows={3}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Textarea
                      label="Parents' relationship"
                      name="home_situation_parents_relationship"
                      value={formData.home_situation_parents_relationship}
                      onChange={handleChange}
                    disabled={readOnly}
                      rows={2}
                    />
                    <Textarea
                      label="Socioeconomic status"
                      name="home_situation_socioeconomic"
                      value={formData.home_situation_socioeconomic}
                      onChange={handleChange}
                    disabled={readOnly}
                      rows={2}
                    />
                    <Textarea
                      label="Interpersonal relationships"
                      name="home_situation_interpersonal"
                      value={formData.home_situation_interpersonal}
                      onChange={handleChange}
                    disabled={readOnly}
                      rows={2}
                      className="md:col-span-2"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Personal History</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DatePicker
                      icon={<FiCalendar className="w-4 h-4" />}
                      label="Birth Date"
                      name="personal_birth_date"
                      value={formData.personal_birth_date}
                      onChange={handleChange}
                    disabled={readOnly}
                    />
                    <Input
                      label="Birth Place"
                      name="personal_birth_place"
                      value={formData.personal_birth_place}
                      onChange={handleChange}
                    disabled={readOnly}
                    />
                    <Select
                      label="Delivery Type"
                      name="personal_delivery_type"
                      value={formData.personal_delivery_type}
                      onChange={handleChange}
                    disabled={readOnly}
                      options={[
                        { value: '', label: 'Select' },
                        { value: 'Normal', label: 'Normal' },
                        { value: 'Forceps', label: 'Forceps' },
                        { value: 'Caesarean', label: 'Caesarean' }
                      ]}
                    />
                    <Textarea
                      label="Prenatal complications"
                      name="personal_complications_prenatal"
                      value={formData.personal_complications_prenatal}
                      onChange={handleChange}
                    disabled={readOnly}
                      rows={2}
                    />
                    <Textarea
                      label="Natal complications"
                      name="personal_complications_natal"
                      value={formData.personal_complications_natal}
                      onChange={handleChange}
                    disabled={readOnly}
                      rows={2}
                    />
                    <Textarea
                      label="Postnatal complications"
                      name="personal_complications_postnatal"
                      value={formData.personal_complications_postnatal}
                      onChange={handleChange}
                    disabled={readOnly}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Development</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Weaning age"
                      name="development_weaning_age"
                      value={formData.development_weaning_age}
                      onChange={handleChange}
                    disabled={readOnly}
                    />
                    <Input
                      label="First words"
                      name="development_first_words"
                      value={formData.development_first_words}
                      onChange={handleChange}
                    disabled={readOnly}
                    />
                    <Input
                      label="Three words sentences"
                      name="development_three_words"
                      value={formData.development_three_words}
                      onChange={handleChange}
                    disabled={readOnly}
                    />
                    <Input
                      label="Walking age"
                      name="development_walking"
                      value={formData.development_walking}
                      onChange={handleChange}
                    disabled={readOnly}
                    />
                    <Textarea
                      label="Neurotic traits"
                      name="development_neurotic_traits"
                      value={formData.development_neurotic_traits}
                      onChange={handleChange}
                    disabled={readOnly}
                      rows={2}
                      className="md:col-span-2"
                    />
                    <Input
                      label="Nail biting"
                      name="development_nail_biting"
                      value={formData.development_nail_biting}
                      onChange={handleChange}
                    disabled={readOnly}
                    />
                    <Input
                      label="Bedwetting"
                      name="development_bedwetting"
                      value={formData.development_bedwetting}
                      onChange={handleChange}
                    disabled={readOnly}
                    />
                    <Textarea
                      label="Phobias"
                      name="development_phobias"
                      value={formData.development_phobias}
                      onChange={handleChange}
                    disabled={readOnly}
                      rows={2}
                    />
                    <Textarea
                      label="Childhood illness"
                      name="development_childhood_illness"
                      value={formData.development_childhood_illness}
                      onChange={handleChange}
                    disabled={readOnly}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Education */}
          <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-white/30 backdrop-blur-sm bg-white/30 hover:bg-white/40 transition-all duration-300"
              onClick={() => toggleCard('education')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 backdrop-blur-md bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-white/30 shadow-lg">
                  <FiFileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Education</h3>
                  <p className="text-sm text-gray-500 mt-1">Educational history and performance</p>
                </div>
              </div>
              {expandedCards.education ? (
                <FiChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <FiChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </div>

            {expandedCards.education && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Age at start of education"
                    name="education_start_age"
                    value={formData.education_start_age}
                    onChange={handleChange}
                    disabled={readOnly}
                  />
                  <Input
                    label="Highest class passed"
                    name="education_highest_class"
                    value={formData.education_highest_class}
                    onChange={handleChange}
                    disabled={readOnly}
                  />
                  <Textarea
                    label="Performance"
                    name="education_performance"
                    value={formData.education_performance}
                    onChange={handleChange}
                    disabled={readOnly}
                    rows={2}
                  />
                  <Textarea
                    label="Disciplinary problems"
                    name="education_disciplinary"
                    value={formData.education_disciplinary}
                    onChange={handleChange}
                    disabled={readOnly}
                    rows={2}
                  />
                  <Textarea
                    label="Peer relationships"
                    name="education_peer_relationship"
                    value={formData.education_peer_relationship}
                    onChange={handleChange}
                    disabled={readOnly}
                    rows={2}
                  />
                  <Textarea
                    label="Hobbies and interests"
                    name="education_hobbies"
                    value={formData.education_hobbies}
                    onChange={handleChange}
                    disabled={readOnly}
                    rows={2}
                  />
                  <Textarea
                    label="Special abilities"
                    name="education_special_abilities"
                    value={formData.education_special_abilities}
                    onChange={handleChange}
                    disabled={readOnly}
                    rows={2}
                  />
                  <Textarea
                    label="Reason for discontinuing education"
                    name="education_discontinue_reason"
                    value={formData.education_discontinue_reason}
                    onChange={handleChange}
                    disabled={readOnly}
                    rows={2}
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Occupation */}
          <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-white/30 backdrop-blur-sm bg-white/30 hover:bg-white/40 transition-all duration-300"
              onClick={() => toggleCard('occupation')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 backdrop-blur-md bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl border border-white/30 shadow-lg">
                  <FiFileText className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Occupation</h3>
                  <p className="text-sm text-gray-500 mt-1">Employment history and work adjustments</p>
                </div>
              </div>
              {expandedCards.occupation ? (
                <FiChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <FiChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </div>

            {expandedCards.occupation && (
              <div className="p-6 space-y-4">
                {(formData.occupation_jobs || [{ job: '', dates: '', adjustment: '', difficulties: '', promotions: '', change_reason: '' }])?.map((job, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-700">Job {index + 1}</h4>
                      {(formData.occupation_jobs || []).length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newJobs = (formData.occupation_jobs || []).filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, occupation_jobs: newJobs.length > 0 ? newJobs : [{ job: '', dates: '', adjustment: '', difficulties: '', promotions: '', change_reason: '' }] }));
                          }}
                          className="text-red-600"
                        >
                          <FiX className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Job title"
                        value={job.job}
                        onChange={(e) => {
                          const newJobs = [...(formData.occupation_jobs || [])];
                          newJobs[index].job = e.target.value;
                          setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                        }}
                      />
                      <Input
                        label="Dates"
                        value={job.dates}
                        onChange={(e) => {
                          const newJobs = [...(formData.occupation_jobs || [])];
                          newJobs[index].dates = e.target.value;
                          setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                        }}
                      />
                      <Textarea
                        label="Adjustment"
                        value={job.adjustment}
                        onChange={(e) => {
                          const newJobs = [...(formData.occupation_jobs || [])];
                          newJobs[index].adjustment = e.target.value;
                          setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                        }}
                        rows={2}
                      />
                      <Textarea
                        label="Difficulties"
                        value={job.difficulties}
                        onChange={(e) => {
                          const newJobs = [...(formData.occupation_jobs || [])];
                          newJobs[index].difficulties = e.target.value;
                          setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                        }}
                        rows={2}
                      />
                      <Input
                        label="Promotions"
                        value={job.promotions}
                        onChange={(e) => {
                          const newJobs = [...(formData.occupation_jobs || [])];
                          newJobs[index].promotions = e.target.value;
                          setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                        }}
                      />
                      <Textarea
                        label="Reason for change"
                        value={job.change_reason}
                        onChange={(e) => {
                          const newJobs = [...(formData.occupation_jobs || [])];
                          newJobs[index].change_reason = e.target.value;
                          setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                        }}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                {!readOnly && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        occupation_jobs: [...prev.occupation_jobs, { job: '', dates: '', adjustment: '', difficulties: '', promotions: '', change_reason: '' }]
                      }));
                    }}
                    className="flex items-center gap-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Job
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* Sexual History */}
          <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-white/30 backdrop-blur-sm bg-white/30 hover:bg-white/40 transition-all duration-300"
              onClick={() => toggleCard('sexual')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 backdrop-blur-md bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-xl border border-white/30 shadow-lg">
                  <FiFileText className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Sexual & Marital History</h3>
                  <p className="text-sm text-gray-500 mt-1">Development, relationships, and family</p>
                </div>
              </div>
              {expandedCards.sexual ? (
                <FiChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <FiChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </div>

            {expandedCards.sexual && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Menarche age (for females)"
                    name="sexual_menarche_age"
                    value={formData.sexual_menarche_age}
                    onChange={handleChange}
                    disabled={readOnly}
                  />
                  <Textarea
                    label="Reaction to menarche"
                    name="sexual_menarche_reaction"
                    value={formData.sexual_menarche_reaction}
                    onChange={handleChange}
                    disabled={readOnly}
                    rows={2}
                  />
                  <Textarea
                    label="Sexual education"
                    name="sexual_education"
                    value={formData.sexual_education}
                    onChange={handleChange}
                    disabled={readOnly}
                    rows={2}
                    className="md:col-span-2"
                  />
                  <Textarea
                    label="Masturbation"
                    name="sexual_masturbation"
                    value={formData.sexual_masturbation}
                    onChange={handleChange}
                    disabled={readOnly}
                    rows={2}
                  />
                  <Textarea
                    label="Sexual contact"
                    name="sexual_contact"
                    value={formData.sexual_contact}
                    onChange={handleChange}
                    disabled={readOnly}
                    rows={2}
                  />
                  <Textarea
                    label="Premarital/Extramarital relationships"
                    name="sexual_premarital_extramarital"
                    value={formData.sexual_premarital_extramarital}
                    onChange={handleChange}
                    disabled={readOnly}
                    rows={2}
                    className="md:col-span-2"
                  />
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Marriage</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Marriage type"
                      name="sexual_marriage_arranged"
                      value={formData.sexual_marriage_arranged}
                      onChange={handleChange}
                    disabled={readOnly}
                      options={[
                        { value: '', label: 'Select' },
                        { value: 'Arranged', label: 'Arranged' },
                        { value: 'Love', label: 'Love' },
                        { value: 'Other', label: 'Other' }
                      ]}
                    />
                    <DatePicker
                      icon={<FiCalendar className="w-4 h-4" />}
                      label="Marriage date"
                      name="sexual_marriage_date"
                      value={formData.sexual_marriage_date}
                      onChange={handleChange}
                    disabled={readOnly}
                    />
                    <Input
                      label="Spouse age"
                      name="sexual_spouse_age"
                      value={formData.sexual_spouse_age}
                      onChange={handleChange}
                    disabled={readOnly}
                    />
                    <Input
                      label="Spouse occupation"
                      name="sexual_spouse_occupation"
                      value={formData.sexual_spouse_occupation}
                      onChange={handleChange}
                    disabled={readOnly}
                    />
                    <Textarea
                      label="General adjustment"
                      name="sexual_adjustment_general"
                      value={formData.sexual_adjustment_general}
                      onChange={handleChange}
                    disabled={readOnly}
                      rows={2}
                    />
                    <Textarea
                      label="Sexual adjustment"
                      name="sexual_adjustment_sexual"
                      value={formData.sexual_adjustment_sexual}
                      onChange={handleChange}
                    disabled={readOnly}
                      rows={2}
                    />
                    <Textarea
                      label="Sexual problems"
                      name="sexual_problems"
                      value={formData.sexual_problems}
                      onChange={handleChange}
                    disabled={readOnly}
                      rows={2}
                      className="md:col-span-2"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Children</h4>
                  {(formData.sexual_children || [{ age: '', sex: '' }])?.map((child, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                      <div className="md:col-span-2">
                        <Input
                          label={`Child ${index + 1} - Age`}
                          value={child.age}
                          onChange={(e) => {
                            const newChildren = [...(formData.sexual_children || [])];
                            newChildren[index].age = e.target.value;
                            setFormData(prev => ({ ...prev, sexual_children: newChildren }));
                          }}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Select
                          label="Sex"
                          value={child.sex}
                          onChange={(e) => {
                            const newChildren = [...(formData.sexual_children || [])];
                            newChildren[index].sex = e.target.value;
                            setFormData(prev => ({ ...prev, sexual_children: newChildren }));
                          }}
                          options={[
                            { value: '', label: 'Select' },
                            { value: 'M', label: 'Male' },
                            { value: 'F', label: 'Female' }
                          ]}
                        />
                      </div>
                      <div className="flex items-end">
                        {(formData.sexual_children || []).length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newChildren = (formData.sexual_children || []).filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, sexual_children: newChildren.length > 0 ? newChildren : [{ age: '', sex: '' }] }));
                            }}
                            className="text-red-600"
                          >
                            <FiX />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {!readOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          sexual_children: [...prev.sexual_children, { age: '', sex: '' }]
                        }));
                      }}
                      className="flex items-center gap-2"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add Child
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Religion & Living Situation - Combined for brevity */}
          <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-white/30 backdrop-blur-sm bg-white/30 hover:bg-white/40 transition-all duration-300"
              onClick={() => toggleCard('religion')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-100 rounded-lg">
                  <FiFileText className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Religion</h3>
                  <p className="text-sm text-gray-500 mt-1">Religious beliefs and practices</p>
                </div>
              </div>
              {expandedCards.religion ? (
                <FiChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <FiChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </div>

            {expandedCards.religion && (
              <div className="p-6 space-y-4">
                <Input
                  label="Type of religion"
                  name="religion_type"
                  value={formData.religion_type}
                  onChange={handleChange}
                />
                <Textarea
                  label="Participation in religious activities"
                  name="religion_participation"
                  value={formData.religion_participation}
                  onChange={handleChange}
                  rows={2}
                />
                <Textarea
                  label="Changes in religious beliefs"
                  name="religion_changes"
                  value={formData.religion_changes}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            )}
          </Card>

          <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-white/30 backdrop-blur-sm bg-white/30 hover:bg-white/40 transition-all duration-300"
              onClick={() => toggleCard('living')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-lime-100 rounded-lg">
                  <FiFileText className="h-6 w-6 text-lime-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Living Situation</h3>
                  <p className="text-sm text-gray-500 mt-1">Current household and living arrangements</p>
                </div>
              </div>
              {expandedCards.living ? (
                <FiChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <FiChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </div>

            {expandedCards.living && (
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Household Residents</h4>
                  {(formData.living_residents || [{ name: '', relationship: '', age: '' }])?.map((resident, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                      <Input
                        label={`Resident ${index + 1} - Name`}
                        value={resident.name}
                        onChange={(e) => {
                          if (readOnly) return;
                          const newResidents = [...(formData.living_residents || [])];
                          newResidents[index].name = e.target.value;
                          setFormData(prev => ({ ...prev, living_residents: newResidents }));
                        }}
                        disabled={readOnly}
                      />
                      <Input
                        label="Relationship"
                        value={resident.relationship}
                        onChange={(e) => {
                          if (readOnly) return;
                          const newResidents = [...(formData.living_residents || [])];
                          newResidents[index].relationship = e.target.value;
                          setFormData(prev => ({ ...prev, living_residents: newResidents }));
                        }}
                        disabled={readOnly}
                      />
                      <Input
                        label="Age"
                        value={resident.age}
                        onChange={(e) => {
                          if (readOnly) return;
                          const newResidents = [...(formData.living_residents || [])];
                          newResidents[index].age = e.target.value;
                          setFormData(prev => ({ ...prev, living_residents: newResidents }));
                        }}
                        disabled={readOnly}
                      />
                      <div className="flex items-end">
                        {!readOnly && (formData.living_residents || []).length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newResidents = (formData.living_residents || []).filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, living_residents: newResidents.length > 0 ? newResidents : [{ name: '', relationship: '', age: '' }] }));
                            }}
                            className="text-red-600"
                          >
                            <FiX />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {!readOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          living_residents: [...prev.living_residents, { name: '', relationship: '', age: '' }]
                        }));
                      }}
                      className="flex items-center gap-2 mb-4"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add Resident
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textarea
                    label="Income sharing arrangements"
                    name="living_income_sharing"
                    value={formData.living_income_sharing}
                    onChange={handleChange}
                    disabled={readOnly}
                    rows={2}
                  />
                  <Textarea
                    label="Expenses"
                    name="living_expenses"
                    value={formData.living_expenses}
                    onChange={handleChange}
                    disabled={readOnly}
                    rows={2}
                  />
                  <Textarea
                    label="Kitchen arrangements"
                    name="living_kitchen"
                    value={formData.living_kitchen}
                    onChange={handleChange}
                    disabled={readOnly}
                    rows={2}
                  />
                  <Textarea
                    label="Domestic conflicts"
                    name="living_domestic_conflicts"
                    value={formData.living_domestic_conflicts}
                    onChange={handleChange}
                    disabled={readOnly}
                    rows={2}
                  />
                  <Input
                    label="Social class"
                    name="living_social_class"
                    value={formData.living_social_class}
                    onChange={handleChange}
                    disabled={readOnly}
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">In-laws (if applicable)</h4>
                  {(formData.living_inlaws || [{ name: '', relationship: '', age: '' }])?.map((inlaw, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                      <Input
                        label={`In-law ${index + 1} - Name`}
                        value={inlaw.name}
                        onChange={(e) => {
                          if (readOnly) return;
                          const newInlaws = [...(formData.living_inlaws || [])];
                          newInlaws[index].name = e.target.value;
                          setFormData(prev => ({ ...prev, living_inlaws: newInlaws }));
                        }}
                        disabled={readOnly}
                      />
                      <Input
                        label="Relationship"
                        value={inlaw.relationship}
                        onChange={(e) => {
                          if (readOnly) return;
                          const newInlaws = [...(formData.living_inlaws || [])];
                          newInlaws[index].relationship = e.target.value;
                          setFormData(prev => ({ ...prev, living_inlaws: newInlaws }));
                        }}
                        disabled={readOnly}
                      />
                      <Input
                        label="Age"
                        value={inlaw.age}
                        onChange={(e) => {
                          if (readOnly) return;
                          const newInlaws = [...(formData.living_inlaws || [])];
                          newInlaws[index].age = e.target.value;
                          setFormData(prev => ({ ...prev, living_inlaws: newInlaws }));
                        }}
                        disabled={readOnly}
                      />
                      <div className="flex items-end">
                        {!readOnly && (formData.living_inlaws || []).length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newInlaws = (formData.living_inlaws || []).filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, living_inlaws: newInlaws.length > 0 ? newInlaws : [{ name: '', relationship: '', age: '' }] }));
                            }}
                            className="text-red-600"
                          >
                            <FiX />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {!readOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          living_inlaws: [...prev.living_inlaws, { name: '', relationship: '', age: '' }]
                        }));
                      }}
                      className="flex items-center gap-2"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add In-law
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Premorbid Personality */}
          <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-white/30 backdrop-blur-sm bg-white/30 hover:bg-white/40 transition-all duration-300"
              onClick={() => toggleCard('premorbid')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-100 rounded-lg">
                  <FiFileText className="h-6 w-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Premorbid Personality</h3>
                  <p className="text-sm text-gray-500 mt-1">Personality traits, habits, and behaviors</p>
                </div>
              </div>
              {expandedCards.premorbid ? (
                <FiChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <FiChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </div>

            {expandedCards.premorbid && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Passive vs Active"
                    name="premorbid_personality_passive_active"
                    value={formData.premorbid_personality_passive_active}
                    onChange={handleChange}
                    disabled={readOnly}
                  />
                  <Input
                    label="Assertiveness"
                    name="premorbid_personality_assertive"
                    value={formData.premorbid_personality_assertive}
                    onChange={handleChange}
                    disabled={readOnly}
                  />
                  <Input
                    label="Introvert vs Extrovert"
                    name="premorbid_personality_introvert_extrovert"
                    value={formData.premorbid_personality_introvert_extrovert}
                    onChange={handleChange}
                    disabled={readOnly}
                  />
                </div>
                <Textarea
                  label="Personality traits"
                  name="premorbid_personality_traits"
                  value={Array.isArray(formData.premorbid_personality_traits) ? formData.premorbid_personality_traits.join(', ') : formData.premorbid_personality_traits}
                  onChange={(e) => setFormData(prev => ({ ...prev, premorbid_personality_traits: e.target.value.split(',').map(t => t.trim()) }))}
                  placeholder="Enter traits separated by commas"
                  rows={2}
                />
                <Textarea
                  label="Hobbies and interests"
                  name="premorbid_personality_hobbies"
                  value={formData.premorbid_personality_hobbies}
                  onChange={handleChange}
                  rows={2}
                />
                <Textarea
                  label="Habits"
                  name="premorbid_personality_habits"
                  value={formData.premorbid_personality_habits}
                  onChange={handleChange}
                  rows={2}
                />
                <Textarea
                  label="Alcohol and drug use"
                  name="premorbid_personality_alcohol_drugs"
                  value={formData.premorbid_personality_alcohol_drugs}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            )}
          </Card>

          {/* Physical Examination */}
          <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-white/30 backdrop-blur-sm bg-white/30 hover:bg-white/40 transition-all duration-300"
              onClick={() => toggleCard('physical')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-100 rounded-lg">
                  <FiFileText className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Physical Examination</h3>
                  <p className="text-sm text-gray-500 mt-1">General appearance, vitals, and system examination</p>
                </div>
              </div>
              {expandedCards.physical ? (
                <FiChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <FiChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </div>

            {expandedCards.physical && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textarea
                    label="General appearance"
                    name="physical_appearance"
                    value={formData.physical_appearance}
                    onChange={handleChange}
                    disabled={readOnly}
                    rows={2}
                    className="md:col-span-2"
                  />
                  <Input
                    label="Body build"
                    name="physical_body_build"
                    value={formData.physical_body_build}
                    onChange={handleChange}
                    disabled={readOnly}
                  />
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="physical_pallor"
                        checked={formData.physical_pallor}
                        onChange={handleChange}
                    disabled={readOnly}
                        className="h-4 w-4 text-primary-600 rounded"
                      />
                      <label className="text-sm text-gray-700">Pallor</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="physical_icterus"
                        checked={formData.physical_icterus}
                        onChange={handleChange}
                    disabled={readOnly}
                        className="h-4 w-4 text-primary-600 rounded"
                      />
                      <label className="text-sm text-gray-700">Icterus</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="physical_oedema"
                        checked={formData.physical_oedema}
                        onChange={handleChange}
                    disabled={readOnly}
                        className="h-4 w-4 text-primary-600 rounded"
                      />
                      <label className="text-sm text-gray-700">Oedema</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="physical_lymphadenopathy"
                        checked={formData.physical_lymphadenopathy}
                        onChange={handleChange}
                    disabled={readOnly}
                        className="h-4 w-4 text-primary-600 rounded"
                      />
                      <label className="text-sm text-gray-700">Lymphadenopathy</label>
                    </div>
                  </div>
                  <Input label="Pulse" name="physical_pulse" value={formData.physical_pulse} onChange={handleChange} />
                  <Input label="Blood Pressure" name="physical_bp" value={formData.physical_bp} onChange={handleChange} />
                  <Input label="Height" name="physical_height" value={formData.physical_height} onChange={handleChange} />
                  <Input label="Weight" name="physical_weight" value={formData.physical_weight} onChange={handleChange} />
                  <Input label="Waist" name="physical_waist" value={formData.physical_waist} onChange={handleChange} />
                  <Input label="Fundus" name="physical_fundus" value={formData.physical_fundus} onChange={handleChange} />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Cardiovascular System</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Apex" name="physical_cvs_apex" value={formData.physical_cvs_apex} onChange={handleChange} />
                    <Input label="Regularity" name="physical_cvs_regularity" value={formData.physical_cvs_regularity} onChange={handleChange} />
                    <Textarea label="Heart sounds" name="physical_cvs_heart_sounds" value={formData.physical_cvs_heart_sounds} onChange={handleChange} rows={2} />
                    <Textarea label="Murmurs" name="physical_cvs_murmurs" value={formData.physical_cvs_murmurs} onChange={handleChange} rows={2} />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Respiratory System</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Chest expansion" name="physical_chest_expansion" value={formData.physical_chest_expansion} onChange={handleChange} />
                    <Input label="Percussion" name="physical_chest_percussion" value={formData.physical_chest_percussion} onChange={handleChange} />
                    <Textarea label="Adventitious sounds" name="physical_chest_adventitious" value={formData.physical_chest_adventitious} onChange={handleChange} rows={2} className="md:col-span-2" />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Abdomen</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Textarea label="Tenderness" name="physical_abdomen_tenderness" value={formData.physical_abdomen_tenderness} onChange={handleChange} rows={2} />
                    <Textarea label="Mass" name="physical_abdomen_mass" value={formData.physical_abdomen_mass} onChange={handleChange} rows={2} />
                    <Textarea label="Bowel sounds" name="physical_abdomen_bowel_sounds" value={formData.physical_abdomen_bowel_sounds} onChange={handleChange} rows={2} className="md:col-span-2" />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Central Nervous System</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Textarea label="Cranial nerves" name="physical_cns_cranial" value={formData.physical_cns_cranial} onChange={handleChange} rows={2} />
                    <Textarea label="Motor/Sensory" name="physical_cns_motor_sensory" value={formData.physical_cns_motor_sensory} onChange={handleChange} rows={2} />
                    <Input label="Rigidity" name="physical_cns_rigidity" value={formData.physical_cns_rigidity} onChange={handleChange} />
                    <Input label="Involuntary movements" name="physical_cns_involuntary" value={formData.physical_cns_involuntary} onChange={handleChange} />
                    <Input label="Superficial reflexes" name="physical_cns_superficial_reflexes" value={formData.physical_cns_superficial_reflexes} onChange={handleChange} />
                    <Input label="DTRs" name="physical_cns_dtrs" value={formData.physical_cns_dtrs} onChange={handleChange} />
                    <Input label="Plantar" name="physical_cns_plantar" value={formData.physical_cns_plantar} onChange={handleChange} />
                    <Input label="Cerebellar signs" name="physical_cns_cerebellar" value={formData.physical_cns_cerebellar} onChange={handleChange} />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Mental Status Examination */}
          <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-white/30 backdrop-blur-sm bg-white/30 hover:bg-white/40 transition-all duration-300"
              onClick={() => toggleCard('mse')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <FiFileText className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Mental Status Examination</h3>
                  <p className="text-sm text-gray-500 mt-1">Comprehensive psychiatric assessment</p>
                </div>
              </div>
              {expandedCards.mse ? (
                <FiChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <FiChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </div>

            {expandedCards.mse && (
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">General Appearance & Behavior</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Textarea label="Demeanour" name="mse_general_demeanour" value={formData.mse_general_demeanour} onChange={handleChange} rows={2} />
                    <Input label="Tidy/Unkempt" name="mse_general_tidy" value={formData.mse_general_tidy} onChange={handleChange} />
                    <Input label="Awareness" name="mse_general_awareness" value={formData.mse_general_awareness} onChange={handleChange} />
                    <Input label="Cooperation" name="mse_general_cooperation" value={formData.mse_general_cooperation} onChange={handleChange} />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Psychomotor Activity</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Verbalization" name="mse_psychomotor_verbalization" value={formData.mse_psychomotor_verbalization} onChange={handleChange} />
                    <Input label="Pressure of activity" name="mse_psychomotor_pressure" value={formData.mse_psychomotor_pressure} onChange={handleChange} />
                    <Input label="Tension" name="mse_psychomotor_tension" value={formData.mse_psychomotor_tension} onChange={handleChange} />
                    <Textarea label="Posture" name="mse_psychomotor_posture" value={formData.mse_psychomotor_posture} onChange={handleChange} rows={2} />
                    <Textarea label="Mannerism/Stereotypy" name="mse_psychomotor_mannerism" value={formData.mse_psychomotor_mannerism} onChange={handleChange} rows={2} />
                    <Textarea label="Catatonic features" name="mse_psychomotor_catatonic" value={formData.mse_psychomotor_catatonic} onChange={handleChange} rows={2} />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Affect & Mood</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Textarea label="Subjective feeling" name="mse_affect_subjective" value={formData.mse_affect_subjective} onChange={handleChange} rows={2} />
                    <Input label="Tone" name="mse_affect_tone" value={formData.mse_affect_tone} onChange={handleChange} />
                    <Input label="Resting expression" name="mse_affect_resting" value={formData.mse_affect_resting} onChange={handleChange} />
                    <Input label="Fluctuation" name="mse_affect_fluctuation" value={formData.mse_affect_fluctuation} onChange={handleChange} />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Thought</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <Textarea label="Flow" name="mse_thought_flow" value={formData.mse_thought_flow} onChange={handleChange} rows={2} />
                    <Textarea label="Form" name="mse_thought_form" value={formData.mse_thought_form} onChange={handleChange} rows={2} />
                    <Textarea label="Content" name="mse_thought_content" value={formData.mse_thought_content} onChange={handleChange} rows={3} />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Cognitive Functions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Consciousness" name="mse_cognitive_consciousness" value={formData.mse_cognitive_consciousness} onChange={handleChange} />
                    <Input label="Orientation - Time" name="mse_cognitive_orientation_time" value={formData.mse_cognitive_orientation_time} onChange={handleChange} />
                    <Input label="Orientation - Place" name="mse_cognitive_orientation_place" value={formData.mse_cognitive_orientation_place} onChange={handleChange} />
                    <Input label="Orientation - Person" name="mse_cognitive_orientation_person" value={formData.mse_cognitive_orientation_person} onChange={handleChange} />
                    <Input label="Memory - Immediate" name="mse_cognitive_memory_immediate" value={formData.mse_cognitive_memory_immediate} onChange={handleChange} />
                    <Input label="Memory - Recent" name="mse_cognitive_memory_recent" value={formData.mse_cognitive_memory_recent} onChange={handleChange} />
                    <Input label="Memory - Remote" name="mse_cognitive_memory_remote" value={formData.mse_cognitive_memory_remote} onChange={handleChange} />
                    <Input label="Subtraction" name="mse_cognitive_subtraction" value={formData.mse_cognitive_subtraction} onChange={handleChange} />
                    <Input label="Digit span" name="mse_cognitive_digit_span" value={formData.mse_cognitive_digit_span} onChange={handleChange} />
                    <Input label="Counting backwards" name="mse_cognitive_counting" value={formData.mse_cognitive_counting} onChange={handleChange} />
                    <Textarea label="General knowledge" name="mse_cognitive_general_knowledge" value={formData.mse_cognitive_general_knowledge} onChange={handleChange} rows={2} />
                    <Textarea label="Calculation" name="mse_cognitive_calculation" value={formData.mse_cognitive_calculation} onChange={handleChange} rows={2} />
                    <Textarea label="Similarities" name="mse_cognitive_similarities" value={formData.mse_cognitive_similarities} onChange={handleChange} rows={2} />
                    <Textarea label="Proverbs" name="mse_cognitive_proverbs" value={formData.mse_cognitive_proverbs} onChange={handleChange} rows={2} />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Insight & Judgement</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <Textarea label="Understanding of illness" name="mse_insight_understanding" value={formData.mse_insight_understanding} onChange={handleChange} rows={2} />
                    <Textarea label="Judgement" name="mse_insight_judgement" value={formData.mse_insight_judgement} onChange={handleChange} rows={2} />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Diagnostic Formulation */}
          <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-white/30 backdrop-blur-sm bg-white/30 hover:bg-white/40 transition-all duration-300"
              onClick={() => toggleCard('diagnostic')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <FiFileText className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Diagnostic Formulation</h3>
                  <p className="text-sm text-gray-500 mt-1">Clinical summary and diagnostic assessment</p>
                </div>
              </div>
              {expandedCards.diagnostic ? (
                <FiChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <FiChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </div>

            {expandedCards.diagnostic && (
              <div className="p-6 space-y-4">
                <Textarea
                  label="Brief clinical summary"
                  name="diagnostic_formulation_summary"
                  value={formData.diagnostic_formulation_summary}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Summarize the clinical presentation..."
                />
                <Textarea
                  label="Salient features supporting diagnosis"
                  name="diagnostic_formulation_features"
                  value={formData.diagnostic_formulation_features}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Key diagnostic features..."
                />
                <Textarea
                  label="Psychodynamic formulation"
                  name="diagnostic_formulation_psychodynamic"
                  value={formData.diagnostic_formulation_psychodynamic}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Psychodynamic understanding..."
                />
              </div>
            )}
          </Card>

          {/* Final Assessment */}
          <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-white/30 backdrop-blur-sm bg-white/30 hover:bg-white/40 transition-all duration-300"
              onClick={() => toggleCard('final')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-sky-100 rounded-lg">
                  <FiFileText className="h-6 w-6 text-sky-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Final Assessment</h3>
                  <p className="text-sm text-gray-500 mt-1">Diagnosis, treatment plan, and consultant comments</p>
                </div>
              </div>
              {expandedCards.final ? (
                <FiChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <FiChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </div>

            {expandedCards.final && (
              <div className="p-6 space-y-4">
                <Textarea
                  label="Provisional Diagnosis"
                  name="provisional_diagnosis"
                  value={formData.provisional_diagnosis}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter provisional diagnosis..."
                />
                <Textarea
                  label="Treatment Plan"
                  name="treatment_plan"
                  value={formData.treatment_plan}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Comprehensive treatment plan..."
                />
                <Textarea
                  label="Consultant Comments"
                  name="consultant_comments"
                  value={formData.consultant_comments}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Comments from consultant..."
                />
              </div>
            )}
          </Card>
        
              </form>
            </div>
          )}
        </Card>
      
          {/* Patient Documents & Files Section - Above Buttons */}
          {!readOnly && (
            <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden mb-6">
              <div className="p-6 space-y-6">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-md">
                    <FiFileText className="w-5 h-5 text-purple-600" />
                  </div>
                  Patient Documents & Files
                </h4>

                {/* File Upload Component */}
                <div className="mb-6">
                  <FileUpload
                    files={selectedFiles}
                    onFilesChange={setSelectedFiles}
                    maxFiles={20}
                    maxSizeMB={10}
                    patientId={patientId}
                    disabled={!patientId || readOnly}
                  />
                </div>

                {/* Existing Files Preview */}
                {patientId && existingFiles && existingFiles.length > 0 && (
                  <div className="mt-6">
                    <h5 className="text-lg font-semibold text-gray-800 mb-4">Existing Files</h5>
                    <FilePreview
                      files={existingFiles.filter(file => !filesToRemove.includes(file))}
                      onDelete={canEditFiles ? (filePath) => {
                        setFilesToRemove(prev => {
                          if (!prev.includes(filePath)) {
                            return [...prev, filePath];
                          }
                          return prev;
                        });
                      } : undefined}
                      canDelete={canEditFiles}
                      baseUrl={import.meta.env.VITE_API_URL || 'http://localhost:2025/api'}
                    />
                  </div>
                )}

                {/* Files to be removed indicator */}
                {filesToRemove.length > 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>{filesToRemove.length}</strong> file(s) will be removed when you save.
                    </p>
                  </div>
                )}

                {/* Info message if patientId is not available */}
                {!patientId && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Patient ID is required to upload files. Please save the ADL file first to enable file uploads.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

            <div className="relative mt-8">
              
                <div className="flex flex-col sm:flex-row justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                    className="px-6 lg:px-8 py-3 bg-white/60 backdrop-blur-md border border-white/30 hover:bg-white/80 hover:border-gray-300/50 text-gray-800 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
              >
                    <FiX className="mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isUpdating || isCreating || isUploadingFiles}
                    className="px-6 lg:px-8 py-3 bg-gradient-to-r from-primary-600 via-indigo-600 to-blue-600 hover:from-primary-700 hover:via-indigo-700 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              >
                <FiSave className="w-4 h-4" />
                    {isUpdating || isCreating || isUploadingFiles ? 'Saving...' : (isUpdateMode ? 'Update Out Patient Intake Record' : 'Create Out Patient Intake Record')}
              </Button>
                </div>
              </div>
      </div>
    </div>
  );
};

export default EditADL;
