# Manual Testing Checklist

## 🎯 **Quick Navigation Test**

Use this checklist to manually test all sidebar navigation and prevent errors after implementing new features.

## 📋 **Pre-Testing Setup**

- [ ] **Start the application**: `cd docker && docker compose up -d`
- [ ] **Wait for services**: Ensure all containers are running (green status)
- [ ] **Open browser**: Navigate to http://localhost:3000
- [ ] **Clear browser cache**: Hard refresh (Ctrl+F5 or Cmd+Shift+R)

## 🧭 **Sidebar Navigation Testing**

### **1. Dashboard Page** (`/`)
- [ ] **Click Dashboard** in sidebar
- [ ] **Verify URL**: Should be `http://localhost:3000/`
- [ ] **Check page loads**: No error messages
- [ ] **Verify content**: Dashboard statistics visible
- [ ] **Test responsiveness**: Resize browser window
- [ ] **Check breadcrumbs**: Should show "Dashboard"

### **2. Test Cases Page** (`/testcases`)
- [ ] **Click Test Cases** in sidebar
- [ ] **Verify URL**: Should be `http://localhost:3000/testcases`
- [ ] **Check page loads**: No error messages
- [ ] **Verify data loads**: Test cases table visible
- [ ] **Test filtering**: Use search box
- [ ] **Test sorting**: Click column headers
- [ ] **Test view modes**: Switch between table/cards/kanban/timeline
- [ ] **Test performance**: Check if virtual scrolling works
- [ ] **Check breadcrumbs**: Should show "Test Cases"

### **3. Test Suites Page** (`/test-suites`)
- [ ] **Click Test Suites** in sidebar
- [ ] **Verify URL**: Should be `http://localhost:3000/test-suites`
- [ ] **Check page loads**: No error messages
- [ ] **Verify tree structure**: Test suite hierarchy visible
- [ ] **Test expand/collapse**: Click on test suite items
- [ ] **Test navigation**: Click on test suite links
- [ ] **Check breadcrumbs**: Should show "Test Suites"

### **4. Projects Page** (`/projects`)
- [ ] **Click Projects** in sidebar
- [ ] **Verify URL**: Should be `http://localhost:3000/projects`
- [ ] **Check page loads**: No error messages
- [ ] **Verify project list**: Projects visible
- [ ] **Test project details**: Click on project items
- [ ] **Check breadcrumbs**: Should show "Projects"

### **5. Reports Page** (`/reports`)
- [ ] **Click Reports** in sidebar
- [ ] **Verify URL**: Should be `http://localhost:3000/reports`
- [ ] **Check page loads**: No error messages
- [ ] **Verify report options**: Report types visible
- [ ] **Test report generation**: Try generating a report
- [ ] **Check breadcrumbs**: Should show "Reports"

### **6. Documents Page** (`/documents`)
- [ ] **Click Documents** in sidebar
- [ ] **Verify URL**: Should be `http://localhost:3000/documents`
- [ ] **Check page loads**: No error messages
- [ ] **Verify document list**: Documents visible (if any)
- [ ] **Test upload**: Try uploading a document
- [ ] **Check breadcrumbs**: Should show "Documents"

### **7. Import Page** (`/import`)
- [ ] **Click Import** in sidebar
- [ ] **Verify URL**: Should be `http://localhost:3000/import`
- [ ] **Check page loads**: No error messages
- [ ] **Verify import options**: Import types visible
- [ ] **Test file upload**: Try uploading a TestLink XML file
- [ ] **Check breadcrumbs**: Should show "Import"

### **8. Settings Page** (`/settings`)
- [ ] **Click Settings** in sidebar
- [ ] **Verify URL**: Should be `http://localhost:3000/settings`
- [ ] **Check page loads**: No error messages
- [ ] **Verify settings options**: Settings categories visible
- [ ] **Test settings changes**: Try changing a setting
- [ ] **Check breadcrumbs**: Should show "Settings"

## 🔧 **Component Testing**

### **Sidebar Component**
- [ ] **Test collapse/expand**: Click sidebar toggle button
- [ ] **Test mobile view**: Resize to mobile width
- [ ] **Test hover effects**: Hover over menu items
- [ ] **Test active states**: Verify current page is highlighted

### **Top Navigation**
- [ ] **Test breadcrumbs**: Verify breadcrumb navigation
- [ ] **Test search**: Use global search (if available)
- [ ] **Test user menu**: Click user profile/avatar
- [ ] **Test notifications**: Check notification bell

### **Layout Responsiveness**
- [ ] **Desktop view** (1280px+): Full sidebar visible
- [ ] **Tablet view** (768px-1279px): Collapsible sidebar
- [ ] **Mobile view** (<768px): Overlay sidebar
- [ ] **Test transitions**: Smooth animations between views

## 🎨 **UI/UX Testing**

