const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Mock data for development
const mockDeployments = [
  {
    id: '1',
    project_name: 'React Dashboard',
    status: 'success',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
    url: 'http://localhost:3001'
  },
  {
    id: '2', 
    project_name: 'Node.js API',
    status: 'success',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000),
    url: 'http://localhost:3002'
  }
];

// Get dashboard overview
router.get('/overview', auth, async (req, res) => {
  try {
    // Mock project counts
    const projectsResult = [
      { status: 'deployed', count: '3' },
      { status: 'building', count: '1' },
      { status: 'failed', count: '0' }
    ];

    // Mock health metrics
    const healthStatus = {
      infrastructureHealth: 96.2,
      servers: 98.5,
      containers: 94.8,
      databases: 99.1,
      lastUpdated: new Date()
    };
    
    const uptimeData = [
      { timestamp: new Date(Date.now() - 60000), uptime: 96.1 },
      { timestamp: new Date(Date.now() - 30000), uptime: 96.3 },
      { timestamp: new Date(), uptime: 96.2 }
    ];

    res.json({
      projects: projectsResult,
      deployments: mockDeployments,
      health: healthStatus,
      uptime: uptimeData,
      activeAutomations: 4
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// Get infrastructure health
router.get('/health', auth, async (req, res) => {
  try {
    const healthData = {
      infrastructureHealth: 96.2,
      servers: 98.5,
      containers: 94.8,
      databases: 99.1,
      lastUpdated: new Date()
    };
    res.json(healthData);
  } catch (error) {
    console.error('Health error:', error);
    res.status(500).json({ error: 'Failed to get health data' });
  }
});

// Get uptime metrics
router.get('/uptime', auth, async (req, res) => {
  try {
    const uptimeData = [
      { timestamp: new Date(Date.now() - 60000), uptime: 96.1 },
      { timestamp: new Date(Date.now() - 30000), uptime: 96.3 },
      { timestamp: new Date(), uptime: 96.2 }
    ];
    res.json(uptimeData);
  } catch (error) {
    console.error('Uptime error:', error);
    res.status(500).json({ error: 'Failed to get uptime data' });
  }
});

// Get deployment history
router.get('/deployments', auth, async (req, res) => {
  try {
    res.json(mockDeployments);
  } catch (error) {
    console.error('Deployments error:', error);
    res.status(500).json({ error: 'Failed to get deployment history' });
  }
});

// Get container status
router.get('/containers', auth, async (req, res) => {
  try {
    const containerStatus = [
      {
        id: 'container1',
        name: 'autoinfra-api',
        image: 'node:18-alpine',
        status: 'running',
        created: Date.now() / 1000 - 3600,
        healthStatus: 'healthy',
        uptime: '1h 0m'
      },
      {
        id: 'container2', 
        name: 'autoinfra-frontend',
        image: 'nginx:alpine',
        status: 'running',
        created: Date.now() / 1000 - 7200,
        healthStatus: 'healthy',
        uptime: '2h 0m'
      }
    ];
    res.json(containerStatus);
  } catch (error) {
    console.error('Container status error:', error);
    res.status(500).json({ error: 'Failed to get container status' });
  }
});

// Get system metrics
router.get('/metrics', auth, async (req, res) => {
  try {
    const metrics = {
      totalDeployments: 15,
      activeContainers: 3,
      cpuUsage: 45.2,
      memoryUsage: 67.8,
      diskUsage: 23.1,
      timestamp: new Date()
    };
    res.json(metrics);
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

module.exports = router;