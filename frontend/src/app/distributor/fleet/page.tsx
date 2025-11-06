'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import {
  TruckIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface Vehicle {
  id: string;
  type: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  status: 'Active' | 'Maintenance' | 'Idle' | 'Out of Service';
  driver: string | null;
  mileage: number;
  lastService: string;
  nextService: string;
  fuelEfficiency: number;
}

export default function FleetManagementPage() {
  const theme = getRoleTheme('DISTRIBUTOR');
  const user = { name: 'Fleet Manager', email: 'fleet@distribution.com' };

  const vehicles: Vehicle[] = [
    {
      id: 'TRK-101',
      type: 'Refrigerated Truck',
      make: 'Isuzu',
      model: 'NPR',
      year: 2022,
      capacity: 5000,
      status: 'Active',
      driver: 'John Smith',
      mileage: 45230,
      lastService: '2025-10-15',
      nextService: '2025-12-15',
      fuelEfficiency: 8.5,
    },
    {
      id: 'TRK-102',
      type: 'Box Truck',
      make: 'Hino',
      model: '300',
      year: 2021,
      capacity: 4000,
      status: 'Active',
      driver: 'Sarah Johnson',
      mileage: 52100,
      lastService: '2025-10-20',
      nextService: '2025-12-20',
      fuelEfficiency: 9.2,
    },
    {
      id: 'TRK-103',
      type: 'Refrigerated Truck',
      make: 'Isuzu',
      model: 'NQR',
      year: 2020,
      capacity: 6000,
      status: 'Maintenance',
      driver: null,
      mileage: 78450,
      lastService: '2025-11-05',
      nextService: '2026-01-05',
      fuelEfficiency: 7.8,
    },
  ];

  const columns: Column<Vehicle>[] = [
    {
      key: 'id',
      label: 'Vehicle ID',
      sortable: true,
      render: (v) => <span className="font-semibold text-blue-600">{v.id}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (v) => (
        <div>
          <div className="font-semibold text-gray-900">{v.type}</div>
          <div className="text-xs text-gray-500">{v.make} {v.model} ({v.year})</div>
        </div>
      ),
    },
    {
      key: 'capacity',
      label: 'Capacity',
      sortable: true,
      render: (v) => <span className="text-gray-700">{v.capacity}kg</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (v) => {
        const colors = {
          'Active': 'bg-green-100 text-green-800',
          'Maintenance': 'bg-yellow-100 text-yellow-800',
          'Idle': 'bg-gray-100 text-gray-800',
          'Out of Service': 'bg-red-100 text-red-800',
        };
        return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${colors[v.status]}`}>{v.status}</span>;
      },
    },
    {
      key: 'driver',
      label: 'Driver',
      render: (v) => <span className="text-gray-700">{v.driver || 'Unassigned'}</span>,
    },
    {
      key: 'mileage',
      label: 'Mileage',
      sortable: true,
      render: (v) => <span className="text-gray-700">{v.mileage.toLocaleString()}km</span>,
    },
    {
      key: 'nextService',
      label: 'Next Service',
      sortable: true,
      render: (v) => <span className="text-sm text-gray-600">{v.nextService}</span>,
    },
  ];

  const activeVehicles = vehicles.filter(v => v.status === 'Active').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'Maintenance').length;
  const avgFuelEfficiency = (vehicles.reduce((sum, v) => sum + v.fuelEfficiency, 0) / vehicles.length).toFixed(1);
  const totalCapacity = vehicles.reduce((sum, v) => sum + v.capacity, 0);

  return (
    <RoleBasedLayout role="DISTRIBUTOR" user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fleet Management</h1>
          <p className="mt-1 text-sm text-gray-500">Monitor and manage delivery vehicles</p>
        </div>

        <StatCardsGrid>
          <AdvancedStatCard title="Total Vehicles" value={vehicles.length} subtitle={`${activeVehicles} active`} icon={TruckIcon} gradient={theme.gradients.primary} />
          <AdvancedStatCard title="In Maintenance" value={maintenanceVehicles} subtitle="Undergoing service" icon={WrenchScrewdriverIcon} gradient="from-yellow-500 to-orange-500" />
          <AdvancedStatCard title="Avg Fuel Efficiency" value={`${avgFuelEfficiency}km/L`} subtitle="Fleet average" icon={CheckCircleIcon} gradient="from-green-500 to-emerald-500" />
          <AdvancedStatCard title="Total Capacity" value={`${totalCapacity.toLocaleString()}kg`} subtitle="Combined fleet" icon={TruckIcon} gradient="from-purple-500 to-indigo-500" />
        </StatCardsGrid>

        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Fleet Overview</h2>
          <AdvancedDataTable data={vehicles} columns={columns} searchPlaceholder="Search vehicles..." />
        </div>
      </div>
    </RoleBasedLayout>
  );
}
