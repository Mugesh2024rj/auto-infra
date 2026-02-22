const { Pool } = require('pg');
const stackDetector = require('./stackDetector');
const dockerService = require('./dockerService');
const terraformService = require('./terraformService');
const monitoringService = require('./monitoringService');
const fs = require('fs').promises;
const path = require('path');

class DeploymentService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/autoinfra'
    });
  }

  async deployProject(projectId, projectPath, techStack) {
    try {
      console.log(`Starting deployment for project ${projectId}`);

      // Update project status
      await this.updateProjectStatus(projectId, 'building');

      // Step 1: Generate Dockerfile if needed
      if (!techStack.hasDockerfile) {
        const dockerfile = stackDetector.generateDockerfile(techStack);
        await fs.writeFile(path.join(projectPath, 'Dockerfile'), dockerfile);
        console.log('Generated Dockerfile');
      }

      // Step 2: Build Docker image
      const imageName = `autoinfra-project-${projectId}`;
      await dockerService.buildImage(projectPath, imageName, '');
      console.log('Docker image built successfully');

      await this.updateProjectStatus(projectId, 'provisioning');

      // Step 3: Provision infrastructure (simulated for local development)
      const project = await this.getProject(projectId);
      const infrastructureResult = await terraformService.provisionInfrastructure(
        projectId, 
        project.name, 
        techStack
      );
      console.log('Infrastructure provisioned');

      await this.updateProjectStatus(projectId, 'deploying');

      // Step 4: Deploy container
      const port = this.getPortForTechStack(techStack);
      const containerName = `autoinfra-container-${projectId}`;
      
      const deploymentResult = await dockerService.runContainer(imageName, containerName, port);
      console.log('Container deployed successfully');

      // Step 5: Update project with deployment info
      const deploymentUrl = `http://localhost:${port}`;
      await this.updateProjectDeployment(projectId, deploymentUrl, 'deployed');

      // Step 6: Record deployment in monitoring
      await monitoringService.recordDeployment(projectId, project.user_id, 'success', deploymentUrl);

      console.log(`Project ${projectId} deployed successfully at ${deploymentUrl}`);

      return {
        status: 'deployed',
        url: deploymentUrl,
        containerId: deploymentResult.containerId,
        infrastructure: infrastructureResult
      };

    } catch (error) {
      console.error(`Deployment failed for project ${projectId}:`, error);
      
      // Update project status to failed
      await this.updateProjectStatus(projectId, 'failed');
      
      // Record failed deployment
      const project = await this.getProject(projectId);
      await monitoringService.recordDeployment(projectId, project.user_id, 'failed');

      throw error;
    }
  }

  async updateProjectStatus(projectId, status) {
    try {
      await this.pool.query(
        'UPDATE projects SET status = $1, updated_at = $2 WHERE id = $3',
        [status, new Date(), projectId]
      );
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  }

  async updateProjectDeployment(projectId, url, status) {
    try {
      await this.pool.query(
        'UPDATE projects SET deployment_url = $1, status = $2, updated_at = $3 WHERE id = $4',
        [url, status, new Date(), projectId]
      );
    } catch (error) {
      console.error('Error updating project deployment:', error);
    }
  }

  async getProject(projectId) {
    try {
      const result = await this.pool.query('SELECT * FROM projects WHERE id = $1', [projectId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting project:', error);
      return null;
    }
  }

  getPortForTechStack(techStack) {
    switch (techStack.type) {
      case 'nodejs':
        return techStack.framework === 'react' ? 3001 : 3000;
      case 'python':
        return 8000;
      case 'java':
        return 8080;
      case 'go':
        return 8080;
      case 'php':
        return 80;
      default:
        return 8080;
    }
  }

  async redeployProject(projectId) {
    try {
      const project = await this.getProject(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Stop existing container
      const containerName = `autoinfra-container-${projectId}`;
      await dockerService.stopContainer(containerName);

      // Restart deployment process
      const extractPath = path.join('uploads', `extracted-${projectId}`);
      const techStack = JSON.parse(project.tech_stack);
      
      return await this.deployProject(projectId, extractPath, techStack);
    } catch (error) {
      console.error('Redeployment error:', error);
      throw error;
    }
  }

  async stopProject(projectId) {
    try {
      const containerName = `autoinfra-container-${projectId}`;
      await dockerService.stopContainer(containerName);
      
      await this.updateProjectStatus(projectId, 'stopped');
      
      return { status: 'stopped' };
    } catch (error) {
      console.error('Stop project error:', error);
      throw error;
    }
  }

  async deleteProject(projectId) {
    try {
      // Stop container
      await this.stopProject(projectId);

      // Destroy infrastructure
      await terraformService.destroyInfrastructure(projectId);

      // Remove project files
      const extractPath = path.join('uploads', `extracted-${projectId}`);
      await fs.rmdir(extractPath, { recursive: true }).catch(() => {});

      // Delete from database
      await this.pool.query('DELETE FROM projects WHERE id = $1', [projectId]);

      return { status: 'deleted' };
    } catch (error) {
      console.error('Delete project error:', error);
      throw error;
    }
  }

  async getProjectLogs(projectId) {
    try {
      const containerName = `autoinfra-container-${projectId}`;
      const logs = await dockerService.getContainerLogs(containerName);
      return logs;
    } catch (error) {
      console.error('Get project logs error:', error);
      return 'Error retrieving logs';
    }
  }

  async getProjectMetrics(projectId) {
    try {
      const containerName = `autoinfra-container-${projectId}`;
      const containerStatus = await dockerService.getContainerStatus(containerName);
      
      return {
        containerStatus,
        deploymentTime: new Date(),
        uptime: containerStatus.created ? this.calculateUptime(containerStatus.created) : '0m'
      };
    } catch (error) {
      console.error('Get project metrics error:', error);
      return null;
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

  async setupCICD(projectId, gitUrl) {
    try {
      // Generate Jenkins pipeline
      const project = await this.getProject(projectId);
      const techStack = JSON.parse(project.tech_stack);
      
      const jenkinsfile = this.generateJenkinsfile(techStack);
      
      // In a real implementation, this would:
      // 1. Create a Jenkins job
      // 2. Configure webhooks
      // 3. Set up automated deployments
      
      console.log('CI/CD pipeline configured for project', projectId);
      
      return {
        status: 'configured',
        pipelineUrl: `http://jenkins.autoinfra.com/job/project-${projectId}`,
        jenkinsfile
      };
    } catch (error) {
      console.error('CI/CD setup error:', error);
      throw error;
    }
  }

  generateJenkinsfile(techStack) {
    return `
pipeline {
    agent any
    
    environment {
        PROJECT_NAME = "${techStack.type}-app"
        DOCKER_IMAGE = "autoinfra/\${PROJECT_NAME}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                script {
                    ${this.getBuildSteps(techStack)}
                }
            }
        }
        
        stage('Test') {
            steps {
                script {
                    ${this.getTestSteps(techStack)}
                }
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    docker.build("\${DOCKER_IMAGE}:\${BUILD_NUMBER}")
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    sh 'docker stop \${PROJECT_NAME} || true'
                    sh 'docker rm \${PROJECT_NAME} || true'
                    sh 'docker run -d --name \${PROJECT_NAME} -p 8080:8080 \${DOCKER_IMAGE}:\${BUILD_NUMBER}'
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}`;
  }

  getBuildSteps(techStack) {
    switch (techStack.type) {
      case 'nodejs':
        return 'sh "npm ci && npm run build"';
      case 'python':
        return 'sh "pip install -r requirements.txt"';
      case 'java':
        return techStack.buildTool === 'maven' ? 
          'sh "mvn clean package -DskipTests"' : 
          'sh "gradle build -x test"';
      case 'go':
        return 'sh "go build -o main ."';
      default:
        return 'echo "No build steps defined"';
    }
  }

  getTestSteps(techStack) {
    switch (techStack.type) {
      case 'nodejs':
        return 'sh "npm test" || true';
      case 'python':
        return 'sh "python -m pytest" || true';
      case 'java':
        return techStack.buildTool === 'maven' ? 
          'sh "mvn test" || true' : 
          'sh "gradle test" || true';
      case 'go':
        return 'sh "go test ./..." || true';
      default:
        return 'echo "No tests defined"';
    }
  }
}

module.exports = new DeploymentService();