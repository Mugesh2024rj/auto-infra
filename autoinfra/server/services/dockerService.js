const Docker = require('dockerode');
const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');

class DockerService {
  constructor() {
    this.docker = new Docker();
  }

  async buildImage(projectPath, imageName, dockerfile) {
    try {
      // Create Dockerfile if not exists
      const dockerfilePath = path.join(projectPath, 'Dockerfile');
      const dockerfileExists = await fs.access(dockerfilePath).then(() => true).catch(() => false);
      
      if (!dockerfileExists) {
        await fs.writeFile(dockerfilePath, dockerfile);
      }

      // Create tar stream for Docker build context
      const tarStream = await this.createTarStream(projectPath);

      // Build image
      const stream = await this.docker.buildImage(tarStream, {
        t: imageName,
        dockerfile: 'Dockerfile'
      });

      return new Promise((resolve, reject) => {
        this.docker.modem.followProgress(stream, (err, res) => {
          if (err) {
            console.error('Docker build error:', err);
            reject(err);
          } else {
            console.log('Docker build completed:', imageName);
            resolve(res);
          }
        }, (event) => {
          if (event.stream) {
            console.log(event.stream.trim());
          }
        });
      });
    } catch (error) {
      console.error('Build image error:', error);
      throw error;
    }
  }

  async createTarStream(projectPath) {
    return new Promise((resolve, reject) => {
      const archive = archiver('tar');
      const chunks = [];

      archive.on('data', (chunk) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);

      archive.directory(projectPath, false);
      archive.finalize();
    });
  }

  async runContainer(imageName, containerName, port = 3000) {
    try {
      // Stop and remove existing container if exists
      await this.stopContainer(containerName);

      // Create and start new container
      const container = await this.docker.createContainer({
        Image: imageName,
        name: containerName,
        ExposedPorts: { [`${port}/tcp`]: {} },
        HostConfig: {
          PortBindings: { [`${port}/tcp`]: [{ HostPort: port.toString() }] },
          RestartPolicy: { Name: 'unless-stopped' }
        },
        Env: [
          'NODE_ENV=production',
          `PORT=${port}`
        ]
      });

      await container.start();
      console.log(`Container ${containerName} started on port ${port}`);
      
      return {
        containerId: container.id,
        port,
        url: `http://localhost:${port}`
      };
    } catch (error) {
      console.error('Run container error:', error);
      throw error;
    }
  }

  async stopContainer(containerName) {
    try {
      const containers = await this.docker.listContainers({ all: true });
      const existingContainer = containers.find(c => c.Names.includes(`/${containerName}`));
      
      if (existingContainer) {
        const container = this.docker.getContainer(existingContainer.Id);
        
        if (existingContainer.State === 'running') {
          await container.stop();
        }
        
        await container.remove();
        console.log(`Container ${containerName} stopped and removed`);
      }
    } catch (error) {
      console.error('Stop container error:', error);
    }
  }

  async getContainerStatus(containerName) {
    try {
      const containers = await this.docker.listContainers({ all: true });
      const container = containers.find(c => c.Names.includes(`/${containerName}`));
      
      if (!container) {
        return { status: 'not_found' };
      }

      return {
        status: container.State,
        created: container.Created,
        ports: container.Ports,
        image: container.Image
      };
    } catch (error) {
      console.error('Get container status error:', error);
      return { status: 'error', error: error.message };
    }
  }

  async listContainers() {
    try {
      const containers = await this.docker.listContainers({ all: true });
      return containers.map(container => ({
        id: container.Id,
        name: container.Names[0]?.replace('/', ''),
        image: container.Image,
        status: container.State,
        created: container.Created,
        ports: container.Ports
      }));
    } catch (error) {
      console.error('List containers error:', error);
      return [];
    }
  }

  async getContainerLogs(containerName, tail = 100) {
    try {
      const containers = await this.docker.listContainers({ all: true });
      const containerInfo = containers.find(c => c.Names.includes(`/${containerName}`));
      
      if (!containerInfo) {
        return 'Container not found';
      }

      const container = this.docker.getContainer(containerInfo.Id);
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        tail,
        timestamps: true
      });

      return logs.toString();
    } catch (error) {
      console.error('Get container logs error:', error);
      return `Error getting logs: ${error.message}`;
    }
  }

  async pushToRegistry(imageName, registryUrl) {
    try {
      // Tag image for registry
      const image = this.docker.getImage(imageName);
      const registryTag = `${registryUrl}/${imageName}`;
      
      await image.tag({ repo: registryTag });

      // Push to registry
      const pushStream = await this.docker.getImage(registryTag).push();
      
      return new Promise((resolve, reject) => {
        this.docker.modem.followProgress(pushStream, (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        });
      });
    } catch (error) {
      console.error('Push to registry error:', error);
      throw error;
    }
  }
}

module.exports = new DockerService();