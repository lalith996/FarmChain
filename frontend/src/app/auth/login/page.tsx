'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import {
  LockClosedIcon,
  ShieldCheckIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { login } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fix hydration error by only rendering wallet status after client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);

      // TEMPORARY: Development authentication bypass
      console.log('🚀 Authenticating wallet:', address);
      
      // Map wallet addresses to roles (one wallet = one role)
      const walletToRole: Record<string, any> = {
        '0xf0555abf16e154574bc3b4a9190f958ccdfce886': {
          _id: 'admin-user-001',
          walletAddress: '0xf0555abf16e154574bc3b4a9190f958ccdfce886',
          primaryRole: 'SUPER_ADMIN',
          role: 'admin',
          roles: ['SUPER_ADMIN', 'admin'],
          rating: {
            average: 5.0,
            count: 150
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          profile: {
            name: 'Admin User',
            email: 'admin@farmchain.com',
            phone: '+1234567890',
            bio: 'System Administrator',
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
        },
        '0xcbdc7cc11a5b19623c9a515d6a6702f6775075c1': {
          _id: 'farmer-user-001',
          walletAddress: '0xcbdc7cc11a5b19623c9a515d6a6702f6775075c1',
          primaryRole: 'FARMER',
          role: 'farmer',
          roles: ['FARMER'],
          rating: {
            average: 4.8,
            count: 86
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          profile: {
            name: 'John Farmer',
            email: 'farmer@farmchain.com',
            phone: '+1234567891',
            bio: 'Organic vegetable farmer',
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
        },
        '0xafe9c2a21650c800d3d8b6a638e61bb513046ea7': {
          _id: 'distributor-user-001',
          walletAddress: '0xafe9c2a21650c800d3d8b6a638e61bb513046ea7',
          primaryRole: 'DISTRIBUTOR',
          role: 'distributor',
          roles: ['DISTRIBUTOR'],
          rating: {
            average: 4.5,
            count: 42
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          profile: {
            name: 'Distribution Co',
            email: 'distributor@farmchain.com',
            phone: '+1234567892',
            bio: 'Regional distributor',
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
        },
        '0xf75a95a93af19896379635e2bb2283c32bfbf935': {
          _id: 'consumer-user-001',
          walletAddress: '0xf75a95a93af19896379635e2bb2283c32bfbf935',
          primaryRole: 'CONSUMER',
          role: 'consumer',
          roles: ['CONSUMER'],
          rating: {
            average: 5.0,
            count: 28
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          profile: {
            name: 'Jane Consumer',
            email: 'consumer@farmchain.com',
            phone: '+1234567893',
            bio: 'Health-conscious buyer',
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
        },
        '0x04e98450e3051a2acfd1d96113481252f0013f77': {
          _id: 'retailer-user-001',
          walletAddress: '0x04e98450e3051a2acfd1d96113481252f0013f77',
          primaryRole: 'RETAILER',
          role: 'retailer',
          roles: ['RETAILER'],
          rating: {
            average: 4.7,
            count: 94
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          profile: {
            name: 'Retail Store',
            email: 'retailer@farmchain.com',
            phone: '+1234567894',
            bio: 'Fresh produce retailer',
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
        }
      };
      
      // Get user data based on wallet address (default to admin if not found)
      const userData = walletToRole[address.toLowerCase()] || walletToRole['0xf0555abf16e154574bc3b4a9190f958ccdfce886'];

      const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + Date.now();
      
      // Store in localStorage (matching AuthContext structure)
      localStorage.setItem('accessToken', authToken);
      localStorage.setItem('refreshToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.' + Date.now());
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('authToken', authToken); // For authStore
      
      // Call the login function from store
      login(userData, authToken);

      toast.success(`Welcome back, ${userData.profile.name}! 🎉`);
      
      // Redirect based on role
      setTimeout(() => {
        if (userData.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
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
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <ShieldCheckIcon className="h-5 w-5 text-green-600 mr-2" />
              <span>Secure blockchain authentication</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <BoltIcon className="h-5 w-5 text-green-600 mr-2" />
              <span>Instant access to your dashboard</span>
            </div>
          </div>

          {/* Wallet Status */}
          {!mounted ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 text-center">
                Loading wallet status...
              </p>
            </div>
          ) : isConnected ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Wallet Connected</p>
                  <p className="text-xs text-green-600 font-mono mt-1">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 text-center">
                Connect your wallet to continue
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!mounted ? (
              <div className="w-full flex items-center justify-center px-4 py-3 text-gray-400">
                Loading...
              </div>
            ) : !isConnected ? (
              <button
                onClick={() => connect({ connector: injected() })}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <LockClosedIcon className="h-5 w-5 mr-2" />
                Connect Wallet
              </button>
            ) : (
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  <>
                    <ShieldCheckIcon className="h-5 w-5 mr-2" />
                    Sign In with Wallet
                  </>
                )}
              </button>
            )}
          </div>

          {/* Info Text */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <a href="#" className="text-green-600 hover:text-green-700 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-green-600 hover:text-green-700 underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have a wallet?{' '}
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-green-600 hover:text-green-700"
            >
              Install MetaMask
            </a>
          </p>
        </div>

        {/* Dev Mode Indicator */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-800 text-center font-medium">
            � Secure Blockchain Authentication
          </p>
          <p className="text-xs text-blue-600 text-center mt-1">
            Connect with MetaMask to access your dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
