import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCreateClinicalProformaMutation, useUpdateClinicalProformaMutation, useGetAllClinicalProformasQuery, useGetClinicalProformaByIdQuery } from '../../features/clinical/clinicalApiSlice';
import { useGetADLFileByIdQuery, useUpdateADLFileMutation, useCreateADLFileMutation } from '../../features/adl/adlApiSlice';
import { useGetPrescriptionsByProformaIdQuery } from '../../features/prescriptions/prescriptionApiSlice';
import { useSearchPatientsQuery, useGetPatientByIdQuery } from '../../features/patients/patientsApiSlice';
import { useGetDoctorsQuery } from '../../features/users/usersApiSlice';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import DatePicker from '../../components/CustomDatePicker';
import { FiEdit3, FiClipboard, FiCheckSquare, FiList, FiActivity, FiHeart, FiUser, FiFileText, FiPlus, FiX, FiSave, FiClock, FiChevronDown, FiChevronUp, FiArrowRight, FiArrowLeft, FiCheck, FiTrash2, FiFolder } from 'react-icons/fi';
import { VISIT_TYPES, CASE_SEVERITY, DOCTOR_DECISION, isJR, isSR } from '../../utils/constants';
import { useGetClinicalOptionsQuery, useAddClinicalOptionMutation, useDeleteClinicalOptionMutation } from '../../features/clinical/clinicalApiSlice';
import icd11Codes from '../../assets/ICD11_Codes.json';
import CreatePrescription from '../PrescribeMedication/CreatePrescription';
import CreateADL from '../adl/CreateADL';
import EditADL from '../adl/EditADL';

