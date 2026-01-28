import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Infrastructure from './pages/Infrastructure'
import Monitoring from './pages/Monitoring'
import Analytics from './pages/Analytics'
import Upload from './pages/Upload'
import Alerts from './pages/Alerts'
import AWSCredentialVerification from './components/AWSCredentialVerification'
import AWSVerificationSuccess from './components/AWSVerificationSuccess'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function AWSProtectedApp() {
  const [awsVerified, setAwsVerified] = useState(false)
  const [awsAccountInfo, setAwsAccountInfo] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    // Check if AWS credentials are already verified
    const storedCredentials = localStorage.getItem('awsCredentials')
    if (storedCredentials) {
      const credentials = JSON.parse(storedCredentials)
      setAwsAccountInfo(credentials.accountInfo)
      setAwsVerified(true)
    }
  }, [])

  const handleVerificationSuccess = (accountInfo) => {
    setAwsAccountInfo(accountInfo)
    setShowSuccess(true)
  }

  const handleContinue = () => {
    setAwsVerified(true)
    setShowSuccess(false)
  }

  if (!awsVerified) {
    if (showSuccess) {
      return <AWSVerificationSuccess accountInfo={awsAccountInfo} onContinue={handleContinue} />
    }
    return <AWSCredentialVerification onVerificationSuccess={handleVerificationSuccess} />
  }

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/infrastructure" element={
              <ProtectedRoute>
                <Layout>
                  <Infrastructure />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/monitoring" element={
              <ProtectedRoute>
                <Layout>
                  <Monitoring />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute>
                <Layout>
                  <Upload />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/alerts" element={
              <ProtectedRoute>
                <Layout>
                  <Alerts />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

function App() {
  return <AWSProtectedApp />
}

export default App