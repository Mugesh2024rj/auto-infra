# AutoInfra - Self-Building Cloud Infrastructure Platform

🚀 **AutoInfra** is a complete DevOps automation platform that automatically detects your tech stack, provisions cloud infrastructure, builds Docker images, and deploys applications with real-time monitoring.

## ✨ Features

### 🔧 **Auto Tech Stack Detection**
- **Node.js** (Express, React, Next.js)
- **Python** (Django, Flask, FastAPI)
- **Java** (Spring Boot, Maven, Gradle)
- **Go** applications
- **PHP** applications
- **Docker** projects

### ☁️ **Infrastructure Automation**
- **Terraform** for AWS provisioning
- **Auto-scaling** EC2 instances
- **Load balancers** and security groups
- **ECR** container registry
- **S3** artifact storage

### 🐳 **Container Management**
- **Auto Dockerfile** generation
- **Docker** image building
- **Container** deployment
- **Health monitoring**

### 📊 **Real-time Monitoring**
- **Infrastructure health** tracking (96.2% uptime)
- **Container status** monitoring
- **Performance metrics** (CPU, Memory, Disk)
- **Deployment history**
- **Live dashboards**

### 🔄 **CI/CD Pipeline**
- **Jenkins** integration
- **Automated testing**
- **Security scanning**
- **Deployment automation**

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │────│   Node.js API   │────│   PostgreSQL    │
│   (Port 3000)   │    │   (Port 5000)   │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────┬─────┴──────────────┐
         │                 │                    │
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│     Docker      │ │   Terraform     │ │    Jenkins      │
│   (Containers)  │ │ (Infrastructure)│ │   (CI/CD)       │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## 🚀 Quick Start (Windows)

### Prerequisites

- **Docker Desktop** (must be running)
- **Git**

### 1. Start Docker Desktop

1. Open Docker Desktop
2. Wait for it to start completely (green status)

### 2. Run AutoInfra

```cmd
# Navigate to project directory
cd autoinfra

# Run startup script
start.bat

# OR manually:
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Access Dashboard

- **Dashboard**: http://localhost:3000
- **API**: http://localhost:5000
- **Login**: admin@autoinfra.com / admin123

## 📱 Dashboard Features

### 🏠 **Main Dashboard**
- **Infrastructure Health**: 96.2% (real-time)
- **Active Automations**: Live counter
- **Uptime Chart**: 24-hour monitoring
- **Health Bars**: Servers, Containers, Databases
- **Deployment History**: Recent deployments table

### 📊 **Monitoring Page**
- **System Metrics**: CPU, Memory, Disk usage
- **Container Status**: Real-time container health
- **Performance Charts**: Resource usage over time
- **Alerts**: System notifications

### 🏗️ **Infrastructure Page**
- **Project Management**: View all deployed projects
- **Container Control**: Start, stop, restart containers
- **Tech Stack**: Visual indicators
- **Live URLs**: Direct links to deployed apps

### 📈 **Analytics Page**
- **Deployment Statistics**: Success/failure rates
- **Tech Stack Distribution**: Pie charts
- **Performance Insights**: Trends and metrics

## 🔧 Development Setup

### Backend Development

```bash
cd server
npm install
npm run dev
```

### Frontend Development

```bash
cd client
npm install
npm run dev
```

### Database Setup

```bash
# PostgreSQL with Docker
docker run -d \
  --name autoinfra-postgres \
  -e POSTGRES_DB=autoinfra \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15-alpine
```

## 🚀 Deployment Process

### 1. Upload Project

```bash
# Via Web UI
1. Go to http://localhost:3000/upload
2. Select your project zip file
3. Enter project name and description
4. Click "Deploy Project"
```

### 2. Automatic Process

```
📤 Upload & Extract
    ↓
🔍 Tech Stack Detection
    ↓
🐳 Docker Build
    ↓
☁️ Infrastructure Provisioning
    ↓
