
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { useGetPrescriptionByIdQuery, useCreatePrescriptionMutation, useUpdatePrescriptionMutation } from "../../features/prescriptions/prescriptionApiSlice";
import medicinesData from '../../assets/psychiatric_meds_india.json';
import { FiSave, FiEdit, FiPlus, FiTrash2, FiPackage } from 'react-icons/fi';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { PRESCRIPTION_OPTIONS } from '../../utils/constants';





const PrescriptionEdit = ({ proforma, index, patientId }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode'); // 'create' or 'update' from URL
  
  const { data: prescriptionsData, isLoading: loadingPrescriptions } = useGetPrescriptionByIdQuery(
    { clinical_proforma_id: proforma.id },
    { skip: !proforma.id }
  );
  const [createPrescription, { isLoading: isSaving }] = useCreatePrescriptionMutation();
  
  const [updatePrescription, { isLoading: isUpdating }] = useUpdatePrescriptionMutation();
  const prescriptionData = prescriptionsData?.data?.prescription;
  
  // Memoize existingPrescriptions to prevent infinite loops
  const existingPrescriptions = useMemo(() => {
    return prescriptionData?.prescription || [];
  }, [prescriptionData?.prescription]);
  
  // Determine if this is create or update mode
  // Update mode: existingPrescriptions exist OR mode === 'update'
  // Create mode: no existingPrescriptions OR mode === 'create'
  const isUpdateMode = mode === 'update' || (mode !== 'create' && existingPrescriptions.length > 0);

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
    // Only update if we're not currently loading
    if (loadingPrescriptions) {
      return;
    }

    if (existingPrescriptions.length > 0) {
      const newRows = existingPrescriptions.map(p => ({
        id: p.id || null,
        medicine: p.medicine || '',
        dosage: p.dosage || '',
        when: p.when_to_take || p.when || '',
        frequency: p.frequency || '',
        duration: p.duration || '',
        qty: p.quantity || p.qty || '',
        details: p.details || '',
        notes: p.notes || '',
      }));
      
      // Only update if the data has actually changed
      setPrescriptionRows(prev => {
        const prevString = JSON.stringify(prev.map(r => ({ ...r, id: r.id || null })));
        const newString = JSON.stringify(newRows);
        if (prevString !== newString) {
          return newRows;
        }
        return prev;
      });
    } else {
      // Ensure at least one empty row is shown when no prescriptions exist
      setPrescriptionRows(prev => {
        // Only set if we don't already have at least one empty row
        if (prev.length === 0 || (prev.length === 1 && prev[0].medicine === '' && !prev[0].id)) {
          return [{ medicine: '', dosage: '', when: '', frequency: '', duration: '', qty: '', details: '', notes: '' }];
        }
        return prev;
      });
    }
  }, [existingPrescriptions, loadingPrescriptions]);

  const addPrescriptionRow = () => {
    setPrescriptionRows(prev => [...prev, { medicine: '', dosage: '', when: '', frequency: '', duration: '', qty: '', details: '', notes: '' }]);
  };


  const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
          try {
            return new Date(dateString).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
          } catch {
            return dateString;
          }
        };
      

   

  const removePrescriptionRow = async (rowIdx) => {
    const rowToRemove = prescriptionRows[rowIdx];
    
    // Calculate remaining valid prescriptions after removal
    const remainingPrescriptions = prescriptionRows
      .filter((_, i) => i !== rowIdx)
      .filter(row => row.medicine && row.medicine.trim() !== '');

    // If the row has an ID, it's an existing medicine - delete via API
    if (rowToRemove?.id && isUpdateMode && prescriptionData?.id) {
      // Check if deletion would leave at least one valid medicine
      if (remainingPrescriptions.length === 0) {
        toast.error('Cannot delete. At least one medicine is required.');
        return;
      }

      try {
        // Filter out the medicine with this ID from the prescription array
        const updatedPrescriptions = remainingPrescriptions.map((p) => ({
          id: p.id || null,
          medicine: p.medicine?.trim() || null,
          dosage: p.dosage?.trim() || null,
          when_to_take: p.when?.trim() || null,
          frequency: p.frequency?.trim() || null,
          duration: p.duration?.trim() || null,
          quantity: p.qty?.trim() || null,
          details: p.details?.trim() || null,
          notes: p.notes?.trim() || null,
        }));

        // Update prescription via API
        await updatePrescription({
          id: prescriptionData.id,
          clinical_proforma_id: Number(proforma.id),
          prescription: updatedPrescriptions
        }).unwrap();

        toast.success('Medicine deleted successfully');
      } catch (error) {
        console.error('Error deleting medicine:', error);
        toast.error(error?.data?.message || error?.data?.error || 'Failed to delete medicine. Please try again.');
        return; // Don't update local state if API call failed
      }
    } else {
      // For new rows (no ID) or create mode, just validate locally
      if (remainingPrescriptions.length === 0 && prescriptionRows.length === 1) {
        toast.error('At least one medicine row is required.');
        return;
      }
    }

    // Update local state - remove the row
    setPrescriptionRows(prev => prev.filter((_, i) => i !== rowIdx));
    
    // Clean up autocomplete state for removed row
    setMedicineSuggestions(prev => {
      const newState = { ...prev };
      delete newState[rowIdx];
      // Reindex remaining suggestions
      const reindexed = {};
      Object.keys(newState).forEach(key => {
        const keyNum = parseInt(key);
        if (keyNum > rowIdx) {
          reindexed[keyNum - 1] = newState[key];
        } else if (keyNum < rowIdx) {
          reindexed[key] = newState[key];
        }
      });
      return reindexed;
    });
    setShowSuggestions(prev => {
      const newState = { ...prev };
      delete newState[rowIdx];
      // Reindex remaining suggestions
      const reindexed = {};
      Object.keys(newState).forEach(key => {
        const keyNum = parseInt(key);
        if (keyNum > rowIdx) {
          reindexed[keyNum - 1] = newState[key];
        } else if (keyNum < rowIdx) {
          reindexed[key] = newState[key];
        }
      });
      return reindexed;
    });
  };

  const updatePrescriptionCell = (rowIdx, field, value) => {
    setPrescriptionRows(prev => {
      const newRows = [...prev];
      newRows[rowIdx] = { ...newRows[rowIdx], [field]: value };
      return newRows;
    });

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

        // Calculate position for dropdown - always position below the input field
        setTimeout(() => {
          const input = inputRefs.current[`medicine-${rowIdx}`];
          if (input) {
            const rect = input.getBoundingClientRect();
            // Height for 4 items (approximately 56px per item = 224px)
            const dropdownHeight = 224;

            setSuggestionPositions(prev => ({
              ...prev,
              [rowIdx]: {
                top: rect.bottom + 4, // Always position directly below the input field
                left: rect.left, // Align with left edge of input
                width: rect.width, // Match exact width of input field
                maxHeight: dropdownHeight
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
    if (!proforma?.id) {
      toast.error("Clinical proforma ID is required");
      return;
    }
  
    // --- Validate rows ---
    const validPrescriptions = prescriptionRows.filter(
      (p) => p.medicine && p.medicine.trim() !== ""
    );
  
    if (validPrescriptions.length === 0) {
      toast.error("Please add at least one medication with a valid medicine name");
      return;
    }
  
    try {
      // Generate IDs for new items (items without IDs) - backend will also generate, but this ensures consistency
      const prescriptionArray = validPrescriptions.map((p, index) => ({
        id: p.id || (index + 1), // Generate ID if not present (1, 2, 3, etc.)
        medicine: p.medicine.trim(),
        dosage: p.dosage?.trim() || null,
        when_to_take: p.when?.trim() || null,
        frequency: p.frequency?.trim() || null,
        duration: p.duration?.trim() || null,
        quantity: p.qty?.trim() || null,
        details: p.details?.trim() || null,
        notes: p.notes?.trim() || null,
      }));
  
      let savedPrescription;
      if (isUpdateMode && prescriptionData?.id) {
        // Update existing prescription
        const result = await updatePrescription({
          id: prescriptionData.id,
          clinical_proforma_id: Number(proforma.id),
          prescription: prescriptionArray
        }).unwrap();
        savedPrescription = result?.data?.prescription;
      }
      
      else {
        // Create new prescription
        const patientIdInt = patientId 
          ? (typeof patientId === 'string' ? parseInt(patientId) : patientId)
          : null;
        
        if (!patientIdInt || isNaN(patientIdInt)) {
          toast.error('Valid patient ID is required');
          return;
        }
        
        const result = await createPrescription({
          clinical_proforma_id: Number(proforma.id),
          patient_id: patientIdInt,
          prescription: prescriptionArray // Use 'prescription' for new format
        }).unwrap();
        savedPrescription = result?.data?.prescription;
      }
  
      toast.success(
        `Prescription saved successfully! ${prescriptionArray.length} medication(s) recorded.`
      );
  
      // Update state with saved prescription data (which includes generated IDs from backend)
      if (savedPrescription?.prescription && Array.isArray(savedPrescription.prescription)) {
        setPrescriptionRows(
          savedPrescription.prescription.map(p => ({
            id: p.id || null,
            medicine: p.medicine || '',
            dosage: p.dosage || '',
            when: p.when_to_take || p.when || '',
            frequency: p.frequency || '',
            duration: p.duration || '',
            qty: p.quantity || p.qty || '',
            details: p.details || '',
            notes: p.notes || '',
          }))
        );
      } else {
        // Fallback: Keep current rows but update IDs if they were generated
        setPrescriptionRows(prev => 
          prev.map((row, index) => ({
            ...row,
            id: row.id || (index + 1) // Ensure IDs are set
          }))
        );
      }
    } catch (error) {
      console.error("Error saving prescriptions:", error);
  
      const msg =
        error?.data?.error ||
        error?.data?.message ||
        "Failed to save prescriptions. Please try again.";
  
      toast.error(msg);
    }
  };


  
  
  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6366f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4f46e5;
        }
      `}</style>
      <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-r from-amber-50 to-yellow-50">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Visit #{index + 1}</h4>
          <p className="text-sm text-gray-500 mt-1">
            {proforma.visit_date ? formatDate(proforma.visit_date) : 'N/A'}
            {proforma.visit_type && ` • ${proforma.visit_type.replace('_', ' ')}`}
          </p>
        </div>
        {existingPrescriptions.length > 0 && (
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
        <div className="space-y-6">
          {prescriptionRows.map((row, idx) => (
            <div key={row.id || idx} className="bg-white rounded-xl border-2 border-amber-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h5 className="text-base font-semibold text-gray-800">Medicine #{idx + 1}</h5>
                {prescriptionRows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePrescriptionRow(idx)}
                    className="text-red-600 hover:text-red-800 hover:underline text-sm flex items-center gap-1 font-medium"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Remove
                  </button>
                )}
              </div>

              {/* First Row - Medicine, Dosage, When, Frequency */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Medicine Field with Autocomplete */}
                <div className="space-y-2" style={{ position: 'relative', overflow: 'visible', zIndex: showSuggestions[idx] ? 1000 : 'auto' }}>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <FiPackage className="w-4 h-4 text-primary-600" />
                    Medicine
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <FiPackage className="w-4 h-4 text-gray-500" />
                    </div>
                    <input
                      ref={(el) => { inputRefs.current[`medicine-${idx}`] = el; }}
                      type="text"
                      value={row.medicine || ''}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        updatePrescriptionCell(idx, 'medicine', newValue);
                      }}
                      onKeyDown={(e) => handleMedicineKeyDown(e, idx)}
                      onFocus={() => {
                        if (row.medicine && row.medicine.trim().length > 0) {
                          const searchTerm = row.medicine.toLowerCase().trim();
                          const filtered = allMedicines.filter(med =>
                            med.name.toLowerCase().includes(searchTerm) ||
                            med.displayName.toLowerCase().includes(searchTerm) ||
                            (med.genericName && med.genericName.toLowerCase().includes(searchTerm))
                          ).slice(0, 20);
                          setMedicineSuggestions(prev => ({ ...prev, [idx]: filtered }));
                          setShowSuggestions(prev => ({ ...prev, [idx]: true }));

                          setTimeout(() => {
                            const input = inputRefs.current[`medicine-${idx}`];
                            if (input) {
                              const rect = input.getBoundingClientRect();
                              // Height for 4 items (approximately 56px per item = 224px)
                              const dropdownHeight = 224;

                              setSuggestionPositions(prev => ({
                                ...prev,
                                [idx]: {
                                  top: rect.bottom + 4, // Always position directly below the input field (no scroll offset needed for fixed positioning)
                                  left: rect.left, // Align with left edge of input
                                  width: rect.width, // Match exact width of input field
                                  maxHeight: dropdownHeight
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
                      className="w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-md border-2 border-gray-300/60 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white/80 transition-all duration-300 hover:bg-white/70 hover:border-primary-400/70 placeholder:text-gray-400 text-gray-900 font-medium"
                      placeholder="Type to search medicine..."
                      autoComplete="off"
                    />
                    {showSuggestions[idx] && medicineSuggestions[idx] && medicineSuggestions[idx].length > 0 && (
                      <div
                        className="fixed bg-white border-2 border-primary-200 rounded-xl shadow-2xl overflow-hidden z-50"
                        style={{
                          top: suggestionPositions[idx]?.top ? `${suggestionPositions[idx].top}px` : 'auto',
                          left: suggestionPositions[idx]?.left ? `${suggestionPositions[idx].left}px` : 'auto',
                          width: suggestionPositions[idx]?.width ? `${suggestionPositions[idx].width}px` : 'auto',
                          minWidth: suggestionPositions[idx]?.width ? `${suggestionPositions[idx].width}px` : 'auto',
                          maxWidth: suggestionPositions[idx]?.width ? `${suggestionPositions[idx].width}px` : 'auto',
                          maxHeight: suggestionPositions[idx]?.maxHeight ? `${suggestionPositions[idx].maxHeight}px` : '224px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}
                      >
                        <div className="overflow-y-auto max-h-full custom-scrollbar" style={{ maxHeight: suggestionPositions[idx]?.maxHeight ? `${suggestionPositions[idx].maxHeight}px` : '224px' }}>
                          {medicineSuggestions[idx].map((med, medIdx) => (
                            <div
                              key={`${med.name}-${medIdx}`}
                              onClick={() => selectMedicine(idx, med)}
                              onMouseDown={(e) => e.preventDefault()}
                              onMouseEnter={() => setActiveSuggestionIndex(prev => ({ ...prev, [idx]: medIdx }))}
                              className={`px-4 py-3 cursor-pointer transition-all duration-150 border-b border-gray-100 last:border-b-0 ${
                                activeSuggestionIndex[idx] === medIdx 
                                  ? 'bg-gradient-to-r from-primary-50 to-blue-50 border-l-4 border-l-primary-500' 
                                  : 'hover:bg-primary-50/50'
                              }`}
                            >
                              <div className="font-semibold text-gray-900 text-sm">{med.name}</div>
                              {med.displayName !== med.name && (
                                <div className="text-xs text-gray-500 mt-0.5">{med.displayName}</div>
                              )}
                              {med.strengths && med.strengths.length > 0 && (
                                <div className="text-xs text-primary-600 mt-1.5 font-medium">
                                  Available: {med.strengths.join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Select
                  label="Dosage"
                  name={`dosage-${idx}`}
                  value={row.dosage || ''}
                  onChange={(e) => updatePrescriptionCell(idx, 'dosage', e.target.value)}
                  options={PRESCRIPTION_OPTIONS.DOSAGE}
                  placeholder="Select dosage"
                  searchable={true}
                  className="bg-white/60 backdrop-blur-md border-2 border-gray-300/60"
                />

                <Select
                  label="When"
                  name={`when-${idx}`}
                  value={row.when || ''}
                  onChange={(e) => updatePrescriptionCell(idx, 'when', e.target.value)}
                  options={PRESCRIPTION_OPTIONS.WHEN}
                  placeholder="Select when"
                  searchable={true}
                  className="bg-white/60 backdrop-blur-md border-2 border-gray-300/60"
                />

                <Select
                  label="Frequency"
                  name={`frequency-${idx}`}
                  value={row.frequency || ''}
                  onChange={(e) => updatePrescriptionCell(idx, 'frequency', e.target.value)}
                  options={PRESCRIPTION_OPTIONS.FREQUENCY}
                  placeholder="Select frequency"
                  searchable={true}
                  className="bg-white/60 backdrop-blur-md border-2 border-gray-300/60"
                />
              </div>

              {/* Second Row - Duration, Qty, Details, Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Select
                  label="Duration"
                  name={`duration-${idx}`}
                  value={row.duration || ''}
                  onChange={(e) => updatePrescriptionCell(idx, 'duration', e.target.value)}
                  options={PRESCRIPTION_OPTIONS.DURATION}
                  placeholder="Select duration"
                  searchable={true}
                  className="bg-white/60 backdrop-blur-md border-2 border-gray-300/60"
                />

                <Select
                  label="Qty"
                  name={`qty-${idx}`}
                  value={row.qty || ''}
                  onChange={(e) => updatePrescriptionCell(idx, 'qty', e.target.value)}
                  options={PRESCRIPTION_OPTIONS.QUANTITY}
                  placeholder="Select quantity"
                  searchable={true}
                  className="bg-white/60 backdrop-blur-md border-2 border-gray-300/60"
                />

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    Details
                  </label>
                  <input
                    type="text"
                    value={row.details || ''}
                    onChange={(e) => updatePrescriptionCell(idx, 'details', e.target.value)}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-md border-2 border-gray-300/60 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white/80 transition-all duration-300 hover:bg-white/70 hover:border-primary-400/70 placeholder:text-gray-400 text-gray-900 font-medium"
                    placeholder="Details"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={row.notes || ''}
                    onChange={(e) => updatePrescriptionCell(idx, 'notes', e.target.value)}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-md border-2 border-gray-300/60 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white/80 transition-all duration-300 hover:bg-white/70 hover:border-primary-400/70 placeholder:text-gray-400 text-gray-900 font-medium"
                    placeholder="Notes"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Datalist suggestions for prescription fields */}
          {prescriptionRows.map((_, rowIdx) => (
            <div key={`datalists-${rowIdx}`} style={{ display: 'none' }}>
              <datalist id={`dosageOptions-${proforma.id}-${rowIdx}`}>
                {PRESCRIPTION_OPTIONS.DOSAGE.map((option) => (
                  <option key={option.value} value={option.value} />
                ))}
              </datalist>
              <datalist id={`whenOptions-${proforma.id}-${rowIdx}`}>
                {PRESCRIPTION_OPTIONS.WHEN.map((option) => (
                  <option key={option.value} value={option.value} />
                ))}
              </datalist>
              <datalist id={`frequencyOptions-${proforma.id}-${rowIdx}`}>
                {PRESCRIPTION_OPTIONS.FREQUENCY.map((option) => (
                  <option key={option.value} value={option.value} />
                ))}
              </datalist>
              <datalist id={`durationOptions-${proforma.id}-${rowIdx}`}>
                {PRESCRIPTION_OPTIONS.DURATION.map((option) => (
                  <option key={option.value} value={option.value} />
                ))}
              </datalist>
              <datalist id={`quantityOptions-${proforma.id}-${rowIdx}`}>
                {PRESCRIPTION_OPTIONS.QUANTITY.map((option) => (
                  <option key={option.value} value={option.value} />
                ))}
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
                {isSaving ? 'Saving...' : (isUpdateMode ? 'Update Prescriptions' : 'Create Prescriptions')}
              </Button>
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
};


export default PrescriptionEdit;