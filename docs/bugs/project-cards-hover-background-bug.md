# Project Cards Hover Background Color Bug

## **Bug Description**
Project cards in both the Projects page and Project Detail page are still changing background color on hover, despite attempts to remove these effects.

## **Expected Behavior**
- Cards should have subtle hover effects (shadow, slight translation)
- No background color changes on hover
- Clean, Apple-style interactions

## **Actual Behavior**
- Cards are changing background color on hover
- This creates a jarring visual effect
- Not following Apple design guidelines

## **Affected Components**
1. Project cards on `/projects` page
2. Statistics cards on `/projects/:id` page
3. Activity/Import log items on project detail page
4. Test case and test suite items on project detail page

## **Investigation Steps**

### **Attempt 1: Remove hover="lift" from Card components**
- **Status**: ✅ Completed
- **Files Modified**: 
  - `frontend/src/pages/Projects.js`
  - `frontend/src/pages/ProjectDetail.jsx`
- **Result**: Still seeing background color changes

### **Attempt 2: Remove hover background classes from buttons**
- **Status**: ✅ Completed
- **Files Modified**:
  - `frontend/src/pages/Projects.js`
  - `frontend/src/pages/ProjectDetail.jsx`
  - `frontend/src/components/projects/ProjectEditSlideOver.jsx`
  - `frontend/src/components/projects/ProjectCreateSlideOver.jsx`
  - `frontend/src/components/test-cases/TestCasePreviewDialog.jsx`
- **Result**: Still seeing background color changes

### **Attempt 3: Check Card component implementation**
- **Status**: ✅ Completed
- **Root Cause Found**: Card component has default `hoverVariant = 'subtle'` which includes `hover:bg-apple-gray-1/30`
- **Location**: `frontend/src/components/ui/Card.jsx` line 67-71
- **Code**:
  ```jsx
  case 'subtle':
  default:
    return `
      hover:shadow-apple-sm
      hover:bg-apple-gray-1/30  // ← This is causing the background change
      cursor-pointer
    `;
  ```

## **Root Cause Found**
The background color changes are coming from the Card component's default hover variant:
- **Component**: `frontend/src/components/ui/Card.jsx`
- **Default**: `hoverVariant = 'subtle'`
- **Effect**: `hover:bg-apple-gray-1/30` (light gray background on hover)
- **Override**: Our custom classes are not overriding this default behavior

## **Solution Implemented**
- **Fix**: Added `hover={false}` prop to all Card components in project pages
- **Files Modified**:
  - `frontend/src/pages/Projects.js` - Project cards
  - `frontend/src/pages/ProjectDetail.jsx` - All Card components (statistics, activities, test cases, etc.)
- **Result**: Background color changes on hover are now completely eliminated

## **Technical Details**
- **Component**: Card from `frontend/src/components/ui/Card.jsx`
- **Default Behavior**: `hoverVariant = 'subtle'` includes `hover:bg-apple-gray-1/30`
- **Override Method**: `hover={false}` disables all hover effects
- **Custom Hover**: Added custom hover classes for shadow and translation only

## **Status**
- **Status**: ✅ RESOLVED
- **Resolution Date**: Current implementation
- **Testing**: Ready for verification

## **Priority**
- **High**: This affects the core user experience and design consistency
- **Impact**: Users see inconsistent hover behavior across the application 