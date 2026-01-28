# Curl Tests for Team Members with Referrer Endpoint

**Endpoint**: `GET /api/v1/user-rank/all-team-members`

---

## Test 1: Basic Request (No Parameters)

```bash
curl -X GET "http://localhost:5000/api/v1/user-rank/all-team-members" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "teamMembers": [
      {
        "account": "cry***com",
        "username": "cryptoowo",
        "level": "Direct",
        "personalStake": 0.0,
        "teamStake": 0.0,
        "joined": "25/11/2025",
        "referrer": {
          "account": "ref***com",
          "username": "referrer123"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 30,
      "total": 34,
      "totalPages": 2
    }
  }
}
```

---

## Test 2: With Pagination

```bash
curl -X GET "http://localhost:5000/api/v1/user-rank/all-team-members?page=2&limit=10" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected**: Returns page 2 with 10 items per page

---

## Test 3: With Search

```bash
curl -X GET "http://localhost:5000/api/v1/user-rank/all-team-members?search=crypto" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected**: Returns team members matching "crypto" in email or username

---

## Test 4: Member with No Referrer

**Expected Response:**

```json
{
  "account": "ykl***com",
  "username": "yinks",
  "level": "Direct",
  "personalStake": 0.0,
  "teamStake": 0.0,
  "joined": "08/12/2025",
  "referrer": null
}
```

---

## Test 5: Combined Parameters

```bash
curl -X GET "http://localhost:5000/api/v1/user-rank/all-team-members?page=1&limit=20&search=test" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Verification Checklist

- [ ] Endpoint returns team members array
- [ ] Each member has `referrer` field (object or null)
- [ ] Referrer object has `account` and `username` fields
- [ ] Pagination object is present with correct structure
- [ ] Search parameter filters results correctly
- [ ] Page parameter works correctly
- [ ] Limit parameter works correctly
- [ ] Null referrer displays as null (not empty object)

---

**Status**: ✅ Frontend Implementation Complete
