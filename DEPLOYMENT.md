# Deployment Checklist & Production Guide

## Pre-Deployment Tasks

### Security
- [ ] Change JWT_SECRET to a strong random string (32+ characters)
- [ ] Update database password to secure value
- [ ] Enable HTTPS/SSL certificates
- [ ] Set NODE_ENV=production
- [ ] Configure CORS for your domain only
- [ ] Implement rate limiting (npm install express-rate-limit)
- [ ] Add CSRF protection
- [ ] Sanitize all inputs (npm install sanitize-html)
- [ ] Set secure HTTP headers (npm install helmet)
- [ ] Implement request logging
- [ ] Enable database connection pooling
- [ ] Configure firewall rules

### Backend Configuration
- [ ] Create production database
- [ ] Backup development database
- [ ] Update all environment variables
- [ ] Test database connection from production server
- [ ] Configure database backup strategy
- [ ] Set up automated backups
- [ ] Configure error monitoring (e.g., Sentry)
- [ ] Set up logging service
- [ ] Configure email service for notifications
- [ ] Test all API endpoints

### Frontend Configuration
- [ ] Update API base URL to production server
- [ ] Run production build: `npm run build`
- [ ] Test all build artifacts
- [ ] Optimize images and assets
- [ ] Enable gzip compression
- [ ] Configure CDN for static files
- [ ] Set up caching strategies
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Run performance audit (Lighthouse)

