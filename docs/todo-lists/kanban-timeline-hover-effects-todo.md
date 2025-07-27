# Kanban & Timeline Hover Effects Enhancement Todo

## Overview
Apply consistent hover effects to Kanban and Timeline views using the successful patterns from Table and Card views as templates.

## Reference Patterns (Successfully Implemented)

### Table View Pattern (TestCasesTableOptimized.jsx)
```jsx
className={`flex items-center gap-4 px-4 py-3 border-b transition-all duration-200 ease-out h-12 cursor-pointer ${
  isSelected ? 'bg-apple-blue/5 border-apple-blue/20' : 'border-apple-gray-2'
} ${
  isHovered ? 'shadow-apple-md border-apple-blue/50 -translate-y-0.5' : ''
}`}
```

### Card View Pattern (TestCasesCompactCards.jsx)
```jsx
className={`group bg-white border rounded-apple-lg p-4 hover:shadow-apple-md transition-all duration-200 cursor-pointer ${
  selectedIds.includes(testCase.id) 
    ? 'border-apple-blue bg-apple-blue/5 shadow-apple-md' 
    : 'border-apple-gray-2 hover:border-apple-blue/50'
}`}
whileHover={{ y: -2 }}
```

## Enhancement Tasks

### 1. Kanban View Improvements
- [x] **Remove background color change** on hover for `data-testid="test-case-kanban-card-427"`
- [x] **Apply card-style border effects** like `hover:border-apple-blue/50`
- [x] **Add shadow effects** like `hover:shadow-apple-md`
- [x] **Add lift effect** like `whileHover={{ y: -2 }}` or `-translate-y-0.5`
- [x] **Maintain selection states** with blue background and border

### 2. Timeline View Improvements
- [x] **Remove background color change** on hover for timeline items
- [x] **Apply card-style border effects** like `hover:border-apple-blue/50`
- [x] **Add shadow effects** like `hover:shadow-apple-md`
- [x] **Add lift effect** like `whileHover={{ y: -2 }}` or `-translate-y-0.5`
- [x] **Maintain selection states** with blue background and border

### 3. Design Pattern Documentation
- [x] **Create reusable hover effect patterns** for different component types
- [x] **Document the design system** for consistent application across pages
- [x] **Define component-specific variations** (table rows vs cards vs kanban vs timeline)
- [x] **Create utility classes** for common hover effects

## Files to Modify
- `frontend/src/components/test-cases/TestCasesKanban.jsx`
- `frontend/src/components/test-cases/TestCasesTimeline.jsx`
- `frontend/src/styles/index.css` (for utility classes)
- `frontend/tailwind.config.js` (for custom utilities)

## Design Pattern Goals

### Consistent Hover Effects Across All Views:
1. **No background color changes** on hover (maintain readability)
2. **Blue border accent** on hover (`border-apple-blue/50`)
3. **Shadow elevation** on hover (`shadow-apple-md`)
4. **Subtle lift effect** (`-translate-y-0.5` or `y: -2`)
5. **Smooth transitions** (`duration-200`)
6. **Selection states** with blue background and border

### Component-Specific Adaptations:
- **Table Rows**: Bottom border only, horizontal layout
- **Cards**: All borders, rounded corners, vertical layout
- **Kanban Cards**: All borders, rounded corners, compact layout
- **Timeline Items**: All borders, rounded corners, timeline layout

## Success Criteria
- [ ] Consistent hover behavior across all test case views
- [ ] No background color changes on hover
- [ ] Smooth, elegant transitions
- [ ] Maintained accessibility and usability
- [ ] Reusable design patterns for other pages
- [ ] Performance optimized animations

## Implementation Approach
1. Analyze current kanban and timeline components
2. Apply table/card hover patterns
3. Test consistency across all views
4. Create reusable design patterns
5. Document for future use

## Notes
- Use existing Apple design tokens from tailwind.config.js
- Leverage framer-motion for complex animations where needed
- Ensure mobile responsiveness
- Test with different data states and screen sizes

## Design Pattern Implementation Summary

### ✅ Completed Enhancements:

#### Kanban Cards:
- **Before**: `hover:shadow-apple-md hover:-translate-y-1` + ring selection
- **After**: `hover:shadow-apple-md hover:border-apple-blue/50 hover:-translate-y-1` + border selection
- **Result**: Consistent with card view, no background color change

#### Timeline Cards:
- **Before**: `hover:shadow-apple-md` + ring selection  
- **After**: `hover:shadow-apple-md hover:border-apple-blue/50 hover:-translate-y-1` + border selection
- **Result**: Consistent with card view, added lift effect

#### Reusable CSS Utilities Created:
```css
.hover-card-effect {
  @apply hover:shadow-apple-md hover:border-apple-blue/50 hover:-translate-y-1 transition-all duration-200;
}

.hover-table-row-effect {
  @apply hover:shadow-apple-md hover:border-apple-blue/50 hover:-translate-y-0.5 transition-all duration-200;
}

.selection-state {
  @apply border-apple-blue bg-apple-blue/5 shadow-apple-md;
}

.default-border {
  @apply border-apple-gray-2;
}
```

### 🎯 Design Pattern for Future Use:

**For Card-like Components:**
```jsx
className={`hover-card-effect transition-all duration-200 ${
  isSelected ? 'selection-state' : 'default-border'
}`}
```

**For Table Rows:**
```jsx
className={`hover-table-row-effect transition-all duration-200 ${
  isSelected ? 'selection-state' : 'default-border'
}`}
```

This pattern can now be applied consistently across all pages and components! 