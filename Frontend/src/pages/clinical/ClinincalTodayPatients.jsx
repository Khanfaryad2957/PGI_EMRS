import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiUser, FiPhone,  FiClock, FiEye,
  FiRefreshCw, FiPlusCircle, FiFileText, FiUsers,  FiShield
} from 'react-icons/fi';
import { useGetAllPatientsQuery, } from '../../features/patients/patientsApiSlice';
import { useGetClinicalProformaByPatientIdQuery } from '../../features/clinical/clinicalApiSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { isAdmin, isMWO, isJrSr } from '../../utils/constants';

// Component to check for existing proforma and render patient row
const PatientRow = ({ patient, isNewPatient, navigate }) => {
  const { data: proformaData, isLoading: isLoadingProformas, refetch: refetchProformas } = useGetClinicalProformaByPatientIdQuery(
    patient.id, 
    { 
      skip: !patient.id,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );
  
  // Refetch proformas when component becomes visible (e.g., after returning from deletion)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && patient.id) {
        refetchProformas();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [patient.id, refetchProformas]);

  const proformas = proformaData?.data?.proformas || [];
  const hasExistingProforma = proformas.length > 0;
  const latestProformaId = hasExistingProforma ? proformas[0].id : null;
  
  // Check if patient has a proforma created today
  const toISTDateString = (dateInput) => {
    try {
      if (!dateInput) return '';
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    } catch (_) {
      return '';
    }
  };
  
  const todayDateString = toISTDateString(new Date());
  const hasProformaToday = proformas.some(proforma => {
    const proformaDate = toISTDateString(proforma.created_at || proforma.visit_date || proforma.date);
    return proformaDate === todayDateString;
  });
  
  // Note: We no longer hide patients with proformas today - they should still be visible in the list
  // This allows users to view/edit proformas or create additional ones if needed

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAgeGroupColor = (ageGroup) => {
    const colors = {
      '0-15': 'bg-blue-100 text-blue-800',
      '15-30': 'bg-green-100 text-green-800',
      '30-45': 'bg-yellow-100 text-yellow-800',
      '45-60': 'bg-orange-100 text-orange-800',
      '60+': 'bg-red-100 text-red-800',
    };
    return colors[ageGroup] || 'bg-gray-100 text-gray-800';
  };

  const getCaseComplexityColor = (complexity) => {
    return complexity === 'complex' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-green-100 text-green-800';
  };

  // Color coding: New patients = blue border, Existing patients = green border
  const borderColor = isNewPatient 
    ? 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-white' 
    : 'border-l-4 border-l-green-500 bg-gradient-to-r from-green-50/50 to-white';

  return (
    <div className={`p-5 sm:p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-200 rounded-lg mb-4 shadow-sm hover:shadow-md ${borderColor}`}>
      <div className="flex flex-col lg:flex-row lg:items-start gap-5 lg:gap-6">
        {/* Patient Information Section */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Header with name, info, and badges */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-bold text-gray-900 mb-3 break-words">
                {patient.name}
              </h4>
              <div className="flex flex-wrap items-center gap-4 sm:gap-5 text-sm text-gray-600">
                <span className="flex items-center gap-1.5 whitespace-nowrap bg-gray-50 px-2.5 py-1 rounded-md">
                  <FiUser className="w-4 h-4 flex-shrink-0 text-gray-500" />
                  <span className="font-medium">{patient.sex}</span>
                  <span className="text-gray-400">•</span>
                  <span>{patient.age} years</span>
                </span>
                {patient.contact_number && (
                  <span className="flex items-center gap-1.5 whitespace-nowrap bg-gray-50 px-2.5 py-1 rounded-md">
                    <FiPhone className="w-4 h-4 flex-shrink-0 text-gray-500" />
                    <span>{patient.contact_number}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5 whitespace-nowrap bg-gray-50 px-2.5 py-1 rounded-md">
                  <FiClock className="w-4 h-4 flex-shrink-0 text-gray-500" />
                  <span>{formatTime(patient.created_at)}</span>
                </span>
              </div>
            </div>
            {/* Badges */}
            <div className="flex flex-wrap gap-2 shrink-0">
              {/* Patient Type Badge */}
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm ${
                isNewPatient 
                  ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                  : 'bg-green-100 text-green-800 border border-green-300'
              }`}>
                {isNewPatient ? 'New Patient' : 'Existing Patient'}
              </span>
              {patient.age_group && (
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm ${getAgeGroupColor(patient.age_group)}`}>
                  {patient.age_group}
                </span>
              )}
              {patient.case_complexity && (
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm ${getCaseComplexityColor(patient.case_complexity)}`}>
                  {patient.case_complexity}
                </span>
              )}
              {patient.has_adl_file && (
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 whitespace-nowrap shadow-sm">
                  ADL File
                </span>
              )}
            </div>
          </div>

          {/* Patient Details - Essential fields only */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-gray-700 whitespace-nowrap">CR No:</span>
              <span className="text-gray-900 font-medium break-words">{patient.cr_no}</span>
            </div>
            {patient.psy_no && (
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-gray-700 whitespace-nowrap">PSY No:</span>
                <span className="text-gray-900 font-medium break-words">{patient.psy_no}</span>
              </div>
            )}
            {patient.assigned_room && (
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-gray-700 whitespace-nowrap">Room:</span>
                <span className="text-gray-900 font-medium break-words">{patient.assigned_room}</span>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="pt-3 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-600">Registered by:</span>
              <span className="ml-2">{patient.filled_by_name}</span>
              {patient.filled_by_role && (
                <span className="ml-1 text-gray-400">({patient.filled_by_role})</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="lg:w-48 xl:w-56 shrink-0">
          <div className="flex flex-row lg:flex-col gap-2.5">
            {/* View Details Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/patients/${patient.id}?edit=false`)}
              className="flex items-center justify-center gap-2 w-full lg:w-full px-4 py-2.5 text-sm font-medium transition-all hover:shadow-md"
            >
              <FiEye className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">View Details</span>
            </Button>
            
            {/* Walk-in Clinical Proforma Button */}
            {/* {hasExistingProforma ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/clinical/${latestProformaId}?returnTab=${activeTab}`)}
                className="flex items-center justify-center gap-2 w-full lg:w-full px-4 py-2.5 text-sm font-medium bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition-all hover:shadow-md"
              >
                <FiFileText className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">View Proforma</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/clinical/new?patient_id=${patient.id}&returnTab=${activeTab}`)}
                className="flex items-center justify-center gap-2 w-full lg:w-full px-4 py-2.5 text-sm font-medium transition-all hover:shadow-md"
              >
                <FiPlusCircle className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Walk-in Clinical Proforma</span>
              </Button>
            )} */}
            <Button
                variant="outline"
                size="sm"
                
                onClick={() => {
                  navigate(`/patients/${patient.id}?edit=true&mode=create`)
                }}
                className="flex items-center justify-center gap-2 w-full lg:w-full px-4 py-2.5 text-sm font-medium transition-all hover:shadow-md"
              >
                <FiPlusCircle className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Walk-in Clinical Proforma</span>
              </Button>
            
            {/* Prescribe Medication Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/prescriptions/create?patient_id=${patient.id}`)}
              className="flex items-center justify-center gap-2 w-full lg:w-full px-4 py-2.5 text-sm font-medium transition-all hover:shadow-md"
            >
              <FiPlusCircle className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Prescribe</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClinicalTodayPatients = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useSelector(selectCurrentUser);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [filters, setFilters] = useState({
    sex: '',
    age_group: '',
    marital_status: '',
    occupation: '',
    religion: '',
    family_type: '',
    locality: '',
    category: '',
    case_complexity: '',
  });

  // Fetch patients data - use a high limit to get all today's patients at once
  // This ensures newly created patients appear immediately
  const { data, isLoading, isFetching, refetch, error } = useGetAllPatientsQuery({
    page: 1,
    limit: 1000, // High limit to fetch all patients, then filter client-side for today
    // search: search.trim() || undefined // Only include search if it has a value
  }, {
    pollingInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  
  // Debug: Log filtered patients for troubleshooting
  // console.log("API Patients:", apiPatients?.length, "Today Patients:", todayPatients?.length, "New Patients:", newPatients?.length)
  // Track previous location to detect navigation changes
  const prevLocationRef = useRef(location.pathname);
  
  // Refetch on mount to ensure fresh data when returning from patient creation
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - refetch is stable from RTK Query
  
  useEffect(() => {
    // If we navigated away and came back, refetch the data
    if (prevLocationRef.current !== location.pathname && location.pathname === '/clinical-today-patients') {
      refetch();
    }
    prevLocationRef.current = location.pathname;
  }, [location.pathname, refetch]);
  
  // Refetch when window comes into focus (user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };
    
    // Refetch when component becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetch();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch]);
  


 

  // Helper: get YYYY-MM-DD string in IST for any date-like input
  const toISTDateString = (dateInput) => {
    try {
      if (!dateInput) return '';
      // Handle both string and Date objects
      const d = new Date(dateInput);
      // Check if date is valid
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
    } catch (_) {
      return '';
    }
  };

  const filterTodayPatients = (patients) => {
    if (!Array.isArray(patients)) return [];

    const targetDate = toISTDateString(selectedDate || new Date());

    return patients.filter((patient) => {
      if (!patient) return false;

      // Check if patient was created today - be more lenient with date comparison
      const patientCreatedDate = patient?.created_at ? toISTDateString(patient.created_at) : '';
      const createdToday = patientCreatedDate && patientCreatedDate === targetDate;

      // Check if patient has a visit today (from latest assignment date, visit date, or has_visit_today flag)
      const hasVisitToday = patient?.has_visit_today === true ||
        (patient?.last_assigned_date && 
        toISTDateString(patient.last_assigned_date) === targetDate) ||
        (patient?.visit_date && 
        toISTDateString(patient.visit_date) === targetDate);

      // Patient appears if created today OR has visit today
      // Show all patients created today regardless of who created them
      // The role-based filtering happens later in the component
      return createdToday || hasVisitToday;
    });
  };

  // Safely derive patients from API (handles both {data:{patients}} and {patients})
  const apiPatients = data?.data?.patients || data?.patients || [];
  const apiPagination = data?.data?.pagination || data?.pagination || undefined;


  // Deduplicate patients by ID to prevent duplicates
  // Use a Map to keep track of unique patients by their ID
  const uniquePatientsMap = new Map();
  apiPatients.forEach(patient => {
    if (patient?.id) {
      // If patient already exists, keep the first occurrence (or merge if needed)
      if (!uniquePatientsMap.has(patient.id)) {
        uniquePatientsMap.set(patient.id, patient);
      }
    }
  });
  const deduplicatedApiPatients = Array.from(uniquePatientsMap.values());

  // Helper function to determine if patient is new (created today) or existing (visit today)
  const isNewPatient = (patient) => {
    if (!patient?.created_at) return false;
    const targetDate = toISTDateString(selectedDate || new Date());
    const patientCreatedDate = toISTDateString(patient.created_at);
    return patientCreatedDate && patientCreatedDate === targetDate;
  };

  const isExistingPatient = (patient) => {
    const targetDate = toISTDateString(selectedDate || new Date());
    const hasVisitToday = patient?.has_visit_today === true ||
      (patient?.last_assigned_date && 
      toISTDateString(patient.last_assigned_date) === targetDate) ||
      (patient?.visit_date && 
      toISTDateString(patient.visit_date) === targetDate);
    
    // Existing patient: has visit today but NOT created today
    const patientCreatedDate = patient?.created_at ? toISTDateString(patient.created_at) : '';
    const createdToday = patientCreatedDate && patientCreatedDate === targetDate;
    
    return hasVisitToday && !createdToday;
  };

  // First filter by date (today's patients)
  const todayPatientsByDate = filterTodayPatients(deduplicatedApiPatients);

  // Then filter by role-based access
  const todayPatients = todayPatientsByDate.filter((p) => {
    // If no current user, show nothing (shouldn't happen in protected route, but safety check)
    if (!currentUser) {
      return false;
    }
    
    // Admin can see all patients
    if (isAdmin(currentUser.role)) return true;
    
    // MWO can see all patients created today (new patients)
    if (isMWO(currentUser.role)) {
      // MWO should see all patients - they register new patients
      return true;
    }
    
    // Only allow JR/SR to see patients assigned to them
    if (isJrSr(currentUser.role)) {
      // Prefer direct field; fallback to latest assignment fields if present
      if (p.assigned_doctor_id) {
        // Both IDs are integers
        const patientDoctorId = parseInt(p.assigned_doctor_id, 10);
        const currentUserId = parseInt(currentUser.id, 10);
        return patientDoctorId === currentUserId;
      }
      if (p.assigned_doctor) {
        const patientDoctorId = String(p.assigned_doctor);
        const currentUserId = String(currentUser.id);
        return patientDoctorId === currentUserId;
      }
      if (p.assigned_doctor_name && p.assigned_doctor_role) {
        // If role exists but id missing, be conservative: hide
        return false;
      }
      // If no assignment info present, hide for doctors
      return false;
    }
    
    // Other roles: default deny
    return false;
  });

  
  // Combine all today's patients (both new and existing) - they'll be color-coded
  const allTodayPatients = todayPatients;
  
  const filteredPatients = allTodayPatients.filter(patient => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return patient[key]?.toString().toLowerCase().includes(value.toLowerCase());
    });
  });

  // Debug: Log filtering results (after all filters are applied)
  console.log('[ClinicalTodayPatients] Debug:', {
    totalApiPatients: deduplicatedApiPatients.length,
    todayPatientsByDate: todayPatientsByDate.length,
    todayPatientsAfterRoleFilter: todayPatients.length,
    filteredPatients: filteredPatients.length,
    selectedDate,
    currentDate: toISTDateString(new Date()),
    currentUser: currentUser ? { id: currentUser.id, role: currentUser.role } : null,
    samplePatient: deduplicatedApiPatients[0] ? {
      id: deduplicatedApiPatients[0].id,
      name: deduplicatedApiPatients[0].name,
      created_at: deduplicatedApiPatients[0].created_at,
      created_at_IST: deduplicatedApiPatients[0].created_at ? toISTDateString(deduplicatedApiPatients[0].created_at) : null,
      assigned_doctor_id: deduplicatedApiPatients[0].assigned_doctor_id,
    } : null,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FiUsers className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium text-lg">Loading today's patients...</p>
          <p className="mt-2 text-gray-500 text-sm">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiShield className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Patients</h2>
          <p className="text-gray-600 mb-6">{error?.data?.message || 'Failed to load patients'}</p>
          <Button 
            onClick={() => refetch()} 
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg"
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6 py-6">
      

        {/* Patients List */}
        <Card className="shadow-lg border border-gray-200/50 bg-white/90 backdrop-blur-sm">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">
                  Today's Patients
                <span className="ml-2 px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  {filteredPatients.length}
                </span>
              </h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-600"></div>
                    <span className="text-gray-600 font-medium">
                      New ({todayPatients.filter(isNewPatient).length})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-600"></div>
                    <span className="text-gray-600 font-medium">
                      Existing ({todayPatients.filter(isExistingPatient).length})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                <FiUsers className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-xl font-semibold text-gray-700 mb-2">No patients found</p>
              <p className="text-gray-500 text-center max-w-md">
                {Object.values(filters).some(f => f) 
                  ? 'No patients match the current filters for today.'
                  : 'No patients were registered or have visits scheduled for today.'
                }
              </p>
            </div>
          ) : (
          <div className="p-6 space-y-4">
            {filteredPatients.map((patient) => (
              <PatientRow 
                key={patient.id} 
                patient={patient} 
                isNewPatient={isNewPatient(patient)}
                navigate={navigate}
              />
            ))}
          </div>
        )}

          {/* Patient count info - no pagination needed since we fetch all today's patients */}
          {filteredPatients.length > 0 && (
            <div className="px-6 py-5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
              <div className="text-sm text-gray-700 font-medium">
                Showing <span className="font-semibold text-gray-900">{filteredPatients.length}</span> patient{filteredPatients.length !== 1 ? 's' : ''} for today
                <span className="ml-3 text-gray-500">
                  (<span className="text-blue-600 font-semibold">{todayPatients.filter(isNewPatient).length} new</span>
                  {' / '}
                  <span className="text-green-600 font-semibold">{todayPatients.filter(isExistingPatient).length} existing</span>)
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ClinicalTodayPatients;
