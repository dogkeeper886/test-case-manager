# TestLink Sample Files

This folder contains sample TestLink XML files used for development, testing, and documentation purposes.

## Files

### Network Control Profile.testsuite-deep.xml
- **Size**: ~422KB
- **Lines**: 14,569
- **Description**: Comprehensive test suite containing network control profile test cases
- **Structure**: 
  - Root testsuite: "Network Control Profile"
  - Sub-suites: "My Services", "DHCP", "Portal", "Wi-Fi Calling", "mDNS Proxy"
  - Test cases: Various role-based test scenarios (Admin, Prime-Admin, Custom roles)
  - Features: HTML content, custom fields, step-by-step instructions

## Usage

These files are used for:

1. **Development**: Testing XML parsing and import functionality
2. **Documentation**: Providing examples of TestLink XML format
3. **Validation**: Ensuring our system can handle real-world TestLink exports
4. **Testing**: Unit and integration tests for import/export features

## Analysis

Detailed analysis of the XML structure can be found in:
- `docs/testlink-xml-analysis.md` - Comprehensive format analysis
- `docs/testlink-integration-todo.md` - Implementation roadmap

## Adding New Samples

When adding new TestLink XML files:

1. Use descriptive filenames
2. Update this README with file details
3. Ensure files are properly formatted and valid
4. Consider adding metadata about the source and purpose

## Format Notes

- All files use TestLink XML format
- Content is wrapped in CDATA sections
- HTML formatting is supported in descriptions and steps
- Custom fields provide extensible metadata
- Hierarchical structure with nested test suites 