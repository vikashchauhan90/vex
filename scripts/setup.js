const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

console.log('🚀 Setting up VEX Monorepo...');

// Install all dependencies
console.log('📦 Installing dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Build common package first (dependencies)
console.log('🔨 Building shared packages...');
execSync('npm run build:vex-common', { stdio: 'inherit' });
execSync('npm run build:vex-schema', { stdio: 'inherit' });
execSync('npm run build:vex-query', { stdio: 'inherit' });

// Build converters
console.log('🔄 Building converters...');
execSync('npm run build:vex-converters', { stdio: 'inherit' });

console.log('✅ Setup complete! Run "npm run dev" to start development');