import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TimelineModal from '../../components/candidate/TimelineModal';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTimelineAppId, setActiveTimelineAppId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, appsRes] = await Promise.all([
          api.get('/candidate/profile'),
          api.get('/applications/mine')
        ]);
        setProfile(profileRes.data.profile);
        setApplications(appsRes.data.applications);
      } catch (err) {
        console.error('Failed to load candidate dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading candidate workspace..." />;
  }

  const totalApps = applications.length;
  const underReviewCount = applications.filter((a) => a.status === 'UNDER_REVIEW').length;
  const shortlistedCount = applications.filter((a) => a.status === 'SHORTLISTED').length;
  const rejectedCount = applications.filter((a) => a.status === 'REJECTED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name} 👋</h1>
          <p className="text-xs text-slate-500 mt-1">
            {profile?.headline || 'Candidate Portal'} &bull; {profile?.location || 'Location not set'}
          </p>
        </div>
        <Link
          to="/jobs"
          className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          Search New Jobs &rarr;
        </Link>
      </div>

      {/* Resume Missing Alert */}
      {!profile?.defaultResumePath && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">📄</span>
            <div>
              <div className="text-xs font-bold text-amber-900">Default Resume Missing</div>
              <div className="text-xs text-amber-700 mt-0.5">
                Upload your PDF resume once in your profile to enable seamless 1-click applications.
              </div>
            </div>
          </div>
          <Link
            to="/candidate/profile"
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shrink-0 transition"
          >
            Upload Resume
          </Link>
        </div>
      )}

      {/* Metric Cards */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Applied</span>
          <span className="text-2xl font-extrabold text-slate-900">{totalApps}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 block mb-1">Under Review</span>
          <span className="text-2xl font-extrabold text-amber-600">{underReviewCount}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 block mb-1">Shortlisted</span>
          <span className="text-2xl font-extrabold text-emerald-600">{shortlistedCount}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-rose-600 block mb-1">Rejected</span>
          <span className="text-2xl font-extrabold text-rose-600">{rejectedCount}</span>
        </div>
      </div>

      {/* Recent Applications Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Recent Applications</h2>
          <Link
            to="/candidate/applications"
            className="text-xs font-semibold text-teal-600 hover:underline"
          >
            View All ({totalApps}) &rarr;
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
            <p className="text-xs text-slate-500">You have not submitted any applications yet.</p>
            <Link
              to="/jobs"
              className="mt-3 inline-block text-xs font-semibold text-teal-600 hover:underline"
            >
              Explore Open Jobs &rarr;
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Job Title & Company</th>
                    <th className="px-6 py-3">Applied On</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {applications.slice(0, 5).map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/60">
                      <td className="px-6 py-4">
                        <Link
                          to={`/jobs/${app.job.id}`}
                          className="font-bold text-slate-900 hover:text-teal-600 transition block"
                        >
                          {app.job.title}
                        </Link>
                        <span className="text-[11px] text-slate-500">
                          {app.job.company.name} &bull; {app.job.location}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setActiveTimelineAppId(app.id)}
                          className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                        >
                          Timeline &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Modal */}
      {activeTimelineAppId && (
        <TimelineModal
          applicationId={activeTimelineAppId}
          onClose={() => setActiveTimelineAppId(null)}
        />
      )}
    </div>
  );
};

export default CandidateDashboard;
