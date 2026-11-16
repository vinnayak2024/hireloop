import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const JobsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state initialized from URL query params
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || '');
  const [workMode, setWorkMode] = useState(searchParams.get('workMode') || '');
  const [experience, setExperience] = useState(searchParams.get('experience') || '');
  const [minSalary, setMinSalary] = useState(searchParams.get('minSalary') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Sync state when URL params change
  useEffect(() => {
    setQ(searchParams.get('q') || '');
    setLocation(searchParams.get('location') || '');
    setJobType(searchParams.get('jobType') || '');
    setWorkMode(searchParams.get('workMode') || '');
    setExperience(searchParams.get('experience') || '');
    setMinSalary(searchParams.get('minSalary') || '');
    setSort(searchParams.get('sort') || 'newest');
    setPage(parseInt(searchParams.get('page'), 10) || 1);
  }, [searchParams]);

  // Fetch jobs whenever query changes
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (location) params.set('location', location);
        if (jobType) params.set('jobType', jobType);
        if (workMode) params.set('workMode', workMode);
        if (experience) params.set('experience', experience);
        if (minSalary) params.set('minSalary', minSalary);
        if (sort) params.set('sort', sort);
        params.set('page', page);
        params.set('limit', 8);

        const res = await api.get(`/jobs?${params.toString()}`);
        setJobs(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [searchParams, page]);

  const applyFilters = (e) => {
    if (e) e.preventDefault();
    const newParams = new URLSearchParams();
    if (q) newParams.set('q', q);
    if (location) newParams.set('location', location);
    if (jobType) newParams.set('jobType', jobType);
    if (workMode) newParams.set('workMode', workMode);
    if (experience) newParams.set('experience', experience);
    if (minSalary) newParams.set('minSalary', minSalary);
    if (sort) newParams.set('sort', sort);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setQ('');
    setLocation('');
    setJobType('');
    setWorkMode('');
    setExperience('');
    setMinSalary('');
    setSort('newest');
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', newPage.toString());
      setSearchParams(newParams);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner & Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Explore Open Positions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing {jobs.length} of {total} available jobs
          </p>
        </div>

        {/* Sort Select */}
        <div className="flex items-center space-x-2">
          <label htmlFor="sortSelect" className="text-xs font-semibold text-slate-600">
            Sort by:
          </label>
          <select
            id="sortSelect"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              const p = new URLSearchParams(searchParams);
              p.set('sort', e.target.value);
              p.set('page', '1');
              setSearchParams(p);
            }}
            className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="newest">Newest First</option>
            <option value="salary_high">Salary: High to Low</option>
            <option value="salary_low">Salary: Low to High</option>
          </select>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <form
            onSubmit={applyFilters}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5 sticky top-20"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Filters</h2>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                Reset All
              </button>
            </div>

            {/* Keyword */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Keywords</label>
              <input
                type="text"
                placeholder="Title, skill, company"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                placeholder="City or Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="">All Job Types</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>

            {/* Work Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Work Mode</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="">All Work Modes</option>
                <option value="ONSITE">On-Site</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Experience (Years)
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="">Any Experience</option>
                <option value="0">0 Years (Fresher / Intern)</option>
                <option value="1">Up to 1 Year</option>
                <option value="2">Up to 2 Years</option>
                <option value="3">Up to 3 Years</option>
                <option value="5">Up to 5 Years</option>
              </select>
            </div>

            {/* Min Salary */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Min Annual Salary (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 500000"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              Apply Filters
            </button>
          </form>
        </div>

        {/* Jobs List Main Area */}
        <div className="lg:col-span-3">
          {loading ? (
            <LoadingSpinner text="Searching jobs..." />
          ) : jobs.length === 0 ? (
            <EmptyState
              title="No jobs matched your criteria"
              message="Try broadening your search terms or clearing specific filters."
              action={
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition"
                >
                  Clear Filters
                </button>
              }
            />
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-teal-200 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          {job.jobType.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {job.workMode}
                        </span>
                        <span className="text-xs text-slate-500">
                          {job.experienceRequired === 0
                            ? 'Fresher / 0 yrs'
                            : `${job.experienceRequired}+ yrs exp`}
                        </span>
                      </div>

                      <h2 className="mt-2 text-lg font-bold text-slate-900">
                        <Link to={`/jobs/${job.id}`} className="hover:text-teal-600 transition">
                          {job.title}
                        </Link>
                      </h2>

                      <div className="text-sm font-medium text-slate-600 mt-1 flex items-center gap-2">
                        <span>{job.company?.name}</span>
                        <span>&bull;</span>
                        <span className="text-slate-500">{job.location}</span>
                      </div>
                    </div>

                    <div className="text-right sm:self-center">
                      <div className="text-sm font-bold text-slate-900">
                        ₹{(job.salaryMin / 100000).toFixed(1)}L - ₹{(job.salaryMax / 100000).toFixed(1)}L
                      </div>
                      <div className="text-[11px] text-slate-400">per annum</div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills?.split(',').map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>

                    <Link
                      to={`/jobs/${job.id}`}
                      className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition"
                    >
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                  <button
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="px-4 py-2 text-xs font-semibold border border-slate-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                  >
                    &larr; Previous
                  </button>

                  <span className="text-xs font-medium text-slate-600">
                    Page <span className="font-bold text-slate-900">{page}</span> of{' '}
                    <span className="font-bold text-slate-900">{totalPages}</span>
                  </span>

                  <button
                    disabled={page >= totalPages}
                    onClick={() => handlePageChange(page + 1)}
                    className="px-4 py-2 text-xs font-semibold border border-slate-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                  >
                    Next &rarr;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsList;
