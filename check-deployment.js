/**
 * Check Deployment Status Script
 * Run: node check-deployment.js
 */

const https = require('https');
const http = require('http');

// Configuration - Update these with your deployment URLs
const CONFIG = {
  backendUrl: process.env.BACKEND_URL || 'https://your-backend.vercel.app',
  frontendUrl: process.env.FRONTEND_URL || 'https://your-frontend.vercel.app',
  testEmail: 'superadmin@platform.com',
  testPassword: '111111'
};

// Colors for console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function checkBackendHealth() {
  log('\n🔍 Checking Backend Health...', 'blue');
  try {
    const response = await makeRequest(`${CONFIG.backendUrl}/api/health`);
    if (response.status === 200) {
      log('✅ Backend is healthy', 'green');
      return true;
    } else {
      log(`❌ Backend returned status: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Backend health check failed: ${error.message}`, 'red');
    return false;
  }
}

async function checkBackendLogin() {
  log('\n🔍 Testing Backend Login...', 'blue');
  try {
    const response = await makeRequest(`${CONFIG.backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: CONFIG.testEmail,
        password: CONFIG.testPassword
      })
    });

    if (response.status === 200) {
      const data = JSON.parse(response.data);
      if (data.success) {
        log('✅ Backend login successful', 'green');
        log(`   Token received: ${data.data.accessToken.substring(0, 20)}...`, 'yellow');
        return data.data.accessToken;
      } else {
        log(`❌ Login failed: ${data.message}`, 'red');
        return null;
      }
    } else {
      log(`❌ Login returned status: ${response.status}`, 'red');
      log(`   Response: ${response.data}`, 'yellow');
      return null;
    }
  } catch (error) {
    log(`❌ Login test failed: ${error.message}`, 'red');
    return null;
  }
}

async function checkFrontend() {
  log('\n🔍 Checking Frontend...', 'blue');
  try {
    const response = await makeRequest(CONFIG.frontendUrl);
    if (response.status === 200) {
      log('✅ Frontend is accessible', 'green');
      return true;
    } else {
      log(`❌ Frontend returned status: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Frontend check failed: ${error.message}`, 'red');
    return false;
  }
}

async function checkWhatsAppWebhook(token) {
  log('\n🔍 Testing WhatsApp Webhook...', 'blue');
  try {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'test_token';
    const webhookUrl = `${CONFIG.backendUrl}/webhook?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=test123`;
    
    const response = await makeRequest(webhookUrl);
    if (response.status === 200 && response.data === 'test123') {
      log('✅ WhatsApp webhook verification works', 'green');
      return true;
    } else {
      log(`⚠️  Webhook verification returned: ${response.status}`, 'yellow');
      log(`   Response: ${response.data}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Webhook test failed: ${error.message}`, 'red');
    return false;
  }
}

async function checkAPIEndpoints(token) {
  log('\n🔍 Testing API Endpoints...', 'blue');
  
  const endpoints = [
    { path: '/api/grievances', method: 'GET', name: 'Get Grievances' },
    { path: '/api/appointments', method: 'GET', name: 'Get Appointments' },
    { path: '/api/departments', method: 'GET', name: 'Get Departments' },
    { path: '/api/users', method: 'GET', name: 'Get Users' }
  ];

  let passed = 0;
  let failed = 0;

  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${CONFIG.backendUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200 || response.status === 401) {
        log(`✅ ${endpoint.name}: OK`, 'green');
        passed++;
      } else {
        log(`❌ ${endpoint.name}: Status ${response.status}`, 'red');
        failed++;
      }
    } catch (error) {
      log(`❌ ${endpoint.name}: ${error.message}`, 'red');
      failed++;
    }
  }

  return { passed, failed, total: endpoints.length };
}

async function main() {
  log('\n' + '='.repeat(60), 'blue');
  log('🚀 Deployment Status Check', 'blue');
  log('='.repeat(60), 'blue');
  
  log(`\n📋 Configuration:`, 'yellow');
  log(`   Backend: ${CONFIG.backendUrl}`, 'yellow');
  log(`   Frontend: ${CONFIG.frontendUrl}`, 'yellow');

  const results = {
    backendHealth: false,
    backendLogin: false,
    frontend: false,
    webhook: false,
    apiEndpoints: { passed: 0, failed: 0, total: 0 }
  };

  // Check backend health
  results.backendHealth = await checkBackendHealth();

  // Check backend login
  const token = await checkBackendLogin();
  results.backendLogin = !!token;

  // Check frontend
  results.frontend = await checkFrontend();

  // Check webhook (if token available)
  if (token) {
    results.webhook = await checkWhatsAppWebhook(token);
    results.apiEndpoints = await checkAPIEndpoints(token);
  }

  // Summary
  log('\n' + '='.repeat(60), 'blue');
  log('📊 Deployment Status Summary', 'blue');
  log('='.repeat(60), 'blue');
  
  log(`\n✅ Backend Health: ${results.backendHealth ? 'OK' : 'FAILED'}`, results.backendHealth ? 'green' : 'red');
  log(`✅ Backend Login: ${results.backendLogin ? 'OK' : 'FAILED'}`, results.backendLogin ? 'green' : 'red');
  log(`✅ Frontend: ${results.frontend ? 'OK' : 'FAILED'}`, results.frontend ? 'green' : 'red');
  log(`✅ WhatsApp Webhook: ${results.webhook ? 'OK' : 'FAILED'}`, results.webhook ? 'green' : 'red');
  log(`✅ API Endpoints: ${results.apiEndpoints.passed}/${results.apiEndpoints.total} passed`, 
      results.apiEndpoints.failed === 0 ? 'green' : 'yellow');

  const allPassed = results.backendHealth && results.backendLogin && results.frontend;
  
  log('\n' + '='.repeat(60), 'blue');
  if (allPassed) {
    log('✅ Deployment Status: HEALTHY', 'green');
  } else {
    log('⚠️  Deployment Status: ISSUES DETECTED', 'yellow');
    log('\n💡 Next Steps:', 'yellow');
    log('   1. Check Vercel dashboard for build logs', 'yellow');
    log('   2. Verify environment variables are set', 'yellow');
    log('   3. Check database connectivity', 'yellow');
    log('   4. Review error logs', 'yellow');
  }
  log('='.repeat(60) + '\n', 'blue');
}

// Run checks
main().catch(console.error);
