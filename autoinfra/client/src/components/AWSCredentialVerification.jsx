import React, { useState } from 'react'
import { Shield, Key, Globe, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function AWSCredentialVerification({ onVerificationSuccess }) {
  const [formData, setFormData] = useState({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSecretKey, setShowSecretKey] = useState(false)

  const regions = [
    { value: 'us-east-1', label: 'US East (N. Virginia)' },
    { value: 'us-west-2', label: 'US West (Oregon)' },
    { value: 'eu-west-1', label: 'Europe (Ireland)' },
    { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
    { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/aws/verify-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        localStorage.setItem('awsCredentials', JSON.stringify({
          accessKeyId: formData.accessKeyId,
          region: formData.region,
          accountInfo: result.accountInfo
        }))
        
        onVerificationSuccess(result.accountInfo)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to verify AWS credentials. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-foreground">AWS Account Verification</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your AWS credentials to verify your destination account
          </p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium">Security Notice</p>
              <p className="mt-1">Your AWS credentials are used only for account verification and are not stored permanently on our servers.</p>
            </div>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="accessKeyId" className="block text-sm font-medium text-foreground mb-2">
                AWS Access Key ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="accessKeyId"
                  name="accessKeyId"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-12 py-3 border border-border placeholder-muted-foreground text-foreground bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  value={formData.accessKeyId}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="secretAccessKey" className="block text-sm font-medium text-foreground mb-2">
                AWS Secret Access Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="secretAccessKey"
                  name="secretAccessKey"
                  type={showSecretKey ? 'text' : 'password'}
                  required
                  className="appearance-none relative block w-full px-12 pr-12 py-3 border border-border placeholder-muted-foreground text-foreground bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  value={formData.secretAccessKey}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                >
                  {showSecretKey ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="region" className="block text-sm font-medium text-foreground mb-2">
                AWS Region
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                </div>
                <select
                  id="region"
                  name="region"
                  className="appearance-none relative block w-full px-12 py-3 border border-border text-foreground bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.region}
                  onChange={handleChange}
                >
                  {regions.map(region => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Verify AWS Account</span>
              </div>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          <p>Need help finding your AWS credentials?</p>
          <a 
            href="https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-orange-500 hover:text-orange-600 underline"
          >
            View AWS Documentation
          </a>
        </div>
      </div>
    </div>
  )
}