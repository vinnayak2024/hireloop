import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-teal-600 rounded flex items-center justify-center text-white font-bold text-sm">
              H
            </div>
            <span className="font-bold text-slate-800">HireLoop</span>
            <span className="text-xs text-slate-400">| Job Portal Platform</span>
          </div>
          <div className="flex space-x-6 text-sm text-slate-500">
            <Link to="/jobs" className="hover:text-teal-600">Browse Jobs</Link>
            <Link to="/login" className="hover:text-teal-600">Recruiter Portal</Link>
            <Link to="/register" className="hover:text-teal-600">Candidate Registration</Link>
          </div>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} HireLoop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
