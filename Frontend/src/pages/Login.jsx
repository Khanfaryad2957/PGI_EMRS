import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useLoginMutation, useVerifyLoginOTPMutation } from '../features/auth/authApiSlice';
import { setCredentials, setOTPRequired, selectOTPRequired, selectLoginData } from '../features/auth/authSlice';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Users,
  FileText,
  Shield,
  Phone,
  Clock,
  Heart,
  Activity,
  Brain
} from 'lucide-react';
import PGI_Logo from '../assets/PGI_Logo.png';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const otpRequired = useSelector(selectOTPRequired);
  const loginData = useSelector(selectLoginData);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [verifyLoginOTP, { isLoading: isVerifying }] = useVerifyLoginOTPMutation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      // Check if accessToken is returned (direct login without OTP)
      if (result.data.accessToken || result.data.token) {
        // Direct login - accessToken received (new system) or token (legacy)
        dispatch(setCredentials({
          user: result.data.user,
          token: result.data.accessToken || result.data.token,
        }));
        toast.success('Login successful!');
        navigate('/');
      } else {
        // OTP required - store login data for OTP verification
        dispatch(setOTPRequired(result.data));
        toast.info('OTP sent to your email. Please check your inbox.');
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Login failed');
    }
  };

  const handleOTPVerify = async (e) => {
    e.preventDefault();
    try {
      const result = await verifyLoginOTP({
        user_id: loginData.user_id,
        otp: formData.otp,
      }).unwrap();

      dispatch(setCredentials({
        user: result.data.user,
        token: result.data.accessToken || result.data.token,
      }));
      dispatch(setOTPRequired(false));
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      toast.error(err?.data?.message || 'OTP verification failed');
    }
  };


  return (
    <div className="relative h-screen overflow-hidden">
      {/* Animated Gradient Background - WHITE THEME */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Animated Circles */}
        <div className="absolute bg-blue-300 rounded-full top-20 left-10 w-72 h-72 mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bg-purple-300 rounded-full top-40 right-20 w-72 h-72 mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bg-indigo-300 rounded-full bottom-20 left-40 w-72 h-72 mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative flex h-full">
        {/* Left Panel - Information (50%) */}
        <div className="relative hidden overflow-hidden lg:flex lg:w-1/2">
          {/* Glassmorphism Container - WHITE FROSTED GLASS */}
          <div className="relative z-10 flex flex-col justify-between w-full p-8 text-gray-800 border-r shadow-2xl backdrop-blur-2xl bg-white/40 border-white/60">
            {/* Floating Medical Icons */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
              <div className="absolute top-20 left-20 animate-float">
                <Heart className="w-16 h-16 text-blue-600" />
              </div>
              <div className="absolute top-60 right-20 animate-float animation-delay-2000">
                <Brain className="w-20 h-20 text-indigo-600" />
              </div>
              <div className="absolute bottom-40 left-40 animate-float animation-delay-4000">
                <Activity className="text-purple-600 w-14 h-14" />
              </div>
            </div>

            {/* Header */}
            <div className="relative z-20">
              <div className="flex items-center mb-8">
                <div className="p-4 mr-4 border shadow-2xl bg-white/60 backdrop-blur-lg rounded-2xl border-white/80">
                  <img src={PGI_Logo} alt="PGIMER Logo" className="object-contain h-14 w-14" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 drop-shadow-lg">Department of Psychiatry  </h1>
                  <p className="text-sm text-gray-700">PGIMER Chandigarh </p>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="mb-3 text-2xl font-bold leading-tight text-gray-900 drop-shadow-lg">
                Electronic  Medical Record System
                </h2>
                <p className="text-lg leading-relaxed text-gray-700">
                  Where technology meets care — redefining patient records for the digital age.
                </p>
              </div>
            </div>

            {/* Features with Glassmorphism Cards - WHITE THEME */}
            <div className="relative z-20 space-y-2">
              <div className="group">
                <div className="p-3 transition-all duration-300 border shadow-lg bg-white/50 backdrop-blur-lg border-white/80 rounded-xl hover:bg-white/70 hover:scale-105 hover:shadow-2xl">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 transition-all duration-300 bg-blue-100 border border-blue-200 backdrop-blur-sm rounded-lg group-hover:bg-blue-200">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-sm font-semibold text-gray-800">Smart Patient Records</h3>
                      <p className="text-xs text-gray-600">Secure and seamless management of psychiatric patient data</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group">
                <div className="p-3 transition-all duration-300 border shadow-lg bg-white/50 backdrop-blur-lg border-white/80 rounded-xl hover:bg-white/70 hover:scale-105 hover:shadow-2xl">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 transition-all duration-300 bg-purple-100 border border-purple-200 backdrop-blur-sm rounded-lg group-hover:bg-purple-200">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-sm font-semibold text-gray-800">Integrated Workflow</h3>
                      <p className="text-xs text-gray-600">Smooth collaboration among clinicians and staff</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group">
                <div className="p-3 transition-all duration-300 border shadow-lg bg-white/50 backdrop-blur-lg border-white/80 rounded-xl hover:bg-white/70 hover:scale-105 hover:shadow-2xl">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 transition-all duration-300 bg-indigo-100 border border-indigo-200 backdrop-blur-sm rounded-lg group-hover:bg-indigo-200">
                      <Shield className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-sm font-semibold text-gray-800">Privacy & Security</h3>
                      <p className="text-xs text-gray-600">HIPAA-compliant protection for mental health records</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group">
                <div className="p-3 transition-all duration-300 border shadow-lg bg-white/50 backdrop-blur-lg border-white/80 rounded-xl hover:bg-white/70 hover:scale-105 hover:shadow-2xl">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 transition-all duration-300 border bg-cyan-100 backdrop-blur-sm rounded-lg group-hover:bg-cyan-200 border-cyan-200">
                      <Clock className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-sm font-semibold text-gray-800">24/7 Access</h3>
                      <p className="text-xs text-gray-600">Round-the-clock access for authorized staff</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-20 pt-4 mt-4 border-t border-gray-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-700">Need help? Call 0172-2746018</span>
                </div>
                <div className="text-xs text-gray-600">
                  T&C apply*
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form (50%) */}
        <div className="flex items-center justify-center w-full p-6 lg:w-1/2">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="mb-6 text-center lg:hidden">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 border shadow-lg bg-white/60 backdrop-blur-lg border-white/80 rounded-2xl">
                <img src={PGI_Logo} alt="PGIMER Logo" className="object-contain w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Department of Psychiatry</h2>
              <p className="text-sm text-gray-600">PGIMER Chandigarh </p>
            </div>

            {/* Desktop Logo */}
            <div className="hidden mb-6 text-center lg:block">
              <div className="inline-flex items-center justify-center mb-4">
                <img src={PGI_Logo} alt="PGIMER Logo" className="object-contain w-20 h-20 drop-shadow-2xl" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-800"> Department of Psychiatry</h2>
              <p className="text-sm text-gray-600">PGIMER Chandigarh</p>
            </div>

            {/* Glassmorphism Login Form - WHITE THEME */}
            <div className="p-6 border shadow-2xl bg-white/50 backdrop-blur-2xl border-white/80 rounded-3xl">
              <div className="mb-6 text-center">
                <h2 className="mb-2 text-2xl font-bold text-gray-800">Sign in</h2>
                <p className="text-gray-600">Welcome back! Please enter your details.</p>
              </div>

              {!otpRequired ? (
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Mail className="w-5 h-5 text-gray-400 transition-colors group-focus-within:text-gray-600" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-4 py-3 bg-white/60 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all backdrop-blur-lg shadow-inner"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400 transition-colors group-focus-within:text-gray-600" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-12 py-3 bg-white/60 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all backdrop-blur-lg shadow-inner"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-4"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5 text-gray-400 transition-colors hover:text-gray-600" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-400 transition-colors hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-400 bg-white/60 backdrop-blur-sm"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700 transition-colors group-hover:text-gray-900">Remember Me</span>
                    </label>
                    <Link to="/forgot-password" className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800">
                      Forgot Password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                  >
                    {isLoggingIn ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                        Signing in...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="mb-4 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-blue-100 border border-blue-200 rounded-full shadow-lg backdrop-blur-lg">
                      <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-800">Check Your Email</h3>
                    <p className="text-sm text-gray-600">
                      We've sent a 6-digit verification code to<br />
                      <span className="font-semibold text-gray-800">{loginData?.email}</span>
                    </p>
                  </div>

                  <form className="space-y-4" onSubmit={handleOTPVerify}>
                    <div>
                      <label htmlFor="otp" className="block mb-2 text-sm font-medium text-gray-700">
                        Verification Code
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                          <Shield className="w-5 h-5 text-gray-400 transition-colors group-focus-within:text-gray-600" />
                        </div>
                        <input
                          id="otp"
                          name="otp"
                          type="text"
                          maxLength="6"
                          pattern="[0-9]{6}"
                          required
                          value={formData.otp}
                          onChange={handleChange}
                          className="block w-full pl-12 pr-4 py-3 bg-white/60 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-center text-2xl font-mono tracking-widest backdrop-blur-lg shadow-inner"
                          placeholder="000000"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifying || formData.otp.length !== 6}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                    >
                      {isVerifying ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                          Verifying...
                        </div>
                      ) : (
                        'Verify & Continue'
                      )}
                    </button>
                  </form>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(setOTPRequired(false));
                        setFormData(prev => ({ ...prev, otp: '' }));
                      }}
                      className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} Post Graduate Institute of Medical Education & Research, Chandigarh
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Login;
