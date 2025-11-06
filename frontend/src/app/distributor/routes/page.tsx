'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import { getRoleTheme } from '@/config/roleThemes';
import {
  MapIcon,
  TruckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

interface Route {
  id: string;
  name: string;
  vehicle: string;
  driver: string;
  stops: number;
  distance: number;
  estimatedTime: string;
  fuelCost: number;
  status: 'Planned' | 'Active' | 'Completed';
  optimization: number; // percentage
}

export default function RouteOptimizationPage() {
  const theme = getRoleTheme('DISTRIBUTOR');
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  const user = {
    name: 'Logistics Coordinator',
    email: 'logistics@distribution.com',
  };

  const routes: Route[] = [
    {
      id: 'RT-N001',
      name: 'North Zone Route',
      vehicle: 'TRK-101',
      driver: 'John Smith',
      stops: 8,
      distance: 45.2,
      estimatedTime: '3h 20m',
      fuelCost: 28.50,
      status: 'Active',
      optimization: 92,
    },
    {
      id: 'RT-S001',
      name: 'South Zone Route',
      vehicle: 'TRK-102',
      driver: 'Sarah Johnson',
      stops: 6,
      distance: 38.7,
      estimatedTime: '2h 45m',
      fuelCost: 24.20,
      status: 'Active',
      optimization: 88,
    },
    {
      id: 'RT-E001',
      name: 'East Zone Route',
      vehicle: 'TRK-103',
      driver: 'Mike Wilson',
      stops: 10,
      distance: 52.3,
      estimatedTime: '4h 10m',
      fuelCost: 33.40,
      status: 'Completed',
      optimization: 85,
    },
    {
      id: 'RT-W001',
      name: 'West Zone Route',
      vehicle: 'TRK-104',
      driver: 'Emily Davis',
      stops: 7,
      distance: 41.5,
      estimatedTime: '3h 0m',
      fuelCost: 26.80,
      status: 'Planned',
      optimization: 95,
    },
  ];

  const totalDistance = routes.reduce((sum, r) => sum + r.distance, 0);
  const totalFuelCost = routes.reduce((sum, r) => sum + r.fuelCost, 0);
  const avgOptimization = (routes.reduce((sum, r) => sum + r.optimization, 0) / routes.length).toFixed(1);
  const activeRoutes = routes.filter(r => r.status === 'Active').length;

  return (
    <RoleBasedLayout role="DISTRIBUTOR" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Route Optimization</h1>
            <p className="mt-1 text-sm text-gray-500">
              AI-powered route planning for efficient deliveries
            </p>
          </div>
          <button className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl">
            <SparklesIcon className="mb-1 inline h-5 w-5" /> Optimize All Routes
          </button>
        </div>

        {/* Stats */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Active Routes"
            value={activeRoutes}
            subtitle={`${routes.length} total routes`}
            icon={MapIcon}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Total Distance"
            value={`${totalDistance.toFixed(1)}km`}
            subtitle="Today's routes"
            icon={TruckIcon}
            gradient="from-green-500 to-emerald-500"
          />
          <AdvancedStatCard
            title="Avg Optimization"
            value={`${avgOptimization}%`}
            subtitle="Route efficiency"
            icon={SparklesIcon}
            trend={{ direction: 'up', value: '5%', label: 'vs last week' }}
            gradient="from-purple-500 to-indigo-500"
          />
          <AdvancedStatCard
            title="Fuel Cost"
            value={`$${totalFuelCost.toFixed(2)}`}
            subtitle="Estimated today"
            icon={CurrencyDollarIcon}
            trend={{ direction: 'down', value: '8%', label: 'vs last week' }}
            gradient="from-amber-500 to-orange-500"
          />
        </StatCardsGrid>

        {/* Route Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {routes.map((route) => (
            <div
              key={route.id}
              className={`rounded-lg border-2 p-6 transition-all cursor-pointer ${
                selectedRoute === route.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
              onClick={() => setSelectedRoute(route.id)}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                  <p className="text-sm text-gray-500">{route.id}</p>
                </div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    route.status === 'Active'
                      ? 'bg-blue-100 text-blue-800'
                      : route.status === 'Completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {route.status}
                </span>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Vehicle</p>
                  <p className="font-semibold text-gray-900">{route.vehicle}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Driver</p>
                  <p className="font-semibold text-gray-900">{route.driver}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Stops</p>
                  <p className="font-semibold text-gray-900">{route.stops} locations</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Distance</p>
                  <p className="font-semibold text-gray-900">{route.distance}km</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4" />
                    Estimated Time
                  </span>
                  <span className="font-semibold text-gray-900">{route.estimatedTime}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <CurrencyDollarIcon className="h-4 w-4" />
                    Fuel Cost
                  </span>
                  <span className="font-semibold text-gray-900">${route.fuelCost.toFixed(2)}</span>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Route Optimization</span>
                    <span className={`font-semibold ${route.optimization >= 90 ? 'text-green-600' : 'text-blue-600'}`}>
                      {route.optimization}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full ${
                        route.optimization >= 90
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600'
                      }`}
                      style={{ width: `${route.optimization}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-lg border border-blue-500 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50">
                  View Map
                </button>
                <button className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600">
                  Optimize
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Map Placeholder */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Route Visualization</h2>
          <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
            <div className="text-center">
              <MapIcon className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Interactive Route Map</h3>
              <p className="mt-2 text-sm text-gray-500">
                Select a route to view real-time tracking and optimization suggestions
              </p>
            </div>
          </div>
        </div>

        {/* Optimization Tips */}
        <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-3 font-semibold text-blue-900">AI Optimization Suggestions</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-3 rounded-lg bg-white p-3">
              <SparklesIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Route Consolidation</p>
                <p className="text-xs text-gray-600">
                  Combine RT-N001 and RT-W001 to save 12km and $7.50 in fuel costs
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-white p-3">
              <SparklesIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Traffic Avoidance</p>
                <p className="text-xs text-gray-600">
                  Delay RT-E001 departure by 30 minutes to avoid peak traffic (save 25min)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}
