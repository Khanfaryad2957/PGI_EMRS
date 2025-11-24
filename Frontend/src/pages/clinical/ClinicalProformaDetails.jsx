import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiArrowLeft, FiPrinter, FiFileText, FiActivity } from 'react-icons/fi';
import {
  useGetClinicalProformaByIdQuery,
  useDeleteClinicalProformaMutation,
} from '../../features/clinical/clinicalApiSlice';
import { useGetADLFileByIdQuery } from '../../features/adl/adlApiSlice';
import { useGetPatientFilesQuery } from '../../features/patients/patientFilesApiSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import FilePreview from '../../components/FilePreview';
import { formatDate } from '../../utils/formatters';

const ClinicalProformaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTab = searchParams.get('returnTab'); // Get returnTab from URL

  const { data, isLoading, refetch } = useGetClinicalProformaByIdQuery(id);
  const [deleteProforma, { isLoading: isDeleting }] = useDeleteClinicalProformaMutation();
  
  // Fetch ADL file data if this is a complex case
  const proforma = data?.data?.proforma;
  const isComplexCase = proforma?.doctor_decision === 'complex_case' && proforma?.adl_file_id;
  const { data: adlFileData, isLoading: adlFileLoading } = useGetADLFileByIdQuery(
    proforma?.adl_file_id,
    { skip: !isComplexCase }
  );
  const adlFile = adlFileData?.data?.file;
  
  // Fetch patient files for preview
  const patientId = proforma?.patient_id;
  const { data: patientFilesData } = useGetPatientFilesQuery(patientId, {
    skip: !patientId
  });
  const existingFiles = patientFilesData?.data?.files || [];

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this clinical proforma? This action cannot be undone.')) {
      try {
        await deleteProforma(id).unwrap();
        toast.success('Clinical proforma deleted successfully');
        
        // Force refetch the current query to ensure it's removed from cache
        refetch();
        
        // Navigate back immediately - cache invalidation will handle the UI update
        // Using replace: true to prevent back button from going to deleted page
        if (returnTab) {
          navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`, { replace: true });
        } else {
          navigate('/clinical', { replace: true });
        }
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete proforma');
      }
    }
  };

  const handleBack = () => {
    // Navigate back to Today Patients with preserved tab if returnTab exists
    if (returnTab) {
      navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
    } else {
      navigate('/clinical');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-96" />;
  }

  if (!proforma) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Clinical proforma not found</p>
        <Button 
          className="mt-4" 
          onClick={() => {
            const returnTab = new URLSearchParams(window.location.search).get('returnTab');
            if (returnTab) {
              navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
            } else {
              navigate('/clinical');
            }
          }}
        >
          Back to Clinical Records
        </Button>
      </div>
    );
  }

  const InfoSection = ({ title, data }) => (
    <Card title={title} className="mb-6">
      <div className="space-y-4">
        {Object.entries(data).map(([key, value]) => (
          value && (
            <div key={key}>
              <label className="text-sm font-medium text-gray-500 capitalize">
                {key.replace(/_/g, ' ')}
              </label>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{value}</p>
            </div>
          )
        ))}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <FiArrowLeft className="mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900"> Walk-in Clinical Proforma</h1>
            <p className="text-gray-600 mt-1">View clinical assessment details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <FiPrinter className="mr-2" /> Print
          </Button>
          <Link to={`/clinical/${id}/edit`}>
            <Button variant="outline">
              <FiEdit className="mr-2" /> Edit
            </Button>
          </Link>
          <Button variant="danger" onClick={handleDelete} loading={isDeleting}>
            <FiTrash2 className="mr-2" /> Delete
          </Button>
        </div>
      </div>

      {/* Patient & Visit Info */}
      <Card title="Patient & Visit Information">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Patient Name</label>
            <p className="text-lg font-semibold">{proforma.patient_name || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Visit Date</label>
            <p className="text-lg">{formatDate(proforma.visit_date)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Visit Type</label>
            <Badge variant={proforma.visit_type === 'first_visit' ? 'primary' : 'default'}>
              {proforma.visit_type === 'first_visit' ? 'First Visit' : 'Follow Up'}
            </Badge>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Room Number</label>
            <p className="text-lg">{proforma.room_no || 'Not specified'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Doctor</label>
            <p className="text-lg">{proforma.doctor_name || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Created On</label>
            <p className="text-lg">{formatDate(proforma.created_at)}</p>
          </div>
        </div>
      </Card>

      {/* History */}
      <InfoSection
        title="History of Present Illness"
        data={{
          'Onset & Duration': proforma.onset_duration,
          'Course': proforma.course,
          'Precipitating Factor': proforma.precipitating_factor,
          'Illness Duration': proforma.illness_duration,
          'Current Episode Since': proforma.current_episode_since ? formatDate(proforma.current_episode_since) : null,
        }}
      />

      {/* MSE */}
      <InfoSection
        title="Mental State Examination"
        data={{
          'Behaviour': proforma.mse_behaviour,
          'Affect': proforma.mse_affect,
          'Thought': proforma.mse_thought,
          'Delusions': proforma.mse_delusions,
          'Perception': proforma.mse_perception,
          'Cognitive Function': proforma.mse_cognitive_function,
        }}
      />

      {/* Additional History */}
      <InfoSection
        title="Additional History"
        data={{
          'Bio-Functions': proforma.bio_functions,
          'Substance Use': proforma.substance_use,
          'Past History': proforma.past_history,
          'Family History': proforma.family_history,
          'Associated Medical/Surgical': proforma.associated_medical_surgical,
        }}
      />

      {/* Physical Examination */}
      {proforma.gpe && (
        <Card title="General Physical Examination">
          <p className="text-gray-900 whitespace-pre-wrap">{proforma.gpe}</p>
        </Card>
      )}

      {/* Diagnosis & Management */}
      <Card title="Diagnosis & Management">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Diagnosis</label>
              <p className="text-lg font-semibold mt-1">{proforma.diagnosis}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">ICD Code</label>
              <p className="text-lg mt-1">{proforma.icd_code || 'Not specified'}</p>
            </div>
            {/* <div>
              <label className="text-sm font-medium text-gray-500">Case Severity</label>
              <div className="mt-1">
                <Badge variant={proforma.case_severity === 'severe' ? 'danger' : 'warning'}>
                  {proforma.case_severity}
                </Badge>
              </div>
            </div> */}
            <div>
              <label className="text-sm font-medium text-gray-500">Doctor Decision</label>
              <div className="mt-1">
                <Badge variant={proforma.doctor_decision === 'complex_case' ? 'warning' : 'success'}>
                  {proforma.doctor_decision === 'complex_case' ? 'Complex Case' : 'Simple Case'}
                </Badge>
              </div>
            </div>
          </div>

          {proforma.treatment_prescribed && (
            <div>
              <label className="text-sm font-medium text-gray-500">Treatment Prescribed</label>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{proforma.treatment_prescribed}</p>
            </div>
          )}

          {proforma.disposal && (
            <div>
              <label className="text-sm font-medium text-gray-500">Disposal</label>
              <p className="text-gray-900 mt-1">{proforma.disposal}</p>
            </div>
          )}

          {proforma.referred_to && (
            <div>
              <label className="text-sm font-medium text-gray-500">Referred To</label>
              <p className="text-gray-900 mt-1">{proforma.referred_to}</p>
            </div>
          )}
        </div>
      </Card>

      {/* ADL File Requirements */}
      {proforma.requires_adl_file && (
        <Card title="ADL File Requirements">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="warning">Requires ADL File</Badge>
              {isComplexCase && adlFile && (
                <Link to={`/adl-files/${adlFile.id}`}>
                  <Button variant="outline" size="sm">
                    <FiFileText className="mr-2" /> View ADL File Details
                  </Button>
                </Link>
              )}
            </div>
            {proforma.adl_reasoning && (
              <div>
                <label className="text-sm font-medium text-gray-500">Reasoning</label>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">{proforma.adl_reasoning}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Complex Case - Additional Detail Data (from ADL File) */}
      {isComplexCase && adlFile && (
        <>
          <Card title="Complex Case - Additional Details" className="border-2 border-red-200 bg-red-50/30">
            <div className="mb-4 flex items-center gap-2">
              <FiActivity className="w-5 h-5 text-red-600" />
              <Badge variant="danger" className="text-sm font-semibold">
                Complex Case - Data from ADL File
              </Badge>
              <Link to={`/adl-files/${adlFile.id}`}>
                <Button variant="outline" size="sm">
                  <FiFileText className="mr-2" /> View Full ADL File
                </Button>
              </Link>
            </div>

            {adlFileLoading ? (
              <LoadingSpinner className="h-32" />
            ) : (
              <div className="space-y-6">
                {/* History of Present Illness - Expanded */}
                {(adlFile.history_narrative || adlFile.history_specific_enquiry || adlFile.history_drug_intake) && (
                  <InfoSection
                    title="History of Present Illness (Expanded)"
                    data={{
                      'Narrative': adlFile.history_narrative,
                      'Specific Enquiry': adlFile.history_specific_enquiry,
                      'Drug Intake': adlFile.history_drug_intake,
                      'Treatment Place': adlFile.history_treatment_place,
                      'Treatment Dates': adlFile.history_treatment_dates,
                      'Treatment Drugs': adlFile.history_treatment_drugs,
                      'Treatment Response': adlFile.history_treatment_response,
                    }}
                  />
                )}

                {/* Informants */}
                {adlFile.informants && Array.isArray(adlFile.informants) && adlFile.informants.length > 0 && (
                  <Card title="Informants" className="mt-4">
                    <div className="space-y-3">
                      {adlFile.informants.map((informant, index) => (
                        <div key={index} className="p-3 border border-gray-200 rounded">
                          <p className="font-medium">{informant.name || `Informant ${index + 1}`}</p>
                          {informant.relation && <p className="text-sm text-gray-600">Relation: {informant.relation}</p>}
                          {informant.age && <p className="text-sm text-gray-600">Age: {informant.age}</p>}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Past History - Detailed */}
                {(adlFile.past_history_medical || adlFile.past_history_psychiatric_dates || adlFile.past_history_psychiatric_diagnosis) && (
                  <InfoSection
                    title="Past History (Detailed)"
                    data={{
                      'Medical History': adlFile.past_history_medical,
                      'Psychiatric Dates': adlFile.past_history_psychiatric_dates,
                      'Psychiatric Diagnosis': adlFile.past_history_psychiatric_diagnosis,
                      'Psychiatric Treatment': adlFile.past_history_psychiatric_treatment,
                      'Interim Period': adlFile.past_history_psychiatric_interim,
                      'Recovery': adlFile.past_history_psychiatric_recovery,
                    }}
                  />
                )}

                {/* Family History - Detailed */}
                {(adlFile.family_history_father_age || adlFile.family_history_mother_age) && (
                  <InfoSection
                    title="Family History (Detailed)"
                    data={{
                      'Father - Age': adlFile.family_history_father_age,
                      'Father - Education': adlFile.family_history_father_education,
                      'Father - Occupation': adlFile.family_history_father_occupation,
                      'Father - Personality': adlFile.family_history_father_personality,
                      'Father - Deceased': adlFile.family_history_father_deceased ? 'Yes' : 'No',
                      'Mother - Age': adlFile.family_history_mother_age,
                      'Mother - Education': adlFile.family_history_mother_education,
                      'Mother - Occupation': adlFile.family_history_mother_occupation,
                      'Mother - Personality': adlFile.family_history_mother_personality,
                      'Mother - Deceased': adlFile.family_history_mother_deceased ? 'Yes' : 'No',
                    }}
                  />
                )}

                {/* Mental Status Examination - Expanded */}
                {(adlFile.mse_general_demeanour || adlFile.mse_affect_subjective || adlFile.mse_thought_flow) && (
                  <InfoSection
                    title="Mental Status Examination (Expanded)"
                    data={{
                      'General Demeanour': adlFile.mse_general_demeanour,
                      'General Awareness': adlFile.mse_general_awareness,
                      'Affect - Subjective': adlFile.mse_affect_subjective,
                      'Affect - Tone': adlFile.mse_affect_tone,
                      'Thought Flow': adlFile.mse_thought_flow,
                      'Thought Form': adlFile.mse_thought_form,
                      'Thought Content': adlFile.mse_thought_content,
                      'Cognitive - Consciousness': adlFile.mse_cognitive_consciousness,
                      'Insight - Understanding': adlFile.mse_insight_understanding,
                      'Insight - Judgement': adlFile.mse_insight_judgement,
                    }}
                  />
                )}

                {/* Physical Examination - Comprehensive */}
                {(adlFile.physical_appearance || adlFile.physical_pulse || adlFile.physical_bp) && (
                  <InfoSection
                    title="Physical Examination (Comprehensive)"
                    data={{
                      'Appearance': adlFile.physical_appearance,
                      'Body Build': adlFile.physical_body_build,
                      'Pulse': adlFile.physical_pulse,
                      'Blood Pressure': adlFile.physical_bp,
                      'Height': adlFile.physical_height,
                      'Weight': adlFile.physical_weight,
                      'CVS Apex': adlFile.physical_cvs_apex,
                      'CVS Heart Sounds': adlFile.physical_cvs_heart_sounds,
                      'CNS Cranial': adlFile.physical_cns_cranial,
                    }}
                  />
                )}

                {/* Provisional Diagnosis and Treatment Plan */}
                {(adlFile.provisional_diagnosis || adlFile.treatment_plan) && (
                  <Card title="Provisional Diagnosis and Treatment Plan" className="border-2 border-blue-200 bg-blue-50/30">
                    <div className="space-y-4">
                      {adlFile.provisional_diagnosis && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Provisional Diagnosis</label>
                          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{adlFile.provisional_diagnosis}</p>
                        </div>
                      )}
                      {adlFile.treatment_plan && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Treatment Plan</label>
                          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{adlFile.treatment_plan}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Comments of the Consultant */}
                {adlFile.consultant_comments && (
                  <Card title="Comments of the Consultant" className="border-2 border-purple-200 bg-purple-50/30">
                    <p className="text-gray-900 whitespace-pre-wrap">{adlFile.consultant_comments}</p>
                  </Card>
                )}
              </div>
            )}
          </Card>
        </>
      )}

      {/* Patient Documents & Files Preview Section */}
      {patientId && existingFiles && existingFiles.length > 0 && (
        <Card title="Patient Documents & Files" className="mb-6">
          <div className="p-6">
            <FilePreview
              files={existingFiles}
              canDelete={false}
              baseUrl={import.meta.env.VITE_API_URL || 'http://localhost:2025/api'}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default ClinicalProformaDetails;

