import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Server, 
  Activity, 
  AlertTriangle, 
  BarChart3,
  Upload,
  LogOut,
  Settings,
  Shield,
  Hash,
  Globe
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const sidebarItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Infrastructure', href: '/infrastructure', icon: Server },
  { name: 'Monitoring', href: '/monitoring', icon: Activity },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Upload', href: '/upload', icon: Upload },
]

export default function Layout({ children }) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [awsAccountInfo, setAwsAccountInfo] = useState(null)

  useEffect(() => {
    // Get AWS account info from localStorage
    const storedCredentials = localStorage.getItem('awsCredentials')
    if (storedCredentials) {
      const credentials = JSON.parse(storedCredentials)
      setAwsAccountInfo(credentials.accountInfo)
    }
  }, [])

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-primary">AutoInfra</h1>
          <p className="text-sm text-muted-foreground">Cloud Infrastructure Platform</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-muted-foreground">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {sidebarItems.find(item => item.href === location.pathname)?.name || 'Dashboard'}
            </h2>
            <div className="flex items-center space-x-4">
              {/* AWS Account Info */}
              {awsAccountInfo && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-1">
                    <Shield className="w-4 h-4 text-orange-500" />
                    <div className="text-xs">
                      <span className="text-muted-foreground">AWS:</span>
                      <span className="ml-1 font-mono text-orange-600 dark:text-orange-400">
                        {awsAccountInfo.accountId}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-1">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <div className="text-xs">
                      <span className="text-muted-foreground">Region:</span>
                      <span className="ml-1 font-mono text-blue-600 dark:text-blue-400">
                        {awsAccountInfo.region}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">System Online</span>
              </div>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}