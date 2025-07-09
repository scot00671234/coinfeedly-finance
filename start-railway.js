#!/usr/bin/env node

console.log('🚀 Starting Railway deployment...');
console.log('📦 Building application...');

import('./build-railway-simple.js').then(() => {
  console.log('✅ Build completed successfully!');
  console.log('🚀 Starting server...');
  
  import('./dist/index.js').catch(error => {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  });
}).catch(error => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});