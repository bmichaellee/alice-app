import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/alice-app/',
  plugins: [react()],
  // Dev server port is overridable via PORT (defaults to 5174 to avoid
  // clashing with other apps that grab the usual 5173).
  server: {
    port: Number(process.env.PORT) || 5174,
  },
})
