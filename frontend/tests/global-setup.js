const { chromium } = require('@playwright/test');

async function globalSetup(config) {
  const { baseURL, storageState } = config.projects[0].use;
  
  // Launch browser and create a new context
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate to the application
  await page.goto(baseURL);
  
  // Wait for the application to load
  await page.waitForSelector('[data-testid="sidebar"]', { timeout: 10000 });
  
  // Take a screenshot of the initial state
  await page.screenshot({ path: 'playwright-screenshots/global-setup.png' });
  
  // Save signed-in state
  await page.context().storageState({ path: storageState });
  await browser.close();
}

module.exports = globalSetup; 