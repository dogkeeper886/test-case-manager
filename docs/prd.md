# Test Case Manager - Separated MCP Architecture Product Requirements Document (PRD)

## Goals and Background Context

### Goals
- Resolve Docker/HTTP connectivity issues between Claude Code and MCP server
- Enable flexible deployment scenarios including cross-host configurations
- Implement clean separation of concerns between test creation and management phases
- Establish robust HTTP API communication for persistent data handling
- Support multi-distro/device deployment through containerization

### Background Context

The current integrated architecture has proven problematic due to Docker networking challenges and connectivity issues between Claude Code and the MCP server. Previous integration attempts have failed, validating the need for architectural separation. The core value chain involves Human input (docs/ideas) → IDE/Agent → Test case document → MCP → TestLink-compatible storage → Export, which requires two distinct phases: Creation Phase (IDE/Agent) and Management Phase (MCP). This separation approach addresses deployment flexibility needs while ensuring data persistence and protection through proper HTTP API abstraction.

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-08-05 | 1.0 | Initial PRD created from brainstorming session results | John (PM) |

## Requirements

### Functional

**FR1:** The MCP server must operate in a separate Docker container with stdio connection from the IDE

**FR2:** The system must support HTTP API communication using RESTful patterns for CRUD operations on test cases, test suites, and projects

**FR3:** Environment variables must store the test case management system URL to enable cross-host deployment scenarios

**FR4:** The system must provide immediate failure handling with clear error feedback for debugging

**FR5:** The MCP server must import test cases to TestLink-compatible system for storage

**FR6:** The system must support a complete workflow: Human input → IDE/Agent → Test case document → MCP → TestLink-compatible storage → Export

**FR7:** The separated architecture must maintain deployment flexibility across multiple distributions and devices

### Non Functional  

**NFR1:** Container startup time must not exceed 30 seconds to maintain developer workflow efficiency

**NFR2:** HTTP API response times must be under 500ms for standard CRUD operations to ensure responsive user experience

**NFR3:** The system must gracefully handle network connectivity issues between containers without data loss

**NFR4:** Environment variable configuration must support both development and production deployment scenarios

**NFR5:** Error messages must provide sufficient detail for developers to diagnose and resolve connectivity or configuration issues

## Technical Assumptions

### Repository Structure: Monorepo
The current test-case-manager repository should continue as a monorepo containing both the MCP server container and the test case management system, enabling coordinated development and deployment.

### Service Architecture
**CRITICAL DECISION:** Containerized microservices architecture with Docker containers for:
- Separated MCP server (stdio connection to IDE)  
- Test Case Management System (HTTP API server)
- Container orchestration for development and production deployment

### Testing Requirements  
**CRITICAL DECISION:** Unit + Integration testing approach including:
- Unit tests for MCP server components
- Integration tests for HTTP API endpoints
- Container networking tests to validate stdio and HTTP communication
- End-to-end tests for the complete workflow chain

### Additional Technical Assumptions and Requests
- **Docker Networking:** Use Docker Compose for local development with proper service discovery
- **Environment Configuration:** Support for `.env` files and environment variable injection for different deployment contexts
- **HTTP Client Libraries:** Standard HTTP client libraries for MCP-to-API communication (language-specific)
- **Container Orchestration:** Docker Compose for development, with consideration for Kubernetes or similar for production
- **Logging & Monitoring:** Structured logging in both containers with correlation IDs for request tracing
- **API Specification:** OpenAPI/Swagger specification for the HTTP API to ensure clear contract definition

## Epic List

**Epic 1: Remove Current MCP Implementation & Foundation Setup**
Remove the existing integrated MCP implementation that's causing Docker/HTTP connectivity issues and establish clean foundation for separated architecture.

**Epic 2: Separated MCP Container Architecture** 
Implement the new MCP server in a separate Docker container with stdio connectivity and proper environment configuration.

**Epic 3: HTTP API Communication Layer**
Build the RESTful HTTP API for CRUD operations on test cases, test suites, and projects with robust error handling.

**Epic 4: TestLink Integration & Complete Workflow**
Enable the full workflow chain from test case creation through TestLink-compatible storage and export functionality.

## Epic 1: Remove Current MCP Implementation & Foundation Setup

**Epic Goal:** Clean removal of the problematic integrated MCP implementation and establish a clean foundation for the new separated architecture. This epic eliminates the current Docker/HTTP connectivity issues while preserving any reusable components and setting up the basic project structure for the new approach.

