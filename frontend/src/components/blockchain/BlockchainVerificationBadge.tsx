'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,
  XMarkIcon,
  CheckCircleIcon,
  CubeIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  DocumentTextIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

interface BlockchainData {
  verified: boolean;
  contractAddress: string;
  tokenId?: string;
  txHash: string;
  blockNumber: number;
  timestamp: Date;
  network: string;
  confirmations: number;
  gasUsed?: string;
  dataHash?: string;
}

interface BlockchainVerificationBadgeProps {
  blockchainData: BlockchainData;
  productName: string;
  size?: 'small' | 'medium' | 'large';
}

export function BlockchainVerificationBadge({
  blockchainData,
  productName,
  size = 'medium'
}: BlockchainVerificationBadgeProps) {
  const [showModal, setShowModal] = useState(false);

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5',
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getExplorerUrl = (type: 'tx' | 'address' | 'block', value: string | number) => {
    const baseUrl = blockchainData.network === 'mainnet'
      ? 'https://etherscan.io'
      : 'https://sepolia.etherscan.io';

    switch (type) {
      case 'tx':
        return `${baseUrl}/tx/${value}`;
      case 'address':
        return `${baseUrl}/address/${value}`;
      case 'block':
        return `${baseUrl}/block/${value}`;
      default:
        return baseUrl;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <>
      {/* Badge Button */}
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center ${sizeClasses[size]} ${
          blockchainData.verified
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
        } font-medium rounded-full transition-all hover:shadow-md group`}
      >
        <ShieldCheckIcon className={`${iconSizes[size]} mr-1.5`} />
        <span>Verified on Blockchain</span>
        <CubeIcon className={`${iconSizes[size]} ml-1.5 group-hover:rotate-12 transition-transform`} />
      </button>

      {/* Verification Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowModal(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl z-50"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-5 rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <ShieldCheckIcon className="h-8 w-8 mr-3" />
                      <h2 className="text-2xl font-bold">Blockchain Verification</h2>
                    </div>
                    <p className="text-green-100 text-sm">
                      {productName} is registered and verified on the blockchain
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Verification Status */}
                <div className="flex items-center justify-center py-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <CheckCircleIcon className="h-16 w-16 text-green-600 mr-4" />
                  <div>
                    <p className="text-2xl font-bold text-green-900">Verified</p>
                    <p className="text-sm text-green-700">
                      {blockchainData.confirmations.toLocaleString()} Confirmations
                    </p>
                  </div>
                </div>

                {/* Blockchain Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <CubeIcon className="h-5 w-5 mr-2 text-purple-600" />
                    Blockchain Details
                  </h3>

                  {/* Transaction Hash */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Transaction Hash</span>
                      <a
                        href={getExplorerUrl('tx', blockchainData.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
                      >
                        View on Explorer
                        <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                    <p className="font-mono text-sm text-gray-900 break-all bg-white px-3 py-2 rounded border border-gray-200">
                      {blockchainData.txHash}
                    </p>
                  </div>

                  {/* Contract Address */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Smart Contract</span>
                      <a
                        href={getExplorerUrl('address', blockchainData.contractAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
                      >
                        View Contract
                        <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                    <p className="font-mono text-sm text-gray-900 break-all bg-white px-3 py-2 rounded border border-gray-200">
                      {blockchainData.contractAddress}
                    </p>
                  </div>

                  {/* Token ID (if applicable) */}
                  {blockchainData.tokenId && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <span className="text-sm font-medium text-gray-700 block mb-2">Token ID</span>
                      <p className="font-mono text-sm text-gray-900 bg-white px-3 py-2 rounded border border-gray-200">
                        {blockchainData.tokenId}
                      </p>
                    </div>
                  )}

                  {/* Grid of Additional Info */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Block Number */}
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center mb-2">
                        <CubeIcon className="h-4 w-4 text-purple-600 mr-2" />
                        <span className="text-xs font-medium text-purple-900">Block Number</span>
                      </div>
                      <a
                        href={getExplorerUrl('block', blockchainData.blockNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-bold text-purple-900 hover:text-purple-700"
                      >
                        #{blockchainData.blockNumber.toLocaleString()}
                      </a>
                    </div>

                    {/* Network */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center mb-2">
                        <DocumentTextIcon className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-xs font-medium text-blue-900">Network</span>
                      </div>
                      <p className="text-lg font-bold text-blue-900 capitalize">
                        {blockchainData.network}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center mb-2">
                        <ClockIcon className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-xs font-medium text-green-900">Timestamp</span>
                      </div>
                      <p className="text-sm font-semibold text-green-900">
                        {formatDate(blockchainData.timestamp)}
                      </p>
                    </div>

                    {/* Gas Used */}
                    {blockchainData.gasUsed && (
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <div className="flex items-center mb-2">
                          <IdentificationIcon className="h-4 w-4 text-orange-600 mr-2" />
                          <span className="text-xs font-medium text-orange-900">Gas Used</span>
                        </div>
                        <p className="text-sm font-semibold text-orange-900">
                          {blockchainData.gasUsed}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Data Hash (if applicable) */}
                  {blockchainData.dataHash && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <IdentificationIcon className="h-4 w-4 text-gray-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Data Hash (IPFS/Storage)</span>
                      </div>
                      <p className="font-mono text-sm text-gray-900 break-all bg-white px-3 py-2 rounded border border-gray-200">
                        {blockchainData.dataHash}
                      </p>
                    </div>
                  )}
                </div>

                {/* What This Means */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <h4 className="font-bold text-blue-900 mb-3">What does this mean?</h4>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 text-blue-600" />
                      <span>This product&apos;s information is permanently recorded on the blockchain</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 text-blue-600" />
                      <span>The data cannot be altered or tampered with</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 text-blue-600" />
                      <span>Complete transparency and traceability is guaranteed</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 text-blue-600" />
                      <span>You can verify this information independently on the blockchain</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
