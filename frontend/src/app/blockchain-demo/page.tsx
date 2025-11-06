'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProductTraceability } from '@/components/blockchain/ProductTraceability';
import { SupplyChainMap } from '@/components/blockchain/SupplyChainMap';
import { BlockchainVerificationBadge } from '@/components/blockchain/BlockchainVerificationBadge';
import { BlockchainExplorer } from '@/components/blockchain/BlockchainExplorer';
import { QRCodeGenerator } from '@/components/blockchain/QRCodeGenerator';
import { BlockchainStatus } from '@/components/shared/BlockchainStatus';
import {
  CubeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function BlockchainDemoPage() {
  // Mock data for demonstrations
  const mockTraceabilityEvents = [
    {
      id: '1',
      type: 'harvest' as const,
      title: 'Product Harvested',
      description: 'Organic tomatoes harvested from Green Valley Farm',
      timestamp: new Date('2025-11-01T08:30:00'),
      location: 'Green Valley Farm, Maharashtra, India',
      actor: {
        name: 'Rajesh Kumar',
        role: 'farmer',
        wallet: '0x1234567890abcdef1234567890abcdef12345678',
      },
      blockchainData: {
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        blockNumber: 18234567,
        verified: true,
      },
      metadata: {
        quantity: '500 kg',
        grade: 'A',
        organic_certified: 'Yes',
      },
    },
    {
      id: '2',
      type: 'quality_check' as const,
      title: 'Quality Verification',
      description: 'Product passed quality inspection with A grade',
      timestamp: new Date('2025-11-01T14:15:00'),
      location: 'Agricultural Testing Lab, Pune',
      actor: {
        name: 'Dr. Priya Sharma',
        role: 'inspector',
        wallet: '0x2345678901abcdef2345678901abcdef23456789',
      },
      blockchainData: {
        txHash: '0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678901',
        blockNumber: 18234580,
        verified: true,
      },
      metadata: {
        moisture_content: '92%',
        defects: 'None',
        pesticides: 'Not detected',
      },
    },
    {
      id: '3',
      type: 'transfer' as const,
      title: 'Ownership Transferred',
      description: 'Product ownership transferred to Fresh Foods Distribution',
      timestamp: new Date('2025-11-02T09:00:00'),
      location: 'Distribution Center, Mumbai',
      actor: {
        name: 'Fresh Foods Distribution',
        role: 'distributor',
        wallet: '0x3456789012abcdef3456789012abcdef34567890',
      },
      blockchainData: {
        txHash: '0xcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        blockNumber: 18234620,
        verified: true,
      },
      metadata: {
        quantity_transferred: '500 kg',
        payment_status: 'Completed',
      },
    },
    {
      id: '4',
      type: 'shipped' as const,
      title: 'Shipped to Retailer',
      description: 'Product shipped to SuperMart Retail Chain',
      timestamp: new Date('2025-11-03T07:30:00'),
      location: 'In Transit - Mumbai to Delhi',
      actor: {
        name: 'Fast Logistics Pvt Ltd',
        role: 'logistics',
        wallet: '0x4567890123abcdef4567890123abcdef45678901',
      },
      blockchainData: {
        txHash: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc',
        blockNumber: 18234670,
        verified: true,
      },
      metadata: {
        tracking_number: 'FL20251103-7890',
        temperature: '4°C',
        humidity: '65%',
      },
    },
    {
      id: '5',
      type: 'delivered' as const,
      title: 'Delivered to Customer',
      description: 'Product successfully delivered to retail location',
      timestamp: new Date('2025-11-04T11:00:00'),
      location: 'SuperMart, Connaught Place, Delhi',
      actor: {
        name: 'SuperMart Retail',
        role: 'retailer',
        wallet: '0x5678901234abcdef5678901234abcdef56789012',
      },
      blockchainData: {
        txHash: '0xef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
        blockNumber: 18234720,
        verified: true,
      },
      metadata: {
        delivery_condition: 'Excellent',
        temperature_maintained: 'Yes',
        signature: 'Received',
      },
    },
  ];

  const mockSupplyChainLocations = [
    {
      id: '1',
      name: 'Green Valley Farm',
      type: 'farm' as const,
      address: 'Village Road, Nashik, Maharashtra 422001',
      coordinates: { lat: 19.9975, lng: 73.7898 },
      timestamp: new Date('2025-11-01T08:30:00'),
      status: 'completed' as const,
      actorName: 'Rajesh Kumar',
      actorRole: 'Farmer',
    },
    {
      id: '2',
      name: 'Distribution Center',
      type: 'warehouse' as const,
      address: 'Industrial Area, Mumbai, Maharashtra 400001',
      coordinates: { lat: 19.0760, lng: 72.8777 },
      timestamp: new Date('2025-11-02T09:00:00'),
      status: 'completed' as const,
      actorName: 'Fresh Foods Distribution',
      actorRole: 'Distributor',
    },
    {
      id: '3',
      name: 'Transit Hub',
      type: 'distribution' as const,
      address: 'Highway Rest Stop, Gujarat',
      coordinates: { lat: 22.3072, lng: 73.1812 },
      timestamp: new Date('2025-11-03T14:00:00'),
      status: 'completed' as const,
      actorName: 'Fast Logistics',
      actorRole: 'Logistics Partner',
    },
    {
      id: '4',
      name: 'SuperMart Store',
      type: 'retail' as const,
      address: 'Connaught Place, New Delhi 110001',
      coordinates: { lat: 28.6315, lng: 77.2167 },
      timestamp: new Date('2025-11-04T11:00:00'),
      status: 'current' as const,
      actorName: 'SuperMart Retail',
      actorRole: 'Retailer',
    },
    {
      id: '5',
      name: 'Customer Location',
      type: 'customer' as const,
      address: 'Residential Area, New Delhi',
      coordinates: { lat: 28.7041, lng: 77.1025 },
      timestamp: new Date('2025-11-05T00:00:00'),
      status: 'pending' as const,
      actorName: 'End Customer',
      actorRole: 'Consumer',
    },
  ];

  const mockTransactions = [
    {
      id: '1',
      txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      type: 'product_registration' as const,
      from: '0x1234567890abcdef1234567890abcdef12345678',
      to: '0x0000000000000000000000000000000000000000',
      timestamp: new Date('2025-11-01T08:30:00'),
      blockNumber: 18234567,
      status: 'confirmed' as const,
      gasUsed: '125,430',
      metadata: {
        productName: 'Organic Tomatoes - Grade A',
        orderId: 'ORD-2025-001',
      },
    },
    {
      id: '2',
      txHash: '0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678901',
      type: 'quality_check' as const,
      from: '0x2345678901abcdef2345678901abcdef23456789',
      to: '0x1234567890abcdef1234567890abcdef12345678',
      timestamp: new Date('2025-11-01T14:15:00'),
      blockNumber: 18234580,
      status: 'confirmed' as const,
      gasUsed: '89,340',
      metadata: {
        productName: 'Organic Tomatoes - Grade A',
      },
    },
    {
      id: '3',
      txHash: '0xcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
      type: 'ownership_transfer' as const,
      from: '0x1234567890abcdef1234567890abcdef12345678',
      to: '0x3456789012abcdef3456789012abcdef34567890',
      timestamp: new Date('2025-11-02T09:00:00'),
      blockNumber: 18234620,
      status: 'confirmed' as const,
      gasUsed: '154,230',
      value: '0.5',
    },
    {
      id: '4',
      txHash: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc',
      type: 'delivery' as const,
      from: '0x4567890123abcdef4567890123abcdef45678901',
      to: '0x5678901234abcdef5678901234abcdef56789012',
      timestamp: new Date('2025-11-03T07:30:00'),
      blockNumber: 18234670,
      status: 'confirmed' as const,
      gasUsed: '76,540',
    },
    {
      id: '5',
      txHash: '0xef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
      type: 'payment' as const,
      from: '0x5678901234abcdef5678901234abcdef56789012',
      to: '0x1234567890abcdef1234567890abcdef12345678',
      timestamp: new Date('2025-11-04T16:00:00'),
      blockNumber: 18234730,
      status: 'pending' as const,
      gasUsed: '98,670',
      value: '0.5',
    },
  ];

  const mockBlockchainData = {
    verified: true,
    contractAddress: '0xFarmChain1234567890abcdef1234567890abcdef',
    tokenId: '12345',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    blockNumber: 18234567,
    timestamp: new Date('2025-11-01T08:30:00'),
    network: 'sepolia',
    confirmations: 12547,
    gasUsed: '125,430 Wei',
    dataHash: 'Qm...ipfsHashExample',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <CubeIcon className="h-12 w-12" />
            </div>
            <h1 className="text-5xl font-bold mb-4">Blockchain & Transparency Demo</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Explore FarmChain's blockchain-powered transparency features
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Blockchain Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <SparklesIcon className="h-8 w-8 mr-3 text-purple-600" />
            Blockchain Network Status
          </h2>
          <BlockchainStatus showLiveUpdates={true} />
        </motion.div>

        {/* Verification Badge Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Blockchain Verification Badge</h2>
            <p className="text-gray-600 mb-6">
              Click the badge below to view complete blockchain verification details
            </p>
            <div className="flex items-center space-x-4">
              <BlockchainVerificationBadge
                blockchainData={mockBlockchainData}
                productName="Organic Tomatoes - Grade A"
                size="large"
              />
              <QRCodeGenerator
                productId="PROD-2025-001"
                productName="Organic Tomatoes - Grade A"
                txHash={mockBlockchainData.txHash}
                verificationUrl={`https://farmchain.example.com/verify/${mockBlockchainData.txHash}`}
              />
            </div>
          </div>
        </motion.div>

        {/* Product Traceability Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <ProductTraceability
            productId="PROD-2025-001"
            events={mockTraceabilityEvents}
            productName="Organic Tomatoes - Grade A"
            currentStatus="Delivered"
          />
        </motion.div>

        {/* Supply Chain Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <SupplyChainMap
            locations={mockSupplyChainLocations}
            productName="Organic Tomatoes - Grade A"
          />
        </motion.div>

        {/* Blockchain Explorer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-12"
        >
          <BlockchainExplorer
            transactions={mockTransactions}
            network="sepolia"
            showFilters={true}
          />
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Experience the Future of Agricultural Supply Chain
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Every product, every transaction, every step - fully transparent and verifiable on the blockchain
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button className="px-8 py-4 bg-white text-green-600 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl">
                Start Using FarmChain
              </button>
              <button className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl font-bold hover:bg-white/10 transition-all">
                View Transparency Report
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
