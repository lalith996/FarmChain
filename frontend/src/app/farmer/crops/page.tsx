'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import {
  SparklesIcon,
  CalendarIcon,
  ChartBarIcon,
  BeakerIcon,
  SunIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Line, Bar } from 'react-chartjs-2';

interface Crop {
  id: string;
  name: string;
  variety: string;
  field: string;
  plantDate: string;
  expectedHarvest: string;
  area: number; // in acres
  status: 'Planning' | 'Planted' | 'Growing' | 'Harvesting' | 'Completed';
  health: number; // 0-100
  growthStage: string;
  daysToHarvest: number;
}

interface CropRotation {
  season: string;
  crop: string;
  field: string;
  year: number;
}

export default function CropManagementPage() {
  const theme = getRoleTheme('FARMER');
  const user = { name: 'John Farmer', email: 'john.farmer@example.com' };
  const [activeTab, setActiveTab] = useState<'current' | 'planning' | 'rotation' | 'history'>('current');

  const crops: Crop[] = [
    {
      id: 'CRP-001',
      name: 'Organic Tomatoes',
      variety: 'Heirloom',
      field: 'Field A',
      plantDate: '2025-09-15',
      expectedHarvest: '2025-12-20',
      area: 5.2,
      status: 'Growing',
      health: 92,
      growthStage: 'Flowering',
      daysToHarvest: 44,
    },
    {
      id: 'CRP-002',
      name: 'Sweet Corn',
      variety: 'Golden Bantam',
      field: 'Field B',
      plantDate: '2025-08-01',
      expectedHarvest: '2025-11-15',
      area: 8.5,
      status: 'Growing',
      health: 88,
      growthStage: 'Mature',
      daysToHarvest: 9,
    },
    {
      id: 'CRP-003',
      name: 'Organic Lettuce',
      variety: 'Buttercrunch',
      field: 'Field C',
      plantDate: '2025-10-01',
      expectedHarvest: '2025-11-25',
      area: 3.0,
      status: 'Growing',
      health: 95,
      growthStage: 'Vegetative',
      daysToHarvest: 19,
    },
    {
      id: 'CRP-004',
      name: 'Strawberries',
      variety: 'Chandler',
      field: 'Field D',
      plantDate: '2025-07-10',
      expectedHarvest: '2025-11-10',
      area: 4.3,
      status: 'Harvesting',
      health: 90,
      growthStage: 'Fruiting',
      daysToHarvest: 4,
    },
  ];

  const rotationPlan: CropRotation[] = [
    { season: 'Spring 2026', crop: 'Organic Tomatoes', field: 'Field B', year: 2026 },
    { season: 'Spring 2026', crop: 'Peppers', field: 'Field A', year: 2026 },
    { season: 'Summer 2026', crop: 'Sweet Corn', field: 'Field C', year: 2026 },
    { season: 'Fall 2026', crop: 'Organic Lettuce', field: 'Field D', year: 2026 },
  ];

  const columns: Column<Crop>[] = [
    {
      key: 'name',
      label: 'Crop',
      sortable: true,
      render: (c) => (
        <div>
          <div className="font-semibold text-gray-900">{c.name}</div>
          <div className="text-xs text-gray-500">{c.variety}</div>
        </div>
      ),
    },
    { key: 'field', label: 'Field', sortable: true },
    {
      key: 'area',
      label: 'Area',
      sortable: true,
      render: (c) => <span className="text-sm">{c.area} acres</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (c) => {
        const statusColors = {
          Planning: 'bg-gray-100 text-gray-800',
          Planted: 'bg-blue-100 text-blue-800',
          Growing: 'bg-green-100 text-green-800',
          Harvesting: 'bg-yellow-100 text-yellow-800',
          Completed: 'bg-purple-100 text-purple-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[c.status]}`}>
            {c.status}
          </span>
        );
      },
    },
    {
      key: 'health',
      label: 'Health',
      sortable: true,
      render: (c) => (
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${c.health >= 90 ? 'bg-green-500' : c.health >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${c.health}%` }}
            />
          </div>
          <span className="text-sm font-medium">{c.health}%</span>
        </div>
      ),
    },
    {
      key: 'daysToHarvest',
      label: 'Days to Harvest',
      sortable: true,
      render: (c) => (
        <span className={`font-semibold ${c.daysToHarvest < 10 ? 'text-orange-600' : 'text-gray-700'}`}>
          {c.daysToHarvest} days
        </span>
      ),
    },
  ];

  const totalAcres = crops.reduce((sum, c) => sum + c.area, 0);
  const activeCrops = crops.filter(c => c.status === 'Growing' || c.status === 'Harvesting').length;
  const avgHealth = Math.round(crops.reduce((sum, c) => sum + c.health, 0) / crops.length);
  const nextHarvest = Math.min(...crops.map(c => c.daysToHarvest));

  // Chart data
  const growthChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Tomatoes Growth',
        data: [12, 25, 38, 52, 68, 82],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Corn Growth',
        data: [15, 30, 45, 60, 75, 88],
        borderColor: 'rgb(234, 179, 8)',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Lettuce Growth',
        data: [20, 40, 60, 75, 88, 95],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const yieldProjectionData = {
    labels: ['Tomatoes', 'Corn', 'Lettuce', 'Strawberries'],
    datasets: [
      {
        label: 'Projected Yield (tons)',
        data: [25, 42, 15, 18],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
      {
        label: 'Last Season (tons)',
        data: [23, 38, 14, 17],
        backgroundColor: 'rgba(156, 163, 175, 0.5)',
      },
    ],
  };

  return (
    <RoleBasedLayout role="FARMER" user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Crop Planning & Management</h1>
          <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 font-bold text-white hover:shadow-lg">
            <SparklesIcon className="h-5 w-5" />
            Plan New Crop
          </button>
        </div>

        {/* Stats */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Active Crops"
            value={activeCrops}
            subtitle={`${totalAcres.toFixed(1)} acres total`}
            icon={SparklesIcon}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Avg Health Score"
            value={`${avgHealth}%`}
            subtitle="Excellent condition"
            icon={BeakerIcon}
            gradient="from-green-500 to-emerald-500"
          />
          <AdvancedStatCard
            title="Next Harvest"
            value={`${nextHarvest} days`}
            subtitle="Strawberries ready"
            icon={ClockIcon}
            gradient="from-yellow-500 to-orange-500"
          />
          <AdvancedStatCard
            title="Yield Projection"
            value="100 tons"
            subtitle="+8% vs last season"
            icon={ArrowTrendingUpIcon}
            gradient="from-blue-500 to-cyan-500"
          />
        </StatCardsGrid>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'current', label: 'Current Crops', count: crops.length },
            { id: 'planning', label: 'Planting Schedule' },
            { id: 'rotation', label: 'Crop Rotation', count: rotationPlan.length },
            { id: 'history', label: 'Historical Data' },
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

        {/* Current Crops Tab */}
        {activeTab === 'current' && (
          <>
            {/* Crop Table */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Active Crops Overview</h2>
              <AdvancedDataTable data={crops} columns={columns} searchPlaceholder="Search crops..." />
            </div>

            {/* Growth Progress Chart */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Growth Progress</h2>
              <Line
                data={growthChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Crop Growth Over Time (% Maturity)' },
                  },
                  scales: {
                    y: { beginAtZero: true, max: 100 },
                  },
                }}
              />
            </div>

            {/* Crop Details Cards */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {crops.map((crop) => (
                <div key={crop.id} className="rounded-xl bg-white p-6 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{crop.name}</h3>
                      <p className="text-sm text-gray-600">{crop.variety} • {crop.field}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      crop.status === 'Growing' ? 'bg-green-100 text-green-800' :
                      crop.status === 'Harvesting' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {crop.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Growth Stage</span>
                      <span className="font-semibold text-gray-900">{crop.growthStage}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Plant Date</span>
                      <span className="font-semibold text-gray-900">{crop.plantDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Expected Harvest</span>
                      <span className="font-semibold text-gray-900">{crop.expectedHarvest}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Area</span>
                      <span className="font-semibold text-gray-900">{crop.area} acres</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Health Score</span>
                        <span className="font-semibold text-gray-900">{crop.health}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${crop.health >= 90 ? 'bg-green-500' : crop.health >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${crop.health}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm">
                      <ClockIcon className="h-4 w-4 text-orange-600" />
                      <span className="font-semibold text-orange-600">{crop.daysToHarvest} days until harvest</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Planting Schedule Tab */}
        {activeTab === 'planning' && (
          <>
            <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 p-6">
              <div className="flex items-center gap-4">
                <CalendarIcon className="h-8 w-8 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-gray-900">Planting Calendar</h3>
                  <p className="text-sm text-gray-600">Plan your planting schedule for optimal yield</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {['Spring 2026', 'Summer 2026', 'Fall 2026'].map((season) => (
                <div key={season} className="rounded-xl bg-white p-6 shadow-lg">
                  <h3 className="font-bold text-gray-900 mb-4">{season}</h3>
                  <div className="space-y-3">
                    {[
                      { crop: 'Tomatoes', date: 'Mar 15 - Jun 20', icon: '🍅' },
                      { crop: 'Peppers', date: 'Apr 1 - Jul 15', icon: '🌶️' },
                      { crop: 'Cucumbers', date: 'May 1 - Aug 10', icon: '🥒' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 rounded-lg border-2 border-gray-200 p-3">
                        <div className="text-2xl">{item.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{item.crop}</div>
                          <div className="text-xs text-gray-600">{item.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Crop Rotation Tab */}
        {activeTab === 'rotation' && (
          <>
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Crop Rotation Plan</h2>
              <p className="text-sm text-gray-600 mb-6">
                Optimize soil health and reduce pests through strategic crop rotation
              </p>
              <div className="space-y-3">
                {rotationPlan.map((plan, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-emerald-100 px-3 py-2">
                        <span className="font-bold text-emerald-700">{plan.season}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{plan.crop}</div>
                        <div className="text-sm text-gray-600">{plan.field}</div>
                      </div>
                    </div>
                    <button className="rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Adjust
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 p-6">
              <h3 className="font-bold text-gray-900 mb-2">💡 Rotation Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Rotate heavy feeders with nitrogen-fixing legumes</li>
                <li>• Follow deep-rooted crops with shallow-rooted ones</li>
                <li>• Allow 3-4 years between same crop family in same field</li>
                <li>• Use cover crops during off-seasons</li>
              </ul>
            </div>
          </>
        )}

        {/* Historical Data Tab */}
        {activeTab === 'history' && (
          <>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Yield Projections vs Historical</h2>
              <Bar
                data={yieldProjectionData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Projected vs Last Season Yields' },
                  },
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 mb-4">Best Performing Crops (2025)</h3>
                <div className="space-y-3">
                  {[
                    { crop: 'Strawberries', yield: '22 tons', icon: '🍓' },
                    { crop: 'Tomatoes', yield: '23 tons', icon: '🍅' },
                    { crop: 'Sweet Corn', yield: '38 tons', icon: '🌽' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="font-medium">{item.crop}</span>
                      </div>
                      <span className="font-bold text-emerald-600">{item.yield}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 mb-4">Growth Trends</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Yield Increase</span>
                      <span className="font-semibold text-green-600">+12%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '75%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Quality Score</span>
                      <span className="font-semibold text-blue-600">93%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '93%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </RoleBasedLayout>
  );
}
