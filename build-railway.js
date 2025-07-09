import { build } from 'vite';
import { build as esbuild } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

async function buildRailway() {
  try {
    console.log('🚀 Building Coin Feedly for Railway deployment...');
    
    // Step 1: Build frontend with Vite
    console.log('📦 Building React frontend...');
    await build({
      configFile: './vite.config.ts',
      build: {
        outDir: './dist/public',
        emptyOutDir: true,
        rollupOptions: {
          external: []
        }
      }
    });
    console.log('✅ Frontend build completed');

    // Step 2: Build backend with esbuild
    console.log('🔧 Building Express backend...');
    await esbuild({
      entryPoints: ['./server/production-entry.js'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: './dist/server.js',
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
        'import.meta.dirname': '__dirname',
        'process.env.NODE_ENV': '"production"'
      },
      minify: false,
      sourcemap: false
    });
    console.log('✅ Backend build completed');

    // Step 3: Create main entry point
    console.log('📝 Creating main entry point...');
    const mainEntry = `import './server.js';`;
    writeFileSync('./dist/index.js', mainEntry);
    
    // Step 4: Verify build outputs
    const frontendExists = existsSync('./dist/public/index.html');
    const backendExists = existsSync('./dist/server.js');
    const mainExists = existsSync('./dist/index.js');
    
    if (frontendExists && backendExists && mainExists) {
      console.log('✅ Railway build completed successfully!');
      console.log('📁 Frontend: ./dist/public/index.html');
      console.log('📁 Backend: ./dist/server.js');
      console.log('📁 Entry: ./dist/index.js');
    } else {
      throw new Error('Build verification failed - missing output files');
    }
    
  } catch (error) {
    console.error('❌ Railway build failed:', error);
    process.exit(1);
  }
}

buildRailway();