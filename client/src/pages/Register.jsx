import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    email: z.string().trim().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['CANDIDATE', 'RECRUITER']),
    companyName: z.string().trim().optional()
  })
  .refine(
    (data) => {
      if (data.role === 'RECRUITER') {
        return typeof data.companyName === 'string' && data.companyName.trim().length >= 2;
      }
      return true;
    },
    {
      message: 'Company name is required for recruiter registration',
      path: ['companyName']
    }
  );

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'CANDIDATE'
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await registerUser(data);
      toast.success(`Account created successfully! Welcome to HireLoop, ${user.name}`);
      if (user.role === 'RECRUITER') {
        navigate('/recruiter/dashboard', { replace: true });
      } else {
        navigate('/candidate/dashboard', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Registration failed. Please check form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center">
          <div className="w-12 h-12 bg-teal-600 rounded-xl mx-auto flex items-center justify-center text-white font-black text-2xl shadow-sm">
            H
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
            Create your HireLoop Account
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">
              Sign in instead
            </Link>
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            I want to use HireLoop as a:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValue('role', 'CANDIDATE', { shouldValidate: true })}
              className={`py-3 px-3 rounded-xl border text-center transition ${
                selectedRole === 'CANDIDATE'
                  ? 'border-teal-600 bg-teal-50/50 text-teal-800 font-bold ring-1 ring-teal-600'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="text-base mb-0.5">👨‍💻</div>
              <div className="text-xs">Candidate</div>
              <div className="text-[10px] text-slate-400 font-normal">Job Seeker</div>
            </button>

            <button
              type="button"
              onClick={() => setValue('role', 'RECRUITER', { shouldValidate: true })}
              className={`py-3 px-3 rounded-xl border text-center transition ${
                selectedRole === 'RECRUITER'
                  ? 'border-teal-600 bg-teal-50/50 text-teal-800 font-bold ring-1 ring-teal-600'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="text-base mb-0.5">🏢</div>
              <div className="text-xs">Recruiter</div>
              <div className="text-[10px] text-slate-400 font-normal">Employer</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Sarah Jenkins"
              {...register('name')}
              className={`w-full text-xs p-3 rounded-lg border ${
                errors.name ? 'border-rose-300 ring-1 ring-rose-300' : 'border-slate-300'
              } focus:outline-none focus:ring-1 focus:ring-teal-500`}
            />
            {errors.name && (
              <p className="mt-1 text-[11px] text-rose-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              className={`w-full text-xs p-3 rounded-lg border ${
                errors.email ? 'border-rose-300 ring-1 ring-rose-300' : 'border-slate-300'
              } focus:outline-none focus:ring-1 focus:ring-teal-500`}
            />
            {errors.email && (
              <p className="mt-1 text-[11px] text-rose-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password (min. 6 characters) *
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={`w-full text-xs p-3 rounded-lg border ${
                errors.password ? 'border-rose-300 ring-1 ring-rose-300' : 'border-slate-300'
              } focus:outline-none focus:ring-1 focus:ring-teal-500`}
            />
            {errors.password && (
              <p className="mt-1 text-[11px] text-rose-600">{errors.password.message}</p>
            )}
          </div>

          {/* Conditional Company Name Field for Recruiters */}
          {selectedRole === 'RECRUITER' && (
            <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-200">
              <label className="block text-xs font-semibold text-teal-900 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Technologies"
                {...register('companyName')}
                className={`w-full text-xs p-3 rounded-lg border bg-white ${
                  errors.companyName ? 'border-rose-300 ring-1 ring-rose-300' : 'border-teal-300'
                } focus:outline-none focus:ring-1 focus:ring-teal-500`}
              />
              {errors.companyName && (
                <p className="mt-1 text-[11px] text-rose-600">{errors.companyName.message}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : `Register as ${selectedRole === 'RECRUITER' ? 'Recruiter' : 'Candidate'}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
