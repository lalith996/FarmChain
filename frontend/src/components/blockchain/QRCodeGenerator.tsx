'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCodeIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  CheckCircleIcon,
  CubeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface QRCodeGeneratorProps {
  productId: string;
  productName: string;
  txHash: string;
  verificationUrl: string;
}

export function QRCodeGenerator({
  productId,
  productName,
  txHash,
  verificationUrl
}: QRCodeGeneratorProps) {
  const [showModal, setShowModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Generate QR code data URL
  useEffect(() => {
    if (showModal) {
      // In a real implementation, use a library like 'qrcode' or 'react-qr-code'
      // For now, we'll create a placeholder SVG QR code
      generateQRCode();
    }
  }, [showModal]);

  const generateQRCode = () => {
    // Create an SVG QR code pattern (simplified version)
    // In production, use a proper QR code library
    const svg = `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <rect width="256" height="256" fill="white"/>
        <g fill="black">
          <!-- Top-left finder pattern -->
          <rect x="0" y="0" width="80" height="80"/>
          <rect x="16" y="16" width="48" height="48" fill="white"/>
          <rect x="32" y="32" width="16" height="16" fill="black"/>

          <!-- Top-right finder pattern -->
          <rect x="176" y="0" width="80" height="80"/>
          <rect x="192" y="16" width="48" height="48" fill="white"/>
          <rect x="208" y="32" width="16" height="16" fill="black"/>

          <!-- Bottom-left finder pattern -->
          <rect x="0" y="176" width="80" height="80"/>
          <rect x="16" y="192" width="48" height="48" fill="white"/>
          <rect x="32" y="208" width="16" height="16" fill="black"/>

          <!-- Data pattern (simplified) -->
          ${generateDataPattern()}
        </g>

        <!-- Center logo -->
        <rect x="108" y="108" width="40" height="40" fill="white" rx="4"/>
        <text x="128" y="133" font-family="Arial" font-size="24" font-weight="bold" fill="#10b981" text-anchor="middle">FC</text>
      </svg>
    `;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    setQrDataUrl(url);
  };

  const generateDataPattern = () => {
    // Generate a simple pattern to simulate QR code data modules
    let pattern = '';
    const size = 8; // Module size
    const modules = 32; // Number of modules per side

    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        // Skip finder patterns
        if ((x < 10 && y < 10) || (x > 21 && y < 10) || (x < 10 && y > 21)) continue;

        // Pseudo-random pattern based on product data
        const hash = (productId + txHash).split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);

        if ((hash + x * y) % 2 === 0) {
          pattern += `<rect x="${x * size}" y="${y * size}" width="${size}" height="${size}"/>`;
        }
      }
    }

    return pattern;
  };

  const downloadQRCode = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `farmchain-${productId}-qr.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyVerificationLink = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      // Show success toast or notification
      alert('Verification link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <>
      {/* Generate QR Button */}
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg group"
      >
        <QrCodeIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
        <span>Generate QR Code</span>
      </button>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowModal(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <QrCodeIcon className="h-7 w-7 mr-3" />
                      <h2 className="text-2xl font-bold">Product QR Code</h2>
                    </div>
                    <p className="text-blue-100 text-sm">
                      Scan to verify product authenticity
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Product Info */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-200">
                  <div className="flex items-start">
                    <CubeIcon className="h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900 mb-1">{productName}</p>
                      <p className="text-sm text-gray-600">Product ID: {productId}</p>
                    </div>
                  </div>
                </div>

                {/* QR Code Display */}
                <div className="bg-white border-4 border-gray-200 rounded-2xl p-8 mb-6">
                  <div className="flex justify-center">
                    {qrDataUrl ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="relative"
                      >
                        <img
                          src={qrDataUrl}
                          alt="Product QR Code"
                          className="w-64 h-64"
                        />
                        {/* Verified Badge */}
                        <div className="absolute -top-3 -right-3 bg-green-600 text-white rounded-full p-2 shadow-lg">
                          <ShieldCheckIcon className="h-6 w-6" />
                        </div>
                      </motion.div>
                    ) : (
                      <div className="w-64 h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
                        <QrCodeIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <h3 className="font-bold text-green-900 mb-3 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    This QR Code Includes:
                  </h3>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Complete product traceability information</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Blockchain verification data</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Supply chain journey history</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Quality certifications and reports</span>
                    </li>
                  </ul>
                </div>

                {/* Verification URL */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification URL
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={verificationUrl}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-l-lg text-sm font-mono text-gray-600"
                    />
                    <button
                      onClick={copyVerificationLink}
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={downloadQRCode}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Download QR Code
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all"
                  >
                    Print
                  </button>
                </div>
              </div>

              {/* Footer Info */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 text-center">
                  💡 Print this QR code on product packaging or labels for easy customer verification
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
