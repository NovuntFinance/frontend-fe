/**
 * Premium Pool Qualification Utilities
 * Ensures consistent display of Premium Pool requirements across the platform
 * Based on: Premium Pool Qualification Logic (December 14, 2025)
 */

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
  // CRITICAL: Associate Stakeholder has a special rule
  if (currentRank === 'Associate Stakeholder') {
    return {
      description: 'Stakeholder downlines',
      stakeRequirement: '$50+ stake each',
      rankType: 'Stakeholder',
    };
  }

  // For other ranks, use backend description but ensure it's correct
  // Backend should send the correct lowerRankType (e.g., "Associate Stakeholder" for Principal Strategist)
  const description = backendDescription || 'Lower Rank Downlines';

  return {
    description,
    stakeRequirement: null, // Other ranks only need stake > $0 (no specific amount)
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
  const { description, stakeRequirement, rankType } =
    getPremiumPoolDownlineRequirement(currentRank, backendDescription);

  const remaining = required - current;
  const plural = required > 1 ? 's' : '';

  if (currentRank === 'Associate Stakeholder') {
    // Special format for Associate Stakeholder
    if (remaining > 0) {
      return `${remaining} more ${rankType} downline${remaining > 1 ? 's' : ''} with ${stakeRequirement} for Premium Pool`;
    }
    return `All ${required} ${rankType} downline${plural} with ${stakeRequirement} required for Premium Pool`;
  }

  // Standard format for other ranks
  if (remaining > 0) {
    return `${remaining} more ${rankType} downline${remaining > 1 ? 's' : ''} for Premium Pool`;
  }
  return `All ${required} ${rankType} downline${plural} required for Premium Pool`;
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
  const { description, stakeRequirement, rankType } =
    getPremiumPoolDownlineRequirement(currentRank, backendDescription);

  const plural = required > 1 ? 's' : '';

  if (currentRank === 'Associate Stakeholder') {
    return `${required} ${rankType} downline${plural} with ${stakeRequirement} for Premium Pool`;
  }

  return `${required} ${rankType} downline${plural} for Premium Pool`;
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

  // For other ranks, check if it's a Premium Pool task and ensure correct format
  const isPremiumPoolTask =
    task.toLowerCase().includes('premium') ||
    task.toLowerCase().includes('premium pool') ||
    task.toLowerCase().includes('premium rank');

  if (isPremiumPoolTask && currentRank !== 'Associate Stakeholder') {
    // Ensure the description matches the rank's lowerRankType
    // This is a safety check - backend should be correct for other ranks
    return task;
  }

  return task;
}
