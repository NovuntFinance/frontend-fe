# 🚀 Phase 5: Admin Dashboard - Implementation Plan

## 📅 Timeline: Week 5-6
**Status**: Ready to Start
**Prerequisites**: ✅ Phase 4 Complete (All user-facing features)

---

## 🎯 Objectives

Build a comprehensive **admin dashboard** that provides platform oversight, user management, and business analytics. This phase focuses on:

1. **Financial Overview** - Platform-wide metrics and KPIs
2. **User Management** - Complete CRUD operations for users
3. **KYC Approval** - Document review and verification workflow
4. **Transaction Oversight** - Monitor all platform transactions
5. **Analytics & Reports** - Data visualization and insights
6. **System Configuration** - Platform settings and controls

---

## 🏗️ Architecture

### Route Structure
```
/dashboard/admin/
├── overview/          # Financial dashboard (default)
├── users/            # User management
├── kyc/              # KYC approval workflow
├── transactions/     # Transaction monitoring
├── analytics/        # Reports and charts
└── settings/         # System configuration
```

### Access Control
- Only users with `role: 'admin'` can access `/dashboard/admin/*`
- Middleware checks admin status
- Redirects non-admins to main dashboard
- Audit logging for all admin actions

---

## 📦 Features Breakdown

### 1. Admin Overview Dashboard (`/dashboard/admin/overview`)

#### Key Metrics Cards (Top Row)
```typescript
interface PlatformMetrics {
  totalUsers: number;
  totalUsersChange: number; // % change from last month
  
  activeStakes: number;
  activeStakesValue: number;
  activeStakesChange: number;
  
  totalDeposits: number;
  totalDepositsChange: number;
  
  pendingWithdrawals: number;
  pendingWithdrawalsValue: number;
  pendingWithdrawalsChange: number;
  
  monthlyRevenue: number;
  monthlyRevenueChange: number;
  
  kycPending: number;
}
```

**Display**:
- 6 metric cards in responsive grid (3x2 on desktop, 2x3 on tablet, 1x6 on mobile)
- Each card shows:
  - Icon (relevant to metric)
  - Value (large, bold)
  - Label (descriptive)
  - Change indicator (% up/down with arrow and color)
  - Trend sparkline (mini chart showing last 30 days)

#### Charts (Middle Section)
1. **Revenue Chart** (Line chart)
   - Last 12 months revenue
   - Multiple lines: Deposits, Withdrawals, Net Revenue
   - Interactive tooltips
   - Download as PNG/CSV

2. **User Growth Chart** (Area chart)
   - New users per month
   - Cumulative total
   - Gradient fill
   - Interactive hover

3. **Staking Distribution** (Pie/Donut chart)
   - Stakes by type
   - Color-coded segments
   - Percentage labels
   - Legend with values

#### Recent Activity Feed (Right Sidebar)
- Last 20 platform events
- Types: New user, Deposit, Withdrawal, KYC submission, Stake created
- Real-time updates (polling every 30s)
- Click to view details
- Filter by event type

#### Alerts & Notifications (Top Banner)
- High-value withdrawals pending
- KYC documents awaiting review
- System health warnings
- Failed transactions count
- Dismissible alerts

**Technologies**:
- Recharts for data visualization
- React Query for data fetching
- Framer Motion for animations
- date-fns for date formatting

---

### 2. User Management (`/dashboard/admin/users`)

#### User List View
**Features**:
- Table with pagination (50 users per page)
- Search by: email, name, user ID, referral code
- Filter by:
  - Role (all, investor, admin)
  - Status (all, active, suspended, deleted)
  - KYC status (all, approved, pending, rejected, not submitted)
  - Rank (all ranks)
  - Registration date range
- Sort by: Name, Email, Join Date, Total Invested, Rank
- Bulk actions: Export CSV, Send email

**Columns**:
1. Checkbox (for bulk selection)
2. Avatar + Name
3. Email
4. Role badge
5. Rank badge
6. Total Invested
7. KYC Status badge
8. Join Date
9. Status (Active/Suspended)
10. Actions dropdown

#### User Detail View (Modal or Side Panel)
**Tabs**:

1. **Overview Tab**
   - Profile information
   - Avatar, name, email, phone
   - Registration date
   - Last login
   - IP address history
   - Device information
   - Referral code
   - Referred by
   - Total referrals

