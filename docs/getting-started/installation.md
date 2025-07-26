# Installation Guide

## 🚀 **Quick Start (5 Minutes)**

### **Prerequisites**
- Docker and Docker Compose installed
- Git (for cloning the repository)

### **Step 1: Clone and Navigate**
```bash
git clone <repository-url>
cd test-case-manager
```

### **Step 2: Start the Application**
```bash
cd docker
docker compose up -d
```

### **Step 3: Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432 (PostgreSQL)

## 📋 **Essential Docker Commands**

### **Daily Commands**
```bash
# Start the application
cd docker
docker compose up -d

# Stop the application
cd docker
docker compose down

# View logs
docker compose logs -f

# Check status
docker compose ps
```

### **Development Commands**
```bash
# Rebuild after code changes
docker compose up -d --build

# Start development environment
docker compose -f docker-compose.dev.yml up --build

# Access container shells
docker compose exec backend bash
docker compose exec frontend bash
docker compose exec postgres psql -U postgres -d testcasemanager
```

## 🗄️ **Database Management**

### **Database Access**
```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U postgres -d testcasemanager

# View tables
\dt

# View sample data
SELECT * FROM test_cases;
SELECT * FROM projects;
SELECT * FROM test_suites;
```

### **Database Operations**
```bash
# Backup database
docker compose exec postgres pg_dump -U postgres testcasemanager > backup.sql

# Restore database
docker compose exec -T postgres psql -U postgres -d testcasemanager < backup.sql

# Reset database (removes all data)
docker compose down -v
docker compose up -d
```

## 🔧 **Troubleshooting**

### **Common Issues & Solutions**

#### **Port Already in Use**
```bash
# Stop all containers first
docker compose down

# Then start again
docker compose up -d
```

#### **Containers Won't Start**
```bash
# Reset everything (removes volumes too)
docker compose down -v
docker compose up -d
```

#### **Code Changes Not Reflecting**
```bash
# Rebuild containers
docker compose up -d --build
```

#### **Database Issues**
```bash
# Reset database only
docker compose down
docker volume rm docker_postgres_data
docker compose up -d
```

#### **Network Issues**
```bash
# Reset network
docker compose down
docker network prune
docker compose up -d
```

## 📊 **System Monitoring**

### **Container Status**
```bash
# View running containers
docker compose ps

# View resource usage
docker stats

# View disk usage
docker system df
```

### **Service Logs**
```bash
# View all logs
docker compose logs

# Follow logs in real-time
docker compose logs -f

# View logs for specific service
docker compose logs backend
docker compose logs frontend
docker compose logs postgres
```

## 🏗️ **System Architecture**

### **Docker Services**
- **testcase-postgres**: PostgreSQL 15 database
- **testcase-backend**: Node.js API server (port 3001)
- **testcase-frontend**: React development server (port 3000)

### **Database Schema**
- `projects` - Project management
- `test_suites` - Test suite organization
- `test_cases` - Individual test cases
- `test_steps` - Detailed test steps
- `custom_fields` - TestLink custom fields
- `test_executions` - Test execution results
- `documents` - Document management

### **Data Persistence**
Database data is stored in a Docker volume:
```yaml
volumes:
  - ../database/data:/var/lib/postgresql/data
```

This ensures your data persists even when containers are recreated.

## 🔌 **API Endpoints**

### **Test Cases API**
```bash
GET    /api/testcases          # Get all test cases
GET    /api/testcases/:id      # Get test case by ID
POST   /api/testcases          # Create new test case
PUT    /api/testcases/:id      # Update test case
DELETE /api/testcases/:id      # Delete test case
GET    /api/testcases/search   # Search test cases
```

### **Projects API**
```bash
GET    /api/projects           # Get all projects
GET    /api/projects/:id       # Get project by ID
POST   /api/projects           # Create new project
PUT    /api/projects/:id       # Update project
DELETE /api/projects/:id       # Delete project
```

### **Test Suites API**
```bash
GET    /api/testsuites         # Get all test suites
GET    /api/testsuites/:id     # Get test suite by ID
POST   /api/testsuites         # Create new test suite
PUT    /api/testsuites/:id     # Update test suite
DELETE /api/testsuites/:id     # Delete test suite
```

### **Health Check**
```bash
GET    /api/health             # System health status
```

## 🎯 **Current Data**

### **Sample Data**
- **1 Sample Project**: "Sample Project"
- **1 Sample Test Suite**: "Sample Test Suite"
- **1 Sample Test Case**: "Sample Test Case" (with test steps)

### **Status Mapping**
- `1` = Pending (Gray badge)
- `2` = Passed (Green badge)
- `3` = Failed (Red badge)
- `4` = Blocked (Orange badge)
- `5` = Skipped (Gray badge)

### **Priority Mapping**
- `1` = Low (Green badge)
- `2` = Medium (Orange badge)
- `3` = High (Red badge)

### **Execution Type**
- `1` = Manual
- `2` = Automated

## 🚀 **Development Workflow**

### **Typical Development Session**
```bash
# 1. Start the application
cd docker
docker compose up -d

# 2. Check status
docker compose ps

# 3. View logs if needed
docker compose logs -f

# 4. Make code changes...

# 5. Rebuild if needed
docker compose up -d --build

# 6. End session
docker compose down
```

### **Code Changes Workflow**
```bash
# After making code changes
docker compose up -d --build

# Or for development environment
docker compose -f docker-compose.dev.yml up --build
```

## 📝 **Environment Variables**

### **Production Environment**
```bash
# Uses docker-compose.yml
docker compose up -d
```

### **Development Environment**
```bash
# Uses docker-compose.dev.yml
docker compose -f docker-compose.dev.yml up --build
```

## 🎉 **Quick Reference Card**

### **Daily Commands**
```bash
# Start: cd docker && docker compose up -d
# Stop:  cd docker && docker compose down
# Logs:  docker compose logs -f
# Status: docker compose ps
```

### **Troubleshooting**
```bash
# Port conflict: docker compose down && docker compose up -d
# Code changes: docker compose up -d --build
# Reset all: docker compose down -v && docker compose up -d
```

---

**💡 Pro Tip**: Always run `docker compose down` before `docker compose up -d` if you encounter any issues. This ensures a clean start. 