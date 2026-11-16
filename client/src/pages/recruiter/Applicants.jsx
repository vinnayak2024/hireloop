import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import TimelineModal from '../../components/candidate/TimelineModal';

const Applicants = () => {
  const { id: jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Status update modal state
  const [statusModalApp, setStatusModalApp] = useState(null);
  const [targetStatus, setTargetStatus] = useState('UNDER_REVIEW');
  const [recruiterNote, setRecruiterNote] = useState('');
  const [updating, setUpdating] = useState(false);

  // Resume download loading state
  const [downloadingId, setDownloadingId] = useState(null);
  const [timelineAppId, setTimelineAppId] = useState(null);

  const fetchJobAndApplicants = async () => {
    try {
      const [jobRes, appsRes] = await Promise.all([
        api.get(`/jobs/${jobId}`),
        api.get(`/jobs/${jobId}/applications`, {
          params: {
            status: statusFilter || undefined,
            search: searchTerm.trim() || undefined
          }
        })
      ]);
      setJob(jobRes.data.job);
      setApplicants(appsRes.data.applications);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobAndApplicants();
  }, [jobId, statusFilter, searchTerm]);

  const handleOpenStatusModal = (application) => {
    setStatusModalApp(application);
    // Suggest next sensible status based on current
    if (application.status === 'APPLIED') {
      setTargetStatus('UNDER_REVIEW');
    } else if (application.status === 'UNDER_REVIEW') {
      setTargetStatus('SHORTLISTED');
    } else {
      setTargetStatus(application.status);
    }
    setRecruiterNote(application.recruiterNote || '');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusModalApp) return;

    setUpdating(true);
    try {
      await api.patch(`/applications/${statusModalApp.id}/status`, {
        status: targetStatus,
        recruiterNote: recruiterNote.trim() || undefined
      });
      toast.success('Application status updated successfully');
      setStatusModalApp(null);
      await fetchJobAndApplicants();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadResume = async (applicationId, candidateName) => {
    setDownloadingId(applicationId);
    try {
      const res = await api.get(`/applications/${applicationId}/resume`, {
        responseType: 'blob'
      });

      // Create browser blob URL and trigger download
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const sanitizedName = (candidateName || 'Applicant').replace(/[^a-zA-Z0-9]/g, '_');
      link.setAttribute('download', `${sanitizedName}_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Resume downloaded');
    } catch (err) {
      toast.error('Failed to download resume file');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading applicants..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Back Link */}
      <div className="mb-6">
        <Link to="/recruiter/jobs" className="text-xs font-semibold text-teal-600 hover:underline">
          &larr; Back to My Jobs
        </Link>
        <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Applicants: {job?.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {job?.company?.name} &bull; {job?.location} &bull; {applicants.length} Total Submissions
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search candidate by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <label htmlFor="statusFilter" className="text-xs font-semibold text-slate-600">
            Filter Status:
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="">All Statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="REJECTED">Rejected</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Applicants Table */}
      {applicants.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No applicants found"
            message={
              searchTerm || statusFilter
                ? 'No applicants matched your search or status filter.'
                : 'No candidates have applied to this job yet.'
            }
          />
        </div>
      ) : (
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Candidate Details</th>
                  <th className="px-6 py-3.5">Experience & Skills</th>
                  <th className="px-6 py-3.5">Applied Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Resume</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {applicants.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {app.candidate?.name}
                      </div>
                      <div className="text-[11px] text-slate-500">{app.candidate?.email}</div>
                      {app.candidate?.candidateProfile?.phone && (
                        <div className="text-[11px] text-slate-400">
                          {app.candidate.candidateProfile.phone}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 block">
                        {app.candidate?.candidateProfile?.experienceYears || 0} Years Exp
                      </span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">
                        {app.candidate?.candidateProfile?.skills || 'No skills listed'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                      {app.recruiterNote && (
                        <div className="text-[10px] text-slate-400 mt-1 italic truncate max-w-xs">
                          "{app.recruiterNote}"
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDownloadResume(app.id, app.candidate.name)}
                        disabled={downloadingId === app.id}
                        className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md border border-teal-200 transition disabled:opacity-50"
                      >
                        {downloadingId === app.id ? 'Downloading...' : '📄 Download PDF'}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setTimelineAppId(app.id)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                      >
                        Timeline
                      </button>

                      {app.status !== 'WITHDRAWN' && (
                        <button
                          onClick={() => handleOpenStatusModal(app)}
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-semibold transition"
                        >
                          Change Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {statusModalApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Update Candidate Status
                </h3>
                <p className="text-xs text-slate-500">
                  Candidate: <span className="font-semibold">{statusModalApp.candidate?.name}</span>
                </p>
              </div>
              <button
                onClick={() => setStatusModalApp(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Status *
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500 focus:outline-none bg-white"
                >
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="SHORTLISTED">Shortlisted (Selected for Interview)</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recruiter Feedback / Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Cleared technical screening; schedule round 2."
                  value={recruiterNote}
                  onChange={(e) => setRecruiterNote(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalApp(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition"
                >
                  {updating ? 'Updating...' : 'Save Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {timelineAppId && (
        <TimelineModal
          applicationId={timelineAppId}
          onClose={() => setTimelineAppId(null)}
        />
      )}
    </div>
  );
};

export default Applicants;
