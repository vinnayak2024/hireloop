import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/recruiter/jobs');
      setJobs(res.data.jobs);
    } catch (err) {
      toast.error('Failed to load your job postings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCloseJob = async (jobId, title) => {
    if (!window.confirm(`Are you sure you want to close "${title}"? Closed jobs are removed from public search.`)) {
      return;
    }

    setActionLoadingId(jobId);
    try {
      await api.patch(`/jobs/${jobId}/close`);
      toast.success('Job posting closed');
      await fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to close job');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteJob = async (jobId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    setActionLoadingId(jobId);
    try {
      const res = await api.delete(`/jobs/${jobId}`);
      if (res.data.softDeleted) {
        toast(res.data.message, { icon: 'ℹ️', duration: 4000 });
      } else {
        toast.success(res.data.message || 'Job deleted permanently');
      }
      await fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete job');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Job Postings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review active openings, manage applicants, and close or edit listings.
          </p>
        </div>

        <Link
          to="/recruiter/jobs/new"
          className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
        >
          + Create New Job
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading jobs..." />
      ) : jobs.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No job postings yet"
            message="Create your first job posting to start receiving qualified applicants."
            action={
              <Link
                to="/recruiter/jobs/new"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition"
              >
                Post Your First Job
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Job Title</th>
                  <th className="px-6 py-3.5">Type & Mode</th>
                  <th className="px-6 py-3.5">Salary Range</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Applicants</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {jobs.map((job) => {
                  const applicantCount = job._count?.applications || 0;
                  const isClosed = job.status === 'CLOSED';

                  return (
                    <tr key={job.id} className="hover:bg-slate-50/60">
                      <td className="px-6 py-4">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="font-bold text-slate-900 hover:text-teal-600 transition block text-sm"
                        >
                          {job.title}
                        </Link>
                        <span className="text-[11px] text-slate-400">
                          Posted on {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="block font-semibold text-slate-800">
                          {job.jobType.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400">{job.workMode}</span>
                      </td>

                      <td className="px-6 py-4 text-slate-800">
                        ₹{(job.salaryMin / 100000).toFixed(1)}L - ₹{(job.salaryMax / 100000).toFixed(1)}L
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isClosed
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <Link
                          to={`/recruiter/jobs/${job.id}/applicants`}
                          className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition"
                        >
                          👥 {applicantCount} Applicants
                        </Link>
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          to={`/recruiter/jobs/${job.id}/edit`}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                        >
                          Edit
                        </Link>

                        {!isClosed && (
                          <button
                            onClick={() => handleCloseJob(job.id, job.title)}
                            disabled={actionLoadingId === job.id}
                            className="text-xs font-semibold text-amber-600 hover:text-amber-700 disabled:opacity-50"
                          >
                            Close
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteJob(job.id, job.title)}
                          disabled={actionLoadingId === job.id}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobs;