🚀 Deployment
    ↓
🌐 Live HTTPS URL
```

### 3. Manual Deployment

```bash
# Using deployment script
./scripts/deploy.sh my-project prod us-west-2

# Using build script
./scripts/build.sh
```

## 🔧 Configuration

### Environment Variables

```bash
# Server (.env)
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/autoinfra
JWT_SECRET=your-super-secret-jwt-key
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
```

### AWS Setup

```bash
# Configure AWS CLI
aws configure

# Create key pair
aws ec2 create-key-pair --key-name autoinfra-key --query 'KeyMaterial' --output text > autoinfra-key.pem
chmod 400 autoinfra-key.pem
```

### Terraform Variables

```hcl
# terraform/terraform.tfvars
project_name = "my-project"
environment = "prod"
aws_region = "us-west-2"
instance_type = "t3.small"
min_size = 1
max_size = 5
desired_capacity = 2
```

## 📊 Monitoring & Observability

### Prometheus Metrics

```yaml
# Available metrics
- autoinfra_deployments_total
- autoinfra_infrastructure_health
- autoinfra_container_status
- autoinfra_build_duration_seconds
```

### Grafana Dashboards

- **Infrastructure Overview**
- **Application Performance**
- **Deployment Metrics**
- **Container Health**

### Health Checks

```bash
# API Health
curl http://localhost:5000/health

# Application Health
curl http://localhost:5000/metrics
```

## 🔒 Security Features

### Authentication
- **JWT** tokens
- **Role-based** access (Admin/User)
- **Session** management

### Container Security
- **Non-root** users
- **Security** scanning with Trivy
- **Vulnerability** assessments

### Infrastructure Security
- **Security groups** with minimal access
- **HTTPS** enforcement
- **Network** isolation

## 🧪 Testing

### Unit Tests

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

### Integration Tests

```bash
# API tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Load Testing

```bash
# Apache Bench
ab -n 1000 -c 10 http://localhost:5000/

# Artillery
artillery run load-test.yml
```

## 🐛 Troubleshooting

### Common Issues

**1. Docker Build Fails**
```bash
# Check Docker daemon
docker info

# Clean up
docker system prune -a
```

**2. Database Connection**
```bash
# Check PostgreSQL
docker logs autoinfra-postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

**3. Port Conflicts**
```bash
# Check port usage
netstat -tulpn | grep :3000

# Kill process
kill -9 $(lsof -ti:3000)
```

### Logs

```bash
# Application logs
docker-compose logs -f api

# All services
docker-compose logs -f

# Specific service
docker logs autoinfra-api
```

## 📚 API Documentation

### Authentication

```bash
# Register
POST /api/auth/register
{
  "username": "user",
  "email": "user@example.com",
  "password": "password"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}
```

### Projects

```bash
# Upload project
POST /api/projects/upload
Content-Type: multipart/form-data
- project: file
- projectName: string
- description: string

# Get projects
GET /api/projects

# Get project status
GET /api/projects/:id/status
```

### Dashboard

```bash
# Get overview
GET /api/dashboard/overview

# Get health metrics
GET /api/dashboard/health

# Get deployments
GET /api/dashboard/deployments
```

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** feature branch
3. **Make** changes
4. **Add** tests
5. **Submit** pull request

### Code Style

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React** & **Vite** for frontend
- **Node.js** & **Express** for backend
- **PostgreSQL** for database
- **Docker** for containerization
- **Terraform** for infrastructure
- **AWS** for cloud services
- **Tailwind CSS** for styling
- **Recharts** for visualizations

## 📞 Support

- **Documentation**: [docs.autoinfra.com](https://docs.autoinfra.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/autoinfra/issues)
- **Discord**: [AutoInfra Community](https://discord.gg/autoinfra)
- **Email**: support@autoinfra.com

---

**Built with ❤️ by the AutoInfra Team**

🚀 **Deploy anything, anywhere, automatically!**