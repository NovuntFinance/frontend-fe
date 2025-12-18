/**
 * English Translation Messages
 * Centralized user-facing strings for the platform
 */

export const messages = {
  // Common
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    refresh: 'Refresh',
    retry: 'Try Again',
    dismiss: 'Dismiss',
  },

  // Navigation
  navigation: {
    dashboard: 'Dashboard',
    wallets: 'Wallets',
    stakes: 'Stakes',
    team: 'Team',
    pools: 'Pools',
    achievements: 'Achievements',
    notifications: 'Notifications',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Log Out',
  },

  // Dashboard
  dashboard: {
    welcome: 'Welcome back',
    totalBalance: 'Total Balance',
    activeStakes: 'Active Stakes',
    weeklyReturns: 'Weekly Returns',
    totalEarnings: 'Total Earnings',
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Activity',
  },

  // Wallets
  wallets: {
    title: 'Wallets',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    transfer: 'Transfer',
    balance: 'Balance',
    available: 'Available',
    locked: 'Locked',
    earning: 'Earning',
  },

  // Stakes
  stakes: {
    title: 'Stakes',
    create: 'Create Stake',
    active: 'Active Stakes',
    completed: 'Completed Stakes',
    goal: 'Goal',
    progress: 'Progress',
    returns: 'Returns',
    duration: 'Duration',
  },

  // Errors
  errors: {
    networkError: 'Unable to connect to the server. Please check your internet connection.',
    serverError: 'Something went wrong on our end. We\'re working to fix it.',
    notFound: 'The requested resource was not found.',
    unauthorized: 'You are not authorized to perform this action.',
    validationError: 'Please check your input and try again.',
    generic: 'An unexpected error occurred. Please try again.',
  },

  // Forms
  forms: {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    invalidPassword: 'Password must be at least 8 characters',
    passwordsMatch: 'Passwords must match',
    submit: 'Submit',
    submitting: 'Submitting...',
  },

  // Onboarding
  onboarding: {
    welcome: 'Welcome to Novunt!',
    step1: 'Complete Your Profile',
    step2: 'Make Your First Deposit',
    step3: 'Create Your First Stake',
    step4: 'Explore Features',
    skip: 'Skip',
    next: 'Next',
    complete: 'Get Started',
  },
} as const;

export type Messages = typeof messages;

