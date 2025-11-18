import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  useGetClinicalProformaByIdQuery,
  useUpdateClinicalProformaMutation,
  useGetClinicalOptionsQuery,
  useAddClinicalOptionMutation,
  useDeleteClinicalOptionMutation
} from '../../features/clinical/clinicalApiSlice';
import { useGetADLFileByIdQuery, useUpdateADLFileMutation } from '../../features/adl/adlApiSlice';
import { useGetPatientByIdQuery } from '../../features/patients/patientsApiSlice';
import { useGetDoctorsQuery } from '../../features/users/usersApiSlice';
import { CLINICAL_PROFORMA_FORM, VISIT_TYPES, DOCTOR_DECISION, CASE_SEVERITY } from '../../utils/constants';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import { FiArrowLeft, FiAlertCircle, FiSave, FiHeart, FiActivity, FiUser, FiClipboard, FiList, FiCheckSquare, FiFileText, FiX, FiPlus, FiChevronDown, FiChevronUp, FiLoader } from 'react-icons/fi';
import icd11Codes from '../../assets/ICD11_Codes.json';


import DatePicker from '../../components/CustomDatePicker';

const IconInput = ({ icon, label, loading = false, error, defaultValue, ...props }) => {
  // Remove defaultValue if value is provided to avoid controlled/uncontrolled warning
  const inputProps = props.value !== undefined ? { ...props } : { ...props, defaultValue };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
        {icon && <span className="text-primary-600">{icon}</span>}
        {label}
        {loading && (
          <FiLoader className="w-4 h-4 text-blue-500 animate-spin" />
        )}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <span className="text-gray-500">{icon}</span>
          </div>
        )}
        <input
          {...inputProps}
          className={`w-full px-4 py-3 ${icon ? 'pl-11' : 'pl-4'} bg-white/60 backdrop-blur-md border-2 border-gray-300/60 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white/80 transition-all duration-300 hover:bg-white/70 hover:border-primary-400/70 placeholder:text-gray-400 text-gray-900 font-medium ${inputProps.className || ''}`}
        />
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-medium">
          <FiX className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};
// CheckboxGroup Component
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
    setLocalOptions((prev) => prev.filter((o) => o !== opt));
    if (value.includes(opt)) {
      const next = value.filter((v) => v !== opt);
      onChange({ target: { name, value: next } });
    }
    deleteOption({ group: name, label: opt }).catch(() => { });
  };

  const handleAddClick = () => setShowAdd(true);
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
      <div className="flex flex-wrap items-center gap-3">
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
              <Button
                type="button"
                onClick={handleCancelAdd}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 px-3 py-1.5 rounded-md flex items-center gap-2 text-sm hover:from-red-600 hover:to-red-700 hover:shadow-xl hover:shadow-red-500/40"
              >
                <FiX className="w-4 h-4" /> Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveAdd}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 px-3 py-1.5 rounded-md flex items-center gap-2 text-sm hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:shadow-green-500/40"
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

