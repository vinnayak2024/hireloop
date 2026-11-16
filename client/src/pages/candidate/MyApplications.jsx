import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import TimelineModal from '../../components/candidate/TimelineModal';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [activeTimelineId, setActiveTimelineId] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/applications/mine?status=${statusFilter}` : '/applications/mine';
      const res = await api.get(url);
      setApplications(res.data.applications);
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleWithdraw = async (applicationId, jobTitle) => {
    if (!window.confirm(`Are you sure you want to withdraw your application for "${jobTitle}"? This cannot be undone.`)) {
      return;
    }

    setWithdrawingId(applicationId);
    try {
      await api.patch(`/applications/${applicationId}/withdraw`);
      toast.success('Application withdrawn successfully');
      await fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to withdraw application');
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Job Applications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your application lifecycle, recruiter notes, and interview status.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="filterStatus" className="text-xs font-semibold text-slate-600">
            Filter Status:
          </label>
          <select
            id="filterStatus"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="">All Applications</option>
            <option value="APPLIED">Applied</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="REJECTED">Rejected</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading applications..." />
      ) : applications.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No applications found"
            message={
              statusFilter
                ? `You have zero applications currently marked as ${statusFilter.replace('_', ' ')}.`
                : 'You have not applied for any jobs yet.'
            }
            action={
              <Link
                to="/jobs"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition"
              >
                Browse Job Postings
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {applications.map((app) => {
            const canWithdraw = app.status === 'APPLIED' || app.status === 'UNDER_REVIEW';

            return (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-xs transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <StatusBadge status={app.status} />
                      <span className="text-xs text-slate-400">
                        Applied on {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-slate-900">
                      <Link to={`/jobs/${app.job.id}`} className="hover:text-teal-600 transition">
                        {app.job.title}
                      </Link>
                    </h2>

                    <div className="text-xs font-medium text-slate-600 mt-1">
                      {app.job.company.name} &bull; {app.job.location} &bull; {app.job.workMode}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-start sm:self-center shrink-0">
                    <button
                      onClick={() => setActiveTimelineId(app.id)}
                      className="px-3 py-1.5 border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg text-xs font-semibold transition"
                    >
                      Status Timeline
                    </button>

                    {canWithdraw && (
                      <button
                        onClick={() => handleWithdraw(app.id, app.job.title)}
                        disabled={withdrawingId === app.id}
                        className="px-3 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold disabled:opacity-50 transition"
                      >
                        {withdrawingId === app.id ? 'Withdrawing...' : 'Withdraw'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Recruiter Note if present */}
                {app.recruiterNote && (
                  <div className="mt-4 p-3 bg-teal-50/70 border border-teal-200 rounded-lg">
                    <div className="text-[11px] font-bold text-teal-900 flex items-center gap-1.5">
                      <span>💬</span> Note from Employer:
                    </div>
                    <p className="text-xs text-teal-800 mt-1 italic">
                      "{app.recruiterNote}"
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline Modal */}
      {activeTimelineId && (
        <TimelineModal
          applicationId={activeTimelineId}
          onClose={() => setActiveTimelineId(null)}
        />
      )}
    </div>
  );
};

export default MyApplications;
