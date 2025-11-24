import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Select from '../../components/Select';
import { formatDate } from '../../utils/formatters';
import {
  getFileStatusLabel, getCaseSeverityLabel,
  formatAddress, formatCurrency, formatDateTime
} from '../../utils/enumMappings';
import { isAdmin, isJrSr, isMWO, PATIENT_REGISTRATION_FORM, isJR, isSR } from '../../utils/constants';
import {
  FiUser, FiUsers, FiBriefcase, FiDollarSign, FiHome, FiMapPin, FiPhone,
  FiCalendar, FiGlobe, FiFileText, FiHash, FiClock,
  FiHeart, FiBookOpen, FiTrendingUp, FiShield,
  FiNavigation, FiTruck, FiEdit3, FiSave, FiX, FiLayers, FiLoader,
  FiFolder, FiChevronDown, FiChevronUp, FiPackage, FiEdit, FiPlus, FiTrash2, FiCheck, FiDownload
} from 'react-icons/fi';
import Button from '../../components/Button';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx-js-style';

import { useGetPrescriptionByIdQuery } from '../../features/prescriptions/prescriptionApiSlice';
import { useGetPatientFilesQuery } from '../../features/patients/patientFilesApiSlice';
import FilePreview from '../../components/FilePreview';


const IconInput = ({ icon, label, loading = false, error, defaultValue, ...props }) => {
  // Filter out non-DOM props that shouldn't be passed to the input element
  const {
    defaultToday,
    searchable,
    formData,
    customFieldName,
    inputLabel,
    options,
    customValue,
    setCustomValue,
    showCustomInput,
    containerClassName,
    dropdownZIndex,
    ...domProps
  } = props;

  // Remove defaultValue if value is provided to avoid controlled/uncontrolled warning
  const inputProps = domProps.value !== undefined ? { ...domProps } : { ...domProps, defaultValue };

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



const PatientDetailsView = ({ patient, formData, clinicalData, adlData, outpatientData, userRole }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTab = searchParams.get('returnTab');
  
  // Fetch patient files for preview
  const { data: patientFilesData } = useGetPatientFilesQuery(patient?.id, {
    skip: !patient?.id
  });
  const existingFiles = patientFilesData?.data?.files || [];

  // Merge patient and formData to ensure all fields are available with proper fallbacks
  // This ensures data is available immediately even if formData hasn't loaded yet
  // Priority: formData > patient > empty string
  const displayData = useMemo(() => {
    return {
      ...patient,
      ...formData,
      // Use formData first, then fallback to patient for critical fields
      cr_no: formData?.cr_no || patient?.cr_no || '',
      psy_no: formData?.psy_no || patient?.psy_no || '',
      name: formData?.name || patient?.name || '',
      sex: formData?.sex || patient?.sex || '',
      age: formData?.age || patient?.age || '',
      contact_number: formData?.contact_number || patient?.contact_number || '',
      assigned_room: formData?.assigned_room || patient?.assigned_room || '',
      assigned_doctor_id: formData?.assigned_doctor_id || patient?.assigned_doctor_id || '',
      assigned_doctor_name: formData?.assigned_doctor_name || patient?.assigned_doctor_name || '',
      assigned_doctor_role: formData?.assigned_doctor_role || patient?.assigned_doctor_role || '',
      date: formData?.date || patient?.date || '',
      father_name: formData?.father_name || patient?.father_name || '',
      category: formData?.category || patient?.category || '',
      department: formData?.department || patient?.department || '',
      unit_consit: formData?.unit_consit || patient?.unit_consit || '',
      room_no: formData?.room_no || patient?.room_no || '',
      serial_no: formData?.serial_no || patient?.serial_no || '',
      file_no: formData?.file_no || patient?.file_no || '',
      unit_days: formData?.unit_days || patient?.unit_days || '',
      address_line: formData?.address_line || patient?.address_line || '',
      country: formData?.country || patient?.country || '',
      state: formData?.state || patient?.state || '',
      district: formData?.district || patient?.district || '',
      city: formData?.city || patient?.city || '',
      pin_code: formData?.pin_code || patient?.pin_code || '',
      special_clinic_no: formData?.special_clinic_no || patient?.special_clinic_no || '',
      seen_in_walk_in_on: formData?.seen_in_walk_in_on || patient?.seen_in_walk_in_on || '',
      worked_up_on: formData?.worked_up_on || patient?.worked_up_on || '',
      // Additional fields that might be in either source
      age_group: formData?.age_group || patient?.age_group || '',
      marital_status: formData?.marital_status || patient?.marital_status || '',
      year_of_marriage: formData?.year_of_marriage || patient?.year_of_marriage || '',
      no_of_children_male: formData?.no_of_children_male || patient?.no_of_children_male || '',
      no_of_children_female: formData?.no_of_children_female || patient?.no_of_children_female || '',
      occupation: formData?.occupation || patient?.occupation || '',
      education: formData?.education || formData?.education_level || patient?.education || patient?.education_level || '',
      patient_income: formData?.patient_income || patient?.patient_income || '',
      family_income: formData?.family_income || patient?.family_income || '',
      religion: formData?.religion || patient?.religion || '',
      family_type: formData?.family_type || patient?.family_type || '',
      locality: formData?.locality || patient?.locality || '',
      head_name: formData?.head_name || patient?.head_name || '',
      head_age: formData?.head_age || patient?.head_age || '',
      head_relationship: formData?.head_relationship || patient?.head_relationship || '',
      head_education: formData?.head_education || patient?.head_education || '',
      head_occupation: formData?.head_occupation || patient?.head_occupation || '',
      head_income: formData?.head_income || patient?.head_income || '',
      distance_from_hospital: formData?.distance_from_hospital || patient?.distance_from_hospital || '',
      mobility: formData?.mobility || patient?.mobility || '',
      referred_by: formData?.referred_by || patient?.referred_by || '',
    };
  }, [patient, formData]);

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

  // Determine which sections to show based on CURRENT USER's role (userRole), not filled_by_role
  // If current user is System Administrator, JR, or SR → Show all 4 sections
  // If current user is Psychiatric Welfare Officer (MWO) → Show only Patient Details
  const canViewAllSections = userRole && (
    isAdmin(userRole) ||
    isJrSr(userRole)
  );
  const canViewClinicalProforma = canViewAllSections;

  const canViewADLFile = canViewAllSections;
  const canViewPrescriptions = canViewAllSections;


  const patientAdlFiles = adlData?.data?.adlFiles || [];


  // Get clinical proformas for this patient - ensure it's always an array
  const patientProformas = Array.isArray(clinicalData?.data?.proformas)
    ? clinicalData.data.proformas
    : [];

  // Fetch prescriptions for all proformas
  // Always compute proformaIds as an array with exactly 10 elements (padding with null)
  // This ensures hooks are always called with the same structure
  const proformaIds = useMemo(() => {
    const ids = patientProformas.map(p => p?.id).filter(Boolean).slice(0, 10);
    // Pad to exactly 10 elements with null to ensure consistent hook calls
    while (ids.length < 10) {
      ids.push(null);
    }
    return ids;
  }, [patientProformas]);

  // Always call the same number of hooks (10) in the same order
  // This ensures React hooks are called in a consistent order every render
  // proformaIds is guaranteed to have exactly 10 elements (padded with null if needed)
  const prescriptionResult1 = useGetPrescriptionByIdQuery({ clinical_proforma_id: proformaIds[0] }, { skip: !proformaIds[0] });
  const prescriptionResult2 = useGetPrescriptionByIdQuery({ clinical_proforma_id: proformaIds[1] }, { skip: !proformaIds[1] });
  const prescriptionResult3 = useGetPrescriptionByIdQuery({ clinical_proforma_id: proformaIds[2] }, { skip: !proformaIds[2] });
  const prescriptionResult4 = useGetPrescriptionByIdQuery({ clinical_proforma_id: proformaIds[3] }, { skip: !proformaIds[3] });
  const prescriptionResult5 = useGetPrescriptionByIdQuery({ clinical_proforma_id: proformaIds[4] }, { skip: !proformaIds[4] });
  const prescriptionResult6 = useGetPrescriptionByIdQuery({ clinical_proforma_id: proformaIds[5] }, { skip: !proformaIds[5] });
  const prescriptionResult7 = useGetPrescriptionByIdQuery({ clinical_proforma_id: proformaIds[6] }, { skip: !proformaIds[6] });
  const prescriptionResult8 = useGetPrescriptionByIdQuery({ clinical_proforma_id: proformaIds[7] }, { skip: !proformaIds[7] });
  const prescriptionResult9 = useGetPrescriptionByIdQuery({ clinical_proforma_id: proformaIds[8] }, { skip: !proformaIds[8] });
  const prescriptionResult10 = useGetPrescriptionByIdQuery({ clinical_proforma_id: proformaIds[9] }, { skip: !proformaIds[9] });

  // Combine all prescription results - always use all 10 results
  const prescriptionResults = [
    prescriptionResult1,
    prescriptionResult2,
    prescriptionResult3,
    prescriptionResult4,
    prescriptionResult5,
    prescriptionResult6,
    prescriptionResult7,
    prescriptionResult8,
    prescriptionResult9,
    prescriptionResult10,
  ];

  // Combine all prescriptions and group by proforma/visit date
  const allPrescriptions = useMemo(() => {
    const prescriptions = [];
    prescriptionResults.forEach((result, index) => {
      const proformaId = proformaIds[index];
      if (proformaId && result.data?.data?.prescription?.prescription) {
        const proforma = patientProformas.find(p => p.id === proformaId);
        const prescriptionData = result.data.data.prescription;
        prescriptionData.prescription.forEach(prescription => {
          prescriptions.push({
            ...prescription,
            proforma_id: proformaId,
            visit_date: proforma?.visit_date || proforma?.created_at,
            visit_type: proforma?.visit_type
          });
        });
      }
    });
    // Sort by visit date (most recent first)
    return prescriptions.sort((a, b) => {
      const dateA = new Date(a.visit_date || 0);
      const dateB = new Date(b.visit_date || 0);
      return dateB - dateA;
    });
  }, [prescriptionResults, patientProformas, proformaIds]);

  // Group prescriptions by visit date
  const prescriptionsByVisit = useMemo(() => {
    const grouped = {};
    allPrescriptions.forEach(prescription => {
      const visitDate = prescription.visit_date
        ? formatDate(prescription.visit_date)
        : 'Unknown Date';
      if (!grouped[visitDate]) {
        grouped[visitDate] = {
          date: prescription.visit_date,
          visitType: prescription.visit_type,
          prescriptions: []
        };
      }
      grouped[visitDate].prescriptions.push(prescription);
    });
    return grouped;
  }, [allPrescriptions]);

  // Helper function to apply header styles with different colors
  const applyHeaderStyles = (ws, colorRanges) => {
    if (!ws['!ref']) return;

    const range = XLSX.utils.decode_range(ws['!ref']);
    const numCols = range.e.c + 1;

    // Apply styles to each header cell
    for (let col = 0; col < numCols; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });

      if (!ws[cellAddress]) continue;

      // Find which color range this column belongs to
      let headerColor = '2E86AB'; // Default blue
      for (const range of colorRanges) {
        if (col >= range.start && col <= range.end) {
          headerColor = range.color;
          break;
        }
      }

      // Apply header styling with bold, colored background, and white text
      ws[cellAddress].s = {
        font: {
          bold: true,
          color: { rgb: "FFFFFF" },
          size: 12
        },
        fill: {
          fgColor: { rgb: headerColor }
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
          wrapText: true
        },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };
    }

    // Set column widths for better readability
    const colWidths = [];
    for (let col = 0; col < numCols; col++) {
      const header = ws[XLSX.utils.encode_cell({ r: 0, c: col })]?.v || '';
      let width = Math.max(String(header).length * 1.2, 12);
      if (String(header).includes('Address') || String(header).includes('Description')) {
        width = Math.max(width, 25);
      } else if (String(header).includes('Date') || String(header).includes('Time')) {
        width = Math.max(width, 18);
      } else if (String(header).includes('Income') || String(header).includes('Amount')) {
        width = Math.max(width, 15);
      }
      colWidths.push({ wch: Math.min(width, 50) });
    }
    ws['!cols'] = colWidths;
  };

  // Export patient details to Excel
  // Psychiatric Welfare Officer (MWO) can only export patient details, not clinical proformas, ADL files, or prescriptions
  const handleExportPatient = () => {
    try {
      if (!patient && !displayData) {
        toast.error('No patient data available to export');
        return;
      }

      // Check if user is MWO (Psychiatric Welfare Officer)
      const isMWOUser = userRole && isMWO(userRole);

      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Sheet 1: Patient Basic Details (always included)
      // Use PATIENT_REGISTRATION_FORM labels as Excel headers
      const patientExportData = {};

      PATIENT_REGISTRATION_FORM.forEach(field => {
        const value = displayData[field.value];

        // Handle special cases
        if (field.value === 'mobile_no') {
          // Use contact_number if mobile_no is not available
          patientExportData[field.label] = displayData.contact_number || displayData.mobile_no || 'N/A';
        } else if (field.value === 'date') {
          // Format date if available
          patientExportData[field.label] = value ? formatDate(value) : 'N/A';
        } else if (field.value === 'seen_in_walk_in_on' || field.value === 'worked_up_on') {
          // Format date fields
          patientExportData[field.label] = value ? formatDate(value) : 'N/A';
        } else if (field.value === 'patient_income') {
          // Use patient_income if patient_income is not available
          const incomeValue = value || displayData.patient_income || '';
          patientExportData[field.label] = incomeValue ? (typeof incomeValue === 'number' ? `₹${incomeValue}` : incomeValue) : 'N/A';
        } else if (field.value === 'family_income') {
          // Use family_income if family_income is not available
          const familyIncomeValue = value || displayData.family_income || '';
          patientExportData[field.label] = familyIncomeValue ? (typeof familyIncomeValue === 'number' ? `₹${familyIncomeValue}` : familyIncomeValue) : 'N/A';
        } else if (field.value === 'education') {
          // Use education_level if education is not available
          patientExportData[field.label] = value || displayData.education_level || 'N/A';
        } else if (field.value === 'assigned_doctor_name') {
          // Format assigned doctor with role if available
          const doctorName = value || displayData.assigned_doctor_name || '';
          const doctorRole = displayData.assigned_doctor_role || '';
          patientExportData[field.label] = doctorName
            ? (doctorRole ? `${doctorName} (${doctorRole})` : doctorName)
            : 'Not assigned';
        } else {
          // Default: use value or 'N/A'
          patientExportData[field.label] = (value !== null && value !== undefined && value !== '') ? value : 'N/A';
        }
      });

      const ws1 = XLSX.utils.json_to_sheet([patientExportData]);

      // Apply header styling with different colors for different sections
      // Color ranges based on PATIENT_REGISTRATION_FORM structure
      const totalFields = PATIENT_REGISTRATION_FORM.length;
      applyHeaderStyles(ws1, [
        { start: 0, end: 13, color: '2E86AB' }, // Quick Entry & Registration (Blue) - CR No to Contact Number
        // { start: 14, end: 18, color: '28A745' }, // Personal Info (Green) - Seen in Walk-in to Age Group
        // { start: 19, end: 22, color: '6F42C1' }, // Personal Information (Purple) - Marital Status to No of Children Female
        // { start: 23, end: 27, color: 'FD7E14' }, // Occupation & Education (Orange) - Occupation to Family Type
        // { start: 28, end: 33, color: 'DC3545' }, // Head of Family (Red) - Family Head Name to Family Head Income
        // { start: 34, end: 36, color: '20C997' }, // Distance, Mobility, Referred (Teal)
        // { start: 37, end: 42, color: '6610F2' }, // Address Details (Indigo) - Address Line to Pin Code
        // { start: 43, end: totalFields - 1, color: 'E83E8C' }, // Additional Fields (Pink) - Assigned Doctor fields
      ]);

      XLSX.utils.book_append_sheet(wb, ws1, 'Patient Details');

      // Sheet 2: Clinical Proformas (only if user has permission and is not MWO)
      if (!isMWOUser && canViewClinicalProforma && patientProformas.length > 0) {
        const proformaData = patientProformas.map((proforma, index) => ({
          'Visit #': index + 1,
          'Visit Date': proforma.visit_date ? formatDate(proforma.visit_date) : 'N/A',
          'Visit Type': proforma.visit_type === 'first_visit' ? 'First Visit' : 'Follow-up',
          'Room Number': proforma.room_no || 'N/A',
          'Doctor Name': proforma.doctor_name || 'N/A',
          'Doctor Role': proforma.doctor_role || 'N/A',
          'Case Severity': getCaseSeverityLabel(proforma.case_severity) || 'N/A',
          'Decision': proforma.decision || 'N/A',
          'Doctor Decision': proforma.doctor_decision === 'complex_case' ? 'Complex Case' : (proforma.doctor_decision === 'simple_case' ? 'Simple Case' : 'N/A'),
          'Requires ADL File': proforma.requires_adl_file ? 'Yes' : 'No',
          'Informant Present': proforma.informant_present ? 'Yes' : 'No',
          'Diagnosis': proforma.diagnosis || 'N/A',
          'ICD Code': proforma.icd_code || 'N/A',
          'Disposal': proforma.disposal || 'N/A',
          'Workup Appointment': proforma.workup_appointment ? formatDate(proforma.workup_appointment) : 'N/A',
          'Referred To': proforma.referred_to || 'N/A',
          'Treatment Prescribed': proforma.treatment_prescribed || 'N/A',
          'ADL Reasoning': proforma.adl_reasoning || 'N/A',
          'Created At': proforma.created_at ? formatDateTime(proforma.created_at) : 'N/A',
        }));
        const ws2 = XLSX.utils.json_to_sheet(proformaData);
        applyHeaderStyles(ws2, [{ start: 0, end: 17, color: '2E86AB' }]); // Blue for all columns
        XLSX.utils.book_append_sheet(wb, ws2, 'Clinical Proformas');
      }

      // Sheet 3: ADL Files (only if user has permission and is not MWO)
      if (!isMWOUser && canViewADLFile && patientAdlFiles.length > 0) {
        const adlData = patientAdlFiles.map((file, index) => ({
          'ADL File #': index + 1,
          'ADL Number': file.adl_no || 'N/A',
          'File Status': getFileStatusLabel(file.file_status) || 'N/A',
          'Patient Name': file.patient_name || 'N/A',
          'CR Number': file.cr_no || 'N/A',
          'PSY Number': file.psy_no || 'N/A',
          'Assigned Doctor': file.assigned_doctor_name ? `${file.assigned_doctor_name}${file.assigned_doctor_role ? ` (${file.assigned_doctor_role})` : ''}` : 'N/A',
          'Visit Date': file.proforma_visit_date ? formatDate(file.proforma_visit_date) : 'N/A',
          'Created By': file.created_by_name ? `${file.created_by_name}${file.created_by_role ? ` (${file.created_by_role})` : ''}` : 'N/A',
          'Physical File Location': file.physical_file_location || 'N/A',
          'Total Visits': file.total_visits || 'N/A',
          'File Created Date': file.file_created_date ? formatDate(file.file_created_date) : 'N/A',
          'Last Updated': file.updated_at ? formatDateTime(file.updated_at) : 'N/A',
        }));
        const ws3 = XLSX.utils.json_to_sheet(adlData);
        applyHeaderStyles(ws3, [{ start: 0, end: 11, color: '6F42C1' }]); // Purple for all columns
        XLSX.utils.book_append_sheet(wb, ws3, 'ADL Files');
      }

      // Sheet 4: Prescriptions (only if user has permission and is not MWO)
      if (!isMWOUser && canViewPrescriptions && allPrescriptions.length > 0) {
        const prescriptionData = allPrescriptions.map((prescription, index) => ({
          'Prescription #': index + 1,
          'Visit Date': prescription.visit_date ? formatDate(prescription.visit_date) : 'N/A',
          'Visit Type': prescription.visit_type === 'first_visit' ? 'First Visit' : 'Follow-up',
          'Medicine': prescription.medicine || 'N/A',
          'Dosage': prescription.dosage || 'N/A',
          'When to Take': prescription.when_to_take || prescription.when || 'N/A',
          'Frequency': prescription.frequency || 'N/A',
          'Duration': prescription.duration || 'N/A',
          'Quantity': prescription.quantity || prescription.qty || 'N/A',
          'Details': prescription.details || 'N/A',
          'Notes': prescription.notes || 'N/A',
          'Prescribed At': prescription.created_at ? formatDateTime(prescription.created_at) : 'N/A',
        }));
        const ws4 = XLSX.utils.json_to_sheet(prescriptionData);
        applyHeaderStyles(ws4, [{ start: 0, end: 10, color: '28A745' }]); // Green for all columns
        XLSX.utils.book_append_sheet(wb, ws4, 'Prescriptions');
      }

      // Generate filename with patient name and date
      const patientName = displayData.name || displayData.cr_no || 'Patient';
      const sanitizedName = patientName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `patient_${sanitizedName}_${new Date().toISOString().split('T')[0]}`;

      // Write the file
      XLSX.writeFile(wb, `${filename}.xlsx`);

      // Show appropriate success message based on role
      if (isMWOUser) {
        toast.success('Patient details exported to Excel successfully (Patient Details only)');
      } else {
        toast.success('Patient details exported to Excel successfully');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export patient details');
    }
  };

  // Note: canViewPrescriptions is now determined by filled_by_role above

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Card 1: Patient Details */}
        <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden">

        <div
          className="flex items-center justify-between cursor-pointer p-6 border-b border-white/30 backdrop-blur-sm bg-white/30 hover:bg-white/40 transition-all duration-300"
          onClick={() => toggleCard('patient')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl border border-white/30 shadow-lg">
              <FiUser className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Patient Details</h3>
              <p className="text-sm text-gray-600 mt-1">{patient.name} - {patient.cr_no || 'N/A'}</p>
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
            <form>
              {/* Quick Entry Section with Glassmorphism */}
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>

                <Card
                  title={
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">

                        <FiEdit3 className="w-6 h-6 text-indigo-600" />
                      </div>
                      <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">OUT PATIENT CARD</span>
                    </div>
                  }
                  actions={
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleExportPatient}
                      className="px-6 lg:px-8 py-3 bg-green-50 backdrop-blur-md border border-green-200 hover:bg-green-100 hover:border-green-300 text-green-700 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <FiDownload className="mr-2" />
                      Export to Excel
                    </Button>
                  }
                  className="relative mb-8 shadow-2xl border border-white/30 bg-white/70 backdrop-blur-xl rounded-3xl overflow-hidden">
                  <div className="space-y-8">
                    {/* First Row - Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"></div>
                        <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <FiHash className="w-4 h-4 text-primary-600" />
                            CR No.
                          </label>
                          <p className="text-base font-medium text-gray-900">{displayData.cr_no || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"></div>
                        <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <FiCalendar className="w-4 h-4 text-primary-600" />
                            Date
                          </label>
                          <p className="text-base font-medium text-gray-900">{displayData.date ? formatDate(displayData.date) : 'N/A'}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl"></div>
                        <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <FiUser className="w-4 h-4 text-primary-600" />
                            Name
                          </label>
                          <p className="text-base font-medium text-gray-900">{displayData.name || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl"></div>
                        <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <FiPhone className="w-4 h-4 text-primary-600" />
                            Mobile No.
                          </label>
                          <p className="text-base font-medium text-gray-900">{displayData.contact_number || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Second Row - Age, Sex, Category, Father's Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"></div>
                        <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <FiClock className="w-4 h-4 text-primary-600" />
                            Age
                          </label>
                          <p className="text-base font-medium text-gray-900">{displayData.age || 'N/A'}</p>
                      </div>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl"></div>
                        <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">Sex</label>
                          <p className="text-base font-medium text-gray-900">{displayData.sex || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl"></div>
                        <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                          <FiShield className="w-4 h-4 text-primary-600" />
                          Category
                        </label>
                          <p className="text-base font-medium text-gray-900">{displayData.category || 'N/A'}</p>
                      </div>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-rose-500/5 rounded-xl"></div>
                        <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <FiUsers className="w-4 h-4 text-primary-600" />
                            Father's Name
                          </label>
                          <p className="text-base font-medium text-gray-900">{displayData.father_name || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    {/* Fourth Row - Department, Unit/Consit, Room No., Serial No. */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"></div>
                        <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <FiLayers className="w-4 h-4 text-primary-600" />
                            Department
                          </label>
                          <p className="text-base font-medium text-gray-900">{displayData.department || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl"></div>
                        <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <FiUsers className="w-4 h-4 text-primary-600" />
                            Unit/Consit
                          </label>
                          <p className="text-base font-medium text-gray-900">{displayData.unit_consit || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl"></div>
                        <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <FiHome className="w-4 h-4 text-primary-600" />
                            Room No.
                          </label>
                          <p className="text-base font-medium text-gray-900">{displayData.room_no || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-rose-500/5 rounded-xl"></div>
                        <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <FiHash className="w-4 h-4 text-primary-600" />
                            Serial No.
                          </label>
                          <p className="text-base font-medium text-gray-900">{displayData.serial_no || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Fifth Row - File No., Unit Days */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"></div>
                        <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <FiFileText className="w-4 h-4 text-primary-600" />
                            File No.
                          </label>
                          <p className="text-base font-medium text-gray-900">{displayData.file_no || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl"></div>
                        <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">Unit Days</label>
                          <p className="text-base font-medium text-gray-900">{displayData.unit_days || 'N/A'}</p>
                        </div>
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
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <FiHome className="w-4 h-4 text-primary-600" />
                              Address Line (House No., Street, Locality)
                            </label>
                            <p className="text-base font-medium text-gray-900">{displayData.address_line || 'N/A'}</p>
                          </div>
                        </div>

                        {/* Location Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"></div>
                            <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <FiGlobe className="w-4 h-4 text-primary-600" />
                                Country
                              </label>
                              <p className="text-base font-medium text-gray-900">{displayData.country || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl"></div>
                            <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <FiMapPin className="w-4 h-4 text-primary-600" />
                                State
                              </label>
                              <p className="text-base font-medium text-gray-900">{displayData.state || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl"></div>
                            <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <FiLayers className="w-4 h-4 text-primary-600" />
                                District
                              </label>
                              <p className="text-base font-medium text-gray-900">{displayData.district || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-rose-500/5 rounded-xl"></div>
                            <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <FiHome className="w-4 h-4 text-primary-600" />
                                City/Town/Village
                              </label>
                              <p className="text-base font-medium text-gray-900">{displayData.city || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Pin Code Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"></div>
                            <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <FiHash className="w-4 h-4 text-primary-600" />
                                Pin Code
                              </label>
                              <p className="text-base font-medium text-gray-900">{displayData.pin_code || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Basic Information with Glassmorphism */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-3xl blur-xl"></div>
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
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <FiCalendar className="w-4 h-4 text-primary-600" />
                              Seen in Walk-in-on
                            </label>
                            <p className="text-base font-medium text-gray-900">{displayData.seen_in_walk_in_on ? formatDate(displayData.seen_in_walk_in_on) : 'N/A'}</p>
                        </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <FiCalendar className="w-4 h-4 text-primary-600" />
                              Worked up on
                            </label>
                            <p className="text-base font-medium text-gray-900">{displayData.worked_up_on ? formatDate(displayData.worked_up_on) : 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <FiHash className="w-4 h-4 text-primary-600" />
                              CR No.
                            </label>
                            <p className="text-base font-medium text-gray-900">{displayData.cr_no || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-rose-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <FiFileText className="w-4 h-4 text-primary-600" />
                              Psy. No.
                            </label>
                            <p className="text-base font-medium text-gray-900">{displayData.psy_no || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <FiHeart className="w-4 h-4 text-primary-600" />
                              Special Clinic No.
                            </label>
                            <p className="text-base font-medium text-gray-900">{displayData.special_clinic_no || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <FiUser className="w-4 h-4 text-primary-600" />
                              Name
                            </label>
                            <p className="text-base font-medium text-gray-900">{displayData.name || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Sex</label>
                            <p className="text-base font-medium text-gray-900">{displayData.sex || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-rose-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Age Group</label>
                            <p className="text-base font-medium text-gray-900">{displayData.age_group || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Marital Status</label>
                            <p className="text-base font-medium text-gray-900">{displayData.marital_status || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <FiCalendar className="w-4 h-4 text-primary-600" />
                              Year of marriage
                            </label>
                            <p className="text-base font-medium text-gray-900">{displayData.year_of_marriage || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <FiUsers className="w-4 h-4 text-primary-600" />
                              No. of Children: M
                            </label>
                            <p className="text-base font-medium text-gray-900">{displayData.no_of_children_male || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-rose-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <FiUsers className="w-4 h-4 text-primary-600" />
                              No. of Children: F
                            </label>
                            <p className="text-base font-medium text-gray-900">{displayData.no_of_children_female || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <FiBriefcase className="w-4 h-4 text-primary-600" />
                              Occupation
                            </label>
                            <p className="text-base font-medium text-gray-900">{displayData.occupation || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <FiBookOpen className="w-4 h-4 text-primary-600" />
                              Education
                            </label>
                            <p className="text-base font-medium text-gray-900">{displayData.education || displayData.education_level || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <FiTrendingUp className="w-4 h-4 text-primary-600" />
                              Family Income (₹)
                            </label>
                            <p className="text-base font-medium text-gray-900">{displayData.family_income || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-rose-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <FiTrendingUp className="w-4 h-4 text-primary-600" />
                              Patient Income (₹)
                            </label>
                            <p className="text-base font-medium text-gray-900">{displayData.income || displayData.patient_income || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Religion</label>
                            <p className="text-base font-medium text-gray-900">{displayData.religion || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Family Type</label>
                            <p className="text-base font-medium text-gray-900">{displayData.family_type || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Locality</label>
                            <p className="text-base font-medium text-gray-900">{displayData.locality || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-rose-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Assigned Doctor</label>
                            <p className="text-base font-medium text-gray-900">{displayData.assigned_doctor_name ? `${displayData.assigned_doctor_name}${displayData.assigned_doctor_role ? ` (${displayData.assigned_doctor_role})` : ''}` : 'Not assigned'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <FiHome className="w-4 h-4 text-primary-600" />
                              Assigned Room
                            </label>
                            <p className="text-base font-medium text-gray-900">{displayData.assigned_room || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <FiUser className="w-4 h-4 text-primary-600" />
                              Family Head Name
                            </label>
                            <p className="text-base font-medium text-gray-900">{displayData.head_name || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <FiClock className="w-4 h-4 text-primary-600" />
                              Family Head Age
                            </label>
                            <p className="text-base font-medium text-gray-900">{displayData.head_age || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-rose-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Relationship With Family Head</label>
                            <p className="text-base font-medium text-gray-900">{displayData.head_relationship || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <FiBookOpen className="w-4 h-4 text-primary-600" />
                              Family Head Education
                            </label>
                            <p className="text-base font-medium text-gray-900">{displayData.head_education || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <FiBriefcase className="w-4 h-4 text-primary-600" />
                              Family Head Occupation
                            </label>
                            <p className="text-base font-medium text-gray-900">{displayData.head_occupation || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <FiTrendingUp className="w-4 h-4 text-primary-600" />
                              Family Head Income (₹)
                            </label>
                            <p className="text-base font-medium text-gray-900">{displayData.head_income || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-rose-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <FiNavigation className="w-4 h-4 text-primary-600" />
                              Exact distance from hospital
                            </label>
                            <p className="text-base font-medium text-gray-900">{displayData.distance_from_hospital || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Mobility of the patient</label>
                            <p className="text-base font-medium text-gray-900">{displayData.mobility || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Referred by</label>
                            <p className="text-base font-medium text-gray-900">{displayData.referred_by || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                         {/* Permanent Address Section */}
                         <div className="space-y-6 pt-6 border-t border-white/30">
                           <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                             <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-md">
                               <FiMapPin className="w-5 h-5 text-blue-600" />
                             </div>
                             Permanent Address
                           </h4>

                           <div className="space-y-6">
                             <div className="relative">
                               <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"></div>
                               <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                                 <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                   <FiHome className="w-4 h-4 text-primary-600" />
                                   Address Line
                                 </label>
                                 <p className="text-base font-medium text-gray-900">{formData.permanent_address_line_1 || 'N/A'}</p>
                               </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="relative">
                                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"></div>
                                 <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                                   <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                     <FiHome className="w-4 h-4 text-primary-600" />
                                     City/Town/Village
                                   </label>
                                   <p className="text-base font-medium text-gray-900">{formData.permanent_city_town_village || 'N/A'}</p>
                                 </div>
                               </div>
                               <div className="relative">
                                 <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl"></div>
                                 <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                                   <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                     <FiLayers className="w-4 h-4 text-primary-600" />
                                     District
                                   </label>
                                   <p className="text-base font-medium text-gray-900">{formData.permanent_district || 'N/A'}</p>
                                 </div>
                               </div>
                               <div className="relative">
                                 <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl"></div>
                                 <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                                   <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                     <FiMapPin className="w-4 h-4 text-primary-600" />
                                     State
                                   </label>
                                   <p className="text-base font-medium text-gray-900">{formData.permanent_state || 'N/A'}</p>
                                 </div>
                               </div>
                               <div className="relative">
                                 <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-rose-500/5 rounded-xl"></div>
                                 <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                                   <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                     <FiHash className="w-4 h-4 text-primary-600" />
                                     Pin Code
                                   </label>
                                   <p className="text-base font-medium text-gray-900">{formData.permanent_pin_code || 'N/A'}</p>
                                 </div>
                               </div>
                               <div className="relative">
                                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"></div>
                                 <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                                   <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                     <FiGlobe className="w-4 h-4 text-primary-600" />
                                     Country
                                   </label>
                                   <p className="text-base font-medium text-gray-900">{formData.permanent_country || 'N/A'}</p>
                                 </div>
                               </div>
                             </div>
                           </div>
                         </div>

                         {/* Present Address Section */}
                         <div className="space-y-6 pt-6 border-t border-white/30">
                           <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                             <div className="p-2.5 bg-gradient-to-br from-orange-500/20 to-amber-500/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-md">
                               <FiMapPin className="w-5 h-5 text-orange-600" />
                             </div>
                             Present Address
                           </h4>

                          <div className="space-y-6">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-xl"></div>
                              <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                  <FiHome className="w-4 h-4 text-primary-600" />
                                  Address Line
                                </label>
                                <p className="text-base font-medium text-gray-900">{formData.present_address_line_1 || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-xl"></div>
                                <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <FiHome className="w-4 h-4 text-primary-600" />
                                    City/Town/Village
                                  </label>
                                  <p className="text-base font-medium text-gray-900">{formData.present_city_town_village || 'N/A'}</p>
                                </div>
                              </div>
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-xl"></div>
                                <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <FiLayers className="w-4 h-4 text-primary-600" />
                                    District
                                  </label>
                                  <p className="text-base font-medium text-gray-900">{formData.present_district || 'N/A'}</p>
                                </div>
                              </div>
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-xl"></div>
                                <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <FiMapPin className="w-4 h-4 text-primary-600" />
                                    State
                                  </label>
                                  <p className="text-base font-medium text-gray-900">{formData.present_state || 'N/A'}</p>
                                </div>
                              </div>
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-xl"></div>
                                <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <FiHash className="w-4 h-4 text-primary-600" />
                                    Pin Code
                                  </label>
                                  <p className="text-base font-medium text-gray-900">{formData.present_pin_code || 'N/A'}</p>
                                </div>
                              </div>
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-xl"></div>
                                <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <FiGlobe className="w-4 h-4 text-primary-600" />
                                    Country
                                  </label>
                                  <p className="text-base font-medium text-gray-900">{formData.present_country || 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Local Address Section */}
                        <div className="space-y-6 pt-6 border-t border-white/30">
                          <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-md">
                              <FiNavigation className="w-5 h-5 text-purple-600" />
                            </div>
                            Local Address
                          </h4>

                          <div className="space-y-6">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl"></div>
                              <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                  <FiHome className="w-4 h-4 text-primary-600" />
                                  Local Address
                                </label>
                                <p className="text-base font-medium text-gray-900">{formData.local_address || 'N/A'}</p>
                          </div>
                            </div>
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"></div>
                              <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                  <FiUser className="w-4 h-4 text-primary-600" />
                                  Assigned Doctor
                                </label>
                                <p className="text-base font-medium text-gray-900">{formData.assigned_doctor_name || displayData.assigned_doctor_name || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl"></div>
                              <div className="relative backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4 shadow-sm">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                  <FiHome className="w-4 h-4 text-primary-600" />
                                  Assigned Room
                                </label>
                                <p className="text-base font-medium text-gray-900">{formData.assigned_room || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/30 my-6"></div>


                  </div>
                </Card>
              </div>
              
            </form>


          </div>
        )}
       
      </Card>

      {/* Card 2: Walk-in Clinical Proforma - Show only if filled_by_role is Admin, JR, or SR */}
      {canViewClinicalProforma && (
        <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden">
          <div
            className="flex items-center justify-between cursor-pointer p-6 border-b border-white/30 backdrop-blur-sm bg-white/30 hover:bg-white/40 transition-all duration-300"
            onClick={() => toggleCard('clinical')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 backdrop-blur-md bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-white/30 shadow-lg">
                <FiFileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Walk-in Clinical Proforma</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {patientProformas.length > 0
                    ? `${patientProformas.length} record${patientProformas.length > 1 ? 's' : ''} found`
                    : 'No clinical records'}
                </p>
              </div>
            </div>
            {expandedCards.clinical ? (
              <FiChevronUp className="h-6 w-6 text-gray-500" />
            ) : (
              <FiChevronDown className="h-6 w-6 text-gray-500" />
            )}
          </div>

          {expandedCards.clinical && (
            <div className="p-6">
              {patientProformas.length > 0 ? (
                <div className="space-y-6">
                  {patientProformas.map((proforma, index) => (
                    <div key={proforma.id || index} className="relative backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl p-6 shadow-lg mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5 rounded-2xl"></div>
                      <div className="relative flex items-center justify-between mb-4 pb-3 border-b border-white/30">
                        <div className="flex items-center gap-4">
                          <h4 className="text-lg font-semibold text-gray-900">Visit #{index + 1}</h4>
                          <span className="text-sm text-gray-500">{proforma.visit_date ? formatDate(proforma.visit_date) : 'N/A'}</span>
                        </div>
                        {proforma.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const returnPath = returnTab
                                ? `/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`
                                : `/patients/${patient?.id}`;
                              navigate(`/clinical-proforma/edit/${proforma.id}?returnTab=${returnTab || ''}&returnPath=${encodeURIComponent(returnPath)}`);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                            title="Edit Walk-in Clinical Proforma"
                          >
                            <FiEdit className="w-4 h-4" />
                            Edit
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Visit Type</label>
                          <p className="text-base font-semibold text-gray-900 mt-1">
                            {proforma.visit_type === 'first_visit' ? 'First Visit' : 'Follow-up'}
                          </p>
                        </div>
                        {proforma.room_no && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Room Number</label>
                            <p className="text-base font-semibold text-gray-900 mt-1">{proforma.room_no}</p>
                          </div>
                        )}
                        {proforma.doctor_name && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Doctor</label>
                            <p className="text-base font-semibold text-gray-900 mt-1">
                              {proforma.doctor_name} {proforma.doctor_role ? `(${proforma.doctor_role})` : ''}
                            </p>
                          </div>
                        )}
                        {proforma.case_severity && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Case Severity</label>
                            <div className="mt-1">
                              <Badge
                                className={`${proforma.case_severity === 'severe'
                                  ? 'bg-red-100 text-red-800 border-red-200'
                                  : proforma.case_severity === 'moderate'
                                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                    : 'bg-green-100 text-green-800 border-green-200'
                                  } text-sm font-medium`}
                              >
                                {getCaseSeverityLabel(proforma.case_severity)}
                              </Badge>
                            </div>
                          </div>
                        )}
                        {proforma.decision && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Decision</label>
                            <p className="text-base font-semibold text-gray-900 mt-1">{proforma.decision}</p>
                          </div>
                        )}
                        {proforma.doctor_decision && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Doctor Decision</label>
                            <p className="text-base font-semibold text-gray-900 mt-1">
                              {proforma.doctor_decision === 'complex_case' ? 'Complex Case' : 'Simple Case'}
                            </p>
                          </div>
                        )}
                        {proforma.requires_adl_file !== undefined && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Requires ADL File</label>
                            <div className="mt-1">
                              <Badge className={proforma.requires_adl_file ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                                {proforma.requires_adl_file ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                          </div>
                        )}
                        {proforma.informant_present !== undefined && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Informant Present</label>
                            <div className="mt-1">
                              <Badge className={proforma.informant_present ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                                {proforma.informant_present ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                          </div>
                        )}
                        {proforma.created_at && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Created Date</label>
                            <p className="text-base font-semibold text-gray-900 mt-1">{formatDateTime(proforma.created_at)}</p>
                          </div>
                        )}
                      </div>

                      {/* Additional Walk-in Clinical Proforma Fields */}
                      {(proforma.nature_of_information || proforma.onset_duration || proforma.course || proforma.precipitating_factor || proforma.illness_duration || proforma.current_episode_since) && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h5 className="text-md font-semibold text-gray-900 mb-3">Illness Information</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {proforma.nature_of_information && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Nature of Information</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.nature_of_information}</p>
                              </div>
                            )}
                            {proforma.onset_duration && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Onset Duration</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.onset_duration}</p>
                              </div>
                            )}
                            {proforma.course && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Course</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.course}</p>
                              </div>
                            )}
                            {proforma.precipitating_factor && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Precipitating Factor</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.precipitating_factor}</p>
                              </div>
                            )}
                            {proforma.illness_duration && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Illness Duration</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.illness_duration}</p>
                              </div>
                            )}
                            {proforma.current_episode_since && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Current Episode Since</label>
                                <p className="text-sm text-gray-900 mt-1">{formatDate(proforma.current_episode_since)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Clinical Symptoms */}
                      {(proforma.mood || proforma.behaviour || proforma.speech || proforma.thought || proforma.perception || proforma.somatic || proforma.bio_functions || proforma.adjustment || proforma.cognitive_function || proforma.fits || proforma.sexual_problem || proforma.substance_use) && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h5 className="text-md font-semibold text-gray-900 mb-3">Clinical Symptoms</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {proforma.mood && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Mood</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.mood}</p>
                              </div>
                            )}
                            {proforma.behaviour && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Behaviour</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.behaviour}</p>
                              </div>
                            )}
                            {proforma.speech && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Speech</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.speech}</p>
                              </div>
                            )}
                            {proforma.thought && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Thought</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.thought}</p>
                              </div>
                            )}
                            {proforma.perception && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Perception</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.perception}</p>
                              </div>
                            )}
                            {proforma.somatic && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Somatic</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.somatic}</p>
                              </div>
                            )}
                            {proforma.bio_functions && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Biological Functions</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.bio_functions}</p>
                              </div>
                            )}
                            {proforma.adjustment && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Adjustment</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.adjustment}</p>
                              </div>
                            )}
                            {proforma.cognitive_function && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Cognitive Function</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.cognitive_function}</p>
                              </div>
                            )}
                            {proforma.fits && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Fits</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.fits}</p>
                              </div>
                            )}
                            {proforma.sexual_problem && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Sexual Problem</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.sexual_problem}</p>
                              </div>
                            )}
                            {proforma.substance_use && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Substance Use</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.substance_use}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Mental Status Examination */}
                      {(proforma.mse_behaviour || proforma.mse_affect || proforma.mse_thought || proforma.mse_delusions || proforma.mse_perception || proforma.mse_cognitive_function) && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h5 className="text-md font-semibold text-gray-900 mb-3">Mental Status Examination (MSE)</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {proforma.mse_behaviour && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Behaviour</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.mse_behaviour}</p>
                              </div>
                            )}
                            {proforma.mse_affect && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Affect</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.mse_affect}</p>
                              </div>
                            )}
                            {proforma.mse_thought && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Thought</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.mse_thought}</p>
                              </div>
                            )}
                            {proforma.mse_delusions && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Delusions</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.mse_delusions}</p>
                              </div>
                            )}
                            {proforma.mse_perception && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Perception</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.mse_perception}</p>
                              </div>
                            )}
                            {proforma.mse_cognitive_function && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Cognitive Function</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.mse_cognitive_function}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* History */}
                      {(proforma.past_history || proforma.family_history || proforma.associated_medical_surgical) && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h5 className="text-md font-semibold text-gray-900 mb-3">History</h5>
                          <div className="space-y-4">
                            {proforma.past_history && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Past History</label>
                                <p className="text-sm text-gray-900 mt-1 leading-relaxed">{proforma.past_history}</p>
                              </div>
                            )}
                            {proforma.family_history && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Family History</label>
                                <p className="text-sm text-gray-900 mt-1 leading-relaxed">{proforma.family_history}</p>
                              </div>
                            )}
                            {proforma.associated_medical_surgical && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Associated Medical/Surgical</label>
                                <p className="text-sm text-gray-900 mt-1 leading-relaxed">{proforma.associated_medical_surgical}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* General Physical Examination */}
                      {proforma.gpe && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <label className="text-sm font-medium text-gray-600">General Physical Examination (GPE)</label>
                          <p className="text-sm text-gray-900 mt-2 leading-relaxed">{proforma.gpe}</p>
                        </div>
                      )}

                      {/* Diagnosis and Treatment */}
                      {(proforma.diagnosis || proforma.icd_code || proforma.disposal || proforma.workup_appointment || proforma.referred_to || proforma.treatment_prescribed || proforma.adl_reasoning) && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h5 className="text-md font-semibold text-gray-900 mb-3">Diagnosis and Treatment</h5>
                          <div className="space-y-4">
                            {proforma.diagnosis && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Diagnosis</label>
                                <p className="text-sm text-gray-900 mt-2 leading-relaxed">{proforma.diagnosis}</p>
                              </div>
                            )}
                            {proforma.icd_code && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">ICD Code</label>
                                <p className="text-base font-semibold text-gray-900 mt-1">{proforma.icd_code}</p>
                              </div>
                            )}
                            {proforma.disposal && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Disposal</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.disposal}</p>
                              </div>
                            )}
                            {proforma.workup_appointment && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Workup Appointment</label>
                                <p className="text-base font-semibold text-gray-900 mt-1">{formatDate(proforma.workup_appointment)}</p>
                              </div>
                            )}
                            {proforma.referred_to && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Referred To</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.referred_to}</p>
                              </div>
                            )}
                            {proforma.treatment_prescribed && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Treatment Prescribed</label>
                                <p className="text-sm text-gray-900 mt-1 leading-relaxed">{proforma.treatment_prescribed}</p>
                              </div>
                            )}
                            {proforma.adl_reasoning && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">ADL Reasoning</label>
                                <p className="text-sm text-gray-900 mt-1 leading-relaxed">{proforma.adl_reasoning}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FiFileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-base">No clinical proforma records found</p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
      {/* Card 3: Additional Details (ADL File) - Show card even if empty, as long as user has permission */}
      {canViewADLFile && (
        <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden">
          <div
            className="flex items-center justify-between cursor-pointer p-6 border-b border-white/30 backdrop-blur-sm bg-white/30 hover:bg-white/40 transition-all duration-300"
            onClick={() => toggleCard('adl')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-white/30 shadow-lg">
                <FiFolder className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Additional Details (ADL File)</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {patientAdlFiles.length > 0
                    ? `${patientAdlFiles.length} file${patientAdlFiles.length > 1 ? 's' : ''} found`
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
                    // Parse JSON fields if they're strings
                    const complaintsPatient = Array.isArray(file.complaints_patient) ? file.complaints_patient : (file.complaints_patient ? JSON.parse(file.complaints_patient) : []);
                    const complaintsInformant = Array.isArray(file.complaints_informant) ? file.complaints_informant : (file.complaints_informant ? JSON.parse(file.complaints_informant) : []);
                    const informants = Array.isArray(file.informants) ? file.informants : (file.informants ? JSON.parse(file.informants) : []);
                    const familyHistorySiblings = Array.isArray(file.family_history_siblings) ? file.family_history_siblings : (file.family_history_siblings ? JSON.parse(file.family_history_siblings) : []);
                    const occupationJobs = Array.isArray(file.occupation_jobs) ? file.occupation_jobs : (file.occupation_jobs ? JSON.parse(file.occupation_jobs) : []);
                    const sexualChildren = Array.isArray(file.sexual_children) ? file.sexual_children : (file.sexual_children ? JSON.parse(file.sexual_children) : []);
                    const livingResidents = Array.isArray(file.living_residents) ? file.living_residents : (file.living_residents ? JSON.parse(file.living_residents) : []);
                    const livingInlaws = Array.isArray(file.living_inlaws) ? file.living_inlaws : (file.living_inlaws ? JSON.parse(file.living_inlaws) : []);
                    const premorbidPersonalityTraits = Array.isArray(file.premorbid_personality_traits) ? file.premorbid_personality_traits : (file.premorbid_personality_traits ? JSON.parse(file.premorbid_personality_traits) : []);

                    return (
                      <div key={file.id || index} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                        {/* ADL File Header */}
                        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-300">
                          <div>
                            <h4 className="text-xl font-bold text-gray-900">ADL File #{index + 1}</h4>
                            {file.adl_no && (
                              <p className="text-sm text-gray-600 mt-1">ADL Number: {file.adl_no}</p>
                            )}
                          </div>
                          <div className="text-right">
                            {file.file_status && (
                              <Badge
                                className={`${file.file_status === 'active'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : file.file_status === 'retrieved'
                                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                                    : file.file_status === 'stored'
                                      ? 'bg-gray-100 text-gray-800 border-gray-200'
                                      : file.file_status === 'archived'
                                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                                        : 'bg-gray-100 text-gray-800 border-gray-200'
                                  } text-sm font-medium mb-2`}
                              >
                                {getFileStatusLabel(file.file_status)}
                              </Badge>
                            )}
                            {file.file_created_date && (
                              <p className="text-xs text-gray-500">{formatDate(file.file_created_date)}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-8">
                          {/* Basic Information */}
                          <div>
                            <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Basic Information</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {file.patient_name && (
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Patient Name</label>
                                  <p className="text-base font-semibold text-gray-900 mt-1">{file.patient_name}</p>
                                </div>
                              )}
                              {file.cr_no && (
                                <div>
                                  <label className="text-sm font-medium text-gray-600">CR Number</label>
                                  <p className="text-base font-semibold text-gray-900 mt-1">{file.cr_no}</p>
                                </div>
                              )}
                              {file.psy_no && (
                                <div>
                                  <label className="text-sm font-medium text-gray-600">PSY Number</label>
                                  <p className="text-base font-semibold text-gray-900 mt-1">{file.psy_no}</p>
                                </div>
                              )}
                              {file.assigned_doctor_name && (
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Assigned Doctor</label>
                                  <p className="text-base font-semibold text-gray-900 mt-1">
                                    {file.assigned_doctor_name} {file.assigned_doctor_role ? `(${file.assigned_doctor_role})` : ''}
                                  </p>
                                </div>
                              )}
                              {file.proforma_visit_date && (
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Visit Date</label>
                                  <p className="text-base font-semibold text-gray-900 mt-1">{formatDate(file.proforma_visit_date)}</p>
                                </div>
                              )}
                              {file.created_by_name && (
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Created By</label>
                                  <p className="text-base font-semibold text-gray-900 mt-1">
                                    {file.created_by_name} {file.created_by_role ? `(${file.created_by_role})` : ''}
                                  </p>
                                </div>
                              )}
                              {file.physical_file_location && (
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Physical Location</label>
                                  <p className="text-base font-semibold text-gray-900 mt-1">{file.physical_file_location}</p>
                                </div>
                              )}
                              {file.total_visits && (
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Total Visits</label>
                                  <p className="text-base font-semibold text-gray-900 mt-1">{file.total_visits}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Complaints */}
                          {(complaintsPatient.length > 0 && complaintsPatient.some(c => c.complaint)) ||
                            (complaintsInformant.length > 0 && complaintsInformant.some(c => c.complaint)) ? (
                            <div>
                              <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Complaints</h5>
                              {complaintsPatient.length > 0 && complaintsPatient.some(c => c.complaint) && (
                                <div className="mb-4">
                                  <label className="text-sm font-medium text-gray-600 mb-2 block">Patient Complaints</label>
                                  <div className="space-y-2">
                                    {complaintsPatient.filter(c => c.complaint).map((complaint, idx) => (
                                      <div key={idx} className="bg-blue-50 p-3 rounded border border-blue-200">
                                        <p className="text-sm font-semibold text-gray-900">{complaint.complaint}</p>
                                        {complaint.duration && (
                                          <p className="text-xs text-gray-600 mt-1">Duration: {complaint.duration}</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {complaintsInformant.length > 0 && complaintsInformant.some(c => c.complaint) && (
                                <div>
                                  <label className="text-sm font-medium text-gray-600 mb-2 block">Informant Complaints</label>
                                  <div className="space-y-2">
                                    {complaintsInformant.filter(c => c.complaint).map((complaint, idx) => (
                                      <div key={idx} className="bg-purple-50 p-3 rounded border border-purple-200">
                                        <p className="text-sm font-semibold text-gray-900">{complaint.complaint}</p>
                                        {complaint.duration && (
                                          <p className="text-xs text-gray-600 mt-1">Duration: {complaint.duration}</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : null}

                          {/* Informants */}
                          {informants.length > 0 && informants.some(i => i.name) && (
                            <div>
                              <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Informants</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {informants.filter(i => i.name).map((informant, idx) => (
                                  <div key={idx} className="bg-gray-50 p-4 rounded border border-gray-200">
                                    <p className="text-sm font-semibold text-gray-900">{informant.name}</p>
                                    {informant.relationship && (
                                      <p className="text-xs text-gray-600 mt-1">Relationship: {informant.relationship}</p>
                                    )}
                                    {informant.reliability && (
                                      <p className="text-xs text-gray-600">Reliability: {informant.reliability}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* History of Present Illness */}
                          {(file.history_narrative || file.history_specific_enquiry || file.history_drug_intake ||
                            file.history_treatment_place || file.history_treatment_drugs || file.history_treatment_response) && (
                              <div>
                                <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">History of Present Illness</h5>
                                <div className="space-y-4">
                                  {file.history_narrative && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Narrative History</label>
                                      <p className="text-sm text-gray-900 mt-1 leading-relaxed">{file.history_narrative}</p>
                                    </div>
                                  )}
                                  {file.history_specific_enquiry && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Specific Enquiry</label>
                                      <p className="text-sm text-gray-900 mt-1 leading-relaxed">{file.history_specific_enquiry}</p>
                                    </div>
                                  )}
                                  {file.history_drug_intake && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Drug Intake</label>
                                      <p className="text-sm text-gray-900 mt-1">{file.history_drug_intake}</p>
                                    </div>
                                  )}
                                  {(file.history_treatment_place || file.history_treatment_drugs || file.history_treatment_response) && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {file.history_treatment_place && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Treatment Place</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.history_treatment_place}</p>
                                        </div>
                                      )}
                                      {file.history_treatment_drugs && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Treatment Drugs</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.history_treatment_drugs}</p>
                                        </div>
                                      )}
                                      {file.history_treatment_response && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Treatment Response</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.history_treatment_response}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Past History */}
                          {(file.past_history_medical || file.past_history_psychiatric_diagnosis ||
                            file.past_history_psychiatric_treatment || file.past_history_psychiatric_interim) && (
                              <div>
                                <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Past History</h5>
                                <div className="space-y-4">
                                  {file.past_history_medical && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Medical History</label>
                                      <p className="text-sm text-gray-900 mt-1">{file.past_history_medical}</p>
                                    </div>
                                  )}
                                  {file.past_history_psychiatric_diagnosis && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Psychiatric Diagnosis</label>
                                      <p className="text-sm text-gray-900 mt-1">{file.past_history_psychiatric_diagnosis}</p>
                                    </div>
                                  )}
                                  {file.past_history_psychiatric_treatment && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Psychiatric Treatment</label>
                                      <p className="text-sm text-gray-900 mt-1">{file.past_history_psychiatric_treatment}</p>
                                    </div>
                                  )}
                                  {file.past_history_psychiatric_interim && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Interim Period</label>
                                      <p className="text-sm text-gray-900 mt-1">{file.past_history_psychiatric_interim}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Family History */}
                          {(file.family_history_father_age || file.family_history_mother_age ||
                            familyHistorySiblings.length > 0) && (
                              <div>
                                <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Family History</h5>
                                <div className="space-y-4">
                                  {(file.family_history_father_age || file.family_history_father_education ||
                                    file.family_history_father_occupation || file.family_history_father_personality) && (
                                      <div className="bg-blue-50 p-4 rounded border border-blue-200">
                                        <h6 className="text-sm font-semibold text-gray-900 mb-2">Father</h6>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                          {file.family_history_father_age && (
                                            <div><span className="text-gray-600">Age:</span> <span className="font-medium">{file.family_history_father_age}</span></div>
                                          )}
                                          {file.family_history_father_education && (
                                            <div><span className="text-gray-600">Education:</span> <span className="font-medium">{file.family_history_father_education}</span></div>
                                          )}
                                          {file.family_history_father_occupation && (
                                            <div><span className="text-gray-600">Occupation:</span> <span className="font-medium">{file.family_history_father_occupation}</span></div>
                                          )}
                                          {file.family_history_father_personality && (
                                            <div><span className="text-gray-600">Personality:</span> <span className="font-medium">{file.family_history_father_personality}</span></div>
                                          )}
                                          {file.family_history_father_deceased && (
                                            <div><span className="text-gray-600">Deceased:</span> <span className="font-medium">Yes</span></div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  {(file.family_history_mother_age || file.family_history_mother_education ||
                                    file.family_history_mother_occupation || file.family_history_mother_personality) && (
                                      <div className="bg-pink-50 p-4 rounded border border-pink-200">
                                        <h6 className="text-sm font-semibold text-gray-900 mb-2">Mother</h6>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                          {file.family_history_mother_age && (
                                            <div><span className="text-gray-600">Age:</span> <span className="font-medium">{file.family_history_mother_age}</span></div>
                                          )}
                                          {file.family_history_mother_education && (
                                            <div><span className="text-gray-600">Education:</span> <span className="font-medium">{file.family_history_mother_education}</span></div>
                                          )}
                                          {file.family_history_mother_occupation && (
                                            <div><span className="text-gray-600">Occupation:</span> <span className="font-medium">{file.family_history_mother_occupation}</span></div>
                                          )}
                                          {file.family_history_mother_personality && (
                                            <div><span className="text-gray-600">Personality:</span> <span className="font-medium">{file.family_history_mother_personality}</span></div>
                                          )}
                                          {file.family_history_mother_deceased && (
                                            <div><span className="text-gray-600">Deceased:</span> <span className="font-medium">Yes</span></div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  {familyHistorySiblings.length > 0 && familyHistorySiblings.some(s => s.age || s.sex) && (
                                    <div>
                                      <h6 className="text-sm font-semibold text-gray-900 mb-2">Siblings</h6>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {familyHistorySiblings.filter(s => s.age || s.sex).map((sibling, idx) => (
                                          <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
                                            {sibling.age && <span className="text-gray-600">Age: </span>}
                                            {sibling.age && <span className="font-medium">{sibling.age}</span>}
                                            {sibling.sex && <span className="text-gray-600 ml-2">Sex: </span>}
                                            {sibling.sex && <span className="font-medium">{sibling.sex}</span>}
                                            {sibling.education && <span className="text-gray-600 ml-2">Education: </span>}
                                            {sibling.education && <span className="font-medium">{sibling.education}</span>}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Mental Status Examination */}
                          {(file.mse_general_demeanour || file.mse_general_tidy || file.mse_general_awareness || file.mse_general_cooperation ||
                            file.mse_psychomotor_verbalization || file.mse_psychomotor_pressure || file.mse_psychomotor_tension ||
                            file.mse_psychomotor_posture || file.mse_psychomotor_mannerism || file.mse_psychomotor_catatonic ||
                            file.mse_affect_subjective || file.mse_affect_tone || file.mse_affect_resting || file.mse_affect_fluctuation ||
                            file.mse_thought_flow || file.mse_thought_form || file.mse_thought_content ||
                            file.mse_cognitive_consciousness || file.mse_cognitive_orientation_time || file.mse_cognitive_orientation_place ||
                            file.mse_cognitive_orientation_person || file.mse_cognitive_memory_immediate || file.mse_cognitive_memory_recent ||
                            file.mse_cognitive_memory_remote || file.mse_cognitive_subtraction || file.mse_cognitive_digit_span ||
                            file.mse_cognitive_counting || file.mse_cognitive_general_knowledge || file.mse_cognitive_calculation ||
                            file.mse_cognitive_similarities || file.mse_cognitive_proverbs || file.mse_insight_understanding || file.mse_insight_judgement) && (
                              <div>
                                <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Mental Status Examination (MSE)</h5>

                                {/* General MSE */}
                                {(file.mse_general_demeanour || file.mse_general_tidy || file.mse_general_awareness || file.mse_general_cooperation) && (
                                  <div className="mb-4">
                                    <h6 className="text-md font-semibold text-gray-800 mb-2">General</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {file.mse_general_demeanour && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Demeanour</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_general_demeanour}</p>
                                        </div>
                                      )}
                                      {file.mse_general_tidy && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Tidy</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_general_tidy}</p>
                                        </div>
                                      )}
                                      {file.mse_general_awareness && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Awareness</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_general_awareness}</p>
                                        </div>
                                      )}
                                      {file.mse_general_cooperation && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Cooperation</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_general_cooperation}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Psychomotor */}
                                {(file.mse_psychomotor_verbalization || file.mse_psychomotor_pressure || file.mse_psychomotor_tension ||
                                  file.mse_psychomotor_posture || file.mse_psychomotor_mannerism || file.mse_psychomotor_catatonic) && (
                                    <div className="mb-4">
                                      <h6 className="text-md font-semibold text-gray-800 mb-2">Psychomotor</h6>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {file.mse_psychomotor_verbalization && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Verbalization</label>
                                            <p className="text-sm text-gray-900 mt-1">{file.mse_psychomotor_verbalization}</p>
                                          </div>
                                        )}
                                        {file.mse_psychomotor_pressure && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Pressure</label>
                                            <p className="text-sm text-gray-900 mt-1">{file.mse_psychomotor_pressure}</p>
                                          </div>
                                        )}
                                        {file.mse_psychomotor_tension && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Tension</label>
                                            <p className="text-sm text-gray-900 mt-1">{file.mse_psychomotor_tension}</p>
                                          </div>
                                        )}
                                        {file.mse_psychomotor_posture && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Posture</label>
                                            <p className="text-sm text-gray-900 mt-1">{file.mse_psychomotor_posture}</p>
                                          </div>
                                        )}
                                        {file.mse_psychomotor_mannerism && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Mannerism</label>
                                            <p className="text-sm text-gray-900 mt-1">{file.mse_psychomotor_mannerism}</p>
                                          </div>
                                        )}
                                        {file.mse_psychomotor_catatonic && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Catatonic</label>
                                            <p className="text-sm text-gray-900 mt-1">{file.mse_psychomotor_catatonic}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                {/* Affect */}
                                {(file.mse_affect_subjective || file.mse_affect_tone || file.mse_affect_resting || file.mse_affect_fluctuation) && (
                                  <div className="mb-4">
                                    <h6 className="text-md font-semibold text-gray-800 mb-2">Affect</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {file.mse_affect_subjective && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Subjective</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_affect_subjective}</p>
                                        </div>
                                      )}
                                      {file.mse_affect_tone && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Tone</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_affect_tone}</p>
                                        </div>
                                      )}
                                      {file.mse_affect_resting && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Resting</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_affect_resting}</p>
                                        </div>
                                      )}
                                      {file.mse_affect_fluctuation && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Fluctuation</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_affect_fluctuation}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Thought */}
                                {(file.mse_thought_flow || file.mse_thought_form || file.mse_thought_content) && (
                                  <div className="mb-4">
                                    <h6 className="text-md font-semibold text-gray-800 mb-2">Thought</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {file.mse_thought_flow && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Flow</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_thought_flow}</p>
                                        </div>
                                      )}
                                      {file.mse_thought_form && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Form</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_thought_form}</p>
                                        </div>
                                      )}
                                      {file.mse_thought_content && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Content</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_thought_content}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Cognitive */}
                                {(file.mse_cognitive_consciousness || file.mse_cognitive_orientation_time || file.mse_cognitive_orientation_place ||
                                  file.mse_cognitive_orientation_person || file.mse_cognitive_memory_immediate || file.mse_cognitive_memory_recent ||
                                  file.mse_cognitive_memory_remote || file.mse_cognitive_subtraction || file.mse_cognitive_digit_span ||
                                  file.mse_cognitive_counting || file.mse_cognitive_general_knowledge || file.mse_cognitive_calculation ||
                                  file.mse_cognitive_similarities || file.mse_cognitive_proverbs) && (
                                    <div className="mb-4">
                                      <h6 className="text-md font-semibold text-gray-800 mb-2">Cognitive</h6>
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {file.mse_cognitive_consciousness && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Consciousness</label>
                                            <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_consciousness}</p>
                                          </div>
                                        )}
                                        {file.mse_cognitive_orientation_time && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Orientation (Time)</label>
                                            <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_orientation_time}</p>
                                          </div>
                                        )}
                                        {file.mse_cognitive_orientation_place && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Orientation (Place)</label>
                                            <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_orientation_place}</p>
                                          </div>
                                        )}
                                        {file.mse_cognitive_orientation_person && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Orientation (Person)</label>
                                            <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_orientation_person}</p>
                                          </div>
                                        )}
                                        {file.mse_cognitive_memory_immediate && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Memory (Immediate)</label>
                                            <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_memory_immediate}</p>
                                          </div>
                                        )}
                                        {file.mse_cognitive_memory_recent && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Memory (Recent)</label>
                                            <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_memory_recent}</p>
                                          </div>
                                        )}
                                        {file.mse_cognitive_memory_remote && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Memory (Remote)</label>
                                            <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_memory_remote}</p>
                                          </div>
                                        )}
                                        {file.mse_cognitive_subtraction && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Subtraction</label>
                                            <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_subtraction}</p>
                                          </div>
                                        )}
                                        {file.mse_cognitive_digit_span && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Digit Span</label>
                                            <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_digit_span}</p>
                                          </div>
                                        )}
                                        {file.mse_cognitive_counting && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Counting</label>
                                            <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_counting}</p>
                                          </div>
                                        )}
                                        {file.mse_cognitive_general_knowledge && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">General Knowledge</label>
                                            <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_general_knowledge}</p>
                                          </div>
                                        )}
                                        {file.mse_cognitive_calculation && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Calculation</label>
                                            <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_calculation}</p>
                                          </div>
                                        )}
                                        {file.mse_cognitive_similarities && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Similarities</label>
                                            <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_similarities}</p>
                                          </div>
                                        )}
                                        {file.mse_cognitive_proverbs && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Proverbs</label>
                                            <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_proverbs}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                {/* Insight */}
                                {(file.mse_insight_understanding || file.mse_insight_judgement) && (
                                  <div className="mb-4">
                                    <h6 className="text-md font-semibold text-gray-800 mb-2">Insight</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {file.mse_insight_understanding && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Understanding</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_insight_understanding}</p>
                                        </div>
                                      )}
                                      {file.mse_insight_judgement && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Judgement</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_insight_judgement}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                          {/* Diagnostic Formulation */}
                          {(file.diagnostic_formulation_summary || file.diagnostic_formulation_features ||
                            file.diagnostic_formulation_psychodynamic) && (
                              <div>
                                <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Diagnostic Formulation</h5>
                                <div className="space-y-4">
                                  {file.diagnostic_formulation_summary && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Summary</label>
                                      <p className="text-sm text-gray-900 mt-1 leading-relaxed">{file.diagnostic_formulation_summary}</p>
                                    </div>
                                  )}
                                  {file.diagnostic_formulation_features && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Features</label>
                                      <p className="text-sm text-gray-900 mt-1 leading-relaxed">{file.diagnostic_formulation_features}</p>
                                    </div>
                                  )}
                                  {file.diagnostic_formulation_psychodynamic && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Psychodynamic</label>
                                      <p className="text-sm text-gray-900 mt-1 leading-relaxed">{file.diagnostic_formulation_psychodynamic}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Provisional Diagnosis */}
                          {file.provisional_diagnosis && (
                            <div>
                              <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Provisional Diagnosis</h5>
                              <p className="text-sm text-gray-900 leading-relaxed">{file.provisional_diagnosis}</p>
                            </div>
                          )}

                          {/* Treatment Plan */}
                          {file.treatment_plan && (
                            <div>
                              <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Treatment Plan</h5>
                              <p className="text-sm text-gray-900 leading-relaxed">{file.treatment_plan}</p>
                            </div>
                          )}

                          {/* Consultant Comments */}
                          {file.consultant_comments && (
                            <div>
                              <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Consultant Comments</h5>
                              <p className="text-sm text-gray-900 leading-relaxed">{file.consultant_comments}</p>
                            </div>
                          )}

                          {/* Notes */}
                          {file.notes && (
                            <div>
                              <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Additional Notes</h5>
                              <p className="text-sm text-gray-900 leading-relaxed">{file.notes}</p>
                            </div>
                          )}

                          {/* Last Updated */}
                          {file.updated_at && (
                            <div className="pt-4 border-t border-gray-200">
                              <p className="text-xs text-gray-500">Last Updated: {formatDateTime(file.updated_at)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FiFolder className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-base">No ADL files found</p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Card 4: Prescription History - Show only if current user is Admin, JR, or SR */}
      {canViewPrescriptions && (
        <Card className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden">
          <div
            className="flex items-center justify-between cursor-pointer p-6 border-b border-white/30 backdrop-blur-sm bg-white/30 hover:bg-white/40 transition-all duration-300"
            onClick={() => toggleCard('prescriptions')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 backdrop-blur-md bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-white/30 shadow-lg">
                <FiPackage className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Prescription History</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {allPrescriptions.length > 0
                    ? `${allPrescriptions.length} prescription${allPrescriptions.length > 1 ? 's' : ''} across ${Object.keys(prescriptionsByVisit).length} visit${Object.keys(prescriptionsByVisit).length > 1 ? 's' : ''}`
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
              {allPrescriptions.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(prescriptionsByVisit).map(([visitDate, visitData]) => (
                    <div key={visitDate} className="relative backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl p-6 shadow-lg mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-yellow-500/5 rounded-2xl"></div>
                      <div className="relative flex items-center justify-between mb-4 pb-3 border-b border-white/30">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">Visit on {visitDate}</h4>
                          {visitData.visitType && (
                            <p className="text-sm text-gray-600 mt-1">
                              {visitData.visitType === 'first_visit' ? 'First Visit' : 'Follow-up Visit'}
                            </p>
                          )}
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-sm font-medium">
                          {visitData.prescriptions.length} {visitData.prescriptions.length === 1 ? 'Medication' : 'Medications'}
                        </Badge>
                      </div>

                      {/* Table format for prescriptions */}
                      <div className="overflow-x-auto rounded-xl border border-white/40 shadow-lg" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <table className="min-w-full text-sm" style={{ position: 'relative' }}>
                          <thead className="backdrop-blur-md bg-white/50 border-b border-white/40 sticky top-0 z-10">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider backdrop-blur-md bg-white/50">#</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider backdrop-blur-md bg-white/50">Medicine</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider backdrop-blur-md bg-white/50">Dosage</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider backdrop-blur-md bg-white/50">When</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider backdrop-blur-md bg-white/50">Frequency</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider backdrop-blur-md bg-white/50">Duration</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider backdrop-blur-md bg-white/50">Quantity</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider backdrop-blur-md bg-white/50">Details</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider backdrop-blur-md bg-white/50">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="backdrop-blur-sm bg-white/40 divide-y divide-white/30">
                            {visitData.prescriptions.map((prescription, idx) => (
                              <tr key={prescription.id || idx} className="hover:bg-white/60 transition-colors duration-200">
                                <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                                <td className="px-4 py-3 font-medium">{prescription.medicine || 'N/A'}</td>
                                <td className="px-4 py-3">{prescription.dosage || '-'}</td>
                                <td className="px-4 py-3">{prescription.when_to_take || '-'}</td>
                                <td className="px-4 py-3">{prescription.frequency || '-'}</td>
                                <td className="px-4 py-3">{prescription.duration || '-'}</td>
                                <td className="px-4 py-3">{prescription.quantity || '-'}</td>
                                <td className="px-4 py-3">{prescription.details || '-'}</td>
                                <td className="px-4 py-3">{prescription.notes || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FiPackage className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-base">No prescription history found</p>
                  <p className="text-sm text-gray-400 mt-1">Prescriptions will appear here once medications are prescribed</p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Patient Documents & Files Preview Section */}
      {patient?.id && existingFiles && existingFiles.length > 0 && (
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <div className="p-6">
            <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-md">
                <FiFileText className="w-5 h-5 text-purple-600" />
              </div>
              Patient Documents & Files
            </h4>
            <FilePreview
              files={existingFiles}
              canDelete={false}
              baseUrl={import.meta.env.VITE_API_URL || 'http://localhost:2025/api'}
            />
          </div>
        </Card>
      )}

<div className="flex mt-4 flex-col sm:flex-row justify-end gap-4">

<Button
  type="button"
  variant="outline"
  onClick={(() => navigate('/patients'))}
  className="px-6 lg:px-8 py-3 bg-white/60 backdrop-blur-md border border-white/30 hover:bg-white/80 hover:border-gray-300/50 text-gray-800 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
>
  <FiX className="mr-2" />
  Cancel
</Button>
<Button
  type="submit"
  onClick={() => {
    if (returnTab) {
      navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
    } else {
      navigate("/patients");
    }
  }}
  className="px-6 lg:px-8 py-3 bg-gradient-to-r from-primary-600 via-indigo-600 to-blue-600 hover:from-primary-700 hover:via-indigo-700 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
>
  <FiSave className="mr-2" />
  View All Patient
</Button>
</div>
      </div>
    </div>
  );
};

export default PatientDetailsView;
