import { useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetPrescriptionByIdQuery } from '../../features/prescriptions/prescriptionApiSlice';
import { useGetClinicalProformaByIdQuery } from '../../features/clinical/clinicalApiSlice';
import { useGetPatientByIdQuery } from '../../features/patients/patientsApiSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { FiPackage, FiUser, FiEdit, FiPrinter, FiFileText, FiArrowLeft, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import PGI_Logo from '../../assets/PGI_Logo.png';
import LoadingSpinner from '../../components/LoadingSpinner';
import { isAdmin, isJrSr } from '../../utils/constants';

const PrescriptionView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clinicalProformaId = searchParams.get('clinical_proforma_id');
  const patientId = searchParams.get('patient_id');
  const returnTab = searchParams.get('returnTab');
  const currentUser = useSelector(selectCurrentUser);
  const printRef = useRef(null);

  const { data: proformaData, isLoading: loadingProforma } = useGetClinicalProformaByIdQuery(
    clinicalProformaId,
    { skip: !clinicalProformaId }
  );

  const proforma = proformaData?.data?.proforma;
  const actualPatientId = proforma?.patient_id || patientId;

  const { data: patientData, isLoading: loadingPatient } = useGetPatientByIdQuery(
    actualPatientId,
    { skip: !actualPatientId }
  );

  const { data: prescriptionsData, isLoading: loadingPrescriptions } = useGetPrescriptionByIdQuery(
    { clinical_proforma_id: clinicalProformaId },
    { skip: !clinicalProformaId }
  );

  const patient = patientData?.data?.patient;
  const prescriptionData = prescriptionsData?.data?.prescription;
  const prescriptions = prescriptionData?.prescription || [];

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

  const handlePrint = () => {
    if (prescriptions.length === 0) {
      alert('No prescriptions available to print.');
      return;
    }
    
    // Ensure print content is visible before printing
    const printContent = document.querySelector('.print-content');
    if (printContent) {
      // Temporarily show print content for better print preview
      const originalStyle = printContent.style.cssText;
      printContent.style.position = 'relative';
      printContent.style.left = '0';
      printContent.style.opacity = '1';
      printContent.style.pointerEvents = 'auto';
      
      // Trigger print
      window.print();
      
      // Restore original style after a short delay
      setTimeout(() => {
        printContent.style.cssText = originalStyle;
      }, 100);
    } else {
      window.print();
    }
  };

  if (loadingProforma || loadingPatient || loadingPrescriptions) {
    return <LoadingSpinner />;
  }

  if (!proforma && !patientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-teal-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Walk-in Clinical Proforma Not Found</h2>
          <p className="text-gray-600 mb-6">Please provide a clinical proforma ID or patient ID to view prescriptions.</p>
          <Button onClick={() => navigate(-1)} variant="primary">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Print-specific styles - same as CreatePrescription */}
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
          .print-table {
            border-collapse: collapse;
            width: 100%;
            font-size: 9px !important;
            margin: 6px 0 !important;
          }
          .print-table th,
          .print-table td {
            border: 1px solid #374151;
            padding: 3px 4px !important;
            text-align: left;
          }
          .print-table th {
            background-color: #f3f4f6 !important;
            font-weight: bold;
            color: #111827 !important;
          }
          .print-table td {
            color: #374151 !important;
          }
          .print-section-title {
            font-size: 11px !important;
            font-weight: bold !important;
            color: #111827 !important;
            margin-bottom: 6px !important;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .print-patient-info {
            margin-bottom: 12px !important;
            padding: 8px 0 !important;
            border-bottom: 1px solid #d1d5db !important;
          }
          .print-footer {
            margin-top: 20px !important;
            page-break-inside: avoid;
          }
          .print-header img {
            max-width: 100px !important;
            height: auto !important;
          }
        }
      `}</style>

      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 w-full px-6 py-8 space-y-8">
          {/* Header */}
          <div className="relative no-print">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl"></div>
            <div className="relative backdrop-blur-2xl bg-white/70 rounded-3xl p-8 shadow-2xl border border-white/40">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 backdrop-blur-md bg-white/60 rounded-2xl shadow-lg border border-white/40">
                    <img src={PGI_Logo} alt="PGIMER Logo" className="h-16 w-16 object-contain" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                      Postgraduate Institute of Medical Education & Research
                    </h1>
                    <p className="text-base lg:text-lg font-semibold text-gray-700 mt-1">Department of Psychiatry</p>
                    <p className="text-sm lg:text-base text-gray-600 mt-1">View Prescription</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto justify-end">
                  {(isJrSr(currentUser?.role) || isAdmin(currentUser?.role)) && clinicalProformaId && (
                    <Button
                      onClick={() => navigate(`/prescriptions/create?patient_id=${actualPatientId}&clinical_proforma_id=${clinicalProformaId}&returnTab=${returnTab || ''}`)}
                      variant="primary"
                      className="flex items-center gap-2"
                    >
                      <FiPackage className="w-4 h-4" />
                      Add Prescription
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={handlePrint}
                    disabled={prescriptions.length === 0}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 px-4 py-2"
                    title={prescriptions.length === 0 ? 'No prescriptions to print' : 'Print prescription'}
                  >
                    <FiPrinter className="w-5 h-5" />
                    <span className="font-semibold">Print Prescription</span>
                  </Button>
                  <Button
                    onClick={() => {
                      if (returnTab) {
                        navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
                      } else if (actualPatientId) {
                        navigate(`/patients/${actualPatientId}?tab=prescriptions`);
                      } else {
                        navigate(-1);
                      }
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <FiArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Print Content */}
          <div className="print-content" ref={printRef} style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
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

            {patient && (
              <div className="print-patient-info">
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                  <div>
                    <span className="font-bold">Patient Name:</span> <span className="ml-2">{patient.name}</span>
                  </div>
                  <div>
                    <span className="font-bold">CR Number:</span> <span className="ml-2 font-mono">{patient.cr_no}</span>
                  </div>
                  <div>
                    <span className="font-bold">Age/Sex:</span> <span className="ml-2">{patient.age} years, {patient.sex}</span>
                  </div>
                  {proforma?.visit_date && (
                    <div>
                      <span className="font-bold">Visit Date:</span> <span className="ml-2">{formatDateFull(proforma.visit_date)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {prescriptions.length > 0 ? (
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
                    {prescriptions.map((prescription, idx) => (
                      <tr key={idx}>
                        <td className="text-center">{idx + 1}</td>
                        <td className="font-medium">{prescription.medicine || '-'}</td>
                        <td>{prescription.dosage || '-'}</td>
                        <td>{prescription.when_to_take || prescription.when || '-'}</td>
                        <td>{prescription.frequency || '-'}</td>
                        <td>{prescription.duration || '-'}</td>
                        <td className="text-center">{prescription.quantity || prescription.qty || '-'}</td>
                        <td>{prescription.details || '-'}</td>
                        <td>{prescription.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="my-4 text-center">
                <p className="text-xs text-gray-600">No medications prescribed</p>
              </div>
            )}

            <div className="print-footer">
              <div className="grid grid-cols-2 gap-12 mt-6">
                <div>
                  <div className="mb-16"></div>
                  <div className="border-t-2 border-gray-700 text-center pt-2">
                    <p className="font-bold text-xs">{currentUser?.name || 'Doctor Name'}</p>
                    <p className="text-xs text-gray-600 mt-1">{currentUser?.role || 'Designation'}</p>
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

          {/* Patient Information */}
          {patient && (
            <div className="relative no-print">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
              <Card
                title={
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl border border-white/30 shadow-lg">
                      <FiUser className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Patient Information</span>
                  </div>
                }
                className="relative mb-8 shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl"></div>
                    <div className="relative backdrop-blur-sm bg-white/50 border border-white/40 rounded-xl p-4 shadow-md">
                      <div className="flex items-center gap-2 mb-2">
                        <FiUser className="w-4 h-4 text-blue-600" />
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Name</label>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{patient.name}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl"></div>
                    <div className="relative backdrop-blur-sm bg-white/50 border border-white/40 rounded-xl p-4 shadow-md">
                      <div className="flex items-center gap-2 mb-2">
                        <FiFileText className="w-4 h-4 text-purple-600" />
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">CR Number</label>
                      </div>
                      <p className="text-lg font-bold text-gray-900 font-mono">{patient.cr_no}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl"></div>
                    <div className="relative backdrop-blur-sm bg-white/50 border border-white/40 rounded-xl p-4 shadow-md">
                      <div className="flex items-center gap-2 mb-2">
                        <FiUser className="w-4 h-4 text-green-600" />
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Age / Sex</label>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{patient.age} years, {patient.sex}</p>
                    </div>
                  </div>
                  {patient.psy_no && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-xl"></div>
                      <div className="relative backdrop-blur-sm bg-white/50 border border-white/40 rounded-xl p-4 shadow-md">
                        <div className="flex items-center gap-2 mb-2">
                          <FiFileText className="w-4 h-4 text-orange-600" />
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">PSY Number</label>
                        </div>
                        <p className="text-lg font-bold text-gray-900 font-mono">{patient.psy_no}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Walk-in Clinical Proforma Info */}
          {proforma && (
            <div className="relative no-print">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
              <Card
                title={
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 backdrop-blur-md bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-white/30 shadow-lg">
                      <FiFileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Walk-in Clinical Proforma Information</span>
                  </div>
                }
                className="relative mb-8 shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {proforma.visit_date && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-xl"></div>
                      <div className="relative backdrop-blur-sm bg-white/50 border border-white/40 rounded-xl p-4 shadow-md">
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Visit Date</label>
                        <p className="text-base font-semibold text-gray-900">{formatDate(proforma.visit_date)}</p>
                      </div>
                    </div>
                  )}
                  {proforma.visit_type && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl"></div>
                      <div className="relative backdrop-blur-sm bg-white/50 border border-white/40 rounded-xl p-4 shadow-md">
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Visit Type</label>
                        <p className="text-base font-semibold text-gray-900 capitalize">{proforma.visit_type.replace('_', ' ')}</p>
                      </div>
                    </div>
                  )}
                  {proforma.diagnosis && (
                    <div className="relative md:col-span-2">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl"></div>
                      <div className="relative backdrop-blur-sm bg-white/50 border border-white/40 rounded-xl p-4 shadow-md">
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Diagnosis</label>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{proforma.diagnosis}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Prescriptions List */}
          <div className="relative no-print">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl"></div>
            <Card 
              title={
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 backdrop-blur-md bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-white/30 shadow-lg">
                      <FiPackage className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Prescriptions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-700 backdrop-blur-sm bg-white/40 px-3 py-1.5 rounded-lg border border-white/40">
                      <span className="font-semibold">Total:</span> {prescriptions.length} medication(s)
                    </div>
                    <Button
                      type="button"
                      onClick={handlePrint}
                      disabled={prescriptions.length === 0}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 px-4 py-2"
                      title={prescriptions.length === 0 ? 'No prescriptions to print' : 'Print prescription'}
                    >
                      <FiPrinter className="w-5 h-5" />
                      <span className="font-semibold">Print</span>
                    </Button>
                  </div>
                </div>
              }
              className="relative shadow-2xl border border-white/40 bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden"
            >
            {loadingPrescriptions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading prescriptions...</p>
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="text-center py-12">
                <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Prescriptions Found</h3>
                <p className="text-gray-600 mb-6">No medications have been prescribed for this clinical proforma yet.</p>
                {(isJrSr(currentUser?.role) || isAdmin(currentUser?.role)) && clinicalProformaId && (
                  <Button
                    onClick={() => navigate(`/prescriptions/create?patient_id=${actualPatientId}&clinical_proforma_id=${clinicalProformaId}&returnTab=${returnTab || ''}`)}
                    variant="primary"
                    className="flex items-center gap-2 mx-auto"
                  >
                    <FiPackage className="w-4 h-4" />
                    Create Prescription
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-6">
                <div className="overflow-x-auto rounded-xl border border-white/40 shadow-lg" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  <table className="min-w-full text-sm" style={{ position: 'relative' }}>
                    <thead className="backdrop-blur-md bg-white/50 border-b border-white/40 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider backdrop-blur-md bg-white/50">#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider backdrop-blur-md bg-white/50">Medicine</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider backdrop-blur-md bg-white/50">Dosage</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider backdrop-blur-md bg-white/50">When</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider backdrop-blur-md bg-white/50">Frequency</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider backdrop-blur-md bg-white/50">Duration</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider backdrop-blur-md bg-white/50">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider backdrop-blur-md bg-white/50">Details</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider backdrop-blur-md bg-white/50">Notes</th>
                        {(isJrSr(currentUser?.role) || isAdmin(currentUser?.role)) && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider backdrop-blur-md bg-white/50">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="backdrop-blur-sm bg-white/40 divide-y divide-white/30">
                      {prescriptions.map((prescription, idx) => (
                        <tr key={idx} className="hover:bg-white/60 transition-colors duration-200">
                          <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium">{prescription.medicine || '-'}</td>
                          <td className="px-4 py-3">{prescription.dosage || '-'}</td>
                          <td className="px-4 py-3">{prescription.when_to_take || '-'}</td>
                          <td className="px-4 py-3">{prescription.frequency || '-'}</td>
                          <td className="px-4 py-3">{prescription.duration || '-'}</td>
                          <td className="px-4 py-3">{prescription.quantity || '-'}</td>
                          <td className="px-4 py-3">{prescription.details || '-'}</td>
                          <td className="px-4 py-3">{prescription.notes || '-'}</td>
                          {(isJrSr(currentUser?.role) || isAdmin(currentUser?.role)) && (
                            <td className="px-4 py-3">
                              <Button
                                onClick={() => navigate(`/prescriptions/edit?clinical_proforma_id=${clinicalProformaId}&patient_id=${actualPatientId}&returnTab=${returnTab || ''}`)}
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                              >
                                <FiEdit className="w-4 h-4" />
                                Edit
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrescriptionView;