### Infrastructure
- [ ] Choose hosting provider (AWS, Heroku, DigitalOcean, etc.)
- [ ] Set up server with Node.js
- [ ] Install PostgreSQL on server
- [ ] Configure reverse proxy (Nginx/Apache)
- [ ] Set up SSL/TLS certificate (Let's Encrypt)
- [ ] Configure domain name DNS
- [ ] Set up monitoring (uptime, performance)
- [ ] Configure auto-scaling (if needed)
- [ ] Set up load balancer (if multiple servers)
- [ ] Configure CI/CD pipeline

### Testing
- [ ] Run full test suite
- [ ] Test all user flows
- [ ] Test all API endpoints
- [ ] Test authentication/authorization
- [ ] Test with large datasets
- [ ] Load testing
- [ ] Security testing (OWASP)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing
- [ ] Test error handling

---

## Recommended Production Stack

### Backend Hosting Options

#### Option 1: Heroku (Easiest)
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET="your-secret-key"
heroku config:set DB_USER="your-db-user"
heroku config:set DB_PASSWORD="your-db-password"

# Deploy
git push heroku main
```

#### Option 2: AWS EC2
```bash
# Launch EC2 instance
# Install Node.js, PostgreSQL
# Configure security groups
# Deploy using GitHub Actions or manual deployment
```

#### Option 3: DigitalOcean
```bash
# Create Droplet with Node.js
# Install PostgreSQL
# Configure Nginx reverse proxy
# Deploy and restart service
```

#### Option 4: Docker Container
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/ .
RUN npm install --production
EXPOSE 5000
CMD ["npm", "start"]
```

### Frontend Hosting Options

#### Option 1: Vercel (Recommended for React)
```bash
npm install -g vercel
vercel login
vercel --prod
```

#### Option 2: Netlify
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=build
```

#### Option 3: AWS S3 + CloudFront
```bash
# Build production
npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket/
```

#### Option 4: GitHub Pages
```bash
# Configure gh-pages in package.json
npm run build
npm run deploy
```

---

## Environment Variables Template

### Backend (.env)

```
# Server
NODE_ENV=production
PORT=5000

# Database
DB_USER=prod_user
DB_PASSWORD=strong_password_here
DB_HOST=prod-db.example.com
DB_PORT=5432
DB_NAME=store_rating_prod

# Security
JWT_SECRET=very-long-random-secret-key-32-characters-minimum
JWT_EXPIRATION=24h

# CORS
CORS_ORIGIN=https://yourdomain.com

# Email (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Frontend (.env.production)

```
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENV=production
```

---

## Production Code Additions

### 1. Error Handling Enhancement (backend/src/index.js)
```javascript
// Add error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});
```

### 2. Rate Limiting (backend/src/index.js)
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. Security Headers (backend/src/index.js)
```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 4. Logging (backend/src/index.js)
```javascript
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

---

## Monitoring & Maintenance

### Uptime Monitoring
- [ ] Set up monitoring service (UptimeRobot, Pingdom)
- [ ] Configure alerts for downtime
- [ ] Test monitoring setup

### Performance Monitoring
- [ ] Set up APM (New Relic, DataDog)
- [ ] Monitor response times
- [ ] Monitor database performance
- [ ] Monitor memory usage
- [ ] Monitor CPU usage

### Security Monitoring
- [ ] Monitor for failed login attempts
- [ ] Monitor API abuse
- [ ] Review security logs daily
- [ ] Set up intrusion detection
- [ ] Regular security audits

### Backup & Recovery
- [ ] Daily database backups
- [ ] Test backup restoration
- [ ] Keep backups off-site
- [ ] Document recovery procedure
- [ ] Test disaster recovery plan

---

## Post-Deployment Checklist

- [ ] Verify backend is running
- [ ] Verify frontend is accessible
- [ ] Test all authentication flows
- [ ] Test all user roles
- [ ] Verify database connection
- [ ] Test API endpoints
- [ ] Check error logs
- [ ] Monitor server performance
- [ ] Verify SSL certificate
- [ ] Test CORS configuration
- [ ] Verify environment variables are correct
- [ ] Check file permissions
- [ ] Verify backups are working
- [ ] Set up monitoring alerts
- [ ] Document deployment steps
- [ ] Create runbook for common issues

---

## Common Issues & Solutions

### Issue: "Cannot find module 'pg'"
```bash
npm install pg
npm install --save-dev @types/pg
```

### Issue: "CORS blocked"
```javascript
// In backend/src/index.js
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

### Issue: "Connection timeout to database"
```bash
# Check database is accessible
psql -U user -h host -d database -c "SELECT 1"

# Verify network rules
# Verify firewall settings
```

### Issue: "JWT token expired"
```javascript
// In backend/src/middleware/auth.js
// Implement token refresh endpoint
```

### Issue: "Out of memory"
```bash
# Increase Node.js memory
node --max-old-space-size=4096 src/index.js
```

---

## Performance Optimization

### Backend Optimization
```bash
# Install compression
npm install compression

# Add to server
app.use(compression());
```

### Database Optimization
```sql
-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_stores_name ON stores(name);
CREATE INDEX idx_ratings_user_store ON ratings(user_id, store_id);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM stores WHERE name LIKE '%test%';
```

### Frontend Optimization
```bash
# Code splitting
npm install @loadable/component

# Image optimization
npm install next-image

# Bundle analysis
npm install source-map-explorer
```

---

## Scaling Strategies

### Database Scaling
1. **Read Replicas:** Set up read-only database copies
2. **Caching:** Implement Redis for frequently accessed data
3. **Sharding:** Distribute data across multiple databases

### Application Scaling
1. **Horizontal Scaling:** Add more server instances
2. **Load Balancing:** Distribute traffic across servers
3. **Caching:** Implement application-level caching

### Frontend Scaling
1. **CDN:** Use CloudFront or similar service
2. **Lazy Loading:** Load components on demand
3. **Code Splitting:** Split bundle into chunks

---

## Backup & Disaster Recovery

### Database Backup Script
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U postgres store_rating_prod > backup_$DATE.sql
gzip backup_$DATE.sql
aws s3 cp backup_$DATE.sql.gz s3://your-bucket/backups/
```

### Recovery Procedure
```bash
# Download backup from S3
aws s3 cp s3://your-bucket/backups/backup_latest.sql.gz .

# Restore database
gunzip backup_latest.sql.gz
psql -U postgres -d store_rating_prod < backup_latest.sql
```

---

## Documentation for Deployment Team

Create a deployment guide including:
1. How to deploy backend updates
2. How to deploy frontend updates
3. How to rollback changes
4. How to access logs
5. How to handle incidents
6. Contact information for support
7. Maintenance windows
8. Monitoring dashboards

---

## Final Checklist Before Go-Live

- [ ] All code is tested
- [ ] All secrets are configured
- [ ] Database is accessible
- [ ] SSL certificate is valid
- [ ] Domain DNS is configured
- [ ] Email is working (if configured)
- [ ] Monitoring is active
- [ ] Backups are working
- [ ] Team is trained
- [ ] Documentation is complete
- [ ] Rollback plan is in place
- [ ] Customer support is ready

---

**Deployment Ready:** ✅

Your Store Rating Application is ready for production deployment!
