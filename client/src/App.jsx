import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import JobsList from './pages/JobsList';
import JobDetails from './pages/JobDetails';
import Login from './pages/Login';
import Register from './pages/Register';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateProfile from './pages/candidate/CandidateProfile';
import MyApplications from './pages/candidate/MyApplications';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import MyJobs from './pages/recruiter/MyJobs';
import JobForm from './pages/recruiter/JobForm';
import Applicants from './pages/recruiter/Applicants';
import CompanyProfile from './pages/recruiter/CompanyProfile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                fontSize: '13px',
                borderRadius: '10px'
              }
            }}
          />
          <Navbar />

          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<JobsList />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Candidate Protected Routes */}
              <Route
                path="/candidate/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['CANDIDATE']}>
                    <CandidateDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/profile"
                element={
                  <ProtectedRoute allowedRoles={['CANDIDATE']}>
                    <CandidateProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/applications"
                element={
                  <ProtectedRoute allowedRoles={['CANDIDATE']}>
                    <MyApplications />
                  </ProtectedRoute>
                }
              />

              {/* Recruiter Protected Routes */}
              <Route
                path="/recruiter/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <RecruiterDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <MyJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/new"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <JobForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <JobForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/:id/applicants"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <Applicants />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/company"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <CompanyProfile />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-All */}
              <Route
                path="*"
                element={
                  <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center">
                    <h1 className="text-4xl font-extrabold text-teal-600">404</h1>
                    <h2 className="text-lg font-bold text-slate-800 mt-2">Page Not Found</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      The page you were looking for does not exist.
                    </p>
                    <a
                      href="/"
                      className="mt-4 inline-block px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold"
                    >
                      Return Home
                    </a>
                  </div>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
