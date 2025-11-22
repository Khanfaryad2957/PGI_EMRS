import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiSearch, FiEye, FiDownload, FiUpload, FiArchive, 
  FiActivity, FiFileText, FiUsers, FiShield, FiClock, FiTrendingUp,
  FiMoreVertical,  FiCalendar, FiCheckCircle, FiEdit
} from 'react-icons/fi';
import {
  useGetAllADLFilesQuery,
} from '../../features/adl/adlApiSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Badge from '../../components/Badge';
import { formatDate } from '../../utils/formatters';

const ADLFilesPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showOnlyComplexCases, setShowOnlyComplexCases] = useState(true); // Default: only show complex cases
  const limit = 10;

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  // Only fetch complex cases by default (where clinical_proforma_id exists)
  const { data, isLoading, isFetching, refetch, error } = useGetAllADLFilesQuery({ 
    page, 
    limit,
    include_all: !showOnlyComplexCases // If showOnlyComplexCases is true, don't include all
  }, {
    pollingInterval: 30000, // Auto-refresh every 30 seconds for real-time data
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  

 
  // Filter files based on search
  const filteredFiles = data?.data?.files?.filter(file => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    return (
      file.adl_no?.toLowerCase().includes(searchLower) ||
      file.patient_name?.toLowerCase().includes(searchLower) ||
      file.cr_no?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const columns = [
    {
      header: (
        <div className="flex items-center gap-2">
          <FiFileText className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">Out Patient Intake Number</span>
        </div>
      ),
      accessor: 'adl_no',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
            <FiFileText className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <span className="font-mono font-semibold text-gray-900">{row.adl_no}</span>
            {/* {row.clinical_proforma_id && (
              <Badge className="ml-2 bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200 text-xs">
                <FiActivity className="w-3 h-3 mr-1" />
                Complex Case
              </Badge>
            )} */}
          </div>
        </div>
      ),
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <FiUsers className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">Patient</span>
        </div>
      ),
      accessor: 'patient_name',
      // render: (row) => (
      //   <div>
      //     <p className="font-medium text-gray-900">{row.patient_name || 'N/A'}</p>
      //     {row.clinical_proforma_id && (
      //       <p className="text-xs text-primary-600 mt-0.5 flex items-center gap-1">
      //         <FiActivity className="w-3 h-3" />
      //         Complex Case - Full Details Available
      //       </p>
      //     )}
      //   </div>
      // ),
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <FiFileText className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">CR No</span>
        </div>
      ),
      accessor: 'cr_no',
      render: (row) => (
        <span className="font-mono text-gray-700">{row.cr_no || 'N/A'}</span>
      ),
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <FiShield className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">Assigned Doctor</span>
        </div>
      ),
      render: (row) => (
        <div>
          {row.assigned_doctor_name ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                <FiUsers className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">{row.assigned_doctor_name}</p>
                {row.assigned_doctor_role && (
                  <p className="text-xs text-gray-500">{row.assigned_doctor_role}</p>
                )}
              </div>
            </div>
          ) : (
            <span className="text-gray-400 text-sm flex items-center gap-1">
              <FiUsers className="w-4 h-4" />
              Not assigned
            </span>
          )}
        </div>
      ),
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <FiCalendar className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">Created</span>
        </div>
      ),
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-gray-700">{formatDate(row.file_created_date)}</span>
        </div>
      ),
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <FiClock className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">Visit Date</span>
        </div>
      ),
      render: (row) => (
        <div>
          {row.proforma_visit_date ? (
            <span className="text-gray-700">{formatDate(row.proforma_visit_date)}</span>
          ) : (
            <span className="text-gray-400 italic">N/A</span>
          )}
        </div>
      ),
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <FiTrendingUp className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">Total Visits</span>
        </div>
      ),
      accessor: 'total_visits',
      render: (row) => (
        <span className="font-semibold text-gray-900">{row.total_visits || 0}</span>
      ),
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <FiMoreVertical className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">Actions</span>
        </div>
      ),
      render: (row) => (
        <div className="flex gap-2">
          {/* <Link to={`/adl-files/${row.id}/view`}> */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/adl-files/${row.id}/view`)}
              className="h-9 w-9 p-0 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              title="View  Out Patient Intake Record"
            >
              <FiEye className="w-4 h-4 text-blue-600" />
            </Button>
          {/* </Link> */}

          {/* <Link to={`/adl-files/${row.id}/edit`}> */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/adl-files/${row.id}/edit`)}
              className="h-9 w-9 p-0 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 hover:border-green-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              title="Edit Out Patient Intake Record"
            >
              <FiEdit className="w-4 h-4 text-green-600" />
            </Button>
          {/* </Link> */}
          
        </div>
      ),
    },
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
       
        {/* Main Content Card */}
        <Card className="shadow-lg border border-gray-200/50 bg-white/90 backdrop-blur-sm">
          {error && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-red-100 rounded-lg flex-shrink-0">
                  <FiShield className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-red-800 font-semibold text-base mb-1">Error Loading ADL Files</p>
                  <p className="text-red-600 text-sm">{error?.data?.message || 'Failed to load ADL files. Please try again.'}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Enhanced Search Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <Input
                  placeholder={showOnlyComplexCases 
                    ? "Search complex case files by ADL number or patient name..."
                    : "Search by ADL number or patient name..."
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 h-12 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 shadow-sm hover:shadow-md"
                />
              </div>
            </div>
            {showOnlyComplexCases && (
              <div className="mt-3 flex items-center gap-2 text-sm text-primary-600 bg-primary-50 rounded-lg p-3 border border-primary-200">
                <FiActivity className="w-4 h-4 flex-shrink-0" />
                <span>Showing only complex cases with comprehensive patient details stored in ADL schema</span>
              </div>
            )}
          </div>

          {(isLoading || isFetching) ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FiFileText className="w-8 h-8 text-primary-600" />
                </div>
              </div>
              <p className="mt-6 text-gray-600 font-medium text-lg">Loading ADL files...</p>
              <p className="mt-2 text-gray-500 text-sm">Please wait while we fetch the data</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                <FiFileText className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                {showOnlyComplexCases 
                  ? 'No Complex Case ADL Files Found' 
                  : 'No ADL Files Found'
                }
              </p>
              <p className="text-gray-500 text-center max-w-md">
                {search 
                  ? `No files match your search "${search}". Try a different search term.`
                  : showOnlyComplexCases
                    ? 'ADL files will appear here when complex cases are registered in clinical proformas.'
                    : 'No ADL files have been created yet.'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <Table
                  columns={columns}
                  data={filteredFiles}
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

export default ADLFilesPage;

