# Import Page Enhancement Todo

## Overview
This todo list tracks the enhancement of the import page functionality, specifically focusing on improving the user experience and project management during XML imports.

## Current Status
- [ ] Branch created: `enhance-import-page`
- [ ] Tasks identified and documented

## Tasks

### 1. Remove TopNav Search Input
**Priority:** High  
**Status:** Not Started  
**Estimated Time:** 30 minutes

**Description:**
Remove the search input from the TopNav component when on the import page to provide a cleaner interface focused on import functionality.

**Technical Details:**
- The search input is controlled by the `showSearch` prop in the TopNav component
- Currently, the Import page passes `onSearch` handler but doesn't control `showSearch`
- Need to modify the Import page to set `showSearch={false}` in the Layout component

**Implementation Steps:**
1. [ ] Modify `frontend/src/pages/Import.js` to pass `showSearch={false}` to Layout component
2. [ ] Test that search input is hidden on import page
3. [ ] Verify other pages still show search input as expected

**Files to Modify:**
- `frontend/src/pages/Import.js`

**Testing:**
- [ ] Verify search input is hidden on import page
- [ ] Verify search input still appears on other pages (test cases, etc.)
- [ ] Test navigation between pages to ensure proper state

---

### 2. Create Non-Duplicate Project Names During XML Import
**Priority:** High  
**Status:** Not Started  
**Estimated Time:** 2-3 hours

**Description:**
When importing XML files, automatically create project names that don't duplicate existing project names in the system. This should include logic to handle naming conflicts and provide meaningful project names.

**Technical Details:**
- Currently, imports are hardcoded to use project ID 1
- Need to extract project name from XML and create new project if needed
- Implement duplicate name detection and resolution
- Update import flow to handle project creation

**Implementation Steps:**
1. [ ] Analyze XML structure to extract project name information
2. [ ] Create project name validation/duplication detection logic
3. [ ] Implement project creation functionality in backend
4. [ ] Update import service to handle project creation
5. [ ] Modify frontend to show project creation options
6. [ ] Update import API endpoints to handle project creation

**Backend Changes:**
- [ ] Add project name extraction from XML in `TestLinkXMLParser.js`
- [ ] Create project creation service/methods
- [ ] Update `TestLinkImportService.js` to handle project creation
- [ ] Modify import routes to support project creation
- [ ] Add project name validation and conflict resolution

**Frontend Changes:**
- [ ] Update import page to show project creation options
- [ ] Add project name input/confirmation UI
- [ ] Handle project creation in import flow
- [ ] Update import history to show correct project information

**Files to Modify:**
- `backend/src/utils/TestLinkXMLParser.js`
- `backend/src/services/TestLinkImportService.js`
- `backend/src/routes/import.js`
- `frontend/src/pages/Import.js`
- `frontend/src/services/api.js`

**Testing:**
- [ ] Test with XML files containing different project names
- [ ] Test duplicate project name handling
- [ ] Test project creation during import
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

## Future Enhancements (Not in Current Scope)
- Project name editing after creation
- Bulk project management
- Project templates
- Advanced project naming patterns 