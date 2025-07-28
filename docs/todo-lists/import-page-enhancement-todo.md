# Import Page Enhancement Todo

## Overview
This todo list tracks the enhancement of the import page functionality, specifically focusing on improving the user experience and project management during XML imports.

## Current Status
- [ ] Branch created: `enhance-import-page`
- [ ] Tasks identified and documented

## Tasks

### 1. Remove TopNav Search Input
**Priority:** High  
**Status:** Completed ✅  
**Estimated Time:** 30 minutes

**Description:**
Remove the search input from the TopNav component when on the import page to provide a cleaner interface focused on import functionality.

**Technical Details:**
- The search input is controlled by the `showSearch` prop in the TopNav component
- Currently, the Import page passes `onSearch` handler but doesn't control `showSearch`
- Need to modify the Import page to set `showSearch={false}` in the Layout component

**Implementation Steps:**
1. [x] Modify `frontend/src/pages/Import.js` to pass `showSearch={false}` to Layout component
2. [x] Test that search input is hidden on import page
3. [x] Verify other pages still show search input as expected

**Files to Modify:**
- `frontend/src/pages/Import.js`

**Testing:**
- [x] Verify search input is hidden on import page
- [x] Verify search input still appears on other pages (test cases, etc.)
- [x] Test navigation between pages to ensure proper state

---

### 2. Add Project Selection and Creation During XML Import
**Priority:** High  
**Status:** In Progress 🔄  
**Estimated Time:** 2-3 hours

**Description:**
When importing XML files, allow users to select an existing project or create a new project with a custom name. This provides better project management and avoids hardcoded project assignments.

**Technical Details:**
- Currently, imports are hardcoded to use project ID 1
- TestLink XML exports don't contain project information (only test suites)
- Users should be able to choose existing project or create new one
- Implement project selection UI and project creation functionality

**Implementation Steps:**
1. [x] Create project service for listing and creating projects
2. [x] Update import service to handle project selection/creation
3. [x] Modify frontend to show project selection options
4. [x] Add project creation UI with name input
5. [x] Update import API endpoints to handle project selection
6. [ ] Update import history to show correct project information

**Backend Changes:**
- [x] Create `ProjectService.js` for project management
- [x] Update `TestLinkImportService.js` to accept project ID parameter
- [x] Modify import routes to support project selection
- [x] Add project listing and creation endpoints
- [x] Update import preview to show project options

**Frontend Changes:**
- [x] Update import page to show project selection dropdown
- [x] Add "Create New Project" option with name input
- [x] Handle project creation in import flow
- [ ] Update import history to show project information
- [ ] Add project name validation

**Files to Modify:**
- [x] `backend/src/services/ProjectService.js` (new)
- [x] `backend/src/services/TestLinkImportService.js`
- [x] `backend/src/routes/import.js`
- [x] `backend/src/routes/projects.js` (new)
- [x] `frontend/src/pages/Import.js`
- [x] `frontend/src/services/api.js`

**Testing:**
- [ ] Test project selection from existing projects
- [ ] Test creating new project during import
- [ ] Test duplicate project name handling
- [ ] Verify import history shows correct project information
- [ ] Test error handling for invalid project names

---

### 3. Fix Project Selection Validation Logic
**Priority:** High  
**Status:** Completed ✅  
**Estimated Time:** 30 minutes

**Description:**
Fix the validation logic in the import flow to properly handle new project creation scenarios where projectId doesn't exist.

**Technical Details:**
- Current validation checks for `selectedProjectId` even when creating new project
- When "Create New Project" is selected, `projectId` will not exist
- Need to update validation to check for either `selectedProjectId` OR `newProjectName`
- Import history refresh logic also needs to handle new project scenarios

**Implementation Steps:**
1. [x] Fix validation logic in `handleFileUpload` function
2. [x] Update import history refresh to handle newly created projects
3. [x] Test both existing project selection and new project creation flows
4. [x] Ensure proper error messages for validation failures

**Files to Modify:**
- `frontend/src/pages/Import.js`

**Testing:**
- [x] Test import with existing project selection
- [x] Test import with new project creation
- [x] Test validation error messages
- [x] Verify import history updates correctly for both scenarios

---

### 4. Apply Apple Design Guidelines to Import Page
**Priority:** Medium  
**Status:** Completed ✅  
**Estimated Time:** 1-2 hours

**Description:**
Update the import page UI to follow Apple design guidelines as specified in the project's README.md, ensuring consistency with the overall design system.

**Technical Details:**
- Follow Apple design system guidelines for spacing, typography, and colors
- Use consistent component styling with the rest of the application
- Ensure proper visual hierarchy and user experience
- Apply Apple-specific design patterns for forms and interactions

