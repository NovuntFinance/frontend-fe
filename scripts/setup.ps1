# PowerShell setup script for Novunt frontend
# Run from project root in PowerShell: ./scripts/setup.ps1

Write-Host "1/6 - Installing npm dependencies (this may take a few minutes)" -ForegroundColor Cyan
npm install

Write-Host "2/6 - Installing Tailwind plugins (devDependencies)" -ForegroundColor Cyan
npm install -D tailwindcss-animate

Write-Host "3/6 - Creating recommended folder structure" -ForegroundColor Cyan
New-Item -Path "src/lib" -ItemType Directory -Force | Out-Null
New-Item -Path "src/hooks" -ItemType Directory -Force | Out-Null
New-Item -Path "src/store" -ItemType Directory -Force | Out-Null
New-Item -Path "src/types" -ItemType Directory -Force | Out-Null
New-Item -Path "src/styles" -ItemType Directory -Force | Out-Null

New-Item -Path "src/components/ui" -ItemType Directory -Force | Out-Null
New-Item -Path "src/components/layout" -ItemType Directory -Force | Out-Null
New-Item -Path "src/components/dashboard" -ItemType Directory -Force | Out-Null
New-Item -Path "src/components/wallets" -ItemType Directory -Force | Out-Null
New-Item -Path "src/components/stakes" -ItemType Directory -Force | Out-Null
New-Item -Path "src/components/transactions" -ItemType Directory -Force | Out-Null
New-Item -Path "src/components/withdrawals" -ItemType Directory -Force | Out-Null
New-Item -Path "src/components/referrals" -ItemType Directory -Force | Out-Null
New-Item -Path "src/components/admin" -ItemType Directory -Force | Out-Null
New-Item -Path "src/components/auth" -ItemType Directory -Force | Out-Null
New-Item -Path "src/components/common" -ItemType Directory -Force | Out-Null

New-Item -Path "src/app/(auth)/login" -ItemType Directory -Force | Out-Null
New-Item -Path "src/app/(auth)/signup" -ItemType Directory -Force | Out-Null
New-Item -Path "src/app/(auth)/verify-email" -ItemType Directory -Force | Out-Null
New-Item -Path "src/app/(auth)/forgot-password" -ItemType Directory -Force | Out-Null
New-Item -Path "src/app/(auth)/reset-password" -ItemType Directory -Force | Out-Null

New-Item -Path "src/app/(dashboard)/dashboard" -ItemType Directory -Force | Out-Null
New-Item -Path "src/app/(dashboard)/wallets" -ItemType Directory -Force | Out-Null
New-Item -Path "src/app/(dashboard)/stakes" -ItemType Directory -Force | Out-Null
New-Item -Path "src/app/(dashboard)/transactions" -ItemType Directory -Force | Out-Null
New-Item -Path "src/app/(dashboard)/withdrawals" -ItemType Directory -Force | Out-Null
New-Item -Path "src/app/(dashboard)/referrals" -ItemType Directory -Force | Out-Null
New-Item -Path "src/app/(dashboard)/bonuses" -ItemType Directory -Force | Out-Null
New-Item -Path "src/app/(dashboard)/profile" -ItemType Directory -Force | Out-Null
New-Item -Path "src/app/(dashboard)/settings" -ItemType Directory -Force | Out-Null

New-Item -Path "src/app/(admin)/admin/dashboard" -ItemType Directory -Force | Out-Null
New-Item -Path "src/app/(admin)/admin/users" -ItemType Directory -Force | Out-Null
New-Item -Path "src/app/(admin)/admin/transactions" -ItemType Directory -Force | Out-Null
New-Item -Path "src/app/(admin)/admin/stakes" -ItemType Directory -Force | Out-Null
New-Item -Path "src/app/(admin)/admin/withdrawals" -ItemType Directory -Force | Out-Null
New-Item -Path "src/app/(admin)/admin/kyc" -ItemType Directory -Force | Out-Null
New-Item -Path "src/app/(admin)/admin/analytics" -ItemType Directory -Force | Out-Null

Write-Host "4/6 - Initializing shadcn/ui (interactive)" -ForegroundColor Cyan
Write-Host "When prompted, answer: TypeScript: Yes, Style: Default, Base color: Slate, Global CSS: src/app/globals.css, Use CSS variables: Yes, Tailwind config: tailwind.config.ts, Component alias: @/components, Utils alias: @/lib/utils, RSC: Yes"
npx shadcn-ui@latest init
if ($LASTEXITCODE -ne 0) { Write-Host "shadcn init exited with non-zero code" -ForegroundColor Yellow }

Write-Host "5/6 - Adding shadcn components" -ForegroundColor Cyan
npx shadcn-ui@latest add button card dialog input select toast tabs switch dropdown-menu avatar badge skeleton form label
if ($LASTEXITCODE -ne 0) { Write-Host "shadcn add exited with non-zero code" -ForegroundColor Yellow }

Write-Host "6/6 - Setup complete. Start the dev server with 'npm run dev'" -ForegroundColor Green
