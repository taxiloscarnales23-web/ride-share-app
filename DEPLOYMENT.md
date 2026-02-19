# RideShare App - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the RideShare mobile application to production environments. The application uses Expo for mobile development and Node.js/Express for the backend API.

## Prerequisites

- Node.js 18+ and npm/pnpm
- Docker and Docker Compose (for containerized deployment)
- PostgreSQL 14+
- Redis 6+ (for caching and real-time features)
- AWS S3 or compatible storage (for file uploads)
- SSL certificates (for HTTPS)

## Environment Setup

### 1. Environment Variables

Create a `.env.production` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/rideshare_prod
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://host:6379

# Authentication
JWT_SECRET=your-secure-jwt-secret-key
SESSION_SECRET=your-secure-session-secret

# API Configuration
API_PORT=3000
API_HOST=0.0.0.0
NODE_ENV=production

# File Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=rideshare-files

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### 2. Database Setup

```bash
# Create database
createdb rideshare_prod

# Run migrations
pnpm db:push

# Seed initial data (optional)
pnpm db:seed
```

### 3. Redis Configuration

```bash
# Start Redis
redis-server --port 6379 --daemonize yes

# Or using Docker
docker run -d -p 6379:6379 redis:latest
```

## Deployment Methods

### Option 1: Docker Deployment (Recommended)

#### Build Docker Image

```bash
# Build the image
docker build -t rideshare-app:latest .

# Tag for registry
docker tag rideshare-app:latest your-registry/rideshare-app:latest

# Push to registry
docker push your-registry/rideshare-app:latest
```

#### Docker Compose Setup

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: rideshare_prod
      POSTGRES_USER: rideshare
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  api:
    image: rideshare-app:latest
    environment:
      DATABASE_URL: postgresql://rideshare:secure_password@postgres:5432/rideshare_prod
      REDIS_URL: redis://redis:6379
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    restart: always

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: always

volumes:
  postgres_data:
  redis_data:
```

#### Deploy with Docker Compose

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Option 2: Traditional Server Deployment

#### 1. Install Dependencies

```bash
# SSH into server
ssh user@your-server.com

# Clone repository
git clone https://github.com/your-org/rideshare-app.git
cd rideshare-app

# Install dependencies
pnpm install --frozen-lockfile

# Build application
pnpm build
```

#### 2. Setup PM2 Process Manager

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'rideshare-api',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js

# Enable auto-restart on reboot
pm2 startup
pm2 save
```

#### 3. Setup Nginx Reverse Proxy

```nginx
upstream rideshare_api {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name api.rideshare.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.rideshare.com;

    ssl_certificate /etc/ssl/certs/your-cert.crt;
    ssl_certificate_key /etc/ssl/private/your-key.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://rideshare_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Option 3: Kubernetes Deployment

#### Create Deployment Manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rideshare-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: rideshare-api
  template:
    metadata:
      labels:
        app: rideshare-api
    spec:
      containers:
      - name: api
        image: your-registry/rideshare-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: rideshare-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: rideshare-api
spec:
  selector:
    app: rideshare-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

#### Deploy to Kubernetes

```bash
# Create secrets
kubectl create secret generic rideshare-secrets \
  --from-literal=database-url=$DATABASE_URL

# Deploy
kubectl apply -f deployment.yaml

# Check status
kubectl get pods
kubectl logs -f deployment/rideshare-api
```

## Database Backup & Recovery

### Automated Backups

```bash
# Create backup script
cat > /usr/local/bin/backup-rideshare.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/rideshare"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > $BACKUP_DIR/rideshare_$DATE.sql
gzip $BACKUP_DIR/rideshare_$DATE.sql
# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup-rideshare.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /usr/local/bin/backup-rideshare.sh" | crontab -
```

### Recovery Procedure

```bash
# Restore from backup
gunzip < /backups/rideshare/rideshare_20240219_020000.sql.gz | psql $DATABASE_URL
```

## Monitoring & Logging

### Setup Monitoring

```bash
# Install monitoring tools
docker run -d -p 9090:9090 prom/prometheus
docker run -d -p 3000:3000 grafana/grafana
```

### Configure Logging

```javascript
// server/_core/index.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

## Performance Optimization

### 1. Enable Caching

```javascript
// Cache API responses
app.use(compression());
app.use(cors());

// Redis caching middleware
const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl;
  redis.get(key, (err, data) => {
    if (data) {
      res.send(JSON.parse(data));
    } else {
      next();
    }
  });
};
```

### 2. Database Optimization

```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_driver_id ON rides(driver_id);
CREATE INDEX idx_rides_rider_id ON rides(rider_id);
CREATE INDEX idx_drivers_user_id ON drivers(user_id);
CREATE INDEX idx_drivers_is_online ON drivers(is_online);
```

### 3. Load Balancing

Configure multiple API instances behind a load balancer:

```nginx
upstream rideshare_cluster {
    server api1.rideshare.com:3000;
    server api2.rideshare.com:3000;
    server api3.rideshare.com:3000;
    least_conn;
}
```

## Security Hardening

### 1. SSL/TLS Configuration

```bash
# Generate SSL certificate
certbot certonly --standalone -d api.rideshare.com

# Auto-renewal
certbot renew --quiet --no-eff-email
```

### 2. Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. Input Validation

```javascript
import { z } from 'zod';

const rideSchema = z.object({
  pickupLat: z.number().min(-90).max(90),
  pickupLng: z.number().min(-180).max(180),
  dropoffLat: z.number().min(-90).max(90),
  dropoffLng: z.number().min(-180).max(180),
});
```

## Scaling Strategy

### Horizontal Scaling

- Deploy multiple API instances behind load balancer
- Use database connection pooling
- Implement Redis for session/cache management
- Use CDN for static assets

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries
- Implement query result caching
- Use read replicas for database

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| High memory usage | Check for memory leaks, increase heap size |
| Slow API responses | Add database indexes, enable caching |
| Database connection errors | Check connection pool settings, verify credentials |
| WebSocket connection issues | Ensure sticky sessions on load balancer |

## Rollback Procedure

```bash
# Rollback to previous version
docker pull your-registry/rideshare-app:previous-tag
docker-compose down
docker-compose up -d

# Or with PM2
pm2 start ecosystem.config.js --version previous-version
```

## Support & Maintenance

For production support and maintenance:

- Monitor application logs regularly
- Perform weekly database backups
- Update dependencies monthly
- Review security patches weekly
- Conduct monthly performance reviews