**Implementation Steps:**
1. [x] Review Apple design guidelines in README.md
2. [x] Update project selection UI to match Apple design patterns
3. [x] Apply consistent spacing and typography
4. [x] Update form elements to follow Apple design standards
5. [x] Ensure proper visual feedback and states
6. [x] Test responsive design and accessibility

**Files to Modify:**
- [x] `frontend/src/pages/Import.js`
- [x] `frontend/src/components/ui/` (if new components needed)

**Design Guidelines to Follow:**
- [x] Use Apple color palette (apple-blue, apple-gray-1, etc.)
- [x] Apply consistent spacing using Tailwind classes
- [x] Use SF Display font family for headings
- [x] Follow Apple form design patterns
- [x] Implement proper focus states and accessibility
- [x] Use Apple-style card layouts and shadows

**Testing:**
- [x] Visual consistency with other pages
- [x] Responsive design on different screen sizes
- [x] Accessibility compliance
- [x] User experience flow validation
**Priority:** High  
**Status:** Not Started  
**Estimated Time:** 2-3 hours

**Description:**
When importing XML files, allow users to select an existing project or create a new project with a custom name. This provides better project management and avoids hardcoded project assignments.

**Technical Details:**
- Currently, imports are hardcoded to use project ID 1
- TestLink XML exports don't contain project information (only test suites)
- Users should be able to choose existing project or create new one
- Implement project selection UI and project creation functionality

**Implementation Steps:**
1. [ ] Create project service for listing and creating projects
2. [ ] Update import service to handle project selection/creation
3. [ ] Modify frontend to show project selection options
4. [ ] Add project creation UI with name input
5. [ ] Update import API endpoints to handle project selection
6. [ ] Update import history to show correct project information

**Backend Changes:**
- [ ] Create `ProjectService.js` for project management
- [ ] Update `TestLinkImportService.js` to accept project ID parameter
- [ ] Modify import routes to support project selection
- [ ] Add project listing and creation endpoints
- [ ] Update import preview to show project options

**Frontend Changes:**
- [ ] Update import page to show project selection dropdown
- [ ] Add "Create New Project" option with name input
- [ ] Handle project creation in import flow
- [ ] Update import history to show project information
- [ ] Add project name validation

**Files to Modify:**
- `backend/src/services/ProjectService.js` (new)
- `backend/src/services/TestLinkImportService.js`
- `backend/src/routes/import.js`
- `backend/src/routes/projects.js` (new)
- `frontend/src/pages/Import.js`
- `frontend/src/services/api.js`

**Testing:**
- [ ] Test project selection from existing projects
- [ ] Test creating new project during import
- [ ] Test duplicate project name handling
- [ ] Verify import history shows correct project information
- [ ] Test error handling for invalid project names

---

## Dependencies
- None identified at this time

## Notes
- Both tasks are independent and can be worked on in parallel
- Task 1 is a simple UI change that can be completed quickly
- Task 2 requires more extensive backend and frontend changes
- Consider creating separate branches for each task if working in parallel

## Completion Criteria
- [ ] Search input is hidden on import page
- [ ] Import process creates non-duplicate project names
- [ ] All tests pass
- [ ] No regression in existing import functionality
- [ ] Documentation updated if needed

---

### 5. Fix Upload Error When Creating New Project
**Priority:** High  
**Status:** Completed ✅  
**Estimated Time:** 30 minutes

**Description:**
Fix the 400 error that occurs when uploading files with "Create New Project" option selected.

**Technical Details:**
- The preview endpoint was not handling `newProjectName` and `newProjectDescription` fields
- Backend preview route only accepted `projectId` parameter
- Database `projects` table was missing the `status` column that ProjectService was trying to insert
- Need to update preview route to validate new project names and handle new project scenarios

**Implementation Steps:**
1. [x] Update backend preview route to accept `newProjectName` and `newProjectDescription`
2. [x] Add project name validation in preview step
3. [x] Handle new project scenarios in preview without creating the project
4. [x] Fix database schema by adding missing `status` column to `projects` table
5. [x] Test upload flow with new project creation

**Files to Modify:**
- [x] `backend/src/routes/import.js`
- [x] Database schema (added `status` column to `projects` table)

**Testing:**
- [x] Upload with existing project selection works
- [x] Upload with new project creation works
- [x] Duplicate project name validation works
- [x] Preview step completes successfully for both scenarios
- [x] Project creation in database works correctly

---

## Future Enhancements (Not in Current Scope)
- Project name editing after creation
- Bulk project management
- Project templates
- Advanced project naming patterns 