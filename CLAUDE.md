# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a test case management system that generates test cases from design documents using AI-powered document parsing and analysis, with full TestLink XML format compatibility. The system consists of a Node.js/Express backend API and a React frontend application, containerized with Docker for easy deployment and development.

## Updated Goals & Priorities

### Primary Goal: TestLink Integration ✅
The system now includes TestLink integration capabilities to support industry-standard test case management workflows. This includes:

1. **XML Import/Export**: Support for TestLink XML format for seamless data exchange
2. **Test Case Format Compatibility**: Ensure generated test cases follow TestLink standards
3. **Bidirectional Sync**: Import from and export to TestLink systems
4. **Format Validation**: Validate XML structure and content against TestLink schemas

### Secondary Goal: Docker Containerization ✅
The system now supports containerized deployment with:

1. **Persistent Database Storage**: PostgreSQL with Docker volumes for data persistence
2. **Multi-Container Orchestration**: Docker Compose for easy deployment
3. **Development Environment**: Hot reloading and development-friendly setup
4. **Production Ready**: Optimized containers for production deployment

### Current Priority: Database Schema Updates
**Phase 2 Todo List - Database Schema Updates:**

1. **Update test_cases table schema**
   - [ ] Add `prerequisites` (TEXT) field
   - [ ] Add `execution_type` (INTEGER) field
   - [ ] Add `external_id` (VARCHAR) field
   - [ ] Add `version` (INTEGER) field
   - [ ] Add `is_open` (BOOLEAN) field
   - [ ] Add `active` (BOOLEAN) field

2. **Update test_steps table schema**
   - [ ] Add `execution_type` (INTEGER) field

3. **Create custom_fields table**
   - [ ] `id` (PRIMARY KEY)
   - [ ] `test_case_id` (INTEGER, FOREIGN KEY)
   - [ ] `field_name` (VARCHAR)
   - [ ] `field_value` (TEXT)
   - [ ] `created_at` (TIMESTAMP)
   - [ ] `updated_at` (TIMESTAMP)

4. **Update database schema file**
   - [ ] Modify `database/schema.sql`
   - [ ] Add migration scripts
   - [ ] Update sample data

## Project Structure

```
test-case-manager/
├── backend/                    # Node.js/Express backend
├── frontend/                   # React frontend
├── database/                   # Database schema and migrations
├── docker/                     # Docker configuration
│   ├── docker-compose.yml      # Production setup
│   ├── docker-compose.dev.yml  # Development setup
│   ├── Dockerfile.backend      # Backend container
│   ├── Dockerfile.frontend     # Frontend container
│   ├── Dockerfile.backend.dev  # Development backend
│   ├── Dockerfile.frontend.dev # Development frontend
│   ├── init.sql               # Database initialization
│   └── README.md              # Docker documentation
├── testlink-samples/          # TestLink XML sample files
│   ├── README.md              # Sample files documentation
│   └── Network Control Profile.testsuite-deep.xml
├── docs/                      # Documentation
│   ├── testlink-xml-analysis.md    # TestLink format analysis
│   └── testlink-integration-todo.md # Implementation roadmap
└── scripts/                   # Utility scripts
```

## TestLink XML Format Analysis

### Key Findings from `testlink-samples/Network Control Profile.testsuite-deep.xml`:

**Root Structure:**
```xml
<testsuite id="1672335" name="Network Control Profile">
  <node_order><![CDATA[16]]></node_order>
  <details><![CDATA[]]></details>
  <!-- Nested testsuites and testcases -->
</testsuite>
```

**Test Case Structure:**
```xml
<testcase internalid="1673052" name="Test Case Name">
  <node_order><![CDATA[1]]></node_order>
  <externalid><![CDATA[30122]]></externalid>
  <version><![CDATA[1]]></version>
  <summary><![CDATA[]]></summary>
  <preconditions><![CDATA[<p>Preconditions...</p>]]></preconditions>
  <execution_type><![CDATA[1]]></execution_type>
  <importance><![CDATA[2]]></importance>
  <estimated_exec_duration></estimated_exec_duration>
  <status>1</status>
  <is_open>1</is_open>
  <active>1</active>
  
  <steps>
    <step>
      <step_number><![CDATA[1]]></step_number>
      <actions><![CDATA[<div>Action description...</div>]]></actions>
      <expectedresults><![CDATA[<div>Expected result...</div>]]></expectedresults>
      <execution_type><![CDATA[1]]></execution_type>
    </step>
  </steps>
  
  <custom_fields>
    <custom_field>
      <name><![CDATA[CF_AUTOMATION_STATUS]]></name>
      <value><![CDATA[]]></value>
    </custom_field>
  </custom_fields>
</testcase>
```

**Key Elements Identified:**
- **testsuite**: Container for test cases and sub-suites
- **testcase**: Individual test case with metadata and steps
- **steps**: Collection of test execution steps
- **custom_fields**: Extensible field system for additional metadata
- **CDATA sections**: Used for HTML content in descriptions

**Important Attributes:**
- `internalid`: Unique identifier within TestLink
- `externalid`: External reference ID
- `execution_type`: Manual (1) vs Automated (2)
- `importance`: Priority level (1-3)
- `status`: Test case status
- `is_open` and `active`: Boolean flags

