import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const jobSchema = z
  .object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters'),
    description: z.string().trim().min(10, 'Description must be at least 10 characters'),
    location: z.string().trim().min(2, 'Location is required'),
    jobType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT']),
    workMode: z.enum(['ONSITE', 'REMOTE', 'HYBRID']),
    salaryMin: z.coerce.number().int().nonnegative('Minimum salary must be 0 or greater'),
    salaryMax: z.coerce.number().int().nonnegative('Maximum salary must be 0 or greater'),
    skills: z.string().trim().min(2, 'Skills list is required'),
    experienceRequired: z.coerce.number().int().nonnegative('Experience required must be 0 or greater'),
    deadline: z.string().optional().nullable(),
    status: z.enum(['OPEN', 'CLOSED']).optional()
  })
  .refine((data) => data.salaryMax >= data.salaryMin, {
    message: 'Maximum salary must be greater than or equal to minimum salary',
    path: ['salaryMax']
  });

const JobForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      jobType: 'FULL_TIME',
      workMode: 'REMOTE',
      experienceRequired: 0,
      salaryMin: 500000,
      salaryMax: 1000000,
      status: 'OPEN'
    }
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchJob = async () => {
        try {
          const res = await api.get(`/jobs/${id}`);
          const job = res.data.job;
          reset({
            title: job.title,
            description: job.description,
            location: job.location,
            jobType: job.jobType,
            workMode: job.workMode,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            skills: job.skills,
            experienceRequired: job.experienceRequired,
            deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
            status: job.status
          });
        } catch (err) {
          toast.error('Failed to load job details for editing');
          navigate('/recruiter/jobs');
        } finally {
          setLoading(false);
        }
      };

      fetchJob();
    }
  }, [id, isEditMode, reset, navigate]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    const payload = {
      ...data,
      deadline: data.deadline ? new Date(data.deadline).toISOString() : null
    };

    try {
      if (isEditMode) {
        await api.put(`/jobs/${id}`, payload);
        toast.success('Job posting updated successfully!');
      } else {
        await api.post('/jobs', payload);
        toast.success('New job posting created successfully!');
      }
      navigate('/recruiter/jobs');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to save job posting');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading job form..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link to="/recruiter/jobs" className="text-xs font-semibold text-teal-600 hover:underline">
            &larr; Back to My Jobs
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">
            {isEditMode ? 'Edit Job Posting' : 'Post a New Job Opportunity'}
          </h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Job Title *
          </label>
          <input
            type="text"
            placeholder="e.g. Senior Full Stack React & Node Engineer"
            {...register('title')}
            className={`w-full text-xs p-3 rounded-lg border ${
              errors.title ? 'border-rose-300' : 'border-slate-300'
            } focus:ring-1 focus:ring-teal-500 focus:outline-none`}
          />
          {errors.title && <p className="mt-1 text-[11px] text-rose-600">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Type *
            </label>
            <select
              {...register('jobType')}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="CONTRACT">Contract</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Work Mode *
            </label>
            <select
              {...register('workMode')}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ONSITE">On-Site</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              placeholder="e.g. Bangalore, India"
              {...register('location')}
              className={`w-full text-xs p-3 rounded-lg border ${
                errors.location ? 'border-rose-300' : 'border-slate-300'
              } focus:ring-1 focus:ring-teal-500 focus:outline-none`}
            />
            {errors.location && (
              <p className="mt-1 text-[11px] text-rose-600">{errors.location.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Minimum Salary (₹ / yr) *
            </label>
            <input
              type="number"
              step="50000"
              {...register('salaryMin')}
              className={`w-full text-xs p-3 rounded-lg border ${
                errors.salaryMin ? 'border-rose-300' : 'border-slate-300'
              } focus:ring-1 focus:ring-teal-500 focus:outline-none`}
            />
            {errors.salaryMin && (
              <p className="mt-1 text-[11px] text-rose-600">{errors.salaryMin.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Maximum Salary (₹ / yr) *
            </label>
            <input
              type="number"
              step="50000"
              {...register('salaryMax')}
              className={`w-full text-xs p-3 rounded-lg border ${
                errors.salaryMax ? 'border-rose-300' : 'border-slate-300'
              } focus:ring-1 focus:ring-teal-500 focus:outline-none`}
            />
            {errors.salaryMax && (
              <p className="mt-1 text-[11px] text-rose-600">{errors.salaryMax.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Experience Required (Years) *
            </label>
            <input
              type="number"
              min="0"
              {...register('experienceRequired')}
              className={`w-full text-xs p-3 rounded-lg border ${
                errors.experienceRequired ? 'border-rose-300' : 'border-slate-300'
              } focus:ring-1 focus:ring-teal-500 focus:outline-none`}
            />
            {errors.experienceRequired && (
              <p className="mt-1 text-[11px] text-rose-600">{errors.experienceRequired.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Required Technical Skills (Comma-separated) *
          </label>
          <input
            type="text"
            placeholder="React, Node.js, Express, PostgreSQL, REST APIs"
            {...register('skills')}
            className={`w-full text-xs p-3 rounded-lg border ${
              errors.skills ? 'border-rose-300' : 'border-slate-300'
            } focus:ring-1 focus:ring-teal-500 focus:outline-none`}
          />
          {errors.skills && <p className="mt-1 text-[11px] text-rose-600">{errors.skills.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Application Deadline (Optional)
          </label>
          <input
            type="date"
            {...register('deadline')}
            className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Job Description & Responsibilities *
          </label>
          <textarea
            rows={6}
            placeholder="Describe the role, day-to-day responsibilities, requirements, and team culture..."
            {...register('description')}
            className={`w-full text-xs p-3 rounded-lg border ${
              errors.description ? 'border-rose-300' : 'border-slate-300'
            } focus:ring-1 focus:ring-teal-500 focus:outline-none`}
          />
          {errors.description && (
            <p className="mt-1 text-[11px] text-rose-600">{errors.description.message}</p>
          )}
        </div>

        {isEditMode && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Status
            </label>
            <select
              {...register('status')}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="OPEN">OPEN (Accepting Applications)</option>
              <option value="CLOSED">CLOSED (Archived / Filled)</option>
            </select>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            to="/recruiter/jobs"
            className="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition"
          >
            {submitting ? 'Saving Job...' : isEditMode ? 'Update Posting' : 'Publish Job Posting'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;
