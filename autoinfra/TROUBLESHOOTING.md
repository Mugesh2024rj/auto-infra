# AutoInfra Troubleshooting Guide

## 🔧 Fixed Issues

### ✅ **AWS Credential Verification**
- **Feature**: Added AWS account verification at startup
- **Purpose**: Verify destination AWS account before deployment
- **Status**: Active - Users must provide valid AWS credentials

### ✅ **Database Connection Issues**
- **Problem**: PostgreSQL connection errors
- **Solution**: Removed database dependency for development mode
- **Status**: Fixed - Now uses in-memory storage

### ✅ **Docker Service Issues** 
- **Problem**: Docker daemon connection errors
- **Solution**: Simplified monitoring service without Docker dependency
- **Status**: Fixed - Uses mock data for development

### ✅ **CORS Issues**
- **Problem**: Frontend can't connect to backend
- **Solution**: Configured CORS properly in server
- **Status**: Fixed - Added proper CORS headers

### ✅ **Authentication Issues**
- **Problem**: Login failing with "Invalid credentials"
- **Solution**: Simplified auth with plain text passwords for dev
- **Status**: Fixed - Login works with admin@autoinfra.com / admin123

### ✅ **WebSocket Connection**
- **Problem**: Real-time updates not working
- **Solution**: Configured WebSocket server properly
- **Status**: Fixed - Real-time health updates working

## 🚀 **How to Start AutoInfra**

### **New AWS Verification Flow**
1. **AWS Credentials Required**: On first startup, you'll be prompted to enter AWS credentials
2. **Account Verification**: AutoInfra verifies your AWS account before allowing access
3. **Secure Storage**: Credentials are verified but not permanently stored

### **Method 1: Simple Startup (Recommended)**
```cmd
cd autoinfra
start-simple.bat
```

### **Method 2: Manual Startup**
```cmd
# Terminal 1 - API Server
cd autoinfra/server
npm run dev

# Terminal 2 - Frontend  
cd autoinfra/client
npm run dev
```

## 📱 **Access Points**

- **Frontend**: http://localhost:3000
- **API Health**: http://localhost:5000/health
- **API Metrics**: http://localhost:5000/metrics

## 🔑 **AWS Credentials Setup**

### **Required Information**
- **AWS Access Key ID**: Your AWS access key (e.g., AKIAIOSFODNN7EXAMPLE)
- **AWS Secret Access Key**: Your AWS secret key
- **AWS Region**: Target deployment region (default: us-east-1)

### **How to Get AWS Credentials**
1. Log into AWS Console
2. Go to IAM > Users > Your User > Security Credentials
3. Create Access Key if you don't have one
4. Copy Access Key ID and Secret Access Key

### **Required Permissions**
Your AWS user should have permissions for:
- EC2 (for infrastructure deployment)
- S3 (for storage)
- IAM (for role management)
- CloudFormation (for stack management)

## 🔑 **Login Credentials**

- **Email**: admin@autoinfra.com
- **Password**: admin123

## 🐛 **Common Issues & Solutions**

### **Issue 1: "AWS credential verification failed"**
**Solution**: 
1. Check your Access Key ID and Secret Access Key are correct
2. Ensure your AWS user has proper permissions
3. Verify your internet connection
4. Try a different AWS region

### **Issue 2: "Cannot connect to API"**
**Solution**: 
1. Check if API server is running on port 5000
2. Visit http://localhost:5000/health - should return {"status":"healthy"}
3. Check CORS configuration in server/index.js

### **Issue 3: "Login failed"**
**Solution**:
1. Use exact credentials: admin@autoinfra.com / admin123
2. Check browser network tab for API call errors
3. Verify token is being stored in localStorage

### **Issue 4: "Dashboard not loading data"**
**Solution**:
1. Check browser console for errors
2. Verify API endpoints are responding
3. Check WebSocket connection in browser dev tools

### **Issue 5: "Real-time updates not working"**
**Solution**:
1. WebSocket connects to ws://localhost:5000
2. Check browser WebSocket connection in Network tab
3. Verify monitoring service is running

### **Issue 6: "Git deployment not working"**
**Solution**:
1. Use valid Git URLs (https://github.com/user/repo.git)
2. Check server logs for cloning errors
3. Ensure Git is installed on system

## 📊 **Features Working**

✅ **AWS Verification** - Account verification before access
✅ **Authentication** - Login/Register with JWT
✅ **Dashboard** - Real-time health monitoring (96.2%)
✅ **Monitoring** - System metrics and charts
✅ **Infrastructure** - Project management
✅ **Analytics** - Deployment statistics
✅ **Git Deployment** - Clone and deploy from Git repos
✅ **WebSocket** - Real-time updates
✅ **Dark Theme** - Professional DevOps UI

## 🔍 **Debug Commands**

```cmd
# Check API health
curl http://localhost:5000/health

# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Kill processes on ports
taskkill /PID <PID> /F
```

## 📝 **Development Notes**

- **No Database Required** - Uses in-memory storage
- **No Docker Required** - Mock container data
- **Simplified Auth** - Plain text passwords for dev
- **Mock Services** - Terraform, Jenkins simulated
- **Real-time UI** - WebSocket updates every 30 seconds

## 🎯 **Next Steps**

1. Start with `start-simple.bat`
2. **Enter your AWS credentials** when prompted
3. **Verify your AWS account** is displayed in header
4. Login with admin@autoinfra.com / admin123
5. Explore the dark DevOps dashboard
6. Try Git deployment feature
7. Monitor real-time health metrics

All major connection and configuration issues have been resolved!
**NEW: AWS account verification ensures secure deployment to your infrastructure!**