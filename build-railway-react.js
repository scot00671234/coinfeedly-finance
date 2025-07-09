import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { build } from 'vite';
import esbuild from 'esbuild';

async function buildRailwayReact() {
  try {
    console.log('🚀 Building Coin Feedly for Railway deployment (React)...');
    
    // Create dist directory
    mkdirSync('dist', { recursive: true });
    
    // Step 1: Build React frontend with Vite
    console.log('📦 Building React frontend...');
    await build({
      configFile: './vite.config.ts',
      build: {
        outDir: './dist/public',
        emptyOutDir: true,
        minify: true,
        sourcemap: false,
        rollupOptions: {
          external: []
        }
      }
    });
    console.log('✅ React frontend built');
    
    // Step 2: Build backend with esbuild
    console.log('🔧 Building backend...');
    await esbuild.build({
      entryPoints: ['./server/production-entry.js'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: './dist/server.js',
      packages: 'external',
      minify: false,
      sourcemap: false,
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
        'import.meta.dirname': '__dirname',
        'process.env.NODE_ENV': '"production"'
      }
    });
    console.log('✅ Backend built');
    
    // Step 3: Create main entry point
    console.log('📝 Creating main entry...');
    const mainEntry = `import './server.js';`;
    writeFileSync('./dist/index.js', mainEntry);
    
    // Step 4: Create production package.json
    console.log('📦 Creating package.json...');
    const packageJson = {
      "name": "coin-feedly",
      "version": "1.0.0",
      "type": "module",
      "main": "index.js",
      "scripts": {
        "start": "node index.js"
      },
      "dependencies": {
        "express": "^4.21.2",
        "pg": "^8.16.3"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    };
    
    writeFileSync('./dist/package.json', JSON.stringify(packageJson, null, 2));
    
    // Step 5: Verify build
    const files = [
      'dist/index.js',
      'dist/server.js', 
      'dist/package.json',
      'dist/public/index.html'
    ];
    
    console.log('🔍 Checking build files...');
    files.forEach(f => {
      const exists = existsSync(f);
      console.log(`  ${exists ? '✓' : '✗'} ${f}`);
    });
    
    const missing = files.filter(f => !existsSync(f));
    
    if (missing.length === 0) {
      console.log('✅ Railway React build completed successfully!');
    } else {
      console.error('❌ Missing files:', missing);
      console.log('📁 Directory contents:');
      console.log('dist:', existsSync('dist') ? 'exists' : 'missing');
      console.log('dist/public:', existsSync('dist/public') ? 'exists' : 'missing');
      if (existsSync('dist/public')) {
        console.log('dist/public contents:', require('fs').readdirSync('dist/public'));
      }
      throw new Error('Missing files: ' + missing.join(', '));
    }
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildRailwayReact();