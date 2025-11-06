'use client';

import { motion } from 'framer-motion';
import {
  MapPinIcon,
  TruckIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Location {
  id: string;
  name: string;
  type: 'farm' | 'warehouse' | 'distribution' | 'retail' | 'customer';
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  timestamp: Date;
  status: 'completed' | 'current' | 'pending';
  actorName: string;
  actorRole: string;
}

interface SupplyChainMapProps {
  locations: Location[];
  productName: string;
}

const locationIcons = {
  farm: '🌾',
  warehouse: '🏭',
  distribution: '🚚',
  retail: '🏪',
  customer: '🏠',
};

const locationColors = {
  farm: 'green',
  warehouse: 'blue',
  distribution: 'orange',
  retail: 'purple',
  customer: 'emerald',
};

export function SupplyChainMap({ locations, productName }: SupplyChainMapProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const currentLocationIndex = locations.findIndex(loc => loc.status === 'current');

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Supply Chain Journey</h2>
        <p className="text-gray-600">Follow {productName} through its distribution path</p>
      </div>

      {/* Map Visualization (Simplified Visual Representation) */}
      <div className="bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 rounded-xl p-8 mb-6 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Journey Path */}
        <div className="relative flex items-center justify-between">
          {locations.map((location, index) => (
            <div key={location.id} className="flex-1 flex items-center">
              {/* Location Node */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative flex flex-col items-center"
              >
                {/* Status Indicator */}
                <div className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg ${
                  location.status === 'completed'
                    ? 'bg-gradient-to-br from-green-400 to-green-600'
                    : location.status === 'current'
                    ? 'bg-gradient-to-br from-blue-400 to-blue-600 animate-pulse'
                    : 'bg-gradient-to-br from-gray-300 to-gray-400'
                }`}>
                  {locationIcons[location.type]}
                  {location.status === 'completed' && (
                    <CheckCircleIcon className="absolute -top-1 -right-1 w-6 h-6 text-green-600 bg-white rounded-full" />
                  )}
                </div>

                {/* Location Info */}
                <div className="mt-3 text-center max-w-[120px]">
                  <p className="font-bold text-gray-900 text-sm mb-1">{location.name}</p>
                  <p className="text-xs text-gray-600 mb-1">{location.actorName}</p>
                  <p className="text-xs text-gray-500">{formatDate(location.timestamp)}</p>
                </div>
              </motion.div>

              {/* Connecting Arrow */}
              {index < locations.length - 1 && (
                <div className="flex-1 relative mx-2">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: location.status === 'completed' ? 1 : 0 }}
                    transition={{ duration: 0.8, delay: index * 0.2 + 0.3 }}
                    className="h-1 bg-gradient-to-r from-green-500 to-blue-500 origin-left"
                  />
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: location.status === 'completed' ? 1 : 0, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
                    className="absolute top-1/2 right-0 transform -translate-y-1/2"
                  >
                    <TruckIcon className="h-5 w-5 text-blue-600" />
                  </motion.div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Location Details Cards */}
      <div className="space-y-3">
        {locations.map((location, index) => {
          const color = locationColors[location.type];
          const isActive = location.status === 'current';

          return (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`border-2 rounded-lg p-4 transition-all ${
                isActive
                  ? `border-${color}-500 bg-${color}-50 shadow-md`
                  : location.status === 'completed'
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mr-4 ${
                    location.status === 'completed'
                      ? 'bg-green-100'
                      : location.status === 'current'
                      ? `bg-${color}-100`
                      : 'bg-gray-200'
                  }`}>
                    {locationIcons[location.type]}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="font-bold text-gray-900 mr-2">{location.name}</h3>
                      {location.status === 'completed' && (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      )}
                      {location.status === 'current' && (
                        <span className="flex items-center text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-1 animate-pulse"></div>
                          Current Location
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        <span>{location.address}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span>{formatDate(location.timestamp)}</span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center">
                      <div className="flex items-center text-sm text-gray-700">
                        <span className="font-medium mr-1">{location.actorName}</span>
                        <span className="text-gray-500">({location.actorRole})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step Number */}
                <div className={`ml-4 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  location.status === 'completed'
                    ? 'bg-green-600 text-white'
                    : location.status === 'current'
                    ? `bg-${color}-600 text-white`
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {index + 1}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Journey Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
            <p className="text-sm text-gray-600">Total Stops</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {locations.filter(l => l.status === 'completed').length}
            </p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {currentLocationIndex >= 0 ? currentLocationIndex + 1 : 0}
            </p>
            <p className="text-sm text-gray-600">Current Stop</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {locations.filter(l => l.status === 'pending').length}
            </p>
            <p className="text-sm text-gray-600">Remaining</p>
          </div>
        </div>
      </div>
    </div>
  );
}
