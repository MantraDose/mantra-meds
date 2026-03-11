/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
  },
  // Prefer relative asset URLs so the app works on any domain (Vercel URL or custom domain like dashboard.mantradose.com).
  // Setting ASSET_PREFIX to a full URL (e.g. https://dashboard.mantradose.com) overrides this if you need absolute URLs.
  ...(process.env.ASSET_PREFIX ? { assetPrefix: process.env.ASSET_PREFIX } : {}),
}

export default nextConfig
