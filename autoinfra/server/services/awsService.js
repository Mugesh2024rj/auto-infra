// Mock AWS Service for Development
class AWSService {
  constructor() {
    this.credentials = null;
    this.region = null;
    this.accountInfo = null;
  }

  // Mock AWS credential verification
  async verifyCredentials(accessKeyId, secretAccessKey, region = 'us-east-1') {
    try {
      // Simple validation for development
      if (!accessKeyId || !secretAccessKey) {
        return {
          success: false,
          error: 'Access Key ID and Secret Access Key are required'
        };
      }

      if (accessKeyId.length < 16) {
        return {
          success: false,
          error: 'Invalid AWS Access Key ID format'
        };
      }

      // Mock successful verification
      const mockAccountInfo = {
        accountId: '123456789012',
        userId: 'AIDACKCEVSQ6C2EXAMPLE',
        arn: `arn:aws:iam::123456789012:user/developer`,
        region
      };

      // Store credentials and region
      this.credentials = { accessKeyId, secretAccessKey };
      this.region = region;
      this.accountInfo = mockAccountInfo;

      return {
        success: true,
        ...mockAccountInfo
      };
    } catch (error) {
      console.error('AWS credential verification failed:', error);
      return {
        success: false,
        error: 'Verification failed - please check your credentials'
      };
    }
  }

  // Get AWS account information
  async getAccountInfo() {
    if (!this.accountInfo) {
      throw new Error('AWS credentials not configured');
    }
    return this.accountInfo;
  }

  // Check if credentials are configured
  isConfigured() {
    return this.credentials !== null;
  }

  // Clear stored credentials
  clearCredentials() {
    this.credentials = null;
    this.region = null;
    this.accountInfo = null;
  }

  // Get configured AWS region
  getRegion() {
    return this.region || 'us-east-1';
  }
}

// Singleton instance
const awsService = new AWSService();

module.exports = awsService;