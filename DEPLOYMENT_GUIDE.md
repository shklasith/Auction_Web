# Deployment Guide

## Overview
This guide covers deploying the Auction Web Application to production environments, including backend API, frontend React app, and MySQL database.

## Prerequisites
- Production server or cloud hosting account
- Domain name (optional but recommended)
- SSL certificate
- MySQL database server

## Backend Deployment (.NET Core API)

### Option 1: Azure App Service

#### 1. Prepare the Application
```bash
# Navigate to backend directory
cd Auction_Web

# Create production build
dotnet publish -c Release -o ./publish

# Create deployment package
tar -czf auction-api.tar.gz -C publish .
```

#### 2. Configure Production Settings
Update `appsettings.Production.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=your-production-server;Database=auction_web;User=your-user;Password=your-password;SslMode=Required;"
  },
  "Jwt": {
    "Secret": "your-production-jwt-secret-key-must-be-very-secure",
    "ExpirationInMinutes": 60
  },
  "AllowedOrigins": [
    "https://your-frontend-domain.com"
  ],
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

#### 3. Azure Deployment Steps
1. Create App Service in Azure Portal
2. Configure deployment from GitHub/local Git
3. Set environment variables in Configuration section
4. Enable HTTPS redirect
5. Configure custom domain (optional)

### Option 2: Docker Deployment

#### 1. Create Dockerfile
```dockerfile
# Auction_Web/Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["Auction_Web.csproj", "."]
RUN dotnet restore "Auction_Web.csproj"
COPY . .
WORKDIR "/src"
RUN dotnet build "Auction_Web.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Auction_Web.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Auction_Web.dll"]
```

#### 2. Build and Run Docker Container
```bash
# Build the image
docker build -t auction-api .

# Run container
docker run -d -p 8080:80 \
  -e ConnectionStrings__DefaultConnection="your-connection-string" \
  -e Jwt__Secret="your-jwt-secret" \
  --name auction-api \
  auction-api
```

#### 3. Docker Compose for Complete Stack
```yaml
# docker-compose.yml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: auction_web
      MYSQL_USER: auctionuser
      MYSQL_PASSWORD: auctionpass
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql

  api:
    build: ./Auction_Web
    ports:
      - "8080:80"
    environment:
      - ConnectionStrings__DefaultConnection=Server=mysql;Database=auction_web;User=auctionuser;Password=auctionpass;
      - Jwt__Secret=your-production-jwt-secret
    depends_on:
      - mysql

  frontend:
    build: ./auction-frontend
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=https://your-api-domain.com

volumes:
  mysql_data:
```

### Option 3: Linux Server (Ubuntu/CentOS)

#### 1. Install .NET Runtime
```bash
# Ubuntu
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install -y aspnetcore-runtime-9.0

# Install Nginx (reverse proxy)
sudo apt-get install nginx
```

#### 2. Configure Nginx
```nginx
# /etc/nginx/sites-available/auction-api
server {
    listen 80;
    server_name your-api-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # SignalR WebSocket support
    location /biddingHub {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 3. Create Systemd Service
```ini
# /etc/systemd/system/auction-api.service
[Unit]
Description=Auction Web API
After=network.target

[Service]
Type=notify
ExecStart=/usr/bin/dotnet /var/www/auction-api/Auction_Web.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=auction-api
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

## Frontend Deployment (React)

### Option 1: Netlify

#### 1. Build for Production
```bash
cd auction-frontend

# Install dependencies
npm install

# Create production build
npm run build
```

#### 2. Configure Build Settings
Create `netlify.toml`:
```toml
[build]
  publish = "build"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  REACT_APP_API_URL = "https://your-api-domain.com"
```

#### 3. Deploy
1. Connect GitHub repository to Netlify
2. Configure build settings
3. Set environment variables
4. Deploy automatically on push

### Option 2: Vercel

#### 1. Install Vercel CLI
```bash
npm i -g vercel
```

#### 2. Configure Deployment
```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "https://your-api-domain.com"
  }
}
```

#### 3. Deploy
```bash
cd auction-frontend
vercel --prod
```

### Option 3: AWS S3 + CloudFront

#### 1. Build Application
```bash
npm run build
```

#### 2. Upload to S3
```bash
# Install AWS CLI
aws configure

# Create S3 bucket
aws s3 mb s3://your-auction-frontend-bucket

# Upload build files
aws s3 sync build/ s3://your-auction-frontend-bucket --delete