## Development Commands

### Docker Setup
```bash
# Start production environment
cd docker
docker-compose up -d

# Start development environment with hot reloading
docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Local Development
```bash
# Install all dependencies (root, backend, and frontend)
npm run install:all

# Set up PostgreSQL database (if not using Docker)
createdb testcasemanager
psql testcasemanager < database/schema.sql
```

### Development
```bash
# Start both backend and frontend development servers
npm run dev

# Start backend only (port 3001)
npm run dev:backend

# Start frontend only (port 3000)
npm run dev:frontend
```

### Testing
```bash
# Run all tests
npm test

# Run backend tests (Jest)
npm run test:backend

# Run frontend tests (React Testing Library)
npm run test:frontend

# Run backend tests in watch mode
cd backend && npm run test:watch

# Run tests in Docker containers
docker-compose exec backend npm test
docker-compose exec frontend npm test
```

### Building
```bash
# Build both frontend and backend
npm run build

# Build backend only
npm run build:backend

# Build frontend only
npm run build:frontend

# Build Docker containers
docker-compose build
```

## Architecture

### Backend (Node.js/Express)
- **Entry Point**: `backend/src/index.js`
- **Database**: PostgreSQL with Docker container and persistent volume
- **ORM**: Sequelize (configured but models not yet implemented)
- **Routes**: RESTful API endpoints in `backend/src/routes/`
  - `/api/projects` - Project management
  - `/api/testcases` - Test case CRUD operations
  - `/api/testlink/import` - TestLink XML import
  - `/api/testlink/export` - TestLink XML export
  - `/api/documents` - Document upload and AI processing
  - `/api/reports` - Test coverage and execution reports
- **Document Processing**: Supports PDF (pdf-parse), Word (mammoth), and Markdown (marked)
- **XML Processing**: TestLink XML parsing and generation
- **AI Integration**: OpenAI API for test case generation from documents
- **Authentication**: JWT-based (implementation pending)
- **File Uploads**: Multer for handling document uploads

### Frontend (React)
- **Entry Point**: `frontend/src/App.js`
- **State Management**: React Query for server state
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **File Uploads**: React Dropzone
- **Notifications**: React Toastify
- **Icons**: Lucide React
- **Table Components**: React Table

### Database Schema
Key entities in PostgreSQL (with TestLink compatibility):
- **projects**: Main project containers
- **test_suites**: Grouping for test cases (supports hierarchy)
- **test_cases**: Core test case data with TestLink fields
- **test_steps**: Execution steps with TestLink compatibility
- **custom_fields**: Extensible metadata system
- **test_executions**: Execution history and results
- **documents**: Uploaded files with parsed content
- **requirements**: Extracted from documents for traceability
- **test_reports**: Generated reports in various formats

### Docker Infrastructure
- **PostgreSQL**: Persistent database with volume storage
- **Backend**: Node.js container with hot reloading in development
- **Frontend**: React container with development server
- **Networking**: Isolated network for service communication
- **Volumes**: Persistent data storage and file uploads

## Key Features

1. **Document Processing**: Upload design documents and extract requirements
2. **AI-Powered Generation**: Generate test cases from parsed requirements using OpenAI API
3. **TestLink Integration**: Import/export TestLink XML format for industry compatibility
4. **Test Case Management**: Full CRUD operations with TestLink metadata
5. **Execution Tracking**: Record test results with history
6. **Reporting**: Generate coverage reports and execution summaries
7. **Export**: Multiple formats (PDF, CSV, JSON, Excel, TestLink XML)
8. **Docker Deployment**: Containerized with persistent storage

## Environment Configuration

### Docker Environment
Backend requires environment variables in Docker Compose:
- Database connection (PostgreSQL)
- JWT secret for authentication
- OpenAI API key for test generation
- File upload configuration

### Local Development
Backend requires `.env` file with:
- Database connection (PostgreSQL)
- JWT secret for authentication
- OpenAI API key for test generation
- File upload configuration

## Development Notes

- Backend API routes are currently stub implementations (TODO comments throughout)
- Database models need to be implemented with Sequelize
- Authentication middleware needs implementation
- Document processing services need completion
- AI integration for test case generation needs implementation
- TestLink XML parsing and generation services need implementation
- Frontend components are basic page structures awaiting API integration
- Docker setup is complete and ready for development

## Monorepo Structure

This uses npm workspaces with:
- Root package.json for orchestration
- Backend workspace in `backend/`
- Frontend workspace in `frontend/`
- Shared database schema in `database/`
- Docker configuration in `docker/`
- TestLink samples in `testlink-samples/`

## Testing Strategy

- Backend: Jest with Supertest for API testing
- Frontend: React Testing Library with Jest
- Database: Sample data included in schema for testing
- Docker: Container-based testing environment
- TestLink: XML format validation and import/export testing

## Deployment Strategy

### Development
- Docker Compose with hot reloading
- Persistent database volume
- Development-friendly environment variables
- Source code mounted as volumes

### Production
- Optimized Docker containers
- Production environment variables
- Health checks enabled
- Persistent data storage
- Load balancing ready