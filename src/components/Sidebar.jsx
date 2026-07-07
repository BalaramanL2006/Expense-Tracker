import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FaHome, 
  FaExchangeAlt, 
  FaWallet, 
  FaBullseye, 
  FaChartBar, 
  FaCalendarAlt, 
  FaFileInvoice, 
  FaUser, 
  FaCog, 
  FaQuestionCircle, 
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaTimes
} from 'react-icons/fa';

export const Sidebar = ({ isOpen, toggleCollapse, isMobile, closeMobileSidebar }) => {
  const { user, logoutUser } = useAuth();
  const { isDarkMode } = useTheme();
  const sidebarRef = React.useRef(null);

  // Focus trap and accessibility helpers
  React.useEffect(() => {
    if (isMobile && isOpen && sidebarRef.current) {
      const focusableElements = sidebarRef.current.querySelectorAll('button, a');
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }

      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          const focusables = sidebarRef.current.querySelectorAll('button, a');
          if (focusables.length === 0) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              last.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === last) {
              first.focus();
              e.preventDefault();
            }
          }
        }
      };

      window.addEventListener('keydown', handleTabKey);
      return () => window.removeEventListener('keydown', handleTabKey);
    }
  }, [isMobile, isOpen]);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: FaHome },
    { name: 'Transactions', path: '/transactions', icon: FaExchangeAlt },
    { name: 'Budgets', path: '/budgets', icon: FaWallet },
    { name: 'Savings Goals', path: '/goals', icon: FaBullseye },
    { name: 'Analytics', path: '/analytics', icon: FaChartBar },
    { name: 'Calendar', path: '/calendar', icon: FaCalendarAlt },
    { name: 'Reports', path: '/reports', icon: FaFileInvoice },
    { name: 'Profile', path: '/profile', icon: FaUser },
    { name: 'Settings', path: '/settings', icon: FaCog },
    { name: 'Help & About', path: '/help', icon: FaQuestionCircle },
  ];

  const sidebarClasses = `
    fixed md:sticky top-0 left-0 h-screen z-40
    flex flex-col justify-between
    border-r border-slate-200/50 dark:border-slate-800/50
    backdrop-blur-md bg-white/80 dark:bg-slate-900/80
    transition-all duration-300 ease-in-out
    ${isMobile 
      ? (isOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full w-64') 
      : (isOpen ? 'w-64' : 'w-20')}
  `;

  return (
    <aside 
      ref={sidebarRef}
      className={sidebarClasses}
      role="navigation"
      aria-label="Main Navigation"
      aria-hidden={isMobile ? !isOpen : undefined}
    >
      {/* Top Brand Logo & Close Action */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-slate-200/50 dark:border-slate-800/50">
        {(isOpen || isMobile) ? (
          <span className="font-extrabold text-2xl tracking-[0.5px] text-slate-800 dark:text-white uppercase select-none">
            EXPENSE TRACKER
          </span>
        ) : (
          <div className="w-full" />
        )}
        
        {isMobile && (
          <button 
            onClick={closeMobileSidebar}
            aria-label="Close menu"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Nav List Links */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto no-scrollbar space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={isMobile ? closeMobileSidebar : undefined}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-md shadow-violet-500/10' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}
              `}
            >
              <Icon className="text-lg flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
              {(isOpen || isMobile) && (
                <span className="text-sm font-medium tracking-wide">
                  {item.name}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile details & Logout & Toggle buttons */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 space-y-2">
        {/* User Card */}
        {user && (
          <div className={`
            flex items-center gap-3 p-2 rounded-xl bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/20
            ${!isOpen && !isMobile ? 'justify-content-center px-1' : ''}
          `}>
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-10 h-10 rounded-full border border-violet-500/20 bg-slate-200 flex-shrink-0"
            />
            {(isOpen || isMobile) && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate leading-none mt-1">{user.email}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Logout button */}
          <button
            onClick={logoutUser}
            className={`
              flex items-center gap-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all duration-200 w-full
              ${isOpen || isMobile ? 'px-4 justify-start' : 'px-0 justify-center'}
            `}
            title="Log Out"
          >
            <FaSignOutAlt className="text-lg flex-shrink-0" />
            {(isOpen || isMobile) && (
              <span className="text-sm font-medium tracking-wide">Log Out</span>
            )}
          </button>

          {/* Desktop Collapse Arrow Toggle */}
          {!isMobile && (
            <button
              onClick={toggleCollapse}
              className="hidden md:flex items-center justify-center p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200/30"
              title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
            >
              {isOpen ? <FaChevronLeft size={12} /> : <FaChevronRight size={12} />}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
