'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  IdentificationIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

type DocumentType = 'identity' | 'address' | 'selfie';
type KycStatus = 'pending' | 'approved' | 'rejected';

interface UploadedDocument {
  type: DocumentType;
  file: File | null;
  preview: string | null;
  status: 'idle' | 'uploading' | 'uploaded';
}

export default function KYCVerificationPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  const [documents, setDocuments] = useState<UploadedDocument[]>([
    { type: 'identity', file: null, preview: null, status: 'idle' },
    { type: 'address', file: null, preview: null, status: 'idle' },
    { type: 'selfie', file: null, preview: null, status: 'idle' },
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Redirect if already verified
    if (user?.verification.isVerified && user.verification.kycStatus === 'approved') {
      toast.success('Your account is already verified!');
      router.push('/profile');
    }
  }, [isAuthenticated, user, router]);

  const getDocumentTitle = (type: DocumentType) => {
    switch (type) {
      case 'identity':
        return 'Identity Proof';
      case 'address':
        return 'Address Proof';
      case 'selfie':
        return 'Selfie with ID';
      default:
        return 'Document';
    }
  };

  const getDocumentDescription = (type: DocumentType) => {
    switch (type) {
      case 'identity':
        return 'Aadhaar Card, PAN Card, Passport, or Driving License';
      case 'address':
        return 'Utility Bill, Bank Statement, or Rental Agreement';
      case 'selfie':
        return 'Clear photo of yourself holding your ID';
      default:
        return '';
    }
  };

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case 'identity':
        return <IdentificationIcon className="w-8 h-8" />;
      case 'address':
        return <DocumentTextIcon className="w-8 h-8" />;
      case 'selfie':
        return <CameraIcon className="w-8 h-8" />;
      default:
        return <DocumentTextIcon className="w-8 h-8" />;
    }
  };

  const handleFileSelect = (type: DocumentType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Please select an image or PDF file');
      return;
    }

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.type === type
              ? { ...doc, file, preview: reader.result as string, status: 'uploaded' }
              : doc
          )
        );
      };
      reader.readAsDataURL(file);
    } else {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.type === type ? { ...doc, file, preview: null, status: 'uploaded' } : doc
        )
      );
    }
  };

  const handleRemoveFile = (type: DocumentType) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.type === type
          ? { ...doc, file: null, preview: null, status: 'idle' }
          : doc
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all documents are uploaded
    const allUploaded = documents.every((doc) => doc.file !== null);
    if (!allUploaded) {
      toast.error('Please upload all required documents');
      return;
    }

    try {
      setSubmitting(true);

      // Create FormData
      const formData = new FormData();
      documents.forEach((doc) => {
        if (doc.file) {
          formData.append(doc.type, doc.file);
        }
      });

      // In a real app, call API to submit KYC
      // await userAPI.submitKYC(formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success('KYC documents submitted successfully! We will review them shortly.');
      router.push('/profile');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to submit KYC documents');
    } finally {
      setSubmitting(false);
    }
  };

  const getKycStatusInfo = (status: KycStatus) => {
    switch (status) {
      case 'pending':
        return {
          icon: <ClockIcon className="w-12 h-12 text-yellow-600" />,
          title: 'Verification Pending',
          description: 'Your KYC documents are under review. This usually takes 1-2 business days.',
          color: 'bg-yellow-50 border-yellow-200',
        };
      case 'approved':
        return {
          icon: <CheckCircleIcon className="w-12 h-12 text-green-600" />,
          title: 'Verification Approved',
          description: 'Your account has been successfully verified!',
          color: 'bg-green-50 border-green-200',
        };
      case 'rejected':
        return {
          icon: <XCircleIcon className="w-12 h-12 text-red-600" />,
          title: 'Verification Rejected',
          description: 'Your KYC submission was rejected. Please upload valid documents and try again.',
          color: 'bg-red-50 border-red-200',
        };
    }
  };

  if (!user) return null;

  // Show current KYC status if already submitted
  if (user.verification.kycStatus !== 'pending' && user.verification.kycStatus !== 'rejected') {
    const statusInfo = getKycStatusInfo(user.verification.kycStatus);
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/profile"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Profile
          </Link>

          <div className={`${statusInfo.color} border rounded-lg p-8 text-center`}>
            <div className="flex justify-center mb-4">{statusInfo.icon}</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{statusInfo.title}</h2>
            <p className="text-gray-700">{statusInfo.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/profile"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">KYC Verification</h1>
          <p className="text-gray-600 mt-2">
            Complete your identity verification to unlock all platform features
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <CheckCircleIcon className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Why verify your account?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Increase trust with other users</li>
                <li>• Access higher transaction limits</li>
                <li>• Participate in dispute resolution</li>
                <li>• Get verified badge on your profile</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Upload Sections */}
          {documents.map((doc) => (
            <div key={doc.type} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="text-gray-600 mr-3">{getDocumentIcon(doc.type)}</div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {getDocumentTitle(doc.type)}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {getDocumentDescription(doc.type)}
                    </p>
                  </div>
                </div>
                {doc.status === 'uploaded' && (
                  <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
                )}
              </div>

              {doc.status === 'idle' || doc.status === 'uploading' ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
                  <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <label
                    htmlFor={`file-${doc.type}`}
                    className="cursor-pointer inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Choose File
                  </label>
                  <input
                    id={`file-${doc.type}`}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileSelect(doc.type, e)}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500 mt-3">
                    JPG, PNG, or PDF. Max size 10MB.
                  </p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {doc.preview ? (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                          <Image
                            src={doc.preview}
                            alt={getDocumentTitle(doc.type)}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{doc.file?.name}</p>
                        <p className="text-sm text-gray-600">
                          {doc.file ? (doc.file.size / 1024).toFixed(2) : 0} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(doc.type)}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Guidelines */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-3">Document Guidelines</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Documents must be clear and all text must be readable</li>
              <li>• Photos should be well-lit and in focus</li>
              <li>• All four corners of the document must be visible</li>
              <li>• No black and white photocopies or scanned documents</li>
              <li>• Documents must be valid and not expired</li>
              <li>• Ensure your face is clearly visible in the selfie</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/profile"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || documents.some((doc) => doc.file === null)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
