import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiUser, FiUsers, FiBriefcase, FiDollarSign, FiHome, FiMapPin, FiPhone,
  FiCalendar, FiGlobe, FiFileText, FiHash, FiClock,
  FiHeart, FiBookOpen, FiTrendingUp, FiShield,
  FiNavigation, FiTruck, FiEdit3, FiSave, FiX, FiLayers, FiLoader,
  FiFolder, FiChevronDown, FiChevronUp, FiPackage, FiEdit, FiPlus, FiTrash2, FiCheck
} from 'react-icons/fi';
import { useUpdatePatientMutation, useAssignPatientMutation, useCheckCRNumberExistsQuery } from '../../features/patients/patientsApiSlice';
import { useGetDoctorsQuery } from '../../features/users/usersApiSlice';
import Card from '../../components/Card';
import Select from '../../components/Select';
import Button from '../../components/Button';
import DatePicker from '../../components/CustomDatePicker';
import Badge from '../../components/Badge';
import { formatDate, formatDateTime } from '../../utils/formatters';
import CreateClinicalProforma from '../clinical/CreateClinicalProforma';
import { useGetClinicalProformaByIdQuery } from '../../features/clinical/clinicalApiSlice';
import { useGetADLFileByIdQuery } from '../../features/adl/adlApiSlice';
import { useGetPrescriptionsByProformaIdQuery, useCreateBulkPrescriptionsMutation } from '../../features/prescriptions/prescriptionApiSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  MARITAL_STATUS, FAMILY_TYPE_OPTIONS, LOCALITY_OPTIONS, RELIGION_OPTIONS, SEX_OPTIONS,
  AGE_GROUP_OPTIONS, OCCUPATION_OPTIONS, EDUCATION_OPTIONS,
  MOBILITY_OPTIONS, REFERRED_BY_OPTIONS, INDIAN_STATES, UNIT_DAYS_OPTIONS,
  isJR, isSR, HEAD_RELATIONSHIP_OPTIONS, CATEGORY_OPTIONS, isAdmin, isJrSr
} from '../../utils/constants';
import EditClinicalProforma from '../clinical/EditClinicalProforma';
import EditADL from '../adl/EditADL';
import medicinesData from '../../assets/psychiatric_meds_india.json';

// Prescription Card Component for displaying prescriptions per proforma



