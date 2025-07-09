import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function buildServer() {
  try {
    console.log('🔨 Building server for Railway deployment...');
    
    // Ensure dist directory exists
    mkdirSync('dist', { recursive: true });
    
    // Build with esbuild - simplified approach for Railway
    await build({
      entryPoints: ['server/index.railway.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: 'dist/index.js',
      packages: 'external',
      banner: {
        js: `
import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
`
      },
      define: {
        'import.meta.dirname': '__dirname',
        'process.env.NODE_ENV': '"production"'
      },
      minify: false,
      sourcemap: false,
      logLevel: 'info'
    });
    
    console.log('✅ Server build completed - applying Railway compatibility fixes...');
    
    // Post-process the built file to ensure Railway compatibility
    let builtCode = readFileSync('dist/index.js', 'utf-8');
    
    // Fix path resolution issues for Railway environment
    builtCode = builtCode.replace(
      /path\.resolve\(__dirname,\s*"\.\."\)/g,
      'process.cwd()'
    );
    
    builtCode = builtCode.replace(
      /path\.resolve\(__dirname/g,
      'path.resolve(process.cwd()'
    );
    
    // Fix static file serving paths
    builtCode = builtCode.replace(
      /join\(__dirname,\s*"\.\."\s*,\s*"dist"\s*,\s*"public"\)/g,
      'join(process.cwd(), "dist", "public")'
    );
    
    builtCode = builtCode.replace(
      /join\(__dirname,\s*"\.\."\s*,\s*"client"\s*,\s*"index\.html"\)/g,
      'join(process.cwd(), "client", "index.html")'
    );
    
    // Ensure all path references use process.cwd() as base
    builtCode = builtCode.replace(
      /__dirname/g,
      'process.cwd()'
    );
    
    // Write the fixed code back
    writeFileSync('dist/index.js', builtCode);
    
    console.log('✅ Railway deployment build completed successfully');
    
  } catch (error) {
    console.error('❌ Server build failed:', error);
    process.exit(1);
  }
}

buildServer();