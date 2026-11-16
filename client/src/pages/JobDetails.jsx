import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isCandidate, isRecruiter } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Apply Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [useDefaultResume, setUseDefaultResume] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data.job);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // If candidate is logged in, fetch candidate profile to check for default resume and existing applications
  useEffect(() => {
    if (isCandidate) {
      const fetchCandidateData = async () => {
        try {
          const profileRes = await api.get('/candidate/profile');
          setCandidateProfile(profileRes.data.profile);
          if (!profileRes.data.profile.defaultResumePath) {
            setUseDefaultResume(false);
          }

          // Check if candidate already applied to this job
          const appsRes = await api.get('/applications/mine');
          const existing = appsRes.data.applications.find((a) => a.jobId === id);
          if (existing) {
            setHasApplied(true);
          }
        } catch (err) {
          console.error('Error fetching candidate status:', err);
        }
      };

      fetchCandidateData();
    }
  }, [isCandidate, id]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();

    if (!useDefaultResume && !selectedFile) {
      toast.error('Please upload a PDF resume or use your default profile resume');
      return;
    }

    if (selectedFile && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF documents are accepted');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    if (coverLetter.trim()) {
      formData.append('coverLetter', coverLetter.trim());
    }
    if (!useDefaultResume && selectedFile) {
      formData.append('resume', selectedFile);
    }

    try {
      await api.post(`/jobs/${id}/apply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Application submitted successfully!');
      setHasApplied(true);
      setShowApplyModal(false);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading job posting details..." />;
  }

  if (error || !job) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-white rounded-xl border border-slate-200 text-center">
        <h2 className="text-xl font-bold text-slate-800">Job Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">{error || 'This job does not exist or has been removed.'}</p>
        <Link
          to="/jobs"
          className="mt-6 inline-block px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium"
        >
          &larr; Back to Job Search
        </Link>
      </div>
    );
  }

  const isJobClosed = job.status === 'CLOSED';
  const isDeadlinePassed = job.deadline && new Date() > new Date(job.deadline);
  const isJobOwner = isRecruiter && job.postedById === user?.id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link to="/jobs" className="text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1">
          &larr; Back to all jobs
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
                {job.jobType.replace('_', ' ')}
              </span>
              <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                {job.workMode}
              </span>
              {isJobClosed && (
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md">
                  CLOSED
                </span>
              )}
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900">{job.title}</h1>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span className="font-semibold text-slate-800">{job.company?.name}</span>
              <span>&bull;</span>
              <span>{job.location}</span>
              {job.company?.website && (
                <>
                  <span>&bull;</span>
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:underline text-xs"
                  >
                    Visit Website &#8599;
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Action CTA */}
          <div className="md:text-right shrink-0">
            <div className="text-xl font-extrabold text-slate-900">
              ₹{(job.salaryMin / 100000).toFixed(1)}L - ₹{(job.salaryMax / 100000).toFixed(1)}L
            </div>
            <div className="text-xs text-slate-400 mb-4">Estimated Annual CTC</div>

            {isJobOwner ? (
              <Link
                to={`/recruiter/jobs/${job.id}/applicants`}
                className="inline-block px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
              >
                Manage Applicants &rarr;
              </Link>
            ) : hasApplied ? (
              <span className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                &check; Already Applied
              </span>
            ) : isJobClosed || isDeadlinePassed ? (
              <span className="inline-block px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-500">
                Applications Closed
              </span>
            ) : isCandidate ? (
              <button
                onClick={() => setShowApplyModal(true)}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
              >
                Apply Now
              </button>
            ) : !isAuthenticated ? (
              <Link
                to="/login"
                className="inline-block px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
              >
                Sign In to Apply
              </Link>
            ) : null}
          </div>
        </div>

        {/* Quick specs grid */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Experience</span>
            <span className="font-semibold text-slate-800">
              {job.experienceRequired === 0 ? 'Fresher (0 years)' : `${job.experienceRequired}+ Years`}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Posted On</span>
            <span className="font-semibold text-slate-800">
              {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Application Deadline</span>
            <span className="font-semibold text-slate-800">
              {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Rolling basis'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Location Type</span>
            <span className="font-semibold text-slate-800">{job.workMode}</span>
          </div>
        </div>
      </div>

      {/* Main Body Columns */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description & Skills */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Job Description</h2>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>

            <h3 className="text-sm font-bold text-slate-900 mt-8 mb-3">Required Technical Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills?.split(',').map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold"
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Company Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">About the Company</h3>
            <div className="font-bold text-slate-800">{job.company?.name}</div>
            {job.company?.location && (
              <div className="text-xs text-slate-500 mt-0.5">{job.company.location}</div>
            )}
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              {job.company?.description || 'No description provided by employer.'}
            </p>
            {job.company?.website && (
              <a
                href={job.company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block text-center py-2 px-3 border border-slate-200 hover:border-teal-500 rounded-lg text-xs font-semibold text-slate-700 transition"
              >
                Visit Employer Website &#8599;
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Apply for {job.title}</h3>
                <p className="text-xs text-slate-500">{job.company?.name}</p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              {/* Default Resume Toggle */}
              {candidateProfile?.defaultResumePath ? (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useDefaultResume}
                      onChange={(e) => setUseDefaultResume(e.target.checked)}
                      className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 block">
                        Use profile default resume
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ({candidateProfile.defaultResumePath.split('/').pop()})
                      </span>
                    </div>
                  </label>
                </div>
              ) : null}

              {/* Upload New Resume (if not using default or no default exists) */}
              {(!useDefaultResume || !candidateProfile?.defaultResumePath) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Upload Resume (PDF, max 2MB) *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  />
                </div>
              )}

              {/* Cover Letter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cover Letter (Optional)
                </label>
                <textarea
                  rows={4}
                  placeholder="Introduce yourself and explain why you are a great fit..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
