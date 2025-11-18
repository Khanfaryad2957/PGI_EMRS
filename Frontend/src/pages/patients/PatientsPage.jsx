import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  FiPlus, FiSearch, FiTrash2, FiEye,  FiEdit, FiUsers, 
   FiDownload,  FiClock, 
  FiHeart, FiFileText, FiShield, FiTrendingUp
} from 'react-icons/fi';
import { useGetAllPatientsQuery, useDeletePatientMutation } from '../../features/patients/patientsApiSlice';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { formatPatientsForExport, exportData } from '../../utils/exportUtils';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Badge from '../../components/Badge';
import { isAdmin, isMWO, isJrSr } from '../../utils/constants';

const PatientsPage = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data, isLoading, isFetching, refetch, error } = useGetAllPatientsQuery({
    page,
    limit,
    search: search.trim() || undefined // Only include search if it has a value
  }, {
    pollingInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnMountOrArgChange: true,
  });
 
  const [deletePatient] = useDeletePatientMutation();
 

  // Handle view patient details
  const handleView = (row) => {
   
    const patientId = row.id
    //  getPatientId(row);
    
    if (!patientId) {
      toast.error('Invalid patient ID. Unable to view patient details.');
      return;
    }

    // Explicitly set edit=false to ensure view mode and clear any persisted edit state
    navigate(`/patients/${patientId}?edit=false`);
  };

  // Handle edit patient
  const handleEdit = (row) => {
    const patientId = row.id
    // getPatientId(row.id);
    
    if (!patientId) {
      toast.error('Invalid patient ID. Unable to edit patient.');
      return;
    }
    
    navigate(`/patients/${patientId}?edit=true`);
  };

  const handleDelete = async (id) => {
    if (!id) {
      toast.error('Invalid patient ID. Cannot delete patient.');
      return;
    }
  
    // No browser confirm — directly attempt delete
    try {
      await deletePatient(id).unwrap();
      toast.success('Patient and all related records deleted successfully');
  
      // RTK Query will automatically refetch when tags are invalidated
      // But we can also explicitly refetch to ensure immediate update
      refetch();
  
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Failed to delete patient');
    }
  };
  

  const handleExport = () => {
    if (!data?.data?.patients || data.data.patients.length === 0) {
      toast.warning('No patient data available to export');
      return;
    }
    
    try {
      // Format all patient data for export
      const formattedData = formatPatientsForExport(data.data.patients);
      
      // Generate filename with current date
      const filename = `patients_export_${new Date().toISOString().split('T')[0]}`;
      
      // Export directly to Excel with blue theme
      exportData(formattedData, filename, 'excel', 'blue');
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export patient data');
    }
  };

  const columns = [
    {
      header: (
        <div className="flex items-center gap-2">
          <FiFileText className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">CR No</span>
        </div>
      ),
      accessor: 'cr_no',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
            <FiFileText className="w-4 h-4 text-blue-600" />
          </div>
          <span className="font-medium text-gray-900">{row.cr_no || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <FiUsers className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">Patient Info</span>
        </div>
      ),
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
              <FiHeart className="w-3 h-3 text-green-600" />
            </div>
            <span className="font-semibold text-gray-900">{row.name}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <FiClock className="w-3 h-3" />
              {row.age} years
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
              {row.sex}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <FiShield className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">Doctor</span>
        </div>
      ),
      render: (row) => (
        row.assigned_doctor_name ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200">
                {row.assigned_doctor_name}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">{row.assigned_doctor_role}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-gray-400 text-sm">Unassigned</span>
          </div>
        )
      ),
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <FiFileText className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">PSY No</span>
        </div>
      ),
      accessor: 'psy_no',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg flex items-center justify-center">
            <FiFileText className="w-4 h-4 text-orange-600" />
          </div>
          <span className="font-medium text-gray-900">{row.psy_no || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <FiTrendingUp className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">Status</span>
        </div>
      ),
      render: (row) => {
        // If patient has ADL file, status should be "complex"
        const isComplex = row.has_adl_file || row.case_complexity === 'complex';
        const statusText = isComplex ? 'complex' : 'simple';
        
        return (
        <div className="space-y-2">
          <Badge 
              variant={isComplex ? 'warning' : 'success'}
            className={`${
                isComplex
                ? 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border-orange-200' 
                : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200'
            }`}
          >
              {statusText}
          </Badge>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              row.has_adl_file ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
            <span className="text-xs text-gray-600">
              ADL: {row.has_adl_file ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
        );
      },
    },
    {
      header: (
        <div className="flex items-center gap-2">
          {/* <FiMoreVertical className="w-4 h-4 text-primary-600" /> */}
          <span className="font-semibold">Actions</span>
        </div>
      ),
      render: (row) => {
        const patientId = row.id
        // getPatientId(row);
        return (
        <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleView(row)}
              className="h-9 w-9 p-0 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              title={`View Details for Patient ID: ${patientId || 'N/A'}`}
            >
              <FiEye className="w-4 h-4 text-blue-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleEdit(row)}
              className="h-9 w-9 p-0 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 hover:border-green-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              title="Edit Patient"
            >
              <FiEdit className="w-4 h-4 text-green-600" />
            </Button>
            {/* Show Delete button only for Admin, not for MWO */}
            {(isAdmin(user?.role) && !isMWO(user?.role)) && patientId && (
              <Button 
                variant="ghost" 
                size="sm"
                className="h-9 w-9 p-0 bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
                title="Delete Patient"
                onClick={() => handleDelete(patientId)}
              >
                <FiTrash2 className="w-4 h-4 text-red-600" />
              </Button>
            )}
        </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        {/* Main Content Card */}
        <Card className="shadow-lg border border-gray-200/50 bg-white/90 backdrop-blur-sm">
          {error && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-red-100 rounded-lg flex-shrink-0">
                  <FiShield className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-red-800 font-semibold text-base mb-1">Error Loading Patients</p>
                  <p className="text-red-600 text-sm">{error?.data?.message || 'Failed to load patients. Please try again.'}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Enhanced Search and Filter Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <Input
                  placeholder="Search by name, CR number, or PSY number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 h-12 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 shadow-sm hover:shadow-md"
                />
              </div>
              {!isMWO(user?.role) && (
                <div className="flex flex-col sm:flex-row gap-3 lg:flex-col xl:flex-row">
                  <Link to="/patients/new">
                    <Button className="bg-gradient-to-r h-12 px-5 from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap">
                      <FiPlus className="mr-2" />
                      Add Patient
                    </Button>
                  </Link>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="h-12 px-5 bg-white border-2 border-primary-200 hover:bg-primary-50 hover:border-primary-300 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleExport}
                  disabled={!data?.data?.patients || data.data.patients.length === 0}
                >
                  <FiDownload className="mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {(isLoading || isFetching) ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FiUsers className="w-8 h-8 text-primary-600" />
                </div>
              </div>
              <p className="mt-6 text-gray-600 font-medium text-lg">Loading patients...</p>
              <p className="mt-2 text-gray-500 text-sm">Please wait while we fetch the data</p>
            </div>
          ) : data?.data?.patients?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                <FiUsers className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-xl font-semibold text-gray-700 mb-2">No patients found</p>
              <p className="text-gray-500 text-center max-w-md">
                {search 
                  ? `No patients match your search "${search}". Try a different search term.`
                  : 'There are no patients in the system yet. Add your first patient to get started.'}
              </p>
              {user?.role !== 'MWO' && !search && (
                <Link to="/patients/new" className="mt-6">
                  <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg">
                    <FiPlus className="mr-2" />
                    Add First Patient
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <Table
                  columns={columns}
                  data={data?.data?.patients || []}
                  loading={isLoading}
                />
              </div>

              {data?.data?.pagination && data.data.pagination.pages > 1 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mt-4">
                  <Pagination
                    currentPage={data.data.pagination.page}
                    totalPages={data.data.pagination.pages}
                    totalItems={data.data.pagination.total}
                    itemsPerPage={limit}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </Card>

      </div>
    </div>
  );
};

export default PatientsPage;

