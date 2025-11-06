'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import { getRoleTheme } from '@/config/roleThemes';
import {
  ServerIcon,
  CircleStackIcon,
  CloudIcon,
  CpuChipIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'Healthy' | 'Warning' | 'Critical';
  threshold: number;
}

interface Service {
  name: string;
  status: 'Running' | 'Degraded' | 'Down';
  uptime: string;
  responseTime: number;
  lastCheck: string;
  endpoint: string;
}

export default function SystemHealthPage() {
  const theme = getRoleTheme('ADMIN');
  const user = { name: 'Admin User', email: 'admin@farmchain.com' };
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'database' | 'performance'>('overview');

  const metrics: SystemMetric[] = [
    { name: 'CPU Usage', value: 45, unit: '%', status: 'Healthy', threshold: 80 },
    { name: 'Memory Usage', value: 68, unit: '%', status: 'Healthy', threshold: 85 },
    { name: 'Disk Usage', value: 52, unit: '%', status: 'Healthy', threshold: 90 },
    { name: 'Network Traffic', value: 156, unit: 'Mbps', status: 'Healthy', threshold: 500 },
  ];

  const services: Service[] = [
    { name: 'API Gateway', status: 'Running', uptime: '99.98%', responseTime: 45, lastCheck: '2025-11-06 14:35:00', endpoint: '/api/v1' },
    { name: 'Authentication Service', status: 'Running', uptime: '99.95%', responseTime: 32, lastCheck: '2025-11-06 14:35:00', endpoint: '/auth' },
    { name: 'Database Primary', status: 'Running', uptime: '99.99%', responseTime: 12, lastCheck: '2025-11-06 14:35:00', endpoint: 'postgres://primary' },
    { name: 'Database Replica', status: 'Running', uptime: '99.97%', responseTime: 15, lastCheck: '2025-11-06 14:35:00', endpoint: 'postgres://replica' },
    { name: 'Redis Cache', status: 'Running', uptime: '100%', responseTime: 3, lastCheck: '2025-11-06 14:35:00', endpoint: 'redis://cache' },
    { name: 'Message Queue', status: 'Running', uptime: '99.96%', responseTime: 8, lastCheck: '2025-11-06 14:35:00', endpoint: 'rabbitmq://' },
    { name: 'File Storage', status: 'Degraded', uptime: '98.50%', responseTime: 125, lastCheck: '2025-11-06 14:35:00', endpoint: 's3://storage' },
    { name: 'Email Service', status: 'Running', uptime: '99.92%', responseTime: 210, lastCheck: '2025-11-06 14:35:00', endpoint: 'smtp://mail' },
  ];

  const cpuData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: [35, 28, 42, 58, 45, 38, 32],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const memoryData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
    datasets: [
      {
        label: 'Memory Usage (%)',
        data: [55, 52, 62, 72, 68, 65, 60],
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const apiResponseData = {
    labels: ['API Gateway', 'Auth', 'Database', 'Cache', 'Queue', 'Storage', 'Email'],
    datasets: [
      {
        label: 'Response Time (ms)',
        data: [45, 32, 12, 3, 8, 125, 210],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(156, 163, 175, 0.8)'],
      },
    ],
  };

  const diskUsageData = {
    labels: ['Used', 'Free'],
    datasets: [
      {
        data: [520, 480],
        backgroundColor: ['rgba(99, 102, 241, 0.8)', 'rgba(156, 163, 175, 0.3)'],
      },
    ],
  };

  const systemUptime = '99.97%';
  const avgResponseTime = Math.round(services.reduce((sum, s) => sum + s.responseTime, 0) / services.length);
  const healthyServices = services.filter(s => s.status === 'Running').length;
  const degradedServices = services.filter(s => s.status === 'Degraded').length;

  return (
    <RoleBasedLayout role="ADMIN" user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">System Health & Performance</h1>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">All Systems Operational</span>
          </div>
        </div>

        <StatCardsGrid>
          <AdvancedStatCard
            title="System Uptime"
            value={systemUptime}
            subtitle="Last 30 days"
            icon={ServerIcon}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Avg Response"
            value={`${avgResponseTime}ms`}
            subtitle="API latency"
            icon={BoltIcon}
            gradient="from-green-500 to-emerald-500"
          />
          <AdvancedStatCard
            title="Healthy Services"
            value={`${healthyServices}/${services.length}`}
            subtitle={degradedServices > 0 ? `${degradedServices} degraded` : 'All operational'}
            icon={CheckCircleIcon}
            gradient="from-blue-500 to-cyan-500"
          />
          <AdvancedStatCard
            title="Active Users"
            value="2,847"
            subtitle="Currently online"
            icon={CpuChipIcon}
            gradient="from-purple-500 to-pink-500"
          />
        </StatCardsGrid>

        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'overview', label: 'System Overview' },
            { id: 'services', label: 'Services', count: services.length },
            { id: 'database', label: 'Database Metrics' },
            { id: 'performance', label: 'Performance' },
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

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">CPU Usage (24h)</h2>
                <Line data={cpuData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
              </div>

              <div className="rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Memory Usage (24h)</h2>
                <Line data={memoryData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              {metrics.map((metric) => (
                <div key={metric.name} className="rounded-xl bg-white p-6 shadow-lg">
                  <h3 className="text-sm text-gray-600 mb-2">{metric.name}</h3>
                  <div className="flex items-end gap-2 mb-3">
                    <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
                    <div className="text-sm text-gray-500 mb-1">{metric.unit}</div>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${metric.status === 'Healthy' ? 'bg-green-500' : metric.status === 'Warning' ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${(metric.value / metric.threshold) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Threshold: {metric.threshold}{metric.unit}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-6">
              <h3 className="font-bold text-gray-900 mb-2">✓ System Status: Healthy</h3>
              <p className="text-sm text-gray-700">
                All critical systems are operational. No incidents reported in the last 24 hours. Average system performance is within normal parameters.
              </p>
            </div>
          </>
        )}

        {activeTab === 'services' && (
          <>
            {degradedServices > 0 && (
              <div className="rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 p-6">
                <div className="flex items-center gap-4">
                  <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
                  <div>
                    <h3 className="font-bold text-gray-900">Service Degradation Detected</h3>
                    <p className="text-sm text-gray-600">{degradedServices} service(s) experiencing performance issues</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {services.map((service) => (
                <div
                  key={service.name}
                  className={`rounded-xl bg-white p-6 shadow-lg ${service.status === 'Degraded' ? 'border-l-4 border-yellow-500' : service.status === 'Down' ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${
                        service.status === 'Running' ? 'bg-green-100' :
                        service.status === 'Degraded' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <ServerIcon className={`h-6 w-6 ${
                          service.status === 'Running' ? 'text-green-600' :
                          service.status === 'Degraded' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{service.name}</h3>
                        <p className="text-xs text-gray-500 font-mono">{service.endpoint}</p>
                      </div>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      service.status === 'Running' ? 'bg-green-100 text-green-800' :
                      service.status === 'Degraded' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {service.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Uptime</span>
                      <span className="font-semibold text-gray-900">{service.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Response Time</span>
                      <span className={`font-semibold ${service.responseTime < 50 ? 'text-green-600' : service.responseTime < 150 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {service.responseTime}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Check</span>
                      <span className="text-sm text-gray-500">{service.lastCheck}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Service Response Times</h2>
              <Bar data={apiResponseData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
          </>
        )}

        {activeTab === 'database' && (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-full bg-indigo-100 p-3">
                    <CircleStackIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Primary Database</h3>
                    <p className="text-sm text-gray-600">PostgreSQL 15.2</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Connections</span>
                    <span className="font-semibold text-gray-900">145 / 200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Query Time</span>
                    <span className="font-semibold text-green-600">12ms avg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cache Hit Ratio</span>
                    <span className="font-semibold text-green-600">99.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Database Size</span>
                    <span className="font-semibold text-gray-900">156 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Replication Lag</span>
                    <span className="font-semibold text-green-600">< 1ms</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-full bg-purple-100 p-3">
                    <CircleStackIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Redis Cache</h3>
                    <p className="text-sm text-gray-600">Redis 7.0</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Memory Used</span>
                    <span className="font-semibold text-gray-900">4.2 GB / 8 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Hit Rate</span>
                    <span className="font-semibold text-green-600">98.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Keys</span>
                    <span className="font-semibold text-gray-900">2.4M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <span className="font-semibold text-green-600">3ms avg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Evictions</span>
                    <span className="font-semibold text-yellow-600">125/hour</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Disk Usage</h2>
                <Doughnut data={diskUsageData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                <div className="text-center mt-4 text-sm text-gray-600">
                  520 GB used of 1 TB total
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">💾 Database Health</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Connection Pool</span>
                    <span className="text-sm font-bold text-green-600">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Query Performance</span>
                    <span className="text-sm font-bold text-green-600">Excellent</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Backup Status</span>
                    <span className="text-sm font-bold text-green-600">Up to Date</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Replication</span>
                    <span className="text-sm font-bold text-green-600">Active</span>
                  </div>
                  <div className="pt-3 border-t border-blue-200 text-xs text-gray-600">
                    Last backup: 2025-11-06 02:00:00
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'performance' && (
          <>
            <div className="grid grid-cols-4 gap-6">
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="text-sm text-gray-600 mb-2">Requests/sec</h3>
                <div className="text-3xl font-bold text-indigo-600">1,247</div>
                <div className="text-sm text-gray-500 mt-1">Peak: 2,850/s</div>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="text-sm text-gray-600 mb-2">Error Rate</h3>
                <div className="text-3xl font-bold text-green-600">0.08%</div>
                <div className="text-sm text-gray-500 mt-1">Target: < 0.1%</div>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="text-sm text-gray-600 mb-2">P95 Latency</h3>
                <div className="text-3xl font-bold text-blue-600">125ms</div>
                <div className="text-sm text-gray-500 mt-1">Target: < 200ms</div>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="text-sm text-gray-600 mb-2">Throughput</h3>
                <div className="text-3xl font-bold text-purple-600">45MB/s</div>
                <div className="text-sm text-gray-500 mt-1">Peak: 89MB/s</div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">API Response Time</span>
                    <span className="text-sm font-semibold text-gray-900">Avg: 45ms</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '22.5%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Database Query Time</span>
                    <span className="text-sm font-semibold text-gray-900">Avg: 12ms</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '6%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Cache Response Time</span>
                    <span className="text-sm font-semibold text-gray-900">Avg: 3ms</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '1.5%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Page Load Time</span>
                    <span className="text-sm font-semibold text-gray-900">Avg: 1.2s</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: '40%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 p-6">
              <h3 className="font-bold text-gray-900 mb-2">⚡ Performance Summary</h3>
              <p className="text-sm text-gray-700">
                System performance is within acceptable thresholds. API response times are optimal, and database queries are executing efficiently. Consider enabling CDN for static assets to improve page load times.
              </p>
            </div>
          </>
        )}
      </div>
    </RoleBasedLayout>
  );
}
