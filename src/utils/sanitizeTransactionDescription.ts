/**
 * Sanitize Transaction Description
 *
 * Removes sensitive information from transaction descriptions:
 * - Pool amounts (e.g., "$2000 total pool", "$1000 pool")
 * - Stake amounts (e.g., "$20,000.00 USDT")
 * - Usernames/referral IDs
 * - Other sensitive metadata
 *
 * This is a frontend fallback sanitization. The backend should already
 * sanitize descriptions, but this ensures old transactions or unsanitized
 * descriptions are handled gracefully.
 */

/**
 * Sanitize a transaction description by removing sensitive information
 */
export function sanitizeTransactionDescription(description: string): string {
  if (!description) return description;

  let sanitized = description;

  // Remove pool amounts (e.g., "- $2000 total pool", "- $1000 total pool")
  sanitized = sanitized.replace(
    /\s*-\s*\$\d+([,.]\d+)?\s*(total\s*)?pool/gi,
    ''
  );

  // Remove pool amounts in parentheses (e.g., "($2000 total pool)")
  sanitized = sanitized.replace(
    /\s*\(\$\d+([,.]\d+)?\s*(total\s*)?pool\)/gi,
    ''
  );

  // Remove stake amounts from staking descriptions
  // Pattern: "You staked $20,000.00 USDT. Your stake will earn..."
  sanitized = sanitized.replace(
    /You staked\s+\$[\d,]+\.?\d*\s*USDT\.?\s*/gi,
    'You staked. '
  );

  // Remove total return amounts (e.g., "100,000.00 USDT total")
  sanitized = sanitized.replace(/\s*\(\$?[\d,]+\.?\d*\s*USDT\s*total\)/gi, '');

  // Remove percentage calculations with amounts (e.g., "2.5% of $10000 pool")
  sanitized = sanitized.replace(
    /\d+\.?\d*%\s*of\s*\$?[\d,]+\.?\d*\s*(pool|stake)/gi,
    (match) => {
      // Extract just the percentage
      const percentageMatch = match.match(/(\d+\.?\d*)%/);
      return percentageMatch ? `${percentageMatch[1]}%` : '';
    }
  );

  // Remove "Your share" calculations (e.g., "Your share (2.5% of $10000 pool) = $250 USDT")
  sanitized = sanitized.replace(
    /Your share\s*\([^)]+\)\s*=\s*\$?[\d,]+\.?\d*\s*USDT/gi,
    'Your share'
  );

  // Remove referral bonus usernames (e.g., "from ft2's goal stake")
  sanitized = sanitized.replace(/\s+from\s+[\w-]+'s\s+(goal\s*)?stake/gi, '');

  // Remove referral IDs from descriptions (e.g., "Ref: BONUS-...jbs5")
  sanitized = sanitized.replace(/\s*Ref:\s*BONUS-[\w]+/gi, '');

  // Clean up multiple spaces
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // Clean up trailing dashes or commas
  sanitized = sanitized.replace(/[\s,-]+$/, '').trim();

  return sanitized;
}

/**
 * Sanitize transaction description based on transaction type
 */
export function sanitizeDescriptionByType(
  description: string,
  type: string
): string {
  if (!description) return description;

  let sanitized = sanitizeTransactionDescription(description);

  // Type-specific sanitization
  switch (type) {
    case 'stake':
      // For stake transactions, remove specific stake amount details
      sanitized = sanitized.replace(
        /Your stake will earn weekly returns until reaching \d+% \(\$?[\d,]+\.?\d*\s*USDT\s*total\)/gi,
        'Your stake will earn weekly returns'
      );
      break;

    case 'performance_pool_payout':
    case 'premium_pool_payout':
      // For pool payouts, ensure no pool amounts remain
      sanitized = sanitized.replace(
        /\s*for\s+\d{4}-\d{2}-\d{2}\s*-\s*\$\d+([,.]\d+)?\s*total\s*pool/gi,
        (match) => {
          // Keep only the date part
          const dateMatch = match.match(/(\d{4}-\d{2}-\d{2})/);
          return dateMatch ? ` for ${dateMatch[1]}` : '';
        }
      );
      break;

    case 'referral_bonus':
      // For referral bonuses, remove username references
      sanitized = sanitized.replace(
        /\s*Level\s+\d+\s*referral\s+bonus\s+from\s+[\w-]+'s\s+(goal\s*)?stake/gi,
        (match) => {
          // Keep only "Level X referral bonus"
          const levelMatch = match.match(/(Level\s+\d+\s*referral\s+bonus)/i);
          return levelMatch ? levelMatch[1] : match;
        }
      );
      break;
  }

  return sanitized.trim();
}
