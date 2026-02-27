import { defineConfig } from 'vite'
import deno from '@deno/vite-plugin'
import tsConfigPaths from 'vite-tsconfig-paths'
import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/solid-start/plugin/vite'
import viteSolid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => {
  const isBuild = command === 'build'

  return {
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
      deno(),
      tailwindcss(),
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      ...(isBuild ? [cloudflare({ viteEnvironment: { name: 'ssr' } })] : []),
      tanstackStart(),
      viteSolid({ ssr: true }),
    ],
  }
})
