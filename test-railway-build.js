// Test Railway build system locally
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

console.log('🧪 Testing Railway build system locally...');

try {
  // Test build process
  console.log('📦 Running build-railway.js...');
  execSync('node build-railway.js', { stdio: 'inherit' });
  
  // Verify outputs
  const filesToCheck = [
    'dist/index.js',
    'dist/package.json',
    'dist/public/index.html'
  ];
  
  console.log('🔍 Checking build outputs:');
  for (const file of filesToCheck) {
    if (existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
    }
  }
  
  // Check if article generation is in the built backend
  if (existsSync('dist/index.js')) {
    const backendCode = readFileSync('dist/index.js', 'utf-8');
    const hasArticleGeneration = backendCode.includes('generateArticle');
    const hasGeminiAPI = backendCode.includes('generativelanguage.googleapis.com');
    const hasDebugEndpoint = backendCode.includes('/api/debug');
    
    console.log('🔍 Checking backend features:');
    console.log(`✅ Article generation: ${hasArticleGeneration}`);
    console.log(`✅ Gemini API: ${hasGeminiAPI}`);
    console.log(`✅ Debug endpoint: ${hasDebugEndpoint}`);
    
    if (hasArticleGeneration && hasGeminiAPI && hasDebugEndpoint) {
      console.log('✅ Railway build system is working correctly!');
      console.log('🚀 Railway deployment should include article generation');
    } else {
      console.log('❌ Railway build system is missing features');
    }
  }
  
  console.log('✅ Build test completed');
} catch (error) {
  console.error('❌ Build test failed:', error);
}