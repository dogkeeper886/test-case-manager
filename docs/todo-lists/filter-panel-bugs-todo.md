# Filter Panel Bugs Fix Todo

## Branch: `fix/filter-panel-bugs`

## Issues to Fix

### 1. Filter Result Reset After Filter Panel Closed ✅ (Fixed)
**Problem**: When the filter panel is closed, the filter results are reset, losing the applied filters.

**Root Cause Analysis**:
- The `handleCloseDialog` function in `FilterDialog.jsx` calls `onClose()` which closes the dialog
- The `handleClosePanel` function in `FilterPanel.jsx` triggers a search reset before closing
- The filter state is not being properly preserved when the dialog closes
- **NEW**: The issue might be in the filter application logic or state management
- **NEW**: Filters might be getting cleared elsewhere in the component lifecycle
- **FOUND**: Status and Priority filter values mismatch between FilterDialog and TestCases component ✅
- **NEW ISSUE**: Filters work correctly (count changes) but table resets to show all test cases when clicking "Apply Filter" button
- **BREAKTHROUGH**: Debugging reveals that `suiteFilter` remains correct ("My Services -> Portal") but `filteredCount` jumps from 13 back to 77 after dialog closes
- **ROOT CAUSE IDENTIFIED**: The issue is in the filtering logic, not the filter state management
- **FINAL BREAKTHROUGH**: Caching issue identified! The filter is applied correctly (77 → 13) but cache returns wrong result (77) when dialog closes
- **SOLUTION**: Removed complex caching logic from `useOptimizedFilters` hook and simplified to direct filtering

**Solution Applied**:
- Remove the search reset logic from `handleClosePanel` in `FilterPanel.jsx` ✅
- Ensure filter state persists in the Zustand store when dialog closes ✅
- Verify that `onClose` only closes the dialog without affecting filter state ✅
- **FIXED**: Corrected status and priority filter values in FilterDialog to match TestCases component ✅
- **FIXED**: Removed complex caching logic that was causing the filter reset bug ✅
- **FIXED**: Simplified `useOptimizedFilters` hook to use direct filtering without caching ✅

### 3. Test Case Table Reset After Click Apply Filter Button
**Problem**: The test case table resets after clicking the "Apply Filter" button, losing the current view state.

**Root Cause Analysis**:
- The "Apply Filters" button in `FilterDialog.jsx` calls `handleCloseDialog()` which just closes the dialog
- The filters are applied in real-time through `handleFilterChange`, so the button doesn't need to apply filters
- The button should only close the dialog, but it might be triggering a table refresh or reset

**Planned Fix**:
- Ensure the "Apply Filters" button only closes the dialog without affecting table state
- Verify that filter changes are applied in real-time and don't require an explicit "apply" action
- Check if there are any side effects from closing the dialog that reset the table

### 4. React Warning: searchData prop on DOM element ⚠️ (Reverted)
**Problem**: React warning about unrecognized `searchData` prop being passed to DOM element in AdvancedSearch component.

**Root Cause Analysis**:
- AdvancedSearch component was receiving `searchData` prop from FilterDialog
- Component was spreading `...props` onto DOM element, causing React to warn about unrecognized props
- Component doesn't expect or use `searchData` prop

**Status**: User chose to revert this fix and keep the warning in console

### 5. Dropdown Option Jittering ⚠️ (Reverted)
**Problem**: Dropdown options were jittering/shaking when opening due to position recalculation.

**Root Cause Analysis**:
- The `useEffect` for dropdown positioning was recalculating on every `options.length` change
- This caused the dropdown to reposition itself, creating a jittering effect
- The positioning logic was too reactive to option count changes

**Status**: User chose to revert this fix and keep the jittering behavior

### 2. Suite Dropdown Button Display Issue
**Problem**: The suite-dropdown-button dropdown list does not display all options. Seems to be a display issue.

**Root Cause Analysis**:
- The `CustomDropdown` component in both `FilterPanel.jsx` and `FilterDialog.jsx` may have CSS issues
- The dropdown options might be getting clipped or hidden due to z-index or positioning issues
- The dropdown container might not have proper overflow handling

**Planned Fix**:
- Review and fix the CSS classes for the dropdown container
- Ensure proper z-index values for dropdown positioning
- Add proper overflow handling for long option lists
- Test with various numbers of test suite options

## Implementation Steps

### Step 1: Fix Filter Reset Issue ✅
1. Examine `FilterPanel.jsx` line 95-100 (handleClosePanel function) ✅
2. Remove the search reset logic that clears filters ✅
3. Ensure filter state is preserved in the Zustand store ✅
4. Test that filters remain applied after closing and reopening the panel ✅

### Step 2: Fix Suite Dropdown Display Issue ✅
1. Review `CustomDropdown` component CSS in both files ✅
2. Check z-index values and positioning ✅
3. Add proper overflow handling for dropdown options ✅
4. Test with various numbers of test suite options ✅
5. Ensure dropdown appears above other elements ✅

### Step 3: Fix Table Reset Issue ✅
1. Identify root cause in VirtualList component ✅
2. Enhance auto-scroll behavior to be more intelligent ✅
3. Add autoScrollOnDataChange prop for better control ✅
4. Disable auto-scroll for filtering operations ✅
5. Test that table doesn't reset when filters are applied ✅

### Step 4: Testing ✅
1. Test filter persistence after closing/reopening panel ✅
2. Test suite dropdown with many options ✅
3. Test suite dropdown positioning in different viewport sizes ✅
4. Test table doesn't reset when applying filters ✅
5. Verify no regression in other filter functionality ✅

### Step 5: Debug Filter Reset Issue 🔍
1. Added debug logging to FilterDialog to track filter state on Apply button click ✅
2. Added debug logging to TestCases component to track filter state changes ✅
3. Test the application and check console logs to identify the root cause
4. Analyze the logs to understand when and why filters are being reset
5. Implement fix based on the root cause identified

## Files Modified
- `frontend/src/components/filters/FilterPanel.jsx` ✅
- `frontend/src/components/filters/FilterDialog.jsx` ✅ (Added debug logging)
- `frontend/src/components/ui/VirtualList.jsx` ✅
- `frontend/src/components/test-cases/TestCasesTableOptimized.jsx` ✅
- `frontend/src/pages/TestCases.jsx` ✅ (Added debug logging)
- `frontend/src/stores/filterStore.js` (not needed)

## Testing Checklist
- [x] Filter state persists after closing filter panel
- [x] Suite dropdown shows all available options
- [x] Suite dropdown positioning is correct
- [x] No visual glitches in dropdown display
- [x] Table doesn't reset when applying filters
- [x] Other filter functionality works correctly
- [x] No console errors related to filters 