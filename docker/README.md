# Docker Setup for Test Case Manager

This directory contains Docker configuration files for running the Test Case Manager application with persistent database storage.

## Quick Start

### Production Setup
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Development Setup
```bash
# Start development environment with hot reloading
docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development services
docker-compose -f docker-compose.dev.yml down
```

## Services

### PostgreSQL Database
- **Image**: `postgres:15-alpine`
- **Port**: `5432`
- **Database**: `testcasemanager`
- **User**: `postgres`
- **Password**: `postgres123`
- **Persistent Volume**: `postgres_data` (production) / `postgres_data_dev` (development)

### Backend API
- **Port**: `3001`
- **Environment**: Development/Production
- **Hot Reloading**: Enabled in development mode
- **Health Check**: Available at `/health`

### Frontend Application
- **Port**: `3000`
- **Environment**: Development/Production
- **Hot Reloading**: Enabled in development mode
- **API URL**: `http://localhost:3001`

## Persistent Storage

### Database Volume
The PostgreSQL database uses a persistent Docker volume to ensure data survives container restarts:

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```

### File Uploads
Backend uploads are persisted through volume mapping:
```yaml
volumes:
  - ../backend/uploads:/app/uploads
```

## Environment Variables

### Database Configuration
- `DB_HOST`: Database host (use `postgres` for Docker)
- `DB_PORT`: Database port (5432)
- `DB_NAME`: Database name (testcasemanager)
- `DB_USER`: Database user (postgres)
- `DB_PASSWORD`: Database password (postgres123)

### Application Configuration
- `NODE_ENV`: Environment (development/production)
- `PORT`: Backend port (3001)
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN`: JWT expiration time
- `UPLOAD_DIR`: File upload directory
- `MAX_FILE_SIZE`: Maximum file size in bytes

## Development vs Production

### Development Mode
- Uses `docker-compose.dev.yml`
- Includes all dependencies (including dev dependencies)
- Hot reloading enabled
- Source code mounted as volumes
- Development-friendly environment variables

### Production Mode
- Uses `docker-compose.yml`
- Optimized for production
- Only production dependencies installed
- Health checks enabled
- Production environment variables

## Database Initialization

The database is automatically initialized with:
- Required tables and indexes
- Sample data for testing
- TestLink-compatible schema

The initialization script (`init.sql`) runs when the PostgreSQL container starts for the first time.

## Useful Commands

### Database Operations
```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d testcasemanager

# Backup database
docker-compose exec postgres pg_dump -U postgres testcasemanager > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres -d testcasemanager < backup.sql
```

### Container Management
```bash
# View running containers
docker-compose ps

# View container logs
docker-compose logs [service-name]

# Restart a service
docker-compose restart [service-name]

# Rebuild containers
docker-compose build --no-cache
```

### Volume Management
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect test-case-manager_postgres_data

# Remove volume (WARNING: This will delete all data)
docker volume rm test-case-manager_postgres_data
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :3001
   lsof -i :5432
   
   # Stop conflicting services
   sudo systemctl stop postgresql  # if running locally
   ```

2. **Database Connection Issues**
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Restart database
   docker-compose restart postgres
   ```

3. **Permission Issues**
   ```bash
   # Fix upload directory permissions
   sudo chown -R $USER:$USER backend/uploads
   ```

4. **Container Won't Start**
   ```bash
   # Check container logs
   docker-compose logs [service-name]
   
   # Rebuild containers
   docker-compose build --no-cache
   ```

### Performance Optimization

1. **Database Performance**
   - Consider using PostgreSQL configuration tuning
   - Monitor query performance
   - Add appropriate indexes

2. **Application Performance**
   - Use production builds for frontend
   - Enable compression
   - Optimize Docker images

## Security Considerations

### Production Deployment
- Change default passwords
- Use environment-specific secrets
- Enable SSL/TLS
- Configure firewall rules
- Use secrets management

### Development Security
- Use development-specific secrets
- Don't expose sensitive data
- Use local development certificates

## Monitoring

### Health Checks
- Backend: `http://localhost:3001/health`
- Database: Built into PostgreSQL container

### Logs
- Application logs: `docker-compose logs`
- Database logs: `docker-compose logs postgres`
- Access logs: Available in application logs

## Backup and Recovery

### Automated Backups
```bash
# Create backup script
#!/bin/bash
docker-compose exec postgres pg_dump -U postgres testcasemanager > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Recovery
```bash
# Restore from backup
docker-compose exec -T postgres psql -U postgres -d testcasemanager < backup_file.sql
```

## Contributing

When adding new Docker configurations:
1. Update this README
2. Test both development and production setups
3. Document any new environment variables
4. Update the main project README 