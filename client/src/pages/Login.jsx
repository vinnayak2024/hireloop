import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name}!`);

      // Determine redirect path
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'RECRUITER') {
        navigate('/recruiter/dashboard', { replace: true });
      } else {
        navigate('/candidate/dashboard', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for student viva demo
  const quickFill = (email, password = 'password123') => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center">
          <div className="w-12 h-12 bg-teal-600 rounded-xl mx-auto flex items-center justify-center text-white font-black text-2xl shadow-sm">
            H
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to HireLoop
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-700">
              Create one now
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
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
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
            </div>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Quick-Fill for Viva */}
        <div className="pt-6 border-t border-slate-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
            Demo Credentials (1-Click Fill)
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => quickFill('sarah@cloudnexus.io')}
              className="p-2 border border-slate-200 hover:border-teal-500 rounded-lg text-left bg-slate-50 hover:bg-teal-50/50 transition"
            >
              <div className="font-bold text-slate-800">Recruiter 1</div>
              <div className="text-slate-500 truncate">sarah@cloudnexus.io</div>
            </button>

            <button
              type="button"
              onClick={() => quickFill('rajesh@finscale.tech')}
              className="p-2 border border-slate-200 hover:border-teal-500 rounded-lg text-left bg-slate-50 hover:bg-teal-50/50 transition"
            >
              <div className="font-bold text-slate-800">Recruiter 2</div>
              <div className="text-slate-500 truncate">rajesh@finscale.tech</div>
            </button>

            <button
              type="button"
              onClick={() => quickFill('aarav@candidate.com')}
              className="p-2 border border-slate-200 hover:border-teal-500 rounded-lg text-left bg-slate-50 hover:bg-teal-50/50 transition"
            >
              <div className="font-bold text-slate-800">Candidate 1</div>
              <div className="text-slate-500 truncate">aarav@candidate.com</div>
            </button>

            <button
              type="button"
              onClick={() => quickFill('priya@candidate.com')}
              className="p-2 border border-slate-200 hover:border-teal-500 rounded-lg text-left bg-slate-50 hover:bg-teal-50/50 transition"
            >
              <div className="font-bold text-slate-800">Candidate 2</div>
              <div className="text-slate-500 truncate">priya@candidate.com</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
