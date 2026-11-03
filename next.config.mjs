/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The e2e build goes to its own folder so `make test` never clobbers a running `next dev`.
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