const SelectWithOther = ({
  customValue,
  setCustomValue,
  showCustomInput,
  formData,
  customFieldName,
  inputLabel = "Specify",
  ...selectProps
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customInputValue, setCustomInputValue] = useState(customValue || formData[customFieldName] || '');
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const customInputRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, width: 0 });

  // Check if "others" or "other" is selected
  const isOthersSelected = selectProps.value === 'others' || selectProps.value === 'other';

  // Update custom input value when customValue changes
  useEffect(() => {
    setCustomInputValue(customValue || formData[customFieldName] || '');
  }, [customValue, formData, customFieldName]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        triggerRef.current && !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update portal menu position when open/resize/scroll
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    const updatePosition = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuStyle({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    };
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // Focus custom input when "Others" is selected and dropdown opens
  useEffect(() => {
    if (isOpen && showCustomInput && customInputRef.current) {
      setTimeout(() => {
        customInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, showCustomInput]);

  const selectedOption = selectProps.options.find(opt => opt.value === selectProps.value);

  const handleSelect = (optionValue) => {
    const event = {
      target: {
        name: selectProps.name,
        value: optionValue
      }
    };
    selectProps.onChange(event);

    if (optionValue !== 'others' && optionValue !== 'other') {
      setIsOpen(false);
    }
  };

  const handleCustomInputChange = (e) => {
    const value = e.target.value;
    setCustomInputValue(value);
    setCustomValue(value);

    // Update form data
    const event = {
      target: {
        name: customFieldName,
        value: value
      }
    };
    selectProps.onChange(event);
  };

  const handleCustomInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const Menu = (
    <div
      className="bg-white border-2 border-primary-200 rounded-xl shadow-2xl overflow-hidden"
      style={{
        maxHeight: '300px',
        zIndex: selectProps.dropdownZIndex || 999999,
      }}
    >
      <div className="overflow-y-auto py-1" style={{ maxHeight: showCustomInput ? '200px' : '280px' }}>
        {selectProps.options
          .filter(opt => opt.value !== 'others' && opt.value !== 'other')
          .map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`
                w-full px-4 py-3 text-left
                flex items-center justify-between
                transition-colors duration-150
                ${selectProps.value === option.value
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'}
                ${index !== 0 ? 'border-t border-gray-100' : ''}
              `}
            >
              <span className="flex-1">{option.label}</span>
              {selectProps.value === option.value && (
                <FiCheck className="h-5 w-5 text-primary-600 flex-shrink-0 ml-2" />
              )}
            </button>
          ))}

        {/* "Others" or "Other" option(s) */}
        {selectProps.options
          .filter(opt => opt.value === 'others' || opt.value === 'other')
          .map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`
                w-full px-4 py-3 text-left
                flex items-center justify-between
                transition-colors duration-150
                ${isOthersSelected
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'}
                border-t border-gray-100
              `}
            >
              <span className="flex-1">{option.label}</span>
              {isOthersSelected && (
                <FiCheck className="h-5 w-5 text-primary-600 flex-shrink-0 ml-2" />
              )}
            </button>
          ))}

        {/* Custom input field when "Others" is selected */}
        {isOthersSelected && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              {inputLabel}
            </label>
            <input
              ref={customInputRef}
              type="text"
              value={customInputValue}
              onChange={handleCustomInputChange}
              onKeyDown={handleCustomInputKeyDown}
              placeholder={`Enter ${inputLabel.toLowerCase()}`}
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`w-full relative overflow-visible ${selectProps.containerClassName || ''}`}>
      {selectProps.label && (
        <label
          htmlFor={selectProps.name}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {selectProps.label}
          {selectProps.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Hidden native select for form submission */}
        <select
          id={selectProps.name}
          name={selectProps.name}
          value={selectProps.value}
          onChange={selectProps.onChange}
          required={selectProps.required}
          disabled={selectProps.disabled}
          className="sr-only"
          tabIndex={-1}
        >
          <option value="">{selectProps.placeholder}</option>
          {selectProps.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => !selectProps.disabled && setIsOpen(!isOpen)}
          disabled={selectProps.disabled}
          className={`
            w-full px-4 py-3 pr-10
            bg-white border-2 rounded-xl
            text-left font-medium
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
            hover:border-primary-400
            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:border-gray-300
            ${selectProps.error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'}
            ${!selectProps.value ? 'text-gray-500' : 'text-gray-900'}
            ${isOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : ''}
            ${selectProps.className}
          `}
        >
          {isOthersSelected && customInputValue
            ? customInputValue
            : selectedOption
              ? selectedOption.label
              : selectProps.placeholder}
        </button>

        {/* Custom dropdown arrow */}
        <div className={`
          absolute right-3 top-1/2 -translate-y-1/2
          pointer-events-none
          transition-all duration-200
          ${isOpen ? 'rotate-180' : 'rotate-0'}
          ${selectProps.disabled ? 'text-gray-400' : selectProps.error ? 'text-red-500' : 'text-primary-600'}
        `}>
          <FiChevronDown className="h-5 w-5" />
        </div>

        {/* Dropdown menu */}
        {isOpen && !selectProps.disabled && (
          (selectProps.usePortal !== false)
            ? createPortal(
              <div
                ref={dropdownRef}
                style={{
                  position: 'fixed',
                  top: menuStyle.top,
                  left: menuStyle.left,
                  width: menuStyle.width,
                  zIndex: selectProps.dropdownZIndex || 999999,
                }}
              >
                {Menu}
              </div>,
              document.body
            )
            : (
              <div
                ref={dropdownRef}
                className="absolute"
                style={{
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  zIndex: selectProps.dropdownZIndex || 999999,
                }}
              >
                {Menu}
              </div>
            )
        )}
      </div>

      {selectProps.error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
          {selectProps.error}
        </p>
      )}
    </div>
  );
};
const PrescriptionCard = ({ proforma, index, patientId }) => {
  const navigate = useNavigate();
  const { data: prescriptionsData, isLoading: loadingPrescriptions } = useGetPrescriptionsByProformaIdQuery(
    proforma.id,
    { skip: !proforma.id }
  );
  const [createBulkPrescriptions, { isLoading: isSaving }] = useCreateBulkPrescriptionsMutation();

  const existingPrescriptions = prescriptionsData?.data?.prescriptions || [];

  // Flatten medicines data for autocomplete
  const allMedicines = useMemo(() => {
    const medicines = [];
    const data = medicinesData.psychiatric_medications;

    const extractMedicines = (obj) => {
      if (Array.isArray(obj)) {
        obj.forEach(med => {
          medicines.push({
            name: med.name,
            displayName: med.name,
            type: 'generic',
            brands: med.brands || [],
            strengths: med.strengths || []
          });
          if (med.brands && Array.isArray(med.brands)) {
            med.brands.forEach(brand => {
              medicines.push({
                name: brand,
                displayName: `${brand} (${med.name})`,
                type: 'brand',
                genericName: med.name,
                strengths: med.strengths || []
              });
            });
          }
        });
      } else if (typeof obj === 'object' && obj !== null) {
        Object.values(obj).forEach(value => {
          extractMedicines(value);
        });
      }
    };

    extractMedicines(data);
    const uniqueMedicines = Array.from(
      new Map(medicines.map(m => [m.name.toLowerCase(), m])).values()
    );
    return uniqueMedicines.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Medicine autocomplete state for each row
  const [medicineSuggestions, setMedicineSuggestions] = useState({});
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState({});
  const [showSuggestions, setShowSuggestions] = useState({});
  const [suggestionPositions, setSuggestionPositions] = useState({});
  const inputRefs = useRef({});

  // Initialize with empty row, will be populated when prescriptions load
  const [prescriptionRows, setPrescriptionRows] = useState([
    { medicine: '', dosage: '', when: '', frequency: '', duration: '', qty: '', details: '', notes: '' }
  ]);

  // Update rows when prescriptions data loads
  useEffect(() => {
    if (existingPrescriptions.length > 0) {
      setPrescriptionRows(
        existingPrescriptions.slice(0, 5).map(p => ({
          id: p.id,
          medicine: p.medicine || '',
          dosage: p.dosage || '',
          when: p.when || '',
          frequency: p.frequency || '',
          duration: p.duration || '',
          qty: p.qty || '',
          details: p.details || '',
          notes: p.notes || '',
        }))
      );
    } else if (!loadingPrescriptions && existingPrescriptions.length === 0) {
      // Ensure at least one empty row is shown when no prescriptions exist
      setPrescriptionRows([
        { medicine: '', dosage: '', when: '', frequency: '', duration: '', qty: '', details: '', notes: '' }
      ]);
    }
  }, [existingPrescriptions, loadingPrescriptions]);

  const addPrescriptionRow = () => {
    setPrescriptionRows(prev => [...prev, { medicine: '', dosage: '', when: '', frequency: '', duration: '', qty: '', details: '', notes: '' }]);
  };




  const removePrescriptionRow = (rowIdx) => {
    setPrescriptionRows(prev => prev.filter((_, i) => i !== rowIdx));
    // Clean up autocomplete state for removed row
    setMedicineSuggestions(prev => {
      const newState = { ...prev };
      delete newState[rowIdx];
      return newState;
    });
    setShowSuggestions(prev => {
      const newState = { ...prev };
      delete newState[rowIdx];
      return newState;
    });
  };

  const updatePrescriptionCell = (rowIdx, field, value) => {
    setPrescriptionRows(prev => prev.map((r, i) => i === rowIdx ? { ...r, [field]: value } : r));

    // Handle medicine autocomplete
    if (field === 'medicine') {
      const searchTerm = value.toLowerCase().trim();
      if (searchTerm.length > 0) {
        const filtered = allMedicines.filter(med =>
          med.name.toLowerCase().includes(searchTerm) ||
          med.displayName.toLowerCase().includes(searchTerm) ||
          (med.genericName && med.genericName.toLowerCase().includes(searchTerm))
        ).slice(0, 10);
        setMedicineSuggestions(prev => ({ ...prev, [rowIdx]: filtered }));
        setShowSuggestions(prev => ({ ...prev, [rowIdx]: true }));
        setActiveSuggestionIndex(prev => ({ ...prev, [rowIdx]: -1 }));

        // Calculate position for dropdown
        setTimeout(() => {
          const input = inputRefs.current[`medicine-${rowIdx}`];
          if (input) {
            const rect = input.getBoundingClientRect();
            const dropdownHeight = 240;
            const spaceAbove = rect.top;
            const spaceBelow = window.innerHeight - rect.bottom;
            const positionAbove = spaceAbove > dropdownHeight || spaceAbove > spaceBelow;

            setSuggestionPositions(prev => ({
              ...prev,
              [rowIdx]: {
                top: positionAbove ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
                left: rect.left,
                width: rect.width
              }
            }));
          }
        }, 0);
      } else {
        setShowSuggestions(prev => ({ ...prev, [rowIdx]: false }));
        setMedicineSuggestions(prev => ({ ...prev, [rowIdx]: [] }));
      }
    }
  };

  const selectMedicine = (rowIdx, medicine) => {
    setPrescriptionRows(prev => prev.map((r, i) =>
      i === rowIdx ? { ...r, medicine: medicine.name } : r
    ));
    setShowSuggestions(prev => ({ ...prev, [rowIdx]: false }));
    setMedicineSuggestions(prev => ({ ...prev, [rowIdx]: [] }));
  };

  const handleMedicineKeyDown = (e, rowIdx) => {
    const suggestions = medicineSuggestions[rowIdx] || [];
    const currentIndex = activeSuggestionIndex[rowIdx] || -1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < suggestions.length - 1 ? currentIndex + 1 : currentIndex;
      setActiveSuggestionIndex(prev => ({ ...prev, [rowIdx]: nextIndex }));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : -1;
      setActiveSuggestionIndex(prev => ({ ...prev, [rowIdx]: prevIndex }));
    } else if (e.key === 'Enter' && currentIndex >= 0 && suggestions[currentIndex]) {
      e.preventDefault();
      selectMedicine(rowIdx, suggestions[currentIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(prev => ({ ...prev, [rowIdx]: false }));
    }
  };

  const handleSavePrescriptions = async () => {
    if (!proforma.id) {
      toast.error('Clinical proforma ID is required');
      return;
    }

    // Filter out empty prescriptions
    const validPrescriptions = prescriptionRows.filter(p => p.medicine && p.medicine.trim());

    if (validPrescriptions.length === 0) {
      toast.error('Please add at least one medication with a valid medicine name');
      return;
    }

    try {
      const prescriptionsToSave = validPrescriptions.map(p => ({
        medicine: p.medicine.trim(),
        dosage: p.dosage?.trim() || null,
        when: p.when?.trim() || null,
        frequency: p.frequency?.trim() || null,
        duration: p.duration?.trim() || null,
        qty: p.qty?.trim() || null,
        details: p.details?.trim() || null,
        notes: p.notes?.trim() || null,
      }));

      await createBulkPrescriptions({
        clinical_proforma_id: proforma.id,
        prescriptions: prescriptionsToSave,
      }).unwrap();

      toast.success(`Prescription saved successfully! ${prescriptionsToSave.length} medication(s) recorded.`);

      // The query will automatically refetch due to cache invalidation
      // Reset form to show one empty row for next entry
      setPrescriptionRows([{ medicine: '', dosage: '', when: '', frequency: '', duration: '', qty: '', details: '', notes: '' }]);
    } catch (error) {
      console.error('Error saving prescriptions:', error);
      toast.error(error?.data?.message || 'Failed to save prescriptions. Please try again.');
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-r from-amber-50 to-yellow-50">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Visit #{index + 1}</h4>
          <p className="text-sm text-gray-500 mt-1">
            {proforma.visit_date ? formatDate(proforma.visit_date) : 'N/A'}
            {proforma.visit_type && ` • ${proforma.visit_type.replace('_', ' ')}`}
          </p>
        </div>
        {existingPrescriptions.length > 5 && (
          <Button
            onClick={() => navigate(`/prescriptions/view?clinical_proforma_id=${proforma.id}&patient_id=${patientId}`)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <FiEdit className="w-4 h-4" />
            View All
          </Button>
        )}
      </div>

      {loadingPrescriptions ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading prescriptions...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto bg-white rounded-lg border border-amber-200">
            <table className="min-w-full text-sm">
              <thead className="bg-amber-100 text-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left w-10">#</th>
                  <th className="px-3 py-2 text-left">Medicine</th>
                  <th className="px-3 py-2 text-left">Dosage</th>
                  <th className="px-3 py-2 text-left">When</th>
                  <th className="px-3 py-2 text-left">Frequency</th>
                  <th className="px-3 py-2 text-left">Duration</th>
                  <th className="px-3 py-2 text-left">Qty</th>
                  <th className="px-3 py-2 text-left">Details</th>
                  <th className="px-3 py-2 text-left">Notes</th>
                  <th className="px-3 py-2 text-left w-20"></th>
                </tr>
              </thead>
              <tbody>
                {prescriptionRows.map((row, idx) => (
                  <tr key={row.id || idx} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-600">{idx + 1}</td>
                    <td className="px-3 py-2" style={{ position: 'relative', overflow: 'visible', zIndex: showSuggestions[idx] ? 1000 : 'auto' }}>
                      <div style={{ position: 'relative', overflow: 'visible' }}>
                        <input
                          ref={(el) => { inputRefs.current[`medicine-${idx}`] = el; }}
                          type="text"
                          value={row.medicine}
                          onChange={(e) => updatePrescriptionCell(idx, 'medicine', e.target.value)}
                          onKeyDown={(e) => handleMedicineKeyDown(e, idx)}
                          onFocus={() => {
                            if (row.medicine && row.medicine.trim().length > 0) {
                              const searchTerm = row.medicine.toLowerCase().trim();
                              const filtered = allMedicines.filter(med =>
                                med.name.toLowerCase().includes(searchTerm) ||
                                med.displayName.toLowerCase().includes(searchTerm) ||
                                (med.genericName && med.genericName.toLowerCase().includes(searchTerm))
                              ).slice(0, 10);
                              setMedicineSuggestions(prev => ({ ...prev, [idx]: filtered }));
                              setShowSuggestions(prev => ({ ...prev, [idx]: true }));

                              setTimeout(() => {
                                const input = inputRefs.current[`medicine-${idx}`];
                                if (input) {
                                  const rect = input.getBoundingClientRect();
                                  const dropdownHeight = 240;
                                  const spaceAbove = rect.top;
                                  const spaceBelow = window.innerHeight - rect.bottom;
                                  const positionAbove = spaceAbove > dropdownHeight || spaceAbove > spaceBelow;

                                  setSuggestionPositions(prev => ({
                                    ...prev,
                                    [idx]: {
                                      top: positionAbove ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
                                      left: rect.left,
                                      width: rect.width
                                    }
                                  }));
                                }
                              }, 0);
                            }
                          }}
                          onBlur={() => {
                            setTimeout(() => {
                              setShowSuggestions(prev => ({ ...prev, [idx]: false }));
                            }, 200);
                          }}
                          className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          placeholder="Type to search medicine..."
                          autoComplete="off"
                        />
                        {showSuggestions[idx] && medicineSuggestions[idx] && medicineSuggestions[idx].length > 0 && (
                          <div
                            className="fixed bg-white border border-gray-300 rounded-lg shadow-2xl max-h-60 overflow-y-auto z-50"
                            style={{
                              top: suggestionPositions[idx]?.top ? `${suggestionPositions[idx].top}px` : 'auto',
                              left: suggestionPositions[idx]?.left ? `${suggestionPositions[idx].left}px` : 'auto',
                              width: suggestionPositions[idx]?.width ? `${suggestionPositions[idx].width}px` : '300px',
                              minWidth: '300px',
                              maxWidth: '400px'
                            }}
                          >
                            {medicineSuggestions[idx].map((med, medIdx) => (
                              <div
                                key={`${med.name}-${medIdx}`}
                                onClick={() => selectMedicine(idx, med)}
                                onMouseDown={(e) => e.preventDefault()}
                                className={`px-3 py-2 cursor-pointer hover:bg-amber-50 transition-colors ${activeSuggestionIndex[idx] === medIdx ? 'bg-amber-100' : ''
                                  } ${medIdx === 0 ? 'rounded-t-lg' : ''} ${medIdx === medicineSuggestions[idx].length - 1 ? 'rounded-b-lg' : ''
                                  }`}
                              >
                                <div className="font-medium text-gray-900">{med.name}</div>
                                {med.displayName !== med.name && (
                                  <div className="text-xs text-gray-500">{med.displayName}</div>
                                )}
                                {med.strengths && med.strengths.length > 0 && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    Available: {med.strengths.join(', ')}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.dosage}
                        onChange={(e) => updatePrescriptionCell(idx, 'dosage', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="e.g., 1-0-1"
                        list={`dosageOptions-${proforma.id}-${idx}`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.when}
                        onChange={(e) => updatePrescriptionCell(idx, 'when', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="before/after food"
                        list={`whenOptions-${proforma.id}-${idx}`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.frequency}
                        onChange={(e) => updatePrescriptionCell(idx, 'frequency', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="daily"
                        list={`frequencyOptions-${proforma.id}-${idx}`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.duration}
                        onChange={(e) => updatePrescriptionCell(idx, 'duration', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="5 days"
                        list={`durationOptions-${proforma.id}-${idx}`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.qty}
                        onChange={(e) => updatePrescriptionCell(idx, 'qty', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Qty"
                        list={`quantityOptions-${proforma.id}-${idx}`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.details}
                        onChange={(e) => updatePrescriptionCell(idx, 'details', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Details"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.notes}
                        onChange={(e) => updatePrescriptionCell(idx, 'notes', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Notes"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      {prescriptionRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePrescriptionRow(idx)}
                          className="text-red-600 hover:text-red-800 hover:underline text-xs flex items-center gap-1"
                        >
                          <FiTrash2 className="w-3 h-3" />
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Datalist suggestions for prescription fields */}
          {prescriptionRows.map((_, rowIdx) => (
            <div key={`datalists-${rowIdx}`} style={{ display: 'none' }}>
              <datalist id={`dosageOptions-${proforma.id}-${rowIdx}`}>
                <option value="1-0-1" />
                <option value="1-1-1" />
                <option value="1-0-0" />
                <option value="0-1-0" />
                <option value="0-0-1" />
                <option value="1-1-0" />
                <option value="0-1-1" />
                <option value="1-0-1½" />
                <option value="½-0-½" />
                <option value="SOS" />
                <option value="STAT" />
                <option value="PRN" />
                <option value="OD" />
                <option value="BD" />
                <option value="TDS" />
                <option value="QID" />
                <option value="HS" />
                <option value="Q4H" />
                <option value="Q6H" />
                <option value="Q8H" />
              </datalist>
              <datalist id={`whenOptions-${proforma.id}-${rowIdx}`}>
                <option value="Before Food" />
                <option value="After Food" />
                <option value="With Food" />
                <option value="Empty Stomach" />
                <option value="Bedtime" />
                <option value="Morning" />
                <option value="Afternoon" />
                <option value="Evening" />
                <option value="Night" />
                <option value="Any Time" />
                <option value="Before Breakfast" />
                <option value="After Breakfast" />
                <option value="Before Lunch" />
                <option value="After Lunch" />
                <option value="Before Dinner" />
                <option value="After Dinner" />
              </datalist>
              <datalist id={`frequencyOptions-${proforma.id}-${rowIdx}`}>
                <option value="Once Daily" />
                <option value="Twice Daily" />
                <option value="Thrice Daily" />
                <option value="Four Times Daily" />
                <option value="Every Hour" />
                <option value="Every 2 Hours" />
                <option value="Every 4 Hours" />
                <option value="Every 6 Hours" />
                <option value="Every 8 Hours" />
                <option value="Every 12 Hours" />
                <option value="Alternate Day" />
                <option value="Weekly" />
                <option value="Monthly" />
                <option value="SOS" />
                <option value="Continuous" />
                <option value="Once" />
                <option value="Tapering Dose" />
              </datalist>
              <datalist id={`durationOptions-${proforma.id}-${rowIdx}`}>
                <option value="3 Days" />
                <option value="5 Days" />
                <option value="7 Days" />
                <option value="10 Days" />
                <option value="14 Days" />
                <option value="21 Days" />
                <option value="1 Month" />
                <option value="2 Months" />
                <option value="3 Months" />
                <option value="6 Months" />
                <option value="Until Symptoms Subside" />
                <option value="Continuous" />
                <option value="As Directed" />
              </datalist>
              <datalist id={`quantityOptions-${proforma.id}-${rowIdx}`}>
                <option value="1" />
                <option value="2" />
                <option value="3" />
                <option value="5" />
                <option value="7" />
                <option value="10" />
                <option value="15" />
                <option value="20" />
                <option value="30" />
                <option value="60" />
                <option value="90" />
                <option value="100" />
                <option value="Custom" />
              </datalist>
            </div>
          ))}

          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={addPrescriptionRow}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Add Medicine
              </Button>
              {existingPrescriptions.length > 0 && (
                <Button
                  onClick={() => navigate(`/prescriptions/view?clinical_proforma_id=${proforma.id}&patient_id=${patientId}`)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FiEdit className="w-4 h-4" />
                  View All Prescriptions
                </Button>
              )}
            </div>
            {proforma.id && (
              <Button
                type="button"
                onClick={handleSavePrescriptions}
                disabled={isSaving}
                className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FiSave className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Prescriptions'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Input component with glassmorphism styling (matching CreatePatient)
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

const PatientDetailsEdit = ({ patient, formData: initialFormData, clinicalData, adlData, usersData, userRole, onSave, onCancel }) => {
  // Track current doctor_decision from EditClinicalProforma form
  const [currentDoctorDecision, setCurrentDoctorDecision] = useState(null);
  const [occupationOther, setOccupationOther] = useState(''); // Custom occupation value
  const [familyTypeOther, setFamilyTypeOther] = useState(''); // Custom family type value
  const [localityOther, setLocalityOther] = useState(''); // Custom locality value
  const [religionOther, setReligionOther] = useState(''); // Custom religion value
  const [headRelationshipOther, setHeadRelationshipOther] = useState(''); // Custom head relationship value
  const [mobilityOther, setMobilityOther] = useState(''); // Custom mobility value
  const [referredByOther, setReferredByOther] = useState(''); // Custom referred by value
  const [showOccupationOther, setShowOccupationOther] = useState(false);
  const [showFamilyTypeOther, setShowFamilyTypeOther] = useState(false);
  const [showLocalityOther, setShowLocalityOther] = useState(false);
  const [showReligionOther, setShowReligionOther] = useState(false);
  const [showHeadRelationshipOther, setShowHeadRelationshipOther] = useState(false);
  const [showMobilityOther, setShowMobilityOther] = useState(false);
  const [showReferredByOther, setShowReferredByOther] = useState(false);
  const navigate = useNavigate();
  const [updatePatient, { isLoading }] = useUpdatePatientMutation();
  const [assignPatient, { isLoading: isAssigning }] = useAssignPatientMutation();
  const { data: doctorsData } = useGetDoctorsQuery({ page: 1, limit: 100 });



  // Card expand/collapse state - initialize with false, will auto-expand when data loads
  const [expandedCards, setExpandedCards] = useState({
    patient: true,
    clinical: false,
    adl: false,
    prescriptions: false
  });

  const toggleCard = (cardName) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardName]: !prev[cardName]
    }));
  };

  // Determine which sections to show based on CURRENT USER's role (userRole)
  // If current user is System Administrator, JR, or SR → Show all sections
  const canViewAllSections = userRole && (
    isAdmin(userRole) ||
    isJrSr(userRole)
  );
  const canViewClinicalProforma = canViewAllSections;
  const canViewPrescriptions = canViewAllSections;

  // ADL File: Show only if case is complex OR ADL file already exists
  // Handle different possible data structures from API
  const patientAdlFiles = adlData?.data?.adlFiles || adlData?.data?.files || adlData?.data || [];
  const patientProformas = Array.isArray(clinicalData?.data?.proformas)
    ? clinicalData.data.proformas
    : [];

  // State for selected proforma to edit
  const [selectedProformaId, setSelectedProformaId] = useState(() => {
    // Default to the most recent proforma (first one in the array, assuming they're sorted by date)
    return patientProformas.length > 0 && patientProformas[0]?.id
      ? patientProformas[0].id.toString()
      : null;
  });

  // Fetch selected proforma data for editing
  const {
    data: selectedProformaData,
    isLoading: isLoadingSelectedProforma
  } = useGetClinicalProformaByIdQuery(
    selectedProformaId,
    { skip: !selectedProformaId }
  );

  const selectedProforma = selectedProformaData?.data?.proforma;

  // Debug logging to help troubleshoot ADL data (after all variables are defined)
  useEffect(() => {
    const hasAdlFilesCheck = patientAdlFiles.length > 0 || selectedProforma?.adl_file_id;
    console.log('[PatientDetailsEdit] ADL Data:', {
      adlData,
      patientAdlFiles,
      patientAdlFilesLength: patientAdlFiles.length,
      selectedProformaAdlFileId: selectedProforma?.adl_file_id,
      hasAdlFiles: hasAdlFilesCheck
    });
  }, [adlData, patientAdlFiles.length, selectedProforma?.adl_file_id]);

  // Auto-expand clinical card when selected proforma loads
  useEffect(() => {
    if (selectedProforma) {
      setExpandedCards(prev => ({ ...prev, clinical: true }));
    }
  }, [selectedProforma]);

  // Initialize currentDoctorDecision from existing proformas or default (only once)
  useEffect(() => {
    if (currentDoctorDecision === null) {
      const hasComplexCase = patientProformas.some(p => p.doctor_decision === 'complex_case');
      if (hasComplexCase) {
        setCurrentDoctorDecision('complex_case');
      } else if (selectedProforma?.doctor_decision) {
        setCurrentDoctorDecision(selectedProforma.doctor_decision);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientProformas.length, selectedProforma?.doctor_decision]);

  // Check if case is complex
  // Check saved proformas, selected proforma being edited, current form data, or if ADL files exist
  const isComplexCase = patient?.case_complexity === 'complex' ||
    patient?.has_adl_file === true ||
    patientAdlFiles.length > 0 ||
    patientProformas.some(p => p.doctor_decision === 'complex_case') ||
    selectedProforma?.doctor_decision === 'complex_case' ||
    currentDoctorDecision === 'complex_case';

  // Show ADL file section if:
  // 1. User has permission (Admin, JR, or SR)
  // 2. AND (ADL files exist OR case is complex OR selected proforma has ADL file ID)
  // Always show if ADL files exist, even if case isn't marked as complex
  const hasAdlFiles = patientAdlFiles.length > 0 || selectedProforma?.adl_file_id;
  const canViewADLFile = canViewAllSections && (hasAdlFiles || isComplexCase || selectedProforma?.adl_file_id);
  const isSelectedComplexCase = selectedProforma?.doctor_decision === 'complex_case' && selectedProforma?.adl_file_id;

  // Auto-expand ADL card when ADL files exist or complex case
  useEffect(() => {
    if (hasAdlFiles || isComplexCase) {
      setExpandedCards(prev => ({ ...prev, adl: true }));
    }
  }, [hasAdlFiles, isComplexCase]);

  // Auto-expand prescription card when proformas exist
  useEffect(() => {
    if (patientProformas.length > 0) {
      setExpandedCards(prev => ({ ...prev, prescriptions: true }));
    }
  }, [patientProformas.length]);

  // Fetch ADL file data if this is a complex case
  const {
    data: selectedAdlFileData,
    isLoading: isLoadingSelectedADL
  } = useGetADLFileByIdQuery(
    selectedProforma?.adl_file_id,
    { skip: !isSelectedComplexCase }
  );

  const selectedAdlFile = selectedAdlFileData?.data?.adlFile || selectedAdlFileData?.data?.file;

  console.log(">>>>", patient)
  // Initialize form data from patient and formData props
  const [formData, setFormData] = useState(() => {
    // Merge patient data with initialFormData, prioritizing patient data
    const merged = {
      // Basic info
      name: patient?.name || initialFormData?.name || '',
      sex: patient?.sex || initialFormData?.sex || '',
      age: patient?.age || initialFormData?.age || '',
      cr_no: patient?.cr_no || initialFormData?.cr_no || '',
      psy_no: patient?.psy_no || initialFormData?.psy_no || '',
      special_clinic_no: patient?.special_clinic_no || initialFormData?.special_clinic_no || '',
      contact_number: patient?.contact_number || initialFormData?.contact_number || '',
      father_name: patient?.father_name || initialFormData?.father_name || '',

      category: patient?.category || initialFormData?.category || '',

      // Dates
      date: patient?.date || initialFormData?.date || '',
      seen_in_walk_in_on: patient?.seen_in_walk_in_on || initialFormData?.seen_in_walk_in_on || '',
      worked_up_on: patient?.worked_up_on || initialFormData?.worked_up_on || '',

      // Quick Entry
      department: patient?.department || initialFormData?.department || '',
      unit_consit: patient?.unit_consit || initialFormData?.unit_consit || '',
      room_no: patient?.room_no || initialFormData?.room_no || '',
      serial_no: patient?.serial_no || initialFormData?.serial_no || '',
      file_no: patient?.file_no || initialFormData?.file_no || '',
      unit_days: patient?.unit_days || initialFormData?.unit_days || '',

      // Personal Information
      age_group: patient?.age_group || initialFormData?.age_group || '',
      marital_status: patient?.marital_status || initialFormData?.marital_status || '',
      year_of_marriage: patient?.year_of_marriage || initialFormData?.year_of_marriage || '',
      no_of_children_male: patient?.no_of_children_male || initialFormData?.no_of_children_male || '',
      no_of_children_female: patient?.no_of_children_female || initialFormData?.no_of_children_female || '',

      // Occupation & Education
      occupation: patient?.occupation || initialFormData?.occupation || '',
      occupation_other: patient?.occupation_other || initialFormData?.occupation_other || '',
      education: patient?.education || initialFormData?.education || '',
      locality: patient?.locality || initialFormData?.locality || '',
      locality_other: patient?.locality_other || initialFormData?.locality_other || '',
      income: patient?.income || initialFormData?.income || '',
      religion: patient?.religion || initialFormData?.religion || '',
      religion_other: patient?.religion_other || initialFormData?.religion_other || '',
      family_type: patient?.family_type || initialFormData?.family_type || '',
      family_type_other: patient?.family_type_other || initialFormData?.family_type_other || '',

      // Head of Family
      head_name: patient?.head_name || initialFormData?.head_name || '',
      head_age: patient?.head_age || initialFormData?.head_age || '',
      head_relationship: patient?.head_relationship || initialFormData?.head_relationship || '',
      head_relationship_other: patient?.head_relationship_other || initialFormData?.head_relationship_other || '',
      head_education: patient?.head_education || initialFormData?.head_education || '',
      head_occupation: patient?.head_occupation || initialFormData?.head_occupation || '',
      head_income: patient?.head_income || initialFormData?.head_income || '',

      // Referral & Mobility
      distance_from_hospital: patient?.distance_from_hospital || initialFormData?.distance_from_hospital || '',
      mobility: patient?.mobility || initialFormData?.mobility || '',
      mobility_other: patient?.mobility_other || initialFormData?.mobility_other || '',
      referred_by: patient?.referred_by || initialFormData?.referred_by || '',
      referred_by_other: patient?.referred_by_other || initialFormData?.referred_by_other || '',

      // Address
      address_line: patient?.address_line || initialFormData?.address_line || '',
      country: patient?.country || initialFormData?.country || '',
      state: patient?.state || initialFormData?.state || '',
      district: patient?.district || initialFormData?.district || '',
      city: patient?.city || initialFormData?.city || '',
      pin_code: patient?.pin_code || initialFormData?.pin_code || '',

      // Assignment
      assigned_doctor_id: patient?.assigned_doctor_id ? String(patient.assigned_doctor_id) : initialFormData?.assigned_doctor_id || '',
      assigned_doctor_name: patient?.assigned_doctor_name || initialFormData?.assigned_doctor_name || '',
      assigned_room: patient?.assigned_room || initialFormData?.assigned_room || '',
    };
    return merged;
  });

  // State declarations
  const [errors, setErrors] = useState({});
  const [crValidationTimeout, setCrValidationTimeout] = useState(null);
  const [currentCRNumber, setCurrentCRNumber] = useState('');

  // CR number validation
  const { data: crExists, isLoading: isCheckingCR } = useCheckCRNumberExistsQuery(
    currentCRNumber,
    { skip: !currentCRNumber || currentCRNumber.length < 3 || currentCRNumber === patient?.cr_no }
  );

  // Check if fields with "others"/"other" are selected to show custom inputs
  useEffect(() => {
    if (formData.occupation === 'others') {
      setShowOccupationOther(true);
      if (formData.occupation_other) {
        setOccupationOther(formData.occupation_other);
      }
    } else {
      setShowOccupationOther(false);
    }
  }, [formData.occupation, formData.occupation_other]);

  useEffect(() => {
    if (formData.family_type === 'others') {
      setShowFamilyTypeOther(true);
      if (formData.family_type_other) {
        setFamilyTypeOther(formData.family_type_other);
      }
    } else {
      setShowFamilyTypeOther(false);
    }
  }, [formData.family_type, formData.family_type_other]);

  useEffect(() => {
    if (formData.locality === 'other') {
      setShowLocalityOther(true);
      if (formData.locality_other) {
        setLocalityOther(formData.locality_other);
      }
    } else {
      setShowLocalityOther(false);
    }
  }, [formData.locality, formData.locality_other]);

  useEffect(() => {
    if (formData.religion === 'others') {
      setShowReligionOther(true);
      if (formData.religion_other) {
        setReligionOther(formData.religion_other);
      }
    } else {
      setShowReligionOther(false);
    }
  }, [formData.religion, formData.religion_other]);

  useEffect(() => {
    if (formData.head_relationship === 'other') {
      setShowHeadRelationshipOther(true);
      if (formData.head_relationship_other) {
        setHeadRelationshipOther(formData.head_relationship_other);
      }
    } else {
      setShowHeadRelationshipOther(false);
    }
  }, [formData.head_relationship, formData.head_relationship_other]);

  useEffect(() => {
    if (formData.mobility === 'others') {
      setShowMobilityOther(true);
      if (formData.mobility_other) {
        setMobilityOther(formData.mobility_other);
      }
    } else {
      setShowMobilityOther(false);
    }
  }, [formData.mobility, formData.mobility_other]);

  useEffect(() => {
    if (formData.referred_by === 'others') {
      setShowReferredByOther(true);
      if (formData.referred_by_other) {
        setReferredByOther(formData.referred_by_other);
      }
    } else {
      setShowReferredByOther(false);
    }
  }, [formData.referred_by, formData.referred_by_other]);

  // CR validation effect
  useEffect(() => {
    const currentCR = formData.cr_no;

    if (currentCR && currentCR.length >= 3) {
      // Skip validation if CR number matches the patient's existing CR number
      if (currentCR === patient?.cr_no) {
        setErrors((prev) => ({ ...prev, patientCRNo: '' }));
        return;
      }

      if (currentCR !== currentCRNumber) {
        setErrors((prev) => ({ ...prev, patientCRNo: '' }));
        setCurrentCRNumber(currentCR);
        return;
      } else if (currentCR === currentCRNumber && !isCheckingCR) {
        if (crExists === true) {
          setErrors((prev) => ({ ...prev, patientCRNo: 'CR No. already exists.' }));
        } else if (crExists === false) {
          setErrors((prev) => ({ ...prev, patientCRNo: '' }));
        } else {
          setErrors((prev) => ({ ...prev, patientCRNo: '' }));
        }
      }
    } else {
      setErrors((prev) => ({ ...prev, patientCRNo: '' }));
      setCurrentCRNumber('');
    }
  }, [formData.cr_no, crExists, isCheckingCR, currentCRNumber, patient?.cr_no]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Handle "Others"/"Other" selection for all fields
    const handleOthersSelection = (fieldName, value, setShowState, customValueState, setCustomValueState, customFieldName) => {
      if (value === 'others' || value === 'other') {
        setShowState(true);
        if (!customValueState) {
          setCustomValueState('');
        }
      } else {
        setShowState(false);
        setCustomValueState('');
        setFormData(prev => ({ ...prev, [customFieldName]: null }));
      }
    };

    // Handle custom input values
    const handleCustomInput = (fieldName, value, setCustomValueState, customFieldName) => {
      setCustomValueState(value);
      setFormData(prev => ({ ...prev, [customFieldName]: value }));
    };

    // Occupation
    if (name === 'occupation') {
      handleOthersSelection(name, value, setShowOccupationOther, occupationOther, setOccupationOther, 'occupation_other');
    }
    if (name === 'occupation_other') {
      handleCustomInput(name, value, setOccupationOther, 'occupation_other');
    }

    // Family Type
    if (name === 'family_type') {
      handleOthersSelection(name, value, setShowFamilyTypeOther, familyTypeOther, setFamilyTypeOther, 'family_type_other');
    }
    if (name === 'family_type_other') {
      handleCustomInput(name, value, setFamilyTypeOther, 'family_type_other');
    }

    // Locality
    if (name === 'locality') {
      handleOthersSelection(name, value, setShowLocalityOther, localityOther, setLocalityOther, 'locality_other');
    }
    if (name === 'locality_other') {
      handleCustomInput(name, value, setLocalityOther, 'locality_other');
    }

    // Religion
    if (name === 'religion') {
      handleOthersSelection(name, value, setShowReligionOther, religionOther, setReligionOther, 'religion_other');
    }
    if (name === 'religion_other') {
      handleCustomInput(name, value, setReligionOther, 'religion_other');
    }

    // Head Relationship
    if (name === 'head_relationship') {
      handleOthersSelection(name, value, setShowHeadRelationshipOther, headRelationshipOther, setHeadRelationshipOther, 'head_relationship_other');
    }
    if (name === 'head_relationship_other') {
      handleCustomInput(name, value, setHeadRelationshipOther, 'head_relationship_other');
    }

    // Mobility
    if (name === 'mobility') {
      handleOthersSelection(name, value, setShowMobilityOther, mobilityOther, setMobilityOther, 'mobility_other');
    }
    if (name === 'mobility_other') {
      handleCustomInput(name, value, setMobilityOther, 'mobility_other');
    }

    // Referred By
    if (name === 'referred_by') {
      handleOthersSelection(name, value, setShowReferredByOther, referredByOther, setReferredByOther, 'referred_by_other');
    }
    if (name === 'referred_by_other') {
      handleCustomInput(name, value, setReferredByOther, 'referred_by_other');
    }

    // Clear any existing CR number error when user starts typing
    if (name === 'cr_no') {
      setErrors((prev) => ({ ...prev, patientCRNo: '' }));

      if (crValidationTimeout) {
        clearTimeout(crValidationTimeout);
      }

      setCurrentCRNumber('');

      if (value.length >= 3) {
        const timeout = setTimeout(() => {
          setCurrentCRNumber(value);
        }, 500);
        setCrValidationTimeout(timeout);
      }
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // Auto-select age group based on age
    if (name === 'age') {
      const age = parseInt(value);
      if (!isNaN(age)) {
        let ageGroup = '';
        if (age >= 0 && age <= 15) ageGroup = '0-15';
        else if (age >= 16 && age <= 30) ageGroup = '15-30';
        else if (age >= 31 && age <= 45) ageGroup = '30-45';
        else if (age >= 46 && age <= 60) ageGroup = '45-60';
        else if (age >= 61) ageGroup = '60+';

        if (ageGroup) {
          setFormData(prev => ({ ...prev, age_group: ageGroup }));
        }
      }
    }
  };

  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear any existing CR number error when user starts typing
    if (name === 'cr_no') {
      setErrors((prev) => ({ ...prev, patientCRNo: '' }));

      if (crValidationTimeout) {
        clearTimeout(crValidationTimeout);
      }

      setCurrentCRNumber('');

      if (value.length >= 3) {
        const timeout = setTimeout(() => {
          setCurrentCRNumber(value);
        }, 500);
        setCrValidationTimeout(timeout);
      }
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (crValidationTimeout) {
        clearTimeout(crValidationTimeout);
      }
    };
  }, [crValidationTimeout]);

  const validate = () => {
    const newErrors = {};

    const patientName = formData.name || '';
    const patientSex = formData.sex || '';
    const patientAge = formData.age || '';
    const patientCRNo = formData.cr_no || '';

    if (!patientName || !patientName.trim()) newErrors.patientName = 'Name is required';
    if (!patientSex) newErrors.patientSex = 'Sex is required';
    if (!patientAge) newErrors.patientAge = 'Age is required';

    // CR number validation
    if (patientCRNo) {
      if (patientCRNo.length < 3) {
        newErrors.patientCRNo = 'CR number must be at least 3 characters long';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!patient?.id) {
      toast.error('Patient ID is required');
      return;
    }

    // Get patient data early for validation
    const patientName = (formData.name || '').trim();
    const patientSex = formData.sex || '';
    const patientAge = formData.age || '';
    const patientCRNo = formData.cr_no || '';

    // Don't submit while checking CR number
    if (patientCRNo && patientCRNo !== patient?.cr_no && isCheckingCR) {
      toast.error('Please wait while we check the CR number...');
      return;
    }

    try {
      // Validate required fields
      if (!patientName) {
        toast.error('Patient name is required');
        return;
      }
      if (!patientSex) {
        toast.error('Patient sex is required');
        return;
      }
      if (!patientAge) {
        toast.error('Patient age is required');
        return;
      }

      const parseIntSafe = (val) => {
        if (val === '' || val === undefined || val === null) return null;
        const parsed = parseInt(val);
        return isNaN(parsed) ? null : parsed;
      };

      const parseFloatSafe = (val) => {
        if (val === '' || val === undefined || val === null) return null;
        const parsed = parseFloat(val);
        return isNaN(parsed) ? null : parsed;
      };

      const updatePatientData = {
        // Required basic fields
        name: patientName,
        sex: patientSex,
        date: formData.date || null,
        age: parseIntSafe(patientAge),
        assigned_room: formData.assigned_room || null,
        assigned_doctor_id: formData.assigned_doctor_id || null,
        assigned_doctor_name: formData.assigned_doctor_name || null,
        ...(patientCRNo && { cr_no: patientCRNo }),
        psy_no: formData.psy_no || null,
        seen_in_walk_in_on: formData.seen_in_walk_in_on || formData.date || null,
        worked_up_on: formData.worked_up_on || null,
        special_clinic_no: formData.special_clinic_no || null,

        // Personal Information
        age_group: formData.age_group || null,
        marital_status: formData.marital_status || null,
        year_of_marriage: parseIntSafe(formData.year_of_marriage),
        no_of_children_male: parseIntSafe(formData.no_of_children_male),
        no_of_children_female: parseIntSafe(formData.no_of_children_female),

        // Occupation & Education
        // If "others" is selected, use the custom occupation value, otherwise use the selected option
        occupation: formData.occupation === 'others'
          ? (formData.occupation_other || occupationOther || null)
          : (formData.occupation || null),
        education: formData.education || null,

        // Financial Information
        income: parseFloatSafe(formData.income),

        // Family Information
        // If "others"/"other" is selected, use the custom value, otherwise use the selected option
        religion: formData.religion === 'others'
          ? (formData.religion_other || religionOther || null)
          : (formData.religion || null),
        family_type: formData.family_type === 'others'
          ? (formData.family_type_other || familyTypeOther || null)
          : (formData.family_type || null),
        locality: formData.locality === 'other'
          ? (formData.locality_other || localityOther || null)
          : (formData.locality || null),
        head_name: formData.head_name || formData.father_name || null,
        head_age: parseIntSafe(formData.head_age),
        head_relationship: formData.head_relationship === 'other'
          ? (formData.head_relationship_other || headRelationshipOther || null)
          : (formData.head_relationship || null),
        head_education: formData.head_education || null,
        head_occupation: formData.head_occupation || null,
        head_income: parseFloatSafe(formData.head_income),

        // Referral & Mobility
        distance_from_hospital: formData.distance_from_hospital || null,
        mobility: formData.mobility === 'others'
          ? (formData.mobility_other || mobilityOther || null)
          : (formData.mobility || null),
        referred_by: formData.referred_by === 'others'
          ? (formData.referred_by_other || referredByOther || null)
          : (formData.referred_by || null),

        // Contact Information
        contact_number: formData.contact_number || null,

        // Quick Entry fields
        department: formData.department || null,
        unit_consit: formData.unit_consit || null,
        room_no: formData.room_no || null,
        serial_no: formData.serial_no || null,
        file_no: formData.file_no || null,
        unit_days: formData.unit_days || null,

        // Address fields
        address_line: formData.address_line || null,
        country: formData.country || null,
        state: formData.state || null,
        district: formData.district || null,
        city: formData.city || null,
        pin_code: formData.pin_code || null,

        // Additional fields
        category: formData.category || null,
        // assigned_doctor_id is UUID (string), not integer
        ...(formData.assigned_doctor_id && { assigned_doctor_id: String(formData.assigned_doctor_id) }),
      };

      // Update patient record (backend handles assigned_doctor_id via patient_visits)
      await updatePatient({
        id: patient.id,
        ...updatePatientData
      }).unwrap();

      toast.success('Patient updated successfully!');
      navigate('/patients');
      // Call onSave callback if provided
      if (onSave) {
        onSave();
      } else {
        // Navigate back to patients list
        navigate('/patients');
      }

    } catch (err) {
      console.error('Update error:', err);

      // Handle specific error cases
      if (err?.data?.message?.includes('duplicate key value violates unique constraint "patients_cr_no_key"') ||
        err?.data?.error?.includes('duplicate key value violates unique constraint "patients_cr_no_key"')) {
        toast.error('CR number is already registered');
        setFormData(prev => ({ ...prev, cr_no: patient?.cr_no || '' }));
      } else if (err?.data?.message?.includes('duplicate key value violates unique constraint') ||
        err?.data?.error?.includes('duplicate key value violates unique constraint')) {
        toast.error('A record with this information already exists. Please check your data and try again.');
      } else {
        toast.error(err?.data?.message || err?.data?.error || 'Failed to update patient');
      }
    }
  };

  return (
    <div className="space-y-6">

      {/* Patient Details Card - Collapsible */}
      <Card className="shadow-lg border-0 bg-white">
        <div
          className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={() => toggleCard('patient')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiUser className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Patient Details</h3>
              <p className="text-sm text-gray-500 mt-1">{patient?.name || 'New Patient'} - {patient?.cr_no || 'N/A'}</p>
            </div>
          </div>
          {expandedCards.patient ? (
            <FiChevronUp className="h-6 w-6 text-gray-500" />
          ) : (
            <FiChevronDown className="h-6 w-6 text-gray-500" />
          )}
        </div>

        {expandedCards.patient && (
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              {/* Quick Entry Section with Glassmorphism */}
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl blur-xl pointer-events-none"></div>
                <Card
                  title={
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                        <FiEdit3 className="w-6 h-6 text-indigo-600" />
                      </div>
                      <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">OUT PATIENT CARD</span>
                    </div>
                  }
                  className="relative mb-8 shadow-2xl border border-white/30 bg-white/70 backdrop-blur-xl rounded-3xl overflow-hidden">
                  <div className="space-y-8">
                    {/* First Row - Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <IconInput
                        icon={<FiHash className="w-4 h-4" />}
                        label="CR No."
                        name="cr_no"
                        value={formData.cr_no || ''}
                        onChange={handleChange}
                        placeholder="Enter CR number"
                        loading={isCheckingCR && formData.cr_no && formData.cr_no.length >= 3}
                        disabled={true}
                        className="disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-900"
                      />
                      <DatePicker
                        icon={<FiCalendar className="w-4 h-4" />}
                        label="Date"
                        name="date"
                        value={formData.date || ''}
                        onChange={handleChange}
                        defaultToday={false}
                      />
                      <IconInput
                        icon={<FiUser className="w-4 h-4" />}
                        label="Name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        placeholder="Enter patient name"
                        error={errors.patientName}
                        className=""
                      />
                      <IconInput
                        icon={<FiPhone className="w-4 h-4" />}
                        label="Mobile No."
                        name="contact_number"
                        value={formData.contact_number || ''}
                        onChange={handleChange}
                        placeholder="Enter mobile number"
                        className=""
                      />
                    </div>

                    {/* Second Row - Age, Sex, Category, Father's Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <IconInput
                        icon={<FiClock className="w-4 h-4" />}
                        label="Age"
                        name="age"
                        value={formData.age || ''}
                        onChange={handleChange}
                        type="number"
                        placeholder="Enter age"
                        error={errors.patientAge}
                        className=""
                      />
                      <div className="space-y-2">
                        <Select
                          label="Sex"
                          name="sex"
                          value={formData.sex || ''}
                          onChange={handleChange}
                          options={SEX_OPTIONS}
                          placeholder="Select sex"
                          error={errors.patientSex}
                          searchable={true}
                          className="bg-white/60 backdrop-blur-md border-2 border-gray-300/60"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                          <FiShield className="w-4 h-4 text-primary-600" />
                          Category
                        </label>
                        <Select
                          name="category"
                          value={formData.category || ''}
                          onChange={handleChange}
                          options={CATEGORY_OPTIONS}
                          placeholder="Select category"
                          searchable={true}
                          className="bg-white/60 backdrop-blur-md border-2 border-gray-300/60"
                        />
                      </div>
                      <IconInput
                        icon={<FiUsers className="w-4 h-4" />}
                        label="Father's Name"
                        name="father_name"
                        value={formData.father_name || ''}
                        onChange={handleChange}
                        placeholder="Enter father's name"
                        className=""
                      />
                    </div>
                    {/* Fourth Row - Department, Unit/Consit, Room No., Serial No. */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <IconInput
                        icon={<FiLayers className="w-4 h-4" />}
                        label="Department"
                        name="department"
                        value={formData.department || ''}
                        onChange={handleChange}
                        placeholder="Enter department"
                        className=""
                      />
                      <IconInput
                        icon={<FiUsers className="w-4 h-4" />}
                        label="Unit/Consit"
                        name="unit_consit"
                        value={formData.unit_consit || ''}
                        onChange={handleChange}
                        placeholder="Enter unit/consit"
                        className=""
                      />
                      <IconInput
                        icon={<FiHome className="w-4 h-4" />}
                        label="Room No."
                        name="room_no"
                        value={formData.room_no || ''}
                        onChange={handleChange}
                        placeholder="Enter room number"
                        className=""
                      />
                      <IconInput
                        icon={<FiHash className="w-4 h-4" />}
                        label="Serial No."
                        name="serial_no"
                        value={formData.serial_no || ''}
                        onChange={handleChange}
                        placeholder="Enter serial number"
                        className=""
                      />
                    </div>

                    {/* Fifth Row - File No., Unit Days */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <IconInput
                        icon={<FiFileText className="w-4 h-4" />}
                        label="File No."
                        name="file_no"
                        value={formData.file_no || ''}
                        onChange={handleChange}
                        placeholder="Enter file number"
                        className=""
                      />
                      <div className="space-y-2">
                        <Select
                          label="Unit Days"
                          name="unit_days"
                          value={formData.unit_days || ''}
                          onChange={handleChange}
                          options={UNIT_DAYS_OPTIONS}
                          placeholder="Select unit days"
                          searchable={true}
                          className="bg-white/60 backdrop-blur-md border-2 border-gray-300/60"
                        />
                      </div>
                    </div>

                    {/* Address Details */}
                    <div className="space-y-6 pt-6 border-t border-white/30">
                      <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-md">
                          <FiMapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        Address Details
                      </h4>

                      <div className="space-y-6">
                        {/* Address Line */}
                        <IconInput
                          icon={<FiHome className="w-4 h-4" />}
                          label="Address Line (House No., Street, Locality)"
                          name="address_line"
                          value={formData.address_line || ''}
                          onChange={handleChange}
                          placeholder="Enter house number, street, locality"
                          required
                          className=""
                        />

                        {/* Location Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <IconInput
                            icon={<FiGlobe className="w-4 h-4" />}
                            label="Country"
                            name="country"
                            value={formData.country || ''}
                            onChange={handleChange}
                            placeholder="Enter country"
                            className=""
                          />
                          <IconInput
                            icon={<FiMapPin className="w-4 h-4" />}
                            label="State"
                            name="state"
                            value={formData.state || ''}
                            onChange={handleChange}
                            placeholder="Enter state"
                            required
                            className=""
                          />
                          <IconInput
                            icon={<FiLayers className="w-4 h-4" />}
                            label="District"
                            name="district"
                            value={formData.district || ''}
                            onChange={handleChange}
                            placeholder="Enter district"
                            required
                            className=""
                          />
                          <IconInput
                            icon={<FiHome className="w-4 h-4" />}
                            label="City/Town/Village"
                            name="city"
                            value={formData.city || ''}
                            onChange={handleChange}
                            placeholder="Enter city, town or village"
                            required
                            className=""
                          />
                        </div>

                        {/* Pin Code Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <IconInput
                            icon={<FiHash className="w-4 h-4" />}
                            label="Pin Code"
                            name="pin_code"
                            value={formData.pin_code || ''}
                            onChange={handleChange}
                            placeholder="Enter pin code"
                            type="number"
                            required
                            className=""
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Basic Information with Glassmorphism */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-3xl blur-xl pointer-events-none"></div>
                <Card
                  title={
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                        <FiUser className="w-6 h-6 text-emerald-600" />
                      </div>
                      <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">OUT-PATIENT RECORD</span>
                    </div>
                  }
                  className="relative mb-8 shadow-2xl border border-white/30 bg-white/70 backdrop-blur-xl rounded-3xl overflow-visible"
                >
                  <div className="space-y-8">
                    {/* Patient Identification */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <DatePicker
                          icon={<FiCalendar className="w-4 h-4" />}
                          label="Seen in Walk-in-on"
                          name="seen_in_walk_in_on"
                          value={formData.seen_in_walk_in_on}
                          onChange={handleChange}
                          defaultToday={true}
                        />
                        <DatePicker
                          icon={<FiCalendar className="w-4 h-4" />}
                          label="Worked up on"
                          name="worked_up_on"
                          value={formData.worked_up_on}
                          onChange={handleChange}
                          defaultToday={true}
                        />

                        <IconInput
                          icon={<FiHash className="w-4 h-4" />}
                          label="CR No."
                          name="cr_no"
                          value={formData.cr_no || ''}
                          onChange={handleChange}
                          placeholder="Enter CR number"
                          // error={errors.patientCRNo}
                          loading={isCheckingCR && formData.cr_no && formData.cr_no.length >= 3}
                          // className={`${errors.patientCRNo
                          //   ? 'border-red-400/50 focus:border-red-500 focus:ring-red-500/50 bg-red-50/30'
                          //   : formData.cr_no && formData.cr_no.length >= 3 && !isCheckingCR && !errors.patientCRNo
                          //     ? 'border-green-400/50 focus:border-green-500 focus:ring-green-500/50 bg-green-50/30'
                          //     : ''
                          //   }`}
                          disabled={true}
                          className="disabled:bg-gray-200 disabled:cursor-not-allowed"
                        />

                        <IconInput
                          icon={<FiFileText className="w-4 h-4" />}
                          label="Psy. No."
                          name="psy_no"
                          value={formData.psy_no}
                          onChange={handlePatientChange}
                          placeholder="Enter PSY number"
                          error={errors.patientPSYNo}
                          className=""
                        />
                        <IconInput
                          icon={<FiHeart className="w-4 h-4" />}
                          label="Special Clinic No."
                          name="special_clinic_no"
                          value={formData.special_clinic_no}
                          onChange={handleChange}
                          placeholder="Enter special clinic number"
                          className=""
                        />

                        <IconInput
                          icon={<FiUser className="w-4 h-4" />}
                          label="Name"
                          name="name"
                          value={formData.name || ''}
                          onChange={handleChange}
                          placeholder="Enter patient name"
                          disabled={true}
                          className="disabled:bg-gray-200 disabled:cursor-not-allowed"
                        />

                        <div className="space-y-2">
                          <Select
                            label="Sex"
                            name="sex"
                            value={formData.sex || ''}
                            onChange={handleChange}
                            options={SEX_OPTIONS}
                            placeholder="Select sex"
                            error={errors.patientSex}
                            searchable={true}

                            disabled={true}
                            className="disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-900"
                          />
                        </div>

                        <Select
                          label="Age Group"
                          name="age_group"
                          value={formData.age_group || ''}
                          onChange={handleChange}
                          options={AGE_GROUP_OPTIONS}
                          placeholder="Select age group"
                          searchable={true}
                          className="bg-gradient-to-r from-blue-50 to-indigo-50"
                        />
                        <Select
                          label="Marital Status"
                          name="marital_status"
                          value={formData.marital_status || ''}
                          onChange={handleChange}
                          options={MARITAL_STATUS}
                          placeholder="Select marital status"
                          searchable={true}
                          className="bg-gradient-to-r from-pink-50 to-rose-50"
                        />
                        <IconInput
                          icon={<FiCalendar className="w-4 h-4" />}
                          label="Year of marriage"
                          name="year_of_marriage"
                          value={formData.year_of_marriage}
                          onChange={handleChange}
                          type="number"
                          placeholder="Enter year of marriage"
                          min="1900"
                          max={new Date().getFullYear()}
                          className="bg-gradient-to-r from-purple-50 to-pink-50"
                        />


                        <IconInput
                          icon={<FiUsers className="w-4 h-4" />}
                          label="No. of Children: M"
                          name="no_of_children_male"
                          value={formData.no_of_children_male}
                          onChange={handleChange}
                          type="number"
                          placeholder="Male"
                          min="0"
                          max="20"
                          className="bg-gradient-to-r from-blue-50 to-indigo-50"
                        />
                        <IconInput
                          icon={<FiUsers className="w-4 h-4" />}
                          label="No. of Children: F"
                          name="no_of_children_female"
                          value={formData.no_of_children_female}
                          onChange={handleChange}
                          type="number"
                          placeholder="Female"
                          min="0"
                          max="20"
                          className="bg-gradient-to-r from-pink-50 to-rose-50"
                        />

                        <SelectWithOther
                          icon={<FiBriefcase className="w-4 h-4" />}
                          label=" Occupation"
                          name="occupation"
                          value={formData.occupation}
                          onChange={handleChange}
                          options={OCCUPATION_OPTIONS}
                          placeholder="Select Occupation"
                          searchable={true}
                          className="bg-gradient-to-r from-green-50 to-emerald-50"
                          customValue={occupationOther}
                          setCustomValue={setOccupationOther}
                          showCustomInput={showOccupationOther}
                          formData={formData}
                          customFieldName="occupation_other"
                          inputLabel="Specify Occupation"
                        />

                        <Select
                          icon={<FiBookOpen className="w-4 h-4" />}
                          label="Education"
                          name="education"
                          value={formData.education}
                          onChange={handleChange}
                          options={EDUCATION_OPTIONS}
                          placeholder="Select education"
                          searchable={true}
                          className="bg-gradient-to-r from-green-50 to-emerald-50"
                        />

                        <IconInput
                          icon={<FiTrendingUp className="w-4 h-4" />}
                          label="Income (₹)"
                          name="income"
                          value={formData.income}
                          onChange={handleChange}
                          type="number"
                          placeholder="Monthly income"
                          min="0"
                          className="bg-gradient-to-r from-teal-50 to-cyan-50"
                        />

                        <SelectWithOther
                          label="Religion"
                          name="religion"
                          value={formData.religion || ''}
                          onChange={handleChange}
                          options={RELIGION_OPTIONS}
                          placeholder="Select religion"
                          searchable={true}
                          className="bg-gradient-to-r from-teal-50 to-cyan-50"
                          customValue={religionOther}
                          setCustomValue={setReligionOther}
                          showCustomInput={showReligionOther}
                          formData={formData}
                          customFieldName="religion_other"
                          inputLabel="Specify Religion"
                        />
                        <SelectWithOther
                          label="Family Type"
                          name="family_type"
                          value={formData.family_type || ''}
                          onChange={handleChange}
                          options={FAMILY_TYPE_OPTIONS}
                          placeholder="Select family type"
                          searchable={true}
                          className="bg-gradient-to-r from-teal-50 to-cyan-50"
                          customValue={familyTypeOther}
                          setCustomValue={setFamilyTypeOther}
                          showCustomInput={showFamilyTypeOther}
                          formData={formData}
                          customFieldName="family_type_other"
                          inputLabel="Specify Family Type"
                        />
                        <SelectWithOther
                          label="Locality"
                          name="locality"
                          value={formData.locality || ''}
                          onChange={handleChange}
                          options={LOCALITY_OPTIONS}
                          placeholder="Select locality"
                          searchable={true}
                          className="bg-gradient-to-r from-teal-50 to-cyan-50"
                          customValue={localityOther}
                          setCustomValue={setLocalityOther}
                          showCustomInput={showLocalityOther}
                          formData={formData}
                          customFieldName="locality_other"
                          inputLabel="Specify Locality"
                        />

                        <Select
                          name="assigned_doctor_id"
                          label="Assigned Doctor"
                          value={formData.assigned_doctor_id}
                          onChange={handlePatientChange}
                          options={(usersData?.data?.users || [])
                            .map(u => ({
                              value: String(u.id),
                              label: `${u.name} (${isJR(u.role) ? 'JR' : isSR(u.role) ? 'SR' : u.role})`
                            }))}
                          placeholder="Select doctor (optional)"
                          searchable={true}
                          className="bg-gradient-to-r from-violet-50 to-purple-50"
                          containerClassName="relative z-[9999]"
                          dropdownZIndex={2147483647}
                        />


                        <IconInput
                          icon={<FiHome className="w-4 h-4" />}
                          label="Assigned Room"
                          name="assigned_room"
                          value={formData.assigned_room || ''}
                          onChange={handleChange}
                          placeholder="Enter assigned room"
                          className="bg-gradient-to-r from-teal-50 to-cyan-50"
                        />

                        <IconInput
                          icon={<FiUser className="w-4 h-4" />}
                          label="Family Head Name"
                          name="head_name"
                          value={formData.head_name}
                          onChange={handleChange}
                          placeholder="Enter head of family name"
                          className="bg-gradient-to-r from-blue-50 to-indigo-50"
                        />
                        <IconInput
                          icon={<FiClock className="w-4 h-4" />}
                          label=" Family Head  Age"
                          name="head_age"
                          value={formData.head_age}
                          onChange={handleChange}
                          type="number"
                          placeholder="Enter age"
                          min="0"
                          max="150"
                          className="bg-gradient-to-r from-orange-50 to-yellow-50"
                        />

                        <SelectWithOther
                          label="Relationship With Family Head"
                          name="head_relationship"
                          value={formData.head_relationship || ''}
                          onChange={handleChange}
                          options={HEAD_RELATIONSHIP_OPTIONS}
                          placeholder="Select relationship"
                          searchable={true}
                          className="bg-gradient-to-r from-green-50 to-emerald-50"
                          customValue={headRelationshipOther}
                          setCustomValue={setHeadRelationshipOther}
                          showCustomInput={showHeadRelationshipOther}
                          formData={formData}
                          customFieldName="head_relationship_other"
                          inputLabel="Specify Relationship"
                        />


                        <Select
                          icon={<FiBookOpen className="w-4 h-4" />}
                          label="Family Head Education"
                          name="head_education"
                          value={formData.head_education}
                          onChange={handleChange}
                          options={EDUCATION_OPTIONS}
                          placeholder="Select education"
                          searchable={true}
                          className="bg-gradient-to-r from-green-50 to-emerald-50"
                        />

                        <Select
                          icon={<FiBriefcase className="w-4 h-4" />}
                          label=" Family Head Occupation"
                          name="head_occupation"
                          value={formData.head_occupation}
                          onChange={handleChange}
                          options={OCCUPATION_OPTIONS}
                          placeholder="Select education"
                          searchable={true}
                          className="bg-gradient-to-r from-green-50 to-emerald-50"
                        />
                        <IconInput
                          icon={<FiTrendingUp className="w-4 h-4" />}
                          label="Family Head Income (₹)"
                          name="head_income"
                          value={formData.head_income}
                          onChange={handleChange}
                          type="number"
                          placeholder="Monthly income"
                          min="0"
                          className="bg-gradient-to-r from-amber-50 to-orange-50"
                        />

                        <IconInput
                          icon={<FiNavigation className="w-4 h-4" />}
                          label="Exact distance from hospital"
                          name="distance_from_hospital"
                          value={formData.distance_from_hospital}
                          onChange={handleChange}
                          placeholder="Enter distance from hospital"
                          className=""
                        />

                        <SelectWithOther
                          label="Mobility of the patient"
                          name="mobility"
                          value={formData.mobility || ''}
                          onChange={handleChange}
                          options={MOBILITY_OPTIONS}
                          placeholder="Select mobility"
                          searchable={true}
                          className="bg-white/60 backdrop-blur-md border-2 border-gray-300/60"
                          customValue={mobilityOther}
                          setCustomValue={setMobilityOther}
                          showCustomInput={showMobilityOther}
                          formData={formData}
                          customFieldName="mobility_other"
                          inputLabel="Specify Mobility"
                        />

                        <SelectWithOther
                          label="Referred by"
                          name="referred_by"
                          value={formData.referred_by || ''}
                          onChange={handleChange}
                          options={REFERRED_BY_OPTIONS}
                          placeholder="Select referred by"
                          searchable={true}
                          className="bg-white/60 backdrop-blur-md border-2 border-gray-300/60"
                          customValue={referredByOther}
                          setCustomValue={setReferredByOther}
                          showCustomInput={showReferredByOther}
                          formData={formData}
                          customFieldName="referred_by_other"
                          inputLabel="Specify Referred By"
                        />
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/30 my-6"></div>

                    <div className="flex flex-col sm:flex-row justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel || (() => navigate('/patients'))}
                        className="px-6 lg:px-8 py-3 bg-white/60 backdrop-blur-md border border-white/30 hover:bg-white/80 hover:border-gray-300/50 text-gray-800 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <FiX className="mr-2" />
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        loading={isLoading || isAssigning}
                        disabled={isLoading || isAssigning}
                        className="px-6 lg:px-8 py-3 bg-gradient-to-r from-primary-600 via-indigo-600 to-blue-600 hover:from-primary-700 hover:via-indigo-700 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      >
                        <FiSave className="mr-2" />
                        {isLoading || isAssigning ? 'Updating Record...' : 'Update Patient'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </form>
          </div>
        )}
      </Card>

      {/* Additional Sections: Clinical Proforma, ADL File, Prescriptions */}
      {/* Card 1: Clinical Proforma - Show only if current user is Admin, JR, or SR */}
      {canViewClinicalProforma && (
        <EditClinicalProforma
          initialData={selectedProforma ? {
            // Pass full existing proforma data if available
            ...selectedProforma,
            patient_id: selectedProforma.patient_id?.toString() || patient?.id?.toString() || '',
            visit_date: selectedProforma.visit_date ? selectedProforma.visit_date.split('T')[0] : new Date().toISOString().split('T')[0],
            assigned_doctor: selectedProforma.assigned_doctor?.toString() || patient?.assigned_doctor_id?.toString() || '',
          } : {
            // Default data for new proforma
            patient_id: patient?.id?.toString() || '',
            visit_date: new Date().toISOString().split('T')[0],
            visit_type: 'first_visit',
            room_no: patient?.room_no || '',
            assigned_doctor: patient?.assigned_doctor_id?.toString() || '',
            informant_present: true,
            doctor_decision: 'simple_case',
          }}
          onFormDataChange={(formData) => {
            // Track doctor_decision changes to show/hide ADL card
            if (formData?.doctor_decision !== undefined) {
              setCurrentDoctorDecision(formData.doctor_decision);
            }
          }}
        />
      )}

      {/* Card 2: Additional Details (ADL File) - Show only if case is complex OR ADL file exists */}
      {canViewADLFile && (
        <Card className="shadow-lg border-0 bg-white">
          <div
            className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => toggleCard('adl')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiFolder className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Additional Details (ADL File)</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {patientAdlFiles.length > 0
                    ? `${patientAdlFiles.length} file${patientAdlFiles.length > 1 ? 's' : ''} found`
                    : selectedProforma?.adl_file_id
                    ? 'ADL file linked to proforma'
                    : 'No ADL files'}
                </p>
              </div>
            </div>
            {expandedCards.adl ? (
              <FiChevronUp className="h-6 w-6 text-gray-500" />
            ) : (
              <FiChevronDown className="h-6 w-6 text-gray-500" />
            )}
          </div>

          {expandedCards.adl && (
            <div className="p-6">
              {patientAdlFiles.length > 0 ? (
                <div className="space-y-6">
                  {patientAdlFiles.map((file, index) => {
                    // Debug logging for each file
                    console.log('[PatientDetailsEdit] Rendering ADL file:', {
                      file,
                      fileId: file.id,
                      fileIdType: typeof file.id,
                      clinicalProformaId: file.clinical_proforma_id
                    });
                    
                    return (
                      <EditADL
                        key={file.id || `adl-${index}`}
                        adlFileId={file.id || file.adl_file_id || file.adlFileId}
                        isEmbedded={true}
                        patientId={patient?.id?.toString()}
                        clinicalProformaId={file.clinical_proforma_id?.toString() || selectedProforma?.id?.toString()}
                      />
                    );
                  })}
                </div>
              ) : selectedProforma?.adl_file_id ? (
                // If selected proforma has ADL file ID but file not in patientAdlFiles, use the ID
                <EditADL
                  adlFileId={selectedProforma.adl_file_id}
                  isEmbedded={true}
                  patientId={patient?.id?.toString()}
                  clinicalProformaId={selectedProforma?.id?.toString()}
                />
              ) : (
                <EditADL
                  isEmbedded={true}
                  patientId={patient?.id?.toString()}
                  clinicalProformaId={selectedProforma?.id?.toString()}
                />
              )}
            </div>
          )}
        </Card>
      )}

      {/* Card 3: Prescription History - Show only if current user is Admin, JR, or SR */}
      {canViewPrescriptions && (
        <Card className="shadow-lg border-0 bg-white">
          <div
            className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => toggleCard('prescriptions')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <FiPackage className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Prescription History</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {patientProformas.length > 0
                    ? `View prescriptions for ${patientProformas.length} visit${patientProformas.length > 1 ? 's' : ''}`
                    : 'No prescriptions found'}
                </p>
              </div>
            </div>
            {expandedCards.prescriptions ? (
              <FiChevronUp className="h-6 w-6 text-gray-500" />
            ) : (
              <FiChevronDown className="h-6 w-6 text-gray-500" />
            )}
          </div>

          {expandedCards.prescriptions && (
            <div className="p-6">
              {patientProformas.length > 0 ? (
                <div className="space-y-6">
                  {patientProformas.map((proforma, index) => (
                    <PrescriptionCard
                      key={proforma.id || index}
                      proforma={proforma}
                      index={index}
                      patientId={patient?.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-2xl mx-auto">
                    <FiPackage className="h-12 w-12 mx-auto mb-4 text-amber-500" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Clinical Proforma Found
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      To add prescriptions, you need to create a clinical proforma first.
                      Please create a clinical proforma in the "Clinical Proforma" section above,
                      and then you'll be able to add prescriptions for that visit.
                    </p>
                    <p className="text-xs text-gray-500 italic">
                      Once a clinical proforma is created, prescription fields will appear here automatically.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

    </div>
  );
};

export default PatientDetailsEdit;
