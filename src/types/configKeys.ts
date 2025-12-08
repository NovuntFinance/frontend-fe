/**
 * TypeScript Types for Dynamic Configuration System
 *
 * Generated from backend DEFAULT_SETTINGS
 * Last Updated: 2025-01-XX
 */

/**
 * All available configuration keys
 */
export type ConfigKey =
  // System
  | 'system_mode'
  | 'maintenance_mode'

  // Financial
  | 'withdrawal_fee_percentage'
  | 'registration_bonus_percentage'
  | 'min_withdrawal_amount'
  | 'instant_withdrawal_threshold'
  | 'enable_instant_withdrawals'
  | 'max_withdrawals_per_day'
  | 'transfer_fee_percentage'
  | 'min_transfer_amount'
  | 'max_transfer_amount'
  | 'weekly_return_percentage'
  | 'goal_target_percentage'
  | 'min_stake_amount'
  | 'max_stake_amount'
  | 'available_goal_categories'

  // Security
  | 'required_approvals_financial'
  | 'two_fa_mandatory'
  | 'account_verification_required'

  // Notification
  | 'notification_push_enabled'
  | 'notification_email_enabled'
  | 'notification_retention_days'
  | 'notification_max_per_user'
  | 'pwa_notifications_enabled'
  | 'pwa_notification_badge_enabled'
  | 'pwa_rich_notifications'
  | 'pwa_notification_sound'
  | 'pwa_notification_vibration'
  | 'email_only_for_auth'

  // Biometric
  | 'biometric_auth_enabled'
  | 'biometric_device_registration_required'
  | 'biometric_backup_pin_required'
  | 'biometric_max_failed_attempts'
  | 'biometric_session_timeout_minutes'

  // Activity
  | 'activity_feed_simulation_enabled'
  | 'platform_activity_mock_percentage'

  // Rank System
  | 'rank_system_enabled'
  | 'weekly_rank_pool_amount'
  | 'weekly_redistribution_pool_amount'
  | 'rank_pool_distribution_frequency'
  | 'auto_rank_upgrades_enabled'
  | 'rank_verification_frequency_hours'
  | 'min_personal_stake_stakeholder'
  | 'redistribution_pool_qualification_rule'
  | 'rank_pool_equal_distribution'
  | 'rank_bonus_multiplier_enabled'

  // Referral
  | 'referral_level_1_percentage'
  | 'referral_level_2_percentage'
  | 'referral_level_3_percentage'
  | 'referral_level_4_percentage'
  | 'referral_level_5_percentage'
  | 'max_referral_levels'
  | 'referral_depletion_warning_days'
  | 'referral_depletion_start_days'
  | 'daily_depletion_percentage'
  | 'min_stake_qualification'

  // Registration Bonus
  | 'registration_bonus_required_social_platforms'

  // Social Media
  | 'social_media_url_facebook'
  | 'social_media_url_instagram'
  | 'social_media_url_youtube'
  | 'social_media_url_tiktok'
  | 'social_media_url_telegram'
  | 'social_media_click_dwell_seconds';

/**
 * Type-safe config values with their types
 */
export interface ConfigValues {
  // System
  system_mode: 'development' | 'staging' | 'production';
  maintenance_mode: boolean;

  // Financial
  withdrawal_fee_percentage: number;
  registration_bonus_percentage: number;
  min_withdrawal_amount: number;
  instant_withdrawal_threshold: number;
  enable_instant_withdrawals: boolean;
  max_withdrawals_per_day: number;
  transfer_fee_percentage: number;
  min_transfer_amount: number;
  max_transfer_amount: number;
  weekly_return_percentage: number;
  goal_target_percentage: number;
  min_stake_amount: number;
  max_stake_amount: number;
  available_goal_categories: string[];

  // Security
  required_approvals_financial: number;
  two_fa_mandatory: boolean;
  account_verification_required: boolean;

  // Notification
  notification_push_enabled: boolean;
  notification_email_enabled: boolean;
  notification_retention_days: number;
  notification_max_per_user: number;
  pwa_notifications_enabled: boolean;
  pwa_notification_badge_enabled: boolean;
  pwa_rich_notifications: boolean;
  pwa_notification_sound: boolean;
  pwa_notification_vibration: boolean;
  email_only_for_auth: boolean;

  // Biometric
  biometric_auth_enabled: boolean;
  biometric_device_registration_required: boolean;
  biometric_backup_pin_required: boolean;
  biometric_max_failed_attempts: number;
  biometric_session_timeout_minutes: number;

