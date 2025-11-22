import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiLogOut, FiUser, FiMenu } from 'react-icons/fi';
import { logout, selectCurrentUser } from '../features/auth/authSlice';
import { apiSlice } from '../app/api/apiSlice';
import PGI_Logo from '../assets/PGI_Logo.png';

const Header = ({ onMenuClick, sidebarMinimized = false, sidebarOpen = false }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    // Extra safety: clear RTK Query cache immediately and redirect
    dispatch(apiSlice.util.resetApiState());
    navigate('/login', { replace: true });
    // Ensure full in-memory reset in rare cases
    setTimeout(() => window.location.replace('/login'), 0);
  };

  return (
    <header className={`relative backdrop-blur-2xl bg-white/70 border-b border-white/40 shadow-2xl z-10 transition-all duration-300 ease-in-out overflow-hidden ${sidebarMinimized ? 'lg:ml-20' : 'lg:ml-64'}`}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-indigo-400/10 to-transparent rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-24">
          <div className="flex items-center flex-1 min-w-0">
            <button
              onClick={onMenuClick}
              className="lg:hidden group relative p-2.5 rounded-xl text-gray-600 hover:text-primary-700 backdrop-blur-md bg-white/50 hover:bg-white/70 border border-white/40 hover:border-primary-300/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
            >
              <FiMenu className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
            </button>
            <Link to="/" className="flex items-center ml-2 lg:ml-0 gap-2 sm:gap-3 flex-shrink-0 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-200/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <img 
                  src={PGI_Logo} 
                  alt="PGIMER Logo" 
                  className="relative h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 object-contain flex-shrink-0 transition-transform duration-300 group-hover:scale-110" 
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 bg-clip-text text-transparent whitespace-nowrap drop-shadow-sm">
                  PGIMER PSY
                </h1>
                <span className="hidden lg:inline text-xs sm:text-sm text-gray-600 font-medium ml-2 px-2 py-0.5 backdrop-blur-md bg-white/50 rounded-md border border-white/40">
                  Psychiatry Department
                </span>
              </div>
            </Link>
          </div>

          <div className={`flex items-center gap-3 sm:gap-4 lg:gap-6 flex-shrink-0 transition-all duration-300 ${sidebarOpen ? 'hidden lg:flex' : 'flex'}`}>
            <div className="text-right hidden md:block">
              <div className="px-3 py-1.5 backdrop-blur-md bg-white/60 rounded-xl border border-white/40 shadow-lg">
                <p className="text-sm font-bold text-gray-900 truncate max-w-[150px] lg:max-w-[220px]">{user?.name}</p>
                <p className="text-xs font-medium text-primary-600 truncate max-w-[150px] lg:max-w-[220px] mt-0.5">{user?.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/profile"
                title="Profile Settings"
                className="group relative p-2.5 sm:p-3 rounded-xl text-gray-600 hover:text-primary-700 backdrop-blur-md bg-white/50 hover:bg-white/70 border border-white/40 hover:border-primary-300/50 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-primary-500/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-400/0 via-primary-500/0 to-primary-400/0 group-hover:from-primary-400/20 group-hover:via-primary-500/30 group-hover:to-primary-400/20 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                <FiUser className="h-5 w-5 sm:h-6 sm:w-6 relative z-10 transition-transform duration-300 group-hover:scale-110" />
              </Link>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="group relative p-2.5 sm:p-3 rounded-xl text-gray-600 hover:text-red-700 backdrop-blur-md bg-white/50 hover:bg-white/70 border border-white/40 hover:border-red-300/50 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-red-500/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-400/0 via-red-500/0 to-red-400/0 group-hover:from-red-400/20 group-hover:via-red-500/30 group-hover:to-red-400/20 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                <FiLogOut className="h-5 w-5 sm:h-6 sm:w-6 relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-15deg]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

