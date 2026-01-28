import React, { useState, useEffect } from 'react'
import { Server, Container, Globe, Play, Square, Trash2, Eye, RefreshCw } from 'lucide-react'
import axios from 'axios'

export default function Infrastructure() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects')
      setProjects(response.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (projectId, action) => {
    setActionLoading(prev => ({ ...prev, [projectId]: action }))
    
    try {
      // In a real implementation, these would be actual API calls
      switch (action) {
        case 'start':
          console.log(`Starting project ${projectId}`)
          break
        case 'stop':
          console.log(`Stopping project ${projectId}`)
          break
        case 'restart':
          console.log(`Restarting project ${projectId}`)
          break
        case 'delete':
          if (window.confirm('Are you sure you want to delete this project?')) {
            await axios.delete(`/api/projects/${projectId}`)
            setProjects(prev => prev.filter(p => p.id !== projectId))
          }
          break
      }
    } catch (error) {
      console.error(`Error ${action}ing project:`, error)
    } finally {
      setActionLoading(prev => ({ ...prev, [projectId]: null }))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'deployed':
      case 'running':
        return 'text-green-500 bg-green-500/10'
      case 'building':
      case 'provisioning':
      case 'deploying':
        return 'text-yellow-500 bg-yellow-500/10'
      case 'failed':
      case 'error':
        return 'text-red-500 bg-red-500/10'
      case 'stopped':
        return 'text-gray-500 bg-gray-500/10'
      default:
        return 'text-blue-500 bg-blue-500/10'
    }
  }

  const getTechStackIcon = (techStack) => {
    if (!techStack) return <Container className="w-5 h-5" />
    
    const stack = typeof techStack === 'string' ? JSON.parse(techStack) : techStack
    
    switch (stack.type) {
      case 'nodejs':
        return <div className="w-5 h-5 bg-green-500 rounded text-xs flex items-center justify-center text-white font-bold">N</div>
      case 'python':
        return <div className="w-5 h-5 bg-blue-500 rounded text-xs flex items-center justify-center text-white font-bold">P</div>
      case 'java':
        return <div className="w-5 h-5 bg-red-500 rounded text-xs flex items-center justify-center text-white font-bold">J</div>
      case 'go':
        return <div className="w-5 h-5 bg-cyan-500 rounded text-xs flex items-center justify-center text-white font-bold">G</div>
      default:
        return <Container className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Infrastructure</h1>
          <p className="text-muted-foreground">Manage your deployed projects and infrastructure</p>
        </div>
        <button
          onClick={fetchProjects}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-bold">{projects.length}</p>
            </div>
            <Server className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Running</p>
              <p className="text-2xl font-bold text-green-500">
                {projects.filter(p => p.status === 'deployed').length}
              </p>
            </div>
            <Play className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Building</p>
              <p className="text-2xl font-bold text-yellow-500">
                {projects.filter(p => ['building', 'provisioning', 'deploying'].includes(p.status)).length}
              </p>
            </div>
            <RefreshCw className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-red-500">
                {projects.filter(p => p.status === 'failed').length}
              </p>
            </div>
            <Square className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Deployed Projects</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">Live monitoring</span>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects deployed yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first project to see it here
            </p>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Deploy Project
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Project</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tech Stack</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">AWS Region</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">URL</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {getTechStackIcon(project.tech_stack)}
                        </div>
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                        {project.tech_stack ? JSON.parse(project.tech_stack).type : 'Unknown'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-mono">{project.aws_region || 'us-east-1'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {project.deployment_url ? (
                        <a
                          href={project.deployment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          <span className="text-sm">View Live</span>
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not deployed</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {new Date(project.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAction(project.id, 'restart')}
                          disabled={actionLoading[project.id]}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                          title="Restart"
                        >
                          <RefreshCw className={`w-4 h-4 ${actionLoading[project.id] === 'restart' ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => window.open(`/projects/${project.id}/logs`, '_blank')}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          title="View Logs"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction(project.id, 'delete')}
                          disabled={actionLoading[project.id]}
                          className="p-2 text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}