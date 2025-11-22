import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiUsers, FiFileText, FiFolder, FiClipboard, FiTrendingUp, FiEye, FiEdit, FiUserPlus, FiActivity, FiAlertCircle, FiCheckCircle, FiXCircle, FiCalendar, FiMapPin, FiHeart, FiShield } from 'react-icons/fi';
import { selectCurrentUser } from '../features/auth/authSlice';
import { useGetAllPatientsQuery, useGetPatientsStatsQuery, useGetPatientStatsQuery } from '../features/patients/patientsApiSlice';
import { useGetClinicalStatsQuery, useGetCasesByDecisionQuery, useGetMyProformasQuery, useGetComplexCasesQuery } from '../features/clinical/clinicalApiSlice';
import { useGetADLStatsQuery, useGetFilesByStatusQuery, useGetActiveFilesQuery } from '../features/adl/adlApiSlice';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { isAdmin, isMWO, isJrSr as checkJrSr, isSR, isJR } from '../utils/constants';

// Chart components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StatCard = ({ title, value, icon: Icon, colorClasses, gradientFrom, gradientTo, to }) => (
  <Link to={to} className="block">
    <div className={`group relative bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-xl p-6 border border-white/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">{title}</p>
          <p className="text-4xl font-extrabold text-gray-900 mb-1">{value || 0}</p>
        </div>
        <div className={`p-3 bg-gradient-to-br ${colorClasses} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  </Link>
);

