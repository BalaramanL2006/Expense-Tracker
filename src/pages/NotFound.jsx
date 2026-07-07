import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';
import { motion } from 'framer-motion';

export const NotFound = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans text-xs">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full glass-card p-8 border border-slate-200/50 dark:border-slate-800/40 bg-white/80 dark:bg-slate-900/80 shadow-2xl text-center space-y-5"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 mb-2">
          <FaExclamationTriangle size={28} />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-slate-850 dark:text-white">404 - Page Not Found</h2>
          <p className="text-slate-450 font-medium leading-relaxed max-w-xs mx-auto">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-black hover:scale-[1.01] hover:shadow-lg hover:shadow-violet-500/20 transition-all text-xs"
          >
            <FaHome /> Return to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
export default NotFound;
