import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Server, Container, Database, Activity, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useWebSocket } from '../hooks/useWebSocket'
import axios from '../utils/axios'

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    health: {
      infrastructureHealth: 96.2,
      servers: 98.5,
      containers: 94.8,
      databases: 99.1
    },
    uptime: [],
    activeAutomations: 0,
    deployments: []
  })
  const [loading, setLoading] = useState(true)
  
  const { data: wsData } = useWebSocket()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (wsData && wsData.type === 'health') {
      setDashboardData(prev => ({
        ...prev,
        health: wsData.data
      }))
    }
  }, [wsData])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard/overview')
      setDashboardData(response.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatUptimeData = (uptimeData) => {
    return uptimeData.map((item, index) => ({
      time: new Date(item.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      uptime: item.uptime
    })).slice(-20) // Show last 20 data points
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
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Infrastructure Health */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Infrastructure Health</p>
              <p className="text-3xl font-bold text-primary">
                {dashboardData.health.infrastructureHealth}%
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500">+2.1%</span>
            <span className="text-muted-foreground ml-1">from last hour</span>
          </div>
        </div>

        {/* Active Automations */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Automations</p>
              <p className="text-3xl font-bold">{dashboardData.activeAutomations}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Clock className="w-4 h-4 text-muted-foreground mr-1" />
            <span className="text-muted-foreground">Last updated 2m ago</span>
          </div>
        </div>

        {/* Total Deployments */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Deployments</p>
              <p className="text-3xl font-bold">{dashboardData.deployments.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Container className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500">+5</span>
            <span className="text-muted-foreground ml-1">this week</span>
          </div>
        </div>

        {/* System Status */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">System Status</p>
              <p className="text-lg font-semibold text-green-500">All Systems Operational</p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-muted-foreground">99.9% uptime</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Uptime Chart */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Infrastructure Uptime</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm text-muted-foreground">Real-time</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatUptimeData(dashboardData.uptime)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[90, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="uptime" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Infrastructure Health Bars */}
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold mb-6">Infrastructure Health</h3>
          <div className="space-y-6">
            {/* Servers */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Server className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Servers</p>
                  <p className="text-sm text-muted-foreground">EC2 Instances</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-24 health-bar">
                  <div 
                    className="health-bar-fill bg-blue-500" 
                    style={{ width: `${dashboardData.health.servers}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {dashboardData.health.servers}%
                </span>
              </div>
            </div>

            {/* Containers */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Container className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Containers</p>
                  <p className="text-sm text-muted-foreground">Docker/EKS</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-24 health-bar">
                  <div 
                    className="health-bar-fill bg-green-500" 
                    style={{ width: `${dashboardData.health.containers}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {dashboardData.health.containers}%
                </span>
              </div>
            </div>

            {/* Databases */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">Databases</p>
                  <p className="text-sm text-muted-foreground">PostgreSQL/RDS</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-24 health-bar">
                  <div 
                    className="health-bar-fill bg-purple-500" 
                    style={{ width: `${dashboardData.health.databases}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {dashboardData.health.databases}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Deployments */}
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Recent Deployments</h3>
          <button className="text-sm text-primary hover:text-primary/80 transition-colors">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Project</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Environment</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Time</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.deployments.slice(0, 5).map((deployment, index) => (
                <tr key={index} className="border-b border-border/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Container className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{deployment.project_name || `Project ${index + 1}`}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      deployment.status === 'success' 
                        ? 'bg-green-500/10 text-green-500' 
                        : deployment.status === 'failed'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {deployment.status || 'deployed'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">Production</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {deployment.created_at 
                      ? new Date(deployment.created_at).toLocaleString()
                      : '2 hours ago'
                    }
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-primary hover:text-primary/80 text-sm transition-colors">
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {dashboardData.deployments.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-muted-foreground">
                    No deployments yet. Upload your first project to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}