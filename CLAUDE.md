# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a test case management system that generates test cases from design documents using AI-powered document parsing and analysis. The system consists of a Node.js/Express backend API and a React frontend application.

## Development Commands

### Installation and Setup
```bash
# Install all dependencies (root, backend, and frontend)
npm run install:all

# Set up PostgreSQL database
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
```

### Building
```bash
# Build both frontend and backend
npm run build

# Build backend only
npm run build:backend

# Build frontend only
npm run build:frontend
```

## Architecture

### Backend (Node.js/Express)
- **Entry Point**: `backend/src/index.js`
- **Database**: PostgreSQL with comprehensive schema in `database/schema.sql`
- **ORM**: Sequelize (configured but models not yet implemented)
- **Routes**: RESTful API endpoints in `backend/src/routes/`
  - `/api/projects` - Project management
  - `/api/testcases` - Test case CRUD operations
  - `/api/documents` - Document upload and AI processing
  - `/api/reports` - Test coverage and execution reports
- **Document Processing**: Supports PDF (pdf-parse), Word (mammoth), and Markdown (marked)
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
Key entities in PostgreSQL:
- **projects**: Main project containers
- **documents**: Uploaded files with parsed content
- **test_suites**: Grouping for test cases
- **test_cases**: Core test case data with steps, expected results
- **test_executions**: Execution history and results
- **requirements**: Extracted from documents for traceability
- **test_reports**: Generated reports in various formats

## Key Features

1. **Document Processing**: Upload design documents and extract requirements
2. **AI-Powered Generation**: Generate test cases from parsed requirements using OpenAI API
3. **Test Case Management**: Full CRUD operations with status tracking
4. **Execution Tracking**: Record test results with history
5. **Reporting**: Generate coverage reports and execution summaries
6. **Export**: Multiple formats (PDF, CSV, JSON, Excel)

## Environment Configuration

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
- Frontend components are basic page structures awaiting API integration

## Monorepo Structure

This uses npm workspaces with:
- Root package.json for orchestration
- Backend workspace in `backend/`
- Frontend workspace in `frontend/`
- Shared database schema in `database/`

## Testing Strategy

- Backend: Jest with Supertest for API testing
- Frontend: React Testing Library with Jest
- Database: Sample data included in schema for testing