'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import { getRoleTheme } from '@/config/roleThemes';
import {
  MapPinIcon,
  HomeIcon,
  BuildingOfficeIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface Address {
  id: string;
  label: string;
  type: 'Home' | 'Office' | 'Other';
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
  instructions?: string;
}

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

export default function DeliveryPreferencesPage() {
  const theme = getRoleTheme('CONSUMER');
  const user = { name: 'John Customer', email: 'john@example.com' };
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 'ADDR-001',
      label: 'Home',
      type: 'Home',
      name: 'John Customer',
      phone: '+1 (555) 123-4567',
      street: '123 Main Street, Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
      isDefault: true,
      instructions: 'Please ring the doorbell twice',
    },
    {
      id: 'ADDR-002',
      label: 'Office',
      type: 'Office',
      name: 'John Customer',
      phone: '+1 (555) 987-6543',
      street: '456 Business Ave, Suite 200',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      isDefault: false,
      instructions: 'Leave with reception desk',
    },
  ]);

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: 'TS-1', day: 'Monday', startTime: '08:00', endTime: '12:00', enabled: true },
    { id: 'TS-2', day: 'Tuesday', startTime: '08:00', endTime: '12:00', enabled: true },
    { id: 'TS-3', day: 'Wednesday', startTime: '08:00', endTime: '12:00', enabled: true },
    { id: 'TS-4', day: 'Thursday', startTime: '14:00', endTime: '18:00', enabled: true },
    { id: 'TS-5', day: 'Friday', startTime: '14:00', endTime: '18:00', enabled: true },
    { id: 'TS-6', day: 'Saturday', startTime: '10:00', endTime: '16:00', enabled: false },
    { id: 'TS-7', day: 'Sunday', startTime: '10:00', endTime: '16:00', enabled: false },
  ]);

  const setDefaultAddress = (id: string) => {
    setAddresses(addresses.map(addr => ({ ...addr, isDefault: addr.id === id })));
  };

  const deleteAddress = (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      setAddresses(addresses.filter(addr => addr.id !== id));
    }
  };

  const toggleTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.map(slot => (slot.id === id ? { ...slot, enabled: !slot.enabled } : slot)));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Home':
        return HomeIcon;
      case 'Office':
        return BuildingOfficeIcon;
      default:
        return MapPinIcon;
    }
  };

  const totalAddresses = addresses.length;
  const defaultAddress = addresses.find(a => a.isDefault);
  const enabledSlots = timeSlots.filter(s => s.enabled).length;

  return (
    <RoleBasedLayout role="CONSUMER" user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Delivery Preferences</h1>
          <button
            onClick={() => setShowAddressForm(!showAddressForm)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-bold text-white hover:shadow-lg"
          >
            <PlusIcon className="h-5 w-5" />
            Add Address
          </button>
        </div>

        {/* Stats */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Saved Addresses"
            value={totalAddresses}
            subtitle="Delivery locations"
            icon={MapPinIcon}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Default Address"
            value={defaultAddress?.label || 'None'}
            subtitle={defaultAddress?.city || 'Not set'}
            icon={HomeIcon}
            gradient="from-green-500 to-emerald-500"
          />
          <AdvancedStatCard
            title="Time Slots"
            value={enabledSlots}
            subtitle="Preferred delivery times"
            icon={ClockIcon}
            gradient="from-blue-500 to-cyan-500"
          />
          <AdvancedStatCard
            title="Total Deliveries"
            value="47"
            subtitle="All time"
            icon={CheckCircleIcon}
            gradient="from-orange-500 to-amber-500"
          />
        </StatCardsGrid>

        {/* Add Address Form */}
        {showAddressForm && (
          <div className="rounded-xl bg-white p-8 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Address</h2>
            <div className="space-y-4">
              {/* Address Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                <div className="grid grid-cols-3 gap-4">
                  {['Home', 'Office', 'Other'].map((type) => (
                    <button
                      key={type}
                      className="rounded-lg border-2 border-purple-300 p-4 hover:bg-purple-50"
                    >
                      <div className="flex flex-col items-center gap-2">
                        {type === 'Home' && <HomeIcon className="h-6 w-6 text-purple-600" />}
                        {type === 'Office' && <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />}
                        {type === 'Other' && <MapPinIcon className="h-6 w-6 text-purple-600" />}
                        <span className="font-medium">{type}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input type="text" placeholder="John Doe" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input type="tel" placeholder="+1 (555) 123-4567" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input type="text" placeholder="123 Main St, Apt 4B" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
              </div>

              {/* City, State, ZIP */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input type="text" placeholder="San Francisco" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input type="text" placeholder="CA" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <input type="text" placeholder="94102" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
                </div>
              </div>

              {/* Delivery Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Instructions (Optional)</label>
                <textarea
                  placeholder="E.g., Ring doorbell, leave at door, etc."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              {/* Default Address */}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="default" className="h-4 w-4 rounded text-purple-600" />
                <label htmlFor="default" className="text-sm font-medium text-gray-700">Set as default address</label>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button className="flex-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-3 font-bold text-white hover:shadow-lg">
                  Save Address
                </button>
                <button
                  onClick={() => setShowAddressForm(false)}
                  className="rounded-lg border-2 border-gray-300 px-8 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Saved Addresses */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>
          {addresses.map((address) => {
            const Icon = getTypeIcon(address.type);
            return (
              <div
                key={address.id}
                className={`rounded-xl bg-white p-6 shadow-lg ${address.isDefault ? 'border-2 border-purple-500' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-purple-100 p-3">
                      <Icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{address.label}</h3>
                        {address.isDefault && (
                          <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-bold text-white">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{address.name} • {address.phone}</p>
                      <p className="text-sm text-gray-600">{address.street}</p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} {address.zip}
                      </p>
                      {address.instructions && (
                        <p className="text-sm text-purple-600 mt-2">📝 {address.instructions}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!address.isDefault && (
                      <button
                        onClick={() => setDefaultAddress(address.id)}
                        className="rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-purple-500 hover:text-purple-600"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => setEditingAddress(address.id)}
                      className="rounded-lg border-2 border-gray-300 p-2 text-purple-600 hover:border-purple-500"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteAddress(address.id)}
                      className="rounded-lg border-2 border-gray-300 p-2 text-red-600 hover:border-red-500"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Delivery Time Preferences */}
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Preferred Delivery Times</h2>
          <p className="text-sm text-gray-600 mb-6">Select your preferred delivery time slots for each day</p>

          <div className="space-y-3">
            {timeSlots.map((slot) => (
              <div
                key={slot.id}
                className={`flex items-center justify-between rounded-lg border-2 p-4 ${
                  slot.enabled ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={slot.enabled}
                    onChange={() => toggleTimeSlot(slot.id)}
                    className="h-5 w-5 rounded text-purple-600"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{slot.day}</div>
                    <div className="text-sm text-gray-600">
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </div>
                </div>
                <ClockIcon className={`h-5 w-5 ${slot.enabled ? 'text-purple-600' : 'text-gray-400'}`} />
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 p-4">
            <p className="text-sm text-gray-700">
              💡 <strong>Tip:</strong> Enabling multiple time slots increases your chances of faster delivery!
            </p>
          </div>
        </div>

        {/* Special Instructions */}
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">General Delivery Instructions</h2>
          <textarea
            placeholder="Add any general instructions for all deliveries (e.g., gate code, parking instructions, etc.)"
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            defaultValue="Please call upon arrival. Gate code: #1234"
          />
          <button className="mt-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 font-bold text-white hover:shadow-lg">
            Save Instructions
          </button>
        </div>
      </div>
    </RoleBasedLayout>
  );
}
