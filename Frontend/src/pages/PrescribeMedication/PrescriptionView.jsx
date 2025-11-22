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
      return;
    }
    window.print();
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
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-teal-50">
        <div className="w-full px-6 py-8 space-y-8">
          {/* Header */}
          <div className="relative no-print">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-3xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-lg border-2 border-green-100">
                    <img src={PGI_Logo} alt="PGIMER Logo" className="h-16 w-16 object-contain" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Postgraduate Institute of Medical Education & Research
                    </h1>
                    <p className="text-lg font-semibold text-gray-700 mt-1">Department of Psychiatry</p>
                    <p className="text-base text-gray-600 mt-1">View Prescription</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
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
                  {prescriptions.length > 0 && (
                    <Button
                      type="button"
                      onClick={handlePrint}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex items-center gap-2"
                    >
                      <FiPrinter className="w-4 h-4" />
                      Print
                    </Button>
                  )}
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

            {prescriptions.length > 0 && (
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
                        <td>{prescription.when_to_take || '-'}</td>
                        <td>{prescription.frequency || '-'}</td>
                        <td>{prescription.duration || '-'}</td>
                        <td className="text-center">{prescription.quantity || '-'}</td>
                        <td>{prescription.details || '-'}</td>
                        <td>{prescription.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
            <Card
              title={
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiUser className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Patient Information</span>
                </div>
              }
              className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm no-print"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FiUser className="w-4 h-4 text-blue-600" />
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Name</label>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{patient.name}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FiFileText className="w-4 h-4 text-purple-600" />
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">CR Number</label>
                  </div>
                  <p className="text-lg font-bold text-gray-900 font-mono">{patient.cr_no}</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FiUser className="w-4 h-4 text-green-600" />
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Age / Sex</label>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{patient.age} years, {patient.sex}</p>
                </div>
                {patient.psy_no && (
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-100">
                    <div className="flex items-center gap-2 mb-2">
                      <FiFileText className="w-4 h-4 text-orange-600" />
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">PSY Number</label>
                    </div>
                    <p className="text-lg font-bold text-gray-900 font-mono">{patient.psy_no}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Walk-in Clinical Proforma Info */}
          {proforma && (
            <Card
              title={
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FiFileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Walk-in Clinical Proforma Information</span>
                </div>
              }
              className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm no-print"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {proforma.visit_date && (
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-100">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Visit Date</label>
                    <p className="text-base font-semibold text-gray-900">{formatDate(proforma.visit_date)}</p>
                  </div>
                )}
                {proforma.visit_type && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Visit Type</label>
                    <p className="text-base font-semibold text-gray-900 capitalize">{proforma.visit_type.replace('_', ' ')}</p>
                  </div>
                )}
                {proforma.diagnosis && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100 md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Diagnosis</label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{proforma.diagnosis}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Prescriptions List */}
          <Card 
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FiPackage className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Prescriptions</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Total:</span> {prescriptions.length} medication(s)
                </div>
              </div>
            }
            className="shadow-xl border-0 bg-white/80 backdrop-blur-sm no-print"
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
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Medicine</th>
                      <th className="px-4 py-3 text-left">Dosage</th>
                      <th className="px-4 py-3 text-left">When</th>
                      <th className="px-4 py-3 text-left">Frequency</th>
                      <th className="px-4 py-3 text-left">Duration</th>
                      <th className="px-4 py-3 text-left">Qty</th>
                      <th className="px-4 py-3 text-left">Details</th>
                      <th className="px-4 py-3 text-left">Notes</th>
                      {(isJrSr(currentUser?.role) || isAdmin(currentUser?.role)) && (
                        <th className="px-4 py-3 text-left">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((prescription, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
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
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default PrescriptionView;

