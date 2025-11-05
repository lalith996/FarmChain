'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface PermissionGuardProps {
  requiredPermissions: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAll?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  requiredPermissions,
  children,
  fallback,
  redirectTo,
  requireAll = true,
}) => {
  const { user, loading, isAuthenticated, checkPermission } = useAuth();
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

  const permissionsArray = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];

  // Check permission authorization
  const hasRequiredPermissions = requireAll
    ? permissionsArray.every(permission => checkPermission(permission))
    : permissionsArray.some(permission => checkPermission(permission));

  if (!hasRequiredPermissions) {
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
              You don&apos;t have the required permissions to access this page.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Required permission{permissionsArray.length > 1 ? 's' : ''}: {permissionsArray.join(', ')}
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};

// Inline permission check component for conditional rendering
interface HasPermissionProps {
  permission: string | string[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const HasPermission: React.FC<HasPermissionProps> = ({
  permission,
  requireAll = true,
  children,
  fallback = null,
}) => {
  const { checkPermission } = useAuth();

  const permissionsArray = Array.isArray(permission) ? permission : [permission];
  const hasPermission = requireAll
    ? permissionsArray.every(p => checkPermission(p))
    : permissionsArray.some(p => checkPermission(p));

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;
