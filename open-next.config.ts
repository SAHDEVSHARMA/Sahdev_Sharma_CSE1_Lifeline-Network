import { defineConfig } from '@opennextjs/cloudflare';

export default defineConfig({
  // Basic configuration for Next.js app
  buildCommand: 'npm run build',
  devCommand: 'npm run dev',
  outputDirectory: '.next',
  
  // Cloudflare specific settings
  cloudflare: {
    // Enable edge runtime
    edgeRuntime: true,
    
    // Cache settings
    cache: {
      // Enable caching for static assets
      static: true,
      // Enable caching for API routes
      api: true
    }
  }
}); 