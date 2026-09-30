import React, { useState } from 'react';
import { Menu, Bell, Search, RefreshCw, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { View } from './Sidebar';

const PAGE_TITLES: Record<View, string> = {
  dashboard: 'Dashboard',
  users: 'User Management',
  roles: 'Roles & Permissions',
  drivers: 'Driver Management',
  vehicles: 'Vehicle Management',
  'vehicle-docs': 'Vehicle Documents',
  routes: 'Route Management',
  stops: 'Stops & Stations',
  trips: 'Trip Management',
  'scheduled-trips': 'Scheduled Trips',
  passengers: 'Passenger Management',
  bookings: 'Booking Management',
  passes: 'Passes Management',
  coupons: 'Coupons & Discounts',
  payments: 'Payment Transactions',
  'cancelled-tickets': 'Cancelled Tickets',
  refunds: 'Refund Management',
  'failed-refunds': 'Failed Refunds',
  'paid-refunds': 'Paid Refunds',
  notifications: 'Notifications',
  reports: 'Reports & Analytics',
  'audit-logs': 'Audit Logs',
  settings: 'System Settings',
};

interface TopbarProps {
  currentView: View;
  onMenuClick: () => void;
  unreadNotifications?: number;
  onNavigate: (view: View) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ currentView, onMenuClick, unreadNotifications = 0, onNavigate }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); window.location.reload(); }, 500);
  };

  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center gap-3 px-4 h-14"
      style={{
        left: '260px',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-slate-400 hover:text-white transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div className="flex-1">
        <h1 className="font-semibold text-sm">{PAGE_TITLES[currentView]}</h1>
        <p className="text-slate-500 text-xs hidden sm:block">OncabShuttle Management System</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium border border-slate-700/40 hover:bg-slate-800/60"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={16} className="text-amber-400" />
              <span className="text-slate-300 hidden md:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={16} className="text-indigo-600" />
              <span className="text-slate-700 hidden md:inline">Dark Mode</span>
            </>
          )}
        </button>

        <button
          onClick={handleRefresh}
          className="text-slate-400 hover:text-white p-2 rounded-lg transition-all hover:bg-slate-800"
          title="Refresh"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>

        <button
          onClick={() => onNavigate('notifications')}
          className="relative text-slate-400 hover:text-white p-2 rounded-lg transition-all hover:bg-slate-800"
        >
          <Bell size={16} />
          {unreadNotifications > 0 && (
            <span
              className="absolute top-1 right-1 w-4 h-4 text-xs font-bold text-white rounded-full flex items-center justify-center"
              style={{ background: '#ef4444', fontSize: '10px' }}
            >
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </button>

        {/* User avatar */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          title={user?.name}
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
};
