import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  FiUser, FiLock, FiShield, FiCalendar, FiClock, 
  FiKey, FiCheckCircle, FiAlertCircle, FiEdit3, FiSave 
} from 'react-icons/fi';
import { selectCurrentUser } from '../features/auth/authSlice';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useEnable2FAMutation,
  useDisable2FAMutation,
} from '../features/auth/authApiSlice';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { formatDate } from '../utils/formatters';

const Profile = () => {
  const user = useSelector(selectCurrentUser);
  const { data: profileData, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [enable2FA] = useEnable2FAMutation();
  const [disable2FA] = useDisable2FAMutation();

  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profileData?.data?.user) {
      setProfileForm({
        name: profileData.data.user.name || '',
        email: profileData.data.user.email || '',
      });
    }
  }, [profileData]);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm).unwrap();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();
      toast.success('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to change password');
    }
  };

  const handleEnable2FA = async () => {
    try {
      const result = await enable2FA().unwrap();
      // Show QR code or secret for user to scan
      toast.success('2FA enabled. Please scan the QR code in your authenticator app.');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to enable 2FA');
    }
  };

  const handleDisable2FA = async () => {
    if (window.confirm('Are you sure you want to disable 2FA?')) {
      try {
        await disable2FA().unwrap();
        toast.success('2FA disabled successfully');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to disable 2FA');
      }
    }
  };

  const profile = profileData?.data?.user || user;

  const tabs = [
    { id: 'profile', name: 'Profile', icon: FiUser },
    { id: 'security', name: 'Security', icon: FiLock },
    { id: '2fa', name: 'Two-Factor Auth', icon: FiShield },
  ];

  const getRoleBadgeColor = (role) => {
    const roleColors = {
      'Admin': 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200',
      'Faculty': 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200',
      'Resident': 'bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-800 border-cyan-200',
      'Psychiatric Welfare Officer': 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200',
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FiUser className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium text-lg">Loading profile...</p>
          <p className="mt-2 text-gray-500 text-sm">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">

        {/* Enhanced Tabs */}
        <Card className="shadow-lg border border-gray-200/50 bg-white/90 backdrop-blur-sm overflow-hidden p-0">
          <div className="flex border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 relative ${
                  activeTab === tab.id
                    ? 'text-primary-600 bg-gradient-to-br from-primary-50 to-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-500'}`} />
                  <span>{tab.name}</span>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-700"></div>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card className="shadow-lg border border-gray-200/50 bg-white/90 backdrop-blur-sm">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiUser className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
              </div>
              <p className="text-gray-600 ml-12">View and update your personal information</p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Account Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiUser className="w-4 h-4 text-blue-600" />
                    </div>
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">User ID</label>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{profile.id}</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FiShield className="w-4 h-4 text-purple-600" />
                    </div>
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Role</label>
                  </div>
                  <Badge className={`${getRoleBadgeColor(profile.role)} font-semibold`}>
                    {profile.role}
                  </Badge>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-200/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <FiCalendar className="w-4 h-4 text-emerald-600" />
                    </div>
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Account Created</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(profile.created_at)}</p>
                </div>
                
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <FiClock className="w-4 h-4 text-amber-600" />
                    </div>
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Last Login</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {profile.last_login ? formatDate(profile.last_login) : <span className="text-gray-400 italic">Never</span>}
                  </p>
                </div>
              </div>

              {/* Update Information Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <FiEdit3 className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Update Information</h3>
                </div>
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <Input
                      label="Full Name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      className="bg-white"
                      required
                    />
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      className="bg-white"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      loading={isUpdating}
                      className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg"
                    >
                      <FiSave className="mr-2" />
                      {isUpdating ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <Card className="shadow-lg border border-gray-200/50 bg-white/90 backdrop-blur-sm">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiLock className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
              </div>
              <p className="text-gray-600 ml-12">Update your password to keep your account secure</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200/50 space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-0">
                      <FiKey className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-0">
                      <FiKey className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Minimum 8 characters"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <FiAlertCircle className="w-3 h-3" />
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-0">
                      <FiKey className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                      required
                    />
                  </div>
                  {passwordForm.newPassword && passwordForm.confirmPassword && 
                   passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" />
                      Passwords do not match
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  loading={isChangingPassword}
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg"
                  disabled={passwordForm.newPassword && passwordForm.confirmPassword && 
                           passwordForm.newPassword !== passwordForm.confirmPassword}
                >
                  <FiLock className="mr-2" />
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* 2FA Tab */}
        {activeTab === '2fa' && (
          <Card className="shadow-lg border border-gray-200/50 bg-white/90 backdrop-blur-sm">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiShield className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h2>
              </div>
              <p className="text-gray-600 ml-12">
                Add an extra layer of security to your account with two-factor authentication
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200/50">
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Two-factor authentication adds an extra layer of security to your account.
                  When enabled, you'll need to enter a code from your authenticator app in addition to your password when logging in.
                </p>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        profile.two_factor_enabled 
                          ? 'bg-gradient-to-br from-green-100 to-emerald-100' 
                          : 'bg-gradient-to-br from-gray-100 to-slate-100'
                      }`}>
                        {profile.two_factor_enabled ? (
                          <FiCheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <FiShield className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">2FA Status</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Currently:</span>
                          <Badge 
                            className={profile.two_factor_enabled 
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200' 
                              : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200'
                            }
                          >
                            {profile.two_factor_enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {profile.two_factor_enabled ? (
                      <Button 
                        variant="outline"
                        onClick={handleDisable2FA}
                        className="bg-white border-2 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 shadow-sm transition-all duration-200"
                      >
                        <FiShield className="mr-2" />
                        Disable 2FA
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleEnable2FA}
                        className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg"
                      >
                        <FiShield className="mr-2" />
                        Enable 2FA
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {profile.two_factor_enabled && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200/50">
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">2FA is Active</p>
                      <p className="text-sm text-gray-600">
                        Your account is protected with two-factor authentication. You'll be prompted for a code from your authenticator app when logging in.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;

