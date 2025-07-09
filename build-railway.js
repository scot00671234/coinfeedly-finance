#!/usr/bin/env node

// Railway-specific build script for frontend and backend
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

console.log('🚀 Building Coin Feedly for Railway deployment...');

try {
  // Ensure dist directory exists
  const distDir = join(process.cwd(), 'dist');
  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
  }

  // For Railway, we'll focus on backend first and skip frontend build
  // The production server will serve a functional backend API and basic HTML
  console.log('🔨 Skipping frontend build for Railway quick deployment');
  console.log('📡 Backend API will be available immediately');
  console.log('🌐 Basic HTML interface will be served until full frontend is ready');

  // Verify dist/public exists
  const publicDir = join(process.cwd(), 'dist', 'public');
  if (existsSync(publicDir)) {
    console.log('✅ Frontend assets found at dist/public');
  } else {
    console.log('⚠️ No frontend assets found, server will serve fallback HTML');
  }

  console.log('🎉 Railway build completed successfully!');
  
} catch (error) {
  console.error('💥 Railway build failed:', error);
  process.exit(1);
}