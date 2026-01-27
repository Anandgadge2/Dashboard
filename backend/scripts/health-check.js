#!/usr/bin/env node

/**
 * Health Check Script
 * Verifies server is running and responsive
 */

const http = require('http');
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

console.log(`🏥 Health Check: http://${HOST}:${PORT}`);
console.log('='.repeat(50));

const checkEndpoint = (path, name) => {
  return new Promise((resolve) => {
    const req = http.get(`http://${HOST}:${PORT}${path}`, (res) => {
      const status = res.statusCode;
      const icon = status === 200 ? '✅' : status < 500 ? '⚠️ ' : '❌';
      console.log(`${icon} ${name}: ${status} ${res.statusMessage}`);
      resolve(status === 200);
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${name}: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      req.abort();
      console.log(`⏱️  ${name}: Timeout`);
      resolve(false);
    });
  });
};

async function runHealthCheck() {
  const endpoints = [
    { path: '/health', name: 'Health Endpoint' },
    { path: '/api/health', name: 'API Health' },
    { path: '/webhook', name: 'Webhook (GET)' }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await checkEndpoint(endpoint.path, endpoint.name);
    results.push(result);
  }
  
  console.log('='.repeat(50));
  
  const allHealthy = results.every(r => r);
  
  if (allHealthy) {
    console.log('✅ All systems operational');
    process.exit(0);
  } else {
    console.log('❌ Some systems are down');
    process.exit(1);
  }
}

// Add timeout for entire health check
setTimeout(() => {
  console.log('\n❌ Health check timed out after 15 seconds');
  console.log('💡 Server may not be running. Try: npm run dev:prod');
  process.exit(1);
}, 15000);

runHealthCheck();
