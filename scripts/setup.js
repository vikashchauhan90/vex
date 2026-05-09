const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

console.log('🚀 Setting up VEX Monorepo...');

// Install all dependencies
console.log('📦 Installing dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Build actual workspace packages
console.log('🔨 Building VEX packages...');
execSync('npm run build:web', { stdio: 'inherit' });
execSync('npm run build:electron', { stdio: 'inherit' });

console.log('✅ Setup complete! Run "npm run dev" to start development');