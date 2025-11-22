/**
 * Feature Flags System
 * Enables/disables features based on environment variables
 */

import React from 'react';

/**
 * Feature flags configuration
 * Add new features here and control them via environment variables
 */
export const features = {
    // Core features
    stakingV2: process.env.NEXT_PUBLIC_FEATURE_STAKING_V2 === 'true',
    socialVerification: process.env.NEXT_PUBLIC_FEATURE_SOCIAL_VERIFICATION !== 'false', // Enabled by default
    registrationBonus: process.env.NEXT_PUBLIC_FEATURE_REGISTRATION_BONUS !== 'false', // Enabled by default

    // Experimental features
    advancedCharts: process.env.NEXT_PUBLIC_FEATURE_ADVANCED_CHARTS === 'true',
    darkModeToggle: process.env.NEXT_PUBLIC_FEATURE_DARK_MODE_TOGGLE !== 'false', // Enabled by default

    // Admin features
    adminPanel: process.env.NEXT_PUBLIC_FEATURE_ADMIN_PANEL !== 'false', // Enabled by default
    kycVerification: process.env.NEXT_PUBLIC_FEATURE_KYC_VERIFICATION !== 'false', // Enabled by default

    // Payment features
    withdrawals: process.env.NEXT_PUBLIC_FEATURE_WITHDRAWALS !== 'false', // Enabled by default
    deposits: process.env.NEXT_PUBLIC_FEATURE_DEPOSITS !== 'false', // Enabled by default
    p2pTransfers: process.env.NEXT_PUBLIC_FEATURE_P2P_TRANSFERS === 'true',

    // Performance & monitoring
    analyticsEnabled: process.env.NEXT_PUBLIC_FEATURE_ANALYTICS === 'true',
    errorTracking: process.env.NEXT_PUBLIC_FEATURE_ERROR_TRACKING === 'true' || process.env.NODE_ENV === 'production',
    performanceMonitoring: process.env.NEXT_PUBLIC_FEATURE_PERFORMANCE_MONITORING === 'true',

    // Development features
    devTools: process.env.NODE_ENV === 'development',
    debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
} as const;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof features): boolean {
    return features[feature] === true;
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): string[] {
    return Object.entries(features)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name);
}

/**
 * Get all disabled features
 */
export function getDisabledFeatures(): string[] {
    return Object.entries(features)
        .filter(([_, enabled]) => !enabled)
        .map(([name]) => name);
}

/**
 * Feature flag hook for React components
 */
export function useFeature(feature: keyof typeof features): boolean {
    return features[feature];
}

/**
 * HOC to conditionally render components based on feature flags
 */
export function withFeature<P extends Record<string, unknown>>(
    feature: keyof typeof features,
    Component: React.ComponentType<P>,
    FallbackComponent?: React.ComponentType<P>
) {
    return function FeatureGatedComponent(props: P) {
        if (features[feature]) {
            return <Component { ...props } />;
        }

        if (FallbackComponent) {
            return <FallbackComponent { ...props } />;
        }

        return null;
    };
}

// Export feature flags for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as typeof window & { __NOVUNT_FEATURES__?: typeof features }).__NOVUNT_FEATURES__ = features;
}

export default features;
