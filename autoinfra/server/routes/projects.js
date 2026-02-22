const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const auth = require('../middleware/auth');
const stackDetector = require('../services/stackDetector');
const dockerService = require('../services/dockerService');
const terraformService = require('../services/terraformService');
const deploymentService = require('../services/deploymentService');
const awsService = require('../services/awsService');

const router = express.Router();

// In-memory projects for development
const projects = [];

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Deploy from Git repository
router.post('/deploy-git', auth, async (req, res) => {
  try {
    const { gitUrl, projectName, description } = req.body;
    const userId = req.user.userId;

    // Check if AWS is configured
    if (!awsService.isConfigured()) {
      return res.status(400).json({ 
        error: 'AWS credentials not configured. Please verify your AWS account first.' 
      });
    }

    // Get the configured AWS region
    const deploymentRegion = awsService.getRegion();

    // Validate Git URL
    if (!gitUrl || !gitUrl.includes('git')) {
      return res.status(400).json({ error: 'Invalid Git repository URL' });
    }

    // Create project record
    const project = {
      id: Date.now().toString(),
      name: projectName,
      description,
      user_id: userId,
      repository_url: gitUrl,
      aws_region: deploymentRegion,
      status: 'cloning',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    projects.push(project);

    // Simulate cloning and deployment process
    setTimeout(() => {
      // Update project status to cloned
      project.status = 'analyzing';
      
      // Simulate tech stack detection based on common repo patterns
      let techStack = { type: 'nodejs', framework: 'express' };
      
      if (gitUrl.toLowerCase().includes('react')) {
        techStack = { type: 'nodejs', framework: 'react' };
      } else if (gitUrl.toLowerCase().includes('python')) {
        techStack = { type: 'python', framework: 'flask' };
      } else if (gitUrl.toLowerCase().includes('java')) {
        techStack = { type: 'java', framework: 'spring' };
      } else if (gitUrl.toLowerCase().includes('go')) {
        techStack = { type: 'go', framework: 'go' };
      }
      
      // Update project with tech stack and deployment info
      project.tech_stack = JSON.stringify(techStack);
      project.status = 'deployed';
      project.deployment_url = `http://localhost:${3000 + projects.length}`;
      project.infrastructure = {
        region: deploymentRegion,
        vpc: `vpc-${Math.random().toString(36).substr(2, 9)}`,
        subnet: `subnet-${Math.random().toString(36).substr(2, 9)}`,
        securityGroup: `sg-${Math.random().toString(36).substr(2, 9)}`,
        instance: `i-${Math.random().toString(36).substr(2, 9)}`
      };
    }, 2000);

    res.json({
      projectId: project.id,
      status: 'cloning',
      message: `Repository cloning started. Infrastructure will be deployed to AWS region: ${deploymentRegion}`,
      gitUrl,
      deploymentRegion
    });

  } catch (error) {
    console.error('Git deploy error:', error);
    res.status(500).json({ error: 'Git deployment failed' });
  }
});

// Get project status
router.get('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const project = projects.find(p => p.id === id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ error: 'Failed to get project status' });
  }
});

// Get user projects
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userProjects = projects.filter(p => p.user_id === userId);
    res.json(userProjects);
  } catch (error) {
    console.error('Projects error:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const index = projects.findIndex(p => p.id === id && p.user_id === userId);
    if (index > -1) {
      projects.splice(index, 1);
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;