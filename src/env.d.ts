/// <reference types="../worker-configuration.d.ts" />

// Secrets set via `wrangler secret put` (not in wrangler.jsonc)
declare namespace Cloudflare {
  interface Env {
    GOOGLE_CLIENT_SECRET: string
  }
}
