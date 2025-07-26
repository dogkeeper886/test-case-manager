# Bug Report: Rich Text Editor Auto-Save Content Splitting Issue

## Bug Summary
**Date**: December 2024  
**Component**: RichTextEditor / CustomQuillEditor  
**Phase**: Post-ReactQuill Migration  
**Severity**: Medium (User Experience Issue)  
**Status**: 🔄 IN PROGRESS - Investigation

## Issue Description

### Primary Problem
When users type in the rich text editor, the auto-save functionality is causing content to be split into separate paragraphs instead of maintaining continuous text flow. This results in each character or word appearing in its own paragraph element.

### User Impact
- **Poor Text Flow**: Content appears fragmented with unnecessary line breaks
- **Inconsistent Formatting**: Text doesn't flow naturally as users expect
- **Data Structure Issues**: HTML structure becomes overly complex with multiple `<p>` tags
- **User Confusion**: Users see their text split into separate boxes/paragraphs

### Error Context
This issue occurs specifically when:
1. Users type continuously in any RichTextEditor field
2. The auto-save debounce (100ms) triggers onChange
3. The parent component state updates
4. The value update effect in CustomQuillEditor re-renders the content
5. Content gets split into separate paragraph elements

## Root Cause Analysis

### Potential Issues Identified

#### 1. **Auto-Save Debouncing**
The 100ms debounce in CustomQuillEditor triggers onChange which updates parent state:

```jsx
// Handle text changes with debouncing
quill.on(Quill.events.TEXT_CHANGE, (delta, oldDelta, source) => {
  // ...
  changeTimeoutRef.current = setTimeout(() => {
    const html = quill.root.innerHTML;
    debouncedOnChange(html); // This triggers parent state update
    isTypingRef.current = false;
  }, 100); // 100ms debounce
});
```

#### 2. **Value Update Effect**
When parent state changes, it triggers the value update effect:

```jsx
// Update value when prop changes
useEffect(() => {
  if (quillRef.current && value !== valueRef.current && !hasFocusRef.current && !isTypingRef.current) {
    // This re-renders the Quill content
    quillRef.current.clipboard.dangerouslyPasteHTML(value);
  }
}, [value]);
```

#### 3. **Content Splitting During Updates**
When the content is updated via `dangerouslyPasteHTML`, Quill.js might be interpreting the content differently and creating separate paragraph elements.

#### 4. **JavaScript Content Injection**
When using JavaScript to inject content (as in testing), the content gets added as separate elements:

```jsx
quillEditor.innerHTML = quillEditor.innerHTML + '1'; // Creates new <p> element
```

### Technical Details
- **File**: `frontend/src/components/ui/CustomQuillEditor.jsx`
- **File**: `frontend/src/components/ui/RichTextEditor.jsx`
- **File**: `frontend/src/components/test-cases/TestCaseEditForm.jsx`
- **Affected Components**: All RichTextEditor instances in TestCaseEditForm

## Impact Assessment

### Immediate Impact
- ✅ **User Experience**: Poor text flow and formatting
- ✅ **Data Quality**: Inconsistent HTML structure
- ✅ **Content Management**: Difficult to maintain proper text formatting

### Business Impact
- **User Productivity**: Users spend time fixing formatting issues
- **Data Consistency**: Inconsistent data structure in database
- **User Satisfaction**: Frustrating experience with text editing

## Proposed Solutions

### Solution 1: Optimize Auto-Save Logic (Recommended)
**Approach**: Improve the auto-save mechanism to prevent content splitting

**Implementation**:
1. Increase debounce timeout to reduce frequency of updates
2. Add content validation before triggering onChange
3. Implement smarter content merging logic

### Solution 2: Fix Content Update Strategy
**Approach**: Change how content is updated to preserve text flow

**Implementation**:
1. Use Quill's delta-based updates instead of HTML paste
2. Implement content diffing to only update changed parts
3. Preserve cursor position during updates

### Solution 3: Disable Auto-Save During Typing
**Approach**: Temporarily disable auto-save while user is actively typing

**Implementation**:
1. Track typing state more accurately
2. Delay auto-save until user stops typing
3. Implement manual save triggers

## Testing Plan

### Pre-Fix Testing
- [x] Confirm content splitting when typing continuously
- [x] Document when the issue occurs
- [x] Test with different content types
- [x] Verify issue occurs with auto-save

### Post-Fix Testing
- [ ] Test continuous typing without content splitting
- [ ] Test auto-save functionality
- [ ] Test with different content lengths
- [ ] Test cursor position preservation
- [ ] Test with multiple editors

## Related Files

### Frontend Files
- `frontend/src/components/ui/CustomQuillEditor.jsx` - Main Quill wrapper
- `frontend/src/components/ui/RichTextEditor.jsx` - Rich text editor component
- `frontend/src/components/test-cases/TestCaseEditForm.jsx` - Form with multiple editors

### Documentation Files
- `docs/bugs/richtext-editor-auto-save-content-splitting.md` - This bug documentation

## Timeline
- **Issue Discovery**: December 2024
- **Root Cause Analysis**: Current
- **Solution Implementation**: Next development session
- **Testing**: After implementation
- **Resolution**: Expected within 1-2 development sessions

## Notes
- This issue is related to the auto-save functionality and content update strategy
- The problem affects the user experience more than the focus/tabbing issue
- Need to balance auto-save frequency with content integrity
- Consider implementing a more sophisticated content management system

## Resolution Status
- [x] **Identified**: ✅ YES
- [x] **Root Cause**: ✅ YES
- [ ] **Solution Planned**: 🔄 IN PROGRESS
- [ ] **Fix Implemented**: 🔄 PENDING
- [ ] **Testing**: 🔄 PENDING
- [ ] **Resolved**: 🔄 PENDING

---
**Reported By**: User  
**Assigned To**: Development Team  
**Priority**: Medium  
**Category**: User Experience / Content Management 