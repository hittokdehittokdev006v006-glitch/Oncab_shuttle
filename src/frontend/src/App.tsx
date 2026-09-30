// import React, { useState, useEffect, useCallback } from 'react';
// import { AuthProvider, useAuth } from './contexts/AuthContext';
// import { ThemeProvider, useTheme } from './contexts/ThemeContext';
// import { Sidebar, View } from './components/layout/Sidebar';
// import { Topbar } from './components/layout/Topbar';
// import { LoginPage } from './pages/LoginPage';
// import { DashboardPage } from './pages/DashboardPage';
// import { Toast, LoadingState } from './components/ui';
// import { notificationsAPI } from './services/api';

// // ── Lazy page imports ──────────────────────────────────────
// const DriversPage = React.lazy(() => import('./pages/DriversPage').then(m => ({ default: m.DriversPage })));
// const VehiclesPage = React.lazy(() => import('./pages/VehiclesPage').then(m => ({ default: m.VehiclesPage })));
// const RouteCreationPage = React.lazy(() => import('./pages/RouteCreationPage').then(m => ({ default: m.RouteCreationPage })));
// const ScheduledTripsPage = React.lazy(() => import('./pages/ScheduledTripsPage').then(m => ({ default: m.ScheduledTripsPage })));
// const TripsPage = React.lazy(() => import('./pages/TripsPage').then(m => ({ default: m.TripsPage })));
// const BookingsPage = React.lazy(() => import('./pages/BookingsPage').then(m => ({ default: m.BookingsPage })));
// const PassengersPage = React.lazy(() => import('./pages/PassengersPage').then(m => ({ default: m.PassengersPage })));
// const PassesManagementPage = React.lazy(() => import('./pages/PassesManagementPage').then(m => ({ default: m.PassesManagementPage })));
// const CancelledTicketsRefundPage = React.lazy(() => import('./pages/CancelledTicketsRefundPage').then(m => ({ default: m.CancelledTicketsRefundPage })));
// const FailedPaidRefundPage = React.lazy(() => import('./pages/FailedPaidRefundPage').then(m => ({ default: m.FailedPaidRefundPage })));
// const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
// const UsersPage = React.lazy(() => import('./pages/UsersPage').then(m => ({ default: m.UsersPage })));
// const RolesPage = React.lazy(() => import('./pages/RolesPage').then(m => ({ default: m.RolesPage })));
// const CouponsPage = React.lazy(() => import('./pages/CouponsPage').then(m => ({ default: m.CouponsPage })));
// const PaymentsPage = React.lazy(() => import('./pages/PaymentsPage').then(m => ({ default: m.PaymentsPage })));
// const RefundsPage = React.lazy(() => import('./pages/RefundsPage').then(m => ({ default: m.RefundsPage })));
// const ReportsPage = React.lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
// const AuditLogsPage = React.lazy(() => import('./pages/AuditLogsPage').then(m => ({ default: m.AuditLogsPage })));
// const SettingsPage = React.lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

// // ── Toast hook ─────────────────────────────────────────────
// interface ToastState { message: string; type: 'success' | 'error' | 'info' }

// const VALID_VIEWS: View[] = [
//   'dashboard', 'users', 'roles', 'drivers', 'vehicles', 'vehicle-docs',
//   'routes', 'stops', 'trips', 'scheduled-trips', 'passengers', 'bookings',
//   'passes', 'coupons', 'payments', 'cancelled-tickets', 'refunds',
//   'failed-refunds', 'paid-refunds', 'notifications', 'reports', 'audit-logs', 'settings'
// ];

// const getInitialView = (): View => {
//   const path = window.location.pathname.replace('/', '').trim().toLowerCase();
//   return VALID_VIEWS.includes(path as View) ? (path as View) : 'dashboard';
// };

// // ── Main App Inner ─────────────────────────────────────────
// const AppInner: React.FC = () => {
//   const { isAuthenticated, isLoading } = useAuth();
//   const [currentView, setCurrentViewState] = useState<View>(getInitialView);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [toast, setToast] = useState<ToastState | null>(null);
//   const [unreadNotifications, setUnreadNotifications] = useState(0);
//   const [forgotPwMode, setForgotPwMode] = useState(false);

//   const setCurrentView = (view: View) => {
//     setCurrentViewState(view);
//     if (window.location.pathname !== `/${view}`) {
//       window.history.pushState({}, '', `/${view}`);
//     }
//   };

