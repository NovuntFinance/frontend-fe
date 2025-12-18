/**
 * Bundle Analysis Script
 * Analyzes bundle size and identifies optimization opportunities
 */

import { execSync } from 'child_process';

console.log('🔍 Analyzing bundle size...\n');

try {
  // Run Next.js build with analyzer
  console.log('Building with analyzer...');
  execSync('ANALYZE=true npm run build', { stdio: 'inherit' });
  
  console.log('\n✅ Bundle analysis complete!');
  console.log('📊 Check .next/analyze/ for detailed reports');
} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message);
  process.exit(1);
}

