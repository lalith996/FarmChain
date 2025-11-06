'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import {
  TruckIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { Line, Bar } from 'react-chartjs-2';

interface Equipment {
  id: string;
  name: string;
  type: string;
  model: string;
  purchaseDate: string;
  status: 'Available' | 'In Use' | 'Maintenance' | 'Repair';
  condition: number; // 0-100
  hoursUsed: number;
  lastMaintenance: string;
  nextMaintenance: string;
  fuelType: string;
  location: string;
}

interface MaintenanceRecord {
  id: string;
  equipment: string;
  date: string;
  type: 'Routine' | 'Repair' | 'Inspection';
  cost: number;
  technician: string;
  notes: string;
  status: 'Completed' | 'Scheduled' | 'Overdue';
}

interface UsageLog {
  date: string;
  equipment: string;
  hours: number;
  operator: string;
  task: string;
}

export default function EquipmentPage() {
  const theme = getRoleTheme('FARMER');
  const user = { name: 'John Farmer', email: 'john.farmer@example.com' };
  const [activeTab, setActiveTab] = useState<'inventory' | 'maintenance' | 'usage' | 'costs'>('inventory');

  const equipment: Equipment[] = [
    {
      id: 'EQ-001',
      name: 'John Deere Tractor',
      type: 'Tractor',
      model: '5075E',
      purchaseDate: '2022-03-15',
      status: 'Available',
      condition: 92,
      hoursUsed: 1250,
      lastMaintenance: '2025-10-15',
      nextMaintenance: '2025-12-15',
      fuelType: 'Diesel',
      location: 'Main Barn',
    },
    {
      id: 'EQ-002',
      name: 'Irrigation Pump',
      type: 'Pump',
      model: 'Berkeley B4',
      purchaseDate: '2021-06-20',
      status: 'In Use',
      condition: 88,
      hoursUsed: 2400,
      lastMaintenance: '2025-09-20',
      nextMaintenance: '2025-11-20',
      fuelType: 'Electric',
      location: 'Field A',
    },
    {
      id: 'EQ-003',
      name: 'Harvest Combine',
      type: 'Harvester',
      model: 'Case IH 5140',
      purchaseDate: '2020-08-10',
      status: 'Maintenance',
      condition: 85,
      hoursUsed: 3200,
      lastMaintenance: '2025-11-01',
      nextMaintenance: '2025-11-15',
      fuelType: 'Diesel',
      location: 'Workshop',
    },
    {
      id: 'EQ-004',
      name: 'Sprayer System',
      type: 'Sprayer',
      model: 'Hardi Navigator',
      purchaseDate: '2023-01-05',
      status: 'Available',
      condition: 95,
      hoursUsed: 450,
      lastMaintenance: '2025-10-25',
      nextMaintenance: '2025-12-25',
      fuelType: 'Diesel',
      location: 'Equipment Shed',
    },
    {
      id: 'EQ-005',
      name: 'Utility Truck',
      type: 'Vehicle',
      model: 'Ford F-250',
      purchaseDate: '2019-05-12',
      status: 'Available',
      condition: 78,
      hoursUsed: 5600,
      lastMaintenance: '2025-10-01',
      nextMaintenance: '2025-11-10',
      fuelType: 'Gasoline',
      location: 'Main Barn',
    },
  ];

  const maintenanceRecords: MaintenanceRecord[] = [
    { id: 'MAINT-001', equipment: 'John Deere Tractor', date: '2025-10-15', type: 'Routine', cost: 350, technician: 'Mike Johnson', notes: 'Oil change, filter replacement', status: 'Completed' },
    { id: 'MAINT-002', equipment: 'Harvest Combine', date: '2025-11-01', type: 'Repair', cost: 1200, technician: 'Sarah Williams', notes: 'Belt replacement, calibration', status: 'Completed' },
    { id: 'MAINT-003', equipment: 'Utility Truck', date: '2025-11-10', type: 'Routine', cost: 250, technician: 'Mike Johnson', notes: 'Scheduled maintenance', status: 'Scheduled' },
    { id: 'MAINT-004', equipment: 'Irrigation Pump', date: '2025-11-05', type: 'Inspection', cost: 150, technician: 'Tom Davis', notes: 'Quarterly inspection', status: 'Overdue' },
  ];

  const usageLogs: UsageLog[] = [
    { date: '2025-11-06', equipment: 'John Deere Tractor', hours: 6.5, operator: 'John Farmer', task: 'Plowing Field B' },
    { date: '2025-11-06', equipment: 'Irrigation Pump', hours: 12, operator: 'Auto', task: 'Field A Irrigation' },
    { date: '2025-11-05', equipment: 'Sprayer System', hours: 4, operator: 'Tom Davis', task: 'Pest Control Field C' },
    { date: '2025-11-05', equipment: 'Utility Truck', hours: 3, operator: 'Sarah Williams', task: 'Supply Run' },
  ];

  const equipmentColumns: Column<Equipment>[] = [
    {
      key: 'name',
      label: 'Equipment',
      sortable: true,
      render: (e) => (
        <div>
          <div className="font-semibold text-gray-900">{e.name}</div>
          <div className="text-xs text-gray-500">{e.model}</div>
        </div>
      ),
    },
    { key: 'type', label: 'Type', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (e) => {
        const statusColors = {
          Available: 'bg-green-100 text-green-800',
          'In Use': 'bg-blue-100 text-blue-800',
          Maintenance: 'bg-yellow-100 text-yellow-800',
          Repair: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[e.status]}`}>
            {e.status}
          </span>
        );
      },
    },
    {
      key: 'condition',
      label: 'Condition',
      sortable: true,
      render: (e) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${e.condition >= 90 ? 'bg-green-500' : e.condition >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${e.condition}%` }}
            />
          </div>
          <span className="text-sm font-medium">{e.condition}%</span>
        </div>
      ),
    },
    {
      key: 'hoursUsed',
      label: 'Hours Used',
      sortable: true,
      render: (e) => <span className="text-sm">{e.hoursUsed.toLocaleString()} hrs</span>,
    },
    { key: 'nextMaintenance', label: 'Next Maintenance', sortable: true },
  ];

  const maintenanceColumns: Column<MaintenanceRecord>[] = [
    { key: 'equipment', label: 'Equipment', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    {
      key: 'cost',
      label: 'Cost',
      sortable: true,
      render: (m) => <span className="font-semibold text-gray-900">${m.cost}</span>,
    },
    { key: 'technician', label: 'Technician', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (m) => {
        const statusColors = {
          Completed: 'bg-green-100 text-green-800',
          Scheduled: 'bg-blue-100 text-blue-800',
          Overdue: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[m.status]}`}>
            {m.status}
          </span>
        );
      },
    },
  ];

  const totalEquipment = equipment.length;
  const availableEquipment = equipment.filter(e => e.status === 'Available').length;
  const maintenanceDue = equipment.filter(e => new Date(e.nextMaintenance) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length;
  const totalMaintenanceCost = maintenanceRecords.reduce((sum, m) => sum + m.cost, 0);

  // Usage trends chart
  const usageTrendsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Tractor Hours',
        data: [6.5, 7.2, 5.8, 8.1, 6.9, 4.5, 3.2],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Pump Hours',
        data: [12, 11, 12, 10, 11, 12, 11],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Maintenance costs chart
  const maintenanceCostsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
    datasets: [
      {
        label: 'Maintenance Costs ($)',
        data: [450, 320, 680, 290, 410, 890, 320, 450, 510, 1200, 1550],
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
      },
    ],
  };

  return (
    <RoleBasedLayout role="FARMER" user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Equipment & Machinery</h1>
          <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 font-bold text-white hover:shadow-lg">
            <PlusIcon className="h-5 w-5" />
            Add Equipment
          </button>
        </div>

        {/* Stats */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Total Equipment"
            value={totalEquipment}
            subtitle={`${availableEquipment} available`}
            icon={TruckIcon}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Maintenance Due"
            value={maintenanceDue}
            subtitle="Within 30 days"
            icon={ExclamationTriangleIcon}
            gradient="from-yellow-500 to-orange-500"
          />
          <AdvancedStatCard
            title="Maintenance Costs"
            value={`$${totalMaintenanceCost}`}
            subtitle="This year"
            icon={ChartBarIcon}
            gradient="from-red-500 to-rose-500"
          />
          <AdvancedStatCard
            title="Operational Rate"
            value="92%"
            subtitle="Equipment uptime"
            icon={CheckCircleIcon}
            gradient="from-green-500 to-emerald-500"
          />
        </StatCardsGrid>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'inventory', label: 'Equipment Inventory', count: equipment.length },
            { id: 'maintenance', label: 'Maintenance', count: maintenanceRecords.length },
            { id: 'usage', label: 'Usage Logs', count: usageLogs.length },
            { id: 'costs', label: 'Cost Analysis' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-6 py-3 text-sm font-medium ${activeTab === tab.id ? 'text-emerald-600' : 'text-gray-600'}`}
            >
              {tab.label}
              {tab.count && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">{tab.count}</span>}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-green-600" />}
            </button>
          ))}
        </div>

        {/* Equipment Inventory Tab */}
        {activeTab === 'inventory' && (
          <>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Equipment Overview</h2>
              <AdvancedDataTable data={equipment} columns={equipmentColumns} searchPlaceholder="Search equipment..." />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {equipment.map((eq) => (
                <div key={eq.id} className="rounded-xl bg-white p-6 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-emerald-100 p-3">
                        <TruckIcon className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{eq.name}</h3>
                        <p className="text-sm text-gray-600">{eq.model} • {eq.type}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      eq.status === 'Available' ? 'bg-green-100 text-green-800' :
                      eq.status === 'In Use' ? 'bg-blue-100 text-blue-800' :
                      eq.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {eq.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Location</span>
                      <span className="font-semibold text-gray-900">{eq.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Hours Used</span>
                      <span className="font-semibold text-gray-900">{eq.hoursUsed.toLocaleString()} hrs</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Fuel Type</span>
                      <span className="font-semibold text-gray-900">{eq.fuelType}</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Condition</span>
                        <span className="font-semibold text-gray-900">{eq.condition}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${eq.condition >= 90 ? 'bg-green-500' : eq.condition >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${eq.condition}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <CalendarIcon className="inline h-4 w-4 mr-1" />
                        Next Maintenance: {eq.nextMaintenance}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <>
            <div className="rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 p-6">
              <div className="flex items-center gap-4">
                <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
                <div>
                  <h3 className="font-bold text-gray-900">Upcoming Maintenance</h3>
                  <p className="text-sm text-gray-600">{maintenanceDue} equipment items require maintenance within 30 days</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Maintenance Records</h2>
              <AdvancedDataTable data={maintenanceRecords} columns={maintenanceColumns} searchPlaceholder="Search maintenance..." />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 mb-4">Scheduled Maintenance</h3>
                <div className="space-y-3">
                  {equipment
                    .filter(e => new Date(e.nextMaintenance) > new Date())
                    .sort((a, b) => new Date(a.nextMaintenance).getTime() - new Date(b.nextMaintenance).getTime())
                    .slice(0, 5)
                    .map((eq) => (
                      <div key={eq.id} className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-3">
                        <div>
                          <div className="font-semibold text-gray-900">{eq.name}</div>
                          <div className="text-xs text-gray-600">{eq.nextMaintenance}</div>
                        </div>
                        <button className="rounded-lg bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 hover:bg-emerald-200">
                          Schedule
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 mb-4">Maintenance Tips</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <WrenchScrewdriverIcon className="h-4 w-4 text-emerald-600 mt-0.5" />
                    <span>Regular oil changes extend engine life by 50%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <WrenchScrewdriverIcon className="h-4 w-4 text-emerald-600 mt-0.5" />
                    <span>Check tire pressure weekly to prevent premature wear</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <WrenchScrewdriverIcon className="h-4 w-4 text-emerald-600 mt-0.5" />
                    <span>Clean equipment after each use to prevent rust</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <WrenchScrewdriverIcon className="h-4 w-4 text-emerald-600 mt-0.5" />
                    <span>Store equipment in dry, covered locations</span>
                  </li>
                </ul>
              </div>
            </div>
          </>
        )}

        {/* Usage Logs Tab */}
        {activeTab === 'usage' && (
          <>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Equipment Usage Trends</h2>
              <Line
                data={usageTrendsData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Daily Equipment Usage (Hours)' },
                  },
                }}
              />
            </div>

            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Usage Logs</h2>
              <div className="space-y-3">
                {usageLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-emerald-100 px-3 py-2">
                        <span className="font-bold text-emerald-700">{log.date}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{log.equipment}</div>
                        <div className="text-sm text-gray-600">{log.task} • Operator: {log.operator}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-emerald-600">{log.hours} hrs</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Cost Analysis Tab */}
        {activeTab === 'costs' && (
          <>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Maintenance Costs Over Time</h2>
              <Bar
                data={maintenanceCostsData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Monthly Maintenance Expenses (2025)' },
                  },
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="text-sm text-gray-600 mb-2">Total Maintenance Costs</h3>
                <div className="text-3xl font-bold text-gray-900">${totalMaintenanceCost.toLocaleString()}</div>
                <div className="text-sm text-gray-500 mt-1">Year to date</div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="text-sm text-gray-600 mb-2">Avg Cost per Equipment</h3>
                <div className="text-3xl font-bold text-gray-900">${Math.round(totalMaintenanceCost / totalEquipment)}</div>
                <div className="text-sm text-gray-500 mt-1">Per unit</div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="text-sm text-gray-600 mb-2">Cost Efficiency</h3>
                <div className="text-3xl font-bold text-green-600">-15%</div>
                <div className="text-sm text-gray-500 mt-1">vs last year</div>
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">💡 Cost Saving Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Preventive maintenance is 4x cheaper than emergency repairs</li>
                <li>• Proper storage reduces equipment degradation by 30%</li>
                <li>• Bulk purchasing of common parts saves 20% annually</li>
                <li>• Regular training reduces operator-caused damage by 40%</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </RoleBasedLayout>
  );
}
