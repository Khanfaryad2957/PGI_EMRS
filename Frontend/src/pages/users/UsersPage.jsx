import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiPlus, FiSearch, FiEdit, FiTrash2, FiCheck, FiX, FiUsers, 
  FiShield, FiRefreshCw, FiUserCheck, FiUserX, FiMail, FiClock, 
  FiKey, FiMoreVertical 
} from 'react-icons/fi';
import {
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
} from '../../features/users/usersApiSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Badge from '../../components/Badge';
import { formatDate } from '../../utils/formatters';

const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data, isLoading, isFetching, refetch, error } = useGetAllUsersQuery({ 
    page, 
    limit,
    search: search.trim() || undefined 
  }, {
    pollingInterval: 30000, // Auto-refresh every 30 seconds for real-time data
    refetchOnMountOrArgChange: true,
  });
  const [deleteUser] = useDeleteUserMutation();
  const [activateUser, { isLoading: isActivating }] = useActivateUserMutation();
  const [deactivateUser, { isLoading: isDeactivating }] = useDeactivateUserMutation();

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id).unwrap();
        toast.success('User deleted successfully');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleActivate = async (id) => {
    try {
      await activateUser(id).unwrap();
      toast.success('User activated successfully');
      // Refetch users list to update the UI immediately
      await refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to activate user');
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await deactivateUser(id).unwrap();
        toast.success('User deactivated successfully');
        // Refetch users list to update the UI immediately
        await refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to deactivate user');
      }
    }
  };

  const getRoleBadgeVariant = (role) => {
    const map = {
      Admin: 'danger',
      SR: 'primary',
      JR: 'info',
      MWO: 'success',
    };
    return map[role] || 'default';
  };

  // Filter users based on search
  const filteredUsers = data?.data?.users?.filter(user => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const columns = [
    {
      header: (
        <div className="flex items-center gap-2">
          <FiUsers className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">Name</span>
        </div>
      ),
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
            {row.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="font-medium text-gray-900">{row.name}</span>
        </div>
      ),
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <FiMail className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">Email</span>
        </div>
      ),
      accessor: 'email',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-gray-700">{row.email}</span>
        </div>
      ),
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <FiShield className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">Role</span>
        </div>
      ),
      render: (row) => {
        const roleColors = {
          'Admin': 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200',
          'Faculty': 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200',
          'Resident': 'bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-800 border-cyan-200',
          'Psychiatric Welfare Officer': 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200',
        };
        return (
          <Badge className={roleColors[row.role] || 'bg-gray-100 text-gray-800 border-gray-200'}>
            {row.role}
          </Badge>
        );
      },
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <FiUserCheck className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">Status</span>
        </div>
      ),
      render: (row) => {
        const isActive = row.is_active === true || row.is_active === 1;
        return (
          <Badge 
            variant={isActive ? 'success' : 'default'}
            className={isActive 
              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 font-semibold' 
              : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200 font-semibold'
            }
          >
            <div className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="font-medium">{isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </Badge>
        );
      },
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <FiKey className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">2FA</span>
        </div>
      ),
      render: (row) => (
        <Badge 
          variant={row.two_factor_enabled ? 'success' : 'default'}
          className={row.two_factor_enabled 
            ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200' 
            : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200'
          }
        >
          {row.two_factor_enabled ? 'Enabled' : 'Disabled'}
        </Badge>
      ),
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <FiClock className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">Last Login</span>
        </div>
      ),
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.last_login ? (
            <span className="text-gray-700">{formatDate(row.last_login)}</span>
          ) : (
            <span className="text-gray-400 italic">Never</span>
          )}
        </div>
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
          <Link to={`/users/${row.id}/edit`}>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-9 w-9 p-0 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              title="Edit User"
            >
              <FiEdit className="w-4 h-4 text-blue-600" />
            </Button>
          </Link>
          {(row.is_active === true || row.is_active === 1) ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeactivate(row.id)}
              title="Deactivate User"
              disabled={isDeactivating || isActivating}
              loading={isDeactivating}
              className="h-9 w-9 p-0 bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiUserX className="w-4 h-4 text-red-600" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActivate(row.id)}
              title="Activate User"
              disabled={isActivating || isDeactivating}
              loading={isActivating}
              className="h-9 w-9 p-0 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 hover:border-green-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiUserCheck className="w-4 h-4 text-green-600" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id)}
            title="Delete User"
            className="h-9 w-9 p-0 bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
          >
            <FiTrash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  const roleStats = {
    'Admin': { 
      count: data?.data?.users?.filter(u => u.role === 'Admin').length || 0, 
      color: 'from-red-500 to-rose-600', 
      bg: 'from-red-50 to-rose-100/50', 
      border: 'border-red-200/50' 
    },
    'Faculty': { 
      count: data?.data?.users?.filter(u => u.role === 'Faculty').length || 0, 
      color: 'from-blue-500 to-indigo-600', 
      bg: 'from-blue-50 to-indigo-100/50', 
      border: 'border-blue-200/50' 
    },
    'Resident': { 
      count: data?.data?.users?.filter(u => u.role === 'Resident').length || 0, 
      color: 'from-cyan-500 to-teal-600', 
      bg: 'from-cyan-50 to-teal-100/50', 
      border: 'border-cyan-200/50' 
    },
    'Psychiatric Welfare Officer': { 
      count: data?.data?.users?.filter(u => u.role === 'Psychiatric Welfare Officer').length || 0, 
      color: 'from-green-500 to-emerald-600', 
      bg: 'from-green-50 to-emerald-100/50', 
      border: 'border-green-200/50' 
    },
  };


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
                  <p className="text-red-800 font-semibold text-base mb-1">Error Loading Users</p>
                  <p className="text-red-600 text-sm">{error?.data?.message || 'Failed to load users. Please try again.'}</p>
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
                  placeholder="Search by name, email, or role..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 h-12 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 shadow-sm hover:shadow-md"
                />
              </div>
              <Button
                  variant="outline"
                  className="bg-white/80 border-2 border-primary-200 hover:bg-primary-50 hover:border-primary-300 shadow-sm transition-all duration-200 whitespace-nowrap"
                  onClick={() => refetch()}
                  disabled={isFetching}
                >
                  <FiRefreshCw className={`mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                  {isFetching ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Link to="/users/new">
                  <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap">
                    <FiPlus className="mr-2" />
                    Add User
                  </Button>
                </Link>
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
              <p className="mt-6 text-gray-600 font-medium text-lg">Loading users...</p>
              <p className="mt-2 text-gray-500 text-sm">Please wait while we fetch the data</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                <FiUsers className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-xl font-semibold text-gray-700 mb-2">No users found</p>
              <p className="text-gray-500 text-center max-w-md">
                {search 
                  ? `No users match your search "${search}". Try a different search term.`
                  : 'There are no users in the system yet. Add your first user to get started.'}
              </p>
              {!search && (
                <Link to="/users/new" className="mt-6">
                  <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg">
                    <FiPlus className="mr-2" />
                    Add First User
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <Table
                  columns={columns}
                  data={filteredUsers}
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

export default UsersPage;

