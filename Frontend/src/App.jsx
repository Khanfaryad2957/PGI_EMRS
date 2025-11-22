import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { selectIsAuthenticated } from './features/auth/authSlice';
import { SessionProvider } from './contexts/SessionContext';
import SessionExpiredModal from './components/SessionExpiredModal';
import ProtectedRoute from './utils/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Patient Pages
import PatientsPage from './pages/patients/PatientsPage';
import CreatePatient from './pages/patients/CreatePatient';
import PatientDetails from './pages/patients/PatientDetails';
import SelectExistingPatient from './pages/patients/SelectExistingPatient';


// Walk-in Clinical Proforma Pages
import ClinicalProformaPage from './pages/clinical/ClinicalProformaPage';
// import CreateClinicalProforma from './pages/clinical/CreateClinicalProforma';
import EditClinicalProforma from './pages/clinical/EditClinicalProforma';
import ClinicalProformaDetails from './pages/clinical/ClinicalProformaDetails';

// Prescription Pages
// import CreatePrescription from './pages/PrescribeMedication/CreatePrescription';
import PrescriptionEdit from './pages/PrescribeMedication/PrescriptionEdit';
import PrescriptionView from './pages/PrescribeMedication/PrescriptionView';

// ADL File Pages
import ADLFilesPage from './pages/adl/ADLFilesPage';
import ADLFileDetails from './pages/adl/ADLFileDetails';

// User Management Pages
import UsersPage from './pages/users/UsersPage';
import CreateUser from './pages/users/CreateUser';
import EditUser from './pages/users/EditUser';

// Profile
import Profile from './pages/Profile';

// API Test (Development only)
import ApiTest from './pages/ApiTest';
import ClinicalTodayPatients from './pages/clinical/ClinincalTodayPatients';
import EditADL from './pages/adl/EditADL';
import ViewADL from './pages/adl/ViewADL';

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <BrowserRouter>
      <SessionProvider>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/forgot-password"
            element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />}
          />
          <Route
            path="/verify-otp"
            element={isAuthenticated ? <Navigate to="/" replace /> : <VerifyOTP />}
          />
          <Route
            path="/reset-password"
            element={isAuthenticated ? <Navigate to="/" replace /> : <ResetPassword />}
          />

          {/* Protected routes */}
          <Route element={<ProtectedRoute allowedRoles={[]} />}>
            <Route element={<MainLayout />}>
              {/* Dashboard */}
              <Route path="/" element={<Dashboard />} />
              
              {/* Patient Routes - All authenticated users */}
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/patients/new" element={<CreatePatient />} />
              <Route path="/patients/select" element={<SelectExistingPatient />} />
              <Route path="/patients/:id" element={<PatientDetails />} />


              {/* Walk-in Clinical Proforma - Faculty, Resident and Admin */}
              <Route element={<ProtectedRoute allowedRoles={['Admin', 'Faculty', 'Resident']} />}>
                <Route path="/clinical" element={<ClinicalProformaPage />} />
                {/* <Route path="/clinical/new" element={<CreateClinicalProforma />} /> */}
                <Route path="/clinical-today-patients" element={<ClinicalTodayPatients />} />
                <Route path="/clinical/:id" element={<ClinicalProformaDetails />} />
                <Route path="/clinical/:id/edit" element={<EditClinicalProforma />} />
              </Route>

              {/* Prescription Routes - Faculty, Resident and Admin */}
              <Route element={<ProtectedRoute allowedRoles={['Admin', 'Faculty', 'Resident']} />}>
                {/* <Route path="/prescriptions/create" element={<CreatePrescription />} /> */}
                <Route path="/prescriptions/edit/:id" element={<PrescriptionEdit />} />
                <Route path="/prescriptions/view" element={<PrescriptionView />} />
              </Route>

              {/* Out Patient Intake Record - Faculty, Resident and Admin */}
              <Route element={<ProtectedRoute allowedRoles={['Admin', 'Faculty', 'Resident']} />}>
                <Route path="/adl-files" element={<ADLFilesPage />} />
                {/* <Route path="/adl-files/:id" element={<ADLFileDetails />} /> */}
                <Route path="/adl-files/:id/edit" element={<EditADL />} />
                <Route path="/adl-files/:id/view" element={<ViewADL />} />
              </Route>

              {/* Users - Admin only */}
              <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/new" element={<CreateUser />} />
                <Route path="/users/:id/edit" element={<EditUser />} />
              </Route>

              {/* Profile - All authenticated users */}
              <Route path="/profile" element={<Profile />} />

              {/* API Test - Development only */}
              <Route path="/api-test" element={<ApiTest />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <SessionExpiredModal />
      </SessionProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  );
}

export default App;

