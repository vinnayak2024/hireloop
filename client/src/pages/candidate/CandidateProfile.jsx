import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const profileSchema = z.object({
  phone: z.string().trim().optional(),
  location: z.string().trim().optional(),
  headline: z.string().trim().optional(),
  skills: z.string().trim().optional(),
  experienceYears: z.coerce.number().int().nonnegative('Years of experience must be 0 or greater').optional()
});

const CandidateProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(profileSchema)
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get('/candidate/profile');
      setProfile(res.data.profile);
      reset({
        phone: res.data.profile.phone || '',
        location: res.data.profile.location || '',
        headline: res.data.profile.headline || '',
        skills: res.data.profile.skills || '',
        experienceYears: res.data.profile.experienceYears || 0
      });
    } catch (err) {
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onProfileSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await api.put('/candidate/profile', data);
      setProfile(res.data.profile);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      toast.error('Please choose a PDF file to upload');
      return;
    }

    if (!resumeFile.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF documents (.pdf) are permitted');
      return;
    }

    if (resumeFile.size > 2 * 1024 * 1024) {
      toast.error('File size exceeds 2MB limit');
      return;
    }

    setUploadingResume(true);
    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      const res = await api.post('/candidate/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Default resume uploaded successfully!');
      setResumeFile(null);
      await fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Candidate Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details, professional experience, and default resume.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Details Form */}
        <div className="md:col-span-2">
          <form
            onSubmit={handleSubmit(onProfileSubmit)}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5"
          >
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Personal Information
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={profile?.user?.name || ''}
                className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={profile?.user?.email || ''}
                className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  {...register('phone')}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Location</label>
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
                Professional Headline
              </label>
              <input
                type="text"
                placeholder="e.g. Full Stack Developer | React & Node.js"
                {...register('headline')}
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('experienceYears')}
                  className={`w-full text-xs p-3 rounded-lg border ${
                    errors.experienceYears ? 'border-rose-300' : 'border-slate-300'
                  } focus:ring-1 focus:ring-teal-500 focus:outline-none`}
                />
                {errors.experienceYears && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.experienceYears.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="React, Node.js, SQL, Docker"
                  {...register('skills')}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
              >
                {saving ? 'Saving Changes...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        </div>

        {/* Default Resume Sidebar Card */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Default Resume
            </h2>

            {profile?.defaultResumePath ? (
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📄</span>
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold text-teal-900 block truncate">
                      {profile.defaultResumePath.split('/').pop()}
                    </span>
                    <span className="text-[10px] text-teal-700 block mt-0.5">
                      Ready for 1-click apply
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                No default resume on file.
              </div>
            )}

            <form onSubmit={handleResumeUpload} className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-700">
                Upload New Resume (PDF, max 2MB)
              </label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setResumeFile(e.target.files[0])}
                className="block w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              />

              <button
                type="submit"
                disabled={uploadingResume || !resumeFile}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition"
              >
                {uploadingResume ? 'Uploading...' : 'Upload & Save'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