2. **Financial Tab**
   - Total deposits
   - Total withdrawals
   - Current balance (funded + earnings)
   - Active stakes list
   - Transaction history (paginated)
   - ROI earned
   - Bonuses claimed
   - Quick actions: Add funds, Adjust balance

3. **Activity Tab**
   - Login history (last 50)
   - IP addresses used
   - Device types
   - Session durations
   - Failed login attempts
   - Password change history
   - 2FA status

4. **KYC Tab**
   - Submitted documents (with preview)
   - Verification status
   - Submission date
   - Reviewed by (admin name)
   - Review date
   - Rejection reason (if rejected)
   - Quick approve/reject actions

5. **Referrals Tab**
   - Referral tree visualization
   - Direct referrals list
   - Indirect referrals count
   - Commission earned from referrals
   - Top performing referrals

**Admin Actions**:
- Edit user details
- Change user role
- Suspend/Activate account
- Reset password (send email)
- Enable/Disable 2FA
- Approve/Reject KYC
- Add internal notes
- View audit log
- Delete account (with confirmation)

#### User Creation (Admin can create users)
**Form Fields**:
- Email (required)
- First Name (required)
- Last Name (required)
- Phone Number (optional)
- Role (investor/admin)
- Send welcome email (checkbox)
- Auto-generate password (checkbox)

---

### 3. KYC Approval Workflow (`/dashboard/admin/kyc`)

#### KYC Queue View
**Status Tabs**:
1. Pending (default) - Awaiting review
2. Approved - Already verified
3. Rejected - Declined submissions
4. All - Complete history

**Filters**:
- Submission date range
- Document type (ID, Proof of Address, Both)
- Priority (new submissions first, oldest first)
- User rank (prioritize higher ranks)

#### KYC Review Card
Each submission displays:
- User avatar + name
- User email
- Submission date
- Time in queue (e.g., "2 days ago")
- User rank badge
- Document type badges
- Quick view button
- Review button

#### Document Review Modal
**Layout** (Split View):

