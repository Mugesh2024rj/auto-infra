const dockerService = require('./dockerService');

class MonitoringService {
  constructor() {
    // Remove database dependency for development
    this.healthData = {
      infrastructureHealth: 96.2,
      servers: 98.5,
      containers: 94.8,
      databases: 99.1,
      lastUpdated: new Date()
    };

    this.uptimeData = [];
    this.metrics = {
      totalDeployments: 0,
      activeContainers: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0
    };

    // Initialize monitoring
    this.startMonitoring();
  }

  startMonitoring() {
    // Update health data every 30 seconds
    setInterval(() => {
      this.updateHealthData();
    }, 30000);

    // Update uptime data every minute
    setInterval(() => {
      this.updateUptimeData();
    }, 60000);

    // Update metrics every 5 minutes
    setInterval(() => {
      this.updateMetrics();
    }, 300000);

    // Initial data load
    this.updateHealthData();
    this.updateUptimeData();
    this.updateMetrics();
  }

  async updateHealthData() {
    try {
      // Simulate health calculations without Docker dependency
      const containerHealth = 94.8 + Math.random() * 5; // 94-99%
      const serverHealth = 95 + Math.random() * 5; // 95-100%
      const databaseHealth = 98 + Math.random() * 2; // 98-100%

      // Calculate overall infrastructure health
      const infrastructureHealth = (serverHealth + containerHealth + databaseHealth) / 3;

      this.healthData = {
        infrastructureHealth: Math.round(infrastructureHealth * 10) / 10,
        servers: Math.round(serverHealth * 10) / 10,
        containers: Math.round(containerHealth * 10) / 10,
        databases: Math.round(databaseHealth * 10) / 10,
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('Error updating health data:', error);
    }
  }

  async updateUptimeData() {
    try {
      const now = new Date();
      const uptime = this.healthData.infrastructureHealth;

      this.uptimeData.push({
        timestamp: now,
        uptime: uptime
      });

      // Keep only last 24 hours of data (1440 minutes)
      if (this.uptimeData.length > 1440) {
        this.uptimeData = this.uptimeData.slice(-1440);
      }

    } catch (error) {
      console.error('Error updating uptime data:', error);
    }
  }

  async updateMetrics() {
    try {
      // Simulate metrics without database dependency
      this.metrics.totalDeployments = Math.floor(Math.random() * 50) + 10;
      this.metrics.activeContainers = Math.floor(Math.random() * 10) + 2;
      this.metrics.cpuUsage = Math.round((20 + Math.random() * 60) * 10) / 10;
      this.metrics.memoryUsage = Math.round((30 + Math.random() * 50) * 10) / 10;
      this.metrics.diskUsage = Math.round((10 + Math.random() * 40) * 10) / 10;
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  }

  getHealthStatus() {
    return this.healthData;
  }

  getUptimeData() {
    // Return last 24 hours of uptime data
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.uptimeData.filter(data => new Date(data.timestamp) > last24Hours);
  }

  getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date()
    };
  }

  async getContainerStatus() {
    try {
      // Return mock container data for development
      return [
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
    } catch (error) {
      console.error('Error getting container status:', error);
      return [];
    }
  }

  calculateUptime(created) {
    const now = new Date();
    const createdDate = new Date(created * 1000);
    const uptimeMs = now - createdDate;
    
    const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  async getDeploymentHistory(limit = 50) {
    try {
      // Return mock deployment data
      return [
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
    } catch (error) {
      console.error('Error getting deployment history:', error);
      return [];
    }
  }

  async recordDeployment(projectId, userId, status, url = null) {
    try {
      console.log(`Recording deployment: ${projectId}, ${status}`);
      // In development, just log the deployment
    } catch (error) {
      console.error('Error recording deployment:', error);
    }
  }
}

module.exports = new MonitoringService();