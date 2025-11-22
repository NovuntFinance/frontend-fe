# Novunt Finance - Frontend

Modern, high-performance frontend for Novunt Finance platform built with Next.js 15, React 19, TypeScript, and TailwindCSS.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.local.example .env.local

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **React**: 19.1.0
- **TypeScript**: 5+
- **Styling**: TailwindCSS 4
- **UI Components**: Radix UI + Custom Components
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier
- **Icons**: Lucide React

## 🏗️ Project Structure

```
frontend-fe/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── (auth)/           # Auth-related pages
│   │   ├── (dashboard)/      # Dashboard pages
│   │   └── (admin)/          # Admin pages
│   ├── components/          # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── auth/             # Authentication components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── wallet/           # Wallet components
│   │   ├── stake/            # Staking components
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions & configs
│   │   ├── api.ts            # API client
│   │   ├── logger.ts         # Logging utility
│   │   ├── error-utils.ts    # Error handling
│   │   ├── features.ts       # Feature flags
│   │   ├── queries/          # React Query hooks
│   │   └── mutations/        # React Query mutations
│   ├── services/            # API service layers
│   ├── store/               # Zustand stores
│   ├── types/               # TypeScript type definitions
│   └── styles/              # Global styles
├── public/                  # Static assets
├── __mocks__/              # Jest mocks
└── ...config files
```

## 🛠 Available Scripts

```bash
# Development
pnpm dev                  # Start dev server with Turbo
pnpm dev:normal           # Start dev server (normal mode)

# Building
pnpm build                # Build for production
pnpm start                # Start production server

# Code Quality
pnpm lint                 # Run ESLint
pnpm lint:fix             # Fix ESLint errors
pnpm typecheck            # Type-check TypeScript
pnpm typecheck:watch      # Type-check (watch mode)
pnpm format               # Check code formatting
pnpm format:fix           # Fix code formatting

# Testing
pnpm test                 # Run tests
pnpm test:watch           # Run tests in watch mode
pnpm test:coverage        # Run tests with coverage

# Analysis
pnpm analyze              # Analyze bundle size

# Utilities
pnpm optimize-bg          # Optimize background images
```

## 🎨 Features

### Authentication
- Email/password login & registration
- JWT-based authentication
- Password reset flow
- Biometric authentication support
- Session management

### Dashboard
- Real-time wallet balances
- Staking overview
- Transaction history
- Referral tracking
- Rank progression

### Wallet Management
- Deposit wallet (for staking)
- Earnings wallet (withdrawable)
- Transaction history
- P2P transfers (planned)

### Staking
- Create stakes
- View active stakes
- Track ROI and profits
- Weekly payout tracking

### Profile & Settings
- Profile management
- KYC verification
- Two-factor authentication
- Notification preferences

## 🔒 Environment Variables

Create a `.env.local` file with:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Feature Flags
NEXT_PUBLIC_FEATURE_STAKING_V2=false
NEXT_PUBLIC_FEATURE_ANALYTICS=false
NEXT_PUBLIC_FEATURE_ERROR_TRACKING=true

# Debug
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_ENABLE_LOGGING=true
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test src/lib/__tests__/error-utils.test.ts

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## 📝 Code Style & Conventions

### TypeScript
- Strict mode enabled
- No implicit any
- No unused variables
- Comprehensive type definitions

### Components
- Functional components with TypeScript
- Use React hooks
- Implement proper error boundaries
- Add PropTypes/JSDoc for complex props

### State Management
- Zustand for global state
- React Query for server state
- Local state with useState when appropriate

### Styling
- TailwindCSS utility classes
- Component variants with CVA
- Responsive design mobile-first
- Dark mode support

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

### Manual Deployment

```bash
# Build
pnpm build

# Preview build
pnpm start
```

## 📚 Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [API Integration](./docs/API_INTEGRATION.md)
- [Component Guidelines](./docs/ COMPONENTS.md)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📄 License

Proprietary - Novunt Finance © 2024

## 🆘 Support

For issues or questions, contact the development team.