  // Activity
  activity_feed_simulation_enabled: boolean;
  platform_activity_mock_percentage: number;

  // Rank System
  rank_system_enabled: boolean;
  weekly_rank_pool_amount: number;
  weekly_redistribution_pool_amount: number;
  rank_pool_distribution_frequency: 'daily' | 'weekly' | 'monthly';
  auto_rank_upgrades_enabled: boolean;
  rank_verification_frequency_hours: number;
  min_personal_stake_stakeholder: number;
  redistribution_pool_qualification_rule:
    | 'must_have_same_rank_downline'
    | 'any_qualifying_stake'
    | 'rank_based';
  rank_pool_equal_distribution: boolean;
  rank_bonus_multiplier_enabled: boolean;

  // Referral
  referral_level_1_percentage: number;
  referral_level_2_percentage: number;
  referral_level_3_percentage: number;
  referral_level_4_percentage: number;
  referral_level_5_percentage: number;
  max_referral_levels: number;
  referral_depletion_warning_days: number;
  referral_depletion_start_days: number;
  daily_depletion_percentage: number;
  min_stake_qualification: number;

  // Registration Bonus
  registration_bonus_required_social_platforms: string[];

  // Social Media
  social_media_url_facebook: string;
  social_media_url_instagram: string;
  social_media_url_youtube: string;
  social_media_url_tiktok: string;
  social_media_url_telegram: string;
  social_media_click_dwell_seconds: number;
}

/**
 * Default fallback values (use when config API fails)
 */
export const DEFAULT_CONFIG_VALUES: Partial<ConfigValues> = {
  // Financial
  min_withdrawal_amount: 10,
  withdrawal_fee_percentage: 2.5,
  max_withdrawals_per_day: 2,
  instant_withdrawal_threshold: 50,
  enable_instant_withdrawals: true,
  min_transfer_amount: 5,
  max_transfer_amount: 5000,
  transfer_fee_percentage: 0,
  min_stake_amount: 20,
  max_stake_amount: 10000,
  weekly_return_percentage: 6,
  goal_target_percentage: 200,

  // Referral
  referral_level_1_percentage: 5,
  referral_level_2_percentage: 2,
  referral_level_3_percentage: 1.5,
  referral_level_4_percentage: 1,
  referral_level_5_percentage: 0.5,
  max_referral_levels: 5,

  // Security
  two_fa_mandatory: false,
  account_verification_required: true,

  // Notification
  notification_push_enabled: true,
  notification_email_enabled: true,

  // Biometric
  biometric_auth_enabled: true,

  // Rank System
  rank_system_enabled: true,

  // Activity
  activity_feed_simulation_enabled: false,
  platform_activity_mock_percentage: 100,
};

/**
 * Helper function to get category from config key
 */
export function getConfigCategory(key: ConfigKey): string {
  if (
    key.startsWith('withdrawal') ||
    key.startsWith('transfer') ||
    key.startsWith('stake') ||
    key.startsWith('registration_bonus') ||
    key.startsWith('weekly_return') ||
    key.startsWith('goal_target')
  ) {
    return 'financial';
  }

  if (key.startsWith('referral')) {
    return 'referral';
  }

  if (key.startsWith('notification') || key.startsWith('pwa_')) {
    return 'notification';
  }

  if (key.startsWith('biometric')) {
    return 'biometric';
  }

  if (
    key.startsWith('rank_') ||
    key.startsWith('weekly_rank') ||
    key.startsWith('redistribution')
  ) {
    return 'rank_system';
  }

  if (key.startsWith('social_media')) {
    return 'social_media';
  }

  if (key.startsWith('activity') || key.startsWith('platform_activity')) {
    return 'activity';
  }

  if (
    key.startsWith('required_approvals') ||
    key.startsWith('two_fa') ||
    key.startsWith('account_verification')
  ) {
    return 'security';
  }

  if (key.startsWith('system_') || key.startsWith('maintenance')) {
    return 'system';
  }

  return 'general';
}

/**
 * Type-safe config value getter helper
 * Use this in your config service/hooks
 */
export function getConfigValue<K extends ConfigKey>(
  configs: Record<string, any> | null,
  key: K,
  fallback?: ConfigValues[K]
): ConfigValues[K] | undefined {
  if (!configs) {
    return fallback ?? DEFAULT_CONFIG_VALUES[key];
  }

  const value = configs[key];

  if (value !== undefined && value !== null) {
    return value as ConfigValues[K];
  }

  return fallback ?? DEFAULT_CONFIG_VALUES[key];
}
