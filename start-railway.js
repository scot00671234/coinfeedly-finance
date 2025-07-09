#!/usr/bin/env node

// Simple Railway startup script
console.log('🚀 Starting Coin Feedly on Railway...');

// Set production environment
process.env.NODE_ENV = 'production';

// Import and start the server
import('./dist/index.js').then(() => {
  console.log('✅ Railway server started successfully');
}).catch(error => {
  console.error('❌ Failed to start Railway server:', error);
  process.exit(1);
});