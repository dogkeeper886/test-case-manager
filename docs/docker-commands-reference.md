# Docker Commands Reference

## 🚀 **Quick Start Commands**

### **Every New Session - Start the Application**
```bash
cd docker
docker compose up -d
```

### **End Session - Stop the Application**
```bash
cd docker
docker compose down
```

## 📋 **Essential Commands**

### **Application Management**
```bash
# Start all services (database, backend, frontend)
docker compose up -d

# Stop all services
docker compose down

# View running containers
docker compose ps

# View logs (follow mode)
docker compose logs -f

# View logs for specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### **Development Commands**
```bash
# Rebuild containers (after code changes)
docker compose up -d --build

# Start development environment
docker compose -f docker-compose.dev.yml up --build

# Access container shell
docker compose exec backend bash
docker compose exec frontend bash
docker compose exec postgres psql -U postgres -d testcasemanager
```

### **Database Commands**
```bash
# Access PostgreSQL database
docker compose exec postgres psql -U postgres -d testcasemanager

# Reset database (removes all data)
docker compose down -v
docker compose up -d

# Backup database
docker compose exec postgres pg_dump -U postgres testcasemanager > backup.sql

# Restore database
docker compose exec -T postgres psql -U postgres -d testcasemanager < backup.sql
```

## 🔧 **Troubleshooting Commands**

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

## 📊 **Monitoring Commands**

### **System Status**
```bash
# View container status
docker compose ps

# View resource usage
docker stats

# View disk usage
docker system df
```

### **Logs & Debugging**
```bash
# View all logs
docker compose logs

# Follow logs in real-time
docker compose logs -f

# View last 100 lines
docker compose logs --tail=100

# View logs for specific service
docker compose logs backend
docker compose logs frontend
docker compose logs postgres
```

## 🎯 **Service-Specific Commands**

### **Backend Service**
```bash
# Access backend container
docker compose exec backend bash

# View backend logs
docker compose logs backend

# Restart backend only
docker compose restart backend
```

### **Frontend Service**
```bash
# Access frontend container
docker compose exec frontend bash

# View frontend logs
docker compose logs frontend

# Restart frontend only
docker compose restart frontend
```

### **Database Service**
```bash
# Access PostgreSQL
docker compose exec postgres psql -U postgres -d testcasemanager

# View database logs
docker compose logs postgres

# Restart database only
docker compose restart postgres
```

## 🔄 **Development Workflow**

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