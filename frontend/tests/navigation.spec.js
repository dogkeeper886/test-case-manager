const { test, expect } = require('@playwright/test');

// Test configuration
test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for the app to load
    await page.waitForSelector('[data-testid="sidebar"]', { timeout: 10000 });
  });

  test('should navigate through all sidebar pages', async ({ page }) => {
    // Define all sidebar pages to test
    const sidebarPages = [
      { name: 'Dashboard', path: '/', testId: 'sidebar-dashboard' },
      { name: 'Test Cases', path: '/testcases', testId: 'sidebar-testcases' },
      { name: 'Test Suites', path: '/test-suites', testId: 'sidebar-testsuites' },
      { name: 'Projects', path: '/projects', testId: 'sidebar-projects' },
      { name: 'Reports', path: '/reports', testId: 'sidebar-reports' },
      { name: 'Documents', path: '/documents', testId: 'sidebar-documents' },
      { name: 'Import', path: '/import', testId: 'sidebar-import' },
      { name: 'Settings', path: '/settings', testId: 'sidebar-settings' }
    ];

    // Test each page
    for (const pageInfo of sidebarPages) {
      console.log(`Testing navigation to ${pageInfo.name}...`);
      
      // Click the sidebar link
      await page.click(`[data-testid="${pageInfo.testId}"]`);
      
      // Wait for navigation
      await page.waitForURL(`**${pageInfo.path}`, { timeout: 5000 });
      
      // Verify URL is correct
      await expect(page).toHaveURL(new RegExp(pageInfo.path));
      
      // Verify page loaded without errors
      await expect(page.locator('body')).not.toContainText('Error');
      
      // Take a screenshot for visual verification
      await page.screenshot({ 
        path: `playwright-screenshots/navigation-${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}.png` 
      });
      
      // Wait a bit before next navigation
      await page.waitForTimeout(1000);
    }
  });

  test('should handle sidebar collapse/expand', async ({ page }) => {
    // Test sidebar collapse
    await page.click('[data-testid="sidebar-toggle"]');
    await expect(page.locator('[data-testid="sidebar"]')).toHaveClass(/collapsed/);
    
    // Test sidebar expand
    await page.click('[data-testid="sidebar-toggle"]');
    await expect(page.locator('[data-testid="sidebar"]')).not.toHaveClass(/collapsed/);
  });

  test('should display breadcrumbs correctly', async ({ page }) => {
    // Navigate to test cases page
    await page.click('[data-testid="sidebar-testcases"]');
    await page.waitForURL('**/testcases');
    
    // Check if breadcrumbs are present
    await expect(page.locator('[data-testid="breadcrumbs"]')).toBeVisible();
    
    // Navigate to a specific test case detail page
    const testCaseLink = page.locator('[data-testid="testcase-link"]').first();
    if (await testCaseLink.isVisible()) {
      await testCaseLink.click();
      await page.waitForURL('**/testcases/**');
      
      // Verify breadcrumbs updated
      await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText('Test Cases');
    }
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Verify sidebar is collapsed on mobile
    await expect(page.locator('[data-testid="sidebar"]')).toHaveClass(/mobile/);
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(1000);
  });
});

test.describe('Test Cases Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/testcases');
    await page.waitForSelector('[data-testid="testcases-page"]', { timeout: 10000 });
  });

  test('should load test cases without errors', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('[data-testid="testcase-item"]', { timeout: 10000 });
    
    // Verify no error messages
    await expect(page.locator('body')).not.toContainText('Error');
    
    // Verify test cases are displayed
    const testCaseItems = page.locator('[data-testid="testcase-item"]');
    await expect(testCaseItems).toHaveCount.greaterThan(0);
  });

  test('should handle filtering functionality', async ({ page }) => {
    // Test search functionality
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('test');
    await page.waitForTimeout(1000);
    
    // Verify search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('should handle sorting functionality', async ({ page }) => {
    // Test sorting by different columns
    const sortButtons = page.locator('[data-testid="sort-button"]');
    const count = await sortButtons.count();
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      await sortButtons.nth(i).click();
      await page.waitForTimeout(500);
    }
  });

  test('should handle view mode switching', async ({ page }) => {
    // Test switching between different view modes
    const viewModes = ['table', 'cards', 'kanban', 'timeline'];
    
    for (const mode of viewModes) {
      await page.click(`[data-testid="view-mode-${mode}"]`);
      await page.waitForTimeout(1000);
      
      // Verify view mode is active
      await expect(page.locator(`[data-testid="view-mode-${mode}"]`)).toHaveClass(/active/);
    }
  });
});

test.describe('Error Handling Tests', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.route('**/*', route => route.abort());
    
    await page.goto('http://localhost:3000/testcases');
    
    // Verify error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should handle 404 errors', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('http://localhost:3000/non-existent-page');
    
    // Verify 404 page is displayed
    await expect(page.locator('[data-testid="404-page"]')).toBeVisible();
  });
});

test.describe('Performance Tests', () => {
  test('should load pages within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000/testcases');
    await page.waitForSelector('[data-testid="testcases-page"]');
    
    const loadTime = Date.now() - startTime;
    
    // Verify page loads within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle large datasets', async ({ page }) => {
    await page.goto('http://localhost:3000/testcases');
    
    // Wait for virtual scrolling to initialize
    await page.waitForSelector('[data-testid="virtual-list"]', { timeout: 10000 });
    
    // Scroll through the list
    await page.evaluate(() => {
      const container = document.querySelector('[data-testid="virtual-list"]');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Verify no performance issues
    await expect(page.locator('body')).not.toContainText('Error');
  });
}); 