//   useEffect(() => {
//     const handlePopState = () => {
//       const path = window.location.pathname.replace('/', '').trim().toLowerCase();
//       if (VALID_VIEWS.includes(path as View)) {
//         setCurrentViewState(path as View);
//       }
//     };
//     window.addEventListener('popstate', handlePopState);
//     return () => window.removeEventListener('popstate', handlePopState);
//   }, []);

//   const notify = useCallback((message: string, type: ToastState['type'] = 'success') => {
//     setToast({ message, type });
//     setTimeout(() => setToast(null), 3000);
//   }, []);

//   // Fetch unread notifications count
//   useEffect(() => {
//     if (!isAuthenticated) return;
//     const fetchUnread = async () => {
//       try {
//         const resp = await notificationsAPI.list({ read: 'false', limit: 1 });
//         setUnreadNotifications(resp.data.unread_count || 0);
//       } catch { /* ignore */ }
//     };
//     fetchUnread();
//     const interval = setInterval(fetchUnread, 60000); // poll every minute
//     return () => clearInterval(interval);
//   }, [isAuthenticated]);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
//         <LoadingState message="Initializing..." />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <LoginPage onForgotPassword={() => setForgotPwMode(true)} />;
//   }

//   const renderPage = () => {
//     const props = { onNotify: notify };
//     const PageWrapper = ({ children }: { children: React.ReactNode }) => (
//       <React.Suspense fallback={<LoadingState />}>{children}</React.Suspense>
//     );

//     switch (currentView) {
//       case 'dashboard': return <DashboardPage />;
//       case 'users': return <PageWrapper><UsersPage {...props} /></PageWrapper>;
//       case 'roles': return <PageWrapper><RolesPage {...props} /></PageWrapper>;
//       case 'drivers': return <PageWrapper><DriversPage {...props} /></PageWrapper>;
//       case 'vehicles': return <PageWrapper><VehiclesPage {...props} /></PageWrapper>;
//       case 'vehicle-docs': return <PageWrapper><VehiclesPage {...props} showDocs /></PageWrapper>;
//       case 'routes': return <PageWrapper><RouteCreationPage {...props} /></PageWrapper>;
//       case 'stops': return <PageWrapper><RouteCreationPage {...props} showStops /></PageWrapper>;
//       case 'trips': return <PageWrapper><TripsPage {...props} /></PageWrapper>;
//       case 'scheduled-trips': return <PageWrapper><ScheduledTripsPage {...props} /></PageWrapper>;
//       case 'passengers': return <PageWrapper><PassengersPage {...props} /></PageWrapper>;
//       case 'bookings': return <PageWrapper><BookingsPage {...props} /></PageWrapper>;
//       case 'passes': return <PageWrapper><PassesManagementPage {...props} /></PageWrapper>;
//       case 'coupons': return <PageWrapper><CouponsPage {...props} /></PageWrapper>;
//       case 'payments': return <PageWrapper><PaymentsPage {...props} /></PageWrapper>;
//       case 'cancelled-tickets': return <PageWrapper><CancelledTicketsRefundPage {...props} /></PageWrapper>;
//       case 'refunds': return <PageWrapper><RefundsPage {...props} /></PageWrapper>;
//       case 'failed-refunds': return <PageWrapper><FailedPaidRefundPage {...props} showFailed /></PageWrapper>;
//       case 'paid-refunds': return <PageWrapper><FailedPaidRefundPage {...props} showPaid /></PageWrapper>;
//       case 'notifications': return <PageWrapper><NotificationsPage {...props} /></PageWrapper>;
//       case 'reports': return <PageWrapper><ReportsPage {...props} /></PageWrapper>;
//       case 'audit-logs': return <PageWrapper><AuditLogsPage {...props} /></PageWrapper>;
//       case 'settings': return <PageWrapper><SettingsPage {...props} /></PageWrapper>;
//       default: return <DashboardPage />;
//     }
//   };

//   const { theme } = useTheme();

//   return (
//     <div className="min-h-screen" style={{ background: theme === 'light' ? '#f8fafc' : '#0a0f1e' }}>
//       <Sidebar
//         currentView={currentView}
//         onSelectView={setCurrentView}
//         isOpen={sidebarOpen}
//         onClose={() => setSidebarOpen(false)}
//         unreadNotifications={unreadNotifications}
//       />

