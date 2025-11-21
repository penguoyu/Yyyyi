import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Used '.' instead of process.cwd() to avoid TS errors if Node types are missing
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    define: {
      // This is critical for Zeabur/Production:
      // It maps the global process.env.API_KEY used in your code 
      // to the actual environment variable VITE_API_KEY injected by Zeabur.
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
    },
  };
});