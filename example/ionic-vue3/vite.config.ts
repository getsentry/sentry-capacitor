import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true, // Source map generation must be turned on
  },
  plugins: [
    vue(),
    legacy(),
    // Put the Sentry vite plugin after all other plugins

    sentryVitePlugin({
      org: "sentry-sdks",
      project: "capacitor",
      authToken: "",
    }),

  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },

  },

})
