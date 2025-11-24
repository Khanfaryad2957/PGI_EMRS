import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiFileText, FiFolder, FiClipboard, FiTrendingUp, FiEye, FiEdit, 
  FiUserPlus, FiActivity, FiAlertCircle, FiCheckCircle, FiXCircle, FiCalendar, 
  FiMapPin, FiHeart, FiShield, FiPackage, FiUpload, FiBarChart2, FiPieChart,
  FiArrowRight, FiClock, FiBell, FiSettings, FiRefreshCw, FiDownload,
  FiUser, FiBriefcase, FiHome, FiDollarSign, FiGlobe, FiLayers
} from 'react-icons/fi';
import { selectCurrentUser, selectIsAuthenticated } from '../features/auth/authSlice';
import { 
  useGetAllPatientsQuery, 
  useGetPatientsStatsQuery, 
  useGetPatientStatsQuery,
  useGetAgeDistributionQuery
} from '../features/patients/patientsApiSlice';
import { 
  useGetClinicalStatsQuery, 
  useGetCasesByDecisionQuery, 
  useGetMyProformasQuery, 
  useGetComplexCasesQuery,
  useGetAllClinicalProformasQuery,
  useGetVisitTrendsQuery
} from '../features/clinical/clinicalApiSlice';
import { 
  useGetADLStatsQuery, 
  useGetFilesByStatusQuery, 
  useGetActiveFilesQuery,
  useGetAllADLFilesQuery
} from '../features/adl/adlApiSlice';
import { useGetAllPrescriptionQuery } from '../features/prescriptions/prescriptionApiSlice';
import { useGetPatientFilesQuery, useGetFileStatsQuery } from '../features/patients/patientFilesApiSlice';
import { useGetDoctorsQuery, useGetUserStatsQuery } from '../features/users/usersApiSlice';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { isAdmin, isMWO, isJrSr, isSR, isJR } from '../utils/constants';
import { formatDate, formatDateTime } from '../utils/formatters';

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

