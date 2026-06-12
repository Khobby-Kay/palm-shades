'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/tiwa/supabase';
import {
  clearSbAuthCookies,
  setSbAccessToken,
} from '@/lib/tiwa/auth-cookies';
import { AdminConnectionError } from '@/components/admin/AdminConnectionError';
import { withTimeout } from '@/lib/tiwa/with-timeout';
import { STORE_MODULES_CHANGED } from '@/lib/store-modules';
import { LiveActivitySync } from '@/components/live/LiveActivitySync';
import {
  firstAllowedAdminPath,
  hasAdminPermission,
  isSuperAdmin,
  normalizeAdminPermissions,
  resolvePermissionForPath,
  roleDisplayLabel,
  type AdminPermissionKey,
} from '@/lib/admin/permissions';

const AUTH_TIMEOUT_MS = 12_000;

function isNetworkAuthError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('failed to fetch') ||
    m.includes('network') ||
    m.includes('fetch failed') ||
    m.includes('timeout')
  );
}

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginRoute = pathname === '/admin/login';
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(!isLoginRoute);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<AdminPermissionKey[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [authRetryKey, setAuthRetryKey] = useState(0);

  const [enabledModules, setEnabledModules] = useState<string[]>([]);

  const goToLogin = useCallback((query?: string) => {
    setIsLoading(false);
    router.replace(query ? `/admin/login?${query}` : '/admin/login');
  }, [router]);

  useEffect(() => {
    if (isLoginRoute) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const supabase = getSupabaseBrowser();

    async function checkAuth() {
      setConnectionError(null);
      setIsLoading(true);

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
      const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
      if (!supabaseUrl || !supabaseAnon) {
        if (!cancelled) {
          setConnectionError(
            'Supabase keys are missing in this build. Save NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env, then restart npm run dev.'
          );
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data: { session }, error: sessionError } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_TIMEOUT_MS,
          'Sign-in check'
        );

        if (cancelled) return;

        if (sessionError) {
          if (isNetworkAuthError(sessionError.message)) {
            if (!cancelled) {
              setConnectionError(
                'Could not reach Supabase. Check your internet connection, confirm the project is not paused in the Supabase dashboard, then try again.'
              );
              setIsLoading(false);
            }
            return;
          }
          if (!cancelled) goToLogin();
          return;
        }

        if (!session) {
          if (!cancelled) goToLogin();
          return;
        }

        setSbAccessToken(session.access_token);

        const { data: profile, error: profileError } = await withTimeout(
          supabase
            .from('profiles')
            .select('role, admin_permissions')
            .eq('id', session.user.id)
            .single(),
          AUTH_TIMEOUT_MS,
          'Profile load'
        );

        if (cancelled) return;

        if (profileError) {
          if (isNetworkAuthError(profileError.message)) {
            if (!cancelled) {
              setConnectionError(
                'Could not load your admin profile. Check your network and try again.'
              );
              setIsLoading(false);
            }
            return;
          }
          console.error('Failed to fetch user profile', profileError);
          if (!cancelled) goToLogin();
          return;
        }

        if (!profile) {
          if (!cancelled) goToLogin();
          return;
        }

        if (profile.role !== 'admin' && profile.role !== 'staff') {
          console.warn('User does not have admin/staff role');
          clearSbAuthCookies();
          await supabase.auth.signOut();
          if (!cancelled) goToLogin('error=unauthorized');
          return;
        }

        const permissions = normalizeAdminPermissions(profile.admin_permissions);

        if (!cancelled) {
          setUser(session.user);
          setUserRole(profile.role);
          setUserPermissions(permissions);
          setIsLoading(false);
        }
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        if (
          message.includes('Missing NEXT_PUBLIC_SUPABASE') ||
          isNetworkAuthError(message) ||
          message.includes('timed out')
        ) {
          setConnectionError(
            message.includes('timed out')
              ? 'Admin sign-in is taking too long. Check your network, confirm npm run dev is running (see terminal for the port), then try again.'
              : 'Could not connect to Supabase. Run npm run dev and open /admin/login in a normal browser tab.'
          );
        } else {
          setConnectionError(message || 'Something went wrong loading admin.');
        }
        setIsLoading(false);
      }
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        setSbAccessToken(session.access_token);
        if (event === 'SIGNED_IN') {
          void checkAuth();
        }
      }
      if (event === 'SIGNED_OUT') {
        clearSbAuthCookies();
        if (!cancelled) goToLogin();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [isLoginRoute, authRetryKey, goToLogin]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  useEffect(() => {
    if (isLoginRoute) return;

    async function fetchModules() {
      try {
        const { data, error } = await getSupabaseBrowser()
          .from('store_modules')
          .select('id, enabled');
        if (error) {
          console.warn('Error fetching modules:', error);
          return;
        }
        if (data) {
          setEnabledModules(data.filter((m: any) => m.enabled).map((m: any) => m.id));
        }
      } catch (err) {
        console.warn('Fetch modules failed:', err);
      }
    }
    fetchModules();

    const onModulesChanged = () => {
      void fetchModules();
    };
    window.addEventListener(STORE_MODULES_CHANGED, onModulesChanged);
    return () => {
      window.removeEventListener(STORE_MODULES_CHANGED, onModulesChanged);
    };
  }, [isLoginRoute]);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isLoginRoute || isLoading || !userRole) return;

    const required = resolvePermissionForPath(pathname);
    if (!required) return;

    if (!hasAdminPermission(userRole, userPermissions, required)) {
      const fallback = firstAllowedAdminPath(userRole, userPermissions);
      router.replace(fallback);
    }
  }, [isLoginRoute, isLoading, userRole, userPermissions, pathname, router]);

  const handleLogout = async () => {
    clearSbAuthCookies();
    await getSupabaseBrowser().auth.signOut();
    router.replace('/admin/login');
  };

  if (isLoginRoute) {
    return <>{children}</>;
  }

  const adminShell = (content: ReactNode) => (
    <>
      <LiveActivitySync />
      {content}
    </>
  );

  if (connectionError) {
    return adminShell(
      <AdminConnectionError
        message={connectionError}
        onRetry={() => {
          setIsLoading(true);
          setConnectionError(null);
          setAuthRetryKey((k) => k + 1);
        }}
      />
    );
  }

  if (isLoading) {
    return adminShell(
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500 gap-2">
        <p>Loading Admin...</p>
        <p className="text-xs text-gray-400">
          If this never finishes, use the URL shown in your terminal (e.g. http://localhost:3001/admin/login)
        </p>
      </div>
    );
  }

  const menuItems: Array<{
    title: string;
    icon: string;
    path: string;
    exact?: boolean;
    badge?: string;
    moduleId?: string;
    permissionKey?: string;
    superAdminOnly?: boolean;
  }> = [
    {
      title: 'Dashboard',
      icon: 'ri-dashboard-line',
      path: '/admin',
      exact: true,
      permissionKey: 'dashboard',
    },
    {
      title: 'Orders',
      icon: 'ri-shopping-bag-line',
      path: '/admin/orders',
      badge: '',
      permissionKey: 'orders',
    },
    {
      title: 'Bookings',
      icon: 'ri-calendar-check-line',
      path: '/admin/bookings',
      permissionKey: 'bookings',
    },
    {
      title: 'POS System',
      icon: 'ri-store-3-line',
      path: '/admin/pos',
      permissionKey: 'pos',
    },
    {
      title: 'Products',
      icon: 'ri-box-3-line',
      path: '/admin/products',
      permissionKey: 'products',
    },
    {
      title: 'Categories',
      icon: 'ri-folder-line',
      path: '/admin/categories',
      permissionKey: 'categories',
    },
    {
      title: 'Customers',
      icon: 'ri-group-line',
      path: '/admin/customers',
      permissionKey: 'customers',
    },
    {
      title: 'Reviews',
      icon: 'ri-chat-smile-2-line',
      path: '/admin/reviews',
      permissionKey: 'reviews',
    },
    {
      title: 'Inventory',
      icon: 'ri-stack-line',
      path: '/admin/inventory',
      permissionKey: 'inventory',
    },
    {
      title: 'Analytics',
      icon: 'ri-bar-chart-line',
      path: '/admin/analytics',
      permissionKey: 'analytics',
    },
    {
      title: 'Coupons',
      icon: 'ri-coupon-2-line',
      path: '/admin/coupons',
      permissionKey: 'coupons',
    },
    {
      title: 'CMS / Pages',
      icon: 'ri-file-list-line',
      path: '/admin/cms',
      moduleId: 'cms',
      permissionKey: 'cms',
    },
    {
      title: 'Homepage',
      icon: 'ri-home-gear-line',
      path: '/admin/homepage',
      moduleId: 'homepage',
      permissionKey: 'homepage',
    },
    {
      title: 'Flash Sales',
      icon: 'ri-flashlight-line',
      path: '/admin/flash-sales',
      moduleId: 'flash-sales',
      permissionKey: 'flash-sales',
    },
    {
      title: 'Loyalty',
      icon: 'ri-trophy-line',
      path: '/admin/loyalty-program',
      moduleId: 'loyalty-program',
      permissionKey: 'loyalty-program',
    },
    {
      title: 'PWA',
      icon: 'ri-smartphone-line',
      path: '/admin/pwa-settings',
      moduleId: 'pwa-settings',
      permissionKey: 'pwa-settings',
    },
    {
      title: 'Assistant Insights',
      icon: 'ri-robot-line',
      path: '/admin/assistant-insights',
      permissionKey: 'assistant-insights',
    },
    {
      title: 'Customer Insights',
      icon: 'ri-user-search-line',
      path: '/admin/customer-insights',
      moduleId: 'customer-insights',
      permissionKey: 'customer-insights',
    },
    {
      title: 'Notifications',
      icon: 'ri-notification-3-line',
      path: '/admin/notifications',
      moduleId: 'notifications',
      permissionKey: 'notifications',
    },
    {
      title: 'SMS Debugger',
      icon: 'ri-message-2-line',
      path: '/admin/test-sms',
      permissionKey: 'test-sms',
    },
    {
      title: 'Blog',
      icon: 'ri-article-line',
      path: '/admin/blog',
      moduleId: 'blog',
      permissionKey: 'blog',
    },
    {
      title: 'Modules',
      icon: 'ri-puzzle-line',
      path: '/admin/modules',
      superAdminOnly: true,
    },
    {
      title: 'Team & Access',
      icon: 'ri-shield-user-line',
      path: '/admin/team',
      superAdminOnly: true,
    },
  ];

  const visibleMenuItems = menuItems.filter((item) => {
    if (item.superAdminOnly && !isSuperAdmin(userRole)) return false;
    if (item.permissionKey && !hasAdminPermission(userRole, userPermissions, item.permissionKey)) {
      return false;
    }
    if (item.moduleId && !enabledModules.includes(item.moduleId)) return false;
    return true;
  });

  return adminShell(
    <div className="admin-root min-h-screen bg-gray-50">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/remixicon@4.6.0/fonts/remixicon.min.css"
      />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden glass-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300
          w-64
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          ${isSidebarOpen ? 'lg:w-64' : 'lg:w-0 lg:overflow-hidden'}
          lg:translate-x-0
        `}
      >
        <div className="h-full px-4 py-6 overflow-y-auto">
          <Link href="/admin" className="flex items-center mb-8 px-2 cursor-pointer">
            <span className="text-xl font-serif font-semibold text-rose-800">Palm Shades</span>
            <span className="ml-3 text-sm font-semibold text-gray-500">ADMIN</span>
          </Link>

          <nav className="space-y-1">
            {visibleMenuItems.map((item) => {
              const isActive = item.exact ? pathname === item.path : pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors cursor-pointer ${isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <i className={`${item.icon} text-xl w-5 h-5 flex items-center justify-center`}></i>
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link
              href="/"
              target="_blank"
              onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              <i className="ri-external-link-line text-xl w-5 h-5 flex items-center justify-center"></i>
              <span>View Store</span>
            </Link>
          </div>
        </div>
      </aside>

      <div className={`transition-all duration-300 ml-0 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 py-4 lg:px-6 flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
            >
              <i className={`${isSidebarOpen ? 'ri-menu-fold-line' : 'ri-menu-unfold-line'} text-xl`}></i>
            </button>

            <div className="flex items-center space-x-2 lg:space-x-4">
              <button className="relative flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 cursor-pointer">
                <i className="ri-notification-3-line text-xl"></i>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 lg:space-x-3 px-2 lg:px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-semibold text-gray-900">{roleDisplayLabel(userRole)}</p>
                    <p className="text-xs text-gray-500 max-w-[100px] truncate">{user?.email}</p>
                  </div>
                  <i className="ri-arrow-down-s-line text-gray-600"></i>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors border-t border-gray-200 text-left cursor-pointer"
                    >
                      <i className="ri-logout-box-line text-red-600 w-5 h-5 flex items-center justify-center"></i>
                      <span className="text-red-600">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