// ICD-11 Code Selector Component
const ICD11CodeSelector = ({ value, onChange, error }) => {
  const [selectedPath, setSelectedPath] = useState([]);
  const [selectedCode, setSelectedCode] = useState(value || '');

  const getChildren = (levelIndex, parentItem) => {
    if (levelIndex === 0) {
      return icd11Codes.filter(item => item.level === 0);
    }
    if (!parentItem && levelIndex > 0) return [];
    const level = levelIndex;
    return icd11Codes.filter(item => {
      if (item.level !== level) return false;
      if (level === 1) {
        const level0Code = selectedPath[0]?.code || '';
        return item.parent_code === level0Code;
      } else if (level === 2) {
        const level0Code = selectedPath[0]?.code || '';
        const level1Item = selectedPath[1];
        const level1Code = level1Item?.code || '';
        if (level1Code && item.parent_code === level1Code) return true;
        if (item.parent_code === level0Code) return true;
        if (item.parent_code === '' && level0Code && item.code) {
          if (level0Code === '06' && item.code.startsWith('6')) return true;
          if (item.code.startsWith(level0Code)) return true;
        }
        return false;
      } else {
        const prevLevelItem = selectedPath[levelIndex - 1];
        if (!prevLevelItem) return false;
        const prevLevelCode = prevLevelItem.code || '';
        return item.parent_code === prevLevelCode;
      }
    });
  };

  useEffect(() => {
    if (value && !selectedPath.length && value !== selectedCode) {
      const codeItem = icd11Codes.find(item => item.code === value);
      if (codeItem) {
        const path = [];
        let current = codeItem;
        while (current) {
          path.unshift(current);
          let parent = null;
          if (current.parent_code) {
            parent = icd11Codes.find(item => item.code === current.parent_code);
            if (!parent && current.level > 0) {
              if (current.level === 1) {
                parent = icd11Codes.find(item => item.level === 0 && item.code === current.parent_code);
              } else if (current.level === 2) {
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
  }, [value]);

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
      <div className="flex flex-wrap items-end gap-4">
        {renderDropdown(0)}
        {selectedPath[0] && renderDropdown(1)}
        {selectedPath[1] && renderDropdown(2)}
        {selectedPath[2] && selectedPath[2].has_children && renderDropdown(3)}
        {selectedPath[3] && selectedPath[3].has_children && renderDropdown(4)}
        {selectedPath[4] && selectedPath[4].has_children && renderDropdown(5)}
      </div>
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
        </div>
      )}
    </div>
  );
};

const EditClinicalProforma = ({ initialData: propInitialData = null, onUpdate: propOnUpdate = null, onFormDataChange = null }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTab = searchParams.get('returnTab');
  const returnPath = searchParams.get('returnPath');

  // Fetch clinical proforma data only if id exists and no initialData prop provided
  const {
    data: proformaData,
    isLoading: isLoadingProforma,
    isError: isErrorProforma,
    error: proformaError
  } = useGetClinicalProformaByIdQuery(id, { skip: !id || !!propInitialData });

  // Use propInitialData if provided, otherwise use fetched data
  const proforma = propInitialData ? null : (proformaData?.data?.proforma);
  const isComplexCase = proforma?.doctor_decision === 'complex_case' && proforma?.adl_file_id;

  // Fetch ADL file data if this is a complex case
  const {
    data: adlFileData,
    isLoading: isLoadingADL
  } = useGetADLFileByIdQuery(
    proforma?.adl_file_id,
    { skip: !isComplexCase }
  );

  const adlFile = adlFileData?.data?.adlFile || adlFileData?.data?.file;

  // Fetch patient data - use patient_id from propInitialData or proforma
  const patientId = propInitialData?.patient_id || proforma?.patient_id;
  const { data: patientData } = useGetPatientByIdQuery(
    patientId,
    { skip: !patientId }
  );
  const patient = patientData?.data?.patient;

  // Fetch doctors list
  const { data: doctorsData } = useGetDoctorsQuery({ page: 1, limit: 100 });
  const doctors = doctorsData?.data?.doctors || [];

  // Update mutations
  const [updateProforma, { isLoading: isUpdating }] = useUpdateClinicalProformaMutation();
  const [updateADLFile] = useUpdateADLFileMutation();

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
      return {
        patient_id: propInitialData.patient_id || '',
        visit_date: propInitialData.visit_date || new Date().toISOString().split('T')[0],
        visit_type: propInitialData.visit_type || 'first_visit',
        room_no: propInitialData.room_no || '',
        assigned_doctor: propInitialData.assigned_doctor || '',
        informant_present: propInitialData.informant_present ?? true,
        nature_of_information: propInitialData.nature_of_information || '',
        onset_duration: propInitialData.onset_duration || '',
        course: propInitialData.course || '',
        precipitating_factor: propInitialData.precipitating_factor || '',
        illness_duration: propInitialData.illness_duration || '',
        current_episode_since: propInitialData.current_episode_since || '',
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
        past_history: propInitialData.past_history || '',
        family_history: propInitialData.family_history || '',
        associated_medical_surgical: normalizeArrayField(propInitialData.associated_medical_surgical),
        mse_behaviour: normalizeArrayField(propInitialData.mse_behaviour),
        mse_affect: normalizeArrayField(propInitialData.mse_affect),
        mse_thought: propInitialData.mse_thought || '',
        mse_delusions: propInitialData.mse_delusions || '',
        mse_perception: normalizeArrayField(propInitialData.mse_perception),
        mse_cognitive_function: normalizeArrayField(propInitialData.mse_cognitive_function),
        gpe: propInitialData.gpe || '',
        diagnosis: propInitialData.diagnosis || '',
        icd_code: propInitialData.icd_code || '',
        disposal: propInitialData.disposal || '',
        workup_appointment: propInitialData.workup_appointment || '',
        referred_to: propInitialData.referred_to || '',
        treatment_prescribed: propInitialData.treatment_prescribed || '',
        doctor_decision: propInitialData.doctor_decision || 'simple_case',
        case_severity: propInitialData.case_severity || '',
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
        case_severity: '',
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
      case_severity: proforma.case_severity || '',
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
    case_severity: '',
  };

  const [formData, setFormData] = useState(initialFormData || defaultFormData);
  const [errors, setErrors] = useState({});

  // Card expand/collapse state
  const [expandedCards, setExpandedCards] = useState({
    clinicalProforma: true, // Default to expanded
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
      // Only update if this is the first time or if key fields have changed
      const shouldUpdate = !prevData ||
        prevData.patient_id !== initialFormData.patient_id ||
        (prevData.doctor_decision !== initialFormData.doctor_decision && prevData.patient_id === initialFormData.patient_id);

      if (shouldUpdate) {
        setFormData(initialFormData);
        // Notify parent of initial form data
        if (onFormDataChange) {
          onFormDataChange(initialFormData);
        }
        prevInitialDataRef.current = initialFormData;
      }
    }
  }, [initialFormData, onFormDataChange]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: newValue,
      };
      // Notify parent component of form data changes, especially doctor_decision
      if (onFormDataChange) {
        onFormDataChange(updated);
      }
      return updated;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.patient_id) newErrors.patient_id = 'Patient is required';
    if (!formData.visit_date) newErrors.visit_date = 'Visit date is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      // If using initialData prop and onUpdate callback is provided, use it
      if (propInitialData && propOnUpdate) {
        const join = (arr) => Array.isArray(arr) ? arr.join(', ') : arr;
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
          case_severity: formData.case_severity,
        };
        await propOnUpdate(updateData);
        toast.success('Clinical proforma updated successfully!');
        return;
      }

      // If no proforma exists, show error (can't update non-existent record)
      if (!proforma || !id) {
        toast.error('Cannot update: Clinical proforma not found. Please create a new one first.');
        return;
      }

      const join = (arr) => Array.isArray(arr) ? arr.join(', ') : arr;

      const updateData = {
        id: id,
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
        case_severity: formData.case_severity,
      };

      await updateProforma(updateData).unwrap();
      toast.success('Clinical proforma updated successfully!');

      if (returnPath) {
        navigate(decodeURIComponent(returnPath));
      } else if (returnTab) {
        navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
      } else {
        navigate(`/clinical/${id}`);
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update clinical proforma');
    }
  };

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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Clinical Proforma</h2>
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
    <form onSubmit={handleSubmit}>
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
                <CheckboxGroup label="MSE - Behaviour" name="mse_behaviour" value={formData.mse_behaviour || []} onChange={handleChange} options={defaultOptions.mse_behaviour} />
                <CheckboxGroup label="MSE - Affect & Mood" name="mse_affect" value={formData.mse_affect || []} onChange={handleChange} options={defaultOptions.mse_affect} />
                <CheckboxGroup
                  label="MSE - Thought (Flow, Form, Content)"
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
                <CheckboxGroup label="MSE - Perception" name="mse_perception" value={formData.mse_perception || []} onChange={handleChange} options={defaultOptions.mse_perception} />
                <CheckboxGroup label="MSE - Cognitive Functions" name="mse_cognitive_function" value={formData.mse_cognitive_function || []} onChange={handleChange} options={defaultOptions.mse_cognitive_function} />
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
                  <Select
                    label="Case Severity"
                    name="case_severity"
                    value={formData.case_severity}
                    onChange={handleChange}
                    options={CASE_SEVERITY}
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
                  rows={2}
                  placeholder="Admission, discharge, follow-up..."
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
              </div>
            </div>

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
                loading={isUpdating}
                disabled={isUpdating}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 px-4 py-2 rounded-md transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave className="w-4 h-4" />
                {isUpdating ? 'Updating...' : 'Update Clinical Proforma'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </form>
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
