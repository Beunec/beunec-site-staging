'use client';

import React, { Suspense, memo, useEffect, useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import { useUser } from "@auth0/nextjs-auth0"
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { usePathname } from 'next/navigation';
import { useNavbar } from '@/contexts/NavbarContext';
import PageSkeleton from '@/components/PageSkeleton';
import WorkspaceSkeleton from '@/components/aselius-workspace/WorkspaceSkeleton';
import { usePageTracking } from '@/hooks/use-page-tracking';
import { isAseliusWorkspacePath } from '@/lib/aseliusRoutes';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
// Mounted here (not only inside /workspace/* pages) so the Aselius auth token
// this layout's Sidebar depends on (via useWorkspaceProvisioner) is populated
// on every authenticated route, not just the workspace ones — see
// WorkspaceAuthSync.tsx for the full explanation of why this mattered. Plain
// import (this file is already 'use client', and WorkspaceAuthSync itself
// renders null) to match how /workspace/* pages already import it.
import WorkspaceAuthSync from '@/components/aselius-workspace/WorkspaceAuthSync';
import { WorkspaceSelius } from '@/components/selius/WorkspaceSelius';

const NotificationsPanel = dynamic(() => import('@/components/dashboard/NotificationsPanel'), { ssr: false });
const GlobalSocketListener = dynamic(() => import('@/components/GlobalSocketListener'), { ssr: false });
const PlatformNotificationBridge = dynamic(() => import('@/lib/PlatformNotificationBridge'), { ssr: false });

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout = memo(({
  children,
}: AuthenticatedLayoutProps) => {
  const { user } = useUser();
  const darkMode = useStore((state) => state.darkMode);
  const sidebarCollapsed = useStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const toggleDarkMode = useStore((state) => state.toggleDarkMode);
  const notifications = useStore((state) => state.notifications);
  const toggleNotifications = useStore((state) => state.toggleNotifications);
  const showNotifications = useStore((state) => state.showNotifications);
  const markNotificationAsRead = useStore((state) => state.markNotificationAsRead);
  const markNotificationAsUnread = useStore((state) => state.markNotificationAsUnread);
  const removeNotification = useStore((state) => state.removeNotification);
  const clearAllNotifications = useStore((state) => state.clearAllNotifications);
  const markAllNotificationsRead = useStore((state) => state.markAllNotificationsRead);
  const isPageLoading = useStore((state) => state.isPageLoading);
  const pendingPath = useStore((state) => state.pendingPath);
  const setPageLoading = useStore((state) => state.setPageLoading);
  const navbarConfig = useStore((state) => state.navbarConfig);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const { config: navbarContextConfig } = useNavbar();
  const wasAseliusWorkspaceRef = React.useRef(false);

  // Track user's navigation for smart redirect
  usePageTracking();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the correct skeleton variant based on the route
  const getSkeletonVariant = (path: string | null): 'default' | 'grid' | 'list' | 'kanban' => {
    if (!path) return 'default';
    if (path.startsWith('/settings')) return 'default';
    if (path.startsWith('/teams')) return 'default';
    if (path.startsWith('/subscription')) return 'default';
    return 'default';
  };

  const getWorkspaceSkeletonVariant = (
    path: string | null,
  ): 'chat' | 'connector' | 'list' | 'form' => {
    if (!path) return 'chat';
    if (path.includes('/connector')) return 'connector';
    if (path.includes('/governance')) return 'form';
    if (path.includes('/shared-with-me')) return 'list';
    return 'chat';
  };

  const showRouteSkeleton = isPageLoading;

  const workspaceRouteSkeleton =
    showRouteSkeleton &&
    (isAseliusWorkspacePath(pathname ?? '') || isAseliusWorkspacePath(pendingPath ?? ''));

  // Reset loading state when pathname changes (navigation complete)
  useEffect(() => {
    setPageLoading(false);
  }, [pathname, setPageLoading]);

  // Auto-collapse sidebar & Hide Navbar when entering Aselius Workspace.
  // Only fires on the false→true transition (arriving from outside the
  // workspace section) — every path inside /workspace/... is still an
  // Aselius path, so without this guard, switching Taskspaces re-ran this
  // effect on every navigation and re-collapsed a sidebar the user had just
  // reopened by hand (reported 2026-07-17: "sidebar closing automatically
  // every time I switch workspace").
  useEffect(() => {
    const isAseliusWorkspace = isAseliusWorkspacePath(pathname ?? '');
    const justEntered = isAseliusWorkspace && !wasAseliusWorkspaceRef.current;
    wasAseliusWorkspaceRef.current = isAseliusWorkspace;

    if (justEntered && !useStore.getState().sidebarCollapsed) {
      toggleSidebar();
    }

    // Hide Navbar for Aselius Workspace
    if (isAseliusWorkspace) {
      useStore.getState().setNavbarConfig({ showNavbar: false });
    } else {
      // Restore Navbar visibility when leaving (optional, but good safety)
      useStore.getState().setNavbarConfig({ showNavbar: true });
    }
  }, [pathname]);

  // Sync navbar context with Zustand (for pages that use NavbarContext)
  useEffect(() => {
    if (navbarContextConfig.title || navbarContextConfig.subtitle || navbarContextConfig.rightContent || navbarContextConfig.showNavbar !== undefined) {
      useStore.getState().setNavbarConfig({
        title: navbarContextConfig.title || navbarConfig.title,
        subtitle: navbarContextConfig.subtitle || navbarConfig.subtitle,
        rightContent: navbarContextConfig.rightContent || navbarConfig.rightContent,
        showNavbar: navbarContextConfig.showNavbar ?? navbarConfig.showNavbar,
      });
    }
  }, [navbarContextConfig.title, navbarContextConfig.subtitle, navbarContextConfig.rightContent, navbarContextConfig.showNavbar]);

  // Overlay drawer only on phones and small tablets. From 768px up the sidebar
  // is the 72px rail, so a window at 70% of a laptop screen (e.g. the page
  // area of Rivine Browse beside its panel, ~900–1000px) keeps the desktop
  // layout — chat and preview side by side — instead of turning into overlays.
  // Keep in step with components/Sidebar.tsx.
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const notificationCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  );

  // Calculate margin — sidebar width + optional gap for Aselius workspace routes
  const getMarginLeft = () => {
    if (isMobile) return '0px';
    const sidebarW = sidebarCollapsed ? 72 : 300;
    const gap = isAseliusWorkspacePath(pathname ?? '') ? 12 : 0;
    return `${sidebarW + gap}px`;
  };

  // Memoize sidebar props to prevent unnecessary re-renders
  const sidebarProps = useMemo(() => ({
    collapsed: sidebarCollapsed,
    toggleSidebar,
    darkMode,
    user
  }), [sidebarCollapsed, toggleSidebar, darkMode, user]);

  // Show minimal layout until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-canvas dark:!bg-gray-900 text-gray-900 dark:text-white transition-none">
      <WorkspaceAuthSync />
      <div className="flex h-screen overflow-hidden">
        <div className="fixed inset-y-0 left-0 z-40">
          <ErrorBoundary fallback={<div className="p-4 text-red-500">Sidebar failed to load.</div>}>
            <Suspense fallback={null}>
              <Sidebar {...sidebarProps} />
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* Mobile overlay for blur */}
        {isMobile && !sidebarCollapsed && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{
            marginLeft: getMarginLeft(),
            transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >


          <div
            data-app-canvas
            className={`flex-1 relative h-full min-h-0 ${darkMode ? '' : 'bg-canvas'
              } ${pathname?.startsWith('/teams')
                ? 'overflow-hidden'
                : isAseliusWorkspacePath(pathname ?? '')
                  ? 'overflow-hidden'
                  : 'overflow-y-auto'
              } ${isAseliusWorkspacePath(pathname ?? '') ? 'p-1.5 sm:p-2 md:p-3' : ''
              }`}
          >
            {workspaceRouteSkeleton ? (
              <WorkspaceSkeleton variant={getWorkspaceSkeletonVariant(pendingPath ?? pathname)} />
            ) : showRouteSkeleton ? (
              <PageSkeleton variant={getSkeletonVariant(pendingPath)} />
            ) : (
              children
            )}
          </div>
        </div>
      </div>

      {/* Notifications Panel - Available across all tabs */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationsPanel
            notifications={notifications}
            onClose={toggleNotifications}
            darkMode={darkMode}
            onMarkAsRead={markNotificationAsRead}
            onMarkAsUnread={markNotificationAsUnread}
            onRemove={removeNotification}
            onClearAll={clearAllNotifications}
            onMarkAllAsRead={markAllNotificationsRead}
          />
        )}
      </AnimatePresence>

      {/* Toast Notifications — shadcn toaster for routes using legacy toast; platform routes use AppToastHost */}
      {!pathname?.startsWith('/teams') && <Toaster />}
      <GlobalSocketListener />
      <PlatformNotificationBridge />
      <WorkspaceSelius />
    </div>
  );
});

AuthenticatedLayout.displayName = 'AuthenticatedLayout';
export default AuthenticatedLayout;
