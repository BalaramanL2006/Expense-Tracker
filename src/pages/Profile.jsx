import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUserEdit, 
  FaTrophy, 
  FaCalendarAlt, 
  FaExchangeAlt, 
  FaCamera, 
  FaTrash, 
  FaPlus,
  FaShieldAlt, 
  FaKey, 
  FaDownload, 
  FaLock,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaMapMarkerAlt,
  FaVenusMars,
  FaBirthdayCake,
  FaHistory,
  FaDesktop,
  FaCheckCircle
} from 'react-icons/fa';
import { formatCurrency, calculateFinancialScore } from '../utils/helpers';
import { APP_NAME } from '../utils/constants';

// Animated Counter component
const AnimatedCounter = ({ value, isCurrency = false, currencyCode = 'USD', suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(value) || 0;
    if (start === end) {
      setCount(end);
      return;
    }

    const duration = 800; // milliseconds
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = progress * (2 - progress); // Ease out quad
      const current = start + easedProgress * (end - start);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(update);
  }, [value]);

  if (isCurrency) {
    return <span>{formatCurrency(count, currencyCode)}</span>;
  }
  return <span>{Math.round(count).toLocaleString()}{suffix}</span>;
};

export const Profile = () => {
  const { user, updateProfile, triggerToast } = useAuth();
  const { transactions, budgets, goals, settings, updateSettings, backupData, restoreData } = useExpense();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  // States
  const [isEditing, setIsEditing] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [uploadedImageSrc, setUploadedImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);

  // Edit details form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [dob, setDob] = useState(user?.dob || '');
  const [occupation, setOccupation] = useState(user?.occupation || '');
  const [location, setLocation] = useState(user?.location || '');

  // Password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sync state with user properties
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setGender(user.gender || 'Male');
      setDob(user.dob || '');
      setOccupation(user.occupation || '');
      setLocation(user.location || '');
    }
  }, [user]);

  // Helper for logging actions in user database
  const logActivity = (actionName) => {
    const newActivity = {
      id: `act-${Date.now()}`,
      action: actionName,
      timestamp: new Date().toISOString()
    };
    const currentActivities = user?.activities || [];
    updateProfile({ activities: [newActivity, ...currentActivities].slice(0, 10) });
  };

  // --- STATS COMPUTATIONS ---
  const expenses = transactions.filter(t => t.type === 'expense');
  const incomes = transactions.filter(t => t.type === 'income');
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  const totalBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;
  const totalSavings = totalBalance > 0 ? totalBalance : 0;

  // Monthly stats
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const curMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const curMonthIncome = curMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const curMonthExpense = curMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const curMonthSavings = curMonthIncome - curMonthExpense;

  // Financial Score
  const totalGoalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const goalProgressFraction = totalGoalTarget > 0 ? (totalGoalSaved / totalGoalTarget) : 0;
  const financialScore = calculateFinancialScore(totalIncome, totalExpense, goalProgressFraction);

  // --- ACHIEVEMENTS LIST ---
  const achievementsList = [
    { 
      id: 'first_txn', 
      title: 'First Transaction', 
      desc: 'Record your very first entry in the ledger.', 
      unlocked: transactions.length >= 1, 
      xp: 50, 
      icon: '🏆',
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    },
    { 
      id: 'goal_crusher', 
      title: 'Goal Crusher', 
      desc: 'Reach 100% of a savings goal target.', 
      unlocked: goals.some(g => g.currentAmount >= g.targetAmount), 
      xp: 100, 
      icon: '🎯',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    },
    { 
      id: 'budget_master', 
      title: 'Budget Master', 
      desc: 'Set up at least 3 active budget thresholds.', 
      unlocked: budgets.length >= 3, 
      xp: 100, 
      icon: '👑',
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
    },
    { 
      id: 'saving_champion', 
      title: 'Saving Champion', 
      desc: 'Maintain a savings rate higher than 40%.', 
      unlocked: savingsRate > 40, 
      xp: 150, 
      icon: '⚡',
      color: 'text-violet-500 bg-violet-500/10 border-violet-500/20'
    },
    { 
      id: 'tracker_pro', 
      title: 'Expense Tracker Pro', 
      desc: 'Log more than 50 transactions in your ledger.', 
      unlocked: transactions.length >= 50, 
      xp: 200, 
      icon: '🔥',
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
    },
    { 
      id: 'financial_guru', 
      title: 'Financial Guru', 
      desc: 'Attain a solid financial score above 80.', 
      unlocked: financialScore >= 80, 
      xp: 250, 
      icon: '✨',
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20'
    }
  ];

  const unlockedCount = achievementsList.filter(a => a.unlocked).length;
  const unlockedXP = achievementsList.filter(a => a.unlocked).reduce((sum, a) => sum + a.xp, 0);
  const maxXP = achievementsList.reduce((sum, a) => sum + a.xp, 0);
  const achievementsCompletionPercentage = Math.round((unlockedCount / achievementsList.length) * 100);

  // --- PROFILE COMPLETION COMPUTATIONS ---
  const getProfileCompletion = () => {
    let score = 0;
    const missing = [];

    if (phone && phone.trim() !== '') {
      score += 15;
    } else {
      missing.push({ id: 'phone', label: 'Add Phone Number', action: () => setIsEditing(true) });
    }

    if (occupation && occupation.trim() !== '') {
      score += 15;
    } else {
      missing.push({ id: 'occupation', label: 'Set Occupation', action: () => setIsEditing(true) });
    }

    if (gender && gender.trim() !== '') {
      score += 10;
    } else {
      missing.push({ id: 'gender', label: 'Select Gender', action: () => setIsEditing(true) });
    }

    if (dob && dob.trim() !== '') {
      score += 10;
    } else {
      missing.push({ id: 'dob', label: 'Add Date of Birth', action: () => setIsEditing(true) });
    }

    if (location && location.trim() !== '') {
      score += 10;
    } else {
      missing.push({ id: 'location', label: 'Add Location', action: () => setIsEditing(true) });
    }

    const isCustomAvatar = user?.avatar && user.avatar.startsWith('data:image/');
    if (isCustomAvatar) {
      score += 15;
    } else {
      missing.push({ id: 'avatar', label: 'Upload Profile Picture', action: () => fileInputRef.current?.click() });
    }

    if (goals.length > 0) {
      score += 15;
    } else {
      missing.push({ id: 'goal', label: 'Create a Savings Goal', redirect: '/goals' });
    }

    if (budgets.length > 0) {
      score += 10;
    } else {
      missing.push({ id: 'budget', label: 'Establish Budget Thresholds', redirect: '/budgets' });
    }

    return { percentage: score, missing };
  };

  const { percentage: profileCompletion, missing: missingItems } = getProfileCompletion();

  // --- RECENT ACTIVITIES ---
  const getActivitiesTimeline = () => {
    const list = [];
    
    if (user?.activities && user.activities.length > 0) {
      user.activities.forEach(act => {
        list.push({
          id: act.id,
          action: act.action,
          timestamp: new Date(act.timestamp),
          icon: act.action.includes('Password') ? <FaLock /> : <FaUserEdit />,
          color: 'text-violet-500 bg-violet-500/10'
        });
      });
    } else {
      list.push({
        id: 'act-init',
        action: 'Account Created & Verified',
        timestamp: new Date(user?.memberSince ? `${user.memberSince} 1` : '2026-01-01'),
        icon: <FaCheckCircle />,
        color: 'text-emerald-500 bg-emerald-500/10'
      });
    }

    // Add last transactions as logs
    transactions.slice(0, 3).forEach(t => {
      list.push({
        id: t.id,
        action: `Logged ${t.type}: "${t.title}" for ${formatCurrency(t.amount, settings.currency)}`,
        timestamp: new Date(t.date),
        icon: <FaExchangeAlt />,
        color: t.type === 'income' ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-500 bg-slate-500/10'
      });
    });

    return list.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  };

  // --- EVENT HANDLERS ---
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (name.trim() !== '' && email.trim() !== '') {
      updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        gender,
        dob,
        occupation: occupation.trim(),
        location: location.trim()
      });
      setIsEditing(false);
      triggerToast('Profile information updated successfully!', 'success');
      logActivity('Updated Profile Details');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImageSrc(event.target.result);
        setZoom(1);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'User')}`;
    updateProfile({ avatar: defaultAvatar });
    triggerToast('Profile picture reset to default.', 'success');
    logActivity('Changed Profile Picture');
  };

  const handleCropSave = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;

    const img = new Image();
    img.src = uploadedImageSrc;
    img.onload = () => {
      const minDim = Math.min(img.width, img.height);
      const cropSize = minDim / zoom;
      const sx = (img.width - cropSize) / 2;
      const sy = (img.height - cropSize) / 2;

      ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, 256, 256);
      const base64 = canvas.toDataURL('image/jpeg');

      updateProfile({ avatar: base64 });
      setShowCropModal(false);
      triggerToast('Profile picture cropped and updated!', 'success');
      logActivity('Changed Profile Picture');
    };
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      triggerToast('New passwords do not match.', 'error');
      return;
    }
    
    // Simulating password check against database in localStorage
    const savedUserString = localStorage.getItem(`db_user_${user.email}`);
    if (savedUserString) {
      const dbUser = JSON.parse(savedUserString);
      if (dbUser.password && dbUser.password !== currentPassword) {
        triggerToast('Incorrect current password.', 'error');
        return;
      }
      dbUser.password = newPassword;
      localStorage.setItem(`db_user_${user.email}`, JSON.stringify(dbUser));
    }
    
    triggerToast('Password changed successfully!', 'success');
    logActivity('Changed Password');
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleExportData = () => {
    // Generate reports generated increment in user profile
    const currentReports = user?.reportsCount || 5;
    updateProfile({ reportsCount: currentReports + 1 });

    const exportStr = backupData();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(exportStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `${APP_NAME.toLowerCase().replace(' ', '_')}_backup_${user?.email || 'user'}_${Date.now()}.json`);
    linkElement.click();

    triggerToast('All account data exported successfully!', 'success');
    logActivity('Exported Report');
  };

  const handleDownloadCsv = () => {
    // Trigger transactions export
    const currentReports = user?.reportsCount || 5;
    updateProfile({ reportsCount: currentReports + 1 });

    // Generate CSV content
    const headers = ['Date', 'Title', 'Type', 'Category', 'Payment Method', 'Amount', 'Status'];
    const rows = transactions.map(t => [
      t.date.substring(0, 10),
      `"${t.title.replace(/"/g, '""')}"`,
      t.type,
      t.category,
      t.paymentMethod,
      t.amount,
      t.status || 'Completed'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', encodedUri);
    linkElement.setAttribute('download', `financial_report_${Date.now()}.csv`);
    linkElement.click();

    triggerToast('Transactions report downloaded in CSV format.', 'success');
    logActivity('Exported Report');
  };

  // Missing item checklist click handler
  const handleChecklistClick = (item) => {
    if (item.action) {
      item.action();
    } else if (item.redirect) {
      navigate(item.redirect);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your personal information, security preferences, and achievements.</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Profile Header + Completion + Quick Preferences + Actions */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md flex flex-col items-center text-center relative overflow-hidden">
            {/* Account Status Badge */}
            <span className="absolute top-4 right-4 text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 border border-emerald-200/40">
              {user?.status || 'Verified'}
            </span>

            {/* Profile Avatar with Camera Overlay */}
            <div className="relative group w-32 h-32 mb-4">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-full h-full rounded-full object-cover border-4 border-violet-500/20 bg-slate-100 shadow"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                title="Change profile photo"
              >
                <FaCamera size={18} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {/* User Meta Information */}
            <h3 className="text-lg font-black tracking-tight text-slate-850 dark:text-white">{user?.name}</h3>
            <p className="text-xs text-slate-450 font-semibold mb-1">{user?.email}</p>
            {user?.occupation && (
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-1 bg-slate-50 dark:bg-slate-850 px-2.5 py-1 rounded-md">
                <FaBriefcase size={8} /> {user.occupation}
              </span>
            )}

            {/* Remove photo button if custom avatar loaded */}
            {user?.avatar && user.avatar.startsWith('data:image/') && (
              <button
                onClick={handleRemoveAvatar}
                className="text-[10px] text-red-500 hover:text-red-650 font-bold flex items-center gap-1.5 mt-3 transition-colors"
              >
                <FaTrash size={10} /> Remove Custom Picture
              </button>
            )}
          </div>

          {/* Profile Completion Indicator */}
          <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4 tracking-tight uppercase">Profile Completion</h4>
            
            <div className="flex items-center gap-6 mb-4">
              {/* Circular Progress SVG */}
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Outer Track Ring */}
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="5"
                    className="text-slate-100 dark:text-slate-850"
                  />
                  {/* Progress Indicator */}
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="transparent"
                    stroke="url(#progressGradient)"
                    strokeWidth="5"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={2 * Math.PI * 34 - (profileCompletion / 100) * (2 * Math.PI * 34)}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 34 - (profileCompletion / 100) * (2 * Math.PI * 34) }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-black tracking-tighter text-slate-850 dark:text-white">
                    {profileCompletion}%
                  </span>
                </div>
              </div>

              {/* Progress Summary info */}
              <div>
                <p className="text-xs text-slate-450 leading-relaxed font-semibold">
                  {profileCompletion === 100 
                    ? 'Excellent! Your profile commands are fully completed.' 
                    : 'Complete missing items below to secure your workspace setup.'}
                </p>
              </div>
            </div>

            {/* Checklist of missing items */}
            {missingItems.length > 0 && (
              <div className="border-t border-slate-100 dark:border-slate-850 pt-3 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Pending Actions</span>
                {missingItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleChecklistClick(item)}
                    className="w-full flex items-center justify-between text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-800/40 text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold transition-all text-xs"
                  >
                    <span>{item.label}</span>
                    <FaPlus size={8} className="text-violet-500" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Details Details Card */}
          <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 tracking-tight uppercase">User Information</h4>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-violet-500 hover:text-violet-650 hover:underline font-bold transition-all"
              >
                Edit
              </button>
            </div>

            {/* Info details */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-wide"><FaUser size={10} /> Full Name</span>
                <span className="text-slate-800 dark:text-slate-250 font-bold">{user?.name}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-wide"><FaEnvelope size={10} /> Email Address</span>
                <span className="text-slate-800 dark:text-slate-250 font-bold truncate max-w-[150px]">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-wide"><FaPhone size={10} /> Phone Number</span>
                <span className="text-slate-800 dark:text-slate-250 font-bold">{user?.phone || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-wide"><FaBriefcase size={10} /> Occupation</span>
                <span className="text-slate-800 dark:text-slate-250 font-bold">{user?.occupation || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-wide"><FaMapMarkerAlt size={10} /> Location</span>
                <span className="text-slate-800 dark:text-slate-250 font-bold">{user?.location || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-wide"><FaVenusMars size={10} /> Gender</span>
                <span className="text-slate-800 dark:text-slate-250 font-bold">{user?.gender || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-wide"><FaBirthdayCake size={10} /> Date of Birth</span>
                <span className="text-slate-800 dark:text-slate-250 font-bold">{user?.dob || 'Not set'}</span>
              </div>
            </div>
          </div>

          {/* Preferences Settings Card */}
          <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md space-y-4">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 tracking-tight uppercase border-b border-slate-100 dark:border-slate-850 pb-3">Preferences</h4>
            
            <div className="space-y-3">
              {/* Theme preference */}
              <div className="flex items-center justify-between text-xs py-0.5">
                <span className="text-slate-450 font-bold uppercase text-[9px]">Appearance Mode</span>
                <button
                  onClick={toggleTheme}
                  className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </button>
              </div>

              {/* Currency Select */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-455 font-bold uppercase text-[9px]">Currency Unit</span>
                <select
                  value={settings.currency || 'USD'}
                  onChange={(e) => updateSettings({ currency: e.target.value })}
                  className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>

              {/* Language Select */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-455 font-bold uppercase text-[9px]">Interface Language</span>
                <select
                  value={settings.language || 'en'}
                  onChange={(e) => updateSettings({ language: e.target.value })}
                  className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              {/* Notification toggle */}
              <div className="flex items-center justify-between text-xs py-0.5">
                <span className="text-slate-455 font-bold uppercase text-[9px]">Push Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.notificationPrefs?.budgetExceeded ?? true}
                    onChange={(e) => updateSettings({ 
                      notificationPrefs: { 
                        ...settings.notificationPrefs, 
                        budgetExceeded: e.target.checked 
                      } 
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-violet-600 rounded-full"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Statistics Grid + Achievements + Activity + Security */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Financial Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Stat Card 1: Cumulative Income */}
            <div className="glass-card p-4 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Total Incomes</span>
              <h3 className="font-extrabold text-base sm:text-lg text-emerald-650 mt-1 tracking-tight">
                <AnimatedCounter value={totalIncome} isCurrency={true} currencyCode={settings.currency} />
              </h3>
            </div>

            {/* Stat Card 2: Cumulative Expense */}
            <div className="glass-card p-4 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Total Expenses</span>
              <h3 className="font-extrabold text-base sm:text-lg text-rose-500 mt-1 tracking-tight">
                <AnimatedCounter value={totalExpense} isCurrency={true} currencyCode={settings.currency} />
              </h3>
            </div>

            {/* Stat Card 3: Balance */}
            <div className="glass-card p-4 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Current Balance</span>
              <h3 className={`font-extrabold text-base sm:text-lg mt-1 tracking-tight ${totalBalance >= 0 ? 'text-slate-800 dark:text-white' : 'text-rose-500'}`}>
                <AnimatedCounter value={totalBalance} isCurrency={true} currencyCode={settings.currency} />
              </h3>
            </div>

            {/* Stat Card 4: Savings */}
            <div className="glass-card p-4 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Total Savings</span>
              <h3 className="font-extrabold text-base sm:text-lg text-violet-500 mt-1 tracking-tight">
                <AnimatedCounter value={totalSavings} isCurrency={true} currencyCode={settings.currency} />
              </h3>
            </div>

            {/* Stat Card 5: Total Transactions */}
            <div className="glass-card p-4 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Total Ledger entries</span>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mt-1">
                <AnimatedCounter value={transactions.length} suffix=" items" />
              </h3>
            </div>

            {/* Stat Card 6: Active Budgets */}
            <div className="glass-card p-4 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Active Budgets</span>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mt-1">
                <AnimatedCounter value={budgets.length} suffix=" slots" />
              </h3>
            </div>

            {/* Stat Card 7: Active Goals */}
            <div className="glass-card p-4 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Savings Targets</span>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mt-1">
                <AnimatedCounter value={goals.length} suffix=" goals" />
              </h3>
            </div>

            {/* Stat Card 8: Reports Count */}
            <div className="glass-card p-4 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Reports compiled</span>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mt-1">
                <AnimatedCounter value={user?.reportsCount || 5} suffix=" sheets" />
              </h3>
            </div>
          </div>

          {/* Section: Achievements & Badges */}
          <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <div className="flex items-center gap-2 text-amber-500">
                <FaTrophy size={14} />
                <h4 className="font-extrabold text-sm text-slate-850 dark:text-white uppercase tracking-tight">Achievements & Badges</h4>
              </div>
              <span className="text-xs text-slate-450 font-bold">
                {unlockedCount} of {achievementsList.length} Unlocked ({achievementsCompletionPercentage}%)
              </span>
            </div>

            {/* Trophy overview and XP bar */}
            <div className="space-y-1.5 p-3.5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 rounded-2xl">
              <div className="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>Developer Rank Progress</span>
                <span>{unlockedXP} / {maxXP} XP</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-850 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(unlockedXP / maxXP) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-650"
                />
              </div>
            </div>

            {/* Badges list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {achievementsList.map(a => (
                <div 
                  key={a.id} 
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all duration-300 relative overflow-hidden ${a.unlocked ? 'border-slate-250 bg-white dark:border-slate-800 dark:bg-slate-900/50' : 'border-slate-150 bg-slate-50/50 opacity-40 dark:border-slate-850 dark:bg-slate-950/20'}`}
                >
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg flex-shrink-0 ${a.color}`}>
                    {a.icon}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">{a.title}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-semibold">{a.desc}</p>
                    {a.unlocked && (
                      <span className="inline-block text-[8px] font-black uppercase text-amber-650 mt-1 bg-amber-500/5 border border-amber-500/20 rounded px-1 tracking-wider">
                        +{a.xp} XP
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grid for Security & Monthly Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Security Settings Panel */}
            <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3 text-violet-500">
                  <FaShieldAlt size={14} />
                  <h4 className="font-extrabold text-sm text-slate-850 dark:text-white uppercase tracking-tight">Security & Credentials</h4>
                </div>

                <div className="space-y-3.5 text-xs pt-1">
                  {/* Password status */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-450 font-bold uppercase text-[9px]">Password status</span>
                    <span className="font-bold text-slate-800 dark:text-slate-250">Secured (Active)</span>
                  </div>

                  {/* 2FA switches */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-450 font-bold uppercase text-[9px]">Two-factor Authenticator</span>
                    <button
                      onClick={() => {
                        const nextVal = !user?.twoFactorEnabled;
                        updateProfile({ twoFactorEnabled: nextVal });
                        triggerToast(`2FA has been ${nextVal ? 'enabled' : 'disabled'}.`, 'info');
                      }}
                      className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider transition-all ${user?.twoFactorEnabled ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-450 border-slate-250/20 dark:bg-slate-800'}`}
                    >
                      {user?.twoFactorEnabled ? 'Enabled' : 'Disabled (UI Ready)'}
                    </button>
                  </div>

                  {/* Devices Log */}
                  <div className="space-y-1.5 pt-1.5">
                    <span className="text-slate-400 font-bold uppercase text-[8px] tracking-wide block">Active Login Devices</span>
                    <div className="p-2 border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl flex items-center gap-2">
                      <FaDesktop className="text-violet-500" size={12} />
                      <div>
                        <p className="text-[10px] font-bold">Chrome on Windows</p>
                        <p className="text-[8px] text-slate-400">Current session • active</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 mt-4">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all text-xs"
                >
                  <FaKey size={10} /> Update Password
                </button>
              </div>
            </div>

            {/* Monthly Activity panel */}
            <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3 text-sky-500">
                <FaCalendarAlt size={14} />
                <h4 className="font-extrabold text-sm text-slate-850 dark:text-white uppercase tracking-tight">Monthly Performance</h4>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-450 font-bold uppercase text-[9px]">Last Login Time</span>
                  <span className="text-slate-500 font-bold">{user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-450 font-bold uppercase text-[9px]">Profile Established</span>
                  <span className="text-slate-500 font-bold">{user?.memberSince}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-450 font-bold uppercase text-[9px]">Transactions This Month</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{curMonthTransactions.length} items</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-450 font-bold uppercase text-[9px]">Current Month Savings</span>
                  <span className={`font-black ${curMonthSavings >= 0 ? 'text-emerald-550 dark:text-emerald-400' : 'text-rose-500'}`}>
                    {formatCurrency(curMonthSavings, settings.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Command Actions Grid */}
          <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md space-y-4">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 tracking-tight uppercase border-b border-slate-100 dark:border-slate-850 pb-3">Quick Commands</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="py-2.5 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-center font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all text-xs"
              >
                Edit Profile
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-center font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all text-xs"
              >
                Change Avatar
              </button>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="py-2.5 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-center font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all text-xs"
              >
                Change Password
              </button>
              <button
                onClick={handleExportData}
                className="py-2.5 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-center font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all text-xs flex items-center justify-center gap-1.5"
              >
                <FaDownload size={10} /> Backup Data
              </button>
              <button
                onClick={handleDownloadCsv}
                className="py-2.5 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-center font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all text-xs flex items-center justify-center gap-1.5"
              >
                <FaDownload size={10} /> Export CSV
              </button>
              <button
                onClick={() => {
                  const restoredJson = prompt("Paste your Backup JSON string below to restore:");
                  if (restoredJson && restoredJson.trim() !== '') {
                    const success = restoreData(restoredJson);
                    if (success) {
                      logActivity('Imported Report');
                    }
                  }
                }}
                className="py-2.5 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-center font-bold text-slate-550 hover:text-violet-650 transition-all text-xs flex items-center justify-center gap-1.5"
              >
                Restore Backup
              </button>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3 text-slate-700 dark:text-white">
              <FaHistory size={14} />
              <h4 className="font-extrabold text-sm uppercase tracking-tight">Recent Activity Timeline</h4>
            </div>

            <div className="relative border-l border-slate-200 dark:border-slate-800/80 ml-3 pl-5 space-y-6 pt-2">
              {getActivitiesTimeline().map(act => {
                const diffMs = Date.now() - act.timestamp.getTime();
                const diffMins = Math.round(diffMs / 60000);
                const diffHours = Math.round(diffMins / 60);
                
                let relTime = 'Just now';
                if (diffMins >= 60) {
                  if (diffHours >= 24) {
                    relTime = act.timestamp.toLocaleDateString();
                  } else {
                    relTime = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
                  }
                } else if (diffMins > 0) {
                  relTime = `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
                }

                return (
                  <div key={act.id} className="relative">
                    {/* Circle icon */}
                    <span className={`absolute -left-8 top-0.5 w-6.5 h-6.5 rounded-full border border-white dark:border-slate-900 flex items-center justify-center text-[10px] ${act.color}`}>
                      {act.icon}
                    </span>
                    <div>
                      <h5 className="font-bold text-xs text-slate-850 dark:text-slate-200">{act.action}</h5>
                      <span className="text-[9px] text-slate-400 font-bold block mt-0.5">{relTime}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* --- MODAL DIALOGS --- */}

      {/* EDIT PROFILE DRAWER/MODAL OVERLAY */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg glass-card p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl rounded-3xl space-y-4 text-xs font-semibold z-10"
            >
              <h3 className="text-base font-black tracking-tight text-slate-850 dark:text-white uppercase border-b border-slate-100 dark:border-slate-800 pb-3">Edit Profile Details</h3>
              
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name input */}
                  <div className="space-y-1">
                    <label className="text-slate-450 font-bold">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 text-xs font-semibold"
                    />
                  </div>

                  {/* Email input */}
                  <div className="space-y-1">
                    <label className="text-slate-450 font-bold">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 text-xs font-semibold"
                    />
                  </div>

                  {/* Phone input */}
                  <div className="space-y-1">
                    <label className="text-slate-450 font-bold">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 text-xs font-semibold"
                    />
                  </div>

                  {/* Occupation */}
                  <div className="space-y-1">
                    <label className="text-slate-450 font-bold">Occupation</label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineer"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 text-xs font-semibold"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-1">
                    <label className="text-slate-450 font-bold">Location (City / Country)</label>
                    <input
                      type="text"
                      placeholder="e.g. London, UK"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 text-xs font-semibold"
                    />
                  </div>

                  {/* DOB */}
                  <div className="space-y-1">
                    <label className="text-slate-450 font-bold">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 text-xs font-semibold"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-1">
                    <label className="text-slate-450 font-bold">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 text-xs font-semibold"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100 dark:border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 font-bold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-black hover:shadow-lg shadow-violet-500/10"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CROP PICTURE MODAL OVERLAY */}
      <AnimatePresence>
        {showCropModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCropModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm glass-card p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl rounded-3xl text-center space-y-4 text-xs font-semibold z-10"
            >
              <h3 className="text-base font-black tracking-tight text-slate-850 dark:text-white uppercase border-b border-slate-100 dark:border-slate-800 pb-3">Crop Image</h3>
              
              {/* Circular preview box */}
              <div className="relative overflow-hidden w-48 h-48 mx-auto rounded-full border-4 border-violet-500/20 bg-slate-100">
                <img
                  src={uploadedImageSrc}
                  alt="Crop preview"
                  className="w-full h-full object-cover transition-transform origin-center"
                  style={{ transform: `scale(${zoom})` }}
                />
              </div>

              {/* Slider for zoom factor */}
              <div className="space-y-1 pt-2">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                  <span>ZOOM</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-violet-650 h-1 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex gap-2 justify-center pt-3 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowCropModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropSave}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-black hover:shadow-lg shadow-violet-500/10"
                >
                  Apply & Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHANGE PASSWORD MODAL OVERLAY */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm glass-card p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl rounded-3xl space-y-4 text-xs font-semibold z-10"
            >
              <h3 className="text-base font-black tracking-tight text-slate-850 dark:text-white uppercase border-b border-slate-100 dark:border-slate-800 pb-3">Change Account Password</h3>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* Current password */}
                <div className="space-y-1">
                  <label className="text-slate-450 font-bold">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 text-xs"
                  />
                </div>

                {/* New password */}
                <div className="space-y-1">
                  <label className="text-slate-450 font-bold">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 text-xs"
                  />
                </div>

                {/* Confirm password */}
                <div className="space-y-1">
                  <label className="text-slate-450 font-bold">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 text-xs"
                  />
                </div>

                <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100 dark:border-slate-850">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 font-bold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-black hover:shadow-lg shadow-violet-500/10"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Profile;
