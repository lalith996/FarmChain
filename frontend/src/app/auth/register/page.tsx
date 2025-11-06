'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useSignMessage } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  UserPlusIcon,
  ShieldCheckIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { authAPI, handleWeb3Error } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

type UserRole = 'farmer' | 'distributor' | 'retailer' | 'consumer';

export default function RegisterPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { login } = useAuthStore();

  const [step, setStep] = useState<'wallet' | 'role' | 'profile'>('wallet');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    role: '' as UserRole | '',
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
  });

  const handleRoleSelect = (role: UserRole) => {
    setFormData({ ...formData, role });
    setStep('profile');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!formData.role) {
      toast.error('Please select a role');
      return;
    }

    try {
      setLoading(true);

      // Step 1: Request nonce from backend
      const nonceResponse = await authAPI.requestNonce(address);
      const nonce = nonceResponse.nonce;

      // Step 2: Sign the message with wallet
      const message = `Welcome to FarmChain!\n\nPlease sign this message to verify your wallet ownership.\n\nWallet: ${address}\nNonce: ${nonce}`;
      
      const signature = await signMessageAsync({ message });

      // Step 3: Register user with signature
      const registerData = {
        walletAddress: address,
        signature,
        message,
        role: formData.role.toUpperCase(),
        profile: {
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          location: {
            address: formData.address || undefined,
            city: formData.city,
            state: formData.state,
            country: formData.country,
          },
        },
      };

      const response = await authAPI.register(registerData);

      // Step 4: Store auth data
      login(response.data.user, response.data.token);

      toast.success('Registration successful! Welcome to FarmChain 🎉');
      
      // Redirect based on role
      if (formData.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      // Use handleWeb3Error to properly extract error message from Web3/Wagmi/API errors
      const errorMessage = handleWeb3Error(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: 'farmer' as UserRole,
      name: 'Farmer',
      description: 'I grow and sell agricultural products',
      icon: '🌾',
      features: ['Register products', 'Manage inventory', 'Track sales', 'Receive payments'],
    },
    {
      id: 'distributor' as UserRole,
      name: 'Distributor',
      description: 'I distribute products from farmers to retailers',
      icon: '🚚',
      features: ['Purchase in bulk', 'Manage logistics', 'Track shipments', 'Resell products'],
    },
    {
      id: 'retailer' as UserRole,
      name: 'Retailer',
      description: 'I sell products to end consumers',
      icon: '🏪',
      features: ['Purchase products', 'Manage store', 'Track inventory', 'Sell to consumers'],
    },
    {
      id: 'consumer' as UserRole,
      name: 'Consumer',
      description: 'I buy fresh products for personal use',
      icon: '🛒',
      features: ['Browse products', 'Place orders', 'Track delivery', 'Rate products'],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <UserPlusIcon className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Join FarmChain</h1>
          <p className="text-lg text-gray-600">
            Create your account and start trading on the blockchain
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step === 'wallet' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'wallet' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Connect Wallet</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center ${step === 'role' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'role' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Select Role</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center ${step === 'profile' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'profile' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Complete Profile</span>
            </div>
          </div>
        </div>

        {/* Step 1: Connect Wallet */}
        {step === 'wallet' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <ShieldCheckIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 mb-8">
                To get started, please connect your Web3 wallet. We support MetaMask and other popular wallets.
              </p>

              {!isConnected ? (
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800 mb-2">✓ Wallet Connected</p>
                    <p className="text-xs text-green-600 font-mono">{address}</p>
                  </div>
                  <button
                    onClick={() => setStep('role')}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Continue to Role Selection
                  </button>
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Role Selection */}
        {step === 'role' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Select Your Role
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              Choose the role that best describes how you&apos;ll use FarmChain
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className="text-left border-2 border-gray-200 rounded-lg p-6 hover:border-green-500 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{role.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-green-600">
                        {role.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                      <ul className="space-y-1">
                        {role.features.map((feature, idx) => (
                          <li key={idx} className="text-xs text-gray-500 flex items-center">
                            <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setStep('wallet')}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                ← Back to Wallet Connection
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Profile Form */}
        {step === 'profile' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Complete Your Profile
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              Tell us a bit about yourself to complete registration
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selected Role Display */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 mb-1">Selected Role:</p>
                <p className="font-medium text-green-900 capitalize">{formData.role}</p>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+91 1234567890"
                  />
                </div>
              </div>

              {/* Location Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center mb-4">
                  <MapPinIcon className="h-5 w-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Location Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Address */}
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Street address"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="City"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      id="state"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="State"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      id="country"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setStep('role')}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
