/** @type {import("next").NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: {
    cpus: 1,
    workerThreads: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;
