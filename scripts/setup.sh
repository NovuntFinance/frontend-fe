#!/usr/bin/env bash
set -euo pipefail

# Setup script for Novunt frontend (Bash)
# Run from project root: bash ./scripts/setup.sh

echo "1/6 - Installing dependencies with pnpm (this may take a few minutes)"
pnpm install

echo "2/6 - Installing Tailwind plugins (devDependencies)"
pnpm install -D tailwindcss-animate

echo "3/6 - Creating recommended folder structure"
mkdir -p src/lib src/hooks src/store src/types src/styles
mkdir -p src/components/ui src/components/layout src/components/dashboard src/components/wallets src/components/stakes src/components/transactions src/components/withdrawals src/components/referrals src/components/admin src/components/auth src/components/common
mkdir -p "src/app/(auth)/login" "src/app/(auth)/signup" "src/app/(auth)/verify-email" "src/app/(auth)/forgot-password" "src/app/(auth)/reset-password"
mkdir -p "src/app/(dashboard)/dashboard" "src/app/(dashboard)/wallets" "src/app/(dashboard)/stakes" "src/app/(dashboard)/transactions" "src/app/(dashboard)/withdrawals" "src/app/(dashboard)/referrals" "src/app/(dashboard)/bonuses" "src/app/(dashboard)/profile" "src/app/(dashboard)/settings"
mkdir -p "src/app/(admin)/admin/dashboard" "src/app/(admin)/admin/users" "src/app/(admin)/admin/transactions" "src/app/(admin)/admin/stakes" "src/app/(admin)/admin/withdrawals" "src/app/(admin)/admin/kyc" "src/app/(admin)/admin/analytics"

echo "4/6 - Initializing shadcn/ui (interactive)"
echo "The init command is interactive. When prompted, answer: TypeScript: Yes, Style: Default, Base color: Slate, Global CSS: src/app/globals.css, Use CSS variables: Yes, Tailwind config: tailwind.config.ts, Component alias: @/components, Utils alias: @/lib/utils, RSC: Yes"
npx shadcn-ui@latest init || true

echo "5/6 - Adding shadcn components (non-interactive)"
npx shadcn-ui@latest add button card dialog input select toast tabs switch dropdown-menu avatar badge skeleton form label || true

echo "6/6 - Starting dev server"
echo "Run 'pnpm dev' yourself after the script finishes if you prefer not to start it from the script."
# Uncomment the next line if you want this script to start the dev server automatically
# pnpm dev

echo "Setup script finished. If any step above failed, please run the failed command manually and follow any interactive prompts."
