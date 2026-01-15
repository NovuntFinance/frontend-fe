# Backend Fix: Active Referrals Count Returning 0

## Issue

The `/api/v1/referral/metrics` endpoint is returning `0` for both `active_direct` and `active_members` when there should be active referrals with stakes.

**Current Response:**

```json
{
  "referrals": {
    "total_direct": 29,
    "active_direct": 0 // ❌ Should be > 0
  },
  "team": {
    "total_members": 169,
    "active_members": 0 // ❌ Should be > 0
  }
}
```

## Expected Behavior

- **`active_direct`**: Count of Level 1 referrals who have at least one **active stake**
- **`active_members`**: Count of all team members (any level) who have at least one **active stake**

## MongoDB Implementation

### For active_direct (Level 1 referrals with active stakes):

```javascript
const activeDirect = await Referral.aggregate([
  {
    $match: {
      referrer_id: userId,
      level: 1,
    },
  },
  {
    $lookup: {
      from: 'stakes',
      localField: 'referred_user_id',
      foreignField: 'user_id',
      as: 'stakes',
    },
  },
  {
    $match: {
      'stakes.status': 'active',
    },
  },
  {
    $group: {
      _id: '$referred_user_id',
    },
  },
  {
    $count: 'active_direct',
  },
]);

const activeDirectCount = activeDirect[0]?.active_direct || 0;
```

### For active_members (all levels with active stakes):

```javascript
const activeMembers = await Referral.aggregate([
  {
    $match: {
      referrer_id: userId,
    },
  },
  {
    $lookup: {
      from: 'stakes',
      localField: 'referred_user_id',
      foreignField: 'user_id',
      as: 'stakes',
    },
  },
  {
    $match: {
      'stakes.status': 'active',
    },
  },
  {
    $group: {
      _id: '$referred_user_id',
    },
  },
  {
    $count: 'active_members',
  },
]);

const activeMembersCount = activeMembers[0]?.active_members || 0;
```

## Testing Checklist

- [ ] `active_direct` shows count of L1 referrals with active stakes
- [ ] `active_members` shows count of all-level referrals with active stakes
- [ ] Frontend displays correct values (already implemented)
- [ ] Values update when stakes become active/inactive

## Notes

- Frontend is already correctly consuming this data
- Only backend calculation needs to be fixed
- Use `status: 'active'` to filter stakes (adjust if your stake status field differs)
