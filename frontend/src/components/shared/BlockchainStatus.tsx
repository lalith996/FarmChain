'use client';

import { CheckCircleIcon, ClockIcon, CubeIcon } from '@heroicons/react/24/outline';

interface BlockchainStatusProps {
  compact?: boolean;
}

export function BlockchainStatus({ compact = false }: BlockchainStatusProps) {
  const mockData = {
    status: 'synced',
    lastBlock: 18234567,
    transactions: 1247,
    gasPrice: '23.5',
    networkHealth: 99.8,
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <CubeIcon className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Blockchain Status</h3>
          </div>
          <span className="flex items-center text-xs text-green-600 font-medium">
            <span className="w-2 h-2 bg-green-600 rounded-full mr-1 animate-pulse"></span>
            Live
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-600 text-xs">Latest Block</p>
            <p className="font-semibold text-gray-900">#{mockData.lastBlock.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600 text-xs">Transactions</p>
            <p className="font-semibold text-gray-900">{mockData.transactions}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg mr-3">
            <CubeIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Blockchain Network</h3>
            <p className="text-sm text-gray-600">Ethereum Mainnet</p>
          </div>
        </div>
        <span className="flex items-center text-sm text-green-600 font-medium">
          <CheckCircleIcon className="h-5 w-5 mr-1" />
          Synced
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Latest Block</span>
          <span className="font-semibold text-gray-900">#{mockData.lastBlock.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Your Transactions</span>
          <span className="font-semibold text-gray-900">{mockData.transactions}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Gas Price</span>
          <span className="font-semibold text-gray-900">{mockData.gasPrice} Gwei</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Network Health</span>
          <span className="font-semibold text-green-600">{mockData.networkHealth}%</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-xs text-gray-500">
          <ClockIcon className="h-4 w-4 mr-1" />
          Last updated: Just now
        </div>
      </div>
    </div>
  );
}
