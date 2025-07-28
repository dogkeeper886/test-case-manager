#!/usr/bin/env node

/**
 * Test script to verify filter panel fixes
 * Tests:
 * 1. Filter persistence after closing filter panel
 * 2. Suite dropdown display with many options
 */

const puppeteer = require('puppeteer');

async function testFilterPanelFixes() {
  console.log('🧪 Testing Filter Panel Fixes...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the application
    console.log('📱 Navigating to application...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="test-cases-title"]', { timeout: 10000 });
    console.log('✅ Page loaded successfully');
    
    // Test 1: Filter persistence after closing filter panel
    console.log('\n🔍 Test 1: Filter persistence after closing filter panel');
    
    // Click on filters button
    await page.click('[data-testid="filters-toggle-button"]');
    await page.waitForSelector('[data-testid="filter-dialog"]', { timeout: 5000 });
    console.log('✅ Filter dialog opened');
    
    // Apply a filter (project filter)
    await page.click('[data-testid="project-dropdown-button"]');
    await page.waitForSelector('[data-testid="project-dropdown"]', { timeout: 2000 });
    
    // Select first project option (if available)
    const projectOptions = await page.$$('[data-testid^="project-dropdown-option-"]');
    if (projectOptions.length > 1) {
      await projectOptions[1].click(); // Skip "All Projects" option
      console.log('✅ Project filter applied');
    } else {
      console.log('⚠️  No project options available for testing');
    }
    
    // Close the filter dialog
    await page.click('[data-testid="close-filter-panel-button"]');
    await page.waitForTimeout(1000);
    console.log('✅ Filter dialog closed');
    
    // Check if filter is still active
    const activeFiltersCount = await page.$eval(
      '[data-testid="active-filters-count"]',
      el => el ? el.textContent : '0'
    );
    console.log(`📊 Active filters count: ${activeFiltersCount}`);
    
    // Reopen filter dialog to verify filter is still applied
    await page.click('[data-testid="filters-toggle-button"]');
    await page.waitForSelector('[data-testid="filter-dialog"]', { timeout: 5000 });
    
    // Check if project filter is still selected
    const projectButtonText = await page.$eval(
      '[data-testid="project-dropdown-button"]',
      el => el.textContent.trim()
    );
    console.log(`📋 Project filter value: "${projectButtonText}"`);
    
    if (projectButtonText !== 'Select project...' && projectButtonText !== 'All Projects') {
      console.log('✅ Filter persistence test PASSED');
    } else {
      console.log('❌ Filter persistence test FAILED');
    }
    
    // Test 2: Suite dropdown display with many options
    console.log('\n📋 Test 2: Suite dropdown display with many options');
    
    // Click on suite dropdown
    await page.click('[data-testid="suite-dropdown-button"]');
    await page.waitForSelector('[data-testid="suite-dropdown"]', { timeout: 2000 });
    console.log('✅ Suite dropdown opened');
    
    // Check if dropdown is visible and has options
    const suiteOptions = await page.$$('[data-testid^="suite-dropdown-option-"]');
    console.log(`📊 Suite options count: ${suiteOptions.length}`);
    
    if (suiteOptions.length > 0) {
      console.log('✅ Suite dropdown display test PASSED');
      
      // Check if dropdown has proper styling (scrollable if many options)
      const dropdownElement = await page.$('[data-testid="suite-dropdown"]');
      const styles = await page.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          maxHeight: computed.maxHeight,
          overflowY: computed.overflowY,
          zIndex: computed.zIndex
        };
      }, dropdownElement);
      
      console.log(`📏 Dropdown styles:`, styles);
      
      if (styles.maxHeight !== 'none' && styles.overflowY === 'auto') {
        console.log('✅ Dropdown scrollable styling PASSED');
      } else {
        console.log('⚠️  Dropdown scrollable styling may need attention');
      }
    } else {
      console.log('⚠️  No suite options available for testing');
    }
    
    // Close dropdown
    await page.click('[data-testid="suite-dropdown-button"]');
    await page.waitForTimeout(500);
    
    // Close filter dialog
    await page.click('[data-testid="close-filter-panel-button"]');
    await page.waitForTimeout(1000);
    
    console.log('\n🎉 Filter panel fixes testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testFilterPanelFixes().catch(console.error); 