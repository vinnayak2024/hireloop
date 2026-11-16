import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/recruiter/stats');
        setStats(res.data.stats);
      } catch (err) {
        console.error('Failed to load recruiter stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading recruiter dashboard..." />;
  }

  // Prepare chart data for application status distribution
  const chartData = [
    { name: 'Applied', count: stats?.statusCounts?.APPLIED || 0, color: '#3b82f6' },
    { name: 'Under Review', count: stats?.statusCounts?.UNDER_REVIEW || 0, color: '#f59e0b' },
    { name: 'Shortlisted', count: stats?.statusCounts?.SHORTLISTED || 0, color: '#10b981' },
    { name: 'Rejected', count: stats?.statusCounts?.REJECTED || 0, color: '#f43f5e' },
    { name: 'Withdrawn', count: stats?.statusCounts?.WITHDRAWN || 0, color: '#94a3b8' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Employer Dashboard &bull; {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track hiring pipeline metrics, manage active job openings, and review applicants.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/recruiter/company"
            className="px-3.5 py-2 border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Company Profile
          </Link>
          <Link
            to="/recruiter/jobs/new"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
          >
            + Post a New Job
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Postings</span>
          <span className="text-2xl font-extrabold text-slate-900">{stats?.totalJobs || 0}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-teal-600 block mb-1">Open Jobs</span>
          <span className="text-2xl font-extrabold text-teal-600">{stats?.openJobs || 0}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-blue-600 block mb-1">Total Applicants</span>
          <span className="text-2xl font-extrabold text-blue-600">{stats?.totalApplicants || 0}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 block mb-1">Shortlisted</span>
          <span className="text-2xl font-extrabold text-emerald-600">
            {stats?.statusCounts?.SHORTLISTED || 0}
          </span>
        </div>
      </div>

      {/* Application Status Analytics Bar Chart */}
      <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Application Pipeline Distribution</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of all candidate submissions across recruitment stages
            </p>
          </div>
          <Link
            to="/recruiter/jobs"
            className="text-xs font-semibold text-teal-600 hover:underline"
          >
            Manage Postings &rarr;
          </Link>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
