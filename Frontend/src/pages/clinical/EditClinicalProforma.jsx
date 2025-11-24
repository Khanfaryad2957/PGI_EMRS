import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  useGetClinicalProformaByIdQuery,
  useUpdateClinicalProformaMutation,
  useGetClinicalOptionsQuery,
  useAddClinicalOptionMutation,
  useDeleteClinicalOptionMutation,
  useGetAllClinicalProformasQuery
} from '../../features/clinical/clinicalApiSlice';
import { useGetADLFileByIdQuery, useGetAllADLFilesQuery,useUpdateADLFileMutation, useCreateADLFileMutation } from '../../features/adl/adlApiSlice';
import { useGetPatientByIdQuery } from '../../features/patients/patientsApiSlice';
import { useGetDoctorsQuery } from '../../features/users/usersApiSlice';
import { useGetPatientFilesQuery, useUpdatePatientFilesMutation, useCreatePatientFilesMutation } from '../../features/patients/patientFilesApiSlice';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { CLINICAL_PROFORMA_FORM, VISIT_TYPES, DOCTOR_DECISION, CASE_SEVERITY } from '../../utils/constants';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import { FiArrowLeft, FiAlertCircle, FiSave, FiHeart, FiActivity, FiUser, FiClipboard, FiList, FiCheckSquare, FiFileText, FiX, FiPlus, FiChevronDown, FiChevronUp, FiLoader, FiCalendar } from 'react-icons/fi';
import icd11Codes from '../../assets/ICD11_Codes.json';
import { useUpdatePrescriptionMutation,useGetAllPrescriptionQuery, useCreatePrescriptionMutation } from '../../features/prescriptions/prescriptionApiSlice';
import PrescriptionEdit from '../PrescribeMedication/PrescriptionEdit';
import EditADL from '../adl/EditADL';
import DatePicker from '../../components/CustomDatePicker';
import { IconInput } from '../../components/IconInput';
import { CheckboxGroup } from '../../components/CheckboxGroup';
import { ICD11CodeSelector } from '../../components/ICD11CodeSelector';
import FileUpload from '../../components/FileUpload';
import FilePreview from '../../components/FilePreview';



