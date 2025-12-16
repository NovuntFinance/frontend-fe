# Backend API Integration: Information Marquee Announcements

This document provides detailed specifications for implementing the backend API endpoints that will power the information marquee component in the frontend dashboard header.

## Overview

The information marquee displays scrolling announcements that can be managed by admins. These announcements appear in the dashboard header and can include promotional messages, security notices, feature updates, and other platform information.

## API Endpoints

### 1. Get Active Announcements (Public)

**Endpoint:** `GET /api/v1/announcements/active`

**Description:** Returns all active announcements that should be displayed to users. This endpoint is public (no authentication required) and should filter announcements based on:

- `isActive: true`
- Current date is between `startDate` and `endDate` (if provided)
- Sorted by `priority` (ascending) and `createdAt` (ascending)

**Request:**

```http
GET /api/v1/announcements/active
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "text": "🚀 New Feature: Enhanced Staking Rewards - Earn up to 18% ROS",
      "type": "promo",
      "icon": "🚀",
      "priority": 1,
      "isActive": true,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.999Z",
      "targetAudience": "all",
      "linkUrl": null,
      "linkText": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "uuid-string-2",
      "text": "🔒 Your security is our priority - All transactions are encrypted",
      "type": "info",
      "icon": "🔒",
      "priority": 2,
      "isActive": true,
      "startDate": null,
      "endDate": null,
      "targetAudience": "all",
      "linkUrl": null,
      "linkText": null,
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-10T08:00:00.000Z"
    }
  ],
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

**Response Status Codes:**

- `200 OK` - Success
- `404 Not Found` - Endpoint not implemented yet (frontend handles gracefully)
- `500 Internal Server Error` - Server error

**Notes:**

- If no active announcements exist, return an empty array `[]`
- Announcements should be filtered server-side based on current date/time
- If `startDate` is null, consider the announcement as active from creation
- If `endDate` is null, consider the announcement as active indefinitely

---

### 2. Get All Announcements (Admin Only)

**Endpoint:** `GET /api/v1/announcements`

**Description:** Returns all announcements (active and inactive) for admin management. Requires authentication and admin role.

**Request:**

```http
GET /api/v1/announcements
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "text": "Announcement text",
      "type": "promo",
      "icon": "🚀",
      "priority": 1,
      "isActive": true,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.999Z",
      "targetAudience": "all",
      "linkUrl": null,
      "linkText": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

**Response Status Codes:**

- `200 OK` - Success
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized (not admin)
- `500 Internal Server Error` - Server error

---

### 3. Get Announcement by ID (Admin Only)

**Endpoint:** `GET /api/v1/announcements/:id`

**Description:** Returns a single announcement by ID. Requires authentication and admin role.

**Request:**

```http
GET /api/v1/announcements/{id}
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "text": "Announcement text",
    "type": "promo",
    "icon": "🚀",
    "priority": 1,
    "isActive": true,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z",
    "targetAudience": "all",
    "linkUrl": null,
    "linkText": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

**Response Status Codes:**

- `200 OK` - Success
- `404 Not Found` - Announcement not found
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized (not admin)

---

### 4. Create Announcement (Admin Only)

**Endpoint:** `POST /api/v1/announcements`

**Description:** Creates a new announcement. Requires authentication and admin role.

**Request:**

```http
POST /api/v1/announcements
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "text": "🚀 New Feature: Enhanced Staking Rewards - Earn up to 18% ROS",
  "type": "promo",
  "icon": "🚀",
  "priority": 1,
  "isActive": true,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z",
  "targetAudience": "all",
  "linkUrl": null,
  "linkText": null
}
```

**Request Body Fields:**

- `text` (required, string): The announcement text to display
- `type` (required, enum: "info" | "success" | "warning" | "promo"): Announcement type for styling
- `icon` (optional, string): Emoji or icon identifier
- `priority` (optional, number): Display priority (lower = higher priority, default: 999)
- `isActive` (optional, boolean): Whether announcement is active (default: true)
- `startDate` (optional, ISO string): When to start showing (null = show immediately)
- `endDate` (optional, ISO string): When to stop showing (null = show indefinitely)
- `targetAudience` (optional, enum: "all" | "new" | "existing" | "premium", default: "all")
- `linkUrl` (optional, string): Optional URL to navigate when clicked
- `linkText` (optional, string): Optional text for the link

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "text": "🚀 New Feature: Enhanced Staking Rewards - Earn up to 18% ROS",
    "type": "promo",
    "icon": "🚀",
    "priority": 1,
    "isActive": true,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z",
    "targetAudience": "all",
    "linkUrl": null,
    "linkText": null,
    "createdAt": "2024-01-20T12:00:00.000Z",
    "updatedAt": "2024-01-20T12:00:00.000Z"
  },
  "message": "Announcement created successfully"
}
```

