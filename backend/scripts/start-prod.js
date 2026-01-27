#!/usr/bin/env node

/**
 * Production-Grade Server Startup Script
 * 
 * Features:
 * - Automatic port conflict detection and resolution
 * - Process cleanup before starting
 * - Health checks
 * - Graceful error handling
 */

const { exec, execSync } = require('child_process');
const net = require('net');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

/**
 * Check if port is in use
 */
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true); // Port is in use
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false); // Port is free
    });
    
    server.listen(port);
  });
}

/**
 * Kill process using specific port (Windows)
 */
function killProcessOnPort(port) {
  try {
    console.log(`🔍 Checking for processes on port ${port}...`);
    
    // Find process using the port
    const findCmd = `netstat -ano | findstr :${port}`;
    const output = execSync(findCmd, { encoding: 'utf8' });
    
    if (output) {
      console.log(`⚠️  Port ${port} is in use. Terminating processes...`);
      
      // Extract PIDs
      const lines = output.split('\n').filter(line => line.includes('LISTENING'));
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0') {
          pids.add(pid);
        }
      });
      
      // Kill each PID
      pids.forEach(pid => {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`   ✅ Killed process ${pid}`);
        } catch (err) {
          console.log(`   ⚠️  Could not kill process ${pid}`);
        }
      });
      
      // Wait for processes to terminate
      return new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log(`✅ Port ${port} is free`);
    }
  } catch (error) {
    // If netstat fails or no process found, continue
    console.log(`✅ Port ${port} appears to be free`);
  }
}

/**
 * Kill all Node.js processes (nuclear option)
 */
function killAllNodeProcesses() {
  try {
    console.log('🧹 Cleaning up all Node.js processes...');
    execSync('taskkill /F /IM node.exe /T', { stdio: 'ignore' });
    console.log('✅ Cleanup complete');
    return new Promise(resolve => setTimeout(resolve, 2000));
  } catch (error) {
    // No Node processes found or already killed
    console.log('✅ No Node processes to clean up');
  }
}

/**
 * Start the server
 */
async function startServer(attempt = 1) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Starting server (Attempt ${attempt}/${MAX_RETRIES})...`);
  console.log(`${'='.repeat(60)}\n`);
  
  try {
    // Check if port is in use
    const portInUse = await checkPort(PORT);
    
    if (portInUse) {
      console.log(`⚠️  Port ${PORT} is already in use`);
      
      if (attempt === 1) {
        // First attempt: Try to kill process on port
        await killProcessOnPort(PORT);
      } else if (attempt === 2) {
        // Second attempt: Kill all Node processes
        await killAllNodeProcesses();
      } else {
        // Final attempt: Give up
        console.error(`\n❌ Failed to free port ${PORT} after ${MAX_RETRIES} attempts`);
        console.error('💡 Manual intervention required:');
        console.error('   1. Run: taskkill /F /IM node.exe');
        console.error('   2. Or change PORT in .env file');
        process.exit(1);
      }
      
      // Wait and retry
      console.log(`⏳ Waiting ${RETRY_DELAY/1000}s before retry...\n`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return startServer(attempt + 1);
    }
    
    // Port is free, start the server
    console.log(`✅ Port ${PORT} is available\n`);
    console.log('📦 Starting application...\n');
    
    // Start the server using npm run dev or npm start
    const isDev = process.env.NODE_ENV !== 'production';
    const command = isDev ? 'npm run dev' : 'npm start';
    
    const serverProcess = exec(command, { cwd: path.join(__dirname, '..') });
    
    // Pipe output
    serverProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    serverProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
    
    serverProcess.on('error', (error) => {
      console.error('❌ Server process error:', error);
      process.exit(1);
    });
    
    serverProcess.on('exit', (code) => {
      if (code !== 0) {
        console.error(`❌ Server exited with code ${code}`);
        process.exit(code);
      }
    });
    
    // Handle Ctrl+C
    process.on('SIGINT', () => {
      console.log('\n⏳ Shutting down gracefully...');
      serverProcess.kill('SIGINT');
      setTimeout(() => process.exit(0), 1000);
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    
    if (attempt < MAX_RETRIES) {
      console.log(`⏳ Retrying in ${RETRY_DELAY/1000}s...\n`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return startServer(attempt + 1);
    } else {
      console.error(`\n❌ Failed to start server after ${MAX_RETRIES} attempts`);
      process.exit(1);
    }
  }
}

// Main execution
console.log('\n🏭 Production Server Startup Manager\n');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Port: ${PORT}`);
console.log(`Node Version: ${process.version}\n`);

startServer().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
