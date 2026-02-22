import React, { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Activity, Cpu, HardDrive, MemoryStick, Container, AlertTriangle, CheckCircle } from 'lucide-react'
import { useWebSocket } from '../hooks/useWebSocket'
import axios from 'axios'

export default function Monitoring() {
  const [metrics, setMetrics] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    activeContainers: 0
  })
  const [containers, setContainers] = useState([])
  const [healthHistory, setHealthHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const { data: wsData } = useWebSocket()

  useEffect(() => {
    fetchMonitoringData()
    const interval = setInterval(fetchMonitoringData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (wsData && wsData.type === 'health') {
      // Update health history with real-time data
      setHealthHistory(prev => {
        const newData = {
          time: new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          infrastructure: wsData.data.infrastructureHealth,
          servers: wsData.data.servers,
          containers: wsData.data.containers,
          databases: wsData.data.databases
        }
        
        const updated = [...prev, newData].slice(-20) // Keep last 20 data points
        return updated
      })
    }
  }, [wsData])

  const fetchMonitoringData = async () => {
    try {
      const [metricsRes, containersRes] = await Promise.all([
        axios.get('/api/dashboard/metrics'),
        axios.get('/api/dashboard/containers')
      ])

      setMetrics(metricsRes.data)
      setContainers(containersRes.data)
    } catch (error) {
      console.error('Error fetching monitoring data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getContainerStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'text-green-500 bg-green-500/10'
      case 'stopped':
        return 'text-red-500 bg-red-500/10'
      case 'paused':
        return 'text-yellow-500 bg-yellow-500/10'
      default:
        return 'text-gray-500 bg-gray-500/10'
    }
  }

  const systemMetrics = [
    {
      name: 'CPU Usage',
      value: metrics.cpuUsage,
      icon: Cpu,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      name: 'Memory Usage',
      value: metrics.memoryUsage,
      icon: MemoryStick,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      name: 'Disk Usage',
      value: metrics.diskUsage,
      icon: HardDrive,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      name: 'Active Containers',
      value: metrics.activeContainers,
      icon: Container,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      isCount: true
    }
  ]

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
          <h1 className="text-2xl font-bold">Monitoring</h1>
          <p className="text-muted-foreground">Real-time system metrics and container monitoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">Live monitoring</span>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.name} className="metric-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.name}</p>
                  <p className="text-2xl font-bold">
                    {metric.isCount ? metric.value : `${metric.value}%`}
                  </p>
                </div>
                <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
              {!metric.isCount && (
                <div className="mt-4">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        metric.value > 80 ? 'bg-red-500' : 
                        metric.value > 60 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${metric.value}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Infrastructure Health Chart */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Infrastructure Health</h3>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Real-time</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={healthHistory}>
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
                <Area 
                  type="monotone" 
                  dataKey="infrastructure" 
                  stackId="1"
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="servers" 
                  stackId="2"
                  stroke="#3b82f6" 
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
                <Area 
                  type="monotone" 
                  dataKey="containers" 
                  stackId="3"
                  stroke="#10b981" 
                  fill="#10b981"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Usage Chart */}
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold mb-6">Resource Usage</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'CPU', usage: metrics.cpuUsage, color: '#3b82f6' },
                { name: 'Memory', usage: metrics.memoryUsage, color: '#10b981' },
                { name: 'Disk', usage: metrics.diskUsage, color: '#8b5cf6' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="usage" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Container Status */}
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Container Status</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">
                {containers.filter(c => c.status === 'running').length} Running
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-muted-foreground">
                {containers.filter(c => c.status !== 'running').length} Stopped
              </span>
            </div>
          </div>
        </div>

        {containers.length === 0 ? (
          <div className="text-center py-12">
            <Container className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium mb-2">No containers running</h4>
            <p className="text-muted-foreground">Deploy a project to see container metrics here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {containers.map((container) => (
              <div key={container.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Container className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium truncate">{container.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{container.image}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getContainerStatusColor(container.status)}`}>
                    {container.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uptime:</span>
                    <span>{container.uptime || '0m'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Health:</span>
                    <span className={container.healthStatus === 'healthy' ? 'text-green-500' : 'text-red-500'}>
                      {container.healthStatus || 'unknown'}
                    </span>
                  </div>
                  {container.ports && container.ports.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ports:</span>
                      <span>{container.ports.map(p => `${p.PublicPort}:${p.PrivatePort}`).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alerts Section */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold mb-6">System Alerts</h3>
        <div className="space-y-3">
          {metrics.cpuUsage > 80 && (
            <div className="flex items-center space-x-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-medium text-red-500">High CPU Usage</p>
                <p className="text-sm text-muted-foreground">CPU usage is at {metrics.cpuUsage}%</p>
              </div>
            </div>
          )}
          
          {metrics.memoryUsage > 85 && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="font-medium text-yellow-500">High Memory Usage</p>
                <p className="text-sm text-muted-foreground">Memory usage is at {metrics.memoryUsage}%</p>
              </div>
            </div>
          )}
          
          {containers.filter(c => c.status !== 'running').length > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium text-orange-500">Container Issues</p>
                <p className="text-sm text-muted-foreground">
                  {containers.filter(c => c.status !== 'running').length} containers are not running
                </p>
              </div>
            </div>
          )}
          
          {metrics.cpuUsage <= 80 && metrics.memoryUsage <= 85 && containers.filter(c => c.status !== 'running').length === 0 && (
            <div className="flex items-center space-x-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-green-500">All Systems Normal</p>
                <p className="text-sm text-muted-foreground">No alerts at this time</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}