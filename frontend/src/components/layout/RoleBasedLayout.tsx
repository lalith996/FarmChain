'use client';

import React, { useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  HomeIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CogIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { getRoleTheme } from '@/config/roleThemes';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: number;
  children?: NavItem[];
}

interface RoleBasedLayoutProps {
  children: ReactNode;
  role: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

// Navigation items per role
const roleNavigations: Record<string, NavItem[]> = {
  FARMER: [
    { name: 'Dashboard', href: '/farmer', icon: HomeIcon },
    { name: 'Products', href: '/farmer/listings', icon: ShoppingBagIcon },
    { name: 'Orders', href: '/farmer/orders', icon: ShoppingBagIcon, badge: 3 },
    { name: 'Inventory', href: '/farmer/inventory', icon: ChartBarIcon },
    { name: 'Analytics', href: '/farmer/analytics', icon: ChartBarIcon },
    { name: 'Earnings', href: '/farmer/earnings', icon: ChartBarIcon },
    { name: 'ML Insights', href: '/farmer/ml-insights', icon: ChartBarIcon },
    { name: 'Batches', href: '/farmer/batches', icon: ShoppingBagIcon },
    { name: 'Calendar', href: '/farmer/calendar', icon: HomeIcon },
    { name: 'Buyers Network', href: '/farmer/buyers', icon: UserGroupIcon },
    { name: 'Certificates', href: '/farmer/certificates', icon: ShoppingBagIcon },
    { name: 'Payments', href: '/farmer/payments', icon: ChartBarIcon },
    { name: 'Settings', href: '/farmer/settings', icon: CogIcon },
  ],

  DISTRIBUTOR: [
    { name: 'Dashboard', href: '/distributor', icon: HomeIcon },
    { name: 'Orders', href: '/distributor/orders', icon: ShoppingBagIcon, badge: 5 },
    { name: 'Inventory', href: '/distributor/inventory', icon: ChartBarIcon },
    { name: 'Procurement', href: '/distributor/procurement', icon: ShoppingBagIcon },
    { name: 'Logistics', href: '/distributor/logistics', icon: HomeIcon },
    { name: 'Fleet', href: '/distributor/fleet', icon: HomeIcon },
    { name: 'Suppliers', href: '/distributor/suppliers', icon: UserGroupIcon },
    { name: 'Retailers', href: '/distributor/retailers', icon: UserGroupIcon },
    { name: 'Quality Control', href: '/distributor/quality', icon: ChartBarIcon },
    { name: 'Routes', href: '/distributor/routes', icon: HomeIcon },
    { name: 'Analytics', href: '/distributor/analytics', icon: ChartBarIcon },
    { name: 'Payments', href: '/distributor/payments', icon: ChartBarIcon },
    { name: 'Settings', href: '/distributor/settings', icon: CogIcon },
  ],

  RETAILER: [
    { name: 'Dashboard', href: '/retailer', icon: HomeIcon },
    { name: 'Store', href: '/retailer/store', icon: HomeIcon },
    { name: 'Orders', href: '/retailer/orders', icon: ShoppingBagIcon, badge: 8 },
    { name: 'Purchase Orders', href: '/retailer/orders/purchase', icon: ShoppingBagIcon },
    { name: 'Inventory', href: '/retailer/inventory', icon: ChartBarIcon },
    { name: 'Sourcing', href: '/retailer/sourcing', icon: ShoppingBagIcon },
    { name: 'Sales', href: '/retailer/sales', icon: ChartBarIcon },
    { name: 'Customers', href: '/retailer/customers', icon: UserGroupIcon },
    { name: 'Pricing', href: '/retailer/pricing', icon: ChartBarIcon },
    { name: 'Promotions', href: '/retailer/promotions', icon: ShoppingBagIcon },
    { name: 'POS', href: '/retailer/pos', icon: HomeIcon },
    { name: 'Analytics', href: '/retailer/analytics', icon: ChartBarIcon },
    { name: 'Payments', href: '/retailer/payments', icon: ChartBarIcon },
    { name: 'Marketing', href: '/retailer/marketing', icon: ChartBarIcon },
    { name: 'Staff', href: '/retailer/staff', icon: UserGroupIcon },
    { name: 'Settings', href: '/retailer/settings', icon: CogIcon },
  ],

  CONSUMER: [
    { name: 'Home', href: '/consumer', icon: HomeIcon },
    { name: 'Marketplace', href: '/consumer/marketplace', icon: ShoppingBagIcon },
    { name: 'Cart', href: '/consumer/cart', icon: ShoppingBagIcon, badge: 2 },
    { name: 'Orders', href: '/consumer/orders', icon: ShoppingBagIcon },
    { name: 'Wishlist', href: '/consumer/wishlist', icon: HomeIcon },
    { name: 'Reviews', href: '/consumer/reviews', icon: ChartBarIcon },
    { name: 'Wallet', href: '/consumer/wallet', icon: ChartBarIcon },
    { name: 'Notifications', href: '/consumer/notifications', icon: BellIcon, badge: 5 },
    { name: 'Support', href: '/consumer/support', icon: HomeIcon },
    { name: 'Profile', href: '/consumer/profile', icon: UserGroupIcon },
  ],
};

export default function RoleBasedLayout({ children, role, user }: RoleBasedLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const theme = getRoleTheme(role);

  const navigation = roleNavigations[role] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <SidebarContent
            navigation={navigation}
            pathname={pathname}
            theme={theme}
            onClose={() => setSidebarOpen(false)}
            isMobile
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent navigation={navigation} pathname={pathname} theme={theme} />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Search */}
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <form className="relative flex flex-1" action="#" method="GET">
              <label htmlFor="search-field" className="sr-only">
                Search
              </label>
              <MagnifyingGlassIcon
                className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="search-field"
                className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                placeholder="Search..."
                type="search"
                name="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                <BellIcon className="h-6 w-6" />
                <span className="absolute -mt-5 ml-2 inline-flex h-2 w-2 items-center justify-center rounded-full bg-red-600" />
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button className="flex items-center gap-x-4 px-2 py-1.5 text-sm font-semibold text-gray-900">
                  <span className="sr-only">Open user menu</span>
                  <img
                    className="h-8 w-8 rounded-full bg-gray-50"
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                    alt={user.name}
                  />
                  <span className="hidden lg:flex lg:items-center">
                    <span className="ml-2 text-sm font-semibold leading-6 text-gray-900">
                      {user.name}
                    </span>
                    <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  navigation,
  pathname,
  theme,
  onClose,
  isMobile = false,
}: {
  navigation: NavItem[];
  pathname: string;
  theme: any;
  onClose?: () => void;
  isMobile?: boolean;
}) {
  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
      <div className="flex h-16 shrink-0 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div
            className={`h-8 w-8 rounded-lg bg-gradient-to-br ${theme.gradients.primary}`}
          />
          <span className="text-xl font-bold" style={{ color: theme.colors.primary }}>
            FarmChain
          </span>
        </Link>
        {isMobile && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`
                        group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-all
                        ${
                          isActive
                            ? `bg-gradient-to-r ${theme.gradients.primary} text-white shadow-md`
                            : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <item.icon className="h-6 w-6 shrink-0" />
                      {item.name}
                      {item.badge && (
                        <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}
