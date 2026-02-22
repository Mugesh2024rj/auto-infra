const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class GitService {
  constructor() {
    this.cloneDir = path.join(__dirname, '../cloned-repos');
  }

  async cloneRepository(gitUrl, projectId) {
    try {
      console.log(`Cloning repository: ${gitUrl}`);
      
      // Create clone directory if it doesn't exist
      await fs.mkdir(this.cloneDir, { recursive: true });
      
      const projectPath = path.join(this.cloneDir, `project-${projectId}`);
      
      // Clone the repository
      await this.runGitCommand(`git clone ${gitUrl} ${projectPath}`);
      
      console.log(`Repository cloned successfully to: ${projectPath}`);
      return projectPath;
      
    } catch (error) {
      console.error('Git clone error:', error);
      throw new Error(`Failed to clone repository: ${error.message}`);
    }
  }

  async runGitCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Git command error: ${error}`);
          reject(error);
        } else {
          console.log(`Git command output: ${stdout}`);
          if (stderr) console.error(`Git command stderr: ${stderr}`);
          resolve(stdout);
        }
      });
    });
  }

  async getRepositoryInfo(projectPath) {
    try {
      // Get repository information
      const remoteUrl = await this.runGitCommand(`cd ${projectPath} && git config --get remote.origin.url`);
      const lastCommit = await this.runGitCommand(`cd ${projectPath} && git log -1 --format="%H %s"`);
      const branch = await this.runGitCommand(`cd ${projectPath} && git branch --show-current`);
      
      return {
        remoteUrl: remoteUrl.trim(),
        lastCommit: lastCommit.trim(),
        branch: branch.trim()
      };
    } catch (error) {
      console.error('Error getting repository info:', error);
      return {
        remoteUrl: 'unknown',
        lastCommit: 'unknown',
        branch: 'main'
      };
    }
  }

  async pullLatestChanges(projectPath) {
    try {
      console.log(`Pulling latest changes for: ${projectPath}`);
      await this.runGitCommand(`cd ${projectPath} && git pull origin main`);
      console.log('Successfully pulled latest changes');
      return true;
    } catch (error) {
      console.error('Error pulling changes:', error);
      return false;
    }
  }

  async cleanupRepository(projectId) {
    try {
      const projectPath = path.join(this.cloneDir, `project-${projectId}`);
      await fs.rmdir(projectPath, { recursive: true });
      console.log(`Cleaned up repository: ${projectPath}`);
    } catch (error) {
      console.error('Error cleaning up repository:', error);
    }
  }

  validateGitUrl(gitUrl) {
    // Basic Git URL validation
    const gitUrlPattern = /^(https?:\/\/)?([\w\.-]+@)?([\w\.-]+)(:\d+)?(\/.*)?\.git$/;
    const githubPattern = /^https:\/\/github\.com\/[\w\.-]+\/[\w\.-]+$/;
    const gitlabPattern = /^https:\/\/gitlab\.com\/[\w\.-]+\/[\w\.-]+$/;
    
    return gitUrlPattern.test(gitUrl) || githubPattern.test(gitUrl) || gitlabPattern.test(gitUrl) || gitUrl.includes('git');
  }

  extractRepoName(gitUrl) {
    try {
      // Extract repository name from URL
      const parts = gitUrl.split('/');
      const lastPart = parts[parts.length - 1];
      return lastPart.replace('.git', '');
    } catch (error) {
      return 'unknown-repo';
    }
  }
}

module.exports = new GitService();