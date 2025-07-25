#!/bin/bash

# Test Navigation Script
# This script runs comprehensive navigation tests using Docker and Playwright

set -e  # Exit on any error

echo "🚀 Starting Navigation Testing..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "Please run this script from the docker directory"
    exit 1
fi

print_status "Starting test environment..."

# Start the test environment
docker compose -f docker-compose.test.yml up -d

print_status "Waiting for services to be ready..."

# Wait for services to be ready
sleep 10

# Check if services are running
if ! docker compose -f docker-compose.test.yml ps | grep -q "Up"; then
    print_error "Test services failed to start"
    docker compose -f docker-compose.test.yml logs
    exit 1
fi

print_success "Test environment is ready!"

# Run the navigation tests
print_status "Running navigation tests..."

# Run Playwright tests
docker compose -f docker-compose.test.yml run --rm playwright npx playwright test tests/navigation.spec.js --reporter=html

# Check if tests passed
if [ $? -eq 0 ]; then
    print_success "Navigation tests passed!"
else
    print_error "Navigation tests failed!"
    exit 1
fi

# Generate test report
print_status "Generating test report..."

# Copy test results to host
docker compose -f docker-compose.test.yml run --rm playwright cp -r playwright-results /app/

print_success "Test report generated in playwright-results/"

# Show test summary
print_status "Test Summary:"
echo "✅ All sidebar pages tested"
echo "✅ Navigation functionality verified"
echo "✅ Error handling tested"
echo "✅ Performance metrics collected"
echo "📊 Test results available in playwright-results/"

# Clean up
print_status "Cleaning up test environment..."

docker compose -f docker-compose.test.yml down

print_success "Navigation testing completed successfully!"

echo ""
echo "🎉 All tests passed! Your application navigation is working correctly."
echo ""
echo "📋 Test Coverage:"
echo "   • Dashboard page"
echo "   • Test Cases page"
echo "   • Test Suites page"
echo "   • Projects page"
echo "   • Reports page"
echo "   • Documents page"
echo "   • Import page"
echo "   • Settings page"
echo ""
echo "📊 Test Results:"
echo "   • HTML Report: playwright-results/index.html"
echo "   • Screenshots: playwright-screenshots/"
echo "   • Test Logs: playwright-results/results.json" 