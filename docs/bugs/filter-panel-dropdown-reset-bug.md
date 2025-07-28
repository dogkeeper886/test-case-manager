# Bug Report: Filter Panel Dropdown Reset After Selection

## 🐛 **Bug Description**

**Title**: Custom dropdowns in filter panel reset to default value after selection

**Severity**: High - Critical functionality issue preventing proper filter usage

**Priority**: Critical - Users cannot set filter values properly

**Status**: 🔄 **INVESTIGATION IN PROGRESS**

## 📋 **Issue Details**

### **Problem**
When users select an option from the custom dropdown components in the filter panel (Project, Test Suite, Status, Priority), the selected value resets to the default/empty value after the dropdown closes.

### **Expected Behavior**
- Selected value should persist after dropdown closes
- Filter should be applied with the selected value
- Dropdown should display the selected value correctly

### **Actual Behavior**
- Selected value resets to default after dropdown closes
- Filter is not applied properly
- Massive React warnings about duplicate keys in console

## 🔍 **Investigation Results**

### **Root Cause Identified**
1. **Duplicate React Keys**: The main issue is duplicate React keys causing massive console warnings and rendering issues
2. **AdvancedSearch Component**: Search history dropdown uses `key={index}` which can cause duplicates
3. **FilterPanel Component**: Active filter chips may have duplicate keys when multiple filters have same type

### **Current Status**
- ✅ **FIXED**: Filter store property mapping (projectFilter, suiteFilter, etc.)
- ✅ **FIXED**: Custom dropdown state management
- ❌ **REMAINING**: Duplicate keys in AdvancedSearch component
- ❌ **REMAINING**: Potential duplicate keys in FilterPanel active filters

## 🛠️ **Planned Fixes**

### **Phase 1: Fix AdvancedSearch Duplicate Keys**
- [ ] Replace `key={index}` with unique keys in search history dropdown
- [ ] Use combination of search term and index: `key={`${historyItem}-${index}`}`
- [ ] Test search history functionality

### **Phase 2: Fix FilterPanel Duplicate Keys**
- [ ] Ensure active filter chips have unique keys
- [ ] Use combination of type, value, and index: `key={`${filter.type}-${filter.value}-${index}`}`
- [ ] Test filter chip removal functionality

### **Phase 3: Comprehensive Testing**
- [ ] Test all dropdown selections
- [ ] Verify no console warnings
- [ ] Test filter persistence
- [ ] Test search history functionality

## 📝 **Attempted Solutions**

### **Attempt 1: Filter Store Mapping Fix**
- **Date**: Current
- **Approach**: Fixed filter store property mapping
- **Result**: ✅ Partially successful - dropdowns now persist values
- **Issues**: Duplicate keys still causing warnings

### **Attempt 2: Custom Dropdown Implementation**
- **Date**: Current  
- **Approach**: Replaced native selects with custom dropdowns
- **Result**: ✅ Successful - better state management
- **Issues**: Duplicate keys in other components

## 🎯 **Next Steps**
1. Fix duplicate keys in AdvancedSearch component
2. Verify no duplicate keys in FilterPanel
3. Test all functionality thoroughly
4. Document final results

## 📊 **Testing Results**
- **Console Warnings**: Massive duplicate key warnings present - NOT FIXED
- **Dropdown Functionality**: Values persist but warnings indicate underlying issues
- **Filter Application**: Working but with rendering issues
- **User Experience**: Functional but poor due to console spam

## 🔍 **Current Investigation Status**

### **Test Date**: 2024-12-19
### **Test Environment**: Docker Compose, Playwright Browser
### **Test Results**: ❌ **DUPLICATE KEYS STILL PRESENT**

**Test Steps**:
1. Started application with `docker compose up -d --build`
2. Navigated to Test Cases page
3. Opened filter panel
4. Observed massive console warnings about duplicate keys

**Test Outcome**:
- ✅ Filter panel opens and displays correctly
- ✅ Dropdown values persist after selection
- ❌ Massive console warnings about duplicate keys still present
- ❌ User experience degraded due to console spam

## 🎯 **PLANNED NEXT INVESTIGATION STEPS**

### **Step 1: Investigate TestCasesTable Component**
- **Target**: `frontend/src/components/test-cases/TestCasesTable.jsx`
- **Reason**: The duplicate keys warnings appear when the Test Cases page loads, suggesting the issue is in the table rendering
- **Action**: Search for `key={` patterns in the table rows and check for potential duplicate keys
- **Expected Issue**: Test case rows might be using non-unique keys (e.g., using index only)

### **Step 2: Check Test Case Data Structure**
- **Target**: Test case data being passed to the table
- **Reason**: If test cases have duplicate IDs or the data structure is inconsistent, this could cause key conflicts
- **Action**: Examine the test case data structure and ensure each item has a unique identifier
- **Expected Issue**: Test cases might have duplicate IDs or missing unique identifiers

### **Step 3: Investigate VirtualList Component**
- **Target**: `frontend/src/components/ui/VirtualList.jsx`
- **Reason**: The table uses virtual scrolling which might be causing key generation issues
- **Action**: Check how VirtualList generates keys for its items
- **Expected Issue**: VirtualList might not be properly handling unique keys for virtualized items

### **Step 4: Check Filter Store State Management**
- **Target**: `frontend/src/stores/filterStore.js` and related state management
- **Reason**: State changes might be causing unnecessary re-renders with duplicate keys
- **Action**: Verify that filter state changes don't cause component re-mounting
- **Expected Issue**: State updates might be causing components to re-render with new keys

### **Step 5: Browser Console Analysis**
- **Target**: Browser developer tools console
- **Reason**: Need to identify exactly which component is generating the duplicate keys
- **Action**: Add temporary console.log statements to track key generation
- **Expected Issue**: Will identify the specific component and data causing the issue

## 📋 **Investigation Priority**
1. **HIGH**: TestCasesTable component key generation
2. **HIGH**: Test case data structure uniqueness
3. **MEDIUM**: VirtualList component key handling
4. **MEDIUM**: Filter store state management
5. **LOW**: Browser console detailed analysis

## 🔧 **Planned Fix Strategy**
Once the root cause is identified:
1. Fix the key generation in the identified component
2. Ensure all mapped items have unique, stable keys
3. Test the fix thoroughly
4. Update this bug report with results
5. Only then commit the changes 