//       {/* Desktop sidebar spacer */}
//       <div className="hidden lg:block" style={{ width: '260px', flexShrink: 0, position: 'fixed', left: 0, top: 0, bottom: 0 }}>
//         <Sidebar
//           currentView={currentView}
//           onSelectView={setCurrentView}
//           isOpen={true}
//           onClose={() => {}}
//           unreadNotifications={unreadNotifications}
//         />
//       </div>

//       <div className="lg:pl-[260px]">
//         <Topbar
//           currentView={currentView}
//           onMenuClick={() => setSidebarOpen(true)}
//           unreadNotifications={unreadNotifications}
//           onNavigate={setCurrentView}
//         />

//         <main className="pt-14 min-h-screen">
//           <div className="p-4 sm:p-6">
//             {renderPage()}
//           </div>
//         </main>
//       </div>

//       {/* Toast */}
//       {toast && <Toast message={toast.message} type={toast.type} />}
//     </div>
//   );
// };

// // ── Root App ───────────────────────────────────────────────
// const App: React.FC = () => (
//   <ThemeProvider>
//     <AuthProvider>
//       <AppInner />
//     </AuthProvider>
//   </ThemeProvider>
// );

// export default App;



import React, { useState, useEffect, useCallback } from 'react';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { Sidebar, View } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { Toast, LoadingState } from './components/ui';
import { notificationsAPI } from './services/api';

// ── Lazy page imports ──────────────────────────────────────

const DriversPage = React.lazy(() =>
  import('./pages/DriversPage').then(m => ({
    default: m.DriversPage
  }))
);

const VehiclesPage = React.lazy(() =>
  import('./pages/VehiclesPage').then(m => ({
    default: m.VehiclesPage
  }))
);

const RouteCreationPage = React.lazy(() =>
  import('./pages/RouteCreationPage').then(m => ({
    default: m.RouteCreationPage
  }))
);

const ScheduledTripsPage = React.lazy(() =>
  import('./pages/ScheduledTripsPage').then(m => ({
    default: m.ScheduledTripsPage
  }))
);

const TripsPage = React.lazy(() =>
  import('./pages/TripsPage').then(m => ({
    default: m.TripsPage
  }))
);

const BookingsPage = React.lazy(() =>
  import('./pages/BookingsPage').then(m => ({
    default: m.BookingsPage
  }))
);

const PassengersPage = React.lazy(() =>
  import('./pages/PassengersPage').then(m => ({
    default: m.PassengersPage
  }))
);

const PassesManagementPage = React.lazy(() =>
  import('./pages/PassesManagementPage').then(m => ({
    default: m.PassesManagementPage
  }))
);

const CancelledTicketsRefundPage = React.lazy(() =>
  import('./pages/CancelledTicketsRefundPage').then(m => ({
    default: m.CancelledTicketsRefundPage
  }))
);

const FailedPaidRefundPage = React.lazy(() =>
  import('./pages/FailedPaidRefundPage').then(m => ({
    default: m.FailedPaidRefundPage
  }))
);

const NotificationsPage = React.lazy(() =>
  import('./pages/NotificationsPage').then(m => ({
    default: m.NotificationsPage
  }))
);

const UsersPage = React.lazy(() =>
  import('./pages/UsersPage').then(m => ({
    default: m.UsersPage
  }))
);

const RolesPage = React.lazy(() =>
  import('./pages/RolesPage').then(m => ({
    default: m.RolesPage
  }))
);

const CouponsPage = React.lazy(() =>
  import('./pages/CouponsPage').then(m => ({
    default: m.CouponsPage
  }))
);

const PaymentsPage = React.lazy(() =>
  import('./pages/PaymentsPage').then(m => ({
    default: m.PaymentsPage
  }))
);

const RefundsPage = React.lazy(() =>
  import('./pages/RefundsPage').then(m => ({
    default: m.RefundsPage
  }))
);

const ReportsPage = React.lazy(() =>
  import('./pages/ReportsPage').then(m => ({
    default: m.ReportsPage
  }))
);

const AuditLogsPage = React.lazy(() =>
  import('./pages/AuditLogsPage').then(m => ({
    default: m.AuditLogsPage
  }))
);

const SettingsPage = React.lazy(() =>
  import('./pages/SettingsPage').then(m => ({
    default: m.SettingsPage
  }))
);

