import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isRecruiter, isCandidate, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Main Nav */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-sm">
                H
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                Hire<span className="text-teal-600">Loop</span>
              </span>
            </Link>

            <div className="hidden md:flex md:ml-8 md:space-x-4">
              <Link
                to="/jobs"
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-slate-50 transition"
              >
                Find Jobs
              </Link>

              {isCandidate && (
                <>
                  <Link
                    to="/candidate/dashboard"
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-slate-50 transition"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/candidate/applications"
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-slate-50 transition"
                  >
                    My Applications
                  </Link>
                  <Link
                    to="/candidate/profile"
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-slate-50 transition"
                  >
                    Profile
                  </Link>
                </>
              )}

              {isRecruiter && (
                <>
                  <Link
                    to="/recruiter/dashboard"
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-slate-50 transition"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/recruiter/jobs"
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-slate-50 transition"
                  >
                    My Jobs
                  </Link>
                  <Link
                    to="/recruiter/company"
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-slate-50 transition"
                  >
                    Company
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Side Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {isRecruiter && (
                  <Link
                    to="/recruiter/jobs/new"
                    className="inline-flex items-center px-3.5 py-1.5 border border-transparent text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition"
                  >
                    + Post a Job
                  </Link>
                )}

                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-900 leading-tight">
                      {user?.name}
                    </div>
                    <div className="text-[10px] text-teal-700 font-medium uppercase tracking-wider">
                      {user?.role}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-500 hover:text-slate-800 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 px-4 pt-2 pb-4 space-y-2 bg-white">
          <Link
            to="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Find Jobs
          </Link>
          {isCandidate && (
            <>
              <Link
                to="/candidate/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <Link
                to="/candidate/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                My Applications
              </Link>
              <Link
                to="/candidate/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Profile
              </Link>
            </>
          )}
          {isRecruiter && (
            <>
              <Link
                to="/recruiter/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <Link
                to="/recruiter/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                My Jobs
              </Link>
              <Link
                to="/recruiter/jobs/new"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-teal-600 hover:bg-slate-50 font-semibold"
              >
                + Post a Job
              </Link>
            </>
          )}

          <div className="pt-4 border-t border-slate-200">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-800 px-3">{user?.name} ({user?.role})</div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-rose-600 font-medium rounded-md hover:bg-rose-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-center text-slate-700 font-medium rounded-lg border border-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-center text-white font-medium bg-teal-600 rounded-lg"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
