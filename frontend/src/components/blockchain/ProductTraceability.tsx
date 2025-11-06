'use client';

import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  UserIcon,
  CubeIcon,
  ClockIcon,
  MapPinIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface TraceabilityEvent {
  id: string;
  type: 'harvest' | 'quality_check' | 'transfer' | 'shipped' | 'delivered';
  title: string;
  description: string;
  timestamp: Date;
  location?: string;
  actor: {
    name: string;
    role: string;
    wallet: string;
  };
  blockchainData?: {
    txHash: string;
    blockNumber: number;
    verified: boolean;
  };
  metadata?: Record<string, any>;
}

interface ProductTraceabilityProps {
  productId: string;
  events: TraceabilityEvent[];
  productName: string;
  currentStatus: string;
}

const eventIcons = {
  harvest: UserIcon,
  quality_check: DocumentCheckIcon,
  transfer: CubeIcon,
  shipped: TruckIcon,
  delivered: CheckCircleIconSolid,
};

const eventColors = {
  harvest: 'green',
  quality_check: 'blue',
  transfer: 'purple',
  shipped: 'orange',
  delivered: 'emerald',
};

export function ProductTraceability({
  productId,
  events,
  productName,
  currentStatus
}: ProductTraceabilityProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getExplorerUrl = (txHash: string) => {
    // You can configure this based on your network
    return `https://etherscan.io/tx/${txHash}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Journey</h2>
            <p className="text-gray-600">Track the complete lifecycle of {productName}</p>
          </div>
          <div className="flex items-center px-4 py-2 bg-green-100 rounded-full">
            <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-medium text-green-800">{currentStatus}</span>
          </div>
        </div>

        {/* Product ID */}
        <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          <CubeIcon className="h-4 w-4 mr-2" />
          <span className="font-mono">Product ID: {productId}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-blue-500 to-purple-500"></div>

        {/* Events */}
        <div className="space-y-8">
          {events.map((event, index) => {
            const Icon = eventIcons[event.type];
            const color = eventColors[event.type];

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative pl-20"
              >
                {/* Icon */}
                <div className={`absolute left-0 w-16 h-16 bg-gradient-to-br from-${color}-400 to-${color}-600 rounded-full flex items-center justify-center shadow-lg z-10`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>

                {/* Content Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  {/* Event Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.description}</p>
                    </div>
                    {event.blockchainData?.verified && (
                      <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {/* Timestamp */}
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{formatDate(event.timestamp)}</span>
                    </div>

                    {/* Location */}
                    {event.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Actor Info */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">{event.actor.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{event.actor.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{event.actor.role}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      {shortenAddress(event.actor.wallet)}
                    </span>
                  </div>

                  {/* Blockchain Data */}
                  {event.blockchainData && (
                    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-purple-900">Blockchain Proof</span>
                        <CubeIcon className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-purple-700">Transaction:</span>
                          <a
                            href={getExplorerUrl(event.blockchainData.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-purple-900 hover:text-purple-600 hover:underline"
                          >
                            {shortenAddress(event.blockchainData.txHash)}
                          </a>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-purple-700">Block:</span>
                          <span className="font-mono text-purple-900">
                            #{event.blockchainData.blockNumber.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {Object.entries(event.metadata).map(([key, value]) => (
                        <div key={key} className="text-xs">
                          <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                          <span className="ml-1 font-medium text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            <p className="text-sm text-gray-600">Total Events</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {events.filter(e => e.blockchainData?.verified).length}
            </p>
            <p className="text-sm text-gray-600">Verified on Chain</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {new Set(events.map(e => e.actor.wallet)).size}
            </p>
            <p className="text-sm text-gray-600">Unique Participants</p>
          </div>
        </div>
      </div>
    </div>
  );
}
