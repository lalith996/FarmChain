'use client';

import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  filters?: {
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
  placeholder?: string;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  onSearch,
  filters,
  placeholder = 'Search...',
}: FilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 absolute left-4 top-3.5" />
        <button
          onClick={onSearch}
          className="absolute right-2 top-2 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
        >
          Search
        </button>
      </div>

      {/* Filters */}
      {filters && filters.length > 0 && (
        <div className="flex items-center space-x-4 overflow-x-auto pb-2">
          <FunnelIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
          {filters.map((filter) => (
            <div key={filter.label} className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                {filter.label}:
              </label>
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
