# 🔧 Backend Registration Bonus Initialization Issue

## Problem

New user accounts are not getting registration bonus records created automatically. According to the implementation guide:

> **Backend:** Bonus automatically initialized during registration

However, this is not happening for new registrations.

## Current Situation

- ✅ User account exists in database
- ✅ Email is verified (`emailVerified: true`)
- ❌ No registration bonus record in `registrationbonuses` collection
- ❌ Frontend gets 404 when fetching `/bonuses/registration/status`
- ❌ Banner doesn't show because bonus is missing

## Expected Behavior

When a user registers and verifies their email, the backend should:

1. **Automatically create** a `RegistrationBonus` document with:
   ```json
   {
     "userId": "<user_id>",
     "status": "pending",
     "progressPercentage": 25,
     "bonusPercentage": 10,
     "registrationDate": "<registration_date>",
     "deadline": "<registration_date + 7 days>",
     "profileCompletion": [
       { "fieldName": "dateOfBirth", "isCompleted": false },
       { "fieldName": "gender", "isCompleted": false },
       { "fieldName": "profilePhoto", "isCompleted": false },
       { "fieldName": "address", "isCompleted": false }
     ],
     "socialMediaVerifications": [
       { "platform": "facebook", "isVerified": false },
       { "platform": "instagram", "isVerified": false },
       { "platform": "youtube", "isVerified": false },
       { "platform": "tiktok", "isVerified": false },
       { "platform": "telegram", "isVerified": false }
     ],
     "firstStakeCompleted": false,
     "minStakeAmount": 20
   }
   ```

2. **Return 200** when frontend calls `GET /api/v1/bonuses/registration/status`

## Frontend Workaround

I've created a diagnostic tool that:

1. **Detects missing bonus** (404 error)
2. **Shows a diagnostic card** on the dashboard (development mode only)
3. **Provides "Initialize Bonus" button** to manually create the bonus

**Location**: `src/components/wallet/RegistrationBonusDiagnostic.tsx`

**Usage**: 
- Only visible in development mode
- Shows on dashboard when bonus is missing
- Click "Initialize Bonus Now" to create the record

## Backend Fix Required

The backend needs to:

### Option 1: Auto-initialize on Registration (Recommended)

In the user registration endpoint (`POST /better-auth/register` or email verification endpoint):

```javascript
// After user is created and email is verified
async function initializeRegistrationBonus(userId) {
  const user = await User.findById(userId);
  const registrationDate = user.createdAt;
  const deadline = new Date(registrationDate);
  deadline.setDate(deadline.getDate() + 7);

  const bonus = await RegistrationBonus.create({
    userId: user._id,
    status: 'pending',
    progressPercentage: 25, // Automatic 25% for registration
    bonusPercentage: 10,
    registrationDate: registrationDate,
    deadline: deadline,
    profileCompletion: [
      { fieldName: 'dateOfBirth', isCompleted: false },
      { fieldName: 'gender', isCompleted: false },
      { fieldName: 'profilePhoto', isCompleted: false },
      { fieldName: 'address', isCompleted: false }
    ],
    socialMediaVerifications: [
      { platform: 'facebook', isVerified: false },
      { platform: 'instagram', isVerified: false },
      { platform: 'youtube', isVerified: false },
      { platform: 'tiktok', isVerified: false },
      { platform: 'telegram', isVerified: false }
    ],
    firstStakeCompleted: false,
    minStakeAmount: 20
  });

  return bonus;
}
```

### Option 2: Create Initialization Endpoint

Create `POST /api/v1/bonuses/registration/initialize`:

```javascript
// POST /api/v1/bonuses/registration/initialize
router.post('/initialize', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if bonus already exists
    const existing = await RegistrationBonus.findOne({ userId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Registration bonus already exists'
      });
    }

    // Get user registration date
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create bonus record
    const registrationDate = user.createdAt;
    const deadline = new Date(registrationDate);
    deadline.setDate(deadline.getDate() + 7);

    const bonus = await RegistrationBonus.create({
      userId: user._id,
      status: 'pending',
      progressPercentage: 25,
      bonusPercentage: 10,
      registrationDate: registrationDate,
      deadline: deadline,
      // ... rest of initialization
    });

    return res.status(201).json({
      success: true,
      data: bonus
    });
  } catch (error) {
    console.error('[Initialize Bonus] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initialize registration bonus'
    });
  }
});
```

## Testing

### Test New Registration

1. Create a new account
2. Verify email
3. Check database: `db.registrationbonuses.find({ userId: ObjectId("...") })`
4. Should return a bonus document with `status: "pending"` and `progressPercentage: 25`

### Test Existing Users

For users who registered before bonus system:

1. Use the diagnostic tool (development mode)
2. Click "Initialize Bonus Now"
3. Or manually create bonus record in database
4. Or backend team can create a migration script

## Database Query to Check

```javascript
// MongoDB query to check if user has bonus
db.registrationbonuses.findOne({ 
  userId: ObjectId("690cd4510ecec3dcaee50489") 
})

// Should return null if bonus doesn't exist
```

## Next Steps

1. **Backend Team**: Implement auto-initialization on registration
2. **Frontend**: Diagnostic tool is ready for testing
3. **Testing**: Verify new registrations get bonus automatically
4. **Migration**: Create bonus records for existing users who don't have one

---

**Priority**: High - This blocks the registration bonus feature from working for new users.

