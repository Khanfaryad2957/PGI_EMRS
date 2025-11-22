import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiClipboard,
  FiFolder,
  FiSettings,
  FiX,
  FiLogOut,
  FiUser,
  FiChevronDown,
  FiChevronUp,
  FiUserPlus,
  FiUserCheck,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { selectCurrentUser, logout } from '../features/auth/authSlice';
import { isMWO } from '../utils/constants';
import { apiSlice } from '../app/api/apiSlice';
import PGI_Logo from '../assets/PGI_Logo.png';

// MWO Sidebar Navigation Component
const MWONavigation = ({ onClose, isMinimized }) => {
  const location = useLocation();

  return (
    <>
      {/* Dashboard */}
      <NavLink
        to="/"
        onClick={onClose}
        className={({ isActive }) =>
          `group flex items-center ${isMinimized ? 'justify-center px-2' : 'px-4'} py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
            isActive
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
              : 'text-gray-700 hover:bg-white/40 hover:text-primary-700 hover:shadow-md'
          }`
        }
        title={isMinimized ? 'Dashboard' : ''}
      >
        <div className={`p-2 rounded-lg ${isMinimized ? '' : 'mr-3'} transition-colors ${
          location.pathname === '/'
            ? 'bg-white/20'
            : 'bg-gray-100 group-hover:bg-primary-100'
        }`}>
          <FiHome className="h-5 w-5" />
        </div>
        {!isMinimized && <span>Dashboard</span>}
      </NavLink>

      {/* Register New Patient */}
      <NavLink
        to="/patients/new"
        onClick={onClose}
        end
        className={({ isActive }) =>
          `group flex items-center ${isMinimized ? 'justify-center px-2' : 'px-4'} py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
            isActive
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
              : 'text-gray-700 hover:bg-white/40 hover:text-primary-700 hover:shadow-md'
          }`
        }
        title={isMinimized ? 'Register New Patient' : ''}
      >
        <div className={`p-2 rounded-lg ${isMinimized ? '' : 'mr-3'} transition-colors ${
          location.pathname === '/patients/new'
            ? 'bg-white/20'
            : 'bg-gray-100 group-hover:bg-primary-100'
        }`}>
          <FiUserPlus className="h-5 w-5" />
        </div>
        {!isMinimized && <span>Register New Patient</span>}
      </NavLink>

      {/* All Patient Records */}
      <NavLink
        to="/patients"
        onClick={onClose}
        className={() => {
          // Only active on exact /patients or /patients/:id (view/edit) but NOT on /patients/new or /patients/select
          const isExcluded = location.pathname === '/patients/new' || location.pathname === '/patients/select';
          const isActive = !isExcluded && (location.pathname === '/patients' || location.pathname.startsWith('/patients/'));
          
          return `group flex items-center ${isMinimized ? 'justify-center px-2' : 'px-4'} py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
            isActive
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
              : 'text-gray-700 hover:bg-white/40 hover:text-primary-700 hover:shadow-md'
          }`;
        }}
        title={isMinimized ? 'All Patient Records' : ''}
      >
        <div className={`p-2 rounded-lg ${isMinimized ? '' : 'mr-3'} transition-colors ${
          (location.pathname === '/patients' || 
           (location.pathname.startsWith('/patients/') && 
            location.pathname !== '/patients/new' && 
            location.pathname !== '/patients/select'))
            ? 'bg-white/20'
            : 'bg-gray-100 group-hover:bg-primary-100'
        }`}>
          <FiClipboard className="h-5 w-5" />
        </div>
        {!isMinimized && <span>All Patient Records</span>}
      </NavLink>

      

      {/* Existing Patient */}
      <NavLink
        to="/patients/select"
        onClick={onClose}
        end
        className={({ isActive }) =>
          `group flex items-center ${isMinimized ? 'justify-center px-2' : 'px-4'} py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
            isActive
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
              : 'text-gray-700 hover:bg-white/40 hover:text-primary-700 hover:shadow-md'
          }`
        }
        title={isMinimized ? 'Existing Patients' : ''}
      >
        <div className={`p-2 rounded-lg ${isMinimized ? '' : 'mr-3'} transition-colors ${
          location.pathname === '/patients/select'
            ? 'bg-white/20'
            : 'bg-gray-100 group-hover:bg-primary-100'
        }`}>
          <FiUserCheck className="h-5 w-5" />
        </div>
        {!isMinimized && <span>Existing Patients</span>}
      </NavLink>
    </>
  );
};

