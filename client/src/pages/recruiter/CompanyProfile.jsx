import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const companySchema = z.object({
  name: z.string().trim().min(2, 'Company name must be at least 2 characters'),
  website: z.string().trim().url('Must be a valid URL (e.g. https://example.com)').optional().or(z.literal('')),
  location: z.string().trim().optional(),
  description: z.string().trim().optional()
});

const CompanyProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(companySchema)
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get('/recruiter/company');
        const comp = res.data.company;
        reset({
          name: comp.name || '',
          website: comp.website || '',
          location: comp.location || '',
          description: comp.description || ''
        });
      } catch (err) {
        toast.error('Failed to load company profile');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await api.put('/recruiter/company', data);
      toast.success('Company profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update company');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading company profile..." />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Employer Company Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Candidate applicants will see these company details on all your job postings.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Company Name *
          </label>
          <input
            type="text"
            placeholder="e.g. CloudNexus Solutions"
            {...register('name')}
            className={`w-full text-xs p-3 rounded-lg border ${
              errors.name ? 'border-rose-300' : 'border-slate-300'
            } focus:ring-1 focus:ring-teal-500 focus:outline-none`}
          />
          {errors.name && <p className="mt-1 text-[11px] text-rose-600">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Website URL
            </label>
            <input
              type="text"
              placeholder="https://example.com"
              {...register('website')}
              className={`w-full text-xs p-3 rounded-lg border ${
                errors.website ? 'border-rose-300' : 'border-slate-300'
              } focus:ring-1 focus:ring-teal-500 focus:outline-none`}
            />
            {errors.website && (
              <p className="mt-1 text-[11px] text-rose-600">{errors.website.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Headquarters / Location
            </label>
            <input
              type="text"
              placeholder="e.g. Bangalore, India"
              {...register('location')}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Company Description
          </label>
          <textarea
            rows={5}
            placeholder="Tell candidates about your company mission, tech stack, and engineering culture..."
            {...register('description')}
            className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
          >
            {saving ? 'Saving Company Details...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfile;
