# Toast Notification System Usage Guide

## Overview

The toast notification system provides Apple-design-compliant notifications that are non-intrusive and user-friendly. It replaces the previous inline notification system with a more prominent and consistent approach.

## Features

- ✅ **Apple Design Compliance**: Follows Apple Human Interface Guidelines
- ✅ **Auto-dismiss**: Success messages auto-dismiss, errors require user action
- ✅ **Multiple Types**: Success, Error, Warning, Info, and Progress notifications
- ✅ **Consistent Positioning**: Top-right corner placement
- ✅ **Accessibility**: Screen reader support and keyboard navigation
- ✅ **Non-intrusive**: Doesn't block user workflow

## Usage

### Import the Toast Functions

```javascript
import { showSuccess, showError, showWarning, showInfo, showProgress } from '../utils/toast';
```

### Basic Usage

```javascript
// Success notification (auto-dismisses after 4 seconds)
showSuccess('Operation completed successfully');

// Error notification (requires user dismissal)
showError('Something went wrong. Please try again.');

// Warning notification (auto-dismisses after 6 seconds)
showWarning('Please review your input before proceeding.');

// Info notification (auto-dismisses after 5 seconds)
showInfo('Your changes have been saved.');

// Progress notification (loading state)
const progressToast = showProgress('Processing your request...');
// Later, dismiss the progress toast
dismissToast(progressToast);
```

### Advanced Usage

```javascript
// Custom duration for success message
showSuccess('Custom success message', { autoClose: 8000 });

// Custom options
showInfo('Custom info message', {
  autoClose: 3000,
  onClose: () => console.log('Toast closed')
});
```

## Notification Types & Behavior

| Type | Color | Auto-dismiss | Use Case |
|------|-------|--------------|----------|
| **Success** | Green | 4 seconds | Completed operations, confirmations |
| **Error** | Red | Manual only | Errors, failures, validation issues |
| **Warning** | Orange | 6 seconds | Warnings, cautions, important notices |
| **Info** | Blue | 5 seconds | Information, updates, status changes |
| **Progress** | Blue | Manual only | Loading states, processing indicators |

## Migration from Old System

### Before (Inline Notifications)
```javascript
const [uploadSuccess, setUploadSuccess] = useState(null);
const [uploadError, setUploadError] = useState(null);

// In handlers
setUploadSuccess('File uploaded successfully');
setUploadError('Upload failed');

// In JSX
{uploadSuccess && (
  <div className="mt-4 p-3 bg-apple-green/10 border border-apple-green/20 rounded-apple">
    <span>{uploadSuccess}</span>
  </div>
)}
```

### After (Toast Notifications)
```javascript
import { showSuccess, showError } from '../utils/toast';

// In handlers
showSuccess('File uploaded successfully');
showError('Upload failed');

// No JSX needed - toasts appear automatically
```

## Best Practices

### When to Use Each Type

1. **Success**: Use for completed operations, confirmations, and positive feedback
   ```javascript
   showSuccess('Test case created successfully');
   showSuccess('Import completed with 25 new test cases');
   ```

2. **Error**: Use for errors, failures, and validation issues
   ```javascript
   showError('Failed to connect to server');
   showError('Please select a valid XML file');
   ```

3. **Warning**: Use for important notices that don't block workflow
   ```javascript
   showWarning('Some test cases were skipped due to duplicates');
   showWarning('You have unsaved changes');
   ```

4. **Info**: Use for general information and status updates
   ```javascript
   showInfo('Your session will expire in 5 minutes');
   showInfo('New version available');
   ```

5. **Progress**: Use for loading states and long-running operations
   ```javascript
   const progressToast = showProgress('Importing test cases...');
   // When operation completes
   dismissToast(progressToast);
   showSuccess('Import completed');
   ```

### Do's and Don'ts

✅ **Do:**
- Use success for completed operations
- Use error for actual errors and failures
- Keep messages concise and clear
- Use progress for long-running operations
- Allow errors to be manually dismissed

❌ **Don't:**
- Use success for every minor action
- Use error for warnings or info
- Make messages too long or complex
- Use progress for quick operations
- Auto-dismiss error messages

## Technical Details

### Toast Configuration

The toast system uses `react-toastify` with custom Apple-design styling:

- **Position**: Top-right corner
- **Limit**: Maximum 5 toasts at once
- **Z-index**: 9999 (above all content)
- **Animations**: Smooth slide-in/out with fade
- **Styling**: Apple design system colors and typography

### Customization

You can customize individual toasts by passing options:

```javascript
showSuccess('Message', {
  autoClose: 5000,        // Custom duration
  onClose: () => {},      // Callback when closed
  onOpen: () => {},       // Callback when opened
  pauseOnHover: false,    // Disable pause on hover
});
```

### Utility Functions

```javascript
import { dismissToast, dismissAllToasts } from '../utils/toast';

// Dismiss a specific toast
const toastId = showSuccess('Message');
dismissToast(toastId);

// Dismiss all toasts
dismissAllToasts();
```

## Examples by Page

### Import Page
```javascript
// File upload success
showSuccess(`Successfully imported ${fileName} with ${newCases} new cases`);

// File upload error
showError('Please select a valid XML file');

// Import retry success
showSuccess(`Successfully retried import with ${updatedCases} updated cases`);

// Delete success
showSuccess('Import record deleted successfully');
```

### Test Cases Page
```javascript
// Create success
showSuccess('Test case created successfully');

// Update success
showSuccess('Test case updated successfully');

// Delete success
showSuccess('Test case deleted successfully');

// Validation error
showError('Please fill in all required fields');
```

### Projects Page
```javascript
// Create success
showSuccess('Project created successfully');

// Load error
showError('Failed to load projects. Please try again.');
```

## Accessibility

The toast system includes proper accessibility features:

- **Screen Reader Support**: ARIA labels and descriptions
- **Keyboard Navigation**: Can be dismissed with Escape key
- **Focus Management**: Proper focus handling
- **High Contrast**: Meets accessibility color contrast requirements

## Troubleshooting

### Common Issues

1. **Toasts not appearing**: Check that ToastContainer is properly configured in App.js
2. **Styling issues**: Ensure Apple design system CSS is loaded
3. **Import errors**: Verify the import path is correct

### Debug Mode

To debug toast issues, you can enable debug mode:

```javascript
// In your component
console.log('Toast functions available:', { showSuccess, showError, showWarning, showInfo });
```

## Future Enhancements

- [ ] Toast queuing for better UX
- [ ] Custom toast themes per page
- [ ] Toast analytics and tracking
- [ ] Advanced animation options
- [ ] Toast templates for common messages 