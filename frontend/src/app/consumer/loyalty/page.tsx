'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import {
  SparklesIcon,
  GiftIcon,
  TrophyIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: string;
  image: string;
  available: boolean;
}

interface PointsTransaction {
  id: string;
  date: string;
  description: string;
  points: number;
  type: 'Earned' | 'Redeemed' | 'Expired';
}

interface Tier {
  name: string;
  minPoints: number;
  color: string;
  benefits: string[];
}

export default function LoyaltyProgramPage() {
  const theme = getRoleTheme('CONSUMER');
  const user = { name: 'John Customer', email: 'john@example.com' };
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'history' | 'referrals'>('overview');

  const currentPoints = 2450;
  const lifetimePoints = 5820;
  const currentTierName = 'Gold';
  const nextTierName = 'Platinum';
  const pointsToNextTier = 550;

  const tiers: Tier[] = [
    {
      name: 'Bronze',
      minPoints: 0,
      color: 'from-amber-600 to-amber-700',
      benefits: ['Earn 1 point per $1 spent', 'Birthday reward', 'Exclusive member offers'],
    },
    {
      name: 'Silver',
      minPoints: 500,
      color: 'from-gray-400 to-gray-500',
      benefits: ['Earn 1.5 points per $1', 'Free delivery on orders over $30', 'Early access to sales'],
    },
    {
      name: 'Gold',
      minPoints: 1500,
      color: 'from-yellow-400 to-yellow-600',
      benefits: ['Earn 2 points per $1', 'Free delivery on all orders', 'Priority customer support', 'Exclusive products'],
    },
    {
      name: 'Platinum',
      minPoints: 3000,
      color: 'from-purple-400 to-purple-600',
      benefits: ['Earn 3 points per $1', 'Free expedited shipping', 'Personal shopping assistant', 'VIP events access', 'Double points days'],
    },
  ];

  const rewards: Reward[] = [
    { id: 'R-001', name: '$5 Off Coupon', description: 'Get $5 off your next order', pointsCost: 500, category: 'Discount', image: '💵', available: true },
    { id: 'R-002', name: '$10 Off Coupon', description: 'Get $10 off your next order', pointsCost: 1000, category: 'Discount', image: '💰', available: true },
    { id: 'R-003', name: 'Free Delivery', description: 'Free delivery for one month', pointsCost: 750, category: 'Shipping', image: '🚚', available: true },
    { id: 'R-004', name: 'Premium Gift Box', description: 'Curated selection of organic products', pointsCost: 2000, category: 'Gift', image: '🎁', available: true },
    { id: 'R-005', name: '$25 Off Coupon', description: 'Get $25 off your next order', pointsCost: 2500, category: 'Discount', image: '💎', available: false },
    { id: 'R-006', name: 'VIP Experience', description: 'Farm tour and exclusive tasting', pointsCost: 5000, category: 'Experience', image: '⭐', available: false },
  ];

  const pointsHistory: PointsTransaction[] = [
    { id: 'PT-001', date: '2025-11-06', description: 'Purchase Order #ORD-1234', points: 92, type: 'Earned' },
    { id: 'PT-002', date: '2025-11-05', description: 'Redeemed $10 Off Coupon', points: -1000, type: 'Redeemed' },
    { id: 'PT-003', date: '2025-11-04', description: 'Purchase Order #ORD-1233', points: 114, type: 'Earned' },
    { id: 'PT-004', date: '2025-11-03', description: 'Referral Bonus', points: 500, type: 'Earned' },
    { id: 'PT-005', date: '2025-11-02', description: 'Purchase Order #ORD-1232', points: 68, type: 'Earned' },
    { id: 'PT-006', date: '2025-11-01', description: 'Birthday Bonus', points: 200, type: 'Earned' },
  ];

  const historyColumns: Column<PointsTransaction>[] = [
    { key: 'date', label: 'Date', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
    {
      key: 'points',
      label: 'Points',
      sortable: true,
      render: (t) => (
        <span className={`font-semibold ${t.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {t.points > 0 ? '+' : ''}{t.points}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (t) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            t.type === 'Earned'
              ? 'bg-green-100 text-green-800'
              : t.type === 'Redeemed'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {t.type}
        </span>
      ),
    },
  ];

  const currentTier = tiers.find(t => t.name === currentTierName)!;
  const nextTier = tiers.find(t => t.name === nextTierName);
  const tierProgress = nextTier ? ((currentPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100 : 100;

  const totalEarned = pointsHistory.filter(t => t.type === 'Earned').reduce((sum, t) => sum + t.points, 0);
  const totalRedeemed = Math.abs(pointsHistory.filter(t => t.type === 'Redeemed').reduce((sum, t) => sum + t.points, 0));

  return (
    <RoleBasedLayout role="CONSUMER" user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Loyalty Program</h1>

        {/* Stats */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Available Points"
            value={currentPoints.toLocaleString()}
            subtitle="Ready to redeem"
            icon={SparklesIcon}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Current Tier"
            value={currentTierName}
            subtitle={`${pointsToNextTier} to ${nextTierName}`}
            icon={TrophyIcon}
            gradient={currentTier.color}
          />
          <AdvancedStatCard
            title="Lifetime Points"
            value={lifetimePoints.toLocaleString()}
            subtitle="All time earned"
            icon={ArrowTrendingUpIcon}
            gradient="from-green-500 to-emerald-500"
          />
          <AdvancedStatCard
            title="Referrals"
            value="8"
            subtitle="Friends invited"
            icon={UserGroupIcon}
            gradient="from-pink-500 to-rose-500"
          />
        </StatCardsGrid>

        {/* Tier Progress */}
        <div className="rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Your Tier Progress</h3>
              <p className="text-sm text-gray-600">You're {pointsToNextTier} points away from {nextTierName} tier!</p>
            </div>
            <div className={`rounded-full bg-gradient-to-r ${currentTier.color} p-4`}>
              <TrophyIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="h-4 rounded-full bg-purple-200">
            <div
              className={`h-4 rounded-full bg-gradient-to-r ${currentTier.color}`}
              style={{ width: `${tierProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>{currentTierName}</span>
            <span>{nextTierName}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'rewards', label: 'Rewards Catalog', count: rewards.length },
            { id: 'history', label: 'Points History', count: pointsHistory.length },
            { id: 'referrals', label: 'Refer & Earn' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-6 py-3 text-sm font-medium ${activeTab === tab.id ? 'text-purple-600' : 'text-gray-600'}`}
            >
              {tab.label}
              {tab.count && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">{tab.count}</span>}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Tier Benefits */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`rounded-xl p-6 shadow-lg ${
                    tier.name === currentTierName ? 'border-2 border-purple-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`rounded-full bg-gradient-to-r ${tier.color} px-4 py-2`}>
                      <span className="font-bold text-white">{tier.name}</span>
                    </div>
                    {tier.name === currentTierName && (
                      <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-bold text-white">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{tier.minPoints.toLocaleString()} points required</p>
                  <div className="space-y-2">
                    {tier.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-green-100 p-3">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{totalEarned}</div>
                    <div className="text-sm text-gray-600">Total Points Earned</div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-purple-100 p-3">
                    <GiftIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{totalRedeemed}</div>
                    <div className="text-sm text-gray-600">Points Redeemed</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Rewards Catalog Tab */}
        {activeTab === 'rewards' && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className={`rounded-xl bg-white p-6 shadow-lg ${
                  !reward.available || currentPoints < reward.pointsCost ? 'opacity-50' : ''
                }`}
              >
                <div className="text-5xl mb-4 text-center">{reward.image}</div>
                <h3 className="font-bold text-gray-900 text-center mb-2">{reward.name}</h3>
                <p className="text-sm text-gray-600 text-center mb-4">{reward.description}</p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <SparklesIcon className="h-5 w-5 text-purple-600" />
                  <span className="text-lg font-bold text-purple-600">{reward.pointsCost} points</span>
                </div>
                <button
                  disabled={!reward.available || currentPoints < reward.pointsCost}
                  className={`w-full rounded-lg py-3 font-bold ${
                    reward.available && currentPoints >= reward.pointsCost
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {!reward.available
                    ? 'Not Available'
                    : currentPoints < reward.pointsCost
                    ? `Need ${reward.pointsCost - currentPoints} more`
                    : 'Redeem Now'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Points History Tab */}
        {activeTab === 'history' && (
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Points Transaction History</h2>
            <AdvancedDataTable data={pointsHistory} columns={historyColumns} searchPlaceholder="Search transactions..." />
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <div className="space-y-6">
            {/* Referral Banner */}
            <div className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Refer a Friend, Get 500 Points!</h2>
                  <p className="text-purple-100">Your friend gets $10 off their first order, and you get 500 loyalty points.</p>
                </div>
                <UserGroupIcon className="h-16 w-16 opacity-50" />
              </div>
            </div>

            {/* Referral Code */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-4">Your Referral Code</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 rounded-lg bg-gray-100 px-6 py-4">
                  <code className="text-2xl font-mono font-bold text-purple-600">JOHN2025</code>
                </div>
                <button className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 font-bold text-white hover:shadow-lg">
                  <ShareIcon className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-3">Share this code with friends and family!</p>
            </div>

            {/* Referral Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="rounded-xl bg-white p-6 shadow-lg text-center">
                <div className="text-3xl font-bold text-purple-600">8</div>
                <div className="text-sm text-gray-600 mt-1">Friends Referred</div>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-lg text-center">
                <div className="text-3xl font-bold text-green-600">4,000</div>
                <div className="text-sm text-gray-600 mt-1">Points Earned</div>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-lg text-center">
                <div className="text-3xl font-bold text-blue-600">$320</div>
                <div className="text-sm text-gray-600 mt-1">Friends Saved</div>
              </div>
            </div>

            {/* How It Works */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-4">How It Works</h3>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { step: '1', title: 'Share Your Code', description: 'Send your unique referral code to friends' },
                  { step: '2', title: 'They Order', description: 'Friend makes their first purchase with your code' },
                  { step: '3', title: 'You Both Win', description: 'You get points, they get a discount!' },
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-xl font-bold text-white">
                      {item.step}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleBasedLayout>
  );
}
