async function globalTeardown(config) {
  console.log('Global teardown completed');
  
  // Clean up any test artifacts if needed
  // This is where you could clean up test data, etc.
}

module.exports = globalTeardown; 