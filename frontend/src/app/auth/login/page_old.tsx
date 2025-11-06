'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAccount, useSignMessage } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  LockClosedIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { login } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);

      // TEMPORARY: Fake login bypass for development
      console.log('� Using fake login bypass for wallet:', address);
      
      // Create fake user data matching your SUPER_ADMIN account
      const fakeUser = {
        _id: '690bf7f0da7b025f8828b7fd',
        walletAddress: address.toLowerCase(),
        primaryRole: 'SUPER_ADMIN',
        role: 'admin', // For admin page access check
        roles: ['SUPER_ADMIN', 'admin'],
        rating: 5,
        isActive: true,
        createdAt: new Date().toISOString(),
        profile: {
          name: 'lalithmachavarapu',
          email: 'lalithmachavarapu5@gmail.com',
          phone: '',
          bio: '',
          avatar: ''
        },
        verification: {
          isVerified: true,
          kycStatus: 'approved'
        },
        status: {
          isActive: true,
          isSuspended: false
        }
      } as any;

      const fakeToken = 'fake-jwt-token-' + Date.now();
      
      // Store in localStorage (matching AuthContext structure)
      localStorage.setItem('accessToken', fakeToken);
      localStorage.setItem('refreshToken', 'fake-refresh-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify(fakeUser));
      localStorage.setItem('authToken', fakeToken); // For authStore
      
      // Call the login function from store
      login(fakeUser, fakeToken);

      toast.success(`Welcome back, ${fakeUser.profile.name}! 🎉 (Dev Mode - Fake Auth)`);
      
      // Redirect to admin panel for SUPER_ADMIN
      setTimeout(() => {
        router.push('/admin');
      }, 500);
      
    } catch (error: unknown) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <LockClosedIcon className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-lg text-gray-600">
            Sign in to your FarmChain account
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ShieldCheckIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">Secure Wallet Authentication</h3>
                  <p className="text-sm text-blue-800">
                    Connect your wallet and sign a message to verify your identity. 
                    No password needed - your wallet is your key.
                  </p>
                </div>
              </div>
            </div>

            {/* Wallet Connection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Connect Your Wallet
              </label>
              
              {!isConnected ? (
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Connected Wallet Display */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800 font-medium mb-2">
                      ✓ Wallet Connected
                    </p>
                    <p className="text-xs text-green-600 font-mono break-all">
                      {address}
                    </p>
                  </div>

                  {/* Sign In Button */}
                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In with Wallet</span>
                        <ArrowRightIcon className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* How it works */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">How it works:</h3>
              <ol className="space-y-2">
                <li className="flex items-start text-sm text-gray-600">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                    1
                  </span>
                  <span>Connect your Web3 wallet (MetaMask, etc.)</span>
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                    2
                  </span>
                  <span>Sign a message to prove ownership</span>
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                    3
                  </span>
                  <span>Access your dashboard securely</span>
                </li>
              </ol>
            </div>

            {/* Register Link */}
            <div className="border-t border-gray-200 pt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  href="/auth/register"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Create Account
                </Link>
              </p>
            </div>

            {/* Back to Home */}
            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            🔒 Your wallet signature is used for secure authentication only. 
            We never have access to your private keys.
          </p>
        </div>
      </div>
    </div>
  );
}
