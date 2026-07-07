import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useExpense } from '../context/ExpenseContext';
import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaUser, FaUserPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { APP_NAME } from '../utils/constants';

export const Register = () => {
  const { registerUser } = useAuth();
  const { triggerToast } = useExpense();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false
    }
  });

  const passwordVal = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await registerUser(data.name, data.email, data.password);
      triggerToast('Registration successful! Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 overflow-hidden relative p-4 font-sans text-xs">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/20 blur-[120px] animate-pulse duration-5000" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/20 blur-[120px] animate-pulse duration-5000" />

      {/* Register dialog Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md backdrop-blur-md bg-slate-950/40 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col z-10"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white font-black text-2xl shadow-lg shadow-violet-500/20 mb-3">
            E
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">Create Account</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            Get started with {APP_NAME}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3.5 bg-red-950/30 border border-red-900/50 text-red-400 rounded-xl font-semibold leading-normal">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name input */}
          <div className="space-y-1">
            <label className="text-slate-400 font-bold">Full Name</label>
            <div className="relative flex items-center">
              <FaUser className="absolute left-4 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. John Doe"
                {...register('name', { required: 'Name is required' })}
                className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white transition-all text-xs font-semibold"
              />
            </div>
            {errors.name && <span className="text-rose-500 text-[10px] font-bold block">{errors.name.message}</span>}
          </div>

          {/* Email input */}
          <div className="space-y-1">
            <label className="text-slate-400 font-bold">Email Address</label>
            <div className="relative flex items-center">
              <FaEnvelope className="absolute left-4 text-slate-500" />
              <input
                type="email"
                placeholder="e.g. name@domain.com"
                {...register('email', { 
                  required: 'Email address is required',
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
                })}
                className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white transition-all text-xs font-semibold"
              />
            </div>
            {errors.email && <span className="text-rose-500 text-[10px] font-bold block">{errors.email.message}</span>}
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className="text-slate-400 font-bold">Password</label>
            <div className="relative flex items-center">
              <FaLock className="absolute left-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className="w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white transition-all text-xs font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-500 hover:text-white"
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
            {errors.password && <span className="text-rose-500 text-[10px] font-bold block">{errors.password.message}</span>}
          </div>

          {/* Confirm Password input */}
          <div className="space-y-1">
            <label className="text-slate-400 font-bold">Confirm Password</label>
            <div className="relative flex items-center">
              <FaLock className="absolute left-4 text-slate-500" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Match password"
                {...register('confirmPassword', { 
                  required: 'Confirm password is required',
                  validate: (value) => value === passwordVal || 'Passwords do not match'
                })}
                className="w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white transition-all text-xs font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 text-slate-500 hover:text-white"
              >
                {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="text-rose-500 text-[10px] font-bold block">{errors.confirmPassword.message}</span>}
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2 pt-1 select-none">
            <input
              type="checkbox"
              id="agreeTerms"
              {...register('agreeTerms', { required: 'You must agree to terms' })}
              className="rounded border-slate-800 bg-slate-900/50 text-violet-600 focus:ring-violet-500 focus:ring-offset-slate-950 w-4 h-4 cursor-pointer mt-0.5"
            />
            <label htmlFor="agreeTerms" className="text-slate-400 font-bold cursor-pointer leading-normal">
              I agree to the{' '}
              <button type="button" className="text-violet-400 hover:underline hover:text-violet-300">
                Terms of Service
              </button>{' '}
              and{' '}
              <button type="button" className="text-violet-400 hover:underline hover:text-violet-300">
                Privacy Policy
              </button>
            </label>
          </div>
          {errors.agreeTerms && <span className="text-rose-500 text-[10px] font-bold block">{errors.agreeTerms.message}</span>}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-black transition-all shadow-lg shadow-violet-500/10 hover:shadow-xl hover:shadow-violet-500/20 hover:scale-[1.01] flex items-center justify-center gap-2 text-xs"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <FaUserPlus /> Create Account
              </>
            )}
          </button>
        </form>

        <p className="text-center text-slate-450 mt-6 font-semibold">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-400 hover:text-violet-300 hover:underline font-bold">
            Log In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
export default Register;