**Response Status Codes:**

- `201 Created` - Success
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized (not admin)
- `500 Internal Server Error` - Server error

**Validation Rules:**

- `text` must be present and non-empty (max 500 characters recommended)
- `type` must be one of: "info", "success", "warning", "promo"
- `priority` must be a positive number
- `startDate` must be before `endDate` if both are provided
- `targetAudience` must be one of: "all", "new", "existing", "premium"

---

### 5. Update Announcement (Admin Only)

**Endpoint:** `PATCH /api/v1/announcements/:id`

**Description:** Updates an existing announcement. Requires authentication and admin role.

**Request:**

```http
PATCH /api/v1/announcements/{id}
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "text": "Updated announcement text",
  "isActive": false,
  "priority": 5
}
```

All fields are optional. Only provided fields will be updated.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "text": "Updated announcement text",
    "type": "promo",
    "icon": "🚀",
    "priority": 5,
    "isActive": false,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z",
    "targetAudience": "all",
    "linkUrl": null,
    "linkText": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T13:00:00.000Z"
  },
  "message": "Announcement updated successfully"
}
```

**Response Status Codes:**

- `200 OK` - Success
- `400 Bad Request` - Validation error
- `404 Not Found` - Announcement not found
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized (not admin)
- `500 Internal Server Error` - Server error

---

### 6. Delete Announcement (Admin Only)

**Endpoint:** `DELETE /api/v1/announcements/:id`

**Description:** Deletes an announcement. Requires authentication and admin role.

**Request:**

```http
DELETE /api/v1/announcements/{id}
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "message": "Announcement deleted successfully"
}
```

**Response Status Codes:**

- `200 OK` - Success
- `404 Not Found` - Announcement not found
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized (not admin)
- `500 Internal Server Error` - Server error

---

### 7. Toggle Announcement Status (Admin Only)

**Endpoint:** `PATCH /api/v1/announcements/:id/toggle`

**Description:** Toggles the active status of an announcement. Requires authentication and admin role.

**Request:**

```http
PATCH /api/v1/announcements/{id}/toggle
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "isActive": false
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "text": "Announcement text",
    "type": "promo",
    "icon": "🚀",
    "priority": 1,
    "isActive": false,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z",
    "targetAudience": "all",
    "linkUrl": null,
    "linkText": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:00:00.000Z"
  },
  "message": "Announcement status updated successfully"
}
```

**Response Status Codes:**

- `200 OK` - Success
- `404 Not Found` - Announcement not found
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized (not admin)
- `500 Internal Server Error` - Server error

---

## Data Model

### Announcement Schema

```typescript
interface Announcement {
  id: string; // UUID or unique identifier
  text: string; // Required: Announcement text (max 500 chars)
  type: 'info' | 'success' | 'warning' | 'promo'; // Required: Announcement type
  icon?: string; // Optional: Emoji or icon identifier
  priority?: number; // Optional: Display priority (default: 999, lower = higher priority)
  isActive: boolean; // Required: Whether announcement is active
  startDate?: string; // Optional: ISO date string - when to start showing
  endDate?: string; // Optional: ISO date string - when to stop showing
  targetAudience?: 'all' | 'new' | 'existing' | 'premium'; // Optional: Audience targeting
  linkUrl?: string; // Optional: URL to navigate when clicked
  linkText?: string; // Optional: Text for the link
  createdAt: string; // ISO date string - creation timestamp
  updatedAt: string; // ISO date string - last update timestamp
}
```

### Database Schema Example (MongoDB/Mongoose)

```javascript
const announcementSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['info', 'success', 'warning', 'promo'],
      default: 'info',
    },
    icon: {
      type: String,
      trim: true,
    },
    priority: {
      type: Number,
      default: 999,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    startDate: {
      type: Date,
      index: true,
    },
    endDate: {
      type: Date,
      index: true,
    },
    targetAudience: {
      type: String,
      enum: ['all', 'new', 'existing', 'premium'],
      default: 'all',
    },
    linkUrl: {
      type: String,
      trim: true,
    },
    linkText: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'announcements',
  }
);
```

---

## Business Logic

### Active Announcements Filter

The `/active` endpoint should filter announcements as follows:

1. **Filter by `isActive`:**
   - Only include announcements where `isActive === true`

2. **Filter by Date Range:**
   - If `startDate` is provided and current date is before `startDate`, exclude the announcement
   - If `endDate` is provided and current date is after `endDate`, exclude the announcement
   - If both `startDate` and `endDate` are null, include the announcement (active indefinitely)

3. **Sort Results:**
   - Primary sort: `priority` (ascending) - lower numbers appear first
   - Secondary sort: `createdAt` (ascending) - older announcements appear first at same priority

### Example Query (MongoDB)

```javascript
const now = new Date();

