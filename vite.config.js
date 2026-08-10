import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: set base to '/<your-repo-name>/' before deploying to GitHub Pages.
// e.g. if your repo is github.com/you/group-order-app, base should be '/group-order-app/'
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
})