// ── Toast ──────────────────────────────────────────────────

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

// ── Route Prefix ───────────────────────────────────────────
//
// Example:
// VITE_ROUTE_PREFIX=/bus-operator
//
// Routes become:
// /bus-operator/dashboard
// /bus-operator/users
// /bus-operator/drivers
// etc.
//
// If empty:
// /dashboard
// /users
// /drivers
// etc.

const ROUTE_PREFIX = (import.meta.env.VITE_ROUTE_PREFIX || '').replace(
  /\/$/,
  ''
);

// Create complete browser URL for a view
const getRoutePath = (view: View) => {
  return `${ROUTE_PREFIX}/${view}`.replace(/\/+/g, '/');
};

// ── Valid Views ────────────────────────────────────────────

const VALID_VIEWS: View[] = [
  'dashboard',
  'users',
  'roles',
  'drivers',
  'vehicles',
  'vehicle-docs',
  'routes',
  'stops',
  'trips',
  'scheduled-trips',
  'passengers',
  'bookings',
  'passes',
  'coupons',
  'payments',
  'cancelled-tickets',
  'refunds',
  'failed-refunds',
  'paid-refunds',
  'notifications',
  'reports',
  'audit-logs',
  'settings'
];

// ── Get View From Current URL ──────────────────────────────

const getInitialView = (): View => {
  let path = window.location.pathname;

  // Remove configured route prefix
  if (ROUTE_PREFIX && path.startsWith(ROUTE_PREFIX)) {
    path = path.slice(ROUTE_PREFIX.length);
  }

  // Remove leading/trailing slash
  path = path
    .replace(/^\/|\/$/g, '')
    .trim()
    .toLowerCase();

  return VALID_VIEWS.includes(path as View)
    ? (path as View)
    : 'dashboard';
};

// ── Main App Inner ─────────────────────────────────────────

