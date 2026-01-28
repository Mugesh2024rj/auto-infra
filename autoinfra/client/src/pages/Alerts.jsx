import React, { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Clock, Bell } from 'lucide-react'

export default function Alerts() {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    // Mock alerts data
    const mockAlerts = [
      {
        id: '1',
        type: 'warning',
        title: 'High CPU Usage',
        message: 'Server cpu-01 is running at 89% CPU utilization',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        status: 'active'
      },
      {
        id: '2',
        type: 'error',
        title: 'Database Connection Failed',
        message: 'Unable to connect to production database',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: 'resolved'
      },
      {
        id: '3',
        type: 'info',
        title: 'Deployment Completed',
        message: 'Project "web-app" deployed successfully to production',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        status: 'resolved'
      },
      {
        id: '4',
        type: 'warning',
        title: 'Low Disk Space',
        message: 'Storage volume /var/log is 85% full',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        status: 'active'
      }
    ]
    setAlerts(mockAlerts)
  }, [])

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <CheckCircle className="w-5 h-5 text-blue-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getAlertColor = (type) => {
    switch (type) {
      case 'error':
        return 'border-red-500/20 bg-red-500/10'
      case 'warning':
        return 'border-yellow-500/20 bg-yellow-500/10'
      case 'info':
        return 'border-blue-500/20 bg-blue-500/10'
      default:
        return 'border-gray-500/20 bg-gray-500/10'
    }
  }

  const activeAlerts = alerts.filter(alert => alert.status === 'active')
  const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="text-muted-foreground">Monitor system alerts and notifications</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-sm text-muted-foreground">{activeAlerts.length} Active</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Alerts</p>
              <p className="text-2xl font-bold">{alerts.length}</p>
            </div>
            <Bell className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-red-500">{activeAlerts.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold text-green-500">{resolvedAlerts.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold text-red-500">
                {alerts.filter(a => a.type === 'error').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="dashboard-card">
          <h2 className="text-lg font-semibold mb-4">Active Alerts</h2>
          <div className="space-y-4">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${getAlertColor(alert.type)}`}
              >
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{alert.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{alert.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Alerts */}
      <div className="dashboard-card">
        <h2 className="text-lg font-semibold mb-4">Recent Alerts</h2>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/20 transition-colors"
            >
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{alert.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      alert.status === 'active' 
                        ? 'bg-red-500/10 text-red-500' 
                        : 'bg-green-500/10 text-green-500'
                    }`}>
                      {alert.status}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {alert.timestamp.toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}