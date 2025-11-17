/**
 * useUser Hook
 * User profile and preferences management
 */

import { useAuthStore } from '@/store/authStore';
import { useUpdateProfile, useChangePassword } from '@/lib/mutations';

export function useUser() {
  const { user } = useAuthStore();
  
  /**
   * NOTE: User data comes from login response and is stored in authStore.
   * No need to fetch profile separately - the backend doesn't have /auth/profile endpoint.
   * User data is already available from authStore after successful login.
   */
  const isLoading = false; // User is already in store from login
  const error = null;
  
  // Update profile mutation
  const updateProfileMutation = useUpdateProfile();
  
  // Change password mutation
  const changePasswordMutation = useChangePassword();
  
  // Get user's full name
  const getFullName = () => {
    return user?.fullName || `${user?.firstName} ${user?.lastName}`;
  };
  
  // Get user's initials
  const getInitials = () => {
    if (!user) return '';
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };
  
  // Get user's rank info
  const getRankInfo = () => {
    const ranks = [
      { name: 'Stakeholder', minInvestment: 0, color: 'gray' },
      { name: 'Investor', minInvestment: 1000, color: 'blue' },
      { name: 'Wealth Builder', minInvestment: 5000, color: 'green' },
      { name: 'Finance Pro', minInvestment: 10000, color: 'purple' },
      { name: 'Money Master', minInvestment: 25000, color: 'amber' },
      { name: 'Finance Titan', minInvestment: 50000, color: 'red' },
    ];
    
    const currentRank = ranks.find((r) => r.name === user?.rank);
    const currentIndex = currentRank ? ranks.indexOf(currentRank) : 0;
    const nextRank = ranks[currentIndex + 1];
    
    return {
      current: currentRank,
      next: nextRank,
      progress: nextRank
        ? ((user?.totalInvested || 0) / nextRank.minInvestment) * 100
        : 100,
    };
  };
  
  // Get KYC status info
  const getKYCStatusInfo = () => {
    const statuses = {
      not_submitted: {
        label: 'Not Submitted',
        color: 'gray',
        description: 'Complete KYC to unlock full features',
      },
      pending: {
        label: 'Pending Review',
        color: 'amber',
        description: 'Your documents are being reviewed',
      },
      approved: {
        label: 'Verified',
        color: 'green',
        description: 'Your account is fully verified',
      },
      rejected: {
        label: 'Rejected',
        color: 'red',
        description: 'Please resubmit your documents',
      },
    };
    
    return statuses[user?.kycStatus || 'not_submitted'];
  };
  
  return {
    user,
    isLoading,
    error,
    refetch: () => Promise.resolve(), // No-op since user is in store
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    changePassword: changePasswordMutation.mutate,
    isChangingPassword: changePasswordMutation.isPending,
    getFullName,
    getInitials,
    getRankInfo,
    getKYCStatusInfo,
  };
}