const Sidebar = ({ isOpen, onClose, isMinimized, onToggleMinimize }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
    onClose(); // Close sidebar on mobile after logout
    navigate('/login', { replace: true });
    setTimeout(() => window.location.replace('/login'), 0);
  };

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navigation = [
    { 
      name: 'Dashboard', 
      to: '/', 
      icon: FiHome, 
      roles: ['Admin', 'Faculty', 'Resident', 'Psychiatric Welfare Officer'] 
    },
    { 
      name: 'Patients', 
      to: '/patients', 
      icon: FiUsers, 
      roles: ['Admin', 'Faculty', 'Resident', 'Psychiatric Welfare Officer'] 
    },
    { 
      name: "Today's Patients", 
      to: '/clinical-today-patients', 
      icon: FiCalendar, 
      roles: ['Admin', 'Faculty', 'Resident'] 
    },
    // { name: 'Outpatient Records', to: '/outpatient', icon: FiClipboard, roles: ['Admin', 'Psychiatric Welfare Officer'] },
    // { name: 'Walk-in Clinical Proforma', to: '/clinical', icon: FiFileText, roles: ['Admin'] },
    { 
      name: 'Out Patient Intake Record', 
      to: '/adl-files', 
      icon: FiFolder, 
      roles: ['Admin', 'Faculty', 'Resident'] 
    },
    { 
      name: 'Users', 
      to: '/users', 
      icon: FiSettings, 
      roles: ['Admin'] 
    },
  ];

  // Helper function to check if user role matches navigation item
  const hasAccess = (itemRoles, userRole) => {
    if (!userRole) return false;
    // Direct match check
    return itemRoles.includes(userRole);
  };

  const filteredNavigation = navigation.filter((item) =>
    hasAccess(item.roles, user?.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 backdrop-blur-md bg-black/30 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 backdrop-blur-2xl bg-white/80 border-r border-white/40 shadow-2xl transform transition-all duration-300 ease-in-out
          lg:translate-x-0 lg:fixed lg:inset-y-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isMinimized ? 'w-20' : 'w-64'}
        `}
      >
        <div className="h-full mt-6 flex flex-col">
          {/* Logo and Title Section */}
          <div className={`flex items-center ${isMinimized ? 'justify-center px-1' : 'justify-between px-4'} h-16 border-b border-white/20 flex-shrink-0`}>
            {!isMinimized ? (
              <>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img src={PGI_Logo} alt="PGIMER Logo" className="w-8 h-8 object-contain" />
                  </div>
                  <div className="ml-3">
                    <h1 className="text-lg font-bold text-primary-900">PGIMER PSY</h1>
                    <p className="text-xs text-gray-600"> Psychiatry Department - PGIMER Chandigarh</p>
                  </div>
                </div>
                {/* Desktop minimize button */}
                <button
                  onClick={onToggleMinimize}
                  className="hidden lg:flex group relative p-2.5 rounded-xl text-gray-600 hover:text-primary-700 bg-gradient-to-br from-white/40 to-gray-50/40 hover:from-primary-50 hover:to-primary-100/50 border border-gray-200/50 hover:border-primary-300/50 transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-lg hover:shadow-primary-500/20 active:scale-95"
                  title="Minimize sidebar"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-400/0 via-primary-500/0 to-primary-400/0 group-hover:from-primary-400/20 group-hover:via-primary-500/30 group-hover:to-primary-400/20 transition-all duration-500 opacity-0 group-hover:opacity-100 animate-pulse"></div>
                  <FiChevronLeft className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:translate-x-[-2px] group-hover:scale-110" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full gap-2">
                <div className="relative group/logo">
                  <div className="absolute inset-0 rounded-full bg-primary-200/30 blur-md opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300"></div>
                  <img src={PGI_Logo} alt="PGIMER Logo" className="w-6 h-6 object-contain relative z-10 transition-transform duration-300 group-hover/logo:scale-110" />
                </div>
                {/* Desktop maximize button */}
                <button
                  onClick={onToggleMinimize}
                  className="hidden lg:flex group relative p-2.5 rounded-xl text-gray-600 hover:text-primary-700 bg-gradient-to-br from-white/40 to-gray-50/40 hover:from-primary-50 hover:to-primary-100/50 border border-gray-200/50 hover:border-primary-300/50 transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-lg hover:shadow-primary-500/20 active:scale-95"
                  title="Maximize sidebar"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-400/0 via-primary-500/0 to-primary-400/0 group-hover:from-primary-400/20 group-hover:via-primary-500/30 group-hover:to-primary-400/20 transition-all duration-500 opacity-0 group-hover:opacity-100 animate-pulse"></div>
                  <FiChevronRight className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:translate-x-[2px] group-hover:scale-110" />
                </button>
              </div>
            )}
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden group relative p-2 rounded-xl text-gray-600 hover:text-red-600 bg-gradient-to-br from-white/40 to-gray-50/40 hover:from-red-50 hover:to-red-100/50 border border-gray-200/50 hover:border-red-300/50 transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-lg hover:shadow-red-500/20 active:scale-95"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-400/0 via-red-500/0 to-red-400/0 group-hover:from-red-400/20 group-hover:via-red-500/30 group-hover:to-red-400/20 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              <FiX className="h-6 w-6 relative z-10 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
            </button>
          </div>

          {/* Navigation - scrollable middle section */}
          <nav className={`flex-1 py-6 pb-48 space-y-2 overflow-y-auto min-h-0 ${isMinimized ? 'px-2' : 'px-4'}`}>
            {isMWO(user?.role) ? (
              // MWO-specific beautiful navigation
              <MWONavigation onClose={onClose} isMinimized={isMinimized} />
            ) : (
              // Other roles navigation (Admin, JR, SR)
              filteredNavigation.map((item) => {
                const location = window.location.pathname;
                
                // Special handling for "Today's Patients" - keep it active when on related pages
                let isActive = false;
                if (item.to === '/clinical-today-patients') {
                  // Keep "Today's Patients" active when on:
                  // - Today's Patients page itself
                  // - Create Proforma page (when coming from Today's Patients)
                  // - Prescribe Medication page (when coming from Today's Patients)
                  isActive = location === item.to || 
                             location === '/clinical/new' ||
                             location.startsWith('/prescriptions');
                } else {
                  // For other routes, use standard matching
                  isActive = location === item.to || location.startsWith(item.to + '/');
                }

                return (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    onClick={onClose}
                    className={`group flex items-center ${isMinimized ? 'justify-center px-2' : 'px-4'} py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                        : 'text-gray-700 hover:bg-white/40 hover:text-primary-700 hover:shadow-md'
                    }`}
                    title={isMinimized ? item.name : ''}
                  >
                    <div className={`p-2 rounded-lg ${isMinimized ? '' : 'mr-3'} transition-colors ${
                      isActive
                        ? 'bg-white/20'
                        : 'bg-gray-100 group-hover:bg-primary-100'
                    }`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    {!isMinimized && <span>{item.name}</span>}
                  </NavLink>
                );
              })
            )}
          </nav>

          {/* User info and actions - ABSOLUTELY FIXED at bottom - NOT scrollable */}
          <div className={`absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white/80 backdrop-blur-md shadow-lg ${isMinimized ? 'p-2' : 'p-4'} space-y-3`}>
            {/* User Profile Section - Clickable to open profile settings */}
            <div 
              onClick={() => {
                navigate('/profile');
                onClose();
              }}
              className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 cursor-pointer hover:bg-white transition-all duration-200 ${isMinimized ? 'p-2' : 'p-3'}`}
              title={isMinimized ? 'Profile Settings' : ''}
            >
              <div className={`flex items-center ${isMinimized ? 'justify-center' : 'space-x-3'}`}>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30">
                    <FiUser className="h-6 w-6 text-white" />
                  </div>
                </div>
                {!isMinimized && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 mt-1">
                      {user?.role}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleLogout}
                className={`group flex items-center w-full ${isMinimized ? 'justify-center px-2' : 'px-4'} py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all duration-200 shadow-md border border-red-600 backdrop-blur-sm`}
                title={isMinimized ? 'Sign Out' : ''}
              >
                <div className={`p-1.5 rounded-lg bg-red-600 group-hover:bg-red-700 ${isMinimized ? '' : 'mr-3'} transition-colors`}>
                  <FiLogOut className="h-4 w-4" />
                </div>
                {!isMinimized && <span>Sign Out</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