// Enhanced Stat Card Component with animations
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  colorClasses, 
  gradientFrom, 
  gradientTo, 
  to,
  subtitle,
  trend,
  isLoading = false
}) => {
  const content = (
    <div className={`group relative backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/80 ${isLoading ? 'animate-pulse' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">{title}</p>
          <p className="text-4xl font-extrabold text-gray-900 mb-1">{isLoading ? '...' : (value || 0)}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <FiTrendingUp className={`w-4 h-4 ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-400'}`} />
              <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 backdrop-blur-md bg-gradient-to-br ${colorClasses} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 border border-white/30`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );

  if (to) {
    return <Link to={to} className="block">{content}</Link>;
  }
  return content;
};

// Quick Action Card Component
const QuickActionCard = ({ icon: Icon, title, description, to, colorClasses, onClick }) => {
  const content = (
    <div 
      className={`p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-opacity-100 hover:bg-gradient-to-br ${colorClasses} transition-all duration-200 text-center group shadow-sm hover:shadow-md cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center">
        <div className={`p-3 rounded-full bg-gradient-to-br ${colorClasses.replace('hover:from-', 'from-').replace('hover:to-', 'to-').replace('50', '500').replace('50', '600')} group-hover:scale-110 transition-transform duration-200 mb-3 shadow-lg`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }
  return content;
};

// Activity Item Component
const ActivityItem = ({ icon: Icon, title, description, time, status, color }) => (
  <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/40 hover:bg-white/70 transition-all duration-200">
    <div className={`p-2 rounded-lg bg-gradient-to-br ${color} shadow-md`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
      <div className="flex items-center gap-2 mt-2">
        <FiClock className="w-3 h-3 text-gray-400" />
        <span className="text-xs text-gray-500">{time}</span>
        {status && (
          <Badge 
            variant={status === 'completed' ? 'success' : status === 'pending' ? 'warning' : 'info'}
            className="ml-auto"
          >
            {status}
          </Badge>
        )}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // day, week, month
  
  // Role detection
  const isAdminUser = isAdmin(user?.role);
  const isMwo = isMWO(user?.role);
  const isResident = isJR(user?.role);
  const isFaculty = isSR(user?.role);
  const isJrSrUser = isJrSr(user?.role);
  
  // Don't make any queries if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Admin Stats - Full System Analytics
  const { data: patientStats, isLoading: patientsLoading } = useGetPatientStatsQuery(undefined, {
    skip: !isAdminUser,
    pollingInterval: isAdminUser ? 30000 : 0,
    refetchOnMountOrArgChange: true,
  });

  const { data: clinicalStats, isLoading: clinicalLoading } = useGetClinicalStatsQuery(undefined, {
    skip: !isAdminUser,
    pollingInterval: isAdminUser ? 30000 : 0,
    refetchOnMountOrArgChange: true,
  });

  const { data: adlStats, isLoading: adlLoading } = useGetADLStatsQuery(undefined, {
    skip: !isAdminUser,
    pollingInterval: isAdminUser ? 30000 : 0,
    refetchOnMountOrArgChange: true,
  });

  const { data: userStats } = useGetUserStatsQuery(undefined, {
    skip: !isAdminUser,
    refetchOnMountOrArgChange: true,
  });

  // File stats available for all roles (backend will filter if needed)
  const { data: fileStats } = useGetFileStatsQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  // Role-specific stats for Faculty/Resident
  const { data: decisionStats } = useGetCasesByDecisionQuery(
    isJrSrUser ? { user_id: user?.id } : undefined, 
    { 
      skip: !isAuthenticated || !isJrSrUser, 
      refetchOnMountOrArgChange: true 
    }
  );

  // Visit trends for all roles
  const { data: visitTrends } = useGetVisitTrendsQuery(
    { period: selectedPeriod, ...(isJrSrUser ? { user_id: user?.id } : {}) },
    { 
      skip: !isAuthenticated,
      refetchOnMountOrArgChange: true 
    }
  );

  // Age distribution for admin
  const { data: ageDistribution } = useGetAgeDistributionQuery(undefined, {
    skip: !isAdminUser,
    refetchOnMountOrArgChange: true,
  });

  const { data: myProformas } = useGetMyProformasQuery({ page: 1, limit: 10 }, { 
    skip: !isJrSrUser, 
    refetchOnMountOrArgChange: true 
  });

  const { data: complexCases } = useGetComplexCasesQuery({ page: 1, limit: 5 }, { 
    skip: !isJrSrUser, 
    refetchOnMountOrArgChange: true 
  });

  const { data: activeADLFiles } = useGetActiveFilesQuery(undefined, { 
    skip: !isJrSrUser, 
    refetchOnMountOrArgChange: true 
  });

  // Role-specific stats for MWO
  const { data: outpatientStats } = useGetPatientsStatsQuery(undefined, { 
    skip: !isMwo, 
    refetchOnMountOrArgChange: true 
  });

  const { data: adlByStatus } = useGetFilesByStatusQuery(undefined, { 
    skip: !isMwo, 
    refetchOnMountOrArgChange: true 
  });

  const { data: myRecords } = useGetAllPatientsQuery({ page: 1, limit: 10 }, { 
    skip: !isMwo, 
    refetchOnMountOrArgChange: true 
  });

  // Get recent prescriptions for all roles
  const { data: recentPrescriptions } = useGetAllPrescriptionQuery({ 
    page: 1, 
    limit: 5 
  }, { 
    refetchOnMountOrArgChange: true 
  });

  // Get recent ADL files
  const { data: recentADLFiles } = useGetAllADLFilesQuery({ 
    page: 1, 
    limit: 5 
  }, { 
    refetchOnMountOrArgChange: true 
  });

  // Get recent clinical proformas
  const { data: recentClinicalProformas } = useGetAllClinicalProformasQuery({ 
    page: 1, 
    limit: 5 
  }, { 
    refetchOnMountOrArgChange: true 
  });

  // Calculate total staff from user stats
  const totalStaff = useMemo(() => {
    if (!userStats?.data?.stats || !Array.isArray(userStats.data.stats)) return 0;
    return userStats.data.stats.reduce((sum, item) => {
      // Count Faculty (SR) and Residents (JR) as staff
      if (item.role === 'SR' || item.role === 'JR') {
        return sum + (parseInt(item.count, 10) || 0);
      }
      return sum;
    }, 0);
  }, [userStats]);

  const isLoading = isAdminUser ? (patientsLoading || clinicalLoading || adlLoading) : false;

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
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

  // Chart data preparation
  const genderChartData = {
    labels: ['Male', 'Female', 'Other'],
    datasets: [{
      data: [
        patientStats?.data?.stats?.male_patients || 0,
        patientStats?.data?.stats?.female_patients || 0,
        patientStats?.data?.stats?.other_patients || 0
      ],
      backgroundColor: ['#3B82F6', '#EC4899', '#8B5CF6'],
      borderColor: ['#1D4ED8', '#BE185D', '#7C3AED'],
      borderWidth: 2,
    }],
  };

  const visitTypeChartData = {
    labels: ['First Visit', 'Follow-up'],
    datasets: [{
      label: 'Visits',
      data: [
        clinicalStats?.data?.stats?.first_visits || 0,
        clinicalStats?.data?.stats?.follow_ups || 0
      ],
      backgroundColor: ['#10B981', '#F59E0B'],
      borderColor: ['#059669', '#D97706'],
      borderWidth: 2,
    }],
  };

  const adlStatusArray = adlByStatus?.data?.statusStats || [];
  const adlStatusMap = adlStatusArray.reduce((acc, item) => {
    acc[item.file_status] = parseInt(item.count, 10) || 0;
    return acc;
  }, {});

  const adlStatusChartData = {
    labels: ['Active', 'Stored', 'Retrieved', 'Archived'],
    datasets: [{
      data: [
        isAdminUser ? (adlStats?.data?.stats?.created_files || 0) : (adlStatusMap.active || 0),
        isAdminUser ? (adlStats?.data?.stats?.stored_files || 0) : (adlStatusMap.stored || 0),
        isAdminUser ? (adlStats?.data?.stats?.retrieved_files || 0) : (adlStatusMap.retrieved || 0),
        isAdminUser ? (adlStats?.data?.stats?.archived_files || 0) : (adlStatusMap.archived || 0)
      ],
      backgroundColor: ['#EF4444', '#10B981', '#F59E0B', '#6B7280'],
      borderColor: ['#DC2626', '#059669', '#D97706', '#4B5563'],
      borderWidth: 2,
    }],
  };

  // Patient visit trend data from API
  const visitTrendData = useMemo(() => {
    if (!visitTrends?.data?.trends || visitTrends.data.trends.length === 0) {
      return {
        labels: selectedPeriod === 'day' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] :
                selectedPeriod === 'week' ? ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'] :
                ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Patient Visits',
          data: [],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        }],
      };
    }

    const trends = visitTrends.data.trends;
    let labels = [];
    let data = [];

    if (selectedPeriod === 'day') {
      // Format dates for last 7 days
      labels = trends.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      });
      data = trends.map(item => parseInt(item.count, 10) || 0);
    } else if (selectedPeriod === 'week') {
      // Format weeks
      labels = trends.map((item, idx) => {
        const weekStart = new Date(item.week_start);
        return `Week ${idx + 1}`;
      });
      data = trends.map(item => parseInt(item.count, 10) || 0);
    } else {
      // Format months
      labels = trends.map(item => {
        const monthStart = new Date(item.month_start);
        return monthStart.toLocaleDateString('en-US', { month: 'short' });
      });
      data = trends.map(item => parseInt(item.count, 10) || 0);
    }

    return {
      labels,
      datasets: [{
        label: 'Patient Visits',
        data,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      }],
    };
  }, [visitTrends, selectedPeriod]);

  // Age distribution chart data
  const ageChartData = useMemo(() => {
    if (!ageDistribution?.data?.distribution || ageDistribution.data.distribution.length === 0) {
      return {
        labels: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'],
        datasets: [{
          label: 'Number of Patients',
          data: [0, 0, 0, 0, 0, 0],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(29, 78, 216, 1)',
          borderWidth: 1,
        }],
      };
    }

    const distribution = ageDistribution.data.distribution;
    const labels = distribution.map(item => item.age_group);
    const data = distribution.map(item => parseInt(item.count, 10) || 0);

    return {
      labels,
      datasets: [{
        label: 'Number of Patients',
        data,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(29, 78, 216, 1)',
        borderWidth: 1,
      }],
    };
  }, [ageDistribution]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ==================== ADMIN DASHBOARD ====================
  if (isAdminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
          {/* Welcome Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name || 'Admin'}! 👑
              </h1>
              <p className="text-gray-600 mt-1">System Administrator Dashboard - Full System Analytics</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-white/70 backdrop-blur-md border border-white/40 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Admin KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Patients"
              value={patientStats?.data?.stats?.total_patients || 0}
              icon={FiUsers}
              colorClasses="from-blue-500 to-blue-600"
              to="/patients"
              subtitle="Registered patients"
            />
            <StatCard
              title="Clinical Proformas"
              value={clinicalStats?.data?.stats?.total_proformas || 0}
              icon={FiFileText}
              colorClasses="from-green-500 to-green-600"
              to="/clinical"
              subtitle="Walk-in assessments"
            />
            <StatCard
              title="ADL Files"
              value={adlStats?.data?.stats?.total_files || 0}
              icon={FiFolder}
              colorClasses="from-purple-500 to-purple-600"
              to="/adl-files"
              subtitle="Outpatient intake records"
            />
            <StatCard
              title="Total Staff"
              value={totalStaff}
              icon={FiBriefcase}
              colorClasses="from-orange-500 to-orange-600"
              subtitle="Faculty + Residents"
            />
          </div>

          {/* Secondary Admin KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Complex Cases"
              value={clinicalStats?.data?.stats?.complex_cases || 0}
              icon={FiAlertCircle}
              colorClasses="from-red-500 to-red-600"
              to="/adl-files"
              subtitle="Requiring attention"
            />
            <StatCard
              title="First Visits"
              value={clinicalStats?.data?.stats?.first_visits || 0}
              icon={FiCalendar}
              colorClasses="from-indigo-500 to-indigo-600"
              subtitle="New patient visits"
            />
            <StatCard
              title="Follow-ups"
              value={clinicalStats?.data?.stats?.follow_ups || 0}
              icon={FiActivity}
              colorClasses="from-teal-500 to-teal-600"
              subtitle="Return visits"
            />
            <StatCard
              title="Files Uploaded"
              value={fileStats?.data?.stats?.total_files || 0}
              icon={FiUpload}
              colorClasses="from-pink-500 to-pink-600"
              subtitle={`${fileStats?.data?.stats?.files_this_month || 0} this month`}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Gender Distribution */}
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <FiPieChart className="w-5 h-5 text-primary-600" />
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

            {/* Visit Type Distribution */}
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <FiBarChart2 className="w-5 h-5 text-primary-600" />
                  <span>Visit Type Distribution</span>
                </div>
              }
              className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
            >
              <div className="h-80">
                <Bar 
                  data={visitTypeChartData} 
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

            {/* ADL File Status */}
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

            {/* Patient Visit Trend */}
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <FiTrendingUp className="w-5 h-5 text-primary-600" />
                  <span>Weekly Visit Trend</span>
                </div>
              }
              className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
            >
              <div className="h-80">
                <Line 
                  data={visitTrendData} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: 'Weekly Patient Visit Trend'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }} 
                />
              </div>
            </Card>
          </div>

          {/* Recent Activity & Quick Actions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <FiActivity className="w-5 h-5 text-primary-600" />
                  <span>Recent Activity</span>
                </div>
              }
              className="lg:col-span-2 bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
            >
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(!recentClinicalProformas?.data?.proformas?.length && 
                  !recentADLFiles?.data?.files?.length && 
                  !recentPrescriptions?.data?.prescriptions?.length) ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <FiActivity className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                ) : (
                  <>
                    {recentClinicalProformas?.data?.proformas?.slice(0, 5).map((proforma, idx) => (
                      <ActivityItem
                        key={proforma.id || idx}
                        icon={FiFileText}
                        title={`Clinical Proforma Created`}
                        description={`Patient: ${proforma.patient_name || 'N/A'} - Visit: ${proforma.visit_type === 'first_visit' ? 'First Visit' : 'Follow-up'}`}
                        time={proforma.created_at ? formatDateTime(proforma.created_at) : 'N/A'}
                        status={proforma.doctor_decision === 'complex_case' ? 'complex' : 'simple'}
                        color="from-green-500 to-green-600"
                      />
                    ))}
                    {recentADLFiles?.data?.files?.slice(0, 3).map((file, idx) => (
                      <ActivityItem
                        key={file.id || idx}
                        icon={FiFolder}
                        title={`ADL File ${file.file_status || 'Created'}`}
                        description={`Patient: ${file.patient_name || 'N/A'} - ADL No: ${file.adl_no || 'N/A'}`}
                        time={file.created_at ? formatDateTime(file.created_at) : 'N/A'}
                        status={file.file_status}
                        color="from-purple-500 to-purple-600"
                      />
                    ))}
                    {recentPrescriptions?.data?.prescriptions?.slice(0, 2).map((prescription, idx) => (
                      <ActivityItem
                        key={prescription.id || idx}
                        icon={FiPackage}
                        title={`Prescription Created`}
                        description={`Medicine: ${prescription.medicine || 'N/A'}`}
                        time={prescription.created_at ? formatDateTime(prescription.created_at) : 'N/A'}
                        status="completed"
                        color="from-blue-500 to-blue-600"
                      />
                    ))}
                  </>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <FiSettings className="w-5 h-5 text-primary-600" />
                  <span>Quick Actions</span>
                </div>
              }
              className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
            >
              <div className="space-y-3">
                <QuickActionCard
                  icon={FiUserPlus}
                  title="Create Patient"
                  description="Register new patient"
                  to="/patients/new"
                  colorClasses="hover:from-blue-50 hover:to-indigo-50"
                />
                <QuickActionCard
                  icon={FiFileText}
                  title="Create Proforma"
                  description="New clinical assessment"
                  to="/clinical-proforma/create"
                  colorClasses="hover:from-green-50 hover:to-emerald-50"
                />
                <QuickActionCard
                  icon={FiFolder}
                  title="Create ADL"
                  description="New intake record"
                  to="/adl-files/new"
                  colorClasses="hover:from-purple-50 hover:to-pink-50"
                />
                <QuickActionCard
                  icon={FiUsers}
                  title="Manage Users"
                  description="View all staff"
                  to="/users"
                  colorClasses="hover:from-orange-50 hover:to-amber-50"
                />
                <QuickActionCard
                  icon={FiBarChart2}
                  title="View Reports"
                  description="Analytics & insights"
                  to="/reports"
                  colorClasses="hover:from-teal-50 hover:to-cyan-50"
                />
              </div>
            </Card>
          </div>

          {/* Detailed Statistics */}
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
                <div className="flex justify-between items-center p-3 bg-blue-50/50 rounded-lg">
                  <span className="text-gray-700 font-medium">Male Patients</span>
                  <Badge variant="info">{patientStats?.data?.stats?.male_patients || 0}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-pink-50/50 rounded-lg">
                  <span className="text-gray-700 font-medium">Female Patients</span>
                  <Badge variant="info">{patientStats?.data?.stats?.female_patients || 0}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50/50 rounded-lg">
                  <span className="text-gray-700 font-medium">Complex Cases</span>
                  <Badge variant="warning">{patientStats?.data?.stats?.complex_cases || 0}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50/50 rounded-lg">
                  <span className="text-gray-700 font-medium">Patients with ADL</span>
                  <Badge variant="success">{patientStats?.data?.stats?.patients_with_adl || 0}</Badge>
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
                <div className="flex justify-between items-center p-3 bg-green-50/50 rounded-lg">
                  <span className="text-gray-700 font-medium">Simple Cases</span>
                  <Badge variant="info">{clinicalStats?.data?.stats?.simple_cases || 0}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50/50 rounded-lg">
                  <span className="text-gray-700 font-medium">Severe Cases</span>
                  <Badge variant="error">{clinicalStats?.data?.stats?.severe_cases || 0}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50/50 rounded-lg">
                  <span className="text-gray-700 font-medium">Cases Requiring ADL</span>
                  <Badge variant="warning">{clinicalStats?.data?.stats?.cases_requiring_adl || 0}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50/50 rounded-lg">
                  <span className="text-gray-700 font-medium">Moderate Cases</span>
                  <Badge variant="warning">{clinicalStats?.data?.stats?.moderate_cases || 0}</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ==================== FACULTY DASHBOARD ====================
  if (isFaculty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
          {/* Welcome Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || 'Faculty'}! 🎓
            </h1>
            <p className="text-gray-600 mt-1">Faculty Dashboard - Clinical Assessment & Case Management</p>
          </div>

          {/* Faculty KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="My Clinical Proformas" 
              value={myProformas?.data?.pagination?.total || 0} 
              icon={FiFileText} 
              colorClasses="from-green-500 to-green-600"
              to="/clinical"
              subtitle="Total assessments"
            />
            <StatCard 
              title="Complex Cases" 
              value={complexCases?.data?.pagination?.total || 0} 
              icon={FiAlertCircle} 
              colorClasses="from-red-500 to-red-600"
              to="/adl-files"
              subtitle="Requiring attention"
            />
            <StatCard 
              title="Active ADL Files" 
              value={activeADLFiles?.data?.files?.length || 0} 
              icon={FiFolder} 
              colorClasses="from-purple-500 to-purple-600"
              to="/adl-files"
              subtitle="In progress"
            />
            <StatCard 
              title="Prescriptions Given" 
              value={recentPrescriptions?.data?.pagination?.total || 0} 
              icon={FiPackage} 
              colorClasses="from-blue-500 to-blue-600"
              subtitle="Total prescriptions"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <FiPieChart className="w-5 h-5 text-primary-600" />
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
                    datasets: [{
                      data: (decisionStats?.data?.decisionStats || []).map(item => parseInt(item.count, 10) || 0),
                      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
                      borderColor: ['#1D4ED8', '#059669', '#D97706', '#DC2626', '#7C3AED'],
                      borderWidth: 2,
                    }],
                  }}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: 'My Cases by Decision'
                      }
                    }
                  }}
                />
              </div>
            </Card>

            <Card 
              title={
                <div className="flex items-center gap-2">
                  <FiTrendingUp className="w-5 h-5 text-primary-600" />
                  <span>Daily Consultation Trend</span>
                </div>
              }
              className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
            >
              <div className="h-80">
                <Line 
                  data={visitTrendData} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: 'Daily Consultation Trend'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }} 
                />
              </div>
            </Card>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <FiActivity className="w-5 h-5 text-primary-600" />
                  <span>Recent Activity</span>
                </div>
              }
              className="lg:col-span-2 bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
            >
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {!myProformas?.data?.proformas?.length ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <FiActivity className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                ) : (
                  myProformas?.data?.proformas?.slice(0, 5).map((proforma, idx) => (
                    <ActivityItem
                      key={proforma.id || idx}
                      icon={FiFileText}
                      title={`Clinical Proforma: ${proforma.visit_type === 'first_visit' ? 'First Visit' : 'Follow-up'}`}
                      description={`Patient: ${proforma.patient_name || 'N/A'} - ${proforma.doctor_decision === 'complex_case' ? 'Complex Case' : 'Simple Case'}`}
                      time={proforma.created_at ? formatDateTime(proforma.created_at) : 'N/A'}
                      status={proforma.doctor_decision === 'complex_case' ? 'complex' : 'simple'}
                      color="from-green-500 to-green-600"
                    />
                  ))
                )}
              </div>
            </Card>

            <div className="space-y-4">
              {/* Notifications Panel */}
              <Card 
                title={
                  <div className="flex items-center gap-2">
                    <FiBell className="w-5 h-5 text-primary-600" />
                    <span>Notifications</span>
                  </div>
                }
                className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
              >
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {complexCases?.data?.pagination?.total > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-red-50/50 rounded-lg border border-red-200/50">
                      <FiAlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-red-900">
                          {complexCases.data.pagination.total} Complex Case{complexCases.data.pagination.total > 1 ? 's' : ''} Requiring Attention
                        </p>
                        <Link to="/adl-files" className="text-xs text-red-600 hover:text-red-700 mt-1 inline-block">
                          View cases →
                        </Link>
                      </div>
                    </div>
                  )}
                  {activeADLFiles?.data?.files?.filter(f => f.file_status === 'created').length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-50/50 rounded-lg border border-yellow-200/50">
                      <FiClock className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-yellow-900">
                          {activeADLFiles.data.files.filter(f => f.file_status === 'created').length} Pending ADL File{activeADLFiles.data.files.filter(f => f.file_status === 'created').length > 1 ? 's' : ''}
                        </p>
                        <Link to="/adl-files?status=created" className="text-xs text-yellow-600 hover:text-yellow-700 mt-1 inline-block">
                          Review →
                        </Link>
                      </div>
                    </div>
                  )}
                  {(!complexCases?.data?.pagination?.total && 
                    !activeADLFiles?.data?.files?.filter(f => f.file_status === 'created').length) && (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <FiCheckCircle className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-xs">All caught up! No pending items.</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card 
                title={
                  <div className="flex items-center gap-2">
                    <FiSettings className="w-5 h-5 text-primary-600" />
                    <span>Quick Actions</span>
                  </div>
                }
                className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
              >
                <div className="space-y-3">
                  <QuickActionCard
                    icon={FiFileText}
                    title="Create Proforma"
                    description="New clinical assessment"
                    to="/clinical-proforma/create"
                    colorClasses="hover:from-green-50 hover:to-emerald-50"
                  />
                  <QuickActionCard
                    icon={FiPackage}
                    title="Create Prescription"
                    description="Prescribe medication"
                    to="/prescriptions/create"
                    colorClasses="hover:from-blue-50 hover:to-indigo-50"
                  />
                  <QuickActionCard
                    icon={FiUpload}
                    title="Upload Files"
                    description="Patient documents"
                    to="/patients"
                    colorClasses="hover:from-purple-50 hover:to-pink-50"
                  />
                  <QuickActionCard
                    icon={FiUsers}
                    title="My Patients"
                    description="View assigned patients"
                    to="/patients"
                    colorClasses="hover:from-orange-50 hover:to-amber-50"
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== RESIDENT DASHBOARD ====================
  if (isResident) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
          {/* Welcome Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || 'Resident'}! 🏠
            </h1>
            <p className="text-gray-600 mt-1">Resident Dashboard - Clinical Assessment & Case Management</p>
          </div>

          {/* Resident KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="My Clinical Proformas" 
              value={myProformas?.data?.pagination?.total || 0} 
              icon={FiFileText} 
              colorClasses="from-blue-500 to-blue-600"
              to="/clinical"
              subtitle="Total assessments"
            />
            <StatCard 
              title="ADL Files Created" 
              value={activeADLFiles?.data?.files?.length || 0} 
              icon={FiFolder} 
              colorClasses="from-purple-500 to-purple-600"
              to="/adl-files"
              subtitle="Intake records"
            />
            <StatCard 
              title="Pending ADLs" 
              value={complexCases?.data?.pagination?.total || 0} 
              icon={FiAlertCircle} 
              colorClasses="from-orange-500 to-orange-600"
              to="/adl-files"
              subtitle="Requiring completion"
            />
            <StatCard 
              title="Files Uploaded" 
              value={fileStats?.data?.stats?.total_files || 0} 
              icon={FiUpload} 
              colorClasses="from-pink-500 to-pink-600"
              subtitle="Patient documents"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <FiPieChart className="w-5 h-5 text-primary-600" />
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
                    datasets: [{
                      data: (decisionStats?.data?.decisionStats || []).map(item => parseInt(item.count, 10) || 0),
                      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
                      borderColor: ['#1D4ED8', '#059669', '#D97706', '#DC2626'],
                      borderWidth: 2,
                    }],
                  }}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: 'My Cases by Decision'
                      }
                    }
                  }}
                />
              </div>
            </Card>

            <Card 
              title={
                <div className="flex items-center gap-2">
                  <FiBarChart2 className="w-5 h-5 text-primary-600" />
                  <span>ADL Status Breakdown</span>
                </div>
              }
              className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
            >
              <div className="h-80">
                <Bar
                  data={{
                    labels: ['Active', 'Stored', 'Retrieved', 'Archived'],
                    datasets: [{
                      label: 'ADL Files',
                      data: [
                        adlStatusMap.active || 0,
                        adlStatusMap.stored || 0,
                        adlStatusMap.retrieved || 0,
                        adlStatusMap.archived || 0
                      ],
                      backgroundColor: ['#EF4444', '#10B981', '#F59E0B', '#6B7280'],
                      borderColor: ['#DC2626', '#059669', '#D97706', '#4B5563'],
                      borderWidth: 2,
                    }],
                  }}
                  options={{
                    ...barChartOptions,
                    plugins: {
                      ...barChartOptions.plugins,
                      title: {
                        ...barChartOptions.plugins.title,
                        text: 'ADL Status Breakdown'
                      }
                    }
                  }}
                />
              </div>
            </Card>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <FiActivity className="w-5 h-5 text-primary-600" />
                  <span>Recent Activity</span>
                </div>
              }
              className="lg:col-span-2 bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
            >
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(!myProformas?.data?.proformas?.length && !activeADLFiles?.data?.files?.length) ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <FiActivity className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                ) : (
                  <>
                    {myProformas?.data?.proformas?.slice(0, 5).map((proforma, idx) => (
                      <ActivityItem
                        key={proforma.id || idx}
                        icon={FiFileText}
                        title={`Clinical Proforma Created`}
                        description={`Patient: ${proforma.patient_name || 'N/A'}`}
                        time={proforma.created_at ? formatDateTime(proforma.created_at) : 'N/A'}
                        status={proforma.doctor_decision === 'complex_case' ? 'complex' : 'simple'}
                        color="from-blue-500 to-blue-600"
                      />
                    ))}
                    {activeADLFiles?.data?.files?.slice(0, 3).map((file, idx) => (
                      <ActivityItem
                        key={file.id || idx}
                        icon={FiFolder}
                        title={`ADL File: ${file.file_status || 'Active'}`}
                        description={`Patient: ${file.patient_name || 'N/A'}`}
                        time={file.created_at ? formatDateTime(file.created_at) : 'N/A'}
                        status={file.file_status}
                        color="from-purple-500 to-purple-600"
                      />
                    ))}
                  </>
                )}
              </div>
            </Card>

            <div className="space-y-4">
              {/* Notifications Panel */}
              <Card 
                title={
                  <div className="flex items-center gap-2">
                    <FiBell className="w-5 h-5 text-primary-600" />
                    <span>Notifications</span>
                  </div>
                }
                className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
              >
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {complexCases?.data?.pagination?.total > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-red-50/50 rounded-lg border border-red-200/50">
                      <FiAlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-red-900">
                          {complexCases.data.pagination.total} Complex Case{complexCases.data.pagination.total > 1 ? 's' : ''} Requiring Attention
                        </p>
                        <Link to="/adl-files" className="text-xs text-red-600 hover:text-red-700 mt-1 inline-block">
                          View cases →
                        </Link>
                      </div>
                    </div>
                  )}
                  {activeADLFiles?.data?.files?.filter(f => f.file_status === 'created').length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-50/50 rounded-lg border border-yellow-200/50">
                      <FiClock className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-yellow-900">
                          {activeADLFiles.data.files.filter(f => f.file_status === 'created').length} Pending ADL File{activeADLFiles.data.files.filter(f => f.file_status === 'created').length > 1 ? 's' : ''}
                        </p>
                        <Link to="/adl-files?status=created" className="text-xs text-yellow-600 hover:text-yellow-700 mt-1 inline-block">
                          Review →
                        </Link>
                      </div>
                    </div>
                  )}
                  {(!complexCases?.data?.pagination?.total && 
                    !activeADLFiles?.data?.files?.filter(f => f.file_status === 'created').length) && (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <FiCheckCircle className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-xs">All caught up! No pending items.</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card 
                title={
                  <div className="flex items-center gap-2">
                    <FiSettings className="w-5 h-5 text-primary-600" />
                    <span>Quick Actions</span>
                  </div>
                }
                className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
              >
                <div className="space-y-3">
                  <QuickActionCard
                    icon={FiFolder}
                    title="Create ADL"
                    description="New intake record"
                    to="/adl-files/new"
                    colorClasses="hover:from-purple-50 hover:to-pink-50"
                  />
                  <QuickActionCard
                    icon={FiUpload}
                    title="Upload Documents"
                    description="Patient files"
                    to="/patients"
                    colorClasses="hover:from-blue-50 hover:to-indigo-50"
                  />
                  <QuickActionCard
                    icon={FiCalendar}
                    title="Follow-ups"
                    description="Check schedules"
                    to="/clinical"
                    colorClasses="hover:from-green-50 hover:to-emerald-50"
                  />
                  <QuickActionCard
                    icon={FiFileText}
                    title="My Proformas"
                    description="View assessments"
                    to="/clinical"
                    colorClasses="hover:from-orange-50 hover:to-amber-50"
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== PSYCHIATRIC WELFARE OFFICER DASHBOARD ====================
  if (isMwo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
          {/* Welcome Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || 'Officer'}! 🧠
            </h1>
            <p className="text-gray-600 mt-1">Psychiatric Welfare Officer Dashboard - Patient Registration & Welfare Management</p>
          </div>

          {/* MWO KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Patient Records" 
              value={outpatientStats?.data?.stats?.total_records || 0} 
              icon={FiClipboard} 
              colorClasses="from-blue-500 to-blue-600"
              to="/patients"
              subtitle="All registered patients"
            />
            <StatCard 
              title="Registered Patients" 
              value={myRecords?.data?.pagination?.total || 0} 
              icon={FiUsers} 
              colorClasses="from-purple-500 to-purple-600"
              to="/patients"
              subtitle="Patient database"
            />
            <StatCard 
              title="Urban Patients" 
              value={outpatientStats?.data?.stats?.urban || 0} 
              icon={FiMapPin} 
              colorClasses="from-green-500 to-green-600"
              to="/patients?locality=urban"
              subtitle="Urban locality"
            />
            <StatCard 
              title="Rural Patients" 
              value={outpatientStats?.data?.stats?.rural || 0} 
              icon={FiMapPin} 
              colorClasses="from-orange-500 to-orange-600"
              to="/patients?locality=rural"
              subtitle="Rural locality"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <FiPieChart className="w-5 h-5 text-primary-600" />
                  <span>Patient Records by Marital Status</span>
                </div>
              }
              className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
            >
              <div className="h-80">
                <Doughnut
                  data={{
                    labels: ['Married', 'Unmarried', 'Widow/Widower', 'Divorced', 'Other'],
                    datasets: [{
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
                    }],
                  }}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: 'Records by Marital Status'
                      }
                    }
                  }}
                />
              </div>
            </Card>

            <Card 
              title={
                <div className="flex items-center gap-2">
                  <FiBarChart2 className="w-5 h-5 text-primary-600" />
                  <span>Urban vs Rural Distribution</span>
                </div>
              }
              className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
            >
              <div className="h-80">
                <Bar
                  data={{
                    labels: ['Urban', 'Rural'],
                    datasets: [{
                      label: 'Records',
                      data: [
                        outpatientStats?.data?.stats?.urban || 0,
                        outpatientStats?.data?.stats?.rural || 0,
                      ],
                      backgroundColor: ['#3B82F6', '#10B981'],
                      borderColor: ['#1D4ED8', '#059669'],
                      borderWidth: 2,
                    }],
                  }}
                  options={{
                    ...barChartOptions,
                    plugins: {
                      ...barChartOptions.plugins,
                      title: {
                        ...barChartOptions.plugins.title,
                        text: 'Urban vs Rural Distribution'
                      }
                    }
                  }}
                />
              </div>
            </Card>
          </div>

          {/* Recent Records Table */}
          {myRecords?.data?.records && (myRecords.data.records || myRecords.data.patients || []).length > 0 && (
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <FiFileText className="w-5 h-5 text-primary-600" />
                  <span>Recent Patient Records</span>
                </div>
              }
              actions={
                <Link to="/patients">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              }
              className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CR No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marital Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Locality</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                          {record.created_at ? formatDate(record.created_at) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Link to={`/patients/${record.id}?edit=false`}>
                              <Button variant="ghost" size="sm" className="h-9 w-9 p-0" title="View Details">
                                <FiEye className="w-4 h-4 text-blue-600" />
                              </Button>
                            </Link>
                            <Link to={`/patients/${record.id}?edit=true`}>
                              <Button variant="ghost" size="sm" className="h-9 w-9 p-0" title="Edit Patient">
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

          {/* Quick Actions */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <FiActivity className="w-5 h-5 text-primary-600" />
                <span>Quick Actions</span>
              </div>
            }
            className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuickActionCard
                icon={FiUserPlus}
                title="Register New Patient"
                description="Create new patient record"
                to="/patients/new"
                colorClasses="hover:from-blue-50 hover:to-indigo-50"
              />
              <QuickActionCard
                icon={FiClipboard}
                title="Browse Patients"
                description="View all patient records"
                to="/patients"
                colorClasses="hover:from-green-50 hover:to-emerald-50"
              />
              <QuickActionCard
                icon={FiUsers}
                title="Patient Management"
                description="Manage patient information"
                to="/patients"
                colorClasses="hover:from-purple-50 hover:to-pink-50"
              />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
          <p className="text-gray-600">Dashboard content is being loaded...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
