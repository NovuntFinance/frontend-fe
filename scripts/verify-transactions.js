/**
 * Frontend Transaction Verification Script
 *
 * This script helps verify that referral bonus transactions display correctly
 * after the backend fix and database cleanup.
 *
 * Usage:
 * 1. Open the transaction history page in your browser
 * 2. Open DevTools console (F12)
 * 3. Copy and paste this entire script
 * 4. Press Enter to run
 *
 * It will analyze all visible transactions and report any issues.
 */

(function verifyReferralBonusTransactions() {
  console.log('🔍 Starting Referral Bonus Transaction Verification...\n');

  // Find all transaction elements
  const transactionElements = document.querySelectorAll(
    '[class*="transaction"], .transaction-item, [data-transaction]'
  );

  if (transactionElements.length === 0) {
    console.warn('⚠️ No transaction elements found on page.');
    console.log(
      'Make sure you are on the Transaction History page and transactions have loaded.'
    );
    return;
  }

  console.log(`Found ${transactionElements.length} transaction elements\n`);

  // Results tracking
  const results = {
    total: 0,
    referralBonuses: 0,
    correct: 0,
    incorrect: 0,
    issues: [],
  };

  // Analyze each transaction
  transactionElements.forEach((el, index) => {
    const text = el.textContent || '';
    const isReferralBonus =
      text.toLowerCase().includes('referral bonus') ||
      (text.toLowerCase().includes('earning') && text.includes('Level'));

    if (isReferralBonus) {
      results.referralBonuses++;

      // Check for incorrect patterns
      const hasEarningsPattern =
        (text.includes('from') && text.includes('earnings')) ||
        text.match(/from\s+\w+['']s\s+earnings/i) ||
        (text.includes('earnings') && text.includes('bonus'));

      // Check for correct patterns
      const hasStakePattern =
        (text.includes('from') && text.includes('stake')) ||
        text.match(/from\s+\w+['']s\s+stake/i) ||
        (text.includes('stake') && text.includes('bonus'));

      if (hasEarningsPattern) {
        results.incorrect++;
        const preview = text.substring(0, 150).replace(/\s+/g, ' ').trim();
        results.issues.push({
          index: index + 1,
          type: 'INCORRECT_DESCRIPTION',
          description: preview,
          reason: 'Contains "earnings" instead of "stake"',
        });
        console.log(`❌ Transaction ${index + 1}: INCORRECT`);
        console.log(`   Description preview: ${preview}`);
        console.log(`   Issue: Contains "earnings" instead of "stake"\n`);
      } else if (hasStakePattern) {
        results.correct++;
        console.log(`✅ Transaction ${index + 1}: CORRECT`);
      } else {
        // Ambiguous - might be old format or something else
        const preview = text.substring(0, 150).replace(/\s+/g, ' ').trim();
        results.issues.push({
          index: index + 1,
          type: 'AMBIGUOUS',
          description: preview,
          reason:
            'Cannot determine if correct (no clear "stake" or "earnings" pattern)',
        });
        console.log(`⚠️ Transaction ${index + 1}: AMBIGUOUS`);
        console.log(`   Description preview: ${preview}\n`);
      }
    }

    results.total++;
  });

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total transactions analyzed: ${results.total}`);
  console.log(`Referral bonus transactions: ${results.referralBonuses}`);
  console.log(`✅ Correct (mention "stake"): ${results.correct}`);
  console.log(`❌ Incorrect (mention "earnings"): ${results.incorrect}`);
  console.log(
    `⚠️ Ambiguous: ${results.issues.filter((i) => i.type === 'AMBIGUOUS').length}`
  );

  // Overall result
  console.log('\n' + '='.repeat(60));
  if (results.incorrect === 0 && results.referralBonuses > 0) {
    console.log('🎉 RESULT: ALL REFERRAL BONUSES CORRECT!');
    console.log(
      '✅ All referral bonus transactions use "stake" in descriptions.'
    );
  } else if (results.incorrect > 0) {
    console.log('🚨 RESULT: ISSUES FOUND!');
    console.log(
      `❌ ${results.incorrect} referral bonus transaction(s) still use "earnings" in descriptions.`
    );
    console.log('\nPossible causes:');
    console.log('1. Backend not deployed with fixes');
    console.log('2. Database cleanup not executed');
    console.log('3. Browser cache showing old data');
    console.log('\nSuggested actions:');
    console.log('1. Hard refresh (Ctrl+F5)');
    console.log('2. Clear browser cache');
    console.log('3. Verify backend is updated');
    console.log('4. Check if database cleanup was run');
  } else if (results.referralBonuses === 0) {
    console.log('ℹ️ RESULT: NO REFERRAL BONUSES FOUND');
    console.log('This user may not have any referral bonus transactions.');
    console.log('Try testing with a different user account.');
  }
  console.log('='.repeat(60) + '\n');

  // Detailed issues report
  if (results.issues.length > 0) {
    console.log('\n📋 DETAILED ISSUES REPORT:\n');
    results.issues.forEach((issue, i) => {
      console.log(`Issue ${i + 1}:`);
      console.log(`  Type: ${issue.type}`);
      console.log(`  Transaction #: ${issue.index}`);
      console.log(`  Reason: ${issue.reason}`);
      console.log(`  Description: ${issue.description}`);
      console.log('');
    });
  }

  // Export results for reporting
  window.verificationResults = results;
  console.log('💾 Results saved to window.verificationResults');
  console.log(
    '   You can access them with: console.log(window.verificationResults)\n'
  );

  // API verification suggestions
  if (results.incorrect > 0 || results.referralBonuses === 0) {
    console.log('\n🔧 NEXT STEPS:');
    console.log('1. Check API response directly:');
    console.log('   Open Network tab in DevTools');
    console.log('   Find request to: /api/v1/enhanced-transactions/history');
    console.log('   Check Response tab for raw transaction data');
    console.log(
      '   Look for "description" fields in referral_bonus transactions'
    );
    console.log('\n2. Test with direct API call:');
    console.log('   Run this in console:');
    console.log(`   fetch('/api/v1/enhanced-transactions/history?category=earnings', {
     headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
   }).then(r => r.json()).then(data => {
     console.log('API Response:', data);
     const referralBonuses = data.data?.transactions?.filter(t => t.type === 'referral_bonus');
     console.log('Referral bonuses from API:', referralBonuses);
   });`);
  }

  console.log('\n✅ Verification complete!\n');

  return results;
})();
