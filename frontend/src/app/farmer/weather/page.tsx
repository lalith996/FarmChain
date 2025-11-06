'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import { getRoleTheme } from '@/config/roleThemes';
import { CloudIcon, SunIcon, BeakerIcon, WrenchScrewdriverIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Line, Bar, Radar } from 'react-chartjs-2';

interface WeatherForecast {
  day: string;
  temp: { high: number; low: number };
  precipitation: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
}

interface SoilReading {
  field: string;
  moisture: number;
  temperature: number;
  pH: number;
  ec: number; // electrical conductivity
  timestamp: string;
}

interface Alert {
  type: 'Weather' | 'Soil' | 'Irrigation';
  severity: 'High' | 'Medium' | 'Low';
  message: string;
  time: string;
}

export default function WeatherSoilPage() {
  const theme = getRoleTheme('FARMER');
  const user = { name: 'John Farmer', email: 'john.farmer@example.com' };
  const [activeTab, setActiveTab] = useState<'weather' | 'soil' | 'alerts' | 'recommendations'>('weather');

  const forecast: WeatherForecast[] = [
    { day: 'Today', temp: { high: 72, low: 58 }, precipitation: 10, humidity: 65, windSpeed: 8, condition: 'Partly Cloudy', icon: '⛅' },
    { day: 'Tomorrow', temp: { high: 75, low: 60 }, precipitation: 5, humidity: 60, windSpeed: 6, condition: 'Sunny', icon: '☀️' },
    { day: 'Wed', temp: { high: 68, low: 55 }, precipitation: 40, humidity: 75, windSpeed: 12, condition: 'Rain', icon: '🌧️' },
    { day: 'Thu', temp: { high: 70, low: 57 }, precipitation: 20, humidity: 70, windSpeed: 10, condition: 'Cloudy', icon: '☁️' },
    { day: 'Fri', temp: { high: 74, low: 59 }, precipitation: 0, humidity: 55, windSpeed: 7, condition: 'Sunny', icon: '☀️' },
    { day: 'Sat', temp: { high: 76, low: 61 }, precipitation: 0, humidity: 52, windSpeed: 5, condition: 'Clear', icon: '🌤️' },
    { day: 'Sun', temp: { high: 78, low: 63 }, precipitation: 0, humidity: 50, windSpeed: 6, condition: 'Sunny', icon: '☀️' },
  ];

  const soilReadings: SoilReading[] = [
    { field: 'Field A', moisture: 68, temperature: 65, pH: 6.8, ec: 1.2, timestamp: '2025-11-06 09:00' },
    { field: 'Field B', moisture: 55, temperature: 67, pH: 6.5, ec: 1.5, timestamp: '2025-11-06 09:00' },
    { field: 'Field C', moisture: 72, temperature: 64, pH: 7.0, ec: 1.0, timestamp: '2025-11-06 09:00' },
    { field: 'Field D', moisture: 45, temperature: 68, pH: 6.2, ec: 1.8, timestamp: '2025-11-06 09:00' },
  ];

  const alerts: Alert[] = [
    { type: 'Weather', severity: 'High', message: 'Heavy rain expected Wednesday - postpone spraying', time: '2 hours ago' },
    { type: 'Soil', severity: 'Medium', message: 'Field D moisture dropping below optimal - check irrigation', time: '4 hours ago' },
    { type: 'Irrigation', severity: 'Low', message: 'Scheduled irrigation for Field B at 6 PM', time: '8 hours ago' },
  ];

  const tempData = {
    labels: ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'High',
        data: forecast.map(f => f.temp.high),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Low',
        data: forecast.map(f => f.temp.low),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const precipData = {
    labels: forecast.map(f => f.day),
    datasets: [{
      label: 'Precipitation (%)',
      data: forecast.map(f => f.precipitation),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
    }],
  };

  const soilRadarData = {
    labels: ['Moisture', 'Temperature', 'pH', 'EC'],
    datasets: soilReadings.map((reading, idx) => ({
      label: reading.field,
      data: [reading.moisture, reading.temperature, reading.pH * 10, reading.ec * 10],
      backgroundColor: [
        'rgba(16, 185, 129, 0.2)',
        'rgba(59, 130, 246, 0.2)',
        'rgba(245, 158, 11, 0.2)',
        'rgba(139, 92, 246, 0.2)',
      ][idx],
      borderColor: [
        'rgb(16, 185, 129)',
        'rgb(59, 130, 246)',
        'rgb(245, 158, 11)',
        'rgb(139, 92, 246)',
      ][idx],
      borderWidth: 2,
    })),
  };

  const avgTemp = Math.round((forecast[0].temp.high + forecast[0].temp.low) / 2);
  const avgPrecip = Math.round(forecast.reduce((sum, f) => sum + f.precipitation, 0) / 7);
  const avgSoilMoisture = Math.round(soilReadings.reduce((sum, r) => sum + r.moisture, 0) / soilReadings.length);
  const criticalAlerts = alerts.filter(a => a.severity === 'High').length;

  return (
    <RoleBasedLayout role="FARMER" user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Weather & Soil Analytics</h1>

        <StatCardsGrid>
          <AdvancedStatCard title="Current Temp" value={`${avgTemp}°F`} subtitle={forecast[0].condition} icon={SunIcon} gradient={theme.gradients.primary} />
          <AdvancedStatCard title="Weekly Rain" value={`${avgPrecip}%`} subtitle="Precipitation chance" icon={CloudIcon} gradient="from-blue-500 to-cyan-500" />
          <AdvancedStatCard title="Soil Moisture" value={`${avgSoilMoisture}%`} subtitle="Average across fields" icon={BeakerIcon} gradient="from-green-500 to-emerald-500" />
          <AdvancedStatCard title="Critical Alerts" value={criticalAlerts} subtitle="Requires attention" icon={ExclamationTriangleIcon} gradient="from-red-500 to-orange-500" />
        </StatCardsGrid>

        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'weather', label: 'Weather Forecast' },
            { id: 'soil', label: 'Soil Analytics', count: soilReadings.length },
            { id: 'alerts', label: 'Alerts', count: alerts.length },
            { id: 'recommendations', label: 'Recommendations' },
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

        {activeTab === 'weather' && (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
              {forecast.map((day) => (
                <div key={day.day} className="rounded-xl bg-white p-4 shadow-lg text-center">
                  <div className="font-semibold text-gray-900 mb-2">{day.day}</div>
                  <div className="text-4xl mb-2">{day.icon}</div>
                  <div className="text-sm text-gray-600 mb-1">{day.condition}</div>
                  <div className="font-bold text-gray-900">{day.temp.high}° / {day.temp.low}°</div>
                  <div className="text-xs text-blue-600 mt-2">💧 {day.precipitation}%</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Temperature Forecast</h2>
                <Line data={tempData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
              </div>

              <div className="rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Precipitation Forecast</h2>
                <Bar data={precipData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 p-6">
              <h3 className="font-bold text-gray-900 mb-2">🌤️ Weather Advisory</h3>
              <p className="text-sm text-gray-700">Heavy rain expected Wednesday (40% chance). Consider postponing spraying operations and checking irrigation systems. Optimal planting conditions return Thursday-Sunday.</p>
            </div>
          </>
        )}

        {activeTab === 'soil' && (
          <>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Soil Conditions Comparison</h2>
              <Radar
                data={soilRadarData}
                options={{
                  responsive: true,
                  plugins: { legend: { position: 'top' } },
                  scales: { r: { beginAtZero: true, max: 100 } },
                }}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {soilReadings.map((reading) => (
                <div key={reading.field} className="rounded-xl bg-white p-6 shadow-lg">
                  <h3 className="font-bold text-gray-900 text-lg mb-4">{reading.field}</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Soil Moisture</span>
                        <span className="font-semibold">{reading.moisture}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${reading.moisture >= 60 ? 'bg-green-500' : reading.moisture >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${reading.moisture}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Temperature</span><span className="font-semibold">{reading.temperature}°F</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-600">pH Level</span><span className="font-semibold">{reading.pH}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-600">EC (mS/cm)</span><span className="font-semibold">{reading.ec}</span></div>
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">Updated: {reading.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-6">
              <h3 className="font-bold text-gray-900 mb-2">🌱 Soil Health Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Optimal soil moisture: 60-80% for most crops</li>
                <li>• pH levels should be 6.0-7.0 for vegetables</li>
                <li>• EC indicates nutrient availability and salt levels</li>
                <li>• Monitor daily for best crop performance</li>
              </ul>
            </div>
          </>
        )}

        {activeTab === 'alerts' && (
          <>
            <div className="space-y-4">
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl p-6 shadow-lg ${
                    alert.severity === 'High'
                      ? 'bg-red-50 border-2 border-red-300'
                      : alert.severity === 'Medium'
                      ? 'bg-yellow-50 border-2 border-yellow-300'
                      : 'bg-blue-50 border-2 border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-full p-3 ${
                          alert.severity === 'High'
                            ? 'bg-red-200'
                            : alert.severity === 'Medium'
                            ? 'bg-yellow-200'
                            : 'bg-blue-200'
                        }`}
                      >
                        {alert.type === 'Weather' && <CloudIcon className="h-6 w-6 text-gray-700" />}
                        {alert.type === 'Soil' && <BeakerIcon className="h-6 w-6 text-gray-700" />}
                        {alert.type === 'Irrigation' && <WrenchScrewdriverIcon className="h-6 w-6 text-gray-700" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{alert.type} Alert</span>
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                              alert.severity === 'High'
                                ? 'bg-red-200 text-red-800'
                                : alert.severity === 'Medium'
                                ? 'bg-yellow-200 text-yellow-800'
                                : 'bg-blue-200 text-blue-800'
                            }`}
                          >
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-gray-700">{alert.message}</p>
                        <p className="text-sm text-gray-500 mt-2">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'recommendations' && (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 mb-4">Today's Recommendations</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-xl">✓</span>
                    <span className="text-sm text-gray-700">Optimal conditions for fertilizer application in Field A and C</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-xl">✓</span>
                    <span className="text-sm text-gray-700">Irrigation recommended for Field D - moisture below 50%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 text-xl">⚠</span>
                    <span className="text-sm text-gray-700">Postpone spraying operations - rain expected Wednesday</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-xl">✓</span>
                    <span className="text-sm text-gray-700">Good conditions for planting Thursday through Sunday</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">🔬 Optimization Tips</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Monitor soil moisture twice daily during hot periods</li>
                  <li>• Adjust irrigation schedules based on 7-day forecast</li>
                  <li>• Test soil pH monthly for optimal nutrient uptake</li>
                  <li>• Use weather data to time fertilizer applications</li>
                  <li>• Schedule harvests during dry periods when possible</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </RoleBasedLayout>
  );
}
