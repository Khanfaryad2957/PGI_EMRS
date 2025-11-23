import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiUser, FiEdit2, FiCheck, FiX, FiSearch, FiHeart, FiClock, 
  FiShield, FiTrendingUp, FiMapPin, FiNavigation, FiTruck, 
  FiUsers, FiBriefcase, FiBookOpen, FiDollarSign, FiHome, 
  FiPhone, FiFileText, FiHash, FiStar, FiActivity, FiCalendar,
  FiGlobe, FiUserCheck, FiInfo, FiAlertCircle
} from 'react-icons/fi';
import { useSearchPatientsQuery, useAssignPatientMutation, useUpdatePatientMutation,useCreatePatientCompleteMutation, useGetAllPatientsQuery, useGetPatientByIdQuery, useCreatePatientMutation, useGetPatientVisitCountQuery } from '../../features/patients/patientsApiSlice';
import { useGetDoctorsQuery } from '../../features/users/usersApiSlice';
import Card from '../../components/Card';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { isJR, isSR } from '../../utils/constants';

const SelectExistingPatient = () => {
  const navigate = useNavigate();


  const [createRecord, { isLoading }] = useCreatePatientMutation();
  // const [createRecordComplete, { isLoading: isLoadingComplete }] = useCreatePatientCompleteMutation();

  
  const [assignPatient, { isLoading: isAssigning }] = useAssignPatientMutation();
  const [updatePatient, { isLoading: isUpdating }] = useUpdatePatientMutation();
  const { data: usersData } = useGetDoctorsQuery({ page: 1, limit: 100 });

  const [crNumber, setCrNumber] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const justUpdatedDoctorRef = useRef(false);

  // Search for patient by CR number
  const { data: searchData, isLoading: searching, refetch: refetchPatient } = useSearchPatientsQuery(
    { search: crNumber, limit: 5 },
    { skip: !crNumber || crNumber.length < 2 }
  );



  const { data: demographicData, isLoading: loadingDemographics, refetch: refetchDemographics } = useGetPatientByIdQuery(
    selectedPatientId,
    { skip: !selectedPatientId }
  );
  
  // Fetch visit count for selected patient
  const { data: visitData, isLoading: isLoadingVisits, refetch: refetchVisitCount } = useGetPatientVisitCountQuery(
    selectedPatient?.id,
    { skip: !selectedPatient?.id }
  );
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [isEditingDoctor, setIsEditingDoctor] = useState(false);
  const [newRoom, setNewRoom] = useState('');
  const [newDoctorId, setNewDoctorId] = useState('');

  // Auto-select patient when CR number matches
  useEffect(() => {
    // Skip update if we just updated the doctor (to prevent overwriting)
    if (justUpdatedDoctorRef.current) {
      justUpdatedDoctorRef.current = false;
      return;
    }
    
    if (searchData?.data?.patients && crNumber && crNumber.length >= 2) {
      const exactMatch = searchData.data.patients.find(
        (p) => p.cr_no?.toLowerCase() === crNumber.toLowerCase()
      );

      if (exactMatch) {
        // If we already have a selected patient with the same ID, merge the data
        // This preserves any local updates (like doctor assignment) that haven't been reflected in search results yet
        if (selectedPatient && selectedPatient.id === exactMatch.id) {
          setSelectedPatient(prev => {
            // If current state has doctor info, preserve it (it's more recent than search results)
            const hasCurrentDoctorInfo = prev.assigned_doctor_id !== undefined && prev.assigned_doctor_id !== null;
            return {
              ...exactMatch,
              // Preserve updated doctor info - prioritize current state over search results
              assigned_doctor_id: hasCurrentDoctorInfo ? prev.assigned_doctor_id : exactMatch.assigned_doctor_id,
              assigned_doctor_name: prev.assigned_doctor_name || exactMatch.assigned_doctor_name,
              assigned_doctor_role: prev.assigned_doctor_role || exactMatch.assigned_doctor_role,
              // Preserve updated room if it exists
              assigned_room: prev.assigned_room || exactMatch.assigned_room,
            };
          });
        } else {
          setSelectedPatient(exactMatch);
        }
        setSelectedPatientId(exactMatch.id);
        // Only update form fields if they're empty or different
        if (!newRoom || newRoom !== exactMatch.assigned_room) {
          setNewRoom(exactMatch.assigned_room || '');
        }
        if (!newDoctorId || newDoctorId !== String(exactMatch.assigned_doctor_id || '')) {
          setNewDoctorId(exactMatch.assigned_doctor_id ? String(exactMatch.assigned_doctor_id) : '');
        }
      } else if (searchData.data.patients.length === 1) {
        // Auto-select if only one result
        const patient = searchData.data.patients[0];
        if (selectedPatient && selectedPatient.id === patient.id) {
          setSelectedPatient(prev => {
            // If current state has doctor info, preserve it (it's more recent than search results)
            const hasCurrentDoctorInfo = prev.assigned_doctor_id !== undefined && prev.assigned_doctor_id !== null;
            return {
              ...patient,
              // Preserve updated doctor info - prioritize current state over search results
              assigned_doctor_id: hasCurrentDoctorInfo ? prev.assigned_doctor_id : patient.assigned_doctor_id,
              assigned_doctor_name: prev.assigned_doctor_name || patient.assigned_doctor_name,
              assigned_doctor_role: prev.assigned_doctor_role || patient.assigned_doctor_role,
              // Preserve updated room if it exists
              assigned_room: prev.assigned_room || patient.assigned_room,
            };
          });
        } else {
          setSelectedPatient(patient);
        }
        setSelectedPatientId(patient.id);
        if (!newRoom || newRoom !== patient.assigned_room) {
          setNewRoom(patient.assigned_room || '');
        }
        if (!newDoctorId || newDoctorId !== String(patient.assigned_doctor_id || '')) {
          setNewDoctorId(patient.assigned_doctor_id ? String(patient.assigned_doctor_id) : '');
        }
      } else {
        setSelectedPatient(null);
        setSelectedPatientId(null);
      }
    } else {
      setSelectedPatient(null);
      setSelectedPatientId(null);
    }
  }, [searchData, crNumber]);

  const handleUpdateRoom = async () => {
    try {
      await updatePatient({
        id: selectedPatient.id,
        assigned_room: newRoom,
      }).unwrap();
      // Update local state immediately
      setSelectedPatient(prev => ({ ...prev, assigned_room: newRoom }));
      
      toast.success('Room updated successfully!');
      setIsEditingRoom(false);
      
      // Refetch to ensure consistency
      await Promise.all([
        refetchPatient(),
        refetchDemographics()
      ]);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update room');
    }
  };

  const handleUpdateDoctor = async () => {
    try {
      // Validate that a doctor is selected
      if (!newDoctorId || newDoctorId === '') {
        toast.error('Please select a doctor');
        return;
      }

      const doctorId = Number(newDoctorId);
      if (isNaN(doctorId) || doctorId <= 0) {
        toast.error('Invalid doctor selection');
        return;
      }

      // Find the selected doctor from usersData to get name and role
      const selectedDoctor = usersData?.data?.users?.find(u => u.id === doctorId);

      // Use updatePatient instead of assignPatient to avoid creating a visit record
      // assignPatient creates a visit record, which we don't want when just updating doctor
      await updatePatient({
        id: selectedPatient.id,
        assigned_doctor_id: doctorId,
      }).unwrap();
      
      // Set flag to prevent useEffect from overwriting our update
      justUpdatedDoctorRef.current = true;
      
      // Update local state immediately with new doctor info
      setSelectedPatient(prev => ({
        ...prev,
        assigned_doctor_id: doctorId,
        assigned_doctor_name: selectedDoctor?.name || null,
        assigned_doctor_role: selectedDoctor?.role || null,
      }));
      
      toast.success('Doctor assigned successfully!');
      setIsEditingDoctor(false);
      
      // Only refetch patient details - don't refetch search query as it may have stale data
      // The local state update above ensures UI shows the new doctor immediately
      await refetchDemographics();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to assign doctor');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPatient) {
      toast.error('Please enter a valid CR number');
      return;
    }

    try {
      // Create outpatient visit record
      // patient_id is now an integer
      await createRecord({ 
        name: selectedPatient.name, 
        patient_id: parseInt(selectedPatient.id, 10) // patient_id is now integer
      }).unwrap();
      toast.success('Visit record created successfully!');
      // Refetch visit count to update the display
      if (selectedPatient?.id) {
        await refetchVisitCount();
      }
      // Navigate to today's patients page to see the newly created visit
      navigate('/clinical-today-patients?tab=existing');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create record');
    }
  };

  const existingDemo = demographicData?.data?.patient;
  
  // Get visit count from API
  const currentVisitCount = visitData?.data?.visit_count || 0;
  const nextVisitNumber = currentVisitCount + 1;
  const visitType = currentVisitCount === 0 ? 'First Visit' : `Follow-up Visit #${nextVisitNumber}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="w-full px-6 py-8 space-y-8">

      <form onSubmit={handleSubmit}>
        {/* Search by CR Number */}
        <Card
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FiSearch className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-xl font-bold text-gray-900">Search Patient</span>
            </div>
          }
          className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FiHash className="w-4 h-4 text-primary-600" />
                CR Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Enter CR number (e.g., CR2024000001)"
                  value={crNumber}
                  onChange={(e) => setCrNumber(e.target.value)}
                  required
                  className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-gray-300 bg-gradient-to-r from-blue-50 to-indigo-50"
                />
              </div>
            </div>

            {searching && (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <FiSearch className="w-6 h-6 text-primary-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Searching for patient...</p>
                </div>
              </div>
            )}

            {/* Patient Found */}
            {selectedPatient && !searching && (
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <FiUser className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-green-800">Patient Found</h4>
                    <p className="text-sm text-green-600">Patient information loaded successfully</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <FiUser className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Name</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{selectedPatient.name}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <FiHash className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">CR Number</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 font-mono">{selectedPatient.cr_no}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <FiHeart className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Sex</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{selectedPatient.sex}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <FiClock className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Age</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{selectedPatient.age} years</p>
                  </div>
                  
                  {selectedPatient.psy_no && (
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <FiFileText className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">PSY Number</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 font-mono">{selectedPatient.psy_no}</p>
                    </div>
                  )}
                </div>

                {/* Assignment & Status Section */}
                <div className="mt-8 pt-6 border-t border-green-200">
                  <h5 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FiActivity className="w-5 h-5 text-green-600" />
                    Assignment & Status
                  </h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Room Assignment */}
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <div className="flex items-center gap-2 mb-3">
                        <FiHome className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-gray-700">Assigned Room</span>
                      </div>
                      {isEditingRoom ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newRoom}
                            onChange={(e) => setNewRoom(e.target.value)}
                            placeholder="e.g., Ward A-101"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleUpdateRoom}
                            loading={isUpdating}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                          >
                            <FiCheck className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsEditingRoom(false);
                              setNewRoom(selectedPatient.assigned_room || '');
                            }}
                            className="px-3 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                          >
                            <FiX className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900 font-medium">{selectedPatient.assigned_room || 'Not assigned'}</span>
                          <button
                            type="button"
                            onClick={() => setIsEditingRoom(true)}
                            className="text-primary-600 hover:text-primary-700 p-1 rounded-lg hover:bg-primary-50"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Doctor Assignment */}
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <div className="flex items-center gap-2 mb-3">
                        <FiUser className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-gray-700">Assigned Doctor</span>
                      </div>
                      {isEditingDoctor ? (
                        <div className="flex items-center gap-2">
                          <Select
                            value={newDoctorId}
                            onChange={(e) => setNewDoctorId(e.target.value)}
                            options={(usersData?.data?.users || [])
                              .map((u) => ({ 
                                value: String(u.id), 
                                label: `${u.name} - ${isJR(u.role) ? 'Resident' : isSR(u.role) ? 'Faculty' : u.role}` 
                              }))}
                            placeholder="Select doctor"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleUpdateDoctor}
                            loading={isUpdating}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                          >
                            <FiCheck className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsEditingDoctor(false);
                              setNewDoctorId(selectedPatient.assigned_doctor_id ? String(selectedPatient.assigned_doctor_id) : '');
                            }}
                            className="px-3 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                          >
                            <FiX className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {selectedPatient.assigned_doctor_name ? (
                              <>
                                <span className="text-gray-900 font-medium">{selectedPatient.assigned_doctor_name}</span>
                                {selectedPatient.assigned_doctor_role && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                    {selectedPatient.assigned_doctor_role}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-500 italic">Not assigned</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsEditingDoctor(true)}
                            className="text-primary-600 hover:text-primary-700 p-1 rounded-lg hover:bg-primary-50"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ADL File Status & Visit Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* ADL File Status */}
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <div className="flex items-center gap-2 mb-3">
                        <FiFileText className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-gray-700">ADL File</span>
                      </div>
                      {selectedPatient.has_adl_file || selectedPatient.adl_no ? (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-1">
                            <FiCheck className="w-3 h-3" />
                            <span>Exists</span>
                          </span>
                          {selectedPatient.adl_no && (
                            <span className="text-gray-900 font-mono text-sm">{selectedPatient.adl_no}</span>
                          )}
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                          Not Created
                        </span>
                      )}
                    </div>

                    {/* Visit Statistics */}
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <div className="flex items-center gap-2 mb-3">
                        <FiCalendar className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-gray-700">Visit Statistics</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-2xl font-bold text-blue-700">{nextVisitNumber}</span>
                        <span className="text-sm text-gray-600">Total Visits</span>
                        {currentVisitCount === 0 ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            First Visit
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            {visitType}
                          </span>
                        )}
                      </div>
                      {isLoadingVisits && (
                        <p className="text-xs text-gray-500 mt-1">Loading visit history...</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Patient Not Found */}
            {crNumber && crNumber.length >= 2 && !searching && !selectedPatient && searchData?.data?.patients?.length === 0 && (
              <div className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                    <FiAlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-yellow-800">Patient Not Found</h4>
                    <p className="text-sm text-yellow-700">
                      No patient found with CR number "{crNumber}". Please check the number and try again.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Multiple matches */}
            {crNumber && !searching && searchData?.data?.patients?.length > 1 && !selectedPatient && (
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                    <FiInfo className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-blue-800">Multiple Patients Found</h4>
                    <p className="text-sm text-blue-700">
                      Please enter the exact CR number to select a specific patient:
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {searchData.data.patients.map((p) => (
                    <div key={p.id} className="bg-white rounded-lg p-4 border border-blue-100 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiUser className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-mono font-bold text-gray-900">{p.cr_no}</span>
                        <span className="mx-2 text-gray-400">-</span>
                        <span className="text-gray-700">{p.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Existing Demographic Details */}
        {selectedPatient && (
          <>
            {loadingDemographics && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <FiUser className="w-8 h-8 text-primary-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Loading patient demographics...</p>
                </div>
              </div>
            )}
            {existingDemo && (
              <Card 
                title={
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-md">
                      <FiUser className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-gray-900">Patient Demographic Details</span>
                      <p className="text-sm text-gray-500 mt-1">Complete patient information profile</p>
                    </div>
                  </div>
                }
                className="mb-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm"
              >
                <div className="space-y-8">
                  {/* Personal Information Section */}
                  {(existingDemo.age_group || existingDemo.marital_status || existingDemo.year_of_marriage || existingDemo.no_of_children || existingDemo.no_of_children_male || existingDemo.no_of_children_female) && (
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                          <FiUsers className="w-5 h-5 text-blue-600" />
                        </div>
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {existingDemo.age_group && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FiClock className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Age Group</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">{existingDemo.age_group}</p>
                          </div>
                        )}
                        {existingDemo.marital_status && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FiHeart className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Marital Status</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">{existingDemo.marital_status}</p>
                          </div>
                        )}
                        {existingDemo.year_of_marriage && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FiCalendar className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Year of Marriage</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">{existingDemo.year_of_marriage}</p>
                          </div>
                        )}
                        {existingDemo.no_of_children !== null && existingDemo.no_of_children !== undefined && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FiUsers className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Children</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">{existingDemo.no_of_children}</p>
                          </div>
                        )}
                        {existingDemo.no_of_children_male !== null && existingDemo.no_of_children_male !== undefined && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FiUsers className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Male Children</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">{existingDemo.no_of_children_male}</p>
                          </div>
                        )}
                        {existingDemo.no_of_children_female !== null && existingDemo.no_of_children_female !== undefined && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FiUsers className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Female Children</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">{existingDemo.no_of_children_female}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Occupation & Education Section */}
                  {(existingDemo.occupation || existingDemo.actual_occupation || existingDemo.education_level || existingDemo.completed_years_of_education) && (
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-green-100 rounded-lg">
                          <FiBriefcase className="w-5 h-5 text-green-600" />
                        </div>
                        Occupation & Education
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {existingDemo.occupation && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FiBriefcase className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Occupation</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">{existingDemo.occupation}</p>
                          </div>
                        )}
                        {existingDemo.actual_occupation && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FiActivity className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Actual Occupation</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">{existingDemo.actual_occupation}</p>
                          </div>
                        )}
                        {existingDemo.education_level && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FiBookOpen className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Education Level</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">{existingDemo.education_level}</p>
                          </div>
                        )}
                        {existingDemo.completed_years_of_education && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FiClock className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Years of Education</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">{existingDemo.completed_years_of_education}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Financial Information Section */}
                  {(existingDemo.patient_income || existingDemo.family_income) && (
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-yellow-100 rounded-lg">
                          <FiDollarSign className="w-5 h-5 text-yellow-600" />
                        </div>
                        Financial Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {existingDemo.patient_income && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FiTrendingUp className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Patient Income</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">₹{existingDemo.patient_income.toLocaleString('en-IN')}</p>
                          </div>
                        )}
                        {existingDemo.family_income && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FiTrendingUp className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Family Income</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">₹{existingDemo.family_income.toLocaleString('en-IN')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Family Information Section */}
                  {(existingDemo.religion || existingDemo.family_type || existingDemo.locality || existingDemo.head_name || existingDemo.head_age || existingDemo.head_relationship || existingDemo.head_education || existingDemo.head_occupation || existingDemo.head_income) && (
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-purple-100 rounded-lg">
                          <FiUsers className="w-5 h-5 text-purple-600" />
                        </div>
                        Family Information
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {existingDemo.religion && (
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center gap-2 mb-1">
                                <FiShield className="w-4 h-4 text-gray-500" />
                                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Religion</span>
                              </div>
                              <p className="text-base font-semibold text-gray-900">{existingDemo.religion}</p>
                            </div>
                          )}
                          {existingDemo.family_type && (
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center gap-2 mb-1">
                                <FiUsers className="w-4 h-4 text-gray-500" />
                                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Family Type</span>
                              </div>
                              <p className="text-base font-semibold text-gray-900">{existingDemo.family_type}</p>
                            </div>
                          )}
                          {existingDemo.locality && (
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center gap-2 mb-1">
                                <FiMapPin className="w-4 h-4 text-gray-500" />
                                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Locality</span>
                              </div>
                              <p className="text-base font-semibold text-gray-900">{existingDemo.locality}</p>
                            </div>
                          )}
                        </div>

                        {/* Head of Family */}
                        {(existingDemo.head_name || existingDemo.head_age || existingDemo.head_relationship || existingDemo.head_education || existingDemo.head_occupation || existingDemo.head_income) && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <FiUser className="w-4 h-4 text-gray-600" />
                              Head of Family
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {existingDemo.head_name && (
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FiUser className="w-4 h-4 text-gray-500" />
                                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Name</span>
                                  </div>
                                  <p className="text-base font-semibold text-gray-900">{existingDemo.head_name}</p>
                                </div>
                              )}
                              {existingDemo.head_age && (
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FiClock className="w-4 h-4 text-gray-500" />
                                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Age</span>
                                  </div>
                                  <p className="text-base font-semibold text-gray-900">{existingDemo.head_age}</p>
                                </div>
                              )}
                              {existingDemo.head_relationship && (
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FiUsers className="w-4 h-4 text-gray-500" />
                                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Relationship</span>
                                  </div>
                                  <p className="text-base font-semibold text-gray-900">{existingDemo.head_relationship}</p>
                                </div>
                              )}
                              {existingDemo.head_education && (
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FiBookOpen className="w-4 h-4 text-gray-500" />
                                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Education</span>
                                  </div>
                                  <p className="text-base font-semibold text-gray-900">{existingDemo.head_education}</p>
                                </div>
                              )}
                              {existingDemo.head_occupation && (
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FiBriefcase className="w-4 h-4 text-gray-500" />
                                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Occupation</span>
                                  </div>
                                  <p className="text-base font-semibold text-gray-900">{existingDemo.head_occupation}</p>
                                </div>
                              )}
                              {existingDemo.head_income && (
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FiTrendingUp className="w-4 h-4 text-gray-500" />
                                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Income</span>
                                  </div>
                                  <p className="text-base font-semibold text-gray-900">₹{existingDemo.head_income.toLocaleString('en-IN')}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Referral & Mobility Section */}
                  {(existingDemo.distance_from_hospital || existingDemo.mobility || existingDemo.referred_by || existingDemo.exact_source || existingDemo.seen_in_walk_in_on || existingDemo.worked_up_on || existingDemo.school_college_office) && (
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-100 rounded-lg">
                          <FiMapPin className="w-5 h-5 text-indigo-600" />
                        </div>
                        Referral & Mobility Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {existingDemo.distance_from_hospital && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FiNavigation className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Distance from Hospital</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">{existingDemo.distance_from_hospital}</p>
                          </div>
                        )}
                        {existingDemo.mobility && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FiTruck className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Mobility</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">{existingDemo.mobility}</p>
                          </div>
                        )}
                        {existingDemo.referred_by && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FiUserCheck className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Referred By</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">{existingDemo.referred_by}</p>
                          </div>
                        )}
                        {existingDemo.exact_source && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FiInfo className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Exact Source</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">{existingDemo.exact_source}</p>
                          </div>
                        )}
                        {existingDemo.seen_in_walk_in_on && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FiCalendar className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Seen in Walk-in On</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">{new Date(existingDemo.seen_in_walk_in_on).toLocaleDateString('en-IN')}</p>
                          </div>
                        )}
                        {existingDemo.worked_up_on && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FiCalendar className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Worked Up On</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">{new Date(existingDemo.worked_up_on).toLocaleDateString('en-IN')}</p>
                          </div>
                        )}
                        {existingDemo.school_college_office && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FiBookOpen className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">School/College/Office</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">{existingDemo.school_college_office}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Information Section */}
                  {(existingDemo.present_address || existingDemo.permanent_address || existingDemo.local_address || existingDemo.contact_number || existingDemo.present_address_line_1 || existingDemo.permanent_address_line_1) && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-teal-100 rounded-lg">
                          <FiPhone className="w-5 h-5 text-teal-600" />
                        </div>
                        Contact & Address Information
                      </h3>
                      <div className="space-y-4">
                        {existingDemo.contact_number && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FiPhone className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Contact Number</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">{existingDemo.contact_number}</p>
                          </div>
                        )}
                        {existingDemo.present_address && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <FiHome className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-semibold text-gray-700">Present Address</span>
                            </div>
                            <p className="text-sm text-gray-900 leading-relaxed">{existingDemo.present_address}</p>
                          </div>
                        )}
                        {existingDemo.present_address_line_1 && !existingDemo.present_address && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <FiHome className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-semibold text-gray-700">Present Address</span>
                            </div>
                            <p className="text-sm text-gray-900 leading-relaxed">
                              {[
                                existingDemo.present_address_line_1,
                                existingDemo.present_address_line_2,
                                existingDemo.present_city_town_village,
                                existingDemo.present_district,
                                existingDemo.present_state,
                                existingDemo.present_pin_code,
                                existingDemo.present_country
                              ].filter(Boolean).join(', ')}
                            </p>
                          </div>
                        )}
                        {existingDemo.permanent_address && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <FiMapPin className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-semibold text-gray-700">Permanent Address</span>
                            </div>
                            <p className="text-sm text-gray-900 leading-relaxed">{existingDemo.permanent_address}</p>
                          </div>
                        )}
                        {existingDemo.permanent_address_line_1 && !existingDemo.permanent_address && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <FiMapPin className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-semibold text-gray-700">Permanent Address</span>
                            </div>
                            <p className="text-sm text-gray-900 leading-relaxed">
                              {[
                                existingDemo.permanent_address_line_1,
                                existingDemo.permanent_address_line_2,
                                existingDemo.permanent_city_town_village,
                                existingDemo.permanent_district,
                                existingDemo.permanent_state,
                                existingDemo.permanent_pin_code,
                                existingDemo.permanent_country
                              ].filter(Boolean).join(', ')}
                            </p>
                          </div>
                        )}
                        {existingDemo.local_address && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <FiActivity className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-semibold text-gray-700">Local Address</span>
                            </div>
                            <p className="text-sm text-gray-900 leading-relaxed">{existingDemo.local_address}</p>
                          </div>
                        )}
                        {(existingDemo.address_line || existingDemo.city || existingDemo.district || existingDemo.state) && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <FiGlobe className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-semibold text-gray-700">Quick Entry Address</span>
                            </div>
                            <p className="text-sm text-gray-900 leading-relaxed">
                              {[
                                existingDemo.address_line,
                                existingDemo.address_line_2,
                                existingDemo.city,
                                existingDemo.district,
                                existingDemo.state,
                                existingDemo.pin_code,
                                existingDemo.country
                              ].filter(Boolean).join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {!loadingDemographics && !existingDemo && (
              <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                      <FiInfo className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-blue-800">No Demographic Data Found</h4>
                      <p className="text-sm text-blue-700">
                        This will be the patient's first visit record. Demographic information can be added during the visit.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Submit Button */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/patients')}
                  className="px-8 py-3 bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200 hover:bg-gray-100 transition-all duration-200"
                >
                  <FiX className="mr-2" />
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  loading={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <FiUserCheck className="mr-2" />
                  {isLoading ? 'Creating Visit Record...' : 'Create Visit Record'}
                </Button>
              </div>
            </Card>
          </>
        )}
      </form>
      </div>
    </div>
  );
};

export default SelectExistingPatient;
