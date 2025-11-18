import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCreateADLFileMutation, useUpdateADLFileMutation, useGetADLFileByIdQuery } from '../../features/adl/adlApiSlice';
import { useGetPatientByIdQuery } from '../../features/patients/patientsApiSlice';
import { useGetClinicalProformaByIdQuery } from '../../features/clinical/clinicalApiSlice';
import { ADL_FILE_FORM } from '../../utils/constants';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import { FiSave, FiPlus, FiX, FiChevronDown, FiChevronUp, FiFileText } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';

const CreateADL = ({ patientId, clinicalProformaId, returnTab, onSuccess }  ) => {
  const navigate = useNavigate();
  // const [searchParams] = useSearchParams();

  const [createADLFile, { isLoading: isCreating }] = useCreateADLFileMutation();
  const [updateADLFile, { isLoading: isUpdating }] = useUpdateADLFileMutation();
  const { data: patientData, isLoading: isLoadingPatient } = useGetPatientByIdQuery(patientId, { skip: !patientId });
  const patient = patientData?.data?.patient;
  
  // Check if ADL file already exists for this clinical proforma
  const { 
    data: existingProformaData, 
    isLoading: isLoadingProforma,
    refetch: refetchProforma 
  } = useGetClinicalProformaByIdQuery(clinicalProformaId, { 
    skip: !clinicalProformaId,
    refetchOnMountOrArgChange: true // Always refetch to get latest adl_file_id
  });
  const existingProforma = existingProformaData?.data?.proforma || existingProformaData?.data?.clinical_proforma;
  const existingAdlFileId = existingProforma?.adl_file_id;
  
  // Fetch existing ADL file data if it exists
  const { 
    data: existingAdlData, 
    isLoading: isLoadingAdl,
    refetch: refetchAdl 
  } = useGetADLFileByIdQuery(existingAdlFileId, { 
    skip: !existingAdlFileId,
    refetchOnMountOrArgChange: true
  });
  // Handle different possible API response structures
  // Backend returns: { success: true, data: { adlFile: ... } }
  const existingAdlFile = existingAdlData?.data?.adlFile || existingAdlData?.data?.adl_file || existingAdlData?.data?.file || existingAdlData?.data;
  
  // Force refetch proforma when clinicalProformaId changes (e.g., after update)
  useEffect(() => {
    if (clinicalProformaId && refetchProforma) {
      console.log('[CreateADL] Refetching proforma to get latest adl_file_id...');
      refetchProforma();
    }
  }, [clinicalProformaId, refetchProforma]);
  
  // Refetch ADL file data when existingAdlFileId changes (but not on every render)
  const prevAdlFileIdRef = useRef(null);
  useEffect(() => {
    if (existingAdlFileId && existingAdlFileId !== prevAdlFileIdRef.current && refetchAdl) {
      console.log('[CreateADL] ADL file ID changed, refetching ADL file data for ID:', existingAdlFileId);
      prevAdlFileIdRef.current = existingAdlFileId;
      refetchAdl();
      // Reset lastPopulatedAdlFileId to allow form to repopulate with new data
      setLastPopulatedAdlFileId(null);
    }
  }, [existingAdlFileId, refetchAdl]);
  
  // Debug logging
  useEffect(() => {
    console.log('[CreateADL] Component state:', {
      clinicalProformaId,
      existingProforma,
      existingAdlFileId,
      existingAdlFile,
      isLoadingProforma,
      isLoadingAdl
    });
  }, [clinicalProformaId, existingProforma, existingAdlFileId, existingAdlFile, isLoadingProforma, isLoadingAdl]);

  // Card expand/collapse state
  const [expandedCards, setExpandedCards] = useState({
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

  const toggleCard = (cardName) => {
    setExpandedCards(prev => ({ ...prev, [cardName]: !prev[cardName] }));
  };

  // Track last populated ADL file ID to prevent unnecessary repopulation
  const [lastPopulatedAdlFileId, setLastPopulatedAdlFileId] = useState(null);

  // Initialize form data with all ADL_FILE_FORM fields
  const [formData, setFormData] = useState({
    patient_id: patientId || '',
    clinical_proforma_id: clinicalProformaId || '',
    // History
    history_narrative: '',
    history_specific_enquiry: '',
    history_drug_intake: '',
    history_treatment_place: '',
    history_treatment_dates: '',
    history_treatment_drugs: '',
    history_treatment_response: '',
    // Informants
    informants: [{ relationship: '', name: '', reliability: '' }],
    // Complaints
    complaints_patient: [{ complaint: '', duration: '' }],
    complaints_informant: [{ complaint: '', duration: '' }],
    // Past History
    past_history_medical: '',
    past_history_psychiatric_dates: '',
    past_history_psychiatric_diagnosis: '',
    past_history_psychiatric_treatment: '',
    past_history_psychiatric_interim: '',
    past_history_psychiatric_recovery: '',
    // Family History - Father
    family_history_father_age: '',
    family_history_father_education: '',
    family_history_father_occupation: '',
    family_history_father_personality: '',
    family_history_father_deceased: false,
    family_history_father_death_age: '',
    family_history_father_death_date: '',
    family_history_father_death_cause: '',
    // Family History - Mother
    family_history_mother_age: '',
    family_history_mother_education: '',
    family_history_mother_occupation: '',
    family_history_mother_personality: '',
    family_history_mother_deceased: false,
    family_history_mother_death_age: '',
    family_history_mother_death_date: '',
    family_history_mother_death_cause: '',
    // Family History - Siblings
    family_history_siblings: [{ age: '', sex: '', education: '', occupation: '', marital_status: '' }],
    // Diagnostic Formulation
    diagnostic_formulation_summary: '',
    diagnostic_formulation_features: '',
    diagnostic_formulation_psychodynamic: '',
    // Premorbid Personality
    premorbid_personality_passive_active: '',
    premorbid_personality_assertive: '',
    premorbid_personality_introvert_extrovert: '',
    premorbid_personality_traits: [],
    premorbid_personality_hobbies: '',
    premorbid_personality_habits: '',
    premorbid_personality_alcohol_drugs: '',
    // Physical Examination
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
    // MSE - General
    mse_general_demeanour: '',
    mse_general_tidy: '',
    mse_general_awareness: '',
    mse_general_cooperation: '',
    // MSE - Psychomotor
    mse_psychomotor_verbalization: '',
    mse_psychomotor_pressure: '',
    mse_psychomotor_tension: '',
    mse_psychomotor_posture: '',
    mse_psychomotor_mannerism: '',
    mse_psychomotor_catatonic: '',
    // MSE - Affect
    mse_affect_subjective: '',
    mse_affect_tone: '',
    mse_affect_resting: '',
    mse_affect_fluctuation: '',
    // MSE - Thought
    mse_thought_flow: '',
    mse_thought_form: '',
    mse_thought_content: '',
    // MSE - Cognitive
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
    // Education
    education_start_age: '',
    education_highest_class: '',
    education_performance: '',
    education_disciplinary: '',
    education_peer_relationship: '',
    education_hobbies: '',
    education_special_abilities: '',
    education_discontinue_reason: '',
    // Occupation
    occupation_jobs: [{ job: '', dates: '', adjustment: '', difficulties: '', promotions: '', change_reason: '' }],
    // Sexual History
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
    // Religion
    religion_type: '',
    religion_participation: '',
    religion_changes: '',
    // Living Situation
    living_residents: [{ name: '', relationship: '', age: '' }],
    living_income_sharing: '',
    living_expenses: '',
    living_kitchen: '',
    living_domestic_conflicts: '',
    living_social_class: '',
    living_inlaws: [{ name: '', relationship: '', age: '' }],
    // Home Situation
    home_situation_childhood: '',
    home_situation_parents_relationship: '',
    home_situation_socioeconomic: '',
    home_situation_interpersonal: '',
    // Personal History
    personal_birth_date: '',
    personal_birth_place: '',
    personal_delivery_type: '',
    personal_complications_prenatal: '',
    personal_complications_natal: '',
    personal_complications_postnatal: '',
    // Development
    development_weaning_age: '',
    development_first_words: '',
    development_three_words: '',
    development_walking: '',
    development_neurotic_traits: '',
    development_nail_biting: '',
    development_bedwetting: '',
    development_phobias: '',
    development_childhood_illness: '',
    // Final Assessment
    provisional_diagnosis: '',
    treatment_plan: '',
    consultant_comments: '',
  });

  // Populate form with existing ADL file data when it's loaded
  useEffect(() => {
    // Only populate if we have data and haven't populated this specific ADL file yet
    if (existingAdlFile && existingAdlFile.id && Object.keys(existingAdlFile).length > 0 && 
        existingAdlFile.id !== lastPopulatedAdlFileId) {
      console.log('[CreateADL] Populating form with existing ADL file data. ADL File ID:', existingAdlFile.id);
      console.log('[CreateADL] Existing ADL file keys:', Object.keys(existingAdlFile));
      
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
      
      // Date fields that need formatting
      const dateFields = [
        'history_treatment_dates', 'past_history_psychiatric_dates',
        'family_history_father_death_date', 'family_history_mother_death_date',
        'sexual_marriage_date', 'personal_birth_date'
      ];
      
      // Populate form with existing ADL file data
      setFormData(prev => {
        const updated = { ...prev };
        
        // Update all fields from existing ADL file
        Object.keys(existingAdlFile).forEach(key => {
          // Skip metadata fields
          if (key !== 'id' && key !== 'created_at' && key !== 'updated_at' &&
              key !== 'patient_id' && key !== 'adl_no' && key !== 'created_by' &&
              key !== 'clinical_proforma_id' && key !== 'file_status' &&
              key !== 'file_created_date' && key !== 'total_visits' && key !== 'is_active' &&
              key !== 'last_accessed_date' && key !== 'last_accessed_by' &&
              key !== 'physical_file_location' && key !== 'notes') {
            
            const value = existingAdlFile[key];
            
            // Handle JSONB array fields
            if (['informants', 'complaints_patient', 'complaints_informant', 
                 'family_history_siblings', 'premorbid_personality_traits', 
                 'occupation_jobs', 'sexual_children', 'living_residents', 'living_inlaws'].includes(key)) {
              if (value === null || value === undefined) {
                // Keep default empty array structure
                updated[key] = prev[key];
              } else if (typeof value === 'string') {
                try {
                  const parsed = JSON.parse(value);
                  // Ensure it's an array and has at least one item
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    updated[key] = parsed;
                  } else if (Array.isArray(parsed)) {
                    // Empty array - use default structure
                    updated[key] = prev[key];
                  } else {
                    updated[key] = prev[key];
                  }
                } catch {
                  updated[key] = prev[key];
                }
              } else if (Array.isArray(value)) {
                // Already an array
                if (value.length > 0) {
                  updated[key] = value;
                } else {
                  updated[key] = prev[key];
                }
              } else {
                updated[key] = prev[key];
              }
            } 
            // Handle date fields
            else if (dateFields.includes(key)) {
              updated[key] = formatDateField(value);
            }
            // Handle boolean fields
            else if (key.includes('deceased') || key.includes('pallor') || key.includes('icterus') || 
                     key.includes('oedema') || key.includes('lymphadenopathy')) {
              updated[key] = value === true || value === 'true' || value === 1;
            }
            // Handle numeric fields (age, etc.)
            else if (key.includes('_age') || key.includes('start_age') || key.includes('weaning_age') ||
                     key.includes('menarche_age') || key.includes('spouse_age')) {
              updated[key] = value !== null && value !== undefined ? String(value) : '';
            }
            // Handle all other fields
            else {
              // Only update if value is not null/undefined, otherwise keep previous value
              if (value !== null && value !== undefined && value !== '') {
                updated[key] = value;
              }
              // If value is empty string, keep it (user might want to clear it)
              else if (value === '') {
                updated[key] = '';
              }
              // Otherwise keep previous value
            }
          }
        });
        
        console.log('[CreateADL] Form data updated with existing ADL file. Sample fields:', {
          history_narrative: updated.history_narrative,
          provisional_diagnosis: updated.provisional_diagnosis,
          treatment_plan: updated.treatment_plan,
          consultant_comments: updated.consultant_comments,
          informants: updated.informants?.length,
          complaints_patient: updated.complaints_patient?.length
        });
        
        // Mark this ADL file as populated
        setLastPopulatedAdlFileId(existingAdlFile.id);
        
        return updated;
      });
    }
  }, [existingAdlFile, lastPopulatedAdlFileId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // CRITICAL: Prevent event from bubbling to parent form
    
    // Add debugging
    console.log('[CreateADL.handleSubmit] Starting submission...');
    console.log('[CreateADL.handleSubmit] clinicalProformaId:', clinicalProformaId);
    console.log('[CreateADL.handleSubmit] existingProforma:', existingProforma);
    console.log('[CreateADL.handleSubmit] existingAdlFileId:', existingAdlFileId);
    console.log('[CreateADL.handleSubmit] existingAdlFile:', existingAdlFile);
    console.log('[CreateADL.handleSubmit] patientId:', patientId);
    
    try {
      // Prepare data for submission - convert arrays to JSON strings
      const prepareDataForSubmission = (data) => {
        const prepared = { ...data };
        const arrayFields = [
          'informants', 'complaints_patient', 'complaints_informant',
          'family_history_siblings', 'premorbid_personality_traits', 'occupation_jobs',
          'sexual_children', 'living_residents', 'living_inlaws'
        ];
        
        arrayFields.forEach(field => {
          if (Array.isArray(prepared[field])) {
            prepared[field] = JSON.stringify(prepared[field]);
          }
        });
        
        return prepared;
      };

      const submissionData = prepareDataForSubmission(formData);
      console.log('[CreateADL.handleSubmit] Prepared submission data keys:', Object.keys(submissionData));
      
      // CRITICAL: Refetch proforma to ensure we have the latest adl_file_id
      // This handles the case where the clinical proforma was just updated and adl_file_id was created
      let latestAdlFileId = existingAdlFileId;
      if (clinicalProformaId && refetchProforma) {
        try {
          console.log('[CreateADL.handleSubmit] Refetching proforma to get latest adl_file_id...');
          const refetchedProformaData = await refetchProforma();
          const refetchedProforma = refetchedProformaData?.data?.proforma || refetchedProformaData?.data?.clinical_proforma;
          if (refetchedProforma?.adl_file_id) {
            latestAdlFileId = refetchedProforma.adl_file_id;
            console.log('[CreateADL.handleSubmit] Found adl_file_id from refetch:', latestAdlFileId);
          }
        } catch (refetchError) {
          console.warn('[CreateADL.handleSubmit] Could not refetch proforma:', refetchError);
        }
      }
      
      // If ADL file ID exists (even if the full file object isn't loaded yet), update it
      // The backend will handle the update even if we don't have the full existingAdlFile object
      if (latestAdlFileId) {
        console.log('[CreateADL.handleSubmit] Updating existing ADL file with ID:', latestAdlFileId);
        // Update existing ADL file
        const updateData = {
          id: latestAdlFileId,
          ...submissionData
        };
        // Remove fields that shouldn't be in update payload
        delete updateData.patient_id;
        delete updateData.clinical_proforma_id;
        
        console.log('[CreateADL.handleSubmit] Update payload keys:', Object.keys(updateData));
        console.log('[CreateADL.handleSubmit] Update payload sample:', JSON.stringify(updateData).substring(0, 500));
        const result = await updateADLFile(updateData).unwrap();
        console.log('[CreateADL.handleSubmit] Update successful:', result);
        toast.success('ADL File updated successfully!');
        
        // Refetch ADL file data to show updated values
        if (refetchAdl) {
          const refetchedAdlData = await refetchAdl();
          console.log('[CreateADL.handleSubmit] Refetched ADL file data:', refetchedAdlData);
          // Reset lastPopulatedAdlFileId so form can be repopulated with latest data
          if (latestAdlFileId) {
            setLastPopulatedAdlFileId(null); // Reset to allow repopulation
          }
        }
        
        // Refetch proforma to get latest data
        if (refetchProforma) {
          await refetchProforma();
        }
        
        // Call onSuccess callback if provided (for parent component to handle)
        if (onSuccess) {
          onSuccess(result);
        }
        
        // CRITICAL: Don't navigate if embedded (returnTab is set) - keep form open
        if (!returnTab) {
          if (patientId) {
            navigate(`/patients/${patientId}?tab=adl`);
          } else {
            navigate('/adl-files');
          }
        } else {
          // If embedded, just show success message and keep form open
          console.log('[CreateADL.handleSubmit] Form is embedded, keeping it open');
          // Don't do anything - form stays open
        }
      } else if (clinicalProformaId) {
        console.log('[CreateADL.handleSubmit] Creating new ADL file for clinical proforma:', clinicalProformaId);
        // Create new ADL file
        const createData = {
          patient_id: patientId,
          clinical_proforma_id: clinicalProformaId,
          ...submissionData
        };
        console.log('[CreateADL.handleSubmit] Create payload:', createData);
        const result = await createADLFile(createData).unwrap();
        console.log('[CreateADL.handleSubmit] Create successful:', result);
        toast.success('ADL File created successfully!');
        
        // Refetch proforma to get the new adl_file_id
        if (refetchProforma) {
          await refetchProforma();
        }
        
        // Call onSuccess callback if provided (for parent component to handle)
        if (onSuccess) {
          onSuccess(result);
        }
        
        // CRITICAL: Don't navigate if embedded (returnTab is set) - keep form open
        if (!returnTab) {
          if (patientId) {
            navigate(`/patients/${patientId}?tab=adl`);
          } else {
            navigate('/adl-files');
          }
        } else {
          // If embedded, just show success message and keep form open
          console.log('[CreateADL.handleSubmit] Form is embedded, keeping it open');
          // Don't do anything - form stays open
        }
      } else {
        console.error('[CreateADL.handleSubmit] Cannot save: Missing clinicalProformaId and existingAdlFileId');
        toast.error('Cannot save ADL file: Missing required information (clinical proforma ID)');
        return;
      }
    } catch (err) {
      console.error('[CreateADL.handleSubmit] Error:', err);
      console.error('[CreateADL.handleSubmit] Error details:', {
        message: err?.data?.message || err?.message,
        status: err?.status,
        data: err?.data
      });
      toast.error(err?.data?.message || err?.message || 'Failed to save ADL file');
      
      // CRITICAL: Don't navigate on error if embedded - keep form open so user can fix and retry
      if (!returnTab) {
        // Only navigate away on error if not embedded
        console.log('[CreateADL.handleSubmit] Error occurred, but form is embedded so keeping it open');
      }
    }
  };

  if (isLoadingPatient) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-teal-50">
      <div className="w-full px-6 py-8 space-y-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            {/* <h1 className="text-3xl font-bold text-gray-900">Create ADL File</h1> */}
            {patient && (
              <p className="text-gray-600 mt-1">
                {patient.name} - {patient.cr_no || 'N/A'}
              </p>
            )}
          </div>
          {/* <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FiChevronDown className="w-4 h-4 rotate-90" />
            Back
          </Button> */}
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation(); // Prevent bubbling to parent forms when embedded
          handleSubmit(e);
        }} action="#" method="post">
          {/* History of Present Illness */}
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => toggleCard('history')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
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
                      placeholder="Location of treatment"
                    />
                    <Input
                      label="Dates"
                      name="history_treatment_dates"
                      value={formData.history_treatment_dates}
                      onChange={handleChange}
                      placeholder="Treatment dates"
                    />
                    <Textarea
                      label="Drugs"
                      name="history_treatment_drugs"
                      value={formData.history_treatment_drugs}
                      onChange={handleChange}
                      placeholder="Medications administered"
                      rows={2}
                      className="md:col-span-2"
                    />
                    <Textarea
                      label="Response"
                      name="history_treatment_response"
                      value={formData.history_treatment_response}
                      onChange={handleChange}
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
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => toggleCard('informants')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
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
                      {(formData.informants || []).length > 1 && (
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
                          const newInformants = [...formData.informants];
                          newInformants[index].relationship = e.target.value;
                          setFormData(prev => ({ ...prev, informants: newInformants }));
                        }}
                        placeholder="e.g., Father, Mother, Spouse"
                      />
                      <Input
                        label="Name"
                        value={informant.name}
                        onChange={(e) => {
                          const newInformants = [...formData.informants];
                          newInformants[index].name = e.target.value;
                          setFormData(prev => ({ ...prev, informants: newInformants }));
                        }}
                        placeholder="Full name"
                      />
                      <Input
                        label="Reliability / Ability to report"
                        value={informant.reliability}
                        onChange={(e) => {
                          const newInformants = [...formData.informants];
                          newInformants[index].reliability = e.target.value;
                          setFormData(prev => ({ ...prev, informants: newInformants }));
                        }}
                        placeholder="Assessment of reliability"
                      />
                    </div>
                  </div>
                ))}
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
              </div>
            )}
          </Card>

          {/* Complaints and Duration */}
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => toggleCard('complaints')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
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
                </div>
              </div>
            )}
          </Card>

          {/* Past History - Detailed */}
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => toggleCard('pastHistory')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
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
                      placeholder="Dates of previous psychiatric illness/treatment"
                    />
                    <Textarea
                      label="Diagnosis or salient features"
                      name="past_history_psychiatric_diagnosis"
                      value={formData.past_history_psychiatric_diagnosis}
                      onChange={handleChange}
                      placeholder="Previous psychiatric diagnoses or key features"
                      rows={2}
                    />
                    <Textarea
                      label="Treatment"
                      name="past_history_psychiatric_treatment"
                      value={formData.past_history_psychiatric_treatment}
                      onChange={handleChange}
                      placeholder="Treatment received"
                      rows={2}
                    />
                    <Textarea
                      label="Interim history of previous psychiatric illness"
                      name="past_history_psychiatric_interim"
                      value={formData.past_history_psychiatric_interim}
                      onChange={handleChange}
                      placeholder="History between episodes"
                      rows={2}
                    />
                    <Textarea
                      label="Specific enquiry into completeness of recovery and socialization/personal care in the interim period"
                      name="past_history_psychiatric_recovery"
                      value={formData.past_history_psychiatric_recovery}
                      onChange={handleChange}
                      placeholder="Recovery assessment, socialization, personal care during interim"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Family History - Detailed */}
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => toggleCard('familyHistory')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
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
                        <Input
                          label="Date of death"
                          type="date"
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
                        <Input
                          label="Date of death"
                          type="date"
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
                            const newSiblings = [...formData.family_history_siblings];
                            newSiblings[index].age = e.target.value;
                            setFormData(prev => ({ ...prev, family_history_siblings: newSiblings }));
                          }}
                          placeholder="Age"
                        />
                        <Select
                          label="Sex"
                          value={sibling.sex}
                          onChange={(e) => {
                            const newSiblings = [...formData.family_history_siblings];
                            newSiblings[index].sex = e.target.value;
                            setFormData(prev => ({ ...prev, family_history_siblings: newSiblings }));
                          }}
                          options={[{ value: '', label: 'Select' }, { value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }]}
                        />
                        <Input
                          label="Education"
                          value={sibling.education}
                          onChange={(e) => {
                            const newSiblings = [...formData.family_history_siblings];
                            newSiblings[index].education = e.target.value;
                            setFormData(prev => ({ ...prev, family_history_siblings: newSiblings }));
                          }}
                          placeholder="Education"
                        />
                        <Input
                          label="Occupation"
                          value={sibling.occupation}
                          onChange={(e) => {
                            const newSiblings = [...formData.family_history_siblings];
                            newSiblings[index].occupation = e.target.value;
                            setFormData(prev => ({ ...prev, family_history_siblings: newSiblings }));
                          }}
                          placeholder="Occupation"
                        />
                        <Select
                          label="Marital Status"
                          value={sibling.marital_status}
                          onChange={(e) => {
                            const newSiblings = [...formData.family_history_siblings];
                            newSiblings[index].marital_status = e.target.value;
                            setFormData(prev => ({ ...prev, family_history_siblings: newSiblings }));
                          }}
                          options={[{ value: '', label: 'Select' }, { value: 'Single', label: 'Single' }, { value: 'Married', label: 'Married' }, { value: 'Divorced', label: 'Divorced' }, { value: 'Widowed', label: 'Widowed' }]}
                        />
                      </div>
                    </div>
                  ))}
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
                </div>
              </div>
            )}
          </Card>

          {/* Home Situation and Early Development */}
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => toggleCard('homeSituation')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
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
                    <Input
                      label="Birth Date"
                      type="date"
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
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => toggleCard('education')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
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
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => toggleCard('occupation')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-100 rounded-lg">
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
                          const newJobs = [...formData.occupation_jobs];
                          newJobs[index].job = e.target.value;
                          setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                        }}
                      />
                      <Input
                        label="Dates"
                        value={job.dates}
                        onChange={(e) => {
                          const newJobs = [...formData.occupation_jobs];
                          newJobs[index].dates = e.target.value;
                          setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                        }}
                      />
                      <Textarea
                        label="Adjustment"
                        value={job.adjustment}
                        onChange={(e) => {
                          const newJobs = [...formData.occupation_jobs];
                          newJobs[index].adjustment = e.target.value;
                          setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                        }}
                        rows={2}
                      />
                      <Textarea
                        label="Difficulties"
                        value={job.difficulties}
                        onChange={(e) => {
                          const newJobs = [...formData.occupation_jobs];
                          newJobs[index].difficulties = e.target.value;
                          setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                        }}
                        rows={2}
                      />
                      <Input
                        label="Promotions"
                        value={job.promotions}
                        onChange={(e) => {
                          const newJobs = [...formData.occupation_jobs];
                          newJobs[index].promotions = e.target.value;
                          setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                        }}
                      />
                      <Textarea
                        label="Reason for change"
                        value={job.change_reason}
                        onChange={(e) => {
                          const newJobs = [...formData.occupation_jobs];
                          newJobs[index].change_reason = e.target.value;
                          setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                        }}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
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
              </div>
            )}
          </Card>

          {/* Sexual History */}
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div
              className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => toggleCard('sexual')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-100 rounded-lg">
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
                    <Input
                      label="Marriage date"
                      type="date"
                      name="sexual_marriage_date"
                      value={formData.sexual_marriage_date}
                      onChange={handleChange}
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
                            const newChildren = [...formData.sexual_children];
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
                            const newChildren = [...formData.sexual_children];
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
                </div>
              </div>
            )}
          </Card>

          {/* Religion & Living Situation - Combined for brevity */}
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
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

          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
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
                          const newResidents = [...formData.living_residents];
                          newResidents[index].name = e.target.value;
                          setFormData(prev => ({ ...prev, living_residents: newResidents }));
                        }}
                      />
                      <Input
                        label="Relationship"
                        value={resident.relationship}
                        onChange={(e) => {
                          const newResidents = [...formData.living_residents];
                          newResidents[index].relationship = e.target.value;
                          setFormData(prev => ({ ...prev, living_residents: newResidents }));
                        }}
                      />
                      <Input
                        label="Age"
                        value={resident.age}
                        onChange={(e) => {
                          const newResidents = [...formData.living_residents];
                          newResidents[index].age = e.target.value;
                          setFormData(prev => ({ ...prev, living_residents: newResidents }));
                        }}
                      />
                      <div className="flex items-end">
                        {(formData.living_residents || []).length > 1 && (
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
                          const newInlaws = [...formData.living_inlaws];
                          newInlaws[index].name = e.target.value;
                          setFormData(prev => ({ ...prev, living_inlaws: newInlaws }));
                        }}
                      />
                      <Input
                        label="Relationship"
                        value={inlaw.relationship}
                        onChange={(e) => {
                          const newInlaws = [...formData.living_inlaws];
                          newInlaws[index].relationship = e.target.value;
                          setFormData(prev => ({ ...prev, living_inlaws: newInlaws }));
                        }}
                      />
                      <Input
                        label="Age"
                        value={inlaw.age}
                        onChange={(e) => {
                          const newInlaws = [...formData.living_inlaws];
                          newInlaws[index].age = e.target.value;
                          setFormData(prev => ({ ...prev, living_inlaws: newInlaws }));
                        }}
                      />
                      <div className="flex items-end">
                        {(formData.living_inlaws || []).length > 1 && (
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
                </div>
              </div>
            )}
          </Card>

          {/* Premorbid Personality */}
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
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
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
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
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
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
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
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
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
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

          {/* Submit Button */}
          <div className="flex justify-end gap-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={isCreating || isUpdating}
              className="flex items-center gap-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit(e);
              }}
            >
              <FiSave className="w-4 h-4" />
              {isCreating || isUpdating 
                ? (existingAdlFileId ? 'Updating...' : 'Creating...') 
                : (existingAdlFileId ? 'Update ADL Files' : 'Create ADL File')}
                {/* {console.log('existingAdlFileId', isCreating,isUpdating)} */}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateADL;