const AppInner: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  const [currentView, setCurrentViewState] =
    useState<View>(getInitialView);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [toast, setToast] =
    useState<ToastState | null>(null);

  const [unreadNotifications, setUnreadNotifications] =
    useState(0);

  const [forgotPwMode, setForgotPwMode] =
    useState(false);

  // ── Change Current View ─────────────────────────────────

  const setCurrentView = (view: View) => {
    setCurrentViewState(view);

    const routePath = getRoutePath(view);

    if (window.location.pathname !== routePath) {
      window.history.pushState({}, '', routePath);
    }
  };

  // ── Browser Back / Forward ──────────────────────────────

  useEffect(() => {
    const handlePopState = () => {
      let path = window.location.pathname;

      // Remove route prefix
      if (ROUTE_PREFIX && path.startsWith(ROUTE_PREFIX)) {
        path = path.slice(ROUTE_PREFIX.length);
      }

      // Clean path
      path = path
        .replace(/^\/|\/$/g, '')
        .trim()
        .toLowerCase();

      if (VALID_VIEWS.includes(path as View)) {
        setCurrentViewState(path as View);
      } else {
        setCurrentViewState('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // ── Toast Notification ──────────────────────────────────

  const notify = useCallback(
    (
      message: string,
      type: ToastState['type'] = 'success'
    ) => {
      setToast({
        message,
        type
      });

      setTimeout(() => {
        setToast(null);
      }, 3000);
    },
    []
  );

  // ── Fetch Unread Notifications ──────────────────────────

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const fetchUnread = async () => {
      try {
        const resp = await notificationsAPI.list({
          read: 'false',
          limit: 1
        });

        setUnreadNotifications(
          resp.data.unread_count || 0
        );
      } catch {
        // Ignore notification errors
      }
    };

    fetchUnread();

    const interval = setInterval(
      fetchUnread,
      60000
    );

    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  // ── Loading ──────────────────────────────────────────────

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0f172a' }}
      >
        <LoadingState message="Initializing..." />
      </div>
    );
  }

  // ── Login ────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <LoginPage
        onForgotPassword={() =>
          setForgotPwMode(true)
        }
      />
    );
  }

  // ── Render Current Page ─────────────────────────────────

  const renderPage = () => {
    const props = {
      onNotify: notify
    };

    const PageWrapper = ({
      children
    }: {
      children: React.ReactNode;
    }) => (
      <React.Suspense fallback={<LoadingState />}>
        {children}
      </React.Suspense>
    );

    switch (currentView) {
      case 'dashboard':
        return <DashboardPage />;

      case 'users':
        return (
          <PageWrapper>
            <UsersPage {...props} />
          </PageWrapper>
        );

      case 'roles':
        return (
          <PageWrapper>
            <RolesPage {...props} />
          </PageWrapper>
        );

      case 'drivers':
        return (
          <PageWrapper>
            <DriversPage {...props} />
          </PageWrapper>
        );

      case 'vehicles':
        return (
          <PageWrapper>
            <VehiclesPage {...props} />
          </PageWrapper>
        );

      case 'vehicle-docs':
        return (
          <PageWrapper>
            <VehiclesPage
              {...props}
              showDocs
            />
          </PageWrapper>
        );

      case 'routes':
        return (
          <PageWrapper>
            <RouteCreationPage {...props} />
          </PageWrapper>
        );

      case 'stops':
        return (
          <PageWrapper>
            <RouteCreationPage
              {...props}
              showStops
            />
          </PageWrapper>
        );

      case 'trips':
        return (
          <PageWrapper>
            <TripsPage {...props} />
          </PageWrapper>
        );

      case 'scheduled-trips':
        return (
          <PageWrapper>
            <ScheduledTripsPage {...props} />
          </PageWrapper>
        );

      case 'passengers':
        return (
          <PageWrapper>
            <PassengersPage {...props} />
          </PageWrapper>
        );

      case 'bookings':
        return (
          <PageWrapper>
            <BookingsPage {...props} />
          </PageWrapper>
        );

      case 'passes':
        return (
          <PageWrapper>
            <PassesManagementPage {...props} />
          </PageWrapper>
        );

      case 'coupons':
        return (
          <PageWrapper>
            <CouponsPage {...props} />
          </PageWrapper>
        );

      case 'payments':
        return (
          <PageWrapper>
            <PaymentsPage {...props} />
          </PageWrapper>
        );

      case 'cancelled-tickets':
        return (
          <PageWrapper>
            <CancelledTicketsRefundPage
              {...props}
            />
          </PageWrapper>
        );

      case 'refunds':
        return (
          <PageWrapper>
            <RefundsPage {...props} />
          </PageWrapper>
        );

      case 'failed-refunds':
        return (
          <PageWrapper>
            <FailedPaidRefundPage
              {...props}
              showFailed
            />
          </PageWrapper>
        );

      case 'paid-refunds':
        return (
          <PageWrapper>
            <FailedPaidRefundPage
              {...props}
              showPaid
            />
          </PageWrapper>
        );

      case 'notifications':
        return (
          <PageWrapper>
            <NotificationsPage {...props} />
          </PageWrapper>
        );

      case 'reports':
        return (
          <PageWrapper>
            <ReportsPage {...props} />
          </PageWrapper>
        );

      case 'audit-logs':
        return (
          <PageWrapper>
            <AuditLogsPage {...props} />
          </PageWrapper>
        );

      case 'settings':
        return (
          <PageWrapper>
            <SettingsPage {...props} />
          </PageWrapper>
        );

      default:
        return <DashboardPage />;
    }
  };

  // ── Theme ────────────────────────────────────────────────

  const { theme } = useTheme();

  // ── Main Layout ──────────────────────────────────────────

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          theme === 'light'
            ? '#f8fafc'
            : '#0a0f1e'
      }}
    >
      {/* Mobile Sidebar */}

      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadNotifications={
          unreadNotifications
        }
      />

      {/* Desktop Sidebar */}

      <div
        className="hidden lg:block"
        style={{
          width: '260px',
          flexShrink: 0,
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0
        }}
      >
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          isOpen={true}
          onClose={() => {}}
          unreadNotifications={
            unreadNotifications
          }
        />
      </div>

      {/* Main Content */}

      <div className="lg:pl-[260px]">
        <Topbar
          currentView={currentView}
          onMenuClick={() =>
            setSidebarOpen(true)
          }
          unreadNotifications={
            unreadNotifications
          }
          onNavigate={setCurrentView}
        />

        <main className="pt-14 min-h-screen">
          <div className="p-4 sm:p-6">
            {renderPage()}
          </div>
        </main>
      </div>

      {/* Toast */}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
        />
      )}
    </div>
  );
};

// ── Root App ───────────────────────────────────────────────

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  </ThemeProvider>
);

export default App;