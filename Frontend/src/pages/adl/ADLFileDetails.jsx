import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiDownload, FiUpload, FiArchive, FiUser, FiFileText, FiActivity } from 'react-icons/fi';
import {
  useGetADLFileByIdQuery,
} from '../../features/adl/adlApiSlice';
import { useGetPatientByIdQuery } from '../../features/patients/patientsApiSlice';
import { useGetClinicalProformaByIdQuery } from '../../features/clinical/clinicalApiSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, formatDateTime } from '../../utils/formatters';

const ADLFileDetails = () => {
  const { id } = useParams();

  const { data, isLoading, error, isError } = useGetADLFileByIdQuery(id);
  
  // Fetch full patient details for complex case
  const file = data?.data?.adlFile || data?.data?.file; // Support both response formats
  const { data: patientData, isLoading: patientLoading } = useGetPatientByIdQuery(
    file?.patient_id,
    { skip: !file?.patient_id }
  );
  
  // Fetch the clinical proforma that created this ADL file (complex case)
  const { data: clinicalProformaData, isLoading: clinicalLoading } = useGetClinicalProformaByIdQuery(
    file?.clinical_proforma_id,
    { skip: !file?.clinical_proforma_id }
  );

  // const handleRetrieve = async () => {
  //   try {
  //     await retrieveFile(id).unwrap();
  //     toast.success('File retrieved successfully');
  //   } catch (err) {
  //     toast.error(err?.data?.message || 'Failed to retrieve file');
  //   }
  // };

  // const handleReturn = async () => {
  //   try {
  //     await returnFile(id).unwrap();
  //     toast.success('File returned successfully');
  //   } catch (err) {
  //     toast.error(err?.data?.message || 'Failed to return file');
  //   }
  // };

  // const handleArchive = async () => {
  //   if (window.confirm('Are you sure you want to archive this file?')) {
  //     try {
  //       await archiveFile(id).unwrap();
  //       toast.success('File archived successfully');
  //     } catch (err) {
  //       toast.error(err?.data?.message || 'Failed to archive file');
  //     }
  //   }
  // };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !file) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600 font-semibold mb-2">Error Loading ADL File</p>
          <p className="text-gray-600 text-sm mb-4">
            {error?.data?.message || 'ADL file not found or could not be loaded'}
          </p>
        <Link to="/adl-files">
            <Button variant="primary">Back to ADL Files</Button>
        </Link>
        </div>
      </div>
    );
  }
  
  const patient = patientData?.data?.patient;
  const clinicalProforma = clinicalProformaData?.data?.proforma;
  const isComplexCase = file?.clinical_proforma_id && clinicalProforma;

  const getStatusVariant = (status) => {
    const map = {
      created: 'info',
      stored: 'success',
      retrieved: 'warning',
      active: 'primary',
      archived: 'default',
    };
    return map[status] || 'default';
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link to="/adl-files">
              <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                <FiArrowLeft className="mr-2" /> Back to Files
            </Button>
          </Link>
            <div className="border-l border-gray-300 pl-4">
              <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 font-mono">{file.adl_no}</h1>
                {isComplexCase && (
                  <Badge variant="danger" className="text-sm">
                    <FiActivity className="w-3 h-3 mr-1" />
                    Complex Case
                  </Badge>
                )}
          </div>
              <p className="text-gray-600 mt-1 text-sm">ADL File Details</p>
        </div>
          </div>
          {/* <div className="flex gap-2 flex-wrap">
          {file.file_status === 'stored' && (
              <Button variant="primary" onClick={handleRetrieve} size="sm">
              <FiDownload className="mr-2" /> Retrieve File
            </Button>
          )}
          {file.file_status === 'retrieved' && (
              <Button variant="success" onClick={handleReturn} size="sm">
              <FiUpload className="mr-2" /> Return File
            </Button>
          )}
          {file.is_active && (
              <Button variant="outline" onClick={handleArchive} size="sm">
              <FiArchive className="mr-2" /> Archive
            </Button>
          )}
          </div> */}
        </div>
      </div>

      {/* File Information - Enhanced */}
      <Card title="File Information" className="border-2 border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ADL Number</label>
            <p className="text-lg font-bold font-mono text-gray-900 mt-1">{file.adl_no}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient Name</label>
            <p className="text-lg font-semibold text-gray-900 mt-1">{file.patient_name || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">CR Number</label>
            <p className="text-lg font-semibold font-mono text-gray-900 mt-1">{file.cr_no || 'N/A'}</p>
          </div>
          {file.psy_no && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">PSY Number</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{file.psy_no}</p>
          </div>
          )}
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">File Status</label>
            <div className="mt-1">
              <Badge variant={getStatusVariant(file.file_status)} className="text-sm font-semibold">
                {file.file_status?.charAt(0).toUpperCase() + file.file_status?.slice(1)}
            </Badge>
          </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Active Status</label>
            <div className="mt-1">
              <Badge variant={file.is_active ? 'success' : 'default'} className="text-sm font-semibold">
              {file.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Created By</label>
            <p className="text-lg text-gray-900 mt-1">
              {file.created_by_name || 'N/A'}
              {file.created_by_role && <span className="text-sm text-gray-500 ml-1">({file.created_by_role})</span>}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">File Created</label>
            <p className="text-lg font-semibold text-gray-900 mt-1">{formatDate(file.file_created_date)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Visits</label>
            <p className="text-2xl font-bold text-primary-600 mt-1">{file.total_visits || 0}</p>
          </div>
          {file.physical_file_location && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Physical Location</label>
              <p className="text-lg text-gray-900 mt-1">{file.physical_file_location}</p>
            </div>
          )}
          {file.last_accessed_date && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Accessed</label>
              <p className="text-lg text-gray-900 mt-1">{formatDate(file.last_accessed_date)}</p>
            </div>
          )}
          {file.last_accessed_by_name && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Accessed By</label>
              <p className="text-lg text-gray-900 mt-1">{file.last_accessed_by_name}</p>
            </div>
          )}
        </div>

        {file.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 block">Notes</label>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{file.notes}</p>
            </div>
          </div>
        )}
      </Card>


      {/* Complex Case - Patient Details */}
      {isComplexCase && patient && (
        <>
          <Card title="Complex Case - Patient Information" className="border-2 border-red-200 bg-red-50/30">
            <div className="mb-4 flex items-center gap-2">
              <FiActivity className="w-5 h-5 text-red-600" />
              <Badge variant="danger" className="text-sm font-semibold">
                Complex Case - Full Patient Details
              </Badge>
            </div>
            
            {patientLoading ? (
              <LoadingSpinner className="h-32" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-lg font-semibold">{patient.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Sex</label>
                  <p className="text-lg">{patient.sex}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Age</label>
                  <p className="text-lg">{patient.age}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Marital Status</label>
                  <p className="text-lg">{patient.marital_status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Occupation</label>
                  <p className="text-lg">{patient.occupation || patient.actual_occupation || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Education</label>
                  <p className="text-lg">{patient.education_level || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Number</label>
                  <p className="text-lg">{patient.contact_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Present Address</label>
                  <p className="text-lg text-gray-700">
                    {patient.present_address_line_1 || patient.present_address || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Religion</label>
                  <p className="text-lg">{patient.religion || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Family Type</label>
                  <p className="text-lg">{patient.family_type || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Locality</label>
                  <p className="text-lg">{patient.locality || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Patient Income</label>
                  <p className="text-lg">{patient.patient_income || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Family Income</label>
                  <p className="text-lg">{patient.family_income || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mobility</label>
                  <p className="text-lg">{patient.mobility || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Referred By</label>
                  <p className="text-lg">{patient.referred_by || 'N/A'}</p>
                </div>
                {patient.head_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Head of Family</label>
                    <p className="text-lg">{patient.head_name} ({patient.head_relationship})</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Complex Case - Walk-in Clinical Proforma Details */}
          {clinicalProforma && (
            <Card title="Complex Case - Walk-in Clinical Proforma Details" className="border-2 border-blue-200 bg-blue-50/30">
              {clinicalLoading ? (
                <LoadingSpinner className="h-32" />
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Visit Date</label>
                      <p className="text-lg font-semibold">{formatDate(clinicalProforma.visit_date)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Visit Type</label>
                      <Badge variant={clinicalProforma.visit_type === 'first_visit' ? 'primary' : 'info'}>
                        {clinicalProforma.visit_type === 'first_visit' ? 'First Visit' : 'Follow Up'}
                      </Badge>
                    </div>
                    {/* <div>
                      <label className="text-sm font-medium text-gray-500">Case Severity</label>
                      <Badge variant={
                        clinicalProforma.case_severity === 'critical' ? 'danger' :
                        clinicalProforma.case_severity === 'severe' ? 'warning' :
                        clinicalProforma.case_severity === 'moderate' ? 'info' : 'success'
                      }>
                        {clinicalProforma.case_severity || 'N/A'}
                      </Badge>
                    </div> */}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Room Number</label>
                      <p className="text-lg">{clinicalProforma.room_no || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Assigned Doctor</label>
                      <p className="text-lg">{clinicalProforma.assigned_doctor || clinicalProforma.doctor_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">ICD Code</label>
                      <p className="text-lg font-mono">{clinicalProforma.icd_code || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {clinicalProforma.diagnosis && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Diagnosis</label>
                      <p className="text-gray-900 mt-1 whitespace-pre-wrap">{clinicalProforma.diagnosis}</p>
                    </div>
                  )}
                  
                  {clinicalProforma.adl_reasoning && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">ADL Reasoning</label>
                      <p className="text-gray-900 mt-1 whitespace-pre-wrap bg-yellow-50 p-3 rounded border border-yellow-200">
                        {clinicalProforma.adl_reasoning}
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <Link to={`/clinical/${clinicalProforma.id}`}>
                      <Button variant="outline" className="w-full">
                        <FiFileText className="mr-2" /> View Full Walk-in Clinical Proforma
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Complex Case - Comprehensive Clinical Data (from ADL File) */}
          <Card title="Complex Case - Comprehensive Clinical Data" className="border-2 border-green-200 bg-green-50/30">
            <div className="space-y-6">
              {/* History of Present Illness - Expanded */}
              {(file.history_narrative || file.history_specific_enquiry || file.history_drug_intake) && (
                <Card title="History of Present Illness (Expanded)">
                  <div className="space-y-4">
                    {file.history_narrative && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Narrative</label>
                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.history_narrative}</p>
                      </div>
                    )}
                    {file.history_specific_enquiry && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Specific Enquiry</label>
                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.history_specific_enquiry}</p>
                      </div>
                    )}
                    {file.history_drug_intake && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Drug Intake</label>
                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.history_drug_intake}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {file.history_treatment_place && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Treatment Place</label>
                          <p className="text-gray-900 mt-1">{file.history_treatment_place}</p>
                        </div>
                      )}
                      {file.history_treatment_dates && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Treatment Dates</label>
                          <p className="text-gray-900 mt-1">{file.history_treatment_dates}</p>
                        </div>
                      )}
                      {file.history_treatment_drugs && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Treatment Drugs</label>
                          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.history_treatment_drugs}</p>
                        </div>
                      )}
                      {file.history_treatment_response && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Treatment Response</label>
                          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.history_treatment_response}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Informants */}
              {file.informants && Array.isArray(file.informants) && file.informants.length > 0 && (
                <Card title="Informants">
                  <div className="space-y-3">
                    {file.informants.map((informant, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded">
                        <p className="font-medium">{informant.name || `Informant ${index + 1}`}</p>
                        {informant.relation && <p className="text-sm text-gray-600">Relation: {informant.relation}</p>}
                        {informant.age && <p className="text-sm text-gray-600">Age: {informant.age}</p>}
                        {informant.address && <p className="text-sm text-gray-600">Address: {informant.address}</p>}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Past History - Detailed */}
              {(file.past_history_medical || file.past_history_psychiatric_dates || file.past_history_psychiatric_diagnosis) && (
                <Card title="Past History (Detailed)">
                  <div className="space-y-4">
                    {file.past_history_medical && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Medical History</label>
                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.past_history_medical}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {file.past_history_psychiatric_dates && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Psychiatric Dates</label>
                          <p className="text-gray-900 mt-1">{file.past_history_psychiatric_dates}</p>
                        </div>
                      )}
                      {file.past_history_psychiatric_diagnosis && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Psychiatric Diagnosis</label>
                          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.past_history_psychiatric_diagnosis}</p>
                        </div>
                      )}
                      {file.past_history_psychiatric_treatment && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Psychiatric Treatment</label>
                          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.past_history_psychiatric_treatment}</p>
                        </div>
                      )}
                      {file.past_history_psychiatric_interim && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Interim Period</label>
                          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.past_history_psychiatric_interim}</p>
                        </div>
                      )}
                    </div>
                    {file.past_history_psychiatric_recovery && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Recovery</label>
                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.past_history_psychiatric_recovery}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Family History - Detailed */}
              {(file.family_history_father_age || file.family_history_mother_age) && (
                <Card title="Family History (Detailed)">
                  <div className="space-y-6">
                    {/* Father's History */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Father's History</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {file.family_history_father_age && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Age</label>
                            <p className="text-gray-900 mt-1">{file.family_history_father_age}</p>
                          </div>
                        )}
                        {file.family_history_father_education && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Education</label>
                            <p className="text-gray-900 mt-1">{file.family_history_father_education}</p>
                          </div>
                        )}
                        {file.family_history_father_occupation && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Occupation</label>
                            <p className="text-gray-900 mt-1">{file.family_history_father_occupation}</p>
                          </div>
                        )}
                        {file.family_history_father_personality && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Personality</label>
                            <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.family_history_father_personality}</p>
                          </div>
                        )}
                        {file.family_history_father_deceased !== undefined && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Deceased</label>
                            <p className="text-gray-900 mt-1">{file.family_history_father_deceased ? 'Yes' : 'No'}</p>
                          </div>
                        )}
                        {file.family_history_father_deceased && file.family_history_father_death_age && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Death Age</label>
                            <p className="text-gray-900 mt-1">{file.family_history_father_death_age}</p>
                          </div>
                        )}
                        {file.family_history_father_deceased && file.family_history_father_death_date && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Death Date</label>
                            <p className="text-gray-900 mt-1">{formatDate(file.family_history_father_death_date)}</p>
                          </div>
                        )}
                        {file.family_history_father_deceased && file.family_history_father_death_cause && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Death Cause</label>
                            <p className="text-gray-900 mt-1">{file.family_history_father_death_cause}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mother's History */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Mother's History</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {file.family_history_mother_age && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Age</label>
                            <p className="text-gray-900 mt-1">{file.family_history_mother_age}</p>
                          </div>
                        )}
                        {file.family_history_mother_education && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Education</label>
                            <p className="text-gray-900 mt-1">{file.family_history_mother_education}</p>
                          </div>
                        )}
                        {file.family_history_mother_occupation && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Occupation</label>
                            <p className="text-gray-900 mt-1">{file.family_history_mother_occupation}</p>
                          </div>
                        )}
                        {file.family_history_mother_personality && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Personality</label>
                            <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.family_history_mother_personality}</p>
                          </div>
                        )}
                        {file.family_history_mother_deceased !== undefined && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Deceased</label>
                            <p className="text-gray-900 mt-1">{file.family_history_mother_deceased ? 'Yes' : 'No'}</p>
                          </div>
                        )}
                        {file.family_history_mother_deceased && file.family_history_mother_death_age && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Death Age</label>
                            <p className="text-gray-900 mt-1">{file.family_history_mother_death_age}</p>
                          </div>
                        )}
                        {file.family_history_mother_deceased && file.family_history_mother_death_date && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Death Date</label>
                            <p className="text-gray-900 mt-1">{formatDate(file.family_history_mother_death_date)}</p>
                          </div>
                        )}
                        {file.family_history_mother_deceased && file.family_history_mother_death_cause && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Death Cause</label>
                            <p className="text-gray-900 mt-1">{file.family_history_mother_death_cause}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Siblings */}
                    {file.family_history_siblings && Array.isArray(file.family_history_siblings) && file.family_history_siblings.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Siblings</h4>
                        <div className="space-y-2">
                          {file.family_history_siblings.map((sibling, index) => (
                            <div key={index} className="p-3 border border-gray-200 rounded">
                              <p className="font-medium">{sibling.name || `Sibling ${index + 1}`}</p>
                              {sibling.age && <p className="text-sm text-gray-600">Age: {sibling.age}</p>}
                              {sibling.relation && <p className="text-sm text-gray-600">Relation: {sibling.relation}</p>}
                              {sibling.notes && <p className="text-sm text-gray-600">{sibling.notes}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Mental Status Examination - Expanded */}
              {(file.mse_general_demeanour || file.mse_affect_subjective || file.mse_thought_flow || file.mse_cognitive_consciousness) && (
                <Card title="Mental Status Examination (Expanded)">
                  <div className="space-y-4">
                    {/* General */}
                    {(file.mse_general_demeanour || file.mse_general_tidy || file.mse_general_awareness || file.mse_general_cooperation) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">General</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {file.mse_general_demeanour && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Demeanour</label>
                              <p className="text-gray-900 mt-1">{file.mse_general_demeanour}</p>
                            </div>
                          )}
                          {file.mse_general_tidy && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Tidy</label>
                              <p className="text-gray-900 mt-1">{file.mse_general_tidy}</p>
                            </div>
                          )}
                          {file.mse_general_awareness && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Awareness</label>
                              <p className="text-gray-900 mt-1">{file.mse_general_awareness}</p>
                            </div>
                          )}
                          {file.mse_general_cooperation && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Cooperation</label>
                              <p className="text-gray-900 mt-1">{file.mse_general_cooperation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Affect */}
                    {(file.mse_affect_subjective || file.mse_affect_tone || file.mse_affect_resting || file.mse_affect_fluctuation) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Affect</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {file.mse_affect_subjective && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Subjective</label>
                              <p className="text-gray-900 mt-1">{file.mse_affect_subjective}</p>
                            </div>
                          )}
                          {file.mse_affect_tone && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Tone</label>
                              <p className="text-gray-900 mt-1">{file.mse_affect_tone}</p>
                            </div>
                          )}
                          {file.mse_affect_resting && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Resting</label>
                              <p className="text-gray-900 mt-1">{file.mse_affect_resting}</p>
                            </div>
                          )}
                          {file.mse_affect_fluctuation && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Fluctuation</label>
                              <p className="text-gray-900 mt-1">{file.mse_affect_fluctuation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Thought */}
                    {(file.mse_thought_flow || file.mse_thought_form || file.mse_thought_content) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Thought</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {file.mse_thought_flow && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Flow</label>
                              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.mse_thought_flow}</p>
                            </div>
                          )}
                          {file.mse_thought_form && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Form</label>
                              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.mse_thought_form}</p>
                            </div>
                          )}
                          {file.mse_thought_content && (
                            <div className="md:col-span-2">
                              <label className="text-sm font-medium text-gray-500">Content</label>
                              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.mse_thought_content}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cognitive */}
                    {(file.mse_cognitive_consciousness || file.mse_cognitive_orientation_time || file.mse_cognitive_memory_immediate) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Cognitive Function</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {file.mse_cognitive_consciousness && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Consciousness</label>
                              <p className="text-gray-900 mt-1">{file.mse_cognitive_consciousness}</p>
                            </div>
                          )}
                          {file.mse_cognitive_orientation_time && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Orientation - Time</label>
                              <p className="text-gray-900 mt-1">{file.mse_cognitive_orientation_time}</p>
                            </div>
                          )}
                          {file.mse_cognitive_orientation_place && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Orientation - Place</label>
                              <p className="text-gray-900 mt-1">{file.mse_cognitive_orientation_place}</p>
                            </div>
                          )}
                          {file.mse_cognitive_orientation_person && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Orientation - Person</label>
                              <p className="text-gray-900 mt-1">{file.mse_cognitive_orientation_person}</p>
                            </div>
                          )}
                          {file.mse_cognitive_memory_immediate && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Memory - Immediate</label>
                              <p className="text-gray-900 mt-1">{file.mse_cognitive_memory_immediate}</p>
                            </div>
                          )}
                          {file.mse_cognitive_memory_recent && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Memory - Recent</label>
                              <p className="text-gray-900 mt-1">{file.mse_cognitive_memory_recent}</p>
                            </div>
                          )}
                          {file.mse_cognitive_memory_remote && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Memory - Remote</label>
                              <p className="text-gray-900 mt-1">{file.mse_cognitive_memory_remote}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Insight */}
                    {(file.mse_insight_understanding || file.mse_insight_judgement) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Insight</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {file.mse_insight_understanding && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Understanding</label>
                              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.mse_insight_understanding}</p>
                            </div>
                          )}
                          {file.mse_insight_judgement && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Judgement</label>
                              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.mse_insight_judgement}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Physical Examination - Comprehensive */}
              {(file.physical_appearance || file.physical_pulse || file.physical_bp || file.physical_height) && (
                <Card title="Physical Examination (Comprehensive)">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {file.physical_appearance && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Appearance</label>
                          <p className="text-gray-900 mt-1">{file.physical_appearance}</p>
                        </div>
                      )}
                      {file.physical_body_build && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Body Build</label>
                          <p className="text-gray-900 mt-1">{file.physical_body_build}</p>
                        </div>
                      )}
                      {file.physical_pulse && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Pulse</label>
                          <p className="text-gray-900 mt-1">{file.physical_pulse}</p>
                        </div>
                      )}
                      {file.physical_bp && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Blood Pressure</label>
                          <p className="text-gray-900 mt-1">{file.physical_bp}</p>
                        </div>
                      )}
                      {file.physical_height && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Height</label>
                          <p className="text-gray-900 mt-1">{file.physical_height}</p>
                        </div>
                      )}
                      {file.physical_weight && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Weight</label>
                          <p className="text-gray-900 mt-1">{file.physical_weight}</p>
                        </div>
                      )}
                    </div>
                    
                    {(file.physical_cvs_apex || file.physical_cvs_heart_sounds) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Cardiovascular System</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {file.physical_cvs_apex && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Apex</label>
                              <p className="text-gray-900 mt-1">{file.physical_cvs_apex}</p>
                            </div>
                          )}
                          {file.physical_cvs_regularity && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Regularity</label>
                              <p className="text-gray-900 mt-1">{file.physical_cvs_regularity}</p>
                            </div>
                          )}
                          {file.physical_cvs_heart_sounds && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Heart Sounds</label>
                              <p className="text-gray-900 mt-1">{file.physical_cvs_heart_sounds}</p>
                            </div>
                          )}
                          {file.physical_cvs_murmurs && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Murmurs</label>
                              <p className="text-gray-900 mt-1">{file.physical_cvs_murmurs}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {(file.physical_cns_cranial || file.physical_cns_motor_sensory) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Central Nervous System</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {file.physical_cns_cranial && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Cranial Nerves</label>
                              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.physical_cns_cranial}</p>
                            </div>
                          )}
                          {file.physical_cns_motor_sensory && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Motor & Sensory</label>
                              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.physical_cns_motor_sensory}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Provisional Diagnosis and Treatment Plan */}
              {(file.provisional_diagnosis || file.treatment_plan) && (
                <Card title="Provisional Diagnosis and Treatment Plan" className="border-2 border-blue-200 bg-blue-50/30">
                  <div className="space-y-4">
                    {file.provisional_diagnosis && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Provisional Diagnosis</label>
                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.provisional_diagnosis}</p>
                      </div>
                    )}
                    {file.treatment_plan && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Treatment Plan</label>
                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.treatment_plan}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Comments of the Consultant */}
              {file.consultant_comments && (
                <Card title="Comments of the Consultant" className="border-2 border-purple-200 bg-purple-50/30">
                  <p className="text-gray-900 whitespace-pre-wrap">{file.consultant_comments}</p>
                </Card>
              )}
            </div>
          </Card>
        </>
      )}

      {/* Quick Links - Enhanced */}
      {file.patient_id && (
        <Card title="Related Records" className="border-2 border-indigo-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={`/patients/${file.patient_id}?edit=false`}>
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 hover:shadow-md transition-all duration-200 text-center cursor-pointer group">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-500 transition-colors">
                  <FiUser className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-900 group-hover:text-primary-600">View Patient Record</p>
                <p className="text-xs text-gray-500 mt-1">View full patient details</p>
            </div>
          </Link>
          <Link to={`/clinical?patient_id=${file.patient_id}`}>
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 hover:shadow-md transition-all duration-200 text-center cursor-pointer group">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                  <FiFileText className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-600">Clinical Records</p>
                <p className="text-xs text-gray-500 mt-1">Browse all clinical proformas</p>
            </div>
          </Link>
          <Link to={`/clinical/new?patient_id=${file.patient_id}`}>
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 hover:shadow-md transition-all duration-200 text-center cursor-pointer group">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                  <FiActivity className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-900 group-hover:text-green-600">New Clinical Record</p>
                <p className="text-xs text-gray-500 mt-1">Create new proforma</p>
            </div>
          </Link>
        </div>
      </Card>
      )}
    </div>
  );
};

export default ADLFileDetails;