// Reusable checkbox group with inline add-input and toggle Add/Save button
const CheckboxGroup = ({ label, name, value = [], onChange, options = [], rightInlineExtra = null }) => {
  const [localOptions, setLocalOptions] = useState(options);
  const [showAdd, setShowAdd] = useState(false);
  const [customOption, setCustomOption] = useState('');
  const { data: remoteOptions } = useGetClinicalOptionsQuery(name);
  const [addOption] = useAddClinicalOptionMutation();
  const [deleteOption] = useDeleteClinicalOptionMutation();

  const iconByGroup = {
    mood: <FiHeart className="w-6 h-6 text-rose-600" />,
    behaviour: <FiActivity className="w-6 h-6 text-violet-600" />,
    speech: <FiUser className="w-6 h-6 text-sky-600" />,
    thought: <FiClipboard className="w-6 h-6 text-indigo-600" />,
    perception: <FiList className="w-6 h-6 text-cyan-600" />,
    somatic: <FiActivity className="w-6 h-6 text-emerald-600" />,
    bio_functions: <FiCheckSquare className="w-6 h-6 text-emerald-600" />,
    adjustment: <FiList className="w-6 h-6 text-amber-600" />,
    cognitive_function: <FiActivity className="w-6 h-6 text-fuchsia-600" />,
    fits: <FiActivity className="w-6 h-6 text-red-600" />,
    sexual_problem: <FiHeart className="w-6 h-6 text-pink-600" />,
    substance_use: <FiList className="w-6 h-6 text-teal-600" />,
    associated_medical_surgical: <FiFileText className="w-6 h-6 text-indigo-600" />,
    mse_behaviour: <FiActivity className="w-6 h-6 text-violet-600" />,
    mse_affect: <FiHeart className="w-6 h-6 text-rose-600" />,
    mse_thought: <FiClipboard className="w-6 h-6 text-indigo-600" />,
    mse_perception: <FiList className="w-6 h-6 text-cyan-600" />,
    mse_cognitive_function: <FiActivity className="w-6 h-6 text-fuchsia-600" />,
  };

  useEffect(() => {
    setLocalOptions(Array.from(new Set([...(remoteOptions || []), ...(options || [])])));
  }, [remoteOptions, options]);

  const toggle = (opt) => {
    const exists = value.includes(opt);
    const next = exists ? value.filter(v => v !== opt) : [...value, opt];
    onChange({ target: { name, value: next } });
  };

  const handleDelete = (opt) => {
    // Remove from available options
    setLocalOptions((prev) => prev.filter((o) => o !== opt));
    // If currently selected, unselect it as well
    if (value.includes(opt)) {
      const next = value.filter((v) => v !== opt);
      onChange({ target: { name, value: next } });
    }
    deleteOption({ group: name, label: opt }).catch(() => { });
  };

  const handleAddClick = () => {
    setShowAdd(true);
  };

  const handleCancelAdd = () => {
    setShowAdd(false);
    setCustomOption('');
  };

  const handleSaveAdd = () => {
    const opt = customOption.trim();
    if (!opt) {
      setShowAdd(false);
      return;
    }
    setLocalOptions((prev) => (prev.includes(opt) ? prev : [...prev, opt]));
    const next = value.includes(opt) ? value : [...value, opt];
    onChange({ target: { name, value: next } });
    setCustomOption('');
    setShowAdd(false);
    addOption({ group: name, label: opt }).catch(() => { });
  };

  return (


    <div className="space-y-2">
      {label && (
        <div className="flex items-center gap-3 text-base font-semibold text-gray-800">
          <span>{iconByGroup[name] || <FiList className="w-6 h-6 text-gray-500" />}</span>
          <span>{label}</span>
        </div>
      )}

      {/* Options + Add button inline */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Options */}
        {localOptions?.map((opt) => (
          <div key={opt} className="relative inline-flex items-center group">
            <button
              type="button"
              onClick={() => handleDelete(opt)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 pointer-events-none transition-opacity duration-150 group-hover:opacity-100 group-hover:pointer-events-auto hover:bg-red-600"
              aria-label={`Remove ${opt}`}
            >
              <FiX className="w-3 h-3" />
            </button>

            <label
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors duration-150 cursor-pointer
          ${value.includes(opt)
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-gray-200 bg-white hover:bg-gray-50 text-gray-800"
                }`}
            >
              <input
                type="checkbox"
                checked={value.includes(opt)}
                onChange={() => toggle(opt)}
                className="h-4 w-4 text-primary-600 rounded"
              />
              <span>{opt}</span>
            </label>
          </div>
        ))}
        {rightInlineExtra && (
          <div className="inline-flex items-center">
            {rightInlineExtra}
          </div>
        )}

        {/* Add Section */}
        <div className="flex items-center gap-2">
          {showAdd && (
            <Input
              placeholder="Enter option name"
              value={customOption}
              onChange={(e) => setCustomOption(e.target.value)}
              className="max-w-xs"
            />
          )}

          {showAdd ? (
            <>
              {/* Cancel Button */}
              <Button
                type="button"
                onClick={handleCancelAdd}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 px-3 py-1.5 rounded-md flex items-center gap-2 text-sm"
              >
                <FiX className="w-4 h-4" /> Cancel
              </Button>

              {/* Save Button */}
              <Button
                type="button"
                onClick={handleSaveAdd}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 px-3 py-1.5 rounded-md flex items-center gap-2 text-sm"
              >
                <FiSave className="w-4 h-4" /> Save
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={handleAddClick}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 px-4 py-2 rounded-md flex items-center gap-2 transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:shadow-green-500/40"
            >
              <FiPlus className="w-4 h-4" /> Add
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Hierarchical ICD-11 Code Selector Component
const ICD11CodeSelector = ({ value, onChange, error }) => {
  const [selectedPath, setSelectedPath] = useState([]); // Array of selected items at each level
  const [selectedCode, setSelectedCode] = useState(value || '');

  // Helper function to find children of a given parent at a specific level
  const getChildren = (levelIndex, parentItem) => {
    if (levelIndex === 0) {
      // Level 0: top-level items (level === 0)
      return icd11Codes.filter(item => item.level === 0);
    }

    if (!parentItem && levelIndex > 0) return [];

    const level = levelIndex;

    // Find children based on hierarchy
    return icd11Codes.filter(item => {
      if (item.level !== level) return false;

      if (level === 1) {
        // Level 1 children have parent_code matching level 0 code
        const level0Code = selectedPath[0]?.code || '';
        return item.parent_code === level0Code;
      } else if (level === 2) {
        // Level 2 items can have:
        // - parent_code matching level 0 code
        // - parent_code matching level 1 code (if level 1 has a code)
        // - empty parent_code (shown within level 0 context, but filter by code pattern)
        const level0Code = selectedPath[0]?.code || '';
        const level1Item = selectedPath[1];
        const level1Code = level1Item?.code || '';

        // If we have a level 1 selection with a code, match by that
        if (level1Code && item.parent_code === level1Code) return true;

        // Match by level 0 code
        if (item.parent_code === level0Code) return true;

        // If level 2 has empty parent_code, show it within level 0 context
        // Use code pattern matching to filter relevant items
        if (item.parent_code === '' && level0Code && item.code) {
          // For "06", level 2 codes start with "6" (e.g., "6A00", "6A02")
          if (level0Code === '06' && item.code.startsWith('6')) return true;
          // For other level 0 codes, check if code starts with level 0 code
          if (item.code.startsWith(level0Code)) return true;
        }
        return false;
      } else {
        // Level 3+: match by parent_code to previous level's code
        const prevLevelItem = selectedPath[levelIndex - 1];
        if (!prevLevelItem) return false;

        const prevLevelCode = prevLevelItem.code || '';
        return item.parent_code === prevLevelCode;
      }
    });
  };

  // Initialize selectedPath from value if provided
  useEffect(() => {
    if (value && !selectedPath.length && value !== selectedCode) {
      // Try to find the code in the JSON and build path
      const codeItem = icd11Codes.find(item => item.code === value);
      if (codeItem) {
        const path = [];
        let current = codeItem;

        // Build path backwards by finding parents
        while (current) {
          path.unshift(current);

          // Find parent
          let parent = null;
          if (current.parent_code) {
            // Try to find parent by code match
            parent = icd11Codes.find(item => item.code === current.parent_code);

            // If not found, try to find by level (e.g., level 0 item with code matching parent_code)
            if (!parent && current.level > 0) {
              if (current.level === 1) {
                parent = icd11Codes.find(item => item.level === 0 && item.code === current.parent_code);
              } else if (current.level === 2) {
                // Level 2 might have empty parent_code, check level 1 or 0
                parent = icd11Codes.find(item =>
                  (item.level === 1 && item.parent_code === current.parent_code) ||
                  (item.level === 0 && item.code === current.parent_code)
                );
              } else {
                parent = icd11Codes.find(item => item.code === current.parent_code);
              }
            }
          }

          current = parent;
        }

        if (path.length > 0) {
          setSelectedPath(path);
          setSelectedCode(value);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Sync selectedCode with value prop
  useEffect(() => {
    if (value !== selectedCode) {
      setSelectedCode(value || '');
    }
  }, [value]);

  const handleLevelChange = (levelIndex, selectedItem) => {
    const newPath = selectedPath.slice(0, levelIndex);
    if (selectedItem) {
      newPath[levelIndex] = selectedItem;
    }
    setSelectedPath(newPath);

    // Find the deepest code in the path
    let deepestCode = '';
    for (let i = newPath.length - 1; i >= 0; i--) {
      if (newPath[i]?.code) {
        deepestCode = newPath[i].code;
        break;
      }
    }

    setSelectedCode(deepestCode);
    onChange({ target: { name: 'icd_code', value: deepestCode } });
  };

  const renderDropdown = (levelIndex) => {
    const parentItem = levelIndex > 0 ? selectedPath[levelIndex - 1] : null;
    const children = getChildren(levelIndex, parentItem);
    if (children.length === 0 && levelIndex > 0) return null;

    const selectedItem = selectedPath[levelIndex];

    const labelText = levelIndex === 0 ? 'Category' :
      levelIndex === 1 ? 'Subcategory' :
        levelIndex === 2 ? 'Code Group' : 'Specific Code';

    return (
      <div key={levelIndex} className="flex-shrink-0 min-w-[200px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {labelText}
        </label>
        <Select
          value={selectedItem ? JSON.stringify(selectedItem) : ''}
          onChange={(e) => {
            const item = e.target.value ? JSON.parse(e.target.value) : null;
            handleLevelChange(levelIndex, item);
          }}
          options={[
            { value: '', label: `Select ${labelText}` },
            ...children?.map(item => ({
              value: JSON.stringify(item),
              label: `${item.code || '(Category)'} - ${item.title}`
            }))
          ]}
          error={levelIndex === 0 && error}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        ICD Code
      </label>

      {/* Horizontal flex container for dropdowns */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Render level 0 dropdown */}
        {renderDropdown(0)}

        {/* Render level 1 dropdown if level 0 is selected */}
        {selectedPath[0] && renderDropdown(1)}

        {/* Render level 2 dropdown if level 1 is selected */}
        {selectedPath[1] && renderDropdown(2)}

        {/* Render level 3 dropdown if level 2 is selected and has children */}
        {selectedPath[2] && selectedPath[2].has_children && renderDropdown(3)}

        {/* Render level 4+ dropdowns if needed */}
        {selectedPath[3] && selectedPath[3].has_children && renderDropdown(4)}
        {selectedPath[4] && selectedPath[4].has_children && renderDropdown(5)}
      </div>

      {/* Display selected code */}
      {selectedCode && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Selected ICD-11 Code:</strong> <span className="font-mono font-semibold">{selectedCode}</span>
            {selectedPath[selectedPath.length - 1] && (
              <span className="ml-2 text-blue-600">
                - {selectedPath[selectedPath.length - 1].title}
              </span>
            )}
          </p>
          {selectedPath[selectedPath.length - 1]?.description && (
            <p className="text-xs text-blue-600 mt-1 italic">
              {selectedPath[selectedPath.length - 1].description.substring(0, 200)}
              {selectedPath[selectedPath.length - 1].description.length > 200 ? '...' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const CreateClinicalProforma = ({ initialData = null, onUpdate = null, proformaId = null }) => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get id from route params
  const [searchParams] = useSearchParams();
  const patientIdFromQuery = searchParams.get('patient_id');
  const clinicalProformaIdFromQuery = searchParams.get('clinical_proforma_id'); // Get clinical_proforma_id from URL if provided
  const returnTab = searchParams.get('returnTab'); // Get returnTab from URL
  console.log("patientIdFromQuery", patientIdFromQuery);
  console.log("clinicalProformaIdFromQuery", clinicalProformaIdFromQuery);
  
  // Priority order for clinicalProformaId:
  // 1. clinical_proforma_id from URL query params (most direct)
  // 2. id from route params
  // 3. prop proformaId
  // 4. Find by patient_id (fallback - less efficient)
  
  // Fetch all clinical proformas to find matching patient_id (only if needed)
  const shouldFetchProformas = !clinicalProformaIdFromQuery && !id && !proformaId && !!patientIdFromQuery;
  
  const { 
    data: getClinicalProformasData, 
    isLoading: isLoadingProformas,
    isError: isErrorProformas,
    error: errorProformas
  } = useGetAllClinicalProformasQuery(
    { page: 1, limit: 1000 }, // High limit to get all records
    {
      // Only fetch if we need to find proforma by patient_id
      skip: !shouldFetchProformas,
      refetchOnMountOrArgChange: true,
    }
  );

  // Extract all clinical proformas
  const clinicalProformas = getClinicalProformasData?.data?.proformas || [];

  // Find proforma where patient_id (UUID) matches query parameter (UUID) - only if needed
  const matchedProforma = shouldFetchProformas && patientIdFromQuery
    ? clinicalProformas.find((p) => {
        // Normalize both UUIDs to strings and compare
        const proformaPatientId = p.patient_id ? String(p.patient_id).toLowerCase().trim() : null;
        const queryPatientId = String(patientIdFromQuery).toLowerCase().trim();
        return proformaPatientId === queryPatientId;
      })
    : null;

  // Extract clinical proforma ID (UUID) from matched proforma
  const matchedProformaId = matchedProforma?.id || null;

  // Use the clinical_proforma_id from URL first, then matched proforma ID, route param id, or prop proformaId
  const clinicalProformaId = clinicalProformaIdFromQuery || matchedProformaId || id || proformaId;
  
  // Debug logging
  console.log('[CreateClinicalProforma] clinicalProformaId:', clinicalProformaId);
  console.log('[CreateClinicalProforma] clinicalProformaIdFromQuery:', clinicalProformaIdFromQuery);
  console.log('[CreateClinicalProforma] matchedProformaId:', matchedProformaId);
  console.log('[CreateClinicalProforma] id (route param):', id);
  console.log('[CreateClinicalProforma] proformaId (prop):', proformaId);

  const [createProforma, { isLoading: isCreating }] = useCreateClinicalProformaMutation();
  const [updateProforma, { isLoading: isUpdating }] = useUpdateClinicalProformaMutation();
  const [createADLFile, { isLoading: isCreatingADL }] = useCreateADLFileMutation();

  // Track created proforma ID for step-wise saving
  // If proformaId is provided (edit mode), use it
  const [savedProformaId, setSavedProformaId] = useState(proformaId || null);
  const [patientSearch, setPatientSearch] = useState('');
  const { data: patientsData } = useSearchPatientsQuery(
    { search: patientSearch, limit: 10 },
    { skip: !patientSearch }
  );

  // Fetch doctors list for assignment by MWO
  const { data: doctorsData } = useGetDoctorsQuery({ page: 1, limit: 100 });
  
  // Fetch existing clinical proforma data if clinicalProformaId is available
  const { 
    data: existingProformaData, 
    isLoading: isLoadingExistingProforma,
    isError: isErrorExistingProforma,
    error: errorExistingProforma,
    refetch: refetchProforma
  } = useGetClinicalProformaByIdQuery(clinicalProformaId, {
    skip: !clinicalProformaId,
    refetchOnMountOrArgChange: true // Always refetch to get latest data including adl_file_id
  });
  
  // Debug logging for query state
  console.log('[CreateClinicalProforma] Query state:', {
    clinicalProformaId,
    skip: !clinicalProformaId,
    isLoading: isLoadingExistingProforma,
    isError: isErrorExistingProforma,
    error: errorExistingProforma,
    hasData: !!existingProformaData
  });
  
  const existingProforma = existingProformaData?.data?.proforma || existingProformaData?.data?.clinical_proforma;
  
  // Fetch prescriptions for the existing proforma
  const { 
    data: prescriptionsData, 
    isLoading: isLoadingPrescriptions,
    refetch: refetchPrescriptions
  } = useGetPrescriptionsByProformaIdQuery(savedProformaId || clinicalProformaId, {
    skip: !(savedProformaId || clinicalProformaId),
    refetchOnMountOrArgChange: true
  });
  
  const existingPrescriptions = prescriptionsData?.data?.prescriptions || prescriptionsData?.data || [];
  
  // Initialize form data with initialData if provided (for edit mode)

  
  const getInitialFormData = () => {
    if (initialData) {
      // Ensure array fields are properly initialized
      const normalizedData = { ...initialData };
      // Normalize informants array
      if (!normalizedData.informants || !Array.isArray(normalizedData.informants)) {
        normalizedData.informants = normalizedData.informants
          ? (Array.isArray(normalizedData.informants) ? normalizedData.informants : [normalizedData.informants])
          : [{ relationship: '', name: '', reliability: '' }];
        if (normalizedData.informants.length === 0) {
          normalizedData.informants = [{ relationship: '', name: '', reliability: '' }];
        }
      }
      // Normalize complaints arrays
      if (!normalizedData.complaints_patient || !Array.isArray(normalizedData.complaints_patient)) {
        normalizedData.complaints_patient = normalizedData.complaints_patient
          ? (Array.isArray(normalizedData.complaints_patient) ? normalizedData.complaints_patient : [normalizedData.complaints_patient])
          : [{ complaint: '', duration: '' }];
        if (normalizedData.complaints_patient.length === 0) {
          normalizedData.complaints_patient = [{ complaint: '', duration: '' }];
        }
      }
      if (!normalizedData.complaints_informant || !Array.isArray(normalizedData.complaints_informant)) {
        normalizedData.complaints_informant = normalizedData.complaints_informant
          ? (Array.isArray(normalizedData.complaints_informant) ? normalizedData.complaints_informant : [normalizedData.complaints_informant])
          : [{ complaint: '', duration: '' }];
        if (normalizedData.complaints_informant.length === 0) {
          normalizedData.complaints_informant = [{ complaint: '', duration: '' }];
        }
      }
      // Normalize family_history_siblings array
      if (!normalizedData.family_history_siblings || !Array.isArray(normalizedData.family_history_siblings)) {
        normalizedData.family_history_siblings = normalizedData.family_history_siblings
          ? (Array.isArray(normalizedData.family_history_siblings) ? normalizedData.family_history_siblings : [normalizedData.family_history_siblings])
          : [{ age: '', sex: '', education: '', occupation: '', marital_status: '' }];
        if (normalizedData.family_history_siblings.length === 0) {
          normalizedData.family_history_siblings = [{ age: '', sex: '', education: '', occupation: '', marital_status: '' }];
        }
      }
      // Normalize occupation_jobs array
      if (!normalizedData.occupation_jobs || !Array.isArray(normalizedData.occupation_jobs)) {
        normalizedData.occupation_jobs = normalizedData.occupation_jobs
          ? (Array.isArray(normalizedData.occupation_jobs) ? normalizedData.occupation_jobs : [normalizedData.occupation_jobs])
          : [{ job: '', dates: '', adjustment: '', difficulties: '', promotions: '', change_reason: '' }];
        if (normalizedData.occupation_jobs.length === 0) {
          normalizedData.occupation_jobs = [{ job: '', dates: '', adjustment: '', difficulties: '', promotions: '', change_reason: '' }];
        }
      }
      // Normalize sexual_children array
      if (!normalizedData.sexual_children || !Array.isArray(normalizedData.sexual_children)) {
        normalizedData.sexual_children = normalizedData.sexual_children
          ? (Array.isArray(normalizedData.sexual_children) ? normalizedData.sexual_children : [normalizedData.sexual_children])
          : [{ age: '', sex: '' }];
        if (normalizedData.sexual_children.length === 0) {
          normalizedData.sexual_children = [{ age: '', sex: '' }];
        }
      }
      return normalizedData;
    }
    return {
      patient_id: patientIdFromQuery || '',
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
      mse_thought: [],
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
      case_severity: 'mild',
      requires_adl_file: false,
      adl_reasoning: '',
      // History of Present Illness - Expanded
      history_narrative: '',
      history_specific_enquiry: '',
      history_drug_intake: '',
      history_treatment_place: '',
      history_treatment_dates: '',
      history_treatment_drugs: '',
      history_treatment_response: '',
      // Multiple Informants
      informants: [{ relationship: '', name: '', reliability: '' }],
      // Complaints and Duration
      complaints_patient: [{ complaint: '', duration: '' }],
      complaints_informant: [{ complaint: '', duration: '' }],
      // Past History - Detailed
      past_history_medical: '',
      past_history_psychiatric_dates: '',
      past_history_psychiatric_diagnosis: '',
      past_history_psychiatric_treatment: '',
      past_history_psychiatric_interim: '',
      past_history_psychiatric_recovery: '',
      // Family History - Detailed
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
      // Physical Examination - Comprehensive
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
      // Mental Status Examination - Expanded
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
      // Educational History
      education_start_age: '',
      education_highest_class: '',
      education_performance: '',
      education_disciplinary: '',
      education_peer_relationship: '',
      education_hobbies: '',
      education_special_abilities: '',
      education_discontinue_reason: '',
      // Occupational History
      occupation_jobs: [{ job: '', dates: '', adjustment: '', difficulties: '', promotions: '', change_reason: '' }],
      // Sexual and Marital History
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
      // Present Living Situation
      living_residents: [{ name: '', relationship: '', age: '' }],
      living_income_sharing: '',
      living_expenses: '',
      living_kitchen: '',
      living_domestic_conflicts: '',
      living_social_class: '',
      living_inlaws: [{ name: '', relationship: '', age: '' }],
      // General Home Situation and Early Development
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
      // Provisional Diagnosis and Treatment Plan
      provisional_diagnosis: '',
      treatment_plan: '',
      // Comments of the Consultant
      consultant_comments: '',
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());

  // Initialize prescriptions from initialData if provided
  useEffect(() => {
    if (initialData?.prescriptions) {
      const normalizedPrescriptions = Array.isArray(initialData.prescriptions)
        ? initialData.prescriptions
        : [initialData.prescriptions];
      if (normalizedPrescriptions.length > 0) {
        setPrescriptions(normalizedPrescriptions);
      }
    }
  }, [initialData]);

  // Fetch full patient data when patient_id is selected (moved after formData declaration)
  const { data: fullPatientData } = useGetPatientByIdQuery(
    formData.patient_id,
    { skip: !formData.patient_id }
  );

  const [errors, setErrors] = useState({});

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Prescription state management
  const [prescriptions, setPrescriptions] = useState([
    { medicine: '', dosage: '', when: '', frequency: '', duration: '', qty: '', details: '', notes: '' }
  ]);



  // Always 3 steps: Basic Info, Clinical Proforma, Additional Detail (conditional)
  const totalSteps = 3;

  // Determine if step 3 (ADL) should be shown
  // Show ADL card if: doctor_decision is complex_case OR if ADL file already exists
  const showADLStep = formData.doctor_decision === 'complex_case' || !!existingProforma?.adl_file_id;

  // Card expand/collapse states (all start minimized/closed)
  const [expandedCards, setExpandedCards] = useState({
    clinicalProforma: false, // Main Clinical Proforma card
    patientInfo: false, // Patient information sub-card
    informant: false,
    onset: false,
    presentIllness: false,
    pastHistory: false,
    familyHistory: false,
    personalHistory: false,
    complaints: false,
    mse: false,
    additionalHistory: false,
    gpe: false,
    diagnosis: false,
    adl: false,
    prescription: false, // Prescription card
  });

  // Track ADL file ID for fetching ADL data when Step 3 loads
  const [adlFileId, setAdlFileId] = useState(null);

  // Track if we've already populated the form to prevent overwriting
  const [hasPopulatedForm, setHasPopulatedForm] = useState(false);
  const [lastPopulatedProformaId, setLastPopulatedProformaId] = useState(null);

  const toggleCard = (cardName) => {
    setExpandedCards(prev => ({ ...prev, [cardName]: !prev[cardName] }));
    
    // When ADL card is expanded, refetch proforma to get latest adl_file_id
    if (cardName === 'adl' && !expandedCards.adl && (savedProformaId || clinicalProformaId)) {
      console.log('[CreateClinicalProforma] ADL card expanded, refetching proforma to get latest adl_file_id');
      if (refetchProforma) {
        refetchProforma();
      }
    }
    
    // When prescription card is expanded, refetch prescriptions to get latest data
    if (cardName === 'prescription' && !expandedCards.prescription && (savedProformaId || clinicalProformaId)) {
      console.log('[CreateClinicalProforma] Prescription card expanded, refetching prescriptions');
      if (refetchPrescriptions) {
        refetchPrescriptions();
      }
    }
  };

  // Auto-expand ADL card if ADL file exists
  useEffect(() => {
    if (existingProforma?.adl_file_id) {
      console.log('[CreateClinicalProforma] ADL file exists, auto-expanding ADL card');
      setExpandedCards(prev => ({ ...prev, adl: true }));
      // Set ADL file ID if not already set
      if (!adlFileId) {
        setAdlFileId(existingProforma.adl_file_id);
      }
    }
  }, [existingProforma?.adl_file_id, adlFileId]);
  
  // Auto-expand prescription card if prescriptions exist
  useEffect(() => {
    if (existingPrescriptions && Array.isArray(existingPrescriptions) && existingPrescriptions.length > 0) {
      console.log('[CreateClinicalProforma] Prescriptions exist, auto-expanding prescription card');
      setExpandedCards(prev => ({ ...prev, prescription: true }));
    }
  }, [existingPrescriptions]);

  // Auto-expand cards when form is populated with existing data
  useEffect(() => {
    if (hasPopulatedForm && existingProforma) {
      console.log('[CreateClinicalProforma] Form populated, checking which cards to expand');
      
      // Expand ADL card if ADL file exists
      if (existingProforma.adl_file_id) {
        setExpandedCards(prev => ({ ...prev, adl: true }));
        console.log('[CreateClinicalProforma] Auto-expanding ADL card - ADL file exists');
      }
      
      // Expand prescription card if prescriptions exist
      if (existingPrescriptions && Array.isArray(existingPrescriptions) && existingPrescriptions.length > 0) {
        setExpandedCards(prev => ({ ...prev, prescription: true }));
        console.log('[CreateClinicalProforma] Auto-expanding prescription card - prescriptions exist');
      }
    }
  }, [hasPopulatedForm, existingProforma, existingPrescriptions]);

  useEffect(() => {
    if (formData.doctor_decision === 'complex_case') {
      // Automatically enable ADL file requirement for complex cases
      setFormData(prev => ({ ...prev, requires_adl_file: true }));
    } else {
      // If changed from complex to simple, reset ADL fields
      setFormData(prev => ({
        ...prev,
        requires_adl_file: false,
        adl_reasoning: ''
      }));
    }
    // If we're on step 3 (ADL) and case becomes simple, skip to step 4
    if (currentStep === 3 && !showADLStep) {
      setCurrentStep(4);
    }
  }, [formData.doctor_decision, showADLStep, currentStep]);

  // Fetch ADL file data when Step 3 loads and adl_file_id exists
  const { data: adlFileData } = useGetADLFileByIdQuery(adlFileId, { skip: !adlFileId || currentStep !== 3 });
  const [updateADLFile] = useUpdateADLFileMutation();

  // Helper function to normalize array fields (handles JSONB fields that might be strings or arrays)
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

  // Helper function to normalize object array fields (for JSONB fields like prescriptions, informants, etc.)
  const normalizeObjectArrayField = (value, defaultStructure = {}) => {
    if (Array.isArray(value)) {
      return value.length > 0 ? value : [defaultStructure];
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.length > 0 ? parsed : [defaultStructure];
        }
        return parsed ? [parsed] : [defaultStructure];
      } catch {
        return [defaultStructure];
      }
    }
    return [defaultStructure];
  };

  // Reset population flag when clinicalProformaId changes
  useEffect(() => {
    if (clinicalProformaId !== lastPopulatedProformaId) {
      console.log('[CreateClinicalProforma] Clinical proforma ID changed, resetting population flag');
      setHasPopulatedForm(false);
      setLastPopulatedProformaId(clinicalProformaId);
    }
  }, [clinicalProformaId, lastPopulatedProformaId]);

  // Populate form with existing proforma data when it's loaded
  useEffect(() => {
    if (existingProforma && !initialData && !hasPopulatedForm) {
      // Only populate if we don't have initialData (to avoid conflicts) and haven't populated yet
      const proforma = existingProforma;
      
      console.log('[CreateClinicalProforma] Populating form with existing proforma data:', proforma);
      
      // Set saved proforma ID
      if (proforma.id) {
        setSavedProformaId(proforma.id);
      }
      
      // Populate form with existing proforma data - use database values, fallback to prev only if truly missing
      setFormData(prev => {
        const updated = {
          ...prev,
          // Basic info - use database value if present, otherwise keep prev
          patient_id: proforma.patient_id || prev.patient_id,
          visit_date: proforma.visit_date ? proforma.visit_date.split('T')[0] : (prev.visit_date || new Date().toISOString().split('T')[0]),
          visit_type: proforma.visit_type || prev.visit_type || 'first_visit',
          room_no: proforma.room_no !== undefined && proforma.room_no !== null ? proforma.room_no : prev.room_no,
          assigned_doctor: proforma.assigned_doctor !== undefined && proforma.assigned_doctor !== null ? proforma.assigned_doctor : prev.assigned_doctor,
          // Informant
          informant_present: proforma.informant_present !== undefined && proforma.informant_present !== null ? proforma.informant_present : prev.informant_present,
          nature_of_information: proforma.nature_of_information !== undefined && proforma.nature_of_information !== null ? proforma.nature_of_information : prev.nature_of_information,
          // Present Illness
          onset_duration: proforma.onset_duration !== undefined && proforma.onset_duration !== null ? proforma.onset_duration : prev.onset_duration,
          course: proforma.course !== undefined && proforma.course !== null ? proforma.course : prev.course,
          precipitating_factor: proforma.precipitating_factor !== undefined && proforma.precipitating_factor !== null ? proforma.precipitating_factor : prev.precipitating_factor,
          illness_duration: proforma.illness_duration !== undefined && proforma.illness_duration !== null ? proforma.illness_duration : prev.illness_duration,
          current_episode_since: proforma.current_episode_since ? proforma.current_episode_since.split('T')[0] : (prev.current_episode_since || ''),
          // Complaints - normalize arrays
          mood: normalizeArrayField(proforma.mood).length > 0 ? normalizeArrayField(proforma.mood) : prev.mood,
          behaviour: normalizeArrayField(proforma.behaviour).length > 0 ? normalizeArrayField(proforma.behaviour) : prev.behaviour,
          speech: normalizeArrayField(proforma.speech).length > 0 ? normalizeArrayField(proforma.speech) : prev.speech,
          thought: normalizeArrayField(proforma.thought).length > 0 ? normalizeArrayField(proforma.thought) : prev.thought,
          perception: normalizeArrayField(proforma.perception).length > 0 ? normalizeArrayField(proforma.perception) : prev.perception,
          somatic: normalizeArrayField(proforma.somatic).length > 0 ? normalizeArrayField(proforma.somatic) : prev.somatic,
          bio_functions: normalizeArrayField(proforma.bio_functions).length > 0 ? normalizeArrayField(proforma.bio_functions) : prev.bio_functions,
          adjustment: normalizeArrayField(proforma.adjustment).length > 0 ? normalizeArrayField(proforma.adjustment) : prev.adjustment,
          cognitive_function: normalizeArrayField(proforma.cognitive_function).length > 0 ? normalizeArrayField(proforma.cognitive_function) : prev.cognitive_function,
          fits: normalizeArrayField(proforma.fits).length > 0 ? normalizeArrayField(proforma.fits) : prev.fits,
          sexual_problem: normalizeArrayField(proforma.sexual_problem).length > 0 ? normalizeArrayField(proforma.sexual_problem) : prev.sexual_problem,
          substance_use: normalizeArrayField(proforma.substance_use).length > 0 ? normalizeArrayField(proforma.substance_use) : prev.substance_use,
          // Additional History
          past_history: proforma.past_history !== undefined && proforma.past_history !== null ? proforma.past_history : prev.past_history,
          family_history: proforma.family_history !== undefined && proforma.family_history !== null ? proforma.family_history : prev.family_history,
          associated_medical_surgical: normalizeArrayField(proforma.associated_medical_surgical).length > 0 ? normalizeArrayField(proforma.associated_medical_surgical) : prev.associated_medical_surgical,
          // MSE
          mse_behaviour: normalizeArrayField(proforma.mse_behaviour).length > 0 ? normalizeArrayField(proforma.mse_behaviour) : prev.mse_behaviour,
          mse_affect: normalizeArrayField(proforma.mse_affect).length > 0 ? normalizeArrayField(proforma.mse_affect) : prev.mse_affect,
          mse_thought: normalizeArrayField(proforma.mse_thought).length > 0 ? normalizeArrayField(proforma.mse_thought) : prev.mse_thought,
          mse_delusions: typeof proforma.mse_delusions === 'string' ? proforma.mse_delusions : (Array.isArray(proforma.mse_delusions) ? proforma.mse_delusions.join(', ') : (prev.mse_delusions || '')),
          mse_perception: normalizeArrayField(proforma.mse_perception).length > 0 ? normalizeArrayField(proforma.mse_perception) : prev.mse_perception,
          mse_cognitive_function: normalizeArrayField(proforma.mse_cognitive_function).length > 0 ? normalizeArrayField(proforma.mse_cognitive_function) : prev.mse_cognitive_function,
          // GPE
          gpe: proforma.gpe !== undefined && proforma.gpe !== null ? proforma.gpe : prev.gpe,
          // Diagnosis & Management
          diagnosis: proforma.diagnosis !== undefined && proforma.diagnosis !== null ? proforma.diagnosis : prev.diagnosis,
          icd_code: proforma.icd_code !== undefined && proforma.icd_code !== null ? proforma.icd_code : prev.icd_code,
          disposal: proforma.disposal !== undefined && proforma.disposal !== null ? proforma.disposal : prev.disposal,
          workup_appointment: proforma.workup_appointment ? proforma.workup_appointment.split('T')[0] : (prev.workup_appointment || ''),
          referred_to: proforma.referred_to !== undefined && proforma.referred_to !== null ? proforma.referred_to : prev.referred_to,
          treatment_prescribed: proforma.treatment_prescribed !== undefined && proforma.treatment_prescribed !== null ? proforma.treatment_prescribed : prev.treatment_prescribed,
          doctor_decision: proforma.doctor_decision || prev.doctor_decision || 'simple_case',
          case_severity: proforma.case_severity || prev.case_severity || 'mild',
          requires_adl_file: proforma.requires_adl_file !== undefined && proforma.requires_adl_file !== null ? proforma.requires_adl_file : prev.requires_adl_file,
          adl_reasoning: proforma.adl_reasoning !== undefined && proforma.adl_reasoning !== null ? proforma.adl_reasoning : prev.adl_reasoning,
        };
        
        console.log('[CreateClinicalProforma] Form data updated with proforma data');
        return updated;
      });
      
      // Set ADL file ID if it exists
      if (proforma.adl_file_id) {
        setAdlFileId(proforma.adl_file_id);
        console.log('[CreateClinicalProforma] ADL file ID set:', proforma.adl_file_id);
      }
      
      // Mark as populated to prevent re-population
      setHasPopulatedForm(true);
      if (proforma.id) {
        setLastPopulatedProformaId(proforma.id);
      }
      
      // Auto-expand clinical proforma card when data exists
      setExpandedCards(prev => ({ ...prev, clinicalProforma: true }));
      
      // Prescriptions will be populated separately from the prescriptions query
      // Don't populate from proforma.prescriptions as they might not be included in the response
    }
  }, [existingProforma, initialData, hasPopulatedForm]);
  
  // Populate prescriptions when they are fetched
  useEffect(() => {
    if (existingPrescriptions && Array.isArray(existingPrescriptions) && existingPrescriptions.length > 0) {
      console.log('[CreateClinicalProforma] Populating prescriptions from API:', existingPrescriptions);
      // Map prescription data to match the form structure
      const mappedPrescriptions = existingPrescriptions.map(p => ({
        medicine: p.medicine || '',
        dosage: p.dosage || '',
        when: p.when_to_take || p.when || '',
        frequency: p.frequency || '',
        duration: p.duration || '',
        qty: p.quantity || p.qty || '',
        details: p.details || '',
        notes: p.notes || ''
      }));
      setPrescriptions(mappedPrescriptions);
      console.log('[CreateClinicalProforma] Prescriptions populated:', mappedPrescriptions);
      
      // Auto-expand prescription card when prescriptions are loaded
      setExpandedCards(prev => ({ ...prev, prescription: true }));
      console.log('[CreateClinicalProforma] Auto-expanding prescription card - prescriptions loaded');
    } else if (existingPrescriptions && existingPrescriptions.length === 0 && (savedProformaId || clinicalProformaId)) {
      // If prescriptions query returned empty array, keep default empty prescription
      console.log('[CreateClinicalProforma] No prescriptions found for proforma');
    }
  }, [existingPrescriptions, savedProformaId, clinicalProformaId]);
  
  // Auto-populate ALL patient details when patient data is fetched
  // Only populate if form hasn't been populated from existing proforma yet
  useEffect(() => {
    if (fullPatientData?.data?.patient && !hasPopulatedForm) {
      const patient = fullPatientData.data.patient;
      setFormData(prev => ({
        ...prev,
        // Auto-populate room number if available (don't override if user already entered or if we have proforma data)
        room_no: prev.room_no || patient.assigned_room || '',
        // Auto-populate assigned doctor if available
        assigned_doctor: prev.assigned_doctor || (patient.assigned_doctor_id ? patient.assigned_doctor_id.toString() : ''),
        // If patient has visit history, set visit_type to follow_up (only if not already set from proforma)
        visit_type: prev.visit_type || (patient.last_assigned_date ? 'follow_up' : 'first_visit'),
      }));
    }
  }, [fullPatientData, hasPopulatedForm]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate specific step
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.patient_id) {
        newErrors.patient_id = 'Patient is required';
      }
      if (!formData.visit_date) {
        newErrors.visit_date = 'Visit date is required';
      }
    }

    if (step === 3 && formData.doctor_decision === 'complex_case') {
      if (!formData.adl_reasoning) {
        newErrors.adl_reasoning = 'ADL reasoning is required for complex cases';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.patient_id) {
      newErrors.patient_id = 'Patient is required';
    }
    if (!formData.visit_date) {
      newErrors.visit_date = 'Visit date is required';
    }
    if (formData.doctor_decision === 'complex_case' && !formData.adl_reasoning) {
      newErrors.adl_reasoning = 'ADL reasoning is required for complex cases';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to prepare form data for API
  const prepareFormData = (step) => {
    const join = (arr) => Array.isArray(arr) ? arr.join(', ') : arr;

    const baseData = {
      patient_id: formData.patient_id, // Keep as UUID string, don't parse to integer
      visit_date: formData.visit_date,
      visit_type: formData.visit_type,
      room_no: formData.room_no,
      assigned_doctor: formData.assigned_doctor_name,
    };

    // Step 1: Basic Information
    if (step === 1) {
      return baseData;
    }

    // Step 2: Clinical Proforma (add clinical data)
    if (step === 2) {
      return {
        ...baseData,
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
        mse_thought: join(formData.mse_thought),
        mse_delusions: formData.mse_delusions,
        mse_perception: join(formData.mse_perception),
        mse_cognitive_function: join(formData.mse_cognitive_function),
        gpe: formData.gpe,
        diagnosis: formData.diagnosis,
        icd_code: formData.icd_code,
        disposal: formData.disposal,
        workup_appointment: formData.workup_appointment,
        referred_to: formData.referred_to,
        doctor_decision: formData.doctor_decision,
        case_severity: formData.case_severity,
        requires_adl_file: formData.requires_adl_file,
        adl_reasoning: formData.adl_reasoning,
      };
    }

    // Step 3: ADL Details (only for complex cases)
    if (step === 3) {
      return {
        // Include all previous data plus ADL fields
        ...baseData,
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
        mse_thought: join(formData.mse_thought),
        mse_delusions: formData.mse_delusions,
        mse_perception: join(formData.mse_perception),
        mse_cognitive_function: join(formData.mse_cognitive_function),
        gpe: formData.gpe,
        diagnosis: formData.diagnosis,
        icd_code: formData.icd_code,
        disposal: formData.disposal,
        workup_appointment: formData.workup_appointment,
        referred_to: formData.referred_to,
        doctor_decision: formData.doctor_decision,
        case_severity: formData.case_severity,
        requires_adl_file: formData.requires_adl_file,
        adl_reasoning: formData.adl_reasoning,
        // All ADL-related fields
        history_narrative: formData.history_narrative,
        history_specific_enquiry: formData.history_specific_enquiry,
        history_drug_intake: formData.history_drug_intake,
        history_treatment_place: formData.history_treatment_place,
        history_treatment_dates: formData.history_treatment_dates,
        history_treatment_drugs: formData.history_treatment_drugs,
        history_treatment_response: formData.history_treatment_response,
        informants: formData.informants,
        complaints_patient: formData.complaints_patient,
        complaints_informant: formData.complaints_informant,
        past_history_medical: formData.past_history_medical,
        past_history_psychiatric_dates: formData.past_history_psychiatric_dates,
        past_history_psychiatric_diagnosis: formData.past_history_psychiatric_diagnosis,
        past_history_psychiatric_treatment: formData.past_history_psychiatric_treatment,
        past_history_psychiatric_interim: formData.past_history_psychiatric_interim,
        past_history_psychiatric_recovery: formData.past_history_psychiatric_recovery,
        family_history_father_age: formData.family_history_father_age,
        family_history_father_education: formData.family_history_father_education,
        family_history_father_occupation: formData.family_history_father_occupation,
        family_history_father_personality: formData.family_history_father_personality,
        family_history_father_deceased: formData.family_history_father_deceased,
        family_history_father_death_age: formData.family_history_father_death_age,
        family_history_father_death_date: formData.family_history_father_death_date,
        family_history_father_death_cause: formData.family_history_father_death_cause,
        family_history_mother_age: formData.family_history_mother_age,
        family_history_mother_education: formData.family_history_mother_education,
        family_history_mother_occupation: formData.family_history_mother_occupation,
        family_history_mother_personality: formData.family_history_mother_personality,
        family_history_mother_deceased: formData.family_history_mother_deceased,
        family_history_mother_death_age: formData.family_history_mother_death_age,
        family_history_mother_death_date: formData.family_history_mother_death_date,
        family_history_mother_death_cause: formData.family_history_mother_death_cause,
        family_history_siblings: formData.family_history_siblings,
        diagnostic_formulation_summary: formData.diagnostic_formulation_summary,
        diagnostic_formulation_features: formData.diagnostic_formulation_features,
        diagnostic_formulation_psychodynamic: formData.diagnostic_formulation_psychodynamic,
        premorbid_personality_passive_active: formData.premorbid_personality_passive_active,
        premorbid_personality_assertive: formData.premorbid_personality_assertive,
        premorbid_personality_introvert_extrovert: formData.premorbid_personality_introvert_extrovert,
        premorbid_personality_traits: formData.premorbid_personality_traits,
        premorbid_personality_hobbies: formData.premorbid_personality_hobbies,
        premorbid_personality_habits: formData.premorbid_personality_habits,
        premorbid_personality_alcohol_drugs: formData.premorbid_personality_alcohol_drugs,
        physical_appearance: formData.physical_appearance,
        physical_body_build: formData.physical_body_build,
        physical_pallor: formData.physical_pallor,
        physical_icterus: formData.physical_icterus,
        physical_oedema: formData.physical_oedema,
        physical_lymphadenopathy: formData.physical_lymphadenopathy,
        physical_pulse: formData.physical_pulse,
        physical_bp: formData.physical_bp,
        physical_height: formData.physical_height,
        physical_weight: formData.physical_weight,
        physical_waist: formData.physical_waist,
        physical_fundus: formData.physical_fundus,
        physical_cvs_apex: formData.physical_cvs_apex,
        physical_cvs_regularity: formData.physical_cvs_regularity,
        physical_cvs_heart_sounds: formData.physical_cvs_heart_sounds,
        physical_cvs_murmurs: formData.physical_cvs_murmurs,
        physical_chest_expansion: formData.physical_chest_expansion,
        physical_chest_percussion: formData.physical_chest_percussion,
        physical_chest_adventitious: formData.physical_chest_adventitious,
        physical_abdomen_tenderness: formData.physical_abdomen_tenderness,
        physical_abdomen_mass: formData.physical_abdomen_mass,
        physical_abdomen_bowel_sounds: formData.physical_abdomen_bowel_sounds,
        physical_cns_cranial: formData.physical_cns_cranial,
        physical_cns_motor_sensory: formData.physical_cns_motor_sensory,
        physical_cns_rigidity: formData.physical_cns_rigidity,
        physical_cns_involuntary: formData.physical_cns_involuntary,
        physical_cns_superficial_reflexes: formData.physical_cns_superficial_reflexes,
        physical_cns_dtrs: formData.physical_cns_dtrs,
        physical_cns_plantar: formData.physical_cns_plantar,
        physical_cns_cerebellar: formData.physical_cns_cerebellar,
        mse_general_demeanour: formData.mse_general_demeanour,
        mse_general_tidy: formData.mse_general_tidy,
        mse_general_awareness: formData.mse_general_awareness,
        mse_general_cooperation: formData.mse_general_cooperation,
        mse_psychomotor_verbalization: formData.mse_psychomotor_verbalization,
        mse_psychomotor_pressure: formData.mse_psychomotor_pressure,
        mse_psychomotor_tension: formData.mse_psychomotor_tension,
        mse_psychomotor_posture: formData.mse_psychomotor_posture,
        mse_psychomotor_mannerism: formData.mse_psychomotor_mannerism,
        mse_psychomotor_catatonic: formData.mse_psychomotor_catatonic,
        mse_affect_subjective: formData.mse_affect_subjective,
        mse_affect_tone: formData.mse_affect_tone,
        mse_affect_resting: formData.mse_affect_resting,
        mse_affect_fluctuation: formData.mse_affect_fluctuation,
        mse_thought_flow: formData.mse_thought_flow,
        mse_thought_form: formData.mse_thought_form,
        mse_thought_content: formData.mse_thought_content,
        mse_cognitive_consciousness: formData.mse_cognitive_consciousness,
        mse_cognitive_orientation_time: formData.mse_cognitive_orientation_time,
        mse_cognitive_orientation_place: formData.mse_cognitive_orientation_place,
        mse_cognitive_orientation_person: formData.mse_cognitive_orientation_person,
        mse_cognitive_memory_immediate: formData.mse_cognitive_memory_immediate,
        mse_cognitive_memory_recent: formData.mse_cognitive_memory_recent,
        mse_cognitive_memory_remote: formData.mse_cognitive_memory_remote,
        mse_cognitive_subtraction: formData.mse_cognitive_subtraction,
        mse_cognitive_digit_span: formData.mse_cognitive_digit_span,
        mse_cognitive_counting: formData.mse_cognitive_counting,
        mse_cognitive_general_knowledge: formData.mse_cognitive_general_knowledge,
        mse_cognitive_calculation: formData.mse_cognitive_calculation,
        mse_cognitive_similarities: formData.mse_cognitive_similarities,
        mse_cognitive_proverbs: formData.mse_cognitive_proverbs,
        mse_insight_understanding: formData.mse_insight_understanding,
        mse_insight_judgement: formData.mse_insight_judgement,
        education_start_age: formData.education_start_age,
        education_highest_class: formData.education_highest_class,
        education_performance: formData.education_performance,
        education_disciplinary: formData.education_disciplinary,
        education_peer_relationship: formData.education_peer_relationship,
        education_hobbies: formData.education_hobbies,
        education_special_abilities: formData.education_special_abilities,
        education_discontinue_reason: formData.education_discontinue_reason,
        occupation_jobs: formData.occupation_jobs,
        sexual_menarche_age: formData.sexual_menarche_age,
        sexual_menarche_reaction: formData.sexual_menarche_reaction,
        sexual_education: formData.sexual_education,
        sexual_masturbation: formData.sexual_masturbation,
        sexual_contact: formData.sexual_contact,
        sexual_premarital_extramarital: formData.sexual_premarital_extramarital,
        sexual_marriage_arranged: formData.sexual_marriage_arranged,
        sexual_marriage_date: formData.sexual_marriage_date,
        sexual_spouse_age: formData.sexual_spouse_age,
        sexual_spouse_occupation: formData.sexual_spouse_occupation,
        sexual_adjustment_general: formData.sexual_adjustment_general,
        sexual_adjustment_sexual: formData.sexual_adjustment_sexual,
        sexual_children: formData.sexual_children,
        sexual_problems: formData.sexual_problems,
        religion_type: formData.religion_type,
        religion_participation: formData.religion_participation,
        religion_changes: formData.religion_changes,
        living_residents: formData.living_residents,
        living_income_sharing: formData.living_income_sharing,
        living_expenses: formData.living_expenses,
        living_kitchen: formData.living_kitchen,
        living_domestic_conflicts: formData.living_domestic_conflicts,
        living_social_class: formData.living_social_class,
        living_inlaws: formData.living_inlaws,
        home_situation_childhood: formData.home_situation_childhood,
        home_situation_parents_relationship: formData.home_situation_parents_relationship,
        home_situation_socioeconomic: formData.home_situation_socioeconomic,
        home_situation_interpersonal: formData.home_situation_interpersonal,
        personal_birth_date: formData.personal_birth_date,
        personal_birth_place: formData.personal_birth_place,
        personal_delivery_type: formData.personal_delivery_type,
        personal_complications_prenatal: formData.personal_complications_prenatal,
        personal_complications_natal: formData.personal_complications_natal,
        personal_complications_postnatal: formData.personal_complications_postnatal,
        development_weaning_age: formData.development_weaning_age,
        development_first_words: formData.development_first_words,
        development_three_words: formData.development_three_words,
        development_walking: formData.development_walking,
        development_neurotic_traits: formData.development_neurotic_traits,
        development_nail_biting: formData.development_nail_biting,
        development_bedwetting: formData.development_bedwetting,
        development_phobias: formData.development_phobias,
        development_childhood_illness: formData.development_childhood_illness,
        provisional_diagnosis: formData.provisional_diagnosis,
        treatment_plan: formData.treatment_plan,
        consultant_comments: formData.consultant_comments,
      };
    }

    return baseData;
  };

  // Save current step data to API
  const saveCurrentStep = async (step) => {
    try {
      const stepData = prepareFormData(step);

      // ✅ Step 3: Update ADL file directly if it exists
      if (step === 3 && adlFileId) {
        try {
          // Extract only complex case fields for ADL update
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

          const adlUpdateData = {};
          complexCaseFields.forEach(field => {
            if (stepData[field] !== undefined && stepData[field] !== null) {
              adlUpdateData[field] = stepData[field];
            }
          });

          if (Object.keys(adlUpdateData).length > 0) {
            await updateADLFile({ id: adlFileId, ...adlUpdateData }).unwrap();
          }
        } catch (adlError) {
          console.error('[CreateClinicalProforma] Failed to update ADL file directly:', adlError);
          // Continue with clinical_proforma update even if ADL update fails
        }
      }

      // If onUpdate callback is provided (edit mode), use it instead of create
      if (onUpdate && savedProformaId) {
        await onUpdate({ id: savedProformaId, ...stepData });
        toast.success(`${getStepLabel(step)} saved successfully!`);
        return;
      }

      // Always create new proforma (create mode only)
      // Create new proforma (for step 1)
      const result = await createProforma(stepData).unwrap();
      const proforma = result.data?.clinical_proforma || result.data?.proforma || result.data?.clinical;
      setSavedProformaId(proforma?.id);
      toast.success(`${getStepLabel(step)} saved successfully!`);

      // ✅ Handle ADL file creation response - auto-open Step 3 and prefill
      // Backend returns: { success: true, data: { adlFile: ... } }
      const adlFile = result.data?.adlFile || result.data?.adl_file || result.data?.adl;
      if (adlFile && step === 2 && proforma?.doctor_decision === 'complex_case') {
        // Set ADL file ID for fetching later if needed
        if (adlFile.id) {
          setAdlFileId(adlFile.id);
        }

        // Prefill ADL form fields with adl_file data
        Object.keys(adlFile).forEach(key => {
          if (key !== 'id' && key !== 'created_at' && key !== 'updated_at' &&
            key !== 'patient_id' && key !== 'adl_no' && key !== 'created_by' &&
            key !== 'clinical_proforma_id' && key !== 'file_status' &&
            key !== 'file_created_date' && key !== 'total_visits' && key !== 'is_active') {
            // Only set if formData doesn't already have a value
            if (formData[key] === undefined || formData[key] === null || formData[key] === '') {
              setFormData(prev => ({ ...prev, [key]: adlFile[key] }));
            }
          }
        });

        // Auto-open Step 3
        setTimeout(() => {
          setCurrentStep(3);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          toast.info(`ADL File created: ${adlFile.adl_no || 'ADL-XXXXXX'}. Please complete the additional details.`);
        }, 500);
      } else if (adlFile && (step === 2 || step === 3)) {
        // Set ADL file ID for future fetches
        if (adlFile.id) {
          setAdlFileId(adlFile.id);
        }
        toast.info(`ADL File created: ${adlFile.adl_no || 'ADL-XXXXXX'} - Data saved to adl_files table`);
      }
      return proforma;
    } catch (err) {
      toast.error(err?.data?.message || `Failed to save ${getStepLabel(step)}`);
      throw err;
    }
  };

  // Navigation functions
  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    try {
      // Save current step data before moving to next
      await saveCurrentStep(currentStep);

      let nextStep = currentStep + 1;

      // Skip step 3 if it's not needed (simple case)
      if (nextStep === 3 && !showADLStep) {
        // For simple cases, we're done after Step 2 - submit the form
        // Create a synthetic event for form submission
        const syntheticEvent = { preventDefault: () => { } };
        handleSubmit(syntheticEvent);
        return;
      }

      if (nextStep <= totalSteps) {
        setCurrentStep(nextStep);
        // Scroll to top on step change
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      // Error already handled in saveCurrentStep, don't proceed to next step
      console.error('Failed to save step:', error);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Scroll to top on step change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToStep = (step) => {
    // Skip step 3 if it's not available (simple case)
    if (step === 3 && !showADLStep) {
      return; // Don't allow navigation to step 3 if it's hidden
    }

    // Only allow going to valid steps
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Get step labels
  const getStepLabel = (step) => {
    switch (step) {
      case 1: return 'Basic Information';
      case 2: return 'Clinical Proforma';
      case 3: return 'Additional Detail (ADL)';
      default: return '';
    }
  };

  // Function to save only Clinical Proforma fields (lines 1520-1868)
  const handleSaveClinicalProforma = async () => {
    debugger
    // Validate required fields
    // Ensure patient_id is valid (not empty string)
    const patientId = formData.patient_id || patientIdFromQuery;
    if (!patientId || patientId === '') {
      toast.error('Patient is required');
      return;
    }
    if (!formData.diagnosis) {
      toast.error('Diagnosis is required');
      return;
    }

    try {
      const join = (arr) => Array.isArray(arr) ? arr.join(', ') : arr;

      // Prepare data with only Clinical Proforma fields (from lines 1520-1868)

      const clinicalProformaData = {
        patient_id: patientId,
        visit_date: formData.visit_date || new Date().toISOString().split('T')[0],
        visit_type: formData.visit_type || 'first_visit',
        room_no: formData.room_no || '',
        assigned_doctor: formData.assigned_doctor_name || '',
        // Informant section
        informant_present: formData.informant_present,
        nature_of_information: formData.nature_of_information || '',
        // Present Illness
        onset_duration: formData.onset_duration || '',
        course: formData.course || '',
        precipitating_factor: formData.precipitating_factor || '',
        illness_duration: formData.illness_duration || '',
        current_episode_since: formData.current_episode_since || '',
        // Complaints / History of Presenting Illness
        mood: join(formData.mood || []),
        behaviour: join(formData.behaviour || []),
        speech: join(formData.speech || []),
        thought: join(formData.thought || []),
        perception: join(formData.perception || []),
        somatic: join(formData.somatic || []),
        bio_functions: join(formData.bio_functions || []),
        adjustment: join(formData.adjustment || []),
        cognitive_function: join(formData.cognitive_function || []),
        fits: join(formData.fits || []),
        sexual_problem: join(formData.sexual_problem || []),
        substance_use: join(formData.substance_use || []),
        // Mental State Examination
        mse_behaviour: join(formData.mse_behaviour || []),
        mse_affect: join(formData.mse_affect || []),
        mse_thought: join(formData.mse_thought || []),
        mse_delusions: formData.mse_delusions || '',
        mse_perception: join(formData.mse_perception || []),
        mse_cognitive_function: join(formData.mse_cognitive_function || []),
        // Additional History
        past_history: formData.past_history || '',
        family_history: formData.family_history || '',
        associated_medical_surgical: join(formData.associated_medical_surgical || []),
        // General Physical Examination
        gpe: formData.gpe || '',
        // Diagnosis & Management
        diagnosis: formData.diagnosis || '',
        icd_code: formData.icd_code || '',
        case_severity: formData.case_severity || 'mild',
        doctor_decision: formData.doctor_decision || 'simple_case',
        disposal: formData.disposal || '',
        workup_appointment: formData.workup_appointment || '',
        referred_to: formData.referred_to || '',
        requires_adl_file: formData.requires_adl_file || false,
        adl_reasoning: formData.adl_reasoning || '',
      };

      // If clinicalProformaId exists, update existing proforma
      // clinicalProformaId is now a UUID (string), not an integer
      let proformaIdForUpdate = null;
      
      if (clinicalProformaId) {
        // Validate it's a valid UUID format (36 chars with hyphens)
        const isUUID = typeof clinicalProformaId === 'string' && 
                      clinicalProformaId.includes('-') && 
                      clinicalProformaId.length === 36;
        
        if (isUUID) {
          proformaIdForUpdate = clinicalProformaId; // Use UUID as-is
        } else if (typeof clinicalProformaId === 'string' && clinicalProformaId.trim() !== '') {
          // If it's a non-empty string but not a UUID, still try to use it
          // (might be a legacy integer ID that was converted to string)
          proformaIdForUpdate = clinicalProformaId;
        }
      }

      if (proformaIdForUpdate) {
        let updateResult;
        if (onUpdate) {
          // Use callback if provided
          updateResult = await onUpdate({ id: proformaIdForUpdate, ...clinicalProformaData });
        } else {
          // Use update mutation - ID is now UUID (string)
          updateResult = await updateProforma({ id: proformaIdForUpdate, ...clinicalProformaData }).unwrap();
        }
        
        // Ensure savedProformaId is set
        if (!savedProformaId) {
          setSavedProformaId(proformaIdForUpdate);
        }
        
        // Check if update response includes ADL file ID
        const updatedProforma = updateResult?.data?.clinical_proforma || updateResult?.data?.proforma;
        if (updatedProforma?.adl_file_id) {
          setAdlFileId(updatedProforma.adl_file_id);
          console.log('[CreateClinicalProforma] ADL file ID from update response:', updatedProforma.adl_file_id);
        }
        
        // Refetch proforma data to get latest adl_file_id (in case it wasn't in the response)
        if (refetchProforma) {
          const refetchedData = await refetchProforma();
          const refetchedProforma = refetchedData?.data?.proforma || refetchedData?.data?.clinical_proforma;
          if (refetchedProforma?.adl_file_id) {
            setAdlFileId(refetchedProforma.adl_file_id);
            console.log('[CreateClinicalProforma] ADL file ID from refetch:', refetchedProforma.adl_file_id);
          }
        }
        
        toast.success('Clinical proforma updated successfully!');
        
        // For complex cases, keep the form open and expand the complex case section
        const isComplexCase = clinicalProformaData.doctor_decision === 'complex_case';
        if (isComplexCase) {
          // Keep form open, expand complex case section, and move to step 3
          setExpandedCards(prev => ({ ...prev, adl: true }));
          setCurrentStep(3);
          // Scroll to ADL section
          setTimeout(() => {
            const adlSection = document.querySelector('[data-adl-section]');
            if (adlSection) {
              adlSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
          // Don't navigate away - stay on the same page
          return;
        }
        
        // Navigate after update (only for simple cases or if explicitly requested)
        if (returnTab) {
          navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
        } else {
          navigate(`/clinical/${proformaIdForUpdate}`);
        }
      } else {
        // Create new proforma
        const result = await createProforma(clinicalProformaData).unwrap();
        const proforma = result.data?.clinical_proforma || result.data?.proforma || result.data?.clinical;
        
        if (proforma?.id) {
          setSavedProformaId(proforma.id);
        }

        toast.success('Clinical proforma created successfully!');

        // Check doctor's decision and create ADL file if complex case
        const doctorDecision = clinicalProformaData.doctor_decision || formData.doctor_decision;
        if (doctorDecision === 'complex_case') {
          try {
            // Ensure we have both patient_id and clinical_proforma_id
            if (!patientId || patientId === '') {
              toast.warning('Patient ID is required to create ADL file');
            } else if (!proforma?.id) {
              toast.warning('Clinical Proforma ID is required to create ADL file');
            } else {
              // Prepare ADL file data - ensure all UUID fields are valid
              const adlFileData = {
                patient_id: patientId, // UUID string
                clinical_proforma_id: proforma.id, // UUID string
              };

              // Validate that clinical_proforma_id is a valid UUID
              const isUUID = typeof adlFileData.clinical_proforma_id === 'string' && 
                            adlFileData.clinical_proforma_id.includes('-') && 
                            adlFileData.clinical_proforma_id.length === 36;
              
              if (!isUUID && !adlFileData.clinical_proforma_id) {
                toast.error('Invalid Clinical Proforma ID');
                return;
              }

              // Create ADL file
              const adlResult = await createADLFile(adlFileData).unwrap();
              // Backend returns: { success: true, data: { adlFile: ... } }
              const createdADLFile = adlResult.data?.adlFile || adlResult.data?.adl_file || adlResult.data?.file;
              
              if (createdADLFile) {
                toast.success(`ADL File created successfully: ${createdADLFile.adl_no || 'ADL-XXXXXX'}`);
                // Store ADL file ID for potential future use
                if (createdADLFile.id) {
                  setAdlFileId(createdADLFile.id);
                }
              }
            }
          } catch (adlError) {
            console.error('Failed to create ADL file:', adlError);
            toast.error(adlError?.data?.message || 'Clinical proforma created, but failed to create ADL file');
          }
        }

        // Handle existing ADL file creation from backend response (if any)
        // Backend returns: { success: true, data: { adlFile: ... } }
        const adlFile = result.data?.adlFile || result.data?.adl_file || result.data?.adl;
        if (adlFile && (adlFile.adl_no || adlFile.created)) {
          toast.info(`ADL File created: ${adlFile.adl_no || 'ADL-XXXXXX'}`);
        }

        // Navigate to proforma details, or back to Today Patients if returnTab exists
        if (returnTab) {
          navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
        } else if (proforma?.id) {
          navigate(`/clinical/${proforma.id}`);
        }
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save clinical proforma');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {

      // Format prescriptions: filter out empty rows and create formatted text
      const validPrescriptions = prescriptions.filter(p =>
        p.medicine || p.dosage || p.frequency || p.details || p.when || p.duration || p.qty || p.notes
      );

      // Create prescription text from valid prescriptions
      const prescriptionText = validPrescriptions.length > 0
        ? validPrescriptions
          ?.map((p, idx) =>
            `${idx + 1}. ${p.medicine || ''} | ${p.dosage || ''} | ${p.when || ''} | ${p.frequency || ''} | ${p.duration || ''} | ${p.qty || ''} | ${p.details || ''} | ${p.notes || ''}`
          )
          .join('\n')
        : (formData.treatment_prescribed || '');

      // Prepare final data with all fields including prescription
      const finalData = prepareFormData(3); // Get all data from step 3 (most complete)
      const submitData = {
        ...finalData,
        treatment_prescribed: prescriptionText,
        prescriptions: validPrescriptions, // Include structured prescription data
      };

      // If onUpdate callback is provided (edit mode), use it instead of create
      if (onUpdate && proformaId) {
        await onUpdate({ id: proformaId, ...submitData });
        return;
      }

      // Create new proforma (this shouldn't happen if step-wise saving works, but handle it as fallback)
      const result = await createProforma(submitData).unwrap();

      // Clear saved prescription from localStorage after successful submission
      try {
        const storedPrescriptions = JSON.parse(localStorage.getItem('patient_prescriptions') || '{}');
        if (storedPrescriptions[formData.patient_id]) {
          delete storedPrescriptions[formData.patient_id];
          localStorage.setItem('patient_prescriptions', JSON.stringify(storedPrescriptions));
        }
      } catch (e) {
        // Ignore localStorage errors
      }

      toast.success('Clinical proforma created successfully!');

      // Handle ADL file creation in final submit
      const proforma = result.data?.proforma || result.data?.clinical;
      // Backend returns: { success: true, data: { adlFile: ... } }
      const adlFile = result.data?.adlFile || result.data?.adl_file || result.data?.adl;
      if (adlFile && (adlFile.adl_no || adlFile.created)) {
        toast.info(`ADL File created: ${adlFile.adl_no || 'ADL-XXXXXX'}`);
      }

      // Navigate to proforma details, or back to Today Patients if returnTab exists
      if (returnTab) {
        navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
      } else {
        navigate(`/clinical/${proforma?.id || savedProformaId}`);
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save clinical proforma');
    }
  };

  // Auto-select patient when exact CR match found
  useEffect(() => {
    if (!patientsData?.data?.patients || formData.patient_id) return;

    const patients = patientsData.data.patients;

    // If searching for a CR number, auto-select exact match
    if (patientSearch && patientSearch.startsWith('CR')) {
      const exactMatch = patients.find(p =>
        p.cr_no === patientSearch || p.cr_no === patientSearch.toUpperCase()
      );

      if (exactMatch) {
        setFormData(prev => ({
          ...prev,
          patient_id: exactMatch.id.toString(),
          visit_type: 'follow_up' // Previous patient, so follow-up visit
        }));
        toast.success(`Patient found: ${exactMatch.name} (${exactMatch.cr_no})`);
      }
    } else if (patients.length === 1) {
      // Auto-select if only one result found
      setFormData(prev => ({
        ...prev,
        patient_id: patients[0].id.toString(),
        visit_type: 'follow_up'
      }));
    }
  }, [patientsData, patientSearch]);

  // Create patient options (prioritize exact CR matches)
  const patientOptions = (() => {
    if (!patientsData?.data?.patients) return [];

    const patients = patientsData.data.patients;

    // If searching for CR number, prioritize exact match
    if (patientSearch && patientSearch.startsWith('CR')) {
      const exactMatch = patients.find(p =>
        p.cr_no === patientSearch || p.cr_no === patientSearch.toUpperCase()
      );

      if (exactMatch) {
        return [{
          value: exactMatch.id,
          label: `${exactMatch.name} (${exactMatch.cr_no}) - EXACT MATCH`,
        }];
      }
    }

    // Default: return all patients with CR numbers
    return patients.slice(0, 5)?.map(p => ({
      value: p.id,
      label: `${p.name} (${p.cr_no})`,
    }));
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-teal-50">
      <div className="w-full px-6 py-8 space-y-8">
        {/* Header */}
        <div className="relative">

        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Main Card: Clinical Proforma - Contains all sections */}
            <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
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
                  </div>
                </div>
                {expandedCards.clinicalProforma ? (
                  <FiChevronUp className="h-6 w-6 text-gray-500 " />
                ) : (
                  <FiChevronDown className="h-6 w-6 text-gray-500" />
                )}
              </div>
              {expandedCards.clinicalProforma && (
                <div className="space-y-8">
                  {/* Informant Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                      <div className="p-2 bg-sky-100 rounded-lg">
                        <FiUser className="w-6 h-6 text-sky-600" />
                      </div>
                      <span className="text-xl font-bold text-gray-900">Informant</span>
                    </div>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Input
                          label="Date"
                          name="date"
                          value={fullPatientData?.data?.patient?.date || ''}
                          onChange={handleChange}
                          defaultToday={true}
                          disabled={true}
                          className="disabled:bg-gray-200 disabled:cursor-not-allowed"
                        />
                        <Input
                          label="Patient Name"
                          value={fullPatientData?.data?.patient?.name || ''}
                          onChange={handleChange}
                          disabled={true}
                          className="disabled:bg-gray-200 disabled:cursor-not-allowed"
                        />
                        <Input
                          label="Age"
                          value={fullPatientData?.data?.patient?.age || ''}
                          onChange={handleChange}
                          disabled={true}
                          className="disabled:bg-gray-200 disabled:cursor-not-allowed"
                        />
                        <Input
                          label="Sex"
                          value={fullPatientData?.data?.patient?.sex || ''}
                          onChange={handleChange}
                          disabled={true}
                          className="disabled:bg-gray-200 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                          <FiUser className="w-5 h-5 text-sky-600" />
                          <span>Informant Present/Absent</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {[
                            { v: true, t: 'Present' },
                            { v: false, t: 'Absent' },
                          ]?.map(({ v, t }) => (
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
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                          <FiClipboard className="w-5 h-5 text-indigo-600" />
                          <span>Nature of information</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {['Reliable', 'Unreliable', 'Adequate', 'Inadequate']?.map((opt) => (
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
                      </div>
                    </div>
                  </div>

                  {/* Present Illness Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <FiActivity className="w-6 h-6 text-amber-600" />
                      </div>
                      <span className="text-xl font-bold text-gray-900">Present Illness</span>
                    </div>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                            <FiActivity className="w-5 h-5 text-violet-600" />
                            <span>Onset</span>
                          </div>
                          <div className="flex flex-col md:flex-row md:flex-wrap gap-3">
                            {[{ v: '<1_week', t: '1. < 1 week' }, { v: '1w_1m', t: '2. 1 week – 1 month' }, { v: '>1_month', t: '3. > 1 month' }, { v: 'not_known', t: '4. Not known' }]?.map(({ v, t }) => (
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
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                            <FiList className="w-5 h-5 text-amber-600" />
                            <span>Course</span>
                          </div>
                          <div className="flex flex-col md:flex-row md:flex-wrap gap-3">
                            {['Continuous', 'Episodic', 'Fluctuating', 'Deteriorating', 'Improving']?.map((opt) => (
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                            <FiEdit3 className="w-5 h-5 text-rose-600" />
                            <span>Precipitating factor</span>
                          </div>
                          <Textarea
                            name="precipitating_factor"
                            value={formData.precipitating_factor}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Describe key precipitating factors"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                            <FiClock className="w-5 h-5 text-amber-600" />
                            <span>Total duration of illness</span>
                          </div>
                          <Input
                            name="illness_duration"
                            value={formData.illness_duration}
                            onChange={handleChange}
                            placeholder="e.g., 6 months"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                          <FiClock className="w-5 h-5 text-indigo-600" />
                          <span>Current episode duration / Worsening since</span>
                        </div>
                        <Input
                          name="current_episode_since"
                          value={formData.current_episode_since}
                          onChange={handleChange}
                          placeholder="e.g., 2 weeks, since last month, progressively worsening"
                          type="text"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Complaints / History of Presenting Illness Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <FiList className="w-6 h-6 text-amber-600" />
                      </div>
                      <span className="text-xl font-bold text-gray-900">Complaints / History of Presenting Illness</span>
                    </div>
                    <div className="space-y-6">
                      <CheckboxGroup label="Mood" name="mood" value={formData.mood} onChange={handleChange} options={['Anxious', 'Sad', 'Cheerful', 'Agitated', 'Fearful', 'Irritable']} />
                      <CheckboxGroup label="Behaviour" name="behaviour" value={formData.behaviour} onChange={handleChange} options={['Suspiciousness', 'Talking/Smiling to self', 'Hallucinatory behaviour', 'Increased goal-directed activity', 'Compulsions', 'Apathy', 'Anhedonia', 'Avolution', 'Stupor', 'Posturing', 'Stereotypy', 'Ambitendency', 'Disinhibition', 'Impulsivity', 'Anger outbursts', 'Suicide/self-harm attempts']} />
                      <CheckboxGroup label="Speech" name="speech" value={formData.speech} onChange={handleChange} options={['Irrelevant', 'Incoherent', 'Pressure', 'Alogia', 'Mutism']} />
                      <CheckboxGroup label="Thought" name="thought" value={formData.thought} onChange={handleChange} options={['Reference', 'Persecution', 'Grandiose', 'Love Infidelity', 'Bizarre', 'Pessimism', 'Worthlessness', 'Guilt', 'Poverty', 'Nihilism', 'Hypochondriasis', 'Wish to die', 'Active suicidal ideation', 'Plans', 'Worries', 'Obsessions', 'Phobias', 'Panic attacks']} />
                      <CheckboxGroup label="Perception" name="perception" value={formData.perception} onChange={handleChange} options={['Hallucination - Auditory', 'Hallucination - Visual', 'Hallucination - Tactile', 'Hallucination - Olfactory', 'Passivity', 'Depersonalization', 'Derealization']} />
                      <CheckboxGroup label="Somatic" name="somatic" value={formData.somatic} onChange={handleChange} options={['Pains', 'Numbness', 'Weakness', 'Fatigue', 'Tremors', 'Palpitations', 'Dyspnoea', 'Dizziness']} />
                      <CheckboxGroup label="Bio-functions" name="bio_functions" value={formData.bio_functions} onChange={handleChange} options={['Sleep', 'Appetite', 'Bowel/Bladder', 'Self-care']} />
                      <CheckboxGroup label="Adjustment" name="adjustment" value={formData.adjustment} onChange={handleChange} options={['Work output', 'Socialization']} />
                      <CheckboxGroup label="Cognitive function" name="cognitive_function" value={formData.cognitive_function} onChange={handleChange} options={['Disorientation', 'Inattention', 'Impaired Memory', 'Intelligence']} />
                      <CheckboxGroup label="Fits" name="fits" value={formData.fits} onChange={handleChange} options={['Epileptic', 'Dissociative', 'Mixed', 'Not clear']} />
                      <CheckboxGroup label="Sexual problem" name="sexual_problem" value={formData.sexual_problem} onChange={handleChange} options={['Dhat', 'Poor erection', 'Early ejaculation', 'Decreased desire', 'Perversion', 'Homosexuality', 'Gender dysphoria']} />
                      <CheckboxGroup label="Substance Use" name="substance_use" value={formData.substance_use} onChange={handleChange} options={['Alcohol', 'Opioid', 'Cannabis', 'Benzodiazepines', 'Tobacco']} />
                    </div>
                  </div>

                  {/* Mental State Examination Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                      <div className="p-2 bg-violet-100 rounded-lg">
                        <FiActivity className="w-6 h-6 text-violet-600" />
                      </div>
                      <span className="text-xl font-bold text-gray-900">Mental State Examination (MSE)</span>
                    </div>
                    <div className="space-y-6">
                      <CheckboxGroup label="Behaviour" name="mse_behaviour" value={formData.mse_behaviour} onChange={handleChange} options={['Uncooperative', 'Unkempt', 'Fearful', 'Odd', 'Suspicious', 'Retarded', 'Excited', 'Aggressive', 'Apathetic', 'Catatonic', 'Demonstrative']} />
                      <CheckboxGroup label="Affect & Mood" name="mse_affect" value={formData.mse_affect} onChange={handleChange} options={['Sad', 'Anxious', 'Elated', 'Inappropriate', 'Blunted', 'Labile']} />
                      <CheckboxGroup
                        label="Thought (Flow, Form, Content)"
                        name="mse_thought"
                        value={formData.mse_thought}
                        onChange={handleChange}
                        options={['Depressive', 'Suicidal', 'Obsessions', 'Hypochondriacal', 'Preoccupations', 'Worries']}
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
                      <CheckboxGroup label="Perception" name="mse_perception" value={formData.mse_perception} onChange={handleChange} options={['Hallucinations - Auditory', 'Hallucinations - Visual', 'Hallucinations - Tactile', 'Hallucinations - Olfactory', 'Illusions', 'Depersonalization', 'Derealization']} />
                      <CheckboxGroup label="Cognitive functions" name="mse_cognitive_function" value={formData.mse_cognitive_function} onChange={handleChange} options={['Impaired', 'Not impaired']} />
                    </div>
                  </div>

                  {/* Additional History Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <FiCheckSquare className="w-6 h-6 text-emerald-600" />
                      </div>
                      <span className="text-xl font-bold text-gray-900">Additional History</span>
                    </div>
                    <div className="space-y-6">
                      <CheckboxGroup label="Bio-Functions (Sleep, Appetite, etc.)" name="bio_functions" value={formData.bio_functions} onChange={handleChange} options={['Sleep', 'Appetite', 'Bowel/Bladder', 'Self-care']} />
                      <CheckboxGroup label="Substance Use" name="substance_use" value={formData.substance_use} onChange={handleChange} options={['Alcohol', 'Opioid', 'Cannabis', 'Benzodiazepines', 'Tobacco']} />
                      <CheckboxGroup label="Past Psychiatric History" name="past_history" value={Array.isArray(formData.past_history) ? formData.past_history : []} onChange={handleChange} options={[]} />
                      <CheckboxGroup label="Family History" name="family_history" value={Array.isArray(formData.family_history) ? formData.family_history : []} onChange={handleChange} options={[]} />
                      <CheckboxGroup label="Associated Medical/Surgical Illness" name="associated_medical_surgical" value={formData.associated_medical_surgical} onChange={handleChange} options={['Hypertension', 'Diabetes', 'Dyslipidemia', 'Thyroid dysfunction']} />
                    </div>
                  </div>

                  {/* General Physical Examination Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                      <div className="p-2 bg-rose-100 rounded-lg">
                        <FiHeart className="w-6 h-6 text-rose-600" />
                      </div>
                      <span className="text-xl font-bold text-gray-900">General Physical Examination</span>
                    </div>
                    <div className="space-y-6">
                      <Textarea
                        label="GPE Findings"
                        name="gpe"
                        value={formData.gpe}
                        onChange={handleChange}
                        placeholder="BP, Pulse, Weight, BMI, General appearance, Systemic examination..."
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Diagnosis & Management Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                      <div className="p-2 bg-cyan-100 rounded-lg">
                        <FiFileText className="w-6 h-6 text-cyan-600" />
                      </div>
                      <span className="text-xl font-bold text-gray-900">Diagnosis & Management</span>
                    </div>
                    <div className="space-y-6">
                      <Textarea
                        label="Diagnosis"
                        name="diagnosis"
                        value={formData.diagnosis}
                        onChange={handleChange}
                        placeholder="Primary and secondary diagnoses..."
                        rows={3}
                        required
                      />
                      <ICD11CodeSelector
                        value={formData.icd_code}
                        onChange={handleChange}
                        error={errors.icd_code}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                          label="Case Severity"
                          name="case_severity"
                          value={formData.case_severity}
                          onChange={handleChange}
                          options={CASE_SEVERITY}
                          required
                        />
                        <Select
                          label="Doctor Decision"
                          name="doctor_decision"
                          value={formData.doctor_decision}
                          onChange={handleChange}
                          options={DOCTOR_DECISION}
                          required
                        />
                      </div>
                      <Textarea
                        label="Disposal & Referral"
                        name="disposal"
                        value={formData.disposal}
                        onChange={handleChange}
                        placeholder="Admission, discharge, follow-up..."
                        rows={2}
                      />
                      <Input
                        label="Workup Appointment"
                        type="date"
                        name="workup_appointment"
                        value={formData.workup_appointment}
                        onChange={handleChange}
                      />
                      <Textarea
                        label="Referred To"
                        name="referred_to"
                        value={formData.referred_to}
                        onChange={handleChange}
                        placeholder="Other departments or specialists..."
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Submit Button - Inside Clinical Proforma Card */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (returnTab) {
                          navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
                        } else {
                          navigate('/clinical-today-patients');
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSaveClinicalProforma}
                      loading={isCreating || isUpdating}
                      disabled={isCreating || isUpdating}
                      className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-700 hover:to-indigo-700"
                    >
                      <FiSave className="w-4 h-4" />
                      {(isCreating || isUpdating) ? 'Saving...' : (clinicalProformaId ? 'Update Clinical Proforma' : 'Create Clinical Proforma')}
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Card 2: ADL File - Only shown when complex case is selected */}
            {showADLStep && (
              <Card
                title={
                  <div className="flex items-center justify-between w-full cursor-pointer" onClick={() => toggleCard('adl')}>
                    <div className="flex items-center gap-3">
                      <div className=" bg-purple-100 rounded-lg">
                        <FiFolder className="w-6 h-6 text-purple-600" />
                      </div>
                      <span className="text-xl font-bold text-gray-900">ADL File</span>
                    </div>
                    {expandedCards.adl ? (
                      <FiChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <FiChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                }
                className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
                data-adl-section="true"
              >
                {expandedCards.adl && (
                  <CreateADL
                    patientId={formData.patient_id}
                    clinicalProformaId={savedProformaId || clinicalProformaId}
                    returnTab={returnTab}
                    key={`adl-${savedProformaId || clinicalProformaId}-${existingProforma?.adl_file_id || ''}`}
                    onSuccess={(result) => {
                      // Keep ADL card expanded after successful submission
                      console.log('[CreateClinicalProforma] ADL file saved successfully, keeping card open');
                      setExpandedCards(prev => ({ ...prev, adl: true }));
                      // Update adlFileId if we got it from the result
                      // Backend returns: { success: true, data: { adlFile: ... } }
                      const resultAdlFile = result?.data?.adlFile || result?.data?.adl_file || result?.data?.file;
                      if (resultAdlFile?.id) {
                        setAdlFileId(resultAdlFile.id);
                      }
                      // Refetch proforma to get latest adl_file_id
                      if (refetchProforma) {
                        refetchProforma();
                      }
                      // Expand prescription card after ADL is saved
                      setTimeout(() => {
                        setExpandedCards(prev => ({ ...prev, prescription: true }));
                        // Scroll to prescription section
                        const prescriptionSection = document.querySelector('[data-prescription-section]');
                        if (prescriptionSection) {
                          prescriptionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 300);
                    }}
                  />
                )}
              </Card>
            )}

            {/* Card 3: Prescription */}
            <Card
              title={
                <div className="flex items-center justify-between w-full cursor-pointer" onClick={() => toggleCard('prescription')}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <FiFileText className="w-6 h-6 text-amber-600" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">Prescription</span>
                  </div>
                  {expandedCards.prescription ? (
                    <FiChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <FiChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </div>
              }
              className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
              data-prescription-section="true"
            >
              {expandedCards.prescription && (
                <>
                  <CreatePrescription
                    patientId={formData.patient_id}
                    clinicalProformaId={savedProformaId || clinicalProformaId}
                    returnTab={returnTab}
                    currentUser={formData.currentUser}
                    prescriptions={prescriptions}
                    setPrescriptions={setPrescriptions}
                    addPrescriptionRow={formData.addPrescriptionRow}
                    updatePrescriptionCell={formData.updatePrescriptionCell}
                    selectMedicine={formData.selectMedicine}
                    handleMedicineKeyDown={formData.handleMedicineKeyDown}
                    removePrescriptionRow={formData.removePrescriptionRow}
                    clearAllPrescriptions={formData.clearAllPrescriptions}
                    handleSave={formData.handleSave}
                    handlePrint={formData.handlePrint}
                    formatDateFull={formData.formatDateFull}
                    formatDate={formData.formatDate}
                  />
                </>
              )}
            </Card>

          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClinicalProforma;

