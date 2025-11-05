'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
  allowedRoles: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAll?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback,
  redirectTo,
  requireAll = false,
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    if (redirectTo) {
      router.push(redirectTo);
      return null;
    }
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You must be logged in to access this page.</p>
          </div>
        </div>
      )
    );
  }

  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const userRoles = user.roles || [];

  // Check role authorization
  const hasRequiredRoles = requireAll
    ? rolesArray.every(role => userRoles.includes(role))
    : rolesArray.some(role => userRoles.includes(role));

  if (!hasRequiredRoles) {
    if (redirectTo) {
      router.push(redirectTo);
      return null;
    }
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">
              You don&apos;t have the required role to access this page.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Required role{rolesArray.length > 1 ? 's' : ''}: {rolesArray.join(', ')}
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
