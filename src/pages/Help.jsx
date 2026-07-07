import React from 'react';
import { FaQuestionCircle, FaEnvelope, FaBook, FaInfoCircle } from 'react-icons/fa';
import { APP_NAME } from '../utils/constants';

export const Help = () => {
  const faqs = [
    { q: 'How do I add custom categories?', a: 'When adding a transaction, select the "+ Custom Category" option. Provide a name and color, and press "Create". It will instantly save to your local database.' },
    { q: 'Can I export transaction statements?', a: 'Yes! Navigate to either the Transactions page or the Reports page and click the "Export CSV" or "Print Statement" buttons to compile statements.' },
    { q: 'Is my financial data stored securely?', a: 'Yes. All data remains in your local browser sandbox (localStorage) and never transmits across network environments. Rest assured, your cash flow details remain private.' },
    { q: 'How do I restore data from backups?', a: 'Navigate to the Settings tab, select "Database Backups", paste the JSON string in the text field, and select "Restore JSON".' }
  ];

  return (
    <div className="space-y-6 text-xs font-semibold max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Help</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Find answers to FAQs and contact support.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Quick Resources (1/3 width) */}
        <div className="space-y-6">
          {/* Support Ticket */}
          <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md space-y-4">
            <div className="flex items-center gap-2 text-violet-500">
              <FaEnvelope size={14} />
              <h4 className="font-extrabold text-sm uppercase tracking-tight">Contact Support</h4>
            </div>
            
            <p className="text-slate-500 font-medium leading-relaxed">
              Have questions or request additional features? Shoot us an email below:
            </p>
            <a 
              href="mailto:support@expensetracker.com" 
              className="block w-full py-2.5 text-center font-black bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              support@expensetracker.com
            </a>
          </div>

          {/* About Box */}
          <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2 text-violet-500">
              <FaInfoCircle size={14} />
              <h4 className="font-extrabold text-sm uppercase tracking-tight">About Platform</h4>
            </div>
            
            <p className="text-slate-500 font-medium leading-relaxed">
              {APP_NAME} is built on React 19 and Vite, styled with Tailwind CSS, and uses local sandbox files to track transactions, budgets, and savings goals.
            </p>
            <div className="text-[10px] text-slate-400 font-bold border-t border-slate-100 dark:border-slate-800/60 pt-2">
              <span>App Version: 1.0.0</span>
            </div>
          </div>
        </div>

        {/* Right: FAQs (2/3 width) */}
        <div className="md:col-span-2 glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-150 dark:border-slate-800 pb-3">
            <FaBook className="text-violet-500" />
            <h4 className="font-extrabold text-sm text-slate-850 dark:text-white uppercase tracking-tight">Frequently Asked Questions (FAQ)</h4>
          </div>

          <div className="space-y-4">
            {faqs.map(faq => (
              <div key={faq.q} className="space-y-1">
                <h5 className="font-black text-slate-800 dark:text-slate-200 flex items-start gap-2 text-[13px]">
                  <FaQuestionCircle className="text-violet-500 mt-0.5 flex-shrink-0" size={12} />
                  {faq.q}
                </h5>
                <p className="pl-5 text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Help;
