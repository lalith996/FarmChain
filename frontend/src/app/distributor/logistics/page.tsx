'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import toast from 'react-hot-toast';
import { TruckIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Shipment {
  _id: string;
  orderId: string;
  origin: string;
  destination: string;
  status: 'in_transit' | 'delivered' | 'pending';
  estimatedDelivery: string;
  trackingNumber: string;
}

export default function DistributorLogisticsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const mockShipments: Shipment[] = [
        {
          _id: '1',
          orderId: 'ORD-12345',
          origin: 'Punjab',
          destination: 'Mumbai',
          status: 'in_transit',
          estimatedDelivery: new Date(Date.now() + 172800000).toISOString(),
          trackingNumber: 'TRK-001',
        },
      ];
      setShipments(mockShipments);
    } catch (error) {
      toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      in_transit: <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">In Transit</span>,
      delivered: <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Delivered</span>,
      pending: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>,
    };
    return badges[status];
  };

  const columns = [
    { key: 'orderId', label: 'Order ID', render: (s: Shipment) => <span className="font-mono text-sm text-blue-600">{s.orderId}</span> },
    { key: 'tracking', label: 'Tracking #', render: (s: Shipment) => <span className="font-mono text-sm">{s.trackingNumber}</span> },
    {
      key: 'route',
      label: 'Route',
      render: (s: Shipment) => (
        <div className="flex items-center space-x-2 text-sm">
          <span>{s.origin}</span>
          <span>→</span>
          <span>{s.destination}</span>
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (s: Shipment) => getStatusBadge(s.status) },
    { key: 'eta', label: 'ETA', render: (s: Shipment) => <span className="text-sm text-gray-600">{new Date(s.estimatedDelivery).toLocaleDateString()}</span> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Logistics Management" description="Track and manage shipments" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4">
            <TruckIcon className="h-10 w-10 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-gray-900">{shipments.filter(s => s.status === 'in_transit').length}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4">
            <MapPinIcon className="h-10 w-10 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">{shipments.filter(s => s.status === 'delivered').length}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4">
            <ClockIcon className="h-10 w-10 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{shipments.filter(s => s.status === 'pending').length}</p>
            </div>
          </div>
        </div>

        <DataTable columns={columns} data={shipments} loading={loading} emptyMessage="No shipments found" />
      </div>
    </div>
  );
}
