const { spawn } = require('child_process');
const fs = require('fs-extra');

console.log('🎯 Starting VEX in development mode...');

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

// Start Angular dev server
const angular = spawn(npmCommand, ['run', 'dev:web'], {
  stdio: 'pipe',
  shell: true
});

angular.stdout.on('data', (data) => {
  console.log(`[Angular] ${data}`);
  
  // Once Angular is ready, start Electron
  if (data.includes('Local:')) {
    console.log('✅ Angular ready, starting Electron...');
    const electron = spawn(npmCommand, ['run', 'dev:electron'], {
      stdio: 'inherit',
      shell: true
    });
  }
});

angular.stderr.on('data', (data) => {
  console.error(`[Angular Error] ${data}`);
});