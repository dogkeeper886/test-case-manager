# Notification System Quick Reference

## 🚀 Quick Start

```javascript
import { showSuccess, showError, showWarning, showInfo } from '../utils/toast';

// Basic usage
showSuccess('Operation completed!');
showError('Something went wrong!');
showWarning('Please review before proceeding.');
showInfo('Processing your request...');
```

## 🎨 Color Guide

| **Type** | **Color** | **Auto-Close** | **Use For** |
|----------|-----------|----------------|-------------|
| **Success** | 🟢 Green | 4 seconds | Completed operations |
| **Error** | 🔴 Red | Manual | Failures, errors |
| **Warning** | 🟠 Orange | 6 seconds | Warnings, duplicates |
| **Info** | 🔵 Blue | 5 seconds | Progress, status |

## 📝 Common Patterns

### **Import Operations**
```javascript
// Success
showSuccess(`Successfully imported ${fileName} with ${newCases} new cases`);

// Error
showError('Failed to upload file. Please try again.');

// Warning
showWarning(`Found ${duplicateCount} duplicate test cases`);

// Info
showInfo('Analyzing import file...');
```

### **CRUD Operations**
```javascript
// Create
showSuccess('Project created successfully');

// Update
showSuccess('Project updated successfully');

// Delete
showSuccess('Project deleted successfully');

// Error
showError('Failed to save project');
```

### **Validation**
```javascript
// Field validation
showError('Please enter a project name');

// Duplicate check
showError('Project name already exists');

// File validation
showError('Please select a valid XML file');
```

## ⚙️ Advanced Usage

### **Custom Options**
```javascript
showSuccess('Custom message', { 
  autoClose: 2000,  // 2 seconds
  position: 'top-center'
});
```

### **Progress Notifications**
```javascript
const toastId = showProgress('Uploading file...');

// Update progress
showProgress('Processing data...', { toastId });

// Complete
showSuccess('Upload completed!');
```

### **Dismiss Notifications**
```javascript
import { dismissToast, dismissAllToasts } from '../utils/toast';

// Dismiss specific notification
dismissToast(toastId);

// Dismiss all notifications
dismissAllToasts();
```

## 🎯 Best Practices

### **Do's**
- ✅ Use specific, actionable messages
- ✅ Include relevant context (file names, counts)
- ✅ Keep messages concise (1-2 lines)
- ✅ Use appropriate notification types

### **Don'ts**
- ❌ Use generic messages like "Success" or "Error"
- ❌ Show technical error details to users
- ❌ Use alerts for non-critical information
- ❌ Overwhelm users with too many notifications

## 🔗 Full Documentation

For complete documentation, see: [Apple Notification System](apple-notification-system.md) 