### **Loading States**
- [ ] **Page loading**: Spinner/loading indicator visible
- [ ] **Data loading**: Skeleton screens or loading states
- [ ] **Button loading**: Loading states on form submissions
- [ ] **Error states**: Error messages display correctly

### **Toast Notifications**
- [ ] **Success messages**: Appear after successful actions
- [ ] **Error messages**: Appear after failed actions
- [ ] **Warning messages**: Appear for confirmations
- [ ] **Auto-dismiss**: Messages disappear automatically
- [ ] **Manual dismiss**: Can be closed manually

### **Error Handling**
- [ ] **Network errors**: Handle offline/connection issues
- [ ] **API errors**: Display user-friendly error messages
- [ ] **404 errors**: Custom 404 page
- [ ] **Validation errors**: Form validation messages

## ⚡ **Performance Testing**

### **Page Load Times**
- [ ] **Dashboard**: < 2 seconds
- [ ] **Test Cases**: < 3 seconds
- [ ] **Test Suites**: < 2 seconds
- [ ] **Projects**: < 2 seconds
- [ ] **Reports**: < 3 seconds
- [ ] **Documents**: < 2 seconds
- [ ] **Import**: < 2 seconds
- [ ] **Settings**: < 2 seconds

### **Interaction Performance**
- [ ] **Filtering**: < 500ms response time
- [ ] **Sorting**: < 300ms response time
- [ ] **Search**: < 200ms response time
- [ ] **Navigation**: < 100ms response time

### **Memory Usage**
- [ ] **Monitor memory**: Check browser dev tools
- [ ] **No memory leaks**: Memory usage stable over time
- [ ] **Large datasets**: Handle 1000+ items efficiently

## 🔍 **Browser Compatibility**

### **Chrome/Chromium**
- [ ] **Latest version**: Test on Chrome 120+
- [ ] **Older version**: Test on Chrome 100+
- [ ] **Dev tools**: Check console for errors

### **Firefox**
- [ ] **Latest version**: Test on Firefox 120+
- [ ] **Older version**: Test on Firefox 100+
- [ ] **Dev tools**: Check console for errors

### **Safari**
- [ ] **Latest version**: Test on Safari 17+
- [ ] **Older version**: Test on Safari 15+
- [ ] **Dev tools**: Check console for errors

### **Edge**
- [ ] **Latest version**: Test on Edge 120+
- [ ] **Older version**: Test on Edge 100+
- [ ] **Dev tools**: Check console for errors

## 📱 **Mobile Testing**

### **iOS Safari**
- [ ] **iPhone 12/13/14**: Test on Safari
- [ ] **iPad**: Test on Safari
- [ ] **Touch interactions**: Tap, swipe, pinch
- [ ] **Orientation**: Portrait and landscape

### **Android Chrome**
- [ ] **Samsung Galaxy**: Test on Chrome
- [ ] **Google Pixel**: Test on Chrome
- [ ] **Touch interactions**: Tap, swipe, pinch
- [ ] **Orientation**: Portrait and landscape

## 🚨 **Error Prevention Checklist**

### **Before Testing**
- [ ] **Code review**: All changes reviewed
- [ ] **Linting**: No ESLint errors
- [ ] **Build**: Clean build successful
- [ ] **Dependencies**: All dependencies installed

### **During Testing**
- [ ] **Console errors**: No JavaScript errors
- [ ] **Network errors**: No failed API calls
- [ ] **UI errors**: No broken layouts
- [ ] **Functionality errors**: All features work

### **After Testing**
- [ ] **Documentation**: Update test results
- [ ] **Bug reports**: Report any issues found
- [ ] **Performance notes**: Note any performance issues
- [ ] **User feedback**: Document user experience issues

## 📊 **Test Results Template**

```
Test Date: _______________
Tester: _________________
Application Version: _______

### Navigation Test Results
- [ ] Dashboard: ✅/❌ (Notes: ________)
- [ ] Test Cases: ✅/❌ (Notes: ________)
- [ ] Test Suites: ✅/❌ (Notes: ________)
- [ ] Projects: ✅/❌ (Notes: ________)
- [ ] Reports: ✅/❌ (Notes: ________)
- [ ] Documents: ✅/❌ (Notes: ________)
- [ ] Import: ✅/❌ (Notes: ________)
- [ ] Settings: ✅/❌ (Notes: ________)

### Performance Results
- Average page load time: ______ seconds
- Memory usage: ______ MB
- Console errors: ______ count

### Issues Found
1. ________
2. ________
3. ________

### Recommendations
1. ________
2. ________
3. ________

Overall Status: ✅ PASS / ❌ FAIL
```

## 🚀 **Quick Test Commands**

```bash
# Start application
cd docker && docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f

# Run automated tests
./scripts/test-navigation.sh

# Stop application
docker compose down
```

---

**Remember**: This checklist should be run after every major feature implementation to prevent errors and ensure quality! 