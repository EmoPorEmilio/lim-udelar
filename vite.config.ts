import path from 'node:path'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/solid-start/plugin/vite'
import viteSolid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '@proyecto-viviana/ui/toast': path.resolve(__dirname, 'node_modules/@proyecto-viviana/ui/src/toast/index.tsx'),
      },
    },
    server: {
      port: 4002,
    },
    ssr: {
      noExternal: [/@proyecto-viviana\/.*/],
      optimizeDeps: {
        exclude: [
          '@proyecto-viviana/ui',
          '@proyecto-viviana/solidaria',
          '@proyecto-viviana/solidaria-components',
          '@proyecto-viviana/solid-stately',
        ],
      },
    },
    optimizeDeps: {
      exclude: [
        '@proyecto-viviana/ui',
        '@proyecto-viviana/solidaria',
        '@proyecto-viviana/solidaria-components',
        '@proyecto-viviana/solid-stately',
      ],
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      cloudflare({ viteEnvironment: { name: 'ssr' } }),
      tanstackStart(),
      viteSolid({ ssr: true }),
    ],
  }
})
