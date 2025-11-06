'use client';

import { motion } from 'framer-motion';
import {
  CubeIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  UserIcon,
  ShoppingBagIcon,
  TruckIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';

interface BlockchainTransaction {
  id: string;
  txHash: string;
  type: 'product_registration' | 'ownership_transfer' | 'quality_check' | 'payment' | 'delivery';
  from: string;
  to: string;
  timestamp: Date;
  blockNumber: number;
  status: 'confirmed' | 'pending' | 'failed';
  gasUsed?: string;
  value?: string;
  metadata?: {
    productName?: string;
    orderId?: string;
    [key: string]: any;
  };
}

interface BlockchainExplorerProps {
  transactions: BlockchainTransaction[];
  network?: string;
  showFilters?: boolean;
}

const transactionIcons = {
  product_registration: DocumentCheckIcon,
  ownership_transfer: ArrowPathIcon,
  quality_check: CheckCircleIcon,
  payment: ShoppingBagIcon,
  delivery: TruckIcon,
};

const transactionColors = {
  product_registration: 'green',
  ownership_transfer: 'blue',
  quality_check: 'purple',
  payment: 'orange',
  delivery: 'emerald',
};

const transactionLabels = {
  product_registration: 'Product Registration',
  ownership_transfer: 'Ownership Transfer',
  quality_check: 'Quality Verification',
  payment: 'Payment',
  delivery: 'Delivery Confirmation',
};

export function BlockchainExplorer({
  transactions,
  network = 'ethereum',
  showFilters = false
}: BlockchainExplorerProps) {
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const getExplorerUrl = (txHash: string) => {
    const baseUrl = network === 'mainnet'
      ? 'https://etherscan.io'
      : 'https://sepolia.etherscan.io';
    return `${baseUrl}/tx/${txHash}`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <CubeIcon className="h-7 w-7 mr-3 text-purple-600" />
            Blockchain Explorer
          </h2>
          <p className="text-gray-600">Recent transactions on the FarmChain network</p>
        </div>
        <div className="flex items-center px-4 py-2 bg-purple-100 rounded-lg">
          <div className="w-2 h-2 bg-purple-600 rounded-full mr-2 animate-pulse"></div>
          <span className="text-sm font-medium text-purple-900 capitalize">{network}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-700 mb-1">Total Transactions</p>
          <p className="text-2xl font-bold text-green-900">{transactions.length}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-700 mb-1">Confirmed</p>
          <p className="text-2xl font-bold text-blue-900">
            {transactions.filter(tx => tx.status === 'confirmed').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-sm text-yellow-700 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-900">
            {transactions.filter(tx => tx.status === 'pending').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-700 mb-1">Latest Block</p>
          <p className="text-lg font-bold text-purple-900">
            #{Math.max(...transactions.map(tx => tx.blockNumber)).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {transactions.map((tx, index) => {
          const Icon = transactionIcons[tx.type];
          const color = transactionColors[tx.type];

          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all bg-gradient-to-br from-white to-gray-50"
            >
              <div className="flex items-start justify-between">
                {/* Left Section - Icon and Details */}
                <div className="flex items-start flex-1">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-${color}-400 to-${color}-600 flex items-center justify-center flex-shrink-0 mr-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    {/* Type and Status */}
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">{transactionLabels[tx.type]}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tx.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : tx.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {tx.status === 'confirmed' && <CheckCircleIcon className="h-3 w-3 inline mr-1" />}
                        {tx.status === 'pending' && <ClockIcon className="h-3 w-3 inline mr-1 animate-spin" />}
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </div>

                    {/* Metadata */}
                    {tx.metadata && Object.keys(tx.metadata).length > 0 && (
                      <div className="mb-2 text-sm text-gray-700">
                        {tx.metadata.productName && (
                          <span className="font-medium">{tx.metadata.productName}</span>
                        )}
                        {tx.metadata.orderId && (
                          <span className="text-gray-500 ml-2">Order: {tx.metadata.orderId}</span>
                        )}
                      </div>
                    )}

                    {/* Transaction Hash */}
                    <div className="flex items-center mb-2">
                      <span className="text-xs text-gray-500 mr-2">TX:</span>
                      <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        {shortenAddress(tx.txHash)}
                      </span>
                      <a
                        href={getExplorerUrl(tx.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:text-blue-700"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      </a>
                    </div>

                    {/* From/To Addresses */}
                    <div className="flex items-center text-xs text-gray-600 space-x-2">
                      <UserIcon className="h-3 w-3" />
                      <span className="font-mono">{shortenAddress(tx.from)}</span>
                      <span>→</span>
                      <span className="font-mono">{shortenAddress(tx.to)}</span>
                    </div>

                    {/* Additional Info Row */}
                    <div className="flex items-center flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      {/* Block Number */}
                      <div className="flex items-center">
                        <CubeIcon className="h-3 w-3 mr-1" />
                        <span>Block #{tx.blockNumber.toLocaleString()}</span>
                      </div>

                      {/* Time */}
                      <div className="flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        <span>{formatDate(tx.timestamp)}</span>
                      </div>

                      {/* Gas Used */}
                      {tx.gasUsed && (
                        <div className="flex items-center">
                          <span>Gas: {tx.gasUsed}</span>
                        </div>
                      )}

                      {/* Value */}
                      {tx.value && (
                        <div className="flex items-center font-medium text-green-600">
                          <span>{tx.value} ETH</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Load More */}
      {transactions.length > 10 && (
        <div className="mt-6 text-center">
          <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all">
            Load More Transactions
          </button>
        </div>
      )}

      {/* Footer Note */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          All transactions are permanently recorded on the blockchain and can be independently verified
        </p>
      </div>
    </div>
  );
}
