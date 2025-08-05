# Test Case Management System

A comprehensive test case management system with full TestLink XML compatibility and RESTful API.

## 🚀 Key Features
- **RESTful API**: Complete REST API for test case management operations
- **Test Case Management**: Create, edit, organize, and execute test cases with full CRUD operations
- **TestLink Integration**: Import from and export to TestLink XML format for seamless integration
- **Project Organization**: Organize test cases by projects and test suites with hierarchical structure
- **Docker Support**: Containerized deployment with persistent database storage

## 🔌 Separated MCP Server

### MCP Server Setup
The Test Case Manager now includes a separated MCP server that runs independently via Docker.

#### Building the MCP Server Image
```bash
cd mcp-server
./build-image.sh
```

#### Claude Code Configuration
Add this to your Claude Code MCP configuration (`~/.claude/mcp_servers.json`):

```json
{
  "mcpServers": {
    "test-case-manager": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm", "--network", "host",
        "-e", "API_BASE_URL=http://YOUR_TEST_CASE_MANAGER_IP:3001/api",
        "test-case-manager-mcp-server:latest"
      ]
    }
  }
}
```

Replace `YOUR_TEST_CASE_MANAGER_IP` with the actual IP address where your test case manager backend is running.

#### Verify MCP Connection
Once configured, verify the MCP server is working with Claude Code:

```bash
claude mcp list
```

You should see:
```
test-case-manager: docker run -i --rm --network host -e API_BASE_URL=http://YOUR_TEST_CASE_MANAGER_IP:3001/api test-case-manager-mcp-server:latest - ✓ Connected
```

#### Available MCP Tools
- `list_projects` - List all projects
- `create_project` - Create a new project  
- `list_test_cases` - List test cases (optionally by project)
- `create_test_case` - Create a new test case
- `list_test_suites` - List test suites (optionally by project)
- `create_test_suite` - Create a new test suite

## 🔌 API Endpoints

### Core API
- **Health Check**: `http://localhost:3001/api/health`
- **Frontend**: `http://localhost:3000`

## 🎨 TestLink Integration

### ✅ **Completed Import/Export Capabilities**
- **XML Import**: Import test cases from TestLink XML files with full validation
- **XML Export**: Export test cases to TestLink XML format
- **Format Validation**: Validate XML structure and content against TestLink schemas
- **Bidirectional Sync**: Seamless data exchange with TestLink systems
- **Custom Fields Support**: Handle extensible metadata fields
- **Hierarchical Structure**: Support nested test suites and complex organization

### ✅ **Supported TestLink Features**
- Test suites with nested hierarchy (3+ levels deep)
- Test cases with detailed metadata (internal_id, external_id, version)
- Step-by-step execution instructions with HTML content
- Custom fields for additional metadata (automation status, priority)
- Execution type (Manual/Automated)
- Priority levels and status tracking
- Version control and external IDs
- Import logging and error tracking

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose

### Quick Start with Docker

1. **Clone the repository**:
```bash
git clone <repository-url>
cd test-case-manager
```

2. **Start with Docker Compose** (Recommended):
```bash
# Navigate to docker directory
cd docker

# Start all services (database, backend, frontend)
docker compose up -d

# View logs (optional)
docker compose logs -f

# Stop services
docker compose down
```

3. **Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: localhost:5432 (PostgreSQL)

### 🐳 **Docker Commands Reference**

**Essential Commands for Every Session:**

```bash
# Start the application
cd docker
docker compose up -d

# Stop the application
cd docker
docker compose down

# View running containers
docker compose ps

# View logs
docker compose logs -f

# Rebuild containers (if code changes)
docker compose up -d --build

# Reset everything (removes volumes too)
docker compose down -v
docker compose up -d
```

**Troubleshooting:**
- If you get "address already in use" errors, run `docker compose down` first
- If containers won't start, try `docker compose down -v` to reset volumes
- For code changes, use `docker compose up -d --build` to rebuild containers

### Docker Configuration

The Docker setup includes:

- **PostgreSQL Database**: Persistent volume for data storage
- **Backend API**: Node.js/Express application with hot reloading
- **Frontend**: React development server with hot reloading
- **Volume Mapping**: Database data persists between container restarts

#### Database Persistence

Database data is stored in a Docker volume:
```yaml
volumes:
  - ../database/data:/var/lib/postgresql/data
```

This ensures your data persists even when containers are recreated.

## 🔌 API Endpoints

