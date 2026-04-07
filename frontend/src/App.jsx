import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CandidateDashboard from './pages/candidate/Dashboard';
import CandidateProfile from './pages/candidate/Profile';
import Recommendations from './pages/candidate/Recommendations';
import Applications from './pages/candidate/Applications';
import RecruiterDashboard from './pages/recruiter/Dashboard';
import ManageInternships from './pages/recruiter/Internships';
import PostInternship from './pages/recruiter/PostInternship';
import Applicants from './pages/recruiter/Applicants';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import Verifications from './pages/admin/Verifications';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import VerifyEmail from './pages/VerifyEmail';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading Weave...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={user ? <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace /> : <Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Candidate */}
      <Route element={<ProtectedRoute roles={['CANDIDATE']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
        <Route path="/candidate/profile" element={<CandidateProfile />} />
        <Route path="/candidate/recommendations" element={<Recommendations />} />
        <Route path="/candidate/applications" element={<Applications />} />
      </Route>

      {/* Recruiter */}
      <Route element={<ProtectedRoute roles={['RECRUITER']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
        <Route path="/recruiter/internships" element={<ManageInternships />} />
        <Route path="/recruiter/internships/new" element={<PostInternship />} />
        <Route path="/recruiter/internships/:id/edit" element={<PostInternship />} />
        <Route path="/recruiter/applicants" element={<Applicants />} />
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute roles={['ADMIN']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/verifications" element={<Verifications />} />
      </Route>

      {/* Shared authenticated */}
      <Route element={<ProtectedRoute roles={['CANDIDATE', 'RECRUITER']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/chat" element={<Chat />} />
      </Route>
      <Route element={<ProtectedRoute roles={['CANDIDATE', 'RECRUITER', 'ADMIN']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster position="top-right" toastOptions={{
            duration: 3000,
            style: { fontSize: '14px', borderRadius: '10px', padding: '12px 16px' },
          }} />
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
