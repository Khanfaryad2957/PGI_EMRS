import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetPatientByIdQuery } from '../../features/patients/patientsApiSlice';
import { useGetClinicalProformaByPatientIdQuery } from '../../features/clinical/clinicalApiSlice';
import { useCreatePrescriptionMutation, useGetPrescriptionByIdQuery } from '../../features/prescriptions/prescriptionApiSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { FiPackage, FiUser, FiSave, FiX, FiPlus, FiTrash2, FiHome, FiUserCheck, FiCalendar, FiFileText, FiClock, FiPrinter, FiSearch, FiDroplet, FiActivity } from 'react-icons/fi';
import PGI_Logo from '../../assets/PGI_Logo.png';
import medicinesData from '../../assets/psychiatric_meds_india.json';
import { 
  PRESCRIPTION_FORM,
  DOSAGE_OPTIONS,
  WHEN_OPTIONS,
  FREQUENCY_OPTIONS,
  DURATION_OPTIONS,
  QUANTITY_OPTIONS
} from '../../utils/constants';

const CreatePrescription = ({ 
  patientId: propPatientId, 
  clinicalProformaId: propClinicalProformaId, 
  returnTab: propReturnTab,
  currentUser: propCurrentUser,
  prescriptions: propPrescriptions,
  setPrescriptions: propSetPrescriptions,
  // Other optional props for embedded mode
  addPrescriptionRow: propAddPrescriptionRow,
  updatePrescriptionCell: propUpdatePrescriptionCell,
  selectMedicine: propSelectMedicine,
  handleMedicineKeyDown: propHandleMedicineKeyDown,
  removePrescriptionRow: propRemovePrescriptionRow,
  clearAllPrescriptions: propClearAllPrescriptions,
  handleSave: propHandleSave,
  handlePrint: propHandlePrint,
  formatDateFull: propFormatDateFull,
  formatDate: propFormatDate,
} = {}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Use props if provided (embedded mode), otherwise use URL params (standalone mode)
  const patientId = propPatientId || searchParams.get('patient_id');
  const clinicalProformaId = propClinicalProformaId || searchParams.get('clinical_proforma_id');
  const returnTab = propReturnTab || searchParams.get('returnTab');
  const currentUser = propCurrentUser || useSelector(selectCurrentUser);
  const printRef = useRef(null);
  
  // Track if component is in embedded mode
  const isEmbedded = !!propPatientId;

  const { data: patientData, isLoading: loadingPatient } = useGetPatientByIdQuery(
    patientId,
    { skip: !patientId }
  );

  const { data: clinicalHistoryData } = useGetClinicalProformaByPatientIdQuery(
    patientId,
    { skip: !patientId }
  );

  const [createPrescription, { isLoading: isSavingPrescriptions }] = useCreatePrescriptionMutation();

  // Fetch existing prescriptions when clinicalProformaId is provided
  const { 
    data: existingPrescriptionsData, 
    isLoading: isLoadingPrescriptions,
    refetch: refetchPrescriptions
  } = useGetPrescriptionByIdQuery(
    { clinical_proforma_id: clinicalProformaId },
    {
      skip: !clinicalProformaId,
      refetchOnMountOrArgChange: true
    }
  );

  const prescriptionData = existingPrescriptionsData?.data?.prescription;
  const existingPrescriptions = prescriptionData?.prescription || [];

  const patient = patientData?.data?.patient;
  const clinicalHistory = clinicalHistoryData?.data?.proformas || [];

  // Get the most recent clinical proforma for past history
  const latestProforma = clinicalHistory.length > 0 ? clinicalHistory[0] : null;
  

  // Get today's proforma or latest proforma for linking prescriptions
  const getProformaForPrescription = () => {
    if (clinicalProformaId) {
      // If clinical_proforma_id is provided in URL, use it
      const proforma = clinicalHistory.find(p => p.id === parseInt(clinicalProformaId));
      if (proforma) return proforma;
    }
    
    if (!clinicalHistory.length) return null;
    
    const today = new Date().toISOString().split('T')[0];
    // Try to find today's proforma first
    const todayProforma = clinicalHistory.find(p => {
      const visitDate = p.visit_date || p.created_at;
      return visitDate && new Date(visitDate).toISOString().split('T')[0] === today;
    });
    
    // Return today's proforma or the latest one
    return todayProforma || latestProforma;
  };
  
  // Format date for display
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

  // Prescription table rows - use props if provided (embedded mode), otherwise use local state
  const [localPrescriptions, setLocalPrescriptions] = useState([
    { medicine: '', dosage: '', when: '', frequency: '', duration: '', qty: '', details: '', notes: '' }
  ]);
  
  // Use prop state if provided, otherwise use local state
  const prescriptions = propPrescriptions || localPrescriptions;
  const setPrescriptions = propSetPrescriptions || setLocalPrescriptions;

  // Track if we've populated prescriptions to prevent overwriting
  const [hasPopulatedPrescriptions, setHasPopulatedPrescriptions] = useState(false);
  const [lastPopulatedProformaId, setLastPopulatedProformaId] = useState(null);

  // Reset population flag when clinicalProformaId changes
  useEffect(() => {
    if (clinicalProformaId !== lastPopulatedProformaId) {
      
      setHasPopulatedPrescriptions(false);
      setLastPopulatedProformaId(clinicalProformaId);
    }
  }, [clinicalProformaId, lastPopulatedProformaId]);

  // Populate prescriptions when existing data is fetched
  useEffect(() => {
    if (existingPrescriptions && Array.isArray(existingPrescriptions) && existingPrescriptions.length > 0 && !hasPopulatedPrescriptions) {
     
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
      setHasPopulatedPrescriptions(true);
      if (clinicalProformaId) {
        setLastPopulatedProformaId(clinicalProformaId);
      }
      
    } else if (existingPrescriptions && existingPrescriptions.length === 0 && clinicalProformaId && !hasPopulatedPrescriptions) {
      // If prescriptions query returned empty array, keep default empty prescription
     
      setHasPopulatedPrescriptions(true);
    }
  }, [existingPrescriptions, clinicalProformaId, hasPopulatedPrescriptions, setPrescriptions]);

  // Flatten medicines data for autocomplete
  const allMedicines = useMemo(() => {
    const medicines = [];
    const data = medicinesData.psychiatric_medications;
    
    // Helper function to extract medicines from nested structure
    const extractMedicines = (obj, path = '') => {
      if (Array.isArray(obj)) {
        obj.forEach(med => {
          // Add generic name
          medicines.push({
            name: med.name,
            displayName: med.name,
            type: 'generic',
            brands: med.brands || [],
            strengths: med.strengths || []
          });
          // Add brand names
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
          extractMedicines(value, path);
        });
      }
    };
    
    extractMedicines(data);
    // Remove duplicates and sort
    const uniqueMedicines = Array.from(
      new Map(medicines.map(m => [m.name.toLowerCase(), m])).values()
    );
    return uniqueMedicines.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Medicine autocomplete state for each row
  const [medicineSuggestions, setMedicineSuggestions] = useState({});
  const [filteredSuggestions, setFilteredSuggestions] = useState({}); // Filtered suggestions for dropdown search
  const [dropdownSearchTerm, setDropdownSearchTerm] = useState({}); // Search term within dropdown
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState({});
  const [showSuggestions, setShowSuggestions] = useState({});
  const [suggestionPositions, setSuggestionPositions] = useState({});
  const inputRefs = useRef({});
  const dropdownSearchRefs = useRef({});

  const addPrescriptionRow = () => {
    setPrescriptions((prev) => ([...prev, { medicine: '', dosage: '', when: '', frequency: '', duration: '', qty: '', details: '', notes: '' }]));
  };

  // Optimized medicine filter function
  const filterMedicines = useMemo(() => {
    const filter = (searchTerm) => {
      if (!searchTerm || searchTerm.trim().length === 0) return [];
      
      const term = searchTerm.toLowerCase().trim();
      return allMedicines.filter(med => 
        med.name.toLowerCase().includes(term) ||
        med.displayName.toLowerCase().includes(term) ||
        (med.genericName && med.genericName.toLowerCase().includes(term))
      );
    };
    return filter;
  }, [allMedicines]);

  const updatePrescriptionCell = (rowIdx, field, value) => {
    setPrescriptions((prev) => prev.map((r, i) => i === rowIdx ? { ...r, [field]: value } : r));
    
    // Handle medicine autocomplete
    if (field === 'medicine') {
      const searchTerm = value.toLowerCase().trim();
      if (searchTerm.length > 0) {
        const filtered = filterMedicines(value);
        setMedicineSuggestions(prev => ({ ...prev, [rowIdx]: filtered }));
        // Initialize dropdown search term with current input value if not set
        if (!dropdownSearchTerm[rowIdx] || dropdownSearchTerm[rowIdx] === '') {
          setDropdownSearchTerm(prev => ({ ...prev, [rowIdx]: value }));
          // Use the filtered results directly when initializing
          setFilteredSuggestions(prev => ({ ...prev, [rowIdx]: filtered }));
        } else {
          // Filter suggestions based on dropdown search if it exists
          const dropdownSearch = dropdownSearchTerm[rowIdx]?.toLowerCase().trim() || '';
          const finalFiltered = dropdownSearch 
            ? filtered.filter(med => 
                med.name.toLowerCase().includes(dropdownSearch) ||
                med.displayName.toLowerCase().includes(dropdownSearch) ||
                (med.genericName && med.genericName.toLowerCase().includes(dropdownSearch))
              )
            : filtered;
          setFilteredSuggestions(prev => ({ ...prev, [rowIdx]: finalFiltered }));
        }
        setShowSuggestions(prev => ({ ...prev, [rowIdx]: true }));
        setActiveSuggestionIndex(prev => ({ ...prev, [rowIdx]: -1 }));
        
        // Calculate position for dropdown
        setTimeout(() => {
          const input = inputRefs.current[`medicine-${rowIdx}`];
          if (input) {
            const rect = input.getBoundingClientRect();
            const dropdownHeight = 280; // Height for 4 items + search box
            const spaceAbove = rect.top;
            const spaceBelow = window.innerHeight - rect.bottom;
            
            // Position above if there's enough space, otherwise position below
            const positionAbove = spaceAbove > dropdownHeight || spaceAbove > spaceBelow;
            
            setSuggestionPositions(prev => ({
              ...prev,
              [rowIdx]: {
                top: positionAbove ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
                left: rect.left,
                width: Math.max(rect.width, 400) // Minimum width for better UX
              }
            }));
          }
        }, 0);
      } else {
        setShowSuggestions(prev => ({ ...prev, [rowIdx]: false }));
        setMedicineSuggestions(prev => ({ ...prev, [rowIdx]: [] }));
        setFilteredSuggestions(prev => ({ ...prev, [rowIdx]: [] }));
        setDropdownSearchTerm(prev => ({ ...prev, [rowIdx]: '' }));
      }
    }
  };

  // Handle dropdown search input
  const handleDropdownSearch = (rowIdx, value) => {
    setDropdownSearchTerm(prev => ({ ...prev, [rowIdx]: value }));
    const searchTerm = value.toLowerCase().trim();
    const baseSuggestions = medicineSuggestions[rowIdx] || [];
    
    if (searchTerm.length > 0) {
      const filtered = baseSuggestions.filter(med => 
        med.name.toLowerCase().includes(searchTerm) ||
        med.displayName.toLowerCase().includes(searchTerm) ||
        (med.genericName && med.genericName.toLowerCase().includes(searchTerm))
      );
      setFilteredSuggestions(prev => ({ ...prev, [rowIdx]: filtered }));
    } else {
      setFilteredSuggestions(prev => ({ ...prev, [rowIdx]: baseSuggestions }));
    }
    setActiveSuggestionIndex(prev => ({ ...prev, [rowIdx]: -1 }));
  };

  const selectMedicine = (rowIdx, medicine) => {
    setPrescriptions((prev) => prev.map((r, i) => 
      i === rowIdx ? { ...r, medicine: medicine.name } : r
    ));
    setShowSuggestions(prev => ({ ...prev, [rowIdx]: false }));
    setMedicineSuggestions(prev => ({ ...prev, [rowIdx]: [] }));
    setFilteredSuggestions(prev => ({ ...prev, [rowIdx]: [] }));
    setDropdownSearchTerm(prev => ({ ...prev, [rowIdx]: '' }));
  };

  const handleMedicineKeyDown = (e, rowIdx) => {
    const suggestions = filteredSuggestions[rowIdx] || medicineSuggestions[rowIdx] || [];
    const currentIndex = activeSuggestionIndex[rowIdx] || -1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const maxIndex = Math.min(3, suggestions.length - 1); // Limit to 4 visible items
      const nextIndex = currentIndex < maxIndex ? currentIndex + 1 : currentIndex;
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

  const removePrescriptionRow = (rowIdx) => {
    setPrescriptions((prev) => prev.filter((_, i) => i !== rowIdx));
  };

  const clearAllPrescriptions = () => {
    setPrescriptions([{ medicine: '', dosage: '', when: '', frequency: '', duration: '', qty: '', details: '', notes: '' }]);
  };

  const handleSave = async () => {
    // Filter out empty prescriptions
    const validPrescriptions = prescriptions.filter(p => p.medicine || p.dosage || p.frequency || p.details);
    
    if (validPrescriptions.length === 0) {
      toast.error('Please add at least one medication');
      return;
    }

    // Get the clinical proforma to link prescriptions to
    const proformaForPrescription = getProformaForPrescription();
    
    if (!proformaForPrescription || !proformaForPrescription.id) {
      toast.error('No clinical proforma found. Please create a clinical proforma first before saving prescriptions.');
      return;
    }

    try {
      // Prepare prescriptions data for API (ensure medicine is not empty)
      const prescriptionsToSave = validPrescriptions
        .filter(p => p.medicine && p.medicine.trim()) // Ensure medicine is not empty
        .map(p => ({
          medicine: p.medicine.trim(),
          dosage: p.dosage?.trim() || null,
          when: p.when?.trim() || null,
          frequency: p.frequency?.trim() || null,
          duration: p.duration?.trim() || null,
          qty: p.qty?.trim() || null,
          details: p.details?.trim() || null,
          notes: p.notes?.trim() || null,
        }));
      
      if (prescriptionsToSave.length === 0) {
        toast.error('Please add at least one medication with a valid medicine name');
        return;
      }

      // Save to backend using createPrescription (handles multiple medicines)
      // Convert patient_id to integer if needed
      const patientIdInt = patientId 
        ? (typeof patientId === 'string' ? parseInt(patientId) : patientId)
        : (proformaForPrescription.patient_id 
            ? (typeof proformaForPrescription.patient_id === 'string' 
                ? parseInt(proformaForPrescription.patient_id) 
                : proformaForPrescription.patient_id)
            : null);
      
      if (!patientIdInt || isNaN(patientIdInt)) {
        toast.error('Valid patient ID is required');
        return;
      }
      
      const result = await createPrescription({
        patient_id: patientIdInt,
        clinical_proforma_id: proformaForPrescription.id,
        prescription: prescriptionsToSave, // Use 'prescription' for new format
      }).unwrap();

      toast.success(`Prescription created successfully! ${result?.data?.prescription?.prescription?.length || validPrescriptions.length} medication(s) recorded.`);
      
      // Navigate back or to patient details
      if (returnTab) {
        navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
      } else if (patientId) {
        navigate(`/patients/${patientId}?tab=prescriptions`);
      } else {
        navigate(-1);
      }
    } catch (error) {
      console.error('Error saving prescriptions:', error);
      toast.error(error?.data?.message || 'Failed to save prescriptions. Please try again.');
    }
  };

  const handlePrint = () => {
    // Filter out empty prescriptions
    const validPrescriptions = prescriptions.filter(p => p.medicine || p.dosage || p.frequency || p.details);
    
    if (validPrescriptions.length === 0) {
      toast.error('Please add at least one medication before printing');
      return;
    }

    // Trigger print
    window.print();
  };




  // Format date for display (full format for print)
  const formatDateFull = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loadingPatient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-teal-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <FiUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Patient Not Found</h2>
          <p className="text-gray-600 mb-6">The patient you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/patients')} variant="primary">
            Back to Patients
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Custom scrollbar styles for dropdown */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
      `}</style>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm 15mm;
          }
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          html, body {
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body {
            padding: 0 !important;
            margin: 0 !important;
          }
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible !important;
          }
          .print-content {
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            opacity: 1 !important;
            visibility: visible !important;
            page-break-after: avoid !important;
            overflow: visible !important;
            height: auto !important;
            min-height: auto !important;
          }
          .no-print,
          .no-print * {
            display: none !important;
            visibility: hidden !important;
          }
          .print-header {
            margin-bottom: 12px !important;
            padding-bottom: 8px !important;
            border-bottom: 3px solid #1f2937;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          .print-header h1 {
            margin: 0 !important;
            padding: 0 !important;
            line-height: 1.2 !important;
          }
          .print-header h2 {
            margin: 8px 0 0 0 !important;
            padding: 0 !important;
          }
          .print-table {
            border-collapse: collapse;
            width: 100%;
            font-size: 9px !important;
            margin: 6px 0 !important;
            page-break-inside: auto;
          }
          .print-table thead {
            display: table-header-group;
          }
          .print-table tbody {
            display: table-row-group;
          }
          .print-table th,
          .print-table td {
            border: 1px solid #374151;
            padding: 3px 4px !important;
            text-align: left;
            vertical-align: top;
            word-wrap: break-word;
            line-height: 1.2 !important;
          }
          .print-table th {
            background-color: #f3f4f6 !important;
            font-weight: bold;
            font-size: 9px !important;
          }
          .print-table td {
            font-size: 9px !important;
          }
          .print-table tr {
            page-break-inside: avoid;
          }
          .print-footer {
            margin-top: 15px !important;
            padding-top: 8px !important;
            border-top: 2px solid #1f2937;
            page-break-inside: avoid;
            page-break-after: avoid;
          }
          .print-footer .mb-16 {
            margin-bottom: 35px !important;
          }
          .print-patient-info {
            font-size: 10px !important;
            margin-bottom: 10px !important;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          .print-patient-info > div {
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-section-title {
            font-weight: bold;
            font-size: 11px !important;
            margin: 8px 0 4px 0 !important;
            padding: 0 !important;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            page-break-after: avoid;
          }
          .print-content > div {
            page-break-inside: avoid;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-content img {
            max-height: 65px !important;
            width: auto !important;
            margin: 0 !important;
          }
          .my-4 {
            margin-top: 8px !important;
            margin-bottom: 8px !important;
          }
          .gap-12 {
            gap: 40px !important;
          }
          .gap-4 {
            gap: 12px !important;
          }
          .gap-x-8 {
            column-gap: 20px !important;
          }
          .gap-y-2 {
            row-gap: 4px !important;
          }
          .mb-3 {
            margin-bottom: 8px !important;
          }
          .mt-4 {
            margin-top: 8px !important;
          }
          .pt-3 {
            padding-top: 8px !important;
          }
          .mt-6 {
            margin-top: 12px !important;
          }
        }
      `}</style>

        <div className="w-full px-6 py-8 space-y-8">
       
          {/* Print Content - Hidden on screen, visible when printing */}
          <div className="print-content" ref={printRef} style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
            {/* Print Header with PGI Logo */}
            <div className="print-header">
              <div className="flex items-center justify-center gap-4 mb-3">
                <img src={PGI_Logo} alt="PGIMER Logo" className="h-24 w-24 object-contain" />
                <div className="text-center">
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">
                    POSTGRADUATE INSTITUTE OF<br />MEDICAL EDUCATION & RESEARCH
                  </h1>
                  <p className="text-base font-semibold text-gray-700 mt-1">Department of Psychiatry</p>
                  <p className="text-sm text-gray-600">Chandigarh, India</p>
                </div>
              </div>
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide text-center">PRESCRIPTION</h2>
            </div>

            {/* Print Patient Information */}
            {patient && (
              // <div className="print-patient-info">
              //   <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
              //     <div>
              //       <span className="font-bold">Patient Name:</span> <span className="ml-2">{patient.name}</span>
              //     </div>
              //     <div>
              //       <span className="font-bold">CR Number:</span> <span className="ml-2 font-mono">{patient.cr_no}</span>
              //     </div>
              //     <div>
              //       <span className="font-bold">Age/Sex:</span> <span className="ml-2">{patient.age} years, {patient.sex}</span>
              //     </div>
              //     {patient.psy_no && (
              //       <div>
              //         <span className="font-bold">PSY Number:</span> <span className="ml-2 font-mono">{patient.psy_no}</span>
              //       </div>
              //     )}
              //     {patient.assigned_doctor_name && (
              //       <div>
              //         <span className="font-bold">Prescribing Doctor:</span> <span className="ml-2">{patient.assigned_doctor_name} {patient.assigned_doctor_role ? `(${patient.assigned_doctor_role})` : ''}</span>
              //       </div>
              //     )}
              //     <div>
              //       <span className="font-bold">Room Number:</span> <span className="ml-2">{patient.assigned_room || 'N/A'}</span>
              //     </div>
              //     <div>
              //       <span className="font-bold">Date:</span> <span className="ml-2">{formatDateFull(new Date().toISOString())}</span>
              //     </div>
              //   </div>

              //   {/* Past History in Print */}
              //   {latestProforma && (
              //     <div className="mt-4 pt-3 border-t border-gray-400">
              //       <h3 className="print-section-title">Past Clinical History (Most Recent):</h3>
              //       <div className="text-xs space-y-1 ml-2">
              //         {latestProforma.diagnosis && (
              //           <p><span className="font-semibold">Diagnosis:</span> <span className="ml-1">{latestProforma.diagnosis}</span></p>
              //         )}
              //         {latestProforma.icd_code && (
              //           <p><span className="font-semibold">ICD Code:</span> <span className="ml-1 font-mono">{latestProforma.icd_code}</span></p>
              //         )}
              //         {latestProforma.case_severity && (
              //           <p><span className="font-semibold">Case Severity:</span> <span className="ml-1 capitalize">{latestProforma.case_severity}</span></p>
              //         )}
              //         {latestProforma.visit_date && (
              //           <p><span className="font-semibold">Last Visit:</span> <span className="ml-1">{formatDateFull(latestProforma.visit_date)}</span></p>
              //         )}
              //       </div>
              //     </div>
              //   )}
              // </div>
              <></>
            )}

            {/* Print Prescription Table */}
            <div className="my-4">
              <h3 className="print-section-title">Medications Prescribed:</h3>
              <table className="print-table">
                <thead>
                  <tr>
                    <th style={{ width: '5%' }}>#</th>
                    <th style={{ width: '22%' }}>Medicine Name</th>
                    <th style={{ width: '12%' }}>Dosage</th>
                    <th style={{ width: '10%' }}>When</th>
                    <th style={{ width: '12%' }}>Frequency</th>
                    <th style={{ width: '10%' }}>Duration</th>
                    <th style={{ width: '8%' }}>Qty</th>
                    <th style={{ width: '11%' }}>Details</th>
                    <th style={{ width: '10%' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions
                    .filter(p => p.medicine || p.dosage || p.frequency || p.details)
                    .map((row, idx) => (
                      <tr key={idx}>
                        <td className="text-center">{idx + 1}</td>
                        <td className="font-medium">{row.medicine || '-'}</td>
                        <td>{row.dosage || '-'}</td>
                        <td>{row.when || '-'}</td>
                        <td>{row.frequency || '-'}</td>
                        <td>{row.duration || '-'}</td>
                        <td className="text-center">{row.qty || '-'}</td>
                        <td>{row.details || '-'}</td>
                        <td>{row.notes || '-'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Print Footer with Signatures */}
            <div className="print-footer">
              <div className="grid grid-cols-2 gap-12 mt-6">
                <div>
                  <div className="mb-16"></div>
                  <div className="border-t-2 border-gray-700 text-center pt-2">
                    <p className="font-bold text-xs">{patient?.assigned_doctor_name || currentUser?.name || 'Doctor Name'}</p>
                    <p className="text-xs text-gray-600 mt-1">{patient?.assigned_doctor_role || currentUser?.role || 'Designation'}</p>
                    <p className="text-xs text-gray-600 mt-1">Department of Psychiatry</p>
                    <p className="text-xs text-gray-600">PGIMER, Chandigarh</p>
                  </div>
                </div>
                <div>
                  <div className="mb-16"></div>
                  <div className="border-t-2 border-gray-700 text-center pt-2">
                    <p className="font-bold text-xs">Authorized Signature</p>
                    <p className="text-xs text-gray-600 mt-1">with Hospital Stamp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Info Card */}
          {patient && (
            <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 shadow-lg">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FiUser className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{patient.name}</h3>
                    <p className="text-sm text-gray-600">CR: {patient.cr_no} {patient.psy_no && `| PSY: ${patient.psy_no}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700"><strong>Age:</strong> {patient.age} years, {patient.sex}</span>
                  </div>
                  {patient.assigned_room && (
                    <div className="flex items-center gap-2">
                      <FiHome className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700"><strong>Room:</strong> {patient.assigned_room}</span>
                    </div>
                  )}
                  {patient.assigned_doctor_name && (
                    <div className="flex items-center gap-2">
                      <FiUserCheck className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700"><strong>Doctor:</strong> {patient.assigned_doctor_name}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Prescription Table Card */}
          <Card className="bg-white border-2 border-green-200 shadow-xl overflow-hidden" style={{ position: 'relative' }}>
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <FiDroplet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Prescription Form</h2>
                    <p className="text-sm text-green-100">Add medications for the patient</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    {prescriptions.filter(p => p.medicine || p.dosage || p.frequency || p.details).length} medication(s)
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table className="min-w-full text-sm" style={{ position: 'relative' }}>
                <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left w-12 font-semibold text-gray-700 bg-gradient-to-r from-gray-50 to-slate-50">
                      <div className="flex items-center gap-1">
                        <span>#</span>
                      </div>
                    </th>
                    {PRESCRIPTION_FORM.map((field) => {
                      const icons = {
                        medicine: <FiDroplet className="w-4 h-4" />,
                        dosage: <FiActivity className="w-4 h-4" />,
                        frequency: <FiClock className="w-4 h-4" />,
                        duration: <FiCalendar className="w-4 h-4" />,
                        qty: <FiPackage className="w-4 h-4" />,
                        details: <FiFileText className="w-4 h-4" />,
                        notes: <FiFileText className="w-4 h-4" />
                      };
                      return (
                        <th key={field.value} className="px-4 py-3 text-left font-semibold text-gray-700 bg-gradient-to-r from-gray-50 to-slate-50">
                          <div className="flex items-center gap-2">
                            {icons[field.value] || <FiFileText className="w-4 h-4" />}
                            <span>{field.label}</span>
                          </div>
                        </th>
                      );
                    })}
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 bg-gradient-to-r from-gray-50 to-slate-50">
                      <div className="flex items-center gap-2">
                        <FiClock className="w-4 h-4" />
                        <span>When</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center w-24 font-semibold text-gray-700 bg-gradient-to-r from-gray-50 to-slate-50">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((row, idx) => (
                    <tr key={idx} className="border-t border-gray-100 hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 transition-colors duration-150">
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 font-semibold text-sm">
                          {idx + 1}
                        </div>
                      </td>
                      {/* Medicine Field - Special handling with autocomplete */}
                      <td className="px-4 py-3" style={{ position: 'relative', overflow: 'visible', zIndex: showSuggestions[idx] ? 1000 : 'auto' }}>
                        <div style={{ position: 'relative', overflow: 'visible' }}>
                          <div className="relative">
                            <FiDroplet className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                              ref={(el) => { inputRefs.current[`medicine-${idx}`] = el; }}
                              value={row.medicine}
                              onChange={(e) => updatePrescriptionCell(idx, 'medicine', e.target.value)}
                              onKeyDown={(e) => handleMedicineKeyDown(e, idx)}
                              onFocus={() => {
                                if (row.medicine && row.medicine.trim().length > 0) {
                                  const filtered = filterMedicines(row.medicine);
                                  setMedicineSuggestions(prev => ({ ...prev, [idx]: filtered }));
                                  setFilteredSuggestions(prev => ({ ...prev, [idx]: filtered }));
                                  setDropdownSearchTerm(prev => ({ ...prev, [idx]: row.medicine }));
                                  setShowSuggestions(prev => ({ ...prev, [idx]: true }));
                                  
                                  // Calculate position
                                  setTimeout(() => {
                                    const input = inputRefs.current[`medicine-${idx}`];
                                    if (input) {
                                      const rect = input.getBoundingClientRect();
                                      const dropdownHeight = 280;
                                      const spaceAbove = rect.top;
                                      const spaceBelow = window.innerHeight - rect.bottom;
                                      const positionAbove = spaceAbove > dropdownHeight || spaceAbove > spaceBelow;
                                      
                                      setSuggestionPositions(prev => ({
                                        ...prev,
                                        [idx]: {
                                          top: positionAbove ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
                                          left: rect.left,
                                          width: Math.max(rect.width, 400)
                                        }
                                      }));
                                      // Focus dropdown search after a brief delay
                                      setTimeout(() => {
                                        const searchInput = dropdownSearchRefs.current[`search-${idx}`];
                                        if (searchInput) {
                                          searchInput.focus();
                                          searchInput.select();
                                        }
                                      }, 100);
                                    }
                                  }, 0);
                                }
                              }}
                              onBlur={() => {
                                setTimeout(() => {
                                  setShowSuggestions(prev => ({ ...prev, [idx]: false }));
                                }, 200);
                              }}
                              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 pl-10 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white hover:border-green-300"
                              placeholder="Type to search medicine..."
                              autoComplete="off"
                            />
                          </div>
                          {showSuggestions[idx] && (filteredSuggestions[idx] || medicineSuggestions[idx]) && (filteredSuggestions[idx] || medicineSuggestions[idx]).length > 0 && (
                            <div 
                              className="fixed bg-white border-2 border-green-200 rounded-xl shadow-2xl overflow-hidden"
                              style={{ 
                                zIndex: 10000,
                                top: suggestionPositions[idx]?.top ? `${suggestionPositions[idx].top}px` : 'auto',
                                left: suggestionPositions[idx]?.left ? `${suggestionPositions[idx].left}px` : 'auto',
                                width: suggestionPositions[idx]?.width ? `${suggestionPositions[idx].width}px` : '400px',
                                minWidth: '400px',
                                maxWidth: '500px'
                              }}
                            >
                              {/* Search box inside dropdown */}
                              <div className="p-2 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                                <div className="relative">
                                  <input
                                    ref={(el) => { dropdownSearchRefs.current[`search-${idx}`] = el; }}
                                    type="text"
                                    value={dropdownSearchTerm[idx] || ''}
                                    onChange={(e) => handleDropdownSearch(idx, e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Escape') {
                                        setShowSuggestions(prev => ({ ...prev, [idx]: false }));
                                      } else if (e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        setActiveSuggestionIndex(prev => ({ ...prev, [idx]: 0 }));
                                        // Focus first item for keyboard navigation
                                        setTimeout(() => {
                                          const firstItem = document.querySelector(`[data-medicine-item="${idx}-0"]`);
                                          if (firstItem) {
                                            firstItem.scrollIntoView({ block: 'nearest' });
                                          }
                                        }, 0);
                                      } else if (e.key === 'Enter') {
                                        // If there's an active suggestion, select it
                                        const activeIdx = activeSuggestionIndex[idx];
                                        const suggestions = filteredSuggestions[idx] || medicineSuggestions[idx] || [];
                                        if (activeIdx >= 0 && suggestions[activeIdx]) {
                                          e.preventDefault();
                                          selectMedicine(idx, suggestions[activeIdx]);
                                        }
                                      }
                                    }}
                                    className="w-full px-3 py-2 pl-9 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                                    placeholder="🔍 Search medicines..."
                                    autoComplete="off"
                                  />
                                  <svg 
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                  </svg>
                                </div>
                                {(filteredSuggestions[idx] || medicineSuggestions[idx])?.length > 0 && (
                                  <p className="text-xs text-gray-600 mt-1 px-1">
                                    {(filteredSuggestions[idx] || medicineSuggestions[idx]).length} result{(filteredSuggestions[idx] || medicineSuggestions[idx]).length !== 1 ? 's' : ''}
                                  </p>
                                )}
                              </div>
                              
                              {/* Medicine list - Show max 4 items initially (~200px), scroll if more */}
                              <div 
                                className="max-h-[200px] overflow-y-auto custom-scrollbar" 
                                style={{ maxHeight: '200px' }}
                                data-dropdown-row={idx}
                              >
                                {(filteredSuggestions[idx] || medicineSuggestions[idx]).map((med, medIdx) => (
                                  <div
                                    key={`${med.name}-${medIdx}`}
                                    data-medicine-item={`${idx}-${medIdx}`}
                                    onClick={() => selectMedicine(idx, med)}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onMouseEnter={() => setActiveSuggestionIndex(prev => ({ ...prev, [idx]: medIdx }))}
                                    className={`px-4 py-3 cursor-pointer transition-all duration-150 border-b border-gray-100 last:border-b-0 ${
                                      activeSuggestionIndex[idx] === medIdx 
                                        ? 'bg-gradient-to-r from-green-100 to-emerald-50 border-l-4 border-l-green-500 shadow-sm' 
                                        : 'hover:bg-gray-50'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-gray-900 text-sm">{med.name}</span>
                                          {med.type === 'brand' && (
                                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                                              Brand
                                            </span>
                                          )}
                                          {med.type === 'generic' && (
                                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                                              Generic
                                            </span>
                                          )}
                                        </div>
                                        {med.displayName !== med.name && (
                                          <div className="text-xs text-gray-600 mt-0.5 truncate">
                                            {med.displayName}
                                          </div>
                                        )}
                                        {med.strengths && med.strengths.length > 0 && (
                                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1 flex-wrap">
                                            <span className="font-medium">Strengths:</span>
                                            <span className="text-green-600">{med.strengths.slice(0, 3).join(', ')}</span>
                                            {med.strengths.length > 3 && (
                                              <span className="text-gray-400">+{med.strengths.length - 3} more</span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      {activeSuggestionIndex[idx] === medIdx && (
                                        <svg 
                                          className="w-5 h-5 text-green-600 flex-shrink-0" 
                                          fill="none" 
                                          stroke="currentColor" 
                                          viewBox="0 0 24 24"
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                {(filteredSuggestions[idx] || medicineSuggestions[idx]).length === 0 && (
                                  <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                    <p>No medicines found</p>
                                    <p className="text-xs mt-1">Try a different search term</p>
                                  </div>
                                )}
                              </div>
                              
                              {/* Scroll indicator */}
                              {(filteredSuggestions[idx] || medicineSuggestions[idx]).length > 4 && (
                                <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-200 text-center">
                                  <p className="text-xs text-gray-600 font-medium">
                                    <span className="text-green-600">{(filteredSuggestions[idx] || medicineSuggestions[idx]).length}</span> results • Scroll to see more
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      {/* Dynamic fields from PRESCRIPTION_FORM (excluding medicine which is handled above) */}
                      {PRESCRIPTION_FORM.filter(field => field.value !== 'medicine').map((field) => {
                        const fieldIcons = {
                          dosage: <FiActivity className="w-4 h-4 text-gray-400" />,
                          frequency: <FiClock className="w-4 h-4 text-gray-400" />,
                          duration: <FiCalendar className="w-4 h-4 text-gray-400" />,
                          qty: <FiPackage className="w-4 h-4 text-gray-400" />,
                          details: <FiFileText className="w-4 h-4 text-gray-400" />,
                          notes: <FiFileText className="w-4 h-4 text-gray-400" />
                        };
                        const placeholders = {
                          dosage: 'e.g., 1-0-1',
                          frequency: 'e.g., daily',
                          duration: 'e.g., 5 days',
                          qty: 'Quantity',
                          details: 'Additional details',
                          notes: 'Notes'
                        };
                        const datalistIds = {
                          dosage: 'dosageOptions',
                          frequency: 'frequencyOptions',
                          duration: 'durationOptions',
                          qty: 'quantityOptions'
                        };
                        return (
                          <td key={field.value} className="px-4 py-3">
                            <div className="relative">
                              {fieldIcons[field.value] && (
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                  {fieldIcons[field.value]}
                                </div>
                              )}
                              <input
                                value={row[field.value] || ''}
                                onChange={(e) => updatePrescriptionCell(idx, field.value, e.target.value)}
                                className={`w-full border-2 border-gray-200 rounded-lg px-3 py-2 ${fieldIcons[field.value] ? 'pl-10' : 'pl-3'} focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white hover:border-green-300`}
                                placeholder={placeholders[field.value] || field.label}
                                list={datalistIds[field.value]}
                              />
                            </div>
                          </td>
                        );
                      })}
                      {/* When field - not in PRESCRIPTION_FORM but needed */}
                      <td className="px-4 py-3">
                        <div className="relative">
                          <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          <input
                            value={row.when || ''}
                            onChange={(e) => updatePrescriptionCell(idx, 'when', e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 pl-10 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white hover:border-green-300"
                            placeholder="before/after food"
                            list="whenOptions"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          type="button" 
                          onClick={() => removePrescriptionRow(idx)} 
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 border border-red-200 hover:border-red-300"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Datalist suggestions for prescription fields - Using constants */}
            <datalist id="dosageOptions">
              {DOSAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} />
              ))}
            </datalist>
            <datalist id="whenOptions">
              {WHEN_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} />
              ))}
            </datalist>
            <datalist id="frequencyOptions">
              {FREQUENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} />
              ))}
            </datalist>
            <datalist id="durationOptions">
              {DURATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} />
              ))}
            </datalist>
            <datalist id="quantityOptions">
              {QUANTITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} />
              ))}
            </datalist>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 pb-2 px-6 bg-gradient-to-r from-gray-50 to-slate-50 border-t-2 border-gray-200">
              <Button
                type="button"
                onClick={addPrescriptionRow}
                variant="outline"
                className="flex items-center gap-2 bg-white hover:bg-green-50 border-2 border-green-300 hover:border-green-500 text-green-700 hover:text-green-800 font-medium shadow-sm transition-all duration-200"
              >
                <FiPlus className="w-5 h-5" />
                Add Medicine
              </Button>
              <button 
                type="button" 
                onClick={clearAllPrescriptions} 
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-red-50 border-2 border-gray-300 hover:border-red-300 rounded-lg transition-all duration-200 shadow-sm"
              >
                <FiTrash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </Card>

        {/* Action Buttons */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl no-print">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (returnTab) {
                  navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
                } else if (patientId) {
                  navigate(`/patients/${patientId}?tab=prescriptions`);
                } else {
                  navigate(-1);
                }
              }}
            >
              <FiX className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
            >
              <FiPrinter className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button 
              type="button" 
              onClick={handleSave}
              disabled={isSavingPrescriptions}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave className="w-4 h-4 mr-2" />
              {isSavingPrescriptions ? 'Saving...' : 'Save Prescription'}
            </Button>
          </div>
        </Card>
      </div>
 
    </>
  );
};

export default CreatePrescription;

