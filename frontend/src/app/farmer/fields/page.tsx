'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import {
  MapIcon,
  BeakerIcon,
  WrenchScrewdriverIcon,
  SunIcon,
  CloudIcon,
  ChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { Doughnut, Radar } from 'react-chartjs-2';

interface Field {
  id: string;
  name: string;
  area: number; // acres
  location: string;
  soilType: string;
  soilHealth: number; // 0-100
  irrigationType: string;
  currentCrop: string;
  lastTested: string;
  pH: number;
  nitrogen: number; // ppm
  phosphorus: number; // ppm
  potassium: number; // ppm
  status: 'Active' | 'Fallow' | 'Preparation';
}

interface IrrigationZone {
  zone: string;
  field: string;
  type: string;
  waterUsage: number; // gallons/day
  efficiency: number; // percentage
  lastMaintenance: string;
}

export default function FieldManagementPage() {
  const theme = getRoleTheme('FARMER');
  const user = { name: 'John Farmer', email: 'john.farmer@example.com' };
  const [activeTab, setActiveTab] = useState<'fields' | 'soil' | 'irrigation' | 'map'>('fields');

  const fields: Field[] = [
    {
      id: 'FLD-A',
      name: 'Field A - North',
      area: 5.2,
      location: 'North Section',
      soilType: 'Loamy',
      soilHealth: 92,
      irrigationType: 'Drip',
      currentCrop: 'Organic Tomatoes',
      lastTested: '2025-10-15',
      pH: 6.8,
      nitrogen: 45,
      phosphorus: 38,
      potassium: 42,
      status: 'Active',
    },
    {
      id: 'FLD-B',
      name: 'Field B - East',
      area: 8.5,
      location: 'East Section',
      soilType: 'Sandy Loam',
      soilHealth: 88,
      irrigationType: 'Sprinkler',
      currentCrop: 'Sweet Corn',
      lastTested: '2025-10-20',
      pH: 6.5,
      nitrogen: 42,
      phosphorus: 35,
      potassium: 40,
      status: 'Active',
    },
    {
      id: 'FLD-C',
      name: 'Field C - South',
      area: 3.0,
      location: 'South Section',
      soilType: 'Clay Loam',
      soilHealth: 95,
      irrigationType: 'Drip',
      currentCrop: 'Organic Lettuce',
      lastTested: '2025-10-10',
      pH: 7.0,
      nitrogen: 48,
      phosphorus: 40,
      potassium: 45,
      status: 'Active',
    },
    {
      id: 'FLD-D',
      name: 'Field D - West',
      area: 4.3,
      location: 'West Section',
      soilType: 'Loamy',
      soilHealth: 85,
      irrigationType: 'Drip',
      currentCrop: 'Strawberries',
      lastTested: '2025-09-25',
      pH: 6.2,
      nitrogen: 40,
      phosphorus: 33,
      potassium: 38,
      status: 'Active',
    },
    {
      id: 'FLD-E',
      name: 'Field E - Center',
      area: 6.0,
      location: 'Center Section',
      soilType: 'Loamy',
      soilHealth: 78,
      irrigationType: 'None',
      currentCrop: 'None',
      lastTested: '2025-08-15',
      pH: 6.0,
      nitrogen: 35,
      phosphorus: 30,
      potassium: 35,
      status: 'Preparation',
    },
  ];

  const irrigationZones: IrrigationZone[] = [
    { zone: 'Zone 1', field: 'Field A', type: 'Drip Irrigation', waterUsage: 1200, efficiency: 95, lastMaintenance: '2025-10-01' },
    { zone: 'Zone 2', field: 'Field B', type: 'Sprinkler', waterUsage: 2500, efficiency: 78, lastMaintenance: '2025-09-15' },
    { zone: 'Zone 3', field: 'Field C', type: 'Drip Irrigation', waterUsage: 800, efficiency: 92, lastMaintenance: '2025-10-10' },
    { zone: 'Zone 4', field: 'Field D', type: 'Drip Irrigation', waterUsage: 1000, efficiency: 90, lastMaintenance: '2025-10-05' },
  ];

  const fieldColumns: Column<Field>[] = [
    {
      key: 'name',
      label: 'Field',
      sortable: true,
      render: (f) => (
        <div>
          <div className="font-semibold text-gray-900">{f.name}</div>
          <div className="text-xs text-gray-500">{f.location}</div>
        </div>
      ),
    },
    {
      key: 'area',
      label: 'Area',
      sortable: true,
      render: (f) => <span className="text-sm">{f.area} acres</span>,
    },
    { key: 'soilType', label: 'Soil Type', sortable: true },
    {
      key: 'soilHealth',
      label: 'Soil Health',
      sortable: true,
      render: (f) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${f.soilHealth >= 90 ? 'bg-green-500' : f.soilHealth >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${f.soilHealth}%` }}
            />
          </div>
          <span className="text-sm font-medium">{f.soilHealth}%</span>
        </div>
      ),
    },
    { key: 'currentCrop', label: 'Current Crop', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (f) => {
        const statusColors = {
          Active: 'bg-green-100 text-green-800',
          Fallow: 'bg-yellow-100 text-yellow-800',
          Preparation: 'bg-blue-100 text-blue-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[f.status]}`}>
            {f.status}
          </span>
        );
      },
    },
  ];

  const irrigationColumns: Column<IrrigationZone>[] = [
    { key: 'zone', label: 'Zone', sortable: true },
    { key: 'field', label: 'Field', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    {
      key: 'waterUsage',
      label: 'Water Usage',
      sortable: true,
      render: (z) => <span className="text-sm">{z.waterUsage.toLocaleString()} gal/day</span>,
    },
    {
      key: 'efficiency',
      label: 'Efficiency',
      sortable: true,
      render: (z) => (
        <span className={`font-semibold ${z.efficiency >= 90 ? 'text-green-600' : z.efficiency >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
          {z.efficiency}%
        </span>
      ),
    },
    { key: 'lastMaintenance', label: 'Last Maintenance', sortable: true },
  ];

  const totalArea = fields.reduce((sum, f) => sum + f.area, 0);
  const activeFields = fields.filter(f => f.status === 'Active').length;
  const avgSoilHealth = Math.round(fields.reduce((sum, f) => sum + f.soilHealth, 0) / fields.length);
  const totalWaterUsage = irrigationZones.reduce((sum, z) => sum + z.waterUsage, 0);

  // Soil composition chart
  const soilCompositionData = {
    labels: ['Loamy', 'Sandy Loam', 'Clay Loam', 'Preparation'],
    datasets: [
      {
        data: [
          fields.filter(f => f.soilType === 'Loamy').reduce((sum, f) => sum + f.area, 0),
          fields.filter(f => f.soilType === 'Sandy Loam').reduce((sum, f) => sum + f.area, 0),
          fields.filter(f => f.soilType === 'Clay Loam').reduce((sum, f) => sum + f.area, 0),
          fields.filter(f => f.status === 'Preparation').reduce((sum, f) => sum + f.area, 0),
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(156, 163, 175, 0.5)',
        ],
      },
    ],
  };

  // Soil nutrients radar chart
  const soilNutrientsData = {
    labels: ['Field A', 'Field B', 'Field C', 'Field D', 'Field E'],
    datasets: [
      {
        label: 'Nitrogen (ppm)',
        data: fields.map(f => f.nitrogen),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      },
      {
        label: 'Phosphorus (ppm)',
        data: fields.map(f => f.phosphorus),
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 2,
      },
      {
        label: 'Potassium (ppm)',
        data: fields.map(f => f.potassium),
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
      },
    ],
  };

  return (
    <RoleBasedLayout role="FARMER" user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Field & Plot Management</h1>
          <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 font-bold text-white hover:shadow-lg">
            <PlusIcon className="h-5 w-5" />
            Add New Field
          </button>
        </div>

        {/* Stats */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Total Area"
            value={`${totalArea.toFixed(1)} acres`}
            subtitle={`${activeFields} active fields`}
            icon={MapIcon}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Avg Soil Health"
            value={`${avgSoilHealth}%`}
            subtitle="Excellent condition"
            icon={BeakerIcon}
            gradient="from-green-500 to-emerald-500"
          />
          <AdvancedStatCard
            title="Water Usage"
            value={`${(totalWaterUsage / 1000).toFixed(1)}K`}
            subtitle="gallons per day"
            icon={CloudIcon}
            gradient="from-blue-500 to-cyan-500"
          />
          <AdvancedStatCard
            title="Irrigation Zones"
            value={irrigationZones.length}
            subtitle="Automated systems"
            icon={WrenchScrewdriverIcon}
            gradient="from-purple-500 to-pink-500"
          />
        </StatCardsGrid>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'fields', label: 'Field Overview', count: fields.length },
            { id: 'soil', label: 'Soil Analysis' },
            { id: 'irrigation', label: 'Irrigation', count: irrigationZones.length },
            { id: 'map', label: 'Field Map' },
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

        {/* Field Overview Tab */}
        {activeTab === 'fields' && (
          <>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Fields Summary</h2>
              <AdvancedDataTable data={fields} columns={fieldColumns} searchPlaceholder="Search fields..." />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {fields.map((field) => (
                <div key={field.id} className="rounded-xl bg-white p-6 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{field.name}</h3>
                      <p className="text-sm text-gray-600">{field.location} • {field.area} acres</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      field.status === 'Active' ? 'bg-green-100 text-green-800' :
                      field.status === 'Fallow' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {field.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Soil Type</span>
                      <span className="font-semibold text-gray-900">{field.soilType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Crop</span>
                      <span className="font-semibold text-gray-900">{field.currentCrop}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Irrigation</span>
                      <span className="font-semibold text-gray-900">{field.irrigationType}</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Soil Health</span>
                        <span className="font-semibold text-gray-900">{field.soilHealth}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${field.soilHealth >= 90 ? 'bg-green-500' : field.soilHealth >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${field.soilHealth}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                    <button className="flex-1 rounded-lg border-2 border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      View Details
                    </button>
                    <button className="flex-1 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 py-2 text-sm font-bold text-white hover:shadow-lg">
                      Test Soil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Soil Analysis Tab */}
        {activeTab === 'soil' && (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Soil Distribution by Type</h2>
                <Doughnut
                  data={soilCompositionData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'bottom' },
                    },
                  }}
                />
              </div>

              <div className="rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Nutrient Levels Across Fields</h2>
                <Radar
                  data={soilNutrientsData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'bottom' },
                    },
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 50,
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Detailed Soil Analysis</h2>
              <div className="space-y-4">
                {fields.map((field) => (
                  <div key={field.id} className="rounded-lg border-2 border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900">{field.name}</h3>
                      <span className="text-xs text-gray-500">Last tested: {field.lastTested}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">pH Level</div>
                        <div className="text-lg font-bold text-emerald-600">{field.pH}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Nitrogen</div>
                        <div className="text-lg font-bold text-blue-600">{field.nitrogen} ppm</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Phosphorus</div>
                        <div className="text-lg font-bold text-yellow-600">{field.phosphorus} ppm</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Potassium</div>
                        <div className="text-lg font-bold text-green-600">{field.potassium} ppm</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 p-6">
              <h3 className="font-bold text-gray-900 mb-2">🌱 Soil Health Recommendations</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Field E requires nitrogen enrichment before next planting</li>
                <li>• Field D pH is slightly low - consider lime application</li>
                <li>• Field A and C show excellent nutrient balance</li>
                <li>• Schedule soil testing for Field B and D next month</li>
              </ul>
            </div>
          </>
        )}

        {/* Irrigation Tab */}
        {activeTab === 'irrigation' && (
          <>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Irrigation Zones</h2>
              <AdvancedDataTable data={irrigationZones} columns={irrigationColumns} searchPlaceholder="Search zones..." />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {irrigationZones.map((zone) => (
                <div key={zone.zone} className="rounded-xl bg-white p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-blue-100 p-3">
                      <CloudIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{zone.zone}</h3>
                      <p className="text-sm text-gray-600">{zone.field}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Type</span>
                      <span className="font-semibold text-gray-900">{zone.type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Water Usage</span>
                      <span className="font-semibold text-gray-900">{zone.waterUsage.toLocaleString()} gal/day</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Efficiency</span>
                        <span className="font-semibold text-gray-900">{zone.efficiency}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${zone.efficiency >= 90 ? 'bg-green-500' : zone.efficiency >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${zone.efficiency}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                      Last maintenance: {zone.lastMaintenance}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 mb-4">Water Conservation Tips</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Drip irrigation saves up to 50% water vs sprinklers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Water early morning to reduce evaporation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Regular maintenance prevents leaks and waste</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">💧 Water Usage Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Daily Usage</span>
                    <span className="text-lg font-bold text-blue-600">{totalWaterUsage.toLocaleString()} gal</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Monthly Estimate</span>
                    <span className="text-lg font-bold text-blue-600">{(totalWaterUsage * 30 / 1000).toFixed(0)}K gal</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Efficiency</span>
                    <span className="text-lg font-bold text-green-600">
                      {Math.round(irrigationZones.reduce((sum, z) => sum + z.efficiency, 0) / irrigationZones.length)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Field Map Tab */}
        {activeTab === 'map' && (
          <>
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <h2 className="mb-6 text-lg font-semibold text-gray-900">Farm Layout</h2>
              <div className="grid grid-cols-3 gap-4">
                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className={`rounded-lg border-4 p-6 ${
                      field.status === 'Active'
                        ? 'border-green-500 bg-green-50'
                        : field.status === 'Fallow'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-400 bg-gray-50'
                    }`}
                    style={{ minHeight: `${field.area * 30}px` }}
                  >
                    <div className="font-bold text-lg">{field.name}</div>
                    <div className="text-sm text-gray-700 mt-2">{field.area} acres</div>
                    <div className="text-sm text-gray-600">{field.currentCrop}</div>
                    <div className="mt-3">
                      <MapIcon className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span className="text-sm text-gray-700">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500"></div>
                <span className="text-sm text-gray-700">Fallow</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-400"></div>
                <span className="text-sm text-gray-700">Preparation</span>
              </div>
            </div>
          </>
        )}
      </div>
    </RoleBasedLayout>
  );
}
