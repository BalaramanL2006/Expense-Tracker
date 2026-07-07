import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExpense } from '../context/ExpenseContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { APP_NAME } from '../utils/constants';

export const DashboardLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const { toasts, removeToast } = useExpense();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsiveness
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      setIsMobile(mobile);
      if (width >= 1024) {
        setIsSidebarCollapsed(false);
        setIsMobileOpen(false);
      } else if (width >= 768) {
        setIsSidebarCollapsed(true); // tablet starts collapsed
        setIsMobileOpen(false);
      } else {
        setIsSidebarCollapsed(true); // mobile starts collapsed/hidden
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobile && isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isMobileOpen]);

  // Close mobile sidebar on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-400">Loading {APP_NAME}...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-50 transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={isMobile ? isMobileOpen : !isSidebarCollapsed} 
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        isMobile={isMobile}
        closeMobileSidebar={() => setIsMobileOpen(false)}
      />

      {/* Mobile Drawer Overlay Backdrop with transition */}
      {isMobile && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className={`fixed inset-0 bg-black/40 backdrop-blur-xs z-30 transition-opacity duration-300 ${
            isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        />
      )}

      {/* Main Panel Content Frame */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
        <Navbar 
          toggleMobileSidebar={() => {
            const width = window.innerWidth;
            if (width < 768) {
              setIsMobileOpen(!isMobileOpen);
            } else if (width < 1024) {
              setIsSidebarCollapsed(!isSidebarCollapsed);
            }
          }}
          isMobileOpen={isMobileOpen}
        />
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto no-scrollbar max-w-[1600px] mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Global Toast Stack Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full">
        {toasts.map(toast => {
          const typeColors = {
            success: 'bg-emerald-550 border-emerald-400 dark:border-emerald-800 text-emerald-800 dark:text-emerald-100 bg-emerald-50 dark:bg-emerald-950/40',
            error: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200',
            warning: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200',
            info: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200'
          };
          
          return (
            <div 
              key={toast.id}
              className={`p-4 border rounded-xl flex items-center justify-between shadow-lg backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 ${typeColors[toast.type] || typeColors.info}`}
            >
              <span className="text-xs font-semibold leading-normal">{toast.message}</span>
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded transition-colors ml-3"
              >
                <FaTimes size={10} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default DashboardLayout;
