# Bug Report: Rich Text Editor Duplicate Toolbars

## Problem Description
Rich text editor fields display multiple duplicate toolbars instead of a single toolbar, making the application unusable for editing test cases.

## User Impact
- **Severity**: High - Application is unusable for test case editing
- **Affected Users**: All users trying to edit test cases
- **User Experience**: Confusing interface with multiple toolbars per field
- **Workflow Impact**: Cannot effectively edit test case descriptions, prerequisites, or test steps

## Root Cause Analysis

### Investigation Results (December 2024)
**Method**: Browser DOM inspection using JavaScript
**Key Discovery**: Each RichTextEditor component creates exactly 2 toolbar instances

#### Technical Analysis
```javascript
// Investigation Results:
- Total toolbars: 32 (16 fields × 2 toolbars each)
- Rich text containers: 16 (one per field)
- Quill containers: 16 (one per field)
- Quill editors: 16 (one per field)
```

#### Component Structure
```
rich-text-editor-container
├── ql-toolbar ql-snow (Toolbar 1) ← DUPLICATE
├── ql-toolbar ql-snow (Toolbar 2) ← DUPLICATE
├── ql-container
│   └── ql-editor
└── other elements...
```

#### Root Cause
- **Each `.rich-text-editor-container` contains exactly 2 toolbars**
- Both toolbars have the same classes: `ql-toolbar ql-snow`
- Both toolbars are direct children of the same `.rich-text-editor-container`
- **Each CustomQuillEditor component is creating 2 toolbar instances instead of 1**

### Hypothesis
The issue is likely caused by:
1. **React Strict Mode**: Causing components to render twice in development
2. **useLayoutEffect Dependencies**: `modules` and `formats` props causing re-initialization
3. **Quill.js Initialization**: Multiple Quill instances being created for the same container

## Attempted Fixes and Results

### Fix Attempt 1: React Keys in TestCaseEditForm.jsx
**Date**: December 2024  
**Files Modified**: `frontend/src/components/test-cases/TestCaseEditForm.jsx`  
**Approach**: Added unique `key` props to each `RichTextEditor` instance

```javascript
// For description field
<RichTextEditor
  key="test-case-description"
  label="Test Case Summary"
  // ... other props
/>

// For prerequisites field
<RichTextEditor
  key="test-case-prerequisites"
  label="Prerequisites"
  // ... other props
/>

// For test steps (inside a map)
<RichTextEditor
  key={`step-${index}-action`}
  label="Action"
  // ... other props
/>

<RichTextEditor
  key={`step-${index}-expected`}
  label="Expected Result"
  // ... other props
/>
```

**Result**: ❌ FAILED - Duplicate toolbars still present

### Fix Attempt 2: Prevent Multiple CustomQuillEditor Initializations
**Date**: December 2024  
**Files Modified**: `frontend/src/components/ui/CustomQuillEditor.jsx`  
**Approach**: Added a check in `useLayoutEffect` to prevent multiple initializations

```javascript
useLayoutEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  // Prevent multiple initializations
  if (quillRef.current) {
    return;
  }

  // Clear container
  container.innerHTML = '';
  // ... rest of initialization
}, [ref, readOnly, theme, placeholder, modules, formats]);
```

**Result**: ❌ FAILED - Duplicate toolbars still present

### Fix Attempt 3: Memoize Modules and Formats in RichTextEditor.jsx
**Date**: December 2024  
**Files Modified**: `frontend/src/components/ui/RichTextEditor.jsx`  
**Approach**: Used `useMemo` for `modules` and `formats` objects to prevent recreation

```javascript
const modules = useMemo(() => ({
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link', 'code-block'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false
  }
}), []);

const formats = useMemo(() => [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list',
  'color', 'background',
  'link', 'code-block'
], []);
```

**Result**: ❌ FAILED - Duplicate toolbars still present

### Fix Attempt 4: Add Stable Keys to CustomQuillEditor
**Date**: December 2024  
**Files Modified**: `frontend/src/components/ui/RichTextEditor.jsx`  
**Approach**: Generated a stable `editorKey` using `useMemo` based on the `label` prop

```javascript
const RichTextEditor = memo(({
  value = '',
  onChange,
  placeholder = 'Enter content...',
  label,
  className = '',
  showPreview = true,
  maxHeight = '300px',
  readOnly = false
}) => {
  // Generate a stable key for the CustomQuillEditor
  const editorKey = useMemo(() => `quill-${label || 'editor'}`, [label]);
  
  // ... rest of component
  
  {!isPreview && (
    <div className="rich-text-editor-container">
      <CustomQuillEditor
        key={editorKey}
        ref={quillRef}
        value={htmlContent}
        onChange={handleContentChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        theme="snow"
      />
    </div>
  )}
```

**Result**: ❌ FAILED - Duplicate toolbars still present

