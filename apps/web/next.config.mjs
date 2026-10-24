import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@tt/core', '@tt/i18n', '@tt/sky-art', '@tt/tokens'],
  outputFileTracingRoot: repoRoot,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
