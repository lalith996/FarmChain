'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { verificationAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Document {
  type: string;
  file: File | null;
  ipfsHash: string;
  fileName: string;
  fileSize: number;
}

interface BusinessDetails {
  businessName: string;
  businessType: string;
  registrationNumber: string;
  taxId: string;
}

interface VerificationStatus {
  kycStatus: string;
  verificationLevel: number;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  documentIssues?: Array<{
    documentType: string;
    issue: string;
  }>;
}

const DOCUMENT_TYPES = [
  { value: 'government_id', label: 'Government ID' },
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'utility_bill', label: 'Utility Bill' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'business_license', label: 'Business License' },
  { value: 'tax_id', label: 'Tax ID Document' },
];

const BUSINESS_TYPES = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llc', label: 'Limited Liability Company (LLC)' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'cooperative', label: 'Cooperative' },
];

export const KYCSubmissionForm: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingToIPFS, setUploadingToIPFS] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  
  const [documents, setDocuments] = useState<Document[]>([
    { type: '', file: null, ipfsHash: '', fileName: '', fileSize: 0 }
  ]);

  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
    businessName: '',
    businessType: '',
    registrationNumber: '',
    taxId: '',
  });

  const requiresBusinessDetails = user?.primaryRole === 'DISTRIBUTOR' || user?.primaryRole === 'RETAILER';

  // Fetch current verification status on mount
  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const response = await verificationAPI.getVerificationStatus();
      if (response.data.success) {
        setVerificationStatus(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
    }
  };

  const addDocument = () => {
    setDocuments([...documents, { type: '', file: null, ipfsHash: '', fileName: '', fileSize: 0 }]);
  };

  const removeDocument = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index);
    setDocuments(newDocuments);
  };

  const handleDocumentTypeChange = (index: number, type: string) => {
    const newDocuments = [...documents];
    newDocuments[index].type = type;
    setDocuments(newDocuments);
  };

  const handleFileChange = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and PDF files are allowed');
      return;
    }

    const newDocuments = [...documents];
    newDocuments[index].file = file;
    newDocuments[index].fileName = file.name;
    newDocuments[index].fileSize = file.size;
    setDocuments(newDocuments);

    // Upload to IPFS
    await uploadToIPFS(index, file);
  };

  const uploadToIPFS = async (index: number, file: File) => {
    setUploadingToIPFS(true);
    try {
      // TODO: Replace with actual IPFS upload logic
      // For now, simulate IPFS upload
      const formData = new FormData();
      formData.append('file', file);

      // Simulate API call to backend IPFS proxy
      // const response = await axios.post('/api/v1/ipfs/upload', formData);
      // const ipfsHash = response.data.ipfsHash;

      // Simulated IPFS hash (remove this in production)
      const simulatedHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      const newDocuments = [...documents];
      newDocuments[index].ipfsHash = simulatedHash;
      setDocuments(newDocuments);

      toast.success('File uploaded to IPFS successfully');
    } catch (error) {
      console.error('IPFS upload error:', error);
      toast.error('Failed to upload file to IPFS');
    } finally {
      setUploadingToIPFS(false);
    }
  };

  const handleBusinessDetailsChange = (field: keyof BusinessDetails, value: string) => {
    setBusinessDetails({ ...businessDetails, [field]: value });
  };

  const validateForm = (): boolean => {
    // Check if at least one document is added
    if (documents.length === 0 || !documents[0].type) {
      toast.error('Please add at least one document');
      return false;
    }

    // Check if all documents have required fields
    for (const doc of documents) {
      if (!doc.type) {
        toast.error('Please select document type for all documents');
        return false;
      }
      if (!doc.ipfsHash) {
        toast.error('Please upload all documents to IPFS');
        return false;
      }
    }

    // Validate business details if required
    if (requiresBusinessDetails) {
      if (!businessDetails.businessName || !businessDetails.businessType) {
        toast.error('Please fill in all required business details');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const submissionData = {
        documents: documents.map(doc => ({
          type: doc.type,
          ipfsHash: doc.ipfsHash,
          fileName: doc.fileName,
          fileSize: doc.fileSize,
        })),
        ...(requiresBusinessDetails && { businessDetails }),
      };

      const isResubmission = verificationStatus?.kycStatus === 'rejected';
      const response = isResubmission
        ? await verificationAPI.resubmitKYC(submissionData)
        : await verificationAPI.submitKYC(submissionData);

      if (response.data.success) {
        toast.success(isResubmission ? 'KYC resubmitted successfully' : 'KYC submitted successfully');
        
        // Update user context
        if (updateUser) {
          updateUser({
            verification: {
              ...user!.verification,
              kycStatus: 'pending',
            },
          });
        }

        // Refresh verification status
        await fetchVerificationStatus();

        // Reset form
        setDocuments([{ type: '', file: null, ipfsHash: '', fileName: '', fileSize: 0 }]);
        setBusinessDetails({
          businessName: '',
          businessType: '',
          registrationNumber: '',
          taxId: '',
        });
      }
    } catch (error: unknown) {
      console.error('KYC submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit KYC';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">KYC Verification</h2>

      {/* Verification Status */}
      {verificationStatus && (
        <div className={`mb-6 p-4 rounded-lg ${
          verificationStatus.kycStatus === 'approved' ? 'bg-green-50 border border-green-200' :
          verificationStatus.kycStatus === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
          verificationStatus.kycStatus === 'rejected' ? 'bg-red-50 border border-red-200' :
          'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-2">Current Status: 
            <span className={`ml-2 ${
              verificationStatus.kycStatus === 'approved' ? 'text-green-600' :
              verificationStatus.kycStatus === 'pending' ? 'text-yellow-600' :
              verificationStatus.kycStatus === 'rejected' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {verificationStatus.kycStatus.toUpperCase()}
            </span>
          </h3>
          
          {verificationStatus.kycStatus === 'approved' && (
            <p className="text-sm text-gray-600">
              Verification Level: {verificationStatus.verificationLevel}
            </p>
          )}

          {verificationStatus.kycStatus === 'rejected' && verificationStatus.rejectionReason && (
            <div className="mt-2">
              <p className="text-sm text-red-600 font-medium">Rejection Reason:</p>
              <p className="text-sm text-red-600">{verificationStatus.rejectionReason}</p>
              
              {verificationStatus.documentIssues && verificationStatus.documentIssues.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-red-600 font-medium">Document Issues:</p>
                  <ul className="list-disc list-inside text-sm text-red-600">
                    {verificationStatus.documentIssues.map((issue, index) => (
                      <li key={index}>
                        {issue.documentType}: {issue.issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Show form only if not approved or if rejected (for resubmission) */}
      {verificationStatus?.kycStatus !== 'approved' && verificationStatus?.kycStatus !== 'pending' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Documents Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h3>
            {documents.map((doc, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-300 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Document Type
                    </label>
                    <select
                      value={doc.type}
                      onChange={(e) => handleDocumentTypeChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Select document type</option>
                      {DOCUMENT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload File
                    </label>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(index, e)}
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    {doc.ipfsHash && (
                      <p className="text-xs text-green-600 mt-1">
                        Uploaded to IPFS: {doc.ipfsHash.substring(0, 20)}...
                      </p>
                    )}
                  </div>
                </div>

                {documents.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove Document
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addDocument}
              className="text-sm text-green-600 hover:text-green-800 font-medium"
            >
              + Add Another Document
            </button>
          </div>

          {/* Business Details Section */}
          {requiresBusinessDetails && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={businessDetails.businessName}
                    onChange={(e) => handleBusinessDetailsChange('businessName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type *
                  </label>
                  <select
                    value={businessDetails.businessType}
                    onChange={(e) => handleBusinessDetailsChange('businessType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select business type</option>
                    {BUSINESS_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={businessDetails.registrationNumber}
                    onChange={(e) => handleBusinessDetailsChange('registrationNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax ID
                  </label>
                  <input
                    type="text"
                    value={businessDetails.taxId}
                    onChange={(e) => handleBusinessDetailsChange('taxId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || uploadingToIPFS}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : uploadingToIPFS ? 'Uploading to IPFS...' : 
               verificationStatus?.kycStatus === 'rejected' ? 'Resubmit KYC' : 'Submit KYC'}
            </button>
          </div>
        </form>
      )}

      {verificationStatus?.kycStatus === 'pending' && (
        <div className="text-center py-8">
          <p className="text-gray-600">Your KYC submission is under review. Please check back later.</p>
        </div>
      )}
    </div>
  );
};

export default KYCSubmissionForm;
