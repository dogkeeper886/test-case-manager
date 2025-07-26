# Test Case Edit Form - Metadata Tab Implementation

## Overview
Separate the metadata fields (Priority Level, Importance Level, Execution Type, Project, Test Suite, Version, External ID, Internal ID) into a separate tab in the test case edit form, following the same pattern as the normal view.

## Current State Analysis
- The edit form currently has all fields in a single view
- The normal view (TestCaseDetail.jsx) uses tabs: "Overview" and "Details"
- The "Details" tab contains the metadata fields that need to be separated

## Planned Changes

### 1. Create Branch
- [x] Create a new branch for this feature
- [x] Name: `feature/test-case-edit-tabs`

### 2. Modify TestCaseEditForm.jsx
- [x] Add tab navigation similar to TestCaseDetail.jsx
- [x] Create two tabs: "Content" and "Metadata"
- [x] Move metadata fields to "Metadata" tab:
  - Priority Level
  - Importance Level
  - Execution Type
  - Project
  - Test Suite
  - Version
  - External ID
  - Internal ID
- [x] Keep core content fields in "Content" tab:
  - Title
  - Description
  - Prerequisites
  - Test Steps

### 3. Design Requirements (Following README.md Guidelines)
- [x] Use Apple Design Guidelines compliance
- [x] Implement SF Pro font stack and typography scale
- [x] Follow Apple's color palette (grays, blues, accent colors)
- [x] Apply 8px grid system for consistent spacing
- [x] Use elevation system with proper shadows and depth
- [x] Implement smooth animations and micro-interactions
- [x] Ensure touch-friendly target sizes (minimum 44px)
- [x] Use Lucide React icons (SF Symbols alternative)

### 4. Tab Structure
- [x] **Content Tab**: Core test case content
  - Title field
  - Description (RichTextEditor)
  - Prerequisites (RichTextEditor)
  - Test Steps section
- [x] **Metadata Tab**: Configuration and metadata
  - Priority Level (dropdown)
  - Importance Level (dropdown)
  - Execution Type (dropdown)
  - Project (dropdown)
  - Test Suite (dropdown)
  - Version (input)
  - External ID (input)
  - Internal ID (input)

### 5. Implementation Details
- [x] Use the same tab styling as TestCaseDetail.jsx
- [x] Maintain form state across tab switches
- [x] Ensure validation works across both tabs
- [x] Keep the same field validation logic
- [x] Maintain responsive design for mobile/tablet

### 6. User Experience
- [x] Smooth tab transitions
- [x] Clear visual indication of active tab
- [x] Maintain form data when switching tabs
- [x] Show validation errors on the appropriate tab
- [x] Ensure accessibility (ARIA labels, keyboard navigation)

### 7. Testing
- [x] Test tab switching functionality
- [x] Test form validation across tabs
- [x] Test responsive design
- [x] Test accessibility features
- [x] Test form submission from both tabs

## Files to Modify
1. `frontend/src/components/test-cases/TestCaseEditForm.jsx` - Main edit form component

## Dependencies
- Existing UI components (Button, Card, Badge, Input, RichTextEditor)
- Existing icons from Lucide React
- Existing styling classes and design system

## Success Criteria
- [x] Metadata fields are successfully separated into a dedicated tab
- [x] Design follows Apple Design Guidelines
- [x] Form functionality remains intact
- [x] User experience is improved with better organization
- [x] Responsive design works on all devices
- [x] Accessibility standards are met

## Notes
- This change will improve the user experience by reducing cognitive load
- The separation follows the same pattern as the normal view
- All existing functionality must be preserved
- The design should be consistent with the rest of the application

## Additional Improvements (Added After Initial Implementation)

### 8. Tab Label Consistency
- [x] Adjust data-element="test-case-tab-overview" to "Content" (match edit test case)
- [x] Adjust data-element="test-case-tab-details" to "Meta Data" (match edit test case)

### 9. UI Simplification
- [x] Remove data-element="test-case-edit-header" card (unnecessary since nav bar already shows edit mode)
- [x] Remove RichTextEditor tips:
  - "Use the toolbar above to format your content. No HTML knowledge required."
  - "Tip: Select text and use the formatting buttons to style your content."

### 10. Implementation Priority
- [x] Update TestCaseDetail.jsx tab labels to match edit form
- [x] Remove edit header card from TestCaseEditForm.jsx
- [x] Remove RichTextEditor tips from both forms
- [x] Test all changes maintain functionality 