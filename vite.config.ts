import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isSingle = mode === 'single'

  return {
    plugins: [
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },
    ...(isSingle
      ? {
          // Help ensure the build can be redistributed as a single self-contained HTML file.
          base: './',
          build: {
            // One CSS file
            cssCodeSplit: false,
            // Inline imported assets (images/fonts/etc) as data URIs when possible
            assetsInlineLimit: 100_000_000,
            rollupOptions: {
              output: {
                // One JS file (no code-splitting / extra chunks)
                inlineDynamicImports: true,
                manualChunks: undefined,
              },
            },
          },
        }
      : null),
  }
})
