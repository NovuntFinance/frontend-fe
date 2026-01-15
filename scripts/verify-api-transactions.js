/**
 * API Transaction Verification Utility
 *
 * This script helps verify transaction data directly from the API
 * Run this in browser console after logging in
 */

async function verifyTransactionAPI() {
  console.log('🔍 Starting API Transaction Verification...\n');

  try {
    // Get the auth token from localStorage
    const token =
      localStorage.getItem('token') || localStorage.getItem('authToken');

    if (!token) {
      console.error('❌ No auth token found in localStorage');
      console.log('Please log in first, then run this script again.');
      return;
    }

    console.log('✅ Auth token found');
    console.log('🔄 Fetching transaction history...\n');

    // Fetch transaction history
    const response = await fetch(
      '/api/v1/enhanced-transactions/history?limit=100',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(
        '❌ API request failed:',
        response.status,
        response.statusText
      );
      const errorData = await response.json().catch(() => null);
      console.error('Error data:', errorData);
      return;
    }

    const data = await response.json();
    console.log('✅ API response received\n');

    // Extract transactions array
    let transactions = [];
    if (data.data?.transactions) {
      transactions = data.data.transactions;
    } else if (data.transactions) {
      transactions = data.transactions;
    } else {
      console.error('❌ Could not find transactions in response');
      console.log('Response structure:', Object.keys(data));
      return;
    }

    console.log(`📊 Total transactions: ${transactions.length}\n`);

    // Filter referral bonuses
    const referralBonuses = transactions.filter(
      (tx) => tx.type === 'referral_bonus'
    );

    console.log(`🎁 Referral bonus transactions: ${referralBonuses.length}\n`);

    if (referralBonuses.length === 0) {
      console.log('ℹ️ No referral bonus transactions found for this user.');
      console.log('This user may not have any referrals or referral bonuses.');
      return;
    }

    // Analyze each referral bonus
    const results = {
      total: referralBonuses.length,
      correct: 0,
      incorrect: 0,
      issues: [],
    };

    console.log('=' + '='.repeat(79));
    console.log('ANALYZING REFERRAL BONUS TRANSACTIONS');
    console.log('=' + '='.repeat(79) + '\n');

    referralBonuses.forEach((tx, index) => {
      const description = tx.description || '';
      const hasStake = description.toLowerCase().includes('stake');
      const hasEarnings = description.toLowerCase().includes('earnings');

      console.log(`Transaction ${index + 1}/${referralBonuses.length}:`);
      console.log(`  ID: ${tx._id}`);
      console.log(`  Description: "${description}"`);
      console.log(`  Contains "stake": ${hasStake ? '✅ Yes' : '❌ No'}`);
      console.log(
        `  Contains "earnings": ${hasEarnings ? '⚠️ Yes (INCORRECT)' : '✅ No'}`
      );

      // Check metadata
      console.log(`  Metadata:`);
      console.log(`    - stakeId: ${tx.metadata?.stakeId || '❌ MISSING'}`);
      console.log(
        `    - stakeAmount: ${tx.metadata?.stakeAmount || '❌ MISSING'}`
      );
      console.log(`    - origin: ${tx.metadata?.origin || '❌ MISSING'}`);
      console.log(`    - level: ${tx.metadata?.level || '❌ MISSING'}`);

      // Old incorrect fields (should NOT be present)
      if (tx.metadata?.earningsAmount) {
        console.log(
          `    - earningsAmount: ⚠️ ${tx.metadata.earningsAmount} (SHOULD NOT BE PRESENT)`
        );
      }

      // Determine if correct
      if (hasEarnings) {
        results.incorrect++;
        results.issues.push({
          id: tx._id,
          description: description,
          issue: 'Contains "earnings" instead of "stake"',
        });
        console.log(`  Status: ❌ INCORRECT\n`);
      } else if (hasStake) {
        results.correct++;
        console.log(`  Status: ✅ CORRECT\n`);
      } else {
        results.issues.push({
          id: tx._id,
          description: description,
          issue: 'Ambiguous - no clear "stake" or "earnings" pattern',
        });
        console.log(`  Status: ⚠️ AMBIGUOUS\n`);
      }
    });

    // Print summary
    console.log('=' + '='.repeat(79));
    console.log('VERIFICATION SUMMARY');
    console.log('=' + '='.repeat(79));
    console.log(`Total referral bonuses: ${results.total}`);
    console.log(`✅ Correct (mentions "stake"): ${results.correct}`);
    console.log(`❌ Incorrect (mentions "earnings"): ${results.incorrect}`);
    console.log(`⚠️ Issues found: ${results.issues.length}`);
    console.log('=' + '='.repeat(79) + '\n');

    // Overall result
    if (results.incorrect === 0 && results.correct > 0) {
      console.log('🎉 RESULT: ALL CORRECT!');
      console.log(
        '✅ All referral bonus transactions have correct descriptions.'
      );
      console.log('✅ Backend fix and database cleanup were successful!');
    } else if (results.incorrect > 0) {
      console.log('🚨 RESULT: ISSUES FOUND!');
      console.log(
        `❌ ${results.incorrect} transaction(s) still have incorrect descriptions.`
      );
      console.log('\n📋 Issues list:');
      results.issues.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue.id}: ${issue.issue}`);
        console.log(`   Description: "${issue.description}"`);
      });
      console.log('\n🔧 Action required:');
      console.log('1. Verify backend is deployed with fixes');
      console.log('2. Verify database cleanup script was executed');
      console.log('3. Verify database recalculation script was executed');
      console.log('4. Check backend logs for errors');
    }

    // Save results
    window.apiVerificationResults = {
      transactions: referralBonuses,
      summary: results,
    };

    console.log('\n💾 Results saved to window.apiVerificationResults');
    console.log('   Access with: console.log(window.apiVerificationResults)\n');

    return results;
  } catch (error) {
    console.error('❌ Error during verification:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the verification
console.log('🚀 Running API Transaction Verification...\n');
verifyTransactionAPI().then(() => {
  console.log('✅ Verification complete!');
});
