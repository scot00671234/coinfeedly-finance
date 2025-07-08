import { build } from 'esbuild';

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
    
    console.log('✅ Server build completed successfully');
    
  } catch (error) {
    console.error('❌ Server build failed:', error);
    process.exit(1);
  }
}

buildServer();