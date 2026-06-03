import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // Access and log the system environment variables starting with VITE_
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
  
  console.log('=== VITE BUILD CONFIG ENVIRONMENT RESOLUTION ===');
  console.log(`VITE_SUPABASE_URL: ${supabaseUrl ? 'PRESENT (' + supabaseUrl.length + ' chars)' : 'MISSING'}`);
  console.log(`VITE_SUPABASE_ANON_KEY: ${supabaseKey ? 'PRESENT (' + supabaseKey.length + ' chars)' : 'MISSING'}`);
  
  // Auto-generate .env from process.env if provided
  if (supabaseUrl || supabaseKey) {
    let envContent = '';
    if (supabaseUrl) envContent += `VITE_SUPABASE_URL="${supabaseUrl}"\n`;
    if (supabaseKey) envContent += `VITE_SUPABASE_ANON_KEY="${supabaseKey}"\n`;
    
    // Also attach other configurable optionals if set
    if (process.env.VITE_PERMIT_API_URL) envContent += `VITE_PERMIT_API_URL="${process.env.VITE_PERMIT_API_URL}"\n`;
    if (process.env.VITE_SAM_API_KEY) envContent += `VITE_SAM_API_KEY="${process.env.VITE_SAM_API_KEY}"\n`;
    if (process.env.VITE_GOOGLE_PLACES_API_KEY) envContent += `VITE_GOOGLE_PLACES_API_KEY="${process.env.VITE_GOOGLE_PLACES_API_KEY}"\n`;
    
    try {
      fs.writeFileSync(path.resolve(__dirname, '.env'), envContent, 'utf-8');
      console.log('>>> Automated syncing: Successfully generated local .env file.');
    } catch (writeErr) {
      console.error('Failed writing automated .env file:', writeErr);
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
