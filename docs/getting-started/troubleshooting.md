# Troubleshooting Guide

## 🚨 **Common Issues and Solutions**

This guide covers the most common issues you might encounter when using the Test Case Management System and how to resolve them.

## 🔧 **Container Issues**

### **Containers Won't Start**

**Symptoms:**
- `docker compose up -d` fails
- Containers show as "Exited" status
- Error messages about ports or resources

**Solutions:**

#### **1. Port Conflicts**
```bash
# Check if ports are in use
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :5432

# Stop conflicting services
sudo systemctl stop <service-name>

# Or use different ports in docker-compose.yml
```

#### **2. Insufficient Resources**
```bash
# Check Docker resources
docker system df
docker stats

# Increase Docker memory/CPU limits
# (In Docker Desktop settings)
```

#### **3. Reset Everything**
```bash
# Complete reset
docker compose down -v
docker system prune -f
docker compose up -d
```

### **Containers Start But Application Doesn't Work**

**Symptoms:**
- Containers are running but website doesn't load
- API endpoints return errors
- Database connection issues

**Solutions:**

#### **1. Check Container Status**
```bash
# View running containers
docker compose ps

# Check container logs
docker compose logs backend
docker compose logs frontend
docker compose logs postgres
```

#### **2. Restart Specific Services**
```bash
# Restart backend
docker compose restart backend

# Restart frontend
docker compose restart frontend

# Restart database
docker compose restart postgres
```

#### **3. Check Network Connectivity**
```bash
# Test container communication
docker compose exec backend ping postgres
docker compose exec frontend ping backend
```

## 🌐 **Access Issues**

### **Can't Access Frontend (http://localhost:3000)**

**Symptoms:**
- Browser shows "Connection refused"
- Page doesn't load
- Timeout errors

**Solutions:**

#### **1. Verify Container Status**
```bash
# Check if frontend container is running
docker compose ps frontend

# View frontend logs
docker compose logs frontend
```

#### **2. Check Port Binding**
```bash
# Verify port is bound
netstat -tulpn | grep 3000

# Check Docker port mapping
docker port testcase-frontend
```

#### **3. Try Alternative Access**
```bash
# Try different localhost variants
http://127.0.0.1:3000
http://0.0.0.0:3000

# Check if firewall is blocking
sudo ufw status
```

### **Can't Access Backend API (http://localhost:3001)**

**Symptoms:**
- API calls fail
- 404 or connection errors
- Health check fails

**Solutions:**

#### **1. Test API Health**
```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test with verbose output
curl -v http://localhost:3001/api/health
```

#### **2. Check Backend Logs**
```bash
# View backend logs
docker compose logs backend

# Follow logs in real-time
docker compose logs -f backend
```

#### **3. Verify Database Connection**
```bash
# Test database connection
docker compose exec backend node -e "
const { Pool } = require('pg');
const pool = new Pool({
  host: 'postgres',
  port: 5432,
  database: 'testcasemanager',
  user: 'postgres',
  password: 'your_password'
});
pool.query('SELECT NOW()', (err, res) => {
  console.log(err || res.rows[0]);
  pool.end();
});"
```

## 🗄️ **Database Issues**

### **Database Connection Errors**

**Symptoms:**
- "Connection refused" errors
- "Database does not exist" errors
- Timeout errors

**Solutions:**

#### **1. Check Database Container**
```bash
# Verify PostgreSQL is running
docker compose ps postgres

# Check database logs
docker compose logs postgres
```

#### **2. Test Database Connection**
```bash
# Connect to database directly
docker compose exec postgres psql -U postgres -d testcasemanager

# Test basic queries
SELECT NOW();
SELECT COUNT(*) FROM test_cases;
```

#### **3. Reset Database**
```bash
# Complete database reset
docker compose down -v
docker compose up -d

# Or reset just the database volume
docker compose down
docker volume rm docker_postgres_data
docker compose up -d
```

### **Data Loss or Corruption**

**Symptoms:**
- Test cases missing
- Projects not showing
- Inconsistent data

**Solutions:**