### Fix Attempt 5: Proper Quill Cleanup and Initialization Control
**Date**: December 2024  
**Files Modified**: `frontend/src/components/ui/CustomQuillEditor.jsx`  
**Approach**: Enhanced cleanup logic and initialization control

```javascript
const CustomQuillEditor = forwardRef(({
  value = '',
  onChange,
  placeholder = 'Enter content...',
  readOnly = false,
  modules = {},
  formats = [],
  theme = 'snow',
  className = '',
  style = {}
}, ref) => {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const isInitializedRef = useRef(false);

  // Update refs when props change
  useLayoutEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Initialize Quill
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Prevent multiple initializations
    if (isInitializedRef.current) {
      return;
    }

    // Clear container completely
    container.innerHTML = '';
    
    // Create editor element
    const editor = document.createElement('div');
    container.appendChild(editor);

    // Initialize Quill with proper configuration
    const quill = new Quill(editor, {
      theme,
      modules: {
        toolbar: modules.toolbar || false,
        clipboard: {
          matchVisual: false
        },
        ...modules
      },
      formats: formats.length > 0 ? formats : undefined,
      placeholder,
      readOnly
    });

    quillRef.current = quill;
    isInitializedRef.current = true;

    // Set initial value
    if (value && value.trim()) {
      quill.clipboard.dangerouslyPasteHTML(value);
    }

    // Handle text changes
    quill.on('text-change', (delta, oldDelta, source) => {
      if (source === 'user' && onChangeRef.current) {
        const html = quill.root.innerHTML;
        onChangeRef.current(html);
      }
    });

    // Expose quill instance via ref
    if (ref) {
      if (typeof ref === 'function') {
        ref(quill);
      } else {
        ref.current = quill;
      }
    }

    // Cleanup function
    return () => {
      if (quillRef.current) {
        quillRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []); // Empty dependency array to prevent re-initialization

  // Handle value updates
  useEffect(() => {
    if (quillRef.current && value !== valueRef.current) {
      valueRef.current = value;
      const quill = quillRef.current;
      const currentContent = quill.root.innerHTML;
      
      if (value !== currentContent) {
        if (value && value.trim()) {
          quill.clipboard.dangerouslyPasteHTML(value);
        } else {
          quill.setText('');
        }
      }
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className={`custom-quill-editor ${className}`}
      style={style}
    />
  );
});
```

**Result**: ❌ FAILED - Duplicate toolbars still present

## Current Status
🔄 **IN PROGRESS - Root Cause Identified, Fix Strategy Needed**

### Technical Investigation
- **Root Cause Confirmed**: Each CustomQuillEditor creates exactly 2 toolbar instances
- **DOM Structure**: Each `.rich-text-editor-container` contains 2 `.ql-toolbar` elements
- **Component Behavior**: All 5 attempted fixes failed to resolve the issue
- **Pattern**: Consistent failure across different approaches suggests fundamental architectural issue

### Next Steps
1. **Investigate React Strict Mode Impact**: Check if React Strict Mode is causing double rendering
2. **Analyze Quill.js Initialization**: Deep dive into Quill.js source code for toolbar creation
3. **Consider Alternative Approach**: Replace CustomQuillEditor with a different implementation
4. **CSS Workaround**: Implement CSS-based solution to hide duplicate toolbars as temporary fix

### Lessons Learned
- **React Keys**: Not effective for preventing component duplication at Quill.js level
- **Initialization Checks**: Quill.js may create toolbars regardless of initialization state
- **Memoization**: Props memoization doesn't prevent Quill.js internal duplication
- **Cleanup Logic**: Enhanced cleanup doesn't prevent the initial duplication

### Impact Assessment
- **Development Time**: 5 failed attempts over multiple sessions
- **User Experience**: Application remains unusable for test case editing
- **Technical Debt**: Multiple complex workarounds implemented without success
- **Priority**: Critical - blocking core functionality

## Testing Plan
1. **Manual Testing**: Navigate to test case edit page and verify toolbar count
2. **DOM Inspection**: Use browser dev tools to count `.ql-toolbar` elements
3. **Component Isolation**: Test CustomQuillEditor in isolation
4. **React Strict Mode**: Test with and without React Strict Mode

## Verification Checklist
- [ ] Each rich text editor field displays exactly 1 toolbar
- [ ] No duplicate toolbars visible in any field
- [ ] Rich text editor functionality works correctly
- [ ] No console errors related to Quill.js
- [ ] Form submission works without issues
- [ ] Content saving and loading works correctly

## Related Issues
- [ReactQuill findDOMNode Deprecation](../reactquill-finddomnode-deprecation.md)
- [Quill Bullet Format Error](../quill-bullet-format-error.md)
- [Rich Text Editor Focus/Tabbing Issue](../richtext-editor-focus-tabbing-issue.md)
- [Rich Text Editor Auto-save Content Splitting](../richtext-editor-auto-save-content-splitting.md)

## Status
🔄 **IN PROGRESS** - Root cause identified, alternative fix strategy needed 