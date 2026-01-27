#!/usr/bin/env node

/**
 * Kill process using a specific port
 * Usage: npm run kill:port [port]
 */

const { execSync } = require('child_process');
const PORT = process.argv[2] || process.env.PORT || 5000;

console.log(`🔍 Finding processes on port ${PORT}...`);

try {
  // For Windows
  if (process.platform === 'win32') {
    const output = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' });
    
    if (output) {
      console.log(`\n📋 Processes using port ${PORT}:\n${output}`);
      
      const lines = output.split('\n').filter(line => line.includes('LISTENING'));
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0') {
          pids.add(pid);
        }
      });
      
      console.log(`\n💀 Killing ${pids.size} process(es)...`);
      
      pids.forEach(pid => {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`   ✅ Killed PID ${pid}`);
        } catch (err) {
          console.log(`   ❌ Failed to kill PID ${pid}`);
        }
      });
      
      console.log(`\n✅ Port ${PORT} should now be free`);
    } else {
      console.log(`✅ No processes found using port ${PORT}`);
    }
  } else {
    // For Unix/Linux/Mac
    const output = execSync(`lsof -ti :${PORT}`, { encoding: 'utf8' }).trim();
    
    if (output) {
      const pids = output.split('\n');
      console.log(`\n💀 Killing ${pids.length} process(es)...`);
      
      pids.forEach(pid => {
        try {
          execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
          console.log(`   ✅ Killed PID ${pid}`);
        } catch (err) {
          console.log(`   ❌ Failed to kill PID ${pid}`);
        }
      });
      
      console.log(`\n✅ Port ${PORT} should now be free`);
    } else {
      console.log(`✅ No processes found using port ${PORT}`);
    }
  }
} catch (error) {
  if (error.stdout && error.stdout.toString().trim()) {
    console.log(`⚠️  Error: ${error.message}`);
  } else {
    console.log(`✅ No processes found using port ${PORT}`);
  }
}
