import React, { useState } from 'react'
import { Upload as UploadIcon, GitBranch, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import axios from '../utils/axios'

export default function Upload() {
  const [gitUrl, setGitUrl] = useState('')
  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [deploying, setDeploying] = useState(false)
  const [deployResult, setDeployResult] = useState(null)
  const [error, setError] = useState('')

  const handleDeploy = async (e) => {
    e.preventDefault()
    
    if (!gitUrl || !projectName) {
      setError('Please provide a project name and Git repository URL')
      return
    }

    setDeploying(true)
    setError('')
    setDeployResult(null)

    try {
      const response = await axios.post('/api/projects/deploy-git', {
        gitUrl,
        projectName,
        description
      })

      setDeployResult(response.data)
      
      // Reset form
      setGitUrl('')
      setProjectName('')
      setDescription('')
      
    } catch (error) {
      setError(error.response?.data?.error || 'Deployment failed')
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="dashboard-card">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <GitBranch className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Deploy from Git Repository</h1>
          <p className="text-muted-foreground">
            Enter your Git repository URL and we'll automatically clone, detect the tech stack, 
            build Docker images, and deploy to the cloud.
          </p>
        </div>

        <form onSubmit={handleDeploy} className="space-y-6">
          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium mb-2">
                Project Name *
              </label>
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="my-awesome-app"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Brief description of your project"
              />
            </div>
          </div>

          {/* Git Repository URL */}
          <div>
            <label htmlFor="gitUrl" className="block text-sm font-medium mb-2">
              Git Repository URL *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <GitBranch className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="url"
                id="gitUrl"
                value={gitUrl}
                onChange={(e) => setGitUrl(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://github.com/username/repository.git"
                required
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Supports GitHub, GitLab, Bitbucket, and other Git repositories
            </p>
          </div>

          {/* Supported Tech Stacks */}
          <div className="bg-muted/20 rounded-lg p-4">
            <h3 className="font-medium mb-3">Supported Tech Stacks</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Node.js + Express</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>React + Vite</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Python + Flask</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Java + Spring</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Go</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span>PHP</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span>Docker</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Custom</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {deployResult && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-500 mb-3">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Deployment Started!</span>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Project ID:</strong> {deployResult.projectId}</p>
                <p><strong>AWS Region:</strong> {deployResult.deploymentRegion}</p>
                <p><strong>Status:</strong> {deployResult.status}</p>
                <p><strong>Repository:</strong> {deployResult.gitUrl}</p>
                <p className="text-muted-foreground">{deployResult.message}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={deploying || !gitUrl || !projectName}
            className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {deploying ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Cloning & Deploying...</span>
              </>
            ) : (
              <>
                <GitBranch className="w-5 h-5" />
                <span>Deploy from Git</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Deployment Process */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold mb-4">Deployment Process</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">1</span>
            </div>
            <div>
              <p className="font-medium">Clone Repository</p>
              <p className="text-sm text-muted-foreground">Clone your Git repository to our servers</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">2</span>
            </div>
            <div>
              <p className="font-medium">Tech Stack Detection</p>
              <p className="text-sm text-muted-foreground">Automatically detect your project's technology stack</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">3</span>
            </div>
            <div>
              <p className="font-medium">Docker Build</p>
              <p className="text-sm text-muted-foreground">Generate Dockerfile and build container image</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">4</span>
            </div>
            <div>
              <p className="font-medium">Infrastructure Provisioning</p>
              <p className="text-sm text-muted-foreground">Create AWS resources in your verified region using Terraform</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">5</span>
            </div>
            <div>
              <p className="font-medium">Deployment</p>
              <p className="text-sm text-muted-foreground">Deploy container and provide live HTTPS URL</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}