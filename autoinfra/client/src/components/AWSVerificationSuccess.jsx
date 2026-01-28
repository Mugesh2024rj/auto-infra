import React from 'react'
import { CheckCircle, User, Hash, MapPin, ArrowRight } from 'lucide-react'

export default function AWSVerificationSuccess({ accountInfo, onContinue }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Success Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-foreground">AWS Account Verified!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your AWS credentials have been successfully verified
          </p>
        </div>

        {/* Account Information */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Account Information</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Hash className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Account ID</p>
                <p className="font-mono text-sm text-foreground">{accountInfo.accountId}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-mono text-xs text-foreground break-all">{accountInfo.userId}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Region</p>
                <p className="text-sm text-foreground">{accountInfo.region}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div className="text-sm text-green-700 dark:text-green-300">
              <p className="font-medium">Secure Connection Established</p>
              <p className="mt-1">AutoInfra can now safely deploy to your AWS account.</p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="group relative w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          <span>Continue to AutoInfra</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Change Account */}
        <div className="text-center">
          <button
            onClick={() => {
              localStorage.removeItem('awsCredentials')
              window.location.reload()
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Use different AWS account
          </button>
        </div>
      </div>
    </div>
  )
}