const EditClinicalProforma = ({ initialData: propInitialData = null, onUpdate: propOnUpdate = null, onFormDataChange = null }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTab = searchParams.get('returnTab');
  const returnPath = searchParams.get('returnPath');
  const mode = searchParams.get('mode'); // 'create' or 'update' from URL
  // const [updatePrescription, { isLoading: isUpdatingPrescription }] = useUpdatePrescriptionMutation();
  const [createPrescriptions, { isLoading: isSavingPrescriptions }] = useCreatePrescriptionMutation();

  const { data: proformaData, isLoading, isFetching, refetch, error } = useGetAllClinicalProformasQuery({});


  // Use propInitialData if provided, otherwise use fetched data
  // const proforma = propInitialData ? null : (proformaData?.data?.proforma);

  // Convert id to number for comparison since patient_id is a number
  // URL params return strings, but patient_id in database is integer
  const patientIdFromUrl = id ? parseInt(id, 10) : null;
  const proforma = proformaData?.data?.proformas?.find(p => p.patient_id === patientIdFromUrl);
  // console.log(patient_id);
  const isComplexCase = proforma?.doctor_decision === 'complex_case' && proforma?.adl_file_id;

  // Check if the case is already marked as complex (from original data, not form state)
  // This determines if we should disable the doctor_decision dropdown
  const isAlreadyComplex = proforma?.doctor_decision === 'complex_case' || 
                           propInitialData?.doctor_decision === 'complex_case';

  // Determine if this is create or update mode
  // Priority:
  // 1. If mode parameter is explicitly set in URL, use it
  // 2. If propInitialData has an id (embedded in PatientDetailsEdit with existing proforma) → Update
  // 3. If id exists in URL and proforma exists → Update
  // 4. Otherwise → Create
  const isUpdateMode = mode === 'update' ||
    (mode !== 'create' && (
      (propInitialData?.id) || // Embedded mode with existing proforma
      (id && proforma) // Standalone mode with existing proforma
    ));

  // Fetch ADL file data if this is a complex case
  const {
    data: adlFileData,
    isLoading: isLoadingADL
  } = useGetADLFileByIdQuery(
    proforma?.adl_file_id,
    { skip: !isComplexCase }
  );

  // Fetch patient data - use patient_id from propInitialData or proforma
  const patientId = propInitialData?.patient_id || proforma?.patient_id;
  const { data: patientData } = useGetPatientByIdQuery(
    patientId,
    { skip: !patientId }
  );
  const patient = patientData?.data?.patient;

  const { data: existingAdlFileData } = useGetAllADLFilesQuery({});
  console.log("existingAdlFile", existingAdlFileData);

  const existingAdlFile = existingAdlFileData?.data?.files?.find(f => f.patient_id === patient?.id && f.clinical_proforma_id === proforma?.id);
  // const adlFile = adlFileData?.data?.adlFile || adlFileData?.data?.file;
console.log("existingAdlFile", existingAdlFile);
console.log("existingAdlFileData", existingAdlFileData);

  const { data: existingPrescriptionData } = useGetAllPrescriptionQuery({});
  console.log("existingPrescriptionData", existingPrescriptionData);

  const existingPrescription = existingPrescriptionData?.data?.prescriptions?.find(p => p.patient_id === patient?.id && p.clinical_proforma_id === proforma?.id);
  // const prescription = prescriptionData?.data?.prescription;
console.log("existingPrescription", existingPrescription);
console.log("existingPrescriptionData", existingPrescriptionData);
  // Fetch doctors list
  const { data: doctorsData } = useGetDoctorsQuery({ page: 1, limit: 100 });
  const doctors = doctorsData?.data?.doctors || [];

  // Update mutations
  const [updateProforma, { isLoading: isUpdating }] = useUpdateClinicalProformaMutation();
  // const [updateADLFile] = useUpdateADLFileMutation();
  const [createADLFile, { isLoading: isCreatingADLFile }] = useCreateADLFileMutation();
  // Helper functions

  


  const normalizeArrayField = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      // First try to parse as JSON
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
      } catch {
        // If not JSON, check if it's a comma-separated string
        if (value.includes(',')) {
          // Split by comma and trim each item
          return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
        }
        // Single value string
        return value.trim() ? [value.trim()] : [];
      }
    }
    return value ? [value] : [];
  };

  // Prepare initial form data - return default values if proforma not found
  const initialFormData = useMemo(() => {
    // If initialData prop is provided, use it (merge with defaults)
    if (propInitialData) {


      // Helper to get value, preserving null/undefined but defaulting empty strings
      const getValue = (val, fallback = '') => {
        if (val === null || val === undefined) return fallback;
        if (typeof val === 'string' && val.trim() === '') return fallback;
        return val;
      };

      // Helper to format date
      const formatDate = (dateVal) => {
        if (!dateVal) return new Date().toISOString().split('T')[0];
        if (typeof dateVal === 'string') {
          // If it's already in YYYY-MM-DD format, return as-is
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) return dateVal;
          // If it's a full ISO string, extract date part
          if (dateVal.includes('T')) return dateVal.split('T')[0];
          return dateVal;
        }
        return new Date().toISOString().split('T')[0];
      };

      return {
        patient_id: getValue(propInitialData.patient_id),
        visit_date: formatDate(propInitialData.visit_date),
        visit_type: getValue(propInitialData.visit_type, 'first_visit'),
        room_no: getValue(propInitialData.room_no),
        assigned_doctor: getValue(propInitialData.assigned_doctor),
        informant_present: propInitialData.informant_present ?? true,
        nature_of_information: getValue(propInitialData.nature_of_information),
        onset_duration: getValue(propInitialData.onset_duration),
        course: getValue(propInitialData.course),
        precipitating_factor: getValue(propInitialData.precipitating_factor),
        illness_duration: getValue(propInitialData.illness_duration),
        current_episode_since: formatDate(propInitialData.current_episode_since),
        mood: normalizeArrayField(propInitialData.mood),
        behaviour: normalizeArrayField(propInitialData.behaviour),
        speech: normalizeArrayField(propInitialData.speech),
        thought: normalizeArrayField(propInitialData.thought),
        perception: normalizeArrayField(propInitialData.perception),
        somatic: normalizeArrayField(propInitialData.somatic),
        bio_functions: normalizeArrayField(propInitialData.bio_functions),
        adjustment: normalizeArrayField(propInitialData.adjustment),
        cognitive_function: normalizeArrayField(propInitialData.cognitive_function),
        fits: normalizeArrayField(propInitialData.fits),
        sexual_problem: normalizeArrayField(propInitialData.sexual_problem),
        substance_use: normalizeArrayField(propInitialData.substance_use),
        past_history: getValue(propInitialData.past_history),
        family_history: getValue(propInitialData.family_history),
        associated_medical_surgical: normalizeArrayField(propInitialData.associated_medical_surgical),
        mse_behaviour: normalizeArrayField(propInitialData.mse_behaviour),
        mse_affect: normalizeArrayField(propInitialData.mse_affect),
        mse_thought: getValue(propInitialData.mse_thought),
        mse_delusions: getValue(propInitialData.mse_delusions),
        mse_perception: normalizeArrayField(propInitialData.mse_perception),
        mse_cognitive_function: normalizeArrayField(propInitialData.mse_cognitive_function),
        gpe: getValue(propInitialData.gpe),
        diagnosis: getValue(propInitialData.diagnosis),
        icd_code: getValue(propInitialData.icd_code),
        disposal: getValue(propInitialData.disposal),
        workup_appointment: formatDate(propInitialData.workup_appointment),
        referred_to: getValue(propInitialData.referred_to),
        treatment_prescribed: getValue(propInitialData.treatment_prescribed),
        doctor_decision: getValue(propInitialData.doctor_decision, 'simple_case'),
        // case_severity: getValue(propInitialData.case_severity),
        requires_adl_file: propInitialData.requires_adl_file ?? false,
        adl_reasoning: getValue(propInitialData.adl_reasoning),
      };
    }

    // If no proforma, return default empty form data
    if (!proforma) {
      return {
        patient_id: '',
        visit_date: new Date().toISOString().split('T')[0],
        visit_type: 'first_visit',
        room_no: '',
        assigned_doctor: '',
        informant_present: true,
        nature_of_information: '',
        onset_duration: '',
        course: '',
        precipitating_factor: '',
        illness_duration: '',
        current_episode_since: '',
        mood: [],
        behaviour: [],
        speech: [],
        thought: [],
        perception: [],
        somatic: [],
        bio_functions: [],
        adjustment: [],
        cognitive_function: [],
        fits: [],
        sexual_problem: [],
        substance_use: [],
        past_history: '',
        family_history: '',
        associated_medical_surgical: [],
        mse_behaviour: [],
        mse_affect: [],
        mse_thought: '',
        mse_delusions: '',
        mse_perception: [],
        mse_cognitive_function: [],
        gpe: '',
        diagnosis: '',
        icd_code: '',
        disposal: '',
        workup_appointment: '',
        referred_to: '',
        treatment_prescribed: '',
        doctor_decision: 'simple_case',
        // case_severity: '',
      };
    }

    const baseData = {
      patient_id: proforma.patient_id?.toString() || '',
      visit_date: proforma.visit_date || new Date().toISOString().split('T')[0],
      visit_type: proforma.visit_type || 'first_visit',
      room_no: proforma.room_no || '',
      assigned_doctor: proforma.assigned_doctor?.toString() || '',
      informant_present: proforma.informant_present ?? true,
      nature_of_information: proforma.nature_of_information || '',
      onset_duration: proforma.onset_duration || '',
      course: proforma.course || '',
      precipitating_factor: proforma.precipitating_factor || '',
      illness_duration: proforma.illness_duration || '',
      current_episode_since: proforma.current_episode_since || '',
      mood: normalizeArrayField(proforma.mood),
      behaviour: normalizeArrayField(proforma.behaviour),
      speech: normalizeArrayField(proforma.speech),
      thought: normalizeArrayField(proforma.thought),
      perception: normalizeArrayField(proforma.perception),
      somatic: normalizeArrayField(proforma.somatic),
      bio_functions: normalizeArrayField(proforma.bio_functions),
      adjustment: normalizeArrayField(proforma.adjustment),
      cognitive_function: normalizeArrayField(proforma.cognitive_function),
      fits: normalizeArrayField(proforma.fits),
      sexual_problem: normalizeArrayField(proforma.sexual_problem),
      substance_use: normalizeArrayField(proforma.substance_use),
      past_history: proforma.past_history || '',
      family_history: proforma.family_history || '',
      associated_medical_surgical: normalizeArrayField(proforma.associated_medical_surgical),
      mse_behaviour: normalizeArrayField(proforma.mse_behaviour),
      mse_affect: normalizeArrayField(proforma.mse_affect),
      mse_thought: proforma.mse_thought || '',
      mse_delusions: proforma.mse_delusions || '',
      mse_perception: normalizeArrayField(proforma.mse_perception),
      mse_cognitive_function: normalizeArrayField(proforma.mse_cognitive_function),
      gpe: proforma.gpe || '',
      diagnosis: proforma.diagnosis || '',
      icd_code: proforma.icd_code || '',
      disposal: proforma.disposal || '',
      workup_appointment: proforma.workup_appointment || '',
      referred_to: proforma.referred_to || '',
      treatment_prescribed: proforma.treatment_prescribed || '',
      doctor_decision: proforma.doctor_decision || 'simple_case',
      // case_severity: proforma.case_severity || '',
    };

    return baseData;
  }, [proforma, propInitialData]);

  // Initialize with default empty values if initialFormData is not ready
  const defaultFormData = {
    patient_id: '',
    visit_date: new Date().toISOString().split('T')[0],
    visit_type: 'first_visit',
    room_no: '',
    assigned_doctor: '',
    informant_present: true,
    nature_of_information: '',
    onset_duration: '',
    course: '',
    precipitating_factor: '',
    illness_duration: '',
    current_episode_since: '',
    mood: [],
    behaviour: [],
    speech: [],
    thought: [],
    perception: [],
    somatic: [],
    bio_functions: [],
    adjustment: [],
    cognitive_function: [],
    fits: [],
    sexual_problem: [],
    substance_use: [],
    past_history: '',
    family_history: '',
    associated_medical_surgical: [],
    mse_behaviour: [],
    mse_affect: [],
    mse_thought: '',
    mse_delusions: '',
    mse_perception: [],
    mse_cognitive_function: [],
    gpe: '',
    diagnosis: '',
    icd_code: '',
    disposal: '',
    workup_appointment: '',
    referred_to: '',
    treatment_prescribed: '',
    doctor_decision: 'simple_case',
    // case_severity: '',
  };

  const [formData, setFormData] = useState(initialFormData || defaultFormData);
  const [errors, setErrors] = useState({});
  const currentUser = useSelector(selectCurrentUser);

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

  // Card expand/collapse state
  const [expandedCards, setExpandedCards] = useState({
    clinicalProforma: true, // Default to expanded
    adlfile: true,
    prescription: true,
  });

  const toggleCard = (cardName) => {
    setExpandedCards(prev => ({ ...prev, [cardName]: !prev[cardName] }));
  };

  // Track previous initialFormData to avoid unnecessary updates
  const prevInitialDataRef = useRef(null);

  // Update formData when initialFormData changes (only on mount or when initialData actually changes)
  useEffect(() => {
    if (initialFormData) {
      const prevData = prevInitialDataRef.current;
      // Always update if:
      // 1. No previous data exists, OR
      // 2. Patient ID changed (different patient), OR
      // 3. Using propInitialData and it has an ID that changed (different proforma), OR
      // 4. Key fields have changed (doctor_decision, diagnosis, etc.)
      const proformaIdChanged = propInitialData?.id && prevData?.proformaId !== propInitialData.id;
      const patientIdChanged = prevData?.patient_id !== initialFormData.patient_id;
      const keyFieldsChanged = prevData?.doctor_decision !== initialFormData.doctor_decision ||
        prevData?.diagnosis !== initialFormData.diagnosis ||
        prevData?.visit_date !== initialFormData.visit_date;

      // More aggressive update logic: update if propInitialData exists and has changed
      const propDataChanged = propInitialData && (
        !prevData?.proformaId ||
        prevData.proformaId !== propInitialData.id ||
        !prevData.proformaId && propInitialData.id
      );

      const shouldUpdate = !prevData ||
        patientIdChanged ||
        proformaIdChanged ||
        propDataChanged ||
        (keyFieldsChanged && prevData.patient_id === initialFormData.patient_id);

      if (shouldUpdate) {

        setFormData(initialFormData);
        // Notify parent of initial form data (defer to avoid setState during render)
        if (onFormDataChange) {
          // Use setTimeout to defer the call until after render
          setTimeout(() => {
            onFormDataChange(initialFormData);
          }, 0);
        }
        prevInitialDataRef.current = {
          ...initialFormData,
          proformaId: propInitialData?.id || null
        };
      } else {

      }
    }
  }, [initialFormData, onFormDataChange, propInitialData?.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: newValue,
      };
      // Notify parent component of form data changes, especially doctor_decision
      // Defer to avoid setState during render warning
      if (onFormDataChange) {
        setTimeout(() => {
          onFormDataChange(updated);
        }, 0);
      }
      return updated;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };


  const handleSubmitClinicalProforma = async (e) => {
    
    e.preventDefault();

    // Prevent changing from complex case to simple case
    if (isAlreadyComplex && formData.doctor_decision !== 'complex_case') {
      toast.error('Cannot change from Complex Case to Simple Case. The case must remain complex.');
      setFormData(prev => ({ ...prev, doctor_decision: 'complex_case' }));
      return;
    }

    const newErrors = {};
    if (!formData.patient_id) newErrors.patient_id = 'Patient is required';
    if (!formData.visit_date) newErrors.visit_date = 'Visit date is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const join = (arr) => Array.isArray(arr) ? arr.join(", ") : arr;

      // CASE 1: Using parent-provided update through props  
      if (propInitialData && propOnUpdate) {
        const updateData = {
          patient_id: formData.patient_id,
          visit_date: formData.visit_date,
          visit_type: formData.visit_type,
          room_no: formData.room_no,
          assigned_doctor: formData.assigned_doctor,
          informant_present: formData.informant_present,
          nature_of_information: formData.nature_of_information,
          onset_duration: formData.onset_duration,
          course: formData.course,
          precipitating_factor: formData.precipitating_factor,
          illness_duration: formData.illness_duration,
          current_episode_since: formData.current_episode_since,
          mood: join(formData.mood),
          behaviour: join(formData.behaviour),
          speech: join(formData.speech),
          thought: join(formData.thought),
          perception: join(formData.perception),
          somatic: join(formData.somatic),
          bio_functions: join(formData.bio_functions),
          adjustment: join(formData.adjustment),
          cognitive_function: join(formData.cognitive_function),
          fits: join(formData.fits),
          sexual_problem: join(formData.sexual_problem),
          substance_use: join(formData.substance_use),
          past_history: formData.past_history,
          family_history: formData.family_history,
          associated_medical_surgical: join(formData.associated_medical_surgical),
          mse_behaviour: join(formData.mse_behaviour),
          mse_affect: join(formData.mse_affect),
          mse_thought: formData.mse_thought,
          mse_delusions: formData.mse_delusions,
          mse_perception: join(formData.mse_perception),
          mse_cognitive_function: join(formData.mse_cognitive_function),
          gpe: formData.gpe,
          diagnosis: formData.diagnosis,
          icd_code: formData.icd_code,
          disposal: formData.disposal,
          workup_appointment: formData.workup_appointment,
          referred_to: formData.referred_to,
          treatment_prescribed: formData.treatment_prescribed,
          doctor_decision: formData.doctor_decision,
          // case_severity: formData.case_severity,
        };

        try {
          await propOnUpdate(updateData);
          toast.success("Clinical proforma updated successfully!");
        } catch (err) {
          toast.error(err?.data?.message || "Failed to update proforma");
        }

        return;
      }

      // CASE 2: Editing an existing proforma  
      if (!proforma.id || !id) {
        toast.error("Cannot update: Clinical proforma not found. Please create a new one first.");
        return;
      }

      const updateData = {
        id: proforma.id,
        patient_id: formData.patient_id,
        visit_date: formData.visit_date,
        visit_type: formData.visit_type,
        room_no: formData.room_no,
        assigned_doctor: formData.assigned_doctor,
        informant_present: formData.informant_present,
        nature_of_information: formData.nature_of_information,
        onset_duration: formData.onset_duration,
        course: formData.course,
        precipitating_factor: formData.precipitating_factor,
        illness_duration: formData.illness_duration,
        current_episode_since: formData.current_episode_since,
        mood: join(formData.mood),
        behaviour: join(formData.behaviour),
        speech: join(formData.speech),
        thought: join(formData.thought),
        perception: join(formData.perception),
        somatic: join(formData.somatic),
        bio_functions: join(formData.bio_functions),
        adjustment: join(formData.adjustment),
        cognitive_function: join(formData.cognitive_function),
        fits: join(formData.fits),
        sexual_problem: join(formData.sexual_problem),
        substance_use: join(formData.substance_use),
        past_history: formData.past_history,
        family_history: formData.family_history,
        associated_medical_surgical: join(formData.associated_medical_surgical),
        mse_behaviour: join(formData.mse_behaviour),
        mse_affect: join(formData.mse_affect),
        mse_thought: formData.mse_thought,
        mse_delusions: formData.mse_delusions,
        mse_perception: join(formData.mse_perception),
        mse_cognitive_function: join(formData.mse_cognitive_function),
        gpe: formData.gpe,
        diagnosis: formData.diagnosis,
        icd_code: formData.icd_code,
        disposal: formData.disposal,
        workup_appointment: formData.workup_appointment,
        referred_to: formData.referred_to,
        treatment_prescribed: formData.treatment_prescribed,
        doctor_decision: formData.doctor_decision,
        // case_severity: formData.case_severity,
      };

      // ==============================
      // TRY–CATCH #1: Update Proforma
      // ==============================
      try {
        await updateProforma(updateData).unwrap();
        toast.success("Clinical proforma updated successfully!");
      } catch (err) {
        toast.error(err?.data?.message || "Failed to update clinical proforma");
        return; // Stop further API calls
      }

      // ==============================
      // TRY–CATCH #2: Handle File Uploads/Updates
      // ==============================
      if (patientId && ((selectedFiles && selectedFiles.length > 0) || (filesToRemove && filesToRemove.length > 0))) {
        try {
          // Check if patient files record exists
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
            // Create new record
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
          toast.error(fileErr?.data?.message || 'Failed to update files. Proforma was saved successfully.');
        }
      }

      // ============================================
      // TRY–CATCH #3: Create ADL if complex decision
      // ============================================
      // if (formData.doctor_decision === "complex_case") {
      //   try {
      //     await createADLFile({
      //       patient_id: patient.id,
      //       clinical_proforma_id: proforma.id,
      //     }).unwrap();
      //     toast.success("ADL file created");
      //   } catch (err) {
      //     toast.error(err?.data?.message || "Failed to create ADL file");
      //   }
      // }


      if (formData.doctor_decision === "complex_case") {

        // Only call API if ADL does NOT exist
        if (!existingAdlFile && patient.id && proforma.id) {
          try {
            await createADLFile({
              patient_id: patient.id,
              clinical_proforma_id: proforma.id,
            }).unwrap();
      
            toast.success("ADL file created");
          } catch (err) {
            toast.error(err?.data?.message || "Failed to create ADL file");
          }
        }
      }
      

      // ======================================
      // TRY–CATCH #4: Create Bulk Prescriptions
      // ======================================
      if (!existingPrescription && patient.id && proforma.id) {
        try {
          await createPrescriptions({
            patient_id: patient.id,
            clinical_proforma_id: proforma.id,
          }).unwrap();
          toast.success("Prescriptions updated");
        } catch (err) {
          toast.error(err?.data?.message || "Failed to create prescriptions");
        }
      }

    } catch (err) {
      toast.error("Unexpected error occurred");
    }
  };


  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!validate()) {
  //     toast.error('Please fix the errors in the form');
  //     return;
  //   }

  //   try {

  //     // Format prescriptions: filter out empty rows and create formatted text
  //     const validPrescriptions = prescriptions.filter(p =>
  //       p.medicine || p.dosage || p.frequency || p.details || p.when || p.duration || p.qty || p.notes
  //     );

  //     // Create prescription text from valid prescriptions
  //     const prescriptionText = validPrescriptions.length > 0
  //       ? validPrescriptions
  //         ?.map((p, idx) =>
  //           `${idx + 1}. ${p.medicine || ''} | ${p.dosage || ''} | ${p.when || ''} | ${p.frequency || ''} | ${p.duration || ''} | ${p.qty || ''} | ${p.details || ''} | ${p.notes || ''}`
  //         )
  //         .join('\n')
  //       : (formData.treatment_prescribed || '');

  //     // Prepare final data with all fields including prescription
  //     const finalData = prepareFormData(3); // Get all data from step 3 (most complete)
  //     const submitData = {
  //       ...finalData,
  //       treatment_prescribed: prescriptionText,
  //       prescriptions: validPrescriptions, // Include structured prescription data
  //     };

  //     // If onUpdate callback is provided (edit mode), use it instead of create
  //     if (onUpdate && proformaId) {
  //       await onUpdate({ id: proformaId, ...submitData });
  //       return;
  //     }

  //     // Create new proforma (this shouldn't happen if step-wise saving works, but handle it as fallback)
  //     const result = await createProforma(submitData).unwrap();

  //     // Clear saved prescription from localStorage after successful submission
  //     try {
  //       const storedPrescriptions = JSON.parse(localStorage.getItem('patient_prescriptions') || '{}');
  //       if (storedPrescriptions[formData.patient_id]) {
  //         delete storedPrescriptions[formData.patient_id];
  //         localStorage.setItem('patient_prescriptions', JSON.stringify(storedPrescriptions));
  //       }
  //     } catch (e) {
  //       // Ignore localStorage errors
  //     }

  //     toast.success('Clinical proforma created successfully!');

  //     // Handle ADL file creation in final submit
  //     const proforma = result.data?.proforma || result.data?.clinical;
  //     // Backend returns: { success: true, data: { adlFile: ... } }
  //     const adlFile = result.data?.adlFile || result.data?.adl_file || result.data?.adl;
  //     if (adlFile && (adlFile.adl_no || adlFile.created)) {
  //       toast.info(`ADL File created: ${adlFile.adl_no || 'ADL-XXXXXX'}`);
  //     }

  //     // Navigate to proforma details, or back to Today Patients if returnTab exists
  //     if (returnTab) {
  //       navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
  //     } else {
  //       navigate(`/clinical/${proforma?.id || savedProformaId}`);
  //     }
  //   } catch (err) {
  //     toast.error(err?.data?.message || 'Failed to save clinical proforma');
  //   }
  // };




  // Loading state - only show if fetching by ID (not when using initialData prop)
  if (!propInitialData && (isLoadingProforma || (isComplexCase && isLoadingADL))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state - only show if fetching by ID (not when using initialData prop)
  if (!propInitialData && isErrorProforma) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-12">
            <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Walk-in Clinical Proforma</h2>
            <p className="text-gray-600 mb-6">
              {proformaError?.data?.message || 'Failed to load clinical proforma data'}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate(-1)}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 px-4 py-2 rounded-md flex items-center gap-2 transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:shadow-green-500/40"
              >
                <FiArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 px-4 py-2 rounded-md flex items-center gap-2 transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:shadow-green-500/40"
              >
                Retry
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Always show form, even if proforma not found - allow editing/creating
  // initialFormData will always have default values now

  // Default options for checkbox groups
  const defaultOptions = {
    mood: ['Anxious', 'Sad', 'Cheerful', 'Agitated', 'Fearful', 'Irritable'],
    behaviour: ['Suspiciousness', 'Talking/Smiling to self', 'Hallucinatory behaviour', 'Increased goal-directed activity', 'Compulsions', 'Apathy', 'Anhedonia', 'Avolution', 'Stupor', 'Posturing', 'Stereotypy', 'Ambitendency', 'Disinhibition', 'Impulsivity', 'Anger outbursts', 'Suicide/self-harm attempts'],
    speech: ['Irrelevant', 'Incoherent', 'Pressure', 'Alogia', 'Mutism'],
    thought: ['Reference', 'Persecution', 'Grandiose', 'Love Infidelity', 'Bizarre', 'Pessimism', 'Worthlessness', 'Guilt', 'Poverty', 'Nihilism', 'Hypochondriasis', 'Wish to die', 'Active suicidal ideation', 'Plans', 'Worries', 'Obsessions', 'Phobias', 'Panic attacks'],
    perception: ['Hallucination - Auditory', 'Hallucination - Visual', 'Hallucination - Tactile', 'Hallucination - Olfactory', 'Passivity', 'Depersonalization', 'Derealization'],
    somatic: ['Pains', 'Numbness', 'Weakness', 'Fatigue', 'Tremors', 'Palpitations', 'Dyspnoea', 'Dizziness'],
    bio_functions: ['Sleep', 'Appetite', 'Bowel/Bladder', 'Self-care'],
    adjustment: ['Work output', 'Socialization'],
    cognitive_function: ['Disorientation', 'Inattention', 'Impaired Memory', 'Intelligence'],
    fits: ['Epileptic', 'Dissociative', 'Mixed', 'Not clear'],
    sexual_problem: ['Dhat', 'Poor erection', 'Early ejaculation', 'Decreased desire', 'Perversion', 'Homosexuality', 'Gender dysphoria'],
    substance_use: ['Alcohol', 'Opioid', 'Cannabis', 'Benzodiazepines', 'Tobacco'],
    associated_medical_surgical: ['Hypertension', 'Diabetes', 'Dyslipidemia', 'Thyroid dysfunction'],
    mse_behaviour: ['Uncooperative', 'Unkempt', 'Fearful', 'Odd', 'Suspicious', 'Retarded', 'Excited', 'Aggressive', 'Apathetic', 'Catatonic', 'Demonstrative'],
    mse_affect: ['Sad', 'Anxious', 'Elated', 'Inappropriate', 'Blunted', 'Labile'],
    mse_perception: ['Hallucinations - Auditory', 'Hallucinations - Visual', 'Hallucinations - Tactile', 'Hallucinations - Olfactory', 'Illusions', 'Depersonalization', 'Derealization'],
    mse_cognitive_function: ['Impaired', 'Not impaired'],
  };

  // Determine if this is embedded (has initialData prop) or standalone page
  const isEmbedded = !!propInitialData;

  const formContent = (
    <>
      <form onSubmit={handleSubmitClinicalProforma}>
        <Card className={isEmbedded ? "shadow-lg border-0 bg-white" : "mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"}>
          {/* Collapsible Header */}
          <div
            className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => toggleCard('clinicalProforma')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiClipboard className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900"> Walk-in Clinical Proforma</h3>
                {patient && (
                  <p className="text-sm text-gray-500 mt-1">
                    {patient.name || 'N/A'} - {patient.cr_no || 'N/A'}
                  </p>
                )}
              </div>
            </div>
            {expandedCards.clinicalProforma ? (
              <FiChevronUp className="h-6 w-6 text-gray-500 " />
            ) : (
              <FiChevronDown className="h-6 w-6 text-gray-500" />
            )}
          </div>

          {expandedCards.clinicalProforma && (
            <div className="p-6 space-y-6">
              {/* {!isEmbedded && <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Walk-in Clinical Proforma</h1>} */}

              {/* Basic Information Section */}
              <div className="space-y-4">
                {/* <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h2> */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">


                  <DatePicker

                    label="Date"
                    name="date"
                    value={formData.date || ''}
                    onChange={handleChange}
                    defaultToday={true}
                  />
                  <Input
                    label="Patient Name"
                    value={patient.name || ''}
                    onChange={handleChange}

                  />

                  <Input
                    label="Age"
                    value={patient.age || ''}
                    onChange={handleChange}

                  />
                  <Input
                    label="Sex"
                    value={patient.sex || ''}
                    onChange={handleChange}

                  />
                </div>


              </div>

              {/* Informant Section */}

              <div className="space-y-4">

                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Informant</h2>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    {[
                      { v: true, t: 'Present' },
                      { v: false, t: 'Absent' },
                    ].map(({ v, t }) => (
                      <label key={t} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${formData.informant_present === v ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}>
                        <input
                          type="radio"
                          name="informant_present"
                          checked={formData.informant_present === v}
                          onChange={() => handleChange({ target: { name: 'informant_present', value: v } })}
                          className="h-4 w-4 text-primary-600"
                        />
                        <span className="font-medium">{t}</span>
                      </label>
                    ))}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Nature of information</h2>
                  <div className="flex flex-wrap gap-3">
                    {['Reliable', 'Unreliable', 'Adequate', 'Inadequate'].map((opt) => (
                      <label key={opt} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${formData.nature_of_information === opt ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}>
                        <input
                          type="radio"
                          name="nature_of_information"
                          value={opt}
                          checked={formData.nature_of_information === opt}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary-600"
                        />
                        <span className="font-medium">{opt}</span>
                      </label>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Onset Duration</h2>
                      <div className="flex flex-wrap gap-3">
                        {[{ v: '<1_week', t: '1. < 1 week' }, { v: '1w_1m', t: '2. 1 week – 1 month' }, { v: '>1_month', t: '3. > 1 month' }, { v: 'not_known', t: '4. Not known' }].map(({ v, t }) => (
                          <label key={v} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${formData.onset_duration === v ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-white hover:bg-gray-50'
                            }`}>
                            <input
                              type="radio"
                              name="onset_duration"
                              value={v}
                              checked={formData.onset_duration === v}
                              onChange={handleChange}
                              className="h-4 w-4 text-primary-600"
                            />
                            <span className="font-medium">{t}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Course</h2>
                      <div className="flex flex-wrap gap-3">
                        {['Continuous', 'Episodic', 'Fluctuating', 'Deteriorating', 'Improving'].map((opt) => (
                          <label key={opt} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${formData.course === opt ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-white hover:bg-gray-50'
                            }`}>
                            <input
                              type="radio"
                              name="course"
                              value={opt}
                              checked={formData.course === opt}
                              onChange={handleChange}
                              className="h-4 w-4 text-primary-600"
                            />
                            <span className="font-medium">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Textarea
                    label="Precipitating Factor"
                    name="precipitating_factor"
                    value={formData.precipitating_factor}
                    onChange={handleChange}
                    rows={3}
                  />
                  <Input
                    label="Total Duration of Illness"
                    name="illness_duration"
                    value={formData.illness_duration}
                    onChange={handleChange}
                  />
                  <Input
                    label="Current Episode Duration / Worsening Since"
                    name="current_episode_since"
                    value={formData.current_episode_since}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Complaints / History of Presenting Illness */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Complaints / History of Presenting Illness</h2>
                <div className="space-y-6">
                  <CheckboxGroup label="Mood" name="mood" value={formData.mood || []} onChange={handleChange} options={defaultOptions.mood} />
                  <CheckboxGroup label="Behaviour" name="behaviour" value={formData.behaviour || []} onChange={handleChange} options={defaultOptions.behaviour} />
                  <CheckboxGroup label="Speech" name="speech" value={formData.speech || []} onChange={handleChange} options={defaultOptions.speech} />
                  <CheckboxGroup label="Thought" name="thought" value={formData.thought || []} onChange={handleChange} options={defaultOptions.thought} />
                  <CheckboxGroup label="Perception" name="perception" value={formData.perception || []} onChange={handleChange} options={defaultOptions.perception} />
                  <CheckboxGroup label="Somatic" name="somatic" value={formData.somatic || []} onChange={handleChange} options={defaultOptions.somatic} />
                  <CheckboxGroup label="Bio-functions" name="bio_functions" value={formData.bio_functions || []} onChange={handleChange} options={defaultOptions.bio_functions} />
                  <CheckboxGroup label="Adjustment" name="adjustment" value={formData.adjustment || []} onChange={handleChange} options={defaultOptions.adjustment} />
                  <CheckboxGroup label="Cognitive Function" name="cognitive_function" value={formData.cognitive_function || []} onChange={handleChange} options={defaultOptions.cognitive_function} />
                  <CheckboxGroup label="Fits" name="fits" value={formData.fits || []} onChange={handleChange} options={defaultOptions.fits} />
                  <CheckboxGroup label="Sexual Problem" name="sexual_problem" value={formData.sexual_problem || []} onChange={handleChange} options={defaultOptions.sexual_problem} />
                  <CheckboxGroup label="Substance Use" name="substance_use" value={formData.substance_use || []} onChange={handleChange} options={defaultOptions.substance_use} />
                </div>
              </div>

              {/* Additional History */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Additional History</h2>
                <div className="space-y-4">
                  <Textarea
                    label="Past Psychiatric History"
                    name="past_history"
                    value={formData.past_history}
                    onChange={handleChange}
                    rows={4}
                  />
                  <Textarea
                    label="Family History"
                    name="family_history"
                    value={formData.family_history}
                    onChange={handleChange}
                    rows={4}
                  />
                  <CheckboxGroup
                    label="Associated Medical/Surgical Illness"
                    name="associated_medical_surgical"
                    value={formData.associated_medical_surgical || []}
                    onChange={handleChange}
                    options={defaultOptions.associated_medical_surgical}
                  />
                </div>
              </div>

              {/* Mental State Examination (MSE) */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Mental State Examination (MSE)</h2>
                <div className="space-y-6">
                  <CheckboxGroup label="Behaviour" name="mse_behaviour" value={formData.mse_behaviour || []} onChange={handleChange} options={defaultOptions.mse_behaviour} />
                  <CheckboxGroup label="Affect & Mood" name="mse_affect" value={formData.mse_affect || []} onChange={handleChange} options={defaultOptions.mse_affect} />
                  <CheckboxGroup
                    label="Thought (Flow, Form, Content)"
                    name="mse_thought"
                    value={formData.mse_thought || []}
                    onChange={handleChange}
                    options={[]}
                    rightInlineExtra={
                      <Input
                        name="mse_delusions"
                        value={formData.mse_delusions}
                        onChange={handleChange}
                        placeholder="Delusions / Ideas of (optional)"
                        className="max-w-xs"
                      />
                    }
                  />
                  <CheckboxGroup label="Perception" name="mse_perception" value={formData.mse_perception || []} onChange={handleChange} options={defaultOptions.mse_perception} />
                  <CheckboxGroup label="Cognitive Functions" name="mse_cognitive_function" value={formData.mse_cognitive_function || []} onChange={handleChange} options={defaultOptions.mse_cognitive_function} />
                </div>
              </div>

              {/* General Physical Examination */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">General Physical Examination</h2>
                <div className="space-y-4">
                  <Textarea
                    label="GPE Findings"
                    name="gpe"
                    value={formData.gpe}
                    onChange={handleChange}
                    rows={4}
                    placeholder="BP, Pulse, Weight, BMI, General appearance, Systemic examination..."
                  />
                </div>
              </div>

              {/* Diagnosis & Management */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Diagnosis & Management</h2>
                <div className="space-y-4">
                  <Textarea
                    label="Diagnosis"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Primary and secondary diagnoses..."
                  />
                  <ICD11CodeSelector
                    value={formData.icd_code}
                    onChange={handleChange}
                    error={errors.icd_code}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* <Select
                      label="Case Severity"
                      name="case_severity"
                      value={formData.case_severity}
                      onChange={handleChange}
                      options={CASE_SEVERITY}
                    /> */}
                
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Textarea
                    label="Disposal & Referral"
                    name="disposal"
                    value={formData.disposal}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Admission, discharge, follow-up..."
                  />
                  {/* <Input
                  label="Workup Appointment"
                  type="date"
                  name="workup_appointment"
                  value={formData.workup_appointment}
                  onChange={handleChange}
                /> */}


                  <DatePicker
                    icon={<FiCalendar className="w-4 h-4" />}
                    label="Workup Appointment"
                    name="workup_appointment"
                    value={formData.workup_appointment}
                    onChange={handleChange}
                    defaultToday={true}
                  />
                  <Textarea
                    label="Referred To"
                    name="referred_to"
                    value={formData.referred_to}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Other departments or specialists..."
                  />
                  <Textarea
                    label="Treatment Prescribed"
                    name="treatment_prescribed"
                    value={formData.treatment_prescribed}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Treatment details..."
                  />

<div>
                      <Select
                        label="Doctor Decision"
                        name="doctor_decision"
                        value={formData.doctor_decision}
                        onChange={handleChange}
                        options={DOCTOR_DECISION}
                        required
                        disabled={isAlreadyComplex}
                        title={isAlreadyComplex ? "Cannot change from Complex Case to Simple Case" : ""}
                      />
                      {isAlreadyComplex && (
                        <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                          <FiAlertCircle className="w-3 h-3" />
                          This case is already marked as Complex and cannot be changed back to Simple.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Documents & Files Section */}
              {patientId && (
                <div className="space-y-6 pt-6 border-t border-gray-200">
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
                      disabled={!patientId}
                    />
                  </div>

                  {/* Existing Files Preview */}
                  {existingFiles && existingFiles.length > 0 && (
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
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 px-4 py-2 rounded-md transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:shadow-green-500/40"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isUpdating || isUploadingFiles}
                  disabled={isUpdating || isUploadingFiles}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30"
                >
                  <FiSave className="w-4 h-4" />
                  {isUpdating || isUploadingFiles
                    ? 'Updating...'
                    : isUpdateMode
                      ? 'Update Walk-in Clinical Proforma'
                      : 'Create Walk-in Clinical Proforma'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </form>
    </>
  );

  // If embedded, return just the form without full page wrapper
  if (isEmbedded) {
    return formContent;
  }

  // If standalone, return with full page wrapper
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-teal-50">
      <div className="w-full px-6 py-8 space-y-8">
        {formContent}
      </div>
    </div>
  );
};

export default EditClinicalProforma;
