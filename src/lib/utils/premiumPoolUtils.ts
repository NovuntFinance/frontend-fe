/**
 * Premium Pool Qualification Utilities
 * Ensures consistent display of Premium Pool requirements across the platform
 * Based on: Premium Pool Qualification Logic (December 14, 2025)
 * Updated: Premium Pool Stake Requirement Fix (January 2025) – all ranks require
 * downlines to meet their rank's minimum stake ($50+, $100+, $250+, $500+).
 */

/** Premium Pool downline + stake requirements by user rank (post Jan 2025 fix) */
const PREMIUM_POOL_REQUIREMENTS: Record<
  string,
  { lowerRankType: string; stakeRequirement: string }
> = {
  'Associate Stakeholder': {
    lowerRankType: 'Stakeholder',
    stakeRequirement: '$50+ stake each',
  },
  'Principal Strategist': {
    lowerRankType: 'Associate Stakeholder',
    stakeRequirement: '$50+ stake each',
  },
  'Elite Capitalist': {
    lowerRankType: 'Principal Strategist',
    stakeRequirement: '$100+ stake each',
  },
  'Wealth Architect': {
    lowerRankType: 'Elite Capitalist',
    stakeRequirement: '$250+ stake each',
  },
  'Finance Titan': {
    lowerRankType: 'Wealth Architect',
    stakeRequirement: '$500+ stake each',
  },
};

/**
 * Get the correct downline rank requirement for Premium Pool qualification
 * @param currentRank - User's current rank
 * @param backendDescription - Description from backend (may be incorrect)
 * @returns Corrected description with stake requirements
 */
export function getPremiumPoolDownlineRequirement(
  currentRank: string,
  backendDescription?: string
): {
  description: string;
  stakeRequirement: string | null;
  rankType: string;
} {
  const known = PREMIUM_POOL_REQUIREMENTS[currentRank];
  if (known) {
    return {
      description: `${known.lowerRankType} downlines`,
      stakeRequirement: known.stakeRequirement,
      rankType: known.lowerRankType,
    };
  }

  // Fallback for unknown ranks (e.g. Stakeholder – not eligible)
  const description = backendDescription || 'Lower Rank Downlines';
  return {
    description,
    stakeRequirement: null,
    rankType: description
      .replace(' downlines', '')
      .replace('Downlines', '')
      .trim(),
  };
}

/**
 * Format Premium Pool requirement message for display
 * @param currentRank - User's current rank
 * @param current - Current count of qualified downlines
 * @param required - Required count of qualified downlines
 * @param backendDescription - Description from backend
 * @returns Formatted requirement message
 */
export function formatPremiumPoolRequirement(
  currentRank: string,
  current: number,
  required: number,
  backendDescription?: string
): string {
  const { stakeRequirement, rankType } = getPremiumPoolDownlineRequirement(
    currentRank,
    backendDescription
  );

  const remaining = required - current;
  const plural = required > 1 ? 's' : '';
  const withStake = stakeRequirement ? ` with ${stakeRequirement}` : '';

  if (remaining > 0) {
    return `${remaining} more ${rankType} downline${remaining > 1 ? 's' : ''}${withStake} for Premium Pool`;
  }
  return `All ${required} ${rankType} downline${plural}${withStake} required for Premium Pool`;
}

/**
 * Format task description for Premium Pool qualification
 * Used in "Remaining Tasks" and "Completed Tasks" lists
 * @param currentRank - User's current rank
 * @param required - Required count
 * @param backendDescription - Description from backend
 * @returns Formatted task description
 */
export function formatPremiumPoolTask(
  currentRank: string,
  required: number,
  backendDescription?: string
): string {
  const { stakeRequirement, rankType } = getPremiumPoolDownlineRequirement(
    currentRank,
    backendDescription
  );

  const plural = required > 1 ? 's' : '';
  const withStake = stakeRequirement ? ` with ${stakeRequirement}` : '';

  return `${required} ${rankType} downline${plural}${withStake} for Premium Pool`;
}

/**
 * Short helper text for Premium Pool progress (e.g. under progress bar)
 * "Need 2 Principal Strategist downlines with $100+ stake each"
 */
export function getPremiumPoolProgressHelperText(
  currentRank: string,
  required = 2
): string {
  const formatted = formatPremiumPoolTask(currentRank, required);
  const withoutSuffix = formatted.replace(/\s+for Premium Pool$/i, '');
  return withoutSuffix ? `Need ${withoutSuffix}` : '';
}

