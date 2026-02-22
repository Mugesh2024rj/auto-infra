const express = require('express');
const awsService = require('../services/awsService');

const router = express.Router();

// Verify AWS credentials
router.post('/verify-credentials', async (req, res) => {
  try {
    const { accessKeyId, secretAccessKey, region } = req.body;

    if (!accessKeyId || !secretAccessKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'Access Key ID and Secret Access Key are required' 
      });
    }

    const result = await awsService.verifyCredentials(accessKeyId, secretAccessKey, region);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'AWS credentials verified successfully',
        accountInfo: {
          accountId: result.accountId,
          userId: result.userId,
          arn: result.arn,
          region: result.region
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('AWS credential verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during credential verification'
    });
  }
});

// Get current AWS account info
router.get('/account-info', async (req, res) => {
  try {
    if (!awsService.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'AWS credentials not configured'
      });
    }

    const accountInfo = await awsService.getAccountInfo();
    res.json({
      success: true,
      accountInfo
    });
  } catch (error) {
    console.error('Get account info error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear AWS credentials
router.post('/clear-credentials', (req, res) => {
  try {
    awsService.clearCredentials();
    res.json({
      success: true,
      message: 'AWS credentials cleared successfully'
    });
  } catch (error) {
    console.error('Clear credentials error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear credentials'
    });
  }
});

// Check if AWS is configured
router.get('/status', (req, res) => {
  res.json({
    configured: awsService.isConfigured()
  });
});

module.exports = router;