import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        const res = await api.get('/jobs?limit=3');
        setFeaturedJobs(res.data.data || []);
      } catch (err) {
        console.error('Failed to load featured jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentJobs();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/jobs?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/jobs');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-teal-50/50 to-white py-16 md:py-24 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-teal-800 uppercase bg-teal-100/80 rounded-full mb-4">
            Next-Generation Job Portal
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Connecting Top Talent with <br className="hidden sm:inline" />
            <span className="text-teal-600">Ambitious Companies</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Discover verified tech opportunities, apply seamlessly with your resume,
            and monitor your application lifecycle in real-time.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-xl shadow-md border border-slate-200"
          >
            <div className="flex-1 flex items-center px-3">
              <svg className="w-5 h-5 text-slate-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Job title, skills (e.g. React, Node.js), or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-lg shadow-sm transition"
            >
              Search Jobs
            </button>
          </form>

          {/* Quick Stats Banner */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-center">
            <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-xs">
              <div className="text-2xl font-bold text-teal-600">100%</div>
              <div className="text-xs text-slate-500 mt-0.5">Verified Companies</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-xs">
              <div className="text-2xl font-bold text-teal-600">Real-Time</div>
              <div className="text-xs text-slate-500 mt-0.5">Status Tracking</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-xs">
              <div className="text-2xl font-bold text-teal-600">1-Click</div>
              <div className="text-xs text-slate-500 mt-0.5">Resume Apply</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-xs">
              <div className="text-2xl font-bold text-teal-600">Zero</div>
              <div className="text-xs text-slate-500 mt-0.5">Hidden Fees</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Opportunities</h2>
            <p className="text-sm text-slate-500 mt-1">Explore our latest verified engineering and technical roles</p>
          </div>
          <Link
            to="/jobs"
            className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            View all jobs &rarr;
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading featured postings..." />
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md hover:border-teal-300 transition"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {job.jobType.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">{job.workMode}</span>
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-slate-900 leading-snug line-clamp-1">
                    {job.title}
                  </h3>
                  <div className="text-sm font-medium text-slate-600 mt-1">
                    {job.company?.name} &bull; {job.location}
                  </div>

                  <p className="mt-3 text-xs text-slate-500 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1">
                    {job.skills?.split(',').slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-800">
                    ₹{(job.salaryMin / 100000).toFixed(1)}L - ₹{(job.salaryMax / 100000).toFixed(1)}L
                  </div>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                  >
                    View Job &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Role CTA Section */}
      <section className="bg-slate-100/70 py-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl mb-4">
              👨‍💻
            </div>
            <h3 className="text-xl font-bold text-slate-900">Looking for a Job?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Create your profile, upload your PDF resume, browse filtered job postings,
              and track your interview journey step-by-step.
            </p>
            <div className="mt-6">
              <Link
                to="/register"
                className="inline-block px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
              >
                Register as Candidate
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center font-bold text-xl mb-4">
              🏢
            </div>
            <h3 className="text-xl font-bold text-slate-900">Hiring Talent?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Post technical roles, inspect applicant resumes with single-click downloads,
              and update recruitment pipeline statuses with internal notes.
            </p>
            <div className="mt-6">
              <Link
                to="/register"
                className="inline-block px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition"
              >
                Register as Employer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