### ✅ **Working Endpoints**
- `GET /api/health` - Health check
- `GET /api/testcases` - Get all test cases (183 records)
- `POST /api/testcases` - Create a new test case
- `GET /api/testcases/:id` - Get test case by ID
- `PUT /api/testcases/:id` - Update test case
- `DELETE /api/testcases/:id` - Delete test case
- `GET /api/projects` - Get all projects (7 records)
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/testsuites` - Get all test suites (37 records)
- `POST /api/testsuites` - Create a new test suite
- `GET /api/testsuites/:id` - Get test suite by ID
- `PUT /api/testsuites/:id` - Update test suite
- `DELETE /api/testsuites/:id` - Delete test suite

### ✅ **TestLink Integration Endpoints**
- `POST /api/import/testlink` - Import TestLink XML file
- `POST /api/import/testlink/content` - Import TestLink XML content
- `POST /api/import/validate` - Validate TestLink XML format
- `GET /api/import/status/:id` - Get import status
- `GET /api/import/logs/:projectId` - Get import history

## 📊 Database Schema

### Core Tables
- **projects**: Main project containers
- **test_suites**: Grouping for test cases (supports hierarchy)
- **test_cases**: Core test case data with TestLink fields
- **test_steps**: Execution steps with TestLink compatibility
- **custom_fields**: Extensible metadata system
- **test_executions**: Execution history and results
- **documents**: Uploaded files with parsed content
- **requirements**: Extracted from documents for traceability
- **test_reports**: Generated reports in various formats

### TestLink Integration
- **Enhanced test_suites**: Added external_id, node_order, parent_suite_id
- **Enhanced test_cases**: Added external_id, internal_id, version, execution_type
- **test_steps**: Individual test steps with actions and expected results
- **custom_fields**: Custom field storage for TestLink metadata
- **import_logs**: Comprehensive import operation tracking

### Database Migration System

#### Overview
The system uses an **automatic migration system** that runs on backend startup to ensure the database schema is always up-to-date.

#### Migration Files
Located in `database/migrations/`:
- **`001_testlink_import_schema.sql`** - TestLink import functionality
- **`002_activity_tracking.sql`** - Activity logging system
- **`003_add_status_to_projects.sql`** - Project status management
- **`004_import_file_retry_window.sql`** - Import file retry functionality

#### How Migrations Work
1. **Automatic Execution**: Migrations run automatically on backend startup
2. **Idempotent Operations**: Safe to run multiple times, skips already applied migrations
3. **Tracking**: Uses `migrations` table to track applied migrations
4. **Error Handling**: Graceful handling of migration failures

#### Migration Status API
```bash
# Check migration status
curl http://localhost:3001/api/migrations/status

# Manually run migrations
curl -X POST http://localhost:3001/api/migrations/run
```

#### Manual Migration Application
If you need to apply migrations manually:
```bash
# Copy migration to container
docker compose cp ../database/migrations/001_testlink_import_schema.sql postgres:/tmp/

# Apply migration
docker compose exec postgres psql -U postgres -d testcasemanager -f /tmp/001_testlink_import_schema.sql
```


### Database Management

#### Connection Details
- **Host**: `localhost` (external) / `postgres` (internal)
- **Port**: `5432`
- **Database**: `testcasemanager`
- **User**: `postgres`
- **Password**: `postgres123`

#### Common Database Operations
```bash
# Connect to database
docker compose exec postgres psql -U postgres -d testcasemanager

# List all tables
\dt

# View table structure
\d table_name

# Backup database
docker compose exec postgres pg_dump -U postgres testcasemanager > backup.sql

# Restore database
docker compose exec -T postgres psql -U postgres -d testcasemanager < backup.sql

# Check migration status
docker compose exec postgres psql -U postgres -d testcasemanager -c "SELECT * FROM migrations;"
```

#### Database Schema Details

##### Projects Table
```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

##### Test Cases Table (Enhanced for TestLink)
```sql
CREATE TABLE test_cases (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    test_suite_id INTEGER REFERENCES test_suites(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    preconditions TEXT,
    test_steps TEXT NOT NULL,
    expected_result TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'pending',
    -- TestLink-specific fields
    external_id VARCHAR(100),
    internal_id VARCHAR(100),
    version VARCHAR(20),
    execution_type INTEGER DEFAULT 1, -- 1=Manual, 2=Automated
    importance INTEGER DEFAULT 2, -- 1=Low, 2=Medium, 3=High
    is_open BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    import_source VARCHAR(50),
    imported_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

##### Import Logs Table
```sql
CREATE TABLE import_logs (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    import_type VARCHAR(50) NOT NULL, -- 'testlink', 'other'
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER DEFAULT 0,
    total_test_suites INTEGER DEFAULT 0,
    total_test_cases INTEGER DEFAULT 0,
    imported_test_suites INTEGER DEFAULT 0,
    imported_test_cases INTEGER DEFAULT 0,
    errors JSONB,
    status VARCHAR(50) DEFAULT 'processing', -- processing, completed, failed
    file_path VARCHAR(500),
    retry_until TIMESTAMP NULL,
    cleanup_scheduled BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL
);
```

##### Activities Table (Activity Tracking)
```sql
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) DEFAULT 'system',
    action_type VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'import', 'export', 'execute'
    entity_type VARCHAR(100) NOT NULL, -- 'project', 'test_case', 'test_suite', 'document', 'report'
    entity_id INTEGER,
    entity_name VARCHAR(255),
    description TEXT NOT NULL,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Database Functions

