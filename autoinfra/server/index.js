const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes after middleware
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const dashboardRoutes = require('./routes/dashboard');
const awsRoutes = require('./routes/aws');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/aws', awsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  const metrics = {
    totalDeployments: 15,
    activeContainers: 3,
    cpuUsage: 45.2,
    memoryUsage: 67.8,
    diskUsage: 23.1,
    timestamp: new Date()
  };
  res.json(metrics);
});

// WebSocket for real-time updates
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  // Send initial data
  ws.send(JSON.stringify({
    type: 'health',
    data: {
      infrastructureHealth: 96.2,
      servers: 98.5,
      containers: 94.8,
      databases: 99.1,
      lastUpdated: new Date()
    }
  }));

  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
});

// Broadcast health updates every 30 seconds
setInterval(() => {
  const healthData = {
    infrastructureHealth: 96.2 + Math.random() * 2,
    servers: 98.5 + Math.random() * 1,
    containers: 94.8 + Math.random() * 3,
    databases: 99.1 + Math.random() * 0.5,
    lastUpdated: new Date()
  };
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'health',
        data: healthData
      }));
    }
  });
}, 30000);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 AutoInfra Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
});

module.exports = app;