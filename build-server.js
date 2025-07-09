import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';

async function buildServer() {
  try {
    console.log('🔨 Building server for Railway deployment...');
    
    // Build with esbuild using minimal external dependencies
    await build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: 'dist/index.js',
      packages: 'external',
      banner: {
        js: `
import { createRequire } from 'module';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
`
      },
      define: {
        'import.meta.dirname': '__dirname'
      },
      minify: false,
      sourcemap: false,
      logLevel: 'info'
    });
    
    console.log('✅ Server build completed - applying Railway path fixes...');
    
    // Post-process the built file to fix path resolution issues
    let builtCode = readFileSync('dist/index.js', 'utf-8');
    
    // Replace problematic path.resolve calls with process.cwd()
    builtCode = builtCode.replace(
      /path\.resolve\(__dirname,\s*"\.\."\)/g,
      'process.cwd()'
    );
    
    // Replace any remaining __dirname references that might be undefined
    builtCode = builtCode.replace(
      /path\.resolve\(__dirname/g,
      'path.resolve(process.cwd()'
    );
    
    // Fix specific cases for vite.ts paths
    builtCode = builtCode.replace(
      /path2\.resolve\(__dirname,\s*"public"\)/g,
      'path2.resolve(process.cwd(), "dist/public")'
    );
    
    builtCode = builtCode.replace(
      /path2\.resolve\(distPath,\s*"index\.html"\)/g,
      'path2.resolve(process.cwd(), "dist/public", "index.html")'
    );
    
    // Fix the remaining __dirname in vite template resolution
    builtCode = builtCode.replace(
      /path2\.resolve\(\s*__dirname,\s*"\.\."\s*,\s*"client"\s*,\s*"index\.html"\s*\)/g,
      'path2.resolve(process.cwd(), "client", "index.html")'
    );
    
    // Write the fixed code back
    writeFileSync('dist/index.js', builtCode);
    
    console.log('✅ Railway path fixes applied successfully');
    
  } catch (error) {
    console.error('❌ Server build failed:', error);
    process.exit(1);
  }
}

buildServer();