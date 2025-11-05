'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAuthStore } from '@/store/authStore';
import {
  HomeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  ChartBarIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

export function Navigation() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Products', href: '/products', icon: ShoppingBagIcon },
    ...(isAuthenticated
      ? [
          { name: 'Orders', href: '/orders', icon: ShoppingCartIcon },
          { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
          { name: 'Profile', href: '/profile', icon: UserCircleIcon },
        ]
      : []),
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-green-600">
                🌾 FarmChain
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-green-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-1" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <>
                <Link
                  href="/notifications"
                  className="p-2 rounded-full text-gray-400 hover:text-gray-500 relative"
                >
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                </Link>
                <div className="text-sm text-gray-700">
                  <div className="font-medium">{user?.profile.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                </div>
              </>
            )}
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
