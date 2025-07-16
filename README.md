# Test Case Management System

A comprehensive test case management system that can generate test cases from design documents using AI-powered document parsing and analysis.

## Features

- **Document Upload & Processing**: Upload design documents (PDF, Word, Markdown) and automatically extract requirements
- **AI-Powered Test Case Generation**: Generate test cases from parsed requirements using LLM integration
- **Test Case Management**: Create, edit, organize, and execute test cases
- **Project Organization**: Organize test cases by projects and test suites
- **Test Execution Tracking**: Track test execution results and history
- **Comprehensive Reporting**: Generate test coverage reports, execution summaries, and performance metrics
- **Multiple Export Formats**: Export reports in PDF, CSV, JSON, and Excel formats

## Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **Sequelize** ORM
- **Multer** for file uploads
- **Document Processing Libraries**:
  - mammoth (Word documents)
  - pdf-parse (PDF documents)
  - marked (Markdown documents)
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

## Project Structure

```
test-case-manager/
├── backend/
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── models/           # Database models
│   │   ├── services/         # Business logic
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
├── docs/                     # Documentation
└── scripts/                  # Utility scripts
```

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- PostgreSQL (v12 or later)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd test-case-manager
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up the database:
```bash
createdb testcasemanager
psql testcasemanager < database/schema.sql
```

4. Configure environment variables:
```bash
# Copy the example environment file
cp backend/.env.example backend/.env

# Edit the .env file with your configuration
```

5. Start the development servers:
```bash
npm run dev
```

This will start both the backend server (port 3001) and frontend development server (port 3000).

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
PORT=3001
NODE_ENV=development

# Database configuration
DB_HOST=localhost
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

4. **Organize Test Cases**: Group related test cases into test suites and assign priorities.

5. **Execute Tests**: Mark test cases as passed, failed, or blocked, and track execution history.

6. **Generate Reports**: Create comprehensive reports to analyze test coverage and execution metrics.

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