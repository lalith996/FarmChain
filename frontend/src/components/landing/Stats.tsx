'use client';

import { Counter } from './Counter';

const stats = [
  { value: 10000, suffix: '+', label: 'Farmers Connected', prefix: '' },
  { value: 50000, suffix: '+', label: 'Crops Tracked', prefix: '' },
  { value: 99, suffix: '%', label: 'Transparency', prefix: '' },
  { value: 30, suffix: '%', label: 'Cost Reduction', prefix: '' },
];

export function Stats() {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-5xl font-bold text-center mb-4 text-gray-800">
          Impact by Numbers
        </h2>
        <p className="text-xl text-center text-gray-600 mb-16">
          Real results from real farmers
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-8 bg-green-50 rounded-2xl">
              <Counter 
                end={stat.value} 
                suffix={stat.suffix}
                prefix={stat.prefix}
                duration={2.5}
              />
              <p className="text-xl text-gray-700 mt-4 font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
