const axios = require('axios');

async function testServer() {
  try {
    console.log('Testing server connection...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Health check:', healthResponse.data);
    
    // Test login endpoint
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@autoinfra.com',
      password: 'admin123'
    });
    console.log('✅ Login test:', loginResponse.data);
    
  } catch (error) {
    console.error('❌ Server test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testServer();