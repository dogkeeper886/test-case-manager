# Test Suite Navigation State - Simple Implementation Todo

## 🎯 **Project Overview**
Implement simple navigation state management to preserve tree expansion when navigating between test suite browser and test case detail pages.

## 📋 **Simple Requirements**
- [ ] Click test case in test suite → navigate to test case detail
- [ ] Click back button → return to test suite with same expansion state
- [ ] Keep it simple and general

## 🚀 **Simple Implementation Plan**

### **Phase 1: Basic URL State (Simplest Approach)**

#### **1.1 Modify TestSuiteBrowser Navigation**
- [ ] **Update test case click handler**
  - [ ] Add current expansion state to URL when navigating
  - [ ] Add current project ID to URL
  - [ ] Use simple query parameters

#### **1.2 Modify TestCaseDetail Back Button**
- [ ] **Update back button handler**
  - [ ] Check if coming from test suite browser
  - [ ] Restore expansion state from URL
  - [ ] Navigate back to test suite browser

#### **1.3 Test Basic Flow**
- [ ] **Test navigation flow**
  - [ ] Expand some test suites
  - [ ] Click on a test case
  - [ ] Verify navigation to test case detail
  - [ ] Click back button
  - [ ] Verify return to test suite with same expansion

## 🎯 **Implementation Steps**

### **Step 1: Update TestSuiteBrowser**
```javascript
// Current: navigate(`/testcases/${testCase.id}`);
// New: navigate(`/testcases/${testCase.id}?returnTo=test-suites&expanded=1,2,3&project=1`);
```

### **Step 2: Update TestCaseDetail**
```javascript
// Current: navigate('/testcases');
// New: Check URL params and navigate appropriately
```

### **Step 3: Test and Verify**
- Test the complete flow
- Verify state preservation
- Check edge cases

## 📊 **Success Criteria**

### **User Experience**
- [ ] Click test case → navigate to detail page
- [ ] Click back → return to test suite browser
- [ ] Tree expansion state is preserved
- [ ] Project selection is preserved

### **Technical**
- [ ] Simple implementation
- [ ] No complex state management
- [ ] Works with browser back/forward
- [ ] Handles edge cases gracefully

## 🔄 **Implementation Order**

### **Day 1: Basic Implementation**
1. Update TestSuiteBrowser navigation
2. Update TestCaseDetail back button
3. Test basic flow

### **Day 2: Polish and Testing**
1. Handle edge cases
2. Test different scenarios
3. Verify browser navigation

---

**Status**: 📋 **PLANNING COMPLETE** - Ready for simple implementation
**Priority**: 🔥 **HIGH** - Core navigation functionality
**Effort**: ⏱️ **2 days** - Simple and focused
**Approach**: 🎯 **URL State Management** - Simplest and most reliable 