/**
 * Check if a task string is related to Premium Pool and needs correction
 * @param task - Task string from backend
 * @param currentRank - User's current rank
 * @returns Corrected task string if it's a Premium Pool task, otherwise original
 */
export function correctPremiumPoolTask(
  task: string,
  currentRank: string
): string {
  // For Associate Stakeholder, ALWAYS check and correct Premium Pool related tasks
  if (currentRank === 'Associate Stakeholder') {
    // Check if this task mentions downlines or Premium - be very aggressive
    const taskLower = task.toLowerCase();
    const isPremiumRelated =
      taskLower.includes('premium') ||
      taskLower.includes('downline') ||
      taskLower.includes('associate stakeholder') ||
      taskLower.includes('for premium');

    if (isPremiumRelated) {
      let corrected = task;

      // Step 1: Replace "Associate Stakeholder downlines" with "Stakeholder downlines"
      corrected = corrected.replace(
        /Associate Stakeholder\s+downlines?/gi,
        'Stakeholder downlines'
      );

      // Step 2: Handle patterns like "X more Associate Stakeholder" or "X Associate Stakeholder"
      corrected = corrected.replace(
        /(\d+)\s+more\s+Associate Stakeholder(\s+downlines?)?/gi,
        '$1 more Stakeholder downlines'
      );
      corrected = corrected.replace(
        /(\d+)\s+Associate Stakeholder(\s+downlines?)?/gi,
        '$1 Stakeholder downlines'
      );

      // Step 3: Handle any remaining "Associate Stakeholder" mentions in Premium context
      if (taskLower.includes('premium') || taskLower.includes('for premium')) {
        corrected = corrected.replace(/Associate Stakeholder/gi, 'Stakeholder');
      }

      // Step 4: Add stake requirement if not already present
      if (
        !corrected.includes('$50') &&
        !corrected.includes('50') &&
        corrected.toLowerCase().includes('stakeholder')
      ) {
        // Pattern 1: "X more Stakeholder downlines"
        if (/(\d+)\s+more\s+Stakeholder\s+downlines?/i.test(corrected)) {
          corrected = corrected.replace(
            /(\d+)\s+more\s+Stakeholder\s+downlines?/gi,
            '$1 more Stakeholder downlines with $50+ stake each'
          );
        }
        // Pattern 2: "X Stakeholder downlines" (without "more")
        else if (/(\d+)\s+Stakeholder\s+downlines?/i.test(corrected)) {
          corrected = corrected.replace(
            /(\d+)\s+Stakeholder\s+downlines?/gi,
            '$1 Stakeholder downlines with $50+ stake each'
          );
        }
        // Pattern 3: Just "Stakeholder downlines"
        else if (/Stakeholder\s+downlines?/i.test(corrected)) {
          corrected = corrected.replace(
            /Stakeholder\s+downlines?/gi,
            'Stakeholder downlines with $50+ stake each'
          );
        }
      }

      return corrected;
    }
  }

  // For other ranks (PS, EC, WA, FT), add stake requirement if missing
  const known = PREMIUM_POOL_REQUIREMENTS[currentRank];
  if (!known) return task;

  const taskLower = task.toLowerCase();
  const isPremiumPoolTask =
    taskLower.includes('premium') ||
    taskLower.includes('premium pool') ||
    taskLower.includes('premium rank');
  if (!isPremiumPoolTask) return task;

  const hasStake = /\$(\d+)|stake each/i.test(task);
  if (hasStake) return task;

  const lower = known.lowerRankType;
  const stake = known.stakeRequirement;
  const escaped = lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // "X more lowerRank downlines" or "X lowerRank downlines" → add " with $X+ stake each"
  if (new RegExp(`\\d+\\s+more\\s+${escaped}\\s+downlines?`, 'i').test(task)) {
    return task.replace(
      new RegExp(`(\\d+)\\s+more\\s+${escaped}\\s+downlines?`, 'gi'),
      `$1 more ${lower} downlines with ${stake}`
    );
  }
  if (new RegExp(`\\d+\\s+${escaped}\\s+downlines?`, 'i').test(task)) {
    return task.replace(
      new RegExp(`(\\d+)\\s+${escaped}\\s+downlines?`, 'gi'),
      `$1 ${lower} downlines with ${stake}`
    );
  }
  return task;
}