**Left Side - Documents**:
- ID Document
  - Full-size image viewer
  - Zoom controls (+/-)
  - Rotate controls
  - Download button
  - Document type (Passport, Driver's License, National ID)
  
- Proof of Address Document
  - Full-size image viewer
  - Same controls as ID
  - Document type (Utility Bill, Bank Statement)

**Right Side - Review Panel**:
- User Information
  - Name from profile
  - Email
  - Registration date
  - Current rank
  - Total invested
  - Number of active stakes

- Document Checklist
  - [ ] Document is clear and readable
  - [ ] Photo/Scan quality is acceptable
  - [ ] Name matches profile
  - [ ] Document is not expired
  - [ ] Address is visible (for proof of address)
  - [ ] Document is not altered/forged

- Decision Form
  - **Approve** button (green)
    - Confirmation dialog
    - Success toast
    - User receives email notification
    - Status updates to "Verified"
  
  - **Reject** button (red)
    - Rejection reason (required)
      - Document unclear/blurry
      - Name mismatch
      - Expired document
      - Invalid document type
      - Suspected fraud
      - Other (text input)
    - Confirmation dialog
    - User receives email with rejection reason
    - User can resubmit
  
  - **Request More Info** button (amber)
    - Comment box (what's needed)
    - Email sent to user
    - Submission stays in pending

- Internal Notes
  - Text area for admin notes
  - Visible only to admins
  - Timestamped with admin name

**Keyboard Shortcuts**:
- `A` - Approve
- `R` - Reject
- `I` - Request info
- `N` - Next submission
- `P` - Previous submission
- `Esc` - Close modal

---

### 4. Transaction Monitoring (`/dashboard/admin/transactions`)

#### Transaction List View
**Features**:
- Real-time updates (WebSocket or polling)
- Advanced filters (same as user transactions page + more)
- Additional filters:
  - User ID search
  - User email search
  - Amount range
  - Failed transactions only
  - Flagged transactions
  - Requires attention
- Export to CSV (with filters)
- Transaction analytics sidebar

**Columns**:
1. Transaction ID
2. User (avatar + name)
3. Type badge
4. Amount
5. Status badge
6. Wallet type
7. Date/Time
8. Actions (view, flag, investigate)

#### Transaction Detail View
**Information Sections**:

1. **Transaction Overview**
   - ID, Reference
   - Type, Status
   - Amount, Currency
   - Fee (if applicable)
   - Net amount
   - Created, Updated, Completed dates

2. **User Information**
   - Name, Email
   - User ID
   - Rank
   - Account status
   - KYC status
   - Link to user profile

3. **Transaction Details**
   - Source wallet
   - Destination wallet
   - Related stake (if applicable)
   - Related withdrawal (if applicable)
   - Blockchain transaction hash (for crypto)
   - Confirmation count

4. **Metadata**
   - IP address
   - Device type
   - Location (if available)
   - User agent
   - Additional data (JSON viewer)

5. **Admin Actions**
   - Flag transaction (suspicious)
   - Add to investigation queue
   - Add internal note
   - Reverse transaction (with approval)
   - Mark as reviewed
   - Contact user

#### Transaction Analytics (Right Sidebar)
- Today's volume
- 24h comparison
- Average transaction size
- Failed rate
- Top transaction types
- Hourly distribution chart

---

### 5. Analytics & Reports (`/dashboard/admin/analytics`)

#### Report Types (Tab Navigation)

**1. Financial Reports Tab**
- Revenue Report
  - Daily/Weekly/Monthly/Yearly
  - Deposits vs Withdrawals
  - Net revenue chart
  - Download PDF/Excel
  
- Staking Report
  - Total stakes by type
  - ROI paid out
  - Active vs completed
  - Average stake size
  - Distribution by rank

- Withdrawal Report
  - Pending count and value
  - Approved count and value
  - Processing times
  - Average withdrawal amount
  - Rejection reasons breakdown

**2. User Reports Tab**
- User Growth Report
  - New registrations (daily/weekly/monthly)
  - Growth rate
  - Churn rate
  - Retention rate
  - Cohort analysis

- User Activity Report
  - Daily active users
  - Monthly active users
  - Session duration
  - Page views
  - Feature usage

- KYC Report
  - Submission rate
  - Approval rate
  - Average review time
  - Rejection reasons
  - Resubmission rate

**3. Referral Reports Tab**
- Referral Performance
  - Top referrers (by count)
  - Top referrers (by value)
  - Conversion rates
  - Commission paid
  - Referral tree depth

**4. Custom Reports Tab**
- Report builder
  - Select metrics
  - Choose date range
  - Apply filters
  - Generate chart/table
  - Save report template
  - Schedule automated reports (email)

#### Visualization Options
- Line charts (time series)
- Bar charts (comparisons)
- Pie/Donut charts (distributions)
- Area charts (cumulative)
- Heat maps (activity patterns)
- Tables (detailed data)

#### Export Options
- CSV (data)
- PDF (formatted report)
- Excel (with formulas)
- PNG (charts only)
- Email report

---

### 6. System Settings (`/dashboard/admin/settings`)

#### Settings Categories (Tab Navigation)

**1. Platform Configuration Tab**
- Platform Name
- Platform Description
- Contact Email
- Support Email
- Platform URL
- Timezone
- Currency
- Language (default)
- Maintenance Mode toggle
  - Enable/Disable
  - Custom message
  - Allowed IPs (admin access)

**2. Business Rules Tab**
- Minimum Deposit Amount
- Maximum Deposit Amount
- Minimum Withdrawal Amount
- Maximum Withdrawal Amount
- Withdrawal Fee Percentage
- Fixed Withdrawal Fee
- ROI Calculation Method
- ROI Distribution Frequency
- Referral Commission Rates (by level)
- Bonus Conditions
- Rank Requirements (thresholds)

**3. Email Templates Tab**
- Welcome Email
- Email Verification
- Password Reset
- Deposit Confirmation
- Withdrawal Request
- Withdrawal Approved
- KYC Submitted
- KYC Approved
- KYC Rejected
- Stake Created
- ROI Payout
- Bonus Claimed
- Custom variables available
- Preview function
- Test email send

**4. Security Settings Tab**
- Password Requirements
  - Minimum length
  - Require uppercase
  - Require lowercase
  - Require numbers
  - Require special characters
  - Password expiry (days)
  
- Session Settings
  - Session timeout (minutes)
  - Max concurrent sessions
  - Remember me duration
  
- 2FA Settings
  - Enforce 2FA for all users
  - Enforce 2FA for admins
  - 2FA backup codes
  
- IP Restrictions
  - Whitelist IPs (admin access)
  - Blacklist IPs (banned users)
  - GeoIP restrictions

**5. API Configuration Tab**
- API Keys management
- Rate limiting
- Webhook URLs
- Third-party integrations
- Blockchain settings (if applicable)

**6. Admin Users Tab**
- List of admin users
- Add new admin
- Edit admin permissions
- Role-based access control (RBAC)
- Admin activity log
- Revoke admin access

**7. Backup & Maintenance Tab**
- Database backup schedule
- Last backup date/time
- Manual backup trigger
- Restore from backup (with confirmation)
- System health checks
- Clear cache
- Rebuild indexes

---

## 🎨 Design System

### Color Coding
- **Success**: Green (approvals, positive metrics)
- **Warning**: Amber (pending actions, cautions)
- **Danger**: Red (rejections, negative metrics, critical)
- **Info**: Blue (informational)
- **Neutral**: Gray (inactive, secondary)

### Admin-Specific Components

#### 1. Metric Card
```tsx
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: number; // % change
  trend?: number[]; // sparkline data
  loading?: boolean;
}
```

#### 2. Data Table
- Sortable columns
- Filterable
- Paginated
- Row selection
- Bulk actions
- Column visibility toggle
- Responsive (stack on mobile)

#### 3. Status Badge
```tsx
type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
interface StatusBadgeProps {
  status: StatusType;
  label: string;
  icon?: React.ReactNode;
}
```

#### 4. Action Menu (Dropdown)
- Edit
- View Details
- Suspend/Activate
- Delete (with confirmation)
- More options

#### 5. Confirmation Dialog
- Clear title
- Descriptive message
- Warning for destructive actions
- Input confirmation for critical actions (e.g., type "DELETE")
- Cancel/Confirm buttons

#### 6. Activity Timeline
- Chronological events
- Icons for event types
- Timestamps
- Actor (who did it)
- Expandable details

---

## 🔧 Technical Implementation

### State Management
```typescript
// Admin store (Zustand)
interface AdminStore {
  // Filters
  userFilters: UserFilters;
  transactionFilters: TransactionFilters;
  kycFilters: KYCFilters;
  
  // Selected items
  selectedUsers: string[];
  selectedTransactions: string[];
  
  // UI state
  sidebarOpen: boolean;
  detailPanelOpen: boolean;
  
  // Actions
  setUserFilters: (filters: UserFilters) => void;
  toggleSelectUser: (userId: string) => void;
  clearSelections: () => void;
}
```

### API Endpoints
```typescript
// Admin API
GET    /api/admin/metrics              // Dashboard metrics
GET    /api/admin/users                // List users
GET    /api/admin/users/:id            // User details
PUT    /api/admin/users/:id            // Update user
DELETE /api/admin/users/:id            // Delete user
POST   /api/admin/users                // Create user

GET    /api/admin/kyc/pending          // Pending KYC
GET    /api/admin/kyc/:id              // KYC details
POST   /api/admin/kyc/:id/approve      // Approve KYC
POST   /api/admin/kyc/:id/reject       // Reject KYC

GET    /api/admin/transactions         // All transactions
GET    /api/admin/transactions/:id     // Transaction details
POST   /api/admin/transactions/:id/flag // Flag transaction

GET    /api/admin/reports/:type        // Generate report
GET    /api/admin/settings             // Platform settings
PUT    /api/admin/settings             // Update settings
```

### Query Hooks
```typescript
// src/lib/admin-queries.ts
export function useAdminMetrics() { }
export function useAdminUsers(filters: UserFilters) { }
export function useAdminUser(id: string) { }
export function useUpdateUser() { }
export function useDeleteUser() { }

export function usePendingKYC() { }
export function useApproveKYC() { }
export function useRejectKYC() { }

export function useAdminTransactions(filters: TransactionFilters) { }
export function useFlagTransaction() { }

export function useAdminReports() { }
export function usePlatformSettings() { }
export function useUpdateSettings() { }
```

---

## 📊 Data Structures

### Admin Metrics
```typescript
interface PlatformMetrics {
  totalUsers: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
  
  totalDeposits: number;
  depositsThisMonth: number;
  depositGrowthRate: number;
  
  totalWithdrawals: number;
  pendingWithdrawals: number;
  withdrawalValue: number;
  
  activeStakes: number;
  activeStakesValue: number;
  
  monthlyRevenue: number;
  revenueGrowthRate: number;
  
  kycPending: number;
  kycApprovalRate: number;
  
  failedTransactions: number;
  
  updatedAt: string;
}
```

### User Management
```typescript
interface AdminUser extends User {
  totalDeposits: number;
  totalWithdrawals: number;
  currentBalance: number;
  activeStakesCount: number;
  totalStakesValue: number;
  referralCount: number;
  commissionEarned: number;
  lastLoginAt: string;
  lastLoginIp: string;
  loginCount: number;
  failedLoginAttempts: number;
  notes: AdminNote[];
  flags: UserFlag[];
}

interface AdminNote {
  id: string;
  adminId: string;
  adminName: string;
  content: string;
  createdAt: string;
}

interface UserFlag {
  id: string;
  type: 'suspicious' | 'vip' | 'warning';
  reason: string;
  flaggedBy: string;
  flaggedAt: string;
}
```

### KYC Management
```typescript
interface KYCSubmission {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    rank: string;
    totalInvested: number;
  };
  documents: {
    idDocument: {
      url: string;
      type: string;
      uploadedAt: string;
    };
    addressProof: {
      url: string;
      type: string;
      uploadedAt: string;
    };
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  notes?: string;
}
```

---

## 🚦 Implementation Order

### Week 5: Core Admin Features

**Day 1-2: Admin Layout & Overview**
- [ ] Create admin layout wrapper
- [ ] Admin sidebar navigation
- [ ] Role-based access middleware
- [ ] Overview dashboard page
- [ ] Metrics cards component
- [ ] API: GET /api/admin/metrics

**Day 3-4: User Management**
- [ ] User list page with table
- [ ] User filters and search
- [ ] User detail modal
- [ ] Edit user functionality
- [ ] API: User CRUD endpoints

**Day 5: KYC Approval**
- [ ] KYC queue page
- [ ] KYC review modal
- [ ] Document viewer
- [ ] Approve/Reject actions
- [ ] API: KYC approval endpoints

### Week 6: Advanced Features & Polish

**Day 1-2: Transaction Monitoring**
- [ ] Transaction list page
- [ ] Advanced filters
- [ ] Transaction detail view
- [ ] Flag/investigate actions
- [ ] Real-time updates

**Day 3: Analytics & Reports**
- [ ] Reports page layout
- [ ] Chart components
- [ ] Report generation
- [ ] Export functionality

**Day 4: System Settings**
- [ ] Settings page layout
- [ ] Platform configuration
- [ ] Business rules editor
- [ ] Email template editor

**Day 5: Testing & Refinement**
- [ ] Admin flow testing
- [ ] Permission testing
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] Documentation

---

## ✅ Success Criteria

### Functional Requirements
- ✅ Admin can view platform metrics
- ✅ Admin can manage users (CRUD)
- ✅ Admin can approve/reject KYC
- ✅ Admin can monitor transactions
- ✅ Admin can generate reports
- ✅ Admin can configure platform settings
- ✅ Role-based access control works
- ✅ All actions are audited

### Non-Functional Requirements
- ✅ Load time < 2s for dashboard
- ✅ Table pagination smooth
- ✅ Filters work without lag
- ✅ Charts render efficiently
- ✅ Responsive on tablet (minimum)
- ✅ Accessible (keyboard navigation)
- ✅ Secure (no data leaks)

---

## 📚 Libraries Needed

### Already Installed
- ✅ Framer Motion (animations)
- ✅ React Query (data fetching)
- ✅ date-fns (date formatting)
- ✅ Lucide React (icons)
- ✅ shadcn/ui (components)

### To Install
```bash
# Charts
pnpm add recharts

# Tables
pnpm add @tanstack/react-table

# Excel export
pnpm add xlsx

# PDF generation
pnpm add jspdf jspdf-autotable

# JSON viewer
pnpm add react-json-view
```

---

## 🎯 Next Steps

1. **Review this plan** with stakeholders
2. **Create admin layout** and routing
3. **Set up admin API endpoints** (backend)
4. **Start with Overview Dashboard** (highest priority)
5. **Iterate** through each feature
6. **Test thoroughly** before production

---

## 📝 Notes

- Admin pages should have **distinct visual identity** (darker sidebar, admin badge)
- All admin actions must be **logged** for audit trail
- Sensitive operations require **additional confirmation**
- Consider **role hierarchy** (super admin vs regular admin)
- Plan for **future features**: Notifications center, Chat support, AI insights

---

**Ready to build? Let's make the admin dashboard exceptional!** 🚀
