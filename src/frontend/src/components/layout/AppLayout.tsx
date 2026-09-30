import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { HeaderTabs } from './HeaderTabs';
import { View } from '../../types';

interface AppLayoutProps {
  currentView: View;
  onSelectView: (view: View) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentView,
  onSelectView,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        currentView={currentView}
        onSelectView={onSelectView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="main-content">
        <Topbar
          currentView={currentView}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
        <HeaderTabs
          currentView={currentView}
          onSelectView={onSelectView}
        />
        <div className="page-wrap">
          {children}
        </div>
      </main>
    </div>
  );
};