const activeAnnouncements = await Announcement.find({
  isActive: true,
  $or: [{ startDate: null }, { startDate: { $lte: now } }],
  $or: [{ endDate: null }, { endDate: { $gte: now } }],
})
  .sort({ priority: 1, createdAt: 1 })
  .select(
    'id text type icon priority isActive startDate endDate targetAudience linkUrl linkText createdAt updatedAt'
  );
```

---

## Admin Dashboard Integration

### Recommended Admin Interface Features

1. **List View:**
   - Display all announcements in a table
   - Show columns: Text (truncated), Type, Priority, Status, Start Date, End Date
   - Filter by: Active/Inactive, Type, Date Range
   - Sort by: Priority, Created Date, Updated Date

2. **Create/Edit Form:**
   - Text input (with character counter, max 500)
   - Type selector (dropdown: info, success, warning, promo)
   - Icon picker (optional emoji selector)
   - Priority input (number)
   - Active toggle (checkbox)
   - Start Date picker (optional)
   - End Date picker (optional)
   - Target Audience selector (dropdown)
   - Link URL input (optional)
   - Link Text input (optional)
   - Preview section showing how announcement will appear

3. **Quick Actions:**
   - Toggle active/inactive status
   - Duplicate announcement
   - Delete with confirmation
   - Reorder by priority (drag and drop)

---

## Frontend Integration Details

### Frontend Implementation Status

✅ **Completed:**

- API service layer (`src/services/announcementsApi.ts`)
- TypeScript types (`src/types/announcement.ts`)
- React Query hook (`src/lib/queries.ts` - `useActiveAnnouncements`)
- Marquee component (`src/components/ui/info-marquee.tsx`)
- Dashboard header integration (`src/app/(dashboard)/dashboard/layout.tsx`)

### Frontend Behavior

1. **Automatic Fetching:**
   - Frontend automatically fetches announcements on dashboard load
   - Refetches every 2 minutes to catch new announcements
   - Refetches when user returns to the browser tab

2. **Graceful Degradation:**
   - If API endpoint returns 404 (not implemented), frontend shows fallback message
   - If API fails, frontend shows default welcome message
   - Component doesn't break if no announcements are returned

3. **Caching:**
   - React Query caches announcements for 2 minutes
   - Cache is invalidated on window focus
   - Manual refetch can be triggered if needed

### Frontend API Client Configuration

The frontend uses the base API URL from environment variable:

- Development: `http://localhost:5000/api/v1`
- Production: Configured via `NEXT_PUBLIC_API_URL`

