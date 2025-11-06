'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import {
  ShieldCheckIcon,
  KeyIcon,
  UserGroupIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  createdAt: string;
  isSystem: boolean;
}

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'ADMIN';
  description: string;
  category: string;
}

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  environments: string[];
}

export default function AccessControlPage() {
  const theme = getRoleTheme('ADMIN');
  const user = { name: 'Admin User', email: 'admin@farmchain.com' };
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'features' | 'security'>('roles');

  const roles: Role[] = [
    {
      id: 'ROLE-001',
      name: 'FARMER',
      description: 'Farm owners and operators',
      userCount: 245,
      permissions: ['products:create', 'products:read', 'products:update', 'products:delete', 'orders:read', 'inventory:manage'],
      createdAt: '2024-01-15',
      isSystem: true,
    },
    {
      id: 'ROLE-002',
      name: 'DISTRIBUTOR',
      description: 'Distribution and logistics partners',
      userCount: 89,
      permissions: ['orders:read', 'orders:update', 'shipments:manage', 'inventory:read', 'retailers:manage'],
      createdAt: '2024-01-15',
      isSystem: true,
    },
    {
      id: 'ROLE-003',
      name: 'RETAILER',
      description: 'Retail store operators',
      userCount: 412,
      permissions: ['orders:create', 'orders:read', 'products:read', 'inventory:read', 'sales:manage'],
      createdAt: '2024-01-15',
      isSystem: true,
    },
    {
      id: 'ROLE-004',
      name: 'CONSUMER',
      description: 'End customers',
      userCount: 8642,
      permissions: ['products:read', 'orders:create', 'orders:read', 'reviews:create'],
      createdAt: '2024-01-15',
      isSystem: true,
    },
    {
      id: 'ROLE-005',
      name: 'ADMIN',
      description: 'Platform administrators',
      userCount: 12,
      permissions: ['*:*'],
      createdAt: '2024-01-15',
      isSystem: true,
    },
  ];

  const permissions: Permission[] = [
    { id: 'PERM-001', name: 'products:create', resource: 'Products', action: 'CREATE', description: 'Create new products', category: 'Products' },
    { id: 'PERM-002', name: 'products:read', resource: 'Products', action: 'READ', description: 'View product information', category: 'Products' },
    { id: 'PERM-003', name: 'products:update', resource: 'Products', action: 'UPDATE', description: 'Edit product details', category: 'Products' },
    { id: 'PERM-004', name: 'products:delete', resource: 'Products', action: 'DELETE', description: 'Remove products', category: 'Products' },
    { id: 'PERM-005', name: 'orders:create', resource: 'Orders', action: 'CREATE', description: 'Place new orders', category: 'Orders' },
    { id: 'PERM-006', name: 'orders:read', resource: 'Orders', action: 'READ', description: 'View order information', category: 'Orders' },
    { id: 'PERM-007', name: 'orders:update', resource: 'Orders', action: 'UPDATE', description: 'Modify order status', category: 'Orders' },
    { id: 'PERM-008', name: 'users:admin', resource: 'Users', action: 'ADMIN', description: 'Full user management access', category: 'Users' },
    { id: 'PERM-009', name: 'inventory:manage', resource: 'Inventory', action: 'UPDATE', description: 'Manage inventory levels', category: 'Inventory' },
    { id: 'PERM-010', name: 'reports:read', resource: 'Reports', action: 'READ', description: 'Access analytics reports', category: 'Analytics' },
  ];

  const featureFlags: FeatureFlag[] = [
    { id: 'FF-001', name: 'new_checkout_flow', description: 'Enhanced checkout experience with multi-step wizard', enabled: true, rolloutPercentage: 100, environments: ['production', 'staging'] },
    { id: 'FF-002', name: 'ai_recommendations', description: 'ML-powered product recommendations', enabled: true, rolloutPercentage: 50, environments: ['production'] },
    { id: 'FF-003', name: 'blockchain_verification', description: 'Blockchain-based product verification', enabled: false, rolloutPercentage: 0, environments: ['staging'] },
    { id: 'FF-004', name: 'advanced_analytics', description: 'Enhanced analytics dashboards', enabled: true, rolloutPercentage: 100, environments: ['production', 'staging', 'development'] },
    { id: 'FF-005', name: 'social_sharing', description: 'Social media integration for products', enabled: true, rolloutPercentage: 75, environments: ['production'] },
  ];

  const roleColumns: Column<Role>[] = [
    {
      key: 'name',
      label: 'Role',
      sortable: true,
      render: (r) => (
        <div>
          <div className="font-semibold text-gray-900">{r.name}</div>
          <div className="text-xs text-gray-500">{r.description}</div>
        </div>
      ),
    },
    { key: 'userCount', label: 'Users', sortable: true, render: (r) => <span className="font-semibold text-indigo-600">{r.userCount.toLocaleString()}</span> },
    {
      key: 'permissions',
      label: 'Permissions',
      render: (r) => (
        <span className="text-sm text-gray-600">{r.permissions.length} permissions</span>
      ),
    },
    {
      key: 'isSystem',
      label: 'Type',
      sortable: true,
      render: (r) => (
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${r.isSystem ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
          {r.isSystem ? 'System' : 'Custom'}
        </span>
      ),
    },
    { key: 'createdAt', label: 'Created', sortable: true },
  ];

  const permissionColumns: Column<Permission>[] = [
    { key: 'name', label: 'Permission', sortable: true, render: (p) => <span className="font-mono text-sm font-semibold text-gray-900">{p.name}</span> },
    { key: 'resource', label: 'Resource', sortable: true },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      render: (p) => {
        const colors = {
          CREATE: 'bg-green-100 text-green-800',
          READ: 'bg-blue-100 text-blue-800',
          UPDATE: 'bg-yellow-100 text-yellow-800',
          DELETE: 'bg-red-100 text-red-800',
          ADMIN: 'bg-purple-100 text-purple-800',
        };
        return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${colors[p.action]}`}>{p.action}</span>;
      },
    },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'description', label: 'Description' },
  ];

  const featureFlagColumns: Column<FeatureFlag>[] = [
    { key: 'name', label: 'Feature', sortable: true, render: (f) => <span className="font-mono text-sm font-semibold text-gray-900">{f.name}</span> },
    { key: 'description', label: 'Description' },
    {
      key: 'enabled',
      label: 'Status',
      sortable: true,
      render: (f) => (
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${f.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {f.enabled ? 'Enabled' : 'Disabled'}
        </span>
      ),
    },
    {
      key: 'rolloutPercentage',
      label: 'Rollout',
      sortable: true,
      render: (f) => <span className="font-semibold text-indigo-600">{f.rolloutPercentage}%</span>,
    },
    { key: 'environments', label: 'Environments', render: (f) => <span className="text-sm text-gray-600">{f.environments.join(', ')}</span> },
  ];

  const totalRoles = roles.length;
  const totalUsers = roles.reduce((sum, r) => sum + r.userCount, 0);
  const totalPermissions = permissions.length;
  const activeFeatures = featureFlags.filter(f => f.enabled).length;

  return (
    <RoleBasedLayout role="ADMIN" user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Access Control & Permissions</h1>

        <StatCardsGrid>
          <AdvancedStatCard
            title="Total Roles"
            value={totalRoles}
            subtitle="System & custom"
            icon={UserGroupIcon}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Total Users"
            value={totalUsers.toLocaleString()}
            subtitle="Across all roles"
            icon={ShieldCheckIcon}
            gradient="from-green-500 to-emerald-500"
          />
          <AdvancedStatCard
            title="Permissions"
            value={totalPermissions}
            subtitle="Available actions"
            icon={KeyIcon}
            gradient="from-blue-500 to-cyan-500"
          />
          <AdvancedStatCard
            title="Feature Flags"
            value={`${activeFeatures}/${featureFlags.length}`}
            subtitle="Currently enabled"
            icon={Cog6ToothIcon}
            gradient="from-purple-500 to-pink-500"
          />
        </StatCardsGrid>

        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'roles', label: 'Roles', count: roles.length },
            { id: 'permissions', label: 'Permissions', count: permissions.length },
            { id: 'features', label: 'Feature Flags', count: featureFlags.length },
            { id: 'security', label: 'Security Policies' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-6 py-3 text-sm font-medium ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-600'}`}
            >
              {tab.label}
              {tab.count && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">{tab.count}</span>}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600" />}
            </button>
          ))}
        </div>

        {activeTab === 'roles' && (
          <>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Role Management</h2>
              <AdvancedDataTable data={roles} columns={roleColumns} searchPlaceholder="Search roles..." />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {roles.map((role) => (
                <div key={role.id} className="rounded-xl bg-white p-6 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-indigo-100 p-3">
                        <UserGroupIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{role.name}</h3>
                        <p className="text-sm text-gray-600">{role.description}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-700">
                      {role.userCount} users
                    </span>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Permissions ({role.permissions.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.slice(0, 5).map((perm, idx) => (
                        <span key={idx} className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                          {perm}
                        </span>
                      ))}
                      {role.permissions.length > 5 && (
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
                          +{role.permissions.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button className="flex-1 rounded-lg border-2 border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Edit Permissions
                    </button>
                    {!role.isSystem && (
                      <button className="rounded-lg border-2 border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'permissions' && (
          <>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Permission Management</h2>
              <AdvancedDataTable data={permissions} columns={permissionColumns} searchPlaceholder="Search permissions..." />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              {['Products', 'Orders', 'Users', 'Inventory', 'Analytics'].map((category) => {
                const categoryPerms = permissions.filter(p => p.category === category);
                return (
                  <div key={category} className="rounded-xl bg-white p-6 shadow-lg">
                    <h3 className="font-bold text-gray-900 mb-4">{category}</h3>
                    <div className="space-y-2">
                      {categoryPerms.map((perm) => (
                        <div key={perm.id} className="flex items-center justify-between">
                          <span className="text-xs font-mono text-gray-700">{perm.action}</span>
                          <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'features' && (
          <>
            <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 p-6">
              <h3 className="font-bold text-gray-900 mb-2">🚀 Feature Flag Management</h3>
              <p className="text-sm text-gray-700">
                Control feature rollouts across environments. Gradually release new features to users with percentage-based rollouts.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Feature Flags</h2>
              <AdvancedDataTable data={featureFlags} columns={featureFlagColumns} searchPlaceholder="Search features..." />
            </div>

            <div className="space-y-4">
              {featureFlags.map((flag) => (
                <div key={flag.id} className="rounded-xl bg-white p-6 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-mono font-bold text-gray-900">{flag.name}</h3>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input type="checkbox" className="peer sr-only" checked={flag.enabled} readOnly />
                          <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-600 peer-checked:after:translate-x-full"></div>
                        </label>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{flag.description}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Rollout:</span>
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600"
                              style={{ width: `${flag.rolloutPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-indigo-600">{flag.rolloutPercentage}%</span>
                        </div>
                        <div className="flex gap-1">
                          {flag.environments.map((env) => (
                            <span key={env} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                              {env}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'security' && (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 mb-4">Password Policies</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Minimum Length', value: '12 characters', status: true },
                    { label: 'Uppercase Required', value: 'Yes', status: true },
                    { label: 'Numbers Required', value: 'Yes', status: true },
                    { label: 'Special Characters', value: 'Yes', status: true },
                    { label: 'Password Expiry', value: '90 days', status: true },
                    { label: 'Password History', value: 'Last 5 passwords', status: true },
                  ].map((policy, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <div className="font-semibold text-gray-900">{policy.label}</div>
                        <div className="text-sm text-gray-600">{policy.value}</div>
                      </div>
                      {policy.status ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 mb-4">Session Management</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Session Timeout', value: '30 minutes', status: true },
                    { label: 'Concurrent Sessions', value: '3 max', status: true },
                    { label: 'Remember Me Duration', value: '14 days', status: true },
                    { label: 'Force Logout on Change', value: 'Enabled', status: true },
                    { label: '2FA Requirement', value: 'Admin only', status: true },
                    { label: 'IP Whitelisting', value: 'Optional', status: false },
                  ].map((policy, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <div className="font-semibold text-gray-900">{policy.label}</div>
                        <div className="text-sm text-gray-600">{policy.value}</div>
                      </div>
                      {policy.status ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">🔒 Security Best Practices</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <LockClosedIcon className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>All passwords are hashed using bcrypt with 12 rounds</span>
                </li>
                <li className="flex items-start gap-2">
                  <LockClosedIcon className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>HTTPS enforced across all endpoints</span>
                </li>
                <li className="flex items-start gap-2">
                  <LockClosedIcon className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Rate limiting active on authentication endpoints</span>
                </li>
                <li className="flex items-start gap-2">
                  <LockClosedIcon className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Regular security audits and penetration testing</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </RoleBasedLayout>
  );
}