#### **1. Check Data Persistence**
```bash
# Verify volume mapping
docker volume ls | grep postgres

# Check volume contents
docker run --rm -v docker_postgres_data:/data alpine ls -la /data
```

#### **2. Restore from Backup**
```bash
# If you have a backup
docker compose exec -T postgres psql -U postgres -d testcasemanager < backup.sql
```

#### **3. Re-import Data**
```bash
# Re-import TestLink data
# (Use the import functionality in the web interface)
```

## 🔄 **Code Changes Not Reflecting**

### **Frontend Changes Not Visible**

**Symptoms:**
- Code changes don't appear in browser
- Old version still showing
- Cache issues

**Solutions:**

#### **1. Rebuild Containers**
```bash
# Rebuild with code changes
docker compose up -d --build

# Or rebuild specific service
docker compose up -d --build frontend
```

#### **2. Clear Browser Cache**
- Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache and cookies
- Try incognito/private browsing mode

#### **3. Check Development Mode**
```bash
# Use development environment
docker compose -f docker-compose.dev.yml up --build
```

### **Backend Changes Not Working**

**Symptoms:**
- API changes not taking effect
- New endpoints not available
- Old behavior persists

**Solutions:**

#### **1. Restart Backend**
```bash
# Restart backend service
docker compose restart backend

# Or rebuild backend
docker compose up -d --build backend
```

#### **2. Check API Endpoints**
```bash
# Test API endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/testcases
```

#### **3. Verify Code Changes**
```bash
# Check if changes are in container
docker compose exec backend cat /app/src/index.js
```

## 🚀 **Performance Issues**

### **Slow Loading Times**

**Symptoms:**
- Pages take long to load
- API calls are slow
- Database queries timeout

**Solutions:**

#### **1. Check Resource Usage**
```bash
# Monitor container resources
docker stats

# Check system resources
htop
df -h
```

#### **2. Optimize Database**
```bash
# Check database performance
docker compose exec postgres psql -U postgres -d testcasemanager -c "
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE tablename = 'test_cases';"
```

#### **3. Increase Resources**
- Allocate more memory to Docker
- Increase CPU limits
- Add more disk space

### **Memory Issues**

**Symptoms:**
- Containers crash
- Out of memory errors
- Slow performance

**Solutions:**

#### **1. Check Memory Usage**
```bash
# View memory usage
docker stats --no-stream

# Check system memory
free -h
```

#### **2. Optimize Container Memory**
```bash
# Add memory limits to docker-compose.yml
services:
  backend:
    mem_limit: 512m
  frontend:
    mem_limit: 256m
  postgres:
    mem_limit: 1g
```

## 🔍 **Debugging Commands**

### **Useful Debugging Commands**

```bash
# Check all container statuses
docker compose ps

# View all logs
docker compose logs

# Follow logs in real-time
docker compose logs -f

# Check container resource usage
docker stats

# Access container shell
docker compose exec backend bash
docker compose exec frontend bash
docker compose exec postgres bash

# Check network connectivity
docker network ls
docker network inspect docker_default

# View volume information
docker volume ls
docker volume inspect docker_postgres_data
```

### **Health Check Commands**

```bash
# Test frontend
curl -I http://localhost:3000

# Test backend API
curl http://localhost:3001/api/health

# Test database
docker compose exec postgres pg_isready -U postgres

# Test container health
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

## 📞 **Getting Help**

### **When to Contact Support**

- Issues not covered in this guide
- Persistent problems after trying solutions
- System crashes or data corruption
- Performance issues affecting production use

### **Information to Provide**

When reporting issues, include:

1. **Error messages** (exact text)
2. **Container logs** (`docker compose logs`)
3. **System information** (OS, Docker version)
4. **Steps to reproduce** the issue
5. **What you've already tried**

### **Additional Resources**

- [Installation Guide](installation.md) - Detailed setup instructions
- [API Reference](../development/api-reference.md) - Technical documentation
- [System Overview](../user-guide/overview.md) - Feature documentation

---

**💡 Pro Tip**: Most issues can be resolved by restarting the containers with `docker compose down && docker compose up -d`. This is often the quickest solution. 