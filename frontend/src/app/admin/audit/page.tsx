'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import {
  ShieldCheckIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  ClockIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { Line, Doughnut } from 'react-chartjs-2';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userRole: 'FARMER' | 'DISTRIBUTOR' | 'RETAILER' | 'CONSUMER' | 'ADMIN';
  action: string;
  resource: string;
  status: 'Success' | 'Failed' | 'Blocked';
  ipAddress: string;
  details: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

interface SecurityEvent {
  id: string;
  type: 'Login Attempt' | 'Permission Denied' | 'Data Access' | 'Configuration Change';
  user: string;
  timestamp: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  resolved: boolean;
}

export default function AuditLogsPage() {
  const theme = getRoleTheme('ADMIN');
  const user = { name: 'Admin User', email: 'admin@farmchain.com' };
  const [activeTab, setActiveTab] = useState<'logs' | 'security' | 'analytics' | 'compliance'>('logs');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const auditLogs: AuditLog[] = [
    {
      id: 'AUD-001',
      timestamp: '2025-11-06 14:32:15',
      user: 'john.farmer@example.com',
      userRole: 'FARMER',
      action: 'UPDATE',
      resource: 'Product Listing',
      status: 'Success',
      ipAddress: '192.168.1.105',
      details: 'Updated organic tomatoes price from $4.50 to $5.20',
      severity: 'Info',
    },
    {
      id: 'AUD-002',
      timestamp: '2025-11-06 14:28:42',
      user: 'sarah.distributor@example.com',
      userRole: 'DISTRIBUTOR',
      action: 'DELETE',
      resource: 'Order Record',
      status: 'Blocked',
      ipAddress: '192.168.1.210',
      details: 'Attempted to delete order #ORD-5678 - Insufficient permissions',
      severity: 'Warning',
    },
    {
      id: 'AUD-003',
      timestamp: '2025-11-06 14:15:33',
      user: 'mike.retailer@example.com',
      userRole: 'RETAILER',
      action: 'CREATE',
      resource: 'Purchase Order',
      status: 'Success',
      ipAddress: '192.168.1.145',
      details: 'Created purchase order PO-2345 for $12,500',
      severity: 'Info',
    },
    {
      id: 'AUD-004',
      timestamp: '2025-11-06 14:02:18',
      user: 'admin@farmchain.com',
      userRole: 'ADMIN',
      action: 'UPDATE',
      resource: 'System Configuration',
      status: 'Success',
      ipAddress: '192.168.1.10',
      details: 'Modified payment gateway settings',
      severity: 'Critical',
    },
    {
      id: 'AUD-005',
      timestamp: '2025-11-06 13:45:55',
      user: 'unknown',
      userRole: 'CONSUMER',
      action: 'LOGIN',
      resource: 'Authentication',
      status: 'Failed',
      ipAddress: '203.45.67.89',
      details: 'Failed login attempt - Invalid credentials (5th attempt)',
      severity: 'Warning',
    },
    {
      id: 'AUD-006',
      timestamp: '2025-11-06 13:30:22',
      user: 'jane.consumer@example.com',
      userRole: 'CONSUMER',
      action: 'READ',
      resource: 'Order History',
      status: 'Success',
      ipAddress: '192.168.1.88',
      details: 'Accessed order history - 23 records retrieved',
      severity: 'Info',
    },
  ];

  const securityEvents: SecurityEvent[] = [
    {
      id: 'SEC-001',
      type: 'Login Attempt',
      user: 'unknown',
      timestamp: '2025-11-06 13:45:55',
      severity: 'High',
      description: 'Multiple failed login attempts from IP 203.45.67.89',
      resolved: false,
    },
    {
      id: 'SEC-002',
      type: 'Permission Denied',
      user: 'sarah.distributor@example.com',
      timestamp: '2025-11-06 14:28:42',
      severity: 'Medium',
      description: 'Attempted to access admin-only resource',
      resolved: true,
    },
    {
      id: 'SEC-003',
      type: 'Configuration Change',
      user: 'admin@farmchain.com',
      timestamp: '2025-11-06 14:02:18',
      severity: 'Critical',
      description: 'Payment gateway configuration modified',
      resolved: true,
    },
    {
      id: 'SEC-004',
      type: 'Data Access',
      user: 'john.farmer@example.com',
      timestamp: '2025-11-06 12:15:30',
      severity: 'Low',
      description: 'Bulk data export of 500 product records',
      resolved: true,
    },
  ];

  const filteredLogs = auditLogs.filter(log => {
    if (filterRole !== 'all' && log.userRole !== filterRole) return false;
    if (filterSeverity !== 'all' && log.severity !== filterSeverity) return false;
    return true;
  });

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (log) => <span className="text-sm font-mono">{log.timestamp}</span>,
    },
    {
      key: 'user',
      label: 'User',
      sortable: true,
      render: (log) => (
        <div>
          <div className="font-semibold text-gray-900">{log.user}</div>
          <div className="text-xs text-gray-500">{log.userRole}</div>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      render: (log) => (
        <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800">
          {log.action}
        </span>
      ),
    },
    { key: 'resource', label: 'Resource', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (log) => {
        const statusColors = {
          Success: 'bg-green-100 text-green-800',
          Failed: 'bg-red-100 text-red-800',
          Blocked: 'bg-yellow-100 text-yellow-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[log.status]}`}>
            {log.status}
          </span>
        );
      },
    },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      render: (log) => {
        const severityColors = {
          Info: 'bg-blue-100 text-blue-800',
          Warning: 'bg-yellow-100 text-yellow-800',
          Critical: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${severityColors[log.severity]}`}>
            {log.severity}
          </span>
        );
      },
    },
  ];

  const securityColumns: Column<SecurityEvent>[] = [
    { key: 'timestamp', label: 'Time', sortable: true, render: (e) => <span className="text-sm font-mono">{e.timestamp}</span> },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'user', label: 'User', sortable: true },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      render: (e) => {
        const colors = {
          Low: 'bg-blue-100 text-blue-800',
          Medium: 'bg-yellow-100 text-yellow-800',
          High: 'bg-orange-100 text-orange-800',
          Critical: 'bg-red-100 text-red-800',
        };
        return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${colors[e.severity]}`}>{e.severity}</span>;
      },
    },
    {
      key: 'resolved',
      label: 'Status',
      sortable: true,
      render: (e) => (
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${e.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {e.resolved ? 'Resolved' : 'Active'}
        </span>
      ),
    },
  ];

  const totalLogs = auditLogs.length;
  const failedActions = auditLogs.filter(log => log.status === 'Failed' || log.status === 'Blocked').length;
  const criticalEvents = auditLogs.filter(log => log.severity === 'Critical').length;
  const activeSecurityEvents = securityEvents.filter(e => !e.resolved).length;

  const activityTrendData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
    datasets: [
      {
        label: 'User Actions',
        data: [12, 8, 45, 98, 156, 89, 34],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const actionTypeData = {
    labels: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN'],
    datasets: [
      {
        data: [145, 892, 234, 45, 312],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  return (
    <RoleBasedLayout role="ADMIN" user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">User Activity & Audit Logs</h1>

        <StatCardsGrid>
          <AdvancedStatCard
            title="Total Logs"
            value={totalLogs}
            subtitle="Last 24 hours"
            icon={EyeIcon}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Failed Actions"
            value={failedActions}
            subtitle="Blocked or failed"
            icon={ExclamationTriangleIcon}
            gradient="from-yellow-500 to-orange-500"
          />
          <AdvancedStatCard
            title="Critical Events"
            value={criticalEvents}
            subtitle="High severity"
            icon={ShieldCheckIcon}
            gradient="from-red-500 to-rose-500"
          />
          <AdvancedStatCard
            title="Security Alerts"
            value={activeSecurityEvents}
            subtitle="Require attention"
            icon={ExclamationTriangleIcon}
            gradient="from-purple-500 to-pink-500"
          />
        </StatCardsGrid>

        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'logs', label: 'Audit Logs', count: auditLogs.length },
            { id: 'security', label: 'Security Events', count: securityEvents.length },
            { id: 'analytics', label: 'Analytics' },
            { id: 'compliance', label: 'Compliance' },
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

        {activeTab === 'logs' && (
          <>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm"
              >
                <option value="all">All Roles</option>
                <option value="FARMER">Farmer</option>
                <option value="DISTRIBUTOR">Distributor</option>
                <option value="RETAILER">Retailer</option>
                <option value="CONSUMER">Consumer</option>
                <option value="ADMIN">Admin</option>
              </select>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm"
              >
                <option value="all">All Severities</option>
                <option value="Info">Info</option>
                <option value="Warning">Warning</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Audit Trail</h2>
              <AdvancedDataTable data={filteredLogs} columns={columns} searchPlaceholder="Search logs..." />
            </div>

            <div className="space-y-3">
              {filteredLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="rounded-xl bg-white p-6 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-indigo-100 p-3">
                        <UserCircleIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-900">{log.user}</span>
                          <span className="text-sm text-gray-500">({log.userRole})</span>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            log.status === 'Success' ? 'bg-green-100 text-green-800' :
                            log.status === 'Failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{log.details}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            {log.timestamp}
                          </span>
                          <span>IP: {log.ipAddress}</span>
                          <span>Action: {log.action}</span>
                          <span>Resource: {log.resource}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      log.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                      log.severity === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {log.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'security' && (
          <>
            <div className="rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 p-6">
              <div className="flex items-center gap-4">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                <div>
                  <h3 className="font-bold text-gray-900">Active Security Alerts</h3>
                  <p className="text-sm text-gray-600">{activeSecurityEvents} security events require immediate attention</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Security Events</h2>
              <AdvancedDataTable data={securityEvents} columns={securityColumns} searchPlaceholder="Search events..." />
            </div>

            <div className="space-y-4">
              {securityEvents.filter(e => !e.resolved).map((event) => (
                <div key={event.id} className="rounded-xl bg-white p-6 shadow-lg border-l-4 border-red-500">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-900">{event.type}</h3>
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${
                          event.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                          event.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                          event.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {event.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                      <div className="text-xs text-gray-500">
                        User: {event.user} • Time: {event.timestamp}
                      </div>
                    </div>
                    <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">
                      Investigate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Activity Timeline (24h)</h2>
                <Line data={activityTrendData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
              </div>

              <div className="rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Action Type Distribution</h2>
                <Doughnut data={actionTypeData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6">
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="text-sm text-gray-600 mb-2">Most Active User</h3>
                <div className="text-2xl font-bold text-indigo-600">john.farmer</div>
                <div className="text-sm text-gray-500 mt-1">234 actions today</div>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="text-sm text-gray-600 mb-2">Peak Hour</h3>
                <div className="text-2xl font-bold text-blue-600">2-3 PM</div>
                <div className="text-sm text-gray-500 mt-1">156 actions/hour</div>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="text-sm text-gray-600 mb-2">Avg Response</h3>
                <div className="text-2xl font-bold text-green-600">245ms</div>
                <div className="text-sm text-gray-500 mt-1">System latency</div>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="text-sm text-gray-600 mb-2">Success Rate</h3>
                <div className="text-2xl font-bold text-purple-600">97.8%</div>
                <div className="text-sm text-gray-500 mt-1">Operations completed</div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'compliance' && (
          <>
            <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">✓ Compliance Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Data Retention</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '100%' }} />
                    </div>
                    <span className="text-sm font-semibold text-green-600">Compliant</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Access Controls</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '100%' }} />
                    </div>
                    <span className="text-sm font-semibold text-green-600">Compliant</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Audit Trail</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '100%' }} />
                    </div>
                    <span className="text-sm font-semibold text-green-600">Compliant</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Data Encryption</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '100%' }} />
                    </div>
                    <span className="text-sm font-semibold text-green-600">Compliant</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-4">Compliance Requirements</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200">
                  <div>
                    <div className="font-semibold text-gray-900">GDPR Compliance</div>
                    <div className="text-sm text-gray-600">EU data protection regulation</div>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-800">✓ Active</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200">
                  <div>
                    <div className="font-semibold text-gray-900">HIPAA Compliance</div>
                    <div className="text-sm text-gray-600">Health data protection standards</div>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-800">N/A</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200">
                  <div>
                    <div className="font-semibold text-gray-900">SOC 2 Compliance</div>
                    <div className="text-sm text-gray-600">Security and availability controls</div>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-800">✓ Active</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200">
                  <div>
                    <div className="font-semibold text-gray-900">ISO 27001</div>
                    <div className="text-sm text-gray-600">Information security management</div>
                  </div>
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-800">In Progress</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </RoleBasedLayout>
  );
}
