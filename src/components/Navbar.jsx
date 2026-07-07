import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useExpense } from '../context/ExpenseContext';
import { FaBars, FaSearch, FaBell, FaSun, FaMoon, FaCheck, FaTrash } from 'react-icons/fa';

export const Navbar = ({ toggleMobileSidebar, isMobileOpen, onSearch }) => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { notifications, markNotificationAsRead, clearAllNotifications } = useExpense();
  const location = useLocation();
  const navigate = useNavigate();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Redirect to transactions page if on another page to show search results
    if (location.pathname !== '/transactions') {
      navigate(`/transactions?q=${encodeURIComponent(searchValue)}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 glass-nav">
      {/* Left Title & Mobile Menu Trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileSidebar}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileOpen}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <FaBars size={20} />
        </button>
      </div>

      {/* Center Search Input */}
      <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center max-w-md flex-1 mx-8 relative">
        <FaSearch className="absolute left-4 text-slate-400" />
        <input
          type="text"
          value={searchValue}
          onChange={handleSearchChange}
          placeholder="Global search by title, tag, category..."
          className="w-full pl-11 pr-4 py-2.5 glass-input text-sm"
        />
      </form>

      {/* Right Action Icons */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Search Button */}
        <Link 
          to="/transactions" 
          className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 sm:hidden transition-colors"
          title="Search"
        >
          <FaSearch size={16} />
        </Link>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all duration-300 relative group"
          title={isDarkMode ? 'Toggle Light Mode' : 'Toggle Dark Mode'}
        >
          {isDarkMode ? (
            <FaSun className="text-amber-400 rotate-0 transition-transform hover:rotate-45" size={16} />
          ) : (
            <FaMoon className="text-slate-600 rotate-0 transition-transform hover:-rotate-12" size={16} />
          )}
        </button>

        {/* Notifications Dropdown Trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors relative"
            title="Notifications"
          >
            <FaBell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
          </button>

          {/* Notifications Dropdown Menu */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 py-3 flex flex-col z-50 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-sm">Notifications ({unreadCount} new)</span>
                {notifications.length > 0 && (
                  <button 
                    onClick={clearAllNotifications}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-semibold"
                  >
                    <FaTrash size={10} /> Clear
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar max-h-64 divide-y divide-slate-100 dark:divide-slate-800/50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-medium">
                    No notifications available
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`p-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors flex items-start justify-between gap-3 ${!n.read ? 'bg-slate-50/80 dark:bg-slate-800/10' : ''}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs text-slate-600 dark:text-slate-300 leading-normal ${!n.read ? 'font-semibold text-slate-950 dark:text-white' : ''}`}>
                          {n.message}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {!n.read && (
                        <button 
                          onClick={() => markNotificationAsRead(n.id)}
                          className="text-xs text-violet-500 hover:text-violet-600 p-1 hover:bg-violet-50 dark:hover:bg-slate-800 rounded-md"
                          title="Mark Read"
                        >
                          <FaCheck size={10} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link to="/settings" onClick={() => setShowNotifDropdown(false)} className="text-xs text-violet-500 hover:underline font-semibold">
                  Notification settings
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Trigger */}
        <Link to="/profile" className="flex items-center gap-2">
          <img
            src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'}
            alt="Profile Avatar"
            className="w-9 h-9 rounded-full border border-violet-500/20 bg-slate-200"
          />
        </Link>
      </div>
    </header>
  );
};
export default Navbar;