const Dashboard = () => {
  const user = useSelector(selectCurrentUser);
  
  // Only fetch stats if user is Admin
  const isAdminUser = isAdmin(user?.role);
  const { data: patientStats, isLoading: patientsLoading, error: patientsError } = useGetPatientStatsQuery(undefined, {
    pollingInterval: isAdminUser ? 30000 : 0, // Disable polling for non-admin
    refetchOnMountOrArgChange: true,
    skip: !isAdminUser, // Skip query entirely for non-admin
  });
  const { data: clinicalStats, isLoading: clinicalLoading, error: clinicalError } = useGetClinicalStatsQuery(undefined, {
    pollingInterval: isAdminUser ? 30000 : 0,
    refetchOnMountOrArgChange: true,
    skip: !isAdminUser,
  });
  const { data: adlStats, isLoading: adlLoading, error: adlError } = useGetADLStatsQuery(undefined, {
    pollingInterval: isAdminUser ? 30000 : 0,
    refetchOnMountOrArgChange: true,
    skip: !isAdminUser,
  });

  const isLoading = isAdminUser ? (patientsLoading || clinicalLoading || adlLoading) : false;

  // Role-specific stats for JR/SR (Resident/Faculty)
  const isJrSr = checkJrSr(user?.role);
  const isResident = isJR(user?.role);
  const isFaculty = isSR(user?.role);
  // const { data: severityStats } = useGetCasesBySeverityQuery(undefined, { skip: !isJrSr, refetchOnMountOrArgChange: true });
  const { data: decisionStats } = useGetCasesByDecisionQuery(undefined, { skip: !isJrSr, refetchOnMountOrArgChange: true });
  const { data: myProformas } = useGetMyProformasQuery({ page: 1, limit: 10 }, { skip: !isJrSr, refetchOnMountOrArgChange: true });
  const { data: complexCases } = useGetComplexCasesQuery({ page: 1, limit: 5 }, { skip: !isJrSr, refetchOnMountOrArgChange: true });

  // Role-specific stats for MWO
  const isMwo = isMWO(user?.role);
  const { data: outpatientStats } = useGetPatientsStatsQuery(undefined, { skip: !isMwo, refetchOnMountOrArgChange: true });
  const { data: adlByStatus } = useGetFilesByStatusQuery(undefined, { skip: !isMwo, refetchOnMountOrArgChange: true });
  const { data: myRecords } = useGetAllPatientsQuery({ page: 1, limit: 10 }, { skip: !isMwo, refetchOnMountOrArgChange: true });
  
  // ADL files for JR/SR
  const { data: activeADLFiles } = useGetActiveFilesQuery(undefined, { skip: !isJrSr, refetchOnMountOrArgChange: true });

 
  // Helper function removed - using direct array reduce instead

  // Chart data for Patient Gender Distribution
  const genderChartData = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        data: [
          patientStats?.data?.stats?.male_patients || 0,
          patientStats?.data?.stats?.female_patients || 0
        ],
        backgroundColor: ['#3B82F6', '#EC4899'],
        borderColor: ['#1D4ED8', '#BE185D'],
        borderWidth: 2,
      },
    ],
  };

  // Chart data for Clinical Cases Distribution
  const clinicalCasesChartData = {
    labels: ['First Visit', 'Follow Up'],
    datasets: [
      {
        label: 'Visits',
        data: [
          clinicalStats?.data?.stats?.first_visits || 0,
          clinicalStats?.data?.stats?.follow_ups || 0
        ],
        backgroundColor: ['#10B981', '#F59E0B'],
        borderColor: ['#059669', '#D97706'],
        borderWidth: 2,
      },
    ],
  };

  // Chart data for Case Severity Distribution
  // Note: severityStats returns array of { case_severity, count } for JR/SR
  // For admin, use clinicalStats.data.stats which has direct counts
  // const severityStatsArray = severityStats?.data?.severityStats || [];
  // const severityMap = severityStatsArray.reduce((acc, item) => {
  //   acc[item.case_severity] = parseInt(item.count, 10) || 0;
  //   return acc;
  // }, {});
  
  // const severityChartData = {
  //   labels: ['Mild', 'Moderate', 'Severe', 'Critical'],
  //   datasets: [
  //     {
  //       label: 'Cases',
  //       data: [
  //         isAdminUser ? (clinicalStats?.data?.stats?.mild_cases || 0) : (severityMap.mild || 0),
  //         isAdminUser ? (clinicalStats?.data?.stats?.moderate_cases || 0) : (severityMap.moderate || 0),
  //         isAdminUser ? (clinicalStats?.data?.stats?.severe_cases || 0) : (severityMap.severe || 0),
  //         isAdminUser ? (clinicalStats?.data?.stats?.critical_cases || 0) : (severityMap.critical || 0)
  //       ],
  //       backgroundColor: ['#8B5CF6', '#06B6D4', '#EF4444', '#F59E0B'],
  //       borderColor: ['#7C3AED', '#0891B2', '#DC2626', '#D97706'],
  //       borderWidth: 2,
  //     },
  //   ],
  // };

  // Chart data for ADL File Status Distribution
  // Note: adlByStatus returns array of { file_status, count } for MWO
  // For admin, use adlStats.data.stats
  const adlStatusArray = adlByStatus?.data?.statusStats || [];
  const adlStatusMap = adlStatusArray.reduce((acc, item) => {
    acc[item.file_status] = parseInt(item.count, 10) || 0;
    return acc;
  }, {});
  
  const adlStatusChartData = {
    labels: ['Created', 'Stored', 'Retrieved', 'Archived'],
    datasets: [
      {
        data: [
          isAdminUser ? (adlStats?.data?.stats?.created_files || 0) : (adlStatusMap.created || 0),
          isAdminUser ? (adlStats?.data?.stats?.stored_files || 0) : (adlStatusMap.stored || 0),
          isAdminUser ? (adlStats?.data?.stats?.retrieved_files || 0) : (adlStatusMap.retrieved || 0),
          isAdminUser ? (adlStats?.data?.stats?.archived_files || 0) : (adlStatusMap.archived || 0)
        ],
        backgroundColor: ['#EF4444', '#10B981', '#F59E0B', '#6B7280'],
        borderColor: ['#DC2626', '#059669', '#D97706', '#4B5563'],
        borderWidth: 2,
      },
    ],
  };

  // Chart data for Patient Age Distribution (mock data for demonstration)
  const ageChartData = {
    labels: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'],
    datasets: [
      {
        label: 'Number of Patients',
        data: [2, 4, 3, 5, 2, 1], // This would ideally come from API
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(29, 78, 216, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Non-admin role - show JR/SR or MWO focused dashboard
  if (!isAdminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">

          {/* Welcome Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-gray-600 mt-1">
              {isFaculty && 'Faculty Dashboard - Clinical Assessment & Case Management'}
              {isResident && 'Resident Dashboard - Clinical Assessment & Case Management'}
              {isMwo && 'MWO Dashboard - Patient Registration & Management'}
            </p>
          </div>

          {/* Role-based quick KPIs */}
          {isJrSr && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="My Clinical Proformas" 
                value={myProformas?.data?.pagination?.total || 0} 
                icon={FiFileText} 
                colorClasses="from-green-500 to-green-600"
                gradientFrom="from-green-50" 
                gradientTo="to-emerald-100/50" 
                to="/clinical" 
              />
              <StatCard 
                title="Total Cases" 
                value={severityStatsArray.reduce((sum, item) => sum + (parseInt(item.count, 10) || 0), 0) || 0} 
                icon={FiTrendingUp} 
                colorClasses="from-orange-500 to-orange-600"
                gradientFrom="from-orange-50" 
                gradientTo="to-amber-100/50" 
                to="/clinical" 
              />
              <StatCard 
                title="Complex Cases" 
                value={complexCases?.data?.pagination?.total || 0} 
                icon={FiAlertCircle} 
                colorClasses="from-red-500 to-red-600"
                gradientFrom="from-red-50" 
                gradientTo="to-rose-100/50" 
                to="/adl-files" 
              />
              <StatCard 
                title="Active ADL Files" 
                value={activeADLFiles?.data?.files?.length || 0} 
                icon={FiFolder} 
                colorClasses="from-purple-500 to-purple-600"
                gradientFrom="from-purple-50" 
                gradientTo="to-pink-100/50" 
                to="/adl-files" 
              />
            </div>
          )}
          {isMwo && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Total Patient Records" 
                value={outpatientStats?.data?.stats?.total_records || 0} 
                icon={FiClipboard} 
                colorClasses="from-blue-500 to-blue-600"
                gradientFrom="from-blue-50" 
                gradientTo="to-indigo-100/50" 
                to="/patients" 
              />
              <StatCard 
                title="Registered Patients" 
                value={myRecords?.data?.pagination?.total || 0} 
                icon={FiUsers} 
                colorClasses="from-purple-500 to-purple-600"
                gradientFrom="from-purple-50" 
                gradientTo="to-pink-100/50" 
                to="/patients" 
              />
              <StatCard 
                title="Urban Patients" 
                value={outpatientStats?.data?.stats?.urban || 0} 
                icon={FiMapPin} 
                colorClasses="from-green-500 to-green-600"
                gradientFrom="from-green-50" 
                gradientTo="to-emerald-100/50" 
                to="/patients?locality=urban" 
              />
              <StatCard 
                title="Rural Patients" 
                value={outpatientStats?.data?.stats?.rural || 0} 
                icon={FiMapPin} 
                colorClasses="from-orange-500 to-orange-600"
                gradientFrom="from-orange-50" 
                gradientTo="to-amber-100/50" 
                to="/patients?locality=rural" 
              />
            </div>
          )}

          {/* Role-specific charts */}
          {(isJrSr || isMwo) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isJrSr && (
              <>
                <Card 
                  title={
                    <div className="flex items-center gap-2">
                      <FiTrendingUp className="w-5 h-5 text-primary-600" />
                      <span>My Cases by Severity</span>
                    </div>
                  }
                  className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
                >
                  <div className="h-80">
                    <Bar
                      data={{
                        labels: severityStatsArray.map(item => item.case_severity?.charAt(0).toUpperCase() + item.case_severity?.slice(1) || 'Unknown') || [],
                        datasets: [
                          {
                            label: 'Cases',
                            data: severityStatsArray.map(item => parseInt(item.count, 10) || 0) || [],
                            backgroundColor: ['#8B5CF6', '#06B6D4', '#EF4444', '#F59E0B', '#10B981'],
                            borderColor: ['#7C3AED', '#0891B2', '#DC2626', '#D97706', '#059669'],
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        ...barChartOptions,
                        plugins: {
                          ...barChartOptions.plugins,
                          title: { ...barChartOptions.plugins.title, text: 'My Cases by Severity' },
                        },
                      }}
                    />
                  </div>
                </Card>

                <Card 
                  title={
                    <div className="flex items-center gap-2">
                      <FiClipboard className="w-5 h-5 text-primary-600" />
                      <span>My Cases by Decision</span>
                    </div>
                  }
                  className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
                >
                  <div className="h-80">
                    <Doughnut
                      data={{
                        labels: (decisionStats?.data?.decisionStats || []).map(item => {
                          const decision = item.doctor_decision || '';
                          return decision.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Unknown';
                        }),
                        datasets: [
                          {
                            data: (decisionStats?.data?.decisionStats || []).map(item => parseInt(item.count, 10) || 0),
                            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
                            borderColor: ['#1D4ED8', '#059669', '#D97706', '#DC2626', '#7C3AED'],
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          title: { ...chartOptions.plugins.title, text: 'My Cases by Decision' },
                        },
                      }}
                    />
                  </div>
                </Card>
              </>
            )}

            {isMwo && (
              <>
                <Card 
                  title={
                    <div className="flex items-center gap-2">
                      <FiUsers className="w-5 h-5 text-primary-600" />
                      <span>Patient Records by Marital Status</span>
                    </div>
                  }
                  className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
                >
                  <div className="h-80">
                    <Doughnut
                      data={{
                        labels: ['Married', 'Unmarried', 'Widow/Widower', 'Divorced', 'Other'],
                        datasets: [
                          {
                            data: [
                              outpatientStats?.data?.stats?.married || 0,
                              outpatientStats?.data?.stats?.unmarried || 0,
                              outpatientStats?.data?.stats?.widow_widower || 0,
                              outpatientStats?.data?.stats?.divorced || 0,
                              outpatientStats?.data?.stats?.other_marital || 0,
                            ],
                            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
                            borderColor: ['#1D4ED8', '#059669', '#D97706', '#DC2626', '#7C3AED'],
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          title: { ...chartOptions.plugins.title, text: 'Records by Marital Status' },
                        },
                      }}
                    />
                  </div>
                </Card>

                <Card 
                  title={
                    <div className="flex items-center gap-2">
                      <FiTrendingUp className="w-5 h-5 text-primary-600" />
                      <span>Records by Locality</span>
                    </div>
                  }
                  className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
                >
                  <div className="h-80">
                    <Bar
                      data={{
                        labels: ['Urban', 'Rural'],
                        datasets: [
                          {
                            label: 'Records',
                            data: [
                              outpatientStats?.data?.stats?.urban || 0,
                              outpatientStats?.data?.stats?.rural || 0,
                            ],
                            backgroundColor: ['#3B82F6', '#10B981'],
                            borderColor: ['#1D4ED8', '#059669'],
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        ...barChartOptions,
                        plugins: {
                          ...barChartOptions.plugins,
                          title: { ...barChartOptions.plugins.title, text: 'Urban vs Rural Distribution' },
                        },
                      }}
                    />
                  </div>
                </Card>
              </>
              )}
            </div>
          )}

          {/* MWO Recent Records Table with CRUD */}
          {isMwo && (myRecords?.data?.records || myRecords?.data?.patients) && (myRecords.data.records || myRecords.data.patients || []).length > 0 && (
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <FiFileText className="w-5 h-5 text-primary-600" />
                  <span>My Recent Patient Records</span>
                </div>
              }
              actions={
                <Link to="/patients">
                  <Button variant="outline" size="sm" className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200">
                    View All
                  </Button>
                </Link>
              }
            >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CR No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marital Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Locality
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(myRecords.data.records || myRecords.data.patients || []).slice(0, 5).map((record) => (
                    <tr key={record.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.name || record.patient_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.cr_no || record.mr_no || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.marital_status || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Badge variant={record.locality === 'Urban' ? 'info' : 'success'}>
                          {record.locality || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link to={`/patients/${record.id}?edit=false`}>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-9 w-9 p-0 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4 text-blue-600" />
                            </Button>
                          </Link>
                          <Link to={`/patients/${record.id}?edit=true`}>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-9 w-9 p-0 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 hover:border-green-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
                              title="Edit Patient"
                            >
                              <FiEdit className="w-4 h-4 text-green-600" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

          {/* MWO Quick Actions */}
          {isMwo && (
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <FiActivity className="w-5 h-5 text-primary-600" />
                  <span>Quick Actions</span>
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/patients/new"
                  className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 text-center group shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col items-center">
                    <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 group-hover:scale-110 transition-transform duration-200 mb-3 shadow-lg">
                      <FiUserPlus className="h-8 w-8 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900">Register New Patient</p>
                    <p className="text-sm text-gray-500 mt-1">Create new patient record</p>
                  </div>
                </Link>

                <Link
                  to="/patients"
                  className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all duration-200 text-center group shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col items-center">
                    <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-green-600 group-hover:scale-110 transition-transform duration-200 mb-3 shadow-lg">
                      <FiClipboard className="h-8 w-8 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900">Browse Patients</p>
                    <p className="text-sm text-gray-500 mt-1">View all patient records</p>
                  </div>
                </Link>

                <Link
                  to="/patients"
                  className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all duration-200 text-center group shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col items-center">
                    <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 group-hover:scale-110 transition-transform duration-200 mb-3 shadow-lg">
                      <FiUsers className="h-8 w-8 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900">Patient Management</p>
                    <p className="text-sm text-gray-500 mt-1">Manage patient information</p>
                  </div>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">

        {(patientsError || clinicalError || adlError) && (
          <Card className="border-red-200 bg-red-50/50">
            <div className="p-4 text-sm text-red-600">
              {patientsError && <div className="flex items-center gap-2"><FiActivity className="w-4 h-4" />Failed to load patient stats.</div>}
              {clinicalError && <div className="flex items-center gap-2"><FiActivity className="w-4 h-4" />Failed to load clinical stats.</div>}
              {adlError && <div className="flex items-center gap-2"><FiActivity className="w-4 h-4" />Failed to load ADL stats.</div>}
            </div>
          </Card>
        )}

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Patients"
            value={patientStats?.data?.stats?.total_patients || 0}
            icon={FiUsers}
            colorClasses="from-blue-500 to-blue-600"
            gradientFrom="from-blue-50"
            gradientTo="to-indigo-100/50"
            to="/patients"
          />
          
          <StatCard
            title="Walk-in Clinical Proforma"
            value={clinicalStats?.data?.stats?.total_proformas || 0}
            icon={FiFileText}
            colorClasses="from-green-500 to-green-600"
            gradientFrom="from-green-50"
            gradientTo="to-emerald-100/50"
            to="/clinical"
          />
          
          <StatCard
            title="Outpatient Intake Records"
            value={adlStats?.data?.stats?.total_files || 0}
            icon={FiFolder}
            colorClasses="from-purple-500 to-purple-600"
            gradientFrom="from-purple-50"
            gradientTo="to-pink-100/50"
            to="/adl-files"
          />
          
          <StatCard
            title="Complex Cases"
            value={clinicalStats?.data?.stats?.complex_cases || 0}
            icon={FiTrendingUp}
            colorClasses="from-orange-500 to-orange-600"
            gradientFrom="from-orange-50"
            gradientTo="to-amber-100/50"
            to="/adl-files"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Gender Distribution */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <FiUsers className="w-5 h-5 text-primary-600" />
                <span>Patient Gender Distribution</span>
              </div>
            }
            className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
          >
          <div className="h-80">
            <Doughnut 
              data={genderChartData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'Patient Gender Distribution'
                  }
                }
              }} 
            />
          </div>
        </Card>

          {/* Clinical Cases Distribution */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <FiFileText className="w-5 h-5 text-primary-600" />
                <span>Visit Type Distribution</span>
              </div>
            }
            className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
          >
          <div className="h-80">
            <Bar 
              data={clinicalCasesChartData} 
              options={{
                ...barChartOptions,
                plugins: {
                  ...barChartOptions.plugins,
                  title: {
                    ...barChartOptions.plugins.title,
                    text: 'Visit Type Distribution'
                  }
                }
              }} 
            />
          </div>
        </Card>

          {/* Case Severity Distribution */}
          {/* <Card 
            title={
              <div className="flex items-center gap-2">
                <FiTrendingUp className="w-5 h-5 text-primary-600" />
                <span>Case Severity Distribution</span>
              </div>
            }
            className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
          >
          <div className="h-80">
            <Bar 
              data={severityChartData} 
              options={{
                ...barChartOptions,
                plugins: {
                  ...barChartOptions.plugins,
                  title: {
                    ...barChartOptions.plugins.title,
                    text: 'Case Severity Distribution'
                  }
                }
              }} 
            />
          </div>
        </Card> */}

          {/* ADL File Status Distribution */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <FiFolder className="w-5 h-5 text-primary-600" />
                <span>ADL File Status Distribution</span>
              </div>
            }
            className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
          >
          <div className="h-80">
            <Doughnut 
              data={adlStatusChartData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'ADL File Status Distribution'
                  }
                }
              }} 
            />
            </div>
          </Card>
        </div>

        {/* Patient Age Distribution */}
        <Card 
          title={
            <div className="flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-primary-600" />
              <span>Patient Age Distribution</span>
            </div>
          }
          className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
        >
        <div className="h-96">
          <Line 
            data={ageChartData} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'Patient Age Distribution'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1
                  }
                }
              }
            }} 
          />
        </div>
        </Card>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card 
            title={
              <div className="flex items-center gap-2">
                <FiUsers className="w-5 h-5 text-primary-600" />
                <span>Patient Statistics</span>
              </div>
            }
            className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
          >
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Male Patients</span>
              <Badge variant="info">{patientStats?.data?.stats?.male_patients || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Female Patients</span>
              <Badge variant="info">{patientStats?.data?.stats?.female_patients || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Other Patients</span>
              <Badge variant="info">{patientStats?.data?.stats?.other_patients || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Outpatient Intake Records</span>
              <Badge variant="success">{patientStats?.data?.stats?.patients_with_adl || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Complex Cases</span>
              <Badge variant="warning">{patientStats?.data?.stats?.complex_cases || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Simple Cases</span>
              <Badge variant="info">{patientStats?.data?.stats?.simple_cases || 0}</Badge>
            </div>
            </div>
          </Card>

          <Card 
            title={
              <div className="flex items-center gap-2">
                <FiFileText className="w-5 h-5 text-primary-600" />
                <span>Clinical Statistics</span>
              </div>
            }
            className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
          >
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">First Visits</span>
              <Badge>{clinicalStats?.data?.stats?.first_visits || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Follow-ups</span>
              <Badge variant="success">{clinicalStats?.data?.stats?.follow_ups || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Simple Cases</span>
              <Badge variant="info">{clinicalStats?.data?.stats?.simple_cases || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cases Requiring ADL</span>
              <Badge variant="warning">{clinicalStats?.data?.stats?.cases_requiring_adl || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Mild Cases</span>
              <Badge variant="info">{clinicalStats?.data?.stats?.mild_cases || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Moderate Cases</span>
              <Badge variant="warning">{clinicalStats?.data?.stats?.moderate_cases || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Severe Cases</span>
              <Badge variant="error">{clinicalStats?.data?.stats?.severe_cases || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Critical Cases</span>
              <Badge variant="error">{clinicalStats?.data?.stats?.critical_cases || 0}</Badge>
            </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;