All requests to `/api/v1/announcements/*` will be sent to:

- `{NEXT_PUBLIC_API_URL}/announcements/*`

---

## Testing Recommendations

### Unit Tests

1. **Active Announcements Filter:**
   - Test filtering by `isActive`
   - Test date range filtering (before start, during range, after end)
   - Test sorting by priority and createdAt

2. **Validation:**
   - Test required field validation
   - Test enum validation (type, targetAudience)
   - Test date validation (startDate before endDate)
   - Test text length validation

### Integration Tests

1. **Public Endpoint:**
   - Test `/active` endpoint returns only active announcements
   - Test date filtering works correctly
   - Test sorting works correctly
   - Test empty result handling

2. **Admin Endpoints:**
   - Test authentication required
   - Test admin role required
   - Test CRUD operations
   - Test toggle endpoint

### Manual Testing Checklist

- [ ] Create announcement via admin dashboard
- [ ] Verify announcement appears in `/active` endpoint
- [ ] Verify announcement appears in frontend marquee
- [ ] Test date range filtering (create announcement with future start date)
- [ ] Test priority sorting (multiple announcements with different priorities)
- [ ] Test toggle active/inactive
- [ ] Test update announcement
- [ ] Test delete announcement
- [ ] Test expiration (announcement with past end date doesn't appear)

---

## Security Considerations

1. **Public Endpoint (`/active`):**
   - No authentication required (publicly accessible)
   - Only returns active announcements
   - No sensitive data exposed
   - Rate limiting recommended (e.g., 100 requests/minute per IP)

2. **Admin Endpoints:**
   - Require authentication (JWT token)
   - Require admin role verification
   - Input validation and sanitization
   - SQL injection prevention (if using SQL database)
   - XSS prevention (sanitize text input before storage)

3. **Data Validation:**
   - Validate all input fields
   - Sanitize text content (remove potentially dangerous HTML/scripts)
   - Validate date ranges
   - Validate URL format for `linkUrl`

---

## Performance Considerations

1. **Caching:**
   - Consider caching active announcements for 1-2 minutes
   - Cache invalidation on create/update/delete
   - Use Redis or similar for high-traffic scenarios

2. **Database Indexes:**
   - Index on `isActive`
   - Index on `startDate`
   - Index on `endDate`
   - Composite index on `(isActive, startDate, endDate, priority, createdAt)` for active announcements query

3. **Query Optimization:**
   - Only select required fields in `/active` endpoint
   - Use efficient date range queries
   - Limit result set if necessary (though typically should be < 20 announcements)

---

## Future Enhancements

1. **Audience Targeting:**
   - Implement user-based filtering (new users, existing users, premium users)
   - This would require passing user context to `/active` endpoint or implementing separate endpoints

2. **Localization:**
   - Support multiple languages
   - Store translations in separate collection or use translation keys

3. **Analytics:**
   - Track announcement views/clicks
   - Measure engagement metrics
   - A/B testing support

4. **Rich Content:**
   - Support HTML formatting (with sanitization)
   - Support images/media
   - Support action buttons

5. **Scheduling:**
   - Schedule announcements in advance
   - Recurring announcements
   - Time-based announcements (e.g., show only during business hours)

---

## Support and Questions

For questions or issues regarding this API specification, please contact the frontend development team or refer to the frontend codebase:

- API Service: `src/services/announcementsApi.ts`
- Types: `src/types/announcement.ts`
- Component: `src/components/ui/info-marquee.tsx`
