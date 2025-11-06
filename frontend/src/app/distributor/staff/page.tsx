'use client';

import React from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import { UserGroupIcon, TruckIcon, BuildingOffice2Icon, ClockIcon } from '@heroicons/react/24/outline';

interface Employee {
  id: string;
  name: string;
  role: 'Driver' | 'Warehouse Staff' | 'Quality Inspector' | 'Manager';
  department: string;
  shift: string;
  status: 'On Duty' | 'Off Duty' | 'On Leave';
}

export default function StaffManagementPage() {
  const theme = getRoleTheme('DISTRIBUTOR');
  const user = { name: 'HR Manager', email: 'hr@distribution.com' };

  const staff: Employee[] = [
    { id: 'EMP-101', name: 'John Smith', role: 'Driver', department: 'Logistics', shift: 'Morning', status: 'On Duty' },
    { id: 'EMP-102', name: 'Sarah Johnson', role: 'Driver', department: 'Logistics', shift: 'Morning', status: 'On Duty' },
    { id: 'EMP-103', name: 'Mike Wilson', role: 'Warehouse Staff', department: 'Warehouse', shift: 'Day', status: 'On Duty' },
    { id: 'EMP-104', name: 'Alice Brown', role: 'Quality Inspector', department: 'Quality Control', shift: 'Day', status: 'On Duty' },
    { id: 'EMP-105', name: 'Bob Davis', role: 'Manager', department: 'Operations', shift: 'Day', status: 'On Duty' },
  ];

  const columns: Column<Employee>[] = [
    { key: 'name', label: 'Employee', sortable: true, render: (e) => <div><div className="font-semibold text-gray-900">{e.name}</div><div className="text-xs text-gray-500">{e.id}</div></div> },
    { key: 'role', label: 'Role', sortable: true, render: (e) => <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${e.role === 'Driver' ? 'bg-blue-100 text-blue-800' : e.role === 'Manager' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>{e.role}</span> },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'shift', label: 'Shift', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (e) => <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${e.status === 'On Duty' ? 'bg-green-100 text-green-800' : e.status === 'Off Duty' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>{e.status}</span> },
  ];

  const onDuty = staff.filter(s => s.status === 'On Duty').length;
  const drivers = staff.filter(s => s.role === 'Driver').length;
  const warehouseStaff = staff.filter(s => s.role === 'Warehouse Staff').length;

  return (
    <RoleBasedLayout role="DISTRIBUTOR" user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>

        <StatCardsGrid>
          <AdvancedStatCard title="Total Staff" value={staff.length} subtitle="All employees" icon={UserGroupIcon} gradient={theme.gradients.primary} />
          <AdvancedStatCard title="On Duty" value={onDuty} subtitle="Currently working" icon={ClockIcon} gradient="from-green-500 to-emerald-500" />
          <AdvancedStatCard title="Drivers" value={drivers} subtitle="Delivery team" icon={TruckIcon} gradient="from-purple-500 to-indigo-500" />
          <AdvancedStatCard title="Warehouse Staff" value={warehouseStaff} subtitle="Operations team" icon={BuildingOffice2Icon} gradient="from-amber-500 to-orange-500" />
        </StatCardsGrid>

        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Employee Directory</h2>
          <AdvancedDataTable data={staff} columns={columns} searchPlaceholder="Search staff..." />
        </div>
      </div>
    </RoleBasedLayout>
  );
}