### Story 1.1: Audit Current MCP Implementation
As a developer,
I want to thoroughly document the current MCP implementation and its dependencies,
so that I can safely remove it without breaking other system components.

#### Acceptance Criteria
1. All MCP-related files and directories are identified and catalogued
2. Dependencies between MCP components and other system parts are mapped
3. Current Docker configuration related to MCP is documented
4. Any reusable code components are identified for potential preservation
5. Impact assessment of removal is documented

### Story 1.2: Remove Integrated MCP Server Code
As a developer,
I want to remove all integrated MCP server implementation files,
so that the codebase is clean for the new separated architecture.

#### Acceptance Criteria
1. All MCP server source code files are removed from the main codebase
2. MCP-related imports and dependencies are cleaned from other modules
3. Any MCP configuration files are removed or updated
4. Build scripts and package dependencies are updated to remove MCP references
5. Code compiles successfully without MCP integration

### Story 1.3: Clean Up Docker Configuration
As a developer,
I want to remove MCP-related Docker configuration and networking setup,
so that container conflicts don't occur with the new architecture.

#### Acceptance Criteria
1. Docker Compose files are updated to remove MCP service definitions
2. MCP-related environment variables are removed from Docker configuration
3. Network configurations specific to integrated MCP are cleaned up
4. Volume mounts related to MCP are removed
5. Docker builds successfully without MCP components

### Story 1.4: Update Documentation and README
As a developer,
I want updated documentation that reflects the removal of integrated MCP,
so that team members understand the current system state.

#### Acceptance Criteria
1. README.md is updated to remove references to integrated MCP functionality
2. Architecture documentation reflects the current state without MCP
3. Setup instructions are updated to remove MCP-related steps
4. Any API documentation related to MCP endpoints is removed or marked as deprecated
5. Change log documents the removal with rationale

## Epic 2: Separated MCP Container Architecture

**Epic Goal:** Implement the new MCP server in a separate Docker container with stdio connectivity to resolve the Docker/HTTP connectivity issues identified in the brainstorming session. This epic establishes the foundation for reliable communication between Claude Code and the MCP server while enabling flexible deployment scenarios including cross-host configurations.

### Story 2.1: Create Separated MCP Server Project Structure
As a developer,
I want a clean project structure for the separated MCP server,
so that it can be developed and deployed independently.

#### Acceptance Criteria
1. New directory structure created for separated MCP server components
2. Basic package configuration files established (package.json, requirements.txt, etc.)
3. Docker-specific files created (Dockerfile, .dockerignore)
4. Basic logging and configuration setup implemented
5. Project builds successfully in isolation

### Story 2.2: Implement MCP Server Core Functionality
As a developer,
I want the core MCP server functionality implemented,
so that it can handle test case management operations.

#### Acceptance Criteria
1. MCP protocol compliance implemented for stdio communication
2. Core MCP server handlers for test case operations created
3. Basic error handling and logging implemented
4. Configuration loading from environment variables working
5. Server responds correctly to MCP protocol messages

### Story 2.3: Create Docker Container Configuration
As a developer,
I want proper Docker container configuration for the MCP server,
so that it can be deployed reliably across different environments.

#### Acceptance Criteria
1. Dockerfile optimized for MCP server deployment
2. Docker Compose service definition created
3. Environment variable configuration documented and implemented
4. Container health check endpoint implemented
5. Container starts successfully and accepts stdio connections

### Story 2.4: Implement Stdio Communication Bridge
As a developer,
I want reliable stdio communication between Claude Code and the containerized MCP server,
so that the Docker connectivity issues are resolved.

#### Acceptance Criteria
1. Stdio input/output handling properly implemented in container
2. Message serialization/deserialization working correctly
3. Connection error handling and recovery implemented
4. Communication tested with Claude Code integration
5. Performance meets acceptable response time requirements

## Epic 3: HTTP API Communication Layer

**Epic Goal:** Implement the RESTful HTTP API for CRUD operations on test cases, test suites, and projects with robust error handling and environment-based configuration. This epic enables persistent data handling and database protection through proper abstraction while supporting cross-host deployment scenarios.

### Story 3.1: Design and Document HTTP API Specification
As a developer,
I want a comprehensive API specification for test case management operations,
so that the MCP server can communicate reliably with the test management system.

#### Acceptance Criteria
1. OpenAPI/Swagger specification created for all CRUD endpoints
2. Test case, test suite, and project data models defined
3. Error response formats and HTTP status codes documented
4. Authentication and authorization patterns specified
5. API versioning strategy documented