# Configure bucket for static website hosting
aws s3 website s3://your-auction-frontend-bucket --index-document index.html --error-document index.html
```

#### 3. Configure CloudFront
1. Create CloudFront distribution
2. Set S3 bucket as origin
3. Configure custom error pages for SPA routing
4. Set up custom domain and SSL certificate

### Option 4: Docker for Frontend

#### 1. Create Dockerfile
```dockerfile
# auction-frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. Configure Nginx
```nginx
# auction-frontend/nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

## Database Deployment

### Option 1: MySQL on Cloud Provider

#### AWS RDS MySQL
1. Create RDS MySQL instance
2. Configure security groups
3. Set up automated backups
4. Configure read replicas (optional)

#### Azure Database for MySQL
1. Create Azure Database for MySQL server
2. Configure firewall rules
3. Set up backup policies
4. Configure monitoring

#### Google Cloud SQL
1. Create Cloud SQL MySQL instance
2. Configure authorized networks
3. Set up automated backups
4. Configure high availability

### Option 2: Self-Hosted MySQL

#### 1. Install MySQL Server
```bash
# Ubuntu
sudo apt update
sudo apt install mysql-server

# Secure installation
sudo mysql_secure_installation
```

#### 2. Create Production Database
```sql
CREATE DATABASE auction_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'auctionuser'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON auction_web.* TO 'auctionuser'@'%';
FLUSH PRIVILEGES;
```

#### 3. Configure MySQL for Production
```ini
# /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
# Performance tuning
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200

# Security
bind-address = 0.0.0.0
ssl-ca = /etc/mysql/ca-cert.pem
ssl-cert = /etc/mysql/server-cert.pem
ssl-key = /etc/mysql/server-key.pem

# Logging
general_log = 1
general_log_file = /var/log/mysql/general.log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
```

## SSL Certificate Setup

### Option 1: Let's Encrypt (Free)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d api.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Option 2: Commercial Certificate
1. Purchase SSL certificate from CA
2. Generate CSR on server
3. Install certificate files
4. Configure web server

## Environment Variables

### Production Environment Variables
```bash
# Backend (.NET Core)
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection="your-production-connection-string"
Jwt__Secret="your-production-jwt-secret"
AllowedOrigins__0="https://your-frontend-domain.com"

# Frontend (React)
REACT_APP_API_URL="https://your-api-domain.com"
REACT_APP_ENVIRONMENT="production"
```

## Monitoring and Logging

### Application Insights (Azure)
```csharp
// Program.cs
builder.Services.AddApplicationInsightsTelemetry();
```

### Logging Configuration
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning"
    },
    "ApplicationInsights": {
      "LogLevel": {
        "Default": "Information"
      }
    }
  }
}
```

### Health Checks
```csharp
// Program.cs
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>()
    .AddUrlGroup(new Uri("https://your-frontend-domain.com"), "frontend");

app.MapHealthChecks("/health");
```

## Backup Strategy

### Database Backups
```bash
#!/bin/bash
# backup-database.sh
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -h your-db-host -u username -p auction_web > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
rm backup_$DATE.sql
```

### Application Backups
- Source code in Git repository
- Environment configuration in secure storage
- Database backups to cloud storage
- Regular disaster recovery testing

## Security Checklist

- [ ] HTTPS enabled for all domains
- [ ] Strong JWT secrets in production
- [ ] Database connections encrypted
- [ ] CORS configured for production domains only
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (Entity Framework)
- [ ] XSS protection enabled
- [ ] Security headers configured
- [ ] Regular security updates applied

## Performance Optimization

### Backend Optimization
- Connection pooling configured
- Response caching implemented
- Database indexes optimized
- SignalR scaling configured
- Load balancing setup (if needed)

### Frontend Optimization
- CDN for static assets
- Gzip compression enabled
- Browser caching configured
- Bundle optimization
- Image optimization

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Test database connection
mysql -h your-db-host -u username -p

# Check connection pooling
netstat -an | grep 3306
```

#### SignalR Connection Issues
```bash
# Check WebSocket support
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Key: test" -H "Sec-WebSocket-Version: 13" https://your-api-domain.com/biddingHub
```

#### CORS Issues
- Verify allowed origins in configuration
- Check preflight requests in browser dev tools
- Ensure credentials are allowed for SignalR

### Logs to Monitor
- Application logs for errors
- Database query logs for performance
- Web server access logs
- System resource usage

## Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Session state management
- SignalR scale-out with Redis backplane
- Database read replicas

### Vertical Scaling
- Server resource monitoring
- Database performance tuning
- Connection pool optimization
- Memory usage optimization

---

This deployment guide covers the major deployment scenarios. Choose the options that best fit your infrastructure requirements and budget.
