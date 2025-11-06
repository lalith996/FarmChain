'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import { getRoleTheme } from '@/config/roleThemes';
import {
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function DeliveryTrackingPage() {
  const theme = getRoleTheme('DISTRIBUTOR');
  const user = { name: 'Tracking Operator', email: 'tracking@distribution.com' };

  const deliveries = [
    { id: 'DEL-1001', vehicle: 'TRK-101', status: 'In Transit', progress: 65, eta: '45 min', location: 'Main St & 5th Ave' },
    { id: 'DEL-1002', vehicle: 'TRK-102', status: 'At Destination', progress: 100, eta: 'Arrived', location: 'Fresh Market Store' },
    { id: 'DEL-1003', vehicle: 'TRK-103', status: 'Delayed', progress: 40, eta: '1h 20m', location: 'Highway 101' },
  ];

  return (
    <RoleBasedLayout role="DISTRIBUTOR" user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Delivery Tracking</h1>

        <StatCardsGrid>
          <AdvancedStatCard title="Active Deliveries" value={deliveries.length} subtitle="Real-time tracking" icon={TruckIcon} gradient={theme.gradients.primary} />
          <AdvancedStatCard title="In Transit" value={deliveries.filter(d => d.status === 'In Transit').length} subtitle="On the road" icon={MapPinIcon} gradient="from-purple-500 to-indigo-500" />
          <AdvancedStatCard title="At Destination" value={deliveries.filter(d => d.status === 'At Destination').length} subtitle="Ready for unload" icon={CheckCircleIcon} gradient="from-green-500 to-emerald-500" />
          <AdvancedStatCard title="Delayed" value={deliveries.filter(d => d.status === 'Delayed').length} subtitle="Behind schedule" icon={ClockIcon} gradient="from-red-500 to-orange-500" />
        </StatCardsGrid>

        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Live Tracking</h2>
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{delivery.id}</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    delivery.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                    delivery.status === 'At Destination' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>{delivery.status}</span>
                </div>
                <div className="mb-2 text-sm text-gray-700">
                  <MapPinIcon className="inline h-4 w-4 mr-1" />
                  {delivery.location}
                </div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold">{delivery.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: `${delivery.progress}%` }} />
                </div>
                <div className="mt-2 text-sm text-gray-600">ETA: {delivery.eta}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}