### Story 3.2: Implement Test Case CRUD Endpoints
As a developer,
I want HTTP endpoints for test case operations,
so that test cases can be created, read, updated, and deleted via API.

#### Acceptance Criteria
1. POST /api/v1/test-cases endpoint for creating test cases
2. GET /api/v1/test-cases endpoint for listing test cases
3. GET /api/v1/test-cases/{id} endpoint for retrieving specific test cases
4. PUT /api/v1/test-cases/{id} endpoint for updating test cases
5. DELETE /api/v1/test-cases/{id} endpoint for deleting test cases
6. All endpoints return appropriate HTTP status codes and error messages

### Story 3.3: Implement Test Suite and Project CRUD Endpoints
As a developer,
I want HTTP endpoints for test suite and project operations,
so that the complete test management hierarchy can be managed via API.

#### Acceptance Criteria
1. CRUD endpoints implemented for test suites following same patterns as test cases
2. CRUD endpoints implemented for projects following same patterns as test cases
3. Hierarchical relationships between projects, test suites, and test cases properly handled
4. Bulk operations supported for efficiency (e.g., create multiple test cases)
5. Query parameters for filtering and pagination implemented

### Story 3.4: Add Environment-Based Configuration and Error Handling
As a developer,
I want robust configuration and error handling for the HTTP API,
so that it can operate reliably across different deployment environments.

#### Acceptance Criteria
1. Environment variables for API base URL and connection settings implemented
2. Comprehensive error handling with meaningful error messages
3. Request timeout and retry logic implemented
4. Connection pooling and resource management optimized
5. Logging and monitoring hooks integrated for observability

## Epic 4: TestLink Integration & Complete Workflow

**Epic Goal:** Enable the full workflow chain from test case creation through TestLink-compatible storage and export functionality. This epic completes the core value chain identified in the brainstorming session: Human (docs/ideas) → IDE/Agent → Test case document → MCP → TestLink-compatible storage → Export.

### Story 4.1: Implement TestLink Data Format Compatibility
As a developer,
I want the system to handle TestLink-compatible data formats,
so that test cases can be exported to and imported from TestLink systems.

#### Acceptance Criteria
1. TestLink XML export format parsing and generation implemented
2. Data mapping between internal test case format and TestLink format created
3. TestLink project structure compatibility ensured
4. Test case hierarchy and relationships preserved in TestLink format
5. Format validation and error handling for malformed TestLink data

### Story 4.2: Create Test Case Import Functionality
As a user,
I want to import test cases from various sources into the system,
so that existing test cases can be integrated into the workflow.

#### Acceptance Criteria
1. Import from TestLink XML format working
2. Import from common test case document formats (CSV, Excel) implemented
3. Batch import processing with progress reporting
4. Duplicate detection and handling during import
5. Import validation with detailed error reporting

### Story 4.3: Implement TestLink Export Functionality
As a user,
I want to export test cases to TestLink-compatible format,
so that they can be used in TestLink systems.

#### Acceptance Criteria
1. Export to TestLink XML format working
2. Export filtering by project, test suite, or custom criteria
3. Export configuration options (include/exclude fields, formatting preferences)
4. Export progress reporting for large datasets
5. Export validation ensuring TestLink compatibility

### Story 4.4: Complete End-to-End Workflow Integration
As a user,
I want the complete workflow from test case creation to TestLink export working seamlessly,
so that the full value chain delivers the intended productivity benefits.

#### Acceptance Criteria
1. Full workflow tested: IDE/Agent → Test case document → MCP → Storage → TestLink export
2. Workflow status tracking and progress reporting implemented
3. Error handling and recovery at each workflow stage
4. Performance optimization for large test case sets
5. Documentation and user guides for complete workflow usage

## Checklist Results Report

### Executive Summary
- **Overall PRD Completeness:** 95%
- **MVP Scope Appropriateness:** Just Right  
- **Readiness for Architecture Phase:** Ready
- **Assessment:** Technical architecture PRD with clear implementation roadmap

### Final Decision: READY FOR ARCHITECT
The PRD comprehensively defines the separated MCP container architecture with clear technical requirements, logical epic sequencing, and detailed user stories ready for implementation.

## Next Steps

### Architect Prompt
Design the technical architecture for the separated MCP container system based on this PRD. Implement the four-epic roadmap starting with removal of current MCP integration, then separated container architecture, HTTP API layer, and TestLink integration. Prioritize resolving Docker/HTTP connectivity issues while maintaining deployment flexibility.