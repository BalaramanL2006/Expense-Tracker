import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import { FaDownload, FaUpload, FaTrash, FaLock, FaCog } from 'react-icons/fa';
import { APP_NAME } from '../utils/constants';

export const Settings = () => {
  const { 
    settings, 
    updateSettings, 
    backupData, 
    restoreData, 
    deleteAccount 
  } = useExpense();

  const { logoutUser } = useAuth();

  // Change Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Restore payload
  const [restorePayload, setRestorePayload] = useState('');

  const handleCurrencyChange = (e) => {
    updateSettings({ currency: e.target.value });
  };

  const handleLanguageChange = (e) => {
    updateSettings({ language: e.target.value });
  };

  const handleNotificationToggle = (key) => {
    const updatedPrefs = {
      ...settings.notificationPrefs,
      [key]: !settings.notificationPrefs[key]
    };
    updateSettings({ notificationPrefs: updatedPrefs });
  };

  // Backup downloader
  const handleBackupDownload = () => {
    const dataStr = backupData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${APP_NAME.toLowerCase().replace(' ', '_')}_backup_${new Date().toISOString().substring(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Restore action
  const handleRestoreSubmit = (e) => {
    e.preventDefault();
    if (restorePayload.trim() !== '') {
      const success = restoreData(restorePayload.trim());
      if (success) {
        setRestorePayload('');
      }
    }
  };

  // Delete account action
  const handleDeleteAccount = () => {
    if (window.confirm('WARNING: Are you sure you want to delete your account? All transaction history, budgets, and savings goals stored in local storage will be permanently wiped out. This action is irreversible.')) {
      deleteAccount();
      logoutUser(); // log out user after wiping state
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (oldPassword && newPassword) {
      alert('Password updated simulation successful!');
      setOldPassword('');
      setNewPassword('');
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Customize your preferences and settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: General Settings & Notifications */}
        <div className="space-y-6">
          {/* General Preferences */}
          <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-tight text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              System Preferences
            </h3>

            <div className="space-y-3">
              {/* Currency Select */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-200">Default Currency</span>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">All financial cards will format values using this code.</p>
                </div>
                <select
                  value={settings.currency || 'USD'}
                  onChange={handleCurrencyChange}
                  className="px-3 py-1.5 glass-input font-bold"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>

              {/* Language Select */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-200">System Language</span>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Choose display language.</p>
                </div>
                <select
                  value={settings.language || 'en'}
                  onChange={handleLanguageChange}
                  className="px-3 py-1.5 glass-input"
                >
                  <option value="en">English (US)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications priorities */}
          <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-tight text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Notifications Preferences
            </h3>

            <div className="space-y-3 font-bold select-none cursor-pointer">
              {/* Budget Alert toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span>Category Budgets Exceeded</span>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Send alerts when category spending approaches budget limits.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notificationPrefs?.budgetExceeded ?? true}
                  onChange={() => handleNotificationToggle('budgetExceeded')}
                  className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Goal completion Alert toggle */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <div>
                  <span>Savings Milestones Achieved</span>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Send toast alerts when savings targets reach 100%.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notificationPrefs?.goalCompleted ?? true}
                  onChange={() => handleNotificationToggle('goalCompleted')}
                  className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Large Expense Alert toggle */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <div>
                  <span>Large Expense Alarms</span>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Notify when single ledger purchases exceed $1,000.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notificationPrefs?.largeExpense ?? true}
                  onChange={() => handleNotificationToggle('largeExpense')}
                  className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Security, Backups & Deletion */}
        <div className="space-y-6">
          {/* Backup & Restore Panel */}
          <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-tight text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Database Backups
            </h3>

            <div className="space-y-4">
              {/* Backup Download */}
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-200 font-sans text-xs">Download Ledger Data Backup</span>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Export all settings, budgets, and records as JSON.</p>
                </div>
                <button
                  onClick={handleBackupDownload}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-200/50 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all text-slate-500"
                >
                  <FaDownload size={11} /> Backup
                </button>
              </div>

              {/* Restore JSON */}
              <form onSubmit={handleRestoreSubmit} className="space-y-2 border-t border-slate-100 dark:border-slate-800/60 pt-3">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-200 block text-xs">Restore from Backup Payload</span>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Paste backup JSON contents directly in the field below to restore.</p>
                </div>
                <textarea
                  placeholder="Paste database JSON payload..."
                  rows={2}
                  value={restorePayload}
                  onChange={(e) => setRestorePayload(e.target.value)}
                  className="w-full px-3 py-2 glass-input text-[11px]"
                  required
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-750 text-white font-bold transition-all"
                >
                  <FaUpload size={11} /> Restore JSON
                </button>
              </form>
            </div>
          </div>

          {/* Change Password Form (Simulated) */}
          <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-tight text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Update Password
            </h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div className="space-y-1">
                <label className="text-slate-400">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2.5 glass-input"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 glass-input"
                  required
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all"
              >
                <FaLock size={10} /> Update Password
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="glass-card p-5 border border-red-200/30 dark:border-red-900/20 bg-red-50/10 dark:bg-red-950/5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-tight text-red-500 border-b border-red-100 dark:border-red-950/20 pb-2">
              Danger Zone
            </h3>

            <div className="flex justify-between items-center gap-4">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">Wipe History & Reset Account</span>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Wipe clean all local database records and logs permanently.</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-750 text-white font-black transition-all shadow-md shadow-red-500/10"
              >
                <FaTrash size={11} /> Reset Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Settings;
