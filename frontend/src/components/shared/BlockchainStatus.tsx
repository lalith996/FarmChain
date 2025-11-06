'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, ClockIcon, CubeIcon, ArrowTrendingUpIcon, SignalIcon } from '@heroicons/react/24/outline';

interface BlockchainData {
  status: 'synced' | 'syncing' | 'disconnected';
  lastBlock: number;
  transactions: number;
  gasPrice: string;
  networkHealth: number;
  confirmedTransactions: number;
  pendingTransactions: number;
  network: string;
  lastUpdated: Date;
}

interface BlockchainStatusProps {
  compact?: boolean;
  data?: BlockchainData;
  showLiveUpdates?: boolean;
}

export function BlockchainStatus({
  compact = false,
  data,
  showLiveUpdates = true
}: BlockchainStatusProps) {
  const [blockchainData, setBlockchainData] = useState<BlockchainData>(
    data || {
      status: 'synced',
      lastBlock: 18234567,
      transactions: 1247,
      gasPrice: '23.5',
      networkHealth: 99.8,
      confirmedTransactions: 1230,
      pendingTransactions: 17,
      network: 'Ethereum Sepolia',
      lastUpdated: new Date(),
    }
  );

  // Simulate live updates (in production, connect to WebSocket or polling)
  useEffect(() => {
    if (!showLiveUpdates) return;

    const interval = setInterval(() => {
      setBlockchainData(prev => ({
        ...prev,
        lastBlock: prev.lastBlock + Math.floor(Math.random() * 3),
        gasPrice: (parseFloat(prev.gasPrice) + (Math.random() - 0.5) * 2).toFixed(1),
        networkHealth: Math.min(100, Math.max(95, prev.networkHealth + (Math.random() - 0.5) * 0.5)),
        lastUpdated: new Date(),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [showLiveUpdates]);

  const getStatusColor = () => {
    switch (blockchainData.status) {
      case 'synced':
        return 'text-green-600 bg-green-100';
      case 'syncing':
        return 'text-yellow-600 bg-yellow-100';
      case 'disconnected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = () => {
    switch (blockchainData.status) {
      case 'synced':
        return <CheckCircleIcon className="h-5 w-5 mr-1" />;
      case 'syncing':
        return <ArrowTrendingUpIcon className="h-5 w-5 mr-1 animate-bounce" />;
      case 'disconnected':
        return <SignalIcon className="h-5 w-5 mr-1" />;
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <CubeIcon className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Blockchain Status</h3>
          </div>
          <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${getStatusColor()}`}>
            <span className="w-2 h-2 bg-current rounded-full mr-1 animate-pulse"></span>
            {blockchainData.status === 'synced' ? 'Live' : blockchainData.status}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-600 text-xs">Latest Block</p>
            <p className="font-semibold text-gray-900">#{blockchainData.lastBlock.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600 text-xs">Transactions</p>
            <p className="font-semibold text-gray-900">{blockchainData.transactions}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-br from-purple-400 to-blue-600 rounded-xl mr-3 shadow-md">
            <CubeIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Blockchain Network</h3>
            <p className="text-sm text-gray-600">{blockchainData.network}</p>
          </div>
        </div>
        <span className={`flex items-center text-sm font-medium px-3 py-1.5 rounded-full ${getStatusColor()}`}>
          {getStatusIcon()}
          {blockchainData.status === 'synced' ? 'Synced' : blockchainData.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-700 font-medium">Latest Block</span>
            <CubeIcon className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-900">#{blockchainData.lastBlock.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-700 font-medium">Gas Price</span>
            <ArrowTrendingUpIcon className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">{blockchainData.gasPrice} Gwei</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <span className="text-sm text-gray-600">Your Transactions</span>
          <span className="font-semibold text-gray-900">{blockchainData.transactions}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <span className="text-sm text-gray-600">Confirmed</span>
          <span className="font-semibold text-green-600">{blockchainData.confirmedTransactions}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <span className="text-sm text-gray-600">Pending</span>
          <span className="font-semibold text-yellow-600">{blockchainData.pendingTransactions}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <span className="text-sm text-gray-600">Network Health</span>
          <div className="flex items-center">
            <div className="w-24 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  blockchainData.networkHealth > 95 ? 'bg-green-600' :
                  blockchainData.networkHealth > 90 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${blockchainData.networkHealth}%` }}
              ></div>
            </div>
            <span className={`font-semibold ${
              blockchainData.networkHealth > 95 ? 'text-green-600' :
              blockchainData.networkHealth > 90 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {blockchainData.networkHealth.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            Last updated: {new Date(blockchainData.lastUpdated).toLocaleTimeString()}
          </div>
          {showLiveUpdates && (
            <span className="flex items-center text-green-600 font-medium">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-1 animate-pulse"></span>
              Live
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
