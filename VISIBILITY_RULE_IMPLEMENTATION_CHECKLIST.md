# Visibility Rule Implementation Checklist

**Date**: January 24, 2026  
**Status**: ✅ **COMPLETE**

---

## ✅ Implementation Summary

### **Critical Rule**: Users see PREVIOUS DAY's profit, NOT today's!

---

## ✅ User Dashboard (`TodayROSCard.tsx`)

### **Implemented:**

- [x] **Tooltip**: Info icon explaining users see yesterday's profit
- [x] **Date Label**: Shows "(Previous day)" next to the date
- [x] **Error Handling**: Updated to handle new error message format
  - Checks for: `'No profit'`, `'not available'`, `'becomes visible'`
  - Shows proper message: "Today's profit becomes visible at 23:59:59 BIT after distribution"
- [x] **Visibility Info Section**: Explains when today's profit becomes visible
- [x] **Distribution Status**: Mentions "23:59:59 BIT" timing
- [x] **404 Error Message**: Matches backend documentation

### **Code Locations:**

- `src/components/dashboard/TodayROSCard.tsx` (Lines 30-58, 160-180, 250-260)

---

## ✅ Service Layer (`dailyProfitService.ts`)

### **Implemented:**

- [x] **Error Message**: Uses backend error message when available
- [x] **Fallback Message**: Includes visibility timing (23:59:59 BIT)
- [x] **404 Handling**: Properly handles "No profit available" scenarios

### **Code Locations:**

- `src/services/dailyProfitService.ts` (Lines 207-214)

---

## ✅ Admin Dashboard

### **1. Declaration Modal (`DeclareReturnsModal.tsx`)**

**Implemented:**

- [x] **Visibility Warning**: Yellow alert box for new declarations
- [x] **Warning Message**: "Users cannot see this declaration until 23:59:59 BIT after distribution"
- [x] **Explanation**: "Throughout the day, users only see the previous day's profit"

**Code Locations:**

- `src/components/admin/dailyDeclarationReturns/DeclareReturnsModal.tsx` (Lines 403-418)

### **2. Calendar View (`UnifiedDeclarationCalendar.tsx`)**

**Implemented:**

- [x] **Tooltip on Hover**: Shows visibility status for each date
  - Undistributed: "Users cannot see this until 23:59:59 BIT after distribution"
  - Distributed: "Visible to users"

**Code Locations:**

- `src/components/admin/dailyDeclarationReturns/UnifiedDeclarationCalendar.tsx` (Lines 168-176)

### **3. List View (`DeclaredReturnsList.tsx`)**

**Implemented:**

- [x] **Visibility Warning**: Shows warning icon + text for undistributed declarations
- [x] **Warning Text**: "Users cannot see until 23:59:59 BIT"
- [x] **Visual Indicator**: Yellow warning icon next to status badges

**Code Locations:**

- `src/components/admin/dailyDeclarationReturns/DeclaredReturnsList.tsx` (Lines 248-256)

---

## ✅ Error Message Handling

### **User Dashboard Error Messages:**

1. **404 Error (No Profit Available)**:

   ```
   "Today's profit becomes visible at 23:59:59 BIT after distribution."
   "You can only see previous day's profit during the day."
   ```

2. **Error Message Detection**:
   - Checks for: `'No profit'`, `'not available'`, `'becomes visible'`
   - Handles both old and new error message formats

---

## ✅ Visual Indicators

### **User Dashboard:**

- ✅ Info tooltip icon next to "Today's Profit" title
- ✅ "(Previous day)" label on date
- ✅ Visibility info section at bottom
- ✅ Clock icon with timing information

### **Admin Dashboard:**

- ✅ Yellow warning box in declaration modal
- ✅ Tooltips on calendar cells
- ✅ Warning icons in list view for undistributed declarations

---

## ✅ Compliance Checklist

### **Backend Requirements Met:**

- [x] Users see previous day's profit (not today's)
- [x] Clear messaging about visibility timing (23:59:59 BIT)
- [x] Proper error handling for 404 responses
- [x] Admin warnings about user visibility
- [x] Tooltips and info sections for clarity
- [x] Error messages match backend documentation

### **User Experience:**

- [x] Clear indication that they're viewing previous day's profit
- [x] Understanding of when today's profit becomes visible
- [x] Helpful error messages when no profit available
- [x] Visual indicators (tooltips, labels, icons)

### **Admin Experience:**

- [x] Warnings when creating declarations
- [x] Visibility status in calendar view
- [x] Visibility warnings in list view
- [x] Clear understanding of user visibility timing

---

## 🔍 Testing Checklist

### **User Dashboard:**

- [ ] Verify "(Previous day)" label appears
- [ ] Verify tooltip shows correct message
- [ ] Verify 404 error shows proper message
- [ ] Verify visibility info section displays
- [ ] Verify date shown is previous day's date

### **Admin Dashboard:**

- [ ] Verify warning appears in declaration modal
- [ ] Verify calendar tooltips show visibility status
- [ ] Verify list view shows warnings for undistributed
- [ ] Verify distributed declarations show "Visible to users"

---

## 📝 Notes

1. **Error Message Format**: The error message check now handles multiple formats to ensure compatibility with both old and new backend error messages.

2. **Tooltip Implementation**: Calendar cells show tooltips on hover indicating visibility status.

3. **Visual Consistency**: All warnings use consistent styling (yellow/amber colors) to indicate visibility restrictions.

4. **User Clarity**: Multiple indicators (label, tooltip, info section) ensure users understand they're viewing previous day's profit.

---

## ✅ Status

**Implementation**: ✅ **COMPLETE**  
**Testing**: ⏳ **PENDING USER VERIFICATION**  
**Documentation**: ✅ **COMPLETE**

---

**Last Updated**: January 24, 2026
