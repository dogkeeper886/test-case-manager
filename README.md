# Test Case Management System

A comprehensive test case management system that can generate test cases from design documents using AI-powered document parsing and analysis, with full TestLink XML format compatibility for industry-standard test case management workflows.

## Features

- **Document Upload & Processing**: Upload design documents (PDF, Word, Markdown) and automatically extract requirements
- **AI-Powered Test Case Generation**: Generate test cases from parsed requirements using LLM integration
- **Test Case Management**: Create, edit, organize, and execute test cases
- **TestLink Integration**: Import from and export to TestLink XML format for seamless integration with existing test management systems
- **Project Organization**: Organize test cases by projects and test suites
- **Test Execution Tracking**: Track test execution results and history
- **Comprehensive Reporting**: Generate test coverage reports, execution summaries, and performance metrics
- **Multiple Export Formats**: Export reports in PDF, CSV, JSON, Excel, and TestLink XML formats
- **Docker Support**: Containerized deployment with persistent database storage

## TestLink Integration

### Import/Export Capabilities
- **XML Import**: Import test cases from TestLink XML files
- **XML Export**: Export test cases to TestLink XML format
- **Format Validation**: Validate XML structure and content
- **Bidirectional Sync**: Seamless data exchange with TestLink systems
- **Custom Fields Support**: Handle extensible metadata fields
- **Hierarchical Structure**: Support nested test suites and complex organization

### Supported TestLink Features
- Test suites with nested hierarchy
- Test cases with detailed metadata
- Step-by-step execution instructions
- HTML content in descriptions and steps
- Custom fields for additional metadata
- Execution type (Manual/Automated)
- Priority levels and status tracking
- Version control and external IDs

## Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database (Docker container with persistent volume)
- **Sequelize** ORM
- **Multer** for file uploads
- **Document Processing Libraries**:
  - mammoth (Word documents)
  - pdf-parse (PDF documents)
  - marked (Markdown documents)
- **XML Processing**:
  - xml2js or fast-xml-parser (TestLink XML)
  - html-entities (HTML content handling)
- **JWT** for authentication
- **OpenAI API** for test case generation

### Frontend
- **React** with functional components and hooks
- **React Router** for navigation
- **React Query** for data fetching
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hook Form** for form management
- **React Dropzone** for file uploads
- **React Toastify** for notifications

### Infrastructure
- **Docker** for containerization
- **Docker Compose** for multi-container orchestration
- **Persistent Volumes** for database data storage
- **Environment-based Configuration** for different deployment scenarios

## Project Structure

```
test-case-manager/
├── backend/
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── models/           # Database models
│   │   ├── services/         # Business logic
│   │   │   ├── xmlParser.js      # TestLink XML parsing
│   │   │   ├── testlinkImporter.js # XML import service
│   │   │   └── testlinkExporter.js # XML export service
│   │   ├── utils/            # Utility functions
│   │   ├── middleware/       # Express middleware
│   │   └── index.js          # Main entry point
│   ├── tests/                # Backend tests
│   ├── config/               # Configuration files
│   └── uploads/              # File upload directory
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── utils/            # Utility functions
│   │   ├── hooks/            # Custom React hooks
│   │   └── styles/           # CSS styles
│   ├── public/               # Static files
│   └── tests/                # Frontend tests
├── database/
│   └── schema.sql            # Database schema
├── docker/
│   ├── docker-compose.yml    # Multi-container setup
│   ├── Dockerfile.backend    # Backend container
│   ├── Dockerfile.frontend   # Frontend container
│   └── init.sql              # Database initialization
├── testlink-samples/         # TestLink XML sample files
│   ├── README.md             # Sample files documentation
│   └── Network Control Profile.testsuite-deep.xml
├── docs/
│   ├── testlink-xml-analysis.md    # TestLink format analysis
│   └── testlink-integration-todo.md # Implementation roadmap
└── scripts/                  # Utility scripts
```

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (v16 or later) - for local development
- npm or yarn

### Quick Start with Docker

1. **Clone the repository**:
```bash
git clone <repository-url>
cd test-case-manager
```

2. **Start with Docker Compose**:
```bash
# Start all services (database, backend, frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

3. **Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: localhost:5432 (PostgreSQL)

### Local Development Setup

1. **Install dependencies**:
```bash
npm run install:all
```

2. **Set up the database** (if not using Docker):
```bash
createdb testcasemanager
psql testcasemanager < database/schema.sql
```

3. **Configure environment variables**:
```bash
# Copy the example environment file
cp backend/.env.example backend/.env

# Edit the .env file with your configuration
```

4. **Start the development servers**:
```bash
npm run dev
```

### Docker Configuration

The Docker setup includes:

- **PostgreSQL Database**: Persistent volume for data storage
- **Backend API**: Node.js/Express application
- **Frontend**: React development server
- **Volume Mapping**: Database data persists between container restarts

#### Database Persistence

Database data is stored in a Docker volume:
```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```

This ensures your data persists even when containers are recreated.

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
PORT=3001
NODE_ENV=development

# Database configuration
DB_HOST=localhost  # Use 'postgres' for Docker
DB_PORT=5432
DB_NAME=testcasemanager
DB_USER=postgres
DB_PASSWORD=your_password

# JWT configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# OpenAI API (for test case generation)
OPENAI_API_KEY=your-openai-api-key

# File upload configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Test Cases
- `GET /api/testcases` - Get all test cases
- `POST /api/testcases` - Create a new test case
- `GET /api/testcases/:id` - Get test case by ID
- `PUT /api/testcases/:id` - Update test case
- `DELETE /api/testcases/:id` - Delete test case
- `POST /api/testcases/:id/execute` - Execute test case

### TestLink Integration
- `POST /api/testlink/import` - Import TestLink XML file
- `GET /api/testlink/export` - Export to TestLink XML format
- `POST /api/testlink/validate` - Validate TestLink XML format

### Documents
- `POST /api/documents/upload` - Upload and parse document
- `GET /api/documents/:id` - Get document details
- `POST /api/documents/:id/generate-tests` - Generate test cases from document

### Reports
- `GET /api/reports/test-coverage` - Get test coverage report
- `GET /api/reports/execution-summary` - Get test execution summary
- `GET /api/reports/export` - Export reports in various formats

## Usage

1. **Create a Project**: Start by creating a new project to organize your test cases.

2. **Upload Documents**: Upload design documents (requirements, specifications, user stories) in PDF, Word, or Markdown format.

3. **Generate Test Cases**: Use the AI-powered generation feature to automatically create test cases from your uploaded documents.

4. **Import TestLink Files**: Import existing test cases from TestLink XML files for seamless integration.

5. **Organize Test Cases**: Group related test cases into test suites and assign priorities.

6. **Execute Tests**: Mark test cases as passed, failed, or blocked, and track execution history.

7. **Export to TestLink**: Export your test cases to TestLink XML format for use in other systems.

8. **Generate Reports**: Create comprehensive reports to analyze test coverage and execution metrics.

## Development

### Running Tests
```bash
# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:frontend

# Run all tests
npm test
```

### Building for Production
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Development
```bash
# Build and start development environment
docker-compose -f docker-compose.dev.yml up --build

# Run tests in containers
docker-compose exec backend npm test
docker-compose exec frontend npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.