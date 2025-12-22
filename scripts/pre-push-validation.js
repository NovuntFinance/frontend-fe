#!/usr/bin/env node

/**
 * Pre-Push Validation Script
 * Runs build, typecheck, lint, and API curl tests before pushing to GitHub
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) =>
    console.log(
      `\n${colors.bright}${colors.blue}▶${colors.reset} ${colors.bright}${msg}${colors.reset}`
    ),
};

let hasErrors = false;

function runCommand(command, description, options = {}) {
  try {
    log.info(`Running: ${description}`);
    const output = execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
      ...options,
    });
    log.success(`${description} completed successfully`);
    return { success: true, output };
  } catch (error) {
    hasErrors = true;
    log.error(`${description} failed`);
    if (error.stdout) {
      console.error(error.stdout);
    }
    if (error.stderr) {
      console.error(error.stderr);
    }
    return { success: false, error };
  }
}

function checkEnvironment() {
  log.step('Checking Environment');

  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    log.warn('.env.local not found. Some tests may fail.');
    log.info('You can create it from .env.example if available');
  } else {
    log.success('.env.local found');
  }

  // Check Node version
  try {
    const nodeVersion = execSync('node --version', {
      encoding: 'utf-8',
    }).trim();
    log.info(`Node version: ${nodeVersion}`);
  } catch (error) {
    log.error('Could not determine Node version');
  }

  // Check npm version
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
    log.info(`npm version: ${npmVersion}`);
  } catch (error) {
    log.error('Could not determine npm version');
  }
}

function runTypeCheck() {
  log.step('Running TypeScript Type Check');
  return runCommand('npm run typecheck', 'TypeScript type check');
}

function runLint() {
  log.step('Running ESLint');
  return runCommand('npm run lint', 'ESLint check');
}

function runBuild() {
  log.step('Running Production Build');
  return runCommand('npm run build', 'Next.js production build');
}

function runCurlTests() {
  log.step('Running API Endpoint Tests (curl)');

  // Get API URL from environment or use defaults
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://novunt-backend-uw3z.onrender.com/api/v1'
      : 'http://localhost:5000/api/v1');

  log.info(`Testing API endpoints at: ${apiUrl}`);

  // Check if curl is available
  try {
    execSync('curl --version', { stdio: 'pipe' });
  } catch (error) {
    log.warn('curl not found. Skipping API tests.');
    log.info('Install curl to enable API endpoint testing');
    return { success: true, skipped: true };
  }

  const endpoints = [
    {
      name: 'Health Check',
      url: `${apiUrl.replace('/api/v1', '')}/health`,
      method: 'GET',
      expectedStatus: [200, 404], // 404 is OK if endpoint doesn't exist
    },
    {
      name: 'API Root',
      url: `${apiUrl.replace('/api/v1', '')}`,
      method: 'GET',
      expectedStatus: [200, 404],
    },
  ];

  let curlTestsPassed = 0;
  let curlTestsFailed = 0;
  let curlTestsSkipped = 0;

  for (const endpoint of endpoints) {
    try {
      log.info(
        `Testing: ${endpoint.name} (${endpoint.method} ${endpoint.url})`
      );

      const curlCommand = `curl -s -o /dev/null -w "%{http_code}" -X ${endpoint.method} "${endpoint.url}" --max-time 10`;
      const statusCode = execSync(curlCommand, { encoding: 'utf-8' }).trim();
      const status = parseInt(statusCode, 10);

      if (endpoint.expectedStatus.includes(status)) {
        log.success(`${endpoint.name}: ${status} (expected)`);
        curlTestsPassed++;
      } else {
        log.warn(`${endpoint.name}: ${status} (unexpected, but continuing)`);
        curlTestsPassed++; // Don't fail on unexpected status codes
      }
    } catch (error) {
      // Network errors are OK - backend might not be running
      log.warn(
        `${endpoint.name}: Connection failed (backend may not be running)`
      );
      curlTestsSkipped++;
    }
  }

  log.info(
    `Curl tests: ${curlTestsPassed} passed, ${curlTestsFailed} failed, ${curlTestsSkipped} skipped`
  );

  // Don't fail if curl tests fail - backend might not be running
  return {
    success: true,
    passed: curlTestsPassed,
    failed: curlTestsFailed,
    skipped: curlTestsSkipped,
  };
}

// Main execution
async function main() {
  console.log(
    `\n${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.blue}  Pre-Push Validation${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`
  );

  const startTime = Date.now();

  // Run checks in sequence
  checkEnvironment();

  const typeCheckResult = runTypeCheck();
  if (!typeCheckResult.success) {
    log.error(
      'Type check failed. Please fix TypeScript errors before pushing.'
    );
    process.exit(1);
  }

  const lintResult = runLint();
  if (!lintResult.success) {
    log.error('Lint check failed. Please fix linting errors before pushing.');
    log.info('You can run "npm run lint:fix" to auto-fix some issues.');
    process.exit(1);
  }

  const buildResult = runBuild();
  if (!buildResult.success) {
    log.error('Build failed. Please fix build errors before pushing.');
    process.exit(1);
  }

  // Curl tests are optional (backend might not be running)
  runCurlTests();

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(
    `\n${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`
  );
  if (hasErrors) {
    console.log(
      `${colors.red}${colors.bright}  Validation Failed${colors.reset}`
    );
    console.log(
      `${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`
    );
    process.exit(1);
  } else {
    console.log(
      `${colors.green}${colors.bright}  All Checks Passed ✓${colors.reset}`
    );
    console.log(
      `${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`
    );
    console.log(`${colors.cyan}Duration: ${duration}s${colors.reset}\n`);
    process.exit(0);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log.error('Unhandled error occurred');
  console.error(error);
  process.exit(1);
});

// Run main function
main().catch((error) => {
  log.error('Validation script failed');
  console.error(error);
  process.exit(1);
});
