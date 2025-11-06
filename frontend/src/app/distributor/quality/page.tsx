'use client';

import React from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

interface QualityCheck {
  id: string;
  product: string;
  batch: string;
  result: 'Pass' | 'Warning' | 'Fail';
  temperature: string;
  humidity: string;
  inspector: string;
  date: string;
}

export default function QualityControlPage() {
  const theme = getRoleTheme('DISTRIBUTOR');
  const user = { name: 'Quality Manager', email: 'quality@distribution.com' };

  const checks: QualityCheck[] = [
    { id: 'QC-1001', product: 'Organic Tomatoes', batch: 'BATCH-A001', result: 'Pass', temperature: '3.2°C', humidity: '87%', inspector: 'Alice Brown', date: '2025-11-06 09:00' },
    { id: 'QC-1002', product: 'Fresh Lettuce', batch: 'BATCH-A002', result: 'Warning', temperature: '5.8°C', humidity: '82%', inspector: 'Bob Wilson', date: '2025-11-06 10:30' },
    { id: 'QC-1003', product: 'Red Apples', batch: 'BATCH-B001', result: 'Pass', temperature: '2.9°C', humidity: '89%', inspector: 'Alice Brown', date: '2025-11-06 11:15' },
  ];

  const columns: Column<QualityCheck>[] = [
    { key: 'id', label: 'Check ID', sortable: true, render: (c) => <span className="font-semibold text-blue-600">{c.id}</span> },
    { key: 'product', label: 'Product', sortable: true, render: (c) => <div><div className="font-semibold text-gray-900">{c.product}</div><div className="text-xs text-gray-500">{c.batch}</div></div> },
    { key: 'result', label: 'Result', sortable: true, render: (c) => <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${c.result === 'Pass' ? 'bg-green-100 text-green-800' : c.result === 'Warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{c.result}</span> },
    { key: 'temperature', label: 'Temperature', sortable: true },
    { key: 'humidity', label: 'Humidity', sortable: true },
    { key: 'inspector', label: 'Inspector', sortable: true },
    { key: 'date', label: 'Date', sortable: true, render: (c) => <span className="text-sm text-gray-600">{c.date}</span> },
  ];

  const passRate = ((checks.filter(c => c.result === 'Pass').length / checks.length) * 100).toFixed(1);

  return (
    <RoleBasedLayout role="DISTRIBUTOR" user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Quality Control</h1>

        <StatCardsGrid>
          <AdvancedStatCard title="Total Checks" value={checks.length} subtitle="Today" icon={ClipboardDocumentCheckIcon} gradient={theme.gradients.primary} />
          <AdvancedStatCard title="Passed" value={checks.filter(c => c.result === 'Pass').length} subtitle={`${passRate}% pass rate`} icon={CheckCircleIcon} gradient="from-green-500 to-emerald-500" />
          <AdvancedStatCard title="Warnings" value={checks.filter(c => c.result === 'Warning').length} subtitle="Require attention" icon={ExclamationTriangleIcon} gradient="from-yellow-500 to-orange-500" />
          <AdvancedStatCard title="Failed" value={checks.filter(c => c.result === 'Fail').length} subtitle="Rejected batches" icon={XCircleIcon} gradient="from-red-500 to-pink-500" />
        </StatCardsGrid>

        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Quality Inspection Records</h2>
          <AdvancedDataTable data={checks} columns={columns} searchPlaceholder="Search quality checks..." />
        </div>
      </div>
    </RoleBasedLayout>
  );
}