##### Activity Logging Function
```sql
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id VARCHAR(255),
    p_action_type VARCHAR(100),
    p_entity_type VARCHAR(100),
    p_entity_id INTEGER,
    p_entity_name VARCHAR(255),
    p_description TEXT,
    p_metadata JSONB
) RETURNS INTEGER;
```

##### Recent Activities Function
```sql
CREATE OR REPLACE FUNCTION get_recent_activities(
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0,
    p_user_id VARCHAR(255) DEFAULT NULL,
    p_action_type VARCHAR(100) DEFAULT NULL,
    p_entity_type VARCHAR(100) DEFAULT NULL
) RETURNS TABLE (...);
```

#### Performance Indexes
The database includes comprehensive indexes for optimal performance:
- **Test cases**: `idx_test_cases_project_id`, `idx_test_cases_status`, `idx_test_cases_priority`
- **Test suites**: `idx_test_suites_external_id`, `idx_test_suites_parent_id`
- **Import logs**: `idx_import_logs_project_id`, `idx_import_logs_status`, `idx_import_logs_started_at`
- **Activities**: `idx_activities_user_id`, `idx_activities_action_type`, `idx_activities_created_at`

#### Database Initialization
The database is automatically initialized with:
- **Base schema** from `database/schema.sql`
- **All migrations** applied automatically on startup
- **Sample data** for testing
- **TestLink-compatible schema** for import/export functionality

The initialization script (`docker/init.sql`) runs when the PostgreSQL container starts for the first time, and the migration system ensures all subsequent schema changes are applied automatically.

## 🧪 Testing

### Running Tests
```bash
# Run tests in Docker containers
docker compose exec backend npm test
docker compose exec frontend npm test

# Run backend tests only
docker compose exec backend npm test

# Run frontend tests only
docker compose exec frontend npm test
```

### Test Results
- **Backend**: Jest with Supertest for API testing
- **Frontend**: React Testing Library with Jest
- **Database**: Sample data included in schema for testing
- **Docker**: Container-based testing environment
- **TestLink**: XML format validation and import/export testing

## 🚀 Development

### Development Commands
```bash
# Start development environment with hot reloading
cd docker
docker compose -f docker-compose.dev.yml up --build

# Start production environment
cd docker
docker compose up -d

# Rebuild containers after code changes
docker compose up -d --build
```

### Docker Development
```bash
# Build and start development environment
cd docker
docker compose -f docker-compose.dev.yml up --build

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## 🎯 Usage

### Web Interface
1. **Create a Project**: Start by creating a new project to organize your test cases
2. **Import TestLink Files**: Import existing test cases from TestLink XML files  
3. **Organize Test Cases**: Group related test cases into test suites and assign priorities
4. **Execute Tests**: Mark test cases as passed, failed, or blocked, and track execution history
5. **Export to TestLink**: Export your test cases to TestLink XML format for use in other systems

### API Integration
1. **RESTful API**: Use standard HTTP REST API endpoints for all operations
2. **Manage Projects**: Create and list projects using API endpoints
3. **Bulk Import**: Import multiple test cases via TestLink XML upload
4. **TestLink Integration**: Import/export TestLink XML content through API endpoints

## 🔧 Environment Variables

Environment variables are configured in the Docker Compose files. For local development, you can modify the environment variables in:

- `docker/docker-compose.yml` - Production environment
- `docker/docker-compose.dev.yml` - Development environment

**Key Environment Variables:**
```env
# Database configuration (Docker)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=testcasemanager
DB_USER=postgres
DB_PASSWORD=your_password

# Backend configuration
PORT=3001
NODE_ENV=development

# API configuration
API_PORT=3001          # HTTP API port

# File upload configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

**Note**: The application is configured to work with Docker by default. No local environment setup is required.


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository.
