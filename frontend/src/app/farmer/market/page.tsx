'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, GlobeAltIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Line, Bar } from 'react-chartjs-2';

interface MarketPrice {
  crop: string;
  currentPrice: number;
  weeklyChange: number;
  monthlyChange: number;
  demand: 'High' | 'Medium' | 'Low';
  trend: 'Up' | 'Down' | 'Stable';
}

interface Competitor {
  name: string;
  crops: string[];
  avgPrice: number;
  marketShare: number;
}

export default function MarketIntelligencePage() {
  const theme = getRoleTheme('FARMER');
  const user = { name: 'John Farmer', email: 'john.farmer@example.com' };
  const [activeTab, setActiveTab] = useState<'prices' | 'demand' | 'competitors' | 'forecast'>('prices');

  const marketPrices: MarketPrice[] = [
    { crop: 'Organic Tomatoes', currentPrice: 5.20, weeklyChange: 8.3, monthlyChange: 12.5, demand: 'High', trend: 'Up' },
    { crop: 'Sweet Corn', currentPrice: 3.00, weeklyChange: -2.1, monthlyChange: 5.2, demand: 'Medium', trend: 'Stable' },
    { crop: 'Organic Lettuce', currentPrice: 4.80, weeklyChange: 3.5, monthlyChange: -1.2, demand: 'High', trend: 'Up' },
    { crop: 'Strawberries', currentPrice: 6.50, weeklyChange: 15.2, monthlyChange: 22.8, demand: 'High', trend: 'Up' },
    { crop: 'Red Apples', currentPrice: 2.90, weeklyChange: -5.4, monthlyChange: -8.1, demand: 'Low', trend: 'Down' },
  ];

  const competitors: Competitor[] = [
    { name: 'Green Valley Farms', crops: ['Tomatoes', 'Lettuce', 'Peppers'], avgPrice: 4.50, marketShare: 18 },
    { name: 'Sunny Acres', crops: ['Corn', 'Strawberries'], avgPrice: 4.80, marketShare: 15 },
    { name: 'Organic Harvest Co', crops: ['Tomatoes', 'Lettuce', 'Corn'], avgPrice: 5.20, marketShare: 22 },
  ];

  const priceColumns: Column<MarketPrice>[] = [
    { key: 'crop', label: 'Crop', sortable: true, render: (p) => <span className="font-semibold text-gray-900">{p.crop}</span> },
    { key: 'currentPrice', label: 'Current Price', sortable: true, render: (p) => <span className="font-bold text-emerald-600">${p.currentPrice}/lb</span> },
    {
      key: 'weeklyChange',
      label: 'Weekly Change',
      sortable: true,
      render: (p) => (
        <span className={`flex items-center gap-1 ${p.weeklyChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {p.weeklyChange > 0 ? <ArrowTrendingUpIcon className="h-4 w-4" /> : <ArrowTrendingDownIcon className="h-4 w-4" />}
          {Math.abs(p.weeklyChange)}%
        </span>
      ),
    },
    {
      key: 'monthlyChange',
      label: 'Monthly Change',
      sortable: true,
      render: (p) => (
        <span className={`font-semibold ${p.monthlyChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {p.monthlyChange > 0 ? '+' : ''}{p.monthlyChange}%
        </span>
      ),
    },
    {
      key: 'demand',
      label: 'Demand',
      sortable: true,
      render: (p) => {
        const colors = { High: 'bg-green-100 text-green-800', Medium: 'bg-yellow-100 text-yellow-800', Low: 'bg-red-100 text-red-800' };
        return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${colors[p.demand]}`}>{p.demand}</span>;
      },
    },
  ];

  const competitorColumns: Column<Competitor>[] = [
    { key: 'name', label: 'Competitor', sortable: true },
    { key: 'crops', label: 'Crops', render: (c) => <span className="text-sm">{c.crops.join(', ')}</span> },
    { key: 'avgPrice', label: 'Avg Price', sortable: true, render: (c) => <span>${c.avgPrice}/lb</span> },
    { key: 'marketShare', label: 'Market Share', sortable: true, render: (c) => <span className="font-semibold">{c.marketShare}%</span> },
  ];

  const avgPrice = (marketPrices.reduce((sum, p) => sum + p.currentPrice, 0) / marketPrices.length).toFixed(2);
  const highDemandCrops = marketPrices.filter(p => p.demand === 'High').length;
  const trendingUp = marketPrices.filter(p => p.trend === 'Up').length;

  const priceTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Organic Tomatoes',
        data: [4.20, 4.35, 4.50, 4.80, 5.10, 5.25, 5.00, 4.85, 4.90, 5.05, 5.15, 5.20],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Sweet Corn',
        data: [2.80, 2.85, 2.90, 2.95, 3.10, 3.20, 3.15, 3.05, 2.95, 2.90, 2.95, 3.00],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Strawberries',
        data: [5.20, 5.35, 5.50, 5.80, 6.00, 6.20, 6.10, 5.95, 6.05, 6.25, 6.35, 6.50],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const demandForecastData = {
    labels: ['Tomatoes', 'Corn', 'Lettuce', 'Strawberries', 'Apples'],
    datasets: [{
      label: 'Demand Score',
      data: [92, 68, 88, 95, 45],
      backgroundColor: ['rgba(239, 68, 68, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(34, 197, 94, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(156, 163, 175, 0.5)'],
    }],
  };

  return (
    <RoleBasedLayout role="FARMER" user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Market Intelligence</h1>

        <StatCardsGrid>
          <AdvancedStatCard title="Avg Market Price" value={`$${avgPrice}`} subtitle="Per pound" icon={ChartBarIcon} gradient={theme.gradients.primary} />
          <AdvancedStatCard title="High Demand Crops" value={highDemandCrops} subtitle="Hot items this month" icon={ArrowTrendingUpIcon} gradient="from-green-500 to-emerald-500" />
          <AdvancedStatCard title="Trending Up" value={trendingUp} subtitle="Price increasing" icon={ArrowTrendingUpIcon} gradient="from-blue-500 to-cyan-500" />
          <AdvancedStatCard title="Market Reach" value="12" subtitle="Active buyers" icon={UserGroupIcon} gradient="from-purple-500 to-pink-500" />
        </StatCardsGrid>

        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'prices', label: 'Market Prices', count: marketPrices.length },
            { id: 'demand', label: 'Demand Analysis' },
            { id: 'competitors', label: 'Competitors', count: competitors.length },
            { id: 'forecast', label: 'Forecast' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-6 py-3 text-sm font-medium ${activeTab === tab.id ? 'text-emerald-600' : 'text-gray-600'}`}
            >
              {tab.label}
              {tab.count && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">{tab.count}</span>}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-green-600" />}
            </button>
          ))}
        </div>

        {activeTab === 'prices' && (
          <>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Current Market Prices</h2>
              <AdvancedDataTable data={marketPrices} columns={priceColumns} searchPlaceholder="Search crops..." />
            </div>

            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Price Trends (12 Months)</h2>
              <Line data={priceTrendsData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {marketPrices.slice(0, 3).map((price) => (
                <div key={price.crop} className="rounded-xl bg-white p-6 shadow-lg">
                  <h3 className="font-bold text-gray-900 mb-3">{price.crop}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-gray-600">Current</span><span className="font-bold text-emerald-600">${price.currentPrice}/lb</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Weekly</span><span className={price.weeklyChange > 0 ? 'text-green-600' : 'text-red-600'}>{price.weeklyChange > 0 ? '+' : ''}{price.weeklyChange}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Monthly</span><span className={price.monthlyChange > 0 ? 'text-green-600' : 'text-red-600'}>{price.monthlyChange > 0 ? '+' : ''}{price.monthlyChange}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Demand</span><span className="font-semibold">{price.demand}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'demand' && (
          <>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Demand Forecast</h2>
              <Bar data={demandForecastData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            </div>

            <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-6">
              <h3 className="font-bold text-gray-900 mb-2">🎯 Market Opportunities</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Organic produce demand up 25% year-over-year</li>
                <li>• Strawberries showing strongest seasonal demand</li>
                <li>• Direct-to-consumer sales channels growing rapidly</li>
                <li>• Premium quality commands 30% price premium</li>
              </ul>
            </div>
          </>
        )}

        {activeTab === 'competitors' && (
          <>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Competitor Analysis</h2>
              <AdvancedDataTable data={competitors} columns={competitorColumns} searchPlaceholder="Search competitors..." />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 mb-4">Your Competitive Position</h3>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-gray-600">Market Share</span><span className="font-bold text-emerald-600">12%</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Avg Price</span><span className="font-bold text-emerald-600">$4.70/lb</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Quality Rating</span><span className="font-bold text-emerald-600">4.8/5</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Customer Retention</span><span className="font-bold text-emerald-600">89%</span></div>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">💡 Competitive Advantages</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Certified organic for all major crops</li>
                  <li>• Shorter supply chain = fresher produce</li>
                  <li>• Sustainable farming practices</li>
                  <li>• Strong relationships with local buyers</li>
                </ul>
              </div>
            </div>
          </>
        )}

        {activeTab === 'forecast' && (
          <>
            <div className="grid grid-cols-3 gap-6">
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="text-sm text-gray-600 mb-2">Next Month Outlook</h3>
                <div className="text-3xl font-bold text-green-600">+8%</div>
                <div className="text-sm text-gray-500 mt-1">Price increase expected</div>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="text-sm text-gray-600 mb-2">Seasonal Peak</h3>
                <div className="text-3xl font-bold text-blue-600">Q2</div>
                <div className="text-sm text-gray-500 mt-1">Best selling period</div>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="text-sm text-gray-600 mb-2">Growth Potential</h3>
                <div className="text-3xl font-bold text-purple-600">High</div>
                <div className="text-sm text-gray-500 mt-1">Market expansion</div>
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">📊 2026 Market Forecast</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div>• <strong>Organic Produce:</strong> 30% market growth, increasing consumer preference</div>
                <div>• <strong>Premium Pricing:</strong> High-quality produce commanding 25-35% premium</div>
                <div>• <strong>Supply Chain:</strong> Direct-to-consumer channels gaining traction</div>
                <div>• <strong>Competition:</strong> Market consolidation expected, focus on quality over quantity</div>
              </div>
            </div>
          </>
        )}
      </div>
    </RoleBasedLayout>
  );
}
