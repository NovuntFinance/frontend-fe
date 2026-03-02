"use client";

import { useState } from 'react';
import type { KycApprovalItem } from '@/types/admin';
import Image from 'next/image';

export default function KYCManagementPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedKYC, setSelectedKYC] = useState<KycApprovalItem | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock KYC requests data
  const mockPendingKYC: KycApprovalItem[] = [
    {
      id: '1',
      type: 'kyc',
      user: {
        id: 'u001',
        fullName: 'Michael Johnson',
        email: 'michael.johnson@example.com',
        avatar: '',
      },
      details: {
        documentType: 'passport',
        documentNumber: 'AB123456',
        country: 'United States',
        documentImages: ['/mock/kyc-doc1.jpg', '/mock/kyc-doc2.jpg'],
        selfieImage: '/mock/kyc-selfie.jpg',
        submittedAt: '2023-04-15T10:30:00Z',
      },
      status: 'pending',
      priority: 'high',
      requestedAt: '2023-04-15T10:30:00Z',
    },
    {
      id: '2',
      type: 'kyc',
      user: {
        id: 'u002',
        fullName: 'Emily Wilson',
        email: 'emily.wilson@example.com',
        avatar: '',
      },
      details: {
        documentType: 'id_card',
        documentNumber: 'ID78901234',
        country: 'Canada',
        documentImages: ['/mock/kyc-doc3.jpg'],
        selfieImage: '/mock/kyc-selfie2.jpg',
        submittedAt: '2023-04-16T14:45:00Z',
      },
      status: 'pending',
      priority: 'medium',
      requestedAt: '2023-04-16T14:45:00Z',
    },
    {
      id: '3',
      type: 'kyc',
      user: {
        id: 'u003',
        fullName: 'Daniel Brown',
        email: 'daniel.brown@example.com',
        avatar: '',
      },
      details: {
        documentType: 'driving_license',
        documentNumber: 'DL5678901',
        country: 'United Kingdom',
        documentImages: ['/mock/kyc-doc4.jpg', '/mock/kyc-doc5.jpg'],
        selfieImage: '/mock/kyc-selfie3.jpg',
        submittedAt: '2023-04-17T09:15:00Z',
      },
      status: 'pending',
      priority: 'low',
      requestedAt: '2023-04-17T09:15:00Z',
    },
  ];

  const mockHistoryKYC: KycApprovalItem[] = [
    {
      id: '4',
      type: 'kyc',
      user: {
        id: 'u004',
        fullName: 'Sophia Martinez',
        email: 'sophia.martinez@example.com',
        avatar: '',
      },
      details: {
        documentType: 'passport',
        documentNumber: 'CD789012',
        country: 'Spain',
        documentImages: ['/mock/kyc-doc6.jpg'],
        selfieImage: '/mock/kyc-selfie4.jpg',
        submittedAt: '2023-04-10T11:20:00Z',
      },
      status: 'approved',
      priority: 'medium',
      requestedAt: '2023-04-10T11:20:00Z',
      reviewedBy: 'Admin User',
      reviewedAt: '2023-04-11T14:30:00Z',
    },
    {
      id: '5',
      type: 'kyc',
      user: {
        id: 'u005',
        fullName: 'William Davis',
        email: 'william.davis@example.com',
        avatar: '',
      },
      details: {
        documentType: 'id_card',
        documentNumber: 'ID3456789',
        country: 'Australia',
        documentImages: ['/mock/kyc-doc7.jpg', '/mock/kyc-doc8.jpg'],
        selfieImage: '/mock/kyc-selfie5.jpg',
        submittedAt: '2023-04-12T16:45:00Z',
      },
      status: 'rejected',
      priority: 'high',
      requestedAt: '2023-04-12T16:45:00Z',
      reviewedBy: 'Admin User',
      reviewedAt: '2023-04-13T09:15:00Z',
    },
  ];

  const kycData = activeTab === 'pending' ? mockPendingKYC : mockHistoryKYC;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleApproveKYC = (item: KycApprovalItem) => {
    // This would be replaced with an actual API call
    console.log('Approving KYC', item.id, reviewComment);
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      setSelectedKYC(null);
      setReviewComment('');
      // Would refresh the data after real API call
    }, 1000);
  };

  const handleRejectKYC = (item: KycApprovalItem) => {
    // This would be replaced with an actual API call
    console.log('Rejecting KYC', item.id, reviewComment);
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      setSelectedKYC(null);
      setReviewComment('');
      // Would refresh the data after real API call
    }, 1000);
  };

  // KYC Status badge
  const StatusBadge = ({ status }: { status: string }) => {
    let bgColor = '';
    let textColor = '';
    
    switch (status) {
      case 'approved':
        bgColor = 'bg-green-100 dark:bg-green-900/30';
        textColor = 'text-green-800 dark:text-green-400';
        break;
      case 'rejected':
        bgColor = 'bg-red-100 dark:bg-red-900/30';
        textColor = 'text-red-800 dark:text-red-400';
        break;
      case 'pending':
        bgColor = 'bg-amber-100 dark:bg-amber-900/30';
        textColor = 'text-amber-800 dark:text-amber-400';
        break;
      default:
        bgColor = 'bg-gray-100 dark:bg-gray-700';
        textColor = 'text-gray-800 dark:text-gray-300';
    }
    
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bgColor} ${textColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Priority badge
  const PriorityBadge = ({ priority }: { priority: string }) => {
    let bgColor = '';
    let textColor = '';
    
    switch (priority) {
      case 'high':
        bgColor = 'bg-red-100 dark:bg-red-900/30';
        textColor = 'text-red-800 dark:text-red-400';
        break;
      case 'medium':
        bgColor = 'bg-amber-100 dark:bg-amber-900/30';
        textColor = 'text-amber-800 dark:text-amber-400';
        break;
      case 'low':
        bgColor = 'bg-blue-100 dark:bg-blue-900/30';
        textColor = 'text-blue-800 dark:text-blue-400';
        break;
      default:
        bgColor = 'bg-gray-100 dark:bg-gray-700';
        textColor = 'text-gray-800 dark:text-gray-300';
    }
    
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bgColor} ${textColor}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  // Document type display
  const DocumentTypeDisplay = ({ type }: { type: string }) => {
    let displayName = '';
    let iconPath = '';
    
    switch (type) {
      case 'passport':
        displayName = 'Passport';
        iconPath = 'M20 6H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zM4 16V8h16v8H4z M10 10a1 1 0 1 1-2 0 1 1 0 0 1 2 0z';
        break;
      case 'id_card':
        displayName = 'ID Card';
        iconPath = 'M4 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4zm16 2v12H4V6h16z M7 15v2h10v-2H7z M7 9a2 2 0 1 1 4 0 2 2 0 0 1-4 0z';
        break;
      case 'driving_license':
        displayName = 'Driving License';
        iconPath = 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm2 0v14h14V5H5z M16 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M6 12h12v1H6z M6 15h12v1H6z';
        break;
      default:
        displayName = 'Document';
        iconPath = 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1v5h5v12H6V4h7z';
    }
    
    return (
      <div className="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={iconPath}></path>
        </svg>
        <span>{displayName}</span>
      </div>
    );
  };

  // Placeholder image
  const ImagePlaceholder = () => (
    <div className="flex items-center justify-center w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-md">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          KYC Verification Management
        </h2>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-md bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm border border-gray-300 dark:border-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('pending')}
            className={`${
              activeTab === 'pending'
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mr-8`}
          >
            Pending Verifications
            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
              activeTab === 'pending' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {mockPendingKYC.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Verification History
          </button>
        </nav>
      </div>
      
      {/* KYC List */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {kycData.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 flex-shrink-0">
                    {item.user.avatar ? (
                      <Image 
                        className="h-10 w-10 rounded-full" 
                        src={item.user.avatar} 
                        alt=""
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium">
                        {item.user.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {item.user.fullName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.user.email}
                    </p>
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Document Type:</div>
                  <DocumentTypeDisplay type={item.details.documentType} />
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Country:</div>
                  <div>{item.details.country}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted:</div>
                  <div className="text-sm">{formatDate(item.requestedAt)}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority:</div>
                  <PriorityBadge priority={item.priority} />
                </div>
                {item.status !== 'pending' && (
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Reviewed:</div>
                    <div className="text-sm">{formatDate(item.reviewedAt || '')}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              {item.status === 'pending' ? (
                <div className="flex justify-between">
                  <button
                    onClick={() => setSelectedKYC(item)}
                    className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                  >
                    Review Documents
                  </button>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleRejectKYC(item)}
                      className="inline-flex items-center px-3 py-1.5 border border-red-600 dark:border-red-400 rounded-md text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveKYC(item)}
                      className="inline-flex items-center px-3 py-1.5 border border-green-600 dark:border-green-400 rounded-md text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/10"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedKYC(item)}
                  className="w-full text-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                >
                  View Details
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {kycData.length === 0 && (
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No verification requests</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {activeTab === 'pending' 
              ? 'There are no pending KYC verification requests at this time.'
              : 'No verification history found.'}
          </p>
        </div>
      )}
      
      {/* KYC review modal */}
      {selectedKYC && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white dark:bg-gray-800 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setSelectedKYC(null)}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                    KYC Verification Review
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Review the user documents carefully before making a decision.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                {/* User info */}
                <div className="pb-5 mb-5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 flex-shrink-0">
                      {selectedKYC.user.avatar ? (
                        <Image 
                          className="rounded-full" 
                          src={selectedKYC.user.avatar} 
                          alt="" 
                          width={40} 
                          height={40} 
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium">
                          {selectedKYC.user.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedKYC.user.fullName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedKYC.user.email} • User ID: {selectedKYC.user.id}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Document Type:</div>
                      <DocumentTypeDisplay type={selectedKYC.details.documentType} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Document Number:</div>
                      <div className="font-medium">{selectedKYC.details.documentNumber}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Country:</div>
                      <div className="font-medium">{selectedKYC.details.country}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted:</div>
                      <div className="font-medium">{formatDate(selectedKYC.requestedAt)}</div>
                    </div>
                  </div>
                </div>
                
                {/* Document images */}
                <div className="pb-5 mb-5">
                  <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Document Images
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {selectedKYC.details.documentImages.map((img, index) => (
                      <div key={index} className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                        {/* In a real app, these would be actual images */}
                        <ImagePlaceholder />
                        <div className="p-2 text-center text-sm text-gray-500 dark:text-gray-400">
                          Document Image {index + 1}
                        </div>
                      </div>
                    ))}
                    {selectedKYC.details.selfieImage && (
                      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                        <ImagePlaceholder />
                        <div className="p-2 text-center text-sm text-gray-500 dark:text-gray-400">
                          Selfie with Document
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Review form */}
                {selectedKYC.status === 'pending' && (
                  <div>
                    <div className="mb-4">
                      <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Review Comment
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="comment"
                          name="comment"
                          rows={3}
                          className="shadow-sm block w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Add any notes or reasons for approval/rejection here"
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                      <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-red-600 dark:border-red-400 px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                        onClick={() => handleRejectKYC(selectedKYC)}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Processing...' : 'Reject Verification'}
                      </button>
                      <button
                        type="button"
                        className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
                        onClick={() => handleApproveKYC(selectedKYC)}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Processing...' : 'Approve Verification'}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* History details */}
                {selectedKYC.status !== 'pending' && (
                  <div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-md">
                      <div className="flex items-start space-x-3">
                        <div className={`mt-0.5 flex-shrink-0 ${
                          selectedKYC.status === 'approved' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                        }`}>
                          {selectedKYC.status === 'approved' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {selectedKYC.status === 'approved' ? 'Verified' : 'Rejected'} by {selectedKYC.reviewedBy}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(selectedKYC.reviewedAt || '')}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {selectedKYC.status === 'approved' 
                              ? 'The user has been successfully verified.' 
                              : 'The verification has been rejected due to issues with the provided documents.'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 text-center">
                      <button
                        type="button"
                        className="inline-flex justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => setSelectedKYC(null)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}