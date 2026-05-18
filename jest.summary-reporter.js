/**
 * Minimal Jest reporter without the live progress bar.
 * DefaultReporter's status line triggers strip-ansi + ansi-regex issues on some Node/pnpm trees.
 */
class SummaryReporter {
  onRunComplete(_contexts, results) {
    const {
      numFailedTests,
      numPassedTests,
      numTotalTests,
      numPendingTests,
      testResults,
    } = results;
    const failedFiles = testResults.filter((t) => t.numFailingTests > 0);

    console.log(
      `\nJest summary: ${numPassedTests} passed, ${numFailedTests} failed, ${numPendingTests} pending (${numTotalTests} total)`
    );
    if (failedFiles.length) {
      for (const f of failedFiles) {
        console.log(`  FAIL ${f.testFilePath}`);
        for (const ar of f.assertionResults || []) {
          if (ar.status === 'failed') {
            console.log(`    ● ${ar.fullName}`);
            for (const m of ar.failureMessages || []) {
              console.log(m);
            }
          }
        }
      }
    }
  }
}

module.exports = SummaryReporter;
